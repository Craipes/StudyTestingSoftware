using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace StudyTestingSoftware.Services;

public class TestManagement
{
    private readonly AppDbContext dbContext;

    public TestManagement(AppDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public async Task<(Test?, ModelStateDictionary)> TryToCreateTestAsync(TeacherTestDTO data, AppUser teacher)
    {
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

        await dbContext.SaveChangesAsync();

        return (test, modelState);
    }

    public async Task<(Test?, ModelStateDictionary)> TryToUpdateTestAsync(TeacherTestDTO data, Test test)
    {
        ModelStateDictionary modelState = new();
        data.UpdateEntity(test);
        dbContext.Tests.Update(test);
        


        if (!modelState.IsValid)
        {
            return (null, modelState);
        }
        await dbContext.SaveChangesAsync();
        return (test, modelState);
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
        return modelState;
    }
}
