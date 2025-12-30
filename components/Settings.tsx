import React, { useState, useEffect, useRef } from 'react';
import {
   Building,
   Clock,
   Globe,
   Link as LinkIcon,
   Save,
   Upload,
   CheckCircle2,
   CreditCard,
   Calendar,
   AlertCircle,
   Loader2,
   Cloud,
   CloudOff,
   Image as ImageIcon
} from 'lucide-react';
import { APP_CONFIG } from '../config';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import * as settingsService from '../services/settingsService';
import * as storageService from '../services/storageService';
import { isSupabaseConfigured } from '../services/supabaseClient';

export const Settings: React.FC = () => {
   const { t } = useLanguage();
   const { refreshBusinessSettings } = useUser();
   const [activeTab, setActiveTab] = useState<'General' | 'Schedule' | 'Integrations'>('General');
   const [isSaved, setIsSaved] = useState(false);
   const [isLoading, setIsLoading] = useState(true);
   const [isSaving, setIsSaving] = useState(false);
   const [isCloudConnected, setIsCloudConnected] = useState(false);

   // --- STATE ---
   const [general, setGeneral] = useState({
      businessName: APP_CONFIG.appName + ' Center',
      taxId: '',
      address: '',
      currency: APP_CONFIG.currency,
      timezone: APP_CONFIG.timezone,
      email: '',
      website: ''
   });

   const [schedule, setSchedule] = useState([
      { day: 'Monday', active: true, start: '09:00', end: '17:00' },
      { day: 'Tuesday', active: true, start: '09:00', end: '17:00' },
      { day: 'Wednesday', active: true, start: '10:00', end: '18:00' },
      { day: 'Thursday', active: true, start: '09:00', end: '17:00' },
      { day: 'Friday', active: true, start: '09:00', end: '15:00' },
      { day: 'Saturday', active: false, start: '10:00', end: '14:00' },
      { day: 'Sunday', active: false, start: '00:00', end: '00:00' },
   ]);

   const [integrations, setIntegrations] = useState({
      makeWebhook: '',
      googleCalendar: true,
      stripe: false,
      zoom: false
   });

   // Cabin/Room Configuration for Overbooking Control
   const [capacity, setCapacity] = useState({
      maxConcurrentAppointments: 1,
      cabinNames: ['Cabina Principale']
   });

   // Logo Upload
   const [logoUrl, setLogoUrl] = useState<string>('');
   const [isUploadingLogo, setIsUploadingLogo] = useState(false);
   const logoInputRef = useRef<HTMLInputElement>(null);

   // --- LOAD FROM SUPABASE ---
   useEffect(() => {
      const loadSettings = async () => {
         setIsLoading(true);
         try {
            const settings = await settingsService.getSettings();
            setGeneral({
               businessName: settings.businessName,
               taxId: settings.taxId,
               address: settings.address,
               currency: settings.currency,
               timezone: settings.timezone,
               email: settings.email,
               website: settings.website
            });
            setSchedule(settings.schedule);
            setIntegrations({
               makeWebhook: settings.makeWebhook,
               googleCalendar: settings.googleCalendarEnabled,
               stripe: settings.stripeEnabled,
               zoom: settings.zoomEnabled
            });
            setCapacity({
               maxConcurrentAppointments: settings.maxConcurrentAppointments,
               cabinNames: settings.cabinNames
            });
            setLogoUrl(settings.logoUrl || '');
            setIsCloudConnected(isSupabaseConfigured());
            console.log('[Settings] ✅ Settings loaded');
         } catch (error) {
            console.error('[Settings] ❌ Failed to load settings:', error);
         }
         setIsLoading(false);
      };
      loadSettings();
   }, []);

   const handleSave = async () => {
      setIsSaving(true);
      try {
         await settingsService.saveSettings({
            businessName: general.businessName,
            logoUrl: logoUrl,
            taxId: general.taxId,
            address: general.address,
            currency: general.currency,
            timezone: general.timezone,
            email: general.email,
            website: general.website,
            schedule: schedule,
            makeWebhook: integrations.makeWebhook,
            googleCalendarEnabled: integrations.googleCalendar,
            stripeEnabled: integrations.stripe,
            zoomEnabled: integrations.zoom,
            maxConcurrentAppointments: capacity.maxConcurrentAppointments,
            cabinNames: capacity.cabinNames
         });

         // Refresh global branding context
         await refreshBusinessSettings();

         setIsSaved(true);
         setTimeout(() => setIsSaved(false), 3000);
         console.log('[Settings] ☁️ Settings saved to Supabase');
      } catch (error) {
         console.error('[Settings] ❌ Failed to save settings:', error);
         alert('Errore nel salvataggio. Riprova.');
      }
      setIsSaving(false);
   };

   const toggleDay = (index: number) => {
      const newSchedule = [...schedule];
      newSchedule[index].active = !newSchedule[index].active;
      setSchedule(newSchedule);
   };

   // Handle logo upload
   const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsUploadingLogo(true);
      try {
         const url = await storageService.uploadLogo(file);
         setLogoUrl(url);
         // Save logo URL to settings
         await settingsService.saveSettings({
            ...general,
            logoUrl: url,
            schedule: schedule,
            makeWebhook: '',
            googleCalendarEnabled: integrations.googleCalendar,
            stripeEnabled: integrations.stripe,
            zoomEnabled: integrations.zoom,
            maxConcurrentAppointments: capacity.maxConcurrentAppointments,
            cabinNames: capacity.cabinNames
         });

         // Refresh global branding context immediately
         await refreshBusinessSettings();

         console.log('[Settings] ☁️ Logo uploaded and saved');
      } catch (error: any) {
         console.error('[Settings] ❌ Logo upload failed:', error);
         alert(error.message || 'Upload fallito. Riprova.');
      } finally {
         setIsUploadingLogo(false);
      }
   };

   return (
      <div className="w-full max-w-[1600px] space-y-8 pb-10">

         {/* Header */}
         <div className="flex flex-col sm:flex-row justify-between items-end gap-4 bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
            <div>
               <h1 className="text-3xl font-serif font-bold text-stone-800">{t('settings.title')}</h1>
               <p className="text-stone-500 mt-1">{t('settings.subtitle')}</p>
            </div>
            <button
               onClick={handleSave}
               className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg ${isSaved
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-stone-800 text-white hover:bg-stone-700 shadow-stone-200'
                  }`}
            >
               {isSaved ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
               {isSaved ? t('settings.saved') : t('settings.save')}
            </button>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
               <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                  <button
                     onClick={() => setActiveTab('General')}
                     className={`w-full text-left px-6 py-4 flex items-center gap-3 font-medium transition-colors border-b border-stone-50 ${activeTab === 'General' ? 'bg-gold-50 text-gold-700 border-l-4 border-l-gold-500' : 'text-stone-600 hover:bg-stone-50'
                        }`}
                  >
                     <Building className="w-5 h-5" /> {t('settings.tabs.general')}
                  </button>
                  <button
                     onClick={() => setActiveTab('Schedule')}
                     className={`w-full text-left px-6 py-4 flex items-center gap-3 font-medium transition-colors border-b border-stone-50 ${activeTab === 'Schedule' ? 'bg-gold-50 text-gold-700 border-l-4 border-l-gold-500' : 'text-stone-600 hover:bg-stone-50'
                        }`}
                  >
                     <Clock className="w-5 h-5" /> {t('settings.tabs.schedule')}
                  </button>
                  <button
                     onClick={() => setActiveTab('Integrations')}
                     className={`w-full text-left px-6 py-4 flex items-center gap-3 font-medium transition-colors ${activeTab === 'Integrations' ? 'bg-gold-50 text-gold-700 border-l-4 border-l-gold-500' : 'text-stone-600 hover:bg-stone-50'
                        }`}
                  >
                     <LinkIcon className="w-5 h-5" /> {t('settings.tabs.integrations')}
                  </button>
               </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-6">

               {/* --- GENERAL TAB --- */}
               {activeTab === 'General' && (
                  <div className="bg-white p-8 rounded-2xl border border-stone-100 shadow-sm animate-in fade-in duration-300">
                     <h2 className="font-serif font-bold text-xl text-stone-800 mb-6">Business Profile</h2>

                     <div className="space-y-6">
                        {/* Logo Upload */}
                        <div className="flex items-center gap-6">
                           <div
                              onClick={() => logoInputRef.current?.click()}
                              className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center border-2 border-dashed border-stone-300 cursor-pointer hover:border-gold-400 hover:bg-gold-50/30 transition-all overflow-hidden relative group"
                           >
                              {isUploadingLogo ? (
                                 <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
                              ) : logoUrl ? (
                                 <>
                                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                       <Upload className="w-6 h-6 text-white" />
                                    </div>
                                 </>
                              ) : (
                                 <Upload className="w-8 h-8 text-stone-400 group-hover:text-gold-500 transition-colors" />
                              )}
                           </div>
                           <div>
                              <button
                                 onClick={() => logoInputRef.current?.click()}
                                 className="text-sm font-bold text-gold-600 hover:underline mb-1"
                              >
                                 {logoUrl ? 'Cambia Logo' : 'Carica Logo'}
                              </button>
                              <p className="text-xs text-stone-400">Consigliato: 400x400px PNG. Max 2MB.</p>
                              {logoUrl && (
                                 <p className="text-[10px] text-emerald-600 flex items-center gap-1 mt-1">
                                    <Cloud className="w-3 h-3" /> Salvato su cloud
                                 </p>
                              )}
                           </div>
                           <input
                              ref={logoInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="hidden"
                           />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-xs font-bold uppercase text-stone-500">Business Name</label>
                              <input
                                 value={general.businessName} onChange={e => setGeneral({ ...general, businessName: e.target.value })}
                                 className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-gold-400 text-stone-800"
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-xs font-bold uppercase text-stone-500">Tax ID / VAT</label>
                              <input
                                 value={general.taxId} onChange={e => setGeneral({ ...general, taxId: e.target.value })}
                                 className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-gold-400 text-stone-800"
                                 placeholder="Optional"
                              />
                           </div>
                           <div className="space-y-2 md:col-span-2">
                              <label className="text-xs font-bold uppercase text-stone-500">Full Address</label>
                              <input
                                 value={general.address} onChange={e => setGeneral({ ...general, address: e.target.value })}
                                 className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-gold-400 text-stone-800"
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-xs font-bold uppercase text-stone-500">Currency</label>
                              <select
                                 value={general.currency} onChange={e => setGeneral({ ...general, currency: e.target.value })}
                                 className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-gold-400 text-stone-800"
                              >
                                 <option>EUR (€)</option>
                                 <option>USD ($)</option>
                                 <option>GBP (£)</option>
                              </select>
                           </div>
                           <div className="space-y-2">
                              <label className="text-xs font-bold uppercase text-stone-500">Timezone</label>
                              <select
                                 value={general.timezone} onChange={e => setGeneral({ ...general, timezone: e.target.value })}
                                 className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-gold-400 text-stone-800"
                              >
                                 <option value="Europe/Rome">GMT+1 (Rome)</option>
                                 <option value="Europe/London">GMT+0 (London)</option>
                                 <option value="America/New_York">GMT-5 (New York)</option>
                                 <option value="America/Los_Angeles">GMT-8 (Los Angeles)</option>
                              </select>
                           </div>
                        </div>

                        <div className="pt-6 border-t border-stone-100">
                           <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                              <Globe className="w-4 h-4 text-gold-500" /> Public Contact
                           </h3>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                 <label className="text-xs font-bold uppercase text-stone-500">Support Email</label>
                                 <input
                                    value={general.email} onChange={e => setGeneral({ ...general, email: e.target.value })}
                                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-gold-400 text-stone-800"
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-xs font-bold uppercase text-stone-500">Website URL</label>
                                 <input
                                    value={general.website} onChange={e => setGeneral({ ...general, website: e.target.value })}
                                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-gold-400 text-stone-800"
                                 />
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {/* --- SCHEDULE TAB --- */}
               {activeTab === 'Schedule' && (
                  <div className="bg-white p-8 rounded-2xl border border-stone-100 shadow-sm animate-in fade-in duration-300">
                     <div className="flex justify-between items-center mb-6">
                        <h2 className="font-serif font-bold text-xl text-stone-800">Working Hours</h2>
                        <span className="text-xs text-stone-400">Set your standard availability for bookings.</span>
                     </div>

                     <div className="space-y-4">
                        {schedule.map((day, idx) => (
                           <div key={day.day} className={`flex items-center justify-between p-4 rounded-xl border ${day.active ? 'border-stone-200 bg-white' : 'border-stone-100 bg-stone-50/50'}`}>
                              <div className="flex items-center gap-4">
                                 <button
                                    onClick={() => toggleDay(idx)}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${day.active ? 'bg-gold-500' : 'bg-stone-300'}`}
                                 >
                                    <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${day.active ? 'translate-x-6' : 'translate-x-0'}`} />
                                 </button>
                                 <span className={`font-bold w-24 ${day.active ? 'text-stone-800' : 'text-stone-400'}`}>{day.day}</span>
                              </div>

                              {day.active ? (
                                 <div className="flex items-center gap-3">
                                    <input
                                       type="time" value={day.start}
                                       onChange={(e) => {
                                          const newSched = [...schedule];
                                          newSched[idx].start = e.target.value;
                                          setSchedule(newSched);
                                       }}
                                       className="p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:border-gold-400 text-stone-700 font-mono"
                                    />
                                    <span className="text-stone-400 text-sm">to</span>
                                    <input
                                       type="time" value={day.end}
                                       onChange={(e) => {
                                          const newSched = [...schedule];
                                          newSched[idx].end = e.target.value;
                                          setSchedule(newSched);
                                       }}
                                       className="p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:border-gold-400 text-stone-700 font-mono"
                                    />
                                 </div>
                              ) : (
                                 <span className="text-sm text-stone-400 italic pr-4">Unavailable</span>
                              )}
                           </div>
                        ))}
                     </div>

                     {/* Capacity Configuration */}
                     <div className="mt-8 pt-6 border-t border-stone-100">
                        <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                           <Building className="w-4 h-4 text-gold-500" />
                           Capacità Stanze / Cabine
                        </h3>
                        <p className="text-sm text-stone-500 mb-4">
                           Imposta quanti appuntamenti puoi gestire contemporaneamente. Se lavori da solo con una sola stanza, lascia 1.
                        </p>
                        <div className="flex items-center gap-6">
                           <div className="flex items-center gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                              <button
                                 onClick={() => setCapacity(prev => ({ ...prev, maxConcurrentAppointments: Math.max(1, prev.maxConcurrentAppointments - 1) }))}
                                 className="w-10 h-10 bg-white rounded-xl border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors font-bold text-xl"
                              >
                                 −
                              </button>
                              <div className="text-center min-w-[80px]">
                                 <span className="text-3xl font-black text-stone-800 font-mono">{capacity.maxConcurrentAppointments}</span>
                                 <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mt-1">
                                    {capacity.maxConcurrentAppointments === 1 ? 'Cabina' : 'Cabine'}
                                 </p>
                              </div>
                              <button
                                 onClick={() => setCapacity(prev => ({ ...prev, maxConcurrentAppointments: Math.min(10, prev.maxConcurrentAppointments + 1) }))}
                                 className="w-10 h-10 bg-stone-800 rounded-xl flex items-center justify-center text-white hover:bg-stone-700 transition-colors font-bold text-xl shadow-lg"
                              >
                                 +
                              </button>
                           </div>
                           <div className="text-sm">
                              {capacity.maxConcurrentAppointments === 1 ? (
                                 <span className="text-amber-600 font-bold flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" /> Overbooking Bloccato
                                 </span>
                              ) : (
                                 <span className="text-emerald-600 font-bold flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" /> Max {capacity.maxConcurrentAppointments} appuntamenti/ora
                                 </span>
                              )}
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {/* --- INTEGRATIONS TAB --- */}
               {activeTab === 'Integrations' && (
                  <div className="space-y-6 animate-in fade-in duration-300">

                     {/* Supabase Cloud Status */}
                     <div className="bg-white p-8 rounded-2xl border border-stone-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                           <Cloud className="w-32 h-32" />
                        </div>
                        <div className="relative z-10">
                           <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                 <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                    <Cloud className="w-6 h-6" />
                                 </div>
                                 <h2 className="font-serif font-bold text-xl text-stone-800">Supabase Cloud</h2>
                              </div>
                              {isCloudConnected ? (
                                 <span className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Connesso
                                 </span>
                              ) : (
                                 <span className="text-xs font-bold bg-red-100 text-red-600 px-3 py-1 rounded-full flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> Non Configurato
                                 </span>
                              )}
                           </div>
                           <p className="text-stone-500 text-sm mb-4 max-w-lg">
                              Tutti i tuoi dati sono sincronizzati automaticamente con Supabase. Database PostgreSQL, autenticazione e storage file inclusi.
                           </p>
                           <div className="flex gap-4">
                              <div className="bg-stone-50 p-3 rounded-xl text-center flex-1">
                                 <p className="text-xs text-stone-400 uppercase font-bold">Database</p>
                                 <p className="text-emerald-600 font-bold mt-1">✓ PostgreSQL</p>
                              </div>
                              <div className="bg-stone-50 p-3 rounded-xl text-center flex-1">
                                 <p className="text-xs text-stone-400 uppercase font-bold">Auth</p>
                                 <p className="text-emerald-600 font-bold mt-1">✓ Supabase Auth</p>
                              </div>
                              <div className="bg-stone-50 p-3 rounded-xl text-center flex-1">
                                 <p className="text-xs text-stone-400 uppercase font-bold">Storage</p>
                                 <p className="text-emerald-600 font-bold mt-1">✓ Cloud Files</p>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Other Connectors */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Calendar className="w-5 h-5" /></div>
                              <div>
                                 <h3 className="font-bold text-stone-800">Google Calendar</h3>
                                 <p className="text-xs text-stone-400">2-way Sync</p>
                              </div>
                           </div>
                           <button
                              onClick={() => setIntegrations({ ...integrations, googleCalendar: !integrations.googleCalendar })}
                              className={`w-10 h-5 rounded-full transition-colors relative ${integrations.googleCalendar ? 'bg-green-500' : 'bg-stone-300'}`}
                           >
                              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${integrations.googleCalendar ? 'translate-x-5' : 'translate-x-0'}`} />
                           </button>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><CreditCard className="w-5 h-5" /></div>
                              <div>
                                 <h3 className="font-bold text-stone-800">Stripe Payments</h3>
                                 <p className="text-xs text-stone-400">Invoicing & Checkout</p>
                              </div>
                           </div>
                           <button
                              onClick={() => setIntegrations({ ...integrations, stripe: !integrations.stripe })}
                              className={`w-10 h-5 rounded-full transition-colors relative ${integrations.stripe ? 'bg-green-500' : 'bg-stone-300'}`}
                           >
                              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${integrations.stripe ? 'translate-x-5' : 'translate-x-0'}`} />
                           </button>
                        </div>
                     </div>
                  </div>
               )}

            </div>
         </div>
      </div>
   );
};
