import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  GitBranch,
  HelpCircle,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { useSevaSutra } from '../context/SevaSutraContext';
import {
  VALID_APPLICATION_TRANSITIONS,
  VALID_PAYMENT_TRANSITIONS,
  VALID_RENEWAL_TRANSITIONS,
  VALID_VERIFICATION_TRANSITIONS,
  evaluateCrossProcessHypotheses,
} from '../logic/stateMachines';
import {
  ApplicationState,
  PaymentState,
  RenewalState,
  VerificationState,
} from '../types/models';

const ALL_APP_STATES: ApplicationState[] = [
  'Draft',
  'Submitted',
  'Under review',
  'Approved',
  'Rejected',
];
const ALL_VERIF_STATES: VerificationState[] = [
  'Not started',
  'Due soon',
  'In progress',
  'Action required',
  'Verified',
  'Expired',
];
const ALL_RENEWAL_STATES: RenewalState[] = [
  'Not due',
  'Due soon',
  'Submitted',
  'Renewed',
  'Overdue',
];
const ALL_PAYMENT_STATES: PaymentState[] = [
  'Scheduled',
  'Processing',
  'Credited',
  'Delayed',
  'Under investigation',
];

export const MyBenefitsPage: React.FC = () => {
  const {
    stateMachines,
    attemptStateMachineTransition,
    setActivePage,
    t,
  } = useSevaSutra();

  const [transitionFeedback, setTransitionFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const hypotheses = evaluateCrossProcessHypotheses(stateMachines);

  const handleTransitionClick = (
    process: 'application' | 'verification' | 'renewal' | 'payment',
    target: string
  ) => {
    const result = attemptStateMachineTransition(process, target);
    setTransitionFeedback(result);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <section className="seva-card bg-white rounded-xl border border-slate-200 p-6 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#102137]">
              My Benefits — Four Linked but Independent State Machines
            </h1>
            <p className="text-sm text-slate-600">
              Application, Identity Verification, Renewal, and Payment are tracked independently. Changing one process never overwrites or corrupts another.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActivePage('payment-diagnosis')}
            className="px-4 py-2 rounded-lg bg-[#087F78] text-white text-sm font-semibold hover:bg-[#066963] inline-flex items-center gap-2 shrink-0"
          >
            <span>Open Payment Diagnosis</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {transitionFeedback && (
          <div
            role="status"
            className={`mt-4 p-3.5 rounded-lg border text-sm flex items-center gap-2.5 ${
              transitionFeedback.success
                ? 'bg-[#E0F4EF] border-[#087F78] text-[#102137]'
                : 'bg-red-50 border-[#C44848] text-[#C44848]'
            }`}
          >
            {transitionFeedback.success ? (
              <CheckCircle2 className="w-4 h-4 text-[#087F78] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#C44848] shrink-0" />
            )}
            <span className="font-medium">{transitionFeedback.message}</span>
          </div>
        )}
      </section>

      {/* Visual Diagram of 4 Independent Lanes + Dotted Hypothesis Links */}
      <section className="seva-card bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#102137] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#087F78]" />
            <span>Interactive State Machine Controller &amp; Transition Validator</span>
          </h2>
          <span className="text-xs font-mono text-slate-500">
            Click any state below to test valid vs. rejected transitions
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* 1. Application State Machine */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase text-slate-500">
                  Process 1 · Application
                </span>
                <h3 className="text-lg font-bold text-[#087F78]">
                  Current: {stateMachines.application}
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-500 tabular-nums">
                Updated: {stateMachines.lastUpdated.application}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Valid path: Draft → Submitted → Under review → Approved or Rejected. An Approved application cannot be arbitrarily reverted to Draft.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {ALL_APP_STATES.map((st) => {
                const isCurrent = stateMachines.application === st;
                const isValidNext = VALID_APPLICATION_TRANSITIONS[
                  stateMachines.application
                ].includes(st);
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleTransitionClick('application', st)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                      isCurrent
                        ? 'bg-[#087F78] text-white border-[#087F78]'
                        : isValidNext
                          ? 'bg-white text-[#102137] border-[#087F78] hover:bg-[#E0F4EF]'
                          : 'bg-slate-100 text-slate-500 border-slate-200 hover:border-[#C44848]'
                    }`}
                  >
                    {st} {isCurrent ? '(Current)' : isValidNext ? '(Valid Next)' : '(Test Invalid)'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Verification State Machine */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase text-slate-500">
                  Process 2 · Identity Verification
                </span>
                <h3 className="text-lg font-bold text-[#102137]">
                  Current: {stateMachines.verification} (Due in 12 days)
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-500 tabular-nums">
                Updated: {stateMachines.lastUpdated.verification}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Valid path: Not started → Due soon → In progress → Verified (with separate states for Action required or Expired).
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {ALL_VERIF_STATES.map((st) => {
                const isCurrent = stateMachines.verification === st;
                const isValidNext = VALID_VERIFICATION_TRANSITIONS[
                  stateMachines.verification
                ].includes(st);
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleTransitionClick('verification', st)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                      isCurrent
                        ? 'bg-[#102137] text-white border-[#102137]'
                        : isValidNext
                          ? 'bg-white text-[#102137] border-[#087F78] hover:bg-[#E0F4EF]'
                          : 'bg-slate-100 text-slate-500 border-slate-200 hover:border-[#C44848]'
                    }`}
                  >
                    {st} {isCurrent ? '(Current)' : isValidNext ? '(Valid Next)' : '(Test Invalid)'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Renewal State Machine */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase text-slate-500">
                  Process 3 · Benefit Renewal
                </span>
                <h3 className="text-lg font-bold text-[#102137]">
                  Current: {stateMachines.renewal}
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-500 tabular-nums">
                Updated: {stateMachines.lastUpdated.renewal}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Valid path: Not due → Due soon → Submitted → Renewed or Overdue.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {ALL_RENEWAL_STATES.map((st) => {
                const isCurrent = stateMachines.renewal === st;
                const isValidNext = VALID_RENEWAL_TRANSITIONS[stateMachines.renewal].includes(st);
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleTransitionClick('renewal', st)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                      isCurrent
                        ? 'bg-[#102137] text-white border-[#102137]'
                        : isValidNext
                          ? 'bg-white text-[#102137] border-[#087F78] hover:bg-[#E0F4EF]'
                          : 'bg-slate-100 text-slate-500 border-slate-200 hover:border-[#C44848]'
                    }`}
                  >
                    {st} {isCurrent ? '(Current)' : isValidNext ? '(Valid Next)' : '(Test Invalid)'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Payment State Machine */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase text-slate-500">
                  Process 4 · Monthly Payment
                </span>
                <h3 className="text-lg font-bold text-[#C44848]">
                  Current: {stateMachines.payment}
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-500 tabular-nums">
                Updated: {stateMachines.lastUpdated.payment}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Valid path: Scheduled → Processing → Credited, with branches for Delayed and Under investigation.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {ALL_PAYMENT_STATES.map((st) => {
                const isCurrent = stateMachines.payment === st;
                const isValidNext = VALID_PAYMENT_TRANSITIONS[stateMachines.payment].includes(st);
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleTransitionClick('payment', st)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                      isCurrent
                        ? 'bg-[#C44848] text-white border-[#C44848]'
                        : isValidNext
                          ? 'bg-white text-[#102137] border-[#087F78] hover:bg-[#E0F4EF]'
                          : 'bg-slate-100 text-slate-500 border-slate-200 hover:border-[#C44848]'
                    }`}
                  >
                    {st} {isCurrent ? '(Current)' : isValidNext ? '(Valid Next)' : '(Test Invalid)'}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Cross-Process Hypotheses Section */}
      <section className="seva-card bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#087F78] font-bold">
            <GitBranch className="w-4 h-4" />
            <span>{t.mayAffectHypothesis}</span>
          </div>
          <h2 className="text-xl font-bold text-[#102137]">
            Cross-Process Relationships (Evaluated as Hypotheses, Never Automatic Conclusions)
          </h2>
          <p className="text-sm text-slate-600">
            Each cross-process link records observed state, supporting evidence, potential relationship, confidence classification, missing information, and recommended investigation.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {hypotheses.map((hyp) => (
            <div
              key={hyp.id}
              className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-[#102137]">
                  <span>{hyp.fromProcess}</span>
                  <span className="font-mono text-xs text-[#087F78]">
                    --- ({t.mayAffectHypothesis}) ---&gt;
                  </span>
                  <span>{hyp.toProcess}</span>
                </div>
                <span className="text-xs font-semibold text-[#087F78]">
                  Confidence: {hyp.confidenceClassification}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="space-y-1">
                  <div className="font-semibold text-slate-500 text-xs">1. Observed State</div>
                  <p className="text-[#102137] font-medium">{hyp.observedState}</p>
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-slate-500 text-xs">2. Supporting Evidence</div>
                  <p className="text-slate-700">{hyp.supportingEvidence}</p>
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-slate-500 text-xs">
                    3. Potential Relationship (Hypothesis)
                  </div>
                  <p className="text-slate-700">{hyp.potentialRelationship}</p>
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-slate-500 text-xs">
                    4. Information Still Missing
                  </div>
                  <p className="text-slate-700">{hyp.informationStillMissing}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="text-[#102137]">
                  <strong>Recommended Investigation: </strong>
                  <span>{hyp.recommendedInvestigation}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#087F78] font-semibold shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                  <span>State Isolation Verified</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
