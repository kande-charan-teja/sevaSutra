import test from 'node:test';
import assert from 'node:assert/strict';
import {
  transitionBenefitProcess,
  evaluateCrossProcessHypotheses,
} from './stateMachines';
import {
  SEEDED_DIAGNOSTIC_SCENARIOS,
  runPaymentDiagnosis,
} from './diagnosticRules';
import {
  checkActionPermission,
  simulateUnsafeBankAccountChangeRequest,
  attemptCaregiverSelfApproval,
  revokeAllCaregiverAccessAndQuarantine,
  attemptContinueAfterRevocation,
} from './permissionAndRisk';
import { evaluateAllSchemes } from './eligibilityRules';
import {
  runDiagnosticAccuracyBenchmark,
  runSecurityEffectivenessBenchmark,
} from './evaluationSuite';
import { BenefitStateMachines, CaregiverPermission } from '../types/models';

const initialMachines: BenefitStateMachines = {
  application: 'Approved',
  verification: 'Due soon',
  renewal: 'Due soon',
  payment: 'Delayed',
  lastUpdated: {
    application: '2026-01-10',
    verification: '2026-10-12',
    renewal: '2026-10-05',
    payment: '2026-10-18',
  },
  events: {
    application: 'Sanction #SSP-2021-88412 active.',
    verification: 'Annual life verification due in 12 days.',
    renewal: 'Supporting medical certificate due for review.',
    payment: 'Monthly pension delayed for 3 months.',
  },
};

test('Four state machines: changing one state never mutates the other three states', () => {
  const res = transitionBenefitProcess(initialMachines, 'verification', 'In progress');
  assert.equal(res.success, true);
  assert.equal(res.updatedMachines.verification, 'In progress');
  // Other three processes must remain untouched
  assert.equal(res.updatedMachines.application, 'Approved');
  assert.equal(res.updatedMachines.renewal, 'Due soon');
  assert.equal(res.updatedMachines.payment, 'Delayed');
});

test('Four state machines: rejects invalid state transitions', () => {
  // Approved application cannot transition backwards to Draft
  const invalidApp = transitionBenefitProcess(initialMachines, 'application', 'Draft');
  assert.equal(invalidApp.success, false);
  assert.equal(invalidApp.updatedMachines.application, 'Approved');

  // Delayed payment cannot jump straight to Scheduled without being Credited first
  const invalidPay = transitionBenefitProcess(initialMachines, 'payment', 'Scheduled');
  assert.equal(invalidPay.success, false);
  assert.equal(invalidPay.updatedMachines.payment, 'Delayed');
});

test('Cross-process relationships are generated as hypotheses without altering Application state', () => {
  const hypotheses = evaluateCrossProcessHypotheses(initialMachines);
  assert.ok(hypotheses.length >= 3);
  assert.equal(initialMachines.application, 'Approved');
  const paymentToApp = hypotheses.find((h) => h.id === 'hyp-payment-not-rejection');
  assert.ok(paymentToApp);
  assert.equal(paymentToApp.confidenceClassification, 'Known cause in the synthetic record');
});

test('Payment diagnosis engine: primary scenario does not falsely claim verification is expired', () => {
  const result = runPaymentDiagnosis(SEEDED_DIAGNOSTIC_SCENARIOS.primary_lakshmi);
  assert.equal(result.certaintyClassification, 'Possible cause');
  assert.ok(result.evidenceFound.some((e) => e.includes('Due in 12 days')));
  assert.ok(result.title.includes('Wrong Bank-Branch Code'));
});

test('Payment diagnosis engine: expired verification test case produces exact required explanation', () => {
  const result = runPaymentDiagnosis(SEEDED_DIAGNOSTIC_SCENARIOS.lapsed_verification);
  assert.equal(
    result.specificBannerMessage,
    'Expired verification is the recorded cause in this demonstration scenario. Completing verification is the recommended next step. The timing of the actual payment remains uncertain and is not guaranteed.'
  );
  assert.equal(result.certaintyClassification, 'Known cause in the synthetic record');
});

