
import React from 'react';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SecureIconProps {
  size?: number;
  className?: string;
}

const SecureIcon: React.FC<SecureIconProps> = ({ size = 16, className }) => {
  return (
    <div className={cn("inline-flex items-center", className)}>
      <Lock size={size} className="text-green-500 animate-pulse-secure" />
    </div>
  );
};

export default SecureIcon;
