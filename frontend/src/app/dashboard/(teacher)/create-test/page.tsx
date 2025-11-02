'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { Loader, Trash2, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { isValid } from 'zod/v3';
import Breadcrumbs from '@/components/shared/BreadCrumbs';
import Link from 'next/link';
import { AccessMode, QuestionType } from '@/types';
import { handleApiError } from '@/utils/handle-api-errors';
import { RevealWrapper } from 'next-reveal';

  const breadcrumbItems = [
    { name: 'Дашборд', href: '/dashboard' },
    { name: 'Керування тестами', href: '/dashboard/manage-tests' },
    { name: 'Cтворити тест'}
  ];

// === Типи та схеми валідації ===

const ChoiceOptionSchema = z.object({
    text: z.string().min(1, 'Текст відповіді не може бути порожнім.'),
    isCorrect: z.boolean(),
    order: z.number().int().optional(),
});

const QuestionRowSchema = z.object({
    text: z.string().min(1, 'Текст рядка не може бути порожнім.'),
    order: z.number().int(),
    validColumnOrder: z.number().int(),
});

const QuestionColumnSchema = z.object({
    text: z.string().min(1, 'Текст стовпця не може бути порожнім.'),
    order: z.number().int(),
});

const QuestionSchema = z.object({
    text: z.string().min(1, 'Текст питання не може бути порожнім.'),
    order: z.number().int().min(0),
    points: z.number().int().min(1).max(5, 'Бали повинні бути від 1 до 5.'),
    questionType: z.nativeEnum(QuestionType),
    minNumberValue: z.number().int().optional(),
    maxNumberValue: z.number().int().optional(),
    numberValueStep: z.number().int().optional(),
    targetNumberValue: z.number().int().optional(),
    targetBoolValue: z.boolean().optional(),
    choiceOptions: z.array(ChoiceOptionSchema).optional(),
    questionRows: z.array(QuestionRowSchema).optional(),
    questionColumns: z.array(QuestionColumnSchema).optional(),
});

const CreateTestFormSchema = z.object({
    name: z.string().min(1, 'Назва тесту не може бути порожньою.').max(128, 'Назва тесту не може перевищувати 128 символів.'),
    description: z.string().max(4096, 'Опис тесту не може перевищувати 4096 символів.').optional(),
    maxExperience: z.number().int().min(0).max(100000, 'Максимальний досвід не може перевищувати 100000.'),
    accessMode: z.nativeEnum(AccessMode),
    durationInMinutes: z.number().int().min(0).max(360, 'Тривалість не може перевищувати 360 хвилин.'),
    shuffleQuestions: z.boolean(),
    shuffleAnswers:z.boolean(),
    attemptsLimit:z.number().int(),
    isPublished: z.boolean(),
    isOpened: z.boolean().optional(),
    hasCloseTime: z.boolean().optional(),
    closeAt: z.string().optional(),
    questions: z.array(QuestionSchema),
    maxCoins:z.number().int().optional(),
});

type CreateTestFormValues = z.infer<typeof CreateTestFormSchema>;
type QuestionValues = z.infer<typeof QuestionSchema>;
type ChoiceOptionValues = z.infer<typeof ChoiceOptionSchema>;
type QuestionRowValues = z.infer<typeof QuestionRowSchema>;
type QuestionColumnValues = z.infer<typeof QuestionColumnSchema>;

// === Компоненти для редагування відповідей ===

interface ChoiceOptionsEditorProps {
    type: QuestionType;
    options: ChoiceOptionValues[] | undefined;
    onAdd: () => void;
    onRemove: (index: number) => void;
    onUpdate: (index: number, newText: string) => void;
    onToggleCorrect: (index: number) => void;
}

