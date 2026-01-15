import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle, Clock, XCircle, Trash2, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import RegistrationForm from '@/components/RegistrationForm';
import { useTournament } from '@/context/TournamentContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const PublicRegistration: React.FC = () => {
    const { tournaments, activeTournament, setActiveTournament, removeTeam, refreshTournaments } = useTournament();
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        refreshTournaments();
        if (!activeTournament && tournaments.length > 0) {
            const openTournament = tournaments.find(t => !t.config.registrationClosed);
            if (openTournament) setActiveTournament(openTournament.id);
            else setActiveTournament(tournaments[0].id);
        }
    }, [tournaments, activeTournament, setActiveTournament, refreshTournaments]);

    const myTeam = user && activeTournament
        ? activeTournament.teams.find(t => String(t.player1Id) === String(user.id) || String(t.player2Id) === String(user.id))
        : null;

    const handleUnregister = async () => {
        if (!myTeam) return;
        if (confirm("¿Estás seguro de cancelar tu inscripción?")) {
            await removeTeam(myTeam.id);
            toast.success("Has cancelado tu inscripción.");
        }
    };

    if (tournaments.length === 0) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container mx-auto px-4 py-20 text-center">
                    <h2 className="text-2xl font-black text-white uppercase mb-4">No hay torneos disponibles</h2>
                    <Link to="/">
                        <Button variant="ghost">Volver al Inicio</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-12">
                <div className="max-w-2xl mx-auto">
                    <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Volver a inicio
                    </Link>

                    <div className="mb-10 text-center">
                        <h1 className="font-display font-black text-4xl md:text-5xl text-white uppercase tracking-tighter mb-4">
                            Inscripción al Torneo
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Completa tus datos y espera la confirmación del organizador.
                        </p>
                    </div>

                    {/* Tournament Selector for Public */}
                    {tournaments.length > 1 && (
                        <div className="mb-8 flex justify-center gap-4 flex-wrap">
                            {tournaments.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setActiveTournament(t.id)}
                                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${activeTournament?.id === t.id
                                        ? 'bg-primary text-background border-primary'
                                        : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                                        }`}
                                >
                                    {t.config.name}
                                </button>
                            ))}
                        </div>
                    )}

                    {activeTournament ? (
                        <div className="animate-slide-up">
                            {myTeam ? (
                                <div className="tournament-card border-l-4 border-l-primary bg-primary/5">
                                    <div className="flex items-start justify-between mb-6">
                                        <div>
                                            <h3 className="font-display font-black text-2xl text-foreground uppercase tracking-tight mb-2">
                                                Estás Inscrito
                                            </h3>
                                            <p className="text-sm text-muted-foreground">Tu solicitud ha sido recibida y procesada.</p>
                                        </div>
                                        <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${myTeam.status === 'approved' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                                            myTeam.status === 'rejected' ? 'bg-destructive/10 border-destructive/20 text-destructive' :
                                                'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
                                            }`}>
                                            {myTeam.status === 'approved' ? <CheckCircle className="w-4 h-4" /> :
                                                myTeam.status === 'rejected' ? <XCircle className="w-4 h-4" /> :
                                                    <Clock className="w-4 h-4" />}
                                            <span className="text-xs font-black uppercase tracking-widest">
                                                {myTeam.status === 'approved' ? 'Aceptada' :
                                                    myTeam.status === 'rejected' ? 'Rechazada' :
                                                        'Pendiente'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-background/50 rounded-xl p-6 border border-white/5 mb-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-white/30 mb-1">Jugador 1</p>
                                                <p className="font-bold text-lg">{myTeam.player1.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-white/30 mb-1">Jugador 2</p>
                                                <p className="font-bold text-lg">{myTeam.player2.name}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-white/5">
                                            <p className="text-[10px] uppercase font-bold text-white/30 mb-1">Categoría</p>
                                            <p className="font-bold text-lg text-primary">{myTeam.category || 'General'}</p>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleUnregister}
                                        variant="destructive"
                                        className="w-full bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Cancelar Inscripción
                                    </Button>
                                </div>
                            ) : (
                                <RegistrationForm isPublic={true} />
                            )}
                        </div>
                    ) : (
                        <div className="text-center p-12 bg-white/5 rounded-3xl border border-white/10">
                            <p className="text-muted-foreground">Cargando torneos...</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default PublicRegistration;
