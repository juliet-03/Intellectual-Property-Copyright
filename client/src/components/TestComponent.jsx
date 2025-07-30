import React from 'react';

const TestComponent = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-green-600">✅ Frontend is Working!</h1>
      <p className="text-gray-600 mt-2">
        The React application is running successfully on port 5173.
      </p>
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h2 className="font-semibold text-blue-800">What's Working:</h2>
        <ul className="mt-2 text-sm text-blue-700">
          <li>✅ React 19 with Vite</li>
          <li>✅ Tailwind CSS styling</li>
          <li>✅ React Router navigation</li>
          <li>✅ Component structure</li>
          <li>✅ API service configuration</li>
        </ul>
      </div>
    </div>
  );
};

export default TestComponent; 