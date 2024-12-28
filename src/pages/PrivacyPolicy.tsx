import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <div className="prose max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
          <p className="mb-4">
            When you visit JumbleAnswers.com, we may collect certain information about your device, 
            including information about your web browser, IP address, time zone, and some of the cookies 
            that are installed on your device.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
          <p className="mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide and maintain our Service</li>
            <li>Improve and optimize our website</li>
            <li>Understand how visitors use our website</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Cookies</h2>
          <p className="mb-4">
            We use cookies and similar tracking technologies to track activity on our Service and 
            hold certain information. Cookies are files with a small amount of data which may 
            include an anonymous unique identifier.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this Privacy Policy, please contact us at:
            privacy@jumbleanswers.com
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;