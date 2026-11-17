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
  const { role, user } = useUser();
  if (!user) return <Navigate to="/login" replace />;
  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'freelancer') return <Navigate to="/freelancer/dashboard" replace />;
  return <Navigate to="/client/dashboard" replace />;
};

const RequireRole: React.FC<{ allowedRoles: string[]; children: React.ReactNode }> = ({ allowedRoles, children }) => {
  const { user } = useUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'freelancer') return <Navigate to="/freelancer/dashboard" replace />;
    return <Navigate to="/client/dashboard" replace />;
  }
  return <>{children}</>;
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
                <Route path="/submit-request" element={<RequireRole allowedRoles={['client']}><SubmitRequestPage /></RequireRole>} />
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

                {/* Admin Dedicated Sub-Routes (Strictly Admin Role) */}
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard" element={<RequireRole allowedRoles={['admin']}><AdminDashboardPage view="overview" /></RequireRole>} />
                <Route path="/admin/analytics" element={<RequireRole allowedRoles={['admin']}><AdminDashboardPage view="analytics" /></RequireRole>} />
                <Route path="/admin/requests" element={<RequireRole allowedRoles={['admin']}><AdminDashboardPage view="intake" /></RequireRole>} />
                <Route path="/admin/intake" element={<Navigate to="/admin/requests" replace />} />
                <Route path="/admin/projects" element={<RequireRole allowedRoles={['admin']}><AdminDashboardPage view="projects" /></RequireRole>} />
                <Route path="/admin/assignments" element={<RequireRole allowedRoles={['admin']}><AdminDashboardPage view="assignments" /></RequireRole>} />
                <Route path="/admin/assessments" element={<RequireRole allowedRoles={['admin']}><AdminDashboardPage view="assessments-quotes" /></RequireRole>} />
                <Route path="/admin/clients" element={<RequireRole allowedRoles={['admin']}><AdminDashboardPage view="clients" /></RequireRole>} />
                <Route path="/admin/freelancers" element={<RequireRole allowedRoles={['admin']}><AdminDashboardPage view="freelancers" /></RequireRole>} />
                <Route path="/admin/ai-intelligence" element={<RequireRole allowedRoles={['admin']}><AdminDashboardPage view="ai-intelligence" /></RequireRole>} />
                <Route path="/admin/cost-intelligence" element={<RequireRole allowedRoles={['admin']}><AdminDashboardPage view="cost-intelligence" /></RequireRole>} />
                <Route path="/admin/reference-template" element={<RequireRole allowedRoles={['admin']}><AdminDashboardPage view="reference-template" /></RequireRole>} />
                <Route path="/admin/document-studio" element={<RequireRole allowedRoles={['admin']}><AdminDashboardPage view="document-management" /></RequireRole>} />
                <Route path="/admin/document-requirements" element={<RequireRole allowedRoles={['admin']}><AdminDashboardPage view="document-management" /></RequireRole>} />
                <Route path="/admin/sub-admins" element={<RequireRole allowedRoles={['admin']}><AdminDashboardPage view="sub-admins" /></RequireRole>} />
                <Route path="/admin/compliance" element={<RequireRole allowedRoles={['admin']}><AdminDashboardPage view="compliance" /></RequireRole>} />
                <Route path="/admin/deliverables" element={<RequireRole allowedRoles={['admin']}><AdminDashboardPage view="deliverables" /></RequireRole>} />
                <Route path="/admin/audit-logs" element={<RequireRole allowedRoles={['admin']}><AdminDashboardPage view="audit" /></RequireRole>} />
                <Route path="/admin/audit" element={<Navigate to="/admin/audit-logs" replace />} />
                <Route path="/admin/tasks" element={<RequireRole allowedRoles={['admin']}><AdminDashboardPage view="tasks" /></RequireRole>} />
                <Route path="/admin/clarifications" element={<RequireRole allowedRoles={['admin']}><AdminDashboardPage view="clarifications" /></RequireRole>} />
                <Route path="/admin/*" element={<RequireRole allowedRoles={['admin']}><AdminDashboardPage /></RequireRole>} />

                {/* Client Dedicated Sub-Routes (Strictly Client Role) */}
                <Route path="/client" element={<Navigate to="/client/dashboard" replace />} />
                <Route path="/client/dashboard" element={<RequireRole allowedRoles={['client']}><ClientDashboardPage view="overview" /></RequireRole>} />
                <Route path="/client/vault" element={<RequireRole allowedRoles={['client']}><ClientDashboardPage view="vault" /></RequireRole>} />
                <Route path="/client/projects" element={<RequireRole allowedRoles={['client']}><ClientDashboardPage view="workspace" /></RequireRole>} />
                <Route path="/client/workspace" element={<RequireRole allowedRoles={['client']}><ClientDashboardPage view="workspace" /></RequireRole>} />
                <Route path="/client/documents" element={<RequireRole allowedRoles={['client']}><ClientDashboardPage view="documents" /></RequireRole>} />
                <Route path="/client/clarifications" element={<RequireRole allowedRoles={['client']}><ClientDashboardPage view="clarifications" /></RequireRole>} />
                <Route path="/client/budget" element={<Navigate to="/client/projects" replace />} />
                <Route path="/client/credits" element={<RequireRole allowedRoles={['client', 'admin']}><CreditsPage /></RequireRole>} />
                <Route path="/client/wallet" element={<RequireRole allowedRoles={['client', 'admin']}><CreditsPage /></RequireRole>} />
                <Route path="/client/exports" element={<RequireRole allowedRoles={['client']}><ClientDashboardPage view="exports" /></RequireRole>} />
                <Route path="/client/ai-assistant" element={<RequireRole allowedRoles={['client']}><ClientDashboardPage view="ai-assistant" /></RequireRole>} />
                <Route path="/client/timeline" element={<RequireRole allowedRoles={['client']}><ClientDashboardPage view="milestones" /></RequireRole>} />
                <Route path="/client/milestones" element={<Navigate to="/client/timeline" replace />} />
                <Route path="/client/scope-changes" element={<RequireRole allowedRoles={['client']}><ClientDashboardPage view="scope-changes" /></RequireRole>} />
                <Route path="/client/decisions" element={<RequireRole allowedRoles={['client']}><ClientDashboardPage view="decisions" /></RequireRole>} />
                <Route path="/client/*" element={<RequireRole allowedRoles={['client']}><ClientDashboardPage /></RequireRole>} />

                {/* Freelancer Dedicated Sub-Routes (Strictly Freelancer Role) */}
                <Route path="/freelancer" element={<Navigate to="/freelancer/dashboard" replace />} />
                <Route path="/freelancer/dashboard" element={<RequireRole allowedRoles={['freelancer']}><FreelancerDashboardPage view="timeline" /></RequireRole>} />
                <Route path="/freelancer/projects" element={<RequireRole allowedRoles={['freelancer']}><FreelancerDashboardPage view="briefs" /></RequireRole>} />
                <Route path="/freelancer/briefs" element={<RequireRole allowedRoles={['freelancer']}><FreelancerDashboardPage view="briefs" /></RequireRole>} />
                <Route path="/freelancer/assessments" element={<RequireRole allowedRoles={['freelancer']}><FreelancerDashboardPage view="assessment" /></RequireRole>} />
                <Route path="/freelancer/quotations" element={<RequireRole allowedRoles={['freelancer']}><FreelancerDashboardPage view="quotation" /></RequireRole>} />
                <Route path="/freelancer/tasks" element={<RequireRole allowedRoles={['freelancer']}><FreelancerDashboardPage view="tasks" /></RequireRole>} />
                <Route path="/freelancer/calendar" element={<RequireRole allowedRoles={['freelancer']}><FreelancerDashboardPage view="timeline" /></RequireRole>} />
                <Route path="/freelancer/documents" element={<RequireRole allowedRoles={['freelancer']}><FreelancerDashboardPage view="documents" /></RequireRole>} />
                <Route path="/freelancer/deliverables" element={<RequireRole allowedRoles={['freelancer']}><FreelancerDashboardPage view="deliverables" /></RequireRole>} />
                <Route path="/freelancer/zips" element={<Navigate to="/freelancer/deliverables" replace />} />
                <Route path="/freelancer/revisions" element={<RequireRole allowedRoles={['freelancer']}><FreelancerDashboardPage view="revisions" /></RequireRole>} />
                <Route path="/freelancer/history" element={<RequireRole allowedRoles={['freelancer']}><FreelancerDashboardPage view="history" /></RequireRole>} />
                <Route path="/freelancer/credits" element={<RequireRole allowedRoles={['freelancer', 'admin']}><CreditsPage /></RequireRole>} />
                <Route path="/freelancer/wallet" element={<RequireRole allowedRoles={['freelancer', 'admin']}><CreditsPage /></RequireRole>} />
                <Route path="/freelancer/*" element={<RequireRole allowedRoles={['freelancer']}><FreelancerDashboardPage /></RequireRole>} />

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
