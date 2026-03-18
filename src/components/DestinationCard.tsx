import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface DestinationCardProps {
  name: string;
  count: number;
  image: string;
  slug: string;
  index?: number;
}

export const DestinationCard = ({ name, count, image, slug, index = 0 }: DestinationCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
  >
    <div className="group relative block aspect-[3/4] overflow-hidden rounded-[32px] md:aspect-[4/5] shadow-sm hover:shadow-xl transition-all duration-500">
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h3 className="font-display text-2xl font-bold text-white mb-1">{name}</h3>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          <p className="text-sm font-medium text-white/90">
            {count} {count === 1 ? 'Available stay' : 'Available stays'}
          </p>
        </div>
      </div>
    </div>
  </motion.div>
);
