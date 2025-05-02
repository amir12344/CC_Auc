import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | Commerce Central',
  description: 'Terms of Service and conditions for using Commerce Central platform',
};

export default function TermsPage() {
  return (
    <article className='prose prose-lg max-w-none mt-8 font-geist mt-10'>
      <h1 className='text-4xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6 font-geist'>
        Terms & Conditions
      </h1>

      <div className='text-2xl mb-8 font-geist'>
        Welcome to Commerce Central
      </div>

      <section className='mb-8'>
        <p className='font-geist'>
          BY SIGNING UP FOR AN ACCOUNT AND USING THE COMMERCE CENTRAL, INC.
          ("COMPANY") SERVICES AND PRODUCTS ("SERVICES"), "YOU" (MEANING YOU
          PERSONALLY AND THE COMPANY YOU REPRESENT AND ON WHOSE BEHALF YOU ARE
          FULLY AUTHORIZED TO ENTER THIS AGREEMENT) ARE CONSENTING TO BE BOUND
          BY AND ARE BECOMING A PARTY TO THIS LICENSE AGREEMENT ("AGREEMENT").
          IF YOU DO NOT AGREE TO ALL OF THE TERMS OF THIS AGREEMENT, YOU WILL
          NOT BE ABLE TO SIGN UP FOR AN ACCOUNT OR ACCESS THE COMPANY'S
          SERVICES. IF THESE TERMS ARE CONSIDERED AN OFFER, ACCEPTANCE IS
          EXPRESSLY LIMITED TO THESE TERMS.
        </p>
      </section>

      <section className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4 font-geist'>1. License Grant.</h2>
        <p className='font-geist'>
          Subject to the terms of this Agreement, Company hereby grants you (and
          only you) a limited, personal, non-sublicensable, non-transferable,
          royalty-free, nonexclusive license to use internally the Services only
          in accordance with the Company's written documentation (if any). You
          understand that Company may modify (including changes to the cost of
          the Services) the Services at any time. The Company shall endeavor to
          provide you with ten (10) days' prior notice of any modification that
          materially and detrimentally affects the functionality of the
          Services.
        </p>
      </section>

      <section className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4 font-geist'>2. Restrictions.</h2>
        <p>
          You may not (and agree not to, and not permit or enable others to),
          directly or indirectly: (a) copy, distribute, rent, lease, timeshare,
          operate a service bureau, or otherwise use for the benefit of a third
          party, the Services; (b) decompile, reverse engineer or otherwise
          attempt to obtain the source code or underlying ideas or information
          of or relateing to the Services (except to the extent applicable law
          prohibits restrictions on reverse engineering) or otherwise use it
          with the intention of abusing the Services or to copy its features or
          user interface or to create a competing product or service; © remove
          any proprietary notices from the Services; (d) infringe or violate the
          intellectual property rights or any other rights of anyone else
          (including the Company); (e) violate the security of any computer
          network, or cracks any passwords or security encryption codes; or (f)
          violate any law or regulation, including, without limitation, any
          applicable export control laws, privacy laws or any other purpose not
          reasonably intended by the Company.
        </p>
      </section>

      <section className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4 font-geist'>
          3. Fees and Payment Processor
        </h2>
        <p>
          The Services are subject to the fees described in the commerce central
          Pricing. Company uses Stripe, Inc. as its payment processor ("Payment
          Processor"). The processing of payments will be subject to the terms,
          conditions and privacy policies of the Payment Processor in addition
          to this agreement. Payment Processor's{' '}
          <a
            href='https://stripe.com/legal/link-account-terms'
            target='_blank'
            rel='noopener noreferrer'
            className='underline font-geist'
          >
            Terms of Service
          </a>
          ,{' '}
          <a
            href='https://stripe.com/privacy'
            className='underline font-geist'
            target='_blank'
            rel='noopener noreferrer'
          >
            Privacy policy
          </a>{' '}
          for more information. Company is not responsible for any error by, or
          other acts or omissions of, the Payment Processor. By choosing to use
          any paid Services, you agree to pay the Company, the Payment
          Processor, all charges at the prices then in effect for any use of
          such paid Services in accordance with the applicable payment terms,
          and you authorize Company, through the Payment Processor, to charge
          your chosen payment provider (your "Payment Method"). If Company,
          through the Payment Processor, does not receive payment from you, you
          agree to pay all amounts due upon demand.
        </p>
      </section>

      <section className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4 font-geist'>
          4. Support and Upgrades.
        </h2>
        <p>
          This Agreement does not entitle you to any support, upgrades, patches,
          enhancements, or fixes for the Services (collectively, "Support"). Any
          such Support for the Services that may be made available by Company
          become part of the Services and subject to this Agreement. Company may
          suspend or discontinue any part of the Services, or may introduce new
          features or impose limits on certain features or restrict access to
          parts or all of the Services, with or without notice to you.
        </p>
      </section>

      <section className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4 font-geist'>5. IP Ownership; Marks.</h2>
        <p>
          Except for the limited licenses expressly granted in Section 1, the
          Company does not convey to you any rights in or related to the
          Services. The Company will retain all intellectual property rights
          relating to the Services or any suggestions, ideas, enhancements,
          requests, feedback, recommendations or other information provided by
          you or any third party relating to the Service, and you hereby make
          all assignments to effect to foregoing ownership. The Company is
          permitted to use your names, marks and logos on its website and
          marketing materials for the purposes of disclosing that you are one of
          its customers to any third-party at its sole discretion.
        </p>
      </section>

      <section className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4 font-geist'>6. Customer Data.</h2>
        <p>
          For purposes of this Agreement, "Customer Data" shall mean any data,
          information or other material provided, uploaded, or submitted by you
          to the Services in the course of using the Services. You shall retain
          all right, title and interest in and to the Customer Data, including
          all intellectual property rights therein, and you shall have sole
          responsibility for the accuracy, quality, integrity, legality,
          reliability, appropriateness, and intellectual property ownership or
          right to use of all Customer Data. Company is not responsible to you
          for unauthorized access to Customer Data or the unauthorized use of
          the Services unless such access is due to Company's gross negligence
          or willful misconduct. You are responsible for the use of the Services
          by any person to whom you have given access to the Services, even if
          you did not authorize such use.
        </p>
      </section>

      <section className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4 font-geist'>7. Warranty Disclaimer.</h2>
        <p>
          THE SERVICES ARE PROVIDED "AS IS" AND WITHOUT WARRANTY OF ANY KIND,
          AND COMPANY (FOR ITSELF AND ITS LICENSORS) HEREBY DISCLAIMS ALL
          EXPRESS OR IMPLIED WARRANTIES, INCLUDING WITHOUT LIMITATION WARRANTIES
          OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, PERFORMANCE,
          ACCURACY, RELIABILITY, AND NON-INFRINGEMENT. THIS DISCLAIMER OF
          WARRANTY CONSTITUTES AN ESSENTIAL PART OF THIS AGREEMENT.
        </p>
      </section>

      <section className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4 font-geist'>
          8. Limitation of Liability.
        </h2>
        <p>
          UNDER NO CIRCUMSTANCES AND UNDER NO LEGAL THEORY, INCLUDING, WITHOUT
          LIMITATION, TORT, CONTRACT, STRICT LIABILITY, OR OTHERWISE, SHALL
          COMPANY OR ITS LICENSORS BE LIABLE TO YOU OR ANY OTHER PERSON FOR (A)
          ANY INDIRECT, SPECIAL, INCIDENTAL, PUNITIVE OR CONSEQUENTIAL DAMAGES
          OF ANY CHARACTER INCLUDING, WITHOUT LIMITATION, DAMAGES FOR LOST
          PROFITS, LOSS OF GOODWILL, LOSS OF DATA, BUSINESS INTERRUPTION, WORK
          STOPPAGE, ACCURACY OF RESULTS, COMPUTER FAILURE OR MALFUNCTION,
          DAMAGES RESULTING FROM YOUR USE OF THE SOFTWARE OR (B) ANY AMOUNT IN
          EXCESS OF $100.
        </p>
      </section>
      <section className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4 font-geist'>9. Indemnity.</h2>
        <p>
          You agree to indemnify and hold the Company and its officers,
          directors, members, employees, consultants, contract employees,
          representatives and agents, and each of their respective successors
          and assigns ("commerce central Parties") harmless from and against any
          and all claims, liabilities, damages (actual and consequential),
          losses and expenses (including attorneys' fees) arising from or in any
          way related to any claims relating to (a) your use of the Services
          (including any actions taken by a third party using your account), and
          (b) your violation of this Agreement.
        </p>
      </section>
      <section className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4 font-geist'>10. Amendment.</h2>
        <p>
          Company reserves the right to update this Agreement at any time and
          will notify you of such changes by email or otherwise. If you don't
          agree with the changes, you may no longer continue using the Services.
          If you use the Services in any way after a change to this Agreement is
          effective, you are deemed to have agreed to the changes. Except as
          provided herein, no other amendment of this Agreement is effective
          unless in writing and signed between Company and you.
        </p>
      </section>
      <section className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4 font-geist'>11. Termination.</h2>
        <p>
          Company reserves the right at any time to suspend your access to the
          Services: (i) for scheduled or emergency maintenance, (ii) in the
          event you are in breach of this Agreement, or (iii) in the event the
          Company detects abuse of the Services. Company may also terminate this
          and your access to the Services for convenience upon ten (10) days'
          prior written notice to you. You may terminate this Agreement by
          contacting the Company at support@commercecentral.io. Sections 2
          through 14 shall survive termination of this Agreement.
        </p>
      </section>
      <section className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4 font-geist'>12. Incorporation</h2>
        <p>
          Your use of the Services is subject to the Company's{' '}
          <Link href='/website/legal/privacy-policy' className='underline font-geist'>
            privacy policy
          </Link>
          which is incorporated herein by reference. To the extent applicable,
          you also agree to the Company's Data Processing Addendum, which is
          incorporated herein by reference.
        </p>
      </section>
      <section className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4 font-geist'>
          13. Arbitration and Class Action Waiver.
        </h2>

        <div className='space-y-6'>
          <div>
            <h3 className='text-lg font-semibold mb-2 font-geist'>13.1 Arbitration</h3>
            <p>
              The parties shall use their best efforts to settle any dispute,
              claim, question, or disagreement arising out of or relating to the
              subject matter of this Agreement directly through good-faith
              negotiations, which shall be a precondition to either party
              initiating arbitration. If such negotiations do not resolve the
              dispute, it shall be finally settled by binding arbitration in San
              Francisco, California. The arbitration will proceed in the English
              language, in accordance with the JAMS Streamlined Arbitration
              Rules and Procedures (the "Rules") then in effect, by one
              commercial arbitrator with substantial experience in resolving
              intellectual property and commercial contract disputes. The
              arbitrator shall be selected from the appropriate list of JAMS
              arbitrators in accordance with such Rules. Judgment upon the award
              rendered by such arbitrator may be entered in any court of
              competent jurisdiction.
            </p>
          </div>

          <div>
            <h3 className='text-xl font-semibold mb-2 font-geist'>
              13.2 Costs of Arbitration
            </h3>
            <p>
              The Rules will govern payment of all arbitration fees. Company
              will pay all arbitration fees for claims less than seventy-five
              thousand ($75,000) dollars. Company will not seek its attorneys'
              fees and costs in arbitration unless the arbitrator determines
              that your claim is frivolous.
            </p>
          </div>

          <div>
            <h3 className='text-xl font-semibold mb-2 font-geist'>
              13.3 Small Claims Court & Infringement
            </h3>
            <p>
              Either you or Company may assert claims, if they qualify, in small
              claims court in San Francisco, California or any United States
              county where you live or work. Furthermore, notwithstanding the
              foregoing obligation to arbitrate disputes, each party shall have
              the right to pursue injunctive or other equitable relief at any
              time, from any court of competent jurisdiction, to prevent the
              actual or threatened infringement, misappropriation or violation
              of a party's copyrights, trademarks, trade secrets, patents or
              other intellectual property rights.
            </p>
          </div>

          <div>
            <h3 className='text-xl font-semibold mb-2 font-geist'>
              13.4 Waiver of Jury Trial
            </h3>
            <p>
              YOU AND COMPANY WAIVE ANY CONSTITUTIONAL AND STATUTORY RIGHTS TO
              GO TO COURT AND HAVE A TRIAL IN FRONT OF A JUDGE OR JURY. You and
              Company are instead choosing to have claims and disputes resolved
              by arbitration. Arbitration procedures are typically more limited,
              more efficient, and less costly than rules applicable in court and
              are subject to very limited review by a court. In any litigation
              between you and Company over whether to vacate or enforce an
              arbitration award, YOU AND COMPANY WAIVE ALL RIGHTS TO A JURY
              TRIAL, and elect instead to have the dispute be resolved by a
              judge.
            </p>
          </div>

          <div>
            <h3 className='text-xl font-semibold mb-2 font-geist'>
              13.5 Waiver of Class or Consolidated Actions
            </h3>
            <p>
              ALL CLAIMS AND DISPUTES WITHIN THE SCOPE OF THIS AGREEMENT MUST BE
              ARBITRATED OR LITIGATED ON AN INDIVIDUAL BASIS AND NOT ON A CLASS
              BASIS. CLAIMS OF MORE THAN ONE CUSTOMER OR USER CANNOT BE
              ARBITRATED OR LITIGATED JOINTLY OR CONSOLIDATED WITH THOSE OF ANY
              OTHER CUSTOMER OR USER. If however, this waiver of class or
              consolidated actions is deemed invalid or unenforceable, neither
              you nor Company is entitled to arbitration; instead all claims and
              disputes will be resolved in a court as set forth in Section 13.7
              below.
            </p>
          </div>

          <div>
            <h3 className='text-xl font-semibold mb-2 font-geist'>13.6 Opt-out</h3>
            <p>
              You have the right to opt out of the provisions of this Section 13
              by sending written notice of your decision to opt out to
              legal@commercecentral.com within thirty (30) days of first
              accepting this Agreement. You must include (i) your name and
              residence address, (ii) the email address and/or telephone number
              associated with your account, and (iii) a clear statement that you
              want to opt out of this arbitration provision.
            </p>
          </div>

          <div>
            <h3 className='text-xl font-semibold mb-2 font-geist'>13.7 Exclusive Venue</h3>
            <p>
              If you send the opt-out notice in Section 13.6, and/or in any
              circumstances where the foregoing arbitration agreement permits
              either you or Company to litigate any dispute arising out of or
              relating to the subject matter of this Agreement in court, then
              the foregoing arbitration agreement will not apply to either
              party, and both you and Company agree that any judicial proceeding
              (other than small claims actions) will be brought in the state or
              federal courts located in, respectively, San Francisco,
              California, or the federal district in which that county falls.
            </p>
          </div>
        </div>
      </section>
      <section className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4 font-geist'>14. Uptime Commitment</h2>

        <p className='mb-4 font-geist'>
          Commerce Central will use commercially reasonable efforts to make
          Commerce Central's Console (User Interface) and APIs in a Customer
          production instance (the "Services") available with all material
          features and services operating and available for use, in each
          calendar month with an uptime percentage of 99.95% for all Enterprise
          Customers with Premium Support (the "Uptime Percentage").
        </p>

        <p className='mb-4 font-geist'>
          The Uptime Percentage is equal to: (Maximum Available Minutes –
          Downtime) / Maximum available minutes X 100.
        </p>

        <p className='mb-4 font-geist'>
          If the Uptime Percentage for the month is less than 99.95%, a Service
          Credit will be calculated as a percentage of the total charges paid by
          Customer for the Services during the month in accordance with the
          schedule below:
        </p>

        <table className='w-full mb-6'>
          <thead>
            <tr>
              <th className='text-left p-2 border font-geist'>
                Monthly Uptime Percentage
              </th>
              <th className='text-left p-2 border font-geist'>
                Service Credit Percentage
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className='p-2 border font-geist'>
                Equal to or greater than 99.9% but less than 99.95%
              </td>
              <td className='p-2 border font-geist'>5%</td>
            </tr>
            <tr>
              <td className='p-2 border font-geist'>
                Equal to or greater than 98% but less than 99.9%
              </td>
              <td className='p-2 border font-geist'>10%</td>
            </tr>
            <tr>
              <td className='p-2 border font-geist'>Less than 98%</td>
              <td className='p-2 border font-geist'>25%</td>
            </tr>
          </tbody>
        </table>

        <div className='mb-6'>
          <h3 className='text-xl font-semibold mb-2'>14.1 Exclusions</h3>
          <p className='mb-4'>
            The calculation of uptime will not include unavailability caused by
            one or more of the following:
          </p>
          <ul className='list-disc pl-6 space-y-2'>
            <li>
              <strong>Scheduled maintenance time:</strong> Commerce Central will
              notify Customer at least five (5) business days in advance of any
              scheduled routine maintenance. Scheduled Maintenance will not
              exceed four (4) hours each month in the aggregate and will only
              take place between the hours of 10pm and 4am Pacific Time.
            </li>
            <li>
              <strong>Emergency maintenance time (non-scheduled):</strong>{' '}
              Commerce Central will promptly notify Customer (via email or
              through the Services) of any non-scheduled or emergency
              maintenance and any other anticipated outages or performance
              degradation.
            </li>
            <li>Suspension or termination of the Services.</li>
            <li>
              Failure of Customer or third-party equipment, software or
              technology upon which the Services are dependent, including, but
              not limited to, cloud infrastructure services upon which the
              Services operate, and inaccessibility to the Internet, provided
              that such failure or inaccessibility is not caused by Commerce
              Central's infrastructure and is otherwise outside of Commerce
              Central's control.
            </li>
            <li>Force majeure event.</li>
            <li>
              Attack on Commerce Central's infrastructure, including without
              limitation, a denial of service attack or unauthorized access,
              provided that such attack did not occur as a result of Commerce
              Central's failure to maintain industry standard organizational
              controls and technical measures.
            </li>
            <li>
              Unavailability caused by Customer's breach of this Agreement.
            </li>
          </ul>
        </div>

        <div className='mb-6'>
          <h3 className='text-xl font-semibold mb-2'>
            14.2 Service Credit Procedures
          </h3>
          <p className='mb-4'>
            If Commerce Central fails to meet the Uptime Percentage, to be
            eligible for service credits, Customer must deliver a reasonably
            detailed, written request to support@commercecentral.com no later
            than thirty (30) calendar days after the day on which Uptime
            Percentage first drops below 99.95%.
          </p>

          <p className='mb-4'>To be deemed valid, the request must include:</p>
          <ol className='list-alpha pl-6 space-y-2'>
            <li>
              The words "SLA Credit Request" in the subject line of the email;
            </li>
            <li>
              The dates and times of each period of unavailability of the
              Services, with such accuracy as can reasonably be determined;
            </li>
            <li>
              A description of the events that may have indicated an
              unavailability during the stated dates and times;
            </li>
            <li>
              Monitoring logs or supporting evidence corroborating Customer's
              claimed outage, with any confidential or personally identifying
              information removed.
            </li>
          </ol>
        </div>

        <p className='mb-4'>
          Commerce Central will determine, in its reasonable discretion,
          Customer's eligibility for Service Credits and the amount of service
          credits awarded pursuant to this SLA. If Commerce Central confirms
          that the Uptime Percentage has not been achieved during a given month,
          Commerce Central will issue a service credit during the billing cycle
          following the term in which it is determined that Customer is
          eligible.
        </p>

        <p className='mb-4'>
          All Service Credits will be applied to fees due from Customer for the
          Services; Commerce Central will not pay any Service Credit as a
          refund. If Commerce Central denies the claim, Commerce Central will
          provide the information used to validate such determination available
          to Customer for 30 business days, for auditing by Customer.
        </p>

        <p className='font-bold'>
          LIMITATION: THE SERVICE CREDITS DESCRIBED IN THIS SLA ARE CUSTOMER'S
          SOLE AND EXCLUSIVE REMEDY FOR THE UNAVAILABILITY OF THE SERVICES.
        </p>
      </section>
      <section className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4 font-geist'>15. Miscellaneous.</h2>
        <p>
          You shall comply with all applicable export laws, restrictions and
          regulations in connection with your use of the Services, and will not
          export or re-export the Services in violation thereof. This Agreement
          is personal to you and you shall not assign or transfer the Agreement
          or the Services to any third party under any circumstances; Company
          may assign or transfer this Agreement without consent. This Agreement
          represents the complete agreement concerning this license between the
          parties and supersedes all prior agreements and representations
          between them. If any provision of this Agreement is held to be
          unenforceable for any reason, such provision shall be reformed only to
          the extent necessary to make it enforceable. Also if you are one of
          the first ten people to email tore at commerce central dot com saying
          you read this far, he will send you a tee shirt. This Agreement shall
          be governed by and construed under California without regard to any
          conflicts of law provisions thereof.
        </p>
      </section>
    </article>
  )
}