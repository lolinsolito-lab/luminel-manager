import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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

// Admin email - only this user can access GOD Mode
const ADMIN_EMAIL = 'jaramichael@hotmail.com';

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

  // Check if user email matches admin email
  if (user?.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
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
                <HashRouter>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/founder" element={<FounderLanding />} />
                    <Route path="/success" element={<PaymentSuccess />} />
                    <Route path="/reset-password" element={<ResetPassword />} />

                    {/* Protected Routes */}
                    <Route path="/*" element={
                      <ProtectedRoute>
                        <Layout>
                          <Routes>
                            <Route path="/" element={<Dashboard />} />
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
                </HashRouter>
              </SubscriptionProvider>
            </UIProvider>
          </LanguageProvider>
        </ResourceProvider>
      </ProgramProvider>
    </UserProvider>
  );
};

export default App;
