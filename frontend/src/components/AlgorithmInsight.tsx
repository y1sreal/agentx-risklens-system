import React, { useState } from 'react';
import { FiInfo, FiAlertTriangle, FiCpu, FiEye, FiX } from 'react-icons/fi';
import { SystemTransparencyService, AlgorithmExplanation } from '../services/systemTransparencyService';

interface AlgorithmInsightProps {
    algorithmId: string;
    showDecisionTrace?: boolean;
    compact?: boolean;
    onViewFullTransparency?: () => void;
    onDismiss?: () => void;
}

export const AlgorithmInsight: React.FC<AlgorithmInsightProps> = ({
    algorithmId,
    showDecisionTrace = false,
    compact = false,
    onViewFullTransparency,
    onDismiss
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const algorithm = SystemTransparencyService.getAlgorithmExplanation(algorithmId);

    if (!algorithm) {
        return null;
    }

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
        if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-orange-600 bg-orange-50 border-orange-200';
    };

    const renderCompactView = () => (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className="text-blue-600"><FiCpu size={16} /></div>
                    <h4 className="font-medium text-blue-900">Algorithm: {algorithm.name}</h4>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        {showDetails ? 'Hide' : 'Info'}
                    </button>
                    {onDismiss && (
                        <button
                            onClick={onDismiss}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <FiX size={14} />
                        </button>
                    )}
                </div>
            </div>
            
            <p className="text-sm text-blue-800 mb-3">{algorithm.description}</p>
            
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs">
                    <span className={`px-2 py-1 rounded border ${getConfidenceColor(algorithm.confidence)}`}>
                        Confidence: {Math.round(algorithm.confidence * 100)}%
                    </span>
                    <span className="text-blue-700">
                        Type: {algorithm.type}
                    </span>
                </div>
                {onViewFullTransparency && (
                    <button
                        onClick={onViewFullTransparency}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                        <FiEye size={14} />
                        Full Transparency
                    </button>
                )}
            </div>

            {showDetails && (
                <div className="mt-4 pt-4 border-t border-blue-200 space-y-3">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-3 text-xs">
                        <div className="text-center p-2 bg-blue-100 rounded">
                            <div className="font-medium text-blue-900">{algorithm.inputFactors.length}</div>
                            <div className="text-blue-700">Input Factors</div>
                        </div>
                        <div className="text-center p-2 bg-blue-100 rounded">
                            <div className="font-medium text-blue-900">{algorithm.limitations.length}</div>
                            <div className="text-blue-700">Limitations</div>
                        </div>
                        <div className="text-center p-2 bg-blue-100 rounded">
                            <div className="font-medium text-blue-900">{algorithm.biases.length}</div>
                            <div className="text-blue-700">Known Biases</div>
                        </div>
                    </div>

                    {/* Top Limitations */}
                    {algorithm.limitations.length > 0 && (
                        <div>
                            <h5 className="font-medium text-blue-900 mb-2 flex items-center gap-1">
                                <FiAlertTriangle size={14} />
                                Key Limitations
                            </h5>
                            <div className="space-y-1">
                                {algorithm.limitations.slice(0, 2).map((limitation, index) => (
                                    <div key={index} className="text-xs text-orange-700 bg-orange-50 p-2 rounded">
                                        • {limitation}
                                    </div>
                                ))}
                                {algorithm.limitations.length > 2 && (
                                    <div className="text-xs text-blue-600 text-center">
                                        +{algorithm.limitations.length - 2} more limitations
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    const renderFullView = () => (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="text-indigo-600"><FiCpu size={20} /></div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{algorithm.name}</h3>
                        <p className="text-sm text-gray-600">{algorithm.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(algorithm.confidence)}`}>
                        {Math.round(algorithm.confidence * 100)}% Confidence
                    </span>
                    {onDismiss && (
                        <button
                            onClick={onDismiss}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <FiX size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Methodology */}
            <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-2">How It Works</h4>
                <p className="text-sm text-gray-600 mb-3">{algorithm.methodology}</p>
                <div className="text-xs text-gray-500">
                    Output: {algorithm.outputFormat} • Updated: {algorithm.lastUpdated}
                </div>
            </div>

            {/* Input Factors */}
            <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-3">Input Factors</h4>
                <div className="space-y-2">
                    {algorithm.inputFactors.map((factor, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div className="flex-1">
                                <div className="font-medium text-gray-900 text-sm">{factor.name}</div>
                                <div className="text-xs text-gray-600">{factor.description}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">
                                    {Math.round(factor.weight * 100)}%
                                </div>
                                <div className={`text-xs px-2 py-1 rounded ${
                                    factor.impact === 'high' ? 'bg-red-100 text-red-700' :
                                    factor.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-green-100 text-green-700'
                                }`}>
                                    {factor.impact}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Limitations and Biases */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                        <FiAlertTriangle size={16} color="#F59E0B" />
                        Limitations
                    </h4>
                    <div className="space-y-2">
                        {algorithm.limitations.map((limitation, index) => (
                            <div key={index} className="text-sm text-orange-700 bg-orange-50 p-3 rounded">
                                • {limitation}
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                        <FiInfo size={16} color="#EF4444" />
                        Potential Biases
                    </h4>
                    <div className="space-y-2">
                        {algorithm.biases.map((bias, index) => (
                            <div key={index} className="text-sm text-red-700 bg-red-50 p-3 rounded">
                                • {bias}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Data Requirements */}
            <div className="mb-4">
                <h4 className="font-medium text-gray-800 mb-2">Data Requirements</h4>
                <div className="flex flex-wrap gap-2">
                    {algorithm.dataRequirements.map((requirement, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {requirement}
                        </span>
                    ))}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                    Update frequency: {algorithm.updateFrequency}
                </div>
            </div>

            {/* Actions */}
            {onViewFullTransparency && (
                <div className="flex justify-center pt-4 border-t border-gray-200">
                    <button
                        onClick={onViewFullTransparency}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm flex items-center gap-2"
                    >
                        <FiEye size={16} />
                        View Full System Transparency
                    </button>
                </div>
            )}
        </div>
    );

    if (compact) {
        return renderCompactView();
    }

    return renderFullView();
}; 