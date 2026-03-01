'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Search, ShieldCheck, ShieldOff, Eye, Lock, Unlock, Trash2, Download, RefreshCcw, Mail } from 'lucide-react';
import Link from 'next/link';
import { AdminService, type AdminUserRow } from '@/services/admin.service';
import { useAdminGuard } from '@/lib/adminGuard';
import { useAuth } from '@/context/AuthContext';
import { ExportUtils } from '@/lib/exportUtils';
import { Input } from '@/components/ui/input';

const TRACK_LABEL: Record<string, string> = {
    residence: '🏠 Résidence',
    naturalisation: '🇫🇷 Naturalisation',
};

export default function AdminUsersPage() {
    const { user } = useAuth();
    useAdminGuard();
    const [users, setUsers] = useState<AdminUserRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [updatingUid, setUpdatingUid] = useState<string | null>(null);
    const [syncing, setSyncing] = useState(false);
    const [testingEmail, setTestingEmail] = useState<string | null>(null);

    // Server Pagination State
    const [lastCursor, setLastCursor] = useState<any>(null);
    const [hasMore, setHasMore] = useState(false);
    const [totalUsersCount, setTotalUsersCount] = useState(0);
    const ITEMS_PER_PAGE = 20;

    const handleSync = async () => {
        if (!confirm("Voulez-vous synchroniser tous les comptes Auth vers Firestore ? Cela créera les profils manquants.")) return;
        setSyncing(true);
        try {
            const result = await AdminService.syncUsers();
            alert(result.message);
            await loadInitialUsers();
        } catch (error: any) {
            console.error("Sync failed:", error);
            alert(`La synchronisation a échoué : ${error.message || 'Erreur inconnue'}`);
        } finally {
            setSyncing(false);
        }
    };

    const handleTestEmail = async (email: string) => {
        const senderEmail = prompt(`Envoyer un email de test à ${email} ?\n\nLaissez vide pour utiliser contact@civiqquiz.com\nOu entrez votre email vérifié Brevo (ex: ${user?.email}) :`, "");
        if (senderEmail === null) return; // Cancelled

        setTestingEmail(email);
        try {
            const response = await fetch('/api/admin/test-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senderEmail: senderEmail || undefined })
            });
            const result = await response.json();

            if (result.success) {
                alert(`✅ Succès : Email envoyé !\nExpéditeur utilisé : ${result.senderUsed}\nMessage ID: ${result.brevoResponse.messageId}`);
            } else {
                alert(`❌ Échec : ${result.error || 'Erreur inconnue'}\nStatus: ${result.status}\nDétails: ${JSON.stringify(result.brevoResponse)}`);
            }
        } catch (error) {
            console.error("Test email failed:", error);
            alert("Erreur lors de l'appel à l'API de test.");
        } finally {
            setTestingEmail(null);
        }
    };


    const loadInitialUsers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await AdminService.getPaginatedUsers(ITEMS_PER_PAGE);
            setUsers(data.users);
            setLastCursor(data.nextCursor);
            setHasMore(!!data.nextCursor);
            setTotalUsersCount(data.totalCount);
        } catch (error) {
            console.error("Failed to load initial users:", error);
        } finally {
            setLoading(false);
        }
    }, [ITEMS_PER_PAGE]);

    const loadMoreUsers = async () => {
        if (!hasMore || loading) return;
        try {
            // Un petit indicateur de chargement pour la suite (facultatif si rapide)
            const data = await AdminService.getPaginatedUsers(ITEMS_PER_PAGE, lastCursor);
            setUsers(prev => [...prev, ...data.users]);
            setLastCursor(data.nextCursor);
            setHasMore(!!data.nextCursor);
        } catch (error) {
            console.error("Failed to load more users:", error);
        }
    };

    useEffect(() => {
        loadInitialUsers();
    }, [loadInitialUsers]);



    // Filtering happens client-side ON loaded users for now.
    // Server-side searching would require Algolia or specific indexed queries.
    const paginatedUsers = useMemo(() => {
        const q = search.toLowerCase();
        if (!q) return users;
        return users.filter(u =>
            u.displayName.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q)
        );
    }, [search, users]);

    const toggleRole = async (uid: string, current: string) => {
        setUpdatingUid(uid);
        const newRole = current === 'admin' ? 'user' : 'admin';
        await AdminService.updateUserRole(uid, newRole);
        setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u));
        setUpdatingUid(null);
    };

    const toggleStatus = async (uid: string, currentDisabled: boolean) => {
        if (!confirm(`Voulez-vous ${currentDisabled ? 'réactiver' : 'bloquer'} cet utilisateur ?`)) return;
        setUpdatingUid(uid);
        await AdminService.setUserStatus(uid, !currentDisabled);
        setUsers(prev => prev.map(u => u.uid === uid ? { ...u, disabled: !currentDisabled } : u));
        setUpdatingUid(null);
    };

    const handleDelete = async (uid: string, name: string) => {
        if (!confirm(`ATTENTION: Cette action est irréversible. Voulez-vous supprimer définitivement le profil de ${name} ?`)) return;

        // --- Optimistic UI: Suppression instantanée pour la rapidité ---
        const previousUsers = [...users];
        setUsers(prev => prev.filter(u => u.uid !== uid));

        try {
            setUpdatingUid(uid);
            const result = await AdminService.deleteUser(uid);
            // On peut loguer le succès ou montrer un petit feedback non bloquant
            console.log("Suppression réussie:", result);
        } catch (error: any) {
            console.error("Échec de la suppression:", error);
            alert(`Erreur lors de la suppression de ${name} : ${error.message || 'Le serveur n\'a pas répondu'}`);
            // Rollback en cas d'échec
            setUsers(previousUsers);
        } finally {
            setUpdatingUid(null);
        }
    };

    const handleExport = async () => {
        try {
            const allUsers = await AdminService.getUsersForExport();
            ExportUtils.jsonToExcel(allUsers, {
                uid: 'ID',
                email: 'Email',
                displayName: 'Nom d\'affichage',
                role: 'Rôle',
                track: 'Parcours',
                totalAttempts: 'Nb Tentatives',
                averageScore: 'Score Moyen (%)',
                createdAt: 'Date d\'inscription',
                disabled: 'Statut Bloqué'
            }, `utilisateurs_qcm_${new Date().toISOString().slice(0, 10)}.xlsx`);
        } catch (error) {
            console.error("Export failed:", error);
            alert("L'exportation a échoué.");
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
                        <p className="text-gray-500 text-sm mt-1">{users.length} inscrits</p>
                    </div>
                    <button
                        onClick={handleExport}
                        className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                        title="Exporter en CSV"
                    >
                        <Download className="h-5 w-5" />
                    </button>
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors disabled:opacity-50 flex items-center gap-2"
                        title="Réparer la base (Sync Auth -> Firestore)"
                    >
                        <RefreshCcw className={`h-5 w-5 ${syncing ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline text-sm font-medium">Réparer la base</span>
                    </button>
                </div>
                {/* Search */}
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
                    <input
                        type="search"
                        placeholder="Nom ou email…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                        aria-label="Rechercher un utilisateur"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <>
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
                                        <th className="px-4 py-3 font-semibold text-gray-600 text-center">Statut</th>
                                        <th className="px-4 py-3 font-semibold text-gray-600 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {paginatedUsers.map(u => (
                                        <tr key={u.uid} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
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
                                                        ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
                                                        : 'bg-gray-100 text-gray-500',
                                                ].join(' ')}>
                                                    {u.role === 'admin' ? 'Admin' : 'Utilisateur'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={[
                                                    'px-2 py-0.5 rounded-full text-xs font-semibold',
                                                    u.disabled
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'bg-green-100 text-green-700',
                                                ].join(' ')}>
                                                    {u.disabled ? 'Bloqué' : 'Actif'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/admin/users/details?uid=${u.uid}`}
                                                        className="p-1.5 rounded-lg hover:bg-[var(--color-primary-soft)] text-gray-400 hover:text-[var(--color-primary)] transition-colors"
                                                        aria-label={`Voir le détail de ${u.displayName}`}
                                                    >
                                                        <Eye className="h-4 w-4" aria-hidden="true" />
                                                    </Link>
                                                    <button
                                                        onClick={() => toggleRole(u.uid, u.role)}
                                                        disabled={updatingUid === u.uid}
                                                        className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors disabled:opacity-50"
                                                        title={u.role === 'admin'
                                                            ? `Retirer les droits admin`
                                                            : `Promouvoir en admin`}
                                                    >
                                                        {u.role === 'admin'
                                                            ? <ShieldOff className="h-4 w-4" aria-hidden="true" />
                                                            : <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                                                        }
                                                    </button>
                                                    <button
                                                        onClick={() => toggleStatus(u.uid, !!u.disabled)}
                                                        disabled={updatingUid === u.uid}
                                                        className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${u.disabled
                                                            ? 'hover:bg-green-50 text-gray-400 hover:text-green-600'
                                                            : 'hover:bg-red-50 text-gray-400 hover:text-red-600'
                                                            }`}
                                                        title={u.disabled ? 'Débloquer' : 'Bloquer'}
                                                    >
                                                        {u.disabled
                                                            ? <Unlock className="h-4 w-4" aria-hidden="true" />
                                                            : <Lock className="h-4 w-4" aria-hidden="true" />
                                                        }
                                                    </button>
                                                    <button
                                                        onClick={() => handleTestEmail(u.email)}
                                                        disabled={!!testingEmail}
                                                        className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors disabled:opacity-50"
                                                        title="Tester l'envoi d'email"
                                                    >
                                                        <Mail className={`h-4 w-4 ${testingEmail === u.email ? 'animate-pulse' : ''}`} aria-hidden="true" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(u.uid, u.displayName)}
                                                        disabled={updatingUid === u.uid}
                                                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                                                        title="Supprimer"
                                                        aria-label={`Supprimer l'utilisateur ${u.displayName}`}
                                                    >
                                                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {paginatedUsers.length === 0 && (
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

                    {!loading && hasMore && !search && (
                        <div className="flex justify-center p-6 border-t border-gray-100 bg-gray-50/50">
                            <button
                                onClick={loadMoreUsers}
                                className="px-6 py-2 bg-white text-[var(--color-primary)] font-bold text-sm border border-[var(--color-primary)] rounded-full shadow-sm hover:bg-blue-50 transition-colors"
                            >
                                Charger plus d'utilisateurs
                            </button>
                        </div>
                    )}
                    {search && (
                        <div className="p-4 text-center text-xs text-gray-400 border-t border-gray-50 bg-gray-50/30">
                            La recherche s'effectue uniquement sur les {users.length} utilisateurs actuellement chargés.
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
