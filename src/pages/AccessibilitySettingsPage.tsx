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
      <section className="seva-card bg-white rounded-xl border border-[#C5A267]/35 p-6 sm:p-7 space-y-2.5">
        <div className="text-sm font-mono uppercase tracking-wider text-[#087F68] font-bold">
          First-Class Accessibility · Voice &amp; Text Parity · Bilingual Support
        </div>
        <h1 className="text-[32px] sm:text-[38px] font-bold text-[#101B2D] leading-tight">
          Accessibility, Voice, and Language Settings
        </h1>
        <p className="text-[16px] sm:text-[17px] text-[#334155]">
          Tailored for Lakshmi Devi (Age 72, low vision and hearing loss). Every voice action has a full keyboard and text alternative.
        </p>
      </section>

      {/* Grid of Visual & Cognitive Controls */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Text Enlargement */}
        <div className="seva-card bg-white rounded-xl border border-[#C5A267]/35 p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2.5 text-[20px] font-bold text-[#101B2D]">
            <Type className="w-5 h-5 text-[#087F68]" />
            <h2>1. Text Size &amp; Typography Scale</h2>
          </div>
          <p className="text-[16px] text-[#334155]">
            Enlarges all headings, body text, and interactive targets across the entire application while keeping layouts readable.
          </p>
          <div className="flex flex-wrap gap-2.5">
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
                className={`px-4 py-2.5 rounded-lg text-sm sm:text-base font-semibold border transition-colors ${
                  accessibility.textSize === opt.id
                    ? 'bg-[#087F68] text-white border-[#087F68]'
                    : 'bg-[#F5F0E6] text-[#101B2D] border-[#C5A267]/50 hover:bg-[#EAE3D5]'
                }`}
                aria-pressed={accessibility.textSize === opt.id}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. High Contrast & Reduced Motion */}
        <div className="seva-card bg-white rounded-xl border border-[#C5A267]/35 p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2.5 text-[20px] font-bold text-[#101B2D]">
            <Eye className="w-5 h-5 text-[#087F68]" />
            <h2>2. High Contrast, Reduced Motion &amp; Focus Mode</h2>
          </div>
          <p className="text-[16px] text-[#334155]">
            Strengthens border contrast to crisp black-on-white, disables non-essential motion, or simplifies the dashboard to one task at a time.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() =>
                updateAccessibility({ highContrast: !accessibility.highContrast })
              }
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold border ${
                accessibility.highContrast
                  ? 'bg-[#101B2D] text-white border-[#101B2D]'
                  : 'bg-[#F5F0E6] text-[#101B2D] border-[#C5A267]/50'
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
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold border ${
                accessibility.reducedMotion
                  ? 'bg-[#101B2D] text-white border-[#101B2D]'
                  : 'bg-[#F5F0E6] text-[#101B2D] border-[#C5A267]/50'
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
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold border ${
                accessibility.oneTaskAtATime
                  ? 'bg-[#087F68] text-white border-[#087F68]'
                  : 'bg-[#F5F0E6] text-[#101B2D] border-[#C5A267]/50'
              }`}
              aria-pressed={accessibility.oneTaskAtATime}
            >
              One-Task-at-a-Time: {accessibility.oneTaskAtATime ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* 3. Language Selection (English & Telugu) */}
        <div className="seva-card bg-white rounded-xl border border-[#C5A267]/35 p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2.5 text-[20px] font-bold text-[#101B2D]">
            <Globe className="w-5 h-5 text-[#087F68]" />
            <h2>3. Language Selection (English &amp; తెలుగు)</h2>
          </div>
          <p className="text-[16px] text-[#334155]">
            Switches actual navigation items, headers, dashboard guidance, offline recovery prompts, and safeguard messages between English and Telugu.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-4 py-2.5 rounded-lg text-sm sm:text-base font-semibold border ${
                accessibility.language === 'en'
                  ? 'bg-[#087F68] text-white border-[#087F68]'
                  : 'bg-[#F5F0E6] text-[#101B2D] border-[#C5A267]/50'
              }`}
            >
              English (Default)
            </button>
            <button
              type="button"
              onClick={() => setLanguage('te')}
              className={`px-4 py-2.5 rounded-lg text-sm sm:text-base font-semibold border ${
                accessibility.language === 'te'
                  ? 'bg-[#087F68] text-white border-[#087F68]'
                  : 'bg-[#F5F0E6] text-[#101B2D] border-[#C5A267]/50'
              }`}
            >
              తెలుగు (Telugu Demonstration Interface)
            </button>
          </div>
        </div>

        {/* 4. Read-Aloud & Pause/Resume Spoken Read-Back */}
        <div className="seva-card bg-white rounded-xl border border-[#C5A267]/35 p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 text-[20px] font-bold text-[#101B2D]">
              <Volume2 className="w-5 h-5 text-[#087F68]" />
              <h2>4. Spoken Read-Aloud &amp; Task Resumption</h2>
            </div>
            <span className="text-xs font-mono text-[#334155]">
              Speech API: {isSpeechSynthesisSupported() ? 'Available' : 'Transcript Fallback'}
            </span>
          </div>
          <p className="text-[16px] text-[#334155]">
            Pause and resume your verification task at any time. Upon resumption, SEVA SUTRA reads back your exact last confirmed step.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => speakText(t.dashboardIntro)}
              className="px-4 py-2.5 rounded-lg bg-[#087F68] hover:bg-[#066552] text-white text-sm font-semibold inline-flex items-center gap-2"
            >
              <Volume2 className="w-4 h-4" />
              <span>Read Intro Aloud</span>
            </button>

            <button
              type="button"
              onClick={stopSpeech}
              className="px-4 py-2.5 rounded-lg border border-[#C5A267]/50 bg-white text-sm font-semibold text-[#101B2D] inline-flex items-center gap-2"
            >
              <VolumeX className="w-4 h-4" />
              <span>Stop Speech</span>
            </button>

            <button
              type="button"
              onClick={handlePauseResumeTask}
              className="px-4 py-2.5 rounded-lg bg-[#101B2D] text-white text-sm font-semibold inline-flex items-center gap-2"
            >
              {taskPaused ? (
                <>
                  <PlayCircle className="w-4 h-4 text-[#C5A267]" />
                  <span>Resume Task &amp; Speak State Read-Back</span>
                </>
              ) : (
                <>
                  <PauseCircle className="w-4 h-4 text-[#C5A267]" />
                  <span>Pause Current Task</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Voice Input + Full Text Alternatives */}
      <section className="seva-card bg-white rounded-xl border border-[#C5A267]/35 p-6 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-[22px] sm:text-[26px] font-bold text-[#101B2D] flex items-center gap-2.5">
              <Mic className="w-6 h-6 text-[#087F68]" />
              <span>Voice Navigation &amp; Mandatory Text Alternatives</span>
            </h2>
            <p className="text-[15px] text-[#334155]">
              Voice input is never the only way to complete a task. Use the microphone button, type a command, or click any one-tap text button.
            </p>
          </div>
          <span className="text-sm font-mono text-[#334155]">
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
            className="px-5 py-2.5 rounded-lg bg-[#087F68] hover:bg-[#066552] text-white text-sm sm:text-base font-semibold inline-flex items-center justify-center gap-2 shrink-0"
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
            className="flex-1 flex gap-2.5"
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
              className="flex-1 px-3.5 py-2.5 rounded-lg border border-[#C5A267]/50 bg-white text-base text-[#101B2D]"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-[#101B2D] text-white text-sm sm:text-base font-semibold shrink-0"
            >
              Run Text Command
            </button>
          </form>
        </div>

        {/* One-tap text alternatives */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <span className="text-sm font-bold text-[#334155]">
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
              className="px-3.5 py-1.5 rounded-lg border border-[#C5A267]/45 bg-[#F5F0E6] hover:bg-[#EAE3D5] text-sm font-semibold text-[#101B2D]"
            >
              “{phrase}”
            </button>
          ))}
        </div>

        <div className="p-3.5 rounded-xl bg-[#F5F0E6]/75 border border-[#C5A267]/40 text-sm sm:text-base text-[#101B2D]">
          <strong>Assistant Status:</strong> {voiceInputStatus}
        </div>
      </section>

      {/* Offline Connectivity Recovery Controls */}
      <section className="seva-card bg-white rounded-xl border border-[#C5A267]/35 p-6 sm:p-7 space-y-4">
        <h2 className="text-[22px] sm:text-[26px] font-bold text-[#101B2D] flex items-center gap-2.5">
          <Sliders className="w-6 h-6 text-[#087F68]" />
          <span>Repeatable Offline Connectivity Stress-Test Control</span>
        </h2>
        <p className="text-[16px] text-[#334155]">
          Current Status:{' '}
          <strong className="text-[#101B2D]">
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
            className="px-5 py-2.5 rounded-lg bg-[#B42332] text-white text-sm sm:text-base font-semibold disabled:opacity-40 inline-flex items-center gap-2"
          >
            <WifiOff className="w-4 h-4" />
            <span>Simulate Connectivity Loss</span>
          </button>
          <button
            type="button"
            onClick={restoreConnectivity}
            disabled={!isOfflineSimulated}
            className="px-5 py-2.5 rounded-lg bg-[#087F68] text-white text-sm sm:text-base font-semibold disabled:opacity-40 inline-flex items-center gap-2"
          >
            <Wifi className="w-4 h-4" />
            <span>Restore Connection &amp; Trigger Spoken Read-Back</span>
          </button>
        </div>
      </section>
    </div>
  );
};
