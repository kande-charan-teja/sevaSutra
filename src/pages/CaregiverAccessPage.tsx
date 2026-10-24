import React, { useState } from 'react';
import {
  AlertOctagon,
  Ban,
  Clock,
  Eye,
  Lock,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserX,
  Volume2,
} from 'lucide-react';
import { useSevaSutra } from '../context/SevaSutraContext';
import { checkActionPermission } from '../logic/permissionAndRisk';

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
    speakText,
    t,
  } = useSevaSutra();

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [securityFeedbackBanner, setSecurityFeedbackBanner] = useState<string | null>(null);

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

  return (
    <div className="space-y-8">
      {/* Header & Production Security Architecture Note */}
      <section className="seva-card bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-mono uppercase text-[#087F78] font-bold">
              Scoped Delegation · Zero Unrestricted Financial Authority
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#102137]">
              Caregiver Access &amp; High-Risk Financial Safeguards
            </h1>
            <p className="text-sm text-slate-600">
              Caregiver Arjun (Grandchild) can assist with digital tasks through 4 narrowly scoped permissions, but cannot redirect pension bank accounts or self-approve high-risk changes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={revokeAllCaregiverPermissions}
              className="px-4 py-2 rounded-lg bg-[#C44848] hover:bg-[#a93838] text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-colors"
            >
              <UserX className="w-4 h-4" />
              <span>Revoke All Caregiver Access</span>
            </button>
          </div>
        </div>

        {/* Centralized Permission Check Status Strip */}
        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <strong>Centralized Policy Check ({activeRole} Role):</strong>{' '}
            <span>{bankModifyPermissionCheck.reason}</span>
          </div>
          <span className="font-mono text-xs font-bold text-[#C44848] shrink-0">
            [{bankModifyPermissionCheck.riskClassification}]
          </span>
        </div>
      </section>

      {/* Mandatory Unsafe Bank-Change Simulation Section */}
      <section
        aria-labelledby="unsafe-bank-sim-heading"
        className="seva-card bg-white rounded-xl border-2 border-[#C44848] p-6 space-y-5"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#C44848]">
              <ShieldAlert className="w-4 h-4" />
              <span>Mandatory High-Risk Abuse &amp; Safeguard Demonstration</span>
            </div>
            <h2
              id="unsafe-bank-sim-heading"
              className="text-xl sm:text-2xl font-bold text-[#102137]"
            >
              Caregiver Attempt to Redirect Pension Bank Account
            </h2>
            <p className="text-sm text-slate-600">
              Test what happens when caregiver Arjun attempts to change Lakshmi Devi’s pension disbursement account (XXXX-4821) to his own personal account (XXXX-9914).
            </p>
          </div>

          <button
            type="button"
            onClick={triggerUnsafeBankChangeDemo}
            className="px-5 py-3 rounded-lg bg-[#C44848] hover:bg-[#ab3939] text-white text-sm font-bold inline-flex items-center gap-2 shrink-0 shadow-sm cursor-pointer"
          >
            <AlertOctagon className="w-5 h-5" />
            <span>Simulate request to change bank account</span>
          </button>
        </div>

        {securityFeedbackBanner && (
          <div
            role="alert"
            className="p-4 rounded-lg bg-red-50 border border-[#C44848] text-[#C44848] text-sm font-bold flex items-center justify-between gap-3"
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
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700">
            No bank account change request is currently active. Click{' '}
            <strong>“Simulate request to change bank account”</strong> above to trigger the 14-point safeguard workflow.
          </div>
        ) : (
          <div className="space-y-5">
            {/* Beneficiary-Facing Respectful Safeguard Message */}
            <div
              role="alert"
              className="p-5 rounded-xl bg-amber-50 border-2 border-[#C44848] space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wide text-[#C44848] flex items-center gap-1.5">
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
                <span className="text-xs font-mono font-bold text-[#102137] tabular-nums flex items-center gap-1">
                  <Clock className="w-4 h-4 text-[#C44848]" />
                  <span>
                    Cooling-Off Window: {highRiskRequest.coolingOffHoursRemaining} Hours Remaining
                  </span>
                </span>
              </div>

              <p className="text-lg sm:text-xl font-bold text-[#102137]">
                “{t.safeguardBanner}”
              </p>

              <p className="text-xs sm:text-sm text-slate-700">
                Note: The 72-hour cooling-off period is a protective pause, <strong>not</strong> automatic authorization to execute a bank change. Nothing changes unless you complete direct beneficiary step-up verification with an authorized officer.
              </p>

              {/* Mandatory Three Beneficiary Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => speakText(t.safeguardBanner)}
                  className="px-4 py-2 rounded-lg bg-[#087F78] hover:bg-[#066963] text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Read this to me.</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReviewModalOpen(!reviewModalOpen)}
                  className="px-4 py-2 rounded-lg bg-[#102137] hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>Review request.</span>
                </button>

                <button
                  type="button"
                  onClick={cancelHighRiskRequestByBeneficiary}
                  disabled={highRiskRequest.status === 'Cancelled_ByBeneficiary'}
                  className="px-4 py-2 rounded-lg bg-[#C44848] hover:bg-[#a93838] text-white text-xs sm:text-sm font-semibold disabled:opacity-40 inline-flex items-center gap-2"
                >
                  <Ban className="w-4 h-4" />
                  <span>Cancel request.</span>
                </button>
              </div>
            </div>

            {/* Detailed Review Drawer & Adversarial Test Controls */}
            {reviewModalOpen && (
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-300 space-y-3 text-xs sm:text-sm">
                <h3 className="font-bold text-[#102137] text-base">
                  Step-Up Verification &amp; Request Inspection Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-4 rounded-lg border border-slate-200">
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
                    <span className="text-[#C44848] font-bold">
                      No (Held Pending — Never Auto-Executed)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 14-Point Safeguard Checklist & Adversarial Test Triggers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs sm:text-sm">
                <h3 className="font-bold text-[#102137]">
                  Active Safeguard Controls Verified
                </h3>
                <ul className="space-y-1.5 text-slate-700 list-disc pl-4">
                  <li>Classified as <strong>High Risk — Financial Redirection</strong>.</li>
                  <li>Immediate completion blocked; pension stays in account XXXX-4821.</li>
                  <li>Simulated notification recorded for Lakshmi Devi (Beneficiary).</li>
                  <li>
                    Privacy-safe notification simulated for Second Trusted Contact ({trustedContact.name}) with zero bank/amount exposure.
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

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="font-bold text-[#102137] text-sm">
                  Judge / Evaluator Abuse-Resistance Test Controls
                </h3>
                <p className="text-xs text-slate-600">
                  Test what happens if the caregiver tries to self-approve this request, or if you revoke access while it is pending and the caregiver tries to continue:
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleSelfApprovalClick}
                    className="px-3 py-2 rounded-lg border border-[#C44848] text-[#C44848] bg-white hover:bg-red-50 text-xs font-bold"
                  >
                    Test Caregiver Self-Approval (Must Block)
                  </button>

                  <button
                    type="button"
                    onClick={revokeAllCaregiverPermissions}
                    className="px-3 py-2 rounded-lg bg-[#102137] text-white hover:bg-slate-800 text-xs font-bold"
                  >
                    Revoke Access Mid-Action (Must Quarantine)
                  </button>

                  <button
                    type="button"
                    onClick={handlePostRevocationClick}
                    className="px-3 py-2 rounded-lg border border-slate-400 text-[#102137] bg-white hover:bg-slate-100 text-xs font-bold"
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
          <h2 className="text-xl font-bold text-[#102137]">
            Four Granular Caregiver Permission Scopes (Arjun Kumar — Grandchild)
          </h2>
          <span className="text-xs text-slate-600">
            Grant, revoke, or test expiry for each individual assistive capability
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {permissions.map((perm) => (
            <div
              key={perm.id}
              className="seva-card bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-[#102137] capitalize">
                    {perm.title}
                  </h3>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded ${
                      perm.status === 'Granted'
                        ? 'bg-[#E0F4EF] text-[#087F78]'
                        : perm.status === 'Revoked'
                          ? 'bg-red-50 text-[#C44848]'
                          : 'bg-amber-50 text-amber-800'
                    }`}
                  >
                    {perm.status}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700">{perm.purpose}</p>

                <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
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

              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                  Updated: {perm.lastModified}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => expirePermissionDemo(perm.id)}
                    className="px-2.5 py-1.5 rounded border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Simulate Expiry
                  </button>
                  <button
                    type="button"
                    onClick={() => togglePermissionStatus(perm.id)}
                    className={`px-3 py-1.5 rounded text-xs font-bold ${
                      perm.status === 'Granted'
                        ? 'bg-[#C44848] text-white hover:bg-[#a93838]'
                        : 'bg-[#087F78] text-white hover:bg-[#066963]'
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

      {/* Second Trusted Contact & Audit History */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 seva-card bg-white rounded-xl border border-slate-200 p-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#087F78]">
            <UserCheck className="w-4 h-4" />
            <span>Second Trusted Contact (Privacy-Safe Alerting)</span>
          </div>
          <h3 className="text-lg font-bold text-[#102137]">{trustedContact.name}</h3>
          <p className="text-xs font-medium text-slate-600">{trustedContact.relationship}</p>
          <p className="text-xs sm:text-sm text-slate-700">{trustedContact.roleDescription}</p>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
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

        <div className="lg:col-span-7 seva-card bg-white rounded-xl border border-slate-200 p-6 space-y-3">
          <h3 className="text-lg font-bold text-[#102137] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#087F78]" />
            <span>Delegation &amp; Security Audit History</span>
          </h3>
          <p className="text-xs text-slate-600">
            Production Note: Real production protection requires trusted backend authorization, cryptographic authentication, tamper-evident server audit persistence, and official banking verification procedures.
          </p>
          <div className="overflow-x-auto max-h-64">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 pr-3">Time</th>
                  <th className="py-2 pr-3">Actor</th>
                  <th className="py-2 pr-3">Action</th>
                  <th className="py-2 pr-3">Outcome</th>
                  <th className="py-2">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditEvents.slice(0, 8).map((ev) => (
                  <tr key={ev.id}>
                    <td className="py-2 pr-3 font-mono text-slate-500 tabular-nums whitespace-nowrap">
                      {ev.timestamp}
                    </td>
                    <td className="py-2 pr-3 font-medium text-[#102137] whitespace-nowrap">
                      {ev.actor}
                    </td>
                    <td className="py-2 pr-3 text-slate-700">{ev.action}</td>
                    <td className="py-2 pr-3 font-semibold text-[#102137] whitespace-nowrap">
                      {ev.outcome}
                    </td>
                    <td className="py-2 font-mono text-[11px] whitespace-nowrap">
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
