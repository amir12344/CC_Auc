import React from 'react';
import Link from 'next/link';
import Logo from '../ui/Logo';
import { footerNavigation } from '../../../website/data/navigation';

const Footer: React.FC = () => {
  return (
    <footer
      className='text-[#D8F4CC] py-12 border border-r-0 border-l-0 border-b-0'
      style={{ backgroundColor: 'rgb(16 45 33)' }}
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>

        {/* Main Footer Content */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          {/* Brand Column */}
          <div>
            <div>
              <Logo showFullOnMobile={true} />
            </div>
            <p className='text-[#F1E9DE] mb-4'>The Trusted Channel For Surplus</p>
            <div className='flex space-x-3'>
              {footerNavigation.social.map((social, index) => {
                let iconPath

                switch (social.icon) {
                  case 'linkedin':
                    iconPath =
                      'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z'
                    break
                  default:
                    iconPath = ''
                }
                return (
                  <Link
                    key={index}
                    href={social.href}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='h-8 w-8 rounded-full bg-gray-800 flex items-center justify-left text-[#F1E9DE] hover:text-blue-400 transition-colors'
                    aria-label={social.label}
                  >
                    <svg
                      className='h-4 w-4'
                      fill='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        d={iconPath}
                        fillRule={
                          social.icon === 'github' ? 'evenodd' : undefined
                        }
                        clipRule={
                          social.icon === 'github' ? 'evenodd' : undefined
                        }
                      />
                    </svg>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className='text-lg font-bold mb-4'>Quick Links</h3>
            <ul className='space-y-2'>
              {footerNavigation.quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className='text-[#F1E9DE] hover:text-primary'
                    {...(link.target ? { target: link.target } : {})}
                    {...(link.target === '_blank' ? { rel: 'noopener noreferrer' } : {})}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className='text-lg font-bold mb-4'>Resources</h3>
            <ul className='space-y-2'>
              {footerNavigation.resources.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className='text-[#F1E9DE] hover:text-primary'
                    {...(link.target ? { target: link.target } : {})}
                    {...(link.target === '_blank' ? { rel: 'noopener noreferrer' } : {})}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Footer */}
        <div className='mt-12 pt-8 border-t border-gray-800'>
          <div className='flex flex-col md:flex-row justify-between items-center'>
            <p className='text-[#F1E9DE] text-sm'>
              {new Date().getFullYear()} Commerce Central. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
};

export default Footer;
