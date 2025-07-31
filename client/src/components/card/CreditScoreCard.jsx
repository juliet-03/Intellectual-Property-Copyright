import React, { useState } from 'react';

const CreditScoreCard = () => {
  const [score, setScore] = useState(null);

  const generateScore = () => {
    const randomScore = Math.floor(Math.random() * 101); // 0 to 100
    setScore(randomScore);
  };

  const getScoreStatus = (score) => {
    if (score <= 25) return { color: 'bg-red-500', label: 'Very High Risk', action: 'Blacklist' };
    if (score <= 50) return { color: 'bg-amber-500', label: 'High Risk', action: 'Legal Action' };
    if (score <= 75) return { color: 'bg-blue-500', label: 'Moderate Risk', action: 'Pardon Under Monitoring' };
    return { color: 'bg-green-500', label: 'Low Risk', action: 'Pardon' };
  };

  const status = score !== null ? getScoreStatus(score) : null;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow text-center space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Client Credit Score</h2>

      <button
        onClick={generateScore}
        className="px-6 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition"
      >
        Generate Credit Score
      </button>

      {score !== null && (
        <div className="mt-4 space-y-3">
          <div className={`text-white py-4 rounded text-xl font-semibold ${status.color}`}>
            Score: {score}%
          </div>
          <p className="text-lg font-medium text-gray-700">
            Risk Level: <span className="font-bold">{status.label}</span>
          </p>
          <p className="text-lg text-gray-600">
            Recommended Action: <span className="font-bold text-gray-900">{status.action}</span>
          </p>
        </div>
      )}
    </div>
  );
};

// ✅ correct
export default CreditScoreCard;
