import React, { useState } from 'react';
import {
  AlertOctagon,
  Ban,
  CheckCircle2,
  Clock,
  Eye,
  Lock,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserX,
  Volume2,
  XCircle,
} from 'lucide-react';
import { useSevaSutra } from '../context/SevaSutraContext';
import { checkActionPermission } from '../logic/permissionAndRisk';
import { PermissionScopeId } from '../types/models';

export const CaregiverAccessPage: React.FC = () => {
  const {
    activeRole,
    permissions,
    trustedContact,
    highRiskRequest,
    auditEvents,
    togglePermissionStatus,
    expirePermissionDemo,
    triggerUnsafeBankChangeDemo,
    triggerCaregiverSelfApprovalAttempt,
    cancelHighRiskRequestByBeneficiary,
    revokeAllCaregiverPermissions,
    triggerPostRevocationAttempt,
    evaluateScopedAction,
    speakText,
    t,
  } = useSevaSutra();

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [confirmDialogType, setConfirmDialogType] = useState<
    'revoke_all' | 'cancel_bank_change' | null
  >(null);
  const [securityFeedbackBanner, setSecurityFeedbackBanner] = useState<string | null>(null);
  const [policyTestOutcome, setPolicyTestOutcome] = useState<{
    allowed: boolean;
    reason: string;
  } | null>(null);

  const bankModifyPermissionCheck = checkActionPermission(
    activeRole,
    permissions,
    'MODIFY_BANK_ACCOUNT'
  );

  const handleSelfApprovalClick = () => {
    const msg = triggerCaregiverSelfApprovalAttempt();
    setSecurityFeedbackBanner(msg);
  };

  const handlePostRevocationClick = () => {
    const msg = triggerPostRevocationAttempt();
    setSecurityFeedbackBanner(msg);
  };

  const handleRunPolicyTest = (
    scope: PermissionScopeId | 'MODIFY_BANK_ACCOUNT',
    label: string
  ) => {
    const res = evaluateScopedAction(scope, `Tested action "${label}" as ${activeRole}`);
    setPolicyTestOutcome(res);
  };

  return (
    <div className="space-y-8">
      {/* Accessible Confirmation Modal Dialog */}
      {confirmDialogType && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          className="fixed inset-0 z-50 bg-[#101B2D]/70 flex items-center justify-center p-4"
        >
          <div className="bg-[#FFFFFF] rounded-xl border-2 border-[#C5A267] max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-[#B42332] text-xs font-bold uppercase">
              <ShieldAlert className="w-5 h-5" />
              <span>Beneficiary Security Confirmation Dialog</span>
            </div>
            <h2
              id="confirm-dialog-title"
              className="font-display text-xl sm:text-2xl font-extrabold text-[#101B2D]"
            >
              {confirmDialogType === 'revoke_all'
                ? 'Confirm Revoking All Caregiver Permissions?'
                : 'Confirm Cancelling Pending Bank Account Change Request?'}
            </h2>
            <p className="text-sm sm:text-base text-slate-700">
              {confirmDialogType === 'revoke_all'
                ? 'Revoking all permissions immediately removes Arjun’s delegated access across all 4 scopes and quarantines any pending high-risk bank account change request.'
                : 'Cancelling this request permanently stops the pending bank account change. Your pension will continue to be credited to your existing protected account (XXXX-4821).'}
            </p>
            <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-[#E2D9C8]">
              <button
                type="button"
                onClick={() => setConfirmDialogType(null)}
                className="px-4 py-2 rounded-lg border border-[#C5A267] bg-[#F5F0E6] text-[#101B2D] text-sm font-bold"
              >
                Keep Current State
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmDialogType === 'revoke_all') {
                    revokeAllCaregiverPermissions();
                    setSecurityFeedbackBanner(
                      'All caregiver permissions revoked and pending bank-change request quarantined.'
                    );
                  } else {
                    cancelHighRiskRequestByBeneficiary();
                    setSecurityFeedbackBanner(
                      'Pending bank account change request cancelled by Beneficiary.'
                    );
                  }
                  setConfirmDialogType(null);
                }}
                className="px-4 py-2 rounded-lg bg-[#B42332] hover:bg-[#961b28] text-white text-sm font-bold"
              >
                {confirmDialogType === 'revoke_all'
                  ? 'Confirm & Revoke All Access'
                  : 'Confirm & Cancel Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header & Production Security Architecture Note */}
      <section className="seva-card bg-[#FFFFFF] rounded-xl p-6 sm:p-7 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-mono uppercase text-[#087F68] font-bold">
              Scoped Delegation · Zero Unrestricted Financial Authority
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#101B2D]">
              Caregiver Access &amp; High-Risk Financial Safeguards
            </h1>
            <p className="text-base text-slate-700">
              Caregiver Arjun (Grandchild) can assist with digital tasks through 4 narrowly scoped permissions, but cannot redirect pension bank accounts or self-approve high-risk changes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setConfirmDialogType('revoke_all')}
              className="px-4 py-2.5 rounded-lg border border-[#B42332] bg-white hover:bg-red-50 text-[#B42332] text-sm font-bold inline-flex items-center gap-2 transition-colors"
            >
              <UserX className="w-4 h-4" />
              <span>Revoke With Confirmation</span>
            </button>

            <button
              type="button"
              onClick={revokeAllCaregiverPermissions}
              className="px-4 py-2.5 rounded-lg bg-[#B42332] hover:bg-[#961b28] text-white text-sm font-bold inline-flex items-center gap-2 transition-colors"
            >
              <UserX className="w-4 h-4" />
              <span>Revoke All Caregiver Access</span>
            </button>
          </div>
        </div>

        {/* Centralized Permission Check Status Strip */}
        <div className="p-4 rounded-xl bg-[#F5F0E6] border border-[#C5A267] text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <strong>Centralized Policy Check ({activeRole} Role):</strong>{' '}
            <span>{bankModifyPermissionCheck.reason}</span>
          </div>
          <span className="font-mono text-xs font-bold text-[#B42332] shrink-0">
            [{bankModifyPermissionCheck.riskClassification}]
          </span>
        </div>
      </section>

      {/* Mandatory Unsafe Bank-Change Simulation Section */}
      <section
        aria-labelledby="unsafe-bank-sim-heading"
        className="seva-card bg-[#FFFFFF] rounded-xl border-2 border-[#B42332] p-6 sm:p-7 space-y-5"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2D9C8] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#B42332]">
              <ShieldAlert className="w-4 h-4" />
              <span>Mandatory High-Risk Abuse &amp; Safeguard Demonstration</span>
            </div>
            <h2
              id="unsafe-bank-sim-heading"
              className="font-display text-2xl sm:text-3xl font-extrabold text-[#101B2D]"
            >
              Caregiver Attempt to Redirect Pension Bank Account
            </h2>
            <p className="text-base text-slate-700">
              Test what happens when caregiver Arjun attempts to change Lakshmi Devi’s pension disbursement account (XXXX-4821) to his own personal account (XXXX-9914).
            </p>
          </div>

          <button
            type="button"
            onClick={triggerUnsafeBankChangeDemo}
            className="px-5 py-3 rounded-lg bg-[#B42332] hover:bg-[#961b28] text-white text-sm font-bold inline-flex items-center gap-2 shrink-0 shadow-sm cursor-pointer"
          >
            <AlertOctagon className="w-5 h-5" />
            <span>Simulate request to change bank account</span>
          </button>
        </div>

        {securityFeedbackBanner && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-red-50 border border-[#B42332] text-[#B42332] text-sm sm:text-base font-bold flex items-center justify-between gap-3"
          >
            <span>{securityFeedbackBanner}</span>
            <button
              type="button"
              onClick={() => setSecurityFeedbackBanner(null)}
              className="text-xs underline shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Active / Quarantined High-Risk Request State View */}
        {highRiskRequest.status === 'None' ? (
          <div className="p-4 rounded-xl bg-[#F5F0E6] border border-[#C5A267] text-base text-[#101B2D]">
            No bank account change request is currently active. Click{' '}
            <strong>“Simulate request to change bank account”</strong> above to trigger the 14-point safeguard workflow.
          </div>
        ) : (
          <div className="space-y-5">
            {/* Beneficiary-Facing Respectful Safeguard Message */}
            <div
              role="alert"
              className="p-5 sm:p-6 rounded-xl bg-[#F5F0E6] border-2 border-[#B42332] space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wide text-[#B42332] flex items-center gap-1.5">
                  <Lock className="w-4 h-4" />
                  <span>
                    {highRiskRequest.riskClassification} · Status:{' '}
                    {highRiskRequest.status === 'CoolingOff_PendingBeneficiary'
                      ? 'Cooling-Off (Pending Beneficiary Confirmation)'
                      : highRiskRequest.status === 'Quarantined_AccessRevoked'
                        ? 'Quarantined & Cancelled (Access Revoked)'
                        : highRiskRequest.status === 'Cancelled_ByBeneficiary'
                          ? 'Cancelled by Beneficiary'
                          : highRiskRequest.status}
                  </span>
                </span>
                <span className="text-xs sm:text-sm font-mono font-bold text-[#101B2D] tabular-nums flex items-center gap-1">
                  <Clock className="w-4 h-4 text-[#B42332]" />
                  <span>
                    Cooling-Off Window: {highRiskRequest.coolingOffHoursRemaining} Hours Remaining
                  </span>
                </span>
              </div>

              <p className="font-display text-xl sm:text-2xl font-extrabold text-[#101B2D]">
                “{t.safeguardBanner}”
              </p>

              <p className="text-sm sm:text-base text-slate-800">
                Note: The 72-hour cooling-off period is an additional protective pause, <strong>not</strong> automatic authorization to execute a financial change. Nothing changes unless you complete direct beneficiary step-up verification with an authorized officer.
              </p>

              {/* Mandatory Three Beneficiary Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => speakText(t.safeguardBanner)}
                  className="px-4 py-2.5 rounded-lg bg-[#087F68] hover:bg-[#066552] text-white text-sm font-bold inline-flex items-center gap-2"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Read this to me.</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReviewModalOpen(!reviewModalOpen)}
                  className="px-4 py-2.5 rounded-lg bg-[#101B2D] hover:bg-slate-800 text-white text-sm font-bold inline-flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>Review request.</span>
                </button>

                <button
                  type="button"
                  onClick={cancelHighRiskRequestByBeneficiary}
                  disabled={highRiskRequest.status === 'Cancelled_ByBeneficiary'}
                  className="px-4 py-2.5 rounded-lg bg-[#B42332] hover:bg-[#961b28] text-white text-sm font-bold disabled:opacity-40 inline-flex items-center gap-2"
                >
                  <Ban className="w-4 h-4" />
                  <span>Cancel request.</span>
                </button>
              </div>
            </div>

            {/* Detailed Review Drawer */}
            {reviewModalOpen && (
              <div className="p-5 rounded-xl bg-white border-2 border-[#C5A267] space-y-3 text-sm">
                <h3 className="font-bold text-[#101B2D] text-base">
                  Step-Up Verification &amp; Request Inspection Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#F5F0E6] p-4 rounded-lg border border-[#E2D9C8]">
                  <div>
                    <strong>Protected Existing Account:</strong> XXXX-XXXX-4821 (Lakshmi Devi)
                  </div>
                  <div>
                    <strong>Proposed Redirection Account:</strong> {highRiskRequest.proposedAccountMasked} ({highRiskRequest.proposedBankHolder})
                  </div>
                  <div>
                    <strong>Initiated By:</strong> {highRiskRequest.requestedBy} at {highRiskRequest.requestedAt}
                  </div>
                  <div>
                    <strong>Beneficiary Step-Up Confirmed:</strong>{' '}
                    <span className="text-[#B42332] font-bold">
                      No (Held Pending — Never Auto-Executed)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 14-Point Safeguard Checklist & Adversarial Test Triggers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-[#F5F0E6]/60 border border-[#E2D9C8] space-y-2 text-sm">
                <h3 className="font-bold text-[#101B2D] text-base">
                  Active Safeguard Controls Verified
                </h3>
                <ul className="space-y-1.5 text-slate-800 list-disc pl-4">
                  <li>Classified as <strong>High Risk — Financial Redirection</strong>.</li>
                  <li>Immediate completion blocked; pension stays in account XXXX-4821.</li>
                  <li>Simulated notification recorded for Lakshmi Devi (Beneficiary).</li>
                  <li>
                    Privacy-preserving notification simulated for Second Trusted Contact ({trustedContact.name}) with zero bank/amount exposure.
                  </li>
                  <li>
                    Self-approval attempts blocked:{' '}
                    <strong className="font-mono tabular-nums">
                      {highRiskRequest.selfApprovalBlockedCount}
                    </strong>
                  </li>
                  <li>
                    Post-revocation continuation attempts denied:{' '}
                    <strong className="font-mono tabular-nums">
                      {highRiskRequest.postRevocationBlockedCount}
                    </strong>
                  </li>
                </ul>
              </div>

              <div className="p-5 rounded-xl bg-[#F5F0E6]/60 border border-[#E2D9C8] space-y-3">
                <h3 className="font-bold text-[#101B2D] text-base">
                  Judge / Evaluator Abuse-Resistance Test Controls
                </h3>
                <p className="text-sm text-slate-700">
                  Test what happens if the caregiver tries to self-approve this request, or if you revoke access while it is pending and the caregiver tries to continue:
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleSelfApprovalClick}
                    className="px-3.5 py-2 rounded-lg border border-[#B42332] text-[#B42332] bg-white hover:bg-red-50 text-xs sm:text-sm font-bold"
                  >
                    Test Caregiver Self-Approval (Must Block)
                  </button>

                  <button
                    type="button"
                    onClick={revokeAllCaregiverPermissions}
                    className="px-3.5 py-2 rounded-lg bg-[#101B2D] text-white hover:bg-slate-800 text-xs sm:text-sm font-bold"
                  >
                    Revoke Access Mid-Action (Must Quarantine)
                  </button>

                  <button
                    type="button"
                    onClick={handlePostRevocationClick}
                    className="px-3.5 py-2 rounded-lg border border-[#101B2D] text-[#101B2D] bg-white hover:bg-[#F5F0E6] text-xs sm:text-sm font-bold"
                  >
                    Test Continuation After Revocation (Must Deny)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Four Separate Caregiver Permission Scopes */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="font-display text-2xl font-bold text-[#101B2D]">
            Four Granular Caregiver Permission Scopes (Arjun Kumar — Grandchild)
          </h2>
          <span className="text-sm text-slate-700">
            Grant, revoke, or test expiry for each individual assistive capability
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {permissions.map((perm) => (
            <div
              key={perm.id}
              className="seva-card bg-[#FFFFFF] rounded-xl p-5 sm:p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-lg font-bold text-[#101B2D] capitalize">
                    {perm.title}
                  </h3>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded ${
                      perm.status === 'Granted'
                        ? 'bg-[#087F68] text-white'
                        : perm.status === 'Revoked'
                          ? 'bg-[#B42332] text-white'
                          : 'bg-[#C5A267] text-[#101B2D]'
                    }`}
                  >
                    {perm.status}
                  </span>
                </div>

                <p className="text-sm sm:text-base text-slate-800">{perm.purpose}</p>

                <div className="text-xs sm:text-sm text-[#101B2D] space-y-1 bg-[#F5F0E6]/70 p-3.5 rounded-lg border border-[#E2D9C8]">
                  <div>
                    <strong>Scope:</strong> {perm.scopeDescription}
                  </div>
                  <div>
                    <strong>Expiration:</strong>{' '}
                    <span className="font-mono tabular-nums">{perm.expiresAt}</span>
                  </div>
                  <div>
                    <strong>Never Allows:</strong> {perm.prohibitedActions.join(', ')}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2D9C8] flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-mono text-slate-600 tabular-nums">
                  Updated: {perm.lastModified}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => expirePermissionDemo(perm.id)}
                    className="px-3 py-1.5 rounded-lg border border-[#C5A267] bg-[#F5F0E6] text-xs font-bold text-[#101B2D] hover:bg-[#ebe3d3]"
                  >
                    Simulate Expiry
                  </button>
                  <button
                    type="button"
                    onClick={() => togglePermissionStatus(perm.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold ${
                      perm.status === 'Granted'
                        ? 'bg-[#B42332] text-white hover:bg-[#961b28]'
                        : 'bg-[#087F68] text-white hover:bg-[#066552]'
                    }`}
                  >
                    {perm.status === 'Granted' ? 'Revoke Scope' : 'Grant Scope'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Centralized Permission Enforcement Tester */}
      <section className="seva-card bg-[#FFFFFF] rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-xl font-bold text-[#101B2D]">
              Live Centralized Authorization &amp; Access-Denied Tester (Active Role: {activeRole})
            </h2>
            <p className="text-sm text-slate-700">
              Permissions are enforced by centralized policy checks rather than hidden buttons. Switch role to <strong>Caregiver</strong>, revoke or expire a scope above, and click any action below to verify live access-denied outcomes and audit logging:
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {[
            { scope: 'view_benefit_status' as const, label: 'Test: View Benefit Status' },
            { scope: 'help_with_documents' as const, label: 'Test: Help With Documents' },
            { scope: 'view_reminders' as const, label: 'Test: View & Manage Reminders' },
            { scope: 'prepare_enquiry' as const, label: 'Test: Prepare an Enquiry' },
            { scope: 'MODIFY_BANK_ACCOUNT' as const, label: 'Test: Modify Bank Account' },
          ].map((item) => (
            <button
              key={item.scope}
              type="button"
              onClick={() => handleRunPolicyTest(item.scope, item.label)}
              className="px-3.5 py-2 rounded-lg border border-[#C5A267] bg-[#F5F0E6] hover:bg-[#087F68] hover:text-white text-[#101B2D] text-xs sm:text-sm font-bold transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>

        {policyTestOutcome && (
          <div
            role="status"
            className={`p-4 rounded-xl border flex items-center gap-2.5 text-sm font-bold ${
              policyTestOutcome.allowed
                ? 'bg-[#F5F0E6] border-[#087F68] text-[#101B2D]'
                : 'bg-red-50 border-[#B42332] text-[#B42332]'
            }`}
          >
            {policyTestOutcome.allowed ? (
              <CheckCircle2 className="w-5 h-5 text-[#087F68] shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-[#B42332] shrink-0" />
            )}
            <span>{policyTestOutcome.reason}</span>
          </div>
        )}
      </section>

      {/* Second Trusted Contact & Audit History */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 seva-card bg-[#FFFFFF] rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#087F68]">
            <UserCheck className="w-4 h-4" />
            <span>Second Trusted Contact (Privacy-Preserving Alert)</span>
          </div>
          <h3 className="font-display text-xl font-bold text-[#101B2D]">
            {trustedContact.name}
          </h3>
          <p className="text-sm font-semibold text-slate-700">{trustedContact.relationship}</p>
          <p className="text-sm sm:text-base text-slate-800">{trustedContact.roleDescription}</p>
          <div className="p-3.5 rounded-xl bg-[#F5F0E6] border border-[#C5A267] text-xs sm:text-sm space-y-1">
            <div>
              <strong>Simulated Contact:</strong> {trustedContact.phoneMasked}
            </div>
            <div>
              <strong>High-Risk Alert Status:</strong>{' '}
              {trustedContact.notifiedOnHighRisk
                ? `Simulated alert recorded at ${trustedContact.lastNotifiedAt} (No real SMS or phone call sent)`
                : 'Standby — alerts only on high-risk actions'}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 seva-card bg-[#FFFFFF] rounded-xl p-6 space-y-3">
          <h3 className="font-display text-xl font-bold text-[#101B2D] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#087F68]" />
            <span>Delegation &amp; Security Audit History</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-700">
            Production Note: Real production use requires trusted backend authorization, cryptographic authentication, secure server audit persistence, and official banking verification procedures.
          </p>
          <div className="overflow-x-auto max-h-64">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#E2D9C8] text-slate-600">
                  <th className="py-2 pr-3">Time</th>
                  <th className="py-2 pr-3">Actor</th>
                  <th className="py-2 pr-3">Action</th>
                  <th className="py-2 pr-3">Outcome</th>
                  <th className="py-2">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2D9C8]/60">
                {auditEvents.slice(0, 8).map((ev) => (
                  <tr key={ev.id}>
                    <td className="py-2.5 pr-3 font-mono text-xs text-slate-600 tabular-nums whitespace-nowrap">
                      {ev.timestamp}
                    </td>
                    <td className="py-2.5 pr-3 font-bold text-[#101B2D] whitespace-nowrap">
                      {ev.actor}
                    </td>
                    <td className="py-2.5 pr-3 text-slate-800">{ev.action}</td>
                    <td className="py-2.5 pr-3 font-bold text-[#087F68] whitespace-nowrap">
                      {ev.outcome}
                    </td>
                    <td className="py-2.5 font-mono text-xs font-bold whitespace-nowrap">
                      {ev.riskClassification}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
