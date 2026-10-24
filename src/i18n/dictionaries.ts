import { LanguageCode, PageId } from '../types/models';

export interface TranslationDictionary {
  brandTitle: string;
  brandTagline: string;
  demoModeBadge: string;
  roleLabel: string;
  roleDisclaimer: string;
  startGuidedDemo: string;
  resetDemo: string;
  readAloudButton: string;
  stopReadingButton: string;
  simulateOfflineButton: string;
  restoreOnlineButton: string;
  dashboardIntro: string;
  whatShouldIDoNext: string;
  fourLaneTimelineTitle: string;
  mayAffectHypothesis: string;
  understandPaymentDelay: string;
  nav: Record<PageId, string>;
  cards: {
    application: string;
    verification: string;
    documents: string;
    payment: string;
  };
  safeguardBanner: string;
  offlineSavedLocally: string;
  reconnectedBanner: string;
  readBackScript: string;
  visitDemoDisclaimer: string;
}

export const DICTIONARIES: Record<LanguageCode, TranslationDictionary> = {
  en: {
    brandTitle: 'SEVA SUTRA',
    brandTagline: 'Every benefit explained. Every beneficiary protected.',
    demoModeBadge: 'DEMO MODE — SYNTHETIC RECORDS',
    roleLabel: 'Demonstration Role View',
    roleDisclaimer: 'Role switcher is a demonstration view, not real authentication.',
    startGuidedDemo: 'Start Guided Demo',
    resetDemo: 'Reset Demo',
    readAloudButton: 'Read Page Aloud',
    stopReadingButton: 'Stop Reading',
    simulateOfflineButton: 'Simulate Connectivity Loss',
    restoreOnlineButton: 'Restore Connection',
    dashboardIntro:
      'Here is what needs your attention. Review the next step, save your progress, and ask for help when needed.',
    whatShouldIDoNext: 'What should I do next?',
    fourLaneTimelineTitle: 'Four-Lane Independent Benefit Process Timeline',
    mayAffectHypothesis: 'MAY AFFECT — HYPOTHESIS',
    understandPaymentDelay: 'Understand payment delay',
    nav: {
      overview: '1. Overview',
      'my-benefits': '2. My Benefits',
      'payment-diagnosis': '3. Payment Diagnosis',
      'documents-deadlines': '4. Documents and Deadlines',
      'caregiver-access': '5. Caregiver Access',
      'notifications-activity': '6. Notifications and Activity',
      'explore-benefits': '7. Explore Benefits',
      'assisted-completion': '8. Assisted Completion and Home Visits',
      'accessibility-settings': '9. Accessibility and Settings',
      'technical-evaluation': '10. Technical Overview and Evaluation',
    },
    cards: {
      application: 'APPLICATION',
      verification: 'VERIFICATION',
      documents: 'DOCUMENTS',
      payment: 'PAYMENT',
    },
    safeguardBanner:
      'To keep your savings safe, we’ll confirm this change with you directly. Nothing changes for 72 hours.',
    offlineSavedLocally: 'Saved locally — not submitted',
    reconnectedBanner:
      'Connection restored. Your local draft is available. Your verification has not been submitted.',
    readBackScript:
      'You were preparing your documents. Your last confirmed step was saving the checklist. Would you like to continue or repeat that step?',
    visitDemoDisclaimer: 'Demo request recorded locally — not officially booked.',
  },
  te: {
    brandTitle: 'సేవా సూత్ర (SEVA SUTRA)',
    brandTagline: 'ప్రతి పెన్షన్ వివరణాత్మకంగా. ప్రతి లబ్ధిదారునికి రక్షణ.',
    demoModeBadge: 'డెమో మోడ్ — నమూనా రికార్డులు (DEMO MODE)',
    roleLabel: 'డెమో పాత్ర ఎంపిక',
    roleDisclaimer: 'ఈ పాత్ర మార్పు కేవలం డెమో కోసం మాత్రమే, నిజమైన లాగిన్ కాదు.',
    startGuidedDemo: 'గైడెడ్ డెమో ప్రారంభించండి',
    resetDemo: 'డెమో రీసెట్ చేయండి',
    readAloudButton: 'పైకి చదివి వినిపించు',
    stopReadingButton: 'చదవడం ఆపు',
    simulateOfflineButton: 'ఆఫ్‌లైన్ పరీక్ష (నెట్‌వర్క్ నిలిపివేత)',
    restoreOnlineButton: 'కనెక్షన్ పునరుద్ధరించు',
    dashboardIntro:
      'ఇక్కడ మీ దృష్టికి కావలసిన ముఖ్య విషయాలు ఉన్నాయి. తదుపరి చర్యను చూడండి, మీ పురోగతిని భద్రపరచండి మరియు అవసరమైనప్పుడు సహాయం పొందండి. (Here is what needs your attention. Review the next step, save your progress, and ask for help when needed.)',
    whatShouldIDoNext: 'నేను ఇప్పుడు ఏమి చేయాలి? (What should I do next?)',
    fourLaneTimelineTitle: 'నాలుగు స్వతంత్ర పెన్షన్ ప్రక్రియల స్థితి (Four-Lane Timeline)',
    mayAffectHypothesis: 'ప్రభావితం చేయవచ్చు — అంచనా మాత్రమే (MAY AFFECT — HYPOTHESIS)',
    understandPaymentDelay: 'చెల్లింపు ఆలస్యాన్ని అర్థం చేసుకోండి (Understand payment delay)',
    nav: {
      overview: '1. ముఖ్యాంశాలు (Overview)',
      'my-benefits': '2. నా పెన్షన్ స్థితి (My Benefits)',
      'payment-diagnosis': '3. చెల్లింపు ఆలస్య విశ్లేషణ (Payment Diagnosis)',
      'documents-deadlines': '4. పత్రాలు & గడువులు (Documents and Deadlines)',
      'caregiver-access': '5. సహాయకుని అనుమతులు (Caregiver Access)',
      'notifications-activity': '6. సూచనలు & చరిత్ర (Notifications and Activity)',
      'explore-benefits': '7. పథకాల అన్వేషణ (Explore Benefits)',
      'assisted-completion': '8. ఇంటి వద్ద సహాయం (Assisted Completion)',
      'accessibility-settings': '9. సౌలభ్యం & సెట్టింగ్‌లు (Accessibility)',
      'technical-evaluation': '10. సాంకేతిక మూల్యాంకనం (Technical & Evaluation)',
    },
    cards: {
      application: 'దరఖాస్తు (APPLICATION)',
      verification: 'ధృవీకరణ (VERIFICATION)',
      documents: 'పత్రాలు (DOCUMENTS)',
      payment: 'చెల్లింపు (PAYMENT)',
    },
    safeguardBanner:
      'మీ పెన్షన్ భద్రత కోసం, మేము ఈ మార్పును నేరుగా మీతోనే నిర్ధారిస్తాము. 72 గంటల వరకు ఎలాంటి మార్పు జరగదు. (To keep your savings safe, we’ll confirm this change with you directly. Nothing changes for 72 hours.)',
    offlineSavedLocally: 'స్థానికంగా భద్రపరచబడింది — ఇంకా సమర్పించబడలేదు (Saved locally — not submitted)',
    reconnectedBanner:
      'కనెక్షన్ పునరుద్ధరించబడింది. మీ డ్రాఫ్ట్ అందుబాటులో ఉంది. మీ ధృవీకరణ ఇంకా సమర్పించబడలేదు. (Connection restored. Your local draft is available. Your verification has not been submitted.)',
    readBackScript:
      'You were preparing your documents. Your last confirmed step was saving the checklist. Would you like to continue or repeat that step?',
    visitDemoDisclaimer:
      'డెమో అభ్యర్థన స్థానికంగా నమోదు చేయబడింది — అధికారికంగా బుక్ చేయబడలేదు. (Demo request recorded locally — not officially booked.)',
  },
};
