import React from 'react';
import { useTournament } from '@/context/TournamentContext';
import { Button } from '@/components/ui/button';
import { Check, X, Trash2, User, Phone, Tag, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const RegistrationManager: React.FC = () => {
    const { activeTournament, updateTeam, removeTeam, refreshTournaments } = useTournament();

    if (!activeTournament) return null;

    const pendingTeams = activeTournament.teams.filter(t => t.status === 'pending');
    const approvedTeams = activeTournament.teams.filter(t => t.status === 'approved');
    const rejectedTeams = activeTournament.teams.filter(t => t.status === 'rejected');

    const handleApprove = async (teamId: string) => {
        await updateTeam(teamId, { status: 'approved' });
        toast.success("Equipo aprobado");
    };

    const handleReject = async (teamId: string) => {
        await updateTeam(teamId, { status: 'rejected' });
        toast.success("Equipo rechazado");
    };

    const handleDelete = async (teamId: string) => {
        if (confirm("¿Estás seguro de eliminar este equipo?")) {
            await removeTeam(teamId);
            toast.success("Equipo eliminado");
        }
    };

    const handleRefresh = async () => {
        await refreshTournaments();
        toast.success("Datos actualizados");
    };

    return (
        <div className="space-y-8 animate-fade-in mt-8">
            <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={handleRefresh} className="text-muted-foreground hover:text-primary gap-2">
                    <RefreshCw className="w-4 h-4" /> Actualizar Datos
                </Button>
            </div>

            {/* Pending Requests */}
            {pendingTeams.length > 0 && (
                <div className="tournament-card border-l-4 border-l-accent bg-accent/5">
                    <h3 className="font-display font-bold text-xl mb-4 flex items-center gap-2 text-accent">
                        <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                        Solicitudes Pendientes ({pendingTeams.length})
                    </h3>
                    <div className="grid gap-4">
                        {pendingTeams.map(team => (
                            <div key={team.id} className="bg-background/50 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 border border-white/5">
                                <div className="flex-1 space-y-2 text-center md:text-left w-full">
                                    <div className="flex flex-col md:flex-row gap-2 md:gap-6 items-center">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-primary" />
                                            <span className="font-bold">{team.player1.name}</span>
                                            <span className="text-xs text-muted-foreground">({team.player1.phone || 'Sin tel'})</span>
                                        </div>
                                        <div className="hidden md:block text-muted-foreground/30">|</div>
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-primary" />
                                            <span className="font-bold">{team.player2.name}</span>
                                            <span className="text-xs text-muted-foreground">({team.player2.phone || 'Sin tel'})</span>
                                        </div>
                                    </div>
                                    {(team.category) && (
                                        <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-accent">
                                            <Tag className="w-3 h-3" />
                                            <span className="uppercase tracking-wider">{team.category}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2 w-full md:w-auto">
                                    <Button onClick={() => handleApprove(team.id)} className="flex-1 md:flex-none bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/50">
                                        <Check className="w-4 h-4 mr-1" /> Aceptar
                                    </Button>
                                    <Button onClick={() => handleReject(team.id)} className="flex-1 md:flex-none bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50">
                                        <X className="w-4 h-4 mr-1" /> Rechazar
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Approved List */}
            <div className="tournament-card">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-display font-bold text-lg text-foreground">
                        Gestión de Participantes
                    </h3>
                    <span className="text-xs font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                        {approvedTeams.length} Aprobados
                    </span>
                </div>

                <div className="space-y-2">
                    {approvedTeams.map(team => (
                        <div key={team.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all group">
                            <div className="flex flex-col md:flex-row gap-2 md:gap-8 items-start md:items-center">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-white">{team.player1.name}</span>
                                        <span className="text-white/40">&</span>
                                        <span className="font-bold text-white">{team.player2.name}</span>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{team.category || 'General'}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right hidden sm:block">
                                    <div className="text-[10px] text-white/40">{team.player1.phone}</div>
                                    <div className="text-[10px] text-white/40">{team.player2.phone}</div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(team.id)} className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 transition-opacity">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {approvedTeams.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground italic border border-dashed border-white/10 rounded-xl">
                            No hay equipos aprobados aún.
                        </div>
                    )}
                </div>
            </div>

            {/* Rejected List */}
            {rejectedTeams.length > 0 && (
                <div className="tournament-card bg-destructive/5 border-destructive/20">
                    <h4 className="text-xs font-black uppercase tracking-widest text-destructive mb-4">Solicitudes Rechazadas ({rejectedTeams.length})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {rejectedTeams.map(team => (
                            <div key={team.id} className="flex justify-between items-center p-3 rounded-lg bg-background/50 border border-destructive/10 text-xs">
                                <span className="text-white/60">{team.player1.name} / {team.player2.name}</span>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="ghost" className="h-6 text-green-400 hover:text-green-300" onClick={() => handleApprove(team.id)}>Recuperar</Button>
                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive/50 hover:text-destructive" onClick={() => handleDelete(team.id)}><Trash2 className="w-3 h-3" /></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegistrationManager;
