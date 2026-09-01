import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  BookOpen,
  CreditCard,
  BarChart3,
  Settings,
  Menu,
  X,
  Search,
  Sparkles,
  Library,
  Camera,
  User,
  Briefcase,
  LogOut,
  Mail,
  Phone,
  Globe,
  Building,
  MapPin,
  FileText,
  Bell,
  Loader2
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Logo } from './Logo';
import { APP_CONFIG } from '../config';
import * as settingsService from '../services/settingsService';
import { NotificationDrawer } from './NotificationDrawer';
import { useUI } from '../contexts/UIContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { FoundingMemberBadge, SubscriptionTierBadge } from './FoundingMemberBadge';

interface LayoutProps {
  children?: React.ReactNode;
}

const SidebarItem = ({ to, icon: Icon, label, onClick }: { to: string; icon: any; label: string; onClick?: () => void }) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
          ? 'nav-item-gold-active'
          : 'text-stone-500 hover:bg-champagne-100 hover:text-gold-700'
        }`
      }
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium tracking-wide">{label}</span>
    </NavLink>
  );
};

export const Layout = ({ children }: LayoutProps) => {
  const { user, updateProfile, logout, businessSettings } = useUser();
  const { t, language, setLanguage } = useLanguage();
  const { isNotificationsOpen, closeNotifications, toggleNotifications, unreadCount } = useUI();
  const { isFoundingMember, subscription } = useSubscription();
  const tier = subscription.tier;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null);

  // FIX (28 ago 2026): il form ora ha solo i campi personali che davvero
  // vivono su UserProfile/tabella users — niente più companyName/
  // companyAddress/vatId/website, che erano duplicati con Impostazioni
  // e non venivano mai salvati (il vecchio codice aveva un TODO al posto
  // del salvataggio vero).
  const [formData, setFormData] = useState({ ...user });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const location = useLocation();

  const closeSidebar = () => setIsSidebarOpen(false);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return t('nav.overview');
    if (path.includes('calendar')) return t('nav.sessions');
    if (path.includes('clients')) return t('nav.community');
    if (path.includes('finance')) return t('nav.finance');
    if (path.includes('programs')) return t('nav.programs');
    if (path.includes('resources')) return t('nav.resources');
    if (path.includes('analytics')) return t('nav.analytics');
    if (path.includes('settings')) return t('nav.settings');
    return APP_CONFIG.appName;
  };

  // FIX (28 ago 2026): ora è async e scrive davvero su Supabase tramite
  // updateProfile() corretto — con stato di caricamento e messaggio
  // d'errore esplicito se il salvataggio fallisce, invece di chiudere
  // il modal come se fosse andato tutto bene comunque.
  const handleProfileSave = async () => {
    setIsSavingProfile(true);
    setProfileSaveError(null);
    try {
      await updateProfile(formData);
      setIsProfileModalOpen(false);
    } catch (error) {
      console.error('[Layout] Errore salvataggio profilo:', error);
      setProfileSaveError('Salvataggio non riuscito. Riprova.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleOpenProfile = () => {
    setFormData({ ...user });
    setProfileSaveError(null);
    setIsProfileModalOpen(true);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex h-screen bg-stone-50 font-sans overflow-hidden">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`sidebar-champagne fixed lg:static inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:transform-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-8 pb-4 pl-6 flex justify-between items-center">
            <Logo logoUrl={businessSettings.logoUrl} businessName={businessSettings.name} />
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1 text-stone-400 hover:text-stone-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-fib-5 mt-fib-21 overflow-y-auto no-scrollbar">
            <SidebarItem to="/dashboard" icon={LayoutDashboard} label={t('nav.overview')} onClick={closeSidebar} />
            <SidebarItem to="/calendar" icon={Calendar} label={t('nav.sessions')} onClick={closeSidebar} />
            <SidebarItem to="/clients" icon={Users} label={t('nav.community')} onClick={closeSidebar} />
            <SidebarItem to="/team" icon={Briefcase} label={t('nav.team')} onClick={closeSidebar} />
            <SidebarItem to="/programs" icon={BookOpen} label={t('nav.programs')} onClick={closeSidebar} />
            <SidebarItem to="/resources" icon={Library} label={t('nav.resources')} onClick={closeSidebar} />
            <SidebarItem to="/finance" icon={CreditCard} label={t('nav.finance')} onClick={closeSidebar} />
            <SidebarItem to="/analytics" icon={BarChart3} label={t('nav.analytics')} onClick={closeSidebar} />
            <div className="pt-4 mt-4 border-t border-stone-100">
              <SidebarItem to="/settings" icon={Settings} label={t('nav.settings')} onClick={closeSidebar} />
            </div>
          </nav>

          <div className="p-4 border-t border-stone-100 mt-auto">
            <div className="flex justify-center bg-stone-100 p-1 rounded-lg mb-3">
              <button
                onClick={() => setLanguage('it')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${language === 'it' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-400 hover:text-stone-600'}`}
              >
                IT
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${language === 'en' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-400 hover:text-stone-600'}`}
              >
                EN
              </button>
            </div>

            <div
              onClick={() => { handleOpenProfile(); closeSidebar(); }}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gold-50 hover:shadow-sm cursor-pointer transition-all group border border-transparent hover:border-gold-100 relative mb-4"
            >
              <img
                src={user.avatar}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-gold-200 group-hover:border-gold-400 transition-colors"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-800 truncate">{user.name}</p>
                <p className="text-xs text-stone-500 truncate">{user.role}</p>
              </div>
              <Settings className="w-4 h-4 text-stone-400 group-hover:text-gold-600" />
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-3 text-stone-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium tracking-wide">{t('nav.logout')}</span>
            </button>

            <div className="mt-4 px-4 pt-4 border-t border-stone-50 text-center">
              <p className="text-[10px] text-stone-400 font-medium tracking-wider uppercase opacity-60">
                Powered by <span className="text-gold-600 font-bold">Luminel Elite</span>
              </p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-stone-100 px-4 md:px-8 z-10 sticky top-0">
          <div className="h-full max-w-[1600px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-stone-100 rounded-lg text-stone-600"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 overflow-hidden">
                <h2 className="text-lg md:text-xl lg:text-2xl text-display text-stone-800 truncate max-w-[120px] sm:max-w-[200px] lg:max-w-none">{getPageTitle()}</h2>
                <div className="flex items-center gap-1 md:gap-2">
                  {isFoundingMember && <FoundingMemberBadge size="sm" since={subscription.foundingMemberSince} />}
                  {tier !== 'free' && <SubscriptionTierBadge tier={tier as any} size="sm" />}
                </div>
              </div>
            </div>

            <div
              onClick={toggleNotifications}
              className="relative cursor-pointer group p-2 hover:bg-stone-50 rounded-xl transition-all"
            >
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
              )}
              <Bell className="w-6 h-6 text-stone-400 group-hover:text-gold-500 transition-colors" />
            </div>
          </div>
        </header>

        <NotificationDrawer
          isOpen={isNotificationsOpen}
          onClose={closeNotifications}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          {children}
        </main>
      </div>

      {/* EDIT PROFILE MODAL — FIX: solo dati personali, niente più sezione
          "Dati Aziendali" (quella vive solo in Impostazioni ora) */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden my-auto">
            <div className="h-32 bg-gradient-to-r from-stone-800 to-stone-900 relative flex-shrink-0">
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="absolute top-4 right-4 p-2 bg-black/20 text-white rounded-full hover:bg-black/40 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute -bottom-10 left-8">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <img
                    src={formData.avatar}
                    alt="Profile"
                    className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-md bg-stone-200"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                    accept="image/*"
                  />
                </div>
              </div>
            </div>

            <div className="pt-14 px-8 pb-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-stone-800">Il Tuo Profilo</h2>
                  <p className="text-sm text-stone-500">Nome, ruolo e contatti personali. Per i dati aziendali/fatturazione, vai in Impostazioni.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
                    <User className="w-3 h-3" /> Nome Completo
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:border-gold-400 outline-none text-stone-900 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
                    <Briefcase className="w-3 h-3" /> Ruolo / Titolo
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:border-gold-400 outline-none text-stone-900 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
                    <Mail className="w-3 h-3" /> Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full p-2.5 bg-stone-100 border border-stone-200 rounded-lg text-stone-500 text-sm cursor-not-allowed"
                  />
                  <p className="text-[10px] text-stone-400">L'email di accesso non si cambia da qui.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
                    <Phone className="w-3 h-3" /> Telefono
                  </label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:border-gold-400 outline-none text-stone-900 text-sm"
                    placeholder="+39 333 1234567"
                  />
                </div>
              </div>

              {profileSaveError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs font-medium">
                  {profileSaveError}
                </div>
              )}

              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  onClick={logout}
                  className="mr-auto text-red-500 hover:text-red-700 font-bold text-sm flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>

                <button
                  onClick={() => setIsProfileModalOpen(false)}
                  disabled={isSavingProfile}
                  className="px-4 py-2 text-stone-500 font-bold hover:bg-stone-100 rounded-xl transition-colors disabled:opacity-50"
                >
                  Annulla
                </button>
                <button
                  onClick={handleProfileSave}
                  disabled={isSavingProfile}
                  className="px-6 py-2 bg-gold-500 text-white font-bold rounded-xl hover:bg-gold-600 shadow-lg shadow-gold-200 transition-all disabled:opacity-60 flex items-center gap-2"
                >
                  {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isSavingProfile ? 'Salvataggio...' : 'Salva Modifiche'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};