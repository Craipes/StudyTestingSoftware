using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace StudyTestingSoftware.Services;

public class TestWriteManager
{
    private readonly AppDbContext dbContext;
    private readonly TestReadManager testReadManager;
    private readonly TestSessionManager testSessionManager;
    private readonly ILogger<TestWriteManager> logger;

    public TestWriteManager(AppDbContext dbContext, TestReadManager testReadManager, TestSessionManager testSessionManager, ILogger<TestWriteManager> logger)
    {
        this.dbContext = dbContext;
        this.testReadManager = testReadManager;
        this.testSessionManager = testSessionManager;
        this.logger = logger;
    }

    public async Task DeleteTestAsync(Guid id)
    {
        dbContext.Tests.Remove(new Test { Id = id, Author = null });
        await dbContext.SaveChangesAsync();
    }

    public async Task<AResult<Test>> TryToCreateTestAsync(TeacherTestDTO data, AppUser teacher)
    {
        PreprocessTeacherTestDto(data);

        Test test = new()
        {
            Author = teacher
        };

        var result = AResult<Test>.Success(test);

        data.UpdateEntity(test);
        dbContext.Tests.Add(test);

        for (int i = 0; i < data.Questions.Count; i++)
        {
            QuestionTeacherDTO questionDTO = data.Questions[i];
            Question question = new()
            {
                Test = test
            };
            questionDTO.UpdateEntity(question);
            dbContext.Questions.Add(question);

            foreach (var matrixColumnDTO in questionDTO.QuestionColumns)
            {
                QuestionMatrixColumn matrixColumn = new()
                {
                    Question = question
                };
                matrixColumnDTO.UpdateEntity(matrixColumn);
                dbContext.QuestionMatrixColumns.Add(matrixColumn);
            }

            foreach (var matrixRowDTO in questionDTO.QuestionRows)
            {
                if (matrixRowDTO.ValidColumnOrder < 0 || matrixRowDTO.ValidColumnOrder >= question.QuestionColumns.Count)
                {
                    result.AddProblem(AProblem.Validation(TestErrors.InvalidValidColumnId, $"Question's matrix row has invalid ValidColumnOrder {matrixRowDTO.ValidColumnOrder}.", $"Questions[{i}]"));
                    continue;
                }

                QuestionMatrixColumn answerColumn = question.QuestionColumns[matrixRowDTO.ValidColumnOrder];

                QuestionMatrixRow matrixRow = new()
                {
                    CorrectMatrixColumn = answerColumn,
                    Question = question
                };
                matrixRowDTO.UpdateEntity(matrixRow);
                dbContext.QuestionMatrixRows.Add(matrixRow);
            }

            foreach (var choiceOptionDTO in questionDTO.ChoiceOptions)
            {
                QuestionChoiceOption choiceOption = new()
                {
                    Question = question
                };
                choiceOptionDTO.UpdateEntity(choiceOption);
                dbContext.QuestionChoices.Add(choiceOption);
            }
        }

        result.Merge(ValidateTest(test));

        if (result.IsSuccess)
        {
            UpdateTestMaxScore(test);
            await dbContext.SaveChangesAsync();
        }

        return result;
    }

