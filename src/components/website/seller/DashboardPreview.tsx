
import Image from 'next/image';
import { motion } from 'framer-motion';

export const DashboardPreview = () => (
  <motion.div
    className="max-w-5xl mx-auto z-40"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 100, scale: 1 }}
    transition={{ duration: 0.4, delay: 0.3 }}
  >
    <Image src="/images/dashboard_preview.webp" alt="Dashboard Preview" unoptimized quality={100} width={1920}
      height={675} className="w-full object-cover rounded-t-[10px]" />
  </motion.div>
);
