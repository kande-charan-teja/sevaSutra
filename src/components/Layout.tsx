import React, { useState } from 'react';
import {
  Bell,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  Cpu,
  Eye,
  HeartHandshake,
  Home,
  Layers,
  Menu,
  PlayCircle,
  RotateCcw,
  ShieldAlert,
  Sliders,
  Stethoscope,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import { useSevaSutra } from '../context/SevaSutraContext';
import { PageId, UserRole } from '../types/models';

const NAV_ITEMS: Array<{ id: PageId; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'overview', icon: Home },
  { id: 'my-benefits', icon: Layers },
  { id: 'payment-diagnosis', icon: Stethoscope },
  { id: 'documents-deadlines', icon: CalendarClock },
  { id: 'caregiver-access', icon: ShieldAlert },
  { id: 'notifications-activity', icon: Bell },
  { id: 'explore-benefits', icon: Compass },
  { id: 'assisted-completion', icon: HeartHandshake },
  { id: 'accessibility-settings', icon: Sliders },
  { id: 'technical-evaluation', icon: Cpu },
];

interface WalkthroughStepSpec {
  step: number;
  title: string;
  instruction: string;
  actionLabel?: string;
}

const WALKTHROUGH_STEPS: WalkthroughStepSpec[] = [
  {
    step: 1,
    title: '1. Open Lakshmi Devi’s Dashboard',
    instruction:
      'Inspect Lakshmi Devi’s profile (Age 72, Approved pension, Verification due in 12 days, Payment 3 months delayed).',
  },
  {
    step: 2,
    title: '2. Inspect Four Independent Process States',
    instruction:
      'Notice the 4 separate cards (Application, Verification, Documents, Payment) and the 12-day verification countdown.',
  },
  {
    step: 3,
    title: '3. Open Payment Diagnosis & Inspect Evidence',
    instruction:
      'Review the rule-based diagnosis explaining why payment is delayed (merged branch IFSC) while verification is still valid for 12 days.',
  },
  {
    step: 4,
    title: '4. Add Recommended Action to Checklist',
    instruction:
      'Click "Add to my checklist" on the diagnosis result card to save the recommended step.',
    actionLabel: 'Add Diagnosis Action to Checklist Now',
  },
  {
    step: 5,
    title: '5. Open Caregiver Permissions',
    instruction:
      'Inspect Arjun’s 4 scoped permissions (View status, Help with documents, View reminders, Prepare enquiry).',
  },
  {
    step: 6,
    title: '6. Simulate Unsafe Bank Account Redirection',
    instruction:
      'Trigger the caregiver’s request to redirect Lakshmi Devi’s pension to the caregiver’s own bank account.',
    actionLabel: 'Simulate Request to Change Bank Account',
  },
  {
    step: 7,
    title: '7. Observe Blocked Request & 72-Hour Cooling-Off',
    instruction:
      'Observe that immediate execution is blocked, self-approval is prevented, and a 72-hour cooling-off period with trusted-contact alert has started.',
  },
  {
    step: 8,
    title: '8. Revoke Caregiver Access While Action Is Pending',
    instruction:
      'Revoke Arjun’s caregiver permissions while the high-risk bank change request is still pending.',
    actionLabel: 'Revoke Caregiver Access Now',
  },
  {
    step: 9,
    title: '9. Confirm Quarantine & Post-Revocation Denial',
    instruction:
      'Verify that the pending bank change is quarantined/cancelled and any attempt to continue after revocation is denied.',
    actionLabel: 'Test Post-Revocation Continuation Attempt',
  },
  {
    step: 10,
    title: '10. Demonstrate Larger Text or Read-Aloud',
    instruction:
      'Toggle Large Text, High Contrast, Telugu language, or Read-Aloud speech synthesis.',
    actionLabel: 'Toggle Large Text + Read Aloud',
  },
  {
    step: 11,
    title: '11. Simulate Connectivity Loss & Recovery Read-Back',
    instruction:
      'Drop connectivity mid-verification to see "Saved locally — not submitted", then reconnect to hear the exact state read-back.',
    actionLabel: 'Trigger Offline Drop -> Reconnect Demo',
  },
  {
    step: 12,
    title: '12. Run Evaluation Benchmarks or Reset Demo',
    instruction:
      'Run the live Security & Diagnostic benchmarks on the Evaluation page, or click "Reset Demo" to repeat the sequence.',
    actionLabel: 'Reset Demo Sequence',
  },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    activePage,
    setActivePage,
    activeRole,
    setActiveRole,
    beneficiary,
    t,
    notifications,
    isOfflineSimulated,
    offlineDraft,
    simulateConnectivityLoss,
    restoreConnectivity,
    accessibility,
    updateAccessibility,
    setLanguage,
    spokenTranscriptBanner,
    speakText,
    stopSpeech,
    lastActionFeedback,
    clearFeedback,
    guidedDemoActive,
    guidedDemoStep,
    startGuidedWalkthrough,
    setGuidedWalkthroughStep,
    closeGuidedWalkthrough,
    resetEntireDemo,
    addChecklistItem,
    triggerUnsafeBankChangeDemo,
    revokeAllCaregiverPermissions,
    triggerPostRevocationAttempt,
  } = useSevaSutra();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const currentWalkthrough =
    WALKTHROUGH_STEPS.find((w) => w.step === guidedDemoStep) || WALKTHROUGH_STEPS[0];

  const handleWalkthroughQuickAction = () => {
    if (guidedDemoStep === 4) {
      addChecklistItem(
        'Submit updated branch IFSC code for own bank account & complete verification within 12 days',
        'Added during guided evaluator walkthrough from Payment Diagnosis.',
        'Payment Diagnosis',
        'Guided Demo Step 4'
      );
    } else if (guidedDemoStep === 6) {
      triggerUnsafeBankChangeDemo();
    } else if (guidedDemoStep === 8) {
      revokeAllCaregiverPermissions();
    } else if (guidedDemoStep === 9) {
      triggerPostRevocationAttempt();
    } else if (guidedDemoStep === 10) {
      updateAccessibility({
        textSize: accessibility.textSize === 'normal' ? 'large' : 'normal',
      });
      speakText(t.dashboardIntro);
    } else if (guidedDemoStep === 11) {
      if (!isOfflineSimulated) {
        simulateConnectivityLoss();
      } else {
        restoreConnectivity();
      }
    } else if (guidedDemoStep === 12) {
      resetEntireDemo();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC] text-[#102137]">
      {/* Skip to main content link for keyboard and screen-reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-[#102137] focus:text-white focus:px-4 focus:py-2 focus:rounded-md"
      >
        Skip to main content
      </a>

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[#102137] text-white border-b border-slate-800 px-4 lg:px-6 py-3">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
          {/* Left: Brand + Mobile Menu Button */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-slate-200 hover:bg-slate-800 focus:outline-none"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <button
              type="button"
              onClick={() => setActivePage('overview')}
              className="text-left group focus:outline-none"
            >
              <div className="flex items-center gap-2.5">
                <span className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap">
                  {t.brandTitle}
                </span>
                <span className="text-[11px] font-mono tracking-wide uppercase text-[#E0F4EF] border border-[#087F78] px-2 py-0.5 rounded whitespace-nowrap">
                  {t.demoModeBadge}
                </span>
              </div>
              <p className="hidden sm:block text-xs text-slate-300 truncate max-w-md">
                {t.brandTagline}
              </p>
            </button>
          </div>

          {/* Center: Role Switcher & Accessibility Quick Bar */}
          <div className="hidden xl:flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1 bg-slate-800/90 border border-slate-700 rounded-md px-2 py-1">
              <span className="text-slate-300 whitespace-nowrap">Role:</span>
              {(['Beneficiary', 'Caregiver', 'Service Officer'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setActiveRole(role)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                    activeRole === role
                      ? 'bg-[#087F78] text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                  aria-pressed={activeRole === role}
                >
                  {role}
                </button>
              ))}
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-1 bg-slate-800/90 border border-slate-700 rounded-md p-1">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                  accessibility.language === 'en'
                    ? 'bg-[#087F78] text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
                aria-label="Switch language to English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('te')}
                className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                  accessibility.language === 'te'
                    ? 'bg-[#087F78] text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
                aria-label="Switch language to Telugu"
              >
                తెలుగు
              </button>
            </div>

            {/* Quick Large Text & High Contrast */}
            <button
              type="button"
              onClick={() =>
                updateAccessibility({
                  textSize: accessibility.textSize === 'normal' ? 'large' : 'normal',
                })
              }
              className={`px-2 py-1.5 rounded-md border text-xs font-medium whitespace-nowrap transition-colors ${
                accessibility.textSize !== 'normal'
                  ? 'bg-[#E0F4EF] text-[#102137] border-[#E0F4EF]'
                  : 'border-slate-700 text-slate-200 hover:bg-slate-800'
              }`}
              aria-pressed={accessibility.textSize !== 'normal'}
            >
              A+ Text
            </button>

            <button
              type="button"
              onClick={() => updateAccessibility({ highContrast: !accessibility.highContrast })}
              className={`px-2 py-1.5 rounded-md border text-xs font-medium whitespace-nowrap transition-colors ${
                accessibility.highContrast
                  ? 'bg-[#E0F4EF] text-[#102137] border-[#E0F4EF]'
                  : 'border-slate-700 text-slate-200 hover:bg-slate-800'
              }`}
              aria-pressed={accessibility.highContrast}
            >
              <span className="inline-flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                Contrast
              </span>
            </button>
          </div>

          {/* Right: Offline Simulator, Notifications, Guided Demo & Reset */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => (isOfflineSimulated ? restoreConnectivity() : simulateConnectivityLoss())}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                isOfflineSimulated
                  ? 'bg-[#C44848] text-white hover:bg-[#b03b3b]'
                  : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
              }`}
              title="Simulate connectivity loss or restore connection"
            >
              {isOfflineSimulated ? (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>Offline (Restore)</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-[#E0F4EF]" />
                  <span className="hidden md:inline">Simulate Offline</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActivePage('notifications-activity')}
              className="px-2.5 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 inline-flex items-center gap-1.5 whitespace-nowrap"
              aria-label={`Notifications and activity (${unreadCount} unread)`}
            >
              <Bell className="w-3.5 h-3.5" />
              {unreadCount > 0 && (
                <span className="text-xs font-mono font-semibold text-[#E0F4EF] tabular-nums">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={startGuidedWalkthrough}
              className="px-2.5 py-1.5 rounded-md bg-[#087F78] hover:bg-[#066963] text-white text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap transition-colors"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>{t.startGuidedDemo}</span>
            </button>

            <button
              type="button"
              onClick={resetEntireDemo}
              className="px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium inline-flex items-center gap-1 whitespace-nowrap transition-colors"
              title="Reset entire demo to initial seeded state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.resetDemo}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Guided Evaluator Walkthrough Bar (12 steps) */}
      {guidedDemoActive && (
        <section
          aria-label="Guided Evaluator Walkthrough"
          className="bg-[#E0F4EF] text-[#102137] border-b border-[#087F78]/30 px-4 lg:px-6 py-3"
        >
          <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#087F78]">
                <BookOpen className="w-4 h-4" />
                <span>EVALUATOR WALKTHROUGH — STEP {guidedDemoStep} OF 12</span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[#102137]">
                {currentWalkthrough.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-700">{currentWalkthrough.instruction}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {currentWalkthrough.actionLabel && (
                <button
                  type="button"
                  onClick={handleWalkthroughQuickAction}
                  className="px-3 py-1.5 rounded-md bg-[#102137] text-white text-xs font-semibold hover:bg-slate-800 whitespace-nowrap"
                >
                  {currentWalkthrough.actionLabel}
                </button>
              )}

              <button
                type="button"
                disabled={guidedDemoStep <= 1}
                onClick={() => setGuidedWalkthroughStep(Math.max(1, guidedDemoStep - 1))}
                className="px-2.5 py-1.5 rounded-md border border-[#102137]/20 bg-white text-[#102137] text-xs font-medium disabled:opacity-40 inline-flex items-center gap-1 whitespace-nowrap"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>

              <button
                type="button"
                disabled={guidedDemoStep >= 12}
                onClick={() => setGuidedWalkthroughStep(Math.min(12, guidedDemoStep + 1))}
                className="px-3 py-1.5 rounded-md bg-[#087F78] text-white text-xs font-semibold disabled:opacity-40 inline-flex items-center gap-1 whitespace-nowrap"
              >
                Next Step
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={closeGuidedWalkthrough}
                className="p-1.5 rounded-md text-slate-600 hover:text-[#102137]"
                aria-label="Close guided walkthrough"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Offline Connectivity Warning / Reconnect Read-Back Banner */}
      {isOfflineSimulated && (
        <div
          role="alert"
          className="bg-[#C44848] text-white px-4 lg:px-6 py-2.5 border-b border-red-900"
        >
          <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2 font-medium">
              <WifiOff className="w-4 h-4 shrink-0" />
              <span>
                Connectivity Loss Simulated: Working in Offline Recovery Mode. Status:{' '}
                <strong className="underline">{t.offlineSavedLocally}</strong> (Last confirmed step:{' '}
                {offlineDraft.lastConfirmedStep})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActivePage('documents-deadlines')}
                className="px-2.5 py-1 rounded bg-white/15 hover:bg-white/25 text-white font-medium whitespace-nowrap"
              >
                Open Offline Checklist
              </button>
              <button
                type="button"
                onClick={restoreConnectivity}
                className="px-3 py-1 rounded bg-white text-[#C44848] font-bold hover:bg-slate-100 whitespace-nowrap"
              >
                {t.restoreOnlineButton}
              </button>
            </div>
          </div>
        </div>
      )}

      {!isOfflineSimulated && offlineDraft.reconnectedReadBackPending && (
        <div
          role="status"
          className="bg-[#E0F4EF] text-[#102137] px-4 lg:px-6 py-3 border-b border-[#087F78]/30"
        >
          <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="space-y-1">
              <p className="font-bold text-[#087F78]">{t.reconnectedBanner}</p>
              <p className="text-[#102137] font-medium">
                Spoken State Read-Back: “{t.readBackScript}”
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => speakText(t.readBackScript)}
                className="px-3 py-1.5 rounded-md bg-[#087F78] text-white text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap"
              >
                <Volume2 className="w-3.5 h-3.5" />
                Speak Read-Back Again
              </button>
              <button
                type="button"
                onClick={() => setActivePage('documents-deadlines')}
                className="px-3 py-1.5 rounded-md bg-[#102137] text-white text-xs font-semibold whitespace-nowrap"
              >
                Continue Checklist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spoken Read-Aloud Transcript Banner & Toast Feedback */}
      {(spokenTranscriptBanner || lastActionFeedback) && (
        <div
          role="status"
          aria-live="polite"
          className="bg-white border-b border-slate-200 px-4 lg:px-6 py-2"
        >
          <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              {spokenTranscriptBanner ? (
                <>
                  <Volume2 className="w-4 h-4 text-[#087F78] shrink-0" />
                  <span>
                    <strong>Read-Aloud Transcript:</strong> “{spokenTranscriptBanner}”
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#087F78] shrink-0" />
                  <span>{lastActionFeedback}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {spokenTranscriptBanner && (
                <button
                  type="button"
                  onClick={stopSpeech}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium inline-flex items-center gap-1"
                >
                  <VolumeX className="w-3 h-3" />
                  {t.stopReadingButton}
                </button>
              )}
              {lastActionFeedback && (
                <button
                  type="button"
                  onClick={clearFeedback}
                  className="text-slate-500 hover:text-slate-800 px-1.5 py-0.5"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Container */}
      <div className="flex-1 max-w-[1440px] w-full mx-auto flex">
        {/* Left Sidebar Navigation */}
        <aside
          aria-label="Primary Application Navigation"
          className={`seva-sidebar ${
            mobileMenuOpen ? 'fixed inset-y-0 left-0 z-40 w-72 pt-16' : 'hidden lg:flex'
          } lg:w-68 xl:w-72 shrink-0 flex-col bg-[#102137] text-white border-r border-slate-800 justify-between`}
        >
          <div className="p-4 space-y-4 overflow-y-auto">
            {/* Beneficiary Profile Summary Box */}
            <div className="rounded-lg bg-slate-800/80 border border-slate-700 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Beneficiary Profile</span>
                <span className="font-mono tabular-nums text-[#E0F4EF]">Age {beneficiary.age}</span>
              </div>
              <div className="font-display text-base font-bold text-white">
                {beneficiary.name}
              </div>
              <div className="text-xs text-slate-300 space-y-1">
                <div>Sanction ID: <span className="font-mono text-white">{beneficiary.pensionId}</span></div>
                <div>Viewing as: <strong className="text-[#E0F4EF]">{activeRole}</strong></div>
              </div>
              <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-700/80">
                {t.roleDisclaimer}
              </p>
            </div>

            {/* Mobile Role & Language Controls */}
            <div className="xl:hidden space-y-2 pt-1">
              <div className="text-xs text-slate-300 font-medium">{t.roleLabel}</div>
              <div className="grid grid-cols-3 gap-1">
                {(['Beneficiary', 'Caregiver', 'Service Officer'] as UserRole[]).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setActiveRole(role)}
                    className={`px-2 py-1.5 rounded text-xs font-medium truncate ${
                      activeRole === role
                        ? 'bg-[#087F78] text-white'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* 10 Connected Navigation Links */}
            <nav className="space-y-1" aria-label="10 Connected SEVA SUTRA Modules">
              {NAV_ITEMS.map(({ id, icon: Icon }) => {
                const isActive = activePage === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setActivePage(id);
                      setMobileMenuOpen(false);
                    }}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#087F78] text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="leading-snug">{t.nav[id]}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer: Read-Aloud & One-Task Mode */}
          <div className="p-4 border-t border-slate-800 space-y-2 text-xs text-slate-300">
            <button
              type="button"
              onClick={() => speakText(t.dashboardIntro)}
              className="w-full py-2 px-3 rounded-md bg-slate-800 hover:bg-slate-700 text-white font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Volume2 className="w-4 h-4 text-[#E0F4EF]" />
              <span>{t.readAloudButton}</span>
            </button>
            <div className="text-[11px] text-slate-400 text-center">
              SEVA SUTRA · IMPACTX 2026 Challenge 20
            </div>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <main id="main-content" className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};
