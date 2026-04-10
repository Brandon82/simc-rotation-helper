import { useState, useRef, useEffect } from 'react';
import { useSpecs } from '../hooks/useSpecs';
import { useQaKeyStore } from '../store/qaKeyStore';
import { askQuestion, validateQaKey } from '../api/client';
import { Markdown } from '../components/qa/Markdown';
import { specIconUrl, classIconUrl } from '../utils/wowIcons';
import { useThemeStore } from '../store/themeStore';
import { CLASS_COLORS_DARK, CLASS_COLORS_LIGHT } from '../utils/classColors';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

const SUGGESTED_QUESTIONS = [
  'What is the basic rotation priority?',
  'When should I use my cooldowns?',
  'What stats should I prioritize?',
  'How does AoE change the rotation?',
];

export function AskAiPage() {
  const { data, isLoading: specsLoading } = useSpecs();
  const { qaKey, setKey, clearKey } = useQaKeyStore();
  const isDark = useThemeStore((s) => s.isDark);
  const CLASS_COLORS = isDark ? CLASS_COLORS_DARK : CLASS_COLORS_LIGHT;

  const [specName, setSpecName] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [keyError, setKeyError] = useState('');
  const [validatingKey, setValidatingKey] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prevSpecRef = useRef(specName);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Reset chat when switching specs
  useEffect(() => {
    if (prevSpecRef.current !== specName) {
      setMessages([]);
      setQuestion('');
      prevSpecRef.current = specName;
    }
  }, [specName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectedSpec = data?.classes
    .flatMap(cls => cls.specs)
    .find(s => s.name === specName);

  const selectedClassName = data?.classes
    .find(cls => cls.specs.some(s => s.name === specName))?.name ?? '';

  // Close dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setDropdownSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (dropdownOpen) searchInputRef.current?.focus();
  }, [dropdownOpen]);

  const handleValidateKey = async () => {
    if (!keyInput.trim()) return;
    setValidatingKey(true);
    setKeyError('');
    try {
      const { valid } = await validateQaKey(keyInput.trim());
      if (valid) {
        setKey(keyInput.trim());
        setKeyInput('');
      } else {
        setKeyError('Invalid API key');
      }
    } catch {
      setKeyError('Failed to validate key');
    } finally {
      setValidatingKey(false);
    }
  };

  const handleAsk = async () => {
    const q = question.trim();
    if (!q || loading || !specName) return;

    setMessages(prev => [...prev, { role: 'user', text: q }]);
    setQuestion('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setLoading(true);

    try {
      const { answer } = await askQuestion(specName, q, qaKey);
      setMessages(prev => [...prev, { role: 'ai', text: answer }]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to get answer';
      setMessages(prev => [...prev, { role: 'ai', text: `Error: ${message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 144)}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const handleSuggestedQuestion = (q: string) => {
    setQuestion(q);
    // Focus textarea so user can edit or just hit enter
    textareaRef.current?.focus();
  };

  const inChat = !!(specName && qaKey);

  return (
    /* Undo Layout padding to fill full height. 3.5rem = header h-14 */
    <div className="-m-6 -mb-24 h-[calc(100dvh-3.5rem)] flex flex-col">

      {/* ── Header bar — only in chat ── */}
      {inChat && (
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-200 dark:border-gray-800/60 bg-white dark:bg-gray-950 shrink-0">
        {/* Spec selector */}
        <div ref={dropdownRef} className="relative flex-1 min-w-0">
          <button
            onClick={() => { if (!specsLoading) { setDropdownOpen(o => !o); setDropdownSearch(''); } }}
            disabled={specsLoading}
            className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white cursor-pointer disabled:opacity-50 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            {selectedSpec ? (
              <>
                <img src={specIconUrl(specName, 'medium')} alt="" className="w-6 h-6 rounded shrink-0" />
                <span style={{ color: CLASS_COLORS[selectedClassName] }}>{selectedSpec.label}</span>
              </>
            ) : (
              <span className="text-gray-400 dark:text-gray-500">Select a spec...</span>
            )}
            <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Dropdown panel */}
          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-72 max-h-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-50">
              {/* Search */}
              <div className="p-2 border-b border-gray-200 dark:border-gray-800">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={dropdownSearch}
                  onChange={e => setDropdownSearch(e.target.value)}
                  placeholder="Search specs..."
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                />
              </div>
              {/* Options */}
              <div className="overflow-y-auto max-h-64 py-1">
                {data?.classes.map(cls => {
                  const availableSpecs = cls.specs.filter(s => s.hasGuide);
                  if (availableSpecs.length === 0) return null;
                  const q = dropdownSearch.toLowerCase();
                  const matchingSpecs = q
                    ? availableSpecs.filter(s => s.label.toLowerCase().includes(q) || cls.label.toLowerCase().includes(q))
                    : availableSpecs;
                  if (matchingSpecs.length === 0) return null;
                  return (
                    <div key={cls.name}>
                      <div className="flex items-center gap-1.5 px-3 pt-2 pb-1">
                        <img src={classIconUrl(cls.name, 'small')} alt="" className="w-3.5 h-3.5 rounded-sm" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: CLASS_COLORS[cls.name] }}>
                          {cls.label}
                        </span>
                      </div>
                      {matchingSpecs.map(spec => (
                        <button
                          key={spec.name}
                          onClick={() => { setSpecName(spec.name); setDropdownOpen(false); setDropdownSearch(''); }}
                          className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-left transition-colors ${
                            spec.name === specName
                              ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          <img src={specIconUrl(spec.name, 'small')} alt="" className="w-4 h-4 rounded-sm shrink-0" />
                          <span className="truncate">{spec.label}</span>
                          {spec.name === specName && (
                            <svg className="w-3.5 h-3.5 ml-auto text-indigo-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              New chat
            </button>
          )}
          {qaKey && (
            <button
              onClick={clearKey}
              className="text-xs text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
            >
              Disconnect
            </button>
          )}
        </div>
      </div>
      )}

      {/* ── Middle zone ── */}
      {!qaKey ? (
        /* API key gate */
        <div className="flex-1 flex items-center justify-center -mt-[8vh]">
          <div className="w-full max-w-sm px-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/40 flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-500 dark:text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h3 className="text-center text-sm font-semibold text-gray-900 dark:text-white mb-1">
                Enter your API key
              </h3>
              <p className="text-center text-xs text-gray-500 dark:text-gray-400 mb-4">
                An API key is required to use this feature.
              </p>
              <div className="space-y-3">
                <input
                  type="password"
                  value={keyInput}
                  onChange={e => { setKeyInput(e.target.value); setKeyError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleValidateKey()}
                  placeholder="qa_..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
                />
                <button
                  onClick={handleValidateKey}
                  disabled={validatingKey || !keyInput.trim()}
                  className="w-full px-3 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {validatingKey ? 'Checking...' : 'Unlock'}
                </button>
                {keyError && <p className="text-xs text-red-500 text-center">{keyError}</p>}
              </div>
            </div>
          </div>
        </div>
      ) : !specName ? (
        /* No spec selected — show centered spec picker */
        <div className="flex-1 flex items-center justify-center -mt-[8vh]">
          <div className="text-center px-4 w-full max-w-sm">
            <svg className="w-10 h-10 mx-auto mb-3 text-indigo-400 dark:text-indigo-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Select a spec</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Choose a spec to start asking questions.</p>
            {/* Inline search + spec list */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden text-left">
              <div className="p-2 border-b border-gray-200 dark:border-gray-800">
                <input
                  type="text"
                  value={dropdownSearch}
                  onChange={e => setDropdownSearch(e.target.value)}
                  placeholder="Search specs..."
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                />
              </div>
              <div className="overflow-y-auto max-h-[142px] py-1">
                {data?.classes.map(cls => {
                  const availableSpecs = cls.specs.filter(s => s.hasGuide);
                  if (availableSpecs.length === 0) return null;
                  const q = dropdownSearch.toLowerCase();
                  const matchingSpecs = q
                    ? availableSpecs.filter(s => s.label.toLowerCase().includes(q) || cls.label.toLowerCase().includes(q))
                    : availableSpecs;
                  if (matchingSpecs.length === 0) return null;
                  return (
                    <div key={cls.name}>
                      <div className="flex items-center gap-1.5 px-3 pt-2 pb-1">
                        <img src={classIconUrl(cls.name, 'small')} alt="" className="w-3.5 h-3.5 rounded-sm" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: CLASS_COLORS[cls.name] }}>
                          {cls.label}
                        </span>
                      </div>
                      {matchingSpecs.map(spec => (
                        <button
                          key={spec.name}
                          onClick={() => { setSpecName(spec.name); setDropdownSearch(''); }}
                          className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <img src={specIconUrl(spec.name, 'small')} alt="" className="w-4 h-4 rounded-sm shrink-0" />
                          <span className="truncate">{spec.label}</span>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : messages.length === 0 ? (
        /* Welcome state with suggested questions */
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-4 max-w-md">
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-indigo-100 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/40 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-500 dark:text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Ask about {selectedSpec?.label ?? 'this rotation'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Get AI-powered answers about the priority list, cooldown usage, and more.
            </p>
            <div className="grid gap-2">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestedQuestion(q)}
                  className="text-left text-sm px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 text-gray-700 dark:text-gray-300 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Messages thread */
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'ai' && (
                  <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 mt-1">
                    <svg className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm'
                  }`}
                >
                  {msg.role === 'ai' ? <Markdown text={msg.text} /> : msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 mt-1">
                  <svg className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3">
                  <span className="inline-flex gap-1 text-gray-400">
                    <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* ── Input bar ── */}
      {inChat && (
        <div className="shrink-0 border-t border-gray-200 dark:border-gray-800/60 bg-white dark:bg-gray-950 px-4 py-3">
          <div className="max-w-2xl mx-auto">
            <div className="relative flex items-end bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
              <textarea
                ref={textareaRef}
                value={question}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask about this rotation..."
                disabled={loading}
                maxLength={1000}
                rows={1}
                className="flex-1 bg-transparent px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none max-h-36 disabled:opacity-50"
              />
              <button
                onClick={handleAsk}
                disabled={loading || !question.trim()}
                className="p-2 m-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
                title="Send"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
              </button>
            </div>
            <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-2">
              Answers are AI-generated from the APL data
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
