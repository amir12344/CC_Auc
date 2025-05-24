// ============================
// Type Definitions
// ============================

export interface NavItem {
  label: string;
  href: string;
  target?: string;
  children?: NavItem[];
}

// ============================
// Main Navigation
// ============================

export const mainNavigation: NavItem[] = [
  {
    label: 'Sellers',
    href: '/website/seller',
  },
  {
    label: 'Buyers',
    href: '/website/buyer',
  },
  {
    label: 'Company',
    href: '/website/team',
  },
];

// ============================
// Footer Navigation
// ============================

export const footerNavigation: {
         quickLinks: NavItem[]
         resources: NavItem[]
         social: Array<NavItem & { icon: string }>
       } = {
         // ---- Quick Links ----
         quickLinks: [
           { label: 'Home', href: '/' },
           { label: 'Sellers', href: '/website/seller' },
           { label: 'Buyers', href: '/website/buyer' },
           { label: 'Company', href: '/website/team' },
           {
             label: 'Blog',
             href: '/website/Blog',
           },
         ],

         // ---- Resources ----
         resources: [
           { label: 'Terms', href: '/website/legal/terms', target: '_blank' },
           {
             label: 'Privacy Policy',
             href: '/website/legal/privacy-policy',
             target: '_blank',
           },
           {
             label: 'Addendum (DPA)',
             href: '/website/legal/addendum',
             target: '_blank',
           },
         ],

         // ---- Social Links ----
         social: [
           // { label: 'Twitter', href: '#', icon: 'twitter' },
           {
             label: 'LinkedIn',
             href: 'https://www.linkedin.com/company/commercecentral',
             icon: 'linkedin',
             target: '_blank',
           },
         ],
       }

