import { TreePine } from 'lucide-react';

export const BaobabLogo = ({ className = '' }: { className?: string }) => (
  <div className={`flex items-center ${className}`}>
    <img
      src="/pumzika-logo-full.png"
      alt="Pumzika"
      className="h-16 md:h-28 w-auto object-contain"
    />
  </div>
);
