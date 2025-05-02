import { User } from 'lucide-react';
import { useAvatar } from '@/contexts/AvatarContext';

interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  avatarUrl?: string | null;
}

const sizeClasses = {
  sm: {
    container: 'w-8 h-8',
    icon: 'w-4 h-4'
  },
  md: {
    container: 'w-16 h-16',
    icon: 'w-8 h-8'
  },
  lg: {
    container: 'w-24 h-24',
    icon: 'w-12 h-12'
  }
};

export function UserAvatar({ size = 'md', className = '', avatarUrl: propAvatarUrl }: UserAvatarProps) {
  const { avatarUrl: contextUrl } = useAvatar();

  // Prioritize propAvatarUrl if it's explicitly passed (not undefined). Otherwise, use the context URL.
  // Note: contextUrl already includes cache-busting. If propAvatarUrl is used, it MUST also include cache-busting.
  const displayUrl = propAvatarUrl !== undefined ? propAvatarUrl : contextUrl;

  console.log(`[UserAvatar] Using URL: ${displayUrl} (Prop: ${propAvatarUrl}, Context: ${contextUrl})`);

  const { container, icon } = sizeClasses[size];
  
  return (
    <div className={`rounded-full bg-gray-700 flex items-center justify-center overflow-hidden ${container} ${className}`}>
      {displayUrl ? (
        <img 
          src={displayUrl}
          alt="Avatar" 
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error(`[UserAvatar] Error loading avatar: ${displayUrl}`, e); // Log error with URL
            const imgElement = e.currentTarget;
            const fallbackContainer = imgElement.parentElement; // Get parent div
            if (fallbackContainer) {
               // Hide the img tag itself
               imgElement.style.display = 'none';
               // Find the sibling User icon and ensure it's visible
               const fallbackIcon = fallbackContainer.querySelector('.lucide-user'); // Find by class
               if (fallbackIcon) {
                 fallbackIcon.classList.remove('hidden');
               }
            }
          }}
        />
      ) : null}
      <User className={`text-gray-400 ${icon} ${displayUrl ? 'hidden' : ''}`} />
    </div>
  );
} 