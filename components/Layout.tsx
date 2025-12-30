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
  Bell
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

  // Local state for the form
  const [formData, setFormData] = useState({ ...user });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const location = useLocation();

  // Helper to close sidebar on mobile when a link is clicked
  const closeSidebar = () => setIsSidebarOpen(false);

  // Determine title based on path
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

  const handleProfileSave = async () => {
    // Update Local Context/Storage
    updateProfile(formData);
    setIsProfileModalOpen(false);
  };

  const handleOpenProfile = () => {
    setFormData({ ...user }); // Reset form to current user data
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
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar-champagne fixed lg:static inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:transform-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="p-8 pb-4 pl-6 flex justify-between items-center">
            <Logo logoUrl={businessSettings.logoUrl} />
            {/* Close button for mobile inside the drawer */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1 text-stone-400 hover:text-stone-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-fib-5 mt-fib-21 overflow-y-auto no-scrollbar">
            <SidebarItem to="/" icon={LayoutDashboard} label={t('nav.overview')} onClick={closeSidebar} />
            <SidebarItem to="/calendar" icon={Calendar} label={t('nav.sessions')} onClick={closeSidebar} />
            <SidebarItem to="/clients" icon={Users} label={t('nav.community')} onClick={closeSidebar} />
            <SidebarItem to="/team" icon={Briefcase} label="Team" onClick={closeSidebar} />
            <SidebarItem to="/programs" icon={BookOpen} label={t('nav.programs')} onClick={closeSidebar} />
            <SidebarItem to="/resources" icon={Library} label={t('nav.resources')} onClick={closeSidebar} />
            <SidebarItem to="/finance" icon={CreditCard} label={t('nav.finance')} onClick={closeSidebar} />
            <SidebarItem to="/analytics" icon={BarChart3} label={t('nav.analytics')} onClick={closeSidebar} />
            <div className="pt-4 mt-4 border-t border-stone-100">
              <SidebarItem to="/settings" icon={Settings} label={t('nav.settings')} onClick={closeSidebar} />
            </div>
          </nav>

          {/* Language Switcher & User Profile */}
          <div className="p-4 border-t border-stone-100 mt-auto">
            {/* Language Switcher */}
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

            {/* Profile Snippet */}
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

            {/* Powered By Credit */}
            <div className="mt-4 px-4 pt-4 border-t border-stone-50 text-center">
              <p className="text-[10px] text-stone-400 font-medium tracking-wider uppercase opacity-60">
                Powered by <span className="text-gold-600 font-bold">Luminel Elite</span>
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-stone-100 px-4 md:px-8 z-10 sticky top-0">
          <div className="h-full max-w-[1600px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-stone-100 rounded-lg text-stone-600"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 overflow-hidden">
                <h2 className="text-xl lg:text-2xl text-display text-stone-800 truncate max-w-[200px] lg:max-w-none">{getPageTitle()}</h2>
                <div className="flex items-center gap-2">
                  {isFoundingMember && <FoundingMemberBadge size="sm" since={subscription.foundingMemberSince} />}
                  {tier !== 'free' && <SubscriptionTierBadge tier={tier as any} size="sm" />}
                </div>
              </div>
            </div>

            {/* Notification Bell */}
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

        {/* Notification Drawer */}
        <NotificationDrawer
          isOpen={isNotificationsOpen}
          onClose={closeNotifications}
        />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          {children}
        </main>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden my-auto">
            {/* Modal Header with Image Upload */}
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
                  <h2 className="text-2xl font-serif font-bold text-stone-800">Edit Profile</h2>
                  <p className="text-sm text-stone-500">Update your admin details & company settings.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-fib-21">
                {/* Left Column: Personal Info */}
                <div className="space-y-fib-13">
                  <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100 pb-2">Personal Info</h3>

                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
                      <User className="w-3 h-3" /> Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:border-gold-400 outline-none text-stone-900 text-sm"
                    />
                  </div>

                  {/* Role */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
                      <Briefcase className="w-3 h-3" /> Role / Title
                    </label>
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:border-gold-400 outline-none text-stone-900 text-sm"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
                      <Mail className="w-3 h-3" /> Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:border-gold-400 outline-none text-stone-900 text-sm"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
                      <Phone className="w-3 h-3" /> Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:border-gold-400 outline-none text-stone-900 text-sm"
                      placeholder="+1 555 000-0000"
                    />
                  </div>
                </div>

                {/* Right Column: Business/Billing Info */}
                <div className="space-y-fib-13">
                  <h3 className="text-xs font-bold text-gold-600 uppercase tracking-widest border-b border-gold-100 pb-2">Dati Aziendali (Per Fatture)</h3>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
                      <Building className="w-3 h-3" /> Ragione Sociale / Studio
                    </label>
                    <input
                      type="text"
                      value={formData.companyName || ''}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:border-gold-400 outline-none text-stone-900 text-sm font-medium"
                      placeholder="Es. Rossi Consulting SRL"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
                      <MapPin className="w-3 h-3" /> Indirizzo Completo
                    </label>
                    <textarea
                      value={formData.companyAddress || ''}
                      onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:border-gold-400 outline-none text-stone-900 text-sm resize-none h-20"
                      placeholder="Via Roma 1, 00100 Milano (MI)"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
                      <FileText className="w-3 h-3" /> P.IVA / Cod. Fiscale
                    </label>
                    <input
                      type="text"
                      value={formData.vatId || ''}
                      onChange={(e) => setFormData({ ...formData, vatId: e.target.value })}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:border-gold-400 outline-none text-stone-900 text-sm font-mono"
                      placeholder="IT12345678901"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
                      <Globe className="w-3 h-3" /> Website
                    </label>
                    <input
                      type="text"
                      value={formData.website || ''}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:border-gold-400 outline-none text-stone-900 text-sm"
                      placeholder="www.yourwebsite.com"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  onClick={logout}
                  className="mr-auto text-red-500 hover:text-red-700 font-bold text-sm flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>

                <button
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 text-stone-500 font-bold hover:bg-stone-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProfileSave}
                  className="px-6 py-2 bg-gold-500 text-white font-bold rounded-xl hover:bg-gold-600 shadow-lg shadow-gold-200 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
