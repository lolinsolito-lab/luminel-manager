
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, Loader2, Zap } from 'lucide-react';
import { generateBusinessInsight } from '../services/geminiService';
import { ChatMessage } from '../types';
import * as transactionService from '../services/transactionService';
import * as sessionService from '../services/sessionService';
import * as clientService from '../services/clientService';

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Ciao! Sono Luminel, la tua guida strategica. Ho accesso ai dati della tua dashboard. Chiedimi pure un\'analisi sul fatturato o consigli per migliorare la retention.', timestamp: Date.now() }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // FIX (1 set 2026): rimosso il contesto finto (era hardcoded: 142 clienti,
  // €126.500 fatturato eccetera, uguale per ogni utente). Ora carica i dati
  // reali del coach loggato, con lo stesso pattern di Dashboard.tsx/Analytics.tsx.
  const [businessContext, setBusinessContext] = useState({
    monthlyRevenue: '€0',
    totalRevenue: '€0',
    netProfit: '€0',
    pendingPayments: '€0',
    activeClients: 0,
    newClientsThisMonth: 0,
    sessionsToday: 0,
    sessionsCompletedThisMonth: 0,
    avgSessionValue: '€0'
  });
  const [isContextLoading, setIsContextLoading] = useState(true);

  useEffect(() => {
    const loadRealBusinessContext = async () => {
      setIsContextLoading(true);
      try {
        const [financeStats, sessionStats, clients] = await Promise.all([
          transactionService.getFinanceStats(),
          sessionService.getSessionStats(),
          clientService.getClients()
        ]);

        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const newClientsThisMonth = clients.filter(c => {
          const createdAt = (c as any).created_at || (c as any).createdAt;
          return createdAt ? new Date(createdAt) >= monthStart : false;
        }).length;

        const avgSessionValue = sessionStats.completedThisMonth > 0
          ? Math.round(financeStats.revenueThisMonth / sessionStats.completedThisMonth)
          : 0;

        setBusinessContext({
          monthlyRevenue: `€${financeStats.revenueThisMonth.toLocaleString('it-IT')}`,
          totalRevenue: `€${financeStats.totalRevenue.toLocaleString('it-IT')}`,
          netProfit: `€${financeStats.netProfit.toLocaleString('it-IT')}`,
          pendingPayments: `€${financeStats.pendingPayments.toLocaleString('it-IT')}`,
          activeClients: clients.length,
          newClientsThisMonth,
          sessionsToday: sessionStats.totalToday,
          sessionsCompletedThisMonth: sessionStats.completedThisMonth,
          avgSessionValue: `€${avgSessionValue.toLocaleString('it-IT')}`
        });
      } catch (error) {
        console.error('[AIAssistant] ❌ Errore caricamento contesto reale:', error);
        // In caso di errore lascia i valori a zero invece di mostrare dati finti:
        // meglio un'analisi onestamente vuota che una basata su numeri inventati.
      } finally {
        setIsContextLoading(false);
      }
    };

    loadRealBusinessContext();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: query,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    // Call Gemini with CONTEXT
    const contextString = JSON.stringify(businessContext, null, 2);
    const responseText = await generateBusinessInsight(userMsg.text, contextString);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-stone-800 hover:bg-stone-900 text-white p-4 rounded-full shadow-lg shadow-gold-500/20 transition-all hover:scale-105 flex items-center gap-2 group relative"
        >
          <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 border-2 border-stone-800 rounded-full"></span>
          <Sparkles className="w-6 h-6 text-gold-400 group-hover:animate-pulse" />
          <span className="font-medium pr-1">AI Coach</span>
        </button>
      )}

      {isOpen && (
        <div className="bg-white w-96 h-[600px] rounded-2xl shadow-2xl flex flex-col border border-stone-200 animate-in slide-in-from-bottom-10 fade-in duration-300">
          {/* Header */}
          <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg shadow-sm">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-stone-800 flex items-center gap-2">
                  Luminel AI
                  <span className="flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full border border-green-200 uppercase font-bold tracking-wider">
                    <Zap className="w-3 h-3 fill-current" /> Gemini
                  </span>
                </h3>
                <p className="text-xs text-stone-500">Business Strategist Connected</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-stone-400 hover:text-stone-600 p-1 hover:bg-stone-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/30">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                    ? 'bg-stone-800 text-white rounded-br-none'
                    : 'bg-white border border-stone-200 text-stone-700 rounded-bl-none'
                    }`}
                >
                  {msg.text.split('\n').map((line, i) => (
                    <p key={i} className={i > 0 ? 'mt-1' : ''}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-stone-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-gold-500" />
                  <span className="text-xs text-stone-400 font-medium">Analisi dati in corso...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-stone-100 bg-white rounded-b-2xl">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Chiedi un'analisi strategica..."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-gold-400 transition-colors placeholder-stone-400 text-stone-700 font-medium"
              />
              <button
                onClick={handleSend}
                disabled={loading || !query.trim()}
                className="absolute right-2 top-2 p-1.5 bg-gold-500 text-white rounded-lg hover:bg-gold-600 disabled:opacity-50 disabled:hover:bg-gold-500 transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar pb-1">
              <button onClick={() => setQuery("Analizza la retention attuale")} className="whitespace-nowrap px-3 py-1.5 bg-stone-50 hover:bg-stone-100 rounded-lg text-xs font-semibold text-stone-600 border border-stone-200 transition-colors">
                📊 Analisi Retention
              </button>
              <button onClick={() => setQuery("Come posso aumentare il fatturato questo mese?")} className="whitespace-nowrap px-3 py-1.5 bg-stone-50 hover:bg-stone-100 rounded-lg text-xs font-semibold text-stone-600 border border-stone-200 transition-colors">
                💰 Strategia Fatturato
              </button>
              <button onClick={() => setQuery("Scrivi un post Instagram per il mio ritiro autunnale")} className="whitespace-nowrap px-3 py-1.5 bg-stone-50 hover:bg-stone-100 rounded-lg text-xs font-semibold text-stone-600 border border-stone-200 transition-colors">
                ✨ Post Social
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
