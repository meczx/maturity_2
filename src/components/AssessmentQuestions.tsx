import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, CheckCircle, XCircle, HelpCircle, Loader2 } from 'lucide-react';
import Config from '../config/configapi.json';

interface Question {
  id: string;
  text: string;
  domain: string;
  options: string[];
}

interface Domain {
  name: string;
  description: string;
  color: string;
}

const domains: Domain[] = [
  {
    name: "Security & Compliance",
    description: "Identity management, encryption, security controls, and compliance",
    color: "bg-red-500"
  },
  {
    name: "Architecture & Design",
    description: "Cloud-native patterns, microservices, and architectural principles",
    color: "bg-blue-500"
  },
  {
    name: "Infrastructure & Operations",
    description: "Automation, monitoring, and operational excellence",
    color: "bg-green-500"
  },
  {
    name: "Cost Management",
    description: "Resource optimization, monitoring, and cost control",
    color: "bg-yellow-500"
  },
  {
    name: "Network & Connectivity",
    description: "VPCs, routing, endpoints, and network security",
    color: "bg-purple-500"
  }
];

const questions: Question[] = [
  // Security & Compliance (5 questions)
  {
    id: "sec1",
    text: "Is MFA enforced for all Users?",
    domain: "Security & Compliance",
    options: ["No", "Partial", "Enforced for All IAM Users & SSO"]
  },
  {
    id: "sec2",
    text: "Is a key management solution in place and actively used?",
    domain: "Security & Compliance",
    options: ["No", "Default KMS Only", "Centralized KMS with Rotation"]
  },
  {
    id: "sec3",
    text: "Is data encrypted at rest & in transit?",
    domain: "Security & Compliance",
    options: ["Neither", "Only One", "Both"]
  },
  {
    id: "sec4",
    text: "Is strict RBAC enforced on resources?",
    domain: "Security & Compliance",
    options: ["No", "Basic Roles", "Strict Least Privilege RBAC"]
  },
  {
    id: "sec5",
    text: "Is traffic (inbound/outbound) restricted using security groups or ACLs?",
    domain: "Security & Compliance",
    options: ["Open", "Partial", "Principle of Least Access Enforced"]
  },
  // Architecture & Design (5 questions)
  {
    id: "arch1",
    text: "Are microservices-based cloud-native design patterns being adopted?",
    domain: "Architecture & Design",
    options: ["Not Adopted", "Partially Adopted", "Widely Adopted", "Not Applicable"]
  },
  {
    id: "arch2",
    text: "Are governed design patterns used across the organization?",
    domain: "Architecture & Design",
    options: ["No", "Team-Specific", "Organization-Wide"]
  },
  {
    id: "arch3",
    text: "Are solutions designed to be resilient across multiple AZs and regions?",
    domain: "Architecture & Design",
    options: ["Single AZ Only", "Multi-AZ", "Multi-Region", "Unknown"]
  },
  {
    id: "arch4",
    text: "Is there a formal solution approval process governed by architecture principles?",
    domain: "Architecture & Design",
    options: ["No", "Informal Only", "Formal Review Process"]
  },
  {
    id: "arch5",
    text: "Are migration strategies well defined (Lift & Shift vs Re-factor)?",
    domain: "Architecture & Design",
    options: ["No Defined Strategy", "Lift & Shift Focused", "Mixed Strategy", "Refactor Preferred"]
  },
  // Infrastructure & Operations (5 questions)
  {
    id: "infra1",
    text: "Is Infrastructure as Code (IaC) consistently implemented with no manual changes?",
    domain: "Infrastructure & Operations",
    options: ["Mostly Manual", "Partially Used", "Fully IaC with Drift Detection"]
  },
  {
    id: "infra2",
    text: "Are automated unit tests integrated into the deployment pipeline?",
    domain: "Infrastructure & Operations",
    options: ["No Tests", "Manual Testing Only", "Automated Tests in CI"]
  },
  {
    id: "infra3",
    text: "Is there centralized log aggregation, monitoring, and alerting?",
    domain: "Infrastructure & Operations",
    options: ["No", "Team-Specific", "Centralized"]
  },
  {
    id: "infra4",
    text: "Is there a quick isolation strategy for failing components/domains?",
    domain: "Infrastructure & Operations",
    options: ["No Strategy", "Manual Isolation", "Automated Containment or Self-Healing"]
  },
  {
    id: "infra5",
    text: "Are SLAs/SLOs defined for all key services?",
    domain: "Infrastructure & Operations",
    options: ["No", "Informal", "SLAs & SLOs Defined & Monitored"]
  },
  // Cost Management (5 questions)
  {
    id: "cost1",
    text: "Is cost monitoring and reporting in place?",
    domain: "Cost Management",
    options: ["No", "Team Level Only", "Centralized + Automated Reports"]
  },
  {
    id: "cost2",
    text: "Are alerts configured for cost anomalies?",
    domain: "Cost Management",
    options: ["No", "Budget Thresholds Only", "Real-Time Alerts with Owner Mapping"]
  },
  {
    id: "cost3",
    text: "Are application tagging strategies implemented for cost attribution?",
    domain: "Cost Management",
    options: ["No", "Inconsistent", "Standardized + Enforced"]
  },
  {
    id: "cost4",
    text: "Are resources properly sized based on actual usage?",
    domain: "Cost Management",
    options: ["No Sizing", "Manual Reviews", "Auto-Scaling + Right Sizing Tools"]
  },
  {
    id: "cost5",
    text: "Are unused resources shut down during off hours?",
    domain: "Cost Management",
    options: ["Never", "Manual Process", "Scheduled Auto-Shutdown"]
  },
  // Network & Connectivity (5 questions)
  {
    id: "net1",
    text: "Is the network segmented using VPCs, subnets, and firewalls?",
    domain: "Network & Connectivity",
    options: ["Flat Network", "Basic Segmentation", "Tiered + Service-Level Segmentation"]
  },
  {
    id: "net2",
    text: "Are Zero Trust principles applied in network design?",
    domain: "Network & Connectivity",
    options: ["No", "Partially", "End-to-End Enforcement"]
  },
  {
    id: "net3",
    text: "Are private endpoints, VPNs, or Direct Connect used for secure connectivity?",
    domain: "Network & Connectivity",
    options: ["Public Only", "Some Private Links", "Secure Channel for All Core Systems"]
  },
  {
    id: "net4",
    text: "Are jump hosts used for controlled access to internal systems?",
    domain: "Network & Connectivity",
    options: ["No", "Some Teams Use", "Mandatory Bastion or Session Manager"]
  },
  {
    id: "net5",
    text: "Is vulnerability scanning regularly conducted on all network ports?",
    domain: "Network & Connectivity",
    options: ["No", "Monthly or Ad-Hoc", "Automated + Reported"]
  }
];

