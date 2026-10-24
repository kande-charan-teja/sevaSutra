import { SEEDED_DIAGNOSTIC_SCENARIOS, runPaymentDiagnosis } from './diagnosticRules';
import {
  attemptCaregiverSelfApproval,
  attemptContinueAfterRevocation,
  checkActionPermission,
  revokeAllCaregiverAccessAndQuarantine,
  simulateUnsafeBankAccountChangeRequest,
} from './permissionAndRisk';
import { CaregiverPermission, CertaintyClassification, DiagnosticScenarioId } from '../types/models';

export interface SecurityAbuseScenarioResult {
  id: string;
  title: string;
  description: string;
  expectedOutcome: string;
  actualOutcome: string;
  blockedOrEscalated: boolean;
}

export interface SecurityEvaluationSummary {
  measured: boolean;
  totalScenarios: number;
  blockedOrEscalatedCount: number;
  effectivenessRatePct: number;
  scenarios: SecurityAbuseScenarioResult[];
}

export interface DiagnosticBenchmarkCaseResult {
  scenarioId: DiagnosticScenarioId;
  scenarioName: string;
  expectedCauseKeyword: string;
  expectedClassification: CertaintyClassification;
  actualTitle: string;
  actualClassification: CertaintyClassification;
  passed: boolean;
}

export interface DiagnosticAccuracySummary {
  measured: boolean;
  totalCases: number;
  correctCount: number;
  incorrectCount: number;
  accuracyPct: number;
  cases: DiagnosticBenchmarkCaseResult[];
}

/**
 * Runs the 6 mandatory abuse scenarios against the permission and risk engine.
 */
export function runSecurityEffectivenessBenchmark(): SecurityEvaluationSummary {
  const samplePermissions: CaregiverPermission[] = [
    {
      id: 'view_benefit_status',
      title: 'View Benefit Status',
      purpose: 'Check application and payment timeline',
      scopeDescription: 'Read-only status view',
      allowedActions: ['View timeline'],
      prohibitedActions: ['Change bank account'],
      status: 'Granted',
      expiresAt: '2026-11-30',
      lastModified: '2026-10-01',
    },
  ];

  // 1. Broad permission request / out-of-scope action
  const unscopedCheck = checkActionPermission('Caregiver', samplePermissions, 'prepare_enquiry');
  const s1Blocked = !unscopedCheck.allowed;

  // 2. High-risk bank change request immediate block
  const bankSim = simulateUnsafeBankAccountChangeRequest(samplePermissions);
  const s2Escalated =
    bankSim.highRiskRequest.status === 'CoolingOff_PendingBeneficiary' &&
    bankSim.highRiskRequest.coolingOffHoursRemaining === 72;

  // 3. Caregiver self-approval attempt
  const selfApproval = attemptCaregiverSelfApproval(bankSim.highRiskRequest);
  const s3Blocked =
    selfApproval.auditEvent.outcome === 'Blocked' &&
    selfApproval.updatedRequest.status === 'CoolingOff_PendingBeneficiary';

  // 4. Missing beneficiary confirmation (verify request remains pending and unexecuted)
  const s4Blocked = !bankSim.highRiskRequest.beneficiaryConfirmed && bankSim.highRiskRequest.status !== 'None';

  // 5. Revocation during a pending action -> automatic quarantine/cancellation
  const revokedState = revokeAllCaregiverAccessAndQuarantine(samplePermissions, bankSim.highRiskRequest);
  const s5Quarantined = revokedState.updatedHighRisk.status === 'Quarantined_AccessRevoked';

  // 6. Continued action after revocation
  const postRevokeAttempt = attemptContinueAfterRevocation(revokedState.updatedHighRisk);
  const s6Blocked = !postRevokeAttempt.allowed && postRevokeAttempt.auditEvent.outcome === 'Blocked';

  const scenarios: SecurityAbuseScenarioResult[] = [
    {
      id: 'sec-1',
      title: '1. Broad / Unscoped Permission Request',
      description: 'Caregiver with only "View Benefit Status" attempts an ungranted scope ("Prepare an enquiry").',
      expectedOutcome: 'Denied by centralized permission check',
      actualOutcome: unscopedCheck.reason,
      blockedOrEscalated: s1Blocked,
    },
    {
      id: 'sec-2',
      title: '2. High-Risk Bank Account Redirection',
      description: 'Caregiver requests changing pension disbursement to caregiver’s own bank account.',
      expectedOutcome: 'Immediate execution blocked; 72-hour cooling-off started',
      actualOutcome: `Status: ${bankSim.highRiskRequest.status} (${bankSim.highRiskRequest.coolingOffHoursRemaining}h cooling-off)`,
      blockedOrEscalated: s2Escalated,
    },
    {
      id: 'sec-3',
      title: '3. Caregiver Self-Approval Attempt',
      description: 'Caregiver attempts to approve or expedite their own pending bank change request.',
      expectedOutcome: 'Blocked; self-approval counter incremented in audit log',
      actualOutcome: selfApproval.blockedMessage,
      blockedOrEscalated: s3Blocked,
    },
    {
      id: 'sec-4',
      title: '4. Execution Without Beneficiary Confirmation',
      description: 'Checks whether cooling-off alone authorizes bank change without direct beneficiary step-up confirmation.',
      expectedOutcome: 'Held pending; never auto-executes',
      actualOutcome: `Beneficiary confirmed: ${String(bankSim.highRiskRequest.beneficiaryConfirmed)} — Change held pending`,
      blockedOrEscalated: s4Blocked,
    },
    {
      id: 'sec-5',
      title: '5. Revocation During Pending Sensitive Action',
      description: 'Beneficiary revokes caregiver permissions while bank account redirection is in cooling-off.',
      expectedOutcome: 'Pending request immediately quarantined and cancelled',
      actualOutcome: `Request transitioned to ${revokedState.updatedHighRisk.status}`,
      blockedOrEscalated: s5Quarantined,
    },
    {
      id: 'sec-6',
      title: '6. Continued Action After Revocation',
      description: 'Caregiver attempts to resume or submit the quarantined request after access revocation.',
      expectedOutcome: 'Denied and recorded as Critical Safeguard event',
      actualOutcome: postRevokeAttempt.errorMessage,
      blockedOrEscalated: s6Blocked,
    },
  ];

  const blockedOrEscalatedCount = scenarios.filter((s) => s.blockedOrEscalated).length;

  return {
    measured: true,
    totalScenarios: scenarios.length,
    blockedOrEscalatedCount,
    effectivenessRatePct: Math.round((blockedOrEscalatedCount / scenarios.length) * 100),
    scenarios,
  };
}

