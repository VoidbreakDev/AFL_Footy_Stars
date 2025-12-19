
import React from 'react';
import { AvatarConfig } from '../types';
import { getFaceUrl } from '../constants';

interface AvatarProps {
    avatar: AvatarConfig;
    teamColors?: [string, string];
    className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ avatar, teamColors, className }) => {
    const primaryColor = teamColors ? teamColors[0] : '#334155'; 
    const secondaryColor = teamColors ? teamColors[1] : '#ffffff';
    
    const faceUrl = getFaceUrl(avatar.faceId);

    return (
        <div className={`${className} relative overflow-hidden rounded-full bg-slate-300`}>
            {/* LAYER 1: THE BODY (SVG) */}
            {/* This vector graphic draws the shoulders and jersey, dynamically colored */}
            <svg 
                viewBox="0 0 100 100" 
                className="absolute bottom-0 left-0 w-full h-full z-0"
                preserveAspectRatio="xMidYMax meet"
            >
                <g transform="translate(0, 12)"> 
                    {/* Neck Stump (Placeholder for head to sit on) */}
                    <rect x="40" y="35" width="20" height="20" fill="#e2e8f0" />

                    {/* Shoulders */}
                    <path d="M15,100 L15,55 Q25,45 50,45 Q75,45 85,55 L85,100 Z" fill={primaryColor} />
                    
                    {/* Sash / Jersey Pattern */}
                    <path d="M50,45 L50,100" stroke={secondaryColor} strokeWidth="18" opacity="0.2" />
                    <path d="M50,45 L50,100" stroke={secondaryColor} strokeWidth="2" />
                    
                    {/* Collar */}
                    <path d="M35,55 Q50,70 65,55" fill="none" stroke={secondaryColor} strokeWidth="2.5" />
                </g>
            </svg>

            {/* LAYER 2: THE HEAD (IMAGE) */}
            {/* This loads the PNG/Image file. 
                We transform it slightly to ensure it sits nicely on the SVG neck. 
                clip-path is used to trim the bottom of the image if it includes a body.
            */}
            <img 
                src={faceUrl} 
                alt="Player Face" 
                className="absolute top-[5%] left-[15%] w-[70%] h-[70%] object-cover z-10"
                style={{ 
                    clipPath: 'polygon(0% 0%, 100% 0%, 100% 85%, 80% 100%, 20% 100%, 0% 85%)'
                }}
            />
        </div>
    );
};

export default Avatar;