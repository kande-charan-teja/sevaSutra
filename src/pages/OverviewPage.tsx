import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CheckSquare,
  Clock,
  FileText,
  Info,
  PlayCircle,
  RotateCcw,
  ShieldAlert,
  Square,
  Stethoscope,
  Volume2,
} from 'lucide-react';
import { useSevaSutra } from '../context/SevaSutraContext';
import { ChecklistItem, PageId } from '../types/models';

const DASHBOARD_SCENARIOS: Array<{
  num: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  label: string;
}> = [
  { num: 1, label: '1. Review 4 Benefit States' },
  { num: 2, label: '2. Diagnose Payment Delay' },
  { num: 3, label: '3. Trigger Unsafe Bank Change' },
  { num: 4, label: '4. Revoke Access While Pending' },
  { num: 5, label: '5. Offline Loss & Recovery' },
  { num: 6, label: '6. Explore Eligibility Rules' },
  { num: 7, label: '7. Save Assisted Visit Request' },
];

export const OverviewPage: React.FC = () => {
  const {
    beneficiary,
    stateMachines,
    documents,
    deadlines,
    checklist,
    auditEvents,
    highRiskRequest,
    accessibility,
    updateAccessibility,
    t,
    setActivePage,
    toggleChecklistItem,
    speakText,
    launchEvaluatorScenario,
    resetEntireDemo,
  } = useSevaSutra();

  const expiringDoc =
    documents.find((d) => d.id === 'doc-disability-cert') || documents[1];
  const pendingChecklistCount = checklist.filter((c) => !c.completed).length;
  const completedChecklistCount = checklist.filter((c) => c.completed).length;

  const getCategoryTargetPage = (category: ChecklistItem['category']): PageId => {
    if (category === 'Payment Diagnosis') return 'payment-diagnosis';
    if (category === 'Safety') return 'caregiver-access';
    return 'documents-deadlines';
  };

  const handleReadOverview = () => {
    speakText(
      `${t.dashboardIntro} Application status is ${stateMachines.application}. Identity verification is Due in 12 days (${stateMachines.verification}). Supporting document is ${expiringDoc.verificationStatus} (${expiringDoc.daysRemaining} days left). Pension payment is ${stateMachines.payment}, three months late.`
    );
  };

  return (
    <div className="space-y-8">
      {/* Top Banner: Simple-language introduction & Beneficiary Context */}
      <section
        aria-labelledby="overview-heading"
        className="seva-card bg-[#FFFFFF] rounded-xl p-6 sm:p-7 space-y-5"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E2D9C8] pb-5">
          <div className="space-y-1.5">
            <div className="text-sm font-medium text-slate-600">
              <span>{beneficiary.schemeName}</span>
              <span aria-hidden="true"> · </span>
              <span className="font-mono font-semibold text-[#101B2D]">
                Sanction #{beneficiary.pensionId}
              </span>
              <span aria-hidden="true"> · </span>
              <span>{beneficiary.district}</span>
            </div>
            <h1
              id="overview-heading"
              className="font-display text-3xl sm:text-4xl font-extrabold text-[#101B2D] tracking-tight"
            >
              Namaste, {beneficiary.name} (Age {beneficiary.age})
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleReadOverview}
              className="px-4 py-2.5 rounded-lg bg-[#087F68] hover:bg-[#066552] text-white text-sm sm:text-base font-bold inline-flex items-center gap-2 whitespace-nowrap transition-colors"
            >
              <Volume2 className="w-4 h-4" />
              <span>{t.readAloudButton}</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePage('payment-diagnosis')}
              className="px-4 py-2.5 rounded-lg bg-[#101B2D] hover:bg-slate-800 text-white text-sm sm:text-base font-bold inline-flex items-center gap-2 whitespace-nowrap transition-colors"
            >
              <Stethoscope className="w-4 h-4 text-[#C5A267]" />
              <span>Start Payment Diagnosis</span>
            </button>

            <button
              type="button"
              onClick={() =>
                updateAccessibility({ oneTaskAtATime: !accessibility.oneTaskAtATime })
              }
              className={`px-4 py-2.5 rounded-lg border text-sm font-semibold whitespace-nowrap transition-colors ${
                accessibility.oneTaskAtATime
                  ? 'bg-[#101B2D] text-white border-[#101B2D]'
                  : 'bg-[#F5F0E6] text-[#101B2D] border-[#C5A267] hover:bg-[#ebe3d3]'
              }`}
              aria-pressed={accessibility.oneTaskAtATime}
            >
              {accessibility.oneTaskAtATime
                ? 'Show All Dashboard Sections'
                : 'One-Task-at-a-Time Focus Mode'}
            </button>
          </div>
        </div>

        {/* Mandatory Simple-Language Introduction */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#F5F0E6] rounded-xl p-4 sm:p-5 border border-[#C5A267]/60">
          <p className="text-base sm:text-lg font-semibold text-[#101B2D]">
            “{t.dashboardIntro}”
          </p>
          <div className="text-sm text-[#101B2D] shrink-0 space-y-0.5">
            <div>
              <strong>Accessibility Profile:</strong> Low vision &amp; hearing loss
            </div>
            <div>
              <strong>Digital Helper:</strong> {beneficiary.supportPersonName} ({beneficiary.supportPersonRelation})
            </div>
          </div>
        </div>

        {/* Access Concern Warning Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-[#F5F0E6]/70 border-2 border-[#C5A267] px-4 py-3.5 text-sm sm:text-base text-[#101B2D]">
          <div className="flex items-start sm:items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-[#B42332] shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <strong className="font-bold">Caregiver Access Safeguard Active: </strong>
              <span>{beneficiary.accessConcernSummary}</span>
              {highRiskRequest.status !== 'None' && (
                <span className="ml-2 font-bold text-[#B42332]">
                  (Status: {highRiskRequest.status.replace(/_/g, ' ')})
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActivePage('caregiver-access')}
            className="px-4 py-2 rounded-lg bg-[#101B2D] text-white text-xs sm:text-sm font-bold hover:bg-slate-800 whitespace-nowrap shrink-0"
          >
            Review Caregiver Safeguards
          </button>
        </div>
      </section>

      {/* Four Independently Maintained Process Cards */}
      <section aria-label="Four Independent Benefit Process Cards">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="font-display text-2xl font-bold text-[#101B2D]">
            Four Separate Benefit Processes (Independent Status Tracking)
          </h2>
          <span className="text-sm font-medium text-slate-700">
            A delayed payment never automatically cancels an approved application
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {/* Card 1: APPLICATION */}
          <div
            onClick={() => setActivePage('my-benefits')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActivePage('my-benefits');
              }
            }}
            className="seva-card text-left bg-[#FFFFFF] rounded-xl border border-[#E2D9C8] hover:border-[#087F68] p-5 sm:p-6 flex flex-col justify-between transition-colors cursor-pointer"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold tracking-wider uppercase text-slate-600">
                <span>1 · {t.cards.application}</span>
                <CheckCircle2 className="w-5 h-5 text-[#087F68]" />
              </div>

              <div className="space-y-1">
                <div className="font-display text-2xl font-extrabold text-[#087F68]">
                  {stateMachines.application}
                </div>
                <p className="text-sm text-slate-600 tabular-nums">
                  Last event: {stateMachines.lastUpdated.application}
                </p>
              </div>

              <p className="text-base text-[#101B2D] leading-relaxed">
                {stateMachines.events.application}
              </p>
            </div>

            <div className="pt-4 mt-5 border-t border-[#E2D9C8] flex items-center justify-between text-sm font-bold text-[#087F68]">
              <span>View application timeline</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 2: VERIFICATION */}
          <div
            onClick={() => setActivePage('documents-deadlines')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActivePage('documents-deadlines');
              }
            }}
            className="seva-card text-left bg-[#FFFFFF] rounded-xl border-2 border-[#C5A267] hover:border-[#087F68] p-5 sm:p-6 flex flex-col justify-between transition-colors cursor-pointer"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold tracking-wider uppercase text-[#101B2D]">
                <span>2 · {t.cards.verification}</span>
                <Clock className="w-5 h-5 text-[#C5A267]" />
              </div>

              <div className="space-y-1">
                <div className="font-display text-2xl font-extrabold text-[#101B2D] tabular-nums">
                  {stateMachines.verification === 'Due soon'
                    ? 'Due in 12 days'
                    : stateMachines.verification}
                </div>
                <p className="text-sm text-slate-700">
                  State machine: <strong>{stateMachines.verification}</strong>{' '}
                  {stateMachines.verification !== 'Expired' ? '(Not Expired)' : '(Expired)'}
                </p>
              </div>

              <p className="text-base text-[#101B2D] leading-relaxed">
                {stateMachines.verification === 'Verified'
                  ? 'Annual identity verification is recorded as Verified in the current demonstration state.'
                  : 'Next action: Complete annual life certificate checklist or book doorstep officer visit before Nov 05.'}
              </p>
            </div>

            <div className="pt-4 mt-5 border-t border-[#E2D9C8] flex items-center justify-between text-sm font-bold text-[#087F68]">
              <span>Open guided verification checklist</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 3: DOCUMENTS */}
          <div
            onClick={() => setActivePage('documents-deadlines')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActivePage('documents-deadlines');
              }
            }}
            className="seva-card text-left bg-[#FFFFFF] rounded-xl border border-[#C5A267] hover:border-[#087F68] p-5 sm:p-6 flex flex-col justify-between transition-colors cursor-pointer"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold tracking-wider uppercase text-slate-600">
                <span>3 · {t.cards.documents}</span>
                <FileText className="w-5 h-5 text-[#C5A267]" />
              </div>

              <div className="space-y-1">
                <div className="font-display text-xl sm:text-2xl font-extrabold text-[#101B2D]">
                  {expiringDoc.completed
                    ? 'Supporting document prepared (Local Demo)'
                    : 'Supporting document approaching expiry'}
                </div>
                <p className="text-sm text-slate-700 tabular-nums">
                  {expiringDoc.name} ({expiringDoc.daysRemaining} days left · {expiringDoc.verificationStatus})
                </p>
              </div>

              <p className="text-base text-[#101B2D] leading-relaxed">
                Action needed: {expiringDoc.requiredAction}.
              </p>
            </div>

            <div className="pt-4 mt-5 border-t border-[#E2D9C8] flex items-center justify-between text-sm font-bold text-[#087F68]">
              <span>Review supporting documents</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 4: PAYMENT */}
          <div
            onClick={() => setActivePage('payment-diagnosis')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActivePage('payment-diagnosis');
              }
            }}
            className="seva-card text-left bg-[#FFFFFF] rounded-xl border-2 border-[#B42332] p-5 sm:p-6 flex flex-col justify-between transition-colors cursor-pointer"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold tracking-wider uppercase text-[#B42332]">
                <span>4 · {t.cards.payment}</span>
                <AlertTriangle className="w-5 h-5 text-[#B42332]" />
              </div>

              <div className="space-y-1">
                <div className="font-display text-xl sm:text-2xl font-extrabold text-[#B42332]">
                  {stateMachines.payment === 'Delayed'
                    ? 'Delayed — investigate the recorded cause'
                    : `${stateMachines.payment} — inspect payment status`}
                </div>
                <p className="text-sm font-mono text-slate-700 tabular-nums">
                  3 months late · Event: NEFT_RETURN_ERR_IFSC_MERGED_404
                </p>
              </div>

              <p className="text-base text-[#101B2D] leading-relaxed">
                3 monthly installments (₹2,500/mo) returned due to post-merger branch IFSC code. Application remains {stateMachines.application}.
              </p>
            </div>

            <div className="pt-4 mt-5 border-t border-[#E2D9C8]">
              <span className="w-full py-2.5 px-3 rounded-lg bg-[#087F68] text-white text-sm font-bold inline-flex items-center justify-center gap-2">
                <Stethoscope className="w-4 h-4" />
                <span>{t.understandPaymentDelay}</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Polished Evaluator Mode Quick-Launch Bar on Dashboard */}
      <section
        aria-label="Evaluator Scenario Quick Launchers"
        className="seva-card bg-[#FFFFFF] rounded-xl p-5 sm:p-6 space-y-3 border-2 border-[#C5A267]"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-[#087F68]" />
            <h2 className="font-display text-lg sm:text-xl font-bold text-[#101B2D]">
              Judge &amp; Evaluator Mode — Launch Interactive Scenarios
            </h2>
          </div>
          <button
            type="button"
            onClick={resetEntireDemo}
            className="px-3 py-1.5 rounded-lg border border-[#C5A267] bg-[#F5F0E6] text-[#101B2D] text-xs font-bold inline-flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Initial Scenario</span>
          </button>
        </div>
        <p className="text-sm text-slate-700">
          Every scenario below executes real state machine transitions, diagnostic rules, caregiver safeguards, and audit history logs:
        </p>
        <div className="flex flex-wrap gap-2">
          {DASHBOARD_SCENARIOS.map((sc) => (
            <button
              key={sc.num}
              type="button"
              onClick={() => launchEvaluatorScenario(sc.num)}
              className="px-3.5 py-2 rounded-lg bg-[#F5F0E6] hover:bg-[#087F68] hover:text-white text-[#101B2D] border border-[#C5A267] text-xs sm:text-sm font-bold transition-colors"
            >
              {sc.label}
            </button>
          ))}
        </div>
      </section>

      {/* What should I do next? + Recommended Actions Checklist */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 seva-card bg-[#FFFFFF] rounded-xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="space-y-0.5">
              <h2 className="font-display text-2xl font-bold text-[#101B2D]">
                {t.whatShouldIDoNext}
              </h2>
              <p className="text-xs font-mono text-[#087F68] font-bold">
                Derived from live beneficiary state · {pendingChecklistCount} pending / {completedChecklistCount} completed
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                speakText(
                  'Recommended next step: First, inspect the 3-month payment delay diagnosis to get your post-merger IFSC update slip. Second, complete your annual life verification within 12 days.'
                )
              }
              className="text-sm font-bold text-[#087F68] hover:underline inline-flex items-center gap-1.5"
            >
              <Volume2 className="w-4 h-4" />
              Read steps aloud
            </button>
          </div>

          <p className="text-base text-slate-700">
            Your pension application is <strong>{stateMachines.application}</strong>. You do not need to reapply. Complete these prioritised next actions:
          </p>

          <div className="space-y-3">
            {checklist.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  item.completed
                    ? 'bg-[#F5F0E6] border-[#087F68]'
                    : 'bg-[#FFFFFF] border-[#E2D9C8]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleChecklistItem(item.id)}
                  className="flex items-start gap-3 text-left flex-1"
                >
                  {item.completed ? (
                    <CheckSquare className="w-5 h-5 text-[#087F68] shrink-0 mt-0.5" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <div
                      className={`text-base font-bold ${
                        item.completed ? 'line-through text-slate-600' : 'text-[#101B2D]'
                      }`}
                    >
                      {item.title}
                    </div>
                    <p className="text-sm text-slate-700">{item.description}</p>
                    <div className="text-xs font-medium text-slate-600 pt-0.5">
                      <span>Category: {item.category}</span>
                      <span aria-hidden="true"> · </span>
                      <span>Source: {item.source}</span>
                      <span aria-hidden="true"> · </span>
                      <span className="font-bold text-[#087F68]">
                        {item.completed ? 'Completed' : 'Pending Action'}
                      </span>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActivePage(getCategoryTargetPage(item.category))}
                  className="px-3 py-1.5 rounded-lg border border-[#C5A267] bg-[#F5F0E6] hover:bg-[#ebe3d3] text-[#101B2D] text-xs font-bold inline-flex items-center gap-1 shrink-0 self-end sm:self-center"
                >
                  <span>Open Workflow</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setActivePage('payment-diagnosis')}
              className="px-4 py-2.5 rounded-lg bg-[#087F68] hover:bg-[#066552] text-white text-sm sm:text-base font-bold inline-flex items-center gap-2"
            >
              <Stethoscope className="w-4 h-4" />
              <span>{t.understandPaymentDelay}</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePage('assisted-completion')}
              className="px-4 py-2.5 rounded-lg border border-[#C5A267] bg-[#F5F0E6] hover:bg-[#ebe3d3] text-[#101B2D] text-sm sm:text-base font-bold"
            >
              Request Doorstep Verification Help
            </button>
          </div>
        </div>

        {/* Upcoming Reminders & Deadlines */}
        <div className="lg:col-span-5 seva-card bg-[#FFFFFF] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-[#101B2D] flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-[#087F68]" />
              <span>Upcoming Deadlines</span>
            </h2>
            <button
              type="button"
              onClick={() => setActivePage('documents-deadlines')}
              className="text-sm font-bold text-[#087F68] hover:underline"
            >
              Manage reminders
            </button>
          </div>

          <div className="space-y-3">
            {deadlines.map((dl) => (
              <div
                key={dl.id}
                className="p-4 rounded-xl border border-[#E2D9C8] bg-[#F5F0E6]/60 flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="text-base font-bold text-[#101B2D]">{dl.title}</div>
                  <div className="text-sm text-slate-700 tabular-nums">
                    <span>Process: {dl.process}</span>
                    <span aria-hidden="true"> · </span>
                    <span>Due: {dl.dueDate}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`text-sm font-mono font-bold tabular-nums ${
                      dl.daysRemaining <= 12 ? 'text-[#B42332]' : 'text-[#101B2D]'
                    }`}
                  >
                    {dl.daysRemaining} days
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-[#F5F0E6] border border-[#C5A267] text-sm text-[#101B2D] space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Info className="w-4 h-4 text-[#087F68]" />
              <span>Why Verification Says “Due in 12 Days”</span>
            </div>
            <p className="text-slate-800">
              Your verification is still valid today. It did not cause the past 3-month payment delay, which started before your verification window opened.
            </p>
          </div>
        </div>
      </section>

      {/* Hidden in One-Task-at-a-Time Focus Mode to reduce cognitive load */}
      {!accessibility.oneTaskAtATime && (
        <>
          {/* Four-Lane Benefit-Status Timeline with Dotted Hypothesis Links */}
          <section
            aria-labelledby="four-lane-heading"
            className="seva-card bg-[#FFFFFF] rounded-xl p-6 space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2
                  id="four-lane-heading"
                  className="font-display text-2xl font-bold text-[#101B2D]"
                >
                  {t.fourLaneTimelineTitle}
                </h2>
                <p className="text-sm text-slate-700">
                  Visualizing the 4 independent state machines and how cross-process hypotheses are evaluated without automatic state corruption.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivePage('my-benefits')}
                className="text-sm font-bold text-[#087F68] hover:underline shrink-0"
              >
                Open Interactive State Machine Inspector →
              </button>
            </div>

            {/* SVG + HTML Swimlane Diagram */}
            <div className="overflow-x-auto">
              <div className="min-w-[760px] space-y-3">
                {/* Lane 1: Application */}
                <div className="grid grid-cols-12 items-center gap-3 p-3.5 rounded-xl bg-[#F5F0E6]/60 border border-[#E2D9C8]">
                  <div className="col-span-3">
                    <div className="text-xs font-bold uppercase text-slate-600">
                      Lane 1 · Application
                    </div>
                    <div className="text-base font-bold text-[#087F68]">
                      {stateMachines.application}
                    </div>
                  </div>
                  <div className="col-span-9 grid grid-cols-4 gap-2 text-sm">
                    {(['Draft', 'Submitted', 'Under review', 'Approved'] as const).map((step) => {
                      const active = stateMachines.application === step;
                      return (
                        <div
                          key={step}
                          className={`px-3 py-2 rounded-lg border text-center font-semibold ${
                            active
                              ? 'bg-[#087F68] border-[#087F68] text-white font-bold'
                              : 'bg-white border-[#E2D9C8] text-slate-600'
                          }`}
                        >
                          {step} {active ? '(Current)' : ''}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Dotted Hypothesis Connector */}
                <div className="flex items-center justify-center gap-3 py-0.5 text-xs font-mono text-[#101B2D]">
                  <svg width="120" height="14" aria-hidden="true">
                    <line
                      x1="0"
                      y1="7"
                      x2="120"
                      y2="7"
                      stroke="#087F68"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                  </svg>
                  <span className="px-2.5 py-1 rounded bg-[#F5F0E6] border border-[#C5A267] text-[#101B2D] font-bold">
                    {t.mayAffectHypothesis}: Delayed payment does NOT revoke Approved application
                  </span>
                  <svg width="120" height="14" aria-hidden="true">
                    <line
                      x1="0"
                      y1="7"
                      x2="120"
                      y2="7"
                      stroke="#087F68"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                  </svg>
                </div>

                {/* Lane 2: Verification */}
                <div className="grid grid-cols-12 items-center gap-3 p-3.5 rounded-xl bg-[#F5F0E6]/60 border border-[#E2D9C8]">
                  <div className="col-span-3">
                    <div className="text-xs font-bold uppercase text-slate-600">
                      Lane 2 · Verification
                    </div>
                    <div className="text-base font-bold text-[#101B2D]">
                      {stateMachines.verification} (Due in 12d)
                    </div>
                  </div>
                  <div className="col-span-9 grid grid-cols-4 gap-2 text-sm">
                    {(['Not started', 'Due soon', 'In progress', 'Verified'] as const).map(
                      (step) => {
                        const active = stateMachines.verification === step;
                        return (
                          <div
                            key={step}
                            className={`px-3 py-2 rounded-lg border text-center font-semibold ${
                              active
                                ? 'bg-[#C5A267]/30 border-[#C5A267] text-[#101B2D] font-bold'
                                : 'bg-white border-[#E2D9C8] text-slate-600'
                            }`}
                          >
                            {step} {active ? '(Current)' : ''}
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* Dotted Hypothesis Connector 2 */}
                <div className="flex items-center justify-center gap-3 py-0.5 text-xs font-mono text-[#101B2D]">
                  <svg width="120" height="14" aria-hidden="true">
                    <line
                      x1="0"
                      y1="7"
                      x2="120"
                      y2="7"
                      stroke="#B42332"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                  </svg>
                  <span className="px-2.5 py-1 rounded bg-[#F5F0E6] border border-[#C5A267] text-[#101B2D] font-bold">
                    {t.mayAffectHypothesis}: Verification is valid for 12 days; check IFSC for past payment delay
                  </span>
                  <svg width="120" height="14" aria-hidden="true">
                    <line
                      x1="0"
                      y1="7"
                      x2="120"
                      y2="7"
                      stroke="#B42332"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                  </svg>
                </div>

                {/* Lane 3: Renewal */}
                <div className="grid grid-cols-12 items-center gap-3 p-3.5 rounded-xl bg-[#F5F0E6]/60 border border-[#E2D9C8]">
                  <div className="col-span-3">
                    <div className="text-xs font-bold uppercase text-slate-600">
                      Lane 3 · Renewal
                    </div>
                    <div className="text-base font-bold text-[#101B2D]">
                      {stateMachines.renewal}
                    </div>
                  </div>
                  <div className="col-span-9 grid grid-cols-4 gap-2 text-sm">
                    {(['Not due', 'Due soon', 'Submitted', 'Renewed'] as const).map((step) => {
                      const active = stateMachines.renewal === step;
                      return (
                        <div
                          key={step}
                          className={`px-3 py-2 rounded-lg border text-center font-semibold ${
                            active
                              ? 'bg-[#C5A267]/30 border-[#C5A267] text-[#101B2D] font-bold'
                              : 'bg-white border-[#E2D9C8] text-slate-600'
                          }`}
                        >
                          {step} {active ? '(Current)' : ''}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Lane 4: Payment */}
                <div className="grid grid-cols-12 items-center gap-3 p-3.5 rounded-xl bg-[#F5F0E6]/60 border border-[#E2D9C8]">
                  <div className="col-span-3">
                    <div className="text-xs font-bold uppercase text-slate-600">
                      Lane 4 · Payment
                    </div>
                    <div className="text-base font-bold text-[#B42332]">
                      {stateMachines.payment}
                    </div>
                  </div>
                  <div className="col-span-9 grid grid-cols-4 gap-2 text-sm">
                    {(['Scheduled', 'Processing', 'Delayed', 'Credited'] as const).map((step) => {
                      const active = stateMachines.payment === step;
                      return (
                        <div
                          key={step}
                          className={`px-3 py-2 rounded-lg border text-center font-semibold ${
                            active
                              ? 'bg-[#B42332] border-[#B42332] text-white font-bold'
                              : 'bg-white border-[#E2D9C8] text-slate-600'
                          }`}
                        >
                          {step} {active ? '(Current)' : ''}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Recent Activity Log Preview */}
          <section className="seva-card bg-[#FFFFFF] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-[#101B2D]">
                Recent Activity &amp; Safeguard Log
              </h2>
              <button
                type="button"
                onClick={() => setActivePage('notifications-activity')}
                className="text-sm font-bold text-[#087F68] hover:underline"
              >
                View full audit history ({auditEvents.length}) →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#E2D9C8] text-slate-600">
                    <th className="py-2.5 pr-4 font-bold">Timestamp</th>
                    <th className="py-2.5 pr-4 font-bold">Actor</th>
                    <th className="py-2.5 pr-4 font-bold">Action</th>
                    <th className="py-2.5 font-bold">Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2D9C8]/60">
                  {auditEvents.slice(0, 4).map((ev) => (
                    <tr key={ev.id}>
                      <td className="py-3 pr-4 font-mono text-xs text-slate-600 tabular-nums whitespace-nowrap">
                        {ev.timestamp}
                      </td>
                      <td className="py-3 pr-4 font-bold text-[#101B2D] whitespace-nowrap">
                        {ev.actor}
                      </td>
                      <td className="py-3 pr-4 text-slate-800">{ev.action}</td>
                      <td className="py-3 font-bold text-[#087F68] whitespace-nowrap">
                        {ev.outcome}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
};
