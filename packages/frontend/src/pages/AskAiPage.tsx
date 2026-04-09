import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSpecs } from '../hooks/useSpecs';
import { useQaKeyStore } from '../store/qaKeyStore';
import { askQuestion, validateQaKey } from '../api/client';
import { Markdown } from '../components/qa/Markdown';
import { specIconUrl } from '../utils/wowIcons';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

export function AskAiPage() {
  const { data, isLoading: specsLoading } = useSpecs();
  const { qaKey, setKey, clearKey } = useQaKeyStore();

  const [specName, setSpecName] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [keyError, setKeyError] = useState('');
  const [validatingKey, setValidatingKey] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevSpecRef = useRef(specName);

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

  // Look up the selected spec's label from the specs data
  const selectedSpec = data?.classes
    .flatMap(cls => cls.specs)
    .find(s => s.name === specName);

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

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="mb-6">
        <Link to="/" className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
          ← All classes
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">Ask AI</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Ask questions about any spec's rotation guide.
        </p>
      </div>

      {/* Spec selector */}
      <div className="mb-6">
        <label htmlFor="spec-select" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
          Select a spec
        </label>
        <div className="flex items-center gap-3">
          {selectedSpec && (
            <img
              src={specIconUrl(specName, 'medium')}
              alt={selectedSpec.label}
              className="w-8 h-8 rounded-lg shrink-0"
            />
          )}
          <select
            id="spec-select"
            value={specName}
            onChange={e => setSpecName(e.target.value)}
            disabled={specsLoading}
            className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 disabled:opacity-50 appearance-none cursor-pointer"
          >
            <option value="">Select a spec...</option>
            {data?.classes.map(cls => {
              const availableSpecs = cls.specs.filter(s => s.hasGuide);
              if (availableSpecs.length === 0) return null;
              return (
                <optgroup key={cls.name} label={cls.label}>
                  {availableSpecs.map(spec => (
                    <option key={spec.name} value={spec.name}>
                      {spec.label}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </div>
      </div>

      {/* Chat area — only when a spec is selected */}
      {specName && (
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900">
          <div className="px-4 py-4">
            {/* Key entry gate */}
            {!qaKey ? (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Enter your API key to ask questions about this rotation.
                </p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={keyInput}
                    onChange={e => { setKeyInput(e.target.value); setKeyError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleValidateKey()}
                    placeholder="qa_..."
                    className="flex-1 px-3 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleValidateKey}
                    disabled={validatingKey || !keyInput.trim()}
                    className="px-3 py-1.5 text-xs font-medium rounded bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {validatingKey ? 'Checking...' : 'Unlock'}
                  </button>
                </div>
                {keyError && <p className="text-xs text-red-500">{keyError}</p>}
              </div>
            ) : (
              <>
                {/* Messages */}
                {messages.length > 0 && (
                  <div className="mb-3 space-y-2 max-h-[60vh] overflow-y-auto">
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[85%] rounded-lg px-3 py-2 text-xs ${
                            msg.role === 'user'
                              ? 'bg-amber-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                          }`}
                        >
                          {msg.role === 'ai' ? (
                            <Markdown text={msg.text} />
                          ) : (
                            msg.text
                          )}
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 text-xs text-gray-500">
                          <span className="inline-flex gap-1">
                            <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                            <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                            <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                          </span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}

                {/* Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleAsk()}
                    placeholder="Ask about this rotation..."
                    disabled={loading}
                    maxLength={1000}
                    className="flex-1 px-3 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50"
                  />
                  <button
                    onClick={handleAsk}
                    disabled={loading || !question.trim()}
                    className="px-3 py-1.5 text-xs font-medium rounded bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Ask
                  </button>
                </div>

                {/* Footer */}
                <div className="mt-2 flex justify-between items-center">
                  <p className="text-xs text-gray-400">Answers are AI-generated from the APL data</p>
                  <div className="flex items-center gap-3">
                    {messages.length > 0 && (
                      <button
                        onClick={() => setMessages([])}
                        className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        New chat
                      </button>
                    )}
                    <button
                      onClick={clearKey}
                      className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!specName && !specsLoading && (
        <div className="text-center py-12 text-gray-400 dark:text-gray-600">
          <svg className="w-8 h-8 mx-auto mb-3 text-amber-300 dark:text-amber-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <p className="text-sm">Select a spec above to start asking questions.</p>
        </div>
      )}
    </div>
  );
}
