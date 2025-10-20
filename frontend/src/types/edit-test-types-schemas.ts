import z from "zod";

// === Enum для числових значень ===//
export enum QuestionType {
    SingleChoice = 0,
    MultipleChoice = 1,
    TableSingleChoice = 2,
    Ordering = 3,
    Slider = 4,
    YesNo = 5,
}

export enum AccessMode {
    Private = 0,
    Group = 1,
    Public = 2,
}

// === Типи та схеми валідації ===

export const ChoiceOptionSchema = z.object({
    id: z.string().optional(),
    text: z.string().min(1, 'Текст відповіді не може бути порожнім.'),
    isCorrect: z.boolean(),
    order: z.number().int().optional(),
});

export const QuestionRowSchema = z.object({
    id: z.string().optional(),
    text: z.string().min(1, 'Текст рядка не може бути порожнім.'),
    order: z.number().int(),
    validColumnOrder: z.number().int(),
});

export const QuestionColumnSchema = z.object({
    id: z.string().optional(),
    text: z.string().min(1, 'Текст стовпця не може бути порожнім.'),
    order: z.number().int(),
});

export const QuestionSchema = z.object({
    id: z.string().optional(),
    text: z.string().min(1, 'Текст питання не може бути порожнім.'),
    order: z.number().int().min(0),
    points: z.number().int().min(1).max(5, 'Бали повинні бути від 1 до 5.'),
    questionType: z.nativeEnum(QuestionType),
    minNumberValue: z.number().int().optional(),
    maxNumberValue: z.number().int().optional(),
    numberValueStep: z.number().int().optional(),
    targetNumberValue: z.number().int().optional(),
    targetBoolValue: z.boolean().optional(),
    choiceOptions: z.array(ChoiceOptionSchema).default([]).optional(),
    questionRows: z.array(QuestionRowSchema).default([]).optional(),
    questionColumns: z.array(QuestionColumnSchema).default([]).optional(),
});

export const EditTestFormSchema = z.object({
    id: z.string(),
    name: z.string().min(1, 'Назва тесту не може бути порожньою.'),
    description: z.string().optional(),
    maxExperience: z.number().int().min(0),
    accessMode: z.nativeEnum(AccessMode),
    durationInMinutes: z.number().int().min(0),
    shuffleQuestions: z.boolean(),
    shuffleAnswers: z.boolean(),
    attemptsLimit: z.number().int(),
    isPublished: z.boolean(),
    isOpened: z.boolean().optional(),
    hasCloseTime: z.boolean().optional(),
    closeAt: z.string().optional().nullable(),
    questions: z.array(QuestionSchema),
});