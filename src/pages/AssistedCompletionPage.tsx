import React, { useState } from 'react';
import {
  CheckCircle2,
  HeartHandshake,
  Home,
  Save,
  ShieldCheck,
  Volume2,
} from 'lucide-react';
import { useSevaSutra } from '../context/SevaSutraContext';
import { FieldVisitRequest } from '../types/models';

export const AssistedCompletionPage: React.FC = () => {
  const {
    fieldVisitRequest,
    saveFieldVisitRequest,
    sensitiveReport,
    updateSensitiveReport,
    speakText,
    t,
  } = useSevaSutra();

  const [formState, setFormState] = useState<FieldVisitRequest>(fieldVisitRequest);

  const handleSaveDraft = () => {
    saveFieldVisitRequest(formState, false);
  };

  const handleSubmitLocalDemo = (e: React.FormEvent) => {
    e.preventDefault();
    saveFieldVisitRequest(formState, true);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <section className="seva-card bg-white rounded-xl border border-[#C5A267]/35 p-6 sm:p-7 space-y-3">
        <div className="text-sm font-mono uppercase tracking-wider text-[#087F68] font-bold">
          Doorstep Verification &amp; Dignified Sensitive Reporting
        </div>
        <h1 className="text-[32px] sm:text-[38px] font-bold text-[#101B2D] leading-tight">
          Assisted Completion and Home Visits
        </h1>
        <p className="text-[16px] sm:text-[17px] text-[#334155]">
          Request an accessible doorstep officer visit to complete annual verification without travelling, or follow the respectful pathway for reporting hospitalization, incapacity, or bereavement.
        </p>
      </section>

      {/* Section 1: Doorstep Verification Assistance Form */}
      <section className="seva-card bg-white rounded-xl border border-[#C5A267]/35 p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#C5A267]/25 pb-4">
          <div>
            <h2 className="text-[22px] sm:text-[26px] font-bold text-[#101B2D] flex items-center gap-2.5">
              <Home className="w-6 h-6 text-[#087F68]" />
              <span>Request Doorstep Verification Assistance</span>
            </h2>
            <p className="text-[15px] text-[#334155]">
              Select a preferred date, time window, contact method, and accessibility preferences. You can save an unfinished form and resume later.
            </p>
          </div>

          <div className="px-4 py-2 rounded-lg bg-[#087F68]/10 border border-[#087F68]/40 text-sm font-bold text-[#101B2D] shrink-0">
            {t.visitDemoDisclaimer}
          </div>
        </div>

        <form onSubmit={handleSubmitLocalDemo} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="visit-date" className="block text-sm font-bold text-[#101B2D]">
                Preferred Visit Date
              </label>
              <input
                id="visit-date"
                type="date"
                value={formState.preferredDate}
                onChange={(e) =>
                  setFormState({ ...formState, preferredDate: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#C5A267]/50 bg-white text-base font-mono text-[#101B2D]"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="visit-window" className="block text-sm font-bold text-[#101B2D]">
                Preferred Time Window
              </label>
              <select
                id="visit-window"
                value={formState.preferredTimeWindow}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    preferredTimeWindow: e.target.value as FieldVisitRequest['preferredTimeWindow'],
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#C5A267]/50 bg-white text-base text-[#101B2D]"
              >
                <option value="Morning (09:00 - 12:00)">Morning (09:00 - 12:00)</option>
                <option value="Afternoon (12:00 - 15:00)">Afternoon (12:00 - 15:00)</option>
                <option value="Late Afternoon (15:00 - 17:30)">Late Afternoon (15:00 - 17:30)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="visit-contact" className="block text-sm font-bold text-[#101B2D]">
                Preferred Contact Method
              </label>
              <select
                id="visit-contact"
                value={formState.contactMethod}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    contactMethod: e.target.value as FieldVisitRequest['contactMethod'],
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#C5A267]/50 bg-white text-base text-[#101B2D]"
              >
                <option value="Doorstep Officer Knock">Doorstep Officer Knock</option>
                <option value="Phone Call via Neighbor / Landline">
                  Phone Call via Neighbor / Landline
                </option>
                <option value="Accessible Voice Alert">Accessible Voice Alert</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="visit-reason" className="block text-sm font-bold text-[#101B2D]">
                Assistance Needed For
              </label>
              <input
                id="visit-reason"
                type="text"
                value={formState.reason}
                onChange={(e) => setFormState({ ...formState, reason: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#C5A267]/50 bg-white text-base text-[#101B2D]"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="visit-access" className="block text-sm font-bold text-[#101B2D]">
                Accessibility &amp; Communication Preferences
              </label>
              <input
                id="visit-access"
                type="text"
                value={formState.accessibilityNotes}
                onChange={(e) =>
                  setFormState({ ...formState, accessibilityNotes: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#C5A267]/50 bg-white text-base text-[#101B2D]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#C5A267]/25">
            <div className="text-sm sm:text-base text-[#334155]">
              <strong>Locally Recorded State:</strong>{' '}
              <span className="font-bold text-[#087F68]">
                {fieldVisitRequest.status}
              </span>{' '}
              (Last saved: <span className="font-mono">{fieldVisitRequest.updatedAt}</span>)
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-4 py-2.5 rounded-lg border border-[#C5A267]/50 bg-[#F5F0E6] hover:bg-[#EAE3D5] text-[#101B2D] text-sm sm:text-base font-semibold inline-flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Unfinished Form Locally</span>
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-[#087F68] hover:bg-[#066552] text-white text-sm sm:text-base font-semibold inline-flex items-center gap-2 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Record Demo Assistance Request</span>
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Section 2: Dignified Pathway for Reporting Death or Incapacity */}
      <section className="seva-card bg-white rounded-xl border border-[#C5A267]/35 p-6 sm:p-7 space-y-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#087F68]">
            <HeartHandshake className="w-5 h-5" />
            <span>Sensitive Life-Event Pathway</span>
          </div>
          <h2 className="text-[22px] sm:text-[26px] font-bold text-[#101B2D]">
            Dignified Pathway for Reporting Incapacity or Bereavement
          </h2>
          <p className="text-[16px] text-[#334155]">
            Follows four protective stages: <strong>Report respectfully → Collect minimum necessary information → Refer for official review → Preserve benefit controls.</strong> Never automatically transfers payment ownership or approves survivor entitlements without official verification.
          </p>
        </div>

        {/* 4 Stage Stepper */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {(
            [
              { st: 1, label: '1. Report respectfully' },
              { st: 2, label: '2. Collect minimum necessary information' },
              { st: 3, label: '3. Refer for official review' },
              { st: 4, label: '4. Preserve benefit controls' },
            ] as const
          ).map((item) => {
            const active = sensitiveReport.stage === item.st;
            const passed = sensitiveReport.stage > item.st;
            return (
              <button
                key={item.st}
                type="button"
                onClick={() => updateSensitiveReport({ stage: item.st })}
                className={`p-3.5 rounded-xl border text-left text-sm font-bold transition-colors ${
                  active
                    ? 'bg-[#101B2D] text-white border-[#101B2D]'
                    : passed
                      ? 'bg-[#087F68]/15 text-[#101B2D] border-[#087F68]'
                      : 'bg-[#F5F0E6]/75 text-[#334155] border-[#C5A267]/35'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Stage Content */}
        <div className="p-5 sm:p-6 rounded-xl bg-[#F5F0E6]/70 border border-[#C5A267]/40 space-y-4">
          {sensitiveReport.stage === 1 && (
            <div className="space-y-3.5">
              <h3 className="text-[18px] sm:text-[20px] font-bold text-[#101B2D]">
                Stage 1: Report Respectfully
              </h3>
              <p className="text-[16px] text-[#334155] leading-relaxed">
                We understand that serious illness, hospitalization, or the loss of a family member is a difficult time. This pathway records a respectful notice for a human welfare officer without freezing emergency medical support or exposing private family details.
              </p>
              <div className="space-y-2 max-w-md">
                <label htmlFor="sens-type" className="block text-sm font-bold text-[#101B2D]">
                  Select Situation Type
                </label>
                <select
                  id="sens-type"
                  value={sensitiveReport.reportType}
                  onChange={(e) =>
                    updateSensitiveReport({
                      reportType: e.target.value as typeof sensitiveReport.reportType,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#C5A267]/50 bg-white text-base text-[#101B2D]"
                >
                  <option value="Incapacity / Hospitalization">
                    Temporary or Severe Incapacity / Hospitalization of Beneficiary
                  </option>
                  <option value="Bereavement / Death of Beneficiary">
                    Bereavement / Passing of Beneficiary
                  </option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => updateSensitiveReport({ stage: 2 })}
                className="px-4 py-2.5 rounded-lg bg-[#087F68] hover:bg-[#066552] text-white text-sm font-semibold"
              >
                Continue to Stage 2 →
              </button>
            </div>
          )}

          {sensitiveReport.stage === 2 && (
            <div className="space-y-3.5">
              <h3 className="text-[18px] sm:text-[20px] font-bold text-[#101B2D]">
                Stage 2: Collect Minimum Necessary Information
              </h3>
              <p className="text-[15px] text-[#334155]">
                Only basic contact context is noted so the welfare officer can follow up respectfully. Do not upload sensitive medical records or death certificates here.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="rep-name" className="block text-sm font-bold text-[#101B2D] mb-1.5">
                    Person Reporting
                  </label>
                  <input
                    id="rep-name"
                    type="text"
                    placeholder="e.g., Meena Kumari"
                    value={sensitiveReport.reporterName}
                    onChange={(e) =>
                      updateSensitiveReport({ reporterName: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-lg border border-[#C5A267]/50 bg-white text-base text-[#101B2D]"
                  />
                </div>
                <div>
                  <label htmlFor="rep-rel" className="block text-sm font-bold text-[#101B2D] mb-1.5">
                    Relationship / Role
                  </label>
                  <input
                    id="rep-rel"
                    type="text"
                    placeholder="e.g., ASHA Worker / Family"
                    value={sensitiveReport.reporterRelationship}
                    onChange={(e) =>
                      updateSensitiveReport({ reporterRelationship: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-lg border border-[#C5A267]/50 bg-white text-base text-[#101B2D]"
                  />
                </div>
                <div>
                  <label htmlFor="rep-date" className="block text-sm font-bold text-[#101B2D] mb-1.5">
                    Date of Event
                  </label>
                  <input
                    id="rep-date"
                    type="date"
                    value={sensitiveReport.dateOfEvent}
                    onChange={(e) =>
                      updateSensitiveReport({ dateOfEvent: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-lg border border-[#C5A267]/50 bg-white text-base font-mono text-[#101B2D]"
                  />
                </div>
              </div>
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => updateSensitiveReport({ stage: 1 })}
                  className="px-4 py-2 rounded-lg border border-[#C5A267]/50 bg-white text-sm font-semibold text-[#101B2D]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => updateSensitiveReport({ stage: 3 })}
                  className="px-4 py-2 rounded-lg bg-[#087F68] text-white text-sm font-semibold"
                >
                  Continue to Stage 3 →
                </button>
              </div>
            </div>
          )}

          {sensitiveReport.stage === 3 && (
            <div className="space-y-3.5">
              <h3 className="text-[18px] sm:text-[20px] font-bold text-[#101B2D]">
                Stage 3: Refer for Official Review
              </h3>
              <p className="text-[16px] text-[#334155]">
                Your note will be prepared for the Block Social Welfare Officer to conduct an official home or hospital verification.
              </p>
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => updateSensitiveReport({ stage: 2 })}
                  className="px-4 py-2 rounded-lg border border-[#C5A267]/50 bg-white text-sm font-semibold text-[#101B2D]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateSensitiveReport({
                      stage: 4,
                      recordedLocally: true,
                      referenceNote: `REF-SENS-${Date.now().toString().slice(-5)}`,
                    })
                  }
                  className="px-4 py-2 rounded-lg bg-[#087F68] text-white text-sm font-semibold"
                >
                  Record Local Referral &amp; Proceed to Stage 4 →
                </button>
              </div>
            </div>
          )}

          {sensitiveReport.stage === 4 && (
            <div className="space-y-3.5">
              <div className="flex items-center gap-2 text-[18px] font-bold text-[#087F68]">
                <ShieldCheck className="w-6 h-6" />
                <span>Stage 4: Benefit Controls Preserved (Demo Referral Recorded Locally)</span>
              </div>
              <p className="text-[16px] text-[#334155]">
                <strong>Safeguard Guarantee:</strong> Payment ownership has <strong>not</strong> been transferred to any caregiver or third party, survivor entitlement has <strong>not</strong> been auto-approved, and no sensitive medical or financial details have been disclosed.
              </p>
              {sensitiveReport.referenceNote && (
                <div className="text-sm font-mono bg-white p-3 rounded-lg border border-[#C5A267]/40 text-[#101B2D]">
                  Local Demo Reference: {sensitiveReport.referenceNote} (Not officially transmitted)
                </div>
              )}
              <button
                type="button"
                onClick={() =>
                  speakText(
                    'Sensitive report recorded locally for official review. Benefit controls and bank account ownership remain strictly protected.'
                  )
                }
                className="px-4 py-2 rounded-lg border border-[#C5A267]/50 bg-white text-sm font-semibold inline-flex items-center gap-2 text-[#101B2D]"
              >
                <Volume2 className="w-4 h-4 text-[#087F68]" />
                <span>Read Confirmation Aloud</span>
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
