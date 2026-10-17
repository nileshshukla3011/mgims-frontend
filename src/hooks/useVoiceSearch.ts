import { useCallback, useEffect, useRef, useState } from 'react';
import { Language } from '@/types';

// Minimal typing for the Web Speech API, which TypeScript's DOM lib does not include.
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

const getRecognition = (): SpeechRecognitionCtor | undefined => {
  const w = window as unknown as { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
};

const LOCALES: Record<Language, string> = { en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN' };

/** Voice input for search (UX4G 6.3.7). Hidden in browsers without speech recognition. */
export const useVoiceSearch = (language: Language, onResult: (text: string) => void) => {
  const Recognition = typeof window !== 'undefined' ? getRecognition() : undefined;
  const [listening, setListening] = useState(false);
  const [error, setError] = useState('');
  const ref = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => () => ref.current?.stop(), []);

  const toggle = useCallback(() => {
    if (!Recognition) return;
    if (listening) {
      ref.current?.stop();
      return;
    }
    const rec = new Recognition();
    rec.lang = LOCALES[language];
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => onResult(e.results[0][0].transcript);
    rec.onerror = (e) => setError(e.error === 'not-allowed' ? 'Microphone permission was denied.' : 'Voice search did not catch that. Please try again.');
    rec.onend = () => setListening(false);
    ref.current = rec;
    setError('');
    setListening(true);
    rec.start();
  }, [Recognition, listening, language, onResult]);

  return { supported: Boolean(Recognition), listening, error, toggle };
};
