import Image from "next/image";
import Link from "next/link";
import React from "react";

import { Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";

import { footerNavigation } from "../../../website/data/navigation";

const Footer: React.FC = () => {
  return (
    <footer
      className="border border-r-0 border-b-0 border-l-0 py-6 text-[#D8F4CC]"
      style={{ backgroundColor: "rgb(16 45 33)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {/* Brand Column */}
          <div>
            <div>
              {/* Static logo to keep marketing footer server-renderable and light */}
              <Image
                alt="Commerce Central"
                height={40}
                priority
                src="/CommerceCentral_logo_Green.svg"
                style={{ height: "auto" }}
                width={140}
              />
            </div>
            <p className="mb-3 text-[#F1E9DE]">
              The Trusted Channel For Surplus
            </p>
            <div className="flex space-x-3">
              {footerNavigation.social.map((social, index) => {
                let IconComp: React.ComponentType<{ className?: string }>;
                switch (social.icon) {
                  case "linkedin":
                    IconComp = Linkedin;
                    break;
                  case "instagram":
                    IconComp = Instagram;
                    break;
                  case "facebook":
                    IconComp = Facebook;
                    break;
                  case "youtube":
                    IconComp = Youtube;
                    break;
                  case "twitter":
                    IconComp = Twitter;
                    break;
                  default:
                    IconComp = Linkedin;
                }
                return (
                  <Link
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-800 text-[#F1E9DE] transition-colors hover:text-[#43CD66]"
                    aria-label={social.label}
                  >
                    <IconComp className="h-4 w-4" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-3 text-lg font-bold">Quick Links</h3>
            <ul className="space-y-1">
              {footerNavigation.quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-[#F1E9DE] hover:text-[#43CD66]"
                    {...(link.target ? { target: link.target } : {})}
                    {...(link.target === "_blank"
                      ? { rel: "noopener noreferrer" }
                      : {})}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-3 text-lg font-bold">Resources</h3>
            <ul className="space-y-1">
              {footerNavigation.resources.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-[#F1E9DE] hover:text-[#43CD66]"
                    {...(link.target ? { target: link.target } : {})}
                    {...(link.target === "_blank"
                      ? { rel: "noopener noreferrer" }
                      : {})}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="mt-6 border-t border-gray-800 pt-4">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <p className="text-sm text-[#F1E9DE]">
              {new Date().getFullYear()} Commerce Central. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
