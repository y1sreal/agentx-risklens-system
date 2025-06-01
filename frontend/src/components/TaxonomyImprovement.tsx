import React, { useState, useEffect } from 'react';
import { FiTarget, FiTrendingUp, FiChevronRight, FiInfo, FiCheck, FiX, FiAlertCircle, FiLayers } from 'react-icons/fi';
import { TaxonomyService, TaxonomyMatch, TaxonomyNode } from '../services/taxonomyService';

interface TaxonomyImprovementProps {
    technologies: string[];
    purposes: string[];
    onSuggestionApply?: (type: 'technology' | 'purpose', oldTerm: string, newTerm: string) => void;
    showHierarchy?: boolean;
}

interface ImprovementSuggestion {
    originalTerm: string;
    match: TaxonomyMatch;
    type: 'technology' | 'purpose';
    applied?: boolean;
    dismissed?: boolean;
}

export const TaxonomyImprovement: React.FC<TaxonomyImprovementProps> = ({
    technologies,
    purposes,
    onSuggestionApply,
    showHierarchy = true
}) => {
    const [suggestions, setSuggestions] = useState<ImprovementSuggestion[]>([]);
    const [qualityScore, setQualityScore] = useState<number>(0);
    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        const improvements = TaxonomyService.suggestImprovements(technologies, purposes);
        
        const newSuggestions: ImprovementSuggestion[] = [
            ...improvements.technologySuggestions.map((match, index) => ({
                originalTerm: technologies[index] || '',
                match,
                type: 'technology' as const
            })),
            ...improvements.purposeSuggestions.map((match, index) => ({
                originalTerm: purposes[index] || '',
                match,
                type: 'purpose' as const
            }))
        ];

        setSuggestions(newSuggestions);
        setQualityScore(improvements.qualityScore);
    }, [technologies, purposes]);

    const handleApplySuggestion = (suggestion: ImprovementSuggestion) => {
        if (onSuggestionApply) {
            onSuggestionApply(suggestion.type, suggestion.originalTerm, suggestion.match.node.name);
        }
        setSuggestions(prev => 
            prev.map(s => s === suggestion ? { ...s, applied: true } : s)
        );
    };

    const handleDismissSuggestion = (suggestion: ImprovementSuggestion) => {
        setSuggestions(prev => 
            prev.map(s => s === suggestion ? { ...s, dismissed: true } : s)
        );
    };

    const getQualityColor = (score: number) => {
        if (score >= 0.8) return 'text-green-600';
        if (score >= 0.6) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getQualityBg = (score: number) => {
        if (score >= 0.8) return 'bg-green-50 border-green-200';
        if (score >= 0.6) return 'bg-yellow-50 border-yellow-200';
        return 'bg-red-50 border-red-200';
    };

    const getMatchTypeColor = (matchType: string) => {
        switch (matchType) {
            case 'exact': return 'text-green-600 bg-green-100';
            case 'alias': return 'text-blue-600 bg-blue-100';
            case 'semantic': return 'text-purple-600 bg-purple-100';
            case 'partial': return 'text-orange-600 bg-orange-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getTaxonomyPath = (node: TaxonomyNode): TaxonomyNode[] => {
        return TaxonomyService.getNodePath(node.id, node.category as 'technology' | 'purpose');
    };

    const renderHierarchyPath = (node: TaxonomyNode) => {
        const path = getTaxonomyPath(node);
        
        return (
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                {path.map((pathNode, index) => (
                    <React.Fragment key={pathNode.id}>
                        {index > 0 && <FiChevronRight size={12} />}
                        <span className={`px-2 py-1 rounded ${
                            index === path.length - 1 ? 'bg-indigo-100 text-indigo-700 font-medium' : 'bg-gray-100'
                        }`}>
                            {pathNode.name}
                        </span>
                    </React.Fragment>
                ))}
            </div>
        );
    };

    const activeSuggestions = suggestions.filter(s => !s.applied && !s.dismissed);
    const appliedSuggestions = suggestions.filter(s => s.applied);

    return (
        <div className="space-y-4">
            {/* Quality Score Overview */}
            <div className={`p-4 rounded-lg border ${getQualityBg(qualityScore)}`}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <FiTarget size={16} />
                        <h4 className="font-medium text-gray-900">Taxonomy Quality Score</h4>
                    </div>
                    <div className={`text-xl font-bold ${getQualityColor(qualityScore)}`}>
                        {Math.round(qualityScore * 100)}/100
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <span className="text-gray-500">Status:</span>
                        <p className={`font-medium ${getQualityColor(qualityScore)}`}>
                            {qualityScore >= 0.8 ? 'Excellent' : 
                             qualityScore >= 0.6 ? 'Good' : 'Needs Improvement'}
                        </p>
                    </div>
                    <div>
                        <span className="text-gray-500">Suggestions:</span>
                        <p className="font-medium text-gray-900">{activeSuggestions.length} available</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Applied:</span>
                        <p className="font-medium text-indigo-600">{appliedSuggestions.length} improvements</p>
                    </div>
                </div>

                {qualityScore < 0.8 && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                        <div className="flex items-center gap-2 mb-1">
                            <FiInfo size={14} color="#3B82F6" />
                            <span className="text-sm font-medium text-blue-800">Recommendations</span>
                        </div>
                        <p className="text-xs text-blue-700">
                            {qualityScore < 0.6 
                                ? 'Consider reviewing and standardizing your technology and purpose terms using the suggestions below.'
                                : 'Your taxonomy is good but could benefit from some minor improvements for better matching.'
                            }
                        </p>
                    </div>
                )}
            </div>

            {/* Active Suggestions */}
            {activeSuggestions.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900 flex items-center gap-2">
                            <FiTrendingUp size={16} color="#059669" />
                            Improvement Suggestions
                        </h4>
                        <span className="text-sm text-gray-500">
                            {activeSuggestions.length} suggestion{activeSuggestions.length === 1 ? '' : 's'}
                        </span>
                    </div>

                    <div className="space-y-3">
                        {activeSuggestions.map((suggestion, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-500">Current:</span>
                                                <code className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                                                    {suggestion.originalTerm}
                                                </code>
                                            </div>
                                            <FiChevronRight size={14} color="#6B7280" />
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-green-600 font-medium">Suggested:</span>
                                                <code className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
                                                    {suggestion.match.node.name}
                                                </code>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMatchTypeColor(suggestion.match.matchType)}`}>
                                                {suggestion.match.matchType}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                Confidence: {Math.round(suggestion.match.confidence * 100)}%
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                Score: {Math.round(suggestion.match.score * 100)}%
                                            </span>
                                        </div>

                                        {suggestion.match.node.description && (
                                            <p className="text-sm text-gray-600 mb-2">
                                                {suggestion.match.node.description}
                                            </p>
                                        )}

                                        {showHierarchy && renderHierarchyPath(suggestion.match.node)}
                                    </div>

                                    <div className="flex items-center gap-2 ml-4">
                                        <button
                                            onClick={() => handleApplySuggestion(suggestion)}
                                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors flex items-center gap-1"
                                        >
                                            <FiCheck size={14} />
                                            Apply
                                        </button>
                                        <button
                                            onClick={() => handleDismissSuggestion(suggestion)}
                                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors flex items-center gap-1"
                                        >
                                            <FiX size={14} />
                                            Dismiss
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Applied Improvements */}
            {appliedSuggestions.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 flex items-center gap-2 mb-3">
                        <FiCheck size={16} />
                        Applied Improvements ({appliedSuggestions.length})
                    </h4>
                    <div className="space-y-2">
                        {appliedSuggestions.map((suggestion, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                                <span className="text-green-600">✓</span>
                                <span className="text-gray-600">
                                    "{suggestion.originalTerm}" → "{suggestion.match.node.name}"
                                </span>
                                <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">
                                    {suggestion.type}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* No Suggestions State */}
            {activeSuggestions.length === 0 && appliedSuggestions.length === 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                    <div className="mx-auto mb-3">
                        <FiLayers size={32} color="#9CA3AF" />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">No Improvements Suggested</h4>
                    <p className="text-sm text-gray-600">
                        Your current technology and purpose terms are well-matched with our taxonomy. 
                        Great job maintaining standardized terminology!
                    </p>
                </div>
            )}

            {/* Taxonomy Details Toggle */}
            <div className="flex justify-center">
                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                    <FiInfo size={14} />
                    {showDetails ? 'Hide' : 'Show'} Taxonomy Details
                </button>
            </div>

            {/* Detailed Taxonomy Information */}
            {showDetails && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-4">Current Terms Analysis</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Technologies */}
                        <div>
                            <h5 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                                Technologies ({technologies.length})
                            </h5>
                            <div className="space-y-2">
                                {technologies.map((tech, index) => {
                                    const matches = TaxonomyService.findTechnologyMatches(tech, 1);
                                    const bestMatch = matches[0];
                                    return (
                                        <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">{tech}</span>
                                                {bestMatch && (
                                                    <span className={`px-2 py-0.5 rounded text-xs ${
                                                        bestMatch.score >= 0.9 ? 'bg-green-100 text-green-700' :
                                                        bestMatch.score >= 0.7 ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                        {Math.round(bestMatch.score * 100)}% match
                                                    </span>
                                                )}
                                            </div>
                                            {bestMatch && bestMatch.matchType !== 'exact' && (
                                                <div className="mt-1 text-xs text-gray-600">
                                                    Closest match: {bestMatch.node.name}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Purposes */}
                        <div>
                            <h5 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                                <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                                Purposes ({purposes.length})
                            </h5>
                            <div className="space-y-2">
                                {purposes.map((purpose, index) => {
                                    const matches = TaxonomyService.findPurposeMatches(purpose, 1);
                                    const bestMatch = matches[0];
                                    return (
                                        <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">{purpose}</span>
                                                {bestMatch && (
                                                    <span className={`px-2 py-0.5 rounded text-xs ${
                                                        bestMatch.score >= 0.9 ? 'bg-green-100 text-green-700' :
                                                        bestMatch.score >= 0.7 ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                        {Math.round(bestMatch.score * 100)}% match
                                                    </span>
                                                )}
                                            </div>
                                            {bestMatch && bestMatch.matchType !== 'exact' && (
                                                <div className="mt-1 text-xs text-gray-600">
                                                    Closest match: {bestMatch.node.name}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}; 