    /// <summary>
    /// Tries to update the test with Id <see cref="testId"/> with the provided data. The provided test MUST be tracked by the DbContext.
    /// </summary>
    /// <param name="data">DTO of the updated test</param>
    /// <param name="testId">Id of the test to update</param>
    /// <returns></returns>
    public async Task<AResult<Test?>> TryToUpdateTestAsync(TeacherTestDTO data, Guid testId)
    {
        var test = await testReadManager.LoadTestAsync(testId, true);

        if (test == null)
        {
            return AResult<Test?>.Failure(AProblem.NotFound(GeneralErrors.ResourceNotFound, "Test not found."));
        }

        var result = AResult<Test?>.Success(test);

        PreprocessTeacherTestDto(data);

        data.UpdateEntity(test);

        List<Question> resultingQuestionsInDtoOrder = SyncCollection(test.Questions, data.Questions,
            (question, questionDTO) =>
            {
                question ??= new Question { Test = test };

                // ====== Choice options sync ======
                var updatedChoicesInDtoOrder = SyncCollection(question.ChoiceOptions, questionDTO.ChoiceOptions,
                    (t, dto) => t ?? new QuestionChoiceOption { Question = question });

                // ====== Columns sync ======
                var updatedColumnsInDtoOrder = SyncCollection(question.QuestionColumns, questionDTO.QuestionColumns,
                    (t, dto) => t ?? new QuestionMatrixColumn { Question = question });

                // ====== Rows sync ======
                var updatedRowsInDtoOrder = SyncCollection(question.QuestionRows, questionDTO.QuestionRows,
                    (t, dto) =>
                    {
                        if (dto.ValidColumnOrder < 0 || dto.ValidColumnOrder >= updatedColumnsInDtoOrder.Count)
                        {
                            int qi = data.Questions.IndexOf(questionDTO);
                            result.AddProblem(AProblem.Validation(TestErrors.InvalidValidColumnId, $"Question's matrix row has invalid ValidColumnOrder {dto.ValidColumnOrder}.", $"Questions[{qi}]"));
                            return null;
                        }

                        var correctColumn = updatedColumnsInDtoOrder[dto.ValidColumnOrder];

                        if (t == null)
                        {
                            return new QuestionMatrixRow
                            {
                                Question = question,
                                CorrectMatrixColumn = correctColumn
                            };
                        }
                        else
                        {
                            t.CorrectMatrixColumn = correctColumn;
                            return t;
                        }
                    });

                RemoveDeletedItems(question.ChoiceOptions, updatedChoicesInDtoOrder);
                RemoveDeletedItems(question.QuestionRows, updatedRowsInDtoOrder);
                RemoveDeletedItems(question.QuestionColumns, updatedColumnsInDtoOrder);

                // Finally set ordered lists
                question.ChoiceOptions = updatedChoicesInDtoOrder;
                question.QuestionRows = updatedRowsInDtoOrder;
                question.QuestionColumns = updatedColumnsInDtoOrder;

                return question;
            });

        RemoveDeletedItems(test.Questions, resultingQuestionsInDtoOrder, q =>
        {
            // Explicit child removal to avoid severed required relationships
            dbContext.QuestionChoices.RemoveRange(q.ChoiceOptions);
            dbContext.QuestionMatrixRows.RemoveRange(q.QuestionRows);
            dbContext.QuestionMatrixColumns.RemoveRange(q.QuestionColumns);
        });

        test.Questions = resultingQuestionsInDtoOrder;

        result.Merge(ValidateTest(test));
        if (!result.IsSuccess)
        {
            return result;
        }

        UpdateTestMaxScore(test);

        try
        {
            await dbContext.SaveChangesAsync();
            await testSessionManager.UpdateScoreForTestSessionsAsync(test);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while saving test changes.");
        }

        return result;
    }

    private List<Type> SyncCollection<Type, DTO>(ICollection<Type> originalCollection, ICollection<DTO> dtoCollection,
        Func<Type?, DTO, Type?> process)
        where Type : BaseEntity where DTO : IDTOEditRepresentation<Type, DTO>
    {
        var existingTypesById = originalCollection.ToDictionary(c => c.Id, c => c);
        var updatedCollectionInDtoOrder = new List<Type>();

        foreach (var dto in dtoCollection)
        {
            Type? type = null;
            if (dto.Id is Guid idValue && existingTypesById.TryGetValue(idValue, out var existingType))
            {
                type = existingType;
            }

            bool typeWasNotFound = type == null;
            type = process.Invoke(type, dto);

            if (type == null) continue;

            if (typeWasNotFound)
            {
                originalCollection.Add(type);
                dbContext.Add(type);
            }

            dto.UpdateEntity(type);
            updatedCollectionInDtoOrder.Add(type);
        }

        return updatedCollectionInDtoOrder;
    }

    private void RemoveDeletedItems<Type>(ICollection<Type> originalCollection, ICollection<Type> updatedCollection, Action<Type>? onRemove = null) where Type : BaseEntity
    {
        var toRemove = originalCollection
                       .Where(o => !updatedCollection.Contains(o))
                       .ToList();

        foreach (var item in toRemove)
        {
            onRemove?.Invoke(item);
            originalCollection.Remove(item);
            dbContext.Remove(item);
        }
    }

