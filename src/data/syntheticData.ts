import {
  AuditEvent,
  BeneficiaryProfile,
  BenefitStateMachines,
  CaregiverPermission,
  ChecklistItem,
  DeadlineItem,
  DocumentItem,
  EligibilityApplicantInput,
  FieldVisitRequest,
  HighRiskRequest,
  NotificationItem,
  OfflineDraft,
  SensitiveReportState,
  TrustedContact,
} from '../types/models';

export const INITIAL_BENEFICIARY_PROFILE: BeneficiaryProfile = {
  id: 'ben-lakshmi-01',
  name: 'Lakshmi Devi',
  age: 72,
  schemeName: 'Social Security Old Age & Disability Support Pension (Synthetic Record)',
  pensionId: 'SSP-2021-88412',
  monthlyAmountINR: 2500,
  district: 'Warangal Urban (Synthetic Demo)',
  state: 'Telangana',
  bankName: 'Deccan Gramin Bank (Merged Branch)',
  maskedAccount: 'XXXX-XXXX-4821 (In Lakshmi Devi’s Own Name)',
  ifscCode: 'DGBX0001042 (Legacy Pre-Merger Code)',
  verificationDueDays: 12,
  paymentMonthsLate: 3,
  accessibilityNeeds: ['Low vision (prefers large text & high contrast)', 'Hearing loss (uses captions & clear visual alerts)'],
  supportPersonName: 'Arjun Kumar',
  supportPersonRelation: 'Grandchild (assists with digital tasks)',
  accessConcernSummary:
    'Grandchild requests full account access and proposes changing the pension bank account to his own personal account.',
};

export const INITIAL_STATE_MACHINES: BenefitStateMachines = {
  application: 'Approved',
  verification: 'Due soon',
  renewal: 'Due soon',
  payment: 'Delayed',
  lastUpdated: {
    application: '2026-02-14',
    verification: '2026-10-12',
    renewal: '2026-10-08',
    payment: '2026-10-19',
  },
  events: {
    application: 'Sanction Order #SSP-2021-88412 remains active and Approved. No re-application required.',
    verification: 'Annual Life Certificate (Jeevan Pramaan) is Due in 12 days (Deadline: Nov 05, 2026).',
    renewal: 'Supporting Low-Vision Medical Certificate approaches 5-year review in 28 days.',
    payment: 'Last 3 monthly pension transfers (Aug, Sep, Oct) returned with code NEFT_RETURN_ERR_IFSC_MERGED_404.',
  },
};

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-life-cert',
    name: 'Annual Life Verification Certificate (Jeevan Pramaan)',
    category: 'Identity & Life Certificate',
    expiryDate: '2026-11-05',
    daysRemaining: 12,
    verificationStatus: 'Due in 12 days',
    requiredAction: 'Complete biometric or doorstep life verification within 12 days',
    plainLanguageNextStep:
      'Your current verification is still valid for 12 days. Complete the checklist or request a doorstep visit before Nov 05 so your upcoming winter payments are not paused.',
    reminderEnabled: true,
    reminderChannel: 'In-App Banner',
    completed: false,
  },
  {
    id: 'doc-disability-cert',
    name: 'Supporting Low-Vision & Hearing Assessment Certificate',
    category: 'Disability & Medical',
    expiryDate: '2026-11-21',
    daysRemaining: 28,
    verificationStatus: 'Approaching expiry',
    requiredAction: 'Review certificate expiry date and book renewal check if needed',
    plainLanguageNextStep:
      'This supporting document expires in 28 days. Reviewing it now prevents your supplemental care allowance renewal from becoming overdue next month.',
    reminderEnabled: true,
    reminderChannel: 'SMS (Simulated)',
    completed: false,
  },
  {
    id: 'doc-bank-passbook',
    name: 'Bank Passbook & Post-Merger IFSC Routing Sheet',
    category: 'Bank Mandate',
    expiryDate: '2027-03-31',
    daysRemaining: 158,
    verificationStatus: 'Action required',
    requiredAction: 'Confirm new post-merger IFSC code for existing account XXXX-4821',
    plainLanguageNextStep:
      'Your bank branch merged recently. Keep the account in your own name (XXXX-4821), and share the updated branch IFSC code with the pension desk.',
    reminderEnabled: true,
    reminderChannel: 'In-App Banner',
    completed: false,
  },
  {
    id: 'doc-residency-age',
    name: 'Senior Citizen Age & State Residency Proof',
    category: 'Residency & Age',
    expiryDate: '2030-12-31',
    daysRemaining: 1529,
    verificationStatus: 'Verified',
    requiredAction: 'No action needed — permanently verified on pension roll',
    plainLanguageNextStep:
      'Your age and residency record is permanently verified in the synthetic pension register.',
    reminderEnabled: false,
    reminderChannel: 'In-App Banner',
    completed: true,
  },
];

