import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { UserService } from '@/services/user.service';
import { Loader2, User, Settings, LogOut, Check } from 'lucide-react';

export default function ProfilePage() {
    const { user, userProfile, loading, signOut } = useAuth();
    const [isUpdating, setIsUpdating] = useState(false);

    if (loading || !user) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    const currentTrack = userProfile?.track || 'residence';

    const handleTrackSwitch = async (newTrack: 'residence' | 'naturalisation') => {
        if (newTrack === currentTrack) return;

        setIsUpdating(true);
        try {
            await UserService.syncUserProfile(user.uid, { track: newTrack });
            // Ideally context updates automatically, but we might need to force refresh or wait for listener
            // For now, let's assume real-time listener in AuthContext handles it or we manually reload
            alert(`Profil mis à jour : Vous êtes maintenant sur le parcours ${newTrack === 'residence' ? 'Titre de Séjour' : 'Naturalisation'}.`);
            window.location.reload(); // Simple way to refresh everything
        } catch (error) {
            console.error("Error updating track:", error);
            alert("Erreur : Impossible de modifier le parcours.");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
                <User className="h-8 w-8 text-[var(--color-primary)]" />
                Mon Profil
            </h1>

            <div className="space-y-6">
                {/* User Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informations Personnelles</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-sm text-gray-500 font-medium">Email</span>
                            <span className="text-lg">{user.email}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-sm text-gray-500 font-medium">Nom d&apos;utilisateur</span>
                            <span className="text-lg">{user.displayName || 'Utilisateur'}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-sm text-gray-500 font-medium">Membre depuis</span>
                            <span className="text-lg">{userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'N/A'}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Track Selection Card */}
                <Card className="border-blue-100 bg-blue-50/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Mon Parcours
                        </CardTitle>
                        <p className="text-sm text-gray-500">
                            Changez de parcours pour adapter votre tableau de bord et vos examens.
                        </p>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div
                            onClick={() => handleTrackSwitch('residence')}
                            className={`cursor-pointer p-4 rounded-lg border-2 transition-all flex flex-col gap-2 ${currentTrack === 'residence'
                                ? 'border-[var(--color-primary)] bg-white shadow-md'
                                : 'border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300'
                                }`}
                        >
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-lg">Titre de Séjour</span>
                                {currentTrack === 'residence' && <Check className="text-[var(--color-primary)]" />}
                            </div>
                            <p className="text-sm text-gray-600">Pour les résidents de 10 ans ou renouvellement.</p>
                        </div>

                        <div
                            onClick={() => handleTrackSwitch('naturalisation')}
                            className={`cursor-pointer p-4 rounded-lg border-2 transition-all flex flex-col gap-2 ${currentTrack === 'naturalisation'
                                ? 'border-purple-600 bg-white shadow-md'
                                : 'border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300'
                                }`}
                        >
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-lg text-purple-900">Naturalisation</span>
                                {currentTrack === 'naturalisation' && <Check className="text-purple-600" />}
                            </div>
                            <p className="text-sm text-gray-600">Entretien d&apos;assimilation et culture française.</p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        {isUpdating && <p className="text-sm text-gray-500 flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mise à jour...</p>}
                    </CardFooter>
                </Card>

                {/* Logout Area */}
                <div className="flex justify-center mt-8">
                    <Button variant="destructive" onClick={signOut} className="w-full md:w-auto">
                        <LogOut className="mr-2 h-4 w-4" /> Se déconnecter
                    </Button>
                </div>
            </div>
        </div>
    );
}
