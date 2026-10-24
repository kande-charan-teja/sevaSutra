import {
  AuditEvent,
  CaregiverPermission,
  HighRiskRequest,
  NotificationItem,
  PermissionScopeId,
  UserRole,
} from '../types/models';

export interface PermissionCheckResult {
  allowed: boolean;
  reason: string;
  riskClassification: 'Standard' | 'Elevated' | 'High Risk' | 'Critical Safeguard';
}

/**
 * Centralized permission check enforcing scoped delegation and blocking unauthorized financial mutations.
 */
export function checkActionPermission(
  actorRole: UserRole,
  permissions: CaregiverPermission[],
  requiredScope: PermissionScopeId | 'MODIFY_BANK_ACCOUNT' | 'APPROVE_HIGH_RISK_REQUEST'
): PermissionCheckResult {
  if (requiredScope === 'MODIFY_BANK_ACCOUNT') {
    if (actorRole === 'Caregiver') {
      return {
        allowed: false,
        reason:
          'Caregiver delegation never grants authority to redirect pension bank accounts. Direct beneficiary step-up confirmation and a 72-hour cooling-off period are mandatory.',
        riskClassification: 'Critical Safeguard',
      };
    }
    return {
      allowed: false,
      reason:
        'Bank account modifications are high-risk actions that cannot execute immediately. They must enter a 72-hour cooling-off period with direct beneficiary verification.',
      riskClassification: 'High Risk',
    };
  }

  if (requiredScope === 'APPROVE_HIGH_RISK_REQUEST') {
    if (actorRole === 'Caregiver') {
      return {
        allowed: false,
        reason: 'Self-approval blocked: A caregiver cannot approve or expedite their own high-risk bank change request.',
        riskClassification: 'Critical Safeguard',
      };
    }
    return {
      allowed: true,
      reason: 'Beneficiary or authorized officer review permitted after cooling-off verification.',
      riskClassification: 'High Risk',
    };
  }

  if (actorRole === 'Beneficiary' || actorRole === 'Service Officer') {
    return {
      allowed: true,
      reason: `${actorRole} has direct authority for ${requiredScope}.`,
      riskClassification: 'Standard',
    };
  }

  const scopeRecord = permissions.find((p) => p.id === requiredScope);
  if (!scopeRecord) {
    return {
      allowed: false,
      reason: `Permission scope "${requiredScope}" does not exist.`,
      riskClassification: 'Elevated',
    };
  }

  if (scopeRecord.status !== 'Granted') {
    return {
      allowed: false,
      reason: `Access denied: Caregiver permission "${scopeRecord.title}" is currently ${scopeRecord.status}.`,
      riskClassification: 'Elevated',
    };
  }

  return {
    allowed: true,
    reason: `Allowed via active caregiver scope "${scopeRecord.title}" (expires ${scopeRecord.expiresAt}).`,
    riskClassification: 'Standard',
  };
}

export interface UnsafeBankChangeSimulationOutput {
  highRiskRequest: HighRiskRequest;
  auditEventsToAdd: AuditEvent[];
  notificationsToAdd: NotificationItem[];
}

/**
 * Simulates the mandatory unsafe bank-change request by caregiver (Arjun) attempting to redirect
 * Lakshmi Devi's pension to his own bank account.
 */
