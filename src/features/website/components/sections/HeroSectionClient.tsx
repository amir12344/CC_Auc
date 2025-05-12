'use client'
import Link from 'next/link'
import SharedBackgroundPattern from '@/src/components/common/SharedBackgroundPattern'

const HeroSectionClient = () => {

  return (
    <section
      id='hero'
      className='relative min-h-[600px] md:min-h-[700px] h-screen flex flex-col justify-between overflow-hidden bg-[#102D21] transition-all duration-700'
    >
      {/* Enhanced grid pattern overlay with animation */}
      <div
        className='absolute inset-0 transition-all duration-700 z-0 opacity-20'
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0',
          filter: 'blur(0.5px)',
        }}
        aria-hidden='true'
      />

      {/* Gradient orbs */}
      <div className="absolute top-20 -left-16 w-64 h-64 bg-[#43CD66] opacity-10 rounded-full blur-[80px]" aria-hidden="true"></div>
      <div className="absolute bottom-20 -right-16 w-80 h-80 bg-[#43CD66] opacity-5 rounded-full blur-[100px]" aria-hidden="true"></div>

      <div className='container mx-auto px-5 sm:px-6 lg:px-10 relative z-10 flex flex-col justify-between h-full pt-8 md:pt-10 pb-0 max-w-(--breakpoint-xl)'>
        <div className='grow flex items-center justify-center pt-0 md:pt-0 pb-6 md:pb-8'>
          <div className='mx-auto w-full lg:w-11/12 xl:w-9/12 pt-6 md:pt-8 lg:pt-10 xl:pt-12 text-center'>
            <div className='mb-4 md:mb-6 lg:mb-8 inline-block'>
              <div className='px-4 py-1.5 bg-[#43CD66]/10 rounded-full backdrop-blur-sm border border-[#43CD66]/20'>
                <span className='text-sm md:text-base font-medium text-[#43CD66]'>
                  Commerce Central
                </span>
              </div>
            </div>

            <h1
              className='text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight drop-shadow-xl  md:mb-6 lg:mb-8 text-[#43CD66] tracking-tight max-w-5xl mx-auto'
              style={{ willChange: 'transform, opacity' }}
            >
              The go-to platform to move and source surplus inventory
            </h1>

            <div
              className='text-sm sm:text-lg md:text-xl xl:text-xl mb-6 md:mb-8 lg:mb-10 mx-auto space-y-3 sm:space-y-4 lg:space-y-4 max-w-3xl leading-relaxed'
              style={{ willChange: 'opacity' }}
            >
              <p className='font-medium text-[#FFFFFF] flex items-center justify-center gap-1.5'>
                <span className='inline-block w-1.5 h-1.5 rounded-full bg-[#43CD66]'></span>
                Smart brands stay in control and recover more.
              </p>
              <p className='font-medium text-[#FFFFFF] flex items-center justify-center gap-1.5'>
                <span className='inline-block w-1.5 h-1.5 rounded-full bg-[#43CD66]'></span>
                Smart buyers source better and skip the chaos.
              </p>
              <p className='font-medium text-[#FFFFFF] flex items-center justify-center gap-1.5'>
                <span className='inline-block w-1.5 h-1.5 rounded-full bg-[#43CD66]'></span>
                <span className='relative'>
                  Commerce Central
                  <span className='absolute -bottom-1 left-0 w-full h-1 bg-[#25D366] rounded-full opacity-70'></span>
                </span>{' '}
                makes it all happen.
              </p>
            </div>

            <div
              className='flex flex-col sm:flex-row gap-5 mb-8 lg:mb-10 xl:mb-12 justify-center max-w-3xl mx-auto'
              style={{ willChange: 'transform, opacity' }}
            >
              <Link
                href='/earlyaccess'
                className='group relative px-6 sm:px-8 md:px-10 py-3.5 md:py-4 rounded-full bg-[#43CD66] text-[#0A2418] font-semibold transition-all duration-300 text-base sm:text-lg shadow-[0_0_20px_rgba(67,205,102,0.3)] hover:shadow-[0_0_30px_rgba(67,205,102,0.5)] hover:-translate-y-1 flex items-center justify-center hover:bg-[#50E575] overflow-hidden'
              >
                <span className='relative z-10 flex items-center'>
                  <span className='mr-2'>Early Access</span>
                  <span className='inline-block'>
                  </span>
                </span>
                <span className='absolute inset-0 bg-gradient-to-r from-[#43CD66] to-[#50E575] opacity-0 group-hover:opacity-100 transition-opacity duration-500'></span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSectionClient
