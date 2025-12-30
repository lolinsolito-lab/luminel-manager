
import React, { useState, useEffect } from 'react';
import {
  Search, Plus, FileText, Music, Video,
  Link as LinkIcon, Download, MoreVertical,
  Share2, Trash2, Cloud, CheckCircle2,
  DollarSign, Gift, BookOpen, Send, X,
  Euro, Sparkles, Filter, ArrowUpRight,
  MessageCircle, Mail as MailIcon, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Resource, Client } from '../types';
import { useResources } from '../contexts/ResourceContext';
import { getClients } from '../services/clientService';
import { LUMINA_COLORS } from '../constants';

// Animation variants for Elite UX
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: { scale: 1, opacity: 1 }
};

export const Library: React.FC = () => {
  const { resources, isLoading, addResource, deleteResource, updateResource } = useResources();
  const [clients, setClients] = useState<Client[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal States
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form States
  const [uploadForm, setUploadForm] = useState({ title: '', type: 'PDF', url: '', tags: '' });
  const [sendForm, setSendForm] = useState({ clientId: '', context: 'bonus', message: '', method: 'email' });
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Load real clients for the "Send" modal
  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await getClients();
        setClients(data);
      } catch (err) {
        console.error('Failed to load clients:', err);
      }
    };
    loadClients();
  }, []);

  // Filtering Logic
  const filteredResources = resources.filter(r => {
    const matchesFilter = activeFilter === 'All' || r.type === activeFilter;
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.tags && r.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));
    return matchesFilter && matchesSearch;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'Audio': return <Music className="w-6 h-6 text-amber-500" />;
      case 'PDF': return <FileText className="w-6 h-6 text-rose-400" />;
      case 'Video': return <Video className="w-6 h-6 text-stone-600" />;
      default: return <LinkIcon className="w-6 h-6 text-stone-400" />;
    }
  };

  // --- Handlers ---

  const handleUpload = async () => {
    if (!uploadForm.title) return;
    setIsProcessing(true);
    try {
      await addResource({
        title: uploadForm.title,
        type: uploadForm.type as any,
        url: uploadForm.url || '#',
        tags: uploadForm.tags.split(',').map(t => t.trim()).filter(t => t !== '')
      });
      setIsUploadOpen(false);
      setUploadForm({ title: '', type: 'PDF', url: '', tags: '' });
    } catch (err) {
      alert('Errore durante il caricamento.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questa risorsa dal Vault?')) {
      await deleteResource(id);
    }
  };

  const openSendModal = (resource: Resource) => {
    setSelectedResource(resource);
    setSendForm({
      clientId: '',
      context: 'bonus',
      method: 'email',
      message: `Ciao! Ho pensato che questa risorsa (${resource.title}) ti sarebbe stata utile per il tuo percorso.`
    });
    setIsSendOpen(true);
    setActiveMenuId(null);
  };

  const handleSend = async () => {
    if (!selectedResource || !sendForm.clientId) return;
    setIsProcessing(true);

    const client = clients.find(c => c.id === sendForm.clientId);
    const clientName = client ? `${client.firstName} ${client.lastName}` : 'Cliente';

    try {
      // Handle WhatsApp directly
      if (sendForm.method === 'whatsapp' && client?.phone) {
        const waMessage = encodeURIComponent(sendForm.message + "\n\n🔗 Risorsa: " + selectedResource.url);
        window.open(`https://wa.me/${client.phone.replace(/\D/g, '')}?text=${waMessage}`, '_blank');
        alert(`Eccellenza confermata. "${selectedResource.title}" è in viaggio verso ${clientName}.`);
      } else if (sendForm.method === 'email') {
        // TODO: Implement email sending via Supabase Edge Function
        alert('📧 Funzionalità email in arrivo. Per ora, usa WhatsApp.');
      }
      setIsSendOpen(false);
    } catch (err) {
      alert('Impossibile inviare la risorsa. Riprova.');
    } finally {
      setIsProcessing(false);
    }
  };

  const updateMessageContext = (context: string) => {
    if (!selectedResource) return;
    let msg = '';
    if (context === 'bonus') msg = `Ciao! 🎁 Come dono per la tua dedizione, ecco il mio "${selectedResource.title}". Spero ti piaccia!`;
    if (context === 'homework') msg = `Ciao, come discusso nella nostra sessione, per favore consulta questa risorsa: "${selectedResource.title}" prima del nostro prossimo incontro.`;
    if (context === 'upsell') msg = `Ti consiglio vivamente di consultare "${selectedResource.title}" per approfondire la tua pratica. È un contenuto premium di altissimo valore.`;

    setSendForm({ ...sendForm, context, message: msg });
  };

  return (
    <div className="space-y-12 w-full max-w-[1600px] pb-20">
      {/* Header - Royal Authority */}
      <div className="flex flex-col sm:flex-row justify-between items-end gap-6">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <h1 className="text-4xl font-serif font-bold text-stone-800 tracking-tight">Libreria Imperiale</h1>
          <p className="text-stone-500 mt-2 text-lg">Asset digitali, workbook e contenuti premium per il tuo impero.</p>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.02, translateY: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsUploadOpen(true)}
          className="bg-stone-800 text-white px-8 py-4 rounded-2xl hover:bg-stone-700 flex items-center gap-3 transition-all shadow-xl shadow-stone-200 group border border-stone-700"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300 text-amber-500" />
          <span className="font-bold tracking-widest uppercase text-xs">Aggiungi Asset</span>
        </motion.button>
      </div>

      {/* Control Bar - Glassmorphism */}
      <div className="flex flex-col lg:flex-row gap-6 justify-between items-center bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-stone-100 shadow-sm shrink-0">
        <div className="flex gap-4 overflow-x-auto w-full lg:w-auto no-scrollbar pb-2 lg:pb-0">
          {['All', 'Audio', 'PDF', 'Video', 'Link'].map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all relative ${activeFilter === filter
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-200'
                : 'bg-stone-50 text-stone-400 hover:bg-stone-100'
                }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-amber-500 transition-colors" />
          <input
            type="text"
            placeholder="Cerca per titolo o tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm focus:outline-none focus:border-amber-400 focus:bg-white transition-all shadow-inner"
          />
        </div>
      </div>

      {/* The Vault Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map(n => <div key={n} className="h-80 bg-stone-50 animate-pulse rounded-[2.5rem]" />)}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredResources.map(resource => (
              <motion.div
                layout
                key={resource.id}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className="bg-white p-8 rounded-[2.5rem] border border-stone-50 hover:shadow-2xl hover:border-amber-100 transition-all group relative flex flex-col h-full overflow-hidden"
              >
                {/* Decoration */}
                <div className={`absolute -right-4 -top-4 w-32 h-32 rounded-full opacity-5 group-hover:opacity-10 transition-all duration-700 ${resource.type === 'PDF' ? 'bg-rose-500' :
                  resource.type === 'Audio' ? 'bg-amber-500' : 'bg-stone-500'
                  }`} />

                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className="p-4 bg-stone-50 rounded-2xl group-hover:bg-amber-50 transition-colors shadow-inner">
                    {getIcon(resource.type)}
                  </div>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === resource.id ? null : resource.id);
                      }}
                      className={`p-2 rounded-xl transition-all ${activeMenuId === resource.id ? 'bg-amber-100 text-amber-900' : 'text-stone-300 hover:text-stone-900 hover:bg-stone-50'}`}
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    <AnimatePresence>
                      {activeMenuId === resource.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          className="absolute right-0 top-full mt-2 bg-white/95 backdrop-blur-md border border-stone-100 shadow-2xl rounded-2xl w-44 z-20 overflow-hidden"
                        >
                          <button
                            onClick={() => { window.open(resource.url, '_blank'); setActiveMenuId(null); }}
                            className="w-full text-left px-5 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-stone-50 text-stone-600 flex items-center gap-3 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4 text-amber-500" /> Anteprima
                          </button>
                          <button
                            onClick={() => openSendModal(resource)}
                            className="w-full text-left px-5 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-stone-50 text-stone-600 flex items-center gap-3 transition-colors border-t border-stone-50"
                          >
                            <Share2 className="w-4 h-4 text-blue-500" /> Condividi
                          </button>
                          <button
                            onClick={() => handleDelete(resource.id)}
                            className="w-full text-left px-5 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-rose-50 text-rose-500 flex items-center gap-3 transition-colors border-t border-stone-50"
                          >
                            <Trash2 className="w-4 h-4" /> Elimina
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="relative z-10 flex-grow">
                  <h3 className="font-serif font-bold text-stone-800 text-2xl leading-tight mb-4 group-hover:text-amber-900 transition-colors line-clamp-2">
                    {resource.title}
                  </h3>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {resource.tags && resource.tags.map(tag => (
                      <span key={tag} className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400 bg-stone-50 px-2.5 py-1.5 rounded-lg border border-stone-100 shadow-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openSendModal(resource)}
                  className="w-full mt-auto py-4 bg-stone-800 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-amber-600 transition-all flex items-center justify-center gap-3 shadow-lg shadow-stone-100 group/btn"
                >
                  <Share2 className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" /> Invia al Cliente
                </motion.button>
              </motion.div>
            ))}

            {/* Empty State / Add Helper */}
            {!isLoading && (
              <motion.div
                layout
                variants={itemVariants}
                onClick={() => setIsUploadOpen(true)}
                className="border-2 border-dashed border-stone-100 rounded-[2.5rem] flex flex-col items-center justify-center p-10 text-stone-400 hover:border-amber-300 hover:bg-amber-50/20 transition-all cursor-pointer min-h-[320px] group"
              >
                <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-amber-100 group-hover:scale-110 transition-all duration-500">
                  <Cloud className="w-10 h-10 opacity-20 group-hover:opacity-100 group-hover:text-amber-500 transition-all" />
                </div>
                <p className="font-bold uppercase tracking-[0.3em] text-[10px] group-hover:text-amber-700 transition-colors">Aggiungi all'Impero</p>
                <p className="text-[10px] mt-3 opacity-40 text-center leading-relaxed">Carica PDF, Audio o Video d'eccellenza.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* --- MODALS --- */}

      {/* 1. UPLOAD MODAL - Elite Styling */}
      <AnimatePresence>
        {isUploadOpen && (
          <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden"
            >
              <div className="p-10 border-b border-stone-50 flex justify-between items-center bg-stone-50/30">
                <div>
                  <h2 className="font-serif font-bold text-3xl text-stone-800">Espandere il Vault</h2>
                  <p className="text-stone-400 text-xs mt-1 uppercase tracking-widest font-bold">Nuovo Asset Digitale</p>
                </div>
                <button onClick={() => setIsUploadOpen(false)} className="p-3 bg-white rounded-full shadow-sm hover:text-rose-500 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-12 space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-300 ml-1">Titolo dell'Asset</label>
                  <input
                    autoFocus
                    value={uploadForm.title} onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    className="w-full p-5 bg-stone-50 border border-stone-100 rounded-2xl focus:border-amber-400 focus:bg-white outline-none font-serif text-2xl text-stone-800 transition-all"
                    placeholder="Es. Ritualized Manifestation Audio"
                  />
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-300 ml-1">Tipo di Risorsa</label>
                    <select
                      value={uploadForm.type} onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
                      className="w-full p-5 bg-stone-50 border border-stone-100 rounded-2xl focus:border-amber-400 outline-none font-bold text-stone-700"
                    >
                      <option value="PDF">Documento (PDF)</option>
                      <option value="Audio">Audio / Meditazione</option>
                      <option value="Video">Video / Replay</option>
                      <option value="Link">Link Esterno</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-300 ml-1">Tags (separati da virgola)</label>
                    <input
                      value={uploadForm.tags} onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                      className="w-full p-5 bg-stone-50 border border-stone-100 rounded-2xl focus:border-amber-400 outline-none font-bold text-stone-700"
                      placeholder="healing, premium, mindset"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-300 ml-1">URL Sorgente (Drive/Dropbox/Web)</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-5 top-5.5 w-5 h-5 text-amber-500" />
                    <input
                      value={uploadForm.url} onChange={(e) => setUploadForm({ ...uploadForm, url: e.target.value })}
                      className="w-full pl-14 p-5 bg-stone-50 border border-stone-100 rounded-2xl focus:border-amber-400 focus:bg-white outline-none font-mono text-sm text-stone-600 transition-all"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              <div className="p-10 border-t border-stone-50 bg-stone-50/50 flex justify-end gap-4">
                <button onClick={() => setIsUploadOpen(false)} className="px-8 py-4 text-stone-400 font-bold uppercase tracking-[0.2em] text-[10px] hover:text-stone-800 transition-colors">
                  Annulla
                </button>
                <button
                  onClick={handleUpload}
                  disabled={isProcessing}
                  className="bg-stone-900 text-white px-10 py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-stone-800 shadow-xl shadow-stone-200 flex items-center gap-3 disabled:opacity-50 transition-all"
                >
                  {isProcessing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 className="w-5 h-5 text-amber-500" />}
                  Archivia Asset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. SEND TO CLIENT MODAL - Immersive Flow */}
      <AnimatePresence>
        {isSendOpen && selectedResource && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xl z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-12 pb-0 flex justify-between items-start">
                <div>
                  <h2 className="font-serif font-bold text-4xl text-stone-800 tracking-tight">Distribuzione Valore</h2>
                  <p className="text-amber-600 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">Invio: {selectedResource.title}</p>
                </div>
                <button onClick={() => setIsSendOpen(false)} className="p-4 bg-stone-50 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-12 space-y-10">
                {/* Recipient Selection */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-300 ml-1">Seleziona Destinatario</label>
                  <select
                    value={sendForm.clientId} onChange={(e) => setSendForm({ ...sendForm, clientId: e.target.value })}
                    className="w-full p-6 bg-stone-50 border border-stone-100 rounded-3xl outline-none focus:border-amber-400 font-serif text-xl text-stone-800 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Scegli un Cliente d'Elite...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                  </select>
                </div>

                {/* Strategy Context */}
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-300 ml-1">Metodo di Invio</label>
                    <div className="flex bg-stone-50 p-1.5 rounded-2xl border border-stone-100">
                      <button
                        onClick={() => setSendForm({ ...sendForm, method: 'email' })}
                        className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${sendForm.method === 'email' ? 'bg-white shadow-md text-stone-900 font-bold' : 'text-stone-400'}`}
                      >
                        <MailIcon className="w-4 h-4" /> <span className="text-[10px] uppercase font-black">Email</span>
                      </button>
                      <button
                        onClick={() => setSendForm({ ...sendForm, method: 'whatsapp' })}
                        className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${sendForm.method === 'whatsapp' ? 'bg-white shadow-md text-emerald-600 font-bold' : 'text-stone-400'}`}
                      >
                        <MessageCircle className="w-4 h-4" /> <span className="text-[10px] uppercase font-black">WhatsApp</span>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-300 ml-1">Strategia d'Invio</label>
                    <div className="flex bg-stone-50 p-1.5 rounded-2xl border border-stone-100">
                      {['bonus', 'homework', 'upsell'].map((ctx) => (
                        <button
                          key={ctx}
                          onClick={() => updateMessageContext(ctx)}
                          className={`flex-1 py-3 rounded-xl text-[9px] uppercase font-black transition-all ${sendForm.context === ctx ? 'bg-white shadow-md text-amber-600' : 'text-stone-400'}`}
                        >
                          {ctx}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Message Preview */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-300">Messaggio Personalizzato</label>
                    {sendForm.method === 'whatsapp' && <span className="text-[9px] text-emerald-500 font-bold uppercase">Ready for WA</span>}
                  </div>
                  <textarea
                    value={sendForm.message} onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })}
                    className="w-full h-32 p-6 bg-stone-50 border border-stone-100 rounded-3xl outline-none focus:border-amber-400 text-stone-600 resize-none leading-relaxed transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="p-12 bg-stone-50/50 flex items-center justify-between border-t border-stone-100">
                <button onClick={() => setIsSendOpen(false)} className="text-stone-400 font-bold uppercase tracking-[0.2em] text-[10px] hover:text-stone-800 transition-colors">
                  Annulla
                </button>
                <button
                  onClick={handleSend}
                  disabled={!sendForm.clientId || isProcessing}
                  className="bg-stone-900 text-white px-12 py-6 rounded-[2rem] font-bold uppercase tracking-[0.3em] text-xs hover:bg-stone-800 shadow-2xl flex items-center gap-4 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  {isProcessing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-5 h-5 text-amber-500" />}
                  Esegui Invio
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
