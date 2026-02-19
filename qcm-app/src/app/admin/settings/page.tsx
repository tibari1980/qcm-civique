'use client';

import React, { useEffect, useState } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import { AdminService } from '@/services/admin.service';
import { useAdminGuard } from '@/lib/adminGuard';

interface AppSettings {
    questionsPerExam: number;
    passThreshold: number;
    enableInterview: boolean;
    enableAIQCM: boolean;
    announcementMessage: string;
    announcementActive: boolean;
}

const DEFAULTS: AppSettings = {
    questionsPerExam: 40,
    passThreshold: 75,
    enableInterview: true,
    enableAIQCM: true,
    announcementMessage: '',
    announcementActive: false,
};

export default function AdminSettingsPage() {
    useAdminGuard();
    const [settings, setSettings] = useState<AppSettings>(DEFAULTS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        AdminService.getAppSettings().then(raw => {
            setSettings({ ...DEFAULTS, ...(raw as Partial<AppSettings>) });
            setLoading(false);
        });
    }, []);

    const set = <K extends keyof AppSettings>(k: K, v: AppSettings[K]) =>
        setSettings(s => ({ ...s, [k]: v }));

    const handleSave = async () => {
        setSaving(true);
        await AdminService.saveAppSettings(JSON.parse(JSON.stringify(settings)) as Record<string, unknown>);
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleReset = () => setSettings(DEFAULTS);

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#002394] border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
                <p className="text-gray-500 text-sm mt-1">Configuration globale de l&apos;application</p>
            </div>

            {saved && (
                <div role="status" className="mb-5 flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">
                    ✅ Paramètres enregistrés avec succès.
                </div>
            )}

            <div className="space-y-5">
                {/* Examens */}
                <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <h2 className="font-semibold text-gray-900 mb-4">Paramètres des examens</h2>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="questionsPerExam" className="block text-sm font-medium text-gray-700 mb-1">
                                Questions par examen blanc
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    id="questionsPerExam"
                                    type="number" min={5} max={100}
                                    value={settings.questionsPerExam}
                                    onChange={e => set('questionsPerExam', Number(e.target.value))}
                                    className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#002394]/30"
                                />
                                <span className="text-sm text-gray-400">questions (défaut : 40)</span>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="passThreshold" className="block text-sm font-medium text-gray-700 mb-1">
                                Seuil de réussite (%)
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    id="passThreshold"
                                    type="number" min={50} max={100}
                                    value={settings.passThreshold}
                                    onChange={e => set('passThreshold', Number(e.target.value))}
                                    className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#002394]/30"
                                />
                                <span className="text-sm text-gray-400">% (défaut : 75%)</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Fonctionnalités */}
                <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <h2 className="font-semibold text-gray-900 mb-4">Fonctionnalités</h2>
                    <div className="space-y-3">
                        {([
                            { key: 'enableInterview', label: "Entretien simulé", desc: "Active l'onglet Entretien dans la navigation" },
                            { key: 'enableAIQCM', label: "QCM IA (Gemini)", desc: "Active la génération de questions par IA" },
                        ] as const).map(({ key, label, desc }) => (
                            <div key={key} className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">{label}</p>
                                    <p className="text-xs text-gray-400">{desc}</p>
                                </div>
                                <button
                                    role="switch"
                                    aria-checked={settings[key]}
                                    onClick={() => set(key, !settings[key])}
                                    className={[
                                        'relative inline-flex w-10 h-6 rounded-full transition-colors flex-shrink-0',
                                        settings[key] ? 'bg-[#002394]' : 'bg-gray-200',
                                    ].join(' ')}
                                >
                                    <span className={[
                                        'absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform',
                                        settings[key] ? 'translate-x-5' : 'translate-x-1',
                                    ].join(' ')} aria-hidden="true" />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Annonce */}
                <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-gray-900">Message d&apos;annonce</h2>
                        <button
                            role="switch"
                            aria-checked={settings.announcementActive}
                            onClick={() => set('announcementActive', !settings.announcementActive)}
                            className={[
                                'relative inline-flex w-10 h-6 rounded-full transition-colors',
                                settings.announcementActive ? 'bg-[#002394]' : 'bg-gray-200',
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
                        placeholder="Message affiché en bannière sur toute l'application…"
                        rows={3}
                        disabled={!settings.announcementActive}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#002394]/30 resize-none disabled:opacity-50 disabled:bg-gray-50"
                    />
                </section>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-between">
                <button onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-gray-300 transition-colors">
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    Réinitialiser
                </button>
                <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#002394] text-white rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50"
                    aria-busy={saving}>
                    {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="h-4 w-4" aria-hidden="true" />}
                    {saving ? 'Sauvegarde…' : 'Sauvegarder'}
                </button>
            </div>
        </div>
    );
}
