// Buyer Deals Feature - Barrel Export
// Comprehensive deals functionality for buyers including messaging

// Main Deals Components
export { default as DashboardOverview } from './components/DashboardOverview';
export { default as AllDeals } from './components/AllDeals';
export { default as Offers } from './components/Offers';
export { default as Orders } from './components/Orders';

// Navigation Components (using named exports)
export { BuyerNavigation } from './components/navigation/BuyerNavigation';

// Data Display Components (using named exports)
export { DataTable } from './components/DataTable';
export { SectionCards } from './components/SectionCards';

// Messaging Components
export { default as Messages } from './components/Messages';
export { Mail as MailComponent } from './components/messaging/Mail';
export { MailDisplay } from './components/messaging/MailDisplay';
export { MailList } from './components/messaging/MailList';
export { AccountSwitcher } from './components/messaging/AccountSwitcher';
export { Nav as MailNav } from './components/messaging/Nav';

// Messaging Data and Types
export { mails, accounts, contacts } from './components/messaging/data';
export type { Mail, Account, Contact } from './components/messaging/data';

// Hooks
export { useMail } from './components/messaging/use-mail';

// Types
export * from './types'; 