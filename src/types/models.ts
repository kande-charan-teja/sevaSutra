export type ApplicationState = 'Draft' | 'Submitted' | 'Under review' | 'Approved' | 'Rejected';

export type VerificationState =
  | 'Not started'
  | 'In progress'
  | 'Due soon'
  | 'Action required'
  | 'Verified'
  | 'Expired';

export type RenewalState = 'Not due' | 'Due soon' | 'Submitted' | 'Renewed' | 'Overdue';

export type PaymentState =
  | 'Scheduled'
  | 'Processing'
  | 'Credited'
  | 'Delayed'
  | 'Under investigation';

export interface BenefitStateMachines {
  application: ApplicationState;
  verification: VerificationState;
  renewal: RenewalState;
  payment: PaymentState;
  lastUpdated: {
    application: string;
    verification: string;
    renewal: string;
    payment: string;
  };
  events: {
    application: string;
    verification: string;
    renewal: string;
    payment: string;
  };
}

export type CertaintyClassification =
  | 'Known cause in the synthetic record'
  | 'Possible cause'
  | 'Needs confirmation';

export interface CrossProcessHypothesis {
  id: string;
  fromProcess: 'Application' | 'Verification' | 'Renewal' | 'Payment';
  toProcess: 'Application' | 'Verification' | 'Renewal' | 'Payment';
  observedState: string;
  supportingEvidence: string;
  potentialRelationship: string;
  confidenceClassification: CertaintyClassification;
  informationStillMissing: string;
  recommendedInvestigation: string;
}

export type DiagnosticScenarioId =
  | 'primary_lakshmi'
  | 'account_mismatch'
  | 'closed_bank_account'
  | 'lapsed_verification'
  | 'funding_release_delay'
  | 'wrong_branch_code'
  | 'incomplete_evidence';

export interface DecisionTreeStep {
  stepNumber: number;
  label: string;
  question: string;
  finding: string;
  status: 'checked' | 'flagged' | 'uncertain';
}

export interface DiagnosticInputRecord {
  scenarioId: DiagnosticScenarioId;
  scenarioTitle: string;
  scenarioDescription: string;
  applicationState: ApplicationState;
  verificationState: VerificationState;
  verificationDaysRemaining: number;
  bankAccountStatus: 'active' | 'closed' | 'unknown';
  beneficiaryNameOnPension: string;
  beneficiaryNameOnBank: string;
  ifscBranchCodeStatus: 'valid' | 'legacy_merged_invalid' | 'unknown';
  treasuryBatchStatus: 'released' | 'pending_tranche_release' | 'unknown';
  paymentMonthsLate: number;
  lastPaymentEventCode: string;
}

export interface DiagnosticResult {
  scenarioId: DiagnosticScenarioId;
  title: string;
  whatSystemChecked: string[];
  evidenceFound: string[];
  whatRemainsUnknown: string[];
  possibleOrRecordedCause: string;
  specificBannerMessage?: string;
  responsibleParty: 'Beneficiary' | 'Bank Branch' | 'Pension Disbursing Office' | 'Shared / Needs Confirmation';
  recommendedCorrection: string;
  escalationPath: string;
  certaintyClassification: CertaintyClassification;
  decisionTree: DecisionTreeStep[];
  checklistActionTitle: string;
}

export interface BeneficiaryProfile {
  id: string;
  name: string;
  age: number;
  schemeName: string;
  pensionId: string;
  monthlyAmountINR: number;
  district: string;
  state: string;
  bankName: string;
  maskedAccount: string;
  ifscCode: string;
  verificationDueDays: number;
  paymentMonthsLate: number;
  accessibilityNeeds: string[];
  supportPersonName: string;
  supportPersonRelation: string;
  accessConcernSummary: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  category: 'Identity & Life Certificate' | 'Disability & Medical' | 'Residency & Age' | 'Bank Mandate';
  expiryDate: string;
  daysRemaining: number;
  verificationStatus: 'Verified' | 'Due in 12 days' | 'Approaching expiry' | 'Action required' | 'Completed in Demo';
  requiredAction: string;
  plainLanguageNextStep: string;
  reminderEnabled: boolean;
  reminderChannel: 'Voice Call (Simulated)' | 'SMS (Simulated)' | 'In-App Banner';
  completed: boolean;
}

export interface DeadlineItem {
  id: string;
  title: string;
  dueDate: string;
  daysRemaining: number;
  process: 'Application' | 'Verification' | 'Renewal' | 'Payment' | 'Documents';
  priority: 'high' | 'medium' | 'normal';
  completed: boolean;
}

export type PermissionScopeId =
  | 'view_benefit_status'
  | 'help_with_documents'
  | 'view_reminders'
  | 'prepare_enquiry';

export interface CaregiverPermission {
  id: PermissionScopeId;
  title: string;
  purpose: string;
  scopeDescription: string;
  allowedActions: string[];
  prohibitedActions: string[];
  status: 'Granted' | 'Revoked' | 'Expired';
  expiresAt: string;
  lastModified: string;
}

