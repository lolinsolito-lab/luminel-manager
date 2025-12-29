
import React, { useState, useEffect, useMemo } from 'react';
import {
    Users,
    Users2,
    UserPlus,
    Briefcase,
    Euro,
    Clock,
    CheckCircle2,
    AlertCircle,
    X,
    ChevronRight,
    Mail,
    Phone,
    Loader2
} from 'lucide-react';
import { TeamMember, TeamMemberType, TeamMemberStatus } from '../types';
import * as teamService from '../services/teamService';

// === LUMINA ROYAL PALETTE ===
const LUMINA_COLORS = {
    income: '#D4A853',  // Gold Royal
    expense: '#C9A18C',  // Rose Champagne
    payroll: '#5B7C99',  // Navy Royal
    success: '#8FAE8B',  // Sage Green
    warning: '#D4A574',  // Amber Champagne
    neutral: '#A8A095',  // Pearl Gray
    vip: '#C4956A',  // Deep Gold
};

type TabType = 'all' | 'employee' | 'contractor';

// KPI Card Component
const KpiCard = ({
    title,
    value,
    subtext,
    icon: Icon,
    color,
    isLoading
}: {
    title: string;
    value: string;
    subtext?: string;
    icon: React.ElementType;
    color: string;
    isLoading?: boolean;
}) => (
    <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm hover:shadow-lg transition-all">
        <div className="flex justify-between items-start mb-4">
            <div
                className="p-3 rounded-xl"
                style={{ backgroundColor: `${color}20` }}
            >
                <Icon className="w-6 h-6" style={{ color }} />
            </div>
        </div>
        <p className="text-stone-500 text-xs font-bold uppercase tracking-wider">{title}</p>
        {isLoading ? (
            <div className="h-9 w-24 bg-stone-100 rounded animate-pulse mt-1" />
        ) : (
            <h3 className="text-3xl font-serif font-bold mt-1" style={{ color }}>{value}</h3>
        )}
        {subtext && <p className="text-xs text-stone-400 mt-1">{subtext}</p>}
    </div>
);

