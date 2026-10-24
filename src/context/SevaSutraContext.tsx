import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AccessibilitySettings,
  AuditEvent,
  BeneficiaryProfile,
  BenefitStateMachines,
  CaregiverPermission,
  ChecklistItem,
  DeadlineItem,
  DiagnosticScenarioId,
  DocumentItem,
  EligibilityApplicantInput,
  FieldVisitRequest,
  HighRiskRequest,
  LanguageCode,
  NotificationItem,
  OfflineDraft,
  PageId,
  PermissionScopeId,
  SensitiveReportState,
  TrustedContact,
  UserRole,
} from '../types/models';
import {
  INITIAL_AUDIT_EVENTS,
  INITIAL_BENEFICIARY_PROFILE,
  INITIAL_CAREGIVER_PERMISSIONS,
  INITIAL_CHECKLIST,
  INITIAL_DEADLINES,
  INITIAL_DOCUMENTS,
  INITIAL_ELIGIBILITY_INPUT,
  INITIAL_FIELD_VISIT_REQUEST,
  INITIAL_HIGH_RISK_REQUEST,
  INITIAL_NOTIFICATIONS,
  INITIAL_OFFLINE_DRAFT,
  INITIAL_SENSITIVE_REPORT,
  INITIAL_STATE_MACHINES,
  INITIAL_TRUSTED_CONTACT,
} from '../data/syntheticData';
import { transitionBenefitProcess } from '../logic/stateMachines';
import {
  attemptCaregiverSelfApproval,
  attemptContinueAfterRevocation,
  checkActionPermission,
  revokeAllCaregiverAccessAndQuarantine,
  simulateUnsafeBankAccountChangeRequest,
} from '../logic/permissionAndRisk';
import { DICTIONARIES, TranslationDictionary } from '../i18n/dictionaries';
import {
  clearLocalStorageState,
  loadOfflineDraftFromIndexedDB,
  loadStateFromLocalStorage,
  saveOfflineDraftToIndexedDB,
  saveStateToLocalStorage,
} from '../utils/offlinePersistence';
import { speakTextAloud, stopSpeakingAloud } from '../utils/accessibility';

interface PersistedDemoState {
  activePage: PageId;
  activeRole: UserRole;
  stateMachines: BenefitStateMachines;
  diagnosticScenarioId: DiagnosticScenarioId;
  documents: DocumentItem[];
  deadlines: DeadlineItem[];
  permissions: CaregiverPermission[];
  trustedContact: TrustedContact;
  highRiskRequest: HighRiskRequest;
  checklist: ChecklistItem[];
  notifications: NotificationItem[];
  auditEvents: AuditEvent[];
  offlineDraft: OfflineDraft;
  isOfflineSimulated: boolean;
  fieldVisitRequest: FieldVisitRequest;
  sensitiveReport: SensitiveReportState;
  eligibilityInput: EligibilityApplicantInput;
  accessibility: AccessibilitySettings;
  guidedDemoActive: boolean;
  guidedDemoStep: number;
}

interface SevaSutraContextValue extends PersistedDemoState {
  beneficiary: BeneficiaryProfile;
  t: TranslationDictionary;
  spokenTranscriptBanner: string | null;
  lastActionFeedback: string | null;
  setActivePage: (page: PageId) => void;
  setActiveRole: (role: UserRole) => void;
  setDiagnosticScenarioId: (id: DiagnosticScenarioId) => void;
  runDiagnosticEvaluation: (id?: DiagnosticScenarioId) => void;
  markDiagnosticStepComplete: (title: string, description: string, source: string) => void;
  prepareDiagnosisEnquiry: (diagnosisTitle: string, eventCode: string) => {
    allowed: boolean;
    message: string;
  };
  evaluateScopedAction: (
    scope: PermissionScopeId | 'MODIFY_BANK_ACCOUNT' | 'APPROVE_HIGH_RISK_REQUEST',
    actionDescription: string
  ) => { allowed: boolean; reason: string };
  attemptStateMachineTransition: (
    process: 'application' | 'verification' | 'renewal' | 'payment',
    nextState: string
  ) => { success: boolean; message: string };
  addChecklistItem: (
    title: string,
    description: string,
    category: ChecklistItem['category'],
    source: string
  ) => void;
  toggleChecklistItem: (id: string) => void;
  toggleDocumentReminder: (docId: string) => void;
  changeDocumentReminderChannel: (docId: string, channel: DocumentItem['reminderChannel']) => void;
  markDocumentCompleted: (docId: string) => void;
  togglePermissionStatus: (permId: PermissionScopeId) => void;
  expirePermissionDemo: (permId: PermissionScopeId) => void;
  triggerUnsafeBankChangeDemo: () => void;
  triggerCaregiverSelfApprovalAttempt: () => string;
  cancelHighRiskRequestByBeneficiary: () => void;
  revokeAllCaregiverPermissions: () => void;
  triggerPostRevocationAttempt: () => string;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  openNotificationRecord: (id: string) => void;
  simulateConnectivityLoss: () => void;
  restoreConnectivity: () => void;
  saveOfflineDraftExplicitly: (notes?: string) => void;
  updateOfflineDraftStep: (stepId: string, stepLabel: string, notes?: string) => void;
  continueFromOfflineDraft: () => void;
  repeatLastOfflineDraftStep: () => void;
  launchEvaluatorScenario: (scenarioNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7) => void;
  saveFieldVisitRequest: (update: Partial<FieldVisitRequest>, finalize: boolean) => void;
  updateSensitiveReport: (update: Partial<SensitiveReportState>) => void;
  setEligibilityInput: React.Dispatch<React.SetStateAction<EligibilityApplicantInput>>;
  updateAccessibility: (update: Partial<AccessibilitySettings>) => void;
  setLanguage: (lang: LanguageCode) => void;
  speakText: (text: string) => void;
  stopSpeech: () => void;
  startGuidedWalkthrough: () => void;
  setGuidedWalkthroughStep: (step: number) => void;
  closeGuidedWalkthrough: () => void;
  resetEntireDemo: () => void;
  clearFeedback: () => void;
}

const DEFAULT_ACCESSIBILITY: AccessibilitySettings = {
  textSize: 'normal',
  highContrast: false,
  reducedMotion: false,
  oneTaskAtATime: false,
  readAloudEnabled: true,
  lockScreenSafeMode: false,
  language: 'en',
};

