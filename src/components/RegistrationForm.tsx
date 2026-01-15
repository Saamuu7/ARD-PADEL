import React, { useState } from 'react';
import { UserPlus, Users, Search, CheckCircle2 } from 'lucide-react';
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
  const isValidPhone = (phone: string) => /^\d{9}$/.test(phone);

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
      toast.error("El teléfono del Jugador 2 debe tener 9 dígitos");
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
        toast.error("El teléfono del Jugador 1 debe tener 9 dígitos");
        return;
      }
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
      <div className="tournament-card text-center py-12">
        <Users className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-bold mb-4">Inicia sesión para inscribirte</h3>
        <p className="text-muted-foreground mb-6">Necesitas una cuenta para gestionar tus torneos.</p>
        <Button onClick={() => setIsLoginOpen(true)} className="btn-primary-gradient">
          Identifícate / Regístrate
        </Button>
        <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      </div>
    );
  }

  const isClosed = activeTournament ? (activeTournament.config.registrationClosed || (activeTournament.phase && activeTournament.phase !== 'registration')) : false;

  if (isSuccess && !isAdmin) {
    return (
      <div className="tournament-card text-center py-12 animate-fade-in border-green-500/20 bg-green-500/5">
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6 animate-bounce-slow">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="font-display font-black text-3xl text-foreground uppercase tracking-tight mb-4">
          ¡Inscripción Confirmada!
        </h2>
        <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto leading-relaxed">
          Has inscrito a tu pareja correctamente. Tu compañero ha sido registrado.
        </p>
        <Button
          onClick={() => { navigate('/'); window.location.href = '/'; }}
          className="btn-primary-gradient px-12 py-6 text-lg font-black uppercase tracking-widest"
        >
          Continuar
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="tournament-card">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <UserPlus className="w-5 h-5 text-primary" />
        </div>
        <h2 className="font-display font-bold text-xl text-foreground">
          {isAdmin ? 'Inscribir Nueva Pareja (Manual)' : (isPublic ? 'Tu Inscripción' : 'Inscribir Pareja')}
        </h2>
      </div>

      <div className="space-y-6">
        {/* Jugador 1 */}
        {isAdmin ? (
          <div className="space-y-3 p-4 bg-white/5 rounded-2xl border border-white/5">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-2">Jugador 1</h3>
            <div className="flex-1">
              <Input type="email" value={p1Email} onChange={(e) => setP1Email(e.target.value)} placeholder="Email Jugador 1" className="bg-white/5 border-white/10 mb-2" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input value={p1FirstName} onChange={(e) => setP1FirstName(e.target.value)} placeholder="Nombre" className="bg-white/5 border-white/10" required />
              <Input value={p1LastName} onChange={(e) => setP1LastName(e.target.value)} placeholder="Apellidos" className="bg-white/5 border-white/10" required />
            </div>
            <Input value={p1Phone} onChange={(e) => setP1Phone(e.target.value)} placeholder="Teléfono" className="bg-white/5 border-white/10" />
          </div>
        ) : (
          <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-primary">Jugador 1 (Tú)</h3>
              <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full">Conectado</span>
            </div>
            <div className="text-lg font-bold">{user?.first_name} {user?.last_name}</div>
            <div className="text-sm text-muted-foreground">{user?.email}</div>
          </div>
        )}

        {/* Jugador 2 (Compañero) */}
        <div className="space-y-3 p-4 bg-white/5 rounded-2xl border border-white/5">
          <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-2">Jugador 2 {isAdmin ? '' : '(Compañero)'}</h3>

          <div className="flex gap-2">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1 block">Correo Electrónico</Label>
              <Input
                type="email"
                value={p2Email}
                onChange={(e) => setP2Email(e.target.value)}
                onBlur={checkPartnerEmail}
                placeholder="Email Jugador 2"
                className="bg-white/5 border-white/10"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Nombre</Label>
              <Input
                value={p2FirstName}
                onChange={(e) => setP2FirstName(e.target.value)}
                placeholder="Nombre"
                className="bg-white/5 border-white/10"
                readOnly={isP2Found}
                required
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Apellidos</Label>
              <Input
                value={p2LastName}
                onChange={(e) => setP2LastName(e.target.value)}
                placeholder="Apellidos"
                className="bg-white/5 border-white/10"
                readOnly={isP2Found}
                required
              />
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Teléfono</Label>
            <Input
              value={p2Phone}
              onChange={(e) => setP2Phone(e.target.value)}
              placeholder="Telefono"
              className="bg-white/5 border-white/10"
              readOnly={isP2Found}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Nivel / Categoría</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-medium text-white focus:outline-none focus:border-primary/50 transition-colors"
          >
            <option value="" className="bg-[#0a0a0a] text-white">Seleccionar nivel</option>
            <option value="Iniciación" className="bg-[#0a0a0a] text-white">Iniciación</option>
            <option value="Nivel Medio" className="bg-[#0a0a0a] text-white">Nivel Medio</option>
          </select>
        </div>

        <Button
          type="submit"
          className="w-full btn-primary-gradient py-6 text-base"
          disabled={!activeTournament || (isClosed && !isAdmin) || searching}
        >
          <Users className="w-5 h-5 mr-2" />
          {searching ? 'Procesando...' : (isAdmin ? 'Añadir Pareja' : 'Confirmar Inscripción')}
        </Button>
        {isClosed && !isAdmin && (
          <p className="text-sm text-center text-primary animate-fade-in">
            Las inscripciones para este torneo no están disponibles actualmente.
          </p>
        )}
      </div>
    </form>
  );
};

export default RegistrationForm;
