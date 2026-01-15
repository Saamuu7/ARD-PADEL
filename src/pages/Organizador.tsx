import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Users, Grid3X3, GitBranch, ArrowRight, Sparkles, Zap, Shield, ChevronRight, Calendar, Clock, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTournament } from '@/context/TournamentContext';
import Header from '@/components/Header';

const Organizador: React.FC = () => {
    const { tournaments, setActiveTournament } = useTournament();

    const features = [
        {
            icon: Users,
            title: 'Inscripción Pro',
            description: 'Gestión inteligente de parejas con validación en tiempo real y perfiles de jugador.',
        },
        {
            icon: Grid3X3,
            title: 'Motor de Grupos',
            description: 'Algoritmos avanzados para sorteos equilibrados y calendarios optimizados por sede.',
        },
        {
            icon: GitBranch,
            title: 'Bracket Pro',
            description: 'Generación automática de cuadros eliminatorios con lógica de cabezas de serie.',
        },
        {
            icon: Shield,
            title: 'Analítica ARD',
            description: 'Estadísticas detalladas, control de mejores terceros y rankings dinámicos.',
        },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />

            {/* Dynamic Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="flex justify-center mb-10 transition-transform hover:scale-110 duration-500">
                            <img src="/logo.png" alt="ARD PADEL" className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-[0_0_20px_rgba(25,231,142,0.2)]" />
                        </div>

                        <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 text-primary mb-8 animate-fade-in shadow-xl">
                            <Sparkles className="w-4 h-4 text-accent" />
                            <span className="uppercase tracking-[0.3em] font-black text-[9px] text-white">Consola de Administración Elite</span>
                        </div>

                        <h1 className="font-display font-black text-6xl md:text-8xl text-foreground mb-8 animate-slide-up leading-tight uppercase tracking-tighter">
                            CONTROL DE <br />
                            <span className="text-primary italic">TORNEOS ARD</span>
                        </h1>

                        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-slide-up font-medium opacity-80 leading-relaxed">
                            La infraestructura digital más avanzada para organizadores de pádel. Automatiza el caos, domina la pista.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-slide-up">
                            <Link to="/organizador/panel-de-control">
                                <Button className="btn-primary-gradient px-12 py-8 text-lg uppercase font-black tracking-widest shadow-2xl shadow-primary/20">
                                    <Zap className="w-6 h-6 mr-3 text-accent fill-accent" />
                                    Iniciar Torneo
                                </Button>
                            </Link>
                            <Link to="/organizador/inscripcion">
                                <Button variant="ghost" className="px-12 py-8 text-lg border border-white/10 hover:bg-white/5 uppercase font-black tracking-widest group">
                                    Inscripciones
                                    <ArrowRight className="w-6 h-6 ml-3 text-primary group-hover:translate-x-2 transition-transform" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Real-time Status Area */}
            {tournaments.length > 0 && (
                <section className="container mx-auto px-4 -mt-20 mb-32 relative z-20 space-y-12">
                    {tournaments.map((tournament) => (
                        <div key={tournament.id} className="group relative overflow-hidden rounded-[3rem] bg-card/60 backdrop-blur-3xl border border-white/10 shadow-2xl transition-all duration-700 hover:border-primary/30 max-w-5xl mx-auto">
                            <div className="flex flex-col lg:flex-row">
                                {/* Image Part */}
                                <div className="lg:w-2/5 relative h-64 lg:h-auto overflow-hidden">
                                    <img
                                        src={tournament.config.image || "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=2070&auto=format&fit=crop"}
                                        alt={tournament.config.name}
                                        className="w-full h-full object-cover brightness-50 group-hover:scale-105 transition-transform duration-1000"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-card lg:bg-gradient-to-r lg:from-transparent lg:to-card/20" />
                                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                                        <div className={`px-4 py-2 rounded-full border text-[9px] font-black uppercase tracking-widest backdrop-blur-md ${tournament.config.registrationClosed ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                                            {tournament.phase === 'registration'
                                                ? (tournament.config.registrationClosed ? 'Inscripciones Cerradas' : 'Inscripciones Abiertas')
                                                : 'Torneo en Curso'}
                                        </div>
                                    </div>
                                </div>

                                {/* Info Part */}
                                <div className="lg:w-3/5 p-10 lg:p-14 flex flex-col justify-center">
                                    <div className="mb-8">
                                        <h2 className="font-display font-black text-4xl lg:text-5xl text-foreground uppercase tracking-tighter leading-none mb-4 group-hover:text-primary transition-colors">
                                            {tournament.config.name}
                                        </h2>
                                        <p className="text-muted-foreground text-sm leading-relaxed italic opacity-70 line-clamp-3">
                                            "{tournament.config.description || 'Prepárate para la máxima competición de pádel ARD.'}"
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10 pt-8 border-t border-white/5">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                                                <Calendar className="w-3 h-3 text-primary" /> Fecha
                                            </p>
                                            <p className="font-bold text-white uppercase">{tournament.config.date}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                                                <Clock className="w-3 h-3 text-primary" /> Hora
                                            </p>
                                            <p className="font-bold text-white">{tournament.config.time}</p>
                                        </div>
                                        <div className="space-y-1 col-span-2 md:col-span-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                                                <Users className="w-3 h-3 text-primary" /> Inscritos
                                            </p>
                                            <p className="font-bold text-white text-xl">
                                                {tournament.teams.length} <span className="text-[10px] text-white/40">Parejas</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-4">
                                        <Link to="/organizador/panel-de-control" className="flex-1 min-w-[150px]" onClick={() => setActiveTournament(tournament.id)}>
                                            <Button className="btn-primary-gradient w-full py-7 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">
                                                <Settings className="w-4 h-4 mr-2" /> Gestionar
                                            </Button>
                                        </Link>
                                        <Link to="/organizador/inscripcion" className="flex-1 min-w-[150px]" onClick={() => setActiveTournament(tournament.id)}>
                                            <Button variant="ghost" className="w-full py-7 font-black uppercase tracking-widest text-[10px] border border-white/10 hover:bg-white/5">
                                                <Users className="w-4 h-4 mr-2" /> Jugadores
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </section>
            )}

            {/* Professional Features Grid */}
            <section className="container mx-auto px-4 py-32 border-t border-white/5">
                <div className="text-center mb-24">
                    <h2 className="text-accent font-black uppercase tracking-[0.4em] text-xs mb-4">Core Engine</h2>
                    <h3 className="font-display font-black text-5xl md:text-6xl text-foreground mb-8 uppercase tracking-tighter">
                        TECNOLOGÍA <br /><span className="text-white/30 italic">PARA GANADORES.</span>
                    </h3>
                    <p className="text-muted-foreground max-w-2xl mx-auto font-medium text-lg leading-relaxed opacity-70">
                        Hemos digitalizado cada aspecto de la competición para que tú solo tengas que preocuparte de que las pelotas estén nuevas.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="tournament-card group p-10 border-b-4 border-transparent hover:border-primary transition-all duration-700"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center mb-8 border border-white/10 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-500">
                                <feature.icon className="w-10 h-10 text-primary" />
                            </div>
                            <h3 className="font-display font-black text-2xl text-foreground mb-4 uppercase tracking-tight">
                                {feature.title}
                            </h3>
                            <p className="text-muted-foreground font-medium leading-relaxed italic text-sm opacity-80">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Professional Footer */}
            <footer className="footer-gradient border-t border-white/10 relative overflow-hidden">
                <div className="container mx-auto px-4 py-20 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-12">
                        <div className="flex items-center gap-5">
                            <img src="/logo.png" alt="ARD PADEL" className="w-16 h-16 object-contain" />
                            <div className="text-left">
                                <span className="font-display font-black text-3xl tracking-tighter uppercase block leading-none">ARD <span className="text-primary">PÁDEL</span></span>
                                <span className="text-[9px] uppercase font-black tracking-[0.4em] text-white/30">Admin Console v2.0</span>
                            </div>
                        </div>

                        <div className="flex gap-12 text-[10px] font-black uppercase tracking-widest text-white/40">
                            <a href="#" className="hover:text-primary transition-all">Documentación</a>
                            <a href="#" className="hover:text-primary transition-all">Soporte 24/7</a>
                            <a href="#" className="hover:text-accent transition-all">API Acceso</a>
                        </div>
                    </div>

                    <div className="mt-16 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
                            Diseñado por ARD Professional Systems.
                        </p>
                        <div className="flex gap-4">
                            <div className="w-1 h-1 rounded-full bg-primary" />
                            <div className="w-1 h-1 rounded-full bg-accent" />
                            <div className="w-1 h-1 rounded-full bg-white/20" />
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Organizador;
