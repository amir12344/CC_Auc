import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Processing Addendum (DPA) | Commerce Central',
  description: 'Data Processing Addendum (DPA) for Commerce Central platform',
};

export default function AddendumPage() {
  return (
    <article className="prose prose-lg max-w-none">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6">Data Processing Addendum (DPA)</h1>
      
      <div className="text-sm text-gray-500 mb-8">
        Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
        <p>
          This Data Processing Addendum ("DPA") forms part of the Terms of Service between Commerce Central 
          and the Customer and applies to the extent that Commerce Central processes Personal Data on behalf 
          of the Customer in the course of providing the Services.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Scope and Applicability</h2>
        <p>
          This DPA applies to the Processing of Personal Data by Commerce Central on behalf of the Customer 
          in connection with the Services provided under the Terms of Service. It sets out the parties' 
          obligations with respect to the protection of Personal Data.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. Processing of Personal Data</h2>
        <p>
          Commerce Central shall Process Personal Data only on documented instructions from the Customer, 
          including with regard to transfers of Personal Data to a third country or an international organization, 
          unless required to do so by applicable law.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Confidentiality</h2>
        <p>
          Commerce Central shall ensure that persons authorized to Process the Personal Data have committed 
          themselves to confidentiality or are under an appropriate statutory obligation of confidentiality.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Security of Processing</h2>
        <p>
          Commerce Central shall implement appropriate technical and organizational measures to ensure a level 
          of security appropriate to the risk, taking into account the state of the art, the costs of implementation, 
          and the nature, scope, context, and purposes of Processing as well as the risk of varying likelihood 
          and severity for the rights and freedoms of natural persons.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Sub-processors</h2>
        <p>
          Commerce Central shall not engage another processor without prior specific or general written authorization 
          of the Customer. In the case of general written authorization, Commerce Central shall inform the Customer 
          of any intended changes concerning the addition or replacement of other processors, thereby giving the 
          Customer the opportunity to object to such changes.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Data Subject Rights</h2>
        <p>
          Taking into account the nature of the Processing, Commerce Central shall assist the Customer by appropriate 
          technical and organizational measures, insofar as this is possible, for the fulfillment of the Customer's 
          obligation to respond to requests for exercising the data subject's rights under applicable data protection laws.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. Data Breach Notification</h2>
        <p>
          Commerce Central shall notify the Customer without undue delay after becoming aware of a personal data breach 
          and shall assist the Customer in ensuring compliance with its obligations regarding the notification of a 
          personal data breach to the supervisory authority and to the data subjects, taking into account the nature 
          of Processing and the information available to Commerce Central.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">9. Deletion or Return of Personal Data</h2>
        <p>
          At the choice of the Customer, Commerce Central shall delete or return all the Personal Data to the Customer 
          after the end of the provision of Services relating to Processing, and delete existing copies unless applicable 
          law requires storage of the Personal Data.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
        <p>
          For questions about this DPA, please contact us at dpa@commercecentral.com.
        </p>
      </section>
    </article>
  );
}