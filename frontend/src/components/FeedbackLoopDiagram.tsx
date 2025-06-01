import React, { useState } from 'react';
import { FiDatabase, FiCpu, FiTarget, FiRefreshCw, FiPlay, FiPause } from 'react-icons/fi';

interface FeedbackLoopDiagramProps {
    isAnimated?: boolean;
    currentStep?: number;
    showDetails?: boolean;
}

interface Step {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;
    details: string[];
}

const steps: Step[] = [
    {
        id: 'retrieval',
        title: 'Retrieval',
        description: 'Find similar incidents from database',
        icon: FiDatabase,
        color: 'bg-blue-500',
        details: [
            'Search incident database using embeddings',
            'Filter by technology and domain relevance',
            'Rank by similarity scores',
            'Select top exemplars'
        ]
    },
    {
        id: 'prompting',
        title: 'Prompting',
        description: 'Generate AI analysis with context',
        icon: FiCpu,
        color: 'bg-purple-500',
        details: [
            'Inject exemplars into AI prompt',
            'Include product context and requirements',
            'Generate reasoning and explanations',
            'Apply structured analysis framework'
        ]
    },
    {
        id: 'scoring',
        title: 'Scoring',
        description: 'Calculate PRISM dimensions',
        icon: FiTarget,
        color: 'bg-green-500',
        details: [
            'Evaluate logical coherence',
            'Assess factual accuracy',
            'Check practical implementability',
            'Measure contextual relevance',
            'Rate uniqueness and impact scale'
        ]
    },
    {
        id: 'feedback',
        title: 'Feedback Update',
        description: 'Learn from user input',
        icon: FiRefreshCw,
        color: 'bg-orange-500',
        details: [
            'Collect user corrections and ratings',
            'Update exemplar rankings',
            'Adjust PRISM scoring weights',
            'Improve future recommendations'
        ]
    }
];

export const FeedbackLoopDiagram: React.FC<FeedbackLoopDiagramProps> = ({
    isAnimated = false,
    currentStep = 0,
    showDetails = false
}) => {
    const [selectedStep, setSelectedStep] = useState<number | null>(null);
    const [animationPlaying, setAnimationPlaying] = useState(isAnimated);

    const toggleAnimation = () => {
        setAnimationPlaying(!animationPlaying);
    };

    const getStepStatus = (index: number) => {
        if (animationPlaying) {
            const cycleStep = currentStep % (steps.length + 1);
            if (cycleStep === steps.length) return 'completed'; // All steps completed
            return index <= cycleStep ? 'active' : 'inactive';
        }
        return selectedStep === index ? 'selected' : 'default';
    };

    const getConnectionStyle = (index: number) => {
        const status = getStepStatus(index);
        const nextStatus = getStepStatus(index + 1);
        
        if (animationPlaying && (status === 'active' || status === 'completed') && 
            (nextStatus === 'active' || nextStatus === 'completed')) {
            return 'border-indigo-500 border-2';
        }
        return 'border-gray-300 border-dashed border-2';
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">AI Feedback Loop</h3>
                    <p className="text-sm text-gray-600">How the system learns from your input</p>
                </div>
                <button
                    onClick={toggleAnimation}
                    className="flex items-center gap-2 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                >
                    {animationPlaying ? <FiPause size={16} /> : <FiPlay size={16} />}
                    {animationPlaying ? 'Pause' : 'Play'}
                </button>
            </div>

            {/* Main Diagram */}
            <div className="relative">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => {
                        const status = getStepStatus(index);
                        const IconComponent = step.icon;
                        
                        return (
                            <div key={step.id} className="relative">
                                {/* Step Circle */}
                                <div
                                    className={`relative mx-auto w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${
                                        status === 'active' ? `${step.color} shadow-lg scale-110` :
                                        status === 'completed' ? `${step.color} opacity-75` :
                                        status === 'selected' ? 'bg-gray-700 shadow-lg' :
                                        'bg-gray-200 hover:bg-gray-300'
                                    }`}
                                    onClick={() => setSelectedStep(selectedStep === index ? null : index)}
                                >
                                    <IconComponent 
                                        size={24} 
                                        color={status === 'inactive' ? '#6B7280' : '#FFFFFF'} 
                                    />
                                    
                                    {/* Pulse animation for active step */}
                                    {status === 'active' && animationPlaying && (
                                        <div className={`absolute inset-0 rounded-full ${step.color} opacity-30 animate-ping`} />
                                    )}
                                </div>

                                {/* Step Label */}
                                <div className="mt-4 text-center">
                                    <h4 className={`font-medium ${
                                        status === 'active' ? 'text-gray-900' : 'text-gray-700'
                                    }`}>
                                        {step.title}
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-1 max-w-32 mx-auto">
                                        {step.description}
                                    </p>
                                </div>

                                {/* Connection Arrow */}
                                {index < steps.length - 1 && (
                                    <div className="hidden lg:block absolute top-8 left-full w-8 h-0.5 transform -translate-y-1/2">
                                        <div className={`w-full h-0.5 ${getConnectionStyle(index)} transition-all duration-300`} />
                                        <div className={`absolute right-0 top-0 transform -translate-y-1/2 w-2 h-2 border-r-2 border-b-2 rotate-45 ${
                                            getConnectionStyle(index).includes('indigo') ? 'border-indigo-500' : 'border-gray-300'
                                        }`} />
                                    </div>
                                )}

                                {/* Feedback Loop Arrow (from last to first step) */}
                                {index === steps.length - 1 && (
                                    <div className="hidden lg:block absolute top-20 left-1/2 transform -translate-x-1/2">
                                        <div className="flex items-center text-xs text-gray-500">
                                            <div className={`w-32 h-px border-t-2 border-dashed ${
                                                getStepStatus(0) === 'active' || animationPlaying ? 'border-indigo-500' : 'border-gray-300'
                                            }`} />
                                            <FiRefreshCw size={16} color="#6B7280" />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 text-center">Continuous Learning</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Step Details */}
            {(selectedStep !== null || showDetails) && (
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">
                        {selectedStep !== null ? steps[selectedStep].title : 'Process Details'}
                    </h4>
                    {selectedStep !== null ? (
                        <div>
                            <p className="text-sm text-gray-700 mb-3">{steps[selectedStep].description}</p>
                            <ul className="space-y-2">
                                {steps[selectedStep].details.map((detail, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0" />
                                        <span className="text-sm text-gray-600">{detail}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {steps.map((step, index) => (
                                <div key={step.id} className="p-3 bg-white rounded border">
                                    <h5 className="font-medium text-gray-900 mb-2">{step.title}</h5>
                                    <p className="text-xs text-gray-600">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Legend */}
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full" />
                    <span>Active Step</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full" />
                    <span>Completed</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-200 rounded-full" />
                    <span>Pending</span>
                </div>
                <div className="flex items-center gap-2">
                    <FiRefreshCw size={12} color="#6B7280" />
                    <span>Continuous feedback loop</span>
                </div>
            </div>
        </div>
    );
}; 