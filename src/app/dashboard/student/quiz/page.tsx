'use client';

import { useState } from 'react';
import QuizEngine, { QuizEngineQuestion } from '@/components/QuizEngine';
import Link from 'next/link';

// SEEDED QUIZ 1: Introduction to AI and Digital Skills
const AI_DIGITAL_SKILLS_QUESTIONS: QuizEngineQuestion[] = [
  {
    id: 'b0000000-0000-0000-0000-000000000011',
    question_text: 'What is the core difference between traditional computer programming and Artificial Intelligence (Machine Learning)?',
    options: [
      { id: 'a', text: 'Traditional programs learn by themselves from data, while AI requires humans to manually write every single IF/THEN rule.' },
      { id: 'b', text: 'Traditional programming follows explicit human-written instructions, while Machine Learning models discover patterns from data to make predictions.' },
      { id: 'c', text: 'Traditional programming only works on smartphones, while AI only works on supercomputers.' },
      { id: 'd', text: 'There is no difference; AI is simply a marketing buzzword for HTML tables.' },
    ],
    points: 20,
    correct_option_id: 'b',
    explanation: 'In traditional programming, developers hand-craft algorithmic logic. In Machine Learning, statistical models analyze data inputs and learn rules autonomously.',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000012',
    question_text: 'In generative AI and Large Language Models (LLMs), what is a "token"?',
    options: [
      { id: 'a', text: 'A physical plastic coin inserted into arcade machine slots.' },
      { id: 'b', text: 'The physical graphics processing chip (GPU) soldered onto a server motherboard.' },
      { id: 'c', text: 'A basic unit of text (such as a word, syllable, or character fragment) that an AI processes mathematically.' },
      { id: 'd', text: 'A CSS property used to apply shadows to button components.' },
    ],
    points: 20,
    correct_option_id: 'c',
    explanation: 'Tokens are the fundamental building blocks of text processed by LLMs. Words are split into numerical tokens that allow the neural network to compute mathematical embeddings and predict subsequent outputs.',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000013',
    question_text: 'Which prompt engineering technique produces the most accurate and reliable answers from an AI assistant?',
    options: [
      { id: 'a', text: 'Typing a single ambiguous word in ALL CAPS with zero background instructions.' },
      { id: 'b', text: 'Providing clear persona framing, explicit operational constraints, required output schemas, and concrete reference examples (Few-Shot Prompting).' },
      { id: 'c', text: 'Expecting the model to infer requirements without providing any text input.' },
      { id: 'd', text: 'Entering unencrypted passwords and private API keys into public prompts.' },
    ],
    points: 20,
    correct_option_id: 'b',
    explanation: 'Giving models explicit role context, step-by-step reasoning constraints, and concrete few-shot examples drastically reduces ambiguity and primes the model for high-fidelity responses.',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000014',
    question_text: 'What does it mean when an Artificial Intelligence model "hallucinates"?',
    options: [
      { id: 'a', text: 'The computer monitor hardware begins glowing neon colors and overheating.' },
      { id: 'b', text: 'The AI generates factually incorrect, ungrounded, or fabricated information presented with high linguistic confidence.' },
      { id: 'c', text: 'The operating system automatically uninstalls the web browser.' },
      { id: 'd', text: 'The computer speaker plays random sound effects due to low battery.' },
    ],
    points: 20,
    correct_option_id: 'b',
    explanation: 'Hallucinations happen because LLMs generate text based on statistical probability distributions rather than absolute truth retrieval. Developers must employ Grounding, RAG, and human verification to catch factual errors.',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000015',
    question_text: 'When using modern digital tools and AI applications, why is digital privacy and data security crucial?',
    options: [
      { id: 'a', text: 'Because sensitive personal data (passwords, health records, identity details) can be compromised, misused, or leaked if not safeguarded with encryption and access controls.' },
      { id: 'b', text: 'Because privacy settings reduce the physical screen brightness of laptops.' },
      { id: 'c', text: 'Because computers cannot process JavaScript code without public passwords.' },
      { id: 'd', text: 'Privacy does not matter because all digital data on the internet is already public domain.' },
    ],
    points: 20,
    correct_option_id: 'a',
    explanation: 'Enforcing strict data privacy (like Supabase Row Level Security and TLS encryption) prevents identity theft, data breaches, and unauthorized exploitation of sensitive personal information.',
  },
];

