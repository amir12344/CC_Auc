import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Processing | Commerce Central',
  description: 'Data Processing information for Commerce Central platform',
};

export default function DataProcessingPage() {
  return (
    <article className="prose prose-lg max-w-none">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6">Data Processing Information</h1>
      
      <div className="text-sm text-gray-500 mb-8">
        Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
        <p>
          This Data Processing document describes how Commerce Central processes personal data 
          in connection with the services we provide to our customers. It outlines our data processing 
          activities, security measures, and compliance with applicable data protection laws.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Definitions</h2>
        <p>
          "Personal Data" means any information relating to an identified or identifiable natural person.
        </p>
        <p className="mt-4">
          "Processing" means any operation performed on Personal Data, such as collection, recording, 
          organization, structuring, storage, adaptation or alteration, retrieval, consultation, use, 
          disclosure, dissemination, or otherwise making available.
        </p>
        <p className="mt-4">
          "Data Controller" means the entity that determines the purposes and means of the Processing of Personal Data.
        </p>
        <p className="mt-4">
          "Data Processor" means the entity that Processes Personal Data on behalf of the Data Controller.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. Data Processing Activities</h2>
        <p>
          Commerce Central may process the following categories of Personal Data:
        </p>
        <ul className="list-disc pl-6 mt-4">
          <li>Contact information (name, email address, phone number, postal address)</li>
          <li>Account information (username, password)</li>
          <li>Transaction information (purchase history, payment details)</li>
          <li>Communication information (messages, feedback, support requests)</li>
          <li>Device and usage information (IP address, browser type, operating system)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Purpose of Processing</h2>
        <p>
          Commerce Central processes Personal Data for the following purposes:
        </p>
        <ul className="list-disc pl-6 mt-4">
          <li>Providing and improving our services</li>
          <li>Processing transactions and payments</li>
          <li>Communicating with users</li>
          <li>Customer support and service</li>
          <li>Compliance with legal obligations</li>
          <li>Fraud prevention and security</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Data Security Measures</h2>
        <p>
          Commerce Central implements appropriate technical and organizational measures to ensure a level 
          of security appropriate to the risk, including:
        </p>
        <ul className="list-disc pl-6 mt-4">
          <li>Encryption of personal data</li>
          <li>Regular testing and evaluation of security measures</li>
          <li>Access controls and authentication</li>
          <li>Data backup and recovery procedures</li>
          <li>Staff training on data protection</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
        <p>
          Commerce Central retains Personal Data only for as long as necessary to fulfill the purposes 
          for which it was collected, including for the purposes of satisfying any legal, accounting, 
          or reporting requirements.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Data Subject Rights</h2>
        <p>
          Commerce Central respects the rights of data subjects and will assist Data Controllers in 
          responding to requests from data subjects to exercise their rights under applicable data protection laws.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. Contact Information</h2>
        <p>
          For questions about our data processing activities, please contact us at dataprocessing@commercecentral.com.
        </p>
      </section>
    </article>
  );
}