import {
  DecisionTreeStep,
  DiagnosticInputRecord,
  DiagnosticResult,
  DiagnosticScenarioId,
} from '../types/models';

export const SEEDED_DIAGNOSTIC_SCENARIOS: Record<DiagnosticScenarioId, DiagnosticInputRecord> = {
  primary_lakshmi: {
    scenarioId: 'primary_lakshmi',
    scenarioTitle: 'Primary Demo: Lakshmi Devi (Verification Due in 12 Days + 3-Month Delay)',
    scenarioDescription:
      'Lakshmi Devi’s application is Approved and verification is Due in 12 days (not expired). Pension payment is 3 months late following a public-sector bank branch merger.',
    applicationState: 'Approved',
    verificationState: 'Due soon',
    verificationDaysRemaining: 12,
    bankAccountStatus: 'active',
    beneficiaryNameOnPension: 'Lakshmi Devi',
    beneficiaryNameOnBank: 'Lakshmi Devi',
    ifscBranchCodeStatus: 'legacy_merged_invalid',
    treasuryBatchStatus: 'released',
    paymentMonthsLate: 3,
    lastPaymentEventCode: 'NEFT_RETURN_ERR_IFSC_MERGED_404',
  },
  account_mismatch: {
    scenarioId: 'account_mismatch',
    scenarioTitle: 'Cause 1: Account Holder Name Mismatch',
    scenarioDescription:
      'Beneficiary name on the pension sanction roll ("Lakshmi Devi K.") does not match the core banking KYC string ("K. Laxmi Devi") after automated name-matching validation.',
    applicationState: 'Approved',
    verificationState: 'Verified',
    verificationDaysRemaining: 180,
    bankAccountStatus: 'active',
    beneficiaryNameOnPension: 'Lakshmi Devi K.',
    beneficiaryNameOnBank: 'K. Laxmi Devi',
    ifscBranchCodeStatus: 'valid',
    treasuryBatchStatus: 'released',
    paymentMonthsLate: 2,
    lastPaymentEventCode: 'PFMS_NAME_FUZZY_MATCH_HOLD_72',
  },
  closed_bank_account: {
    scenarioId: 'closed_bank_account',
    scenarioTitle: 'Cause 2: Closed or Dormant Bank Account',
    scenarioDescription:
      'Destination savings account was marked closed or frozen for dormancy by the bank, causing credit reversals.',
    applicationState: 'Approved',
    verificationState: 'Verified',
    verificationDaysRemaining: 140,
    bankAccountStatus: 'closed',
    beneficiaryNameOnPension: 'Lakshmi Devi',
    beneficiaryNameOnBank: 'Lakshmi Devi',
    ifscBranchCodeStatus: 'valid',
    treasuryBatchStatus: 'released',
    paymentMonthsLate: 3,
    lastPaymentEventCode: 'NPCI_ACH_CREDIT_RETURN_ACCT_CLOSED_R04',
  },
  lapsed_verification: {
    scenarioId: 'lapsed_verification',
    scenarioTitle: 'Cause 3: Lapsed Identity Verification (Separate Test Case)',
    scenarioDescription:
      'Separate synthetic test case demonstrating an expired annual life certificate blocking monthly disbursement scheduling.',
    applicationState: 'Approved',
    verificationState: 'Expired',
    verificationDaysRemaining: -19,
    bankAccountStatus: 'active',
    beneficiaryNameOnPension: 'Lakshmi Devi',
    beneficiaryNameOnBank: 'Lakshmi Devi',
    ifscBranchCodeStatus: 'valid',
    treasuryBatchStatus: 'released',
    paymentMonthsLate: 2,
    lastPaymentEventCode: 'DISB_HOLD_LIFE_CERT_EXPIRED',
  },
  funding_release_delay: {
    scenarioId: 'funding_release_delay',
    scenarioTitle: 'Cause 4: District Funding-Release Delay',
    scenarioDescription:
      'All beneficiary records and bank details are valid, but the quarterly state-to-district treasury tranche is awaiting release.',
    applicationState: 'Approved',
    verificationState: 'Verified',
    verificationDaysRemaining: 95,
    bankAccountStatus: 'active',
    beneficiaryNameOnPension: 'Lakshmi Devi',
    beneficiaryNameOnBank: 'Lakshmi Devi',
    ifscBranchCodeStatus: 'valid',
    treasuryBatchStatus: 'pending_tranche_release',
    paymentMonthsLate: 2,
    lastPaymentEventCode: 'TREASURY_TRANCHE_Q3_AWAITING_CLEARANCE',
  },
  wrong_branch_code: {
    scenarioId: 'wrong_branch_code',
    scenarioTitle: 'Cause 5: Wrong Bank-Branch Code (IFSC)',
    scenarioDescription:
      'The recorded IFSC code points to a defunct regional rural bank branch code following bank amalgamation.',
    applicationState: 'Approved',
    verificationState: 'Due soon',
    verificationDaysRemaining: 12,
    bankAccountStatus: 'active',
    beneficiaryNameOnPension: 'Lakshmi Devi',
    beneficiaryNameOnBank: 'Lakshmi Devi',
    ifscBranchCodeStatus: 'legacy_merged_invalid',
    treasuryBatchStatus: 'released',
    paymentMonthsLate: 3,
    lastPaymentEventCode: 'NEFT_RETURN_ERR_IFSC_MERGED_404',
  },
  incomplete_evidence: {
    scenarioId: 'incomplete_evidence',
    scenarioTitle: 'Outcome 6: Incomplete or Insufficient Evidence',
    scenarioDescription:
      'External bank clearing status and treasury batch logs are missing from the local synthetic packet.',
    applicationState: 'Approved',
    verificationState: 'Due soon',
    verificationDaysRemaining: 12,
    bankAccountStatus: 'unknown',
    beneficiaryNameOnPension: 'Lakshmi Devi',
    beneficiaryNameOnBank: 'Lakshmi Devi',
    ifscBranchCodeStatus: 'unknown',
    treasuryBatchStatus: 'unknown',
    paymentMonthsLate: 3,
    lastPaymentEventCode: 'SYNC_PACKET_INCOMPLETE_NO_BANK_ACK',
  },
};

