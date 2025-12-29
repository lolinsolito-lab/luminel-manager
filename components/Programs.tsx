
import React, { useState, useEffect } from 'react';
import {
  BookOpen, Users, Plus, Star, Gift, Share2,
  Sparkles, Flower2, BrainCircuit, X, Check,
  Trash2, Clock, Euro, ArrowRight, Settings,
  Palmtree, Waves, Zap, Heart, Flame, Shield,
  Palette, Scissors, Pencil, Anchor, Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Program, VaultCategory } from '../types';
import { usePrograms } from '../contexts/ProgramContext';
import { syncProgram } from '../services/integrationService';
import { LUMINA_COLORS } from '../constants';

// Icon mapping helper
const ICON_MAP: Record<string, any> = {
  BrainCircuit, Flower2, Sparkles, BookOpen, Star,
  Gift, Heart, Zap, Flame, Shield, Palmtree, Waves,
  Palette, Scissors, Pencil, Anchor, Compass
};

const DefaultIcon = BookOpen;

// Animation variants for Elite staggered entrance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export const Programs: React.FC = () => {
  const {
    programs, categories, isLoading,
    addProgram, updateProgram, deleteProgram,
    addCategory, updateCategory, deleteCategory
  } = usePrograms();

  const [activeTab, setActiveTab] = useState<string>('');

  // Set default active tab once categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !activeTab) {
      setActiveTab(categories[0].name);
    }
  }, [categories, activeTab]);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Program Form state
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [formData, setFormData] = useState<Partial<Program>>({
    title: '',
    category: '',
    type: 'Session',
    durationMinutes: 60,
    price: 0,
    active: true
  });

  // Category Form state
  const [editingCategory, setEditingCategory] = useState<VaultCategory | null>(null);
  const [categoryFormData, setCategoryFormData] = useState<Partial<VaultCategory>>({
    name: '',
    iconName: 'BookOpen',
    sortOrder: 0
  });

  const filteredPrograms = programs.filter(p => p.category === activeTab);

  const handleOpenProgramModal = (program?: Program) => {
    if (program) {
      setEditingProgram(program);
      setFormData(program);
    } else {
      setEditingProgram(null);
      setFormData({
        title: '',
        category: activeTab,
        type: 'Standard Session',
        durationMinutes: 60,
        price: 150,
        active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveProgram = async () => {
    if (!formData.title || !formData.category) return;
    setIsSaving(true);
    try {
      if (editingProgram) {
        await updateProgram(editingProgram.id, formData);
      } else {
        await addProgram(formData as Omit<Program, 'id'>);
      }
      await syncProgram({ ...editingProgram, ...formData } as Program);
      setIsModalOpen(false);
    } catch (error) {
      alert('Errore nel salvataggio del programma.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenCategoryModal = (category?: VaultCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryFormData(category);
    } else {
      setEditingCategory(null);
      setCategoryFormData({
        name: '',
        iconName: 'Plus',
        sortOrder: categories.length
      });
    }
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryFormData.name) return;
    setIsSaving(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryFormData);
      } else {
        await addCategory(categoryFormData as Omit<VaultCategory, 'id'>);
      }
      setIsCategoryModalOpen(false);
    } catch (error) {
      alert('Errore nel salvataggio della categoria.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-12 w-full max-w-[1600px] pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-end gap-6">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <h1 className="text-4xl font-serif font-bold text-stone-800 tracking-tight">Il Tuo Vault</h1>
          <p className="text-stone-500 mt-2 text-lg">Architettura del valore: gestisci le tue offerte personalizzate.</p>
        </motion.div>

        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleOpenCategoryModal()}
            className="p-4 rounded-2xl bg-white border border-stone-100 shadow-sm text-stone-400 hover:text-amber-600 transition-all flex items-center gap-2"
            title="Gestisci Categorie"
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-widest hidden md:inline">Personalizza Vault</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, translateY: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleOpenProgramModal()}
            className="bg-stone-800 text-white px-8 py-4 rounded-2xl hover:bg-stone-700 flex items-center gap-3 transition-all shadow-xl shadow-stone-200 group border border-stone-700"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300 text-amber-500" />
            <span className="font-bold tracking-widest uppercase text-xs">Aggiungi Offerta</span>
          </motion.button>
        </div>
      </div>

      {/* Navigation Tabs - Dynamic Categories */}
      <div className="flex gap-8 border-b border-stone-100 overflow-x-auto no-scrollbar scroll-smooth">
        {categories.map((cat) => {
          const Icon = ICON_MAP[cat.iconName] || DefaultIcon;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.name)}
              className={`pb-5 px-3 flex items-center gap-3 font-bold text-[11px] tracking-[0.2em] uppercase transition-all relative whitespace-nowrap ${activeTab === cat.name ? 'text-stone-900 opacity-100' : 'text-stone-400 opacity-60 hover:opacity-80'
                }`}
            >
              <Icon className={`w-5 h-5 ${activeTab === cat.name ? 'text-amber-600' : ''}`} />
              {cat.name}
              {activeTab === cat.name && (
                <motion.span
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 w-full h-1 bg-amber-500 rounded-t-full shadow-[0_-2px_8px_rgba(245,158,11,0.4)]"
                />
              )}
            </button>
          );
        })}

        {/* Quick Add Category Tab-alike */}
        <button
          onClick={() => handleOpenCategoryModal()}
          className="pb-5 px-3 flex items-center gap-2 text-stone-300 hover:text-amber-500 transition-all opacity-60 hover:opacity-100"
        >
          <Plus className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Nuovo Livello</span>
        </button>
      </div>

      {/* Grid of Excellence */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-72 bg-gradient-to-br from-stone-50 to-stone-100 animate-pulse rounded-3xl" />
          ))}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredPrograms.map((program) => (
              <motion.div
                layout
                key={program.id}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className="bg-white/80 backdrop-blur-md p-8 rounded-[2rem] border border-stone-100 shadow-sm transition-all group relative overflow-hidden flex flex-col h-full"
              >
                <div className="absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 bg-amber-500 rounded-full opacity-5 group-hover:opacity-10 transition-all duration-500 group-hover:scale-110" />

                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="p-4 rounded-2xl bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm">
                    <Star className="w-6 h-6 fill-current" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-sm ${program.active ? 'bg-white text-emerald-600 border-emerald-100' : 'bg-stone-50 text-stone-400 border-stone-200'
                    }`}>
                    {program.active ? 'Active' : 'Archived'}
                  </span>
                </div>

                <div className="flex-grow relative z-10">
                  <h4 className="font-serif font-bold text-stone-800 text-2xl mb-2 group-hover:text-amber-900 transition-colors leading-tight">
                    {program.title}
                  </h4>
                  <div className="flex items-center gap-2 text-stone-400 text-xs font-bold uppercase tracking-widest">
                    <span>{program.type}</span>
                    <span className="w-0.5 h-0.5 bg-stone-300 rounded-full" />
                    <span>{program.durationMinutes} min</span>
                  </div>
                </div>

                <div className="mt-10 pt-6 border-t border-stone-50 flex justify-between items-center relative z-10">
                  <div>
                    <p className="text-[10px] font-bold text-stone-300 uppercase tracking-[0.2em] mb-1">Investment</p>
                    <span className="font-serif font-bold text-3xl text-stone-800">€{program.price}</span>
                  </div>
                  <motion.button
                    whileHover={{ x: 5 }}
                    onClick={() => handleOpenProgramModal(program)}
                    className="p-3 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            ))}

            {!isLoading && (
              <motion.div
                layout
                variants={itemVariants}
                onClick={() => handleOpenProgramModal()}
                className="border-2 border-dashed border-stone-200 rounded-[2rem] flex flex-col items-center justify-center p-8 text-stone-400 hover:border-amber-300 hover:bg-amber-50/20 transition-all cursor-pointer min-h-[280px] group"
              >
                <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-amber-100 group-hover:scale-110 transition-all">
                  <Plus className="w-8 h-8 opacity-40 group-hover:opacity-100 group-hover:text-amber-600" />
                </div>
                <p className="font-bold uppercase tracking-[0.3em] text-[10px]">Nuova Offerta</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* --- MODALS --- */}

      {/* 1. PROGRAM MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xl z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden">
              <div className="p-10 border-b border-stone-50 flex justify-between items-center">
                <h2 className="font-serif font-bold text-3xl text-stone-800">{editingProgram ? 'Modifica Offerta' : 'Nuovo Protocollo'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-3 text-stone-400 hover:text-stone-900"><X className="w-6 h-6" /></button>
              </div>
              <div className="p-12 space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-300 ml-1">Titolo Servizio</label>
                  <input autoFocus value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-5 bg-stone-50 border border-stone-100 rounded-2xl outline-none font-serif text-2xl" placeholder="E.g. Full Back Tattoo Session" />
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-300 ml-1">Categoria (Vault Level)</label>
                    <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full p-5 bg-stone-50 border border-stone-100 rounded-2xl outline-none font-bold">
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-300 ml-1">Sottotipo</label>
                    <input value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full p-5 bg-stone-50 border border-stone-100 rounded-2xl outline-none" placeholder="E.g. In-Studio" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-300 ml-1">Investimento (€)</label>
                    <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })} className="w-full p-5 bg-stone-50 border border-stone-100 rounded-2xl outline-none font-bold text-lg" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-300 ml-1">Durata (Minuti)</label>
                    <input type="number" value={formData.durationMinutes} onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })} className="w-full p-5 bg-stone-50 border border-stone-100 rounded-2xl outline-none" />
                  </div>
                </div>
              </div>
              <div className="p-10 border-t border-stone-50 flex justify-end gap-4">
                <button onClick={handleSaveProgram} disabled={isSaving} className="bg-stone-900 text-white px-10 py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-stone-800 disabled:opacity-50 transition-all flex items-center gap-3">
                  {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-5 h-5 text-amber-500" />}
                  {editingProgram ? 'Salva Modifiche' : 'Archivia Offerta'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. CATEGORY MANAGEMENT MODAL */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xl z-50 flex items-center justify-center p-4">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden">
              <div className="p-10 border-b border-stone-50 flex justify-between items-center bg-stone-50/50">
                <h2 className="font-serif font-bold text-3xl text-stone-800">Architetto del Vault</h2>
                <button onClick={() => setIsCategoryModalOpen(false)} className="p-3 text-stone-400 hover:text-stone-900"><X className="w-6 h-6" /></button>
              </div>

              <div className="p-10 space-y-10">
                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-300">Nuova Sezione</label>
                      <input value={categoryFormData.name} onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })} className="w-full p-5 bg-stone-50 border border-stone-100 rounded-2xl outline-none" placeholder="Es. Tattoo Sessions" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-300">Seleziona Icona</label>
                      <div className="grid grid-cols-5 gap-3 max-h-48 overflow-y-auto p-2 scrollbar-thin">
                        {Object.keys(ICON_MAP).map(iconName => {
                          const Icon = ICON_MAP[iconName];
                          return (
                            <button
                              key={iconName}
                              onClick={() => setCategoryFormData({ ...categoryFormData, iconName })}
                              className={`p-3 rounded-xl border flex items-center justify-center transition-all ${categoryFormData.iconName === iconName ? 'bg-amber-500 text-white border-amber-600' : 'bg-stone-50 border-stone-100 text-stone-400'}`}
                            >
                              <Icon className="w-5 h-5" />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button onClick={handleSaveCategory} disabled={isSaving} className="w-full bg-amber-500 text-white p-5 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-amber-600 shadow-lg shadow-amber-100 mt-4">
                      {editingCategory ? 'Aggiorna Categoria' : 'Crea Tab Categoria'}
                    </button>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-300">Categorie Attive</label>
                    <div className="space-y-3">
                      {categories.map((cat) => (
                        <div key={cat.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100 group">
                          <div className="flex items-center gap-3">
                            {React.createElement(ICON_MAP[cat.iconName] || DefaultIcon, { className: "w-4 h-4 text-amber-500" })}
                            <span className="font-bold text-stone-700 text-xs">{cat.name}</span>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditingCategory(cat) || setCategoryFormData(cat)} className="p-2 text-stone-400 hover:text-stone-700 bg-white rounded-lg shadow-sm"><Settings className="w-3 h-3" /></button>
                            <button onClick={() => confirm('Eliminando la categoria non eliminerai i servizi associati, ma non avranno più una tab. Procedere?') && deleteCategory(cat.id)} className="p-2 text-stone-300 hover:text-rose-500 bg-white rounded-lg shadow-sm"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};