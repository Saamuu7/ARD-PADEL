import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Trophy, Users, Grid3X3, GitBranch, Settings, Calendar, ArrowRight, RotateCcw, MessageCircle, Mail, Instagram, UserCircle, LogOut, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTournament } from '@/context/TournamentContext';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import LoginModal from '@/components/LoginModal';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const location = useLocation();
  const { activeTournament: tournament, resetTournaments, tournaments } = useTournament();
  const { user, logout } = useAuth();

  const myRegistrations = user ? tournaments.flatMap(t =>
    t.teams.filter(team => String(team.player1Id) === String(user.id) || String(team.player2Id) === String(user.id))
      .map(team => ({ ...team, tournamentName: t.config.name, tournamentId: t.id }))
  ) : [];

  const isDashboard = location.pathname.startsWith('/organizador');

  // Organizer Notification Logic
  const pendingCount = isDashboard
    ? tournaments.reduce((acc, t) => acc + t.teams.filter(team => team.status === 'pending').length, 0)
    : 0;

  // Custom Hook or Logic for Unread Notifications
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (myRegistrations.length === 0 || !user) return;

    // Sort registrations to ensure stable signature regardless of fetch order
    const sortedRegistrations = [...myRegistrations].sort((a, b) => a.id.localeCompare(b.id));
    const signature = sortedRegistrations.map(r => `${r.id}-${r.status}`).join('|');

    // key by user ID to avoid conflicts on shared devices
    const storageKey = `ard_padel_notifications_sig_${user.id}`;
    const storedSignature = localStorage.getItem(storageKey);

    if (signature !== storedSignature) {
      setHasUnread(true);
    }
  }, [myRegistrations, user]);

  const handleToggleNotifications = () => {
    const newState = !isNotificationsOpen;
    setIsNotificationsOpen(newState);

    if (newState && myRegistrations.length > 0 && user) {
      setHasUnread(false);

      const sortedRegistrations = [...myRegistrations].sort((a, b) => a.id.localeCompare(b.id));
      const signature = sortedRegistrations.map(r => `${r.id}-${r.status}`).join('|');

      const storageKey = `ard_padel_notifications_sig_${user.id}`;
      localStorage.setItem(storageKey, signature);
    }
  };

  const navItems = isDashboard
    ? [
      { path: '/organizador/inscripcion', label: 'Inscripciones', icon: Users, badge: pendingCount > 0 },
      { path: '/organizador/grupos', label: 'Grupos', icon: Grid3X3 },
      { path: '/organizador/cuadro', label: 'Cuadro Final', icon: GitBranch },
      { path: '/organizador/panel-de-control', label: 'Panel Control', icon: Settings },
    ]
    : [
      { path: '/', label: 'Inicio', icon: Trophy },
      { path: '/#torneos', label: 'Torneos', icon: Calendar },
      { path: '/#sobre-nosotros', label: 'Sobre Nosotros', icon: Users },
    ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    // Check if it's a hash link for the home page sections
    if (path.includes('#')) {
      const hash = path.split('#')[1];

      // If we are already on the home page, scroll smoothly
      if (location.pathname === '/' || location.pathname === '') {
        e.preventDefault();
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          setIsMenuOpen(false);
        }
      }
      // If we are NOT on home page, the Link component will handle standard navigation to '/#hash'
      // and the Index page's useEffect will handle the scrolling upon mounting.
    }
  };

  const handleReset = () => {
    if (window.confirm('¿Estás SEGURO de que quieres borrar todos los datos del torneo? Esta acción es irreversible.')) {
      resetTournaments();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    toast.success('Sesión cerrada correctamente 👋');
  };

  return (
    <header className="sticky top-0 z-50 transition-all duration-500 border-b border-white/5 bg-background/60 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-4 group py-2">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <img
                src="/logo.png"
                alt="ARD PADEL"
                className="w-16 h-16 object-contain rounded-full border-2 border-primary p-1 bg-black/20 relative z-10 transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div className="hidden sm:block text-left">
              <h1 className="font-display font-black text-2xl text-white uppercase tracking-tighter leading-none group-hover:text-primary transition-colors">
                ARD <span className="text-primary italic">PÁDEL</span>
              </h1>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {navItems.map((item: any) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={(e) => handleNavClick(e as unknown as React.MouseEvent<HTMLAnchorElement>, item.path)}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${location.pathname === item.path
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(25,231,142,0.1)]'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
              >
                <item.icon className={`w-3.5 h-3.5 ${location.pathname === item.path ? 'text-primary' : 'text-white/20'}`} />
                {item.label}
                {item.badge && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </Link>
            ))}
          </nav>

          {/* CTA / Action Area */}
          <div className="flex items-center gap-4">
            {isDashboard ? (
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleReset}
                  variant="ghost"
                  size="sm"
                  className="hidden md:flex text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 rounded-full py-6 px-6"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Link to="/" onClick={handleLogout}>
                  <Button size="sm" className="btn-primary-gradient px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
                    Salir Admin
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                {user ? (
                  <div className="flex items-center gap-4">

                    {/* Notifications */}
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="relative text-white/40 hover:text-white hover:bg-white/5 rounded-full"
                        onClick={handleToggleNotifications}
                      >
                        <Bell className="w-5 h-5" />
                        {hasUnread && (
                          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        )}
                      </Button>

                      {isNotificationsOpen && (
                        <div className="absolute top-full right-0 mt-2 w-80 bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl p-4 animate-slide-up origin-top-right z-50">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xs font-black uppercase tracking-widest text-white">Notificaciones</h4>
                            <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-white/40">{myRegistrations.length} Nuevas</span>
                          </div>

                          {myRegistrations.length > 0 ? (
                            <div className="space-y-3">
                              {myRegistrations.map((reg, idx) => (
                                <Link
                                  key={idx}
                                  to="/inscripcion" // Or update active tournament logic? Ideally just go to registration page which handles logic based on active tournament.
                                  onClick={() => setIsNotificationsOpen(false)}
                                  className="block p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/5"
                                >
                                  <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-bold text-primary">{reg.tournamentName}</span>
                                    <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded ${reg.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                                      reg.status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                                        'bg-yellow-500/20 text-yellow-500'
                                      }`}>
                                      {reg.status === 'approved' ? 'Aceptado' : reg.status === 'rejected' ? 'Recha.' : 'Pendiente'}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-white/60 line-clamp-2">
                                    Te has inscrito con {String(reg.player1Id) === String(user.id) ? reg.player2.name : reg.player1.name}.
                                  </p>
                                </Link>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-white/20">
                              <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                              <p className="text-[10px] uppercase tracking-widest">Sin notificaciones</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="hidden md:flex flex-col items-end">
                      <span className="text-sm font-bold text-white leading-none">{user.first_name}</span>
                      <span className="text-[10px] text-primary uppercase tracking-wider">Jugador</span>
                    </div>
                    <Button onClick={logout} variant="ghost" size="icon" className="hover:bg-destructive/10 hover:text-destructive text-white/40 rounded-full">
                      <LogOut className="w-5 h-5" />
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => setIsLoginOpen(true)} size="sm" className="btn-primary-gradient px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl gap-2">
                    <UserCircle className="w-4 h-4" /> Registrarse / Entrar
                  </Button>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden w-10 h-10 rounded-xl bg-white/5 flex flex-col items-center justify-center gap-1.5 border border-white/10 group cursor-pointer hover:bg-primary/20 transition-all"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className={`w-5 h-0.5 bg-white/60 rounded-full transition-all ${isMenuOpen ? 'rotate-45 translate-y-2 bg-primary' : ''}`} />
              <div className={`w-5 h-0.5 bg-primary rounded-full translate-x-1 transition-all ${isMenuOpen ? 'opacity-0' : ''}`} />
              <div className={`w-5 h-0.5 bg-white/60 rounded-full transition-all ${isMenuOpen ? '-rotate-45 -translate-y-2 bg-primary' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Panel */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-24 left-4 right-4 bg-card/90 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 shadow-2xl animate-slide-up">
            <div className="flex flex-col gap-3">
              {navItems.map((item) => (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => handleNavClick(e, item.path)}
                  className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${location.pathname === item.path
                    ? 'bg-primary text-white'
                    : 'text-white/40 hover:bg-white/5'
                    }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </a>
              ))}
              {!isDashboard && !user && (
                <button onClick={() => { setIsLoginOpen(true); setIsMenuOpen(false); }} className="flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-primary bg-primary/10">
                  <UserCircle className="w-4 h-4" /> Identifícate
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </header>
  );
};

export default Header;
