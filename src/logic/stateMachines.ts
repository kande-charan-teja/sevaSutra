import {
  ApplicationState,
  BenefitStateMachines,
  CrossProcessHypothesis,
  PaymentState,
  RenewalState,
  VerificationState,
} from '../types/models';

export const VALID_APPLICATION_TRANSITIONS: Record<ApplicationState, ApplicationState[]> = {
  Draft: ['Submitted'],
  Submitted: ['Under review'],
  'Under review': ['Approved', 'Rejected'],
  Approved: [],
  Rejected: ['Draft'],
};

export const VALID_VERIFICATION_TRANSITIONS: Record<VerificationState, VerificationState[]> = {
  'Not started': ['In progress', 'Due soon'],
  'Due soon': ['In progress', 'Action required', 'Expired', 'Verified'],
  'In progress': ['Verified', 'Action required', 'Expired'],
  'Action required': ['In progress', 'Verified', 'Expired'],
  Verified: ['Due soon'],
  Expired: ['In progress', 'Verified'],
};

export const VALID_RENEWAL_TRANSITIONS: Record<RenewalState, RenewalState[]> = {
  'Not due': ['Due soon'],
  'Due soon': ['Submitted', 'Overdue'],
  Submitted: ['Renewed', 'Overdue'],
  Renewed: ['Not due', 'Due soon'],
  Overdue: ['Submitted', 'Renewed'],
};

export const VALID_PAYMENT_TRANSITIONS: Record<PaymentState, PaymentState[]> = {
  Scheduled: ['Processing', 'Delayed'],
  Processing: ['Credited', 'Delayed', 'Under investigation'],
  Delayed: ['Under investigation', 'Processing', 'Credited'],
  'Under investigation': ['Processing', 'Credited', 'Delayed'],
  Credited: ['Scheduled'],
};

export interface StateTransitionResult {
  success: boolean;
  updatedMachines: BenefitStateMachines;
  error?: string;
}

export function canTransitionApplication(from: ApplicationState, to: ApplicationState): boolean {
  return VALID_APPLICATION_TRANSITIONS[from]?.includes(to) ?? false;
}

export function canTransitionVerification(from: VerificationState, to: VerificationState): boolean {
  return VALID_VERIFICATION_TRANSITIONS[from]?.includes(to) ?? false;
}

export function canTransitionRenewal(from: RenewalState, to: RenewalState): boolean {
  return VALID_RENEWAL_TRANSITIONS[from]?.includes(to) ?? false;
}

