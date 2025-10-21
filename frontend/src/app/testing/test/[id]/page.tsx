'use client';

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/axios';
import {formatTimeLeft, getKyivDateFromUTC } from '@/utils/parse-date';

// Типи для даних (залишаються незмінними)
interface ChoiceOption {
  id: string;
  text: string;
  isSelected: boolean;
}

interface QuestionRow {
  id: string;
  text: string;
  selectedColumnId: string | null;
}

interface QuestionColumn {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  points: number;
  questionType: number;
  minNumberValue?: number;
  maxNumberValue?: number;
  numberValueStep?: number;
  selectedNumberValue?: number;
  selectedBooleanValue?: boolean;
  questionRows: QuestionRow[];
  questionColumns: QuestionColumn[];
  choiceOptions: ChoiceOption[];
}

interface TestSession {
  id: string;
  testName: string;
  startedAt: string;
  finishedAt: string | null;
  autoFinishAt: string;
  score: number;
  isCompleted: boolean;
  durationInMinutes: number;
  questions: Question[];
}

const TestPage = () => {
  const { id } = useParams()
  const router = useRouter()
  const [testSession, setTestSession] = useState<TestSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null);


  // Завантаження тесту
  useEffect(() => {
    const fetchTestSession = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/student/tests/session/${id}`)
        console.log('Fetched test session:', response.data)
        setTestSession(response.data)
      } catch (err) {
        setError('Не вдалося завантажити тест')
        console.error('Error fetching test session:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchTestSession()
    }
  }, [id])

  // Таймер
    useEffect(() => {
      if (!testSession?.autoFinishAt) return;

      const finishTimeKyiv = getKyivDateFromUTC(testSession.autoFinishAt);

      const interval = setInterval(() => {
        const now = new Date();
        const diff = finishTimeKyiv.getTime() - now.getTime();

        if (diff <= 0) {
          clearInterval(interval);
          finishTest(); 
        } else {
          setTimeLeft(Math.floor(diff / 1000));
        }
      }, 1000);

      return () => clearInterval(interval);
    }, [testSession]);



  // Функція для оновлення питання в локальному стані
  const updateQuestionInState = (questionId: string, updates: any) => {
    setTestSession(prev => {
      if (!prev) return null

      return {
        ...prev,
        questions: prev.questions.map(question => {
          if (question.id === questionId) {
            return { ...question, ...updates }
          }
          return question
        })
      }
    })
  }

  // Функція для оновлення вибору в choiceOptions
  const updateChoiceOptionSelection = (questionId: string, optionId: string, isSelected: boolean) => {
    setTestSession(prev => {
      if (!prev) return null

      return {
        ...prev,
        questions: prev.questions.map(question => {
          if (question.id === questionId) {
            return {
              ...question,
              choiceOptions: question.choiceOptions.map(option => 
                option.id === optionId 
                  ? { ...option, isSelected }
                  : option
              )
            }
          }
          return question
        })
      }
    })
  }

  // Функція для оновлення рядка в таблиці
  const updateTableRowSelection = (questionId: string, rowId: string, columnId: string | null) => {
    setTestSession(prev => {
      if (!prev) return null

      return {
        ...prev,
        questions: prev.questions.map(question => {
          if (question.id === questionId) {
            return {
              ...question,
              questionRows: question.questionRows.map(row =>
                row.id === rowId
                  ? { ...row, selectedColumnId: columnId }
                  : row
              )
            }
          }
          return question
        })
      }
    })
  }

  // Відправка відповіді
  const submitAnswer = async (questionId: string, answerData: any) => {
    try {
      setSubmitting(true)

      const payload = {
      sessionId: id,
      questionId,
      ...answerData
    }
    
    console.log('Sending answer payload:', payload)

      await api.put('/student/tests/session/submit-answer', {
        sessionId: id,
        questionId,
        ...answerData
      })

    } catch (err) {
      console.error('Error submitting answer:', err)
      // Якщо помилка, можна відкотити зміни в стані
      throw err
    } finally {
      setSubmitting(false)
    }
  }

  // Завершення тесту
  const finishTest = async () => {
    try {
      setSubmitting(true)
      await api.post(`/student/tests/session/${id}/submit`)
      router.push('/dashboard')
    } catch (err) {
      console.error('Error finishing test:', err)
    } finally {
      setSubmitting(false)
    }
  }

  // Обробники для різних типів питань
  const handleSingleChoice = async (questionId: string, optionId: string) => {
    const question = testSession?.questions.find(q => q.id === questionId)
    if (!question) return

    // Оновлюємо локальний стан
    const updatedChoiceOptions = question.choiceOptions.map(option => ({
      ...option,
      isSelected: option.id === optionId
    }))

    updateQuestionInState(questionId, { choiceOptions: updatedChoiceOptions })

    // Відправляємо на сервер
    try {
      await submitAnswer(questionId, {
        selectedChoiceOptionId: optionId
      })
    } catch (err) {
      // У разі помилки можна показати повідомлення користувачу
    }
  }

  const handleMultipleChoice = async (questionId: string, optionId: string, isSelected: boolean) => {
    // Оновлюємо локальний стан
    updateChoiceOptionSelection(questionId, optionId, isSelected)

    // Відправляємо на сервер
    try {
      await submitAnswer(questionId, {
        selectedChoiceOptionId: optionId,
        booleanValue: isSelected
      })
    } catch (err) {
      // У разі помилки відкочуємо зміни
      updateChoiceOptionSelection(questionId, optionId, !isSelected)
    }
  }

  const handleTableSingleChoice = async (questionId: string, rowId: string, columnId: string) => {
    // Оновлюємо локальний стан
    updateTableRowSelection(questionId, rowId, columnId)

    // Відправляємо на сервер
    try {
      await submitAnswer(questionId, {
        selectedMatrixRowId: rowId,
        selectedMatrixColumnId: columnId
      })
    } catch (err) {
      // У разі помилки відкочуємо зміни
      updateTableRowSelection(questionId, rowId, null)
    }
  }

  const handleYesNo = async (questionId: string, value: boolean) => {
    // Оновлюємо локальний стан
    updateQuestionInState(questionId, { selectedBooleanValue: value })

    // Відправляємо на сервер
    try {
      await submitAnswer(questionId, {
        booleanValue: value
      })
    } catch (err) {
      // У разі помилки відкочуємо зміни
      updateQuestionInState(questionId, { selectedBooleanValue: !value })
    }
  }

  const handleSlider = async (questionId: string, value: number) => {
    // Оновлюємо локальний стан
    updateQuestionInState(questionId, { selectedNumberValue: value })

    // Відправляємо на сервер
    try {
      await submitAnswer(questionId, {
        numberValue: value
      })
    } catch (err) {
      // У разі помилки можна показати повідомлення
      console.error('Помилка при збереженні відповіді:', err)
    }
  }

  const handleOrdering = async (questionId: string, rowId: string, columnId: string) => {
    // Оновлюємо локальний стан
    updateTableRowSelection(questionId, rowId, columnId)

    // Відправляємо на сервер
    try {
      await submitAnswer(questionId, {
        selectedMatrixRowId: rowId,
        selectedMatrixColumnId: columnId
      })
    } catch (err) {
      // У разі помилки відкочуємо зміни
      updateTableRowSelection(questionId, rowId, null)
    }
  }

  // Компоненти для різних типів питань
  const renderSingleChoice = (question: Question) => (
    <div className="space-y-3 dark:text-gray-200">
      {question.choiceOptions.map((option) => (
        <button
          key={option.id}
          onClick={() => handleSingleChoice(question.id, option.id)}
          disabled={submitting}
          className={`w-full p-4 text-left border rounded-lg transition-colors ${
            option.isSelected 
              ? 'bg-blue-500 text-white border-blue-500' 
              : 'bg-white text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-50'
          } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {option.text}
        </button>
      ))}
    </div>
  )

  const renderMultipleChoice = (question: Question) => (
    <div className="space-y-3 dark:text-gray-200">
      {question.choiceOptions.map((option) => (
        <label 
          key={option.id} 
          className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
            submitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <input
            type="checkbox"
            checked={option.isSelected}
            onChange={(e) => handleMultipleChoice(question.id, option.id, e.target.checked)}
            disabled={submitting}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span>{option.text}</span>
        </label>
      ))}
    </div>
  )

  const renderTableSingleChoice = (question: Question) => (
    <div className="overflow-x-auto dark:text-gray-200">
      <table className="w-full border-collapse bord border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 p-3 bg-gray-50 font-medium dark:text-gray-200 dark:bg-gray-700"></th>
            {question.questionColumns.map((column) => (
              <th key={column.id} className="border border-gray-300 p-3 bg-gray-50 text-center dark:text-gray-200 dark:bg-gray-700">
                {column.text}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {question.questionRows.map((row) => (
            <tr key={row.id}>
              <td className="border border-gray-300 p-3 bg-gray-50 font-medium dark:text-gray-200 dark:bg-gray-700">
                {row.text}
              </td>
              {question.questionColumns.map((column) => (
                <td key={column.id} className="border border-gray-300 p-3 text-center">
                  <input
                    type="radio"
                    name={`row-${row.id}`}
                    checked={row.selectedColumnId === column.id}
                    onChange={() => handleTableSingleChoice(question.id, row.id, column.id)}
                    disabled={submitting}
                    className="w-4 h-4"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderYesNo = (question: Question) => (
    <div className="flex space-x-4">
      <button
        onClick={() => handleYesNo(question.id, true)}
        disabled={submitting}
        className={`flex-1 p-4 border rounded-lg transition-colors ${
          question.selectedBooleanValue === true 
            ? 'bg-blue-500 text-white border-blue-500' 
            : 'bg-white text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-50'
        } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        Так
      </button>
      <button
        onClick={() => handleYesNo(question.id, false)}
        disabled={submitting}
        className={`flex-1 p-4 border rounded-lg transition-colors ${
          question.selectedBooleanValue === false 
            ? 'bg-blue-500 text-white border-blue-500' 
            : 'bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-200 border-gray-300 hover:bg-gray-50'
        } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        Ні
      </button>
    </div>
  )

  const renderSlider = (question: Question) => (
    <div className="space-y-4">
      <input
        type="range"
        min={question.minNumberValue}
        max={question.maxNumberValue}
        step={question.numberValueStep}
        value={question.selectedNumberValue || 0}
        onChange={(e) => handleSlider(question.id, parseInt(e.target.value))}
        disabled={submitting}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
      <div className="text-center text-lg font-semibold">
        {question.selectedNumberValue}
      </div>
    </div>
  )

  const renderOrdering = (question: Question) => (
    <div className="space-y-3">
      {question.questionRows.map((row, index) => (
        <div key={row.id} className="flex items-center space-x-3 p-3 border rounded-lg">
          <span className="font-medium w-8">{index + 1}.</span>
          <span className="flex-1">{row.text}</span>
          <select
            value={row.selectedColumnId || ''}
            onChange={(e) => handleOrdering(question.id, row.id, e.target.value)}
            disabled={submitting}
            className={`p-2 border rounded ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <option value="">Оберіть відповідність</option>
            {question.questionColumns.map((column) => (
              <option key={column.id} value={column.id}>
                {column.text}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  )

  // Основний рендер питання
  const renderQuestion = (question: Question) => {
    switch (question.questionType) {
      case 0: // SingleChoice
        return renderSingleChoice(question)
      case 1: // MultipleChoice
        return renderMultipleChoice(question)
      case 2: // TableSingleChoice
        return renderTableSingleChoice(question)
      case 3: // Ordering
        return renderOrdering(question)
      case 4: // Slider
        return renderSlider(question)
      case 5: // YesNo
        return renderYesNo(question)
      default:
        return <div>Невідомий тип питання</div>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Завантаження тесту...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    )
  }

  if (!testSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Тест не знайдено</div>
      </div>
    )
  }

  const currentQuestion = testSession.questions[currentQuestionIndex]

  return (
    <div className="min-h-screen bg-[##90a1b9] py-8">
      <div className="max-w-4xl mx-auto sm:px-4">
        {/* Заголовок тесту */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 dark:bg-gray-800 ">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">
            {testSession.testName}
          </h1>
          <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
            <span>Питання {currentQuestionIndex + 1} з {testSession.questions.length}</span>
            <span>Бали за відповідь: {currentQuestion.points}</span>
            <span className="font-semibold text-red-600">
              ⏱ Залишилось часу: {formatTimeLeft(timeLeft)}
            </span>
          </div>
        </div>

        {/* Поточне питання */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 dark:bg-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 dark:text-white">
            {currentQuestion.text}
          </h2>
          
          {renderQuestion(currentQuestion)}
        </div>

        {/* Навігація */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0 || submitting}
            className="px-6 dark:text-gray-200 py-2 border border-gray-300 rounded-lg text-gray-700 disabled:opacity-50 dark:hover:bg-gray-500 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Назад
          </button>

          {currentQuestionIndex < testSession.questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
              disabled={submitting}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600"
            >
              Далі
            </button>
          ) : (
            <button
              onClick={finishTest}
              disabled={submitting}
              className="px-6 py-2 bg-green-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600"
            >
              Завершити тест
            </button>
          )}
        </div>

        {/* Прогрес бару */}
        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${((currentQuestionIndex + 1) / testSession.questions.length) * 100}%` 
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestPage

