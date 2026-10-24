import React, { useState } from 'react';
import {
  Bell,
  CalendarClock,
  CheckCircle2,
  CheckSquare,
  Clock,
  FileText,
  Info,
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
    offlineDraft,
    isOfflineSimulated,
    simulateConnectivityLoss,
    restoreConnectivity,
    updateOfflineDraftStep,
    speakText,
    t,
  } = useSevaSutra();

  const [selectedDocId, setSelectedDocId] = useState<string>(documents[0]?.id || 'doc-life-cert');
  const selectedDoc = documents.find((d) => d.id === selectedDocId) || documents[0];

  return (
    <div className="space-y-8">
      {/* Header & 12-Day Verification Highlight */}
      <section className="seva-card bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#102137]">
              Documents and Deadlines
            </h1>
            <p className="text-sm text-slate-600">
              Track document validity, manage reminder preferences, and complete your verification preparation checklist safely. No real government ID numbers are collected.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2 rounded-lg bg-amber-50 border border-amber-400 text-[#102137] text-xs sm:text-sm font-bold flex items-center gap-2 tabular-nums">
              <Clock className="w-4 h-4 text-amber-700" />
              <span>Primary Verification Deadline: Due in 12 Days (Nov 05, 2026)</span>
            </div>
          </div>
        </div>

        {/* Visual Deadline Timeline Bar */}
        <div className="pt-3 border-t border-slate-100">
          <div className="text-xs font-semibold text-slate-500 mb-2">
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
                  className={`p-3.5 rounded-lg border text-left transition-colors ${
                    isSelected
                      ? 'bg-[#102137] text-white border-[#102137]'
                      : 'bg-slate-50 text-[#102137] border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                    <span>{doc.expiryDate}</span>
                    <span className="font-bold">{doc.daysRemaining}d left</span>
                  </div>
                  <div className="text-sm font-bold mt-1 truncate">{doc.name}</div>
                  <div
                    className={`text-xs mt-1 ${
                      isSelected ? 'text-[#E0F4EF]' : 'text-slate-600'
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
              className={`seva-card bg-white rounded-xl border p-5 space-y-3 ${
                selectedDoc.id === doc.id ? 'border-[#087F78] ring-1 ring-[#087F78]' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-medium text-slate-500">{doc.category}</span>
                  <h2 className="text-base sm:text-lg font-bold text-[#102137]">{doc.name}</h2>
                </div>
                <div className="text-xs font-bold text-[#087F78] tabular-nums">
                  {doc.verificationStatus} · {doc.daysRemaining} days remaining
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div>
                  <strong>Expiry Date:</strong>{' '}
                  <span className="font-mono tabular-nums">{doc.expiryDate}</span>
                </div>
                <div>
                  <strong>Required Action:</strong> {doc.requiredAction}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                {/* Reminder controls */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => toggleDocumentReminder(doc.id)}
                    className={`px-3 py-1.5 rounded-md font-semibold inline-flex items-center gap-1.5 border ${
                      doc.reminderEnabled
                        ? 'bg-[#E0F4EF] text-[#102137] border-[#087F78]/40'
                        : 'bg-white text-slate-600 border-slate-300'
                    }`}
                  >
                    <Bell className="w-3.5 h-3.5" />
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
                    className="px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-[#102137] text-xs font-medium"
                  >
                    <option value="In-App Banner">In-App Banner</option>
                    <option value="SMS (Simulated)">SMS (Simulated)</option>
                    <option value="Voice Call (Simulated)">Voice Call (Simulated)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDocId(doc.id)}
                    className="px-3 py-1.5 rounded-md border border-slate-300 text-xs font-semibold text-[#102137] hover:bg-slate-50"
                  >
                    Inspect Details
                  </button>
                  <button
                    type="button"
                    onClick={() => markDocumentCompleted(doc.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center gap-1.5 ${
                      doc.completed
                        ? 'bg-[#E0F4EF] text-[#102137]'
                        : 'bg-[#087F78] text-white hover:bg-[#066963]'
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

        {/* Right Column: Accessible Next-Step Detail & Offline Stress-Test Checklist */}
        <div className="lg:col-span-5 space-y-6">
          {/* Selected Document Detail Card */}
          <div className="seva-card bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-[#087F78]">
                Accessible Document Explanation
              </span>
              <button
                type="button"
                onClick={() =>
                  speakText(`${selectedDoc.name}. ${selectedDoc.plainLanguageNextStep}`)
                }
                className="text-xs font-semibold text-[#087F78] hover:underline inline-flex items-center gap-1"
              >
                <Volume2 className="w-3.5 h-3.5" />
                Read aloud
              </button>
            </div>

            <h3 className="text-lg font-bold text-[#102137]">{selectedDoc.name}</h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              {selectedDoc.plainLanguageNextStep}
            </p>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <div>
                <strong>Privacy &amp; Honesty Note:</strong> This prototype does not collect real Aadhaar/government ID numbers or transmit documents to an external authority. Marking a task completed updates your local demonstration checklist.
              </div>
            </div>
          </div>

          {/* Offline Recovery & Connectivity Loss Stress-Test Module */}
          <div className="seva-card bg-white rounded-xl border-2 border-[#102137] p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-[#087F78]">
                  Offline Recovery &amp; Stress-Test Workflow
                </span>
                <h3 className="text-lg font-bold text-[#102137]">
                  Guided Verification Preparation Checklist
                </h3>
              </div>
              <span
                className={`px-2.5 py-1 rounded text-xs font-bold ${
                  isOfflineSimulated
                    ? 'bg-[#C44848] text-white'
                    : 'bg-[#E0F4EF] text-[#102137]'
                }`}
              >
                {t.offlineSavedLocally}
              </span>
            </div>

            <p className="text-xs text-slate-600">
              Test dropping connectivity while halfway through verification. Your steps are preserved in IndexedDB and LocalStorage and survive page refresh.
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={simulateConnectivityLoss}
                disabled={isOfflineSimulated}
                className="px-3 py-2 rounded-lg bg-[#C44848] text-white text-xs font-semibold disabled:opacity-40 inline-flex items-center gap-1.5"
              >
                <WifiOff className="w-3.5 h-3.5" />
                <span>Simulate Connectivity Drop Mid-Task</span>
              </button>

              <button
                type="button"
                onClick={restoreConnectivity}
                disabled={!isOfflineSimulated}
                className="px-3 py-2 rounded-lg bg-[#087F78] text-white text-xs font-semibold disabled:opacity-40 inline-flex items-center gap-1.5"
              >
                <Wifi className="w-3.5 h-3.5" />
                <span>Restore Connection &amp; Hear Read-Back</span>
              </button>
            </div>

            {/* Checklist Steps */}
            <div className="space-y-2 pt-2">
              {OFFLINE_VERIFICATION_STEPS.map((step) => {
                const checked = offlineDraft.completedStepIds.includes(step.id);
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => updateOfflineDraftStep(step.id, step.label)}
                    className={`w-full p-3 rounded-lg border text-left text-xs sm:text-sm flex items-start gap-2.5 transition-colors ${
                      checked
                        ? 'bg-[#E0F4EF]/60 border-[#087F78] text-[#102137] font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {checked ? (
                      <CheckSquare className="w-4 h-4 text-[#087F78] shrink-0 mt-0.5" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    )}
                    <span>{step.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-200 text-xs text-slate-600 space-y-1">
              <div>
                <strong>Last Confirmed Step:</strong> {offlineDraft.lastConfirmedStep} (Saved at {offlineDraft.savedAt})
              </div>
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => speakText(t.readBackScript)}
                  className="text-[#087F78] font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  Test Spoken Read-Back Script
                </button>
                <span className="font-mono text-[11px] text-slate-500">
                  IndexedDB + LocalStorage Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
