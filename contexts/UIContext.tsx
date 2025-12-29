
import React, { createContext, useContext, useState } from 'react';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'magic';
    time: string;
    read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        title: 'Nuova Categoria Vault',
        message: 'Hai aggiunto con successo la categoria "Massaggi".',
        type: 'success',
        time: '2 min fa',
        read: false
    },
    {
        id: '2',
        title: 'Sessione Imminente',
        message: 'La sessione con Mike Bellavita inizierà tra 15 minuti.',
        type: 'magic',
        time: '15 min fa',
        read: false
    },
    {
        id: '3',
        title: 'Update Sistema',
        message: 'Il nuovo Royal Calendar è ora disponibile nel tuo impero.',
        type: 'info',
        time: '1 ora fa',
        read: true
    }
];

interface UIContextType {
    // Notification Drawer State
    isNotificationsOpen: boolean;
    openNotifications: () => void;
    closeNotifications: () => void;
    toggleNotifications: () => void;

    // Notifications Data
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    dismissNotification: (id: string) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

    // Drawer controls
    const openNotifications = () => setIsNotificationsOpen(true);
    const closeNotifications = () => setIsNotificationsOpen(false);
    const toggleNotifications = () => setIsNotificationsOpen(prev => !prev);

    // Notification actions
    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const dismissNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <UIContext.Provider value={{
            isNotificationsOpen,
            openNotifications,
            closeNotifications,
            toggleNotifications,
            notifications,
            unreadCount,
            markAsRead,
            markAllAsRead,
            dismissNotification
        }}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (context === undefined) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
};
