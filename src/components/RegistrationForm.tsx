import React, { useState, useEffect } from 'react';
import { UserPlus, Users, Search, CheckCircle2, Mail, Phone, User, Star, Loader2, Sparkles, AlertCircle, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTournament } from '@/context/TournamentContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import LoginModal from '@/components/LoginModal';

interface RegistrationFormProps {
  isPublic?: boolean;
  isAdmin?: boolean;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ isPublic = false, isAdmin = false }) => {
  const { registerTeam, activeTournament } = useTournament();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Player 1 State (Only for Admin)
  const [p1Email, setP1Email] = useState('');
  const [p1FirstName, setP1FirstName] = useState('');
  const [p1LastName, setP1LastName] = useState('');
  const [p1Phone, setP1Phone] = useState('');

  // Player 2 State
  const [p2Email, setP2Email] = useState('');
  const [p2FirstName, setP2FirstName] = useState('');
  const [p2LastName, setP2LastName] = useState('');
  const [p2Phone, setP2Phone] = useState('');

  const [isP2Found, setIsP2Found] = useState(false);
  const [category, setCategory] = useState('');
  const [searching, setSearching] = useState(false);

  // Validators
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = (phone: string) => /^\d{9}$/.test(phone) || /^\+?\d{9,13}$/.test(phone);

  const checkPartnerEmail = async () => {
    if (!p2Email || !isValidEmail(p2Email)) return;
    setSearching(true);
    const { data } = await supabase.from('users').select('*').eq('email', p2Email).single();
    if (data) {
      setP2FirstName(data.first_name);
      setP2LastName(data.last_name || '');
      setP2Phone(data.phone || '');
      setIsP2Found(true);
      toast.success("Compañero encontrado: " + data.first_name);
    } else {
      setIsP2Found(false);
      if (!isAdmin) toast.info("Compañero no registrado. Completa sus datos para invitarle.");
    }
    setSearching(false);
  };

  const getOrCreateUser = async (email: string, first: string, last: string, phone: string) => {
    const { data: existing } = await supabase.from('users').select('id').eq('email', email).single();
    if (existing) return existing.id;

    const { data: newUser, error } = await supabase.from('users').insert({
      first_name: first,
      last_name: last,
      email: email,
      phone: phone
    }).select('id').single();

    if (error) throw error;
    return newUser.id;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!user && !isAdmin) || !activeTournament) return;

    // Validate P2
    if (!p2Email || !p2FirstName || !p2LastName || !p2Phone) {
      toast.error("Completa todos los datos del Jugador 2");
      return;
    }
    if (!isValidEmail(p2Email)) {
      toast.error("El email del Jugador 2 no es válido");
      return;
    }
    if (!isValidPhone(p2Phone)) {
      toast.error("El teléfono del Jugador 2 no es válido");
      return;
    }

    // Validate P1 (Admin Mode)
    if (isAdmin) {
      if (!p1Email || !p1FirstName || !p1LastName || !p1Phone) {
        toast.error("Completa todos los datos del Jugador 1");
        return;
      }
      if (!isValidEmail(p1Email)) {
        toast.error("El email del Jugador 1 no es válido");
        return;
      }
      if (!isValidPhone(p1Phone)) {
        toast.error("El teléfono del Jugador 1 no es válido");
        return;
      }
    }

    if (!category) {
      toast.error("Debes seleccionar una categoría");
      return;
    }

    try {
      setSearching(true);

      // 1. Get or Create Player 1 (if Admin) or use Current User
      let player1Id = user?.id;
      if (isAdmin) {
        player1Id = await getOrCreateUser(p1Email, p1FirstName, p1LastName, p1Phone);
      }

      // 2. Get or Create Player 2
      const player2Id = await getOrCreateUser(p2Email, p2FirstName, p2LastName, p2Phone);

      // 3. Register Team
      const newRegId = await registerTeam({
        player1Id: player1Id!,
        player2Id: player2Id!,
        category: category || undefined,
        status: (isPublic && !isAdmin) ? 'pending' : 'approved'
      });

      if (newRegId) {
        if (isPublic && !isAdmin) {
          localStorage.setItem(`ard_padel_team_${activeTournament.id}`, newRegId);
          setIsSuccess(true);
        } else {
          toast.success("Pareja inscrita correctamente");
          // Reset form
          setP1Email(''); setP1FirstName(''); setP1LastName(''); setP1Phone('');
          setP2Email(''); setP2FirstName(''); setP2LastName(''); setP2Phone('');
          setCategory('');
          setIsP2Found(false);
        }
      }

    } catch (error: any) {
      toast.error("Error en inscripción: " + error.message);
    } finally {
      setSearching(false);
    }
  };

  if (!user && !isAdmin) {
    return (
      <div className="tournament-card text-center py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/10 blur-[50px] pointer-events-none" />

        <div className="relative z-10 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-8 border border-white/10 group">
            <Users className="w-10 h-10 text-white/20 group-hover:text-primary transition-colors duration-500" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-2 leading-none">Casi listo para entrar</h2>
          <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-bold mb-10 max-w-xs mx-auto">
            Identifícate para gestionar tus inscripciones y torneos
          </p>
          <Button
            onClick={() => setIsLoginOpen(true)}
            className="btn-primary-gradient px-12 py-8 text-xs font-black uppercase tracking-widest gap-3"
          >
            <User className="w-4 h-4" /> Entrar / Registrarse
          </Button>
          <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
        </div>
      </div>
    );
  }

  const isClosed = activeTournament ? (activeTournament.config.registrationClosed || (activeTournament.phase && activeTournament.phase !== 'registration')) : false;

  if (isSuccess && !isAdmin) {
    return (
      <div className="tournament-card text-center py-20 animate-fade-in border-primary/20 bg-primary/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 blur-[100px]" />

        <div className="relative z-10">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8 border border-primary/20 animate-float">
            <CheckCircle2 className="w-12 h-12 text-primary" />
          </div>
          <h2 className="font-display font-black text-4xl text-white uppercase tracking-tighter mb-4 leading-none">
            ¡Inscripción Enviada!
          </h2>
          <p className="text-[10px] text-primary uppercase tracking-[0.4em] font-black mb-10">
            Fase de confirmación activada
          </p>
          <p className="text-sm text-white/40 mb-10 max-w-md mx-auto leading-relaxed">
            Tu solicitud está en manos de la organización. Te avisaremos cuando se confirme tu plaza.
          </p>
          <Button
            onClick={() => { navigate('/'); window.location.href = '/'; }}
            className="btn-primary-gradient px-16 py-8 text-xs font-black uppercase tracking-widest shadow-2xl shadow-primary/20"
          >
            Volver al Inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="tournament-card p-0 overflow-hidden relative border border-white/10">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none" />

      <div className="p-8 md:p-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <UserPlus className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h2 className="font-display font-black text-3xl text-white uppercase tracking-tighter leading-none mb-1">
                {isAdmin ? 'Inscripción Manual' : 'Formulario de Inscripción'}
              </h2>
              <p className="text-[9px] text-white/40 uppercase tracking-[0.3em] font-bold">
                {activeTournament?.config.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl border border-white/5">
            <Clock className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Inscripciones Abiertas</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Jugador 1 */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary border border-primary/20">01</span>
              <h3 className="text-xs font-black uppercase tracking-widest text-white/60">Jugador Principal</h3>
            </div>

            {isAdmin ? (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">Correo Electrónico</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                    <input
                      type="email"
                      value={p1Email}
                      onChange={(e) => setP1Email(e.target.value)}
                      placeholder="Email Jugador 1"
                      className="input-sport pl-12 py-3 text-sm"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">Nombre</Label>
                    <input
                      value={p1FirstName}
                      onChange={(e) => setP1FirstName(e.target.value)}
                      placeholder="Nombre"
                      className="input-sport py-3 text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">Apellidos</Label>
                    <input
                      value={p1LastName}
                      onChange={(e) => setP1LastName(e.target.value)}
                      placeholder="Apellidos"
                      className="input-sport py-3 text-sm"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">Teléfono</Label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                    <input value={p1Phone} onChange={(e) => setP1Phone(e.target.value)} placeholder="Teléfono" className="input-sport pl-12 py-3 text-sm" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 bg-primary/5 rounded-[2rem] border border-primary/20 relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <ShieldCheck className="w-5 h-5 text-primary opacity-20" />
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">Conectado como</p>
                    <h4 className="text-xl font-black text-white">{user?.first_name} {user?.last_name}</h4>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-white/40 text-xs">
                  <Mail className="w-3.5 h-3.5" />
                  {user?.email}
                </div>
              </div>
            )}
          </div>

          {/* Jugador 2 */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-[10px] font-black text-accent border border-accent/20">02</span>
              <h3 className="text-xs font-black uppercase tracking-widest text-white/60">Datos del Compañero</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">Correo Electrónico</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-accent transition-colors" />
                  <input
                    type="email"
                    value={p2Email}
                    onChange={(e) => setP2Email(e.target.value)}
                    onBlur={checkPartnerEmail}
                    placeholder="jugador2@correo.com"
                    className="input-sport pl-12 py-3 text-sm focus:ring-accent/50 focus:border-accent/50"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">Nombre</Label>
                  <input
                    value={p2FirstName}
                    onChange={(e) => setP2FirstName(e.target.value)}
                    placeholder="Nombre"
                    className="input-sport py-3 text-sm"
                    readOnly={isP2Found}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">Apellidos</Label>
                  <input
                    value={p2LastName}
                    onChange={(e) => setP2LastName(e.target.value)}
                    placeholder="Apellidos"
                    className="input-sport py-3 text-sm"
                    readOnly={isP2Found}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">Teléfono (WhatsApp)</Label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-accent transition-colors" />
                  <input
                    value={p2Phone}
                    onChange={(e) => setP2Phone(e.target.value)}
                    placeholder="+34 600 000 000"
                    className="input-sport pl-12 py-3 text-sm focus:ring-accent/50 focus:border-accent/50"
                    readOnly={isP2Found}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 py-10 border-t border-white/5">
          <div className="max-w-md mx-auto space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <Star className="w-5 h-5 text-accent" />
                <h3 className="text-xs font-black uppercase tracking-widest text-white">Configuración Técnica</h3>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">Categoría / Nivel de Juego</Label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input-sport py-4 text-sm font-black uppercase tracking-widest"
                  required
                >
                  <option value="" className="bg-[#0a0a0a] text-white/20 italic">Seleccionar nivel oficial</option>
                  <option value="Iniciación" className="bg-[#0a0a0a] text-white">Iniciación</option>
                  <option value="Nivel Medio" className="bg-[#0a0a0a] text-white">Nivel Medio</option>
                </select>
              </div>
            </div>

            <div className="space-y-6">
              <Button
                type="submit"
                className="w-full btn-primary-gradient py-8 text-sm font-black uppercase tracking-[0.2em] shadow-2xl"
                disabled={!activeTournament || (isClosed && !isAdmin) || searching}
              >
                {searching ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    {isAdmin ? 'Añadir Pareja Oficial' : 'Inscribirse al Torneo'}
                    <ArrowRight className="w-5 h-5 ml-3" />
                  </>
                )}
              </Button>

              {isClosed && !isAdmin ? (
                <div className="flex items-center justify-center gap-3 p-4 bg-destructive/10 rounded-2xl border border-destructive/20 text-destructive animate-pulse">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Inscripciones bloqueadas</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3 py-2 text-white/20">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Registro seguro ARD SYSTEM</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default RegistrationForm;