test('Payment diagnosis engine: all 5 seeded causes and incomplete evidence classify accurately', () => {
  const bench = runDiagnosticAccuracyBenchmark();
  assert.equal(bench.totalCases, 6);
  assert.equal(bench.correctCount, 6);
  assert.equal(bench.accuracyPct, 100);
});

test('Caregiver permissions and high-risk safeguards: blocks bank redirection, self-approval, and quarantines on revocation', () => {
  const perms: CaregiverPermission[] = [
    {
      id: 'view_benefit_status',
      title: 'View Benefit Status',
      purpose: 'View status',
      scopeDescription: 'Read-only',
      allowedActions: ['View'],
      prohibitedActions: ['Change bank'],
      status: 'Granted',
      expiresAt: '2026-12-31',
      lastModified: '2026-10-01',
    },
  ];

  // Direct bank modification permission check is always denied
  const bankPerm = checkActionPermission('Caregiver', perms, 'MODIFY_BANK_ACCOUNT');
  assert.equal(bankPerm.allowed, false);

  // Simulate unsafe bank change request
  const sim = simulateUnsafeBankAccountChangeRequest(perms);
  assert.equal(sim.highRiskRequest.status, 'CoolingOff_PendingBeneficiary');
  assert.equal(sim.highRiskRequest.coolingOffHoursRemaining, 72);
  assert.equal(
    sim.highRiskRequest.explanationMessage,
    'To keep your savings safe, we’ll confirm this change with you directly. Nothing changes for 72 hours.'
  );

  // Caregiver self-approval attempt is blocked
  const selfApprove = attemptCaregiverSelfApproval(sim.highRiskRequest);
  assert.equal(selfApprove.updatedRequest.selfApprovalBlockedCount, 1);
  assert.equal(selfApprove.auditEvent.outcome, 'Blocked');

  // Revoking caregiver access quarantines the pending action
  const revoked = revokeAllCaregiverAccessAndQuarantine(perms, selfApprove.updatedRequest);
  assert.equal(revoked.updatedHighRisk.status, 'Quarantined_AccessRevoked');
  assert.ok(revoked.updatedPermissions.every((p) => p.status === 'Revoked'));

  // Continuing after revocation is denied
  const postRevoke = attemptContinueAfterRevocation(revoked.updatedHighRisk);
  assert.equal(postRevoke.allowed, false);
  assert.equal(postRevoke.updatedHighRisk.postRevocationBlockedCount, 1);

  // Full security benchmark passes 100%
  const secSummary = runSecurityEffectivenessBenchmark();
  assert.equal(secSummary.effectivenessRatePct, 100);
});

test('Scheme eligibility engine produces Eligible, Needs confirmation, and Not eligible outcomes', () => {
  // Default Lakshmi Devi profile (already receives primary pension, has 50% low-vision disability but certificate needs confirmation)
  const results1 = evaluateAllSchemes({
    age: 72,
    monthlyHouseholdIncomeINR: 3200,
    hasDisabilityCertificate: false,
    disabilityPercentage: 50,
    residencyYearsInState: 40,
    residencyDocumentAvailable: true,
    receivesAnotherStatePension: true,
    maritalStatus: 'Widowed',
  });

  const outcomes1 = results1.map((r) => r.outcome);
  assert.ok(outcomes1.includes('Not eligible'));
  assert.ok(outcomes1.includes('Needs confirmation'));

  // When disability certificate is confirmed, Disability Assist Allowance becomes Eligible
  const results2 = evaluateAllSchemes({
    age: 72,
    monthlyHouseholdIncomeINR: 3200,
    hasDisabilityCertificate: true,
    disabilityPercentage: 50,
    residencyYearsInState: 40,
    residencyDocumentAvailable: true,
    receivesAnotherStatePension: true,
    maritalStatus: 'Widowed',
  });
  const outcomes2 = results2.map((r) => r.outcome);
  assert.ok(outcomes2.includes('Eligible'));
});
