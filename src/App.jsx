import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TodoProvider } from './context/TodoContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/landing/HeroSection';
import { BenefitsSection } from './components/landing/BenefitsSection';
import { AboutSection } from './components/landing/AboutSection';
import { DashboardView } from './components/dashboard/DashboardView';
import { AuthModal } from './components/modals/AuthModal';
import { SupabaseConfigModal } from './components/modals/SupabaseConfigModal';
import { AboutModal } from './components/modals/AboutModal';
import { ContactModal } from './components/modals/ContactModal';
import { DeleteToast } from './components/common/DeleteToast';

const AppContent = () => {
  const { user, loginAsGuest } = useAuth();
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks', 'schedule', 'calendar', 'projects'
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'dashboard'
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'signin' });
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const prevUserRef = React.useRef(user);

  // When user logs in, automatically open their Workspace dashboard; when logging out, return to landing
  React.useEffect(() => {
    if (!prevUserRef.current && user) {
      setCurrentView('dashboard');
    } else if (prevUserRef.current && !user) {
      setCurrentView('landing');
    }
    prevUserRef.current = user;
  }, [user]);

  const handleOpenAuth = (mode = 'signin') => {
    if (mode === 'guest') {
      loginAsGuest();
      setActiveTab('tasks');
      setCurrentView('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setAuthModal({ isOpen: true, mode });
    }
  };

  const handleNavigateToMain = () => {
    setCurrentView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToDashboard = () => {
    setCurrentView('dashboard');
    setActiveTab('tasks');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToProfile = () => {
    setCurrentView('dashboard');
    setActiveTab('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToProgress = () => {
    setCurrentView('dashboard');
    setActiveTab('progress');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenNewTodo = () => {
    setCurrentView('dashboard');
    setShowTodoForm(true);
  };

  const handleSelectView = (viewId) => {
    setActiveTab(viewId);
    if (!user) {
      loginAsGuest();
    }
    setCurrentView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Global Navigation Header */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        onOpenSupabase={() => setSupabaseModalOpen(true)}
        onOpenAbout={() => setAboutModalOpen(true)}
        onOpenContact={() => setContactModalOpen(true)}
        onOpenNewTodo={handleOpenNewTodo}
        currentView={currentView}
        onNavigateToMain={handleNavigateToMain}
        onNavigateToDashboard={handleNavigateToDashboard}
        onNavigateToProfile={handleNavigateToProfile}
        onNavigateToProgress={handleNavigateToProgress}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {user && currentView === 'dashboard' ? (
          /* Authenticated / Guest Explorer Dashboard View */
          <div>
            <DashboardView
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onOpenSupabase={() => setSupabaseModalOpen(true)}
              showTodoForm={showTodoForm}
              setShowTodoForm={setShowTodoForm}
            />
          </div>
        ) : (
          /* Main Landing Page View (accessible both logged out and when logged in) */
          <div>
            <HeroSection
              onOpenAuth={handleOpenAuth}
              onOpenSupabase={() => setSupabaseModalOpen(true)}
              onGetStarted={() => {
                if (user) {
                  handleNavigateToDashboard();
                } else {
                  handleOpenAuth('signup');
                }
              }}
              onGoToDashboard={handleNavigateToDashboard}
              isLoggedIn={!!user}
            />
            <BenefitsSection
              onSelectView={handleSelectView}
              onOpenSupabase={() => setSupabaseModalOpen(true)}
            />
            <AboutSection
              onGetStarted={() => {
                if (user) {
                  handleNavigateToDashboard();
                } else {
                  handleOpenAuth('signup');
                }
              }}
              onGoToDashboard={handleNavigateToDashboard}
              isLoggedIn={!!user}
            />
          </div>
        )}
      </main>


      {/* Global Footer */}
      <Footer
        onOpenAbout={() => {
          const el = document.getElementById('about');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
          else setAboutModalOpen(true);
        }}
        onOpenContact={() => setContactModalOpen(true)}
        onOpenSupabase={() => setSupabaseModalOpen(true)}
      />

      {/* Floating Modals */}
      <AuthModal
        isOpen={authModal.isOpen}
        initialMode={authModal.mode}
        onClose={() => setAuthModal({ isOpen: false, mode: 'signin' })}
      />

      <SupabaseConfigModal
        isOpen={supabaseModalOpen}
        onClose={() => setSupabaseModalOpen(false)}
      />

      <AboutModal
        isOpen={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
      />

      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
      />

      {/* Modern Floating Undo Delete Toast */}
      <DeleteToast />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TodoProvider>
          <AppContent />
        </TodoProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