export function simulateUnsafeBankAccountChangeRequest(
  permissions: CaregiverPermission[],
  timestamp = '2026-10-24 10:15'
): UnsafeBankChangeSimulationOutput {
  const anyActive = permissions.some((p) => p.status === 'Granted');

  if (!anyActive) {
    const deniedEvent: AuditEvent = {
      id: `aud-denied-${Date.now()}`,
      timestamp,
      actor: 'Arjun (Caregiver)',
      action: 'Attempted to initiate bank account redirection after caregiver access was revoked',
      outcome: 'Blocked',
      source: 'Caregiver Access Safeguard Engine',
      riskClassification: 'Critical Safeguard',
    };

    const highRiskRequest: HighRiskRequest = {
      id: 'hr-bank-2026-01',
      type: 'BANK_ACCOUNT_CHANGE',
      requestedBy: 'Arjun (Grandchild / Caregiver)',
      requestedRole: 'Caregiver',
      requestedAt: timestamp,
      proposedBankHolder: 'Arjun Kumar (Caregiver Own Account)',
      proposedAccountMasked: 'XXXX-XXXX-9914 (Different Holder)',
      riskClassification: 'High Risk — Financial Redirection',
      status: 'Quarantined_AccessRevoked',
      coolingOffHoursRemaining: 72,
      beneficiaryConfirmed: false,
      trustedContactNotified: true,
      selfApprovalBlockedCount: 1,
      postRevocationBlockedCount: 1,
      explanationMessage:
        'To keep your savings safe, we’ll confirm this change with you directly. Nothing changes for 72 hours.',
    };

    return {
      highRiskRequest,
      auditEventsToAdd: [deniedEvent],
      notificationsToAdd: [],
    };
  }

  const highRiskRequest: HighRiskRequest = {
    id: 'hr-bank-2026-01',
    type: 'BANK_ACCOUNT_CHANGE',
    requestedBy: 'Arjun (Grandchild / Caregiver)',
    requestedRole: 'Caregiver',
    requestedAt: timestamp,
    proposedBankHolder: 'Arjun Kumar (Caregiver Own Account)',
    proposedAccountMasked: 'XXXX-XXXX-9914 (Third-Party Account)',
    riskClassification: 'High Risk — Financial Redirection',
    status: 'CoolingOff_PendingBeneficiary',
    coolingOffHoursRemaining: 72,
    beneficiaryConfirmed: false,
    trustedContactNotified: true,
    selfApprovalBlockedCount: 0,
    postRevocationBlockedCount: 0,
    explanationMessage:
      'To keep your savings safe, we’ll confirm this change with you directly. Nothing changes for 72 hours.',
  };

  const auditEventsToAdd: AuditEvent[] = [
    {
      id: `aud-hr-1-${Date.now()}`,
      timestamp,
      actor: 'Arjun (Caregiver)',
      action: 'Requested pension bank account change to caregiver account (XXXX-9914)',
      outcome: 'Escalated / Cooling-off',
      source: 'Caregiver Access Portal (Simulated)',
      riskClassification: 'High Risk',
    },
    {
      id: `aud-hr-2-${Date.now() + 1}`,
      timestamp,
      actor: 'SEVA SUTRA Safeguard Engine',
      action: 'Blocked immediate bank change; enforced 72-hour cooling-off and beneficiary step-up confirmation',
      outcome: 'Allowed',
      source: 'Safeguard Policy Engine',
      riskClassification: 'Critical Safeguard',
    },
    {
      id: `aud-hr-3-${Date.now() + 2}`,
      timestamp,
      actor: 'SEVA SUTRA Safeguard Engine',
      action: 'Simulated alert to Beneficiary (Lakshmi Devi) and privacy-safe alert to Trusted Contact (Meena Kumari)',
      outcome: 'Recorded locally',
      source: 'Notification Simulator',
      riskClassification: 'High Risk',
    },
  ];

  const notificationsToAdd: NotificationItem[] = [
    {
      id: `notif-hr-ben-${Date.now()}`,
      timestamp,
      title: 'High-Risk Action Paused: Bank Change Request',
      message:
        'To keep your savings safe, we’ll confirm this change with you directly. Nothing changes for 72 hours. Caregiver Arjun requested changing your pension account.',
      lockScreenPreviewSafe: 'SEVA SUTRA: Important security review needed on your account. Tap to open safely.',
      category: 'Security',
      severity: 'high-risk',
      read: false,
    },
    {
      id: `notif-hr-tc-${Date.now() + 1}`,
      timestamp,
      title: 'Trusted Contact Alert (Simulated — Privacy Safe)',
      message:
        'Simulated notice to Meena Kumari (ASHA Community Worker): A high-risk profile setting change was requested for Lakshmi Devi and is in a 72-hour cooling-off review. (No bank or amount details disclosed.)',
      lockScreenPreviewSafe: 'SEVA SUTRA: Community support check-in notice for a beneficiary you assist.',
      category: 'Security',
      severity: 'warning',
      read: false,
    },
  ];

  return {
    highRiskRequest,
    auditEventsToAdd,
    notificationsToAdd,
  };
}

/**
 * Blocks caregiver self-approval on a pending high-risk request.
 */