interface AssessmentQuestionsProps {
  onComplete: (score: number) => void;
  onClose: () => void;
}

export default function AssessmentQuestions({ onComplete, onClose }: AssessmentQuestionsProps) {
  const navigate = useNavigate();
  const { sessionId } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentDomain, setCurrentDomain] = useState<string>("");
  const [showScore, setShowScore] = useState(false);
  const [finalScore, setFinalScore] = useState<number>(0);

  const currentQuestion = questions[currentQuestionIndex];
  const currentDomainInfo = domains.find(d => d.name === currentQuestion?.domain);

  useEffect(() => {
    if (currentQuestion) {
      setCurrentDomain(currentQuestion.domain);
    }
  }, [currentQuestion]);

  const handleAnswer = async (answer: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: answer };
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      // Check if next question is from a different domain
      const nextQuestion = questions[currentQuestionIndex + 1];
      if (nextQuestion.domain !== currentQuestion.domain) {
        setIsLoading(true);
        // Show loading for 2 seconds before next domain
        setTimeout(() => {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setIsLoading(false);
        }, 2000);
      } else {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    } else {
      // Assessment complete
      const score = calculateScore(newAnswers);
      setFinalScore(score);
      setShowScore(true);
    }
  };

  const handleProceedToAssessment = async () => {
    await sendScoreToAPI(finalScore);
    onComplete(finalScore);
  };

  const calculateScore = (answers: Record<string, string>): number => {
    let totalScore = 0;
    questions.forEach(question => {
      const answer = answers[question.id];
      const optionIndex = question.options.indexOf(answer);
      if (optionIndex === 0) {
        totalScore += 1;
      } else if (optionIndex === 1) {
        totalScore += 2;
      } else if (optionIndex === 2) {
        totalScore += 4;
      } else if (optionIndex === 3) {
        totalScore += 4; // For 4-option questions, last option is also 4 points
      }
      // If answer not found, add 0
    });
    return totalScore;
  };

  const sendScoreToAPI = async (score: number) => {
    try {
      const response = await fetch(`${Config.local_env}/cloud_maturity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: sessionId,
          query: `Assessment completed with score: ${score}/120 (${(score/6).toFixed(1)}/20)`,
          assessment_score: score,
          total_questions: 25,
          max_score: 120
        })
      });
      const data = await response.json();
      console.log('Score sent to API:', data);
    } catch (error) {
      console.error('Error sending score to API:', error);
    }
  };

  const getProgressPercentage = () => {
    return ((currentQuestionIndex + 1) / questions.length) * 100;
  };

  if (showScore) {
    const percentage = (finalScore / 120) * 100;
    const scoreOutOf20 = (finalScore / 6).toFixed(1);
    let scoreColor = "text-red-600";
    let scoreMessage = "Needs Improvement";
    let barColor = "bg-red-500";
    if (percentage >= 80) {
      scoreColor = "text-green-600";
      scoreMessage = "Excellent";
      barColor = "bg-green-500";
    } else if (percentage >= 60) {
      scoreColor = "text-yellow-600";
      scoreMessage = "Good";
      barColor = "bg-yellow-500";
    } else if (percentage >= 40) {
      scoreColor = "text-orange-600";
      scoreMessage = "Fair";
      barColor = "bg-orange-500";
    }

    const handleDownloadPDF = () => {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.text('Assessment Complete!', 20, 30);
      doc.setFontSize(32);
      doc.setTextColor(barColor === 'bg-green-500' ? '#22c55e' : barColor === 'bg-yellow-500' ? '#eab308' : barColor === 'bg-orange-500' ? '#f97316' : '#ef4444');
      doc.text(`${scoreOutOf20}/20`, 20, 50);
      doc.setFontSize(16);
      doc.setTextColor('#333');
      doc.text(`Raw Score: ${finalScore}/120`, 20, 65);
      doc.setTextColor(barColor === 'bg-green-500' ? '#22c55e' : barColor === 'bg-yellow-500' ? '#eab308' : barColor === 'bg-orange-500' ? '#f97316' : '#ef4444');
      doc.text(scoreMessage, 20, 80);
      doc.setTextColor('#333');
      doc.text(`${percentage.toFixed(0)}% Cloud Maturity Score`, 20, 95);
      doc.save('assessment-result.pdf');
      navigate('/');
    };

    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Assessment Complete!
            </h2>
            <div className="text-6xl font-bold mb-4">
              <span className={scoreColor}>{scoreOutOf20}</span>
              <span className="text-gray-400">/20</span>
            </div>
            <p className="text-lg text-gray-600 mb-2">
              Raw Score: {finalScore}/120
            </p>
            <p className={`text-xl font-semibold mb-2 ${scoreColor}`}>
              {scoreMessage}
            </p>
            <p className="text-gray-600">
              {percentage.toFixed(0)}% Cloud Maturity Score
            </p>
          </div>
          <div className="mb-8">
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div 
                className={`h-4 rounded-full transition-all duration-500 ${barColor}`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
          <div className="space-y-4">
            <button
              onClick={handleDownloadPDF}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Download PDF Result
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    const nextQuestion = questions[currentQuestionIndex + 1];
    const nextDomain = domains.find(d => d.name === nextQuestion?.domain);
    
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
          <div className="flex justify-center mb-6">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Please wait...
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            {nextDomain?.name} is loading
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
        </div>
      </div>
    );
  }

  // Highlight selected option
  const selectedAnswer = answers[currentQuestion.id];

  // Navigation handlers
  const goToNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  const goToPrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 border border-gray-100">
        {/* Top colored domain pill */}
        <div className={`flex items-center justify-between px-12 pt-10 pb-4 rounded-t-2xl ${currentDomainInfo?.color} bg-opacity-10`}>
          <div className={`inline-block px-6 py-2 rounded-lg text-lg font-semibold tracking-wide ${currentDomainInfo?.color} text-white shadow-sm`}>
            {currentDomainInfo?.name}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold focus:outline-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Progress Bar & Info */}
        <div className="px-12 pt-2 pb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Progress</span>
            <span className="text-xs font-semibold text-gray-500">Question {currentQuestionIndex + 1} of {questions.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-400 mt-1">{Math.round(getProgressPercentage())}% Complete</div>
        </div>

        {/* Question */}
        <div className="px-12 pb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 leading-tight">
            {currentQuestion.text}
          </h2>

          {/* Options */}
          <div className="space-y-5">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              return (
                <button
                  key={index}
                  onClick={() => {
                    const newAnswers = { ...answers, [currentQuestion.id]: option };
                    setAnswers(newAnswers);
                  }}
                  className={`w-full p-5 text-left border-2 rounded-xl transition-all duration-200 group flex items-center justify-between font-medium text-lg shadow-sm
                    ${isSelected ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white hover:border-blue-500 hover:bg-blue-50'}
                  `}
                >
                  <div className="flex items-center">
                    {option === "No" && <XCircle className="h-6 w-6 text-red-600 mr-3" />}
                    {option === "Optional" && <HelpCircle className="h-6 w-6 text-blue-600 mr-3" />}
                    {option === "Partial" && <HelpCircle className="h-6 w-6 text-yellow-600 mr-3" />}
                    {option === "Enforced for All IAM Users & SSO" && <CheckCircle className="h-6 w-6 text-green-600 mr-3" />}
                    <span className={`text-lg font-medium ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>{option}</span>
                  </div>
                  <ArrowRight className={`h-6 w-6 ${isSelected ? 'text-blue-600' : 'text-gray-400'} group-hover:text-blue-600 transition-colors`} />
                </button>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-10">
            <button
              onClick={goToPrev}
              disabled={currentQuestionIndex === 0}
              className={`px-6 py-3 rounded-lg font-semibold text-base transition-colors ${currentQuestionIndex === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Previous
            </button>
            <button
              onClick={() => {
                if (selectedAnswer) {
                  handleAnswer(selectedAnswer);
                }
              }}
              disabled={!selectedAnswer}
              className={`px-6 py-3 rounded-lg font-semibold text-base transition-colors ${!selectedAnswer ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 