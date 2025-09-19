// src/lib/test-schemas.ts (новий файл)

import * as z from 'zod';

// Enum для числових значень
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

// Схеми валідації
export const AnswerOptionSchema = z.object({
  text: z.string().min(1, 'Текст відповіді не може бути порожнім.'),
  isCorrect: z.boolean(),
});

export const AnswerRowSchema = z.object({
  text: z.string().optional(),
  order: z.number().int().min(0),
  answerOptions: z.array(AnswerOptionSchema),
});

export const QuestionSchema = z.object({
  text: z.string().min(1, 'Текст питання не може бути порожнім.'),
  order: z.number().int().min(0),
  points: z.number().int().min(1).max(5, 'Бали повинні бути від 1 до 5.'),
  questionType: z.nativeEnum(QuestionType),
  shuffleAnswers: z.boolean(),
  minNumberValue: z.number().int().optional(),
  maxNumberValue: z.number().int().optional(),
  numberValueStep: z.number().int().optional(),
  targetNumberValue: z.number().int().optional(),
  targetBoolValue: z.boolean().optional(),
  answerRows: z.array(AnswerRowSchema).optional(),
});

export const CreateTestFormSchema = z.object({
  name: z.string().min(1, 'Назва тесту не може бути порожньою.'),
  description: z.string().optional(),
  maxExperience: z.number().int().min(0),
  accessMode: z.nativeEnum(AccessMode),
  durationInMinutes: z.number().int().min(0),
  shuffleQuestions: z.boolean(),
  isPublished: z.boolean(),
  questions: z.array(QuestionSchema),
});

// Експортуємо тип для використання в компонентах
export type CreateTestFormValues = z.infer<typeof CreateTestFormSchema>;