// Member Card Component
const MemberCard = ({
    member,
    onMarkPaid,
    onMarkPending,
    onEdit,
}: {
    member: TeamMember;
    onMarkPaid: (id: string) => void | Promise<void>;
    onMarkPending: (id: string) => void | Promise<void>;
    onEdit: (member: TeamMember) => void;
}) => {
    const typeColor = member.type === 'Salary' ? LUMINA_COLORS.payroll : LUMINA_COLORS.vip;
    const statusColor = member.status === 'Paid' ? LUMINA_COLORS.success : LUMINA_COLORS.warning;

    return (
        <div
            className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            onClick={() => onEdit(member)}
        >
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: typeColor }}
                    >
                        {member.name.charAt(0).toUpperCase()}
                    </div>

                    <div>
                        <h3 className="font-bold text-stone-800 group-hover:text-stone-900 transition-colors">
                            {member.name}
                        </h3>
                        <p className="text-sm text-stone-500">{member.role}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-stone-400">
                            {member.email && (
                                <span className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" /> {member.email}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="text-right">
                    {/* Amount */}
                    <p className="text-xl font-bold" style={{ color: typeColor }}>
                        €{member.amount.toLocaleString()}
                    </p>

                    {/* Type Badge */}
                    <span
                        className="text-xs font-bold px-2 py-1 rounded-full inline-block mt-1"
                        style={{
                            backgroundColor: `${typeColor}15`,
                            color: typeColor
                        }}
                    >
                        {member.type === 'Salary' ? 'Dipendente' : 'Collaboratore'}
                    </span>
                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-stone-50">
                <div className="flex items-center gap-2 text-sm text-stone-500">
                    <Clock className="w-4 h-4" />
                    <span>Scadenza: {member.dueDay}° del mese</span>
                </div>

                {/* Status Badge + Action */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        member.status === 'Paid' ? onMarkPending(member.id) : onMarkPaid(member.id);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all hover:scale-105"
                    style={{
                        backgroundColor: `${statusColor}15`,
                        color: statusColor
                    }}
                >
                    {member.status === 'Paid' ? (
                        <>
                            <CheckCircle2 className="w-4 h-4" /> Pagato
                        </>
                    ) : (
                        <>
                            <AlertCircle className="w-4 h-4" /> Da Pagare
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

// Add/Edit Member Modal Component
const AddEditMemberModal = ({
    member,
    onClose,
    onSave,
}: {
    member: TeamMember | null;
    onClose: () => void;
    onSave: (data: Omit<TeamMember, 'id'>) => void | Promise<void>;
}) => {
    const [formData, setFormData] = useState({
        name: member?.name || '',
        email: member?.email || '',
        phone: member?.phone || '',
        role: member?.role || '',
        type: member?.type || 'Contractor' as TeamMemberType,
        amount: member?.amount || 0,
        dueDay: member?.dueDay || 28,
        status: member?.status || 'Pending' as TeamMemberStatus,
        vatId: member?.vatId || '',
        notes: member?.notes || '',
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.role || formData.amount <= 0) return;

        setIsSaving(true);
        await onSave(formData);
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-stone-100">
                    <h2 className="text-xl font-serif font-bold text-stone-900">
                        {member ? 'Modifica Membro' : 'Nuovo Membro'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-stone-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    {/* Name & Role */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 block">
                                Nome *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-gold-400 outline-none"
                                placeholder="Marco Rossi"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 block">
                                Ruolo *
                            </label>
                            <input
                                type="text"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-gold-400 outline-none"
                                placeholder="Istruttore Yoga"
                                required
                            />
                        </div>
                    </div>

                    {/* Email & Phone */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 block">
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-gold-400 outline-none"
                                placeholder="email@esempio.com"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 block">
                                Telefono
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-gold-400 outline-none"
                                placeholder="+39 333 1234567"
                            />
                        </div>
                    </div>

                    {/* Type Selection */}
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 block">
                            Tipo *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'Salary' })}
                                className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${formData.type === 'Salary'
                                    ? 'border-[#5B7C99] bg-[#5B7C99]/10'
                                    : 'border-stone-200 hover:border-stone-300'
                                    }`}
                            >
                                <Briefcase className="w-5 h-5" style={{ color: formData.type === 'Salary' ? '#5B7C99' : '#a8a29e' }} />
                                <div className="text-left">
                                    <p className="font-bold text-stone-800">Dipendente</p>
                                    <p className="text-xs text-stone-500">Stipendio fisso</p>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'Contractor' })}
                                className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${formData.type === 'Contractor'
                                    ? 'border-[#C4956A] bg-[#C4956A]/10'
                                    : 'border-stone-200 hover:border-stone-300'
                                    }`}
                            >
                                <Users className="w-5 h-5" style={{ color: formData.type === 'Contractor' ? '#C4956A' : '#a8a29e' }} />
                                <div className="text-left">
                                    <p className="font-bold text-stone-800">Collaboratore</p>
                                    <p className="text-xs text-stone-500">P.IVA / Prestazione</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* P.IVA Field - Only for Contractors */}
                    {formData.type === 'Contractor' && (
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 block">
                                P.IVA / Codice Fiscale
                            </label>
                            <input
                                type="text"
                                value={formData.vatId}
                                onChange={(e) => setFormData({ ...formData, vatId: e.target.value })}
                                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-gold-400 outline-none font-mono"
                                placeholder="IT12345678901"
                            />
                        </div>
                    )}

                    {/* Amount & Due Day */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 block">
                                Importo Mensile (€) *
                            </label>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-gold-400 outline-none font-mono"
                                placeholder="1500"
                                min="0"
                                step="50"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 block">
                                Giorno Pagamento
                            </label>
                            <select
                                value={formData.dueDay}
                                onChange={(e) => setFormData({ ...formData, dueDay: parseInt(e.target.value) })}
                                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-gold-400 outline-none"
                            >
                                {[1, 5, 10, 15, 20, 25, 28].map(day => (
                                    <option key={day} value={day}>{day}° del mese</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 block">
                            Note
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-gold-400 outline-none resize-none h-20"
                            placeholder="Disponibilità, orari, specializzazioni..."
                        />
                    </div>
                </form>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 border-t border-stone-100 bg-stone-50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-stone-600 font-bold hover:bg-stone-200 rounded-xl transition-colors"
                    >
                        Annulla
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving || !formData.name || !formData.role || formData.amount <= 0}
                        className="btn-gold-radiante px-6 py-2.5 rounded-xl font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Salvataggio...
                            </>
                        ) : (
                            member ? 'Salva Modifiche' : 'Aggiungi Membro'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const Team: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

    // Load team data
    useEffect(() => {
        const loadTeam = async () => {
            setIsLoading(true);
            try {
                const members = await teamService.getTeamMembers();
                setTeamMembers(members);
                console.log('[Team] ✅ Loaded', members.length, 'team members');
            } catch (error) {
                console.error('[Team] ❌ Error loading team:', error);
            }
            setIsLoading(false);
        };
        loadTeam();
    }, []);

    // Calculate stats
    const stats = useMemo(() => {
        const salaryMembers = teamMembers.filter(m => m.type === 'Salary');
        const contractorMembers = teamMembers.filter(m => m.type === 'Contractor');
        const totalPayroll = teamMembers.reduce((sum, m) => sum + m.amount, 0);
        const pendingPayroll = teamMembers.filter(m => m.status === 'Pending').reduce((sum, m) => sum + m.amount, 0);
        const paidPayroll = teamMembers.filter(m => m.status === 'Paid').reduce((sum, m) => sum + m.amount, 0);

        return {
            totalMembers: teamMembers.length,
            salaryCount: salaryMembers.length,
            contractorCount: contractorMembers.length,
            totalPayroll,
            pendingPayroll,
            paidPayroll,
        };
    }, [teamMembers]);

    // Filter members by tab
    const filteredMembers = useMemo(() => {
        switch (activeTab) {
            case 'employee':
                return teamMembers.filter(m => m.type === 'Salary');
            case 'contractor':
                return teamMembers.filter(m => m.type === 'Contractor');
            default:
                return teamMembers;
        }
    }, [teamMembers, activeTab]);

    // Handlers
    const handleMarkPaid = async (id: string) => {
        const updated = await teamService.markAsPaid(id);
        if (updated) {
            setTeamMembers(prev => prev.map(m => m.id === id ? updated : m));
        }
    };

    const handleMarkPending = async (id: string) => {
        const updated = await teamService.markAsPending(id);
        if (updated) {
            setTeamMembers(prev => prev.map(m => m.id === id ? updated : m));
        }
    };

    const handleEdit = (member: TeamMember) => {
        setEditingMember(member);
        setShowAddModal(true);
    };

    const tabs: { id: TabType; label: string; count: number }[] = [
        { id: 'all', label: 'Tutti', count: stats.totalMembers },
        { id: 'employee', label: 'Dipendenti', count: stats.salaryCount },
        { id: 'contractor', label: 'Collaboratori', count: stats.contractorCount },
    ];

    return (
        <div className="space-y-8 w-full max-w-[1600px] pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-stone-900">Gestione Team</h1>
                    <p className="text-stone-500 mt-1">Collaboratori, dipendenti e pagamenti del tuo team.</p>
                </div>
                <button
                    onClick={() => { setEditingMember(null); setShowAddModal(true); }}
                    className="btn-gold-radiante btn-ripple px-5 py-3 rounded-xl flex items-center gap-2 font-bold text-white"
                >
                    <UserPlus className="w-5 h-5" /> Aggiungi Membro
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard
                    title="Team Totale"
                    value={stats.totalMembers.toString()}
                    subtext={`${stats.salaryCount} dipendenti · ${stats.contractorCount} collaboratori`}
                    icon={Users2}
                    color={LUMINA_COLORS.payroll}
                    isLoading={isLoading}
                />
                <KpiCard
                    title="Payroll Mensile"
                    value={`€${stats.totalPayroll.toLocaleString()}`}
                    subtext="Costo totale team"
                    icon={Euro}
                    color={LUMINA_COLORS.income}
                    isLoading={isLoading}
                />
                <KpiCard
                    title="Da Pagare"
                    value={`€${stats.pendingPayroll.toLocaleString()}`}
                    subtext={`${teamMembers.filter(m => m.status === 'Pending').length} membri`}
                    icon={AlertCircle}
                    color={LUMINA_COLORS.warning}
                    isLoading={isLoading}
                />
                <KpiCard
                    title="Già Pagati"
                    value={`€${stats.paidPayroll.toLocaleString()}`}
                    subtext={`${teamMembers.filter(m => m.status === 'Paid').length} membri`}
                    icon={CheckCircle2}
                    color={LUMINA_COLORS.success}
                    isLoading={isLoading}
                />
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-stone-100 shadow-sm w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === tab.id
                            ? 'bg-stone-800 text-white'
                            : 'text-stone-500 hover:bg-stone-50'
                            }`}
                    >
                        {tab.label}
                        <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Members Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
                </div>
            ) : filteredMembers.length === 0 ? (
                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-100 flex items-center justify-center">
                        <Users className="w-8 h-8 text-stone-400" />
                    </div>
                    <h3 className="text-lg font-serif font-bold text-stone-700">Nessun membro trovato</h3>
                    <p className="text-stone-500 text-sm mt-2">
                        {activeTab === 'all'
                            ? 'Aggiungi il tuo primo membro del team.'
                            : `Nessun ${activeTab === 'employee' ? 'dipendente' : 'collaboratore'} nel team.`
                        }
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredMembers.map(member => (
                        <MemberCard
                            key={member.id}
                            member={member}
                            onMarkPaid={handleMarkPaid}
                            onMarkPending={handleMarkPending}
                            onEdit={handleEdit}
                        />
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showAddModal && (
                <AddEditMemberModal
                    member={editingMember}
                    onClose={() => setShowAddModal(false)}
                    onSave={async (member) => {
                        if (editingMember) {
                            const updated = await teamService.updateTeamMember(editingMember.id, member);
                            if (updated) {
                                setTeamMembers(prev => prev.map(m => m.id === editingMember.id ? updated : m));
                            }
                        } else {
                            const newMember = await teamService.createTeamMember(member);
                            setTeamMembers(prev => [...prev, newMember]);
                        }
                        setShowAddModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default Team;