const getDefaultState = (): PersistedDemoState => ({
  activePage: 'overview',
  activeRole: 'Beneficiary',
  stateMachines: INITIAL_STATE_MACHINES,
  diagnosticScenarioId: 'primary_lakshmi',
  documents: INITIAL_DOCUMENTS,
  deadlines: INITIAL_DEADLINES,
  permissions: INITIAL_CAREGIVER_PERMISSIONS,
  trustedContact: INITIAL_TRUSTED_CONTACT,
  highRiskRequest: INITIAL_HIGH_RISK_REQUEST,
  checklist: INITIAL_CHECKLIST,
  notifications: INITIAL_NOTIFICATIONS,
  auditEvents: INITIAL_AUDIT_EVENTS,
  offlineDraft: INITIAL_OFFLINE_DRAFT,
  isOfflineSimulated: false,
  fieldVisitRequest: INITIAL_FIELD_VISIT_REQUEST,
  sensitiveReport: INITIAL_SENSITIVE_REPORT,
  eligibilityInput: INITIAL_ELIGIBILITY_INPUT,
  accessibility: DEFAULT_ACCESSIBILITY,
  guidedDemoActive: false,
  guidedDemoStep: 1,
});

const SevaSutraContext = createContext<SevaSutraContextValue | undefined>(undefined);

