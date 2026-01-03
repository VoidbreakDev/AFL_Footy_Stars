import React, { useState } from 'react';
import { Team } from '../types';

interface TeamLogoProps {
  team: Team;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showBorder?: boolean;
}

const TeamLogo: React.FC<TeamLogoProps> = ({ team, size = 'md', className = '', showBorder = true }) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl',
    xl: 'w-20 h-20 text-3xl',
    '2xl': 'w-24 h-24 text-4xl'
  };

  const baseClasses = `${sizeClasses[size]} rounded-full flex items-center justify-center font-black ${
    showBorder ? 'border-4 border-white/50' : ''
  } shadow-lg overflow-hidden`;

  // Check if logo is an emoji (single character) or image URL
  const isEmoji = team.logo && team.logo.length <= 4;
  const isImageUrl = team.logo && (team.logo.startsWith('http') || team.logo.startsWith('/'));

  if (isImageUrl && !imageError) {
    // If it's an image URL, display as img element with fallback
    return (
      <div
        className={`${baseClasses} ${className} relative`}
        style={{
          background: `linear-gradient(135deg, ${team.colors[0]} 0%, ${team.colors[1]} 100%)`
        }}
      >
        <img
          src={team.logo}
          alt={`${team.name} logo`}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
          loading="lazy"
        />
      </div>
    );
  }

  // Default: Use emoji logo or fallback to first letter
  return (
    <div
      className={`${baseClasses} ${className}`}
      style={{
        background: `linear-gradient(135deg, ${team.colors[0]} 0%, ${team.colors[1]} 100%)`
      }}
    >
      <span className="drop-shadow-lg text-white">
        {(imageError || !isImageUrl) && team.logo && isEmoji ? team.logo : team.name.charAt(0)}
      </span>
    </div>
  );
};

export default TeamLogo;
