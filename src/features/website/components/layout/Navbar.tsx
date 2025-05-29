'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Logo from '../ui/Logo';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
  SheetDescription
} from '@/src/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import { ChevronRight, X, ChevronDown, Calendar, Clock, Tag, Share2, ArrowLeft, Headphones, BookOpen, Users } from 'lucide-react';

interface Section {
  id: string;
  bgColor: string;
  textColor: string;
  buttonBgColor: string;
  buttonTextColor: string;
  variant?: 'light' | 'dark';
}

interface DropdownItemProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const DropdownItem: React.FC<DropdownItemProps> = ({ href, icon, title, description }) => (
  <DropdownMenuItem asChild className="focus:bg-[#F9F9F9] focus:outline-none">
    <Link
      href={href}
      className="flex items-start gap-5 px-6 py-5 w-full hover:bg-[#F9F9F9] transition-all duration-300 cursor-pointer group rounded-xl"
    >
      <div className="text-[#43CD66] flex items-center justify-center mt-1 transition-transform duration-300 group-hover:scale-110">
        {icon}
      </div>
      <div className="flex-1">
        <div className="font-[600] text-[17px] text-[#102D21] mb-1.5 group-hover:text-[#43CD66] transition-colors duration-300">
          {title}
        </div>
        <div className="text-[#475467] text-[15.5px] font-normal leading-relaxed">
          {description}
        </div>
      </div>
    </Link>
  </DropdownMenuItem>
);

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMediaExpanded, setIsMediaExpanded] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [isTeamPage, setIsTeamPage] = useState<boolean>(false);
  const [isLegalPage, setIsLegalPage] = useState<boolean>(false);
  const [isHiddenPage, setIsHiddenPage] = useState<boolean>(false);
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


  // Update page type detection using pathname
  useEffect(() => {
    const currentPath = pathname;
    setIsTeamPage(currentPath.includes('/website/team'));
    setIsLegalPage(currentPath.includes('/legal'));
    setIsHiddenPage(
      currentPath.startsWith('/wholesale-pallet-liquidation') ||
      currentPath.startsWith('/online-liquidation-auctions') ||
      currentPath.startsWith('/wholesale-liquidation-platform')
    );

    // Close mobile menu on route change
    setIsOpen(false);
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

  // Prefetch common routes
  useEffect(() => {
    router.prefetch('/website/seller');
    router.prefetch('/website/buyer');
    router.prefetch('/website/team');
    router.prefetch('/website/podcast');
    router.prefetch('/earlyaccess');
    router.prefetch('/marketplace');
  }, [router]);

  // Navigation handler - closes mobile menu on navigation
  const handleNavigation = (href: string) => {
    if (pathname === href) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.push(href);
    }

    // Close the mobile menu when navigating
    setIsOpen(false);
  };

  // Get background style based on active section
  const getNavbarStyle = () => {
    // This function now primarily handles scroll-based changes for multi-section pages
    // Solid backgrounds for specific page types are handled directly in the <header> className
    if (!scrolled && !(isLegalPage || isTeamPage || isHiddenPage)) {
      return 'bg-transparent';
    }

    if (activeSection && !(isLegalPage || isTeamPage || isHiddenPage)) {
      if (activeSection.id === 'hero') {
        return 'bg-[#102D21]/90 backdrop-blur-md';
      }
      return `${activeSection.bgColor.replace('bg-', '')}/90 backdrop-blur-md`;
    }

    // Fallback for scrolled state on multi-section pages if no other condition met,
    // or if it's a page type that should not be transparent at the top
    if (scrolled && !(isLegalPage || isTeamPage || isHiddenPage)) {
      return 'bg-white/90 backdrop-blur-md';
    }

    return ''; // Return empty if background is handled by specific page type logic in header
  };

  // Get text color style based on active section
  const getTextColorStyle = () => {
    if (isLegalPage || isTeamPage || isHiddenPage) {
      return 'text-[#D8F4CC]';
    }

    if (activeSection) {
      return activeSection.textColor;
    }
    return 'text-[#D8F4CC]'; // Default for hero or initially transparent states
  };

  // Get button style based on active section
  const getButtonStyle = () => {
    if (isLegalPage || isTeamPage || isHiddenPage) {
      return 'bg-[#43CD66] text-[#1C1E21]';
    }

    if (activeSection) {
      return `${activeSection.buttonBgColor} ${activeSection.buttonTextColor}`;
    }
    return 'bg-[#43CD66] text-[#1C1E21]'; // Default button style
  };

  // Determine base class for header, applying solid dark theme if needed
  let headerBaseClass = 'bg-[#102D21] backdrop-blur-md shadow-md';
  let headerDynamicClass = getNavbarStyle();

  return (
    <>
      <header
        className={`fixed w-full z-50 transition-all duration-300 ${isLegalPage || isTeamPage || isHiddenPage
          ? headerBaseClass // Always dark for these pages
          : scrolled ? headerDynamicClass : 'bg-transparent' // Dynamic for others
          } ${scrolled || isTeamPage || isLegalPage || isHiddenPage ? 'shadow-md' : ''}`}
      >
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full m-[0.5rem]'>
          <div className='flex justify-between items-center py-4 w-full'>
            {/* Logo - extreme left */}
            <div>
              <Logo showFullOnMobile={true} />
            </div>

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

              {/* Media Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className={`font-[500] ${getTextColorStyle()} hover:underline font-geist transition-theme duration-400 flex items-center gap-1 bg-transparent border-none outline-none focus:outline-none`}>
                  Media
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[420px] bg-white border border-[#E0D6C2] shadow-xl rounded-[13.632px] p-2.5">
                  <DropdownItem
                    href="/website/podcast"
                    icon={<Headphones className="h-[22px] w-[22px] stroke-[2px]" />}
                    title="Podcast"
                    description="Learn from industry experts and brands on The ReCommerce Podcast"
                  />
                  <div className="h-[1px] bg-[#E0D6C2]/70 mx-4 my-1" />
                  <DropdownItem
                    href="/website/blog"
                    icon={<BookOpen className="h-[22px] w-[22px] stroke-[2px]" />}
                    title="Blog"
                    description="Articles and resources"
                  />
                  <div className="h-[1px] bg-[#E0D6C2]/70 mx-4 my-1" />
                  <DropdownItem
                    href="/website/team"
                    icon={<Users className="h-[22px] w-[22px] stroke-[2px]" />}
                    title="Meet the team"
                    description="Meet the team behind Commerce Cental"
                  />
                </DropdownMenuContent>
              </DropdownMenu>

              <Link
                href='/earlyaccess'
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation('/earlyaccess');
                }}
                className={`px-6 py-2 rounded-full ${getButtonStyle()} font-medium hover:opacity-90 transition-all duration-200 shadow-xs`}
              >
                Early Access
              </Link>
            </nav>

            {/* Mobile Menu using shadcn Sheet component */}
            <div className='md:hidden'>
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <button
                    title='Open menu'
                    aria-label='Open menu'
                    className={`p-2 rounded-md font-bold ${getTextColorStyle()} hover:text-[#43CD66] focus:outline-hidden z-50 relative`}
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
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="bg-[#102D21] border-l border-[#43CD66]/20 p-0 w-[300px] sm:w-[350px]"
                >
                  {/* Add SheetTitle and SheetDescription for accessibility */}
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <SheetDescription className="sr-only">Main navigation links for Commerce Central</SheetDescription>

                  <div className="flex flex-col h-full pt-12">
                    {/* Navigation Links */}
                    <div className="flex-1 overflow-auto px-6">
                      <div className="space-y-6 py-6">
                        <div className="mb-8">
                          <h2 className="text-xl font-bold text-white mb-6 border-b border-[#43CD66]/20 pb-2">Menu</h2>
                          <nav className="flex flex-col space-y-5">
                            <SheetClose asChild>
                              <Link
                                href='/website/seller'
                                onClick={() => handleNavigation('/website/seller')}
                                className="group flex items-center text-lg font-medium text-white hover:text-[#43CD66] transition-colors"
                              >
                                <span>Sellers</span>
                                <ChevronRight className="ml-auto h-5 w-5 text-[#43CD66] opacity-0 group-hover:opacity-100 transition-opacity" />
                              </Link>
                            </SheetClose>

                            <SheetClose asChild>
                              <Link
                                href='/website/buyer'
                                onClick={() => handleNavigation('/website/buyer')}
                                className="group flex items-center text-lg font-medium text-white hover:text-[#43CD66] transition-colors"
                              >
                                <span>Buyers</span>
                                <ChevronRight className="ml-auto h-5 w-5 text-[#43CD66] opacity-0 group-hover:opacity-100 transition-opacity" />
                              </Link>
                            </SheetClose>

                            {/* Media Section in Mobile */}
                            <div className="space-y-4">
                              <button
                                onClick={() => setIsMediaExpanded(!isMediaExpanded)}
                                className="w-full flex items-center justify-between text-lg font-medium text-[#43CD66] group"
                              >
                                <span>Media</span>
                                <ChevronDown
                                  className={`h-5 w-5 transition-transform duration-200 ${isMediaExpanded ? 'rotate-180' : ''}`}
                                />
                              </button>
                              <div className={`pl-2 space-y-6 overflow-hidden transition-all duration-300 ${isMediaExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <SheetClose asChild>
                                  <Link
                                    href='/website/podcast'
                                    onClick={() => handleNavigation('/website/podcast')}
                                    className="flex items-start gap-4 group"
                                  >
                                    <div className="text-[#43CD66] mt-1">
                                      <Headphones className="h-5 w-5 stroke-[2px]" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-medium text-white group-hover:text-[#43CD66] transition-colors">
                                        Podcast
                                      </div>
                                      <div className="text-sm text-[#D8F4CC]/80">
                                        Learn from industry experts and brands on The ReCommerce Podcast
                                      </div>
                                    </div>
                                  </Link>
                                </SheetClose>

                                <SheetClose asChild>
                                  <Link
                                    href='/website/blog'
                                    onClick={() => handleNavigation('/website/blog')}
                                    className="flex items-start gap-4 group"
                                  >
                                    <div className="text-[#43CD66] mt-1">
                                      <BookOpen className="h-5 w-5 stroke-[2px]" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-medium text-white group-hover:text-[#43CD66] transition-colors">
                                        Blog
                                      </div>
                                      <div className="text-sm text-[#D8F4CC]/80">
                                        Articles and resources
                                      </div>
                                    </div>
                                  </Link>
                                </SheetClose>

                                <SheetClose asChild>
                                  <Link
                                    href='/website/team'
                                    onClick={() => handleNavigation('/website/team')}
                                    className="flex items-start gap-4 group"
                                  >
                                    <div className="text-[#43CD66] mt-1">
                                      <Users className="h-5 w-5 stroke-[2px]" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-medium text-white group-hover:text-[#43CD66] transition-colors">
                                        Meet the team
                                      </div>
                                      <div className="text-sm text-[#D8F4CC]/80">
                                        Meet the team behind Commerce Central
                                      </div>
                                    </div>
                                  </Link>
                                </SheetClose>
                              </div>
                            </div>

                            <SheetClose asChild>
                              <Link
                                href='/earlyaccess'
                                onClick={() => handleNavigation('/earlyaccess')}
                                className="flex h-12 w-full items-center justify-center rounded-full bg-[#43CD66] font-medium text-[#102D21] shadow-sm hover:bg-[#43CD66]/90 transition-colors"
                              >
                                Early Access
                              </Link>
                            </SheetClose>
                          </nav>
                        </div>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    </>
  )
};

export default Navbar;
