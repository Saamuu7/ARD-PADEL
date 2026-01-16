import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Trophy, Calendar, Clock, MapPin, Users, ArrowRight, Instagram, Mail, Phone, ChevronRight, Zap, Trophy as TrophyIcon, Star, Target, ShieldCheck, Crown, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import LoginModal from '@/components/LoginModal';
import { useTournament } from '@/context/TournamentContext';
import { useAuth } from '@/context/AuthContext';

const Index: React.FC = () => {
  const { tournaments, activeTournament, setActiveTournament } = useTournament();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoginOpen, setIsLoginOpen] = React.useState(false);

  React.useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.replace('#', ''));
      if (element) {
        // Small delay to ensure smooth scroll after render
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  const handleRegistration = (tournamentId: string) => {
    setActiveTournament(tournamentId);
    if (user) {
      navigate('/inscripcion');
    } else {
      setIsLoginOpen(true);
    }
  };

  const organizers = [
    {
      name: 'Samuel',
      role: 'Director Deportivo',
      description: 'Apasionado del pádel con más de 10 años de experiencia organizando eventos competitivos de alto nivel.',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop'
    },
    {
      name: 'Equipo ARD',
      role: 'Logística y Eventos',
      description: 'Expertos en convertir cada partido en una experiencia inolvidable para jugadores y patrocinadores.',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop'
    }
  ];

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30 selection:text-primary-foreground">
      <Header />

      {/* Premium Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#020617]">
        {/* Cinematic Backdrop */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] z-10" />
          <img
            src="https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=2070&auto=format&fit=crop"
            alt="Padel High Performance"
            className="w-full h-full object-cover opacity-30 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background/40 z-20" />

          {/* Power Glows */}
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[160px] animate-pulse-soft opacity-40 z-0" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[140px] animate-pulse-soft delay-1000 opacity-30 z-0" />
        </div>

        <div className="container mx-auto px-4 relative z-30 pt-5 pb-52">
          <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-3 px-8 py-3 bg-white/5 backdrop-blur-3xl rounded-full border border-white/10 text-primary mb-12 animate-fade-in shadow-2xl">
              <TrophyIcon className="w-5 h-5 text-accent animate-bounce" />
              <span className="uppercase tracking-[0.5em] text-[10px] font-black text-white/80 shrink-0">Torneos Amateur y Eventos</span>
            </div>

            <h1 className="font-display font-black text-7xl md:text-[10rem] text-white mb-10 tracking-tighter animate-slide-up leading-[0.75] uppercase">
              ARD <span className="text-primary italic drop-shadow-[0_0_50px_rgba(25,231,142,0.4)]">PÁDEL</span>
            </h1>

            <p className="text-xl md:text-3xl text-muted-foreground mb-16 max-w-3xl mx-auto animate-slide-up transition-all duration-700 delay-100 font-medium leading-relaxed opacity-90 text-balance">
              Redefiniendo el nivel de la competición. El sello oficial de los eventos que marcan la diferencia.
            </p>

            <div className="flex justify-center animate-slide-up delay-200 w-full sm:w-auto">
              <Button
                onClick={() => document.getElementById('torneos')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-primary-gradient w-full sm:w-auto px-20 py-10 text-xl font-black uppercase tracking-[0.2em] group shadow-[0_30px_60px_-15px_rgba(25,231,142,0.5)]"
              >
                Inscribirse
                <ArrowRight className="w-7 h-7 ml-4 group-hover:translate-x-2 transition-transform" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mouse Scroll Indicator */}
        <div
          className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-3 cursor-pointer group"
          onClick={() => document.getElementById(tournaments.length > 0 ? 'torneos' : 'sobre-nosotros')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <div className="w-[26px] h-[45px] rounded-full border-2 border-white/20 flex justify-center p-1 group-hover:border-primary/50 transition-colors duration-500">
            <div className="w-1 h-2 bg-primary rounded-full animate-mouse-wheel" />
          </div>
          <span className="text-[9px] uppercase font-black tracking-[0.4em] text-white/30 group-hover:text-primary transition-colors duration-500">Scroll</span>
        </div>
      </section>

      {/* Tournaments Section */}
      <section id="torneos" className="relative">
        {tournaments.length > 0 ? (
          <div className="py-32 relative overflow-hidden bg-secondary/10">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row items-baseline justify-between mb-20 gap-8 border-b border-white/5 pb-10">
                <div>
                  <h2 className="text-primary font-black uppercase tracking-[0.5em] text-xs mb-4">Competiciones Activas</h2>
                  <h3 className="font-display font-black text-5xl md:text-6xl text-foreground leading-none tracking-tighter uppercase">
                    ELIGE TU <span className="text-white/30 italic">BATALLA.</span>
                  </h3>
                </div>
              </div>

              <div className="grid gap-12 max-w-6xl mx-auto">
                {tournaments.map((t) => {
                  const myTeam = user
                    ? t.teams.find(team => String(team.player1Id) === String(user.id) || String(team.player2Id) === String(user.id))
                    : null;

                  const isRegistered = myTeam && myTeam.status !== 'rejected';
                  const isApproved = myTeam?.status === 'approved';

                  return (
                    <div key={t.id} className="group relative overflow-hidden rounded-[3rem] bg-card/50 backdrop-blur-3xl border border-white/5 shadow-2xl transition-all duration-700 hover:border-primary/30 hover:shadow-primary/10">
                      <div className="grid lg:grid-cols-2">
                        <div className="relative aspect-video lg:aspect-auto overflow-hidden">
                          <img
                            src={t.config.image || "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=2070&auto=format&fit=crop"}
                            alt={t.config.name}
                            className="w-full h-full object-cover brightness-75 group-hover:scale-110 transition-transform duration-[4s]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-card/80 to-transparent lg:hidden" />

                          {/* Date/Time Badge */}
                          <div className="absolute top-8 left-8 flex gap-3">
                            <div className="px-4 py-2 bg-background/80 backdrop-blur-md rounded-xl border border-white/10 flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-primary" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-white">{t.config.date}</span>
                            </div>
                            <div className="px-4 py-2 bg-background/80 backdrop-blur-md rounded-xl border border-white/10 flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-primary" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-white">{t.config.time}</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-12 lg:p-16 flex flex-col justify-center">
                          <div className="flex items-center gap-3 mb-6">
                            <Star className="w-5 h-5 text-accent fill-accent" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Competición ARD</span>
                          </div>

                          <h3 className="font-display font-black text-4xl mb-6 uppercase tracking-tighter leading-tight">
                            {t.config.name}
                          </h3>

                          <p className="text-muted-foreground text-sm mb-10 opacity-80 leading-relaxed italic line-clamp-3 break-words">
                            "{t.config.description || 'Vive la adrenalina del mejor pádel amateur de la zona. Premios exclusivos, arbitraje y grabación de finales.'}"
                          </p>

                          <div className="grid grid-cols-2 gap-6 mb-12 border-t border-white/5 pt-8">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Target className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="text-[9px] uppercase font-black tracking-widest text-white/30">Plazas</p>
                                <p className="font-bold text-white text-base">{t.teams.length} Parejas</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5 text-accent" />
                              </div>
                              <div>
                                <p className="text-[9px] uppercase font-black tracking-widest text-white/30">Fase</p>
                                <p className="font-bold text-white text-base uppercase tracking-wider">
                                  {t.phase === 'registration'
                                    ? (t.config.registrationClosed ? 'Inscripciones Cerradas' : 'Inscripciones Abiertas')
                                    : t.phase === 'groups' ? 'Fase de Grupos'
                                      : t.phase === 'bracket' ? 'Cuadro Final'
                                        : t.phase === 'finished' ? 'Torneo Finalizado'
                                          : t.phase}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-auto">
                            {t.phase === 'finished' ? (
                              <Button disabled className="w-full py-8 text-lg font-black uppercase tracking-widest bg-white/5 text-white/40 border border-white/10">
                                Torneo Finalizado
                              </Button>
                            ) : (t.config.registrationClosed && !isRegistered) ? (
                              <Button disabled className="w-full py-8 text-lg font-black uppercase tracking-widest bg-destructive/10 text-destructive border border-destructive/20">
                                Inscripciones Cerradas
                              </Button>
                            ) : (
                              <Button
                                onClick={() => handleRegistration(t.id)}
                                className={`w-full py-8 text-lg font-black uppercase tracking-widest group ${isRegistered
                                  ? isApproved
                                    ? 'bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20'
                                    : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 hover:bg-yellow-500/20'
                                  : 'btn-primary-gradient'
                                  }`}
                              >
                                {isRegistered ? (
                                  <span className="flex items-center gap-2">
                                    {isApproved ? 'Inscripción Aceptada' : 'Inscripción Pendiente'}
                                    {isApproved ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                  </span>
                                ) : (
                                  <>
                                    Inscribirse Ahora
                                    <ArrowRight className="w-7 h-7 ml-4 group-hover:translate-x-2 transition-transform" />
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-40 bg-white/[0.01] border-y border-white/5">
            <div className="container mx-auto px-4 text-center">
              <div className="inline-flex items-center gap-3 px-6 py-2 bg-primary/10 rounded-full border border-primary/20 text-primary mb-8">
                <Calendar className="w-4 h-4" />
                <span className="uppercase tracking-widest text-[10px] font-black italic">Próximamente</span>
              </div>
              <h2 className="font-display font-black text-5xl md:text-7xl text-white/10 uppercase tracking-tighter mb-6">
                SIN TORNEOS <br /> <span className="text-white/20">ACTIVOS.</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-lg italic opacity-60">
                Estamos preparando la próxima gran competición. Mantente atento a nuestras redes para ser el primero en enterarte.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* About Section - Professional Bento Style */}
      <section id="sobre-nosotros" className="py-40 relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mb-24">
            <h2 className="text-accent font-black uppercase tracking-[0.5em] text-xs mb-6">Misión & Legado</h2>
            <h3 className="font-display font-black text-6xl md:text-7xl text-foreground mb-10 leading-[0.9] uppercase tracking-tighter">
              QUIÉNES <br /><span className="text-white/20">FORMAN ARD.</span>
            </h3>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed opacity-80">
              Creamos el ecosistema donde el fair-play y la máxima competitividad convergen. ARD PÁDEL es el resultado de una visión profesional aplicada al pádel de club.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 grid md:grid-cols-2 gap-10">
              {organizers.map((org, i) => (
                <div key={i} className="tournament-card group border-l-8 border-l-primary/40 bg-white/[0.02] p-12">
                  <div className="flex gap-8 items-center mb-8">
                    <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-primary/20 shadow-2xl">
                      <img src={org.image} alt={org.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-110" />
                    </div>
                    <div>
                      <h4 className="font-black text-3xl uppercase tracking-tighter">{org.name}</h4>
                      <p className="text-primary text-xs font-black uppercase tracking-[0.3em] mt-1">{org.role}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-lg leading-relaxed italic opacity-70 group-hover:opacity-100 transition-opacity">"{org.description}"</p>
                </div>
              ))}

              <div className="md:col-span-2 glass p-12 rounded-[3rem] flex flex-col md:flex-row items-center gap-12 border-t-8 border-t-accent/40 bg-accent/5">
                <div className="text-center md:text-left flex-1">
                  <h4 className="font-black text-4xl mb-4 uppercase tracking-tighter text-white">EL SELLO DE CALIDAD</h4>
                  <p className="text-muted-foreground text-lg">Reglamentación profesional, jueces titulados y las instalaciones más premium de España.</p>
                </div>
                <div className="flex gap-12">
                  <div className="text-center">
                    <span className="block text-6xl font-black text-primary mb-2 drop-shadow-[0_0_15px_rgba(25,231,142,0.3)]">50+</span>
                    <span className="text-[10px] uppercase font-black tracking-[0.4em] text-white/30">Eventos Élite</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-6xl font-black text-accent mb-2 drop-shadow-[0_0_15px_rgba(255,215,0,0.2)]">2k+</span>
                    <span className="text-[10px] uppercase font-black tracking-[0.4em] text-white/30">Gladiadores</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 relative rounded-[3rem] overflow-hidden min-h-[500px] border border-white/5 group shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1592709823125-a191f07a2a5e?q=80&w=2026&auto=format&fit=crop"
                alt="Competición ARD"
                className="w-full h-full object-cover brightness-50 group-hover:scale-110 transition-transform duration-[3s]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-12 left-12 right-12 text-left">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/40">
                    <Zap className="w-7 h-7 text-white fill-white" />
                  </div>
                  <span className="font-black uppercase tracking-[0.3em] text-xs text-white">Competición Pura</span>
                </div>
                <h4 className="font-black text-2xl text-white mb-2 uppercase tracking-tighter">Eventos de Élite</h4>
                <p className="text-white/60 text-sm leading-relaxed">Organizamos torneos con un estándar de calidad profesional en cada detalle del evento.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why ARD - Visual Gallery */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-24">
            <h2 className="text-primary font-black uppercase tracking-[0.5em] text-xs mb-4">Experiencia Premium</h2>
            <h3 className="font-display font-black text-5xl md:text-6xl text-white uppercase tracking-tighter">
              POR QUÉ ELEGIR <span className="text-white/20">ARD.</span>
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1: Premios */}
            <div className="group relative h-[500px] rounded-[3rem] overflow-hidden border border-white/10">
              <img src="https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop" alt="Premios" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 brightness-50" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-10">
                <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center mb-6 text-background">
                  <TrophyIcon className="w-7 h-7" />
                </div>
                <h4 className="font-black text-2xl text-white uppercase tracking-tight mb-2">Premios Metálicos</h4>
                <p className="text-white/60 text-sm leading-relaxed">Repartimos los mejores premios de la zona. Recompensamos tu esfuerzo con valor real.</p>
              </div>
            </div>

            {/* Card 2: Ambiente */}
            <div className="group relative h-[500px] rounded-[3rem] overflow-hidden border border-white/10">
              <img src="https://images.unsplash.com/photo-1624880357913-a8539238245b?q=80&w=2070&auto=format&fit=crop" alt="Ambiente" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 brightness-50" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-10">
                <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-6 text-background">
                  <Users className="w-7 h-7" />
                </div>
                <h4 className="font-black text-2xl text-white uppercase tracking-tight mb-2">Comunidad Élite</h4>
                <p className="text-white/60 text-sm leading-relaxed">Más que un torneo, es un punto de encuentro. Networking, diversión y competición sana.</p>
              </div>
            </div>

            {/* Card 3: Organización */}
            <div className="group relative h-[500px] rounded-[3rem] overflow-hidden border border-white/10">
              <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop" alt="Organización" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 brightness-50" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-10">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 text-background">
                  <Crown className="w-7 h-7" />
                </div>
                <h4 className="font-black text-2xl text-white uppercase tracking-tight mb-2">Trato VIP</h4>
                <p className="text-white/60 text-sm leading-relaxed">Agua, fruta, welcome pack. Te tratamos como a un profesional.</p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Social Banner - Clean & Premium */}
      <section className="py-32 border-y border-white/5 bg-white/[0.01]">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-20">
          <div className="text-center group cursor-pointer">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/10 group-hover:bg-primary/20 transition-all duration-500">
              <Instagram className="w-10 h-10 text-primary" />
            </div>
            <h4 className="font-black text-[10px] uppercase tracking-[0.4em] text-white/30 mb-2">Social Feed</h4>
            <p className="text-3xl font-black text-white group-hover:text-primary transition-colors">@ARDPADEL_OFICIAL</p>
          </div>
          <div className="text-center group cursor-pointer">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/10 group-hover:bg-accent/20 transition-all duration-500">
              <Mail className="w-10 h-10 text-accent" />
            </div>
            <h4 className="font-black text-[10px] uppercase tracking-[0.4em] text-white/30 mb-2">Consultas</h4>
            <p className="text-3xl font-black text-white group-hover:text-accent transition-colors">INFO@ARDPADEL.COM</p>
          </div>
          <div className="text-center group cursor-pointer">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/10 group-hover:bg-primary/20 transition-all duration-500">
              <Phone className="w-10 h-10 text-primary" />
            </div>
            <h4 className="font-black text-[10px] uppercase tracking-[0.4em] text-white/30 mb-2">WhatsApp Direct</h4>
            <p className="text-3xl font-black text-white group-hover:text-primary transition-colors">+34 000 000 000</p>
          </div>
        </div>
      </section>

      {/* Footer - Final Masterpiece */}
      <footer className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 opacity-20 skew-y-3 translate-y-32" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="flex items-center justify-center gap-6 mb-12">
            <img src="/logo.png" alt="ARD PADEL" className="w-20 h-20 object-contain rounded-full border-2 border-primary p-1 bg-black/20" />
            <div className="text-left">
              <span className="font-display font-black text-5xl tracking-tighter uppercase block leading-none text-white">ARD <span className="text-primary italic">PÁDEL</span></span>
              <span className="text-[10px] uppercase font-black tracking-[1em] text-white/20 mt-2 block">Professional DNA</span>
            </div>
          </div>

          <div className="flex justify-center gap-16 text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-16">
            <Link to="/reglamento" className="hover:text-primary transition-all">Reglamento</Link>
            <Link to="/privacidad" className="hover:text-primary transition-all">Privacidad</Link>
            <Link to="/cookies" className="hover:text-primary transition-all">Cookies</Link>
          </div>

          <div className="pt-10 border-t border-white/5 inline-block">
            <p className="text-[10px] uppercase font-bold text-white/10 tracking-[0.2em]">
              © 2026 ARD PÁDEL - CIRCUITOS PROFESIONALES DE PÁDEL DE ALTO RENDIMIENTO.
            </p>
          </div>
        </div>
      </footer>
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
};

export default Index;
