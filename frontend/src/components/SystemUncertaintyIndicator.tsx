import React, { useState, useCallback } from 'react';
import { FiAlertTriangle, FiInfo, FiHelpCircle, FiEye } from 'react-icons/fi';
import { Incident } from '../types';

interface SystemUncertaintyIndicatorProps {
    incident: Incident;
    mode: 'none' | 'generic' | 'prism';
    similarity_score?: number;
    explanationMode?: string;
}

interface UncertaintyMetrics {
    overall_confidence: number;
    confidence_breakdown: {
        similarity_matching: number;
        prism_scoring: number;
        risk_assessment: number;
        context_understanding: number;
    };
    uncertainty_flags: {
        low_data_quality: boolean;
        conflicting_signals: boolean;
        edge_case: boolean;
        model_limitation: boolean;
    };
    needs_human_review: boolean;
}

const calculateUncertaintyMetrics = (incident: Incident, mode: string, similarity_score?: number): UncertaintyMetrics => {
    // Simulate uncertainty calculation based on various factors
    let confidence_breakdown = {
        similarity_matching: similarity_score || 0.5,
        prism_scoring: 0.7,
        risk_assessment: 0.6,
        context_understanding: 0.8
    };

    // Adjust confidence based on mode
    switch (mode) {
        case 'none':
            confidence_breakdown.prism_scoring = 0.3; // Low PRISM confidence in basic mode
            confidence_breakdown.context_understanding = 0.5;
            break;
        case 'generic':
            confidence_breakdown.prism_scoring = 0.6;
            confidence_breakdown.context_understanding = 0.7;
            break;
        case 'prism':
            confidence_breakdown.prism_scoring = 0.9;
            confidence_breakdown.context_understanding = 0.9;
            break;
    }

    // Check for data quality issues
    const prism_scores = incident.prism_scores;
    const low_data_quality = !prism_scores || Object.values(prism_scores).some(score => score < 0.2);
    const conflicting_signals = prism_scores ? 
        (prism_scores.logical_coherence > 0.8 && prism_scores.factual_accuracy < 0.3) ||
        (prism_scores.contextual_relevance > 0.8 && (similarity_score || 0) < 0.3) : false;
    
    // Detect edge cases
    const edge_case = incident.technologies.length === 0 || 
                     incident.description.length < 50 ||
                     incident.risk_level === 'high' && (similarity_score || 0) < 0.4;
    
    // Model limitations in certain domains
    const model_limitation = incident.risk_domain.toLowerCase().includes('safety') && mode === 'none';

    const uncertainty_flags = {
        low_data_quality,
        conflicting_signals,
        edge_case,
        model_limitation
    };

    // Calculate overall confidence
    const base_confidence = Object.values(confidence_breakdown).reduce((a, b) => a + b, 0) / 4;
    const penalty = Object.values(uncertainty_flags).filter(Boolean).length * 0.15;
    const overall_confidence = Math.max(0.1, base_confidence - penalty);

    const needs_human_review = overall_confidence < 0.5 || 
                              Object.values(uncertainty_flags).filter(Boolean).length >= 2;

    return {
        overall_confidence,
        confidence_breakdown,
        uncertainty_flags,
        needs_human_review
    };
};

export const SystemUncertaintyIndicator: React.FC<SystemUncertaintyIndicatorProps> = ({
    incident,
    mode,
    similarity_score,
    explanationMode
}) => {
    const metrics = calculateUncertaintyMetrics(incident, mode, similarity_score);
    
    // Use the actual confidence score from the incident instead of calculated metrics
    const actualConfidenceScore = incident.confidence_score || 0;
    
    // State for showing/hiding details - use incident ID to ensure uniqueness
    const [showDetails, setShowDetails] = useState(false);
    
    // Memoized toggle function to ensure proper isolation
    const toggleDetails = useCallback(() => {
        setShowDetails(prev => !prev);
    }, []);
    
    // Get the reasoning from the incident based on the explanation mode
    const reasoning = explanationMode === 'prism' 
        ? incident.prism_reasoning || 'No PRISM reasoning available'
        : incident.generic_reasoning || 'No generic reasoning available';

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
        if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        if (confidence >= 0.4) return 'text-orange-600 bg-orange-50 border-orange-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    const getConfidenceLabel = (confidence: number) => {
        if (confidence >= 0.8) return 'High Confidence';
        if (confidence >= 0.6) return 'Medium Confidence';
        if (confidence >= 0.4) return 'Low Confidence';
        return 'Very Low Confidence';
    };

    return (
        <div className="space-y-3">
            {/* Main Confidence Indicator */}
            <div className={`p-3 rounded-lg border-2 ${getConfidenceColor(actualConfidenceScore)}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {actualConfidenceScore < 0.5 ? (
                            <FiAlertTriangle size={16} />
                        ) : actualConfidenceScore < 0.8 ? (
                            <FiHelpCircle size={16} />
                        ) : (
                            <FiEye size={16} />
                        )}
                        <span className="font-medium text-sm">
                            {getConfidenceLabel(actualConfidenceScore)}
                        </span>
                        <span className="text-xs opacity-75">
                            ({Math.round(actualConfidenceScore * 100)}%)
                        </span>
                        <button
                            onClick={toggleDetails}
                            className="ml-2 text-xs underline hover:no-underline opacity-75 hover:opacity-100 transition-opacity"
                        >
                            {showDetails ? 'Hide Details' : 'Show Details'}
                        </button>
                    </div>
                </div>

                {/* Show reasoning details when toggled */}
                {showDetails && (
                    <div className="mt-3 p-3 bg-white bg-opacity-70 rounded border text-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <FiInfo size={14} />
                            <span className="font-medium">
                                {explanationMode === 'prism' ? 'PRISM Analysis' : 'AI Analysis'} Reasoning:
                            </span>
                        </div>
                        <p className="text-xs leading-relaxed">
                            {reasoning}
                        </p>
                    </div>
                )}

                {/* Quick uncertainty flags */}
                {Object.values(metrics.uncertainty_flags).some(Boolean) && (
                    <div className="mt-2 flex flex-wrap gap-1">
                        {metrics.uncertainty_flags.low_data_quality && (
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                                Low data quality
                            </span>
                        )}
                        {metrics.uncertainty_flags.conflicting_signals && (
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded">
                                Conflicting signals
                            </span>
                        )}
                        {metrics.uncertainty_flags.edge_case && (
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">
                                Edge case
                            </span>
                        )}
                        {metrics.uncertainty_flags.model_limitation && (
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                                Model limitation
                            </span>
                        )}
                    </div>
                )}

                {/* Human review needed */}
                {actualConfidenceScore < 0.5 && (
                    <div className="mt-2 p-2 bg-white bg-opacity-50 rounded border">
                        <div className="flex items-center gap-2">
                            <FiAlertTriangle size={14} color="#DC2626" />
                            <span className="text-sm font-medium">Human review recommended</span>
                        </div>
                        <p className="text-xs mt-1 opacity-75">
                            This recommendation has low confidence and would benefit from expert validation.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}; 