
import React, { useState, useRef } from 'react';
import { Search, Plus, Star, ArrowLeft, Mail, Phone, Calendar, Target, PenTool, CheckCircle2, FileText, Clock, X, UserPlus, TrendingUp, AlertCircle, Sparkles, Gift, Send, LayoutList, Grid, RefreshCw, MessageCircle, Briefcase, MapPin, Instagram, Globe, Cake, Edit2, ChevronRight, Euro, Upload, Paperclip, Music, Video, Repeat, Trash2, Eye, Smartphone, Camera, Loader2 } from 'lucide-react';
import { Client, SessionStatus, ClientTask, ClientDocument, ClientGoal } from '../types';
import { useNavigate } from 'react-router-dom';
import { syncClient, triggerFullSync, sendPromo, syncSession, syncTransaction, syncTask, fetchClientsFromSheets, syncBookingBatch } from '../services/integrationService';
import { validateEmail, validatePhone } from '../utils/validation';
import { useLanguage } from '../contexts/LanguageContext';
import { usePrograms } from '../contexts/ProgramContext';
import { isSupabaseConfigured } from '../services/supabaseClient';
import * as clientService from '../services/clientService';
import * as sessionService from '../services/sessionService';
import * as transactionService from '../services/transactionService';

const mockClientsData: Client[] = [
    {
        id: '101',
        firstName: 'Sophia',
        lastName: 'Loren',
        email: 'sophia@example.com',
        phone: '+1 555-0101',
        profession: 'Actress & Entrepreneur',
        instagram: '@sophialoren_legacy',
        source: 'Referral',
        birthday: '1980-09-20',
        address: 'Via dei Condotti 10, Roma',
        lastSession: '2023-10-20',
        loyaltyPoints: 1250,
        isVIP: true,
        notes: 'Working on self-worth blocks.',
        sessionNotes: [
            { date: '2023-10-20', text: 'Breakthrough moment regarding childhood memory. Assigned inner child meditation.' },
            { date: '2023-10-10', text: 'Initial intake. High anxiety reported.' }
        ],
        avatar: 'https://picsum.photos/seed/101/200',
        goals: [
            { id: 'g1', title: 'Daily Meditation Habit', status: 'Achieved', targetDate: '2023-09-01', category: 'Mindset' },
            { id: 'g2', title: 'Career Pivot Clarity', status: 'In Progress', targetDate: '2023-12-01', category: 'Business' }
        ],
        tasks: [
            { id: 't1', title: 'Journal on "What brings me joy?"', isCompleted: false, type: 'Journaling', dueDate: '2023-10-28', description: 'Write 3 pages every morning.' },
            { id: 't2', title: 'Listen to "Release" Audio', isCompleted: true, type: 'Meditation', attachment: { type: 'Audio', name: 'Release_Meditation.mp3', url: '#' } }
        ],
        documents: [
            { id: 'd1', name: 'Coaching_Agreement_Signed.pdf', type: 'PDF', url: '#', date: '2023-10-12' },
            { id: 'd2', name: 'Intake_Form.pdf', type: 'PDF', url: '#', date: '2023-10-01' }
        ],
        totalSpend: 4500,
        totalSessions: 12
    },
    {
        id: '102',
        firstName: 'James',
        lastName: 'Bond',
        email: '007@example.com',
        phone: '+1 555-0007',
        profession: 'Security Consultant',
        source: 'Google',
        lastSession: '2023-08-15', // Older date to simulate "At Risk"
        loyaltyPoints: 500,
        isVIP: false,
        notes: 'Stress management focus.',
        sessionNotes: [],
        avatar: 'https://picsum.photos/seed/102/200',
        goals: [
            { id: 'g3', title: 'Reduce Anxiety', status: 'In Progress', targetDate: '2023-11-15', category: 'Health' }
        ],
        tasks: [],
        documents: [],
        totalSpend: 850,
        totalSessions: 3
    },
];

