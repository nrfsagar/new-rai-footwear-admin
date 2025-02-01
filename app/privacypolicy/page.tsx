import React from 'react';

const PrivacyPolicy: React.FC = () => {
  const sections = [
    {
      title: "About Us",
      content: "This privacy policy applies to the New Rai Footwear App developed by New Rai Footwear, available on the Google Play Store. This policy explains how we handle data when you use our application to browse our footwear collection and access product information."
    },
    {
      title: "Data Collection and Use",
      content: "The New Rai Footwear App is designed to provide you with information about our products while respecting your privacy.",
      list: [
        "Product Information: Our app displays information about footwear products available in our physical store.",
        "Personal Data: We do not collect or store any personal information from users.",
        "Usage Data: We may collect anonymous usage statistics to improve app performance and user experience.",
        "Device Permissions: Our app only requests essential permissions required for basic functionality."
      ]
    },
    {
      title: "Data Security",
      content: "We implement appropriate technical and organizational measures to ensure the security of any information displayed or processed through our app. All product information is stored securely and updated regularly to ensure accuracy."
    },
    {
      title: "Product Information",
      content: "Our app displays information about:",
      list: [
        "Available footwear products",
        "Product specifications and sizes",
        "Price information",
        "Stock availability"
      ],
      additionalContent: "This information is for reference purposes only and may be updated without notice."
    },
    {
      title: "Third-Party Services",
      content: "Our app may use third-party services including:",
      list: [
        "Google Play Services",
        "Analytics providers"
      ],
      additionalContent: "Each third-party service operates under its own privacy policy. We recommend reviewing their respective privacy policies for more information."
    },
    {
      title: "Data Retention and Deletion",
      content: "Since we don't collect or store any user data on our servers, there is no data retention period. Any cached product information can be cleared by clearing the app's cache or uninstalling the app from your device."
    },
    {
      title: "Children's Privacy",
      content: "Our app does not knowingly collect any personal information from children under 13 years of age. The app is designed for general audience use."
    },
    {
      title: "Changes to This Privacy Policy",
      content: "We reserve the right to update this privacy policy at any time. We will notify users of any material changes by posting the new privacy policy on this page and updating the Last Updated date."
    },
    {
      title: "Contact Information",
      content: "For any questions or concerns about this privacy policy or our app, please contact us:",
      list: [
        "Business Name: New Rai Footwear",
        "Email: mukul93028@gmail.com",
        "Phone: +919302893948",
        "Address: Link Rd, near SMART BAR PATEL MARKET, Katra Bazaar, Sagar, Madhya Pradesh 470002"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="bg-blue-500 text-white p-6 rounded-lg mb-8">
          <h1 className="text-3xl font-bold text-center">Privacy Policy</h1>
        </header>

        <main className="bg-white rounded-lg shadow-lg p-8">
          {sections.map((section, index) => (
            <section key={index} className="mb-8 last:mb-0">
              <h2 className="text-xl font-semibold text-blue-600 border-b border-blue-200 pb-2 mb-4">
                {section.title}
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">{section.content}</p>
                {section.list && (
                  <ul className="list-disc pl-6 space-y-2">
                    {section.list.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-gray-700">{item}</li>
                    ))}
                  </ul>
                )}
                {section.additionalContent && (
                  <p className="text-gray-700">{section.additionalContent}</p>
                )}
              </div>
            </section>
          ))}

          <div className="mt-8 pt-4 border-t border-gray-200">
            <p className="text-gray-500 italic">
              Last Updated: February 1, 2025
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PrivacyPolicy;