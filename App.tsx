import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Clients } from './components/Clients';
import { CalendarView } from './components/Calendar';
import { Team } from './components/Team';
import { Finance } from './components/Finance';
import { Programs } from './components/Programs';
import { Library } from './components/Library';
import { Analytics } from './components/Analytics';
import { Settings } from './components/Settings';
import { AIAssistant } from './components/AIAssistant';
import { Login } from './components/Login';
import { SplashIntro } from './components/SplashIntro';
import { HomeLanding } from './components/HomeLanding';
import { FounderLanding } from './components/FounderLanding';
import PaymentSuccess from './components/PaymentSuccess';
import { ResetPassword } from './components/ResetPassword';
import { AdminDashboard } from './components/AdminDashboard';
import { UserProvider, useUser } from './contexts/UserContext';
import { ProgramProvider } from './contexts/ProgramContext';
import { ResourceProvider } from './contexts/ResourceContext';
import { UIProvider } from './contexts/UIContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { APP_CONFIG } from './config';

// Scroll to top on route change
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Handle Supabase auth state changes (password recovery, etc.)
// Only navigates if THIS tab has the recovery tokens in URL
const AuthRedirectHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Import supabase dynamically to avoid circular deps
    import('./services/supabaseClient').then(({ supabase }) => {
      // Listen for auth state changes (works cleanly with BrowserRouter)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') {
          // Only redirect if THIS tab has recovery tokens in URL
          // This prevents ALL open tabs from redirecting when one receives recovery link
          const hash = window.location.hash;
          const hasRecoveryTokens = hash.includes('access_token') && hash.includes('type=recovery');

          // Also redirect if already on reset-password page (tokens already consumed)
          const isOnResetPage = location.pathname === '/reset-password';

          if (hasRecoveryTokens || isOnResetPage) {
            navigate('/reset-password');
          }
        }
      });

      return () => subscription.unsubscribe();
    });
  }, [navigate, location.pathname]);

  return null;
};

// Protected Route Wrapper with Splash Screen
const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { isAuthenticated } = useUser();
  const location = useLocation();
  const [showSplash, setShowSplash] = useState(true);

  // If not authenticated, redirect immediately
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated but splash hasn't finished, show splash
  if (showSplash) {
    return <SplashIntro onFinish={() => setShowSplash(false)} />;
  }

  // Render main app content
  return <>{children}</>;
};

// Admin-only Route Protection
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();

  // Check if user email matches admin email from config
  if (user?.email?.toLowerCase() !== APP_CONFIG.adminEmail.toLowerCase()) {
    // Redirect non-admins to dashboard
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  // Set Dynamic Document Title from Config
  useEffect(() => {
    document.title = APP_CONFIG.documentTitle;
  }, []);

  return (
    <UserProvider>
      <ProgramProvider>
        <ResourceProvider>
          <LanguageProvider>
            <UIProvider>
              <SubscriptionProvider>
                <BrowserRouter>
                  <ScrollToTop />
                  <AuthRedirectHandler />
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomeLanding />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/founder" element={<FounderLanding />} />
                    <Route path="/success" element={<PaymentSuccess />} />
                    <Route path="/reset-password" element={<ResetPassword />} />

                    {/* Protected Routes */}
                    <Route path="/*" element={
                      <ProtectedRoute>
                        <Layout>
                          <Routes>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/clients" element={<Clients />} />
                            <Route path="/calendar" element={<CalendarView />} />
                            <Route path="/team" element={<Team />} />
                            <Route path="/finance" element={<Finance />} />
                            <Route path="/programs" element={<Programs />} />
                            <Route path="/resources" element={<Library />} />
                            <Route path="/analytics" element={<Analytics />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                          </Routes>
                          <AIAssistant />
                        </Layout>
                      </ProtectedRoute>
                    } />
                  </Routes>
                </BrowserRouter>
              </SubscriptionProvider>
            </UIProvider>
          </LanguageProvider>
        </ResourceProvider>
      </ProgramProvider>
    </UserProvider>
  );
};

export default App;
