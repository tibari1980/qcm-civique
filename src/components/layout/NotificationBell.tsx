'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Info, AlertTriangle, CheckCircle2, MessageSquare } from 'lucide-react';
import { NotificationService } from '../../services/notification.service';
import { useAuth } from '../../context/AuthContext';
import { AppNotification } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export function NotificationBell() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => n.status === 'unread').length;

    useEffect(() => {
        if (!user) return;
        const unsubscribe = NotificationService.listenNotifications(user.uid, (data) => {
            setNotifications(data);
        });
        return () => unsubscribe();
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id: string) => {
        await NotificationService.markAsRead(id);
    };

    const handleMarkAllRead = async () => {
        if (user) await NotificationService.markAllAsRead(user.uid);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
            case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
            default: return <Info className="h-4 w-4 text-blue-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={`${unreadCount} notifications non lues`}
            >
                <Bell className="h-5 w-5 text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-[100] overflow-hidden"
                    >
                        <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Tout lire
                                </button>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <MessageSquare className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                                    <p className="text-sm text-gray-400">Aucune notification</p>
                                </div>
                            ) : (
                                <ul className="divide-y divide-gray-50">
                                    {notifications.map((n) => (
                                        <li
                                            key={n.id}
                                            className={`p-4 hover:bg-gray-50 transition-colors relative ${n.status === 'unread' ? 'bg-blue-50/30' : ''}`}
                                        >
                                            <div className="flex gap-3">
                                                <div className="mt-1 flex-shrink-0">
                                                    {getIcon(n.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-0.5">
                                                        <p className={`text-sm font-bold truncate ${n.status === 'unread' ? 'text-gray-900' : 'text-gray-600'}`}>
                                                            {n.title}
                                                        </p>
                                                        {n.status === 'unread' && (
                                                            <button
                                                                onClick={() => handleMarkAsRead(n.id)}
                                                                className="h-5 w-5 flex items-center justify-center rounded-full hover:bg-blue-100 text-blue-400"
                                                                title="Marquer comme lu"
                                                            >
                                                                <Check className="h-3 w-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-2">
                                                        {n.message}
                                                    </p>
                                                    {n.link && (
                                                        <Link
                                                            href={n.link}
                                                            className="text-xs font-bold text-blue-600 hover:underline"
                                                            onClick={() => {
                                                                handleMarkAsRead(n.id);
                                                                setIsOpen(false);
                                                            }}
                                                        >
                                                            Voir plus
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {notifications.length > 0 && (
                            <Link
                                href="/profile"
                                className="block p-3 text-center text-xs font-bold text-gray-500 hover:bg-gray-50 border-t border-gray-50 uppercase tracking-widest"
                                onClick={() => setIsOpen(false)}
                            >
                                Toutes les notifications
                            </Link>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
