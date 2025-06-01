import React from 'react';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';

interface PrismScoreComparisonProps {
    beforeScores: {
        logical_coherence: number;
        factual_accuracy: number;
        practical_implementability: number;
        contextual_relevance: number;
        uniqueness: number;
        impact_scale: number;
    };
    afterScores: {
        logical_coherence: number;
        factual_accuracy: number;
        practical_implementability: number;
        contextual_relevance: number;
        uniqueness: number;
        impact_scale: number;
    };
    userFeedback?: string;
    changedDimensions?: string[];
}

const PRISM_LABELS = {
    logical_coherence: 'Logical Coherence',
    factual_accuracy: 'Factual Accuracy',
    practical_implementability: 'Practical Implementability',
    contextual_relevance: 'Contextual Relevance',
    uniqueness: 'Uniqueness',
    impact_scale: 'Impact Scale'
};

const CHANGE_EXPLANATIONS = {
    logical_coherence: 'Updated based on your feedback about the logical flow of the incident',
    factual_accuracy: 'Adjusted considering your input on technical accuracy',
    practical_implementability: 'Modified based on your real-world implementation insights',
    contextual_relevance: 'Updated to reflect your product context better',
    uniqueness: 'Adjusted based on your knowledge of similar incidents',
    impact_scale: 'Modified considering your impact assessment feedback'
};

export const PrismScoreComparison: React.FC<PrismScoreComparisonProps> = ({
    beforeScores,
    afterScores,
    userFeedback,
    changedDimensions = []
}) => {
    const getDifference = (before: number, after: number) => {
        return after - before;
    };

    const getChangeIcon = (difference: number) => {
        if (Math.abs(difference) < 0.05) return <FiMinus color="#9CA3AF" size={14} />;
        if (difference > 0) return <FiTrendingUp color="#059669" size={14} />;
        return <FiTrendingDown color="#DC2626" size={14} />;
    };

    const getChangeColor = (difference: number) => {
        if (Math.abs(difference) < 0.05) return 'text-gray-500';
        if (difference > 0) return 'text-green-600';
        return 'text-red-600';
    };

    const hasSignificantChanges = Object.keys(beforeScores).some(key => {
        const before = beforeScores[key as keyof typeof beforeScores];
        const after = afterScores[key as keyof typeof afterScores];
        return Math.abs(after - before) >= 0.05;
    });

    if (!hasSignificantChanges) {
        return (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                    <FiMinus color="#2563EB" size={16} />
                    <h3 className="font-semibold text-blue-900">No Score Changes</h3>
                </div>
                <p className="text-sm text-blue-700">
                    Your feedback was valuable but didn't result in significant PRISM score changes. 
                    This could mean the current scores already align well with your assessment.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">PRISM Score Updates</h3>
                <p className="text-sm text-gray-600">
                    Based on your feedback, the following dimensions have been updated:
                </p>
                {userFeedback && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700 italic">"{userFeedback}"</p>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                {Object.entries(beforeScores).map(([key, beforeValue]) => {
                    const afterValue = afterScores[key as keyof typeof afterScores];
                    const difference = getDifference(beforeValue, afterValue);
                    const isChanged = Math.abs(difference) >= 0.05;
                    const isHighlighted = changedDimensions.includes(key);

                    return (
                        <div 
                            key={key} 
                            className={`p-4 rounded-lg border-2 transition-all ${
                                isHighlighted ? 'border-indigo-300 bg-indigo-50' : 
                                isChanged ? 'border-gray-200 bg-gray-50' : 
                                'border-gray-100 bg-white'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-gray-900">
                                    {PRISM_LABELS[key as keyof typeof PRISM_LABELS]}
                                </h4>
                                <div className="flex items-center gap-2">
                                    {getChangeIcon(difference)}
                                    <span className={`text-sm font-medium ${getChangeColor(difference)}`}>
                                        {difference > 0 ? '+' : ''}{Math.round(difference * 100)}%
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mb-3">
                                {/* Before Score */}
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs text-gray-500">Before</span>
                                        <span className="text-xs font-medium text-gray-700">
                                            {Math.round(beforeValue * 100)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="h-2 bg-gray-400 rounded-full transition-all duration-300"
                                            style={{ width: `${beforeValue * 100}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Arrow */}
                                <div className="flex-shrink-0 px-2">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </div>

                                {/* After Score */}
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs text-gray-500">After</span>
                                        <span className="text-xs font-medium text-gray-900">
                                            {Math.round(afterValue * 100)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-300 ${
                                                afterValue >= 0.7 ? 'bg-green-500' :
                                                afterValue >= 0.4 ? 'bg-yellow-500' :
                                                'bg-red-500'
                                            }`}
                                            style={{ width: `${afterValue * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Explanation for significant changes */}
                            {isChanged && (
                                <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                                    <p className="text-xs text-blue-700">
                                        <strong>Why this changed:</strong>{' '}
                                        {CHANGE_EXPLANATIONS[key as keyof typeof CHANGE_EXPLANATIONS]}
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Overall Impact Summary */}
            <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg">
                <h4 className="font-semibold text-indigo-900 mb-2">Impact Summary</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-indigo-700">
                            <strong>Dimensions Improved:</strong>{' '}
                            {Object.entries(beforeScores).filter(([key, beforeValue]) => {
                                const afterValue = afterScores[key as keyof typeof afterScores];
                                return afterValue > beforeValue + 0.05;
                            }).length}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-indigo-700">
                            <strong>Average Change:</strong>{' '}
                            {Math.round(
                                Object.entries(beforeScores).reduce((acc, [key, beforeValue]) => {
                                    const afterValue = afterScores[key as keyof typeof afterScores];
                                    return acc + Math.abs(afterValue - beforeValue);
                                }, 0) / Object.keys(beforeScores).length * 100
                            )}%
                        </p>
                    </div>
                </div>
                <p className="text-sm text-indigo-600 mt-2">
                    Your feedback helps improve the accuracy of future incident recommendations and scoring.
                </p>
            </div>
        </div>
    );
}; 