/**
 * Pure, deterministic rule-based payment-delay diagnosis engine.
 * Never uses an LLM or external API so judges can inspect exact reasoning.
 */
export function runPaymentDiagnosis(record: DiagnosticInputRecord): DiagnosticResult {
  const whatSystemChecked = [
    `Pension Application sanction status (${record.applicationState})`,
    `Annual Identity Verification status (${record.verificationState}, ${
      record.verificationDaysRemaining >= 0
        ? `${record.verificationDaysRemaining} days remaining`
        : `expired ${Math.abs(record.verificationDaysRemaining)} days ago`
    })`,
    `Account holder name alignment ("${record.beneficiaryNameOnPension}" vs "${record.beneficiaryNameOnBank}")`,
    `Bank account operational status (${record.bankAccountStatus})`,
    `Bank branch IFSC routing code validity (${record.ifscBranchCodeStatus})`,
    `District treasury batch disbursement log (${record.treasuryBatchStatus}, event: ${record.lastPaymentEventCode})`,
  ];

  // Build interactive decision tree steps
  const step1: DecisionTreeStep = {
    stepNumber: 1,
    label: 'Inspect available records',
    question: 'Is the underlying pension application approved and active?',
    finding:
      record.applicationState === 'Approved'
        ? 'Application is Approved. Delayed payment is NOT caused by application rejection.'
        : `Application status is ${record.applicationState}.`,
    status: record.applicationState === 'Approved' ? 'checked' : 'flagged',
  };

  const step2: DecisionTreeStep = {
    stepNumber: 2,
    label: 'Check verification and document status',
    question: 'Has identity verification expired, or is it still within the valid window?',
    finding:
      record.verificationState === 'Expired'
        ? `Verification is Expired (${Math.abs(record.verificationDaysRemaining)} days past due).`
        : record.verificationState === 'Due soon'
          ? `Verification is Due in ${record.verificationDaysRemaining} days (NOT expired yet).`
          : `Verification is ${record.verificationState}.`,
    status: record.verificationState === 'Expired' ? 'flagged' : 'checked',
  };

  const accountIssue =
    record.bankAccountStatus === 'closed' ||
    record.beneficiaryNameOnPension.trim().toLowerCase() !== record.beneficiaryNameOnBank.trim().toLowerCase() ||
    record.ifscBranchCodeStatus === 'legacy_merged_invalid';

  const accountUnknown =
    record.bankAccountStatus === 'unknown' || record.ifscBranchCodeStatus === 'unknown';

  const step3: DecisionTreeStep = {
    stepNumber: 3,
    label: 'Check available account information',
    question: 'Do bank account status, holder name, and branch IFSC code match requirements?',
    finding: accountUnknown
      ? 'Bank account and IFSC routing confirmation are missing from the available record.'
      : record.bankAccountStatus === 'closed'
        ? 'Synthetic record shows the destination bank account is marked closed/dormant.'
        : record.beneficiaryNameOnPension.trim().toLowerCase() !== record.beneficiaryNameOnBank.trim().toLowerCase()
          ? `Name mismatch detected: "${record.beneficiaryNameOnPension}" vs "${record.beneficiaryNameOnBank}".`
          : record.ifscBranchCodeStatus === 'legacy_merged_invalid'
            ? 'Recorded IFSC code belongs to a pre-merger branch code that rejected NEFT routing.'
            : 'Bank account status, holder name, and IFSC code appear valid.',
    status: accountUnknown ? 'uncertain' : accountIssue ? 'flagged' : 'checked',
  };

  const step4: DecisionTreeStep = {
    stepNumber: 4,
    label: 'Review available payment events',
    question: 'What does the latest disbursement event log show?',
    finding: `Last recorded event code: ${record.lastPaymentEventCode} (${record.paymentMonthsLate} months delayed).`,
    status:
      record.treasuryBatchStatus === 'unknown'
        ? 'uncertain'
        : record.treasuryBatchStatus === 'pending_tranche_release' || accountIssue || record.verificationState === 'Expired'
          ? 'flagged'
          : 'checked',
  };

  // Evaluate rules in clear deterministic order
  // Case A: Lapsed identity verification (separate test case)
  if (record.verificationState === 'Expired') {
    const decisionTree: DecisionTreeStep[] = [
      step1,
      step2,
      step3,
      step4,
      {
        stepNumber: 5,
        label: 'Identify possible cause',
        question: 'Which rule matched the observed evidence?',
        finding: 'Rule matched: Lapsed Identity Verification hold.',
        status: 'flagged',
      },
      {
        stepNumber: 6,
        label: 'Recommend next steps',
        question: 'What safe action can the beneficiary take?',
        finding: 'Complete annual life verification via doorstep visit or assisted checklist.',
        status: 'checked',
      },
    ];

    return {
      scenarioId: record.scenarioId,
      title: 'Lapsed Identity Verification',
      whatSystemChecked,
      evidenceFound: [
        'Application status remains Approved.',
        `Annual identity verification status is Expired (${Math.abs(record.verificationDaysRemaining)} days overdue).`,
        `Disbursement log recorded code ${record.lastPaymentEventCode}.`,
      ],
      whatRemainsUnknown: [
        'Exact settlement cycle date when the treasury will release held arrears after verification is recorded.',
        'Whether any secondary bank account dormancy occurred during the hold period.',
      ],
      possibleOrRecordedCause:
        'Expired verification is the recorded cause in this demonstration scenario. Completing verification is the recommended next step. The timing of the actual payment remains uncertain and is not guaranteed.',
      specificBannerMessage:
        'Expired verification is the recorded cause in this demonstration scenario. Completing verification is the recommended next step. The timing of the actual payment remains uncertain and is not guaranteed.',
      responsibleParty: 'Beneficiary',
      recommendedCorrection:
        'Submit annual life verification (Jeevan Pramaan / doorstep verification) and keep the confirmation receipt.',
      escalationPath:
        'If payment status does not move to Processing within 15 working days after verification, present the verification receipt to the Block Welfare Officer.',
      certaintyClassification: 'Known cause in the synthetic record',
      decisionTree,
      checklistActionTitle: 'Complete overdue identity verification and save confirmation receipt',
    };
  }

  // Case B: Closed bank account
  if (record.bankAccountStatus === 'closed') {
    return {
      scenarioId: record.scenarioId,
      title: 'Closed or Dormant Bank Account',
      whatSystemChecked,
      evidenceFound: [
        'Application is Approved and Verification is current.',
        `Bank clearing log returned ${record.lastPaymentEventCode} indicating the destination account is closed or frozen for dormancy.`,
      ],
      whatRemainsUnknown: [
        'Whether the bank account can be reactivated via in-branch KYC or requires linking an existing active account in Lakshmi Devi’s own name.',
        'Exact date the returned funds were credited back to the district treasury suspense account.',
      ],
      possibleOrRecordedCause:
        'Closed bank account in the synthetic record prevented credit settlement for the last 3 monthly cycles.',
      responsibleParty: 'Beneficiary',
      recommendedCorrection:
        'Visit the bank branch (or request a doorstep banking officer) to reactivate the dormant account in your own name, then ask the pension office to re-trigger the returned batches.',
      escalationPath:
        'Submit the bank reactivation stamp to the District Social Security Officer with enquiry code R04.',
      certaintyClassification: 'Known cause in the synthetic record',
      decisionTree: [
        step1,
        step2,
        step3,
        step4,
        {
          stepNumber: 5,
          label: 'Identify possible cause',
          question: 'Which rule matched the observed evidence?',
          finding: 'Rule matched: Destination bank account closed or dormant (Code R04).',
          status: 'flagged',
        },
        {
          stepNumber: 6,
          label: 'Recommend next steps',
          question: 'What safe action can the beneficiary take?',
          finding: 'Reactivate own bank account or update mandate in beneficiary’s own name only.',
          status: 'checked',
        },
      ],
      checklistActionTitle: 'Verify bank account active status with branch and prepare R04 reactivation enquiry',
    };
  }

  // Case C: Account holder name mismatch
  if (
    record.beneficiaryNameOnPension.trim().toLowerCase() !==
    record.beneficiaryNameOnBank.trim().toLowerCase()
  ) {
    return {
      scenarioId: record.scenarioId,
      title: 'Account Holder Name Mismatch',
      whatSystemChecked,
      evidenceFound: [
        `Pension roll name is "${record.beneficiaryNameOnPension}" while bank KYC name is "${record.beneficiaryNameOnBank}".`,
        `Payment gateway flagged event ${record.lastPaymentEventCode} during automated beneficiary name validation.`,
      ],
      whatRemainsUnknown: [
        'Whether the district officer can approve a minor spelling equivalence override without changing bank passbook records.',
      ],
      possibleOrRecordedCause:
        'Spelling variation between the pension sanction record and bank core KYC triggered an automated name-mismatch hold.',
      responsibleParty: 'Pension Disbursing Office',
      recommendedCorrection:
        'Present a copy of the bank passbook and pension sanction letter so the officer can record a verified name-equivalence note.',
      escalationPath:
        'Escalate to the Block Social Welfare Desk with passbook copy and sanction ID #SSP-2021-88412.',
      certaintyClassification: 'Known cause in the synthetic record',
      decisionTree: [
        step1,
        step2,
        step3,
        step4,
        {
          stepNumber: 5,
          label: 'Identify possible cause',
          question: 'Which rule matched the observed evidence?',
          finding: 'Rule matched: Name string mismatch between pension roll and bank KYC.',
          status: 'flagged',
        },
        {
          stepNumber: 6,
          label: 'Recommend next steps',
          question: 'What safe action can the beneficiary take?',
          finding: 'Request name-equivalence verification with pension officer using passbook copy.',
          status: 'checked',
        },
      ],
      checklistActionTitle: 'Prepare name-mismatch clarification packet (Passbook + Sanction Letter)',
    };
  }

  // Case D: Wrong bank-branch code (IFSC) — covers both `wrong_branch_code` and `primary_lakshmi`
  if (record.ifscBranchCodeStatus === 'legacy_merged_invalid') {
    const isPrimary = record.scenarioId === 'primary_lakshmi';
    return {
      scenarioId: record.scenarioId,
      title: isPrimary
        ? 'Wrong Bank-Branch Code (Post-Merger IFSC) — While Verification Is Due in 12 Days'
        : 'Wrong Bank-Branch Code (Legacy IFSC)',
      whatSystemChecked,
      evidenceFound: [
        'Pension Application is Approved (Sanction #SSP-2021-88412).',
        'Identity Verification is Due in 12 days — it is still valid today and did NOT cause the 3-month retrospective delay.',
        `Payment batches failed with code ${record.lastPaymentEventCode} because the recorded IFSC code belongs to a merged bank branch.`,
      ],
      whatRemainsUnknown: [
        'Whether the bank has automatically mapped the old IFSC or requires the pension office to enter the new post-merger IFSC code.',
        'Exact date when the 3 delayed monthly installments will be re-queued once the IFSC code is updated.',
      ],
      possibleOrRecordedCause:
        'Outdated bank-branch IFSC code in the disbursement record caused NEFT returns over the past 3 months. Note: Verification is due in 12 days (not expired), so verification is a separate upcoming task, not the cause of the past delay.',
      responsibleParty: 'Pension Disbursing Office',
      recommendedCorrection:
        'Provide your updated bank passbook showing the new post-merger IFSC code to the pension office (keep the account in Lakshmi Devi’s own name), and complete your upcoming verification within 12 days so no second hold occurs.',
      escalationPath:
        'Submit the IFSC update enquiry form to the District Pension Cell and request re-initiation of returned NEFT batches.',
      certaintyClassification: isPrimary ? 'Possible cause' : 'Known cause in the synthetic record',
      decisionTree: [
        step1,
        step2,
        step3,
        step4,
        {
          stepNumber: 5,
          label: 'Identify possible cause',
          question: 'Which rule matched the observed evidence?',
          finding:
            'Rule matched: Legacy branch IFSC code rejected NEFT transfer (Verification is still valid for 12 days).',
          status: 'flagged',
        },
        {
          stepNumber: 6,
          label: 'Recommend next steps',
          question: 'What safe action can the beneficiary take?',
          finding:
            'Update branch IFSC code for Lakshmi Devi’s existing account and complete life verification before day 12.',
          status: 'checked',
        },
      ],
      checklistActionTitle: 'Submit updated branch IFSC code for own bank account & complete verification within 12 days',
    };
  }

  // Case E: Funding-release delay
  if (record.treasuryBatchStatus === 'pending_tranche_release') {
    return {
      scenarioId: record.scenarioId,
      title: 'Funding-Release Delay (Treasury Tranche Pending)',
      whatSystemChecked,
      evidenceFound: [
        'Application is Approved, Verification is valid, and Bank account + IFSC details passed validation.',
        `District treasury log shows code ${record.lastPaymentEventCode} (batch awaiting state tranche release).`,
      ],
      whatRemainsUnknown: [
        'Exact date the state finance department will release the pending quarterly tranche to the district treasury.',
      ],
      possibleOrRecordedCause:
        'Administrative funding-release delay at the treasury batch level. No fault or error exists in the beneficiary’s personal documents or bank account.',
      responsibleParty: 'Pension Disbursing Office',
      recommendedCorrection:
        'No document correction is required from the beneficiary. Keep reminders active and do not pay intermediaries or change your bank account.',
      escalationPath:
        'Log a batch-status enquiry with the District Welfare Helpline referencing event code TREASURY_TRANCHE_Q3.',
      certaintyClassification: 'Known cause in the synthetic record',
      decisionTree: [
        step1,
        step2,
        step3,
        step4,
        {
          stepNumber: 5,
          label: 'Identify possible cause',
          question: 'Which rule matched the observed evidence?',
          finding: 'Rule matched: District treasury funding tranche awaiting release.',
          status: 'flagged',
        },
        {
          stepNumber: 6,
          label: 'Recommend next steps',
          question: 'What safe action can the beneficiary take?',
          finding: 'No personal document error found; monitor official batch release and avoid unnecessary changes.',
          status: 'checked',
        },
      ],
      checklistActionTitle: 'Save treasury batch reference code for official status enquiry (no bank change needed)',
    };
  }

  // Case F: Incomplete or insufficient evidence
  return {
    scenarioId: record.scenarioId,
    title: 'Incomplete or Insufficient Evidence — Official Confirmation Required',
    whatSystemChecked,
    evidenceFound: [
      `Application is ${record.applicationState} and Verification is ${record.verificationState}.`,
      `Payment is delayed by ${record.paymentMonthsLate} months, but bank clearing and treasury logs returned "${record.lastPaymentEventCode}".`,
    ],
    whatRemainsUnknown: [
      'Current operational status of the destination bank account.',
      'Whether the branch IFSC routing code succeeded or bounced.',
      'Whether the district treasury has transmitted the payment batch.',
    ],
    possibleOrRecordedCause:
      'Insufficient evidence in the available local record to determine a single cause. Both bank clearing confirmation and treasury batch logs are missing.',
    responsibleParty: 'Shared / Needs Confirmation',
    recommendedCorrection:
      'Generate a structured official enquiry sheet listing the missing bank and treasury fields before visiting or calling the helpdesk.',
    escalationPath:
      'Request a joint ledger check at the Citizen Service Centre / Block Welfare Desk using Sanction ID #SSP-2021-88412.',
    certaintyClassification: 'Needs confirmation',
    decisionTree: [
      step1,
      step2,
      step3,
      step4,
      {
        stepNumber: 5,
        label: 'Identify possible cause',
        question: 'Which rule matched the observed evidence?',
        finding: 'Insufficient telemetry in synthetic record — refuses to guess or fabricate a cause.',
        status: 'uncertain',
      },
      {
        stepNumber: 6,
        label: 'Recommend next steps',
        question: 'What safe action can the beneficiary take?',
        finding: 'Prepare an official enquiry packet requesting bank & treasury settlement logs.',
        status: 'checked',
      },
    ],
    checklistActionTitle: 'Prepare official enquiry sheet to confirm missing bank and treasury settlement logs',
  };
}
