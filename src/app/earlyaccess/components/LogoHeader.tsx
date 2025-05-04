'use client';

import React from 'react';
import Logo from '@/src/features/website/components/ui/Logo';

export default function LogoHeader() {
  return (
    <div className="absolute top-4 left-8 z-20">
      <Logo variant="dark" showFullOnMobile={false} size={40} />
    </div>
  );
}