import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from './components/ToastNotification';
import { UserProvider, useUser } from './context/UserContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { CustomCursor } from './components/CustomCursor';
import { AnimeMotionScope } from './components/AnimeMotionScope';
import HomePage from './pages/HomePage';
import { BriefBuilderPage } from './pages/BriefBuilderPage';
import { FreelancersPage } from './pages/FreelancersPage';
import { DesignerProfilePage } from './pages/DesignerProfilePage';
import InboxPage from './pages/InboxPage';
import SettingsPage from './pages/SettingsPage';
import HelpCenterPage from './pages/HelpCenterPage';
import { CommandPalette } from './components/CommandPalette';
import { JobsPage } from './pages/JobsPage';
import { JobDetailPage } from './pages/JobDetailPage';
import { ProposalsPage } from './pages/ProposalsPage';
import { CompareFreelancersPage } from './pages/CompareFreelancersPage';
import { ProjectWorkspacePage } from './pages/ProjectWorkspacePage';
import { WalletPage } from './pages/WalletPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import ClientDashboardPage from './pages/client/ClientDashboardPage';
import FreelancerDashboardPage from './pages/freelancer/FreelancerDashboardPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';

const RoleDashboardRedirect = () => {
  const { role } = useUser();
  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'freelancer') return <Navigate to="/freelancer/dashboard" replace />;
  return <Navigate to="/client/dashboard" replace />;
};

function App() {
  return (
    <UserProvider>
      <ToastProvider>
      <NotificationProvider>
        <HashRouter>
          <CommandPalette />
          <AnimeMotionScope />
          <CustomCursor />
          <div className="living-mesh min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-slate-950 font-sans">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage onNavigate={() => {}} onLogin={() => {}} />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                
                {/* Role Specific Dashboards */}
                <Route path="/client/dashboard" element={<ClientDashboardPage />} />
                <Route path="/freelancer/dashboard" element={<FreelancerDashboardPage />} />
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                
                {/* Fallback Redirects */}
                <Route path="/dashboard" element={<RoleDashboardRedirect />} />
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

                <Route path="/brief" element={<BriefBuilderPage />} />
                <Route path="/designers" element={<FreelancersPage />} />
                <Route path="/designers/:id" element={<DesignerProfilePage />} />
                <Route path="/compare" element={<CompareFreelancersPage />} />
                <Route path="/jobs" element={<JobsPage />} />
                <Route path="/jobs/:id" element={<JobDetailPage />} />
                <Route path="/proposals" element={<ProposalsPage />} />
                <Route path="/workspace/:id" element={<ProjectWorkspacePage />} />
                <Route path="/wallet" element={<WalletPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/inbox" element={<InboxPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/help" element={<HelpCenterPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </HashRouter>
      </NotificationProvider>
      <ToastContainer />
      </ToastProvider>
    </UserProvider>
  );
}

export default App;
