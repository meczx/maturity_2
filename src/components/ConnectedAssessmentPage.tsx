import React, { useState } from 'react';
import { ArrowLeft, FileText } from 'lucide-react';

interface ConnectedAssessmentPageProps {
  onBack: () => void;
  onStartAssessment: () => void;
  selectedProvider: string;
  accountInfo: { accountId: string; provider: string };
}

export default function ConnectedAssessmentPage({ onBack, onStartAssessment, selectedProvider, accountInfo }: ConnectedAssessmentPageProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateStateFile = async () => {
    setIsGenerating(true);
    // Simulate state file generation
    setTimeout(() => {
      setIsGenerating(false);
      // Auto-proceed to assessment after generation
      onStartAssessment();
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-gray-300 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            AI-Powered Connected Assessment
          </h1>
          <p className="text-gray-300 text-lg">
            Generate infrastructure state file
          </p>
          
          <div className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium mt-4">
            {selectedProvider.toUpperCase()} Connected Assessment
          </div>
        </div>

        {/* State File Generation Section */}
        <div className="mb-8">
          <div className="bg-blue-900 bg-opacity-20 border border-blue-700 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <FileText className="h-6 w-6 text-blue-400 mr-3 mt-1" />
              <div>
                <h3 className="text-blue-300 font-semibold mb-2">State File Generation</h3>
                <p className="text-blue-200 text-sm">
                  We'll connect to your {selectedProvider.toUpperCase()} account using the provided credentials and generate a comprehensive 
                  state file containing all your infrastructure resources.
                </p>
              </div>
            </div>
          </div>

          {/* Center Content */}
          <div className="text-center py-12">
            <div className="mb-8">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">
                Ready to Generate State File
              </h2>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                Click the button below to connect to your {selectedProvider.toUpperCase()} account and generate the state file.
              </p>
            </div>

            <button
              onClick={handleGenerateStateFile}
              disabled={isGenerating}
              className={`px-8 py-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center mx-auto ${
                isGenerating
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Generating State File...
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5 mr-2" />
                  Generate State.json File
                </>
              )}
            </button>
          </div>
        </div>

        {/* Upload File Button */}
        <div className="text-center">
          <button
            onClick={onStartAssessment}
            className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all duration-200 flex items-center mx-auto"
          >
            Upload File
            <ArrowLeft className="h-5 w-5 ml-2 rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
}