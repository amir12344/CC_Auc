import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Processing Addendum (DPA) | Commerce Central',
  description: 'Data Processing Addendum (DPA) for Commerce Central platform',
  alternates: {
    canonical: 'https://www.commercecentral.io/website/legal/addendum'
  },
  openGraph: {
    url: 'https://www.commercecentral.io/website/legal/addendum',
    title: 'Data Processing Addendum (DPA) | Commerce Central',
    description: 'Data Processing Addendum (DPA) for Commerce Central platform',
    images: [
      {
        url: '/CC_opengraph.png',
        width: 1200,
        height: 364,
        alt: 'Commerce Central Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Data Processing Addendum (DPA) | Commerce Central',
    description: 'Data Processing Addendum (DPA) for Commerce Central platform',
    images: ['/CC_opengraph.png'],
  },
};

export default function AddendumPage() {
  return (
    <main className="container mx-auto px-4 py-8 mt-10">
      <article className="prose lg:prose-xl max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Data Processing Addendum (DPA)</h1>

        <p className="mb-4">
          This Data Processing Addendum (“Addendum”) supplements the Enterprise Service Agreement or terms of service (the “Agreement”) entered into by and between you (“Customer”) and Commerce Central, Inc. (“Commerce Central”). This Addendum incorporates the terms of the Agreement, and any terms not defined in this Addendum shall have the meaning set forth in the Agreement.
        </p>

        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-4">1. Definitions</h2>

          <div className="mb-4">
            <p className="font-bold">1.1 <strong>"Authorized Sub-Processor"</strong></p>
            <p>means a third-party who has a need to know or otherwise access Customer’s Personal Data to enable Commerce Central to perform its obligations under this Addendum or the Agreement, and who is either (1) listed in Exhibit B or (2) subsequently authorized under Section 4.2 of this Addendum.</p>
          </div>

          <div className="mb-4">
            <p className="font-bold">1.2 <strong>"Customer Account Data"</strong></p>
            <p>means Personal Data that relates to Customer’s relationship with Commerce Central, including the names or contact information of individuals authorized by Customer to access Customer’s account and billing information of individuals that Customer has associated with its account. Customer Account Data also includes any data Commerce Central may need to collect for the purpose of managing its relationship with Customer, identity verification, or as otherwise required by applicable laws and regulations.</p>
          </div>

          <div className="mb-4">
            <p className="font-bold">1.3 <strong>"Customer Usage Data"</strong></p>
            <p>means Service usage data collected and processed by Commerce Central in connection with the provision of the Services, including without limitation data used to identify the source and destination of a communication, activity logs, and data used to optimize and maintain performance of the Services, and to investigate and prevent system abuse.</p>
          </div>

          <div className="mb-4">
            <p className="font-bold">1.4 <strong>"Data Exporter"</strong></p>
            <p>means Customer.</p>
          </div>

          <div className="mb-4">
            <p className="font-bold">1.5 <strong>"Data Importer"</strong></p>
            <p>means Commerce Central.</p>
          </div>

          <div className="mb-4">
            <p className="font-bold">1.6 <strong>"Data Protection Laws"</strong></p>
            <p>means any applicable laws and regulations in any relevant jurisdiction relating to the use or processing of Personal Data including: (i) the California Consumer Privacy Act (“CCPA”), (ii) the General Data Protection Regulation (Regulation (EU) 2016/679) (“EU GDPR” or “GDPR”), (iii) the Swiss Federal Act on Data Protection, (iv) the EU GDPR as it forms part of the law of England and Wales by virtue of section 3 of the European Union (Withdrawal) Act 2018 (the “UK GDPR”); (v) the UK Data Protection Act 2018; and (vi) the Privacy and Electronic Communications (EC Directive) Regulations 2003; in each case, as updated, amended or replaced from time to time. The terms “Data Subject”, “Personal Data”, “Personal Data Breach”, “processing”, “processor,” “controller,” and “supervisory authority” shall have the meanings set forth in the GDPR.</p>
          </div>

          <div className="mb-4">
            <p className="font-bold">1.7 <strong>"EU SCCs"</strong></p>
            <p>means the standard contractual clauses approved by the European Commission in Commission Decision 2021/914 dated 4 June 2021, for transfers of personal data to countries not otherwise recognized as offering an adequate level of protection for personal data by the European Commission (as amended and updated from time to time).</p>
          </div>

          <div className="mb-4">
            <p className="font-bold">1.8 <strong>"ex-EEA Transfer"</strong></p>
            <p>means the transfer of Personal Data, which is processed in accordance with the GDPR, from the Data Exporter to the Data Importer (or its premises) outside the European Economic Area (the “EEA”), and such transfer is not governed by an adequacy decision made by the European Commission in accordance with the relevant provisions of the GDPR.</p>
          </div>

          <div className="mb-4">
            <p className="font-bold">1.9 <strong>"ex-UK Transfer"</strong></p>
            <p>means the transfer of Personal Data, which is processed in accordance with the UK GDPR and the Data Protection Act 2018, from the Data Exporter to the Data Importer (or its premises) outside the United Kingdom (the “UK”), and such transfer is not governed by an adequacy decision made by the Secretary of State in accordance with the relevant provisions of the UK GDPR and the Data Protection Act 2018.</p>
          </div>

          <div className="mb-4">
            <p className="font-bold">1.10 <strong>"Services"</strong></p>
            <p>shall have the meaning set forth in the Agreement.</p>
          </div>

          <div className="mb-4">
            <p className="font-bold">1.11 <strong>"Standard Contractual Clauses"</strong></p>
            <p>means the EU SCCs and the UK SCCs.</p>
          </div>

          <div className="mb-4">
            <p className="font-bold">1.12 <strong>"UK SCCs"</strong></p>
            <p>means the standard contractual clauses approved by the European Commission for transfers of personal data to countries not otherwise recognized as offering an adequate level of protection for personal data by the European Commission, being either (i) controller-to-processor clauses as approved by the European Commission in Commission Decision 2010/87/EU, dated 5 February 2010 (as amended and updated from time to time) (“UK Controller-to-Processor SCCs”); or (ii) controller-to-controller clauses as approved by the European Commission in Commission Decision 2004/915/EC, dated 27 December 2004 (as amended and updated from time to time) (“UK Controller-to-Controller SCCs”).</p>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-4">2. Relationship of the Parties and Processing of Data</h2>

          <div className="mb-4">
            <p className="font-bold">2.1</p>
            <p>With regard to the processing of Personal Data, Customer may act either as a controller or processor and, except as expressly stated in this Addendum or the Agreement, Commerce Central is a processor. Customer shall, in its use of the Services, provide instructions for the processing of Personal Data, in compliance with Data Protection Laws.</p>
            <p>Customer shall ensure that the processing of Personal Data in accordance with Customer’s instructions will not cause Commerce Central to be in breach of the Data Protection Laws. Customer is solely responsible for the accuracy, quality, and legality of (i) the Personal Data provided to Company by or on behalf of Customer, (ii) the means by which Customer acquired any such Personal Data, and (iii) the instructions it provides to Company regarding the processing of such Personal Data. Customer shall not provide or make available to Company any Personal Data in violation of the Agreement or otherwise inappropriate for the nature of the Services, and shall indemnify Company from all claims and losses in connection therewith.</p>
          </div>

          <div className="mb-4">
            <p className="font-bold">2.2</p>
            <p>Commerce Central shall not process Personal Data (i) for purposes other than those set forth in the Agreement and/or Exhibit A, (ii) in a manner inconsistent with the terms and conditions set forth in this Addendum or any other documented instructions provided by Customer, including with regard to transfers of personal data to a third country or an international organization, unless required to do so by Supervisory Authority to which Commerce Central is subject; in such a case, Commerce Central shall inform the Customer of that legal requirement before processing, unless that law prohibits such information on important grounds of public interest, or (iii) in violation of Data Protection Laws.</p>
            <p>Customer hereby instructs Commerce Central to process Personal Data in accordance with the foregoing and as part of any processing initiated by Customer in its use of the Services.</p>
          </div>

          <div className="mb-4">
            <p className="font-bold">2.3</p>
            <p>The subject matter, nature, purpose, and duration of this processing, as well as the types of Personal Data collected and categories of Data Subjects, are described in Exhibit A to this Addendum.</p>
          </div>

          <div className="mb-4">
            <p className="font-bold">2.4</p>
            <p>Following completion of the Services, at Customer’s choice, Commerce Central shall return or delete Customer’s Personal Data, unless further storage of such Personal Data is required or authorized by applicable law. If return or destruction is impracticable or prohibited by law, rule or regulation, Commerce Central shall take measures to block such Personal Data from any further processing (except to the extent necessary for its continued hosting or processing required by law, rule or regulation) and shall continue to appropriately protect the Personal Data remaining in its possession, custody, or control. If Customer and Company have entered into Standard Contractual Clauses as described in Section 6 (Transfers of Personal Data), the parties agree that the certification of deletion of Personal Data that is described in Clause 12(1) of the UK SCCs and Clause 8.1(d) and Clause 8.5 of the EU SCCs (as applicable) shall be provided by Company to Customer only upon Customer’s request.</p>
          </div>

          <div className="mb-4">
            <p className="font-bold">2.5</p>
            <p>CCPA - Except with respect to Customer Account Data and Customer Usage Data, Commerce Central is a service provider for the purposes of the CCPA (to the extent it applies) and is receiving personal information from Customer in order to provide the Services pursuant to the Agreement, which constitutes a business purpose. Commerce Central shall not sell any such personal information. Commerce Central shall not retain, use or disclose any personal information provided by Customer pursuant to the Agreement except to Authorized Sub-Processors as necessary for the specific purpose of performing the Services for Customer pursuant to the Agreement, or otherwise as set forth in the Agreement or as permitted by the CCPA. The terms “personal information,” “service provider,” “sale,” and “sell” are as defined in Section 1798.140 of the CCPA. Commerce Central certifies that it understands the restrictions of this Section 2.5.</p>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-4">3. Confidentiality</h2>

          <div className="mb-4">
            <p>Commerce Central shall ensure that any person it authorizes to process Personal Data has agreed to protect Personal Data in accordance with Commerce Central’s confidentiality obligations in the Agreement. Customer agrees that Company may disclose Personal Data to its advisers, auditors or other third parties as reasonably required in connection with the performance of its obligations under this Addendum, the Agreement, or the provision of Services to Customer.</p>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-4">4. Authorized Sub-Processors</h2>

          <div className="mb-4">
            <p className="font-bold">4.1</p>
            <p>Customer authorizes Commerce Central to (1) engage Authorized Sub-Processors listed in Exhibit B to this Addendum to access and process Personal Data in connection with the Services and (2) from time to time engage additional third parties for the purpose of providing the Services, including without limitation the processing of Personal Data. By way of this Addendum, Customer provides general written authorization to Company to engage sub-processors as necessary to perform the Services.</p>
          </div>

          <div className="mb-4">
            <p className="font-bold">4.2</p>
            <p>A list of Commerce Central’s current Authorized Sub-Processors (the “List”) is available to Customer at https://Commerce Central.com/legal/subprocessors/. Such List may be updated by Commerce Central from time to time. Company may provide a mechanism to subscribe to notifications of new Authorized Sub-Processors and Customer agrees to subscribe to such notifications where available. At least ten (10) days before enabling any third party other than existing Authorized Sub-Processors to access or participate in the processing of Personal Data, Commerce Central will add such third party to the List and notify Customer via email. Customer may object to such an engagement by informing Commerce Central within ten (10) days of receipt of the aforementioned notice by Customer, provided such objection is in writing and based on reasonable grounds relating to data protection. Customer acknowledges that certain sub-processors are essential to providing the Services and that objecting to the use of a sub-processor may prevent Company from offering the Services to Customer. If Customer reasonably objects to an engagement, Commerce Central shall make reasonable efforts to address Customer’s objection or suggest a commercially reasonable change of Services to avoid Processing of the Personal Data by the objected-to Subprocessor. If Customer does not object to the engagement of a third party within ten (10) days of aforementioned notice, that third party will be deemed an Authorized Sub-Processor for the purposes of this Addendum.</p>
          </div>

          <div className="mb-4">
            <p className="font-bold">4.3</p>
            <p>Commerce Central will enter into a written agreement with the Authorized Sub-Processor imposing on the Authorized Sub-Processor data protection obligations comparable to those imposed on Company under this Addendum with respect to the protection of Personal Data. In case an Authorized Sub-Processor fails to fulfill its data protection obligations under such written agreement with Commerce Central, Commerce Central will remain liable to Customer for the performance of the Authorized Sub-Processor’s obligations under such agreement.</p>
          </div>

          <div className="mb-4">
            <p className="font-bold">4.4</p>
            <p>The above authorizations will constitute Customer’s prior written consent to the subcontracting by Company of the processing of Personal Data if such consent is required under the Standard Contractual Clauses, and copies of the agreements with Authorized Sub-Processors that must be provided by Commerce Central to Customer pursuant to Clause 5(j) of the UK SCCs or Clause 9© of the EU SCCs may have commercial information, or information unrelated to the Standard Contractual Clauses or their equivalent, removed beforehand. Such copies will be provided by the Commerce Central only upon request by Customer.</p>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-4">5. Security of Personal Data</h2>

          <div className="mb-4">
            <p>Taking into account the state of the art, the costs of implementation and the nature, scope, context and purposes of processing as well as the risk of varying likelihood and severity for the rights and freedoms of natural persons, Commerce Central shall maintain appropriate technical and organizational measures to ensure a level of security appropriate to the risk of processing Personal Data. Information about Company’s technical and organizational security measures is available at https://Commerce Central.com/trust/security (“Commerce Central’s Security Statement").</p>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-4">6. Transfers of Personal Data</h2>

          <div className="mb-4">
            <p className="font-bold">6.1</p>
            <p>Commerce Central may transfer Personal Data processed under this Addendum outside the EEA, the UK, or Switzerland where necessary to provide the Services. Customer acknowledges that Commerce Central’s primary processing operations take place in the United States. If Commerce Central transfers Personal Data protected under this Addendum to a jurisdiction for which the European Commission has not issued an adequacy decision, Commerce Central will ensure that appropriate safeguards have been implemented for the transfer of Personal Data in accordance with Data Protection Laws.</p>
          </div>

          <div className="mb-4">
            <p className="font-bold">6.2</p>
            <p>Ex-EEA Transfers. The parties agree that ex-EEA Transfers are made pursuant to the EU SCCs, which are deemed entered into (and incorporated into this Addendum by this reference) and completed as follows:</p>
            <p>6.2.1 Module One (Controller to Controller) of the EU SCCs apply when Commerce Central is processing Personal Data as a controller pursuant to Section 9 of this Addendum.</p>
            <p>6.2.2 Module Two (Controller to Processor) of the EU SCCs apply when Customer is a controller and Commerce Central is processing Personal Data for Customer as a processor pursuant to Section 2 of this Addendum.</p>
            <p>6.2.3 Module Three (Processor to Sub-Processor) of the EU SCCs apply when Customer is a processor and Commerce Central is processing Personal Data on behalf of Customer as a sub-processor.</p>
          </div>

          <div className="mb-4">
            <p className="font-bold">6.3</p>
            <p>For each module, where applicable the following applies:</p>
            <p>6.3.1 The optional docking clause in Clause 7 does not apply.</p>
            <p>6.3.2 In Clause 9, Option 2 (general written authorization) applies, and the minimum time period for prior notice of sub-processor changes shall be as set forth in Section 4.2 of this Addendum;</p>
            <p>6.3.3 In Clause 11, the optional language does not apply;</p>
            <p>6.3.4 All square brackets in Clause 13 are hereby removed;</p>
            <p>6.3.5 In Clause 17 (Option 1), the EU SCCs will be governed by Irish law.</p>
            <p>6.3.6 In Clause 18(b), disputes will be resolved before the courts of Ireland.</p>
            <p>6.3.7 Exhibit B to this Addendum contains the information required in Annex I of the EU SCCs;</p>
            <p>6.3.8 Commerce Central’s Security Statement includes the information required in Annex II of the EU SCCs; and</p>
            <p>6.3.9 By entering into this Addendum, the parties are deemed to have signed the EU SCCs incorporated herein, including their Annexes.</p>
          </div>

          <div className="mb-4">
            <p className="font-bold">6.4</p>
            <p>Ex-UK Transfers - The parties agree that ex-UK Transfers are made pursuant to the UK SCCs, which are deemed entered into and incorporated into this Addendum by reference, and completed as follows:</p>
            <p>6.4.1 References to the GDPR will be deemed to be references to the UK GDPR and the UK Data Protection Act 2018, references to “supervisory authorities” will be deemed to be references to the UK Information Commissioner, and references to “Member State(s)” or the EU will be deemed to be references to the UK.</p>
            <p>6.4.2 The UK Controller-to-Processor SCCs apply when the Commerce Central processes Customer’s Personal Data as a processor. The illustrative indemnification clause does not apply. In Clause 4(f) the language “adequate protection within the meaning of Directive 95/46/EC” is deleted and replaced with “a level of data protection that is considered adequate under, or equivalent to, the applicable data protection law.” Clause 9, Governing Law, shall read “The Clauses shall be governed by the law of the Member State in which the data exporter is established, but without prejudice to the rights and freedoms that data subjects may enjoy under their national data protection laws.” In Clause 11(3), the language “, namely…” at the end of the sentence is hereby deleted. Exhibit B of this Addendum serves as Appendix I of the UK Controller-to-Processor SCCs. Commerce Central’s Security Statement contains the information required by Appendix II of the UK Controller-to-Processor SCCs.</p>
            <p>6.4.3 The UK Controller-to-Controller SCCs apply when the Commerce Central processes Customer’s Personal Data as a controller pursuant to Section 9 of this Addendum. Clause II(h) of the UK Controller-to-Controller SCCs shall be deemed to state that the Commerce Central will process Personal Data in accordance with the data processing principles set forth in Annex A of the UK Controller-to-Controller SCCs. The illustrative commercial clause does not apply. Clause IV (Governing Law) shall read “The Clauses shall be governed by the law of the Member State in which the data exporter is established, but without prejudice to the rights and freedoms that data subjects may enjoy under their national data protection laws.” Exhibit B of this Addendum serves as Annex B of the UK Controller-to-Controller SCCs.</p>
            <p>6.4.4 The parties acknowledge and agree that if any of the UK SCCs are replaced or superseded by new standard contractual clauses issued and approved pursuant to Article 46 of the UK GDPR and related provisions of the UK Data Protection Act 2018 (“New UK SCCs”), the Data Importer may give notice to the Data Exporter and, with effect from the date set forth in such notice, the application of the UK SCCs set forth in this Addendum shall be amended so that the UK SCCs cease to apply to ex-UK Transfers, and the New UK SCCs specified in such notice shall apply going forward. To the extent that the use of the New UK SCCs require the parties to complete additional information, the parties shall reasonably and promptly work together to complete such additional information.</p>
          </div>

          <div className="mb-4">
            <p className="font-bold">6.5</p>
            <p>Transfers from Switzerland - The parties agree that transfers from Switzerland are made pursuant to the EU SCCs with the following modifications:</p>
            <p>6.5.1 The terms “General Data Protection Regulation” or “Regulation (EU) 2016/679” as utilized in the EU SCCs shall be interpreted to include the Federal Act on Data Protection of 19 June 1992 (the “FADP,” and as revised as of 25 September 2020, the “Revised FADP”) with respect to data transfers subject to the FADP.</p>
            <p>6.5.2 The terms of the EU SCCs shall be interpreted to protect the data of legal entities until the effective date of the Revised FADP.</p>
            <p>6.5.3 Clause 13 of the EU SCCs is modified to provide that the Federal Data Protection and Information Commissioner (“FDPIC”) of Switzerland shall have authority over data transfers governed by the FADP and the appropriate EU supervisory authority shall have authority over data transfers governed by the GDPR. Subject to the foregoing, all other requirements of Section 13 shall be observed.</p>
            <p>6.5.4 The term “EU Member State” as utilized in the EU SCCs shall not be interpreted in such a way as to exclude Data Subjects in Switzerland from exercising their rights in their place of habitual residence in accordance with Clause 18© of the EU SCCs.</p>
          </div>

          <div className="mb-4">
            <p className="font-bold">6.6</p>
            <p>Supplementary Measures - In respect of any ex-EEA Transfer or ex-UK Transfer, the following supplementary measures shall apply:</p>
            <p>6.6.1 As of the date of this Addendum, the Data Importer has not received any formal legal requests from any government intelligence or security service/agencies in the country to which the Personal Data is being exported, for access to (or for copies of) Customer’s Personal Data (“Government Agency Requests”);</p>
            <p>6.6.2 If, after the date of this Addendum, the Data Importer receives any Government Agency Requests, Company shall attempt to redirect the law enforcement or government agency to request that data directly from Customer. As part of this effort, Commerce Central may provide Customer’s basic contact information to the government agency. If compelled to disclose Customer’s Personal Data to a law enforcement or government agency, Commerce Central shall give Customer reasonable notice of the demand and cooperate to allow Customer to seek a protective order or other appropriate remedy unless Commerce Central is legally prohibited from doing so. Commerce Central shall not voluntarily disclose Personal Data to any law enforcement or government agency. Data Exporter and Data Importer shall (as soon as reasonably practicable) discuss and determine whether all or any transfers of Personal Data pursuant to this Addendum should be suspended in the light of the such Government Agency Requests; and</p>
            <p>6.6.3 If Data Protection Laws require the Data Exporter to execute the Standard Contractual Clauses applicable to a particular transfer of Personal Data to a Data Importer as a separate agreement, the Data Importer shall, on request of the Data Exporter, promptly execute such Standard Contractual Clauses incorporating such amendments as may reasonably be required by the Data Exporter to reflect the applicable appendices and annexes, the details of the transfer and the requirements of the relevant Data Protection Laws.</p>
            <p>6.6.4 If either (i) any of the means of legitimizing transfers of Personal Data outside of the EEA or UK set forth in this Addendum cease to be valid or (ii) any supervisory authority requires transfers of Personal Data pursuant to those means to be suspended, then Data Importer may by notice to the Data Exporter, with effect from the date set out in such notice, amend or put in place alternative arrangements in respect of such transfers, as required by Data Protection Laws.</p>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-4">7. Rights of Data Subjects</h2>

          <div className="mb-4">
            <p className="font-bold">7.1</p>
            <p>Commerce Central shall, to the extent permitted by law, notify Customer upon receipt of a request by a Data Subject to exercise the Data Subject’s right of: access, rectification, erasure, data portability, restriction or cessation of processing, withdrawal of consent to processing, and/or objection to being subject to processing that constitutes automated decision-making (such requests individually and collectively “Data Subject Request(s)”).</p>
            <p>If Commerce Central receives a Data Subject Request in relation to Customer’s data, Commerce Central will advise the Data Subject to submit their request to Customer and Customer will be responsible for responding to such request, including, where necessary, by using the functionality of the Services. Customer is solely responsible for ensuring that Data Subject Requests for erasure, restriction or cessation of processing, or withdrawal of consent to processing of any Personal Data are communicated to Commerce Central, and, if applicable, for ensuring that a record of consent to processing is maintained with respect to each Data Subject.</p>
          </div>

          <div className="mb-4">
            <p className="font-bold">7.2</p>
            <p>Commerce Central shall, at the request of the Customer, and taking into account the nature of the processing applicable to any Data Subject Request, service reasonable written instructions from Customer in complying with Customer’s obligation to respond to such Data Subject Request and/or in demonstrating such compliance, where possible in cases where Customer cannot reasonably fulfill such requests independently by using the self-service functionality of the Services and where Commerce Central is able to do so in accordance with all applicable laws, rules, and regulations. Customer shall be responsible to the extent legally permitted for any costs and expenses arising from any such assistance by Commerce Central.</p>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-4">8. Actions, Access Requests, and Audits</h2>

          <div className="mb-4">
            <p className="font-bold">8.1</p>
            <p>Commerce Central shall, taking into account the nature of the processing and the information available to it, provide Customer with reasonable cooperation and assistance where necessary for Customer to comply with its obligations under the GDPR to conduct a data protection impact assessment and/or to demonstrate such compliance, provided that Customer does not otherwise have access to the relevant information. Customer shall be responsible to the extent legally permitted for any costs and expenses arising from any such assistance by Company.</p>
          </div>

          <div className="mb-4">
            <p className="font-bold">8.2</p>
            <p>Commerce Central shall, taking into account the nature of the processing and the information available to it, provide Customer with reasonable cooperation and assistance with respect to Customer’s cooperation and/or prior consultation with any Supervisory Authority, where necessary and where required by the GDPR. Customer shall be responsible to the extent legally permitted for any costs and expenses arising from any such assistance by Commerce Central.</p>
          </div>

          <div className="mb-4">
            <p className="font-bold">8.3</p>
            <p>Commerce Central shall maintain records sufficient to demonstrate its compliance with its obligations under this Addendum, and retain such records for a period of three (3) years after the termination of the Agreement. Customer shall, with reasonable notice to Commerce Central, have the right to review, audit and copy such records.</p>
          </div>

          <div className="mb-4">
            <p className="font-bold">8.4</p>
            <p>Upon Customer’s written request at reasonable intervals, and subject to reasonable confidentiality controls, Commerce Central shall, either</p>
            <p>(i) make available for Customer’s review copies of certifications or reports demonstrating Commerce Central’s compliance with prevailing data security standards applicable to the processing of Customer’s Personal Data, or</p>
            <p>(ii) if the provision of reports or certifications pursuant to (i) is not reasonably sufficient under Data Protection Laws, allow Customer’s independent third party representative to conduct an audit or inspection of Commerce Central’s data security infrastructure and procedures that is sufficient to demonstrate Commerce Central’s compliance with its obligations under Data Protection Laws, provided that (a) Customer provides reasonable prior written notice of any such request for an audit and such inspection shall not be unreasonably disruptive to Commerce Central’s business; (b) occur no more than once per calendar year; and © such audit shall be restricted to data relevant to Customer.</p>
            <p>Customer shall be responsible for the costs of any such audits or inspections, including without limitation a reimbursement to Commerce Central for any time and resources expended for on-site audits. Audits described in Clause 5(f) and Clause 12(2) of the UK SCCs and Clause 8.9 of the EU SCCs shall be carried out in accordance with this Section 8.4.</p>
          </div>

          <div className="mb-4">
            <p className="font-bold">8.5</p>
            <p>Commerce Central shall immediately notify Customer if an instruction, in the Commerce Central’s opinion, infringes the Data Protection Laws or Supervisory Authority.</p>
          </div>

          <div className="mb-4">
            <p className="font-bold">8.6</p>
            <p>In the event of a Personal Data Breach, Commerce Central shall, without undue delay, inform Customer of the Personal Data Breach and take such steps as Commerce Central in its sole discretion deems necessary and reasonable to remediate such violation (to the extent that remediation is within Commerce Central’s reasonable control).</p>
          </div>

          <div className="mb-4">
            <p className="font-bold">8.7</p>
            <p>In the event of a Personal Data Breach, Commerce Central shall, taking into account the nature of the processing and the information available to it, provide Customer with reasonable cooperation and assistance necessary for Customer to comply with its obligations under the GDPR with respect to notifying (i) the relevant Supervisory Authority and (ii) Data Subjects affected by such Personal Data Breach without undue delay.</p>
          </div>

          <div className="mb-4">
            <p className="font-bold">8.8</p>
            <p>The obligations described in Sections 8.5 and 8.6 shall not apply in the event that a Personal Data Breach results from the actions or omissions of Customer. Commerce Central’s obligation to report or respond to a Personal Data Breach under Sections 8.5 and 8.6 will not be construed as an acknowledgement by Commerce Central of any fault or liability with respect to the Personal Data Breach.</p>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-4">9. Commerce Central’s Role as a Controller</h2>

          <div className="mb-4">
            <p>With respect to Customer Account Data and Customer Usage data, Commerce Central is an independent controller, not a joint controller with Customer. Commerce Central will process Customer Account Data and Customer Usage Data as a controller:</p>
            <p>(i) to manage the relationship with Customer;</p>
            <p>(ii) to carry out Commerce Central’s core business operations, such as accounting, audits, tax preparation and filing and compliance purposes;</p>
            <p>(iii) to monitor, investigate, prevent and detect fraud, security incidents and other misuse of the Services, and to prevent harm to Customer;</p>
            <p>(iv) for identity verification purposes;</p>
            <p>(v) to comply with legal or regulatory obligations applicable to the processing and retention of Personal Data to which Commerce Central is subject; and</p>
            <p>(vi) as otherwise permitted under Data Protection Laws and in accordance with this Addendum and the Agreement.</p>
            <p>Commerce Central may also process Customer Usage Data as a controller to provide, optimize, and maintain the Services, to the extent permitted by Data Protection Laws. Any processing by the Commerce Central as a controller shall be in accordance with the Commerce Central’s privacy policy described in https://Commerce Central.com/privacy.</p>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-4">10. Conflict</h2>

          <div className="mb-4">
            <p>In the event of any conflict or inconsistency among the following documents, the order of precedence will be:</p>
            <p>1. the applicable terms in the Standard Contractual Clauses</p>
            <p>2. the terms of this Addendum</p>
            <p>3. the Agreement</p>
            <p>4. the Commerce Central’s privacy policy</p>
            <p>Any claims brought in connection with this Addendum will be subject to the terms and conditions, including, but not limited to, the exclusions and limitations outlined in the Agreement.</p>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Exhibit A</h2>

          <div className="mb-4">
            <p className="font-bold">Details of Processing</p>
            <p className="font-bold mt-2">1. Nature and Purpose of Processing</p>
            <p>Commerce Central will process Customer’s Personal Data as necessary to provide the Services under the Agreement, for the purposes specified in the Agreement and this Addendum, and in accordance with Customer’s instructions as set forth in this Addendum. The nature of processing pursuant to the Agreement and Addendum includes, without limitation:</p>
            <p>- Receiving data, including collection, accessing, retrieval, and recording</p>
            <p>- Holding data, including storage, organization and structuring</p>
            <p>- Using data, including analysis, consultation, testing, and automated decision making</p>
            <p>- Updating data, including correcting, adaptation, alteration, alignment and combination</p>
            <p>- Protecting data, including restricting, encrypting, and security testing</p>
            <p>- Erasing data, including destruction and deletion</p>
          </div>

          <div className="mb-4">
            <p className="font-bold">2. Duration of Processing</p>
            <p>Commerce Central will process Customer’s Personal Data as long as required (i) to provide the Services to Customer under the Agreement; (ii) for Commerce Central’s legitimate business needs; or (iii) by applicable law or regulation. Customer Account Data and Customer Usage Data will be processed and stored as set forth in Commerce Central’s privacy policy.</p>
          </div>

          <div className="mb-4">
            <p className="font-bold">3. Categories of Data Subjects</p>
            <p>Customer Account Data - Customer’s permitted users, including employees and contractors, with access to a Commerce Central project</p>
            <p>Customer Usage Data - Customer’s permitted users, including employees and contractors, with access to a Commerce Central project</p>
          </div>

          <div className="mb-4">
            <p className="font-bold">4. Categories of Personal Data</p>
            <p>Commerce Central processes Personal Data contained in Customer Account Data, Customer Usage Data, and any Personal Data provided by Customer (including any Personal Data Customer collects from its end users and processes through its use of the Services).</p>
          </div>

          <div className="mb-4">
            <p className="font-bold">5. Sensitive Data or Special Categories of Data</p>
            <p>Commerce Central does not collect sensitive data in Customer Usage Data and Customer Account Data. Subject to any applicable restrictions and/or conditions in the Agreement, Customer may include “special categories of personal data” or similarly sensitive Personal Data (as described or defined in Data Protection Laws), the extent of which is determined and controlled by Customer in its sole discretion, and which may include, but is not limited to Personal Data revealing racial or ethnic origin, political opinions, religious or philosophical beliefs, or trade union membership, genetic data, biometric data Processed for the purposes of uniquely identifying a natural person, data concerning health and/or data concerning a natural person’s sex life or sexual orientation.</p>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Exhibit B</h2>

          <table className="w-full border-collapse border border-gray-300 mt-4">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 px-4 border border-gray-300 text-left">Requirement</th>
                <th className="py-2 px-4 border border-gray-300 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2 px-4 border border-gray-300">Data Subjects</td>
                <td className="py-2 px-4 border border-gray-300">As described in Exhibit A, Section 3</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border border-gray-300">Categories of Personal Data</td>
                <td className="py-2 px-4 border border-gray-300">As described in Exhibit A, Section 4</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border border-gray-300">Special Category Personal Data (if applicable)</td>
                <td className="py-2 px-4 border border-gray-300">As described in Exhibit A, Section 5</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border border-gray-300">Nature of the Processing</td>
                <td className="py-2 px-4 border border-gray-300">As described in Exhibit A, Section 1</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border border-gray-300">Purposes of Processing</td>
                <td className="py-2 px-4 border border-gray-300">As described in Exhibit A, Section 1</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border border-gray-300">Duration of Processing and Retention (or the criteria to determine such period)</td>
                <td className="py-2 px-4 border border-gray-300">As described in Exhibit A, Section 2</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border border-gray-300">Frequency of the transfer</td>
                <td className="py-2 px-4 border border-gray-300">As needed to perform all obligations and rights with respect to Personal Data as provided in the Agreement or Addendum</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border border-gray-300">Recipients of Personal Data Transferred to the Data Importer</td>
                <td className="py-2 px-4 border border-gray-300">As described in https://Commerce Central.com/legal/subprocessors/</td>
              </tr>
            </tbody>
          </table>
        </section>
      </article>
    </main>
  );
}