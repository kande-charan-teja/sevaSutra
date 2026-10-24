import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  FileQuestion,
  HelpCircle,
  Layers,
  ListPlus,
  Play,
  RefreshCw,
  Stethoscope,
  Volume2,
} from 'lucide-react';
import { useSevaSutra } from '../context/SevaSutraContext';
import {
  SEEDED_DIAGNOSTIC_SCENARIOS,
  runPaymentDiagnosis,
} from '../logic/diagnosticRules';
import { DiagnosticScenarioId } from '../types/models';

const SCENARIO_LIST: Array<{ id: DiagnosticScenarioId; shortLabel: string }> = [
  { id: 'primary_lakshmi', shortLabel: 'Primary Demo: Lakshmi Devi (Due in 12d + Merged IFSC)' },
  { id: 'account_mismatch', shortLabel: '1. Account Mismatch' },
  { id: 'closed_bank_account', shortLabel: '2. Closed Bank Account' },
  { id: 'lapsed_verification', shortLabel: '3. Lapsed Identity Verification' },
  { id: 'funding_release_delay', shortLabel: '4. Funding-Release Delay' },
  { id: 'wrong_branch_code', shortLabel: '5. Wrong Bank-Branch Code' },
  { id: 'incomplete_evidence', shortLabel: '6. Insufficient Evidence' },
];

