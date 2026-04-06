import { useState, useRef, useEffect } from 'react';
import { useQaKeyStore } from '../../store/qaKeyStore';
import { askQuestion, validateQaKey } from '../../api/client';
import { InlineMarkdown } from '../guide/InlineMarkdown';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

export function QAPanel({ specName }: { specName: string }) {
  const { qaKey, setKey, clearKey } = useQaKeyStore();
  const [isOpen, setIsOpen] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [keyError, setKeyError] = useState('');
  const [validatingKey, setValidatingKey] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    if (!q || loading) return;

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
    <div className="mt-8 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="text-sm font-medium text-gray-900 dark:text-white">Ask AI About This Rotation</span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="p-4 bg-white dark:bg-gray-950">
          {/* Key entry gate */}
          {!qaKey ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enter your API key to ask questions about this rotation.
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={keyInput}
                  onChange={e => { setKeyInput(e.target.value); setKeyError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleValidateKey()}
                  placeholder="qa_..."
                  className="flex-1 px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  onClick={handleValidateKey}
                  disabled={validatingKey || !keyInput.trim()}
                  className="px-4 py-2 text-sm font-medium rounded bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                <div className="mb-4 space-y-3 max-h-96 overflow-y-auto">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                          msg.role === 'user'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        {msg.role === 'ai' ? (
                          <div className="space-y-2">
                            {msg.text.split('\n\n').map((paragraph, pi) => (
                              <p key={pi}>
                                <InlineMarkdown text={paragraph} />
                              </p>
                            ))}
                          </div>
                        ) : (
                          msg.text
                        )}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm text-gray-500">
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
                  className="flex-1 px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                />
                <button
                  onClick={handleAsk}
                  disabled={loading || !question.trim()}
                  className="px-4 py-2 text-sm font-medium rounded bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Ask
                </button>
              </div>

              {/* Footer */}
              <div className="mt-2 flex justify-between items-center">
                <p className="text-xs text-gray-400">Answers are AI-generated from the APL data</p>
                <button
                  onClick={clearKey}
                  className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