export const INITIAL_DEADLINES: DeadlineItem[] = [
  {
    id: 'dl-1',
    title: 'Annual Identity Verification (Due in 12 days)',
    dueDate: '2026-11-05',
    daysRemaining: 12,
    process: 'Verification',
    priority: 'high',
    completed: false,
  },
  {
    id: 'dl-2',
    title: 'Update Post-Merger Bank IFSC Code (For Delayed Payment)',
    dueDate: '2026-10-30',
    daysRemaining: 6,
    process: 'Payment',
    priority: 'high',
    completed: false,
  },
  {
    id: 'dl-3',
    title: 'Supporting Medical Certificate Renewal Review',
    dueDate: '2026-11-21',
    daysRemaining: 28,
    process: 'Documents',
    priority: 'medium',
    completed: false,
  },
];

export const INITIAL_CAREGIVER_PERMISSIONS: CaregiverPermission[] = [
  {
    id: 'view_benefit_status',
    title: 'Viewing benefit status',
    purpose: 'Allows Arjun (Grandchild) to read application, verification, renewal, and payment status timelines.',
    scopeDescription: 'Read-only access to status cards and timelines. Cannot alter records or bank accounts.',
    allowedActions: ['View 4 benefit status lanes', 'Read diagnostic explanation'],
    prohibitedActions: ['Change bank account', 'Withdraw or redirect pension funds', 'Cancel benefit'],
    status: 'Granted',
    expiresAt: '2026-11-23 (30-day scoped pass)',
    lastModified: '2026-10-10 09:30',
  },
  {
    id: 'help_with_documents',
    title: 'Helping with documents',
    purpose: 'Allows Arjun to help organize checklists and prepare document renewal reminders.',
    scopeDescription: 'Prepare local checklists and draft reminders. Cannot submit binding legal changes without Lakshmi Devi.',
    allowedActions: ['Check document expiry dates', 'Prepare verification checklist items'],
    prohibitedActions: ['Alter primary identity record', 'Modify bank mandate'],
    status: 'Granted',
    expiresAt: '2026-11-23 (30-day scoped pass)',
    lastModified: '2026-10-10 09:30',
  },
  {
    id: 'view_reminders',
    title: 'Viewing reminders',
    purpose: 'Allows Arjun to receive duplicate deadline reminders so he can remind Lakshmi Devi in person.',
    scopeDescription: 'Read-only access to upcoming verification and document renewal dates.',
    allowedActions: ['View 12-day verification countdown', 'View scheduled home-visit window'],
    prohibitedActions: ['Disable security alerts', 'Change trusted contact'],
    status: 'Granted',
    expiresAt: '2026-11-23 (30-day scoped pass)',
    lastModified: '2026-10-10 09:30',
  },
  {
    id: 'prepare_enquiry',
    title: 'Preparing an enquiry',
    purpose: 'Allows Arjun to draft a payment-delay enquiry sheet for the pension office.',
    scopeDescription: 'Draft-only preparation. Official submission or account change requires Lakshmi Devi’s direct confirmation.',
    allowedActions: ['Generate payment delay diagnostic summary', 'Save local doorstep visit draft'],
    prohibitedActions: ['Redirect pension to caregiver account', 'Self-approve high-risk requests'],
    status: 'Granted',
    expiresAt: '2026-11-23 (30-day scoped pass)',
    lastModified: '2026-10-10 09:30',
  },
];