export const PaymentDiagnosisPage: React.FC = () => {
  const {
    diagnosticScenarioId,
    setDiagnosticScenarioId,
    runDiagnosticEvaluation,
    markDiagnosticStepComplete,
    prepareDiagnosisEnquiry,
    checklist,
    addChecklistItem,
    setActivePage,
    speakText,
  } = useSevaSutra();

  const [enquirySheetOpen, setEnquirySheetOpen] = useState(false);
  const [enquiryAccessError, setEnquiryAccessError] = useState<string | null>(null);
  const [rerunTimestamp, setRerunTimestamp] = useState<string>('Just now');

  const currentInput = SEEDED_DIAGNOSTIC_SCENARIOS[diagnosticScenarioId];
  const diagnosis = runPaymentDiagnosis(currentInput);

  const matchingChecklistItem = checklist.find(
    (c) => c.title.toLowerCase() === diagnosis.checklistActionTitle.toLowerCase()
  );
  const stepMarkedComplete = Boolean(matchingChecklistItem?.completed);

  const handleRerunDiagnosis = () => {
    runDiagnosticEvaluation(diagnosticScenarioId);
    setRerunTimestamp(new Date().toLocaleTimeString());
  };

  const handleAddToChecklist = () => {
    addChecklistItem(
      diagnosis.checklistActionTitle,
      diagnosis.recommendedCorrection,
      'Payment Diagnosis',
      `Payment Diagnosis (${diagnosis.title})`
    );
  };

  const handleMarkStepComplete = () => {
    markDiagnosticStepComplete(
      diagnosis.checklistActionTitle,
      diagnosis.recommendedCorrection,
      `Payment Diagnosis (${diagnosis.title})`
    );
  };

  const handlePrepareEnquiry = () => {
    const res = prepareDiagnosisEnquiry(diagnosis.title, currentInput.lastPaymentEventCode);
    if (!res.allowed) {
      setEnquiryAccessError(res.message);
      setEnquirySheetOpen(false);
    } else {
      setEnquiryAccessError(null);
      setEnquirySheetOpen(true);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Deterministic Engine Guarantee */}
      <section className="seva-card bg-[#FFFFFF] rounded-xl p-6 sm:p-7 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-mono uppercase text-[#087F68] font-bold">
              Deterministic Rule-Based Diagnostic Engine · Transparent TypeScript Rules
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#101B2D]">
              Payment-Delay Diagnosis Engine
            </h1>
            <p className="text-base text-slate-700">
              Inspects synthetic pension, verification, bank KYC, and treasury batch records to explain checks performed, evidence found, what remains unknown, and safe next actions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleRerunDiagnosis}
              className="px-4 py-2.5 rounded-lg bg-[#101B2D] hover:bg-slate-800 text-white text-sm font-bold inline-flex items-center gap-1.5"
            >
              <Play className="w-4 h-4 text-[#C5A267]" />
              <span>Run diagnosis</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePage('overview')}
              className="px-4 py-2.5 rounded-lg border border-[#C5A267] bg-[#F5F0E6] hover:bg-[#ebe3d3] text-[#101B2D] text-sm font-bold inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() =>
                speakText(
                  `${diagnosis.title}. Certainty classification: ${diagnosis.certaintyClassification}. ${diagnosis.possibleOrRecordedCause} Recommended next step: ${diagnosis.recommendedCorrection}`
                )
              }
              className="px-4 py-2.5 rounded-lg bg-[#087F68] hover:bg-[#066552] text-white text-sm font-bold inline-flex items-center gap-1.5"
            >
              <Volume2 className="w-4 h-4" />
              <span>Read Diagnosis Aloud</span>
            </button>
          </div>
        </div>

        {/* Scenario Selector Tabs */}
        <div className="pt-3 border-t border-[#E2D9C8] space-y-2.5">
          <div className="text-sm font-bold text-[#101B2D]">
            Select a Diagnostic Case and Run Evaluation (Supports all 6 required cases + Lakshmi Devi’s seeded record):
          </div>
          <div className="flex flex-wrap gap-2">
            {SCENARIO_LIST.map((sc) => {
              const active = diagnosticScenarioId === sc.id;
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => {
                    setDiagnosticScenarioId(sc.id);
                    setEnquirySheetOpen(false);
                    setEnquiryAccessError(null);
                    setRerunTimestamp(new Date().toLocaleTimeString());
                  }}
                  className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold border transition-colors ${
                    active
                      ? 'bg-[#101B2D] text-white border-[#101B2D]'
                      : 'bg-[#F5F0E6] text-[#101B2D] border-[#C5A267]/60 hover:bg-[#ebe3d3]'
                  }`}
                >
                  {sc.shortLabel}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Prominent Result Card */}
      <section
        aria-labelledby="diagnosis-result-heading"
        className="seva-card bg-[#FFFFFF] rounded-xl border-2 border-[#087F68] p-6 sm:p-7 space-y-5"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#E2D9C8] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#087F68]">
              <Stethoscope className="w-4 h-4" />
              <span>CERTAINTY CLASSIFICATION: {diagnosis.certaintyClassification.toUpperCase()}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-slate-600">Evaluated: {rerunTimestamp}</span>
            </div>
            <h2
              id="diagnosis-result-heading"
              className="font-display text-2xl sm:text-3xl font-extrabold text-[#101B2D]"
            >
              {diagnosis.title}
            </h2>
          </div>

          <div className="text-sm font-bold px-3.5 py-2 rounded-lg bg-[#F5F0E6] border border-[#C5A267] text-[#101B2D] shrink-0">
            Responsible party: <strong>{diagnosis.responsibleParty}</strong>
          </div>
        </div>

        {/* Specific Mandatory Copy for Lapsed Verification Separate Test Case */}
        {diagnosis.specificBannerMessage && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-[#F5F0E6] border-2 border-[#C5A267] text-[#101B2D] font-bold text-base"
          >
            “{diagnosis.specificBannerMessage}”
          </div>
        )}

        {/* Primary Scenario Safeguard Note */}
        {diagnosticScenarioId === 'primary_lakshmi' && (
          <div className="p-4 rounded-xl bg-[#F5F0E6] border border-[#C5A267] text-sm sm:text-base text-[#101B2D]">
            <strong>Important Distinction:</strong> In Lakshmi Devi’s primary scenario, Identity Verification is <strong>Due in 12 days</strong> (not expired). Therefore, the engine does not blame upcoming verification for payments delayed 3 months ago, and instead identifies the recorded post-merger branch IFSC code problem (<code className="font-mono font-bold">NEFT_RETURN_ERR_IFSC_MERGED_404</code>).
          </div>
        )}

        {/* Three-Column Evidence Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 1. Checks Performed */}
          <div className="p-5 rounded-xl bg-[#F5F0E6]/60 border border-[#E2D9C8] space-y-2.5">
            <h3 className="text-base font-bold text-[#101B2D] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#087F68]" />
              <span>Checks Performed</span>
            </h3>
            <ul className="space-y-2 text-sm text-slate-800 list-disc pl-4">
              {diagnosis.whatSystemChecked.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* 2. Evidence Found */}
          <div className="p-5 rounded-xl bg-[#F5F0E6]/60 border border-[#E2D9C8] space-y-2.5">
            <h3 className="text-base font-bold text-[#101B2D] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#C5A267]" />
              <span>Evidence Found in Record</span>
            </h3>
            <ul className="space-y-2 text-sm text-slate-800 list-disc pl-4">
              {diagnosis.evidenceFound.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* 3. What Remains Unknown */}
          <div className="p-5 rounded-xl bg-[#F5F0E6]/60 border border-[#E2D9C8] space-y-2.5">
            <h3 className="text-base font-bold text-[#101B2D] flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#B42332]" />
              <span>What Remains Unknown</span>
            </h3>
            <ul className="space-y-2 text-sm text-slate-800 list-disc pl-4">
              {diagnosis.whatRemainsUnknown.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Cause, Recommended Action & Escalation Route */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl border border-[#E2D9C8] bg-white space-y-1.5">
            <div className="text-xs font-bold uppercase text-slate-600">
              Possible or Recorded Cause
            </div>
            <p className="text-sm sm:text-base text-[#101B2D] font-medium">
              {diagnosis.possibleOrRecordedCause}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[#E2D9C8] bg-white space-y-1.5">
            <div className="text-xs font-bold uppercase text-slate-600">
              Recommended Action
            </div>
            <p className="text-sm sm:text-base text-[#101B2D] font-medium">
              {diagnosis.recommendedCorrection}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[#E2D9C8] bg-white space-y-1.5">
            <div className="text-xs font-bold uppercase text-slate-600">
              Escalation Route
            </div>
            <p className="text-sm sm:text-base text-[#101B2D] font-medium">
              {diagnosis.escalationPath}
            </p>
          </div>
        </div>

        {/* Working Action Controls */}
        <div className="pt-4 border-t border-[#E2D9C8] flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleAddToChecklist}
            className="px-4 py-2.5 rounded-lg bg-[#087F68] hover:bg-[#066552] text-white text-sm font-bold inline-flex items-center gap-2 transition-colors"
          >
            <ListPlus className="w-4 h-4" />
            <span>Add to my checklist</span>
          </button>

          <button
            type="button"
            onClick={handleMarkStepComplete}
            className={`px-4 py-2.5 rounded-lg border text-sm font-bold inline-flex items-center gap-2 transition-colors ${
              stepMarkedComplete
                ? 'bg-[#087F68] border-[#087F68] text-white'
                : 'bg-[#F5F0E6] border-[#C5A267] text-[#101B2D] hover:bg-[#ebe3d3]'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>{stepMarkedComplete ? 'Step Marked Complete' : 'Mark step complete'}</span>
          </button>

          <button
            type="button"
            onClick={handleRerunDiagnosis}
            className="px-4 py-2.5 rounded-lg border border-[#C5A267] bg-[#F5F0E6] hover:bg-[#ebe3d3] text-[#101B2D] text-sm font-bold inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Re-run diagnosis</span>
          </button>

          <button
            type="button"
            onClick={handlePrepareEnquiry}
            className="px-4 py-2.5 rounded-lg border border-[#C5A267] bg-[#F5F0E6] hover:bg-[#ebe3d3] text-[#101B2D] text-sm font-bold inline-flex items-center gap-2"
          >
            <FileQuestion className="w-4 h-4" />
            <span>Prepare an enquiry</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePage('my-benefits')}
            className="px-4 py-2.5 rounded-lg border border-[#C5A267] bg-white hover:bg-[#F5F0E6] text-[#101B2D] text-sm font-bold inline-flex items-center gap-2"
          >
            <Layers className="w-4 h-4" />
            <span>View benefit status</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePage('overview')}
            className="px-4 py-2.5 rounded-lg bg-[#101B2D] hover:bg-slate-800 text-white text-sm font-bold inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>
        </div>

        {/* Access Denied Alert if Caregiver Permission 'prepare_enquiry' is Revoked/Expired */}
        {enquiryAccessError && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-red-50 border border-[#B42332] text-[#B42332] text-sm font-bold"
          >
            {enquiryAccessError}
          </div>
        )}

        {/* Enquiry Sheet Drawer when "Prepare an enquiry" is clicked */}
        {enquirySheetOpen && (
          <div className="p-5 rounded-xl bg-[#F5F0E6] border-2 border-[#C5A267] space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#101B2D] text-base">
                Prepared Citizen Service Desk Enquiry Summary (Local Draft — Not Officially Submitted)
              </h3>
              <button
                type="button"
                onClick={() => setEnquirySheetOpen(false)}
                className="text-xs font-bold text-slate-700 hover:text-[#101B2D]"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs bg-white p-3.5 rounded-lg border border-[#E2D9C8]">
              <div>Beneficiary: Lakshmi Devi (Sanction #SSP-2021-88412)</div>
              <div>Diagnostic Scenario: {diagnosis.title}</div>
              <div>Event Code: {currentInput.lastPaymentEventCode}</div>
              <div>Certainty: {diagnosis.certaintyClassification}</div>
            </div>
            <p className="text-[#101B2D]">
              <strong>Enquiry Statement for Welfare Officer:</strong> “My pension application is Approved, and my payments have been delayed for {currentInput.paymentMonthsLate} months. Please verify event code <code className="font-mono font-bold">{currentInput.lastPaymentEventCode}</code> and advise on: {diagnosis.recommendedCorrection}”
            </p>
          </div>
        )}
      </section>

      {/* Interactive 6-Step Decision Tree Visualization */}
      <section className="seva-card bg-[#FFFFFF] rounded-xl p-6 sm:p-7 space-y-4">
        <div className="space-y-1">
          <h2 className="font-display text-2xl font-bold text-[#101B2D]">
            Interactive Diagnostic Decision Tree
          </h2>
          <p className="text-sm text-slate-700">
            Start → Inspect available records → Check verification and document status → Check available account information → Review available payment events → Identify possible cause → Recommend next steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {diagnosis.decisionTree.map((node) => (
            <div
              key={node.stepNumber}
              className={`p-4 rounded-xl border space-y-2 ${
                node.status === 'flagged'
                  ? 'bg-red-50/40 border-[#B42332]'
                  : node.status === 'uncertain'
                    ? 'bg-[#F5F0E6] border-[#C5A267]'
                    : 'bg-white border-[#087F68]'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="font-mono text-[#101B2D]">STEP {node.stepNumber}</span>
                <span
                  className={
                    node.status === 'flagged'
                      ? 'text-[#B42332]'
                      : node.status === 'uncertain'
                        ? 'text-[#101B2D]'
                        : 'text-[#087F68]'
                  }
                >
                  {node.status === 'flagged'
                    ? 'Flagged Evidence'
                    : node.status === 'uncertain'
                      ? 'Missing Info'
                      : 'Verified'}
                </span>
              </div>
              <div className="text-base font-bold text-[#101B2D]">{node.label}</div>
              <div className="text-xs sm:text-sm text-slate-600 italic">{node.question}</div>
              <p className="text-sm text-[#101B2D] font-semibold pt-2 border-t border-[#E2D9C8]">
                {node.finding}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
