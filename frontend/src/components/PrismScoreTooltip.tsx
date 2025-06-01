import React, { useState } from 'react';
import { FiInfo } from 'react-icons/fi';

interface PrismScoreTooltipProps {
    dimension: string;
    score: number;
    className?: string;
}

const prismDimensions = {
    logical_coherence: {
        title: 'Logical Coherence',
        description: 'Evaluates whether the incident description is internally consistent and follows logical reasoning patterns.',
        highExample: 'Clear cause-and-effect relationship between AI system behavior and outcome',
        lowExample: 'Contradictory or impossible sequence of events described',
        interpretation: (score: number) => {
            if (score >= 0.8) return 'Very logical and coherent';
            if (score >= 0.6) return 'Mostly logical with minor inconsistencies';
            if (score >= 0.4) return 'Some logical gaps or contradictions';
            if (score >= 0.2) return 'Significant logical issues';
            return 'Largely incoherent or contradictory';
        }
    },
    factual_accuracy: {
        title: 'Factual Accuracy',
        description: 'Assesses the technical correctness and verifiability of claims made in the incident report.',
        highExample: 'Specific technical details that can be verified and are consistent with known systems',
        lowExample: 'Vague or technically impossible claims about AI system capabilities',
        interpretation: (score: number) => {
            if (score >= 0.8) return 'Highly accurate and verifiable';
            if (score >= 0.6) return 'Mostly accurate with minor uncertainties';
            if (score >= 0.4) return 'Some factual concerns or unverified claims';
            if (score >= 0.2) return 'Significant factual inaccuracies';
            return 'Largely inaccurate or unverifiable';
        }
    },
    practical_implementability: {
        title: 'Practical Implementability',
        description: 'Measures how feasible it would be to implement or encounter such an incident in practice.',
        highExample: 'Incident involves realistic AI system deployment and usage patterns',
        lowExample: 'Requires unrealistic resources or impossible technical configurations',
        interpretation: (score: number) => {
            if (score >= 0.8) return 'Highly practical and feasible';
            if (score >= 0.6) return 'Practical with reasonable effort';
            if (score >= 0.4) return 'Somewhat challenging to implement';
            if (score >= 0.2) return 'Difficult and resource-intensive';
            return 'Impractical or impossible';
        }
    },
    contextual_relevance: {
        title: 'Contextual Relevance',
        description: 'Evaluates how applicable the incident is to your specific AI system and use case.',
        highExample: 'Similar technology stack, deployment environment, and user interactions',
        lowExample: 'Completely different domain, technology, or operational context',
        interpretation: (score: number) => {
            if (score >= 0.8) return 'Highly relevant to your context';
            if (score >= 0.6) return 'Moderately relevant with some similarities';
            if (score >= 0.4) return 'Limited relevance, some applicable aspects';
            if (score >= 0.2) return 'Low relevance, few similarities';
            return 'Not relevant to your context';
        }
    },
    exploitability: {
        title: 'Exploitability',
        description: 'Assesses the ease with which this type of incident could be triggered or exploited.',
        highExample: 'Simple user inputs or common scenarios can trigger the issue',
        lowExample: 'Requires sophisticated attacks or highly specific conditions',
        interpretation: (score: number) => {
            if (score >= 0.8) return 'Easily exploitable by anyone';
            if (score >= 0.6) return 'Exploitable with moderate effort';
            if (score >= 0.4) return 'Requires some technical knowledge';
            if (score >= 0.2) return 'Difficult to exploit, needs expertise';
            return 'Very difficult or impossible to exploit';
        }
    },
    impact_scale: {
        title: 'Impact Scale',
        description: 'Measures the severity and scope of potential harm from this type of incident.',
        highExample: 'Affects many users, causes significant harm, or has systemic implications',
        lowExample: 'Limited scope, minimal harm, or easily recoverable effects',
        interpretation: (score: number) => {
            if (score >= 0.8) return 'Severe, widespread impact';
            if (score >= 0.6) return 'Significant impact on multiple users';
            if (score >= 0.4) return 'Moderate impact, contained scope';
            if (score >= 0.2) return 'Minor impact, limited scope';
            return 'Minimal or no significant impact';
        }
    }
};

export const PrismScoreTooltip: React.FC<PrismScoreTooltipProps> = ({ 
    dimension, 
    score, 
    className = '' 
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const dimensionInfo = prismDimensions[dimension as keyof typeof prismDimensions];

    if (!dimensionInfo) return null;

    const scorePercentage = Math.round(score * 100);
    const interpretation = dimensionInfo.interpretation(score);

    return (
        <div className={`relative ${className}`}>
            <button
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
                <FiInfo size={14} />
            </button>

            {isVisible && (
                <div className="absolute z-50 left-0 top-6 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4 transform -translate-x-1/2">
                    {/* Arrow */}
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-gray-200 rotate-45"></div>
                    
                    {/* Header */}
                    <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{dimensionInfo.title}</h4>
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-indigo-600">{scorePercentage}%</span>
                                <div className={`w-3 h-3 rounded-full ${
                                    score >= 0.7 ? 'bg-green-500' :
                                    score >= 0.4 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                }`} />
                            </div>
                        </div>
                        <p className="text-sm text-gray-600">{dimensionInfo.description}</p>
                    </div>

                    {/* Score Interpretation */}
                    <div className="mb-3 p-2 bg-gray-50 rounded">
                        <p className="text-sm font-medium text-gray-900">{interpretation}</p>
                    </div>

                    {/* Visual Score Bar */}
                    <div className="mb-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    score >= 0.7 ? 'bg-green-500' :
                                    score >= 0.4 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                }`}
                                style={{ width: `${scorePercentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Examples */}
                    <div className="space-y-2">
                        <div className="p-2 bg-green-50 border border-green-200 rounded">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                <span className="text-xs font-medium text-green-800">High Score Example</span>
                            </div>
                            <p className="text-xs text-green-700">{dimensionInfo.highExample}</p>
                        </div>
                        <div className="p-2 bg-red-50 border border-red-200 rounded">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 bg-red-500 rounded-full" />
                                <span className="text-xs font-medium text-red-800">Low Score Example</span>
                            </div>
                            <p className="text-xs text-red-700">{dimensionInfo.lowExample}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}; 