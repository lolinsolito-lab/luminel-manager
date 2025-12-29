
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Info, AlertTriangle, CheckCircle2, Sparkles, Clock, Check } from 'lucide-react';
import { useUI } from '../contexts/UIContext';

interface NotificationDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
    const { notifications, unreadCount, markAsRead, markAllAsRead, dismissNotification } = useUI();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-[100]"
                    />

                    {/* Compact Dropdown Panel */}
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed top-16 right-4 w-full max-w-sm bg-white rounded-2xl shadow-2xl z-[101] border border-stone-100 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-stone-100 flex justify-between items-center bg-gradient-to-r from-stone-50 to-white">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-50 rounded-lg">
                                    <Bell className="w-4 h-4 text-amber-600" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-stone-900">Notifiche</h2>
                                    {unreadCount > 0 && (
                                        <span className="text-[10px] text-amber-600 font-bold">{unreadCount} non lette</span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-stone-900 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Notifications List - Auto height with max */}
                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length > 0 ? (
                                <div className="divide-y divide-stone-50">
                                    {notifications.map((notif) => (
                                        <motion.div
                                            key={notif.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0, height: 0 }}
                                            onClick={() => markAsRead(notif.id)}
                                            className={`px-5 py-4 hover:bg-stone-50 transition-colors cursor-pointer relative group ${notif.read ? 'opacity-60' : ''
                                                }`}
                                        >
                                            <div className="flex gap-3">
                                                {/* Icon */}
                                                <div className={`p-2 rounded-lg flex-shrink-0 ${notif.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
                                                        notif.type === 'magic' ? 'bg-amber-50 text-amber-600' :
                                                            notif.type === 'warning' ? 'bg-rose-50 text-rose-600' :
                                                                'bg-blue-50 text-blue-600'
                                                    }`}>
                                                    {notif.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> :
                                                        notif.type === 'magic' ? <Sparkles className="w-4 h-4" /> :
                                                            notif.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
                                                                <Info className="w-4 h-4" />}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <h4 className={`text-sm font-semibold leading-tight ${notif.read ? 'text-stone-500' : 'text-stone-900'}`}>
                                                            {notif.title}
                                                        </h4>
                                                        {!notif.read && (
                                                            <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 mt-1.5" />
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">
                                                        {notif.message}
                                                    </p>
                                                    <span className="text-[10px] text-stone-400 flex items-center gap-1 mt-1">
                                                        <Clock className="w-2.5 h-2.5" /> {notif.time}
                                                    </span>
                                                </div>

                                                {/* Dismiss button on hover */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        dismissNotification(notif.id);
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-stone-200 rounded-lg transition-all text-stone-400 hover:text-stone-600"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 flex flex-col items-center justify-center text-stone-400">
                                    <div className="p-4 bg-stone-50 rounded-full mb-3">
                                        <Bell className="w-8 h-8 opacity-30" />
                                    </div>
                                    <p className="text-sm font-medium">Nessuna notifica</p>
                                    <p className="text-xs text-stone-300 mt-1">Tutto calmo nel tuo impero</p>
                                </div>
                            )}
                        </div>

                        {/* Footer - Only show if there are unread notifications */}
                        {unreadCount > 0 && (
                            <div className="px-5 py-3 border-t border-stone-100 bg-stone-50/50">
                                <button
                                    onClick={markAllAsRead}
                                    className="w-full py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-stone-800 transition-all flex items-center justify-center gap-2"
                                >
                                    <Check className="w-4 h-4" />
                                    Segna tutte come lette
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
