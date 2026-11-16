import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';
import AppShell from './components/AppShell';
import HomePage from './pages/HomePage';
import SubmitRequestPage from './pages/SubmitRequestPage';
import RequestDetailPage from './pages/RequestDetailPage';
import CreditsPage from './pages/CreditsPage';
import NotificationsPage from './pages/NotificationsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ClientDashboardPage from './pages/client/ClientDashboardPage';
import FreelancerDashboardPage from './pages/freelancer/FreelancerDashboardPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import SettingsPage from './pages/SettingsPage';
import HelpCenterPage from './pages/HelpCenterPage';
import { AiPresentationStudioPage } from './pages/AiPresentationStudioPage';
import HowItWorksPage from './pages/public/HowItWorksPage';
import PricingPage from './pages/public/PricingPage';
import ForClientsPage from './pages/public/ForClientsPage';
import ForSpecialistsPage from './pages/public/ForSpecialistsPage';
import BlueprintSamplePage from './pages/public/BlueprintSamplePage';
import CaseStudiesPage from './pages/public/CaseStudiesPage';
import TrustSecurityPage from './pages/public/TrustSecurityPage';
import StatusPage from './pages/public/StatusPage';
import LegalPages from './pages/public/LegalPages';

const RoleDashboardRedirect = () => {
  const { role } = useUser();
  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'freelancer') return <Navigate to="/freelancer/dashboard" replace />;
  return <Navigate to="/client/dashboard" replace />;
};

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <HashRouter>
          <div className="min-h-screen bg-[#F7F8FC] dark:bg-[#0F0F1D] text-[#17172B] dark:text-[#F7F8FC] font-sans transition-colors duration-200">
            <AppShell>
              <Routes>
                {/* Public Landing Route */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                {/* Dedicated Public Platform Pages (Section 3 Plan) */}
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/tokens" element={<Navigate to="/pricing" replace />} />
                <Route path="/for-clients" element={<ForClientsPage />} />
                <Route path="/for-specialists" element={<ForSpecialistsPage />} />
                <Route path="/for-freelancers" element={<Navigate to="/for-specialists" replace />} />
                <Route path="/blueprint-sample" element={<BlueprintSamplePage />} />
                <Route path="/sample-blueprint" element={<Navigate to="/blueprint-sample" replace />} />
                <Route path="/case-studies" element={<CaseStudiesPage />} />
                <Route path="/trust" element={<TrustSecurityPage />} />
                <Route path="/security" element={<Navigate to="/trust" replace />} />
                <Route path="/status" element={<StatusPage />} />
                <Route path="/terms" element={<LegalPages initialTab="terms" />} />
                <Route path="/privacy" element={<LegalPages initialTab="privacy" />} />
                <Route path="/refund-policy" element={<LegalPages initialTab="refund" />} />

                {/* Client & Core Product Intake Routes */}
                <Route path="/submit-request" element={<SubmitRequestPage />} />
                <Route path="/slides" element={<AiPresentationStudioPage />} />
                <Route path="/presentation-generator" element={<Navigate to="/slides" replace />} />
                <Route path="/submit" element={<Navigate to="/submit-request" replace />} />
                <Route path="/brief" element={<Navigate to="/submit-request" replace />} />
                <Route path="/requests/:requestId" element={<RequestDetailPage />} />
                <Route path="/credits" element={<CreditsPage />} />
                <Route path="/wallet" element={<Navigate to="/credits" replace />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/profile" element={<SettingsPage />} />
                <Route path="/help" element={<HelpCenterPage />} />

                {/* Role Specific Dashboards & Dedicated Sub-Routes */}
                <Route path="/dashboard" element={<RoleDashboardRedirect />} />

                {/* Admin Dedicated Sub-Routes */}
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard" element={<AdminDashboardPage view="overview" />} />
                <Route path="/admin/analytics" element={<AdminDashboardPage view="analytics" />} />
                <Route path="/admin/requests" element={<AdminDashboardPage view="intake" />} />
                <Route path="/admin/intake" element={<Navigate to="/admin/requests" replace />} />
                <Route path="/admin/projects" element={<AdminDashboardPage view="intake" />} />
                <Route path="/admin/assignments" element={<AdminDashboardPage view="assignments" />} />
                <Route path="/admin/assessments" element={<AdminDashboardPage view="assessments-quotes" />} />
                <Route path="/admin/clients" element={<AdminDashboardPage view="clients" />} />
                <Route path="/admin/freelancers" element={<AdminDashboardPage view="freelancers" />} />
                <Route path="/admin/ai-intelligence" element={<AdminDashboardPage view="ai-intelligence" />} />
                <Route path="/admin/cost-intelligence" element={<AdminDashboardPage view="cost-intelligence" />} />
                <Route path="/admin/document-studio" element={<AdminDashboardPage view="document-studio" />} />
                <Route path="/admin/deliverables" element={<AdminDashboardPage view="deliverables" />} />
                <Route path="/admin/audit-logs" element={<AdminDashboardPage view="audit" />} />
                <Route path="/admin/audit" element={<Navigate to="/admin/audit-logs" replace />} />
                <Route path="/admin/tasks" element={<AdminDashboardPage view="tasks" />} />
                <Route path="/admin/clarifications" element={<AdminDashboardPage view="clarifications" />} />
                <Route path="/admin/*" element={<AdminDashboardPage />} />

                {/* Client Dedicated Sub-Routes */}
                <Route path="/client" element={<Navigate to="/client/dashboard" replace />} />
                <Route path="/client/dashboard" element={<ClientDashboardPage view="overview" />} />
                <Route path="/client/vault" element={<ClientDashboardPage view="vault" />} />
                <Route path="/client/projects" element={<ClientDashboardPage view="workspace" />} />
                <Route path="/client/workspace" element={<ClientDashboardPage view="workspace" />} />
                <Route path="/client/documents" element={<ClientDashboardPage view="documents" />} />
                <Route path="/client/clarifications" element={<ClientDashboardPage view="clarifications" />} />
                <Route path="/client/budget" element={<Navigate to="/client/projects" replace />} />
                <Route path="/client/exports" element={<ClientDashboardPage view="exports" />} />
                <Route path="/client/ai-assistant" element={<ClientDashboardPage view="ai-assistant" />} />
                <Route path="/client/timeline" element={<ClientDashboardPage view="milestones" />} />
                <Route path="/client/milestones" element={<Navigate to="/client/timeline" replace />} />
                <Route path="/client/scope-changes" element={<ClientDashboardPage view="scope-changes" />} />
                <Route path="/client/decisions" element={<ClientDashboardPage view="decisions" />} />
                <Route path="/client/*" element={<ClientDashboardPage />} />

                {/* Freelancer Dedicated Sub-Routes */}
                <Route path="/freelancer" element={<Navigate to="/freelancer/dashboard" replace />} />
                <Route path="/freelancer/dashboard" element={<FreelancerDashboardPage view="timeline" />} />
                <Route path="/freelancer/projects" element={<FreelancerDashboardPage view="briefs" />} />
                <Route path="/freelancer/briefs" element={<FreelancerDashboardPage view="briefs" />} />
                <Route path="/freelancer/assessments" element={<FreelancerDashboardPage view="assessment" />} />
                <Route path="/freelancer/quotations" element={<FreelancerDashboardPage view="quotation" />} />
                <Route path="/freelancer/tasks" element={<FreelancerDashboardPage view="tasks" />} />
                <Route path="/freelancer/calendar" element={<FreelancerDashboardPage view="timeline" />} />
                <Route path="/freelancer/documents" element={<FreelancerDashboardPage view="documents" />} />
                <Route path="/freelancer/deliverables" element={<FreelancerDashboardPage view="deliverables" />} />
                <Route path="/freelancer/zips" element={<Navigate to="/freelancer/deliverables" replace />} />
                <Route path="/freelancer/revisions" element={<FreelancerDashboardPage view="revisions" />} />
                <Route path="/freelancer/history" element={<FreelancerDashboardPage view="history" />} />
                <Route path="/freelancer/*" element={<FreelancerDashboardPage />} />

                {/* Deprecated Public Marketplace & Chat Routes (Redirected cleanly) */}
                <Route path="/designers" element={<Navigate to="/" replace />} />
                <Route path="/designers/:id" element={<Navigate to="/" replace />} />
                <Route path="/compare" element={<Navigate to="/" replace />} />
                <Route path="/jobs" element={<Navigate to="/" replace />} />
                <Route path="/jobs/:id" element={<Navigate to="/" replace />} />
                <Route path="/proposals" element={<Navigate to="/" replace />} />
                <Route path="/inbox" element={<Navigate to="/dashboard" replace />} />
                <Route path="/workspace/:id" element={<Navigate to="/dashboard" replace />} />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AppShell>
          </div>
        </HashRouter>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