const ChoiceOptionsEditor = ({ type, options, onAdd, onRemove, onUpdate, onToggleCorrect }: ChoiceOptionsEditorProps) => {
    if (!options) return null;

    return (
        <div className="space-y-2">
            <h3 className="font-semibold mt-4">Варіанти відповідей</h3>
            {options.map((option, index) => (
                <div key={index} className="flex sm:flex-row items-center gap-2">
                    <input
                        type={type === QuestionType.MultipleChoice ? 'checkbox' : 'radio'}
                        checked={option.isCorrect}
                        onChange={() => onToggleCorrect(index)}
                        className="form-radio text-blue-600"
                    />
                    <input
                        type="text"
                        value={option.text}
                        onChange={(e) => onUpdate(index, e.target.value)}
                        className="flex-1 w-full sm:w-auto px-2 py-1 border rounded"
                    />
                    <button
                        type="button"
                        onClick={() => onRemove(index)}
                        className="text-red-500 hover:text-red-700 p-1 self-start sm:self-center"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            ))}
            <button
                type="button"
                onClick={onAdd}
                className="flex items-center text-blue-500 hover:text-blue-700 mt-2"
            >
                <PlusCircle size={20} className="mr-1" /> Додати варіант
            </button>
        </div>
    );
};

interface TableEditorProps {
    rows: QuestionRowValues[] | undefined;
    columns: QuestionColumnValues[] | undefined;
    onAddRow: () => void;
    onRemoveRow: (index: number) => void;
    onUpdateRowText: (index: number, newText: string) => void;
    onAddColumn: () => void;
    onRemoveColumn: (index: number) => void;
    onUpdateColumnText: (index: number, newText: string) => void;
    onUpdateCorrectColumn: (rowIndex: number, newValidColumnOrder: number) => void;
}

