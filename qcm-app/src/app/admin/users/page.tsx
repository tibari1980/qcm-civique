'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Search, ShieldCheck, ShieldOff, Eye } from 'lucide-react';
import Link from 'next/link';
import { AdminService, type AdminUserRow } from '@/services/admin.service';
import { useAdminGuard } from '@/lib/adminGuard';

const TRACK_LABEL: Record<string, string> = {
    residence: '🏠 Résidence',
    naturalisation: '🇫🇷 Naturalisation',
};

export default function AdminUsersPage() {
    useAdminGuard();
    const [users, setUsers] = useState<AdminUserRow[]>([]);
    const [filtered, setFiltered] = useState<AdminUserRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [updatingUid, setUpdatingUid] = useState<string | null>(null);

    const loadUsers = useCallback(async () => {
        setLoading(true);
        const data = await AdminService.getAllUsers(100);
        setUsers(data);
        setFiltered(data);
        setLoading(false);
    }, []);

    useEffect(() => { loadUsers(); }, [loadUsers]);

    useEffect(() => {
        const q = search.toLowerCase();
        setFiltered(users.filter(u =>
            u.displayName.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q)
        ));
    }, [search, users]);

    const toggleRole = async (uid: string, current: string) => {
        setUpdatingUid(uid);
        const newRole = current === 'admin' ? 'user' : 'admin';
        await AdminService.updateUserRole(uid, newRole);
        setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u));
        setUpdatingUid(null);
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
                    <p className="text-gray-500 text-sm mt-1">{users.length} inscrits</p>
                </div>
                {/* Search */}
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
                    <input
                        type="search"
                        placeholder="Nom ou email…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002394]/30"
                        aria-label="Rechercher un utilisateur"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-[#002394] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm" aria-label="Liste des utilisateurs">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                                    <th className="px-4 py-3 font-semibold text-gray-600">Utilisateur</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600">Parcours</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600 text-center">Tentatives</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600 text-center">Score moy.</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600 text-center">Rôle</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map(u => (
                                    <tr key={u.uid} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#002394] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                                    {u.displayName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{u.displayName}</p>
                                                    <p className="text-xs text-gray-400">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {u.track ? TRACK_LABEL[u.track] || u.track : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-center font-medium text-gray-700">
                                            {u.totalAttempts}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={[
                                                'px-2 py-0.5 rounded-full text-xs font-semibold',
                                                u.averageScore >= 70
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : u.averageScore > 0
                                                        ? 'bg-amber-100 text-amber-700'
                                                        : 'bg-gray-100 text-gray-500',
                                            ].join(' ')}>
                                                {u.averageScore > 0 ? `${u.averageScore}%` : '—'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={[
                                                'px-2 py-0.5 rounded-full text-xs font-semibold',
                                                u.role === 'admin'
                                                    ? 'bg-blue-100 text-[#002394]'
                                                    : 'bg-gray-100 text-gray-500',
                                            ].join(' ')}>
                                                {u.role === 'admin' ? 'Admin' : 'Utilisateur'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/users/${u.uid}`}
                                                    className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-[#002394] transition-colors"
                                                    aria-label={`Voir le détail de ${u.displayName}`}
                                                >
                                                    <Eye className="h-4 w-4" aria-hidden="true" />
                                                </Link>
                                                <button
                                                    onClick={() => toggleRole(u.uid, u.role)}
                                                    disabled={updatingUid === u.uid}
                                                    className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors disabled:opacity-50"
                                                    aria-label={u.role === 'admin'
                                                        ? `Retirer les droits admin de ${u.displayName}`
                                                        : `Promouvoir ${u.displayName} en admin`}
                                                >
                                                    {u.role === 'admin'
                                                        ? <ShieldOff className="h-4 w-4" aria-hidden="true" />
                                                        : <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                                                    }
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12 text-gray-400">
                                            Aucun utilisateur trouvé
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
