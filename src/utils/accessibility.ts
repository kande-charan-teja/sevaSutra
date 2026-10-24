export interface SpeechSynthesisResult {
  supported: boolean;
  message: string;
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const win = window as unknown as Record<string, unknown>;
  return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
}

export function speakTextAloud(
  text: string,
  lang: 'en' | 'te' = 'en',
  onEnd?: () => void
): SpeechSynthesisResult {
  if (!isSpeechSynthesisSupported()) {
    if (onEnd) onEnd();
    return {
      supported: false,
      message: 'Browser speech synthesis is unavailable in this environment; displaying visual read-aloud transcript banner instead.',
    };
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'te' ? 'te-IN' : 'en-IN';
    utterance.rate = 0.95;
    utterance.onend = () => {
      if (onEnd) onEnd();
    };
    utterance.onerror = () => {
      if (onEnd) onEnd();
    };
    window.speechSynthesis.speak(utterance);
    return {
      supported: true,
      message: `Reading aloud: "${text}"`,
    };
  } catch {
    if (onEnd) onEnd();
    return {
      supported: false,
      message: 'Speech playback fallback: showing full spoken transcript on screen.',
    };
  }
}

export function stopSpeakingAloud(): void {
  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}

export function startBrowserVoiceInput(
  onTranscript: (transcript: string) => void,
  onStatus: (statusMessage: string) => void
): void {
  if (!isSpeechRecognitionSupported()) {
    onStatus(
      'Voice recognition is not supported by this browser environment. Please use the accessible text buttons or simulated voice command buttons below.'
    );
    return;
  }

  try {
    const win = window as unknown as {
      SpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        maxAlternatives: number;
        onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
        onerror: () => void;
        start: () => void;
      };
      webkitSpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        maxAlternatives: number;
        onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
        onerror: () => void;
        start: () => void;
      };
    };
    const RecognitionCtor = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!RecognitionCtor) {
      onStatus('Voice recognition unavailable. Use text controls.');
      return;
    }
    const recognition = new RecognitionCtor();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    onStatus('Listening for voice command... (or click any text alternative button)');
    recognition.onresult = (event) => {
      const text = event.results?.[0]?.[0]?.transcript || '';
      onTranscript(text);
      onStatus(`Heard voice input: "${text}"`);
    };
    recognition.onerror = () => {
      onStatus('Voice microphone input unavailable in headless/sandboxed view. Use the one-tap text command buttons.');
    };
    recognition.start();
  } catch {
    onStatus('Voice input fallback active — use text alternatives.');
  }
}
