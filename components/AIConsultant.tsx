import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { QUERY_SUGGESTIONS } from '../constants';
import { askGemini } from '../services/geminiService';
import { ChatMessage } from '../types';

interface AIConsultantProps {
  onPromptSubmitted?: (prompt: string) => void;
}

export interface AIConsultantHandle {
  triggerSearch: (prompt: string) => Promise<void>;
}

const createMessage = (role: 'user' | 'model', text: string, extras?: Partial<ChatMessage>): ChatMessage => {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    role,
    text,
    createdAt: Date.now(),
    ...extras,
  };
};

const INITIAL_MESSAGE = createMessage(
  'model',
  'Consultor fiscal online. Posso analisar ICMS, FCP/FECOP, ISS municipal e cota-parte com fontes oficiais.',
);

const AIConsultant = forwardRef<AIConsultantHandle, AIConsultantProps>(({ onPromptSubmitted }, ref) => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const runPrompt = async (prompt: string, historySnapshot: ChatMessage[]) => {
    setIsLoading(true);

    try {
      const response = await askGemini(prompt, historySnapshot);
      setMessages((prev) => [...prev, response]);
    } finally {
      setIsLoading(false);
    }
  };

  const submitPrompt = async (text: string): Promise<void> => {
    const prompt = text.trim();
    if (!prompt || isLoading) return;

    const userMessage = createMessage('user', prompt);
    const historySnapshot = [...messages, userMessage];

    setMessages(historySnapshot);
    setInput('');
    onPromptSubmitted?.(prompt);
    await runPrompt(prompt, historySnapshot);
  };

  const copyMessage = async (message: ChatMessage) => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopiedId(message.id);
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch (error) {
      console.error('Clipboard error:', error);
    }
  };

  useImperativeHandle(ref, () => ({
    triggerSearch: submitPrompt,
  }));

  return (
    <section className="panel consultant-panel" aria-labelledby="consultant-title">
      <header className="panel__header consultant-header">
        <div>
          <h2 id="consultant-title">Consultor Fiscal com IA</h2>
          <p>Com grounding em fontes oficiais para suporte analitico.</p>
        </div>
        <button
          type="button"
          onClick={() => setMessages([INITIAL_MESSAGE])}
          disabled={isLoading}
        >
          Nova conversa
        </button>
      </header>

      <div className="chat-feed" ref={scrollRef} role="log" aria-live="polite" aria-busy={isLoading}>
        {messages.map((message) => (
          <article
            key={message.id}
            className={`chat-message ${message.role === 'user' ? 'chat-message--user' : 'chat-message--model'} ${
              message.isError ? 'chat-message--error' : ''
            }`}
          >
            <div className="chat-message__content">
              <p>{message.text}</p>
              {message.role === 'model' && (
                <button
                  type="button"
                  className="copy-button"
                  onClick={() => void copyMessage(message)}
                  aria-label="Copiar resposta"
                >
                  {copiedId === message.id ? 'Copiado' : 'Copiar'}
                </button>
              )}
            </div>

            {message.sources && message.sources.length > 0 && (
              <ul className="sources-list" aria-label="Fontes utilizadas">
                {message.sources.map((source) => (
                  <li key={`${message.id}-${source.uri}`}>
                    <a href={source.uri} target="_blank" rel="noreferrer noopener">
                      {source.title}
                    </a>
                    {source.snippet && <span>{source.snippet}</span>}
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}

        {isLoading && (
          <article className="chat-message chat-message--model" role="status">
            <p>Consultando bases oficiais...</p>
          </article>
        )}
      </div>

      <div className="suggestions-row" aria-label="Sugestoes de perguntas">
        {QUERY_SUGGESTIONS.map((suggestion) => (
          <button key={suggestion} type="button" onClick={() => void submitPrompt(suggestion)} disabled={isLoading}>
            {suggestion}
          </button>
        ))}
      </div>

      <form
        className="chat-form"
        onSubmit={(event) => {
          event.preventDefault();
          void submitPrompt(input);
        }}
      >
        <label htmlFor="consultant-input" className="sr-only">
          Digite sua pergunta
        </label>
        <input
          id="consultant-input"
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ex: Compare ICMS de SP e RJ com foco em FCP"
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim()}>
          Enviar
        </button>
      </form>
    </section>
  );
});

AIConsultant.displayName = 'AIConsultant';

export default AIConsultant;