export const INITIAL_TRUSTED_CONTACT: TrustedContact = {
  id: 'tc-meena-01',
  name: 'Meena Kumari',
  relationship: 'Neighborhood ASHA Worker & Accredited Community Support Contact',
  phoneMasked: '+91 98XXX-XX410 (Simulated)',
  roleDescription:
    'Receives privacy-safe alerts when high-risk profile changes (like bank account edits) are attempted. Sees zero bank numbers or financial balances.',
  notifiedOnHighRisk: false,
};

export const INITIAL_HIGH_RISK_REQUEST: HighRiskRequest = {
  id: 'hr-bank-none',
  type: 'BANK_ACCOUNT_CHANGE',
  requestedBy: 'Arjun (Grandchild / Caregiver)',
  requestedRole: 'Caregiver',
  requestedAt: 'Not triggered yet',
  proposedBankHolder: 'Arjun Kumar (Caregiver Own Account)',
  proposedAccountMasked: 'XXXX-XXXX-9914 (Third-Party Account)',
  riskClassification: 'High Risk — Financial Redirection',
  status: 'None',
  coolingOffHoursRemaining: 72,
  beneficiaryConfirmed: false,
  trustedContactNotified: false,
  selfApprovalBlockedCount: 0,
  postRevocationBlockedCount: 0,
  explanationMessage:
    'To keep your savings safe, we’ll confirm this change with you directly. Nothing changes for 72 hours.',
};

export const INITIAL_CHECKLIST: ChecklistItem[] = [
  {
    id: 'chk-1',
    title: 'Prepare Annual Life Verification (Due in 12 days)',
    description: 'Keep Pension Sanction ID #SSP-2021-88412 and identity card ready for verification before Nov 05.',
    category: 'Verification',
    completed: true,
    source: 'Verification Checklist',
  },
  {
    id: 'chk-2',
    title: 'Inspect 3-month payment delay reason in Payment Diagnosis',
    description: 'Check why payments were delayed even though your pension application is Approved.',
    category: 'Payment Diagnosis',
    completed: false,
    source: 'Overview Recommended Action',
  },
  {
    id: 'chk-3',
    title: 'Review supporting medical certificate expiring in 28 days',
    description: 'Confirm whether your low-vision assessment certificate needs a renewal appointment.',
    category: 'Documents',
    completed: false,
    source: 'Documents & Deadlines',
  },
  {
    id: 'chk-4',
    title: 'Review caregiver permissions and bank account safeguards',
    description: 'Ensure Arjun can help with digital checklists while bank account authority stays locked to you.',
    category: 'Safety',
    completed: false,
    source: 'Caregiver Access Protection',
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    timestamp: '2026-10-23 09:00',
    title: 'Annual Verification Due in 12 Days',
    message:
      'Your identity verification is due on Nov 05, 2026 (12 days remaining). Your verification is still valid today.',
    lockScreenPreviewSafe: 'SEVA SUTRA: You have an upcoming task reminder in 12 days.',
    category: 'Verification',
    severity: 'warning',
    read: false,
  },
  {
    id: 'notif-2',
    timestamp: '2026-10-22 14:30',
    title: 'Supporting Document Approaching Expiry (28 Days)',
    message:
      'Your Supporting Low-Vision & Hearing Assessment Certificate approaches renewal on Nov 21, 2026.',
    lockScreenPreviewSafe: 'SEVA SUTRA: Document review reminder available in your dashboard.',
    category: 'Document',
    severity: 'info',
    read: false,
  },
  {
    id: 'notif-3',
    timestamp: '2026-10-19 11:15',
    title: 'Pension Payment Delayed — Application Remains Approved',
    message:
      'Your monthly payment is delayed (3 months), but your pension application is still Approved. Open Payment Diagnosis to see what was checked.',
    lockScreenPreviewSafe: 'SEVA SUTRA: Status update available on your service timeline.',
    category: 'Payment',
    severity: 'warning',
    read: false,
  },
  {
    id: 'notif-4',
    timestamp: '2026-10-10 09:30',
    title: 'Scoped Caregiver Access Granted to Arjun',
    message:
      'Arjun (Grandchild) was granted 4 assistive scopes (View status, Help with documents, View reminders, Prepare enquiry). Financial and bank controls remain restricted.',
    lockScreenPreviewSafe: 'SEVA SUTRA: Delegated helper permissions were reviewed.',
    category: 'Security',
    severity: 'info',
    read: true,
  },
];

