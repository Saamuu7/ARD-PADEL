import React, { useState, useEffect } from 'react';
import { Settings, Play, Plus, Trash2, Calendar, Clock, Trophy, Lock, Unlock, Users, Layers, Image as ImageIcon, Upload, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTournament } from '@/context/TournamentContext';
import { TournamentConfig as TournamentConfigType, CategoryConfig } from '@/types/tournament';
import { toast } from 'sonner';

const initialConfig: TournamentConfigType = {
  name: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  time: '10:00',
  totalTeams: 16,
  numberOfGroups: 4,
  qualifyFirst: 2,
  qualifyThird: false,
  numberOfThirdQualifiers: 0,
  registrationClosed: false,
  categorySettings: {}
};

interface TournamentConfigProps {
  isCreating: boolean;
  setIsCreating: (v: boolean) => void;
}

const TournamentConfigComponent: React.FC<TournamentConfigProps> = ({ isCreating, setIsCreating }) => {
  const {
    tournaments,
    activeTournament,
    createTournament,
    generateGroups,
    deleteTournament,
    updateTournamentConfig,
    setActiveTournament,
    finishTournament,
    generateFinalBracket
  } = useTournament();

  const [isEditing, setIsEditing] = useState(false);
  const [showGenerationSettings, setShowGenerationSettings] = useState(false);
  const [config, setConfig] = useState<TournamentConfigType>(initialConfig);

  useEffect(() => {
    if (isCreating) {
      setIsEditing(false);
      setConfig(initialConfig);
      setShowGenerationSettings(false);
    }
  }, [isCreating]);

  // State for category-specific wizard
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const categories = activeTournament
    ? Array.from(new Set(activeTournament.teams.filter(t => t.status === 'approved').map(t => t.category || 'General')))
    : [];

  useEffect(() => {
    if (tournaments.length === 0) {
      setIsCreating(true);
      setConfig(initialConfig);
    } else if (activeTournament && !isEditing && !isCreating) {
      setConfig(activeTournament.config);
    }
  }, [tournaments.length, activeTournament, isEditing, isCreating]);

  const handleCreate = async () => {
    if (!config.name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    await createTournament(config);
    setIsCreating(false);
    toast.success("Torneo creado!");
  };

  const handleUpdate = async () => {
    if (!config.name.trim()) {
      toast.error("El nombre no puede estar vacío");
      return;
    }
    await updateTournamentConfig(config);
    setIsEditing(false);
    toast.success("Torneo actualizado!");
  };

  const toggleRegistration = async () => {
    if (!activeTournament) return;
    const newConfig = {
      ...activeTournament.config,
      registrationClosed: !activeTournament.config.registrationClosed
    };
    await updateTournamentConfig(newConfig);
    toast.success(newConfig.registrationClosed ? "Inscripciones cerradas" : "Inscripciones abiertas");
  };

  const handleGenerateGroups = async () => {
    if (!activeTournament) return;

    // Save final settings (including category-specific ones) before generating
    await updateTournamentConfig(config);
    await generateGroups(config);
    setShowGenerationSettings(false);
    toast.success("Grupos generados correctamente");
  };

  const updateCategoryConfig = (catName: string, updates: Partial<CategoryConfig>) => {
    setConfig(prev => {
      const currentSettings = prev.categorySettings || {};
      const catConfig = currentSettings[catName] || {
        numberOfGroups: prev.numberOfGroups,
        qualifyFirst: prev.qualifyFirst,
        qualifyThird: prev.qualifyThird,
        numberOfThirdQualifiers: prev.numberOfThirdQualifiers
      };

      return {
        ...prev,
        categorySettings: {
          ...currentSettings,
          [catName]: { ...catConfig, ...updates }
        }
      };
    });
  };

  const renderCreationForm = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 block">Nombre del Torneo</label>
            <input
              className="input-sport"
              value={config.name}
              onChange={e => setConfig(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ej: Open ARD Madrid"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 block">Descripción</label>
            <textarea
              className="input-sport h-32"
              value={config.description}
              onChange={e => setConfig(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Premios, reglas, detalles..."
            />
          </div>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 block">Fecha</label>
              <input type="date" className="input-sport" value={config.date} onChange={e => setConfig(prev => ({ ...prev, date: e.target.value }))} />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 block">Hora</label>
              <input type="time" className="input-sport" value={config.time} onChange={e => setConfig(prev => ({ ...prev, time: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 block">Imagen del Torneo</label>
            <div className="flex gap-4 items-start">
              <div className="relative group w-32 h-32 rounded-2xl bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-primary/50">
                {config.image ? (
                  <>
                    <img src={config.image} alt="Preview" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                    <label className="absolute inset-0 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload className="w-6 h-6 text-white" />
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setConfig(prev => ({ ...prev, image: reader.result as string }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }} />
                    </label>
                  </>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                    <ImageIcon className="w-8 h-8 text-white/20 mb-2 group-hover:text-primary transition-colors" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/20 group-hover:text-white transition-colors">Subir Foto</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setConfig(prev => ({ ...prev, image: reader.result as string }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }} />
                  </label>
                )}
              </div>
              <div className="flex-1">
                <p className="text-[9px] text-white/40 leading-relaxed uppercase tracking-wider mb-2">
                  Esta imagen será la cara del torneo en la web. Usa una foto de buena calidad para atraer a más jugadores.
                </p>
                {config.image && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[9px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10"
                    onClick={() => setConfig(prev => ({ ...prev, image: '' }))}
                  >
                    Quitar Imagen
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl">
            <p className="text-xs text-primary/80 font-medium leading-relaxed italic">
              "Los ajustes técnicos (número de parejas y grupos) te los pediré más adelante, cuando decidas cerrar las inscripciones e iniciar la competición."
            </p>
          </div>
        </div>
      </div>
      <div className="flex gap-4">
        {isEditing ? (
          <Button onClick={handleUpdate} className="flex-1 btn-primary-gradient py-8">Guardar cambios</Button>
        ) : (
          <Button onClick={handleCreate} className="flex-1 btn-primary-gradient py-8">Crear Torneo Elite</Button>
        )}
        <Button variant="ghost" className="px-8 border border-white/10" onClick={() => { setIsEditing(false); setIsCreating(false); }}>Cancelar</Button>
      </div>
    </div>
  );

  const renderGenerationSettings = () => {
    const currentCat = categories[currentCategoryIndex];
    if (!currentCat) return null;

    const catTeamsCount = activeTournament?.teams.filter(t => t.status === 'approved' && (t.category || 'General') === currentCat).length || 0;

    // Get current settings for this category
    const catConfig = (config.categorySettings && config.categorySettings[currentCat]) || {
      numberOfGroups: config.numberOfGroups,
      qualifyFirst: config.qualifyFirst,
      qualifyThird: config.qualifyThird,
      numberOfThirdQualifiers: config.numberOfThirdQualifiers
    };

    const isLastCategory = currentCategoryIndex === categories.length - 1;

    return (
      <div className="space-y-8 animate-fade-in bg-[#0a0a0a] p-8 md:p-12 rounded-[3rem] border border-primary/20 shadow-2xl relative overflow-hidden">
        {/* Background Decorative */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] -z-10" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(25,231,142,0.1)]">
              <Layers className="w-7 h-7 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                  Paso {currentCategoryIndex + 1} de {categories.length}
                </span>
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tight text-white flex items-center gap-3">
                Configurar: <span className="text-primary italic">{currentCat}</span>
              </h3>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
            <Users className="w-5 h-5 text-primary" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Parejas Aprobadas</p>
              <p className="text-xl font-black text-white">{catTeamsCount}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Group Count */}
          <div className="space-y-6">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4 hover:border-primary/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Layers className="w-4 h-4 text-primary" />
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/60">Distribución</h4>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 block">Número de Grupos</label>
                <select
                  className="input-sport"
                  value={catConfig.numberOfGroups}
                  onChange={e => updateCategoryConfig(currentCat, { numberOfGroups: parseInt(e.target.value) })}
                >
                  {[1, 2, 3, 4, 6, 8].map(n => <option key={n} value={n}>{n} {n === 1 ? 'grupo' : 'grupos'}</option>)}
                </select>
                <p className="text-[9px] text-white/20 italic mt-2">
                  ~ {Math.ceil(catTeamsCount / (catConfig.numberOfGroups || 1))} parejas por grupo
                </p>
              </div>
            </div>
          </div>

          {/* Classification Rules */}
          <div className="space-y-6">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4 hover:border-primary/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/60">Clasificación</h4>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between bg-black/20 p-3 rounded-xl">
                  <span className="text-sm font-medium text-white/80 text-xs uppercase tracking-wider">Pasan por grupo</span>
                  <select
                    className="bg-transparent border-b border-primary text-primary font-bold focus:outline-none px-2"
                    value={catConfig.qualifyFirst}
                    onChange={e => updateCategoryConfig(currentCat, { qualifyFirst: parseInt(e.target.value) })}
                  >
                    {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl hover:bg-white/5 transition-colors">
                    <input
                      type="checkbox"
                      checked={catConfig.qualifyThird}
                      onChange={e => updateCategoryConfig(currentCat, { qualifyThird: e.target.checked })}
                      className="w-5 h-5 rounded-lg border-white/10 bg-white/5 text-primary focus:ring-primary"
                    />
                    <span className="text-xs font-black uppercase tracking-widest text-white/60 group-hover:text-primary transition-colors">¿Incluir mejores terceros?</span>
                  </label>

                  {catConfig.qualifyThird && (
                    <div className="pt-2 pl-8 border-l border-primary/20 animate-fade-in space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-white/40 block">Nº de Terceros</label>
                      <input
                        type="number"
                        min="1"
                        max="16"
                        className="input-sport h-10 py-1 text-center font-bold text-primary"
                        value={catConfig.numberOfThirdQualifiers}
                        onChange={e => updateCategoryConfig(currentCat, { numberOfThirdQualifiers: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wizard Navigation */}
        <div className="flex flex-col sm:flex-row gap-4 pt-8 mt-4 border-t border-white/5">
          {currentCategoryIndex > 0 && (
            <Button
              variant="outline"
              className="px-8 border border-white/10 font-black uppercase tracking-widest text-[10px] py-7"
              onClick={() => setCurrentCategoryIndex(prev => prev - 1)}
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Atrás
            </Button>
          )}

          {isLastCategory ? (
            <Button
              onClick={handleGenerateGroups}
              className="flex-1 btn-primary-gradient py-7 text-sm font-black uppercase tracking-widest shadow-2xl shadow-primary/20"
            >
              <Trophy className="w-5 h-5 mr-3" /> Terminar y Generar Todo
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentCategoryIndex(prev => prev + 1)}
              className="flex-1 btn-primary-gradient py-7 text-sm font-black uppercase tracking-widest"
            >
              Siguiente Categoría <ChevronRight className="w-5 h-5 ml-3" />
            </Button>
          )}

          <Button
            variant="ghost"
            className="px-8 border border-white/5 text-white/20 font-black uppercase tracking-widest text-[9px]"
            onClick={() => {
              setShowGenerationSettings(false);
              setCurrentCategoryIndex(0);
            }}
          >
            Cancelar Sorteo
          </Button>
        </div>
      </div>
    );
  };

  // Pagination for tournament list
  const [tournamentPage, setTournamentPage] = useState(0);
  const pageSize = 5;
  const paginatedTournaments = tournaments.slice(tournamentPage * pageSize, (tournamentPage + 1) * pageSize);
  const totalPages = Math.ceil(tournaments.length / pageSize);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-8">
        {totalPages > 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTournamentPage(prev => Math.max(0, prev - 1))}
            disabled={tournamentPage === 0}
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-primary disabled:opacity-10 transition-all shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}

        <div className="flex-1 flex items-center gap-3 min-w-0">
          {paginatedTournaments.map(t => (
            <button
              key={t.id}
              onClick={() => { setActiveTournament(t.id); setIsCreating(false); setIsEditing(false); setShowGenerationSettings(false); }}
              className={`flex-1 min-w-0 px-4 py-4 rounded-2xl border transition-all duration-500 flex items-center justify-center gap-2 group ${activeTournament?.id === t.id && !isCreating ? 'bg-primary border-primary text-background shadow-[0_0_30px_rgba(25,231,142,0.3)]' : 'bg-white/5 border-white/10 text-white/40 hover:border-primary/50'}`}
            >
              <Trophy className={`w-3.5 h-3.5 shrink-0 ${activeTournament?.id === t.id && !isCreating ? 'text-background' : 'text-primary'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest truncate w-full text-center">
                {t.config.name}
              </span>
            </button>
          ))}
          {/* Fill empty slots to maintain constant width if less than 5 tournaments */}
          {Array.from({ length: pageSize - paginatedTournaments.length }).map((_, i) => (
            <div key={`empty-${i}`} className="flex-1 min-w-0 h-[52px] rounded-2xl border border-white/5 opacity-20 bg-white/[0.02] border-dashed" />
          ))}
        </div>

        {totalPages > 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTournamentPage(prev => Math.min(totalPages - 1, prev + 1))}
            disabled={tournamentPage === totalPages - 1}
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-primary disabled:opacity-10 transition-all shrink-0"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        )}
      </div>

      <div className="tournament-card p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -z-10" />

        {(isCreating || isEditing) ? renderCreationForm() : showGenerationSettings ? renderGenerationSettings() : activeTournament ? (
          <div className="grid md:grid-cols-2 gap-12 animate-fade-in">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-8">
                <div>
                  <h2 className="text-4xl font-black uppercase tracking-tighter leading-none mb-2">{activeTournament.config.name}</h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Gestión de Competición</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="hover:bg-primary/10 text-primary"><Settings className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => {
                    if (window.confirm('¿Seguro que quieres borrar este torneo?')) deleteTournament(activeTournament.id);
                  }} className="hover:bg-destructive/10 text-destructive"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>

              <div className="space-y-4 text-white/60">
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="font-bold text-white uppercase">{activeTournament.config.date}</span>
                  <div className="w-1 h-1 rounded-full bg-white/20 mx-2" />
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="font-bold text-white tracking-widest">{activeTournament.config.time}</span>
                </div>
                <div className="p-6 bg-secondary/20 rounded-2xl border border-white/5">
                  <p className="italic text-sm leading-relaxed break-words whitespace-pre-wrap max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    "{activeTournament.config.description || 'Sin descripción disponible.'}"
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-6">
                {activeTournament.phase === 'registration' && (
                  <>
                    <Button
                      onClick={toggleRegistration}
                      className={`py-8 text-lg font-black uppercase tracking-widest transition-all ${activeTournament.config.registrationClosed ? 'bg-accent text-background border-accent shadow-accent/20' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}
                    >
                      {activeTournament.config.registrationClosed ? (
                        <><Unlock className="w-6 h-6 mr-3" /> Abrir Inscripciones</>
                      ) : (
                        <><Lock className="w-6 h-6 mr-3" /> Cerrar Inscripciones</>
                      )}
                    </Button>
                    <Button
                      onClick={() => {
                        if (!activeTournament.config.registrationClosed) {
                          toast.error("¡Debes CERRAR las inscripciones antes de generar los grupos!");
                          return;
                        }
                        const approvedHeader = activeTournament.teams.filter(t => t.status === 'approved').length;
                        setConfig(prev => ({
                          ...prev,
                          totalTeams: approvedHeader,
                          categorySettings: activeTournament.config.categorySettings || {}
                        }));
                        setCurrentCategoryIndex(0);
                        setShowGenerationSettings(true);
                      }}
                      className="btn-primary-gradient py-8 text-lg font-black uppercase tracking-widest"
                    >
                      <Play className="w-6 h-6 mr-3" /> Configurar Sorteo por Niveles
                    </Button>
                  </>
                )}
                {activeTournament.phase === 'groups' && (
                  <Button onClick={generateFinalBracket} className="btn-primary-gradient py-8 text-lg font-black uppercase tracking-widest">
                    <Play className="w-6 h-6 mr-3" /> Avanzar a Cuadro Final
                  </Button>
                )}
                {activeTournament.phase === 'bracket' && (
                  <Button onClick={finishTournament} className="w-full py-8 text-lg font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-500 border border-emerald-500/50 hover:bg-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all">
                    <Trophy className="w-6 h-6 mr-3" /> Finalizar Torneo (Oficial)
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl relative overflow-hidden group">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 blur-[50px] group-hover:bg-primary/20 transition-all duration-700" />
                <h3 className="text-xs font-black uppercase text-white/30 mb-8 tracking-[0.4em]">Estadísticas en Vivo</h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-end border-b border-white/5 pb-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase font-black text-white/40 tracking-widest">Participación</span>
                      <span className="text-sm font-bold">Parejas Inscritas</span>
                    </div>
                    <span className="text-3xl font-black text-primary leading-none">{activeTournament.teams.length}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <span className="text-[10px] uppercase font-black text-white/40 tracking-widest">Fase Actual</span>
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${activeTournament.config.registrationClosed ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                      {activeTournament.phase === 'registration'
                        ? (activeTournament.config.registrationClosed ? 'Inscripciones Cerradas' : 'Inscripciones Abiertas')
                        : activeTournament.phase === 'groups' ? 'Fase de Grupos'
                          : activeTournament.phase === 'bracket' ? 'Cuadro Final'
                            : 'Finalizado'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-8 border border-white/10">
              <Trophy className="w-10 h-10 text-white/10" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-widest text-white/20">Tu tablero está vacío</h3>
            <p className="text-xs text-white/10 mt-2 uppercase tracking-[0.3em]">Crea un torneo para empezar la acción</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentConfigComponent;
