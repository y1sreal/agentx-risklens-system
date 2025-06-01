import React, { useState } from 'react';
import { FiShield, FiAlertTriangle, FiCheckCircle, FiInfo, FiExternalLink } from 'react-icons/fi';
import { IncidentLink } from '../types';

interface SourceValidationProps {
    links: IncidentLink[];
    showDetails?: boolean;
}

interface ValidationMetrics {
    credibilityScore: number;
    verificationLevel: 'high' | 'medium' | 'low';
    sourceQuality: 'excellent' | 'good' | 'fair' | 'poor';
    riskLevel: 'low' | 'medium' | 'high';
    warnings: string[];
    recommendations: string[];
}

const TRUSTED_DOMAINS = [
    'incidentdatabase.ai',
    'arxiv.org',
    'github.com',
    'ieee.org',
    'acm.org',
    'aiharm.org',
    'partnershiponai.org',
    'openai.com',
    'deepmind.com',
    'anthropic.com'
];

const NEWS_DOMAINS = [
    'techcrunch.com',
    'wired.com',
    'theverge.com',
    'arstechnica.com',
    'reuters.com',
    'bbc.com',
    'cnn.com'
];

const calculateValidationMetrics = (links: IncidentLink[]): ValidationMetrics => {
    if (links.length === 0) {
        return {
            credibilityScore: 0,
            verificationLevel: 'low',
            sourceQuality: 'poor',
            riskLevel: 'high',
            warnings: ['No sources available'],
            recommendations: ['Seek additional sources before making decisions']
        };
    }

    let credibilityScore = 0;
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Analyze each link
    links.forEach(link => {
        const domain = link.domain || '';
        
        // Base score from verification status
        if (link.verified) {
            credibilityScore += 20;
        } else {
            warnings.push(`Unverified source: ${link.title}`);
        }

        // Domain reputation scoring
        if (TRUSTED_DOMAINS.some(trusted => domain.includes(trusted))) {
            credibilityScore += 25;
        } else if (NEWS_DOMAINS.some(news => domain.includes(news))) {
            credibilityScore += 15;
        } else {
            credibilityScore += 5;
            warnings.push(`Unknown domain reputation: ${domain}`);
        }

        // Source type scoring
        switch (link.type) {
            case 'source':
                credibilityScore += 30; // Primary sources are most valuable
                break;
            case 'verification':
                credibilityScore += 25;
                break;
            case 'research':
                credibilityScore += 20;
                break;
            case 'documentation':
                credibilityScore += 15;
                break;
            case 'related':
                credibilityScore += 10;
                break;
            case 'news':
                credibilityScore += 5;
                break;
        }

        // Recency check
        if (link.date) {
            const date = new Date(link.date);
            const now = new Date();
            const ageInDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
            
            if (ageInDays > 365) {
                warnings.push(`Older source (${Math.round(ageInDays / 30)} months old): ${link.title}`);
            }
        }
    });

    // Normalize score (0-100)
    credibilityScore = Math.min(100, credibilityScore / links.length);

    // Determine verification level
    let verificationLevel: 'high' | 'medium' | 'low';
    if (credibilityScore >= 80) verificationLevel = 'high';
    else if (credibilityScore >= 60) verificationLevel = 'medium';
    else verificationLevel = 'low';

    // Determine source quality
    let sourceQuality: 'excellent' | 'good' | 'fair' | 'poor';
    if (credibilityScore >= 90) sourceQuality = 'excellent';
    else if (credibilityScore >= 75) sourceQuality = 'good';
    else if (credibilityScore >= 50) sourceQuality = 'fair';
    else sourceQuality = 'poor';

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high';
    if (credibilityScore >= 80 && warnings.length <= 1) riskLevel = 'low';
    else if (credibilityScore >= 60) riskLevel = 'medium';
    else riskLevel = 'high';

    // Generate recommendations
    if (links.filter(l => l.type === 'source').length === 0) {
        recommendations.push('Consider finding primary source documentation');
    }
    if (links.filter(l => l.verified).length < links.length * 0.5) {
        recommendations.push('Seek additional verified sources');
    }
    if (links.filter(l => l.type === 'verification').length === 0) {
        recommendations.push('Look for independent verification studies');
    }

    return {
        credibilityScore: Math.round(credibilityScore),
        verificationLevel,
        sourceQuality,
        riskLevel,
        warnings,
        recommendations
    };
};

export const SourceValidation: React.FC<SourceValidationProps> = ({
    links,
    showDetails = true
}) => {
    const [expanded, setExpanded] = useState(false);
    const metrics = calculateValidationMetrics(links);

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBg = (score: number) => {
        if (score >= 80) return 'bg-green-50 border-green-200';
        if (score >= 60) return 'bg-yellow-50 border-yellow-200';
        return 'bg-red-50 border-red-200';
    };

    const getRiskIcon = (riskLevel: string) => {
        switch (riskLevel) {
            case 'low': return <FiCheckCircle color="#10B981" size={16} />;
            case 'medium': return <FiAlertTriangle color="#F59E0B" size={16} />;
            case 'high': return <FiAlertTriangle color="#EF4444" size={16} />;
            default: return <FiInfo color="#6B7280" size={16} />;
        }
    };

    return (
        <div className={`p-4 rounded-lg border ${getScoreBg(metrics.credibilityScore)}`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <FiShield size={16} color="#6B7280" />
                    <h4 className="font-medium text-gray-900">Source Validation</h4>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`font-semibold ${getScoreColor(metrics.credibilityScore)}`}>
                        {metrics.credibilityScore}/100
                    </div>
                    {getRiskIcon(metrics.riskLevel)}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                    <span className="text-xs text-gray-500">Verification Level</span>
                    <p className={`text-sm font-medium ${getScoreColor(metrics.credibilityScore)}`}>
                        {metrics.verificationLevel.charAt(0).toUpperCase() + metrics.verificationLevel.slice(1)}
                    </p>
                </div>
                <div>
                    <span className="text-xs text-gray-500">Source Quality</span>
                    <p className={`text-sm font-medium ${getScoreColor(metrics.credibilityScore)}`}>
                        {metrics.sourceQuality.charAt(0).toUpperCase() + metrics.sourceQuality.slice(1)}
                    </p>
                </div>
            </div>

            {showDetails && (
                <div className="space-y-3">
                    {metrics.warnings.length > 0 && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                            <div className="flex items-center gap-2 mb-2">
                                <FiAlertTriangle size={14} color="#F59E0B" />
                                <span className="text-sm font-medium text-yellow-800">Warnings</span>
                            </div>
                            <ul className="text-xs text-yellow-700 space-y-1">
                                {metrics.warnings.map((warning, index) => (
                                    <li key={index}>• {warning}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {metrics.recommendations.length > 0 && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                            <div className="flex items-center gap-2 mb-2">
                                <FiInfo size={14} color="#3B82F6" />
                                <span className="text-sm font-medium text-blue-800">Recommendations</span>
                            </div>
                            <ul className="text-xs text-blue-700 space-y-1">
                                {metrics.recommendations.map((rec, index) => (
                                    <li key={index}>• {rec}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <span className="text-xs text-gray-500">
                            Based on {links.length} source{links.length === 1 ? '' : 's'}
                        </span>
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                        >
                            <FiExternalLink size={12} />
                            View Details
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}; 