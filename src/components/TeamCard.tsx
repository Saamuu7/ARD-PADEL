import React from 'react';
import { Users, X, Pencil } from 'lucide-react';
import { Team } from '@/types/tournament';

interface TeamCardProps {
  team: Team;
  onRemove?: () => void;
  onEdit?: () => void;
  showRemove?: boolean;
  isWinner?: boolean;
  compact?: boolean;
}

const TeamCard: React.FC<TeamCardProps> = ({
  team,
  onRemove,
  onEdit,
  showRemove = false,
  isWinner = false,
  compact = false
}) => {
  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${isWinner ? 'font-bold text-primary' : ''}`}>
        <Users className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm truncate">
          {team.player1.name} / {team.player2.name}
        </span>
        {isWinner && (
          <span className="winner-badge text-xs">🏆</span>
        )}
      </div>
    );
  }

  return (
    <div className={`tournament-card flex items-center justify-between ${isWinner ? 'ring-2 ring-accent' : ''
      }`}>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Users className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-foreground">
            {team.player1.name}
          </p>
          <p className="text-muted-foreground">
            {team.player2.name}
          </p>
          {team.category && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded-full">
              {team.category}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onEdit && (
          <button
            onClick={onEdit}
            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
        {showRemove && onRemove && (
          <button
            onClick={() => {
              if (window.confirm('¿Estás seguro de que quieres eliminar esta pareja?')) {
                onRemove();
              }
            }}
            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      {isWinner && (
        <span className="winner-badge">🏆 Campeón</span>
      )}
    </div>
  );
};

export default TeamCard;
