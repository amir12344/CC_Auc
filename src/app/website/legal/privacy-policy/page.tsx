import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy & Data Use Policy | Commerce Central',
  description: 'Learn how Commerce Central collects, uses, and safeguards your data across our B2B liquidation platform. Read our full Privacy Policy for details.',
  alternates: {
    canonical: 'https://www.commercecentral.io/website/legal/privacy-policy'
  },
  openGraph: {
    url: 'https://www.commercecentral.io/website/legal/privacy-policy',
    title: 'Privacy & Data Use Policy | Commerce Central',
    description: 'Learn how Commerce Central collects, uses, and safeguards your data across our B2B liquidation platform. Read our full Privacy Policy for details.',
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
    title: 'Privacy & Data Use Policy | Commerce Central',
    description: 'Learn how Commerce Central collects, uses, and safeguards your data across our B2B liquidation platform. Read our full Privacy Policy for details.',
    images: ['/CC_opengraph.png'],
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="container mx-auto px-4 py-8 mt-6">
      <article className="prose lg:prose-xl max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Commerce Central Privacy Policy</h1>

        <div className="mb-4">
        <p className="mb-4">
          <strong>Effective date: May 01, 2025</strong>
        </p>

        <p className="mb-4">
          At Commerce Central, we take your privacy seriously. Please read this Privacy Policy to learn how we treat your personal data. By using or accessing our Services in any manner, you acknowledge that you accept the practices and policies outlined below, and you hereby consent that we will collect, use and share your information as described in this Privacy Policy.
        </p>

        <p className="mb-4">
          Remember that your use of Commerce Central's Services is at all times subject to our <Link href="/website/legal/terms" target='_blank'
            rel='noopener noreferrer' className="text-blue-600 hover:text-blue-800">Terms of Use</Link>, which incorporates this Privacy Policy. Any terms we use in this Policy without defining them have the definitions given to them in the Terms of Use.
        </p>

        <p className="mb-4">
          You may print a copy of this Privacy Policy at any time.
        </p>

        <p className="mb-4">
          As we continually work to improve our Services, we may need to change this Privacy Policy from time to time. Upon such changes, we will alert you to any such changes by placing a notice on the Commerce Central website, by sending you an email and/or by some other means. Please note that if you’ve opted not to receive legal notice emails from us (or you haven’t provided us with your email address), those legal notices will still govern your use of the Services, and you are still responsible for reading and understanding them. If you use the Services after any changes to the Privacy Policy have been posted, that means you agree to all of the changes.</p>
        </div>

        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Privacy Policy Table of Contents</h2>

          <ul className="list-disc list-inside mb-4">
            <li>What this Privacy Policy Covers</li>
            <li>Personal Data</li>
            <li>How We Disclose Your Personal Data</li>
            <li>Tracking Tools, Advertising and Opt-Out</li>
            <li>Data Security</li>
            <li>Data Retention</li>
            <li>Personal Data of Children</li>
            <li>Other State Law Privacy Rights</li>
            <li>Contact Information</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-4">What this Privacy Policy Covers</h2>

          <p className="mb-4">
            This Privacy Policy covers how we treat Personal Data that we gather when you access or use our Services. "Personal Data" means any information that identifies or relates to a particular individual and also includes information referred to as "personally identifiable information" or "personal information" under applicable data privacy laws, rules or regulations. This Privacy Policy does not cover the practices of companies we don’t own or control or people we don’t manage.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Personal Data</h2>

          <section className="mt-4">
            <h3 className="text-xl font-bold mb-2">Categories of Personal Data We Collect</h3>

            <p className="mb-4">
              This chart details the categories of Personal Data that we collect and have collected over the past 12 months:
            </p>

            <div className="overflow-hidden rounded-lg shadow-md mt-4">
              {/* Large screens - Table view */}
              <div className="hidden md:block">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-4 bg-gray-100 text-left text-sm font-semibold text-gray-700">Category of Personal Data</th>
                      <th className="py-3 px-4 bg-gray-100 text-left text-sm font-semibold text-gray-700">Examples of Personal Data We Collect</th>
                      <th className="py-3 px-4 bg-gray-100 text-left text-sm font-semibold text-gray-700">Categories of Third Parties With Whom We Share this Personal Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 text-sm">Profile or Contact Data</td>
                      <td className="py-4 px-4 text-sm">First and last name, Email, Phone number, Mailing address, Unique identifiers such as passwords</td>
                      <td className="py-4 px-4 text-sm">Service Providers, Business Partners</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 text-sm">Payment Data</td>
                      <td className="py-4 px-4 text-sm">Financial account information, Payment card type, Last 4 digits of payment card, Billing address, phone number, and email</td>
                      <td className="py-4 px-4 text-sm">Service Providers (specifically our payment processing partner, currently Stripe)</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 text-sm">Commercial Data</td>
                      <td className="py-4 px-4 text-sm">Purchase history, Consumer profiles</td>
                      <td className="py-4 px-4 text-sm">Service Providers, Advertising Partners, Analytics Partners, Business Partners</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 text-sm">Device/IP Data</td>
                      <td className="py-4 px-4 text-sm">IP address, Device ID, Domain server, Type of device/operating system/browser used to access the Services</td>
                      <td className="py-4 px-4 text-sm">Service Providers, Advertising Partners, Analytics Partners</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 text-sm">Web Analytics</td>
                      <td className="py-4 px-4 text-sm">Web page interactions, Referring webpage/source through which you accessed the Services, Non-identifiable request IDs, Statistics associated with the interaction between device or browser and the Services</td>
                      <td className="py-4 px-4 text-sm">Service Providers, Advertising Partners, Analytics Partners, Business Partners</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 text-sm">Geolocation Data</td>
                      <td className="py-4 px-4 text-sm">IP-address-based location information</td>
                      <td className="py-4 px-4 text-sm">Service Providers, Advertising Partners, Analytics Partners, Business Partners</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 text-sm">Inferences Drawn From Other Personal Data Collected</td>
                      <td className="py-4 px-4 text-sm">Inferences reflecting user behavior</td>
                      <td className="py-4 px-4 text-sm">Service Providers, Advertising Partners, Analytics Partners</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 text-sm">Other Identifying Information that You Voluntarily Choose to Provide</td>
                      <td className="py-4 px-4 text-sm">Identifying information in emails, letters, texts, or other communications you send us</td>
                      <td className="py-4 px-4 text-sm">Service Providers, Business Partners</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Mobile view - Card layout */}
              <div className="md:hidden space-y-4">
                {[
                  {
                    category: 'Profile or Contact Data',
                    examples: 'First and last name, Email, Phone number, Mailing address, Unique identifiers such as passwords',
                    parties: 'Service Providers, Business Partners'
                  },
                  {
                    category: 'Payment Data',
                    examples: 'Financial account information, Payment card type, Last 4 digits of payment card, Billing address, phone number, and email',
                    parties: 'Service Providers (specifically our payment processing partner, currently Stripe)'
                  },
                  {
                    category: 'Commercial Data',
                    examples: 'Purchase history, Consumer profiles',
                    parties: 'Service Providers, Advertising Partners, Analytics Partners, Business Partners'
                  },
                  {
                    category: 'Device/IP Data',
                    examples: 'IP address, Device ID, Domain server, Type of device/operating system/browser used to access the Services',
                    parties: 'Service Providers, Advertising Partners, Analytics Partners'
                  },
                  {
                    category: 'Web Analytics',
                    examples: 'Web page interactions, Referring webpage/source through which you accessed the Services, Non-identifiable request IDs, Statistics associated with the interaction between device or browser and the Services',
                    parties: 'Service Providers, Advertising Partners, Analytics Partners, Business Partners'
                  },
                  {
                    category: 'Geolocation Data',
                    examples: 'IP-address-based location information',
                    parties: 'Service Providers, Advertising Partners, Analytics Partners, Business Partners'
                  },
                  {
                    category: 'Inferences Drawn From Other Personal Data Collected',
                    examples: 'Inferences reflecting user behavior',
                    parties: 'Service Providers, Advertising Partners, Analytics Partners'
                  },
                  {
                    category: 'Other Identifying Information that You Voluntarily Choose to Provide',
                    examples: 'Identifying information in emails, letters, texts, or other communications you send us',
                    parties: 'Service Providers, Business Partners'
                  }
                ].map((item, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm p-4 space-y-3 border border-gray-200">
                    <div className="font-semibold text-gray-800">{item.category}</div>
                    <div className="text-sm text-gray-600">
                      <div className="font-medium mb-1">Examples:</div>
                      {item.examples}
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="font-medium mb-1">Shared with:</div>
                      {item.parties}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-8">
            <h3 className="text-xl font-bold mb-2">Categories of Sources of Personal Data</h3>

            <p className="mb-4">
              We collect Personal Data about you from the following categories of sources:
            </p>

            <table className="w-full border-collapse border border-gray-300 mt-4">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-4 border border-gray-300 text-left">Source</th>
                  <th className="py-2 px-4 border border-gray-300 text-left">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 px-4 border border-gray-300">You</td>
                  <td className="py-2 px-4 border border-gray-300">When you provide such information directly to us. When you use the Services and such information is collected automatically.</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border border-gray-300">Third Parties</td>
                  <td className="py-2 px-4 border border-gray-300">Vendors, Advertising Partners</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="mt-8">
            <h3 className="text-xl font-bold mb-2">Our Commercial or Business Purposes for Collecting or Disclosing Personal Data</h3>

            <p className="mb-4">
              We will not collect additional categories of Personal Data or use the Personal Data we collected for materially different, unrelated or incompatible purposes without providing you notice.
            </p>

            <h4 className="text-lg font-bold mt-4 mb-2">Providing, Customizing and Improving the Services</h4>

            <ul className="list-disc list-inside mb-4">
              <li>Creating and managing your account or other user profiles.</li>
              <li>Processing orders or other transactions; billing.</li>
              <li>Providing you with the products, services or information you request.</li>
              <li>Meeting or fulfilling the reason you provided the information to us.</li>
              <li>Providing support and assistance for the Services.</li>
              <li>Improving the Services, including testing, research, internal analytics and product development.</li>
              <li>Personalizing the Services, website content and communications based on your preferences.</li>
              <li>Doing fraud protection, security and debugging.</li>
              <li>Carrying out other business purposes stated when collecting your Personal Data or as otherwise set forth in applicable data privacy laws.</li>
            </ul>

            <h4 className="text-lg font-bold mt-4 mb-2">Marketing the Services</h4>

            <ul className="list-disc list-inside mb-4">
              <li>Marketing and selling the Services.</li>
              <li>Showing you advertisements, including interest-based or online behavioral advertising.</li>
            </ul>

            <h4 className="text-lg font-bold mt-4 mb-2">Corresponding with You</h4>

            <ul className="list-disc list-inside mb-4">
              <li>Responding to correspondence that we receive from you, contacting you when necessary or requested, and sending you information about Commerce Central or the Services.</li>
              <li>Sending emails and other communications according to your preferences or that display content that we think will interest you.</li>
            </ul>

            <h4 className="text-lg font-bold mt-4 mb-2">Meeting Legal Requirements and Enforcing Legal Terms</h4>

            <ul className="list-disc list-inside mb-4">
              <li>Fulfilling our legal obligations under applicable law, regulation, court order or other legal process, such as preventing, detecting and investigating security incidents and potentially illegal or prohibited activities.</li>
              <li>Protecting the rights, property or safety of you, Commerce Central or another party.</li>
              <li>Enforcing any agreements with you.</li>
              <li>Responding to claims that any posting or other content violates third-party rights.</li>
              <li>Resolving disputes.</li>
            </ul>
          </section>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-4">How We Disclose Your Personal Data</h2>

          <p className="mb-4">
            We disclose your Personal Data to the categories of service providers and other parties listed in this section. Depending on state laws that may be applicable to you, some of these disclosures may constitute a “sale” of your Personal Data. For more information, please refer to the state-specific sections below.
          </p>

          <h3 className="text-xl font-bold mt-4 mb-2">Service Providers</h3>

          <p className="mb-4">
            These parties help us provide the Services or perform business functions on our behalf. They include:
          </p>

          <ul className="list-disc list-inside mb-4">
            <li>Hosting, technology and communication providers.</li>
            <li>Security and fraud prevention consultants.</li>
            <li>Support and customer service vendors.</li>
            <li>Product fulfillment and delivery providers.</li>
            <li>Payment processors.</li>
            <li>Our payment processing partner Stripe collects your voluntarily-provided payment card information necessary to process your payment.</li>
            <li>Please see Stripe’s terms of service and privacy policy for information on its use and storage of your Personal Data.</li>
          </ul>

          <h3 className="text-xl font-bold mt-4 mb-2">Advertising Partners</h3>

          <p className="mb-4">
            These parties help us market our services and provide you with other offers that may be of interest to you. They include:
          </p>

          <ul className="list-disc list-inside mb-4">
            <li>Ad networks.</li>
            <li>Data brokers.</li>
            <li>Marketing providers.</li>
          </ul>

          <h3 className="text-xl font-bold mt-4 mb-2">Analytics Partners</h3>

          <p className="mb-4">
            These parties provide analytics on web traffic or usage of the Services. They include:
          </p>

          <ul className="list-disc list-inside mb-4">
            <li>Companies that track how users interact with the Services.</li>
          </ul>

          <h3 className="text-xl font-bold mt-4 mb-2">Business Partners</h3>

          <p className="mb-4">
            These parties partner with us in offering various services. They include:
          </p>

          <ul className="list-disc list-inside mb-4">
            <li>Businesses that you have a relationship with.</li>
            <li>Companies that we partner with to offer joint promotional offers or opportunities.</li>
          </ul>

          <h3 className="text-xl font-bold mt-4 mb-2">Legal Obligations</h3>

          <p className="mb-4">
            We may share any Personal Data that we collect with third parties in conjunction with any of the activities set forth under “Meeting Legal Requirements and Enforcing Legal Terms” in the “Our Commercial or Business Purposes for Collecting Personal Data” section above.
          </p>

          <h3 className="text-xl font-bold mt-4 mb-2">Business Transfers</h3>

          <p className="mb-4">
            All of your Personal Data that we collect may be transferred to a third party if we undergo a merger, acquisition, bankruptcy or other transaction in which that third party assumes control of our business (in whole or in part). Should one of these events occur, we will make reasonable efforts to notify you before your information becomes subject to different privacy and security policies and practices.
          </p>

          <h3 className="text-xl font-bold mt-4 mb-2">Data that is Not Personal Data</h3>

          <p className="mb-4">
            We may create aggregated, de-identified or anonymized data from the Personal Data we collect, including by removing information that makes the data personally identifiable to a particular user. We may use such aggregated, de-identified or anonymized data and share it with third parties for our lawful business purposes, including to analyze, build and improve the Services and promote our business, provided that we will not share such data in a manner that could identify you.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Tracking Tools, Advertising and Opt-Out</h2>

          <p className="mb-4">
            The Services use cookies and similar technologies such as pixel tags, web beacons, clear GIFs and JavaScript (collectively, “Cookies”) to enable our servers to recognize your web browser, tell us how and when you visit and use our Services, analyze trends, learn about our user base and operate and improve our Services. Cookies are small pieces of data– usually text files – placed on your computer, tablet, phone or similar device when you use that device to access our Services. We may also supplement the information we collect from you with information received from third parties, including third parties that have placed their own Cookies on your device(s). Please note that because of our use of Cookies, the Services do not support “Do Not Track” requests sent from a browser at this time.
          </p>

          <h3 className="text-xl font-bold mt-4 mb-2">Types of Cookies We Use</h3>

          <p className="mb-4">
            We use the following types of Cookies:
          </p>

          <h4 className="text-lg font-bold mt-4 mb-2">Essential Cookies</h4>

          <p className="mb-4">
            Essential Cookies are required for providing you with features or services that you have requested. For example, certain Cookies enable you to log into secure areas of our Services. Disabling these Cookies may make certain features and services unavailable.
          </p>

          <h4 className="text-lg font-bold mt-4 mb-2">Functional Cookies</h4>

          <p className="mb-4">
            Functional Cookies are used to record your choices and settings regarding our Services, maintain your preferences over time and recognize you when you return to our Services. These Cookies help us to personalize our content for you, greet you by name and remember your preferences (for example, your choice of language or region).
          </p>

          <h4 className="text-lg font-bold mt-4 mb-2">Performance/Analytical Cookies</h4>

          <p className="mb-4">
            Performance/Analytical Cookies allow us to understand how visitors use our Services. They do this by collecting information about the number of visitors to the Services, what pages visitors view on our Services and how long visitors are viewing pages on the Services. Performance/Analytical Cookies also help us measure the performance of our advertising campaigns in order to help us improve our campaigns and the Services’ content for those who engage with our advertising. For example, Google LLC (“Google”) uses cookies in connection with its Google Analytics services. Google’s ability to use and share information collected by Google Analytics about your visits to the Services is subject to the Google Analytics Terms of Use and the Google Privacy Policy. You have the option to opt-out of Google’s use of Cookies by visiting the Google advertising opt-out page at www.google.com/privacy_ads.html or the Google Analytics Opt-out Browser Add-on at https://tools.google.com/dlpage/gaoptout/.
          </p>

          <h4 className="text-lg font-bold mt-4 mb-2">Retargeting/Advertising Cookies</h4>

          <p className="mb-4">
            Retargeting/Advertising Cookies collect data about your online activity and identify your interests so that we can provide advertising that we believe is relevant to you. For more information about this, please see the section below titled “Information about Interest-Based Advertisements.”
          </p>

          <h3 className="text-xl font-bold mt-4 mb-2">Managing Cookies</h3>

          <p className="mb-4">
            You can decide whether or not to accept Cookies through your internet browser’s settings. Most browsers have an option for turning off the Cookie feature, which will prevent your browser from accepting new Cookies, as well as (depending on the sophistication of your browser software) allow you to decide on acceptance of each new Cookie in a variety of ways. You can also delete all Cookies that are already on your device. If you do this, however, you may have to manually adjust some preferences every time you visit our website and some of the Services and functionalities may not work.
          </p>

          <h3 className="text-xl font-bold mt-4 mb-2">Information about Interest-Based Advertisements</h3>

          <p className="mb-4">
            We may serve advertisements, and also allow third-party ad networks, including third-party ad servers, ad agencies, ad technology vendors and research firms, to serve advertisements through the Services. These advertisements may be targeted to users who fit certain general profile categories or display certain preferences or behaviors (“Interest-Based Ads”). Information for Interest-Based Ads (including Personal Data) may be provided to us by you, or derived from the usage patterns of particular users on the Services and/or services of third parties. Such information may be gathered through tracking users’ activities across time and unaffiliated properties, including when you leave the Services. To accomplish this, we or our service providers may deliver Cookies, including a file (known as a “web beacon”) from an ad network to you through the Services. Web beacons allow ad networks to provide anonymized, aggregated auditing, research and reporting for us and for advertisers. Web beacons also enable ad networks to serve targeted advertisements to you when you visit other websites. Web beacons allow ad networks to view, edit or set their own Cookies on your browser, just as if you had requested a web page from their site.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Data Security</h2>

          <p className="mb-4">
            We seek to protect your Personal Data from unauthorized access, use and disclosure using appropriate physical, technical, organizational and administrative security measures based on the type of Personal Data and how we are processing that data. You should also help protect your data by appropriately selecting and protecting your password and/or other sign-on mechanism; limiting access to your computer or device and browser; and signing off after you have finished accessing your account. Although we work to protect the security of your account and other data that we hold in our records, please be aware that no method of transmitting data over the internet or storing data is completely secure.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Data Retention</h2>

          <p className="mb-4">
            We retain Personal Data about you for as long as necessary to provide you with our Services or to perform our business or commercial purposes for collecting your Personal Data. When establishing a retention period for specific categories of data, we consider who we collected the data from, our need for the Personal Data, why we collected the Personal Data, and the sensitivity of the Personal Data. In some cases we retain Personal Data for longer, if doing so is necessary to comply with our legal obligations, resolve disputes or collect fees owed, or is otherwise permitted or required by applicable law, rule or regulation. We may further retain information in an anonymous or aggregated form where that information would not identify you personally.
          </p>

          <p className="mb-4">
            For example:
          </p>

          <ul className="list-disc list-inside mb-4">
            <li>We retain your profile information and credentials for as long as you have an account with us.</li>
            <li>We retain your payment data for as long as we need to process your purchase or subscription.</li>
            <li>We retain your device/IP data for as long as we need it to ensure that our systems are working appropriately, effectively and efficiently.</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Personal Data of Children</h2>

          <p className="mb-4">
            As noted in the Terms of Use, we do not knowingly collect or solicit Personal Data about children under 13 years of age; if you are a child under the age of 13, please do not attempt to register for or otherwise use the Services or send us any Personal Data. If we learn we have collected Personal Data from a child under 13 years of age, we will delete that information as quickly as possible. If you believe that a child under 13 years of age may have provided Personal Data to us, please contact us at team@commercecentral.io.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Other State Law Privacy Rights</h2>

          <section className="mt-4">
            <h3 className="text-xl font-bold mb-2">California Resident Rights</h3>

            <p className="mb-4">
              Under California Civil Code Sections 1798.83-1798.84, California residents are entitled to contact us to prevent disclosure of Personal Data to third parties for such third parties’ direct marketing purposes; in order to submit such a request, please contact us at team@commercecentral.io.
            </p>

            <p className="mb-4">
              Your browser may offer you a “Do Not Track” option, which allows you to signal to operators of websites and web applications and services that you do not wish such operators to track certain of your online activities over time and across different websites. Our Services do not support Do Not Track requests at this time. To find out more about “Do Not Track”, you can visit www.allaboutdnt.com.
            </p>
          </section>

          <section className="mt-8">
            <h3 className="text-xl font-bold mb-2">Nevada Resident Rights</h3>

            <p className="mb-4">
              If you are a resident of Nevada, you have the right to opt-out of the sale of certain Personal Data to third parties who intend to license or sell that Personal Data. You can exercise this right by contacting us at team@commercecentral.io with the subject line “Nevada Do Not Sell Request” and providing us with your name and the email address associated with your account. Please note that we do not currently sell your Personal Data as sales are defined in Nevada Revised Statutes Chapter 603A.
            </p>
          </section>
        </section>
      </article>
    </main>
  )
}