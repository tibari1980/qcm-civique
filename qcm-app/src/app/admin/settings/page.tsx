'use client';

import React, { useEffect, useState } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import { AdminService } from '@/services/admin.service';
import { useAdminGuard } from '@/lib/adminGuard';
import { useSettings } from '@/context/SettingsContext';

interface AppSettings {
    questionsPerExam: number;
    passThreshold: number;
    enableInterview: boolean;
    enableAIQCM: boolean;
    announcementMessage: string;
    announcementActive: boolean;
    // New fields
    appName: string;
    brandColor: string;
    contactEmail: string;
    socialInstagram: string;
    socialLinkedIn: string;
    maintenanceMode: boolean;
}

const DEFAULTS: AppSettings = {
    questionsPerExam: 40,
    passThreshold: 75,
    enableInterview: true,
    enableAIQCM: true,
    announcementMessage: '',
    announcementActive: false,
    // New defaults
    appName: 'Prépa Civique',
    brandColor: '#002394',
    contactEmail: 'contact@jl-cloud.fr',
    socialInstagram: '',
    socialLinkedIn: '',
    maintenanceMode: false,
};

export default function AdminSettingsPage() {
    useAdminGuard();
    const [settings, setSettings] = useState<AppSettings>(DEFAULTS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { refreshSettings } = useSettings();

    useEffect(() => {
        AdminService.getAppSettings()
            .then(raw => {
                setSettings({ ...DEFAULTS, ...(raw as Partial<AppSettings>) });
            })
            .catch(err => {
                console.error('Settings load error:', err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const set = <K extends keyof AppSettings>(k: K, v: AppSettings[K]) =>
        setSettings(s => ({ ...s, [k]: v }));

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            await AdminService.saveAppSettings(JSON.parse(JSON.stringify(settings)) as Record<string, unknown>);
            await refreshSettings();
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error('Save error:', err);
            setError("Erreur lors de l'enregistrement. Vérifiez vos permissions.");
            setTimeout(() => setError(null), 5000);
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        if (window.confirm('Réinitialiser tous les paramètres par défaut ?')) {
            setSettings(DEFAULTS);
        }
    };

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
                <p className="text-gray-500 text-sm mt-1">Configuration globale et identité de l&apos;application</p>
            </div>

            {saved && (
                <div role="status" className="fixed top-24 right-6 z-50 flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-4">
                    ✅ Paramètres enregistrés avec succès.
                </div>
            )}

            {error && (
                <div role="alert" className="fixed top-24 right-6 z-50 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-4">
                    ❌ {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                    {/* Identité */}
                    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-[var(--color-primary)] rounded-full" />
                            Identité Visuelle
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="appName" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                    Nom de l&apos;application
                                </label>
                                <input
                                    id="appName"
                                    type="text"
                                    value={settings.appName}
                                    onChange={e => set('appName', e.target.value)}
                                    placeholder="Ex: Prépa Civique"
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                                />
                            </div>
                            <div>
                                <label htmlFor="brandColor" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                    Couleur principale (Brand)
                                </label>
                                <div className="flex gap-3">
                                    <input
                                        id="brandColor"
                                        type="color"
                                        value={settings.brandColor}
                                        onChange={e => set('brandColor', e.target.value)}
                                        className="h-9 w-12 border-none p-0 cursor-pointer rounded overflow-hidden"
                                    />
                                    <input
                                        type="text"
                                        value={settings.brandColor}
                                        onChange={e => set('brandColor', e.target.value)}
                                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Paramètres des examens */}
                    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-[var(--color-primary)] rounded-full" />
                            Configuration Examens
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="questionsPerExam" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                    Questions par examen blanc
                                </label>
                                <input
                                    id="questionsPerExam"
                                    type="number" min={5} max={100}
                                    value={settings.questionsPerExam}
                                    onChange={e => set('questionsPerExam', Number(e.target.value))}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                                />
                            </div>
                            <div>
                                <label htmlFor="passThreshold" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                    Seuil de réussite (%)
                                </label>
                                <input
                                    id="passThreshold"
                                    type="number" min={50} max={100}
                                    value={settings.passThreshold}
                                    onChange={e => set('passThreshold', Number(e.target.value))}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                                />
                            </div>
                        </div>
                    </section>
                </div>

                <div className="space-y-6">
                    {/* Contact & Social */}
                    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-[var(--color-primary)] rounded-full" />
                            Contact & Réseaux
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="contactEmail" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                    Email de contact/support
                                </label>
                                <input
                                    id="contactEmail"
                                    type="email"
                                    value={settings.contactEmail}
                                    onChange={e => set('contactEmail', e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="instagram" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                        Instagram
                                    </label>
                                    <input
                                        id="instagram"
                                        type="text"
                                        value={settings.socialInstagram}
                                        onChange={e => set('socialInstagram', e.target.value)}
                                        placeholder="@user"
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="linkedin" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                        LinkedIn
                                    </label>
                                    <input
                                        id="linkedin"
                                        type="text"
                                        value={settings.socialLinkedIn}
                                        onChange={e => set('socialLinkedIn', e.target.value)}
                                        placeholder="username"
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Fonctionnalités & Maintenance */}
                    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-[var(--color-primary)] rounded-full" />
                            Système
                        </h2>
                        <div className="space-y-4">
                            {([
                                { key: 'enableInterview', label: "Entretien simulé", desc: "Active l'onglet de préparation à l'entretien" },
                                { key: 'enableAIQCM', label: "Questions par IA", desc: "Autorise la génération de QCM via Gemini" },
                                { key: 'maintenanceMode', label: "Mode Maintenance", desc: "Bloque l'accès aux utilisateurs (bientôt)" },
                            ] as const).map(({ key, label, desc }) => (
                                <div key={key} className="flex items-center justify-between gap-4 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">{label}</p>
                                        <p className="text-[10px] text-gray-400 leading-tight">{desc}</p>
                                    </div>
                                    <button
                                        role="switch"
                                        aria-checked={settings[key]}
                                        onClick={() => set(key, !settings[key])}
                                        className={[
                                            'relative inline-flex w-9 h-5 rounded-full transition-colors flex-shrink-0',
                                            settings[key] ? 'bg-[var(--color-primary)]' : 'bg-gray-200',
                                        ].join(' ')}
                                    >
                                        <span className={[
                                            'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
                                            settings[key] ? 'translate-x-[1.125rem]' : 'translate-x-0.5',
                                        ].join(' ')} aria-hidden="true" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="md:col-span-2">
                    {/* Annonce */}
                    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-[var(--color-primary)] rounded-full" />
                                Message d&apos;annonce (Bannière)
                            </h2>
                            <button
                                role="switch"
                                aria-checked={settings.announcementActive}
                                onClick={() => set('announcementActive', !settings.announcementActive)}
                                className={[
                                    'relative inline-flex w-10 h-6 rounded-full transition-colors',
                                    settings.announcementActive ? 'bg-[var(--color-primary)]' : 'bg-gray-200',
                                ].join(' ')}
                            >
                                <span className={[
                                    'absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform',
                                    settings.announcementActive ? 'translate-x-5' : 'translate-x-1',
                                ].join(' ')} aria-hidden="true" />
                            </button>
                        </div>
                        <textarea
                            value={settings.announcementMessage}
                            onChange={e => set('announcementMessage', e.target.value)}
                            placeholder="Message affiché en haut de l'application pour tous les utilisateurs…"
                            rows={2}
                            disabled={!settings.announcementActive}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 resize-none disabled:opacity-50 disabled:bg-gray-50"
                        />
                    </section>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
                <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-red-600 transition-colors"
                >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    Réinitialiser les défauts
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-3 bg-[var(--color-primary)] text-white rounded-xl text-sm font-semibold hover:brightness-110 transition-all shadow-md active:scale-95 disabled:opacity-50"
                    aria-busy={saving}
                >
                    {saving ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Save className="h-4 w-4" aria-hidden="true" />
                    )}
                    {saving ? 'Traitement…' : 'Enregistrer les modifications'}
                </button>
            </div>
        </div>
    );
}
