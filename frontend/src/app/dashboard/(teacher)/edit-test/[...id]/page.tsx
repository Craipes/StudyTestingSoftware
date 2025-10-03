'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { Loader, Trash2, PlusCircle } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/axios';
import Breadcrumbs from '@/components/shared/BreadCrumbs';
import Link from 'next/link';


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
    id: z.string().optional(),
    text: z.string().min(1, 'Текст відповіді не може бути порожнім.'),
    isCorrect: z.boolean(),
    order: z.number().int().optional(),
});

const QuestionRowSchema = z.object({
    id: z.string().optional(),
    text: z.string().min(1, 'Текст рядка не може бути порожнім.'),
    order: z.number().int(),
    validColumnOrder: z.number().int(),
});

const QuestionColumnSchema = z.object({
    id: z.string().optional(),
    text: z.string().min(1, 'Текст стовпця не може бути порожнім.'),
    order: z.number().int(),
});

const QuestionSchema = z.object({
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

const EditTestFormSchema = z.object({
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

type EditTestFormValues = z.infer<typeof EditTestFormSchema>;
type QuestionValues = z.infer<typeof QuestionSchema>;
type ChoiceOptionValues = z.infer<typeof ChoiceOptionSchema>;
type QuestionRowValues = z.infer<typeof QuestionRowSchema>;
type QuestionColumnValues = z.infer<typeof QuestionColumnSchema>;

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
                <div key={option.id || index} className="flex sm:flex-row items-center gap-2">
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
                        <div key={row.id || index} className="flex-row sm:flex items-center gap-2">
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
                                        <option key={col.id || colIndex} value={col.order}>
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
                        <div key={col.id || index} className="flex items-center gap-2">
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
                <div key={row.id || index} className="flex-wrap sm:p-3 sm:flex items-center gap-2">
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

export default function EditTestPage() {
    const router = useRouter();
    const params = useParams();
    const testId = params.id;

    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const methods = useForm<EditTestFormValues>({
        resolver: zodResolver(EditTestFormSchema),
    });

    const { fields, append, remove } = useFieldArray({
        control: methods.control,
        name: 'questions',
    });

    // Завантаження даних тесту при завантаженні сторінки
    useEffect(() => {
        const fetchTest = async () => {
            if (!testId) {
                toast.error('ID тесту не знайдено.');
                setLoading(false);
                return;
            }

            try {
                const response = await api.get(`/teacher/tests/edit/${testId}`);
                const data = response.data;
                if (data.closeAt) {
                    data.closeAt = new Date(data.closeAt).toISOString().slice(0, 16);
                }
                methods.reset(data);
            } catch (err) {
                toast.error('Помилка при завантаженні даних тесту.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTest();
    }, [testId, methods]);

    const onSubmit = async (data: EditTestFormValues) => {
        setIsSaving(true);
        try {
            const sanitizedQuestions = data.questions.map(q => {
                const questionData: Partial<QuestionValues> = {
                    id: q.id,
                    text: q.text,
                    order: q.order,
                    points: q.points,
                    questionType: q.questionType,

                    choiceOptions: q.choiceOptions || [],
                    questionRows: q.questionRows || [],
                    questionColumns: q.questionColumns || [],
                };
            
                switch (q.questionType) {
                    case QuestionType.SingleChoice:
                    case QuestionType.MultipleChoice:
                        questionData.choiceOptions = q.choiceOptions?.map((o, i) => ({ ...o, order: i }));
                        break;
                    case QuestionType.TableSingleChoice:
                        questionData.questionRows = q.questionRows?.map((r, i) => ({ ...r, order: i }));
                        questionData.questionColumns = q.questionColumns?.map((c, i) => ({ ...c, order: i }));
                        break;
                    case QuestionType.Ordering:
                        questionData.questionRows = q.questionRows?.map((r, i) => ({ ...r, order: i, validColumnOrder: i }));
                        questionData.questionColumns = q.questionColumns?.map((c, i) => ({ ...c, order: i }));
                        break;
                    case QuestionType.Slider:
                        Object.assign(questionData, {
                            minNumberValue: q.minNumberValue,
                            maxNumberValue: q.maxNumberValue,
                            numberValueStep: q.numberValueStep,
                            targetNumberValue: q.targetNumberValue,
                        });
                        break;
                    case QuestionType.YesNo:
                        questionData.targetBoolValue = q.targetBoolValue;
                        break;
                }
                return questionData;
            });
            
            const sanitizedData = {
                ...data,
                closeAt: data.hasCloseTime && data.closeAt ? new Date(data.closeAt) : null,
                questions: sanitizedQuestions,
            };

            await api.put(`/teacher/tests/edit/${testId}`, sanitizedData);
            toast.success('Тест успішно оновлено!');
            router.push('/dashboard/manage-tests'); 
        } catch (err) {
            console.error(err);
            toast.error('Не вдалося оновити тест.');
        } finally {
            setIsSaving(false);
        }
    };
    
    const addQuestion = (type: QuestionType) => {
        const newQuestion: Partial<QuestionValues> = {
            text: '',
            order: fields.length,
            points: 1,
            questionType: type,
            choiceOptions: [],
            questionRows: [],
            questionColumns: [],
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
        methods.setValue(`questions.${questionIndex}.choiceOptions`, newChoices);
    };

    const handleRowsUpdate = (questionIndex: number, newRows: QuestionRowValues[]) => {
        methods.setValue(`questions.${questionIndex}.questionRows`, newRows);
    };

    const handleColumnsUpdate = (questionIndex: number, newColumns: QuestionColumnValues[]) => {
        methods.setValue(`questions.${questionIndex}.questionColumns`, newColumns);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader className="animate-spin text-blue-500" size={48} />
            </div>
        );
    }
    
    const breadcrumbItems = [
        { name: 'Дашборд', href: '/dashboard' },
        { name: 'Кервання тестами', href: '/dashboard/manage-tests' },
        { name: 'Редагувати тест' }
    ];

    return (
        <div className="flex-1 pt-6 sm:p-8">
            <div className='flex-row sm:flex justify-between items-center mb-6'>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4 sm:mb-0">
                    Редагувати тест
                    <Breadcrumbs items={breadcrumbItems} />
                </h1>
                <Link
                    href={'/dashboard/manage-tests'}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300"
                >
                    Всі тести
                </Link>
            </div>
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg space-y-4">
                        <h2 className="text-xl font-semibold">Загальні параметри</h2>
                        <div>
                            <label className="block text-sm font-medium">Назва тесту</label>
                            <input {...methods.register('name')} className="w-full mt-1 p-2 border rounded" />
                            {methods.formState.errors.name && <p className="text-red-500 text-sm">{methods.formState.errors.name.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Опис</label>
                            <textarea {...methods.register('description')} className="w-full mt-1 p-2 border rounded" rows={3}></textarea>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium">Тривалість (хв)</label>
                                <input type="number" {...methods.register('durationInMinutes', { valueAsNumber: true })} className="w-full mt-1 p-2 border rounded" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Кількість спроб (0 - без обмежень)</label>
                                <input type="number" {...methods.register('attemptsLimit', { valueAsNumber: true })} className="w-full mt-1 p-2 border rounded" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Макс. досвід</label>
                                <input type="number" {...methods.register('maxExperience', { valueAsNumber: true })} className="w-full mt-1 p-2 border rounded" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Доступ</label>
                                <select {...methods.register('accessMode', { valueAsNumber: true })} className="w-full mt-1 p-2 border rounded dark:bg-slate-800">
                                    <option value={AccessMode.Private}>Приватний</option>
                                    <option value={AccessMode.Group}>Для групи</option>
                                    <option value={AccessMode.Public}>Публічний</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                            <label className="flex items-center">
                                <input type="checkbox" {...methods.register('shuffleQuestions')} className="form-checkbox" />
                                <span className="ml-2 text-sm">Перемішувати запитання</span>
                            </label>
                            <label className="flex items-center">
                                <input type="checkbox" {...methods.register('shuffleAnswers')} className="form-checkbox" />
                                <span className="ml-2 text-sm">Перемішувати відповіді</span>
                            </label>
                            <label className="flex items-center">
                                <input type="checkbox" {...methods.register('isPublished')} className="form-checkbox" />
                                <span className="ml-2 text-sm">Опублікувати</span>
                            </label>
                            <label className="flex items-center">
                                <input type="checkbox" {...methods.register('isOpened')} className="form-checkbox" />
                                <span className="ml-2 text-sm">Відкрити зараз</span>
                            </label>
                            <label className="flex items-center">
                                <input type="checkbox" {...methods.register('hasCloseTime')} className="form-checkbox" />
                                <span className="ml-2 text-sm">Задати час закриття</span>
                            </label>
                            {methods.watch("hasCloseTime") && (
                                <input
                                    type="datetime-local"
                                    {...methods.register("closeAt")}
                                    className="border rounded px-2 py-1 w-full sm:w-auto dark:bg-slate-800"
                                />
                            )}
                            {methods.formState.errors.closeAt && <p className="text-red-500 text-sm">{methods.formState.errors.closeAt.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {fields.map((field, index) => (
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
                                        <input {...methods.register(`questions.${index}.text`)} className="w-full mt-1 p-2 border rounded" />
                                        {methods.formState.errors.questions?.[index]?.text && <p className="text-red-500 text-sm">{methods.formState.errors.questions[index]?.text?.message}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium">Тип запитання</label>
                                            <select
                                                {...methods.register(`questions.${index}.questionType`, { valueAsNumber: true })}
                                                onChange={(e) => {
                                                    const newType = parseInt(e.target.value) as QuestionValues['questionType'];
                                                    const currentQuestion = methods.getValues().questions[index];
                                                    
                                                    const updatedQuestion: Partial<QuestionValues> = {
                                                        ...currentQuestion,
                                                        questionType: newType,
                                                        // Скидаємо всі поля, які не відповідають новому типу,
                                                        // але залишаємо основні та обов'язкові
                                                        choiceOptions: [],
                                                        questionRows: [],
                                                        questionColumns: [],
                                                        minNumberValue: undefined,
                                                        maxNumberValue: undefined,
                                                        numberValueStep: undefined,
                                                        targetNumberValue: undefined,
                                                        targetBoolValue: undefined,
                                                    };
                                                    
                                                    switch (newType) {
                                                        case QuestionType.SingleChoice:
                                                        case QuestionType.MultipleChoice:
                                                            updatedQuestion.choiceOptions = [{ text: '', isCorrect: true, order: 0 }];
                                                            break;
                                                        case QuestionType.YesNo:
                                                            updatedQuestion.targetBoolValue = false;
                                                            break;
                                                        case QuestionType.Slider:
                                                            updatedQuestion.minNumberValue = 0;
                                                            updatedQuestion.maxNumberValue = 10;
                                                            updatedQuestion.numberValueStep = 1;
                                                            updatedQuestion.targetNumberValue = 0;
                                                            break;
                                                        case QuestionType.Ordering:
                                                            updatedQuestion.questionRows = [{ text: '', order: 0, validColumnOrder: 0 }];
                                                            updatedQuestion.questionColumns = [{ text: '', order: 0 }];
                                                            break;
                                                        case QuestionType.TableSingleChoice:
                                                             updatedQuestion.questionRows = [{ text: '', order: 0, validColumnOrder: 0 }];
                                                            updatedQuestion.questionColumns = [{ text: '', order: 0 }];
                                                            break;
                                                    }
                                                    
                                                    methods.setValue(`questions.${index}`, updatedQuestion as QuestionValues);
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
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium">Кількість балів (1-5)</label>
                                            <input type="number" {...methods.register(`questions.${index}.points`, { valueAsNumber: true })} className="w-full mt-1 p-2 border rounded" min="1" max="5" />
                                            {methods.formState.errors.questions?.[index]?.points && <p className="text-red-500 text-sm">{methods.formState.errors.questions[index]?.points?.message}</p>}
                                        </div>
                                    </div>

                                    {/* Редактор для Single/Multiple Choice */}
                                    {(methods.watch(`questions.${index}.questionType`) === QuestionType.SingleChoice || methods.watch(`questions.${index}.questionType`) === QuestionType.MultipleChoice) && (
                                        <ChoiceOptionsEditor
                                            type={methods.watch(`questions.${index}.questionType`) as QuestionType}
                                            options={methods.watch(`questions.${index}.choiceOptions`)}
                                            onAdd={() => {
                                                const options = methods.getValues(`questions.${index}.choiceOptions`) || [];
                                                const newOrder = options.length;
                                                handleChoicesUpdate(index, [...options, { text: '', isCorrect: false, order: newOrder }]);
                                            }}
                                            onRemove={(optionIndex) => {
                                                const options = methods.getValues(`questions.${index}.choiceOptions`) || [];
                                                const updatedOptions = options.filter((_, i) => i !== optionIndex).map((option, i) => ({...option, order: i}));
                                                handleChoicesUpdate(index, updatedOptions);
                                            }}
                                            onUpdate={(optionIndex, newText) => {
                                                const options = methods.getValues(`questions.${index}.choiceOptions`) || [];
                                                options[optionIndex].text = newText;
                                                handleChoicesUpdate(index, [...options]);
                                            }}
                                            onToggleCorrect={(optionIndex) => {
                                                const options = methods.getValues(`questions.${index}.choiceOptions`) || [];
                                                const currentType = methods.watch(`questions.${index}.questionType`);
                                                let updatedOptions = [...options];

                                                if (currentType === QuestionType.SingleChoice) {
                                                    // Для SingleChoice робимо поточний елемент correct, а всі інші false
                                                    updatedOptions = updatedOptions.map((opt, i) => ({ ...opt, isCorrect: i === optionIndex }));
                                                } else {
                                                    // Для MultipleChoice просто перемикаємо
                                                    updatedOptions[optionIndex].isCorrect = !updatedOptions[optionIndex].isCorrect;
                                                }
                                                handleChoicesUpdate(index, updatedOptions);
                                            }}
                                        />
                                    )}

                                    {/* Редактор для TableSingleChoice */}
                                    {methods.watch(`questions.${index}.questionType`) === QuestionType.TableSingleChoice && (
                                        <TableEditor
                                            rows={methods.watch(`questions.${index}.questionRows`)}
                                            columns={methods.watch(`questions.${index}.questionColumns`)}
                                            onAddRow={() => {
                                                const rows = methods.getValues(`questions.${index}.questionRows`) || [];
                                                const newOrder = rows.length;
                                                handleRowsUpdate(index, [...rows, { text: '', order: newOrder, validColumnOrder: 0 }]);
                                            }}
                                            onRemoveRow={(rowIndex) => {
                                                const rows = methods.getValues(`questions.${index}.questionRows`) || [];
                                                const updatedRows = rows.filter((_, i) => i !== rowIndex).map((row, i) => ({...row, order: i}));
                                                handleRowsUpdate(index, updatedRows);
                                            }}
                                            onUpdateRowText={(rowIndex, newText) => {
                                                const rows = methods.getValues(`questions.${index}.questionRows`) || [];
                                                rows[rowIndex].text = newText;
                                                handleRowsUpdate(index, [...rows]);
                                            }}
                                            onAddColumn={() => {
                                                const columns = methods.getValues(`questions.${index}.questionColumns`) || [];
                                                const newOrder = columns.length;
                                                handleColumnsUpdate(index, [...columns, { text: '', order: newOrder }]);
                                            }}
                                            onRemoveColumn={(colIndex) => {
                                                const columns = methods.getValues(`questions.${index}.questionColumns`) || [];
                                                const updatedColumns = columns.filter((_, i) => i !== colIndex).map((col, i) => ({...col, order: i}));
                                                handleColumnsUpdate(index, updatedColumns);
                                            }}
                                            onUpdateColumnText={(colIndex, newText) => {
                                                const columns = methods.getValues(`questions.${index}.questionColumns`) || [];
                                                columns[colIndex].text = newText;
                                                handleColumnsUpdate(index, [...columns]);
                                            }}
                                            onUpdateCorrectColumn={(rowIndex, newValidColumnOrder) => {
                                                const rows = methods.getValues(`questions.${index}.questionRows`) || [];
                                                rows[rowIndex].validColumnOrder = newValidColumnOrder;
                                                handleRowsUpdate(index, [...rows]);
                                            }}
                                        />
                                    )}

                                    {/* Редактор для Ordering */}
                                    {methods.watch(`questions.${index}.questionType`) === QuestionType.Ordering && (
                                        <OrderingEditor
                                            rows={methods.watch(`questions.${index}.questionRows`)}
                                            columns={methods.watch(`questions.${index}.questionColumns`)}
                                            onAdd={() => {
                                                const rows = methods.getValues(`questions.${index}.questionRows`) || [];
                                                const columns = methods.getValues(`questions.${index}.questionColumns`) || [];
                                                const newOrder = rows.length;
                                                handleRowsUpdate(index, [...rows, { text: '', order: newOrder, validColumnOrder: newOrder }]);
                                                handleColumnsUpdate(index, [...columns, { text: '', order: newOrder }]);
                                            }}
                                            onRemove={(pairIndex) => {
                                                const rows = methods.getValues(`questions.${index}.questionRows`) || [];
                                                const columns = methods.getValues(`questions.${index}.questionColumns`) || [];
                                                const updatedRows = rows.filter((_, i) => i !== pairIndex).map((row, i) => ({...row, order: i, validColumnOrder: i}));
                                                const updatedColumns = columns.filter((_, i) => i !== pairIndex).map((col, i) => ({...col, order: i}));
                                                handleRowsUpdate(index, updatedRows);
                                                handleColumnsUpdate(index, updatedColumns);
                                            }}
                                            onUpdateRowText={(rowIndex, newText) => {
                                                const rows = methods.getValues(`questions.${index}.questionRows`) || [];
                                                rows[rowIndex].text = newText;
                                                handleRowsUpdate(index, [...rows]);
                                            }}
                                            onUpdateColumnText={(colIndex, newText) => {
                                                const columns = methods.getValues(`questions.${index}.questionColumns`) || [];
                                                columns[colIndex].text = newText;
                                                handleColumnsUpdate(index, [...columns]);
                                            }}
                                        />
                                    )}

                                    {/* Редактор для Slider */}
                                    {methods.watch(`questions.${index}.questionType`) === QuestionType.Slider && (
                                        <div className="space-y-2 mt-4">
                                            <h3 className="font-semibold">Параметри слайдера</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium">Мін. значення</label>
                                                    <input type="number" {...methods.register(`questions.${index}.minNumberValue`, { valueAsNumber: true })} className="w-full mt-1 p-2 border rounded" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium">Макс. значення</label>
                                                    <input type="number" {...methods.register(`questions.${index}.maxNumberValue`, { valueAsNumber: true })} className="w-full mt-1 p-2 border rounded" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium">Крок</label>
                                                    <input type="number" {...methods.register(`questions.${index}.numberValueStep`, { valueAsNumber: true })} className="w-full mt-1 p-2 border rounded" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium">Цільове значення</label>
                                                    <input type="number" {...methods.register(`questions.${index}.targetNumberValue`, { valueAsNumber: true })} className="w-full mt-1 p-2 border rounded" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Редактор для Yes/No */}
                                    {methods.watch(`questions.${index}.questionType`) === QuestionType.YesNo && (
                                        <div className="space-y-2 mt-4">
                                            <h3 className="font-semibold">Правильна відповідь</h3>
                                            <label className="flex items-center space-x-2">
                                                <input
                                                    type="radio"
                                                    value="true"
                                                    checked={methods.watch(`questions.${index}.targetBoolValue`) === true}
                                                    onChange={() => methods.setValue(`questions.${index}.targetBoolValue`, true)}
                                                    className="form-radio"
                                                />
                                                <span>Так</span>
                                            </label>
                                            <label className="flex items-center space-x-2">
                                                <input
                                                    type="radio"
                                                    value="false"
                                                    checked={methods.watch(`questions.${index}.targetBoolValue`) === false}
                                                    onChange={() => methods.setValue(`questions.${index}.targetBoolValue`, false)}
                                                    className="form-radio"
                                                />
                                                <span>Ні</span>
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col justify-end sm:gap-4 mt-6">
                        <div className="flex w-full items-center gap-4">
                        <select
                            onChange={(e) => addQuestion(parseInt(e.target.value) as QuestionType)}
                            className="p-2 bg-white shadow-lg border w-full rounded-lg dark:bg-slate-800"
                        >
                            <option value="">Додати запитання...</option>
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
                            className="btn-primary disabled:opacity-50 mt-4"
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <Loader className="animate-spin mr-2" size={20} />
                            ) : (
                                'Зберегти зміни'
                            )}
                        </button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}