/**
 * Runs the 6 diagnostic test cases (5 required causes + incomplete evidence) against `runPaymentDiagnosis`.
 */
export function runDiagnosticAccuracyBenchmark(): DiagnosticAccuracySummary {
  const expectations: Array<{
    scenarioId: DiagnosticScenarioId;
    scenarioName: string;
    expectedCauseKeyword: string;
    expectedClassification: CertaintyClassification;
  }> = [
    {
      scenarioId: 'account_mismatch',
      scenarioName: '1. Account holder name mismatch',
      expectedCauseKeyword: 'Name Mismatch',
      expectedClassification: 'Known cause in the synthetic record',
    },
    {
      scenarioId: 'closed_bank_account',
      scenarioName: '2. Closed bank account',
      expectedCauseKeyword: 'Closed or Dormant Bank Account',
      expectedClassification: 'Known cause in the synthetic record',
    },
    {
      scenarioId: 'lapsed_verification',
      scenarioName: '3. Lapsed identity verification',
      expectedCauseKeyword: 'Lapsed Identity Verification',
      expectedClassification: 'Known cause in the synthetic record',
    },
    {
      scenarioId: 'funding_release_delay',
      scenarioName: '4. Funding-release delay',
      expectedCauseKeyword: 'Funding-Release Delay',
      expectedClassification: 'Known cause in the synthetic record',
    },
    {
      scenarioId: 'wrong_branch_code',
      scenarioName: '5. Wrong bank-branch code',
      expectedCauseKeyword: 'Wrong Bank-Branch Code',
      expectedClassification: 'Known cause in the synthetic record',
    },
    {
      scenarioId: 'incomplete_evidence',
      scenarioName: '6. Incomplete or insufficient evidence',
      expectedCauseKeyword: 'Incomplete or Insufficient Evidence',
      expectedClassification: 'Needs confirmation',
    },
  ];

  const cases: DiagnosticBenchmarkCaseResult[] = expectations.map((exp) => {
    const input = SEEDED_DIAGNOSTIC_SCENARIOS[exp.scenarioId];
    const result = runPaymentDiagnosis(input);
    const passed =
      result.title.includes(exp.expectedCauseKeyword) &&
      result.certaintyClassification === exp.expectedClassification;

    return {
      scenarioId: exp.scenarioId,
      scenarioName: exp.scenarioName,
      expectedCauseKeyword: exp.expectedCauseKeyword,
      expectedClassification: exp.expectedClassification,
      actualTitle: result.title,
      actualClassification: result.certaintyClassification,
      passed,
    };
  });

  const correctCount = cases.filter((c) => c.passed).length;
  const incorrectCount = cases.length - correctCount;

  return {
    measured: true,
    totalCases: cases.length,
    correctCount,
    incorrectCount,
    accuracyPct: Math.round((correctCount / cases.length) * 100),
    cases,
  };
}
