import React, { useState, useEffect } from 'react';
import { FiChevronRight, FiChevronLeft, FiX, FiSearch, FiCheck, FiSettings, FiTarget, FiUnlock, FiBarChart2, FiInfo, FiLayers, FiZap } from 'react-icons/fi';

interface PrismOnboardingProps {
    onClose: () => void;
}

const prismSteps = [
    {
        id: 'intro',
        title: 'Welcome to RiskLens',
        subtitle: 'Understand AI incident risks through multi-dimensional scoring',
        icon: FiLayers,
        description: 'RiskLens helps you evaluate AI incidents across six key dimensions, providing comprehensive risk assessment.',
        animation: 'fadeInUp'
    },
    {
        id: 'logical_coherence',
        title: 'Logical Coherence',
        subtitle: 'Does the incident make logical sense?',
        icon: FiSettings,
        description: 'Evaluates whether the incident description is internally consistent and follows logical reasoning patterns.',
        examples: {
            high: 'Clear cause-and-effect relationship between AI system behavior and outcome',
            low: 'Contradictory or impossible sequence of events described'
        },
        animation: 'slideInLeft'
    },
    {
        id: 'factual_accuracy',
        title: 'Factual Accuracy',
        subtitle: 'Are the technical details correct?',
        icon: FiCheck,
        description: 'Assesses the technical correctness and verifiability of claims made in the incident report.',
        examples: {
            high: 'Specific technical details that can be verified and are consistent with known systems',
            low: 'Vague or technically impossible claims about AI system capabilities'
        },
        animation: 'slideInRight'
    },
    {
        id: 'practical_implementability',
        title: 'Practical Implementability',
        subtitle: 'Could this realistically happen?',
        icon: FiTarget,
        description: 'Measures how feasible it would be to implement or encounter such an incident in practice.',
        examples: {
            high: 'Incident involves realistic AI system deployment and usage patterns',
            low: 'Requires unrealistic resources or impossible technical configurations'
        },
        animation: 'slideInLeft'
    },
    {
        id: 'contextual_relevance',
        title: 'Contextual Relevance',
        subtitle: 'How relevant is this to your product?',
        icon: FiSearch,
        description: 'Evaluates how applicable the incident is to your specific AI system and use case.',
        examples: {
            high: 'Similar technology stack, deployment environment, and user interactions',
            low: 'Completely different domain, technology, or operational context'
        },
        animation: 'slideInRight'
    },
    {
        id: 'exploitability',
        title: 'Exploitability',
        subtitle: 'How easy is it to exploit this vulnerability?',
        icon: FiUnlock,
        description: 'Assesses the ease with which this type of incident could be triggered or exploited.',
        examples: {
            high: 'Simple user inputs or common scenarios can trigger the issue',
            low: 'Requires sophisticated attacks or highly specific conditions'
        },
        animation: 'slideInLeft'
    },
    {
        id: 'impact_scale',
        title: 'Impact Scale',
        subtitle: 'What are the potential consequences?',
        icon: FiBarChart2,
        description: 'Measures the severity and scope of potential harm from this type of incident.',
        examples: {
            high: 'Affects many users, causes significant harm, or has systemic implications',
            low: 'Limited scope, minimal harm, or easily recoverable effects'
        },
        animation: 'slideInRight'
    },
    {
        id: 'summary',
        title: 'You\'re Ready!',
        subtitle: 'Start analyzing incidents with PRISM',
        icon: FiZap,
        description: 'Use these dimensions to evaluate incidents and provide feedback that improves recommendations.',
        animation: 'bounceIn'
    }
];

export const PrismOnboarding: React.FC<PrismOnboardingProps> = ({ onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [animationKey, setAnimationKey] = useState(0);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    useEffect(() => {
        setAnimationKey(prev => prev + 1);
    }, [currentStep]);

    const handleNext = () => {
        if (currentStep < prismSteps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleClose();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    const handleSkip = () => {
        localStorage.setItem('prism-onboarding-skipped', 'true');
        handleClose();
    };

    const currentStepData = prismSteps[currentStep];
    const IconComponent = currentStepData.icon;

    return (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-500 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
                {/* Progress bar */}
                <div className="h-2 bg-gray-100 relative overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 ease-out"
                        style={{ width: `${((currentStep + 1) / prismSteps.length) * 100}%` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse" />
                </div>

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{currentStep + 1}</span>
                            <span>/</span>
                            <span>{prismSteps.length}</span>
                        </div>
                        <div className="h-4 w-px bg-gray-300" />
                        <span className="text-sm font-medium text-gray-700">PRISM Onboarding</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSkip}
                            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors"
                        >
                            Skip Tour
                        </button>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <FiX size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div key={animationKey} className={`animate-${currentStepData.animation}`}>
                        {/* Icon and Title */}
                        <div className="text-center mb-8">
                            <div className="relative inline-block">
                                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 mx-auto transform hover:scale-105 transition-transform duration-200">
                                    <IconComponent size={32} color="white" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                    <span className="text-xs text-white font-bold">{currentStep + 1}</span>
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentStepData.title}</h2>
                            <p className="text-lg text-indigo-600 font-medium">{currentStepData.subtitle}</p>
                        </div>

                        {/* Description */}
                        <div className="bg-gray-50 rounded-xl p-6 mb-6">
                            <p className="text-gray-700 leading-relaxed text-center">{currentStepData.description}</p>
                        </div>

                        {/* Examples (if available) */}
                        {currentStepData.examples && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                                        <span className="text-sm font-medium text-green-800">High Score Example</span>
                                    </div>
                                    <p className="text-sm text-green-700">{currentStepData.examples.high}</p>
                                </div>
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full" />
                                        <span className="text-sm font-medium text-red-800">Low Score Example</span>
                                    </div>
                                    <p className="text-sm text-red-700">{currentStepData.examples.low}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center p-6 bg-gray-50 border-t border-gray-100">
                    <button
                        onClick={handlePrev}
                        disabled={currentStep === 0}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                            currentStep === 0
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                        }`}
                    >
                        <FiChevronLeft size={16} />
                        Previous
                    </button>

                    <div className="flex items-center gap-2">
                        {prismSteps.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentStep(index)}
                                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                                    index === currentStep
                                        ? 'bg-indigo-600 scale-125'
                                        : index < currentStep
                                        ? 'bg-indigo-300'
                                        : 'bg-gray-300'
                                }`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={handleNext}
                        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                        {currentStep === prismSteps.length - 1 ? 'Get Started' : 'Next'}
                        <FiChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}; 