
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Plus, X, User,
  Calendar as CalendarIcon, CheckCircle2, Sparkles,
  Briefcase, Filter, LayoutGrid, Clock, Euro,
  Info, Mail, Phone, CalendarCheck, Loader2,
  BrainCircuit, Flower2, Heart, Music, Dumbbell, Star,
  Zap, BookOpen, Layers
} from 'lucide-react';
import { Session, SessionStatus, Program, Client, VaultCategory } from '../types';
import { validateEmail } from '../utils/validation';
import { usePrograms } from '../contexts/ProgramContext';
import { useUI } from '../contexts/UIContext';
import { isSupabaseConfigured } from '../services/supabaseClient';
import * as sessionService from '../services/sessionService';
import * as clientService from '../services/clientService';
import * as transactionService from '../services/transactionService';
import { LUMINA_COLORS } from '../constants';

const ICON_MAP: Record<string, any> = {
  BrainCircuit, Flower2, Heart, Music, Dumbbell, Star, Zap, BookOpen, Layers, Briefcase, Sparkles
};

// Helper for time slots
const timeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

interface GridSession extends Omit<Partial<Session>, 'type' | 'date'> {
  id: string;
  date: Date; // Actual Date object for easier logic
  duration: number; // in hours
  title: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  type: '1:1' | 'Group' | 'Holistic' | string;
  category: string; // Dynamic category
  status: SessionStatus;
  notes?: string;
  price?: number; // Added price for Make.com integration
  programId?: string;
}

