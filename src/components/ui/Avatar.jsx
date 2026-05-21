// src/components/ui/Avatar.jsx
import { getInitials, getAvatarColor } from '../../lib/utils';

export default function Avatar({ name = '', size = 'md', className = '' }) {
  const initials = getInitials(name);
  const gradient = getAvatarColor(name);

  const sizeMap = {
    sm: 'w-9 h-9 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
  };

  return (
    <div
      className={`bg-gradient-to-br ${gradient} ${sizeMap[size]} rounded-full
                  flex items-center justify-center font-black text-white
                  shadow-lg flex-shrink-0 ${className}`}
    >
      {initials}
    </div>
  );
}
