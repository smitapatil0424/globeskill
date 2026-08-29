'use client';

import React, { useState, useEffect, useCallback } from 'react';

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizEngineQuestion {
  id: string;
  question_text: string;
  options: QuizOption[];
  points?: number;
  explanation?: string | null;
  correct_option_id?: string;
}

export interface QuizEngineProps {
  title?: string;
  courseTitle?: string;
  questions: QuizEngineQuestion[];
  durationMinutes?: number;
  passingScore?: number; // 0 - 100, default 70
  allowBacktracking?: boolean; // default false
  onSubmit?: (answers: Record<string, string>, timeSpentSeconds: number) => Promise<void> | void;
  onCancel?: () => void;
}

export default function QuizEngine({
  title = 'Module Mastery Assessment',
  courseTitle = 'GlobeSkill Skilling Track',
  questions = [],
  durationMinutes = 20,
  passingScore = 70,
  allowBacktracking = false,
  onSubmit,
  onCancel,
}: QuizEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(durationMinutes * 60);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];

  // Timer countdown
  useEffect(() => {
    if (isSubmitted || isTimeUp) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimeUp(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, isTimeUp]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Track user answer
  const handleSelectOption = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowConfirmModal(true);
    }
  };

  const handlePrevious = () => {
    if (allowBacktracking && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Submit assessment
  const handleFinalSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setShowConfirmModal(false);

    const timeSpent = durationMinutes * 60 - timeRemaining;

    try {
      if (onSubmit) {
        await onSubmit(selectedAnswers, timeSpent);
      }
      setIsSubmitted(true);
    } catch (err) {
      console.error('Quiz submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [durationMinutes, timeRemaining, onSubmit, selectedAnswers]);

  // Calculate score for display (if correct_option_id provided)
  const calculateResult = () => {
    let earned = 0;
    let total = 0;

    questions.forEach((q) => {
      const pts = q.points || 1;
      total += pts;
      if (q.correct_option_id && selectedAnswers[q.id] === q.correct_option_id) {
        earned += pts;
      }
    });

    const percentage = total > 0 ? Math.round((earned / total) * 100) : 0;
    const passed = percentage >= passingScore;

    return { earned, total, percentage, passed };
  };

  // Early return if no questions provided
  if (!questions || questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-white border border-slate-200 shadow-xl text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto text-xl font-bold">
          !
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Assessment Questions Available</h2>
        <p className="text-sm text-slate-500">
          This learning module does not currently have any active quiz questions configured.
        </p>
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
          >
            Return to Learning Hub
          </button>
        )}
      </div>
    );
  }

  // =========================================================================
  // RESULT SCREEN (POST-SUBMISSION)
  // =========================================================================
  if (isSubmitted) {
    const result = calculateResult();

    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-16">
        <div
          className={`p-8 rounded-3xl border shadow-xl text-center relative overflow-hidden ${
            result.passed
              ? 'bg-gradient-to-br from-emerald-950 via-slate-950 to-emerald-950 border-emerald-800/60 text-white'
              : 'bg-gradient-to-br from-slate-950 via-amber-950 to-slate-950 border-amber-800/60 text-white'
          }`}
        >
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold mb-3 border">
            {result.passed ? (
              <span className="text-emerald-400">✓ Assessment Passed</span>
            ) : (
              <span className="text-amber-400">Milestone Needs Review</span>
            )}
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {result.passed ? 'Outstanding Work!' : 'Assessment Completed'}
          </h2>
          <p className="text-slate-300 text-sm mt-2 max-w-md mx-auto">
            {result.passed
              ? `You have exceeded the ${passingScore}% threshold. Your progress has been updated and registered to your learner profile.`
              : `You scored ${result.percentage}%. The passing threshold is ${passingScore}%. You can review the explanations below to reinforce key concepts.`}
          </p>

          {/* Score Display Widget */}
          <div className="my-6 inline-flex items-center space-x-6 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className="text-center px-4 border-r border-slate-800">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-bold">
                Final Score
              </span>
              <span
                className={`text-4xl font-black ${
                  result.passed ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {result.percentage}%
              </span>
            </div>
            <div className="text-left">
              <span className="text-xs text-slate-400 block">
                Points Earned: <strong className="text-white">{result.earned} / {result.total}</strong>
              </span>
              <span className="text-xs text-slate-400 block mt-1">
                Time Spent: <strong className="text-white">{formatTime(durationMinutes * 60 - timeRemaining)}</strong>
              </span>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-6 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-colors shadow-md cursor-pointer"
              >
                Back to Learning Hub &rarr;
              </button>
            )}
          </div>
        </div>

        {/* Detailed Question Review */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Question-by-Question Review</h3>
          {questions.map((q, idx) => {
            const studentChoice = selectedAnswers[q.id];
            const isCorrect = q.correct_option_id ? studentChoice === q.correct_option_id : true;

            return (
              <div
                key={q.id}
                className={`p-5 rounded-2xl border bg-white shadow-xs space-y-3 ${
                  isCorrect ? 'border-emerald-200' : 'border-amber-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500">Question {idx + 1}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                      isCorrect
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isCorrect ? '✓ Correct' : 'Incorrect'}
                  </span>
                </div>

                <p className="font-semibold text-slate-900 text-sm">{q.question_text}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {q.options.map((opt) => {
                    const isSelected = opt.id === studentChoice;
                    const isAnswerKey = opt.id === q.correct_option_id;

                    return (
                      <div
                        key={opt.id}
                        className={`p-3 rounded-xl border flex items-center space-x-2.5 ${
                          isAnswerKey
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                            : isSelected
                            ? 'bg-rose-50 border-rose-300 text-rose-900 font-semibold'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-md bg-white border border-slate-300 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                          {opt.id.toUpperCase()}
                        </span>
                        <span>{opt.text}</span>
                        {isAnswerKey && (
                          <span className="text-[10px] text-emerald-700 font-bold ml-auto">
                            Correct Answer
                          </span>
                        )}
                        {isSelected && !isAnswerKey && (
                          <span className="text-[10px] text-rose-600 font-bold ml-auto">
                            Your Choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                    <strong className="text-slate-800 block mb-0.5">Explanation:</strong>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // =========================================================================
  // ACTIVE QUIZ STEPPER SCREEN
  // =========================================================================
  const progressPercentage = Math.round(((currentIndex + 1) / totalQuestions) * 100);
  const currentSelected = selectedAnswers[currentQuestion.id];
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const isTimeUrgent = timeRemaining < 300; // Under 5 minutes

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* 1. Header Bar: Course & Countdown Timer */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
            <span>{courseTitle}</span>
            <span>&bull;</span>
            <span className="text-emerald-400">Active Assessment</span>
          </div>
          <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
            {title}
          </h1>
        </div>

        {/* Timer Widget */}
        <div
          className={`flex items-center space-x-2.5 px-4 py-2 rounded-2xl border font-mono text-sm font-bold self-start sm:self-auto ${
            isTimeUrgent
              ? 'bg-rose-950/80 border-rose-600/80 text-rose-300 animate-pulse'
              : 'bg-slate-800/90 border-slate-700 text-slate-200'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{formatTime(timeRemaining)}</span>
        </div>
      </div>

      {/* 2. Top Progress Bar & Stepper */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
          <span>
            Question <strong className="text-slate-900">{currentIndex + 1}</strong> of {totalQuestions}
          </span>
          <span>{progressPercentage}% Complete</span>
        </div>

        <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-blue-500 transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* 3. Main Question Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
            Question #{currentIndex + 1}
          </span>
          <span className="text-xs font-semibold text-slate-400">
            Value: {currentQuestion.points || 10} Points
          </span>
        </div>

        {/* Question Text */}
        <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 leading-snug">
          {currentQuestion.question_text}
        </h2>

        {/* Multiple Choice Options List */}
        <div className="space-y-3">
          {currentQuestion.options.map((option) => {
            const isSelected = currentSelected === option.id;

            return (
              <button
                type="button"
                key={option.id}
                onClick={() => handleSelectOption(currentQuestion.id, option.id)}
                className={`w-full p-4 sm:p-5 rounded-2xl border text-left transition-all flex items-center space-x-4 cursor-pointer group ${
                  isSelected
                    ? 'bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-600/30 text-indigo-950 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 hover:border-slate-300 text-slate-800'
                }`}
              >
                {/* Option Identifier Badge */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white border border-slate-300 text-slate-600 group-hover:border-slate-400'
                  }`}
                >
                  {option.id.toUpperCase()}
                </div>

                {/* Option Text */}
                <span className="text-xs sm:text-sm font-medium flex-1 leading-relaxed">
                  {option.text}
                </span>

                {/* Radio Indicator */}
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Navigation & Anti-Backtracking Notice */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {!allowBacktracking && (
              <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                <span>🔒</span>
                <span>Linear progression: Backtracking is locked for this quiz.</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3 self-end sm:self-auto">
            {/* Back Button (Only if allowBacktracking is enabled) */}
            {allowBacktracking && (
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={handlePrevious}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                &larr; Previous
              </button>
            )}

            {/* Next or Submit Button */}
            <button
              type="button"
              disabled={!currentSelected}
              onClick={handleNext}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                isLastQuestion
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30'
              }`}
            >
              <span>{isLastQuestion ? 'Review & Submit Assessment' : 'Next Question'}</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Submission Confirmation Modal */}
      {showConfirmModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-scale-up text-center">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-xl font-bold">
              ✓
            </div>
            <h3 className="text-xl font-bold text-slate-900">Ready to Submit Assessment?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              You have selected answers for{' '}
              <strong className="text-slate-900 font-bold">
                {Object.keys(selectedAnswers).length} of {totalQuestions}
              </strong>{' '}
              questions. Once submitted, your answers will be graded server-side.
            </p>

            <div className="pt-2 flex items-center justify-center space-x-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
              >
                Return to Quiz
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 cursor-pointer flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <span>Grading Assessment...</span>
                ) : (
                  <span>Confirm & Submit</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
