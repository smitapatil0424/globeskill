'use client';

import React, { useState, useRef, useEffect } from 'react';

export interface ChatMessageItem {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface AIChatProps {
  courseContext?: string;
}

const INITIAL_MESSAGES: ChatMessageItem[] = [
  {
    id: 'msg-welcome',
    sender: 'assistant',
    text: 'Hello! I am your **GlobeSkill AI Technical Mentor**. Ask me any technical questions regarding React 19, Supabase RLS, course milestones, or certification!',
    timestamp: 'Just now',
  },
];

const DEFAULT_PROMPTS = [
  'Explain React 19 Server Actions',
  'How does Supabase RLS work?',
  'How do I earn my Certificate?',
  'What is the AI Micro Degree curriculum?',
];

export default function AIChat({ courseContext = 'Frontend & AI Skilling Track' }: AIChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageItem[]>(INITIAL_MESSAGES);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>(DEFAULT_PROMPTS);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const messageCounter = useRef(1);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim();
    if (!text || isLoading) return;

    const userCount = messageCounter.current++;
    const userMessage: ChatMessageItem = {
      id: `msg-user-${userCount}`,
      sender: 'user',
      text,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          courseContext,
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || 'Failed to fetch AI response.');
      }

      const aiCount = messageCounter.current++;
      const aiMessage: ChatMessageItem = {
        id: `msg-ai-${aiCount}`,
        sender: 'assistant',
        text: json.reply || 'I received your question. How else can I assist with your course progress?',
        timestamp: 'Just now',
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (json.suggestedFollowUps && json.suggestedFollowUps.length > 0) {
        setSuggestedPrompts(json.suggestedFollowUps);
      }
    } catch (err) {
      console.error('AI chat error:', err);
      const errCount = messageCounter.current++;
      const errorMessage: ChatMessageItem = {
        id: `msg-err-${errCount}`,
        sender: 'assistant',
        text: '⚠️ I encountered an issue connecting to the AI tutor service. Please check your network and try again.',
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    setMessages(INITIAL_MESSAGES);
    setSuggestedPrompts(DEFAULT_PROMPTS);
  };

  // Simple Markdown formatter for bold text and code snippets
  const renderFormattedText = (rawText: string) => {
    return rawText.split('\n').map((line, lineIdx) => {
      // Code block lines
      if (line.startsWith('```')) {
        return (
          <div key={lineIdx} className="my-1 py-1 px-2 rounded-md bg-slate-900 text-indigo-300 font-mono text-[11px]">
            {line.replace(/```[a-z]*/, '')}
          </div>
        );
      }

      // Format bold text
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={lineIdx} className={lineIdx > 0 ? 'mt-1.5' : ''}>
          {parts.map((part, partIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={partIdx} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <>
      {/* 1. FLOATING AI ASSISTANT TRIGGER BUTTON */}
      {!isOpen && (
        <button
          id="open-ai-chat-btn"
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-2xl shadow-indigo-600/40 border border-white/20 flex items-center space-x-2 transition-all duration-200 transform hover:scale-105 cursor-pointer animate-fade-in"
          aria-label="Open GlobeSkill AI Assistant"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-base">✨</span>
          <span>Ask GlobeSkill AI</span>
        </button>
      )}

      {/* 2. SLIDE-OUT BACKDROP OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs transition-opacity animate-fade-in"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 3. SLIDE-OUT DRAWER PANEL (RIGHT-ALIGNED) */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="GlobeSkill AI Technical Assistant"
        className={`fixed inset-y-0 right-0 z-50 w-full sm:max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Panel Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-lg shadow-inner">
              ✨
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm text-white">GlobeSkill AI Tutor</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-[10px]">
                  Online
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                {courseContext}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleClearHistory}
              title="Clear Conversation"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs transition-colors cursor-pointer"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-base font-bold transition-colors cursor-pointer"
              aria-label="Close Chat"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Suggested Prompt Chips */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center space-x-1.5 overflow-x-auto text-[11px] scrollbar-none">
          <span className="text-slate-400 font-semibold flex-shrink-0 text-[10px] uppercase">
            Suggested:
          </span>
          {suggestedPrompts.slice(0, 3).map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 font-medium whitespace-nowrap transition-colors flex-shrink-0 cursor-pointer shadow-2xs"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Conversational Bubbles Window */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/50">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-2.5 ${
                  isUser ? 'flex-row-reverse space-x-reverse' : ''
                } animate-fade-in`}
              >
                {/* Avatar Badge */}
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    isUser
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-xs'
                  }`}
                >
                  {isUser ? 'U' : '✨'}
                </div>

                {/* Speech Bubble */}
                <div
                  className={`max-w-[82%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-none font-medium'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}
                >
                  <div className="break-words">
                    {isUser ? msg.text : renderFormattedText(msg.text)}
                  </div>
                  <span
                    className={`block text-[10px] mt-1.5 ${
                      isUser ? 'text-indigo-200 text-right' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Loading Indicator (Pulsing Dots) */}
          {isLoading && (
            <div className="flex items-start space-x-2.5 animate-fade-in">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center text-xs flex-shrink-0">
                ✨
              </div>
              <div className="p-3.5 rounded-2xl rounded-tl-none bg-white border border-slate-200 shadow-xs flex items-center space-x-1.5">
                <span className="text-xs text-slate-500 font-medium mr-1.5">
                  Thinking
                </span>
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Box & Controls */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputQuery}
              disabled={isLoading}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about React, RLS, assessments..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex-shrink-0 shadow-md shadow-indigo-600/30"
              aria-label="Send message"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
          <span className="text-[10px] text-slate-400 text-center block mt-1.5">
            Powered by GlobeSkill AI &bull; Press Enter to send
          </span>
        </div>
      </aside>
    </>
  );
}