export interface TrustedContact {
  id: string;
  name: string;
  relationship: string;
  phoneMasked: string;
  roleDescription: string;
  notifiedOnHighRisk: boolean;
  lastNotifiedAt?: string;
}

export type HighRiskRequestStatus =
  | 'None'
  | 'CoolingOff_PendingBeneficiary'
  | 'Quarantined_AccessRevoked'
  | 'Cancelled_ByBeneficiary';

export interface HighRiskRequest {
  id: string;
  type: 'BANK_ACCOUNT_CHANGE';
  requestedBy: string;
  requestedRole: 'Caregiver';
  requestedAt: string;
  proposedBankHolder: string;
  proposedAccountMasked: string;
  riskClassification: 'High Risk — Financial Redirection';
  status: HighRiskRequestStatus;
  coolingOffHoursRemaining: number;
  beneficiaryConfirmed: boolean;
  trustedContactNotified: boolean;
  selfApprovalBlockedCount: number;
  postRevocationBlockedCount: number;
  explanationMessage: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: 'Verification' | 'Payment Diagnosis' | 'Documents' | 'Safety';
  completed: boolean;
  source: string;
}

export interface NotificationItem {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  lockScreenPreviewSafe: string;
  category: 'Verification' | 'Document' | 'Payment' | 'Security' | 'Offline' | 'Visit';
  severity: 'info' | 'warning' | 'high-risk' | 'success';
  read: boolean;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: 'Lakshmi Devi (Beneficiary)' | 'Arjun (Caregiver)' | 'Service Officer (Demo)' | 'SEVA SUTRA Safeguard Engine';
  action: string;
  outcome: 'Allowed' | 'Blocked' | 'Escalated / Cooling-off' | 'Quarantined' | 'Recorded locally';
  source: string;
  riskClassification: 'Standard' | 'Elevated' | 'High Risk' | 'Critical Safeguard';
}

export interface OfflineDraft {
  id: string;
  workflowName: string;
  savedAt: string;
  lastConfirmedStep: string;
  completedStepIds: string[];
  notes: string;
  isOfflineInterrupted: boolean;
  reconnectedReadBackPending: boolean;
}

export interface FieldVisitRequest {
  id: string;
  preferredDate: string;
  preferredTimeWindow: 'Morning (09:00 - 12:00)' | 'Afternoon (12:00 - 15:00)' | 'Late Afternoon (15:00 - 17:30)';
  contactMethod: 'Doorstep Officer Knock' | 'Phone Call via Neighbor / Landline' | 'Accessible Voice Alert';
  accessibilityNotes: string;
  reason: string;
  status: 'Unsaved' | 'Draft saved locally' | 'Demo request recorded locally — not officially booked';
  updatedAt: string;
}

export interface SensitiveReportState {
  stage: 1 | 2 | 3 | 4;
  reportType: 'Incapacity / Hospitalization' | 'Bereavement / Death of Beneficiary';
  reporterName: string;
  reporterRelationship: string;
  dateOfEvent: string;
  notes: string;
  recordedLocally: boolean;
  referenceNote?: string;
}

export interface EligibilityApplicantInput {
  age: number;
  monthlyHouseholdIncomeINR: number;
  hasDisabilityCertificate: boolean;
  disabilityPercentage: number;
  residencyYearsInState: number;
  residencyDocumentAvailable: boolean;
  receivesAnotherStatePension: boolean;
  maritalStatus: 'Widowed' | 'Single / Unmarried' | 'Married';
}

export type EligibilityOutcome = 'Eligible' | 'Not eligible' | 'Needs confirmation';

export interface CriterionEvaluation {
  criterionId: string;
  label: string;
  ruleDescription: string;
  userValue: string;
  status: 'matched' | 'not_matched' | 'missing_info';
  requiresOfficialConfirmation: boolean;
}

export interface SchemeEvaluationResult {
  schemeId: string;
  schemeName: string;
  monthlyBenefitINR: number;
  description: string;
  outcome: EligibilityOutcome;
  criteriaChecked: CriterionEvaluation[];
  matchedCriteria: string[];
  unmatchedCriteria: string[];
  missingInformation: string[];
  factsRequiringOfficialConfirmation: string[];
  recommendedNextStep: string;
}

export type UserRole = 'Beneficiary' | 'Caregiver' | 'Service Officer';

export type LanguageCode = 'en' | 'te';

export interface AccessibilitySettings {
  textSize: 'normal' | 'large' | 'xlarge';
  highContrast: boolean;
  reducedMotion: boolean;
  oneTaskAtATime: boolean;
  readAloudEnabled: boolean;
  lockScreenSafeMode: boolean;
  language: LanguageCode;
}

export type PageId =
  | 'overview'
  | 'my-benefits'
  | 'payment-diagnosis'
  | 'documents-deadlines'
  | 'caregiver-access'
  | 'notifications-activity'
  | 'explore-benefits'
  | 'assisted-completion'
  | 'accessibility-settings'
  | 'technical-evaluation';
