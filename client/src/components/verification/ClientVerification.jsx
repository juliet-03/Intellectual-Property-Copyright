import { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle, Upload, Eye } from 'lucide-react';
import { verificationAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ClientVerification = ({ clientId, onVerificationComplete }) => {
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);

  const verificationSteps = [
    {
      id: 'identity',
      name: 'Identity Verification',
      description: 'Verify client identity documents',
      required: ['id_document', 'selfie']
    },
    {
      id: 'address',
      name: 'Address Verification',
      description: 'Confirm residential address',
      required: ['utility_bill', 'bank_statement']
    },
    {
      id: 'financial',
      name: 'Financial Verification',
      description: 'Validate financial information',
      required: ['income_proof', 'bank_details']
    },
    {
      id: 'credit',
      name: 'Credit Bureau Check',
      description: 'External credit verification',
      required: []
    }
  ];

  useEffect(() => {
    fetchVerificationData();
  }, [clientId]);

  const fetchVerificationData = async () => {
    try {
      const response = await verificationAPI.getVerificationStatus(clientId);
      setVerificationData(response.data);
      
      // Find current active step
      const currentStep = verificationSteps.findIndex(step => 
        response.data.steps[step.id]?.status === 'pending'
      );
      setActiveStep(currentStep === -1 ? verificationSteps.length - 1 : currentStep);
    } catch (error) {
      toast.error('Failed to load verification data');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (stepId, documentType, file) => {
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', documentType);
      
      await verificationAPI.uploadDocument(clientId, stepId, formData);
      toast.success('Document uploaded successfully');
      fetchVerificationData();
    } catch (error) {
      toast.error('Failed to upload document');
    }
  };

  const initiateVerificationStep = async (stepId) => {
    try {
      await verificationAPI.initiateStep(clientId, stepId);
      toast.success('Verification step initiated');
      fetchVerificationData();
    } catch (error) {
      toast.error('Failed to initiate verification');
    }
  };

  const getStepStatus = (stepId) => {
    return verificationData?.steps[stepId]?.status || 'not_started';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'pending':
        return <Clock className="text-yellow-500" size={20} />;
      case 'failed':
        return <AlertCircle className="text-red-500" size={20} />;
      default:
        return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  if (loading) return <div>Loading verification data...</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-6">Client Verification Workflow</h3>
      
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {verificationSteps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                index <= activeStep ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}>
                {getStatusIcon(getStepStatus(step.id))}
              </div>
              <span className="text-xs mt-2 text-center">{step.name}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((activeStep + 1) / verificationSteps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Verification Steps */}
      <div className="space-y-6">
        {verificationSteps.map((step, index) => (
          <VerificationStep
            key={step.id}
            step={step}
            status={getStepStatus(step.id)}
            isActive={index === activeStep}
            onUpload={(documentType, file) => handleDocumentUpload(step.id, documentType, file)}
            onInitiate={() => initiateVerificationStep(step.id)}
            documents={verificationData?.steps[step.id]?.documents || []}
          />
        ))}
      </div>

      {/* Overall Status */}
      <div className="mt-8 p-4 bg-gray-50 rounded">
        <div className="flex items-center justify-between">
          <span className="font-medium">Overall Verification Status:</span>
          <span className={`px-3 py-1 rounded-full text-sm ${
            verificationData?.overallStatus === 'completed' 
              ? 'bg-green-100 text-green-800'
              : verificationData?.overallStatus === 'in_progress'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {verificationData?.overallStatus || 'Not Started'}
          </span>
        </div>
      </div>
    </div>
  );
};

const VerificationStep = ({ step, status, isActive, onUpload, onInitiate, documents }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (documentType, event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      await onUpload(documentType, file);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium">{step.name}</h4>
        <span className={`px-2 py-1 rounded text-xs ${
          status === 'completed' ? 'bg-green-100 text-green-800' :
          status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          status === 'failed' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {status.replace('_', ' ').toUpperCase()}
        </span>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">{step.description}</p>

      {/* Document Upload Section */}
      {step.required.length > 0 && (
        <div className="space-y-3">
          <h5 className="text-sm font-medium">Required Documents:</h5>
          {step.required.map(docType => (
            <div key={docType} className="flex items-center justify-between p-3 bg-white rounded border">
              <span className="text-sm capitalize">{docType.replace('_', ' ')}</span>
              <div className="flex items-center space-x-2">
                {documents.find(d => d.type === docType) ? (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="text-green-500" size={16} />
                    <button className="text-blue-500 hover:underline text-sm">
                      <Eye size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(docType, e)}
                      disabled={uploading}
                    />
                    <div className="flex items-center space-x-1 text-blue-500 hover:underline text-sm">
                      <Upload size={16} />
                      <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                    </div>
                  </label>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Button */}
      {status === 'not_started' && (
        <button
          onClick={onInitiate}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Start Verification
        </button>
      )}
    </div>
  );
};

export default ClientVerification;