export function attemptCaregiverSelfApproval(
  request: HighRiskRequest,
  timestamp = '2026-10-24 10:19'
): {
  updatedRequest: HighRiskRequest;
  auditEvent: AuditEvent;
  blockedMessage: string;
} {
  const updatedRequest: HighRiskRequest = {
    ...request,
    selfApprovalBlockedCount: request.selfApprovalBlockedCount + 1,
  };

  const auditEvent: AuditEvent = {
    id: `aud-self-approve-block-${Date.now()}`,
    timestamp,
    actor: 'Arjun (Caregiver)',
    action: 'Attempted caregiver self-approval / bypass of 72-hour cooling-off period',
    outcome: 'Blocked',
    source: 'Safeguard Policy Engine',
    riskClassification: 'Critical Safeguard',
  };

  return {
    updatedRequest,
    auditEvent,
    blockedMessage:
      'Action Blocked: Caregivers cannot approve their own bank-change requests or bypass the 72-hour cooling-off safeguard.',
  };
}

/**
 * Revokes caregiver permissions and automatically quarantines/cancels any pending unauthorized high-risk request.
 */
export function revokeAllCaregiverAccessAndQuarantine(
  permissions: CaregiverPermission[],
  currentHighRisk: HighRiskRequest,
  timestamp = '2026-10-24 10:25'
): {
  updatedPermissions: CaregiverPermission[];
  updatedHighRisk: HighRiskRequest;
  auditEvents: AuditEvent[];
  notification: NotificationItem;
} {
  const updatedPermissions = permissions.map((perm) => ({
    ...perm,
    status: 'Revoked' as const,
    lastModified: timestamp,
  }));

  const hadPending = currentHighRisk.status === 'CoolingOff_PendingBeneficiary';

  const updatedHighRisk: HighRiskRequest =
    currentHighRisk.status !== 'None'
      ? {
          ...currentHighRisk,
          status: 'Quarantined_AccessRevoked',
        }
      : currentHighRisk;

  const auditEvents: AuditEvent[] = [
    {
      id: `aud-revoke-all-${Date.now()}`,
      timestamp,
      actor: 'Lakshmi Devi (Beneficiary)',
      action: 'Revoked all delegated caregiver permissions for Arjun',
      outcome: 'Allowed',
      source: 'Caregiver Access Control',
      riskClassification: 'High Risk',
    },
  ];

  if (hadPending) {
    auditEvents.push({
      id: `aud-quarantine-${Date.now() + 1}`,
      timestamp,
      actor: 'SEVA SUTRA Safeguard Engine',
      action: 'Quarantined and cancelled pending bank-account change request following caregiver access revocation',
      outcome: 'Quarantined',
      source: 'Safeguard Policy Engine',
      riskClassification: 'Critical Safeguard',
    });
  }

  const notification: NotificationItem = {
    id: `notif-revoke-${Date.now()}`,
    timestamp,
    title: 'Caregiver Access Revoked & Pending Request Quarantined',
    message:
      'All delegated caregiver permissions were revoked. The pending bank account change request has been quarantined and cancelled. Your existing pension account remains untouched.',
    lockScreenPreviewSafe: 'SEVA SUTRA: Your access settings were updated as requested.',
    category: 'Security',
    severity: 'success',
    read: false,
  };

  return {
    updatedPermissions,
    updatedHighRisk,
    auditEvents,
    notification,
  };
}

/**
 * Tests attempting to continue a protected action after caregiver access was revoked.
 */
export function attemptContinueAfterRevocation(
  currentHighRisk: HighRiskRequest,
  timestamp = '2026-10-24 10:28'
): {
  allowed: false;
  updatedHighRisk: HighRiskRequest;
  auditEvent: AuditEvent;
  errorMessage: string;
} {
  const updatedHighRisk: HighRiskRequest = {
    ...currentHighRisk,
    postRevocationBlockedCount: currentHighRisk.postRevocationBlockedCount + 1,
  };

  const auditEvent: AuditEvent = {
    id: `aud-post-revoke-deny-${Date.now()}`,
    timestamp,
    actor: 'Arjun (Caregiver)',
    action: 'Attempted to resume or submit quarantined bank-account request after access revocation',
    outcome: 'Blocked',
    source: 'Safeguard Policy Engine',
    riskClassification: 'Critical Safeguard',
  };

  return {
    allowed: false,
    updatedHighRisk,
    auditEvent,
    errorMessage:
      'Access Denied: Caregiver permissions have been revoked and this request is quarantined. No further actions can be taken by the caregiver.',
  };
}