const TableEditor = ({
    rows,
    columns,
    onAddRow,
    onRemoveRow,
    onUpdateRowText,
    onAddColumn,
    onRemoveColumn,
    onUpdateColumnText,
    onUpdateCorrectColumn,
}: TableEditorProps) => {
    if (!rows || !columns) return null;

    return (
        <div className="space-y-4 mt-4">
            <h3 className="font-semibold">Таблиця: Рядки та Стовпці</h3>
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-2 border p-2 sm:p-4 rounded">
                    <h4 className="font-medium">Рядки (Питання)</h4>
                    {rows.map((row, index) => (
                        <div key={index} className="flex-row sm:flex items-center gap-2">
                            <input
                                type="text"
                                value={row.text}
                                onChange={(e) => onUpdateRowText(index, e.target.value)}
                                className="flex-1 w-full px-2 py-1 border rounded"
                            />
                            <div className='flex gap-2'>
                                <select
                                value={row.validColumnOrder}
                                onChange={(e) => onUpdateCorrectColumn(index, parseInt(e.target.value))}
                                className="px-2 mt-2 sm:mt-0 w-full sm:w-auto py-1 border rounded dark:bg-slate-800"
                            >
                                <option value="">Оберіть відповідь</option>
                                {columns.map((col, colIndex) => (
                                    <option key={colIndex} value={col.order}>
                                        {col.text || `Стовпець ${colIndex + 1}`}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={() => onRemoveRow(index)}
                                className="text-red-500 hover:text-red-700"
                            >
                                <Trash2 size={20} />
                            </button>
                            </div>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={onAddRow}
                        className="flex items-center text-blue-500 hover:text-blue-700 mt-2"
                    >
                        <PlusCircle size={20} className="mr-1" /> Додати рядок
                    </button>
                </div>
                <div className="flex-1 space-y-2 border p-2 sm:p-4 rounded">
                    <h4 className="font-medium">Стовпці (Варіанти)</h4>
                    {columns.map((col, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={col.text}
                                onChange={(e) => onUpdateColumnText(index, e.target.value)}
                                className="flex-1 px-2 py-1 border rounded"
                            />
                            <button
                                type="button"
                                onClick={() => onRemoveColumn(index)}
                                className="text-red-500 hover:text-red-700"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={onAddColumn}
                        className="flex items-center text-blue-500 hover:text-blue-700 mt-2"
                    >
                        <PlusCircle size={20} className="mr-1" /> Додати стовпець
                    </button>
                </div>
            </div>
        </div>
    );
};

interface OrderingEditorProps {
    rows: QuestionRowValues[] | undefined;
    columns: QuestionColumnValues[] | undefined;
    onAdd: () => void;
    onRemove: (index: number) => void;
    onUpdateRowText: (index: number, newText: string) => void;
    onUpdateColumnText: (index: number, newText: string) => void;
}

const OrderingEditor = ({ rows, columns, onAdd, onRemove, onUpdateRowText, onUpdateColumnText }: OrderingEditorProps) => {
    if (!rows || !columns) return null;

    return (
        <div className="space-y-4 mt-4">
            <h3 className="font-semibold">Співставлення: Питання та Відповіді</h3>
            {rows.map((row, index) => (
                <div key={index} className="flex-wrap sm:flex items-center gap-2">
                    <label className="text-sm font-medium whitespace-nowrap">Питання:</label>
                    <input
                        type="text"
                        value={row.text}
                        onChange={(e) => onUpdateRowText(index, e.target.value)}
                        className="flex-1 px-2 w-full py-1 border rounded"
                    />
                    <label className="text-sm font-medium">Відповідь:</label>
                    <input
                        type="text"
                        value={columns[index]?.text || ''}
                        onChange={(e) => onUpdateColumnText(index, e.target.value)}
                        className="flex-1 px-2 w-full py-1 border rounded"
                    />
                    <button
                        type="button"
                        onClick={() => onRemove(index)}
                        className="text-red-500 p-2 sm:p-0 hover:text-red-700"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            ))}
            <button
                type="button"
                onClick={onAdd}
                className="flex items-center text-blue-500 hover:text-blue-700 sm:mt-2 mt-0"
            >
                <PlusCircle size={20} className="mr-1" /> Додати пару
            </button>
        </div>
    );
};

// === Головний компонент сторінки ===

export default function CreateTestPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const form = useForm<CreateTestFormValues>({
        resolver: zodResolver(CreateTestFormSchema),
        defaultValues: {
            name: '',
            description: '',
            maxExperience: 0,
            maxCoins: 0,
            accessMode: AccessMode.Private,
            durationInMinutes: 0,
            shuffleQuestions: true,
            shuffleAnswers: true,
            isPublished: false,
            isOpened: true,
            hasCloseTime: false,
            closeAt: undefined,
            questions: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'questions',
    });

    const onSubmit = async (data: CreateTestFormValues) => {
        setLoading(true);
        try {
            // Фільтруємо null/undefined поля перед відправкою
            const sanitizedData = {
                ...data,
                closeAt: data.closeAt ? new Date(data.closeAt) : undefined,
                questions: data.questions.map(q => {
                    const newQuestion = { ...q };
                    if (!newQuestion.choiceOptions) newQuestion.choiceOptions = [];
                    if (!newQuestion.questionRows) newQuestion.questionRows = [];
                    if (!newQuestion.questionColumns) newQuestion.questionColumns = [];
                    return newQuestion;
                })
            }
            await api.post(`/teacher/tests/create`, sanitizedData);
            toast.success('Тест успішно створено!');
            router.push('/dashboard/manage-tests');
        } catch (err) {
            handleApiError(err, 'Помилка при збереженні тесту.');
        } finally {
            setLoading(false);
        }
    };

            const addQuestion = (type: QuestionType) => {
            const newQuestion: Partial<QuestionValues> = {
                text: '',
                order: fields.length,
                points: 1,
                questionType: type,
            };

            if (type === QuestionType.SingleChoice || type === QuestionType.MultipleChoice) {
                newQuestion.choiceOptions = [{ text: '', isCorrect: true, order: 0 }];
            } else if (type === QuestionType.TableSingleChoice || type === QuestionType.Ordering) {
                newQuestion.questionRows = [{ text: '', order: 0, validColumnOrder: 1 }];
                newQuestion.questionColumns = [{ text: '', order: 0 }];
            } else if (type === QuestionType.Slider) {
                newQuestion.minNumberValue = 0;
                newQuestion.maxNumberValue = 10;
                newQuestion.numberValueStep = 1;
                newQuestion.targetNumberValue = 5;
            } else if (type === QuestionType.YesNo) {
                newQuestion.targetBoolValue = false;
            }

            append(newQuestion as QuestionValues);
            };
    
    // Хелпери для роботи з массивами
    const handleChoicesUpdate = (questionIndex: number, newChoices: ChoiceOptionValues[]) => {
        form.setValue(`questions.${questionIndex}.choiceOptions`, newChoices);
    };

    const handleRowsUpdate = (questionIndex: number, newRows: QuestionRowValues[]) => {
        form.setValue(`questions.${questionIndex}.questionRows`, newRows);
    };

    const handleColumnsUpdate = (questionIndex: number, newColumns: QuestionColumnValues[]) => {
        form.setValue(`questions.${questionIndex}.questionColumns`, newColumns);
    };

    return (
        <div className="flex-1 pt-6 sm:p-8">
            <div className='flex-row sm:flex justify-between items-center mb-6'>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4 sm:mb-0">
                Створити тест
                <Breadcrumbs items={breadcrumbItems} />
                </h1>
            <Link
            href={'/dashboard/manage-tests'}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              Всі тести
            </Link>
            </div>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <RevealWrapper delay={100} duration={500} origin="top" distance="20px" reset={true}>
                <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg space-y-4">
                    <h2 className="text-xl font-semibold">Загальні параметри</h2>
                    <div>
                        <label className="block text-sm font-medium">Назва тесту</label>
                        <input {...form.register('name')} className="w-full mt-1 p-2 border rounded" />
                        {form.formState.errors.name && <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Опис</label>
                        <textarea {...form.register('description')} className="w-full mt-1 p-2 border rounded" rows={3}></textarea>
                        {form.formState.errors.description && <p className="text-red-500 text-sm">{form.formState.errors.description.message}</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Тривалість (хв) (0 - без обмежень)</label>
                            <input type="number" {...form.register('durationInMinutes', { valueAsNumber: true })} className="w-full mt-1 p-2 border rounded" />
                            {form.formState.errors.durationInMinutes && <p className="text-red-500 text-sm">{form.formState.errors.durationInMinutes.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Кількість спроб (0 - без обмежень)</label>
                            <input type="number" {...form.register('attemptsLimit', { valueAsNumber: true })} className="w-full mt-1 p-2 border rounded" />
                            {form.formState.errors.attemptsLimit && <p className="text-red-500 text-sm">{form.formState.errors.attemptsLimit.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Макс. досвід</label>
                            <input type="number" {...form.register('maxExperience', { valueAsNumber: true })} className="w-full mt-1 p-2 border rounded" />
                            {form.formState.errors.maxExperience && <p className="text-red-500 text-sm">{form.formState.errors.maxExperience.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Макс. монет</label>
                            <input type="number" {...form.register('maxCoins', { valueAsNumber: true })} className="w-full mt-1 p-2 border rounded" />
                            {form.formState.errors.maxCoins && <p className="text-red-500 text-sm">{form.formState.errors.maxCoins.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Доступ</label>
                            <select {...form.register('accessMode', { valueAsNumber: true })} className="w-full mt-1 p-2 border rounded dark:bg-slate-800">
                                <option value={AccessMode.Private}>Приватний</option>
                                <option value={AccessMode.Group}>Для групи</option>
                                <option value={AccessMode.Public}>Публічний</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <label className="flex items-center">
                            <input type="checkbox" {...form.register('shuffleQuestions')} className="form-checkbox" />
                            <span className="ml-2 text-sm">Перемішувати запитання</span>
                        </label>
                        <label className="flex items-center">
                            <input type="checkbox" {...form.register('shuffleAnswers')} className="form-checkbox" />
                            <span className="ml-2 text-sm">Перемішувати відповіді</span>
                        </label>
                        <label className="flex items-center">
                            <input type="checkbox" {...form.register('isPublished')} className="form-checkbox" />
                            <span className="ml-2 text-sm">Опублікувати</span>
                        </label>
                        <label className="flex items-center">
                            <input type="checkbox" {...form.register('isOpened')} className="form-checkbox" />
                            <span className="ml-2 text-sm">Відкрити зараз</span>
                        </label>
                        <label className="flex items-center">
                            <input type="checkbox" {...form.register('hasCloseTime')} className="form-checkbox" />
                            <span className="ml-2 text-sm">Задати час закриття</span>
                        </label>
                        {form.watch("hasCloseTime") && (
                            <input
                            type="datetime-local"
                            {...form.register("closeAt")}
                            className="border rounded px-2 py-1 w-full sm:w-auto"
                            />
                        )}

                    </div>
                </div>
                </RevealWrapper>

                <div className="space-y-6">
                    {fields.map((field, index) => (
                        <RevealWrapper key={field.id} delay={index * 40} duration={500} origin="top" distance="20px" reset={true}>
                        <div key={field.id} className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg relative">
                            <h3 className="font-semibold text-lg mb-4">Запитання #{index + 1}</h3>
                            <button
                                type="button"
                                onClick={() => remove(index)}
                                className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                            >
                                <Trash2 size={24} />
                            </button>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium">Текст запитання</label>
                                    <input {...form.register(`questions.${index}.text`)} className="w-full mt-1 p-2 border rounded" />
                                    {form.formState.errors.questions?.[index]?.text && <p className="text-red-500 text-sm">{form.formState.errors.questions[index]?.text?.message}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium">Кількість балів (1-5)</label>
                                        <input type="number" {...form.register(`questions.${index}.points`, { valueAsNumber: true })} className="w-full mt-1 p-2 border rounded" min="1" max="5" />
                                        {form.formState.errors.questions?.[index]?.points && <p className="text-red-500 text-sm">{form.formState.errors.questions[index]?.points?.message}</p>}
                                    </div>
                                </div>

                                {/* Редактор для Single/Multiple Choice */}
                                {(form.watch(`questions.${index}.questionType`) === QuestionType.SingleChoice || form.watch(`questions.${index}.questionType`) === QuestionType.MultipleChoice) && (
                                    <ChoiceOptionsEditor
                                        type={form.watch(`questions.${index}.questionType`) as QuestionType}
                                        options={form.watch(`questions.${index}.choiceOptions`)}
                                        onAdd={() => {
                                            const options = form.getValues(`questions.${index}.choiceOptions`) || [];
                                            const newOrder = options.length;
                                            handleChoicesUpdate(index, [...options, { text: '', isCorrect: false, order: newOrder }]);
                                        }}
                                        onRemove={(optionIndex) => {
                                            const options = form.getValues(`questions.${index}.choiceOptions`) || [];
                                            const updatedOptions = options.filter((_, i) => i !== optionIndex).map((option, i) => ({...option, order: i}));
                                            handleChoicesUpdate(index, updatedOptions);
                                        }}
                                        onUpdate={(optionIndex, newText) => {
                                            const options = form.getValues(`questions.${index}.choiceOptions`) || [];
                                            options[optionIndex].text = newText;
                                            handleChoicesUpdate(index, [...options]);
                                        }}
                                        onToggleCorrect={(optionIndex) => {
                                            const options = form.getValues(`questions.${index}.choiceOptions`) || [];
                                            const updatedOptions = options.map((opt, i) => ({
                                                ...opt,
                                                isCorrect: form.watch(`questions.${index}.questionType`) === QuestionType.SingleChoice ? i === optionIndex : i === optionIndex ? !opt.isCorrect : opt.isCorrect,
                                            }));
                                            handleChoicesUpdate(index, updatedOptions);
                                        }}
                                    />
                                )}

                                {/* Редактор для Slider */}
                                {form.watch(`questions.${index}.questionType`) === QuestionType.Slider && (
                                    <div className="space-y-4 mt-4">
                                        <h3 className="font-semibold">Налаштування слайдера</h3>
                                        <div>
                                            <label className="block text-sm font-medium">Мінімальне значення</label>
                                            <input type="number" {...form.register(`questions.${index}.minNumberValue`, { valueAsNumber: true })} className="w-full mt-1 p-2 border rounded" />
                                            {form.formState.errors.questions?.[index]?.minNumberValue && <p className="text-red-500 text-sm">{form.formState.errors.questions[index]?.minNumberValue?.message}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium">Максимальне значення</label>
                                            <input type="number" {...form.register(`questions.${index}.maxNumberValue`, { valueAsNumber: true })} className="w-full mt-1 p-2 border rounded" />
                                            {form.formState.errors.questions?.[index]?.maxNumberValue && <p className="text-red-500 text-sm">{form.formState.errors.questions[index]?.maxNumberValue?.message}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium">Крок</label>
                                            <input type="number" {...form.register(`questions.${index}.numberValueStep`, { valueAsNumber: true })} className="w-full mt-1 p-2 border rounded" />
                                        {form.formState.errors.questions?.[index]?.numberValueStep && <p className="text-red-500 text-sm">{form.formState.errors.questions[index]?.numberValueStep?.message}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium">Цільове значення</label>
                                            <input type="number" {...form.register(`questions.${index}.targetNumberValue`, { valueAsNumber: true })} className="w-full mt-1 p-2 border rounded" />
                                            {form.formState.errors.questions?.[index]?.targetNumberValue && <p className="text-red-500 text-sm">{form.formState.errors.questions[index]?.targetNumberValue?.message}</p>}
                                        </div>
                                    </div>
                                )}

                                {/* Редактор для Yes/No */}
                                {form.watch(`questions.${index}.questionType`) === QuestionType.YesNo && (
                                    <div className="space-y-4 mt-4">
                                        <h3 className="font-semibold">Правильна відповідь</h3>
                                        <label className="flex items-center">
                                            <input type="checkbox" {...form.register(`questions.${index}.targetBoolValue`)} className="form-checkbox" />
                                            <span className="ml-2 text-sm">Так</span>
                                        </label>
                                    </div>
                                )}

                                {/* Редактор для TableSingleChoice */}
                                {form.watch(`questions.${index}.questionType`) === QuestionType.TableSingleChoice && (
                                    <TableEditor
                                        rows={form.watch(`questions.${index}.questionRows`)}
                                        columns={form.watch(`questions.${index}.questionColumns`)}
                                        onAddRow={() => {
                                            const rows = form.getValues(`questions.${index}.questionRows`) || [];
                                            handleRowsUpdate(index, [...rows, { text: '', order: rows.length, validColumnOrder: 0 }]);
                                        }}
                                        onRemoveRow={(rowIndex) => {
                                            const rows = form.getValues(`questions.${index}.questionRows`) || [];
                                            const updatedRows = rows.filter((_, i) => i !== rowIndex).map((row, i) => ({ ...row, order: i }));
                                            handleRowsUpdate(index, updatedRows);
                                        }}
                                        onUpdateRowText={(rowIndex, newText) => {
                                            const rows = form.getValues(`questions.${index}.questionRows`) || [];
                                            rows[rowIndex].text = newText;
                                            handleRowsUpdate(index, [...rows]);
                                        }}
                                        onAddColumn={() => {
                                            const cols = form.getValues(`questions.${index}.questionColumns`) || [];
                                            handleColumnsUpdate(index, [...cols, { text: '', order: cols.length }]);
                                        }}
                                        onRemoveColumn={(colIndex) => {
                                            const cols = form.getValues(`questions.${index}.questionColumns`) || [];
                                            const updatedCols = cols.filter((_, i) => i !== colIndex).map((col, i) => ({ ...col, order: i }));
                                            handleColumnsUpdate(index, updatedCols);
                                        }}
                                        onUpdateColumnText={(colIndex, newText) => {
                                            const cols = form.getValues(`questions.${index}.questionColumns`) || [];
                                            cols[colIndex].text = newText;
                                            handleColumnsUpdate(index, [...cols]);
                                        }}
                                        onUpdateCorrectColumn={(rowIndex, newValidColumnOrder) => {
                                            const rows = form.getValues(`questions.${index}.questionRows`) || [];
                                            rows[rowIndex].validColumnOrder = newValidColumnOrder;
                                            handleRowsUpdate(index, [...rows]);
                                        }}
                                    />
                                )}

                                {/* Редактор для Ordering */}
                                {form.watch(`questions.${index}.questionType`) === QuestionType.Ordering && (
                                    <OrderingEditor
                                        rows={form.watch(`questions.${index}.questionRows`)}
                                        columns={form.watch(`questions.${index}.questionColumns`)}
                                        onAdd={() => {
                                            const rows = form.getValues(`questions.${index}.questionRows`) || [];
                                            const columns = form.getValues(`questions.${index}.questionColumns`) || [];
                                            handleRowsUpdate(index, [...rows, { text: '', order: rows.length, validColumnOrder: 0 }]);
                                            handleColumnsUpdate(index, [...columns, { text: '', order: columns.length }]);
                                        }}
                                        onRemove={(pairIndex) => {
                                            const rows = form.getValues(`questions.${index}.questionRows`) || [];
                                            const columns = form.getValues(`questions.${index}.questionColumns`) || [];
                                            const updatedRows = rows.filter((_, i) => i !== pairIndex).map((row, i) => ({ ...row, order: i }));
                                            const updatedColumns = columns.filter((_, i) => i !== pairIndex).map((col, i) => ({ ...col, order: i }));
                                            handleRowsUpdate(index, updatedRows);
                                            handleColumnsUpdate(index, updatedColumns);
                                        }}
                                        onUpdateRowText={(rowIndex, newText) => {
                                            const rows = form.getValues(`questions.${index}.questionRows`) || [];
                                            rows[rowIndex].text = newText;
                                            handleRowsUpdate(index, [...rows]);
                                        }}
                                        onUpdateColumnText={(colIndex, newText) => {
                                            const columns = form.getValues(`questions.${index}.questionColumns`) || [];
                                            columns[colIndex].text = newText;
                                            handleColumnsUpdate(index, [...columns]);
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                        </RevealWrapper>
                    ))}
                </div>

                <div className="flex flex-col justify-end sm:gap-4 mt-6">
                    <div className="flex w-full items-center gap-4">
                        <select
                            id="newQuestionType"
                            className="p-2 bg-white shadow-lg border w-full rounded-lg dark:bg-slate-800"
                            onChange={(e) => {
                            const type = parseInt(e.target.value) as QuestionType;
                            if (!isNaN(type)) {
                                addQuestion(type);
                                e.currentTarget.value = ""; 
                            }
                            }}
                            defaultValue=""
                        >
                            <option value="" disabled>+ Додати питання...</option>
                            <option value={QuestionType.SingleChoice}>Вибір одного</option>
                            <option value={QuestionType.MultipleChoice}>Вибір кількох</option>
                            <option value={QuestionType.TableSingleChoice}>Сітка вибору</option>
                            <option value={QuestionType.Ordering}>Співставлення</option>
                            <option value={QuestionType.Slider}>Слайдер</option>
                            <option value={QuestionType.YesNo}>Так/Ні</option>
                        </select>
                        </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary disabled:opacity-50 mt-4"
                    >
                        {loading ? <Loader size={20} className="animate-spin mr-2" /> : null}
                        Зберегти тест
                    </button>

                    {!isValid && (
                        <p className="text-red-500 text-sm mt-2">
                            Помилка у формі. Будь ласка, перевірте всі поля.
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
}
