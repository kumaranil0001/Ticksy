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
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'signin' });
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const handleOpenAuth = (mode = 'signin') => {
    if (mode === 'guest') {
      loginAsGuest();
      setActiveTab('tasks');
    } else {
      setAuthModal({ isOpen: true, mode });
    }
  };

  const handleOpenNewTodo = () => {
    setActiveTab('tasks');
    setShowTodoForm(true);
    setTimeout(() => {
      const el = document.getElementById('todo-creation-form');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const input = el.querySelector('input[type="text"]');
        if (input) input.focus();
      }
    }, 120);
  };

  const handleSelectView = (viewId) => {
    if (user) {
      setActiveTab(viewId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      loginAsGuest();
      setActiveTab(viewId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {user ? (
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
          /* Public Landing Page View */
          <div>
            <HeroSection
              onOpenAuth={handleOpenAuth}
              onOpenSupabase={() => setSupabaseModalOpen(true)}
              onGetStarted={() => handleOpenAuth('signup')}
            />
            <BenefitsSection
              onSelectView={handleSelectView}
              onOpenSupabase={() => setSupabaseModalOpen(true)}
            />
            <AboutSection
              onGetStarted={() => handleOpenAuth('signup')}
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
