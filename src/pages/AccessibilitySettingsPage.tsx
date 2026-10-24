import React, { useState } from 'react';
import {
  Eye,
  Globe,
  Mic,
  PauseCircle,
  PlayCircle,
  Sliders,
  Type,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useSevaSutra } from '../context/SevaSutraContext';
import {
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  startBrowserVoiceInput,
} from '../utils/accessibility';

export const AccessibilitySettingsPage: React.FC = () => {
  const {
    accessibility,
    updateAccessibility,
    setLanguage,
    speakText,
    stopSpeech,
    isOfflineSimulated,
    simulateConnectivityLoss,
    restoreConnectivity,
    offlineDraft,
    setActivePage,
    t,
  } = useSevaSutra();

  const [voiceInputStatus, setVoiceInputStatus] = useState<string>(
    'Ready. Use microphone voice input (if supported by your browser) or click any text alternative command button below.'
  );
  const [voiceCommandText, setVoiceCommandText] = useState<string>('');
  const [taskPaused, setTaskPaused] = useState<boolean>(false);

  const executeCommandText = (rawCommand: string) => {
    const cmd = rawCommand.toLowerCase();
    setVoiceCommandText(rawCommand);
    if (cmd.includes('payment') || cmd.includes('delay') || cmd.includes('diagnosis')) {
      setVoiceInputStatus(`Executed command "${rawCommand}": Opening Payment Diagnosis.`);
      setActivePage('payment-diagnosis');
    } else if (cmd.includes('caregiver') || cmd.includes('bank') || cmd.includes('access')) {
      setVoiceInputStatus(`Executed command "${rawCommand}": Opening Caregiver Access.`);
      setActivePage('caregiver-access');
    } else if (cmd.includes('document') || cmd.includes('deadline')) {
      setVoiceInputStatus(`Executed command "${rawCommand}": Opening Documents & Deadlines.`);
      setActivePage('documents-deadlines');
    } else if (cmd.includes('read') || cmd.includes('status')) {
      speakText(t.dashboardIntro);
      setVoiceInputStatus(`Executed command "${rawCommand}": Reading status summary aloud.`);
    } else {
      setVoiceInputStatus(
        `Received input "${rawCommand}". Matched to safe text navigation assistant.`
      );
    }
  };

  const handlePauseResumeTask = () => {
    const nextPaused = !taskPaused;
    setTaskPaused(nextPaused);
    if (!nextPaused) {
      speakText(t.readBackScript);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <section className="seva-card bg-white rounded-xl border border-slate-200 p-6 space-y-2">
        <div className="text-xs font-mono uppercase text-[#087F78] font-bold">
          First-Class Accessibility · Voice &amp; Text Parity · Bilingual Support
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#102137]">
          Accessibility, Voice, and Language Settings
        </h1>
        <p className="text-sm text-slate-600">
          Tailored for Lakshmi Devi (Age 72, low vision and hearing loss). Every voice action has a full keyboard and text alternative.
        </p>
      </section>

      {/* Grid of Visual & Cognitive Controls */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Text Enlargement */}
        <div className="seva-card bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-2 text-base font-bold text-[#102137]">
            <Type className="w-5 h-5 text-[#087F78]" />
            <h2>1. Text Size &amp; Typography Scale</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            Enlarges all headings, body text, and interactive targets across the entire application while keeping layouts readable.
          </p>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: 'normal', label: 'Standard (100%)' },
                { id: 'large', label: 'Large Text (118%)' },
                { id: 'xlarge', label: 'Extra Large (132%)' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateAccessibility({ textSize: opt.id })}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold border transition-colors ${
                  accessibility.textSize === opt.id
                    ? 'bg-[#087F78] text-white border-[#087F78]'
                    : 'bg-slate-50 text-[#102137] border-slate-300 hover:bg-slate-100'
                }`}
                aria-pressed={accessibility.textSize === opt.id}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. High Contrast & Reduced Motion */}
        <div className="seva-card bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-2 text-base font-bold text-[#102137]">
            <Eye className="w-5 h-5 text-[#087F78]" />
            <h2>2. High Contrast, Reduced Motion &amp; Focus Mode</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            Strengthens border contrast to crisp black-on-white, disables non-essential motion, or simplifies the dashboard to one task at a time.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                updateAccessibility({ highContrast: !accessibility.highContrast })
              }
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold border ${
                accessibility.highContrast
                  ? 'bg-[#102137] text-white border-[#102137]'
                  : 'bg-slate-50 text-[#102137] border-slate-300'
              }`}
              aria-pressed={accessibility.highContrast}
            >
              High Contrast: {accessibility.highContrast ? 'ON' : 'OFF'}
            </button>

            <button
              type="button"
              onClick={() =>
                updateAccessibility({ reducedMotion: !accessibility.reducedMotion })
              }
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold border ${
                accessibility.reducedMotion
                  ? 'bg-[#102137] text-white border-[#102137]'
                  : 'bg-slate-50 text-[#102137] border-slate-300'
              }`}
              aria-pressed={accessibility.reducedMotion}
            >
              Reduced Motion: {accessibility.reducedMotion ? 'ON' : 'OFF'}
            </button>

            <button
              type="button"
              onClick={() =>
                updateAccessibility({ oneTaskAtATime: !accessibility.oneTaskAtATime })
              }
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold border ${
                accessibility.oneTaskAtATime
                  ? 'bg-[#087F78] text-white border-[#087F78]'
                  : 'bg-slate-50 text-[#102137] border-slate-300'
              }`}
              aria-pressed={accessibility.oneTaskAtATime}
            >
              One-Task-at-a-Time: {accessibility.oneTaskAtATime ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* 3. Language Selection (English & Telugu) */}
        <div className="seva-card bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-2 text-base font-bold text-[#102137]">
            <Globe className="w-5 h-5 text-[#087F78]" />
            <h2>3. Language Selection (English &amp; తెలుగు)</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            Switches actual navigation items, headers, dashboard guidance, offline recovery prompts, and safeguard messages between English and Telugu.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold border ${
                accessibility.language === 'en'
                  ? 'bg-[#087F78] text-white border-[#087F78]'
                  : 'bg-slate-50 text-[#102137] border-slate-300'
              }`}
            >
              English (Default)
            </button>
            <button
              type="button"
              onClick={() => setLanguage('te')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold border ${
                accessibility.language === 'te'
                  ? 'bg-[#087F78] text-white border-[#087F78]'
                  : 'bg-slate-50 text-[#102137] border-slate-300'
              }`}
            >
              తెలుగు (Telugu Demonstration Interface)
            </button>
          </div>
        </div>

        {/* 4. Read-Aloud & Pause/Resume Spoken Read-Back */}
        <div className="seva-card bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-base font-bold text-[#102137]">
              <Volume2 className="w-5 h-5 text-[#087F78]" />
              <h2>4. Spoken Read-Aloud &amp; Task Resumption</h2>
            </div>
            <span className="text-xs font-mono text-slate-500">
              Speech API: {isSpeechSynthesisSupported() ? 'Available' : 'Transcript Fallback'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            Pause and resume your verification task at any time. Upon resumption, SEVA SUTRA reads back your exact last confirmed step.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => speakText(t.dashboardIntro)}
              className="px-3.5 py-2 rounded-lg bg-[#087F78] text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Volume2 className="w-4 h-4" />
              <span>Read Intro Aloud</span>
            </button>

            <button
              type="button"
              onClick={stopSpeech}
              className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-[#102137] inline-flex items-center gap-1.5"
            >
              <VolumeX className="w-4 h-4" />
              <span>Stop Speech</span>
            </button>

            <button
              type="button"
              onClick={handlePauseResumeTask}
              className="px-3.5 py-2 rounded-lg bg-[#102137] text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              {taskPaused ? (
                <>
                  <PlayCircle className="w-4 h-4 text-[#E0F4EF]" />
                  <span>Resume Task &amp; Speak State Read-Back</span>
                </>
              ) : (
                <>
                  <PauseCircle className="w-4 h-4 text-[#E0F4EF]" />
                  <span>Pause Current Task</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Voice Input + Full Text Alternatives */}
      <section className="seva-card bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-[#102137] flex items-center gap-2">
              <Mic className="w-5 h-5 text-[#087F78]" />
              <span>Voice Navigation &amp; Mandatory Text Alternatives</span>
            </h2>
            <p className="text-xs text-slate-600">
              Voice input is never the only way to complete a task. Use the microphone button, type a command, or click any one-tap text button.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            SpeechRecognition: {isSpeechRecognitionSupported() ? 'Supported' : 'Graceful Text Fallback'}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() =>
              startBrowserVoiceInput(
                (transcript) => executeCommandText(transcript),
                (statusMsg) => setVoiceInputStatus(statusMsg)
              )
            }
            className="px-4 py-2.5 rounded-lg bg-[#087F78] hover:bg-[#066963] text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 shrink-0"
          >
            <Mic className="w-4 h-4" />
            <span>Start Voice Input</span>
          </button>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (voiceCommandText.trim()) {
                executeCommandText(voiceCommandText);
              }
            }}
            className="flex-1 flex gap-2"
          >
            <label htmlFor="text-cmd-input" className="sr-only">
              Type a command (Text alternative to voice input)
            </label>
            <input
              id="text-cmd-input"
              type="text"
              value={voiceCommandText}
              onChange={(e) => setVoiceCommandText(e.target.value)}
              placeholder='Type command (e.g., "check payment delay" or "read status")'
              className="flex-1 px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#102137] text-white text-xs sm:text-sm font-semibold shrink-0"
            >
              Run Text Command
            </button>
          </form>
        </div>

        {/* One-tap text alternatives */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-semibold text-slate-500">
            One-Tap Text Alternatives:
          </span>
          {[
            'Read my status aloud',
            'Explain my payment delay',
            'Check document deadlines',
            'Review caregiver access',
          ].map((phrase) => (
            <button
              key={phrase}
              type="button"
              onClick={() => executeCommandText(phrase)}
              className="px-3 py-1.5 rounded-md border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-[#102137]"
            >
              “{phrase}”
            </button>
          ))}
        </div>

        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
          <strong>Assistant Status:</strong> {voiceInputStatus}
        </div>
      </section>

      {/* Offline Connectivity Recovery Controls */}
      <section className="seva-card bg-white rounded-xl border border-slate-200 p-6 space-y-3">
        <h2 className="text-lg font-bold text-[#102137] flex items-center gap-2">
          <Sliders className="w-5 h-5 text-[#087F78]" />
          <span>Repeatable Offline Connectivity Stress-Test Control</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-600">
          Current Status:{' '}
          <strong>
            {isOfflineSimulated
              ? 'Offline Mode Active (Saved locally — not submitted)'
              : 'Online — Local Draft Synchronized in IndexedDB'}
          </strong>
          . Last confirmed step: <em>{offlineDraft.lastConfirmedStep}</em>.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={simulateConnectivityLoss}
            disabled={isOfflineSimulated}
            className="px-4 py-2 rounded-lg bg-[#C44848] text-white text-xs sm:text-sm font-semibold disabled:opacity-40 inline-flex items-center gap-2"
          >
            <WifiOff className="w-4 h-4" />
            <span>Simulate Connectivity Loss</span>
          </button>
          <button
            type="button"
            onClick={restoreConnectivity}
            disabled={!isOfflineSimulated}
            className="px-4 py-2 rounded-lg bg-[#087F78] text-white text-xs sm:text-sm font-semibold disabled:opacity-40 inline-flex items-center gap-2"
          >
            <Wifi className="w-4 h-4" />
            <span>Restore Connection &amp; Trigger Spoken Read-Back</span>
          </button>
        </div>
      </section>
    </div>
  );
};
