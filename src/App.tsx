/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SevaSutraProvider, useSevaSutra } from './context/SevaSutraContext';
import { Layout } from './components/Layout';
import { OverviewPage } from './pages/OverviewPage';
import { MyBenefitsPage } from './pages/MyBenefitsPage';
import { PaymentDiagnosisPage } from './pages/PaymentDiagnosisPage';
import { DocumentsDeadlinesPage } from './pages/DocumentsDeadlinesPage';
import { CaregiverAccessPage } from './pages/CaregiverAccessPage';
import { NotificationsActivityPage } from './pages/NotificationsActivityPage';
import { ExploreBenefitsPage } from './pages/ExploreBenefitsPage';
import { AssistedCompletionPage } from './pages/AssistedCompletionPage';
import { AccessibilitySettingsPage } from './pages/AccessibilitySettingsPage';
import { TechnicalEvaluationPage } from './pages/TechnicalEvaluationPage';

const ActivePageRouter: React.FC = () => {
  const { activePage } = useSevaSutra();

  switch (activePage) {
    case 'overview':
      return <OverviewPage />;
    case 'my-benefits':
      return <MyBenefitsPage />;
    case 'payment-diagnosis':
      return <PaymentDiagnosisPage />;
    case 'documents-deadlines':
      return <DocumentsDeadlinesPage />;
    case 'caregiver-access':
      return <CaregiverAccessPage />;
    case 'notifications-activity':
      return <NotificationsActivityPage />;
    case 'explore-benefits':
      return <ExploreBenefitsPage />;
    case 'assisted-completion':
      return <AssistedCompletionPage />;
    case 'accessibility-settings':
      return <AccessibilitySettingsPage />;
    case 'technical-evaluation':
      return <TechnicalEvaluationPage />;
    default:
      return <OverviewPage />;
  }
};

export default function App() {
  return (
    <SevaSutraProvider>
      <Layout>
        <ActivePageRouter />
      </Layout>
    </SevaSutraProvider>
  );
}
