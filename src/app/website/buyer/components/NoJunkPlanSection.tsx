import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';

const steps = [
  {
    number: 1,
    title: "Create Your Buyer Account",
    description: "Tell us what you sell and where you are. We'll match you with relevant inventory right away."
  },
  {
    number: 2,
    title: "Get Matched With Verified Loads",
    description: "Only see inventory you're eligible to buy — based on your store type, resale category, and pricing preferences."
  },
  {
    number: 3,
    title: "Buy With Confidence",
    description: "Every load is fully manifested, insured, and priced with shipping included upfront. No surprises. No guesswork."
  }
];

const NoJunkPlanSection = () => (
  <section id="how-it-works" className="w-full py-24 bg-gradient-to-br from-[#f8fdf8] to-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="relative text-center mb-20">
            <div className="absolute -top-10 left-1/3 w-64 h-64 bg-[#43CD66]/5 rounded-full blur-[80px] -z-10"></div>
            <div className="absolute top-0 right-1/3 w-48 h-48 bg-[#43CD66]/10 rounded-full blur-[60px] -z-10"></div>
            
            <span className="inline-block px-4 py-1.5 bg-[#43CD66]/10 text-[#43CD66] text-sm font-medium rounded-full mb-4">Simple & Transparent</span>
            <h2 className="text-4xl font-bold md:text-5xl text-[#1C1E21] mb-6">
              The <span className="text-[#43CD66]">No-Junk</span> Plan
            </h2>
            <p className="text-[#1C1E21]/70 max-w-2xl mx-auto mb-0">
              A clear path to buying inventory you can trust without the headaches.
            </p>
          </div>
          
          <div className="relative max-w-5xl mx-auto">
            {/* Connecting line */}
            <div className="absolute left-1/2 top-10 bottom-12 w-1 bg-gradient-to-b from-[#43CD66] to-[#43CD66]/30 hidden lg:block"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 relative">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                  initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                  className="group relative"
                >
                  {/* Step Card */}
                  <div className="bg-white rounded-2xl h-full overflow-hidden hover:shadow-xl transition-all duration-500 border border-gray-100 group-hover:border-[#43CD66]/30 p-6 lg:p-8">
                    {/* Step number bubble */}
                    <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#43CD66] to-[#43CD66]/80 text-white text-xl font-bold rounded-full mb-6 transform transition-transform duration-500 group-hover:scale-110 shadow-md">
                      {step.number}
                    </div>
                    
                    {/* Step illustration */}
                    <div className="mb-6 h-40 rounded-xl bg-[#f8fdf8] p-4 flex items-center justify-center relative overflow-hidden group-hover:bg-[#f0fdf0] transition-colors duration-500">
                      {index === 0 && (
                        <div className="relative h-full w-full">
                          <div className="absolute inset-x-0 top-0 h-32 w-32 mx-auto bg-[#43CD66]/10 rounded-full blur-md"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-20 h-20 text-[#43CD66]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M17 10H19C21 10 22 9 22 7V5C22 3 21 2 19 2H17C15 2 14 3 14 5V7C14 9 15 10 17 10Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M5 22H7C9 22 10 21 10 19V17C10 15 9 14 7 14H5C3 14 2 15 2 17V19C2 21 3 22 5 22Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M6 10C8.20914 10 10 8.20914 10 6C10 3.79086 8.20914 2 6 2C3.79086 2 2 3.79086 2 6C2 8.20914 3.79086 10 6 10Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M18 22C20.2091 22 22 20.2091 22 18C22 15.7909 20.2091 14 18 14C15.7909 14 14 15.7909 14 18C14 20.2091 15.7909 22 18 22Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                      )}
                      {index === 1 && (
                        <div className="relative h-full w-full">
                          <div className="absolute inset-x-0 top-0 h-32 w-32 mx-auto bg-[#43CD66]/10 rounded-full blur-md"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-20 h-20 text-[#43CD66]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M20.5 7.04L16 4.6C12.9 2.73 12.14 2.73 9 4.6L4.5 7.04C3.1 7.9 2 9.97 2 11.58V16.43C2 18.03 3.1 20.1 4.5 20.97L9 23.4C10.55 24.33 11.45 24.33 13 23.4L17.5 20.97C18.9 20.1 20 18.03 20 16.43V11.58C20 9.97 18.9 7.9 17.5 7.04Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M12 11C13.1046 11 14 10.1046 14 9C14 7.89543 13.1046 7 12 7C10.8954 7 10 7.89543 10 9C10 10.1046 10.8954 11 12 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M16 16.5C16 14.6 14.21 13 12 13C9.79 13 8 14.6 8 16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                      )}
                      {index === 2 && (
                        <div className="relative h-full w-full">
                          <div className="absolute inset-x-0 top-0 h-32 w-32 mx-auto bg-[#43CD66]/10 rounded-full blur-md"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-20 h-20 text-[#43CD66]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M7.75 12L10.58 14.83L16.25 9.17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-[#1C1E21] mb-3 group-hover:text-[#43CD66] transition-colors duration-300">{step.title}</h3>
                    <p className="text-[#1C1E21]/70 mb-6">{step.description}</p>
                    
                    {/* Indicator that there's more to come */}
                    {index < steps.length - 1 && (
                      <div className="lg:hidden w-8 h-8 bg-[#43CD66]/10 flex items-center justify-center rounded-full mx-auto mt-6">
                        <svg className="w-4 h-4 text-[#43CD66]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </div>
                    )}
                </div>
                  
                  {/* Connecting point for desktop view */}
                  <div className="absolute top-20 left-1/2 w-12 h-1 bg-[#43CD66] hidden lg:block" style={{ transform: index % 2 === 0 ? 'translateX(calc(50% + 12px))' : 'translateX(calc(-150% - 12px))' }}></div>
              </motion.div>
            ))}
            </div>
          </div>
          
          <div className="text-center mt-20">
        <Link href="/earlyAccess" className="bg-[#43CD66] hover:bg-[#3ab558] text-[#102D21] font-medium py-4 px-10 rounded-full inline-flex items-center transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Buy on Commerce Central
              <FaArrowRight className="ml-3" />
            </Link>
          </div>
        </div>
      </section>
);

export default NoJunkPlanSection;
