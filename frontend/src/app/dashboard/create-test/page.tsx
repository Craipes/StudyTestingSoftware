'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { Loader, Trash2, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

// === Enum для числових значень ===
enum QuestionType {
    SingleChoice = 0,
    MultipleChoice = 1,
    TableSingleChoice = 2,
    Ordering = 3,
    Slider = 4,
    YesNo = 5,
}

enum AccessMode {
    Private = 0,
    Group = 1,
    Public = 2,
}

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
    shuffleAnswers: z.boolean(),
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
    name: z.string().min(1, 'Назва тесту не може бути порожньою.'),
    description: z.string().optional(),
    maxExperience: z.number().int().min(0),
    accessMode: z.nativeEnum(AccessMode),
    durationInMinutes: z.number().int().min(0),
    shuffleQuestions: z.boolean(),
    isPublished: z.boolean(),
    isOpened: z.boolean().optional(),
    hasCloseTime: z.boolean().optional(),
    closeAt: z.string().optional(),
    questions: z.array(QuestionSchema),
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
                <div key={index} className="flex items-center gap-2">
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
                        className="flex-1 px-2 py-1 border rounded"
                    />
                    <button
                        type="button"
                        onClick={() => onRemove(index)}
                        className="text-red-500 hover:text-red-700"
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
            <div className="flex gap-4">
                <div className="flex-1 space-y-2 border p-4 rounded">
                    <h4 className="font-medium">Рядки (Питання)</h4>
                    {rows.map((row, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={row.text}
                                onChange={(e) => onUpdateRowText(index, e.target.value)}
                                className="flex-1 px-2 py-1 border rounded"
                            />
                            <button
                                type="button"
                                onClick={() => onRemoveRow(index)}
                                className="text-red-500 hover:text-red-700"
                            >
                                <Trash2 size={20} />
                            </button>
                            <select
                                value={row.validColumnOrder}
                                onChange={(e) => onUpdateCorrectColumn(index, parseInt(e.target.value))}
                                className="px-2 py-1 border rounded"
                            >
                                <option value="">Оберіть відповідь</option>
                                {columns.map((col, colIndex) => (
                                    <option key={colIndex} value={col.order}>
                                        {col.text || `Стовпець ${colIndex + 1}`}
                                    </option>
                                ))}
                            </select>
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
                <div className="flex-1 space-y-2 border p-4 rounded">
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
                <div key={index} className="flex items-center gap-2">
                    <label className="text-sm font-medium">Питання:</label>
                    <input
                        type="text"
                        value={row.text}
                        onChange={(e) => onUpdateRowText(index, e.target.value)}
                        className="flex-1 px-2 py-1 border rounded"
                    />
                    <label className="text-sm font-medium">Відповідь:</label>
                    <input
                        type="text"
                        value={columns[index]?.text || ''}
                        onChange={(e) => onUpdateColumnText(index, e.target.value)}
                        className="flex-1 px-2 py-1 border rounded"
                    />
                    <button
                        type="button"
                        onClick={() => onRemove(index)}
                        className="text-red-500 hover:text-red-700"
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
            accessMode: AccessMode.Private,
            durationInMinutes: 0,
            shuffleQuestions: true,
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
            console.error(err);
            toast.error('Не вдалося створити тест.');
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
                shuffleAnswers: true,
            };

            if (type === QuestionType.SingleChoice || type === QuestionType.MultipleChoice) {
                newQuestion.choiceOptions = [{ text: '', isCorrect: true, order: 0 }];
            } else if (type === QuestionType.TableSingleChoice || type === QuestionType.Ordering) {
                newQuestion.questionRows = [{ text: '', order: 0, validColumnOrder: -1 }];
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
        <div className="flex-1 p-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">Створити новий тест</h1>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg space-y-4">
                    <h2 className="text-xl font-semibold">Загальні параметри</h2>
                    <div>
                        <label className="block text-sm font-medium">Назва тесту</label>
                        <input {...form.register('name')} className="w-full mt-1 p-2 border rounded" />
                        {form.formState.errors.name && <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Опис</label>
                        <textarea {...form.register('description')} className="w-full mt-1 p-2 border rounded" rows={3}></textarea>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Тривалість (хв)</label>
                            <input type="number" {...form.register('durationInMinutes', { valueAsNumber: true })} className="w-full mt-1 p-2 border rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Макс. досвід</label>
                            <input type="number" {...form.register('maxExperience', { valueAsNumber: true })} className="w-full mt-1 p-2 border rounded" />
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
                    <div className="flex items-center gap-4">
                        <label className="flex items-center">
                            <input type="checkbox" {...form.register('shuffleQuestions')} className="form-checkbox" />
                            <span className="ml-2 text-sm">Перемішувати запитання</span>
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
                            className="border rounded px-2 py-1"
                            />
                        )}

                    </div>
                </div>

                <div className="space-y-6">
                    {fields.map((field, index) => (
                        <div key={field.id} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg relative">
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
                                    {/*<div>
                                        <label className="block text-sm font-medium">Тип запитання</label>
                                        <select
                                            {...form.register(`questions.${index}.questionType`, { valueAsNumber: true })}
                                            onChange={(e) => {
                                                const newType = parseInt(e.target.value) as QuestionValues['questionType'];
                                                const updatedQuestion: Partial<QuestionValues> = {
                                                    ...form.getValues().questions[index],
                                                    questionType: newType,
                                                    // Скидаємо всі специфічні поля
                                                    choiceOptions: undefined,
                                                    questionRows: undefined,
                                                    questionColumns: undefined,
                                                    minNumberValue: undefined,
                                                    maxNumberValue: undefined,
                                                    numberValueStep: undefined,
                                                    targetNumberValue: undefined,
                                                    targetBoolValue: undefined,
                                                };

                                                if (newType === QuestionType.SingleChoice || newType === QuestionType.MultipleChoice) {
                                                    updatedQuestion.choiceOptions = [{ text: '', isCorrect: true, order: 0 }];
                                                } else if (newType === QuestionType.YesNo) {
                                                    updatedQuestion.targetBoolValue = false; // Початкове значення
                                                } else if (newType === QuestionType.Slider) {
                                                    updatedQuestion.minNumberValue = 0;
                                                    updatedQuestion.maxNumberValue = 10;
                                                    updatedQuestion.numberValueStep = 1;
                                                    updatedQuestion.targetNumberValue = 0;
                                                } else if (newType === QuestionType.Ordering || newType === QuestionType.TableSingleChoice) {
                                                    updatedQuestion.questionRows = [{ text: '', order: 0, validColumnOrder: 0 }];
                                                    updatedQuestion.questionColumns = [{ text: '', order: 0 }];
                                                }

                                                form.setValue(`questions.${index}`, updatedQuestion as QuestionValues);
                                            }}
                                            className="w-full mt-1 p-2 border rounded dark:bg-slate-800"
                                        >
                                            <option value={QuestionType.SingleChoice}>Вибір одного</option>
                                            <option value={QuestionType.MultipleChoice}>Вибір кількох</option>
                                            <option value={QuestionType.TableSingleChoice}>Сітка вибору</option>
                                            <option value={QuestionType.Ordering}>Співставлення</option>
                                            <option value={QuestionType.Slider}>Слайдер</option>
                                            <option value={QuestionType.YesNo}>Так/Ні</option>
                                        </select>
                                    </div>*/}
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
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium">Максимальне значення</label>
                                            <input type="number" {...form.register(`questions.${index}.maxNumberValue`, { valueAsNumber: true })} className="w-full mt-1 p-2 border rounded" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium">Крок</label>
                                            <input type="number" {...form.register(`questions.${index}.numberValueStep`, { valueAsNumber: true })} className="w-full mt-1 p-2 border rounded" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium">Цільове значення</label>
                                            <input type="number" {...form.register(`questions.${index}.targetNumberValue`, { valueAsNumber: true })} className="w-full mt-1 p-2 border rounded" />
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
                    ))}
                </div>

                <div className="items-center w-full justify-between">
                    <div className="flex w-full items-center gap-4">
                        <select
                            id="newQuestionType"
                            className="p-2 border w-full rounded dark:bg-slate-800"
                            onChange={(e) => {
                            const type = parseInt(e.target.value) as QuestionType;
                            if (!isNaN(type)) {
                                addQuestion(type);
                                e.currentTarget.value = ""; // скинути вибір після додавання
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
                </div>
            </form>
        </div>
    );
}
