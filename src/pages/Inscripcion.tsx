import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, AlertCircle, Trophy, Filter, CheckCircle, Clock, XCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import RegistrationForm from '@/components/RegistrationForm';
import TeamCard from '@/components/TeamCard';
import ProgressBar from '@/components/ProgressBar';
import { useTournament } from '@/context/TournamentContext';
import { toast } from 'sonner';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Team } from "@/types/tournament";

const Inscripcion: React.FC = () => {
    const { tournaments, activeTournament, setActiveTournament, removeTeam, updateTeam } = useTournament();
    const [levelFilter, setLevelFilter] = useState<'Todos' | 'Iniciación' | 'Nivel Medio'>('Todos');
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);
    const [myTeamId, setMyTeamId] = useState<string | null>(null);

    useEffect(() => {
        // If no tournament is active but we have tournaments, select the first one
        if (!activeTournament && tournaments.length > 0) {
            setActiveTournament(tournaments[0].id);
        }
    }, [activeTournament, tournaments, setActiveTournament]);

    useEffect(() => {
        if (activeTournament) {
            const storedId = localStorage.getItem(`ard_padel_team_${activeTournament.id}`);
            setMyTeamId(storedId);
        }
    }, [activeTournament]);

    const handleUpdateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTeam) return;

        const formData = new FormData(e.target as HTMLFormElement);
        const updates = {
            player1: { name: formData.get('player1') as string },
            player2: { name: formData.get('player2') as string },
            category: formData.get('category') as string,
        };

        await updateTeam(editingTeam.id, updates);
        setEditingTeam(null);
    };

    const handleUnregister = async () => {
        if (!myTeamId || !activeTournament) return;
        if (confirm("¿Estás seguro de cancelar tu inscripción?")) {
            await removeTeam(myTeamId);
            localStorage.removeItem(`ard_padel_team_${activeTournament.id}`);
            setMyTeamId(null);
            toast.success("Has cancelado tu inscripción.");
        }
    };

    if (tournaments.length === 0) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-md mx-auto text-center tournament-card">
                        <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h2 className="font-display font-bold text-2xl text-foreground mb-2">
                            No hay torneos disponibles
                        </h2>
                        <p className="text-muted-foreground mb-6">
                            Primero debes crear un torneo en el panel de control.
                        </p>
                        <Link to="/organizador">
                            <Button className="btn-primary-gradient">
                                Ir al Organizador
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!activeTournament) return null;

    const isRegistrationClosed = activeTournament.config.registrationClosed || (activeTournament.phase && activeTournament.phase !== 'registration');
    const myTeam = myTeamId ? activeTournament.teams.find(t => t.id === myTeamId) : null;

    // Cleanup local storage if team was deleted by organizer
    if (myTeamId && !myTeam && activeTournament.teams.length > 0) {
        // Logic check: only clear if we are sure it's loaded. 
        // Context loads all teams. If not found, it's gone.
        // But we should be careful about initial load. 
        // We'll leave it for now or assume if context is loaded (activeTournament exists), team should be there.
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-8">
                {/* Tournament Selector Bar */}
                <div className="mb-12 overflow-x-auto pb-4 custom-scrollbar">
                    <div className="flex gap-4 min-w-max">
                        {tournaments.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTournament(t.id)}
                                className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all duration-300 ${activeTournament.id === t.id
                                    ? 'bg-primary border-primary text-background shadow-[0_10px_20px_-10px_rgba(25,231,142,0.5)] scale-105'
                                    : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                                    }`}
                            >
                                <Trophy className={`w-4 h-4 ${activeTournament.id === t.id ? 'text-background' : 'text-primary'}`} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{t.config.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-8 animate-fade-in">
                    <h1 className="font-display font-black text-4xl text-foreground mb-2 uppercase tracking-tighter">
                        Participantes
                    </h1>
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isRegistrationClosed ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                            {isRegistrationClosed ? 'Inscripciones Cerradas' : 'Inscripciones Abiertas'}
                        </span>
                        <span className="text-white/20">/</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{activeTournament.config.name}</span>
                    </div>
                </div>

                {/* Registration Section */}
                <div className="max-w-2xl mx-auto mb-16">
                    {/* Registration Form or Status */}
                    <div className="animate-slide-up">
                        <RegistrationForm isAdmin={true} />
                    </div>
                </div>

                {/* Participants Section */}
                <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
                    {(() => {
                        const pendingTeams = activeTournament.teams.filter(team => team.status === 'pending');
                        const filteredTeams = activeTournament.teams.filter(team =>
                            (levelFilter === 'Todos' || team.category === levelFilter) && team.status !== 'pending'
                        );

                        return (
                            <div className="space-y-10">
                                {/* Pending Requests Section */}
                                {pendingTeams.length > 0 && (
                                    <div className="mb-12 animate-fade-in border-b border-white/5 pb-12">
                                        <div className="flex items-center gap-5 mb-8">
                                            <div className="w-14 h-14 rounded-3xl bg-accent/10 flex items-center justify-center relative">
                                                <Users className="w-7 h-7 text-accent" />
                                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">{pendingTeams.length}</span>
                                            </div>
                                            <div>
                                                <h2 className="font-display font-black text-3xl text-foreground uppercase tracking-tight">
                                                    Solicitudes Pendientes
                                                </h2>
                                                <p className="text-[10px] uppercase font-black tracking-[0.3em] text-white/30">
                                                    Requieren aprobación
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {pendingTeams.map((team) => (
                                                <div key={team.id} className="tournament-card group relative overflow-hidden border-accent/20 bg-accent/5">
                                                    <div className="absolute top-0 right-0 p-4 opacity-50">
                                                        <AlertCircle className="w-16 h-16 text-accent/20" />
                                                    </div>
                                                    <div className="relative z-10">
                                                        <h4 className="font-bold text-lg mb-1">{team.player1.name} & {team.player2.name}</h4>
                                                        <p className="text-xs uppercase tracking-widest text-accent mb-4">{team.category || 'Sin Nivel'}</p>

                                                        <div className="space-y-2 mb-6 text-sm text-muted-foreground">
                                                            <p className="flex items-center gap-2"><span className="text-white/40 text-[10px] uppercase">J1 (+34):</span> {team.player1.phone || '---'}</p>
                                                            <p className="flex items-center gap-2"><span className="text-white/40 text-[10px] uppercase">J2 (+34):</span> {team.player2.phone || '---'}</p>
                                                        </div>

                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                className="flex-1 bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20"
                                                                onClick={() => updateTeam(team.id, { status: 'approved' })}
                                                            >
                                                                Aprobar
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                className="flex-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20"
                                                                onClick={() => {
                                                                    if (confirm('¿Rechazar solicitud?')) removeTeam(team.id);
                                                                }}
                                                            >
                                                                Rechazar
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-8">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-3xl bg-primary/10 flex items-center justify-center">
                                            <Users className="w-7 h-7 text-primary" />
                                        </div>
                                        <div>
                                            <h2 className="font-display font-black text-3xl text-foreground uppercase tracking-tight">
                                                Parejas Inscritas
                                            </h2>
                                            <p className="text-[10px] uppercase font-black tracking-[0.3em] text-white/30">
                                                {filteredTeams.length} parejas {levelFilter === 'Todos' ? 'en total' : `en ${levelFilter}`}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Filter UI */}
                                    <div className="flex bg-white/5 p-2 rounded-2xl border border-white/5 backdrop-blur-xl">
                                        {(['Todos', 'Iniciación', 'Nivel Medio'] as const).map((level) => (
                                            <button
                                                key={level}
                                                onClick={() => setLevelFilter(level)}
                                                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${levelFilter === level
                                                    ? 'bg-primary text-background shadow-2xl shadow-primary/40 scale-105'
                                                    : 'text-white/40 hover:text-white hover:bg-white/5'
                                                    }`}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {filteredTeams.length === 0 ? (
                                    <div className="tournament-card text-center py-24 border-dashed border-white/10 opacity-60">
                                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-8">
                                            <Filter className="w-10 h-10 text-white/10" />
                                        </div>
                                        <p className="text-white/20 uppercase font-black tracking-[0.4em] text-xs">
                                            No hay inscritos en {levelFilter}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {filteredTeams.map((team, index) => (
                                            <div key={team.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                                                <TeamCard
                                                    team={team}
                                                    onRemove={() => removeTeam(team.id)}
                                                    onEdit={() => setEditingTeam(team)}
                                                    showRemove={true} // Always allow editing/removing in organizer view
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>

                <Dialog open={!!editingTeam} onOpenChange={(open) => !open && setEditingTeam(null)}>
                    <DialogContent className="bg-[#0a0a0a] border-white/10 text-white sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black uppercase tracking-tight">Editar Pareja</DialogTitle>
                        </DialogHeader>

                        {editingTeam && (
                            <form onSubmit={handleUpdateTeam} className="space-y-6 pt-4">
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="player1" className="text-xs font-bold uppercase tracking-widest text-white/60">Jugador 1</Label>
                                        <Input
                                            id="player1"
                                            name="player1"
                                            defaultValue={editingTeam.player1.name}
                                            required
                                            className="bg-white/5 border-white/10 font-medium focus:border-primary/50"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="player2" className="text-xs font-bold uppercase tracking-widest text-white/60">Jugador 2</Label>
                                        <Input
                                            id="player2"
                                            name="player2"
                                            defaultValue={editingTeam.player2.name}
                                            required
                                            className="bg-white/5 border-white/10 font-medium focus:border-primary/50"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="category" className="text-xs font-bold uppercase tracking-widest text-white/60">Nivel</Label>
                                        <Select name="category" defaultValue={editingTeam.category || 'Iniciación'}>
                                            <SelectTrigger className="bg-white/5 border-white/10 font-medium">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#0a0a0a] border-white/10 text-white">
                                                <SelectItem value="Iniciación" className="focus:bg-white/10 focus:text-white cursor-pointer">Iniciación</SelectItem>
                                                <SelectItem value="Nivel Medio" className="focus:bg-white/10 focus:text-white cursor-pointer">Nivel Medio</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <DialogFooter className="gap-2 sm:gap-0">
                                    <Button type="button" variant="ghost" onClick={() => setEditingTeam(null)} className="hover:bg-white/10">
                                        Cancelar
                                    </Button>
                                    <Button type="submit" className="btn-primary-gradient font-bold uppercase tracking-wider">
                                        Guardar Cambios
                                    </Button>
                                </DialogFooter>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
};

export default Inscripcion;
