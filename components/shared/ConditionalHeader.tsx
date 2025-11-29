'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import MobileNav from './MobileNav';

export default function ConditionalHeader() {
  const pathname = usePathname();
  
  // Don't show header/nav on login or admin pages
  if (pathname?.startsWith('/login') || pathname?.startsWith('/admin')) {
    return null;
  }
  
  return (
    <>
      <Header />
      <MobileNav />
    </>
  );
}