export const INITIAL_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'aud-seed-1',
    timestamp: '2026-10-23 09:00',
    actor: 'SEVA SUTRA Safeguard Engine',
    action: 'Triggered 12-day countdown reminder for Annual Life Verification',
    outcome: 'Allowed',
    source: 'Deadline Scheduler',
    riskClassification: 'Standard',
  },
  {
    id: 'aud-seed-2',
    timestamp: '2026-10-22 14:30',
    actor: 'SEVA SUTRA Safeguard Engine',
    action: 'Flagged supporting medical certificate approaching expiry (28 days remaining)',
    outcome: 'Allowed',
    source: 'Document Monitor',
    riskClassification: 'Standard',
  },
  {
    id: 'aud-seed-3',
    timestamp: '2026-10-19 11:15',
    actor: 'SEVA SUTRA Safeguard Engine',
    action: 'Recorded delayed payment batch event NEFT_RETURN_ERR_IFSC_MERGED_404 without altering Approved application state',
    outcome: 'Allowed',
    source: 'Benefit State Machine',
    riskClassification: 'Elevated',
  },
  {
    id: 'aud-seed-4',
    timestamp: '2026-10-10 09:30',
    actor: 'Lakshmi Devi (Beneficiary)',
    action: 'Granted scoped assistive permissions to Arjun (Caregiver) — bank modification explicitly excluded',
    outcome: 'Allowed',
    source: 'Caregiver Access Control',
    riskClassification: 'Elevated',
  },
];

export const INITIAL_OFFLINE_DRAFT: OfflineDraft = {
  id: 'draft-verif-2026',
  workflowName: 'Annual Identity Verification & Document Preparation Checklist',
  savedAt: '2026-10-23 21:40',
  lastConfirmedStep: 'Saving the checklist',
  completedStepIds: ['verif-step-1', 'verif-step-2'],
  notes: 'Confirmed Pension ID #SSP-2021-88412 and Post-Merger Bank Passbook copy are in the blue folder.',
  isOfflineInterrupted: false,
  reconnectedReadBackPending: false,
};

export const INITIAL_FIELD_VISIT_REQUEST: FieldVisitRequest = {
  id: 'visit-req-2026-01',
  preferredDate: '2026-10-29',
  preferredTimeWindow: 'Morning (09:00 - 12:00)',
  contactMethod: 'Doorstep Officer Knock',
  accessibilityNotes:
    'Beneficiary has low vision and hearing loss. Please knock loudly, speak clearly face-to-face, and bring large-print receipt.',
  reason: 'Annual Life Certificate verification + Post-merger bank IFSC update assistance',
  status: 'Demo request recorded locally — not officially booked',
  updatedAt: '2026-10-23 18:20',
};

export const INITIAL_SENSITIVE_REPORT: SensitiveReportState = {
  stage: 1,
  reportType: 'Incapacity / Hospitalization',
  reporterName: '',
  reporterRelationship: '',
  dateOfEvent: '2026-10-23',
  notes: '',
  recordedLocally: false,
};

export const INITIAL_ELIGIBILITY_INPUT: EligibilityApplicantInput = {
  age: 72,
  monthlyHouseholdIncomeINR: 3200,
  hasDisabilityCertificate: false,
  disabilityPercentage: 50,
  residencyYearsInState: 42,
  residencyDocumentAvailable: true,
  receivesAnotherStatePension: true,
  maritalStatus: 'Widowed',
};