export default function StudentQuizPage() {
  const [allowBacktrack, setAllowBacktrack] = useState(false);
  const [passingThreshold, setPassingThreshold] = useState(70);
  const [submissionFeedback, setSubmissionFeedback] = useState<{
    message: string;
    passed: boolean;
    score: number;
    enrolmentUpdated: boolean;
    certificateDownloadUrl?: string;
  } | null>(null);

  const [activeQuizId] = useState('a0000000-0000-0000-0000-000000000002');
  const [keyReset, setKeyReset] = useState(0);

  const handleSubmitAttempt = async (answers: Record<string, string>, timeSpent: number) => {
    try {
      // 1. Submit quiz answers to backend evaluation endpoint
      const res = await fetch('/api/assessments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: activeQuizId,
          answers,
          timeSpentSeconds: timeSpent,
          studentId: 's0000000-0000-0000-0000-000000000001',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit quiz attempt.');
      }

      const evalData = data.data;

      // 2. If student passed, trigger automated certificate generation
      let certDownloadUrl: string | undefined;
      if (evalData.passed) {
        try {
          const certRes = await fetch('/api/certificates/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              enrolmentId: 'e0000000-0000-0000-0000-000000000001',
              studentName: 'Liam Chen',
              courseTitle: 'AI Micro Degree',
              graduationDate: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }),
            }),
          });

          const certJson = await certRes.json();
          if (certRes.ok && certJson.data) {
            certDownloadUrl = `/api/certificates/download/e0000000-0000-0000-0000-000000000001`;
          }
        } catch (certErr) {
          console.warn('Certificate generation trigger note:', certErr);
        }
      }

      setSubmissionFeedback({
        message: data.message,
        passed: evalData.passed,
        score: evalData.scorePercentage,
        enrolmentUpdated: evalData.enrollmentUpdated,
        certificateDownloadUrl: certDownloadUrl || (evalData.passed ? `/api/certificates/download/e0000000-0000-0000-0000-000000000001` : undefined),
      });
    } catch (err) {
      console.error('Quiz submission error:', err);
    }
  };

  const handleRetryQuiz = () => {
    setSubmissionFeedback(null);
    setKeyReset((prev) => prev + 1);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Backend Submission Live Feedback Banner */}
      {submissionFeedback && (
        <div
          className={`p-5 rounded-3xl border shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in ${
            submissionFeedback.passed
              ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-emerald-500/80 text-white'
              : 'bg-gradient-to-r from-slate-950 via-amber-950 to-slate-950 border-amber-500/80 text-white'
          }`}
        >
          <div className="flex items-center space-x-3">
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                submissionFeedback.passed ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-slate-950'
              }`}
            >
              {submissionFeedback.passed ? '✓' : '!'}
            </span>
            <div>
              <p className="font-bold text-sm sm:text-base">
                {submissionFeedback.passed
                  ? `🎉 Assessment Passed: ${submissionFeedback.score}% Score • Marked as Graduated!`
                  : `Milestone Incomplete: ${submissionFeedback.score}% (Passing Threshold: ${passingThreshold}%)`}
              </p>
              <p className="text-xs text-slate-300 mt-0.5">
                {submissionFeedback.passed
                  ? 'Your course enrollment has been updated to Graduated (100% progress) and an official certificate has been generated.'
                  : 'Your course enrollment remains "In-Progress". Review the pedagogical feedback below and try again.'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-end sm:self-auto flex-shrink-0">
            {submissionFeedback.passed && submissionFeedback.certificateDownloadUrl && (
              <a
                href={submissionFeedback.certificateDownloadUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <span>📜 Download PDF Certificate</span>
              </a>
            )}
            {!submissionFeedback.passed && (
              <button
                type="button"
                onClick={handleRetryQuiz}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                🔄 Retry Quiz
              </button>
            )}
            <button
              onClick={() => setSubmissionFeedback(null)}
              className="text-slate-400 hover:text-white text-base font-bold p-1 cursor-pointer"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Top Breadcrumb & Controls Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2 text-xs">
          <Link href="/dashboard/student" className="text-slate-500 hover:text-slate-800 font-medium">
            &larr; Student Hub
          </Link>
          <span className="text-slate-300">/</span>
          <span className="font-bold text-slate-800">AI Micro Degree Assessment</span>
        </div>

        {/* Assessment Settings Toggle */}
        <div className="flex items-center space-x-4 text-xs">
          <label className="flex items-center space-x-2 cursor-pointer text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={allowBacktrack}
              onChange={(e) => setAllowBacktrack(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Allow Backtracking</span>
          </label>

          <div className="flex items-center space-x-1.5 text-slate-600">
            <span>Passing Threshold:</span>
            <select
              value={passingThreshold}
              onChange={(e) => setPassingThreshold(Number(e.target.value))}
              className="px-2 py-1 rounded-lg bg-slate-50 border border-slate-300 font-bold text-slate-900"
            >
              <option value={60}>60%</option>
              <option value={70}>70%</option>
              <option value={75}>75%</option>
              <option value={80}>80%</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quiz Engine Interactive Component */}
      <QuizEngine
        key={keyReset}
        title="Introduction to AI and Digital Skills"
        courseTitle="AI Micro Degree (GlobeSkill & IBM SkillsBuild)"
        questions={AI_DIGITAL_SKILLS_QUESTIONS}
        durationMinutes={25}
        passingScore={passingThreshold}
        allowBacktracking={allowBacktrack}
        onSubmit={handleSubmitAttempt}
        onCancel={() => window.history.back()}
      />
    </div>
  );
}
