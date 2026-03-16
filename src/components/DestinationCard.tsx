import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DestinationCardProps {
  name: string;
  count: number;
  gradient: string;
  slug: string;
  index?: number;
}

export const DestinationCard = ({ name, count, gradient, slug, index = 0 }: DestinationCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
  >
    <Link
      to={`/search?destination=${slug}`}
      className="group relative block aspect-[3/4] overflow-hidden rounded-2xl md:aspect-[4/3]"
    >
      <div className={`absolute inset-0 ${gradient} transition-all duration-500 group-hover:brightness-110`} />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className="absolute bottom-0 left-0 right-0 p-4 md:p-5"
      >
        <h3 className="font-display text-xl font-semibold text-card md:text-2xl">{name}</h3>
        <p className="flex items-center gap-1 text-sm text-card/80">
          <MapPin size={12} strokeWidth={1.5} />
          {count} properties
        </p>
      </motion.div>
    </Link>
  </motion.div>
);
