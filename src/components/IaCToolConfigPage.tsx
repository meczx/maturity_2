import React, { useState } from 'react';
// ...existing code...
// Helper to send API request (copied from ChatbotWidget)
const sendApiRequest = async (sessionId: string, apiEndpoint: string, attachment: string) => {
  if (!sessionId) {
    alert('Session not initialized. Please log in again.');
    return;
  }
  if (!attachment) {
    alert('Please upload a file.');
    return;
  }
  try {
    const body: any = {
      id: sessionId,
      query: '',
      attachment: attachment
    };
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    // You can handle response here if needed
  } catch (error) {
    alert('API Error: Unable to process your request.');
  }
};
import { ArrowLeft, Code } from 'lucide-react';

interface IaCToolConfigPageProps {
  onBack: () => void;
  onContinue: (config: { toolType: 'single' | 'multiple'; selectedTool?: string }) => void;
  selectedProvider: string;
  sessionId: string;
  apiEndpoint: string;
}

export default function IaCToolConfigPage({ onBack, onContinue, selectedProvider, sessionId, apiEndpoint }: IaCToolConfigPageProps) {
  const [toolType, setToolType] = useState<'single' | 'multiple' | null>(null);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const tools = [
    { id: 'terraform', name: 'Terraform' },
    { id: 'ansible', name: 'Ansible' },
    { id: 'pulumi', name: 'Pulumi' },
    { id: 'cloudformation', name: 'AWS CloudFormation' }
  ];

  const handleToolTypeSelection = (type: 'single' | 'multiple') => {
    setToolType(type);
    if (type === 'multiple') {
      onContinue({ toolType: type });
    }
  };

  const handleToolSelection = (tool: string) => {
    setSelectedTool(tool);
    onContinue({ toolType: 'single', selectedTool: tool });
  };

  // Handle file upload and call API directly if file is uploaded
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/json') {
      alert('Please upload a JSON file only.');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const textContent = e.target?.result as string;
        JSON.parse(textContent); // Validate JSON
        const base64Content = btoa(textContent);
        setUploadedFile(base64Content);
        await sendApiRequest(sessionId, apiEndpoint, base64Content);
        onContinue({ toolType: 'single', selectedTool: undefined });
      } catch (error) {
        alert('Invalid JSON file. Please check the file format.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
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
            AI-Powered Guided Upload
          </h1>
          <p className="text-gray-300 text-lg">
            Infrastructure as Code Configuration
          </p>
          
          <div className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium mt-4">
            {selectedProvider.toUpperCase()} Assessment
          </div>
        </div>

        {/* IaC Tool Configuration */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">IaC Tool Configuration</h2>

          {/* File Upload Option */}
          <div className="mb-6">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gray-800 border-2 border-gray-700 rounded-xl p-4 cursor-pointer text-white hover:border-blue-500 transition-all duration-200"
            >
              Upload IaC JSON File
            </button>
            {uploadedFile && (
              <span className="text-xs text-blue-600 ml-2">File selected</span>
            )}
          </div>

          {/* Tool Type Selection */}
          <div className="space-y-4 mb-8">
            <div
              onClick={() => handleToolTypeSelection('single')}
              className={`bg-gray-800 border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                toolType === 'single'
                  ? 'border-blue-500 bg-gray-750'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Single IaC Tool</h3>
                  <p className="text-gray-400">All infrastructure managed with one tool</p>
                </div>
              </div>
            </div>

            <div
              onClick={() => handleToolTypeSelection('multiple')}
              className={`bg-gray-800 border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                toolType === 'multiple'
                  ? 'border-blue-500 bg-gray-750'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Multiple IaC Tools</h3>
                  <p className="text-gray-400">Different tools for different parts of infrastructure</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tool Selection (only show if Single IaC Tool is selected) */}
          {toolType === 'single' && (
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Select Your IaC Tool</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tools.map((tool) => (
                  <div
                    key={tool.id}
                    onClick={() => handleToolSelection(tool.id)}
                    className={`bg-gray-800 border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                      selectedTool === tool.id
                        ? 'border-blue-500 bg-gray-750'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Code className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-white font-medium">{tool.name}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}