export function canTransitionPayment(from: PaymentState, to: PaymentState): boolean {
  return VALID_PAYMENT_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Transitions a single benefit process state machine without modifying any of the other three processes.
 */
export function transitionBenefitProcess(
  current: BenefitStateMachines,
  process: 'application' | 'verification' | 'renewal' | 'payment',
  targetState: string,
  timestamp = new Date().toISOString().slice(0, 10)
): StateTransitionResult {
  const clone: BenefitStateMachines = {
    application: current.application,
    verification: current.verification,
    renewal: current.renewal,
    payment: current.payment,
    lastUpdated: { ...current.lastUpdated },
    events: { ...current.events },
  };

  if (process === 'application') {
    const next = targetState as ApplicationState;
    if (!canTransitionApplication(current.application, next)) {
      return {
        success: false,
        updatedMachines: clone,
        error: `Invalid Application transition from "${current.application}" to "${next}". Application state cannot be altered arbitrarily.`,
      };
    }
    clone.application = next;
    clone.lastUpdated.application = timestamp;
    clone.events.application = `Application transitioned to ${next} on ${timestamp}.`;
    return { success: true, updatedMachines: clone };
  }

  if (process === 'verification') {
    const next = targetState as VerificationState;
    if (!canTransitionVerification(current.verification, next)) {
      return {
        success: false,
        updatedMachines: clone,
        error: `Invalid Verification transition from "${current.verification}" to "${next}".`,
      };
    }
    clone.verification = next;
    clone.lastUpdated.verification = timestamp;
    clone.events.verification = `Identity verification updated to "${next}" (${timestamp}).`;
    return { success: true, updatedMachines: clone };
  }

  if (process === 'renewal') {
    const next = targetState as RenewalState;
    if (!canTransitionRenewal(current.renewal, next)) {
      return {
        success: false,
        updatedMachines: clone,
        error: `Invalid Renewal transition from "${current.renewal}" to "${next}".`,
      };
    }
    clone.renewal = next;
    clone.lastUpdated.renewal = timestamp;
    clone.events.renewal = `Annual benefit renewal updated to "${next}" (${timestamp}).`;
    return { success: true, updatedMachines: clone };
  }

  if (process === 'payment') {
    const next = targetState as PaymentState;
    if (!canTransitionPayment(current.payment, next)) {
      return {
        success: false,
        updatedMachines: clone,
        error: `Invalid Payment transition from "${current.payment}" to "${next}".`,
      };
    }
    clone.payment = next;
    clone.lastUpdated.payment = timestamp;
    clone.events.payment = `Disbursement status changed to "${next}" (${timestamp}).`;
    return { success: true, updatedMachines: clone };
  }

  return {
    success: false,
    updatedMachines: clone,
    error: 'Unknown process specified.',
  };
}

/**
 * Generates cross-process relationships strictly as hypotheses, never mutating other states.
 */
export function evaluateCrossProcessHypotheses(machines: BenefitStateMachines): CrossProcessHypothesis[] {
  const hypotheses: CrossProcessHypothesis[] = [];

  // 1. Verification -> Payment relationship
  if (machines.payment === 'Delayed' || machines.payment === 'Under investigation') {
    if (machines.verification === 'Due soon') {
      hypotheses.push({
        id: 'hyp-verif-due-soon-payment',
        fromProcess: 'Verification',
        toProcess: 'Payment',
        observedState: `Verification is "${machines.verification}" (Due in 12 days); Payment is "${machines.payment}" (3 months late).`,
        supportingEvidence:
          'Annual life certificate window is still open for 12 more days. Past 3 monthly disbursements were held before the verification deadline arrived.',
        potentialRelationship:
          'Upcoming verification is unlikely to have caused a 3-month retrospective payment delay, though letting it expire in 12 days could add a secondary hold.',
        confidenceClassification: 'Needs confirmation',
        informationStillMissing:
          'Whether the district treasury or bank branch placed an administrative hold or branch-routing flag on the account.',
        recommendedInvestigation:
          'Run the Payment Delay Diagnosis to inspect bank branch IFSC, account status, and treasury tranche records while completing verification before day 12.',
      });
    } else if (machines.verification === 'Expired' || machines.verification === 'Action required') {
      hypotheses.push({
        id: 'hyp-verif-expired-payment',
        fromProcess: 'Verification',
        toProcess: 'Payment',
        observedState: `Verification is "${machines.verification}"; Payment is "${machines.payment}".`,
        supportingEvidence:
          'Disbursement rules pause monthly scheduling when annual life verification passes its deadline without confirmation.',
        potentialRelationship:
          'Lapsed verification may be blocking current payment scheduling, even though the underlying pension application remains Approved.',
        confidenceClassification: 'Possible cause',
        informationStillMissing:
          'Exact date the treasury system awaits re-verification clearance to resume disbursement.',
        recommendedInvestigation:
          'Complete annual life verification immediately and keep the local receipt for the pension officer.',
      });
    }
  }

  // 2. Payment -> Application protection hypothesis (preventing false rejection fear)
  hypotheses.push({
    id: 'hyp-payment-not-rejection',
    fromProcess: 'Payment',
    toProcess: 'Application',
    observedState: `Application is "${machines.application}" while Payment is "${machines.payment}".`,
    supportingEvidence:
      'Sanction order #SSP-2021-88412 remains active in the synthetic record. No revocation or rejection notice exists.',
    potentialRelationship:
      'A delayed payment does NOT mean your pension application was rejected or cancelled. Application approval and monthly disbursement run on separate systems.',
    confidenceClassification: 'Known cause in the synthetic record',
    informationStillMissing: 'Real-time bank settlement clearing acknowledgment from the destination branch.',
    recommendedInvestigation:
      'Do not submit a duplicate new pension application; investigate the disbursement channel instead.',
  });

  // 3. Renewal -> Verification / Payment hypothesis
  hypotheses.push({
    id: 'hyp-renewal-payment',
    fromProcess: 'Renewal',
    toProcess: 'Payment',
    observedState: `Renewal is "${machines.renewal}"; Verification is "${machines.verification}".`,
    supportingEvidence:
      'Supporting disability/medical certificate approaches renewal expiry in 28 days.',
    potentialRelationship:
      'Approaching document expiry has not stopped past payments yet, but may affect future cycle renewal if left unreviewed.',
    confidenceClassification: 'Possible cause',
    informationStillMissing: 'Whether the certifying medical board requires an in-person review or accepts existing digital records.',
    recommendedInvestigation:
      'Review the expiring supporting document in Documents & Deadlines and enable reminders.',
  });

  return hypotheses;
}