export const SevaSutraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PersistedDemoState>(() => {
    const saved = loadStateFromLocalStorage<PersistedDemoState>();
    if (saved && saved.stateMachines && saved.documents) {
      return saved;
    }
    return getDefaultState();
  });

  const [spokenTranscriptBanner, setSpokenTranscriptBanner] = useState<string | null>(null);
  const [lastActionFeedback, setLastActionFeedback] = useState<string | null>(null);

  // Sync accessibility classes onto <html>
  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove(
      'seva-large-text',
      'seva-xlarge-text',
      'seva-high-contrast',
      'seva-reduced-motion'
    );
    if (state.accessibility.textSize === 'large') {
      html.classList.add('seva-large-text');
    } else if (state.accessibility.textSize === 'xlarge') {
      html.classList.add('seva-xlarge-text');
    }
    if (state.accessibility.highContrast) {
      html.classList.add('seva-high-contrast');
    }
    if (state.accessibility.reducedMotion) {
      html.classList.add('seva-reduced-motion');
    }
    html.lang = state.accessibility.language;
  }, [state.accessibility]);

  // Recover IndexedDB draft on mount if newer or interrupted
  useEffect(() => {
    let mounted = true;
    void loadOfflineDraftFromIndexedDB(INITIAL_OFFLINE_DRAFT.id).then((idbDraft) => {
      if (mounted && idbDraft && idbDraft.completedStepIds) {
        setState((prev) => ({
          ...prev,
          offlineDraft: idbDraft,
        }));
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Persist to localStorage on state changes
  useEffect(() => {
    saveStateToLocalStorage(state);
  }, [state]);

  const nowStamp = () => new Date().toISOString().replace('T', ' ').slice(0, 16);

  const getActorLabel = (role: UserRole): AuditEvent['actor'] =>
    role === 'Beneficiary'
      ? 'Lakshmi Devi (Beneficiary)'
      : role === 'Caregiver'
        ? 'Arjun (Caregiver)'
        : 'Service Officer (Demo)';

  const speakText = (text: string) => {
    setSpokenTranscriptBanner(text);
    speakTextAloud(text, state.accessibility.language);
  };

  const stopSpeech = () => {
    stopSpeakingAloud();
    setSpokenTranscriptBanner(null);
  };

  const setActivePage = (page: PageId) => {
    setState((prev) => ({ ...prev, activePage: page }));
    window.scrollTo({ top: 0, behavior: state.accessibility.reducedMotion ? 'auto' : 'smooth' });
  };

  const setActiveRole = (role: UserRole) => {
    const ts = nowStamp();
    setState((prev) => ({
      ...prev,
      activeRole: role,
      auditEvents: [
        {
          id: `aud-role-${Date.now()}`,
          timestamp: ts,
          actor: getActorLabel(role),
          action: `Switched demonstration role view to ${role}`,
          outcome: 'Allowed',
          source: 'Demo Role Switcher',
          riskClassification: 'Standard',
        },
        ...prev.auditEvents,
      ],
    }));
    setLastActionFeedback(`Demonstration role switched to ${role}.`);
  };

  const evaluateScopedAction = (
    scope: PermissionScopeId | 'MODIFY_BANK_ACCOUNT' | 'APPROVE_HIGH_RISK_REQUEST',
    actionDescription: string
  ) => {
    const ts = nowStamp();
    const check = checkActionPermission(state.activeRole, state.permissions, scope);
    setState((prev) => ({
      ...prev,
      auditEvents: [
        {
          id: `aud-perm-check-${Date.now()}`,
          timestamp: ts,
          actor: getActorLabel(prev.activeRole),
          action: `${actionDescription} — ${check.reason}`,
          outcome: check.allowed ? 'Allowed' : 'Blocked',
          source: 'Centralized Permission Policy Engine',
          riskClassification: check.riskClassification,
        },
        ...prev.auditEvents,
      ],
    }));
    setLastActionFeedback(check.reason);
    return { allowed: check.allowed, reason: check.reason };
  };

  const setDiagnosticScenarioId = (id: DiagnosticScenarioId) => {
    const ts = nowStamp();
    setState((prev) => ({
      ...prev,
      diagnosticScenarioId: id,
      auditEvents: [
        {
          id: `aud-diag-case-${Date.now()}`,
          timestamp: ts,
          actor: getActorLabel(prev.activeRole),
          action: `Evaluated deterministic payment diagnosis case: "${id.replace(/_/g, ' ')}"`,
          outcome: 'Recorded locally',
          source: 'Payment Diagnosis Engine',
          riskClassification: 'Standard',
        },
        ...prev.auditEvents,
      ],
    }));
    setLastActionFeedback(`Evaluated diagnostic scenario: ${id.replace(/_/g, ' ')}`);
  };

  const runDiagnosticEvaluation = (id?: DiagnosticScenarioId) => {
    const targetId = id || state.diagnosticScenarioId;
    const ts = nowStamp();
    setState((prev) => ({
      ...prev,
      diagnosticScenarioId: targetId,
      auditEvents: [
        {
          id: `aud-diag-rerun-${Date.now()}`,
          timestamp: ts,
          actor: getActorLabel(prev.activeRole),
          action: `Re-ran deterministic rule evaluation for scenario "${targetId.replace(/_/g, ' ')}"`,
          outcome: 'Recorded locally',
          source: 'Payment Diagnosis Engine',
          riskClassification: 'Standard',
        },
        ...prev.auditEvents,
      ],
    }));
    setLastActionFeedback(
      `Re-ran deterministic payment diagnosis for "${targetId.replace(/_/g, ' ')}" at ${ts}.`
    );
  };

  const markDiagnosticStepComplete = (title: string, description: string, source: string) => {
    const ts = nowStamp();
    setState((prev) => {
      const existing = prev.checklist.find(
        (c) => c.title.toLowerCase() === title.toLowerCase()
      );
      let nextChecklist: ChecklistItem[];
      if (existing) {
        nextChecklist = prev.checklist.map((c) =>
          c.id === existing.id ? { ...c, completed: !c.completed } : c
        );
      } else {
        nextChecklist = [
          {
            id: `chk-diag-${Date.now()}`,
            title,
            description,
            category: 'Payment Diagnosis',
            completed: true,
            source,
          },
          ...prev.checklist,
        ];
      }
      const isNowComplete = existing ? !existing.completed : true;
      return {
        ...prev,
        checklist: nextChecklist,
        auditEvents: [
          {
            id: `aud-diag-step-${Date.now()}`,
            timestamp: ts,
            actor: getActorLabel(prev.activeRole),
            action: `${isNowComplete ? 'Marked diagnostic action complete' : 'Reopened diagnostic action'}: "${title}"`,
            outcome: 'Recorded locally',
            source: 'Payment Diagnosis Engine',
            riskClassification: 'Standard',
          },
          ...prev.auditEvents,
        ],
      };
    });
    setLastActionFeedback(`Updated diagnostic action in your checklist & activity history: "${title}"`);
  };

  const prepareDiagnosisEnquiry = (diagnosisTitle: string, eventCode: string) => {
    const ts = nowStamp();
    const check = checkActionPermission(state.activeRole, state.permissions, 'prepare_enquiry');
    if (!check.allowed) {
      setState((prev) => ({
        ...prev,
        auditEvents: [
          {
            id: `aud-enq-deny-${Date.now()}`,
            timestamp: ts,
            actor: getActorLabel(prev.activeRole),
            action: `Attempted to prepare payment enquiry while permission was not granted (${check.reason})`,
            outcome: 'Blocked',
            source: 'Payment Diagnosis Engine',
            riskClassification: 'Elevated',
          },
          ...prev.auditEvents,
        ],
      }));
      setLastActionFeedback(check.reason);
      return { allowed: false, message: check.reason };
    }

    setState((prev) => ({
      ...prev,
      auditEvents: [
        {
          id: `aud-enq-ok-${Date.now()}`,
          timestamp: ts,
          actor: getActorLabel(prev.activeRole),
          action: `Prepared citizen service-desk payment enquiry draft for "${diagnosisTitle}" (Event: ${eventCode})`,
          outcome: 'Recorded locally',
          source: 'Payment Diagnosis Engine',
          riskClassification: 'Standard',
        },
        ...prev.auditEvents,
      ],
    }));
    const msg = `Prepared local service-desk enquiry summary for "${diagnosisTitle}" (Not officially submitted).`;
    setLastActionFeedback(msg);
    return { allowed: true, message: msg };
  };

  const attemptStateMachineTransition = (
    process: 'application' | 'verification' | 'renewal' | 'payment',
    nextState: string
  ) => {
    const res = transitionBenefitProcess(
      state.stateMachines,
      process,
      nextState,
      nowStamp().slice(0, 10)
    );
    const ts = nowStamp();
    if (!res.success) {
      setState((prev) => ({
        ...prev,
        auditEvents: [
          {
            id: `aud-sm-reject-${Date.now()}`,
            timestamp: ts,
            actor: 'SEVA SUTRA Safeguard Engine',
            action: `Rejected invalid ${process} transition from "${prev.stateMachines[process]}" to "${nextState}"`,
            outcome: 'Blocked',
            source: 'Benefit State Machine',
            riskClassification: 'Elevated',
          },
          ...prev.auditEvents,
        ],
      }));
      const msg = res.error || 'Invalid state transition rejected.';
      setLastActionFeedback(msg);
      return { success: false, message: msg };
    }

    setState((prev) => ({
      ...prev,
      stateMachines: res.updatedMachines,
      auditEvents: [
        {
          id: `aud-sm-ok-${Date.now()}`,
          timestamp: ts,
          actor: getActorLabel(prev.activeRole),
          action: `Transitioned ${process} state machine to "${nextState}" (other 3 benefit states unchanged)`,
          outcome: 'Allowed',
          source: 'Benefit State Machine',
          riskClassification: 'Standard',
        },
        ...prev.auditEvents,
      ],
    }));
    const msg = `${process.toUpperCase()} state updated to "${nextState}". Other three processes remain strictly unchanged.`;
    setLastActionFeedback(msg);
    return { success: true, message: msg };
  };

  const addChecklistItem = (
    title: string,
    description: string,
    category: ChecklistItem['category'],
    source: string
  ) => {
    const ts = nowStamp();
    const existsAlready = state.checklist.some(
      (item) => item.title.toLowerCase() === title.toLowerCase()
    );
    if (existsAlready) {
      setLastActionFeedback(`Checklist item already present: "${title}"`);
      return;
    }
    setState((prev) => {
      const newItem: ChecklistItem = {
        id: `chk-${Date.now()}`,
        title,
        description,
        category,
        completed: false,
        source,
      };
      return {
        ...prev,
        checklist: [newItem, ...prev.checklist],
        auditEvents: [
          {
            id: `aud-chk-add-${Date.now()}`,
            timestamp: ts,
            actor: getActorLabel(prev.activeRole),
            action: `Added recommended action to checklist: "${title}"`,
            outcome: 'Recorded locally',
            source,
            riskClassification: 'Standard',
          },
          ...prev.auditEvents,
        ],
      };
    });
    setLastActionFeedback(`Added to your checklist: "${title}"`);
  };

  const toggleChecklistItem = (id: string) => {
    const ts = nowStamp();
    setState((prev) => {
      const target = prev.checklist.find((c) => c.id === id);
      const updated = prev.checklist.map((c) =>
        c.id === id ? { ...c, completed: !c.completed } : c
      );
      return {
        ...prev,
        checklist: updated,
        auditEvents: target
          ? [
              {
                id: `aud-chk-toggle-${Date.now()}`,
                timestamp: ts,
                actor: getActorLabel(prev.activeRole),
                action: `${!target.completed ? 'Completed' : 'Reopened'} checklist item: "${target.title}"`,
                outcome: 'Recorded locally',
                source: 'Task Checklist',
                riskClassification: 'Standard',
              },
              ...prev.auditEvents,
            ]
          : prev.auditEvents,
      };
    });
  };

  const toggleDocumentReminder = (docId: string) => {
    const ts = nowStamp();
    const permCheck = checkActionPermission(state.activeRole, state.permissions, 'view_reminders');
    if (!permCheck.allowed) {
      setState((prev) => ({
        ...prev,
        auditEvents: [
          {
            id: `aud-rem-deny-${Date.now()}`,
            timestamp: ts,
            actor: getActorLabel(prev.activeRole),
            action: `Blocked attempt to modify document reminder (${permCheck.reason})`,
            outcome: 'Blocked',
            source: 'Documents & Deadlines',
            riskClassification: 'Elevated',
          },
          ...prev.auditEvents,
        ],
      }));
      setLastActionFeedback(permCheck.reason);
      return;
    }

    setState((prev) => {
      const target = prev.documents.find((d) => d.id === docId);
      const nextEnabled = target ? !target.reminderEnabled : true;
      return {
        ...prev,
        documents: prev.documents.map((d) =>
          d.id === docId ? { ...d, reminderEnabled: nextEnabled } : d
        ),
        auditEvents: target
          ? [
              {
                id: `aud-rem-toggle-${Date.now()}`,
                timestamp: ts,
                actor: getActorLabel(prev.activeRole),
                action: `${nextEnabled ? 'Enabled' : 'Disabled'} reminder for document "${target.name}"`,
                outcome: 'Recorded locally',
                source: 'Documents & Deadlines',
                riskClassification: 'Standard',
              },
              ...prev.auditEvents,
            ]
          : prev.auditEvents,
      };
    });
    setLastActionFeedback('Document reminder preference updated locally.');
  };

  const changeDocumentReminderChannel = (
    docId: string,
    channel: DocumentItem['reminderChannel']
  ) => {
    const ts = nowStamp();
    const permCheck = checkActionPermission(state.activeRole, state.permissions, 'view_reminders');
    if (!permCheck.allowed) {
      setState((prev) => ({
        ...prev,
        auditEvents: [
          {
            id: `aud-rem-ch-deny-${Date.now()}`,
            timestamp: ts,
            actor: getActorLabel(prev.activeRole),
            action: `Blocked attempt to change reminder channel (${permCheck.reason})`,
            outcome: 'Blocked',
            source: 'Documents & Deadlines',
            riskClassification: 'Elevated',
          },
          ...prev.auditEvents,
        ],
      }));
      setLastActionFeedback(permCheck.reason);
      return;
    }

    setState((prev) => {
      const target = prev.documents.find((d) => d.id === docId);
      return {
        ...prev,
        documents: prev.documents.map((d) =>
          d.id === docId ? { ...d, reminderChannel: channel, reminderEnabled: true } : d
        ),
        auditEvents: target
          ? [
              {
                id: `aud-rem-ch-${Date.now()}`,
                timestamp: ts,
                actor: getActorLabel(prev.activeRole),
                action: `Changed reminder channel for "${target.name}" to ${channel}`,
                outcome: 'Recorded locally',
                source: 'Documents & Deadlines',
                riskClassification: 'Standard',
              },
              ...prev.auditEvents,
            ]
          : prev.auditEvents,
      };
    });
    setLastActionFeedback(`Reminder channel updated to ${channel}.`);
  };

  const markDocumentCompleted = (docId: string) => {
    const ts = nowStamp();
    const permCheck = checkActionPermission(
      state.activeRole,
      state.permissions,
      'help_with_documents'
    );
    if (!permCheck.allowed) {
      setState((prev) => ({
        ...prev,
        auditEvents: [
          {
            id: `aud-doc-deny-${Date.now()}`,
            timestamp: ts,
            actor: getActorLabel(prev.activeRole),
            action: `Blocked attempt to mark document task completed (${permCheck.reason})`,
            outcome: 'Blocked',
            source: 'Documents & Deadlines',
            riskClassification: 'Elevated',
          },
          ...prev.auditEvents,
        ],
      }));
      setLastActionFeedback(permCheck.reason);
      return;
    }

    setState((prev) => {
      const target = prev.documents.find((d) => d.id === docId);
      const nextCompleted = target ? !target.completed : true;
      return {
        ...prev,
        documents: prev.documents.map((d) =>
          d.id === docId
            ? {
                ...d,
                completed: nextCompleted,
                verificationStatus: nextCompleted
                  ? 'Completed in Demo'
                  : d.id === 'doc-life-cert'
                    ? 'Due in 12 days'
                    : d.id === 'doc-disability-cert'
                      ? 'Approaching expiry'
                      : 'Action required',
              }
            : d
        ),
        auditEvents: target
          ? [
              {
                id: `aud-doc-${Date.now()}`,
                timestamp: ts,
                actor: getActorLabel(prev.activeRole),
                action: `Marked document preparation "${target.name}" as ${
                  nextCompleted
                    ? 'Completed in local checklist (not officially submitted)'
                    : 'Pending'
                }`,
                outcome: 'Recorded locally',
                source: 'Documents & Deadlines',
                riskClassification: 'Standard',
              },
              ...prev.auditEvents,
            ]
          : prev.auditEvents,
      };
    });
    setLastActionFeedback('Document task state updated in local demonstration record.');
  };

  const togglePermissionStatus = (permId: PermissionScopeId) => {
    const ts = nowStamp();
    setState((prev) => {
      const target = prev.permissions.find((p) => p.id === permId);
      if (!target) return prev;
      const nextStatus: CaregiverPermission['status'] =
        target.status === 'Granted' ? 'Revoked' : 'Granted';
      const updatedPerms = prev.permissions.map((p) =>
        p.id === permId ? { ...p, status: nextStatus, lastModified: ts } : p
      );

      // If all permissions are now revoked and a high-risk request was pending, quarantine it
      const anyStillGranted = updatedPerms.some((p) => p.status === 'Granted');
      const shouldQuarantine =
        !anyStillGranted && prev.highRiskRequest.status === 'CoolingOff_PendingBeneficiary';

      return {
        ...prev,
        permissions: updatedPerms,
        highRiskRequest: shouldQuarantine
          ? { ...prev.highRiskRequest, status: 'Quarantined_AccessRevoked' }
          : prev.highRiskRequest,
        auditEvents: [
          {
            id: `aud-perm-${Date.now()}`,
            timestamp: ts,
            actor: 'Lakshmi Devi (Beneficiary)',
            action: `${nextStatus} caregiver scope "${target.title}" for Arjun`,
            outcome: 'Allowed',
            source: 'Caregiver Access Control',
            riskClassification: 'Elevated',
          },
          ...prev.auditEvents,
        ],
        notifications: [
          {
            id: `notif-perm-${Date.now()}`,
            timestamp: ts,
            title: `Caregiver Permission ${nextStatus}: ${target.title}`,
            message: `Scope "${target.title}" for Arjun is now ${nextStatus}.`,
            lockScreenPreviewSafe: 'SEVA SUTRA: Helper permission setting updated.',
            category: 'Security',
            severity: nextStatus === 'Granted' ? 'info' : 'warning',
            read: false,
          },
          ...prev.notifications,
        ],
      };
    });
    setLastActionFeedback('Caregiver permission updated.');
  };

  const expirePermissionDemo = (permId: PermissionScopeId) => {
    const ts = nowStamp();
    setState((prev) => {
      const target = prev.permissions.find((p) => p.id === permId);
      if (!target) return prev;
      return {
        ...prev,
        permissions: prev.permissions.map((p) =>
          p.id === permId ? { ...p, status: 'Expired', lastModified: ts } : p
        ),
        auditEvents: [
          {
            id: `aud-perm-exp-${Date.now()}`,
            timestamp: ts,
            actor: 'SEVA SUTRA Safeguard Engine',
            action: `Time-limited caregiver scope "${target.title}" reached expiration`,
            outcome: 'Allowed',
            source: 'Permission Expiry Monitor',
            riskClassification: 'Standard',
          },
          ...prev.auditEvents,
        ],
        notifications: [
          {
            id: `notif-perm-exp-${Date.now()}`,
            timestamp: ts,
            title: `Caregiver Permission Expired: ${target.title}`,
            message: `Time-limited permission "${target.title}" for Arjun has expired and now requires renewal by Lakshmi Devi.`,
            lockScreenPreviewSafe: 'SEVA SUTRA: A helper permission has expired.',
            category: 'Security',
            severity: 'warning',
            read: false,
          },
          ...prev.notifications,
        ],
      };
    });
    setLastActionFeedback('Simulated time-based expiry for caregiver permission.');
  };

  const triggerUnsafeBankChangeDemo = () => {
    const ts = nowStamp();
    const sim = simulateUnsafeBankAccountChangeRequest(state.permissions, ts);
    setState((prev) => ({
      ...prev,
      highRiskRequest: sim.highRiskRequest,
      trustedContact: {
        ...prev.trustedContact,
        notifiedOnHighRisk: true,
        lastNotifiedAt: ts,
      },
      auditEvents: [...sim.auditEventsToAdd, ...prev.auditEvents],
      notifications: [...sim.notificationsToAdd, ...prev.notifications],
    }));
    setLastActionFeedback(
      'High-Risk Safeguard Triggered: Immediate bank change blocked. 72-hour cooling-off period started.'
    );
  };

  const triggerCaregiverSelfApprovalAttempt = () => {
    const ts = nowStamp();
    const res = attemptCaregiverSelfApproval(state.highRiskRequest, ts);
    setState((prev) => ({
      ...prev,
      highRiskRequest: res.updatedRequest,
      auditEvents: [res.auditEvent, ...prev.auditEvents],
    }));
    setLastActionFeedback(res.blockedMessage);
    return res.blockedMessage;
  };

  const cancelHighRiskRequestByBeneficiary = () => {
    const ts = nowStamp();
    setState((prev) => ({
      ...prev,
      highRiskRequest: {
        ...prev.highRiskRequest,
        status: 'Cancelled_ByBeneficiary',
      },
      auditEvents: [
        {
          id: `aud-cancel-hr-${Date.now()}`,
          timestamp: ts,
          actor: 'Lakshmi Devi (Beneficiary)',
          action:
            'Cancelled pending caregiver bank account change request during cooling-off period',
          outcome: 'Allowed',
          source: 'Beneficiary Safeguard Review',
          riskClassification: 'High Risk',
        },
        ...prev.auditEvents,
      ],
      notifications: [
        {
          id: `notif-cancel-hr-${Date.now()}`,
          timestamp: ts,
          title: 'Bank Change Request Cancelled by You',
          message:
            'You cancelled the pending bank account change request. Your pension account XXXX-4821 remains unchanged.',
          lockScreenPreviewSafe: 'SEVA SUTRA: Your security review action was completed.',
          category: 'Security',
          severity: 'success',
          read: false,
        },
        ...prev.notifications,
      ],
    }));
    setLastActionFeedback(
      'Bank account change request cancelled. Your existing account remains protected.'
    );
  };

  const revokeAllCaregiverPermissions = () => {
    const ts = nowStamp();
    const res = revokeAllCaregiverAccessAndQuarantine(
      state.permissions,
      state.highRiskRequest,
      ts
    );
    setState((prev) => ({
      ...prev,
      permissions: res.updatedPermissions,
      highRiskRequest: res.updatedHighRisk,
      auditEvents: [...res.auditEvents, ...prev.auditEvents],
      notifications: [res.notification, ...prev.notifications],
    }));
    setLastActionFeedback(
      'All caregiver permissions revoked. Pending bank account change request has been quarantined and cancelled.'
    );
  };

  const triggerPostRevocationAttempt = () => {
    const ts = nowStamp();
    const res = attemptContinueAfterRevocation(state.highRiskRequest, ts);
    setState((prev) => ({
      ...prev,
      highRiskRequest: res.updatedHighRisk,
      auditEvents: [res.auditEvent, ...prev.auditEvents],
    }));
    setLastActionFeedback(res.errorMessage);
    return res.errorMessage;
  };

  const markNotificationRead = (id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  };

  const markAllNotificationsRead = () => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
    setLastActionFeedback('All notifications marked as read.');
  };

  const openNotificationRecord = (id: string) => {
    const target = state.notifications.find((n) => n.id === id);
    const categoryToPage: Record<NotificationItem['category'], PageId> = {
      Verification: 'documents-deadlines',
      Document: 'documents-deadlines',
      Payment: 'payment-diagnosis',
      Security: 'caregiver-access',
      Offline: 'documents-deadlines',
      Visit: 'assisted-completion',
    };
    const nextPage: PageId = target ? categoryToPage[target.category] : 'overview';
    setState((prev) => ({
      ...prev,
      activePage: nextPage,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
    window.scrollTo({ top: 0, behavior: state.accessibility.reducedMotion ? 'auto' : 'smooth' });
    if (target) {
      setLastActionFeedback(`Opened record for notification: "${target.title}"`);
    }
  };

  const saveOfflineDraftExplicitly = (notes?: string) => {
    const ts = nowStamp();
    const updatedDraft: OfflineDraft = {
      ...state.offlineDraft,
      savedAt: ts,
      notes: notes !== undefined ? notes : state.offlineDraft.notes,
    };
    void saveOfflineDraftToIndexedDB(updatedDraft);
    setState((prev) => ({
      ...prev,
      offlineDraft: updatedDraft,
      auditEvents: [
        {
          id: `aud-draft-save-${Date.now()}`,
          timestamp: ts,
          actor: getActorLabel(prev.activeRole),
          action: `Saved verification checklist progress locally (Last step: "${updatedDraft.lastConfirmedStep}") — Saved locally — not submitted`,
          outcome: 'Recorded locally',
          source: 'Offline Recovery Engine',
          riskClassification: 'Standard',
        },
        ...prev.auditEvents,
      ],
    }));
    setLastActionFeedback('Task saved locally — not submitted.');
  };

  const simulateConnectivityLoss = () => {
    const ts = nowStamp();
    const updatedDraft: OfflineDraft = {
      ...state.offlineDraft,
      savedAt: ts,
      lastConfirmedStep: state.offlineDraft.lastConfirmedStep || 'Saving the checklist',
      isOfflineInterrupted: true,
      reconnectedReadBackPending: false,
    };
    void saveOfflineDraftToIndexedDB(updatedDraft);
    setState((prev) => ({
      ...prev,
      isOfflineSimulated: true,
      offlineDraft: updatedDraft,
      auditEvents: [
        {
          id: `aud-offline-${Date.now()}`,
          timestamp: ts,
          actor: 'SEVA SUTRA Safeguard Engine',
          action:
            'Connectivity lost mid-task; preserved verification checklist draft locally (Saved locally — not submitted)',
          outcome: 'Recorded locally',
          source: 'Offline Recovery Engine',
          riskClassification: 'Standard',
        },
        ...prev.auditEvents,
      ],
      notifications: [
        {
          id: `notif-offline-${Date.now()}`,
          timestamp: ts,
          title: 'Offline Draft Preserved: Saved locally — not submitted',
          message:
            'Connection dropped while preparing verification documents. Your progress was saved locally in IndexedDB and LocalStorage.',
          lockScreenPreviewSafe: 'SEVA SUTRA: Task progress saved locally on device.',
          category: 'Offline',
          severity: 'warning',
          read: false,
        },
        ...prev.notifications,
      ],
    }));
    setLastActionFeedback('Simulated connectivity loss: Draft saved locally — not submitted.');
  };

  const restoreConnectivity = () => {
    const ts = nowStamp();
    const tDict = DICTIONARIES[state.accessibility.language];
    const updatedDraft: OfflineDraft = {
      ...state.offlineDraft,
      savedAt: ts,
      isOfflineInterrupted: false,
      reconnectedReadBackPending: true,
    };
    void saveOfflineDraftToIndexedDB(updatedDraft);
    setState((prev) => ({
      ...prev,
      isOfflineSimulated: false,
      offlineDraft: updatedDraft,
      auditEvents: [
        {
          id: `aud-reconnect-${Date.now()}`,
          timestamp: ts,
          actor: 'SEVA SUTRA Safeguard Engine',
          action:
            'Connection restored; local verification draft recovered with spoken state read-back prompt',
          outcome: 'Recorded locally',
          source: 'Offline Recovery Engine',
          riskClassification: 'Standard',
        },
        ...prev.auditEvents,
      ],
      notifications: [
        {
          id: `notif-reconnect-${Date.now()}`,
          timestamp: ts,
          title: 'Connection Restored — Local Draft Ready',
          message: tDict.reconnectedBanner,
          lockScreenPreviewSafe:
            'SEVA SUTRA: Connection restored. You may resume your saved task.',
          category: 'Offline',
          severity: 'success',
          read: false,
        },
        ...prev.notifications,
      ],
    }));
    speakText(tDict.readBackScript);
    setLastActionFeedback(tDict.reconnectedBanner);
  };

  const updateOfflineDraftStep = (stepId: string, stepLabel: string, notes?: string) => {
    const ts = nowStamp();
    const permCheck = checkActionPermission(
      state.activeRole,
      state.permissions,
      'help_with_documents'
    );
    if (!permCheck.allowed) {
      setState((prev) => ({
        ...prev,
        auditEvents: [
          {
            id: `aud-draft-deny-${Date.now()}`,
            timestamp: ts,
            actor: getActorLabel(prev.activeRole),
            action: `Blocked caregiver attempt to edit verification checklist (${permCheck.reason})`,
            outcome: 'Blocked',
            source: 'Offline Recovery Engine',
            riskClassification: 'Elevated',
          },
          ...prev.auditEvents,
        ],
      }));
      setLastActionFeedback(permCheck.reason);
      return;
    }

    setState((prev) => {
      const exists = prev.offlineDraft.completedStepIds.includes(stepId);
      const nextSteps = exists
        ? prev.offlineDraft.completedStepIds.filter((s) => s !== stepId)
        : [...prev.offlineDraft.completedStepIds, stepId];
      const nextDraft: OfflineDraft = {
        ...prev.offlineDraft,
        savedAt: ts,
        lastConfirmedStep: stepLabel,
        completedStepIds: nextSteps,
        notes: notes !== undefined ? notes : prev.offlineDraft.notes,
        reconnectedReadBackPending: false,
      };
      void saveOfflineDraftToIndexedDB(nextDraft);

      // Sync with main checklist if all 4 steps are completed
      const allFourDone = nextSteps.length >= 4;
      const updatedChecklist = prev.checklist.map((item) =>
        item.id === 'chk-1' && allFourDone ? { ...item, completed: true } : item
      );

      return {
        ...prev,
        offlineDraft: nextDraft,
        checklist: updatedChecklist,
        auditEvents: [
          {
            id: `aud-draft-step-${Date.now()}`,
            timestamp: ts,
            actor: getActorLabel(prev.activeRole),
            action: `Updated verification draft step "${stepLabel}" (Saved locally — not submitted)`,
            outcome: 'Recorded locally',
            source: 'Offline Recovery Engine',
            riskClassification: 'Standard',
          },
          ...prev.auditEvents,
        ],
      };
    });
    setLastActionFeedback(`Saved locally — not submitted: "${stepLabel}"`);
  };

  const continueFromOfflineDraft = () => {
    const ts = nowStamp();
    setState((prev) => {
      const allStepOrder: Array<{ id: string; label: string }> = [
        {
          id: 'verif-step-1',
          label: 'Confirm Pension Sanction ID #SSP-2021-88412 is written down',
        },
        {
          id: 'verif-step-2',
          label: 'Place original identity card and blue pension passbook in folder',
        },
        {
          id: 'verif-step-3',
          label: 'Select preferred verification method (Doorstep visit or Citizen Centre)',
        },
        {
          id: 'verif-step-4',
          label:
            'Review post-merger bank branch IFSC slip (Account stays in Lakshmi Devi’s name)',
        },
      ];
      const nextUnfinished =
        allStepOrder.find((s) => !prev.offlineDraft.completedStepIds.includes(s.id)) ||
        allStepOrder[allStepOrder.length - 1];
      const updatedIds = prev.offlineDraft.completedStepIds.includes(nextUnfinished.id)
        ? prev.offlineDraft.completedStepIds
        : [...prev.offlineDraft.completedStepIds, nextUnfinished.id];

      const nextDraft: OfflineDraft = {
        ...prev.offlineDraft,
        savedAt: ts,
        lastConfirmedStep: nextUnfinished.label,
        completedStepIds: updatedIds,
        reconnectedReadBackPending: false,
      };
      void saveOfflineDraftToIndexedDB(nextDraft);

      const allDone = updatedIds.length >= 4;
      const updatedChecklist = prev.checklist.map((item) =>
        item.id === 'chk-1' && allDone ? { ...item, completed: true } : item
      );

      return {
        ...prev,
        activePage: 'documents-deadlines',
        offlineDraft: nextDraft,
        checklist: updatedChecklist,
        auditEvents: [
          {
            id: `aud-draft-continue-${Date.now()}`,
            timestamp: ts,
            actor: getActorLabel(prev.activeRole),
            action: `Resumed verification task after reconnection; continued to "${nextUnfinished.label}" (Not officially submitted)`,
            outcome: 'Recorded locally',
            source: 'Offline Recovery Engine',
            riskClassification: 'Standard',
          },
          ...prev.auditEvents,
        ],
      };
    });
    setLastActionFeedback(
      'Continued from saved local draft. Reminder: Your verification has not been officially submitted.'
    );
  };

  const repeatLastOfflineDraftStep = () => {
    const ts = nowStamp();
    const msg = `Repeating last confirmed step: "${state.offlineDraft.lastConfirmedStep}". Your verification has not been officially submitted.`;
    speakText(msg);
    setState((prev) => ({
      ...prev,
      activePage: 'documents-deadlines',
      offlineDraft: {
        ...prev.offlineDraft,
        savedAt: ts,
        reconnectedReadBackPending: false,
      },
      auditEvents: [
        {
          id: `aud-draft-repeat-${Date.now()}`,
          timestamp: ts,
          actor: getActorLabel(prev.activeRole),
          action: `Repeated last confirmed step "${prev.offlineDraft.lastConfirmedStep}" after reconnection`,
          outcome: 'Recorded locally',
          source: 'Offline Recovery Engine',
          riskClassification: 'Standard',
        },
        ...prev.auditEvents,
      ],
    }));
    setLastActionFeedback(msg);
  };

  const saveFieldVisitRequest = (update: Partial<FieldVisitRequest>, finalize: boolean) => {
    const ts = nowStamp();
    setState((prev) => {
      const nextStatus: FieldVisitRequest['status'] = finalize
        ? 'Demo request recorded locally — not officially booked'
        : 'Draft saved locally';
      const updatedVisit: FieldVisitRequest = {
        ...prev.fieldVisitRequest,
        ...update,
        status: nextStatus,
        updatedAt: ts,
      };
      return {
        ...prev,
        fieldVisitRequest: updatedVisit,
        auditEvents: [
          {
            id: `aud-visit-${Date.now()}`,
            timestamp: ts,
            actor: getActorLabel(prev.activeRole),
            action: `${
              finalize
                ? 'Recorded doorstep assistance request locally (Demo request recorded locally — not officially booked)'
                : 'Saved unfinished doorstep assistance form locally'
            }`,
            outcome: 'Recorded locally',
            source: 'Assisted Completion & Home Visits',
            riskClassification: 'Standard',
          },
          ...prev.auditEvents,
        ],
        notifications: finalize
          ? [
              {
                id: `notif-visit-${Date.now()}`,
                timestamp: ts,
                title: 'Doorstep Assistance Demo Request Recorded Locally',
                message: `Preferred window: ${updatedVisit.preferredDate} (${updatedVisit.preferredTimeWindow}). Demo request recorded locally — not officially booked.`,
                lockScreenPreviewSafe: 'SEVA SUTRA: Local assistance request draft saved.',
                category: 'Visit',
                severity: 'info',
                read: false,
              },
              ...prev.notifications,
            ]
          : prev.notifications,
      };
    });
    setLastActionFeedback(
      finalize
        ? 'Demo request recorded locally — not officially booked.'
        : 'Unfinished form draft saved locally.'
    );
  };

  const updateSensitiveReport = (update: Partial<SensitiveReportState>) => {
    const ts = nowStamp();
    setState((prev) => {
      const next = { ...prev.sensitiveReport, ...update };
      const justRecorded = update.recordedLocally && !prev.sensitiveReport.recordedLocally;
      return {
        ...prev,
        sensitiveReport: next,
        auditEvents: justRecorded
          ? [
              {
                id: `aud-sensitive-${Date.now()}`,
                timestamp: ts,
                actor: getActorLabel(prev.activeRole),
                action: `Recorded sensitive ${next.reportType} referral for official welfare review — payment ownership and benefit controls preserved`,
                outcome: 'Recorded locally',
                source: 'Sensitive Reporting Pathway',
                riskClassification: 'Elevated',
              },
              ...prev.auditEvents,
            ]
          : prev.auditEvents,
      };
    });
  };

  const setEligibilityInput: React.Dispatch<
    React.SetStateAction<EligibilityApplicantInput>
  > = (updater) => {
    setState((prev) => ({
      ...prev,
      eligibilityInput:
        typeof updater === 'function' ? updater(prev.eligibilityInput) : updater,
    }));
  };

  const updateAccessibility = (update: Partial<AccessibilitySettings>) => {
    setState((prev) => ({
      ...prev,
      accessibility: { ...prev.accessibility, ...update },
    }));
  };

  const setLanguage = (lang: LanguageCode) => {
    setState((prev) => ({
      ...prev,
      accessibility: { ...prev.accessibility, language: lang },
    }));
    setLastActionFeedback(
      lang === 'te'
        ? 'భాష తెలుగులోకి మార్చబడింది (Language switched to Telugu).'
        : 'Language switched to English.'
    );
  };

  const startGuidedWalkthrough = () => {
    setState((prev) => ({
      ...prev,
      guidedDemoActive: true,
      guidedDemoStep: 1,
      activePage: 'overview',
    }));
  };

  const setGuidedWalkthroughStep = (step: number) => {
    const stepPageMap: Record<number, PageId> = {
      1: 'overview',
      2: 'overview',
      3: 'payment-diagnosis',
      4: 'payment-diagnosis',
      5: 'caregiver-access',
      6: 'caregiver-access',
      7: 'caregiver-access',
      8: 'caregiver-access',
      9: 'caregiver-access',
      10: 'accessibility-settings',
      11: 'documents-deadlines',
      12: 'technical-evaluation',
    };
    setState((prev) => ({
      ...prev,
      guidedDemoActive: true,
      guidedDemoStep: step,
      activePage: stepPageMap[step] || prev.activePage,
    }));
  };

  const launchEvaluatorScenario = (scenarioNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7) => {
    if (scenarioNumber === 1) {
      setState((prev) => ({
        ...prev,
        guidedDemoActive: true,
        guidedDemoStep: 1,
        activePage: 'overview',
      }));
      setLastActionFeedback(
        'Evaluator Scenario 1: Reviewing Lakshmi Devi’s four independent benefit states (Verification due in 12 days, Payment 3 months delayed).'
      );
    } else if (scenarioNumber === 2) {
      setState((prev) => ({
        ...prev,
        guidedDemoActive: true,
        guidedDemoStep: 3,
        activePage: 'payment-diagnosis',
        diagnosticScenarioId: 'primary_lakshmi',
      }));
      setLastActionFeedback(
        'Evaluator Scenario 2: Running deterministic Payment Diagnosis on post-merger IFSC return.'
      );
    } else if (scenarioNumber === 3) {
      const ts = nowStamp();
      const activePerms = state.permissions.map((p) => ({
        ...p,
        status: 'Granted' as const,
      }));
      const sim = simulateUnsafeBankAccountChangeRequest(activePerms, ts);
      setState((prev) => ({
        ...prev,
        guidedDemoActive: true,
        guidedDemoStep: 6,
        activePage: 'caregiver-access',
        permissions: activePerms,
        highRiskRequest: sim.highRiskRequest,
        trustedContact: {
          ...prev.trustedContact,
          notifiedOnHighRisk: true,
          lastNotifiedAt: ts,
        },
        auditEvents: [...sim.auditEventsToAdd, ...prev.auditEvents],
        notifications: [...sim.notificationsToAdd, ...prev.notifications],
      }));
      setLastActionFeedback(
        'Evaluator Scenario 3: Triggered caregiver bank-change attempt -> Blocked & entered 72-hour cooling-off.'
      );
    } else if (scenarioNumber === 4) {
      const ts = nowStamp();
      const baseHighRisk =
        state.highRiskRequest.status === 'None'
          ? simulateUnsafeBankAccountChangeRequest(
              state.permissions.map((p) => ({ ...p, status: 'Granted' as const })),
              ts
            ).highRiskRequest
          : state.highRiskRequest;
      const res = revokeAllCaregiverAccessAndQuarantine(
        state.permissions,
        baseHighRisk,
        ts
      );
      setState((prev) => ({
        ...prev,
        guidedDemoActive: true,
        guidedDemoStep: 8,
        activePage: 'caregiver-access',
        permissions: res.updatedPermissions,
        highRiskRequest: res.updatedHighRisk,
        auditEvents: [...res.auditEvents, ...prev.auditEvents],
        notifications: [res.notification, ...prev.notifications],
      }));
      setLastActionFeedback(
        'Evaluator Scenario 4: Revoked caregiver access while bank-change was pending -> Request Quarantined & Cancelled.'
      );
    } else if (scenarioNumber === 5) {
      setState((prev) => ({
        ...prev,
        guidedDemoActive: true,
        guidedDemoStep: 11,
        activePage: 'documents-deadlines',
      }));
      if (!state.isOfflineSimulated) {
        simulateConnectivityLoss();
      } else {
        restoreConnectivity();
      }
    } else if (scenarioNumber === 6) {
      setState((prev) => ({
        ...prev,
        guidedDemoActive: true,
        guidedDemoStep: 10,
        activePage: 'explore-benefits',
      }));
      setLastActionFeedback(
        'Evaluator Scenario 6: Exploring benefit eligibility using transparent synthetic decision rules.'
      );
    } else if (scenarioNumber === 7) {
      setState((prev) => ({
        ...prev,
        guidedDemoActive: true,
        guidedDemoStep: 12,
        activePage: 'assisted-completion',
      }));
      saveFieldVisitRequest(
        {
          preferredDate: '2026-10-30',
          preferredTimeWindow: 'Morning (09:00 - 12:00)',
          contactMethod: 'Doorstep Officer Knock',
        },
        true
      );
    }
  };

  const closeGuidedWalkthrough = () => {
    setState((prev) => ({ ...prev, guidedDemoActive: false }));
  };

  const resetEntireDemo = () => {
    stopSpeakingAloud();
    clearLocalStorageState();
    const fresh = getDefaultState();
    void saveOfflineDraftToIndexedDB(INITIAL_OFFLINE_DRAFT);
    setState(fresh);
    setSpokenTranscriptBanner(null);
    setLastActionFeedback('Demonstration state reset to initial Lakshmi Devi scenario.');
  };

  const clearFeedback = () => setLastActionFeedback(null);

  return (
    <SevaSutraContext.Provider
      value={{
        ...state,
        beneficiary: INITIAL_BENEFICIARY_PROFILE,
        t: DICTIONARIES[state.accessibility.language],
        spokenTranscriptBanner,
        lastActionFeedback,
        setActivePage,
        setActiveRole,
        setDiagnosticScenarioId,
        runDiagnosticEvaluation,
        markDiagnosticStepComplete,
        prepareDiagnosisEnquiry,
        evaluateScopedAction,
        attemptStateMachineTransition,
        addChecklistItem,
        toggleChecklistItem,
        toggleDocumentReminder,
        changeDocumentReminderChannel,
        markDocumentCompleted,
        togglePermissionStatus,
        expirePermissionDemo,
        triggerUnsafeBankChangeDemo,
        triggerCaregiverSelfApprovalAttempt,
        cancelHighRiskRequestByBeneficiary,
        revokeAllCaregiverPermissions,
        triggerPostRevocationAttempt,
        markNotificationRead,
        markAllNotificationsRead,
        openNotificationRecord,
        simulateConnectivityLoss,
        restoreConnectivity,
        saveOfflineDraftExplicitly,
        updateOfflineDraftStep,
        continueFromOfflineDraft,
        repeatLastOfflineDraftStep,
        launchEvaluatorScenario,
        saveFieldVisitRequest,
        updateSensitiveReport,
        setEligibilityInput,
        updateAccessibility,
        setLanguage,
        speakText,
        stopSpeech,
        startGuidedWalkthrough,
        setGuidedWalkthroughStep,
        closeGuidedWalkthrough,
        resetEntireDemo,
        clearFeedback,
      }}
    >
      {children}
    </SevaSutraContext.Provider>
  );
};

export const useSevaSutra = (): SevaSutraContextValue => {
  const ctx = useContext(SevaSutraContext);
  if (!ctx) {
    throw new Error('useSevaSutra must be used inside SevaSutraProvider');
  }
  return ctx;
};
