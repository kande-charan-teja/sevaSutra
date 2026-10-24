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
  ShieldAlert,
  Square,
  Stethoscope,
  Volume2,
} from 'lucide-react';
import { useSevaSutra } from '../context/SevaSutraContext';

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
  } = useSevaSutra();

  const expiringDoc =
    documents.find((d) => d.id === 'doc-disability-cert') || documents[1];

  const handleReadOverview = () => {
    speakText(
      `${t.dashboardIntro} Application status is ${stateMachines.application}. Identity verification is Due in 12 days. Supporting document is approaching expiry in ${expiringDoc.daysRemaining} days. Pension payment is ${stateMachines.payment}, three months late.`
    );
  };

  return (
    <div className="space-y-8">
      {/* Top Banner: Simple-language introduction & Beneficiary Context */}
      <section
        aria-labelledby="overview-heading"
        className="seva-card bg-white rounded-xl border border-slate-200 p-6 space-y-4"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="text-xs font-medium text-slate-500">
              <span>{beneficiary.schemeName}</span>
              <span aria-hidden="true"> · </span>
              <span className="font-mono">Sanction #{beneficiary.pensionId}</span>
              <span aria-hidden="true"> · </span>
              <span>{beneficiary.district}</span>
            </div>
            <h1
              id="overview-heading"
              className="text-2xl sm:text-3xl font-bold text-[#102137] tracking-tight"
            >
              Namaste, {beneficiary.name} (Age {beneficiary.age})
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleReadOverview}
              className="px-4 py-2 rounded-lg bg-[#087F78] hover:bg-[#066963] text-white text-sm font-semibold inline-flex items-center gap-2 whitespace-nowrap transition-colors"
            >
              <Volume2 className="w-4 h-4" />
              <span>{t.readAloudButton}</span>
            </button>

            <button
              type="button"
              onClick={() =>
                updateAccessibility({ oneTaskAtATime: !accessibility.oneTaskAtATime })
              }
              className={`px-4 py-2 rounded-lg border text-sm font-medium whitespace-nowrap transition-colors ${
                accessibility.oneTaskAtATime
                  ? 'bg-[#102137] text-white border-[#102137]'
                  : 'bg-slate-50 text-[#102137] border-slate-300 hover:bg-slate-100'
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#E0F4EF]/60 rounded-lg p-4 border border-[#087F78]/20">
          <p className="text-base sm:text-lg font-medium text-[#102137]">
            “{t.dashboardIntro}”
          </p>
          <div className="text-xs text-slate-700 shrink-0 space-y-0.5">
            <div>
              <strong>Accessibility Profile:</strong> Low vision &amp; hearing loss
            </div>
            <div>
              <strong>Digital Helper:</strong> {beneficiary.supportPersonName} ({beneficiary.supportPersonRelation})
            </div>
          </div>
        </div>

        {/* Access Concern Warning Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg bg-amber-50/90 border border-amber-300/80 px-4 py-3 text-sm text-[#102137]">
          <div className="flex items-start sm:items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-[#C44848] shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <strong className="font-semibold">Caregiver Access Safeguard Active: </strong>
              <span>{beneficiary.accessConcernSummary}</span>
              {highRiskRequest.status !== 'None' && (
                <span className="ml-2 font-semibold text-[#C44848]">
                  (Status: {highRiskRequest.status.replace(/_/g, ' ')})
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActivePage('caregiver-access')}
            className="px-3 py-1.5 rounded-md bg-[#102137] text-white text-xs font-semibold hover:bg-slate-800 whitespace-nowrap shrink-0"
          >
            Review Caregiver Safeguards
          </button>
        </div>
      </section>

      {/* Four Independently Maintained Process Cards */}
      <section aria-label="Four Independent Benefit Process Cards">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#102137]">
            Four Separate Benefit Processes (Independent Status Tracking)
          </h2>
          <span className="text-xs text-slate-600">
            A delayed payment never automatically cancels an approved application
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
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
            className="seva-card text-left bg-white rounded-xl border border-slate-200 hover:border-[#087F78] p-5 flex flex-col justify-between transition-colors cursor-pointer"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold tracking-wider text-slate-500">
                <span>1 · {t.cards.application}</span>
                <CheckCircle2 className="w-4 h-4 text-[#087F78]" />
              </div>

              <div className="space-y-1">
                <div className="text-xl font-bold text-[#087F78] flex items-center gap-2">
                  <span>{stateMachines.application}</span>
                </div>
                <p className="text-xs text-slate-500 tabular-nums">
                  Last event: {stateMachines.lastUpdated.application}
                </p>
              </div>

              <p className="text-sm text-slate-700">{stateMachines.events.application}</p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#087F78]">
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
            className="seva-card text-left bg-white rounded-xl border border-slate-200 hover:border-[#087F78] p-5 flex flex-col justify-between transition-colors cursor-pointer"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold tracking-wider text-slate-500">
                <span>2 · {t.cards.verification}</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>

              <div className="space-y-1">
                <div className="text-xl font-bold text-[#102137] tabular-nums">
                  Due in 12 days
                </div>
                <p className="text-xs text-slate-600">
                  State machine: <strong>{stateMachines.verification}</strong> (Not Expired)
                </p>
              </div>

              <p className="text-sm text-slate-700">
                Next action: Complete annual life certificate checklist or book doorstep officer visit before Nov 05.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#087F78]">
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
            className="seva-card text-left bg-white rounded-xl border border-slate-200 hover:border-[#087F78] p-5 flex flex-col justify-between transition-colors cursor-pointer"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold tracking-wider text-slate-500">
                <span>3 · {t.cards.documents}</span>
                <FileText className="w-4 h-4 text-amber-600" />
              </div>

              <div className="space-y-1">
                <div className="text-xl font-bold text-[#102137]">
                  Approaching expiry
                </div>
                <p className="text-xs text-slate-600 tabular-nums">
                  {expiringDoc.name} ({expiringDoc.daysRemaining} days left)
                </p>
              </div>

              <p className="text-sm text-slate-700">
                Action needed: {expiringDoc.requiredAction}.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#087F78]">
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
            className="seva-card text-left bg-white rounded-xl border border-[#C44848]/50 hover:border-[#C44848] p-5 flex flex-col justify-between transition-colors cursor-pointer"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold tracking-wider text-[#C44848]">
                <span>4 · {t.cards.payment}</span>
                <AlertTriangle className="w-4 h-4 text-[#C44848]" />
              </div>

              <div className="space-y-1">
                <div className="text-xl font-bold text-[#C44848] flex items-center gap-1.5">
                  <span>{stateMachines.payment}</span>
                  <span className="text-sm font-normal text-slate-700 tabular-nums">
                    (3 months late)
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-600">
                  Event: NEFT_RETURN_ERR_IFSC_MERGED_404
                </p>
              </div>

              <p className="text-sm text-slate-700">
                3 monthly installments (₹2,500/mo) returned due to post-merger branch IFSC code. Application remains Approved.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100">
              <span className="w-full py-2 px-3 rounded-lg bg-[#087F78] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5" />
                <span>{t.understandPaymentDelay}</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* What should I do next? + Recommended Actions Checklist */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 seva-card bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#102137]">{t.whatShouldIDoNext}</h2>
            <button
              type="button"
              onClick={() =>
                speakText(
                  'Recommended next step: First, inspect the 3-month payment delay diagnosis to get your post-merger IFSC update slip. Second, complete your annual life verification within 12 days.'
                )
              }
              className="text-xs font-semibold text-[#087F78] hover:underline inline-flex items-center gap-1"
            >
              <Volume2 className="w-3.5 h-3.5" />
              Read steps aloud
            </button>
          </div>

          <p className="text-sm text-slate-600">
            Your pension application is <strong>Approved</strong>. You do not need to reapply. Complete these safe, step-by-step actions:
          </p>

          <div className="space-y-3">
            {checklist.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-lg border transition-colors flex items-start justify-between gap-3 ${
                  item.completed
                    ? 'bg-[#E0F4EF]/50 border-[#087F78]/30'
                    : 'bg-slate-50/70 border-slate-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleChecklistItem(item.id)}
                  className="flex items-start gap-3 text-left flex-1"
                >
                  {item.completed ? (
                    <CheckSquare className="w-5 h-5 text-[#087F78] shrink-0 mt-0.5" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5">
                    <div
                      className={`text-sm font-semibold ${
                        item.completed ? 'line-through text-slate-600' : 'text-[#102137]'
                      }`}
                    >
                      {item.title}
                    </div>
                    <p className="text-xs text-slate-600">{item.description}</p>
                    <div className="text-[11px] text-slate-500 pt-0.5">
                      <span>Category: {item.category}</span>
                      <span aria-hidden="true"> · </span>
                      <span>Source: {item.source}</span>
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setActivePage('payment-diagnosis')}
              className="px-4 py-2 rounded-lg bg-[#087F78] hover:bg-[#066963] text-white text-sm font-semibold inline-flex items-center gap-2"
            >
              <Stethoscope className="w-4 h-4" />
              <span>{t.understandPaymentDelay}</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePage('assisted-completion')}
              className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-[#102137] text-sm font-semibold"
            >
              Request Doorstep Verification Help
            </button>
          </div>
        </div>

        {/* Upcoming Reminders & Deadlines */}
        <div className="lg:col-span-5 seva-card bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#102137] flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-[#087F78]" />
              <span>Upcoming Reminders</span>
            </h2>
            <button
              type="button"
              onClick={() => setActivePage('documents-deadlines')}
              className="text-xs font-semibold text-[#087F78] hover:underline"
            >
              Manage reminders
            </button>
          </div>

          <div className="space-y-3">
            {deadlines.map((dl) => (
              <div
                key={dl.id}
                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="text-sm font-semibold text-[#102137]">{dl.title}</div>
                  <div className="text-xs text-slate-600 tabular-nums">
                    <span>Process: {dl.process}</span>
                    <span aria-hidden="true"> · </span>
                    <span>Due: {dl.dueDate}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`text-xs font-mono font-bold tabular-nums ${
                      dl.daysRemaining <= 12 ? 'text-[#C44848]' : 'text-[#102137]'
                    }`}
                  >
                    {dl.daysRemaining} days
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-lg bg-[#E0F4EF]/60 border border-[#087F78]/20 text-xs text-[#102137] space-y-1">
            <div className="font-semibold flex items-center gap-1.5">
              <Info className="w-4 h-4 text-[#087F78]" />
              <span>Why Verification Says “Due in 12 Days”</span>
            </div>
            <p className="text-slate-700">
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
            className="seva-card bg-white rounded-xl border border-slate-200 p-6 space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 id="four-lane-heading" className="text-lg font-bold text-[#102137]">
                  {t.fourLaneTimelineTitle}
                </h2>
                <p className="text-xs text-slate-600">
                  Visualizing the 4 independent state machines and how cross-process hypotheses are evaluated without automatic state corruption.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivePage('my-benefits')}
                className="text-xs font-semibold text-[#087F78] hover:underline shrink-0"
              >
                Open Interactive State Machine Inspector →
              </button>
            </div>

            {/* SVG + HTML Swimlane Diagram */}
            <div className="overflow-x-auto">
              <div className="min-w-[760px] space-y-3">
                {/* Lane 1: Application */}
                <div className="grid grid-cols-12 items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="col-span-3">
                    <div className="text-xs font-bold uppercase text-slate-500">Lane 1 · Application</div>
                    <div className="text-sm font-bold text-[#087F78]">{stateMachines.application}</div>
                  </div>
                  <div className="col-span-9 grid grid-cols-4 gap-2 text-xs">
                    {(['Draft', 'Submitted', 'Under review', 'Approved'] as const).map((step) => {
                      const active = stateMachines.application === step;
                      return (
                        <div
                          key={step}
                          className={`px-3 py-2 rounded border text-center font-medium ${
                            active
                              ? 'bg-[#E0F4EF] border-[#087F78] text-[#102137] font-bold'
                              : 'bg-white border-slate-200 text-slate-500'
                          }`}
                        >
                          {step} {active ? '✓' : ''}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Dotted Hypothesis Connector */}
                <div className="flex items-center justify-center gap-3 py-0.5 text-[11px] font-mono text-slate-600">
                  <svg width="120" height="14" aria-hidden="true">
                    <line
                      x1="0"
                      y1="7"
                      x2="120"
                      y2="7"
                      stroke="#087F78"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                  </svg>
                  <span className="px-2 py-0.5 rounded bg-[#E0F4EF]/70 text-[#102137] font-semibold">
                    {t.mayAffectHypothesis}: Delayed payment does NOT revoke Approved application
                  </span>
                  <svg width="120" height="14" aria-hidden="true">
                    <line
                      x1="0"
                      y1="7"
                      x2="120"
                      y2="7"
                      stroke="#087F78"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                  </svg>
                </div>

                {/* Lane 2: Verification */}
                <div className="grid grid-cols-12 items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="col-span-3">
                    <div className="text-xs font-bold uppercase text-slate-500">Lane 2 · Verification</div>
                    <div className="text-sm font-bold text-[#102137]">
                      {stateMachines.verification} (Due in 12d)
                    </div>
                  </div>
                  <div className="col-span-9 grid grid-cols-4 gap-2 text-xs">
                    {(['Not started', 'Due soon', 'In progress', 'Verified'] as const).map((step) => {
                      const active = stateMachines.verification === step;
                      return (
                        <div
                          key={step}
                          className={`px-3 py-2 rounded border text-center font-medium ${
                            active
                              ? 'bg-amber-50 border-amber-500 text-[#102137] font-bold'
                              : 'bg-white border-slate-200 text-slate-500'
                          }`}
                        >
                          {step} {active ? '●' : ''}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Dotted Hypothesis Connector 2 */}
                <div className="flex items-center justify-center gap-3 py-0.5 text-[11px] font-mono text-slate-600">
                  <svg width="120" height="14" aria-hidden="true">
                    <line
                      x1="0"
                      y1="7"
                      x2="120"
                      y2="7"
                      stroke="#C44848"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                  </svg>
                  <span className="px-2 py-0.5 rounded bg-amber-50 text-[#102137] font-semibold">
                    {t.mayAffectHypothesis}: Verification is still valid for 12 days; check IFSC for past payment delay
                  </span>
                  <svg width="120" height="14" aria-hidden="true">
                    <line
                      x1="0"
                      y1="7"
                      x2="120"
                      y2="7"
                      stroke="#C44848"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                  </svg>
                </div>

                {/* Lane 3: Renewal */}
                <div className="grid grid-cols-12 items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="col-span-3">
                    <div className="text-xs font-bold uppercase text-slate-500">Lane 3 · Renewal</div>
                    <div className="text-sm font-bold text-[#102137]">{stateMachines.renewal}</div>
                  </div>
                  <div className="col-span-9 grid grid-cols-4 gap-2 text-xs">
                    {(['Not due', 'Due soon', 'Submitted', 'Renewed'] as const).map((step) => {
                      const active = stateMachines.renewal === step;
                      return (
                        <div
                          key={step}
                          className={`px-3 py-2 rounded border text-center font-medium ${
                            active
                              ? 'bg-amber-50 border-amber-500 text-[#102137] font-bold'
                              : 'bg-white border-slate-200 text-slate-500'
                          }`}
                        >
                          {step} {active ? '●' : ''}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Lane 4: Payment */}
                <div className="grid grid-cols-12 items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="col-span-3">
                    <div className="text-xs font-bold uppercase text-slate-500">Lane 4 · Payment</div>
                    <div className="text-sm font-bold text-[#C44848]">{stateMachines.payment}</div>
                  </div>
                  <div className="col-span-9 grid grid-cols-4 gap-2 text-xs">
                    {(['Scheduled', 'Processing', 'Delayed', 'Credited'] as const).map((step) => {
                      const active = stateMachines.payment === step;
                      return (
                        <div
                          key={step}
                          className={`px-3 py-2 rounded border text-center font-medium ${
                            active
                              ? 'bg-red-50 border-[#C44848] text-[#C44848] font-bold'
                              : 'bg-white border-slate-200 text-slate-500'
                          }`}
                        >
                          {step} {active ? '▲' : ''}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Recent Activity Log Preview */}
          <section className="seva-card bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#102137]">Recent Activity &amp; Safeguard Log</h2>
              <button
                type="button"
                onClick={() => setActivePage('notifications-activity')}
                className="text-xs font-semibold text-[#087F78] hover:underline"
              >
                View full audit history ({auditEvents.length}) →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2 pr-4 font-medium">Timestamp</th>
                    <th className="py-2 pr-4 font-medium">Actor</th>
                    <th className="py-2 pr-4 font-medium">Action</th>
                    <th className="py-2 font-medium">Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditEvents.slice(0, 4).map((ev) => (
                    <tr key={ev.id}>
                      <td className="py-2.5 pr-4 font-mono text-xs text-slate-500 tabular-nums whitespace-nowrap">
                        {ev.timestamp}
                      </td>
                      <td className="py-2.5 pr-4 font-medium text-[#102137] whitespace-nowrap">
                        {ev.actor}
                      </td>
                      <td className="py-2.5 pr-4 text-slate-700">{ev.action}</td>
                      <td className="py-2.5 font-semibold text-[#102137] whitespace-nowrap">
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