export const CalendarView: React.FC = () => {
  const { programs, categories } = usePrograms();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [filter, setFilter] = useState<string>('All');

  // Load real clients from cache or Supabase
  const [availableClients, setAvailableClients] = useState<Partial<Client>[]>([]);

  React.useEffect(() => {
    const loadClients = async () => {
      // Try Supabase first if configured
      if (isSupabaseConfigured()) {
        try {
          const supabaseClients = await clientService.getClients();
          if (supabaseClients.length > 0) {
            setAvailableClients(supabaseClients);
            console.log('[Calendar] ☁️ Loaded', supabaseClients.length, 'clients from Supabase for booking');
            return;
          }
        } catch (error) {
          console.error('[Calendar] ❌ Error loading clients from Supabase:', error);
        }
      }

      // Fallback to cache
      const cachedClients = localStorage.getItem('lumina_clients_cache');
      if (cachedClients) {
        try {
          const parsed = JSON.parse(cachedClients);
          setAvailableClients(parsed);
          console.log('[Calendar] 💾 Loaded clients from cache for booking');
        } catch (e) {
          console.warn('[Calendar] ⚠️ Failed to parse cached clients');
        }
      }
    };

    loadClients();
  }, []);

  // Panel & Editing State
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingSession, setEditingSession] = useState<GridSession | null>(null);
  const [formData, setFormData] = useState<Partial<GridSession>>({
    title: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    duration: 1,
    type: '1:1',
    category: 'Coaching',
    status: SessionStatus.SCHEDULED,
    notes: '',
    price: 0
  });

  // Load real sessions from Google Sheets (with cache fallback)
  const [sessions, setSessions] = useState<GridSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  React.useEffect(() => {
    const loadSessions = async () => {
      setIsLoadingSessions(true);

      try {
        // Try Supabase first if configured
        if (isSupabaseConfigured()) {
          console.log('[Calendar] ☁️ Loading sessions from Supabase...');
          const supabaseSessions = await sessionService.getSessions();

          if (supabaseSessions.length > 0) {
            // Convert Session to GridSession format
            const gridSessions: GridSession[] = supabaseSessions.map(s => ({
              id: s.id,
              date: new Date(s.date),
              title: s.programName || s.clientName,
              clientName: s.clientName,
              clientEmail: s.clientEmail,
              clientPhone: s.clientPhone,
              duration: 1, // Default 1 hour
              type: s.type || '1:1',
              category: s.category || 'Coaching',
              status: s.status,
              notes: s.notes,
              programId: s.programId
            }));
            setSessions(gridSessions);
            localStorage.setItem('lumina_sessions_cache', JSON.stringify(gridSessions));
            console.log(`[Calendar] ✅ Loaded ${gridSessions.length} sessions from Supabase`);
            setIsLoadingSessions(false);
            return;
          }
        }

        // Fallback to cache
        const cachedSessions = localStorage.getItem('lumina_sessions_cache');
        if (cachedSessions) {
          try {
            const parsed = JSON.parse(cachedSessions);
            const sessionsWithDates = parsed.map((s: any) => ({
              ...s,
              date: new Date(s.date)
            }));
            setSessions(sessionsWithDates);
            console.log('[Calendar] 💾 Loaded sessions from cache');
          } catch (e) {
            console.warn('[Calendar] ⚠️ Failed to parse cached sessions');
          }
        }

        // Note: Google Sheets fallback removed - using Supabase only
        if (!isSupabaseConfigured()) {
          console.log('[Calendar] 💡 Using local cache only - Supabase not configured');
        }
      } catch (error) {
        console.error('[Calendar] ❌ Error loading sessions:', error);
      }

      setIsLoadingSessions(false);
    };

    loadSessions();
  }, []);

  // --- FILTER LOGIC ---
  const filteredSessions = useMemo(() => {
    if (filter === 'All') return sessions;
    return sessions.filter(s => s.category === filter);
  }, [sessions, filter]);

  // --- NAVIGATION HANDLERS ---
  const handleNavigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => setCurrentDate(new Date());

  // --- HELPERS FOR VIEWS ---
  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(new Date(d));
    }
    return days;
  };

  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);

    // Calculate start padding
    const startDayIndex = (firstDay.getDay() + 6) % 7; // Mon=0
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - startDayIndex);

    const days = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      days.push({
        date: d,
        isCurrentMonth: d.getMonth() === month,
        isToday: d.toDateString() === new Date().toDateString()
      });
    }
    return days;
  };

  // --- MODAL HANDLERS ---
  const handleSlotClick = (date: Date, hour: number) => {
    const newDate = new Date(date);
    newDate.setHours(hour, 0, 0, 0);

    setEditingSession(null);
    setFormData({
      title: '', clientName: '', clientEmail: '', clientPhone: '', duration: 1, type: '1:1', category: 'Coaching', status: SessionStatus.SCHEDULED, notes: '', price: 0,
      date: newDate
    });
    setIsPanelOpen(true);
  };

  const handleSessionClick = (e: React.MouseEvent, session: GridSession) => {
    e.stopPropagation();
    setEditingSession(session);
    setFormData(session);
    setIsPanelOpen(true);
  };

  const handleServiceSelect = (serviceId: string) => {
    const service = programs.find(s => s.id === serviceId); // Use context programs
    if (service) {
      setFormData(prev => ({
        ...prev,
        programId: service.id,
        title: service.title,
        duration: service.durationMinutes / 60,
        price: service.price,
        type: service.category === 'Holistic' ? 'Holistic' : (service.type === 'Group Workshop' ? 'Group' : '1:1'),
        category: service.category === 'Holistic' ? 'Holistic' : (service.type === 'Group Workshop' ? 'Group' : 'Coaching')
      }));
    }
  };

  const handleClientSelect = (clientId: string) => {
    console.log('[Calendar] Client selected:', clientId);
    console.log('[Calendar] Available clients:', availableClients);
    const client = availableClients.find(c => c.id === clientId);
    if (client) {
      console.log('[Calendar] Found client:', client);
      setFormData(prev => ({
        ...prev,
        selectedClientId: clientId, // Store the client ID for Supabase
        clientName: `${client.firstName || ''} ${client.lastName || ''}`.trim() || client.email || 'Unknown',
        clientEmail: client.email,
        clientPhone: client.phone
      }));
    } else {
      console.warn('[Calendar] Client not found for ID:', clientId);
    }
  };

  // Check for overbooking based on configured capacity (from Supabase)
  const [maxConcurrentAppointmentsCache, setMaxConcurrentAppointmentsCache] = React.useState(1);

  React.useEffect(() => {
    const loadCapacity = async () => {
      try {
        // Dynamic import to avoid circular dependencies
        const settingsService = await import('../services/settingsService');
        const max = await settingsService.getMaxConcurrentAppointments();
        setMaxConcurrentAppointmentsCache(max);
        console.log('[Calendar] ☁️ Loaded max concurrent appointments:', max);
      } catch (e) {
        console.warn('[Calendar] ⚠️ Could not load capacity, using default 1');
      }
    };
    loadCapacity();
  }, []);

  const isTimeSlotOccupied = (date: Date, hour: number, excludeSessionId?: string): boolean => {
    const dateStr = date.toDateString();

    // Count how many sessions are already at this time slot
    const concurrentCount = sessions.filter(session => {
      if (excludeSessionId && session.id === excludeSessionId) return false;
      const sessionDate = new Date(session.date);
      return sessionDate.toDateString() === dateStr && sessionDate.getHours() === hour;
    }).length;

    // If we've reached the max concurrent appointments, slot is occupied
    return concurrentCount >= maxConcurrentAppointmentsCache;
  };

  const handleSaveSession = async () => {
    // Validazione email cliente
    if (formData.clientEmail && !validateEmail(formData.clientEmail)) {
      alert('Email cliente non valida. Google Calendar non potrà inviare l\'invito.');
      return;
    }

    // Validazione campi obbligatori
    if (!formData.title || !formData.clientName) {
      alert('Titolo sessione e Cliente sono obbligatori');
      return;
    }

    // Check for overbooking based on configured capacity (from Supabase)
    const sessionDate = formData.date || new Date();
    const sessionHour = sessionDate.getHours();

    if (isTimeSlotOccupied(sessionDate, sessionHour, editingSession?.id)) {
      alert(`⚠️ Questo orario ha raggiunto il limite massimo!\n\nHai configurato ${maxConcurrentAppointmentsCache} ${maxConcurrentAppointmentsCache === 1 ? 'cabina' : 'cabine'}.\nSeleziona un orario diverso o modifica le impostazioni in Settings → Schedule.`);
      return;
    }

    setIsSaving(true);

    try {
      let savedSession: GridSession;

      // Try Supabase first if configured
      if (isSupabaseConfigured()) {
        // Prepare session for Supabase
        const sessionData = {
          clientId: (formData as any).selectedClientId || '', // Use selected client ID
          clientName: formData.clientName || '',
          clientEmail: formData.clientEmail,
          clientPhone: formData.clientPhone,
          programId: formData.programId || '',
          programName: formData.title || '',
          date: (formData.date || new Date()).toISOString(),
          status: SessionStatus.SCHEDULED,
          notes: formData.notes,
          type: formData.type || '1:1'
        };

        const created = await sessionService.createSession(sessionData);
        console.log('[Calendar] ☁️ Session saved to Supabase');

        // Update client stats in Supabase if a client was selected
        const selectedClientId = (formData as any).selectedClientId;
        if (selectedClientId) {
          try {
            // Get current client data
            const currentClient = availableClients.find(c => c.id === selectedClientId);
            if (currentClient) {
              const newTotalSessions = (currentClient.totalSessions || 0) + 1;
              const newTotalSpend = (currentClient.totalSpend || 0) + (formData.price || 0);
              const newLoyaltyPoints = (currentClient.loyaltyPoints || 0) + 100; // +100 points per session

              await clientService.updateClient(selectedClientId, {
                totalSessions: newTotalSessions,
                totalSpend: newTotalSpend,
                loyaltyPoints: newLoyaltyPoints,
                lastSession: (formData.date || new Date()).toISOString()
              });
              console.log('[Calendar] ✅ Client stats updated in Supabase');

              // Update local cache
              const updatedClient = {
                ...currentClient,
                totalSessions: newTotalSessions,
                totalSpend: newTotalSpend,
                loyaltyPoints: newLoyaltyPoints
              };
              setAvailableClients(prev => prev.map(c => c.id === selectedClientId ? updatedClient : c));
            }
          } catch (statsError) {
            console.warn('[Calendar] ⚠️ Could not update client stats:', statsError);
          }
        }

        // Create income transaction for Finance section
        if (formData.price && formData.price > 0) {
          try {
            await transactionService.createTransaction({
              type: 'Income' as any,
              amount: formData.price,
              category: formData.category || 'Coaching',
              description: `${formData.title || 'Sessione'} - ${formData.clientName || 'Cliente'}`,
              date: (formData.date || new Date()).toISOString().split('T')[0],
              paymentMethod: 'Credit Card' as any,
              status: 'Pending' as any
            });
            console.log('[Calendar] 💰 Income transaction created in Finance');
          } catch (txError) {
            console.warn('[Calendar] ⚠️ Could not create transaction:', txError);
          }
        }

        // Convert back to GridSession
        savedSession = {
          id: created.id,
          date: new Date(created.date),
          title: formData.title || '',
          clientName: created.clientName,
          clientEmail: created.clientEmail,
          clientPhone: created.clientPhone,
          duration: formData.duration || 1,
          type: formData.type || '1:1',
          category: formData.category || 'Coaching',
          status: created.status,
          notes: created.notes,
          price: formData.price,
          programId: created.programId
        };
      } else {
        // Save locally only without Supabase
        savedSession = {
          id: Math.random().toString(36).substr(2, 9),
          date: formData.date || new Date(),
          title: formData.title || '',
          clientName: formData.clientName || '',
          clientEmail: formData.clientEmail,
          clientPhone: formData.clientPhone,
          duration: formData.duration || 1,
          type: formData.type || '1:1',
          category: formData.category || 'Coaching',
          status: formData.status || SessionStatus.SCHEDULED,
          notes: formData.notes,
          price: formData.price,
          programId: formData.programId
        };
        console.log('[Calendar] 💾 Session saved locally');
      }

      // Add to local state
      const updatedSessions = [...sessions, savedSession];
      setSessions(updatedSessions);

      // Save to cache
      localStorage.setItem('lumina_sessions_cache', JSON.stringify(updatedSessions));
      console.log('[Calendar] ✅ Session saved and cached');

      // Close panel and notify user
      setIsPanelOpen(false);
      alert(`Sessione confermata e salvata!`);
    } catch (error) {
      console.error('[Calendar] ❌ Error saving session:', error);
      alert('❌ Errore nel salvataggio della sessione. Riprova.');
    } finally {
      setIsSaving(false);
    }
  };

  const getSessionStyle = (categoryName: string) => {
    if (categoryName === 'Holistic' || categoryName === 'Olistico')
      return 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-xl shadow-emerald-900/5';
    if (categoryName === 'Group' || categoryName === 'Gruppo')
      return 'bg-stone-800 border-stone-700 text-white shadow-xl shadow-black/10';

    // Default: Royal Gold
    return 'bg-gradient-to-br from-[#F9F5F0] to-[#F1E9DE] border-[#E5D5BC] text-[#5C4D37] shadow-xl shadow-[#D4A853]/10';
  };

  const weekDays = getWeekDays(currentDate);
  const monthDays = getMonthDays(currentDate);

  return (
    <div className="h-full relative flex flex-col bg-[#FDFCFB] rounded-[2rem] shadow-2xl shadow-stone-200/50 border border-stone-100 overflow-hidden font-sans">

      {/* --- ROYAL HEADER --- */}
      <div className="p-8 md:p-10 border-b border-stone-100/50 bg-white/40 backdrop-blur-md flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold-500/80">
            <CalendarIcon className="w-3 h-3" />
            <span>Agenda Imperiale</span>
          </div>
          <h2 className="text-4xl font-serif font-black text-stone-900 tracking-tight capitalize">
            {currentDate.toLocaleString('it-IT', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex bg-stone-100/50 p-1 rounded-full border border-stone-200/50">
              <button
                className="p-1.5 hover:bg-white hover:shadow-sm rounded-full text-stone-500 transition-all"
                onClick={() => handleNavigate('prev')}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={goToToday}
                className="px-4 text-[10px] font-black uppercase tracking-widest text-stone-600 hover:text-gold-600 transition-colors"
              >
                Oggi
              </button>
              <button
                className="p-1.5 hover:bg-white hover:shadow-sm rounded-full text-stone-500 transition-all"
                onClick={() => handleNavigate('next')}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="h-4 w-px bg-stone-200" />
            <span className="text-xs font-medium text-stone-400">
              {viewMode === 'week' ? 'Vista Settimanale' : 'Vista Mensile'}
            </span>
          </div>
        </div>

        {/* --- CONTROLS: VIEW MODE & FILTER --- */}
        <div className="flex flex-col sm:flex-row gap-6 w-full xl:w-auto items-center">

          {/* Dynamic Filters based on Vault Categories */}
          <div className="flex bg-stone-100/50 p-1.5 rounded-2xl border border-stone-200/50 overflow-x-auto no-scrollbar max-w-full">
            <button
              onClick={() => setFilter('All')}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${filter === 'All'
                ? 'bg-white shadow-lg text-stone-900'
                : 'text-stone-400 hover:text-stone-600'
                }`}
            >
              Tutti
            </button>
            {categories.map(cat => {
              const Icon = ICON_MAP[cat.iconName] || Briefcase;
              return (
                <button
                  key={cat.id}
                  onClick={() => setFilter(cat.name)}
                  className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${filter === cat.name
                    ? 'bg-white shadow-lg text-gold-600'
                    : 'text-stone-400 hover:text-stone-600'
                    }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cat.name}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-stone-100/50 p-1 rounded-xl border border-stone-200/50">
              <button
                onClick={() => setViewMode('month')}
                className={`p-2.5 rounded-lg transition-all ${viewMode === 'month' ? 'bg-white shadow-md text-gold-600' : 'text-stone-400 hover:text-stone-600'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`p-2.5 rounded-lg transition-all ${viewMode === 'week' ? 'bg-white shadow-md text-gold-600' : 'text-stone-400 hover:text-stone-600'}`}
              >
                <Clock className="w-4 h-4" />
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSlotClick(new Date(), 9)}
              className="bg-stone-900 text-white px-8 py-3.5 rounded-2xl hover:bg-stone-800 shadow-2xl shadow-stone-300 transition-all flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em]"
            >
              <Plus className="w-4 h-4 text-gold-400" />
              <span>Nuovo</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* --- BODY: VIEWS --- */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-stone-50/30">

        {/* WEEK VIEW - ROYAL LIST DESIGN */}
        {viewMode === 'week' && (
          <div className="p-6 md:p-8">
            {/* Week Days as Cards */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {weekDays.map((day, dayIndex) => {
                const isToday = day.toDateString() === new Date().toDateString();
                const daySessions = filteredSessions
                  .filter(s => s.date.toDateString() === day.toDateString())
                  .sort((a, b) => a.date.getTime() - b.date.getTime());

                return (
                  <motion.div
                    key={dayIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: dayIndex * 0.05 }}
                    className={`bg-white rounded-3xl border-2 overflow-hidden shadow-lg transition-all ${isToday
                      ? 'border-amber-300 shadow-amber-100/50 ring-4 ring-amber-50'
                      : 'border-stone-100 hover:border-stone-200 hover:shadow-xl'
                      }`}
                  >
                    {/* Day Header */}
                    <div
                      onClick={() => handleSlotClick(day, 9)}
                      className={`p-4 border-b-2 cursor-pointer transition-all ${isToday
                        ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-100'
                        : 'bg-stone-50/50 border-stone-100 hover:bg-stone-100/50'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isToday ? 'text-amber-600' : 'text-stone-400'}`}>
                            {day.toLocaleDateString('it-IT', { weekday: 'long' })}
                          </p>
                          <p className={`text-3xl font-serif font-black mt-0.5 ${isToday ? 'text-amber-700' : 'text-stone-800'}`}>
                            {day.getDate()}
                          </p>
                        </div>
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${isToday ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                          }`}>
                          <Plus className="w-5 h-5" />
                        </div>
                      </div>
                      {daySessions.length > 0 && (
                        <div className={`mt-2 text-[10px] font-bold uppercase tracking-widest ${isToday ? 'text-amber-500' : 'text-stone-400'}`}>
                          {daySessions.length} {daySessions.length === 1 ? 'appuntamento' : 'appuntamenti'}
                        </div>
                      )}
                    </div>

                    {/* Sessions List */}
                    <div className="p-3 space-y-2 min-h-[200px] bg-gradient-to-b from-white to-stone-50/30">
                      {daySessions.length === 0 ? (
                        <div
                          onClick={() => handleSlotClick(day, 9)}
                          className="h-full min-h-[180px] flex flex-col items-center justify-center text-stone-300 cursor-pointer hover:text-stone-400 transition-colors group"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mb-3 group-hover:bg-stone-200 transition-colors">
                            <CalendarIcon className="w-5 h-5" />
                          </div>
                          <p className="text-[10px] font-bold uppercase tracking-widest">Libero</p>
                        </div>
                      ) : (
                        <AnimatePresence>
                          {daySessions.map((session, idx) => (
                            <motion.div
                              key={session.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              onClick={(e) => handleSessionClick(e, session)}
                              className="group cursor-pointer"
                            >
                              <div className={`p-4 rounded-2xl border-2 transition-all hover:shadow-lg ${session.category === 'Holistic' || session.category === 'Olistico'
                                ? 'bg-emerald-50 border-emerald-100 hover:border-emerald-200'
                                : session.category === 'Group' || session.category === 'Gruppo'
                                  ? 'bg-stone-800 border-stone-700 text-white'
                                  : 'bg-gradient-to-r from-[#FBF8F4] to-[#F5EFE6] border-[#E8DCC8] hover:border-amber-300'
                                }`}>
                                {/* Time Badge */}
                                <div className="flex items-center gap-2 mb-2">
                                  <div className={`px-2.5 py-1 rounded-lg text-[11px] font-black font-mono tracking-tight ${session.category === 'Group' || session.category === 'Gruppo'
                                    ? 'bg-white/10 text-white/80'
                                    : 'bg-stone-900 text-white'
                                    }`}>
                                    {session.date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                  {session.price && (
                                    <span className={`text-[10px] font-black ${session.category === 'Group' || session.category === 'Gruppo' ? 'text-white/60' : 'text-amber-600'
                                      }`}>
                                      €{session.price}
                                    </span>
                                  )}
                                </div>

                                {/* Title */}
                                <h4 className={`text-sm font-black uppercase tracking-tight leading-tight mb-1.5 ${session.category === 'Group' || session.category === 'Gruppo' ? 'text-white' : 'text-stone-800'
                                  }`}>
                                  {session.title}
                                </h4>

                                {/* Client */}
                                <div className="flex items-center gap-2">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${session.category === 'Group' || session.category === 'Gruppo'
                                    ? 'bg-white/10'
                                    : 'bg-stone-200/50'
                                    }`}>
                                    <User className={`w-3 h-3 ${session.category === 'Group' || session.category === 'Gruppo' ? 'text-white/60' : 'text-stone-400'
                                      }`} />
                                  </div>
                                  <span className={`text-xs font-semibold ${session.category === 'Group' || session.category === 'Gruppo' ? 'text-white/70' : 'text-stone-500'
                                    }`}>
                                    {session.clientName}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* MONTH VIEW */}
        {viewMode === 'month' && (
          <div className="flex-1 min-w-[600px] overflow-x-auto p-8">
            <div className="grid grid-cols-7 gap-4 bg-stone-100/30 p-4 rounded-[2.5rem] border border-stone-200/50 backdrop-blur-xl">
              {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(day => (
                <div key={day} className="p-3 text-center text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">
                  {day}
                </div>
              ))}

              {monthDays.map((dayObj, idx) => {
                const daySessions = filteredSessions.filter(s => s.date.toDateString() === dayObj.date.toDateString());

                return (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.02, y: -2 }}
                    onClick={() => handleSlotClick(dayObj.date, 9)}
                    className={`bg-white/60 min-h-[140px] p-4 rounded-3xl border transition-all cursor-pointer group relative overflow-hidden ${!dayObj.isCurrentMonth ? 'opacity-20 bg-stone-50/50 grayscale' : 'border-stone-100 shadow-sm hover:shadow-xl hover:border-gold-200 hover:bg-white'
                      }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-sm font-black w-8 h-8 flex items-center justify-center rounded-xl transition-all ${dayObj.isToday
                        ? 'bg-stone-900 text-gold-400 shadow-xl shadow-stone-200'
                        : dayObj.isCurrentMonth ? 'text-stone-700 bg-stone-50' : 'text-stone-300'
                        }`}>
                        {dayObj.date.getDate()}
                      </span>
                      <button className="opacity-0 group-hover:opacity-100 p-1.5 bg-gold-50 text-gold-600 rounded-lg transition-all hover:bg-gold-100">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {daySessions.slice(0, 3).map(s => (
                        <div
                          key={s.id}
                          onClick={(e) => handleSessionClick(e, s)}
                          className={`text-[10px] px-3 py-2 rounded-xl border border-black/5 truncate font-black uppercase tracking-tighter shadow-sm flex items-center gap-2 ${getSessionStyle(s.category)}`}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-current opacity-40" />
                          <span className="opacity-60 tabular-nums">{s.date.getHours()}:00</span>
                          {s.clientName}
                        </div>
                      ))}
                      {daySessions.length > 3 && (
                        <div className="text-[10px] text-stone-400 font-black pl-2 flex items-center gap-1.5 uppercase tracking-widest">
                          <Plus className="w-3 h-3" /> {daySessions.length - 3} Altri asset
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* --- LUXURY SLIDE OVER PANEL (Add/Edit) --- */}
      <AnimatePresence>
        {isPanelOpen && (
          <>
            {/* Backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-stone-900/40 backdrop-blur-md z-[100]"
              onClick={() => setIsPanelOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 right-0 w-full md:w-[480px] bg-white/95 backdrop-blur-2xl shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-[101] border-l border-white/20 flex flex-col overflow-hidden"
            >
              {/* Decorative Header Gradient */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-gold-400 via-amber-200 to-gold-600 shadow-sm" />

              {/* Header */}
              <div className="p-10 pb-6 flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gold-600">
                    <Sparkles className="w-3 h-3" />
                    <span>Dettagli Sessione</span>
                  </div>
                  <h3 className="font-serif font-black text-3xl text-stone-900 leading-tight">
                    {editingSession ? 'Modifica' : 'Nuova'} <br />Prenotazione
                  </h3>
                  {formData.date && (
                    <div className="flex items-center gap-2 text-stone-400 text-xs font-medium pt-2">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      <span className="capitalize">{formData.date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setIsPanelOpen(false)}
                  className="p-3 rounded-2xl bg-stone-50 text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-all group"
                >
                  <X className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </button>
              </div>

              {/* Form - Scrollable */}
              <div className="flex-1 overflow-y-auto px-10 pb-10 space-y-8 custom-scrollbar">

                {/* Service Selector - Luxury Card Style */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-2 ml-1">
                    <Briefcase className="w-3 h-3" /> Tipo di Servizio
                  </label>
                  <div className="relative group">
                    <select
                      value={formData.programId || ''}
                      onChange={(e) => handleServiceSelect(e.target.value)}
                      className="w-full p-5 bg-stone-50 border-2 border-stone-100 hover:border-gold-200 rounded-[1.5rem] outline-none text-stone-900 font-bold transition-all cursor-pointer shadow-inner appearance-none focus:bg-white focus:ring-4 focus:ring-gold-50"
                    >
                      <option value="">Scegli dal tuo Vault...</option>
                      {programs.map(s => <option key={s.id} value={s.id}>{s.title} • €{s.price}</option>)}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400 group-hover:text-gold-500 transition-colors">
                      <ChevronRight className="w-5 h-5 rotate-90" />
                    </div>
                  </div>

                  {/* Selected Service Card */}
                  <AnimatePresence>
                    {formData.programId && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-6 rounded-[2rem] border-2 flex items-center gap-5 shadow-xl relative overflow-hidden ${formData.category === 'Holistic' || formData.category === 'Olistico'
                          ? 'bg-emerald-50/50 border-emerald-100 text-emerald-900 shadow-emerald-100/30'
                          : 'bg-gold-50/50 border-gold-100 text-gold-900 shadow-gold-100/30'
                          }`}
                      >
                        <div className={`p-4 rounded-2xl ${formData.category === 'Holistic' || formData.category === 'Olistico' ? 'bg-emerald-100' : 'bg-gold-100'}`}>
                          {ICON_MAP[categories.find(c => c.name === formData.category)?.iconName || ''] ?
                            React.createElement(ICON_MAP[categories.find(c => c.name === formData.category)?.iconName || ''], { className: "w-6 h-6" }) :
                            <Sparkles className="w-6 h-6" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-black uppercase tracking-widest opacity-50 mb-1">{formData.category}</p>
                          <h4 className="text-lg font-black leading-tight truncate">{formData.title}</h4>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="flex items-center gap-1.5 text-xs font-bold opacity-60">
                              <Clock className="w-3.5 h-3.5" /> {formData.duration}h
                            </span>
                            <div className="w-1 h-1 rounded-full bg-current opacity-20" />
                            <span className="text-sm font-black text-stone-900">€{formData.price}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Patient / Client Selection */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-2 ml-1">
                    <User className="w-3 h-3" /> Cliente dell'Impero
                  </label>
                  <select
                    onChange={(e) => handleClientSelect(e.target.value)}
                    className="w-full p-5 bg-stone-50 border-2 border-stone-100 rounded-[1.5rem] outline-none text-stone-900 font-bold focus:border-gold-200 focus:bg-white transition-all cursor-pointer shadow-inner appearance-none"
                    defaultValue=""
                  >
                    {formData.clientName ? (
                      <option>{formData.clientName}</option>
                    ) : (
                      <option value="" disabled>Cerca cliente...</option>
                    )}
                    {availableClients.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                  </select>

                  {/* Contact Pills */}
                  <AnimatePresence>
                    {(formData.clientEmail || formData.clientPhone) && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-wrap gap-2 pt-1"
                      >
                        {formData.clientEmail && (
                          <div className="flex items-center gap-2 bg-stone-100 px-4 py-2 rounded-full text-[10px] font-bold text-stone-600 border border-stone-200">
                            <Mail className="w-3 h-3" /> {formData.clientEmail}
                          </div>
                        )}
                        {formData.clientPhone && (
                          <div className="flex items-center gap-2 bg-stone-100 px-4 py-2 rounded-full text-[10px] font-bold text-stone-600 border border-stone-200">
                            <Phone className="w-3 h-3" /> {formData.clientPhone}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Time & Notes */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Ora Inizio</label>
                    <select
                      value={formData.date ? formData.date.getHours() : 9}
                      onChange={(e) => {
                        const d = new Date(formData.date || new Date());
                        d.setHours(parseInt(e.target.value));
                        setFormData({ ...formData, date: d });
                      }}
                      className="w-full p-5 bg-stone-50 border-2 border-stone-100 rounded-[1.5rem] outline-none text-stone-900 font-black shadow-inner"
                    >
                      {timeSlots.map(t => (
                        <option key={t} value={parseInt(t.split(':')[0])}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Status</label>
                    <div className="w-full p-5 bg-stone-50 border-2 border-stone-100 rounded-[1.5rem] text-stone-900 font-bold flex items-center gap-2 opacity-60">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Confermata
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Note Private</label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full p-6 bg-stone-50 border-2 border-stone-100 rounded-[1.5rem] outline-none text-stone-700 font-medium focus:border-gold-200 focus:bg-white transition-all min-h-[120px] shadow-inner"
                    placeholder="Dettagli sulla sessione, obiettivi, focus..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-10 bg-white border-t border-stone-100 flex gap-4">
                <button
                  onClick={() => setIsPanelOpen(false)}
                  className="flex-1 py-4 px-6 border-2 border-stone-100 rounded-2xl text-xs font-black uppercase tracking-widest text-stone-400 hover:bg-stone-50 transition-all font-sans"
                >
                  Annulla
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveSession}
                  disabled={isSaving}
                  className="flex-[2] py-4 px-6 bg-stone-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-stone-200 flex items-center justify-center gap-3 font-sans"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CalendarCheck className="w-4 h-4 text-gold-400" />
                  )}
                  <span>{editingSession ? 'Salva Modifiche' : 'Conferma Appuntamento'}</span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