    private static void PreprocessTeacherTestDto(TeacherTestDTO dto)
    {
        foreach (var question in dto.Questions)
        {
            if (question.QuestionType != QuestionType.TableSingleChoice && question.QuestionType != QuestionType.Ordering)
            {
                question.QuestionRows.Clear();
                question.QuestionColumns.Clear();
            }
            if (question.QuestionType != QuestionType.MultipleChoice && question.QuestionType != QuestionType.SingleChoice)
            {
                question.ChoiceOptions.Clear();
            }
        }
    }

    private static void UpdateTestMaxScore(Test test)
    {
        test.MaxScore = test.Questions.Sum(q => q.Points);
    }

    private static AResult<Test> ValidateTest(Test test)
    {
        var result = AResult<Test>.Success(test);

        for (int i = 0; i < test.Questions.Count; i++)
        {
            var question = test.Questions[i];
            string questionPath = $"Questions[{i}]";

            if (question.QuestionType == QuestionType.TableSingleChoice || question.QuestionType == QuestionType.Ordering)
            {
                if (question.QuestionRows.Count == 0)
                {
                    result.AddProblem(AProblem.Validation(TestErrors.QuestionRowsMissing,
                        $"Question is of type {question.QuestionType} but has no rows.", questionPath));
                }
                if (question.QuestionColumns.Count == 0)
                {
                    result.AddProblem(AProblem.Validation(TestErrors.QuestionColumnsMissing,
                        $"Question is of type {question.QuestionType} but has no columns.", questionPath));
                }

                foreach (var row in question.QuestionRows)
                {
                    if (row.CorrectMatrixColumn == null)
                    {
                        result.AddProblem(AProblem.Validation(TestErrors.RowMissingCorrectColumn,
                            $"Question has a row {row.Id} with no correct column.", questionPath));
                    }
                    else if (!question.QuestionColumns.Contains(row.CorrectMatrixColumn))
                    {
                        result.AddProblem(AProblem.Validation(TestErrors.RowIncorrectColumnReference,
                            $"Question has a row {row.Id} with a correct column that does not belong to the question.", questionPath));
                    }
                }

                if (question.QuestionRows.DistinctBy(q => q.Order).Count() != question.QuestionRows.Count)
                {
                    result.AddProblem(AProblem.Validation(TestErrors.DuplicateRows,
                        "Question has duplicate rows.", questionPath));
                }
                if (question.QuestionColumns.DistinctBy(q => q.Order).Count() != question.QuestionColumns.Count)
                {
                    result.AddProblem(AProblem.Validation(TestErrors.DuplicateColumns,
                        "Question has duplicate columns.", questionPath));
                }
            }
            else if (question.QuestionType == QuestionType.MultipleChoice || question.QuestionType == QuestionType.SingleChoice)
            {
                if (question.ChoiceOptions.Count == 0)
                {
                    result.AddProblem(AProblem.Validation(TestErrors.ChoiceOptionsMissing,
                        $"Question is of type {question.QuestionType} but has no choice options.", questionPath));
                }
                if (!question.ChoiceOptions.Any(co => co.IsCorrect))
                {
                    result.AddProblem(AProblem.Validation(TestErrors.NoCorrectChoiceOption,
                        $"Question is of type {question.QuestionType} but has no correct choice option.", questionPath));
                }
                if (question.ChoiceOptions.DistinctBy(co => co.Order).Count() != question.ChoiceOptions.Count)
                {
                    result.AddProblem(AProblem.Validation(TestErrors.DuplicateChoiceOptions,
                        "Question has duplicate choice options.", questionPath));
                }
                if (question.QuestionType == QuestionType.SingleChoice && question.ChoiceOptions.Count(co => co.IsCorrect) > 1)
                {
                    result.AddProblem(AProblem.Validation(TestErrors.MultipleCorrectOptionsForSingleChoice,
                        "Question is of type SingleChoice but has multiple correct choice options.", questionPath));
                }
            }
        }

        if (test.HasCloseTime && (test.CloseAt == null || test.CloseAt < DateTime.UtcNow))
        {
            result.AddProblem(AProblem.Validation(TestErrors.CloseAtInvalid,
                "Test has a close time set but it is either null or in the past.", "CloseAt"));
        }

        if (test.Questions.Count == 0)
        {
            result.AddProblem(AProblem.Validation(TestErrors.QuestionsEmpty,
                "Test has no questions.", "Questions"));
        }

        return result;
    }
}
