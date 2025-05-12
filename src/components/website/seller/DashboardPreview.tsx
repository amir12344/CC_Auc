
import Image from 'next/image';
import { motion } from 'framer-motion';

export const DashboardPreview = () => (
  <motion.div
    className="max-w-5xl mx-auto z-40"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 100, scale: 1 }}
    transition={{ duration: 0.4, delay: 0.3 }}
  >
    <Image src="/images/dashboard_preview.webp" alt="Dashboard Preview" unoptimized width={1000} quality={100} height={500} />
  </motion.div>
);
