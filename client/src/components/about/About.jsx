// // pages/About.jsx

// import React, { useState}from "react";
// import financeImg from '../../assets/finance.png'; // Adjust the path based on your file location



// const About = () => {
//   const [currentSlide, setCurrentSlide] = useState(0);

//   // Image path from your Node.js server
//  const slides = [
//   { type: 'image', src: 'assets/finance.png' },
//   { type: 'text', content: 'Welcome to our company!' }
// ];

//   return (
 
//     <div className="max-w-5xl mx-auto p-8 bg-white rounded-xl shadow text-gray-900">
//       <h1 className="text-4xl font-bold mb-6 text-blue-900">About the Credit Tracker Tool</h1>
//       <p className="mb-4 text-lg">
//         The Credit Tracker is a modern web application built to replace outdated Excel-based tracking
//         with a visual, interactive dashboard for managing client debts, communication logs and risk analysis.
//         It's designed specifically for financial organizations, loan officers and recovery teams who need a smarter
//         and more efficient way to streamline their debt collection processes.
//       </p>

//       <h2 className="text-2xl font-semibold mt-6 mb-3 text-blue-800">Key Features</h2>
//       <ul className="list-disc pl-6 space-y-2 text-gray-800">
//         <li>📊 <strong>Visual Real-Time Reporting:</strong> Instantly see outstanding debts, client statuses, and payment trends.</li>
//         <li>🔐 <strong>Secure Messaging:</strong> Communicate with clients directly through the platform, with data privacy in mind.</li>
//         <li>✅ <strong>Client Verification:</strong> Built-in verification workflows to validate debtor information.</li>
//         <li>🤝 <strong>Third-Party Integrations:</strong> Seamless integration with loan companies and external systems for accountability tracking.</li>
//         <li>📁 <strong>Centralized Logs:</strong> All communication and recovery actions are recorded for easy reference.</li>
//         <li>🧠 <strong>Risk Analysis Engine:</strong> Intelligent scoring helps prioritize high-risk accounts for faster recovery action.</li>
//       </ul>

//       <h2 className="text-2xl font-semibold mt-6 mb-3 text-blue-800">Who Is This Tool For?</h2>
//       <p className="text-lg">
//         Whether you're part of a financial institution, a loan officer managing hundreds of accounts, or a recovery team
//         needing clarity and control this tool provides the structure and intelligence you need.
//         <br /><br />
//         By turning raw data into actionable insights, it empowers your team to make **data-driven decisions**, enhance
//         recovery strategies, and eliminate the chaos of spreadsheets.
//       </p>

//       <h2 className="text-2xl font-semibold mt-6 mb-3 text-blue-800">Why It Matters</h2>
//       <p className="text-lg">
//         Manual tracking is time-consuming, error-prone and lacks visibility. This platform gives you back control
//         with automation, analytics and collaboration all in one place.
//       </p>
//     </div>
//   );
// };

// export default About;

// pages/About.jsx

import React, { useState } from "react";
import financeImg from '../../assets/finance.png'; // Adjust the path if needed

const About = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { type: 'image', src: financeImg },
    { type: 'text', content: 'Welcome to our company!' }
  ];

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white rounded-xl shadow text-gray-900">
      <h1 className="text-4xl font-bold mb-6 text-blue-900">About the Credit Tracker Tool</h1>
      <p className="mb-4 text-lg">
        The Credit Tracker is a modern web application built to replace outdated Excel-based tracking
        with a visual, interactive dashboard for managing client debts, communication logs and risk analysis.
        It's designed specifically for financial organizations, loan officers and recovery teams who need a smarter
        and more efficient way to streamline their debt collection processes.
      </p>

      {/* 👇 Slide display section */}
      <div className="my-6">
        {slides[currentSlide].type === 'image' ? (
          <img
            src={slides[currentSlide].src}
            alt="About"
            className="max-w-md w-full h-auto mx-auto rounded-lg shadow"
          />
        ) : (
          <p className="text-xl">{slides[currentSlide].content}</p>
        )}
      </div>

      <h2 className="text-2xl font-semibold mt-6 mb-3 text-blue-800">Key Features</h2>
      <ul className="list-disc pl-6 space-y-2 text-gray-800">
        <li>📊 <strong>Visual Real-Time Reporting:</strong> Instantly see outstanding debts, client statuses, and payment trends.</li>
        <li>🔐 <strong>Secure Messaging:</strong> Communicate with clients directly through the platform, with data privacy in mind.</li>
        <li>✅ <strong>Client Verification:</strong> Built-in verification workflows to validate debtor information.</li>
        <li>🤝 <strong>Third-Party Integrations:</strong> Seamless integration with loan companies and external systems for accountability tracking.</li>
        <li>📁 <strong>Centralized Logs:</strong> All communication and recovery actions are recorded for easy reference.</li>
        <li>🧠 <strong>Risk Analysis Engine:</strong> Intelligent scoring helps prioritize high-risk accounts for faster recovery action.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-3 text-blue-800">Who Is This Tool For?</h2>
      <p className="text-lg">
        Whether you're part of a financial institution, a loan officer managing hundreds of accounts, or a recovery team
        needing clarity and control, this tool provides the structure and intelligence you need.
        <br /><br />
        By turning raw data into actionable insights, it empowers your team to make <strong>data-driven decisions</strong>, enhance
        recovery strategies, and eliminate the chaos of spreadsheets.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3 text-blue-800">Why It Matters</h2>
      <p className="text-lg">
        Manual tracking is time-consuming, error-prone and lacks visibility. This platform gives you back control
        with automation, analytics and collaboration all in one place.
      </p>
    </div>
  );
};

export default About;

