import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  CheckSquare,
  Clock,
  ListPlus,
  PauseCircle,
  PlayCircle,
  RotateCcw,
  Save,
  Square,
  Volume2,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useSevaSutra } from '../context/SevaSutraContext';
import { DocumentItem } from '../types/models';

const OFFLINE_VERIFICATION_STEPS = [
  {
    id: 'verif-step-1',
    label: 'Confirm Pension Sanction ID #SSP-2021-88412 is written down',
  },
  {
    id: 'verif-step-2',
    label: 'Place original identity card and blue pension passbook in folder',
  },
  {
    id: 'verif-step-3',
    label: 'Select preferred verification method (Doorstep visit or Citizen Centre)',
  },
  {
    id: 'verif-step-4',
    label: 'Review post-merger bank branch IFSC slip (Account stays in Lakshmi Devi’s name)',
  },
];

export const DocumentsDeadlinesPage: React.FC = () => {
  const {
    documents,
    toggleDocumentReminder,
    changeDocumentReminderChannel,
    markDocumentCompleted,
    addChecklistItem,
    offlineDraft,
    isOfflineSimulated,
    simulateConnectivityLoss,
    restoreConnectivity,
    saveOfflineDraftExplicitly,
    updateOfflineDraftStep,
    continueFromOfflineDraft,
    repeatLastOfflineDraftStep,
    speakText,
    t,
  } = useSevaSutra();

  const [selectedDocId, setSelectedDocId] = useState<string>(documents[0]?.id || 'doc-life-cert');
  const [taskPaused, setTaskPaused] = useState<boolean>(false);
  const selectedDoc = documents.find((d) => d.id === selectedDocId) || documents[0];

  const handleAddDocTaskToChecklist = (doc: DocumentItem) => {
    addChecklistItem(
      `Prepare ${doc.name}: ${doc.requiredAction}`,
      doc.plainLanguageNextStep,
      doc.category === 'Identity & Life Certificate' ? 'Verification' : 'Documents',
      `Documents & Deadlines (${doc.name})`
    );
  };

  return (
    <div className="space-y-8">
      {/* Header & 12-Day Verification Highlight */}
      <section className="seva-card bg-[#FFFFFF] rounded-xl p-6 sm:p-7 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#101B2D]">
              Documents and Deadlines
            </h1>
            <p className="text-base text-slate-700">
              Track document validity, manage reminder preferences, and complete your verification preparation checklist safely. No real government ID numbers are collected.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2.5 rounded-xl bg-[#F5F0E6] border-2 border-[#C5A267] text-[#101B2D] text-sm font-bold flex items-center gap-2 tabular-nums">
              <Clock className="w-4 h-4 text-[#087F68]" />
              <span>Primary Verification Deadline: Due in 12 Days (Nov 05, 2026)</span>
            </div>
          </div>
        </div>

        {/* Visual Deadline Timeline Bar */}
        <div className="pt-3 border-t border-[#E2D9C8]">
          <div className="text-sm font-bold text-[#101B2D] mb-2.5">
            90-Day Document &amp; Verification Horizon
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {documents.map((doc) => {
              const isSelected = doc.id === selectedDoc.id;
              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`p-4 rounded-xl border text-left transition-colors ${
                    isSelected
                      ? 'bg-[#101B2D] text-white border-[#101B2D]'
                      : 'bg-[#F5F0E6]/70 text-[#101B2D] border-[#C5A267]/50 hover:bg-[#F5F0E6]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                    <span>{doc.expiryDate}</span>
                    <span className="font-bold">{doc.daysRemaining}d left</span>
                  </div>
                  <div className="text-sm font-bold mt-1.5 leading-snug">{doc.name}</div>
                  <div
                    className={`text-xs mt-1 font-semibold ${
                      isSelected ? 'text-[#C5A267]' : 'text-[#087F68]'
                    }`}
                  >
                    Status: {doc.verificationStatus}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Document Cards + Detail View */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Document List */}
        <div className="lg:col-span-7 space-y-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className={`seva-card bg-[#FFFFFF] rounded-xl border p-5 sm:p-6 space-y-3.5 ${
                selectedDoc.id === doc.id
                  ? 'border-[#087F68] ring-1 ring-[#087F68]'
                  : 'border-[#E2D9C8]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold uppercase text-slate-600">
                    {doc.category}
                  </span>
                  <h2 className="font-display text-lg sm:text-xl font-bold text-[#101B2D]">
                    {doc.name}
                  </h2>
                </div>
                <div className="text-xs sm:text-sm font-bold text-[#087F68] tabular-nums">
                  {doc.verificationStatus} · {doc.daysRemaining} days remaining
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm text-[#101B2D] bg-[#F5F0E6]/60 p-3.5 rounded-lg border border-[#E2D9C8]">
                <div>
                  <strong>Expiry Date:</strong>{' '}
                  <span className="font-mono tabular-nums">{doc.expiryDate}</span>
                </div>
                <div>
                  <strong>Required Action:</strong> {doc.requiredAction}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E2D9C8]">
                {/* Reminder controls */}
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                  <button
                    type="button"
                    onClick={() => toggleDocumentReminder(doc.id)}
                    className={`px-3 py-1.5 rounded-lg font-bold inline-flex items-center gap-1.5 border ${
                      doc.reminderEnabled
                        ? 'bg-[#F5F0E6] text-[#101B2D] border-[#087F68]'
                        : 'bg-white text-slate-600 border-slate-300'
                    }`}
                  >
                    <Bell className="w-3.5 h-3.5 text-[#087F68]" />
                    <span>{doc.reminderEnabled ? 'Reminder On' : 'Reminder Off'}</span>
                  </button>

                  <label className="sr-only" htmlFor={`channel-${doc.id}`}>
                    Reminder channel for {doc.name}
                  </label>
                  <select
                    id={`channel-${doc.id}`}
                    value={doc.reminderChannel}
                    onChange={(e) =>
                      changeDocumentReminderChannel(
                        doc.id,
                        e.target.value as DocumentItem['reminderChannel']
                      )
                    }
                    className="px-3 py-1.5 rounded-lg border border-[#C5A267] bg-white text-[#101B2D] text-xs sm:text-sm font-semibold"
                  >
                    <option value="In-App Banner">In-App Banner</option>
                    <option value="SMS (Simulated)">SMS (Simulated)</option>
                    <option value="Voice Call (Simulated)">Voice Call (Simulated)</option>
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDocId(doc.id)}
                    className="px-3 py-1.5 rounded-lg border border-[#C5A267] bg-[#F5F0E6] text-xs sm:text-sm font-bold text-[#101B2D] hover:bg-[#ebe3d3]"
                  >
                    Inspect Details
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddDocTaskToChecklist(doc)}
                    className="px-3 py-1.5 rounded-lg border border-[#087F68] bg-white text-xs sm:text-sm font-bold text-[#087F68] hover:bg-[#F5F0E6] inline-flex items-center gap-1"
                  >
                    <ListPlus className="w-3.5 h-3.5" />
                    <span>Add to Checklist</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => markDocumentCompleted(doc.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 ${
                      doc.completed
                        ? 'bg-[#101B2D] text-white'
                        : 'bg-[#087F68] text-white hover:bg-[#066552]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{doc.completed ? 'Completed (Local Demo)' : 'Mark as Completed'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Accessible Next-Step Detail & Complete Offline Recovery Module */}
        <div className="lg:col-span-5 space-y-6">
          {/* Selected Document Detail Card */}
          <div className="seva-card bg-[#FFFFFF] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-[#087F68]">
                Accessible Document Explanation
              </span>
              <button
                type="button"
                onClick={() =>
                  speakText(`${selectedDoc.name}. ${selectedDoc.plainLanguageNextStep}`)
                }
                className="text-sm font-bold text-[#087F68] hover:underline inline-flex items-center gap-1"
              >
                <Volume2 className="w-4 h-4" />
                Read aloud
              </button>
            </div>

            <h3 className="font-display text-xl font-bold text-[#101B2D]">
              {selectedDoc.name}
            </h3>
            <div className="text-xs font-mono text-slate-600">
              Deadline: {selectedDoc.expiryDate} ({selectedDoc.daysRemaining} days remaining) · Status: {selectedDoc.verificationStatus}
            </div>
            <p className="text-base text-slate-800 leading-relaxed">
              {selectedDoc.plainLanguageNextStep}
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleAddDocTaskToChecklist(selectedDoc)}
                className="px-3.5 py-2 rounded-lg bg-[#087F68] hover:bg-[#066552] text-white text-xs sm:text-sm font-bold inline-flex items-center gap-1.5"
              >
                <ListPlus className="w-4 h-4" />
                <span>Add Task to My Checklist</span>
              </button>
              <button
                type="button"
                onClick={() => markDocumentCompleted(selectedDoc.id)}
                className="px-3.5 py-2 rounded-lg border border-[#C5A267] bg-[#F5F0E6] text-[#101B2D] text-xs sm:text-sm font-bold inline-flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-[#087F68]" />
                <span>{selectedDoc.completed ? 'Reopen Document Task' : 'Mark Document Complete'}</span>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F5F0E6] border border-[#C5A267] text-xs sm:text-sm text-[#101B2D]">
              <strong>Privacy &amp; Honesty Note:</strong> This prototype does not collect real government ID numbers or transmit documents to an external authority. Marking a task completed updates your local demonstration checklist.
            </div>
          </div>

          {/* Complete Offline Recovery & Connectivity Loss Stress-Test Module */}
          <div className="seva-card bg-[#FFFFFF] rounded-xl border-2 border-[#101B2D] p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-[#087F68]">
                  Offline Recovery &amp; Task Resumption
                </span>
                <h3 className="font-display text-xl font-bold text-[#101B2D]">
                  Guided Verification Preparation Checklist
                </h3>
              </div>
              <span
                className={`px-3 py-1 rounded-md text-xs font-bold ${
                  isOfflineSimulated
                    ? 'bg-[#B42332] text-white'
                    : 'bg-[#F5F0E6] border border-[#C5A267] text-[#101B2D]'
                }`}
              >
                {t.offlineSavedLocally}
              </span>
            </div>

            <p className="text-sm text-slate-700">
              Select a step below, save your checklist draft, and test an offline drop. Your progress is preserved across page refreshes in IndexedDB and LocalStorage.
            </p>

            {/* Offline / Save / Reconnect / Pause Controls */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => saveOfflineDraftExplicitly()}
                className="px-3.5 py-2 rounded-lg bg-[#101B2D] hover:bg-slate-800 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-1.5"
              >
                <Save className="w-4 h-4 text-[#C5A267]" />
                <span>Save Task Locally</span>
              </button>

              <button
                type="button"
                onClick={simulateConnectivityLoss}
                disabled={isOfflineSimulated}
                className="px-3.5 py-2 rounded-lg bg-[#B42332] text-white text-xs sm:text-sm font-bold disabled:opacity-40 inline-flex items-center gap-1.5"
              >
                <WifiOff className="w-4 h-4" />
                <span>Simulate Connectivity Loss</span>
              </button>

              <button
                type="button"
                onClick={restoreConnectivity}
                disabled={!isOfflineSimulated}
                className="px-3.5 py-2 rounded-lg bg-[#087F68] text-white text-xs sm:text-sm font-bold disabled:opacity-40 inline-flex items-center gap-1.5"
              >
                <Wifi className="w-4 h-4" />
                <span>Restore Connection &amp; Read-Back</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const next = !taskPaused;
                  setTaskPaused(next);
                  if (!next) {
                    speakText(t.readBackScript);
                  }
                }}
                className="px-3.5 py-2 rounded-lg border border-[#C5A267] bg-[#F5F0E6] text-[#101B2D] text-xs sm:text-sm font-bold inline-flex items-center gap-1.5"
              >
                {taskPaused ? (
                  <>
                    <PlayCircle className="w-4 h-4 text-[#087F68]" />
                    <span>Resume Task</span>
                  </>
                ) : (
                  <>
                    <PauseCircle className="w-4 h-4 text-[#101B2D]" />
                    <span>Pause Task</span>
                  </>
                )}
              </button>
            </div>

            {/* Post-Reconnection Continue & Repeat Last Step Controls */}
            <div className="p-3.5 rounded-xl bg-[#F5F0E6] border border-[#C5A267] space-y-2.5">
              <div className="text-xs font-bold uppercase text-[#101B2D]">
                Post-Reconnection Task Resumption Controls
              </div>
              <p className="text-xs sm:text-sm text-slate-800">
                Last confirmed step: <strong>{offlineDraft.lastConfirmedStep}</strong> (Saved at {offlineDraft.savedAt}). Verification has <strong>not</strong> been officially submitted.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={continueFromOfflineDraft}
                  className="px-3.5 py-1.5 rounded-lg bg-[#087F68] hover:bg-[#066552] text-white text-xs sm:text-sm font-bold inline-flex items-center gap-1.5"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>Continue</span>
                </button>
                <button
                  type="button"
                  onClick={repeatLastOfflineDraftStep}
                  className="px-3.5 py-1.5 rounded-lg bg-[#101B2D] hover:bg-slate-800 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Repeat last step</span>
                </button>
                <button
                  type="button"
                  onClick={() => speakText(t.readBackScript)}
                  className="px-3 py-1.5 rounded-lg border border-[#C5A267] bg-white text-[#101B2D] text-xs sm:text-sm font-bold inline-flex items-center gap-1.5"
                >
                  <Volume2 className="w-3.5 h-3.5 text-[#087F68]" />
                  <span>Speak Read-Back</span>
                </button>
              </div>
            </div>

            {/* Checklist Steps */}
            <div className="space-y-2 pt-1">
              {OFFLINE_VERIFICATION_STEPS.map((step) => {
                const checked = offlineDraft.completedStepIds.includes(step.id);
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => updateOfflineDraftStep(step.id, step.label)}
                    className={`w-full p-3.5 rounded-xl border text-left text-sm flex items-start gap-2.5 transition-colors ${
                      checked
                        ? 'bg-[#F5F0E6] border-[#087F68] text-[#101B2D] font-bold'
                        : 'bg-white border-[#E2D9C8] text-slate-800'
                    }`}
                  >
                    {checked ? (
                      <CheckSquare className="w-4 h-4 text-[#087F68] shrink-0 mt-0.5" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    )}
                    <span>{step.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
