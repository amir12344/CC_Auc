'use client'
import Link from 'next/link'
import Image from 'next/image'
import SharedBackgroundPattern from '@/src/components/common/SharedBackgroundPattern'

// Utility functions for complex/repeated className strings
const sectionClasses = 'relative min-h-[600px] md:min-h-[700px] h-screen flex flex-col justify-between overflow-hidden bg-[#102D21] transition-all duration-700';

const heroImageClasses = "opacity-35 scale-[1.02] brightness-[0.9]";

const containerClasses = 'container mx-auto px-5 sm:px-6 lg:px-10 relative z-10 flex flex-col justify-between h-full pt-8 md:pt-10 pb-0 max-w-(--breakpoint-xl)';

const contentWrapperClasses = 'grow flex items-center justify-center pt-0 md:pt-0 pb-6 md:pb-8';

const contentClasses = 'mx-auto w-full lg:w-11/12 xl:w-9/12 pt-6 md:pt-8 lg:pt-10 xl:pt-12 text-center';

const headingClasses = "text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight md:mb-6 lg:mb-8 text-[#43CD66] tracking-tight max-w-5xl mx-auto drop-shadow-sm";

const descriptionClasses = "text-[clamp(1rem,2vw,1.5rem)] md:text-[clamp(1.25rem,2.5vw,2rem)] mb-6 md:mb-8 lg:mb-10 mx-auto space-y-3 sm:space-y-4 lg:space-y-4 max-w-3xl leading-relaxed";

const textClasses = "text-white flex items-center justify-center gap-1.5 drop-shadow-sm";

const buttonContainerClasses = 'flex flex-col sm:flex-row gap-5 mb-8 lg:mb-10 xl:mb-12 justify-center max-w-3xl mx-auto';

const earlyAccessButtonClasses = 'group relative px-6 sm:px-8 md:px-10 py-3.5 md:py-4 rounded-full bg-[#43CD66] text-[#0A2418] font-semibold transition-all duration-300 text-base sm:text-lg shadow-[0_0_20px_rgba(67,205,102,0.3)] hover:bg-[#43CD66]/10 hover:text-[#43CD66] hover:shadow-[0_0_30px_rgba(67,205,102,0.5)] hover:-translate-y-1 flex items-center justify-center border border-transparent hover:border-[#43CD66] overflow-hidden';

const HeroSectionClient = () => {

  return (
    <section
      id='hero'
      className={sectionClasses}
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/heroBanner.webp"
          alt="Modern warehouse and logistics" 
          fill 
          style={{ objectFit: 'cover' }}
          priority
          unoptimized
          quality={100}
          className={heroImageClasses}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#102D21]/90 via-[#102D21]/85 to-[#102D21]/90"></div>
      </div>

      {/* Enhanced grid pattern overlay with animation */}
      <SharedBackgroundPattern />

      <div className={containerClasses}>
        <div className={contentWrapperClasses}>
          <div className={contentClasses}>
          <h1
            className={headingClasses}
            style={{ willChange: 'transform, opacity' }}
          >
            The Go-To Platform to Move and Source <span className="italic text-[#D8F4CC]">Surplus Inventory</span> 
          </h1>

            <div
              className={descriptionClasses}
              style={{ willChange: "opacity" }}
            >
              <p className={textClasses}>
                Smart brands stay in control and recover more.
              </p>
              <p className={textClasses}>
                Smart buyers source better and skip the chaos.
              </p>
              <p className={`font-normal ${textClasses}`}>
                <span className="relative font-semibold text-[#43CD66]">
                  Commerce Central
                  <span className="absolute -bottom-1 left-0 w-full h-1 bg-[#25D366] rounded-full opacity-70"></span>
                </span>
                makes it all happen.
              </p>
            </div>

            <div
              className={buttonContainerClasses}
              style={{ willChange: 'transform, opacity' }}
            >
              <Link
                href='/earlyaccess'
                className={earlyAccessButtonClasses}
              >
                <span className='relative z-10 flex items-center'>
                  <span>Early Access</span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSectionClient
