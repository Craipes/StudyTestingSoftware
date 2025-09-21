using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.EntityFrameworkCore;

namespace StudyTestingSoftware.Services;

public class TestManager
{
    private readonly AppDbContext dbContext;

    public TestManager(AppDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public async Task<List<Guid>> ListTestIdsByAuthorAsync(Guid authorId)
    {
        return await dbContext.Tests
            .Where(t => t.AuthorId == authorId)
            .Select(t => t.Id)
            .ToListAsync();
    }

    public async Task<List<TeacherTestPreviewDTO>> ListTestPreviewsByAuthorAsync(Guid authorId)
    {
        return await dbContext.Tests
            .AsNoTracking()
            .Where(t => t.AuthorId == authorId)
            .OrderByDescending(t => t.IsOpened)
            .ThenByDescending(t => t.CreatedAt)
            .Select(t => new TeacherTestPreviewDTO(
                t.Id,
                t.Name,
                t.AccessMode,
                t.IsPublished,
                t.IsOpened,
                t.HasCloseTime,
                t.CloseAt,
                t.Questions.Count
            ))
            .ToListAsync();
    }

    public async Task<Test?> LoadTestDefinitionAsync(Guid id)
    {
        return await dbContext.Tests
            .Where(t => t.Id == id)
            .AsNoTracking()
            .FirstOrDefaultAsync();
    }

    public async Task<Test?> LoadTestAsync(Guid id, bool track)
    {
        IQueryable<Test> query = dbContext.Tests
            .Where(t => t.Id == id)
            .Include(t => t.Questions)
                .ThenInclude(q => q.QuestionRows)
                    .ThenInclude(r => r.CorrectMatrixColumn)
            .Include(t => t.Questions)
                .ThenInclude(q => q.QuestionColumns)
            .Include(t => t.Questions)
                .ThenInclude(q => q.ChoiceOptions);
        if (!track) query = query.AsNoTracking();
        return await query.FirstOrDefaultAsync();
    }

    public async Task DeleteTestAsync(Guid id)
    {
        //var test = await dbContext.Tests
        //    .Where(t => t.Id == id)
        //    .Include(t => t.Questions)
        //        .ThenInclude(q => q.QuestionRows)
        //    .Include(t => t.Questions)
        //        .ThenInclude(q => q.QuestionColumns)
        //    .Include(t => t.Questions)
        //        .ThenInclude(q => q.ChoiceOptions)
        //    .FirstOrDefaultAsync();
        //if (test == null) return false;
        //// Explicit child removal to avoid severed required relationships
        //foreach (var question in test.Questions)
        //{
        //    dbContext.QuestionChoices.RemoveRange(question.ChoiceOptions);
        //    dbContext.QuestionMatrixRows.RemoveRange(question.QuestionRows);
        //    dbContext.QuestionMatrixColumns.RemoveRange(question.QuestionColumns);
        //}
        //dbContext.Questions.RemoveRange(test.Questions);
        dbContext.Tests.Remove(new Test { Id = id, Author = null });
        await dbContext.SaveChangesAsync();
    }

    public async Task<(Test?, ModelStateDictionary)> TryToCreateTestAsync(TeacherTestDTO data, AppUser teacher)
    {
        PreprocessTeacherTestDto(data);

        ModelStateDictionary modelState = new();
        Test test = new()
        {
            Author = teacher
        };

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
                    modelState.AddModelError((Test t) => t.Questions[i], $"Question's matrix row has invalid ValidColumnOrder {matrixRowDTO.ValidColumnOrder}.");
                    return (null, modelState);
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

        modelState.Merge(ValidateTest(test));

        // Error found
        if (!modelState.IsValid)
        {
            return (null, modelState);
        }

        UpdateTestMaxScore(test);

        await dbContext.SaveChangesAsync();

        return (test, modelState);
    }

    /// <summary>
    /// Tries to update the test with Id <see cref="testId"/> with the provided data. The provided test MUST be tracked by the DbContext.
    /// </summary>
    /// <param name="data">DTO of the updated test</param>
    /// <param name="testId">Id of the test to update</param>
    /// <returns></returns>
    public async Task<ModelStateDictionary> TryToUpdateTestAsync(TeacherTestDTO data, Guid testId)
    {
        ModelStateDictionary modelState = new();

        var test = await LoadTestAsync(testId, true);

        if (test == null)
        {
            modelState.AddModelError(string.Empty, "Test not found.");
            return modelState;
        }

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
                            modelState.AddModelError((Test t) => t.Questions[qi],
                                $"Question's matrix row has invalid ValidColumnOrder {dto.ValidColumnOrder}.");
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

        modelState.Merge(ValidateTest(test));
        if (!modelState.IsValid)
        {
            return modelState;
        }

        UpdateTestMaxScore(test);

        await dbContext.SaveChangesAsync();
        return modelState;
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

    private static ModelStateDictionary ValidateTest(Test test)
    {
        ModelStateDictionary modelState = new();
        for (int i = 0; i < test.Questions.Count; i++)
        {
            Question question = test.Questions[i];
            if (question.QuestionType == QuestionType.TableSingleChoice || question.QuestionType == QuestionType.Ordering)
            {
                if (question.QuestionRows.Count == 0)
                {
                    modelState.AddModelError((Test t) => t.Questions[i], $"Question is of type {question.QuestionType} but has no rows.");
                }
                if (question.QuestionColumns.Count == 0)
                {
                    modelState.AddModelError((Test t) => t.Questions[i], $"Question is of type {question.QuestionType} but has no columns.");
                }
                foreach (var row in question.QuestionRows)
                {
                    if (row.CorrectMatrixColumn == null)
                    {
                        modelState.AddModelError((Test t) => t.Questions[i], $"Question has a row {row.Id} with no correct column.");
                    }
                    else if (!question.QuestionColumns.Contains(row.CorrectMatrixColumn))
                    {
                        modelState.AddModelError((Test t) => t.Questions[i], $"Question has a row {row.Id} with a correct column that does not belong to the question.");
                    }
                }

                if (question.QuestionRows.DistinctBy(q => q.Order).Count() != question.QuestionRows.Count)
                {
                    modelState.AddModelError((Test t) => t.Questions[i], $"Question has duplicate rows.");
                }
                if (question.QuestionColumns.DistinctBy(q => q.Order).Count() != question.QuestionColumns.Count)
                {
                    modelState.AddModelError((Test t) => t.Questions[i], $"Question has duplicate columns.");
                }
            }
            else if (question.QuestionType == QuestionType.MultipleChoice || question.QuestionType == QuestionType.SingleChoice)
            {
                if (question.ChoiceOptions.Count == 0)
                {
                    modelState.AddModelError((Test t) => t.Questions[i], $"Question is of type {question.QuestionType} but has no choice options.");
                }
                if (!question.ChoiceOptions.Any(co => co.IsCorrect))
                {
                    modelState.AddModelError((Test t) => t.Questions[i], $"Question is of type {question.QuestionType} but has no correct choice option.");
                }
                if (question.ChoiceOptions.DistinctBy(co => co.Order).Count() != question.ChoiceOptions.Count)
                {
                    modelState.AddModelError((Test t) => t.Questions[i], $"Question has duplicate choice options.");
                }
                if (question.QuestionType == QuestionType.SingleChoice && question.ChoiceOptions.Count(co => co.IsCorrect) > 1)
                {
                    modelState.AddModelError((Test t) => t.Questions[i], $"Question is of type SingleChoice but has multiple correct choice options.");
                }
            }
        }

        if (test.HasCloseTime && (test.CloseAt == null || test.CloseAt < DateTime.UtcNow))
        {
            modelState.AddModelError((Test t) => t.CloseAt, $"Test has a close time set but it is either null or in the past.");
        }

        if (test.Questions.Count == 0)
        {
            modelState.AddModelError((Test t) => t.Questions, "Test has no questions.");
        }

        return modelState;
    }
}