export const Clients: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { programs } = usePrograms();

    // State for clients loaded from Google Sheets
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoadingClients, setIsLoadingClients] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'integration'>('overview');

    // View Mode: 'grid' (Visual Cards) or 'list' (Address Book/Rubrica)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

    // Analytics Filter State
    const [filterType, setFilterType] = useState<'all' | 'vip' | 'risk' | 'new'>('all');

    // Modal State for Create/Edit
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);

    // State for the form within the modal
    const [formTab, setFormTab] = useState<'personal' | 'contact' | 'details'>('personal');
    const [formData, setFormData] = useState<Partial<Client>>({
        firstName: '', lastName: '', email: '', phone: '', profession: '', birthday: '', instagram: '', address: '', source: 'Referral', totalSpend: 0, totalSessions: 0, loyaltyPoints: 0
    });

    // Promo/Gift Modal
    const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
    const [promoClient, setPromoClient] = useState<Client | null>(null);
    const [promoData, setPromoData] = useState({
        offer: 'Gift',
        message: '',
        channel: 'Email' as 'Email' | 'WhatsApp',
        attachmentName: ''
    });

    // Booking Modal
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [bookingData, setBookingData] = useState({
        programId: '',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        createInvoice: true
    });

    // GOAL MODAL STATE
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [newGoalData, setNewGoalData] = useState<Partial<ClientGoal>>({
        title: '',
        category: 'Business',
        status: 'In Progress',
        targetDate: ''
    });

    // Interaction States (Goals, Notes, Tasks)
    const [noteText, setNoteText] = useState('');

    // --- TASK CREATION STATE ---
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [newTaskData, setNewTaskData] = useState<Partial<ClientTask>>({
        title: '',
        description: '',
        type: 'Action',
        dueDate: '',
        frequency: 'Once',
        attachment: undefined
    });

    const attachmentInputRef = useRef<HTMLInputElement>(null);
    const giftAttachmentRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    // Client Sessions History
    const [clientSessions, setClientSessions] = useState<any[]>([]);

    // --- SESSION MANAGEMENT MODAL STATE ---
    const [rescheduleModal, setRescheduleModal] = useState<{
        isOpen: boolean;
        session: any | null;
        newDate: string;
        newTime: string;
    }>({ isOpen: false, session: null, newDate: '', newTime: '' });

    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        session: any | null;
    }>({ isOpen: false, session: null });

    // Load clients from Google Sheets on mount
    React.useEffect(() => {
        console.log('[Lumina] 🔄 useEffect triggered - loadClients starting');

        const loadClients = async () => {
            setIsLoadingClients(true);

            try {
                // Try Supabase first if configured
                if (isSupabaseConfigured()) {
                    console.log('[Lumina] ☁️ Loading clients from Supabase...');
                    const supabaseClients = await clientService.getClients();

                    if (supabaseClients.length > 0) {
                        setClients(supabaseClients);
                        localStorage.setItem('lumina_clients_cache', JSON.stringify(supabaseClients));
                        console.log(`[Lumina] ✅ Loaded ${supabaseClients.length} clients from Supabase`);
                        setIsLoadingClients(false);
                        return;
                    }
                }

                // Fallback to cache
                const cachedClients = localStorage.getItem('lumina_clients_cache');
                if (cachedClients) {
                    try {
                        const parsed = JSON.parse(cachedClients);
                        setClients(parsed);
                        console.log('[Lumina] 💾 Loaded clients from cache');
                    } catch (e) {
                        console.warn('[Lumina] ⚠️ Failed to parse cached clients');
                    }
                }

                // Fallback to Google Sheets
                console.log('[Lumina] 📞 Loading clients from Google Sheets (fallback)...');
                const sheetsClients = await fetchClientsFromSheets();

                if (sheetsClients.length > 0) {
                    const mappedClients = sheetsClients.map((row: any) => {
                        const getValue = (key: string, index: string) => {
                            return row[key] !== undefined ? row[key] : row[index];
                        };

                        return {
                            id: getValue('id', '0') || String(Math.random()),
                            firstName: getValue('firstName', '1') || '',
                            lastName: getValue('lastName', '2') || '',
                            email: getValue('email', '3') || '',
                            phone: getValue('phone', '4') || '',
                            profession: getValue('profession', '5') || '',
                            birthday: getValue('birthday', '6') || '',
                            address: getValue('address', '7') || '',
                            instagram: getValue('instagram', '8') || '',
                            source: getValue('source', '9') || 'Unknown',
                            lastSession: getValue('lastSession', '10') || '',
                            loyaltyPoints: Number(getValue('loyaltyPoints', '14')) || 0,
                            isVIP: String(getValue('isVIP', '15')).toUpperCase() === 'TRUE',
                            notes: getValue('notes', '16') || '',
                            avatar: getValue('avatar', '17') || `https://ui-avatars.com/api/?name=${getValue('firstName', '1')}+${getValue('lastName', '2')}&background=random`,
                            totalSpend: Number(getValue('totalSpend', '12')) || 0,
                            totalSessions: Number(getValue('totalSessions', '13')) || 0,
                            sessionNotes: [],
                            goals: [],
                            tasks: [],
                            documents: []
                        };
                    });
                    setClients(mappedClients);
                    localStorage.setItem('lumina_clients_cache', JSON.stringify(mappedClients));
                    console.log(`[Lumina] ✅ Loaded ${mappedClients.length} clients from Google Sheets`);
                } else if (!cachedClients) {
                    console.warn('⚠️ No clients found');
                }
            } catch (error) {
                console.error('[Lumina] ❌ Error loading clients:', error);
            }

            setIsLoadingClients(false);
        };

        loadClients();
    }, []);

    // Load sessions for selected client
    React.useEffect(() => {
        const loadClientSessions = async () => {
            if (!selectedClient) {
                setClientSessions([]);
                return;
            }

            try {
                // Get all sessions from cache or Supabase
                if (isSupabaseConfigured()) {
                    const allSessions = await sessionService.getSessionsByClient(selectedClient.id);
                    setClientSessions(allSessions);
                    console.log(`[Clients] 📅 Loaded ${allSessions.length} sessions for client ${selectedClient.firstName}`);
                } else {
                    // Fallback to cache
                    const cachedSessions = localStorage.getItem('lumina_sessions_cache');
                    if (cachedSessions) {
                        const allSessions = JSON.parse(cachedSessions);
                        const clientSessions = allSessions.filter((s: any) =>
                            s.clientName === `${selectedClient.firstName} ${selectedClient.lastName}` ||
                            s.clientEmail === selectedClient.email
                        );
                        setClientSessions(clientSessions);
                    }
                }
            } catch (error) {
                console.error('[Clients] ❌ Error loading client sessions:', error);
                setClientSessions([]);
            }
        };

        loadClientSessions();
    }, [selectedClient]);

    // Filter Logic
    const getFilteredClients = () => {
        let result = clients;

        // 1. Text Search
        if (searchTerm) {
            result = result.filter(c =>
                c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (c.profession && c.profession.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // 2. Category Filter
        if (filterType === 'vip') {
            result = result.filter(c => c.isVIP);
        } else if (filterType === 'risk') {
            result = result.filter(c => c.lastSession < '2023-09-01');
        } else if (filterType === 'new') {
            result = result.filter(c => c.totalSessions <= 2);
        }

        return result;
    };

    const filteredClients = getFilteredClients();

    // --- HELPER FOR PROFILE COMPLETENESS ---
    const calculateProfileCompleteness = (client: Client) => {
        let score = 0;
        let total = 7; // Name, Email, Phone, Profession, Birthday, Instagram, Address

        if (client.firstName && client.lastName) score++;
        if (client.email) score++;
        if (client.phone) score++;
        if (client.profession) score++;
        if (client.birthday) score++;
        if (client.instagram) score++;
        if (client.address) score++;

        return Math.round((score / total) * 100);
    }

    // --- HANDLERS ---

    const handleOpenCreateModal = () => {
        setEditingClient(null);
        setFormData({ firstName: '', lastName: '', email: '', phone: '', profession: '', birthday: '', instagram: '', address: '', source: 'Referral', totalSpend: 0, totalSessions: 0, loyaltyPoints: 0 });
        setFormTab('personal');
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (client: Client, specificTab: 'personal' | 'contact' | 'details' = 'personal') => {
        setEditingClient(client);
        setFormData({ ...client });
        setFormTab(specificTab);
        setIsModalOpen(true);
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const objectUrl = URL.createObjectURL(file);
            setFormData({ ...formData, avatar: objectUrl });
        }
    };

    const handleSaveClient = async () => {
        // Validazione campi obbligatori
        if (!formData.firstName || !formData.lastName) {
            alert('Nome e Cognome sono obbligatori');
            return;
        }

        // Validazione email
        if (formData.email && !validateEmail(formData.email)) {
            alert('Email non valida. Inserisci un formato corretto (es: nome@dominio.com)');
            return;
        }

        // Validazione telefono
        if (formData.phone && !validatePhone(formData.phone)) {
            alert('Numero di telefono non valido. Usa formato: +39 333 1234567');
            return;
        }

        setIsSaving(true);

        try {
            let savedClient: Client;

            // Try Supabase first if configured
            if (isSupabaseConfigured()) {
                if (editingClient) {
                    // Update existing in Supabase
                    savedClient = await clientService.updateClient(editingClient.id, formData);
                    console.log('[Lumina] ☁️ Client updated in Supabase');
                } else {
                    // Create new in Supabase
                    const newClientData = {
                        ...formData,
                        lastSession: new Date().toISOString().split('T')[0],
                        loyaltyPoints: 0,
                        isVIP: false,
                        notes: formData.notes || 'New profile created.',
                        sessionNotes: [],
                        goals: [],
                        tasks: [],
                        documents: [],
                        avatar: formData.avatar || `https://ui-avatars.com/api/?name=${formData.firstName}+${formData.lastName}&background=random`,
                        totalSpend: 0,
                        totalSessions: 0
                    } as Omit<Client, 'id'>;

                    savedClient = await clientService.createClient(newClientData);
                    console.log('[Lumina] ☁️ Client created in Supabase');
                }

                // Update state with returned client
                if (editingClient) {
                    setClients(clients.map(c => c.id === editingClient.id ? savedClient : c));
                    if (selectedClient?.id === editingClient.id) {
                        setSelectedClient(savedClient);
                    }
                } else {
                    setClients([savedClient, ...clients]);
                }

                // Update cache
                localStorage.setItem('lumina_clients_cache', JSON.stringify(
                    editingClient
                        ? clients.map(c => c.id === editingClient.id ? savedClient : c)
                        : [savedClient, ...clients]
                ));

                setIsModalOpen(false);
                console.log('[Lumina] ✅ Client saved successfully');
            } else {
                // Fallback to old Make.com/Google Sheets flow
                let updatedClient: Client;
                let newClientsList: Client[];

                if (editingClient) {
                    updatedClient = { ...editingClient, ...formData } as Client;
                    newClientsList = clients.map(c => c.id === editingClient.id ? updatedClient : c);
                    if (selectedClient?.id === updatedClient.id) {
                        setSelectedClient(updatedClient);
                    }
                } else {
                    updatedClient = {
                        id: Math.random().toString(36).substr(2, 9),
                        ...formData as any,
                        lastSession: new Date().toISOString().split('T')[0],
                        loyaltyPoints: 0,
                        isVIP: false,
                        notes: 'New profile created.',
                        sessionNotes: [],
                        goals: [],
                        tasks: [],
                        documents: [],
                        avatar: formData.avatar || `https://ui-avatars.com/api/?name=${formData.firstName}+${formData.lastName}&background=random`,
                        totalSpend: 0,
                        totalSessions: 0
                    };
                    newClientsList = [updatedClient, ...clients];
                }

                setClients(newClientsList);
                localStorage.setItem('lumina_clients_cache', JSON.stringify(newClientsList));
                setIsModalOpen(false);

                // Sync to Make.com
                await syncClient(updatedClient);
                console.log('[Lumina] ✅ Client synced to Make.com');
            }
        } catch (error) {
            console.error('[Lumina] ❌ Failed to save client:', error);
            alert('❌ Errore nel salvataggio. Il cliente è stato salvato localmente.');

            // Save locally anyway
            const localClient: Client = editingClient
                ? { ...editingClient, ...formData } as Client
                : {
                    id: Math.random().toString(36).substr(2, 9),
                    ...formData as any,
                    lastSession: new Date().toISOString().split('T')[0],
                    loyaltyPoints: 0,
                    isVIP: false,
                    notes: 'New profile created.',
                    sessionNotes: [],
                    goals: [],
                    tasks: [],
                    documents: [],
                    avatar: formData.avatar || `https://ui-avatars.com/api/?name=${formData.firstName}+${formData.lastName}&background=random`,
                    totalSpend: 0,
                    totalSessions: 0
                };

            const newList = editingClient
                ? clients.map(c => c.id === editingClient.id ? localClient : c)
                : [localClient, ...clients];

            setClients(newList);
            localStorage.setItem('lumina_clients_cache', JSON.stringify(newList));
            setIsModalOpen(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleOpenBookingModal = () => {
        setBookingData({
            programId: programs[0]?.id || '',
            date: new Date().toISOString().split('T')[0],
            time: '10:00',
            createInvoice: true
        });
        setIsBookingModalOpen(true);
    };

    // --- SESSION MANAGEMENT HANDLERS ---
    // Open reschedule modal
    const handleRescheduleSession = (session: any) => {
        console.log('[Clients] 📅 Opening reschedule modal for session:', session.id);
        const currentDate = new Date(session.date);
        setRescheduleModal({
            isOpen: true,
            session: session,
            newDate: currentDate.toISOString().split('T')[0],
            newTime: currentDate.toTimeString().slice(0, 5)
        });
    };

    // Confirm reschedule action
    const confirmReschedule = async () => {
        if (!rescheduleModal.session) return;
        const { session, newDate, newTime } = rescheduleModal;

        try {
            const [year, month, day] = newDate.split('-').map(Number);
            const [hour, minute] = newTime.split(':').map(Number);
            const dateObj = new Date(year, month - 1, day, hour, minute);

            console.log('[Clients] Checking overbooking for:', dateObj.toISOString());

            // --- OVERBOOKING CHECK ---
            const cachedSessions = localStorage.getItem('lumina_sessions_cache');
            if (cachedSessions) {
                const allSessions = JSON.parse(cachedSessions);
                const conflictingSession = allSessions.find((s: any) => {
                    if (s.id === session.id) return false; // Exclude current session
                    const sDate = new Date(s.date);
                    return (
                        sDate.toDateString() === dateObj.toDateString() &&
                        sDate.getHours() === dateObj.getHours()
                    );
                });

                if (conflictingSession) {
                    alert(`⚠️ SLOT OCCUPATO!\n\nC'è già una sessione prenotata:\n📅 ${dateObj.toLocaleDateString('it-IT')}\n⏰ ${dateObj.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}\n\nScegli un altro orario.`);
                    console.log('[Clients] ❌ Overbooking prevented - slot taken');
                    return;
                }
            }
            // --- END OVERBOOKING CHECK ---

            console.log('[Clients] Rescheduling to:', dateObj.toISOString());

            await sessionService.updateSession(session.id, {
                date: dateObj.toISOString()
            });

            setClientSessions(prev => prev.map(s =>
                s.id === session.id ? { ...s, date: dateObj.toISOString() } : s
            ));

            // Update calendar cache
            if (cachedSessions) {
                const sessions = JSON.parse(cachedSessions);
                const updated = sessions.map((s: any) =>
                    s.id === session.id ? { ...s, date: dateObj } : s
                );
                localStorage.setItem('lumina_sessions_cache', JSON.stringify(updated));
            }

            setRescheduleModal({ isOpen: false, session: null, newDate: '', newTime: '' });
            alert('✅ Sessione riprogrammata!');
        } catch (error) {
            console.error('[Clients] ❌ Error rescheduling:', error);
            alert('❌ Errore. Riprova.');
        }
    };

    // Open delete modal
    const handleCancelSession = (session: any) => {
        console.log('[Clients] 🗑️ Opening delete modal for session:', session.id);
        setDeleteModal({ isOpen: true, session: session });
    };

    // Confirm delete action
    const confirmDeleteSession = async () => {
        if (!deleteModal.session) return;
        const session = deleteModal.session;

        try {
            console.log('[Clients] Deleting session:', session.id);
            await sessionService.deleteSession(session.id);

            setClientSessions(prev => prev.filter(s => s.id !== session.id));

            const cachedSessions = localStorage.getItem('lumina_sessions_cache');
            if (cachedSessions) {
                const sessions = JSON.parse(cachedSessions);
                const updated = sessions.filter((s: any) => s.id !== session.id);
                localStorage.setItem('lumina_sessions_cache', JSON.stringify(updated));
            }

            setDeleteModal({ isOpen: false, session: null });
            alert('🗑️ Sessione eliminata!');
        } catch (error) {
            console.error('[Clients] ❌ Error deleting:', error);
            alert('❌ Errore. Riprova.');
        }
    };

    const handleConfirmSession = async (session: any) => {
        console.log('[Clients] ✓ Confirm clicked for session:', session.id);

        try {
            // Update in Supabase - set to completed/confirmed
            await sessionService.updateSession(session.id, {
                status: 'completed' as any
            });

            // Update local state
            setClientSessions(prev => prev.map(s =>
                s.id === session.id ? { ...s, status: 'completed' } : s
            ));

            // Update calendar cache
            const cachedSessions = localStorage.getItem('lumina_sessions_cache');
            if (cachedSessions) {
                const sessions = JSON.parse(cachedSessions);
                const updated = sessions.map((s: any) =>
                    s.id === session.id ? { ...s, status: 'completed' } : s
                );
                localStorage.setItem('lumina_sessions_cache', JSON.stringify(updated));
            }

            alert('✅ Sessione confermata!');
            console.log('[Clients] ✓ Session confirmed:', session.id);
        } catch (error) {
            console.error('[Clients] ❌ Error confirming session:', error);
            alert('❌ Errore. Riprova.');
        }
    };

    const handleConfirmBooking = async () => {
        if (!selectedClient || !bookingData.programId) return;

        const program = programs.find(p => p.id === bookingData.programId);
        if (!program) return;

        // 1. Update Client Statistics (LTV, Sessions, Points)
        const updatedClient = {
            ...selectedClient,
            totalSessions: selectedClient.totalSessions + 1,
            totalSpend: selectedClient.totalSpend + program.price,
            lastSession: bookingData.date,
            loyaltyPoints: selectedClient.loyaltyPoints + 100
        };

        // Update local state immediately
        setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));
        setSelectedClient(updatedClient);

        const [year, month, day] = bookingData.date.split('-').map(Number);
        const [hour, minute] = bookingData.time.split(':').map(Number);
        const sessionDate = new Date(year, month - 1, day, hour, minute);

        const sessionPayload = {
            title: program.title,
            clientName: `${updatedClient.firstName} ${updatedClient.lastName}`,
            clientEmail: selectedClient.email,
            clientPhone: selectedClient.phone,
            programId: program.id,
            category: program.category,
            date: sessionDate.toISOString(),
            duration: program.durationMinutes / 60,
            price: program.price,
            notes: 'Booked via Client 360 View'
        };

        try {
            // Try Supabase first if configured
            if (isSupabaseConfigured()) {
                console.log('[Clients] ☁️ Saving session to Supabase...');

                // Save session to Supabase
                const supabaseSession = await sessionService.createSession({
                    clientId: selectedClient.id,
                    clientName: `${updatedClient.firstName} ${updatedClient.lastName}`,
                    clientEmail: selectedClient.email,
                    clientPhone: selectedClient.phone,
                    programId: program.id,
                    programName: program.title,
                    date: sessionDate.toISOString(),
                    status: SessionStatus.SCHEDULED,
                    notes: 'Booked via Client 360 View',
                    type: program.category === 'Holistic' ? 'Holistic' : (program.type === 'Group Workshop' ? 'Group' : '1:1')
                });

                console.log('[Clients] ✅ Session saved to Supabase:', supabaseSession.id);

                // Update client stats in Supabase too
                await clientService.updateClient(selectedClient.id, {
                    totalSessions: updatedClient.totalSessions,
                    totalSpend: updatedClient.totalSpend,
                    loyaltyPoints: updatedClient.loyaltyPoints,
                    lastSession: bookingData.date
                });
                console.log('[Clients] ✅ Client stats updated in Supabase');

                // Also update the sessions cache so Calendar reflects the change
                const cachedSessions = localStorage.getItem('lumina_sessions_cache');
                const sessions = cachedSessions ? JSON.parse(cachedSessions) : [];
                sessions.push({
                    id: supabaseSession.id,
                    date: sessionDate,
                    title: program.title,
                    clientName: `${updatedClient.firstName} ${updatedClient.lastName}`,
                    clientEmail: selectedClient.email,
                    clientPhone: selectedClient.phone,
                    duration: program.durationMinutes / 60,
                    type: program.category === 'Holistic' ? 'Holistic' : '1:1',
                    category: program.category,
                    status: SessionStatus.SCHEDULED,
                    notes: 'Booked via Client 360 View',
                    price: program.price,
                    programId: program.id
                });
                localStorage.setItem('lumina_sessions_cache', JSON.stringify(sessions));

                // Also update clients cache
                const cachedClients = localStorage.getItem('lumina_clients_cache');
                if (cachedClients) {
                    const clientsList = JSON.parse(cachedClients);
                    const updatedClients = clientsList.map((c: any) =>
                        c.id === updatedClient.id ? updatedClient : c
                    );
                    localStorage.setItem('lumina_clients_cache', JSON.stringify(updatedClients));
                }

                // Refresh client sessions to update the Storico
                const newSession = {
                    id: supabaseSession.id,
                    date: sessionDate.toISOString(),
                    programName: program.title,
                    title: program.title,
                    status: 'scheduled',
                    clientName: `${updatedClient.firstName} ${updatedClient.lastName}`
                };
                setClientSessions(prev => [newSession, ...prev]);

                // Create income transaction in Finance if createInvoice is true
                if (bookingData.createInvoice) {
                    try {
                        await transactionService.createTransaction({
                            type: 'Income' as any,
                            amount: program.price,
                            category: program.category,
                            description: `${program.title} - ${updatedClient.firstName} ${updatedClient.lastName}`,
                            date: bookingData.date,
                            paymentMethod: 'Credit Card' as any,
                            status: 'Pending' as any
                        });
                        console.log('[Clients] 💰 Income transaction created in Finance');
                    } catch (txError) {
                        console.warn('[Clients] ⚠️ Could not create transaction:', txError);
                    }
                }

                setIsBookingModalOpen(false);
                alert("✅ Sessione confermata e salvata! Stats + Finanza aggiornati.");
            } else {
                // Fallback to Make.com batch booking
                console.log('[Clients] 🚀 Booking session via Make.com batch API...');

                await syncBookingBatch({
                    session: {
                        ...sessionPayload,
                        programId: program.id
                    },
                    transaction: bookingData.createInvoice ? {
                        type: 'Income',
                        amount: program.price,
                        category: program.category,
                        description: `${program.title} - ${updatedClient.firstName} ${updatedClient.lastName}`,
                        date: bookingData.date,
                        paymentMethod: 'Credit Card'
                    } : undefined,
                    clientUpdate: {
                        id: updatedClient.id,
                        totalSessions: updatedClient.totalSessions,
                        totalSpend: updatedClient.totalSpend,
                        loyaltyPoints: updatedClient.loyaltyPoints,
                        lastSession: updatedClient.lastSession
                    }
                });

                console.log('[Clients] ✅ Booking complete via Make.com!');
                setIsBookingModalOpen(false);
                alert("✅ Session confirmed! Calendar invite sent, Invoice created, and Client Stats updated!");
            }
        } catch (error) {
            console.error('[Clients] ❌ Booking failed:', error);
            alert("⚠️ Errore nella prenotazione. Controlla la connessione e riprova.");
            setIsBookingModalOpen(false);
        }
    };

    // --- GOAL HANDLERS ---
    const handleOpenGoalModal = () => {
        setNewGoalData({ title: '', category: 'Business', status: 'In Progress', targetDate: '' });
        setIsGoalModalOpen(true);
    };

    const handleSaveGoal = () => {
        if (!selectedClient || !newGoalData.title) return;

        const newGoal: ClientGoal = {
            id: Date.now().toString(),
            title: newGoalData.title,
            status: newGoalData.status as any,
            targetDate: newGoalData.targetDate || 'TBD',
            category: newGoalData.category as any
        };

        const updatedClient = { ...selectedClient, goals: [...(selectedClient.goals || []), newGoal] };
        setSelectedClient(updatedClient);
        setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));

        setIsGoalModalOpen(false);
    };

    const handleDeleteGoal = (goalId: string) => {
        if (!selectedClient) return;
        const updatedClient = { ...selectedClient, goals: (selectedClient.goals || []).filter(g => g.id !== goalId) };
        setSelectedClient(updatedClient);
        setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));
    };

    const handleSaveNote = () => {
        if (!selectedClient || !noteText) return;
        const newNote = { date: new Date().toISOString().split('T')[0], text: noteText };
        const updatedClient = { ...selectedClient, sessionNotes: [newNote, ...(selectedClient.sessionNotes || [])] };
        setSelectedClient(updatedClient);
        setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));
        setNoteText('');
    };

    const handleUploadClick = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && selectedClient) {
            const file = e.target.files[0];
            // Create a real object URL so we can actually "View" the file in the session
            const objectUrl = URL.createObjectURL(file);

            const newDoc: ClientDocument = {
                id: Date.now().toString(),
                name: file.name,
                type: file.name.endsWith('.pdf') ? 'PDF' : 'Image',
                url: objectUrl, // This enables real viewing
                date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
            };
            const updatedClient = { ...selectedClient, documents: [newDoc, ...(selectedClient.documents || [])] };
            setSelectedClient(updatedClient);
            setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));
        }
    };

    const handleViewDocument = (url: string) => {
        if (url && url !== '#') {
            window.open(url, '_blank');
        } else {
            alert("Preview not available for this mock document.");
        }
    };

    const handleDeleteDocument = (docId: string) => {
        if (!selectedClient) return;
        if (confirm('Delete this document?')) {
            const updatedClient = { ...selectedClient, documents: (selectedClient.documents || []).filter(d => d.id !== docId) };
            setSelectedClient(updatedClient);
            setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));
        }
    };

    const handleAddTask = async () => {
        if (!selectedClient || !newTaskData.title) return;

        const newTask: ClientTask = {
            id: Date.now().toString(),
            title: newTaskData.title || '',
            description: newTaskData.description,
            isCompleted: false,
            type: newTaskData.type as any,
            dueDate: newTaskData.dueDate,
            frequency: newTaskData.frequency as any,
            attachment: newTaskData.attachment
        };

        const updatedClient = { ...selectedClient, tasks: [newTask, ...(selectedClient.tasks || [])] };
        setSelectedClient(updatedClient);
        setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));

        setNewTaskData({ title: '', description: '', type: 'Action', dueDate: '', frequency: 'Once', attachment: undefined });
        setIsAddingTask(false);

        await syncTask(newTask);
    };

    const handleAttachFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setNewTaskData({
                ...newTaskData,
                attachment: {
                    name: file.name,
                    type: file.name.endsWith('.pdf') ? 'PDF' : file.name.endsWith('.mp3') ? 'Audio' : 'Link',
                    url: '#'
                }
            });
        }
    };

    const handleOpenGiftModal = (e: React.MouseEvent, client: Client) => {
        e.stopPropagation();
        setPromoClient(client);
        setPromoData({
            offer: 'Gift',
            message: `Hi ${client.firstName}, here is a little gift for you to support your journey!`,
            channel: 'Email',
            attachmentName: ''
        });
        setIsPromoModalOpen(true);
    };

    const handleGiftAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPromoData({ ...promoData, attachmentName: e.target.files[0].name });
        }
    }

    const handleSendGift = async () => {
        if (promoClient) {
            await sendPromo(promoClient, promoData.offer, `${promoData.message} (Via ${promoData.channel}) [Attached: ${promoData.attachmentName}]`);
            alert(`Gift successfully sent to ${promoClient.firstName} via ${promoData.channel}!`);
        }
        setIsPromoModalOpen(false);
    };

    const handleSyncDatabase = async () => {
        await triggerFullSync('CLIENTS', clients);
    };

    // Loading State
    if (isLoadingClients) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader2 className="w-12 h-12 text-gold-500 animate-spin mb-4" />
                <p className="text-stone-600 font-medium">Loading clients from Google Sheets...</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[1600px] pb-10">

            {selectedClient ? (
                // --- DETAIL VIEW (360 VIEW) ---
                <div className="animate-in fade-in duration-300">
                    <button
                        onClick={() => setSelectedClient(null)}
                        className="flex items-center gap-2 text-stone-500 hover:text-gold-600 mb-6 transition-colors font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" /> {t('clients.title')}
                    </button>

                    {/* Client Header Profile */}
                    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 mb-6 relative overflow-hidden">
                        {selectedClient.isVIP && (
                            <div className="absolute top-0 right-0 bg-gold-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-2xl shadow-sm">
                                VIP MEMBER
                            </div>
                        )}

                        <div className="flex flex-col md:flex-row items-start gap-8">
                            <div className="relative group shrink-0">
                                <img
                                    src={selectedClient.avatar}
                                    alt={selectedClient.firstName}
                                    className="w-32 h-32 rounded-2xl object-cover border-4 border-stone-100 shadow-md group-hover:border-gold-200 transition-colors"
                                />
                                <div className="absolute -bottom-3 -right-3 bg-white p-2 rounded-full shadow-md border border-stone-100">
                                    <div className="relative w-8 h-8 flex items-center justify-center">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="16" cy="16" r="14" stroke="#e7e5e4" strokeWidth="3" fill="none" />
                                            <circle cx="16" cy="16" r="14" stroke="#ce9341" strokeWidth="3" fill="none" strokeDasharray="88" strokeDashoffset={88 - (88 * calculateProfileCompleteness(selectedClient) / 100)} />
                                        </svg>
                                        <span className="absolute text-[8px] font-bold text-stone-600">{calculateProfileCompleteness(selectedClient)}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 w-full">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h1 className="text-4xl font-serif font-bold text-stone-800">{selectedClient.firstName} {selectedClient.lastName}</h1>
                                        <div className="flex items-center gap-3 mt-2">
                                            {selectedClient.profession ? (
                                                <p className="text-stone-500 font-medium flex items-center gap-2 bg-stone-50 px-2 py-0.5 rounded-md border border-stone-100">
                                                    <Briefcase className="w-3.5 h-3.5 text-stone-400" /> {selectedClient.profession}
                                                </p>
                                            ) : (
                                                <button onClick={() => handleOpenEditModal(selectedClient, 'personal')} className="text-xs text-gold-600 hover:underline flex items-center gap-1 bg-gold-50 px-2 py-0.5 rounded-md border border-gold-100 border-dashed">
                                                    + Add Profession
                                                </button>
                                            )}
                                            <span className="text-stone-300">|</span>
                                            <p className="text-xs text-stone-400 flex items-center gap-1">
                                                <Sparkles className="w-3 h-3" /> {selectedClient.source || 'Direct'}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleOpenEditModal(selectedClient)}
                                        className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-xs transition-colors cursor-pointer relative z-10"
                                    >
                                        <Edit2 className="w-4 h-4" /> {t('clients.editProfile')}
                                    </button>
                                </div>

                                {/* Info Chips */}
                                <div className="flex flex-wrap gap-3 mt-6">
                                    {selectedClient.email && <div className="flex items-center gap-2 text-stone-600 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-100 text-sm"><Mail className="w-3.5 h-3.5 text-gold-500" /> {selectedClient.email}</div>}
                                    {selectedClient.phone && <div className="flex items-center gap-2 text-stone-600 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-100 text-sm"><Phone className="w-3.5 h-3.5 text-gold-500" /> {selectedClient.phone}</div>}
                                    {selectedClient.birthday && <div className="flex items-center gap-2 text-stone-600 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-100 text-sm"><Cake className="w-3.5 h-3.5 text-gold-500" /> {selectedClient.birthday}</div>}
                                    {selectedClient.instagram && <div className="flex items-center gap-2 text-stone-600 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-100 text-sm cursor-pointer hover:bg-stone-100" onClick={() => window.open(`https://instagram.com/${selectedClient.instagram?.replace('@', '')}`, '_blank')}><Instagram className="w-3.5 h-3.5 text-gold-500" /> {selectedClient.instagram}</div>}
                                </div>

                                <div className="mt-3">
                                    {selectedClient.address ? (
                                        <div className="flex items-center gap-2 text-stone-500 text-sm opacity-80"><MapPin className="w-3.5 h-3.5" /> {selectedClient.address}</div>
                                    ) : (
                                        <button onClick={() => handleOpenEditModal(selectedClient, 'details')} className="text-xs text-stone-400 hover:text-gold-600 flex items-center gap-1 hover:underline"><MapPin className="w-3.5 h-3.5" /> Add Billing Address</button>
                                    )}
                                </div>

                                {/* Financial Snapshot */}
                                <div className="mt-6 flex gap-6 pt-6 border-t border-stone-100">
                                    <div><span className="text-[10px] text-stone-400 uppercase tracking-wider font-bold">Lifetime Value</span><p className="text-xl font-serif font-bold text-stone-800">€{selectedClient.totalSpend.toLocaleString()}</p></div>
                                    <div><span className="text-[10px] text-stone-400 uppercase tracking-wider font-bold">Total Sessions</span><p className="text-xl font-serif font-bold text-stone-800">{selectedClient.totalSessions}</p></div>
                                    <div><span className="text-[10px] text-stone-400 uppercase tracking-wider font-bold">Loyalty Pts</span><p className="text-xl font-serif font-bold text-stone-800">{selectedClient.loyaltyPoints}</p></div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 min-w-[160px] w-full md:w-auto mt-6 md:mt-0">
                                <button onClick={handleOpenBookingModal} className="px-4 py-3 bg-gold-500 text-white rounded-xl hover:bg-gold-600 shadow-lg shadow-gold-200 transition-colors font-bold text-sm flex items-center justify-center gap-2"><Calendar className="w-4 h-4" /> {t('dashboard.bookSession')}</button>
                                <button onClick={(e) => handleOpenGiftModal(e, selectedClient)} className="px-4 py-3 bg-stone-100 text-stone-700 rounded-xl hover:bg-stone-200 transition-colors text-sm font-bold flex items-center justify-center gap-2"><Gift className="w-4 h-4" /> Send Gift</button>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-8 border-b border-stone-200 mb-6">
                        {['Overview', 'Notes', 'Integration'].map((tab) => (
                            <button key={tab} onClick={() => setActiveTab(tab.toLowerCase() as any)} className={`pb-4 px-2 font-medium transition-colors relative ${activeTab === tab.toLowerCase() ? 'text-gold-600' : 'text-stone-400 hover:text-stone-600'}`}>
                                {t(`clients.tabs.${tab.toLowerCase()}`)}
                                {activeTab === tab.toLowerCase() && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gold-500 rounded-t-full"></span>}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-[400px]">
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-2xl border border-stone-100">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-serif font-bold text-xl text-stone-800 flex items-center gap-2"><Target className="w-5 h-5 text-gold-500" /> Goals & Intentions</h3>
                                        <button onClick={handleOpenGoalModal} className="text-xs text-gold-600 hover:underline font-bold">{t('clients.interactions.addGoal')}</button>
                                    </div>

                                    <div className="space-y-3">
                                        {(selectedClient.goals || []).map(goal => (
                                            <div key={goal.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-50 group">
                                                <div className="flex flex-col">
                                                    <span className="text-stone-700 font-medium text-sm">{goal.title}</span>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] text-stone-400 uppercase tracking-wide">{goal.category}</span>
                                                        {goal.targetDate && goal.targetDate !== 'TBD' && <span className="text-[10px] text-stone-400">• {goal.targetDate}</span>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${goal.status === 'Achieved' ? 'bg-green-100 text-green-700' : goal.status === 'Paused' ? 'bg-stone-200 text-stone-600' : 'bg-blue-50 text-blue-700'}`}>{goal.status}</span>
                                                    <button onClick={() => handleDeleteGoal(goal.id)} className="text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3" /></button>
                                                </div>
                                            </div>
                                        ))}
                                        {(!selectedClient.goals || selectedClient.goals.length === 0) && <div className="text-center py-6 border-2 border-dashed border-stone-100 rounded-xl bg-stone-50/50"><Target className="w-8 h-8 text-stone-200 mx-auto mb-2" /><p className="text-stone-400 text-sm italic">No specific goals set yet.</p></div>}
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-stone-100">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-serif font-bold text-xl text-stone-800 flex items-center gap-2"><FileText className="w-5 h-5 text-gold-500" /> {t('clients.interactions.document.title')}</h3>
                                        <button onClick={handleUploadClick} className="text-xs text-gold-600 hover:underline font-bold">{t('clients.interactions.document.upload')}</button>
                                        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
                                    </div>
                                    <ul className="space-y-3">
                                        {selectedClient.documents && selectedClient.documents.length > 0 ? selectedClient.documents.map(doc => (
                                            <li key={doc.id} className="flex items-center gap-3 text-sm text-stone-600 hover:bg-stone-50 p-2 rounded-lg cursor-pointer transition-colors group">
                                                <div className="p-2 bg-blue-50 text-blue-500 rounded-lg group-hover:bg-blue-100 transition-colors"><FileText className="w-4 h-4" /></div>
                                                <span className="flex-1 font-medium">{doc.name}</span>
                                                <span className="text-xs text-stone-400 hidden sm:inline">{doc.date}</span>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleViewDocument(doc.url)} title={t('clients.interactions.document.view')} className="text-stone-400 hover:text-blue-500"><Eye className="w-3.5 h-3.5" /></button>
                                                    <button onClick={() => handleDeleteDocument(doc.id)} title={t('clients.interactions.document.delete')} className="text-stone-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                                                </div>
                                            </li>
                                        )) : (
                                            <div className="text-center py-6 border-2 border-dashed border-stone-100 rounded-xl bg-stone-50/50"><FileText className="w-8 h-8 text-stone-200 mx-auto mb-2" /><p className="text-stone-400 text-sm italic">No documents uploaded.</p></div>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notes' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 space-y-6">
                                    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm relative">
                                        <div className="absolute top-4 right-4 text-xs text-stone-300 font-bold uppercase">Private</div>
                                        <h3 className="font-serif font-bold text-stone-800 mb-4">New Session Note</h3>
                                        <textarea className="w-full h-32 p-4 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:border-gold-400 resize-none text-stone-900 placeholder-stone-400 text-sm leading-relaxed" placeholder={t('clients.interactions.notePlaceholder')} value={noteText} onChange={(e) => setNoteText(e.target.value)}></textarea>
                                        <div className="flex justify-end mt-4"><button onClick={handleSaveNote} disabled={!noteText} className="bg-stone-800 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-stone-700 uppercase tracking-wide disabled:opacity-50">{t('clients.interactions.saveNote')}</button></div>
                                    </div>

                                    {/* Booking History - Premium Interactive */}
                                    <div className="bg-gradient-to-br from-white via-white to-gold-50/20 p-6 rounded-2xl border-2 border-stone-200 shadow-sm">
                                        <h3 className="font-serif font-bold text-stone-800 mb-4 flex items-center gap-2">
                                            <div className="p-2 bg-gold-100 rounded-lg">
                                                <Calendar className="w-5 h-5 text-gold-600" />
                                            </div>
                                            <span>Storico Appuntamenti</span>
                                            <span className="ml-auto text-xs bg-stone-100 text-stone-500 px-2 py-1 rounded-full">{clientSessions.length} sessioni</span>
                                        </h3>
                                        {clientSessions.length > 0 ? (
                                            <div className="space-y-3">
                                                {clientSessions.map((session, idx) => (
                                                    <div
                                                        key={session.id || idx}
                                                        className="group flex items-center justify-between p-4 bg-white rounded-xl border-2 border-stone-100 hover:border-gold-300 hover:shadow-md transition-all cursor-pointer"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={`p-3 rounded-xl ${session.status === 'completed' ? 'bg-gradient-to-br from-green-100 to-emerald-100' :
                                                                session.status === 'cancelled' ? 'bg-gradient-to-br from-red-100 to-rose-100' :
                                                                    'bg-gradient-to-br from-gold-100 to-amber-100'
                                                                }`}>
                                                                <Calendar className={`w-5 h-5 ${session.status === 'completed' ? 'text-green-600' :
                                                                    session.status === 'cancelled' ? 'text-red-600' :
                                                                        'text-gold-600'
                                                                    }`} />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-stone-800">{session.programName || session.title || 'Sessione'}</p>
                                                                <p className="text-xs text-stone-500 mt-0.5">
                                                                    {new Date(session.date).toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                                    {' • '}
                                                                    {new Date(session.date).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Status Badge + Actions */}
                                                        <div className="flex items-center gap-3">
                                                            {/* Action Buttons - Visible on Hover */}
                                                            {session.status !== 'completed' && session.status !== 'cancelled' && (
                                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleRescheduleSession(session);
                                                                        }}
                                                                        className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
                                                                        title="Riprogramma"
                                                                    >
                                                                        <Clock className="w-3 h-3" /> Sposta
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleCancelSession(session);
                                                                        }}
                                                                        className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1"
                                                                        title="Cancella"
                                                                    >
                                                                        <X className="w-3 h-3" /> Cancella
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleConfirmSession(session);
                                                                        }}
                                                                        className="px-3 py-1.5 text-xs font-bold text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors flex items-center gap-1"
                                                                        title="Conferma sessione"
                                                                    >
                                                                        <CheckCircle2 className="w-3 h-3" /> Conferma
                                                                    </button>
                                                                </div>
                                                            )}

                                                            {/* Status Badge */}
                                                            <span className={`text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-wide ${session.status === 'completed' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700' :
                                                                session.status === 'cancelled' ? 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700' :
                                                                    'bg-gradient-to-r from-gold-100 to-amber-100 text-gold-700'
                                                                }`}>
                                                                {session.status === 'completed' ? '✓ Confermata' :
                                                                    session.status === 'cancelled' ? '✗ Cancellata' : '⏰ Programmata'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-10 border-2 border-dashed border-stone-200 rounded-2xl bg-gradient-to-br from-stone-50 to-gold-50/20">
                                                <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                    <Calendar className="w-8 h-8 text-stone-300" />
                                                </div>
                                                <p className="text-stone-500 font-medium">Nessun appuntamento registrato</p>
                                                <p className="text-stone-400 text-sm mt-1">Prenota la prima sessione per questo cliente</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        {(selectedClient.sessionNotes || []).map((note, idx) => (
                                            <div key={idx} className="bg-white p-6 rounded-2xl border border-stone-100 hover:border-gold-100 transition-colors">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2 text-gold-600 text-xs font-bold uppercase tracking-wider"><Clock className="w-3 h-3" /> {note.date}</div>
                                                    <span className="text-[10px] text-stone-300 uppercase font-bold">Session Log</span>
                                                </div>
                                                <p className="text-stone-600 text-sm leading-relaxed">{note.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-gradient-to-b from-gold-50 to-white p-6 rounded-2xl border border-gold-100 h-fit">
                                    <h4 className="font-bold text-gold-800 mb-2 font-serif text-lg">Coach's Cheat Sheet</h4>
                                    <p className="text-xs text-stone-500 mb-4">Quick psychological snapshot.</p>
                                    <div className="space-y-4">
                                        <div><span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Human Design</span><div className="bg-white/60 p-2 rounded-lg text-sm font-medium text-stone-700 border border-gold-100/50">Generator 3/5 (Sacral)</div></div>
                                        <div><span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Learning Style</span><div className="bg-white/60 p-2 rounded-lg text-sm font-medium text-stone-700 border border-gold-100/50">Visual & Somatic</div></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'integration' && (
                            <div className="bg-white p-6 rounded-2xl border border-stone-100">
                                <div className="flex justify-between items-center mb-6">
                                    <div><h3 className="font-serif font-bold text-xl text-stone-800">Integration Tasks (Homework)</h3><p className="text-stone-500 text-sm">Assign practices for between sessions.</p></div>
                                    <button onClick={() => setIsAddingTask(!isAddingTask)} className="flex items-center gap-2 bg-stone-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-stone-700"><Plus className="w-4 h-4" /> {t('clients.interactions.assignTask')}</button>
                                </div>

                                {isAddingTask && (
                                    <div className="mb-6 p-6 bg-stone-50 rounded-xl border border-stone-200 animate-in fade-in slide-in-from-top-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div className="md:col-span-2"><label className="text-xs font-bold uppercase text-stone-500 block mb-1">{t('clients.interactions.task.titleLabel')}</label><input autoFocus value={newTaskData.title} onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })} className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-900 font-medium outline-none focus:border-gold-400" placeholder={t('clients.interactions.taskPlaceholder')} /></div>
                                            <div className="md:col-span-2"><label className="text-xs font-bold uppercase text-stone-500 block mb-1">{t('clients.interactions.task.descLabel')}</label><textarea value={newTaskData.description} onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })} className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-900 outline-none focus:border-gold-400 resize-none h-20" placeholder="Add detailed instructions here..." /></div>
                                            <div><label className="text-xs font-bold uppercase text-stone-500 block mb-1">{t('clients.interactions.task.type')}</label><select value={newTaskData.type} onChange={(e) => setNewTaskData({ ...newTaskData, type: e.target.value as any })} className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-900 outline-none"><option value="Action">Action</option><option value="Journaling">Journaling</option><option value="Meditation">Meditation</option><option value="Reading">Reading</option></select></div>
                                            <div><label className="text-xs font-bold uppercase text-stone-500 block mb-1">{t('clients.interactions.task.frequency')}</label><div className="relative"><Repeat className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" /><select value={newTaskData.frequency} onChange={(e) => setNewTaskData({ ...newTaskData, frequency: e.target.value as any })} className="w-full bg-white border border-stone-200 rounded-lg pl-9 pr-3 py-2 text-sm text-stone-900 outline-none"><option value="Once">Once</option><option value="Daily">Daily</option><option value="Weekly">Weekly</option></select></div></div>
                                            <div><label className="text-xs font-bold uppercase text-stone-500 block mb-1">{t('clients.interactions.task.dueDate')}</label><input type="date" value={newTaskData.dueDate} onChange={(e) => setNewTaskData({ ...newTaskData, dueDate: e.target.value })} className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-900 outline-none" /></div>
                                            <div><label className="text-xs font-bold uppercase text-stone-500 block mb-1">{t('clients.interactions.task.attachment')}</label><div onClick={() => attachmentInputRef.current?.click()} className="w-full bg-white border border-dashed border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-500 cursor-pointer hover:border-gold-400 hover:text-gold-600 transition-colors flex items-center gap-2 truncate">{newTaskData.attachment ? <><span className="font-medium text-stone-900 truncate">{newTaskData.attachment.name}</span></> : <><Paperclip className="w-4 h-4" /><span>Click to attach file...</span></>}<input type="file" ref={attachmentInputRef} className="hidden" onChange={handleAttachFile} /></div></div>
                                        </div>
                                        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-stone-200"><button onClick={() => setIsAddingTask(false)} className="px-4 py-2 text-stone-500 font-bold hover:bg-stone-200 rounded-lg text-xs uppercase tracking-wide">Cancel</button><button onClick={handleAddTask} className="bg-gold-500 text-white px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-gold-600 shadow-md">{t('clients.interactions.task.save')}</button></div>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    {(selectedClient.tasks || []).length > 0 ? selectedClient.tasks.map(task => (
                                        <div key={task.id} className="flex items-start gap-4 p-4 border border-stone-100 rounded-xl hover:border-gold-200 transition-colors group bg-stone-50/30">
                                            <div className={`mt-1 p-2 rounded-full cursor-pointer transition-colors ${task.isCompleted ? 'bg-green-100 text-green-600' : 'bg-white border-2 border-stone-200 text-stone-300 hover:border-gold-400'}`}><CheckCircle2 className="w-5 h-5" /></div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start"><h4 className={`font-bold text-sm ${task.isCompleted ? 'text-stone-400 line-through' : 'text-stone-800'}`}>{task.title}</h4>{task.frequency && task.frequency !== 'Once' && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1"><Repeat className="w-3 h-3" /> {task.frequency}</span>}</div>
                                                {task.description && <p className="text-xs text-stone-500 mt-1">{task.description}</p>}
                                                <div className="flex gap-3 mt-2 items-center"><span className="text-[10px] font-bold uppercase tracking-wide text-stone-500 bg-white px-2 py-0.5 rounded border border-stone-100">{task.type}</span>{task.dueDate && <span className="text-[10px] font-bold uppercase tracking-wide text-red-400 flex items-center gap-1"><Clock className="w-3 h-3" /> Due: {task.dueDate}</span>}{task.attachment && <a href={task.attachment.url} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100 flex items-center gap-1 hover:bg-purple-100 cursor-pointer">{task.attachment.type === 'Audio' ? <Music className="w-3 h-3" /> : <Paperclip className="w-3 h-3" />}{task.attachment.name}</a>}</div>
                                            </div>
                                            <button className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-500 transition-all p-2"><X className="w-4 h-4" /></button>
                                        </div>
                                    )) : !isAddingTask && <div className="text-center py-12 border-2 border-dashed border-stone-100 rounded-xl"><PenTool className="w-8 h-8 text-stone-300 mx-auto mb-2" /><p className="text-stone-400 text-sm font-medium">No active homework assigned.</p></div>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                // --- LIST VIEW (DIRECTORY) ---
                <div className="space-y-6 animate-in fade-in duration-300">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-end gap-6 bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
                        <div>
                            <h1 className="text-3xl font-serif font-bold text-stone-900">{t('clients.title')}</h1>
                            <p className="text-stone-500 mt-1">{t('clients.subtitle')}</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleSyncDatabase} className="text-xs font-bold text-stone-400 hover:text-gold-600 flex items-center gap-1 uppercase tracking-wide"><RefreshCw className="w-3 h-3" /> {t('clients.syncDb')}</button>
                            <button onClick={handleOpenCreateModal} className="bg-stone-800 text-white px-6 py-2.5 rounded-xl hover:bg-stone-700 flex items-center gap-2 transition-colors shadow-lg shadow-stone-200">
                                <UserPlus className="w-5 h-5" />
                                <span>{t('clients.newMember')}</span>
                            </button>
                        </div>
                    </div>

                    {/* Filters & Search */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-stone-100 shadow-sm">
                        <div className="flex gap-2 overflow-x-auto w-full md:w-auto no-scrollbar">
                            {['all', 'vip', 'risk', 'new'].map(f => (
                                <button key={f} onClick={() => setFilterType(f as any)} className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase transition-colors whitespace-nowrap ${filterType === f ? 'bg-gold-500 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}>
                                    {t(`clients.filter.${f}`)}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                <input type="text" placeholder={t('clients.searchPlaceholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-gold-300 transition-all text-stone-800 placeholder-stone-400" />
                            </div>
                            <div className="flex bg-stone-100 p-1 rounded-lg">
                                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-400'}`}><LayoutList className="w-4 h-4" /></button>
                                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-400'}`}><Grid className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>

                    {/* List Content */}
                    {viewMode === 'list' ? (
                        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-stone-50 border-b border-stone-100">
                                    <tr>
                                        <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-wider">{t('clients.table.client')}</th>
                                        <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-wider hidden md:table-cell">{t('clients.table.status')}</th>
                                        <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-wider hidden sm:table-cell">{t('clients.table.lastSession')}</th>
                                        <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-wider text-right">{t('clients.table.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-50">
                                    {filteredClients.map(client => (
                                        <tr key={client.id} onClick={() => setSelectedClient(client)} className="hover:bg-gold-50/10 cursor-pointer group transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={client.avatar} alt={client.firstName} className="w-10 h-10 rounded-full object-cover border border-stone-200" />
                                                    <div>
                                                        <p className="font-bold text-stone-800 text-sm">{client.firstName} {client.lastName}</p>
                                                        <p className="text-xs text-stone-400">{client.profession || client.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 hidden md:table-cell">
                                                <div className="flex gap-2">
                                                    {client.isVIP && <span className="px-2 py-0.5 bg-gold-100 text-gold-700 text-[10px] font-bold uppercase rounded-full">VIP</span>}
                                                    {client.totalSessions < 3 && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded-full">New</span>}
                                                </div>
                                            </td>
                                            <td className="p-4 hidden sm:table-cell text-sm text-stone-500 font-mono">{client.lastSession}</td>
                                            <td className="p-4 text-right">
                                                <button className="p-2 text-stone-400 hover:text-gold-600 hover:bg-stone-100 rounded-full transition-colors"><ChevronRight className="w-4 h-4" /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredClients.length === 0 && <div className="p-12 text-center text-stone-400 text-sm italic">No clients found matching your search.</div>}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredClients.map(client => (
                                <div key={client.id} onClick={() => setSelectedClient(client)} className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden">
                                    {client.isVIP && <div className="absolute top-0 right-0 bg-gold-500 w-16 h-16 transform translate-x-8 -translate-y-8 rotate-45"></div>}
                                    <div className="flex items-center gap-4 mb-4">
                                        <img src={client.avatar} alt={client.firstName} className="w-16 h-16 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                                        <div>
                                            <h3 className="font-serif font-bold text-lg text-stone-800">{client.firstName} {client.lastName}</h3>
                                            <p className="text-xs text-stone-500 font-medium">{client.profession}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-stone-400 border-t border-stone-50 pt-4 mt-2">
                                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {client.email}</span>
                                        <span className="font-bold text-gold-600 group-hover:underline">View Profile</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* --- GLOBAL MODALS --- */}

            {/* GOAL MODAL (NEW) */}
            {isGoalModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50 rounded-t-2xl">
                            <h2 className="font-serif font-bold text-lg text-stone-800">{t('clients.interactions.goal.title')}</h2>
                            <button onClick={() => setIsGoalModalOpen(false)}><X className="w-5 h-5 text-stone-400" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase text-stone-500 block mb-1">{t('clients.interactions.goal.nameLabel')}</label>
                                <input autoFocus value={newGoalData.title} onChange={e => setNewGoalData({ ...newGoalData, title: e.target.value })} className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 outline-none focus:border-gold-400" />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-stone-500 block mb-1">{t('clients.interactions.goal.categoryLabel')}</label>
                                <select value={newGoalData.category} onChange={e => setNewGoalData({ ...newGoalData, category: e.target.value as any })} className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 outline-none">
                                    <option value="Business">Business / Career</option>
                                    <option value="Health">Health / Body</option>
                                    <option value="Mindset">Mindset / Growth</option>
                                    <option value="Soul">Soul / Spiritual</option>
                                    <option value="Relationship">Relationships</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold uppercase text-stone-500 block mb-1">{t('clients.interactions.goal.statusLabel')}</label>
                                    <select value={newGoalData.status} onChange={e => setNewGoalData({ ...newGoalData, status: e.target.value as any })} className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 outline-none">
                                        <option value="In Progress">In Progress</option>
                                        <option value="Achieved">Achieved</option>
                                        <option value="Paused">Paused</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-stone-500 block mb-1">{t('clients.interactions.goal.dateLabel')}</label>
                                    <input type="date" value={newGoalData.targetDate} onChange={e => setNewGoalData({ ...newGoalData, targetDate: e.target.value })} className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 outline-none" />
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-stone-100 flex justify-end gap-2">
                            <button onClick={() => setIsGoalModalOpen(false)} className="px-3 py-1.5 text-xs font-bold text-stone-500 hover:bg-stone-100 rounded-lg uppercase">Cancel</button>
                            <button onClick={handleSaveGoal} disabled={!newGoalData.title} className="px-4 py-1.5 bg-stone-800 text-white text-xs font-bold rounded-lg hover:bg-stone-700 uppercase shadow-md disabled:opacity-50">{t('clients.interactions.goal.save')}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* BOOKING MODAL */}
            {isBookingModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50 rounded-t-2xl">
                            <h2 className="font-serif font-bold text-lg text-stone-800">{t('clients.booking.title')}</h2>
                            <button onClick={() => setIsBookingModalOpen(false)}><X className="w-5 h-5 text-stone-400" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase text-stone-500 block mb-1">{t('clients.booking.selectService')}</label>
                                <select value={bookingData.programId} onChange={(e) => setBookingData({ ...bookingData, programId: e.target.value })} className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:border-gold-400 text-stone-900">
                                    {programs.map(p => <option key={p.id} value={p.id}>{p.title} (€{p.price})</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="text-xs font-bold uppercase text-stone-500 block mb-1">{t('clients.booking.date')}</label><input type="date" value={bookingData.date} onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })} className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900" /></div>
                                <div><label className="text-xs font-bold uppercase text-stone-500 block mb-1">{t('clients.booking.time')}</label><input type="time" value={bookingData.time} onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })} className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900" /></div>
                            </div>
                            <div className="flex items-center gap-2 pt-2"><input type="checkbox" checked={bookingData.createInvoice} onChange={(e) => setBookingData({ ...bookingData, createInvoice: e.target.checked })} className="w-4 h-4 text-gold-500 rounded focus:ring-gold-500 border-gray-300" /><span className="text-sm text-stone-600">{t('clients.booking.invoice')}</span></div>
                        </div>
                        <div className="p-4 bg-stone-50 rounded-b-2xl border-t border-stone-100 flex justify-end gap-2"><button onClick={() => setIsBookingModalOpen(false)} className="px-3 py-1.5 text-xs font-bold text-stone-500 hover:bg-stone-200 rounded-lg uppercase">Cancel</button><button onClick={handleConfirmBooking} className="px-4 py-1.5 bg-gold-500 text-white text-xs font-bold rounded-lg hover:bg-gold-600 uppercase shadow-md">{t('clients.booking.confirm')}</button></div>
                    </div>
                </div>
            )}

            {/* PROMO / GIFT MODAL */}
            {isPromoModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-stone-100 flex items-center gap-3 bg-stone-50 rounded-t-2xl"><Gift className="w-6 h-6 text-gold-500" /><h2 className="font-serif font-bold text-xl text-stone-800">{t('clients.interactions.gift.title')}</h2></div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-stone-500">Sending to: <span className="font-bold text-stone-800">{promoClient?.firstName}</span></p>
                            <div><label className="text-xs font-bold uppercase text-stone-500 block mb-1">{t('clients.interactions.gift.channel')}</label><div className="grid grid-cols-2 gap-2"><button onClick={() => setPromoData({ ...promoData, channel: 'Email' })} className={`p-2 rounded-lg border text-sm font-bold flex items-center justify-center gap-2 ${promoData.channel === 'Email' ? 'border-gold-500 bg-gold-50 text-gold-700' : 'border-stone-200 text-stone-500'}`}><Mail className="w-4 h-4" /> Email</button><button onClick={() => setPromoData({ ...promoData, channel: 'WhatsApp' })} className={`p-2 rounded-lg border text-sm font-bold flex items-center justify-center gap-2 ${promoData.channel === 'WhatsApp' ? 'border-green-500 bg-green-50 text-green-700' : 'border-stone-200 text-stone-500'}`}><Smartphone className="w-4 h-4" /> WhatsApp</button></div></div>
                            <div><label className="text-xs font-bold uppercase text-stone-500 block mb-1">{t('clients.interactions.gift.messageLabel')}</label><textarea value={promoData.message} onChange={e => setPromoData({ ...promoData, message: e.target.value })} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none text-stone-900 h-24 resize-none focus:border-gold-400" /></div>
                            <div><label className="text-xs font-bold uppercase text-stone-500 block mb-1">{t('clients.interactions.gift.attachLabel')}</label><div onClick={() => giftAttachmentRef.current?.click()} className="w-full bg-stone-50 border border-dashed border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-500 cursor-pointer hover:border-gold-400 hover:text-gold-600 transition-colors flex items-center gap-2 truncate"><Paperclip className="w-4 h-4" /><span className="truncate">{promoData.attachmentName || 'Click to select file...'}</span><input type="file" ref={giftAttachmentRef} className="hidden" onChange={handleGiftAttachment} /></div></div>
                        </div>
                        <div className="p-4 border-t border-stone-100 flex justify-end gap-2 bg-stone-50 rounded-b-2xl"><button onClick={() => setIsPromoModalOpen(false)} className="px-4 py-2 text-stone-500 font-bold hover:bg-stone-200 rounded-lg">Cancel</button><button onClick={handleSendGift} className="px-6 py-2 bg-gold-500 text-white font-bold rounded-lg hover:bg-gold-600 shadow-md flex items-center gap-2"><Send className="w-4 h-4" /> {t('clients.interactions.gift.send')}</button></div>
                    </div>
                </div>
            )}

            {/* CREATE/EDIT CLIENT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50 rounded-t-2xl shrink-0">
                            <div><h2 className="font-serif font-bold text-2xl text-stone-800">{editingClient ? t('clients.editProfile') : t('clients.newMember')}</h2><p className="text-stone-500 text-sm mt-1">{editingClient ? 'Update client details.' : 'Add a new soul to your community.'}</p></div>
                            <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-stone-400 hover:text-stone-600" /></button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-stone-100 px-6 shrink-0">
                            <button onClick={() => setFormTab('personal')} className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors ${formTab === 'personal' ? 'border-gold-500 text-gold-600' : 'border-transparent text-stone-400 hover:text-stone-600'}`}>{t('clients.form.personal')}</button>
                            <button onClick={() => setFormTab('contact')} className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors ${formTab === 'contact' ? 'border-gold-500 text-gold-600' : 'border-transparent text-stone-400 hover:text-stone-600'}`}>{t('clients.form.contact')}</button>
                            <button onClick={() => setFormTab('details')} className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors ${formTab === 'details' ? 'border-gold-500 text-gold-600' : 'border-transparent text-stone-400 hover:text-stone-600'}`}>{t('clients.form.details')}</button>
                        </div>

                        {/* Form Content */}
                        <div className="p-8 overflow-y-auto">
                            {formTab === 'personal' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                    {/* Avatar Upload */}
                                    <div className="flex items-center gap-6">
                                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-stone-100 shadow-md relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                                            <img src={formData.avatar || `https://ui-avatars.com/api/?name=${formData.firstName || 'New'}+${formData.lastName || 'User'}`} alt="Avatar Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera className="w-6 h-6 text-white" /></div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-stone-800 text-sm">Profile Photo</h3>
                                            <p className="text-xs text-stone-400 mb-2">Upload a real photo to personalize the experience.</p>
                                            <button onClick={() => avatarInputRef.current?.click()} className="text-xs font-bold text-gold-600 hover:underline">Change Photo</button>
                                            <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="text-xs font-bold uppercase text-stone-500 block mb-1">{t('clients.form.firstName')}</label><input autoFocus value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-gold-400 text-stone-900" /></div>
                                        <div><label className="text-xs font-bold uppercase text-stone-500 block mb-1">{t('clients.form.lastName')}</label><input value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-gold-400 text-stone-900" /></div>
                                    </div>
                                    <div><label className="text-xs font-bold uppercase text-stone-500 block mb-1">{t('clients.form.profession')}</label><input value={formData.profession} onChange={e => setFormData({ ...formData, profession: e.target.value })} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-gold-400 text-stone-900" placeholder="e.g. Graphic Designer" /></div>
                                    <div><label className="text-xs font-bold uppercase text-stone-500 block mb-1">{t('clients.form.birthday')}</label><input type="date" value={formData.birthday} onChange={e => setFormData({ ...formData, birthday: e.target.value })} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-gold-400 text-stone-900" /></div>
                                </div>
                            )}

                            {formTab === 'contact' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                    <div><label className="text-xs font-bold uppercase text-stone-500 block mb-1">{t('clients.form.email')}</label><div className="relative"><Mail className="absolute left-3 top-3.5 w-4 h-4 text-stone-400" /><input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full pl-9 p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-gold-400 text-stone-900" /></div></div>
                                    <div><label className="text-xs font-bold uppercase text-stone-500 block mb-1">{t('clients.form.phone')}</label><div className="relative"><Phone className="absolute left-3 top-3.5 w-4 h-4 text-stone-400" /><input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full pl-9 p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-gold-400 text-stone-900" /></div></div>
                                    <div><label className="text-xs font-bold uppercase text-stone-500 block mb-1">{t('clients.form.instagram')}</label><div className="relative"><Instagram className="absolute left-3 top-3.5 w-4 h-4 text-stone-400" /><input value={formData.instagram} onChange={e => setFormData({ ...formData, instagram: e.target.value })} className="w-full pl-9 p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-gold-400 text-stone-900" placeholder="@username" /></div></div>
                                </div>
                            )}

                            {formTab === 'details' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                    <div><label className="text-xs font-bold uppercase text-stone-500 block mb-1">{t('clients.form.address')}</label><textarea value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-gold-400 text-stone-900 resize-none h-20" placeholder="Via Roma 1, Milano..." /></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="text-xs font-bold uppercase text-stone-500 block mb-1">{t('clients.form.source')}</label><select value={formData.source} onChange={e => setFormData({ ...formData, source: e.target.value })} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-gold-400 text-stone-900"><option value="Referral">{t('clients.form.sourceOptions.referral')}</option><option value="Google">{t('clients.form.sourceOptions.google')}</option><option value="Instagram">{t('clients.form.sourceOptions.social')}</option><option value="Ads">{t('clients.form.sourceOptions.ads')}</option><option value="Walk-in">{t('clients.form.sourceOptions.walkin')}</option></select></div>
                                        <div><label className="text-xs font-bold uppercase text-stone-500 block mb-1">{t('clients.form.points')}</label><input type="number" value={formData.loyaltyPoints} onChange={e => setFormData({ ...formData, loyaltyPoints: parseInt(e.target.value) })} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-gold-400 text-stone-900" /></div>
                                    </div>
                                    <div className="p-4 bg-stone-100 rounded-xl border border-stone-200 mt-2">
                                        <div className="flex items-center gap-2 mb-3 text-stone-600 font-bold text-xs uppercase tracking-wider"><TrendingUp className="w-4 h-4" /> Admin Stats (Manual Override)</div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><label className="text-[10px] font-bold uppercase text-stone-400 block mb-1">{t('clients.form.ltv')}</label><input type="number" value={formData.totalSpend} onChange={e => setFormData({ ...formData, totalSpend: parseFloat(e.target.value) })} className="w-full p-2 bg-white border border-stone-200 rounded-lg text-sm text-stone-900" /></div>
                                            <div><label className="text-[10px] font-bold uppercase text-stone-400 block mb-1">{t('clients.form.sessions')}</label><input type="number" value={formData.totalSessions} onChange={e => setFormData({ ...formData, totalSessions: parseInt(e.target.value) })} className="w-full p-2 bg-white border border-stone-200 rounded-lg text-sm text-stone-900" /></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-stone-100 flex justify-end gap-2 bg-stone-50 rounded-b-2xl shrink-0">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-stone-500 font-bold hover:bg-stone-200 rounded-lg">{t('clients.form.cancel')}</button>
                            <button onClick={handleSaveClient} disabled={!formData.firstName || !formData.lastName} className="px-6 py-2 bg-stone-800 text-white font-bold rounded-lg hover:bg-stone-700 shadow-lg disabled:opacity-50 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> {t('clients.form.save')}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- RESCHEDULE MODAL --- */}
            {rescheduleModal.isOpen && rescheduleModal.session && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="p-6 border-b border-stone-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <Clock className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-stone-900">Riprogramma Sessione</h3>
                                    <p className="text-sm text-stone-500">{rescheduleModal.session.programName || rescheduleModal.session.title}</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase text-stone-500 block mb-2">Nuova Data</label>
                                <input
                                    type="date"
                                    value={rescheduleModal.newDate}
                                    onChange={(e) => setRescheduleModal(prev => ({ ...prev, newDate: e.target.value }))}
                                    className="w-full p-4 bg-stone-50 border-2 border-stone-200 rounded-xl focus:border-blue-400 outline-none text-stone-900 font-medium"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-stone-500 block mb-2">Nuova Ora</label>
                                <input
                                    type="time"
                                    value={rescheduleModal.newTime}
                                    onChange={(e) => setRescheduleModal(prev => ({ ...prev, newTime: e.target.value }))}
                                    className="w-full p-4 bg-stone-50 border-2 border-stone-200 rounded-xl focus:border-blue-400 outline-none text-stone-900 font-medium"
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-stone-100 flex gap-3 bg-stone-50 rounded-b-2xl">
                            <button
                                onClick={() => setRescheduleModal({ isOpen: false, session: null, newDate: '', newTime: '' })}
                                className="flex-1 py-3 text-stone-600 font-bold hover:bg-stone-200 rounded-xl transition-colors"
                            >
                                Annulla
                            </button>
                            <button
                                onClick={confirmReschedule}
                                className="flex-[2] py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 className="w-5 h-5" /> Conferma Nuova Data
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- DELETE CONFIRMATION MODAL --- */}
            {deleteModal.isOpen && deleteModal.session && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="p-6 border-b border-stone-100 bg-gradient-to-r from-red-50 to-rose-50 rounded-t-2xl">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-red-100 rounded-xl">
                                    <Trash2 className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-stone-900">Elimina Sessione</h3>
                                    <p className="text-sm text-stone-500">{deleteModal.session.programName || deleteModal.session.title}</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="p-4 bg-red-50 border-2 border-red-100 rounded-xl">
                                <p className="text-sm text-red-800 font-medium">
                                    ⚠️ Sei sicuro di voler eliminare questa sessione?
                                </p>
                                <p className="text-xs text-red-600 mt-2">
                                    📅 {new Date(deleteModal.session.date).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                    <br />
                                    ⏰ {new Date(deleteModal.session.date).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <p className="text-xs text-red-500 mt-3 font-bold">
                                    Questa azione non può essere annullata.
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-stone-100 flex gap-3 bg-stone-50 rounded-b-2xl">
                            <button
                                onClick={() => setDeleteModal({ isOpen: false, session: null })}
                                className="flex-1 py-3 text-stone-600 font-bold hover:bg-stone-200 rounded-xl transition-colors"
                            >
                                Annulla
                            </button>
                            <button
                                onClick={confirmDeleteSession}
                                className="flex-[2] py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-5 h-5" /> Elimina Definitivamente
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
