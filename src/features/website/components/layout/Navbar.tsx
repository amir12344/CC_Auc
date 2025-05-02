'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../ui/Logo';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

interface Section {
  id: string;
  bgColor: string;
  textColor: string;
  buttonBgColor: string;
  buttonTextColor: string;
  variant?: 'light' | 'dark';
}

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [isTeamPage, setIsTeamPage] = useState<boolean>(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Define sections with their colors using useMemo to prevent recreation on every render
  const sections = useMemo<Section[]>(
    () => [
      {
        id: 'hero',
        bgColor: 'bg-[#102D21]',
        textColor: 'text-[#D8F4CC]',
        buttonBgColor: 'bg-[#43CD66]',
        buttonTextColor: 'text-[#1C1E21]',
      },
      {
        id: 'onboarding',
        bgColor: 'bg-white',
        textColor: 'text-[#1C1E21]',
        buttonBgColor: 'bg-[#43CD66]',
        buttonTextColor: 'text-white',
      },
      {
        id: 'stats',
        bgColor: 'bg-[#F9F9F9]',
        textColor: 'text-[#1C1E21]',
        buttonBgColor: 'bg-[#43CD66]',
        buttonTextColor: 'text-white',
      },
      {
        id: 'sellers-features',
        bgColor: 'bg-white',
        textColor: 'text-[#1C1E21]',
        buttonBgColor: 'bg-[#43CD66]',
        buttonTextColor: 'text-white',
      },
      {
        id: 'buyers-features',
        bgColor: 'bg-[#102D21]',
        textColor: 'text-[#D8F4CC]',
        buttonBgColor: 'bg-[#43CD66]',
        buttonTextColor: 'text-[#1C1E21]',
      },
      {
        id: 'testimonials',
        bgColor: 'bg-white',
        textColor: 'text-[#1C1E21]',
        buttonBgColor: 'bg-[#43CD66]',
        buttonTextColor: 'text-white',
      },
      {
        id: 'partners',
        bgColor: 'bg-[#F9F9F9]',
        textColor: 'text-[#1C1E21]',
        buttonBgColor: 'bg-[#43CD66]',
        buttonTextColor: 'text-white',
      },
      {
        id: 'team',
        bgColor: 'bg-[#102D21]',
        textColor: 'text-[#D8F4CC]',
        buttonBgColor: 'bg-[#43CD66]',
        buttonTextColor: 'text-[#1C1E21]',
      },
    ],
    []
  )


  // Update team page detection using pathname
  useEffect(() => {
    setIsTeamPage(pathname.includes('/website/team'));
  }, [pathname]);

  // Update the determineActiveSection function with useCallback to avoid recreation on each render
  const determineActiveSection = useCallback((): void => {
    // Only run this on the client side
    if (typeof window === 'undefined') {
      setActiveSection(sections[0]);
      return;
    }

    // Special case for team page
    if (isTeamPage) {
      const teamSection = sections.find(section => section.id === 'team');
      if (teamSection) {
        setActiveSection(teamSection);
        return;
      }
    }

    // The navbar height offset for determining when a section is active
    const navbarHeight = 100;
    const scrollPosition = window.scrollY + navbarHeight;

    // Default to the first section if we're at the top
    if (scrollPosition < 100) {
      setActiveSection(sections[0]);
      return;
    }

    // Check each section to see if it's in view
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = document.getElementById(sections[i].id);
      if (section) {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          setActiveSection(sections[i]);
          return;
        }
      }
    }

    // If no section is found, default to the first section
    setActiveSection(sections[0]);
  }, [isTeamPage, sections]);


  // Throttled scroll handler using requestAnimationFrame to reduce re-renders
  useEffect(() => {
    let ticking = false
    const onScroll = (): void => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 50)
          determineActiveSection()
          ticking = false
        })
      }
    }
    window.addEventListener('scroll', onScroll)
    // Initial call
    determineActiveSection()
    return () => window.removeEventListener('scroll', onScroll)
  }, [determineActiveSection])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      // Only handle sidebar clicks if the sidebar is open
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  // Track the current pathname to detect navigation completion
  // Removed useEffect that used setIsLoading

  // Prefetch common routes
  useEffect(() => {
    router.prefetch('/website/seller');
    router.prefetch('/website/buyer');
    router.prefetch('/website/team');
    router.prefetch('/earlyAccess');
    router.prefetch('/marketplace');
  }, [router]);

  // Simplified navigation handler
  const handleNavigation = (href: string) => {
    if (pathname === href) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Just use router.push - no manual loading state
    router.push(href);
  };

  // Get background style based on active section
  const getNavbarStyle = () => {
    if (!scrolled) {
      return isTeamPage ? 'bg-[#102D21]/90 backdrop-blur-md' : 'bg-transparent';
    }

    if (activeSection) {
      // For the hero section or team page, add opacity and blur for better visibility
      if (activeSection.id === 'hero' || activeSection.id === 'team') {
        return 'bg-[#102D21]/90 backdrop-blur-md';
      }

      // For other sections, use their background color with some opacity and blur
      return `${activeSection.bgColor.replace('bg-', '')}/90 backdrop-blur-md`;
    }

    return 'bg-white/90 backdrop-blur-md';
  };

  // Get text color style based on active section
  const getTextColorStyle = () => {
    if (isTeamPage) {
      return 'text-[#D8F4CC]';
    }

    if (activeSection) {
      return activeSection.textColor;
    }
    return 'text-[#D8F4CC]';
  };

  // Get button style based on active section
  const getButtonStyle = () => {
    if (isTeamPage) {
      return 'bg-[#43CD66] text-[#1C1E21]';
    }

    if (activeSection) {
      return `${activeSection.buttonBgColor} ${activeSection.buttonTextColor}`;
    }
    return 'bg-[#43CD66] text-[#1C1E21]';
  };

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${isTeamPage ? 'bg-[#102D21]/90 backdrop-blur-md' :
          scrolled ? getNavbarStyle() : 'bg-transparent'
        } ${scrolled || isTeamPage ? 'shadow-md' : ''}`}
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full'>
        <div className='flex justify-between items-center py-4 w-full'>
          {/* Logo - extreme left */}
          <div>
            <Logo showFullOnMobile={true} />
          </div>

          {/* Loading indicator removed */}

          {/* Desktop Navigation - extreme right */}
          <nav className='hidden md:flex items-center space-x-8 ml-auto'>
            <Link
              href='/website/seller'
              className={`font-[500] ${getTextColorStyle()} hover:underline font-geist transition-theme duration-400`}
            >
              Sellers
            </Link>

            <Link
              href='/website/buyer'
              className={`font-[500] ${getTextColorStyle()} hover:underline font-geist transition-theme duration-400`}
            >
              Buyers
            </Link>

            <Link
              href='/website/team'
              className={`font-[500] ${getTextColorStyle()} hover:underline font-geist transition-theme duration-400`}
            >
              Company
            </Link>

            <Link
              href='/earlyAccess'
              onClick={(e) => {
                e.preventDefault();
                handleNavigation('/earlyAccess');
              }}
              className={`px-6 py-2 rounded-full ${getButtonStyle()} font-medium hover:opacity-90 transition-all duration-200 shadow-xs`}
            >
              Early Access
            </Link>

            {/* <button
              onClick={() => handleNavigation('/auth')}
              className={`px-6 py-2 rounded-full ${getJoinButtonStyle()} font-medium transition-all duration-200 shadow-xs hover:shadow-md`}
            >
              Join Us
            </button> */}

            {/* <Link
              href='/marketplace'
              className={`px-6 py-2 rounded-full ${getButtonStyle()} font-medium hover:opacity-90 transition-all duration-200 shadow-xs`}
            >
              Marketplace
            </Link> */}
          </nav>

          {/* Mobile Menu Button */}
          <div className='flex items-center'>
            <div className='md:hidden'>
              <button
                title='Open menu'
                aria-label='Open menu'
                onClick={(e) => {
                  e.stopPropagation()
                  setIsOpen(!isOpen)
                }}
                className={`p-2 rounded-md font-bold ${getTextColorStyle()} hover:text-primary focus:outline-hidden`}
              >
                <svg
                  className='h-6 w-6'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  {isOpen ? (
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  ) : (
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M4 6h16M4 12h16M4 18h16'
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={sidebarRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className={`md:hidden ${activeSection?.bgColor || 'bg-white'} border-t border-gray-200`}
          >
            <div className='px-2 pt-2 pb-3 space-y-1 sm:px-3'>
              <Link
                href='/website/seller'
                className={`block px-3 py-2 rounded-md text-base font-bold ${getTextColorStyle()} hover:bg-gray-50 hover:text-primary font-geist transition-theme duration-400`}
              >
                Sellers
              </Link>

              <Link
                href='/website/buyer'
                className={`block px-3 py-2 rounded-md text-base font-medium ${getTextColorStyle()} hover:bg-gray-50 hover:text-primary font-geist transition-theme duration-400`}
              >
                Buyers
              </Link>

              <Link
                href='/website/team'
                className={`block px-3 py-2 rounded-md text-base font-medium ${getTextColorStyle()} hover:bg-gray-50 hover:text-primary font-geist transition-theme duration-400`}
              >
                Company
              </Link>

              <Link
                href='/earlyAccess'
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation('/earlyAccess');
                }}
                className={`block px-3 py-2 rounded-md text-base font-medium ${getTextColorStyle()} hover:bg-gray-50 hover:text-primary font-geist transition-theme duration-400`}
              >
                Early Access
              </Link>

              {/* <button
                onClick={() => handleNavigation('/auth')}
                className={`block w-full px-3 py-2 rounded-md text-base font-medium text-white ${activeSection?.id === 'hero' ? 'bg-[#102D21]' : 'bg-primary'} hover:bg-opacity-90 font-geist transition-theme duration-400 text-center mt-4`}
              >
                Join Us
              </button> */}

              <Link
                href='/marketplace'
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation('/marketplace');
                }}
                className={`block w-full px-3 py-2 rounded-md text-base font-medium ${activeSection?.id === 'hero' ? 'bg-[#43CD66] text-[#1C1E21]' : 'bg-[#43CD66] text-white'} hover:bg-opacity-90 font-geist transition-theme duration-400 text-center`}
              >
                Marketplace
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
};

export default Navbar;
