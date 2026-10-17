import React, { useEffect, useState } from 'react';
import { Square, Volume2 } from 'lucide-react';
import { useAccessibility } from '@/context/AccessibilityContext';

/**
 * "Listen to this page" (WEB-MLS-5): reads the text of an element aloud with the browser's speech synthesis, for
 * readers with low literacy or low vision. Hidden where the browser has no speech synthesis.
 */
export const ReadAloud: React.FC<{ targetId: string }> = ({ targetId }) => {
  const { t, language } = useAccessibility();
  const [speaking, setSpeaking] = useState(false);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Stop reading when the reader leaves the page or section.
  useEffect(() => () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }, [targetId]);

  if (!supported) return null;

  const toggle = () => {
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const text = (document.getElementById(targetId)?.innerText ?? '').replace(/\s+/g, ' ').trim().slice(0, 20000);
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    // Most page text is English; Devanagari text is read with a Hindi or Marathi voice.
    const devanagari = (text.match(/[ऀ-ॿ]/g)?.length ?? 0) > text.length / 3;
    utterance.lang = devanagari ? (language === 'mr' ? 'mr-IN' : 'hi-IN') : 'en-IN';
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    synth.cancel();
    synth.speak(utterance);
    setSpeaking(true);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={speaking}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-link hover:bg-slate-50"
    >
      {speaking ? <Square className="h-4 w-4" aria-hidden="true" /> : <Volume2 className="h-4 w-4" aria-hidden="true" />}
      {speaking ? t('listen.stop') : t('listen.start')}
    </button>
  );
};
