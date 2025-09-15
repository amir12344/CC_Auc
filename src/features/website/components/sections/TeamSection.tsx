import Image from "next/image";
import type React from "react";

interface TeamMember {
  name: string;
  title: string;
  imagePath: string;
}

/**
 * TeamSection - Server Component
 * Displays team members in a grid layout with enhanced styling
 * All content is server-side rendered for optimal SEO
 */
const TeamSection: React.FC = () => {
  const teamMembers: TeamMember[] = [
    {
      name: "Shivang Maheshwari",
      title: "Co-Founder and CEO",
      imagePath: "/images/Shivang.webp",
    },
    {
      name: "Isaac Chung",
      title: "Co-Founder and COO",
      imagePath: "/images/Isaac.webp",
    },
    {
      name: "Amir Sayyad",
      title: "VP of Engineering",
      imagePath: "/images/Amir.webp",
    },
  ];

  return (
    <section
      className="transition-theme relative min-h-[100dvh] overflow-hidden py-24 duration-400 md:py-36"
      id="team"
    >
      {/* Enhanced grid pattern background with subtle green accent */}
      <div
        aria-hidden="true"
        className="transition-theme absolute inset-0 duration-400"
        style={{
          backgroundImage: `
                linear-gradient(to right, rgba(67, 205, 102, 0.07) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(67, 205, 102, 0.07) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          backgroundColor: "transparent",
          filter: "blur(0.5px)",
        }}
      />

      {/* Enhanced edge blur gradients with subtle green tint */}
      <div
        aria-hidden="true"
        className="transition-theme pointer-events-none absolute inset-0 duration-400"
        style={{
          background: `
                radial-gradient(circle at center, transparent 60%, rgba(240, 240, 240, 0.8) 100%),
                radial-gradient(circle at top left, rgba(67, 205, 102, 0.08) 0%, transparent 40%),
                radial-gradient(circle at top right, rgba(67, 205, 102, 0.08) 0%, transparent 40%),
                radial-gradient(circle at bottom left, rgba(67, 205, 102, 0.08) 0%, transparent 40%),
                radial-gradient(circle at bottom right, rgba(67, 205, 102, 0.08) 0%, transparent 40%)
              `,
        }}
      />

      {/* Enhanced dot pattern overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage: "radial-gradient(#43CD66 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      {/* Additional decorative elements */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 h-64 w-64 -translate-x-1/3 -translate-y-1/3 rounded-full bg-[#43CD66] opacity-5"
      />
      <div
        aria-hidden="true"
        className="absolute right-0 bottom-0 h-96 w-96 translate-x-1/3 translate-y-1/3 rounded-full bg-[#43CD66] opacity-5"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header section */}
        <div className="mb-24 text-center">
          <div className="mt-2 mb-4 inline-flex items-center justify-center">
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#43CD66]/70" />
            <span className="mx-3 inline-block text-lg font-semibold tracking-wide text-[#43CD66]">
              OUR TEAM
            </span>
            <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[#43CD66]/70" />
          </div>
          <h2 className="transition-theme mx-auto mb-8 max-w-4xl text-3xl leading-tight font-[600] text-[#1C1E21] duration-400 md:text-5xl">
            Join us on a revolution to transform how surplus inventory is sold
            and bought
          </h2>
        </div>

        {/* Team members grid */}
        <div
          className={`flex flex-wrap justify-center gap-8 ${teamMembers.length === 5 ? "mx-auto max-w-5xl" : ""}`}
        >
          {teamMembers.map((member) => (
            <div
              className="group w-full max-w-xs transition-transform duration-300 hover:-translate-y-1 sm:w-80"
              key={member.name}
            >
              <div className="relative h-80 overflow-hidden rounded-xl shadow-lg transition-all duration-300 group-hover:shadow-xl">
                <Image
                  alt={member.name}
                  className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  height={533}
                  priority
                  quality={70}
                  src={member.imagePath}
                  unoptimized
                  width={400}
                />
              </div>
              <div className="transition-theme p-4 duration-400">
                <h3 className="transition-theme group-hover:text-primary mb-1 text-xl font-[500] text-[#43CD66] duration-400">
                  {member.name}
                </h3>
                <p className="text-md transition-theme text-[#1C1E21] duration-400">
                  {member.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
