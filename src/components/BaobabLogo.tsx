import { TreePine } from 'lucide-react';

export const BaobabLogo = ({ className = '' }: { className?: string }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <TreePine size={28} strokeWidth={1.5} className="text-primary" />
    <span className="font-display text-xl font-bold tracking-tight text-primary md:text-2xl">
      Pumzika
    </span>
  </div>
);
