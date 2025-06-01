import React, { useState } from 'react';
import { FiExternalLink, FiFileText, FiShield, FiGlobe, FiBookOpen, FiLink, FiChevronDown, FiChevronUp, FiCopy, FiCheck } from 'react-icons/fi';
import { SourceValidation } from './SourceValidation';

export interface IncidentLink {
    id: string;
    type: 'source' | 'related' | 'verification' | 'documentation' | 'news' | 'research';
    title: string;
    url: string;
    description?: string;
    domain?: string;
    date?: string;
    verified?: boolean;
    language?: string;
}

interface IncidentLinksProps {
    incidentId: number;
    links?: IncidentLink[];
    compact?: boolean;
    maxVisible?: number;
}

const LINK_TYPE_CONFIG = {
    source: {
        icon: FiFileText,
        label: 'Source Report',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
    },
    related: {
        icon: FiLink,
        label: 'Related Incident',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200'
    },
    verification: {
        icon: FiShield,
        label: 'Verification',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
    },
    documentation: {
        icon: FiBookOpen,
        label: 'Documentation',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
    },
    news: {
        icon: FiGlobe,
        label: 'News Coverage',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
    },
    research: {
        icon: FiBookOpen,
        label: 'Research Paper',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-200'
    }
};

// Mock data generator for demonstration
const generateMockLinks = (incidentId: number): IncidentLink[] => {
    const baseLinks = [
        {
            id: `${incidentId}-1`,
            type: 'source' as const,
            title: 'Original AI Incident Report',
            url: `https://incidentdatabase.ai/cite/${incidentId}`,
            description: 'Primary source documentation from the AI Incident Database',
            domain: 'incidentdatabase.ai',
            date: '2023-06-15',
            verified: true
        },
        {
            id: `${incidentId}-2`,
            type: 'verification' as const,
            title: 'Independent Verification Study',
            url: `https://arxiv.org/abs/2308.${incidentId.toString().padStart(4, '0')}`,
            description: 'Peer-reviewed analysis confirming incident details',
            domain: 'arxiv.org',
            date: '2023-07-20',
            verified: true
        },
        {
            id: `${incidentId}-3`,
            type: 'news' as const,
            title: 'Tech News Coverage',
            url: `https://techcrunch.com/ai-incident-${incidentId}`,
            description: 'Industry coverage and impact analysis',
            domain: 'techcrunch.com',
            date: '2023-06-16',
            verified: false
        },
        {
            id: `${incidentId}-4`,
            type: 'documentation' as const,
            title: 'Technical Documentation',
            url: `https://github.com/ai-safety/incident-${incidentId}`,
            description: 'Technical details and reproduction steps',
            domain: 'github.com',
            date: '2023-06-18',
            verified: true
        },
        {
            id: `${incidentId}-5`,
            type: 'related' as const,
            title: 'Similar Incident Case Study',
            url: `https://aiharm.org/case-study-${incidentId + 10}`,
            description: 'Related incident with similar technology stack',
            domain: 'aiharm.org',
            date: '2023-05-10',
            verified: true
        },
        {
            id: `${incidentId}-6`,
            type: 'research' as const,
            title: 'Research Analysis Paper',
            url: `https://papers.nips.cc/paper/ai-incident-analysis-${incidentId}`,
            description: 'Academic research on incident prevention',
            domain: 'papers.nips.cc',
            date: '2023-08-15',
            verified: true
        }
    ];

    // Return a subset based on incident ID for variety
    return baseLinks.slice(0, 3 + (incidentId % 4));
};

export const IncidentLinks: React.FC<IncidentLinksProps> = ({
    incidentId,
    links: providedLinks,
    compact = false,
    maxVisible = 3
}) => {
    const [showAll, setShowAll] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Use provided links or generate mock data
    const links = providedLinks || generateMockLinks(incidentId);
    
    const visibleLinks = showAll ? links : links.slice(0, maxVisible);
    const hasMore = links.length > maxVisible;

    const handleCopyLink = async (url: string, linkId: string) => {
        try {
            await navigator.clipboard.writeText(url);
            setCopiedId(linkId);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (error) {
            console.error('Failed to copy link:', error);
        }
    };

    const formatDomain = (url: string) => {
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return 'external';
        }
    };

    if (links.length === 0) {
        return (
            <div className="text-sm text-gray-500 italic">
                No external links available for this incident.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {!compact && (
                <div className="flex items-center gap-2 mb-3">
                    <FiExternalLink size={16} color="#6B7280" />
                    <h4 className="font-medium text-gray-900">External Sources</h4>
                    <span className="text-xs text-gray-500">({links.length} link{links.length === 1 ? '' : 's'})</span>
                </div>
            )}

            <div className="space-y-2">
                {visibleLinks.map((link) => {
                    const config = LINK_TYPE_CONFIG[link.type];
                    const IconComponent = config.icon;

                    return (
                        <div
                            key={link.id}
                            className={`group p-3 rounded-lg border ${config.borderColor} ${config.bgColor} hover:shadow-sm transition-all`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`p-1.5 rounded ${config.bgColor} ${config.color} flex-shrink-0 mt-0.5`}>
                                    <IconComponent size={14} />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <a
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`font-medium ${config.color} hover:underline truncate`}
                                                    title={link.title}
                                                >
                                                    {link.title}
                                                </a>
                                                {link.verified && (
                                                    <FiShield size={12} color="#10B981" title="Verified source" />
                                                )}
                                            </div>
                                            
                                            {link.description && !compact && (
                                                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                                    {link.description}
                                                </p>
                                            )}
                                            
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <span className={`inline-block w-2 h-2 rounded-full ${config.color.replace('text-', 'bg-')}`} />
                                                    {config.label}
                                                </span>
                                                <span>{formatDomain(link.url)}</span>
                                                {link.date && (
                                                    <span>{new Date(link.date).toLocaleDateString()}</span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleCopyLink(link.url, link.id)}
                                                className="p-1 rounded hover:bg-white/80 transition-colors"
                                                title="Copy link"
                                            >
                                                {copiedId === link.id ? (
                                                    <FiCheck size={12} color="#10B981" />
                                                ) : (
                                                    <FiCopy size={12} color="#6B7280" />
                                                )}
                                            </button>
                                            <a
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1 rounded hover:bg-white/80 transition-colors"
                                                title="Open in new tab"
                                            >
                                                <FiExternalLink size={12} color="#6B7280" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {hasMore && (
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                >
                    {showAll ? (
                        <>
                            <FiChevronUp size={16} />
                            Show Less
                        </>
                    ) : (
                        <>
                            <FiChevronDown size={16} />
                            Show {links.length - maxVisible} More Link{links.length - maxVisible === 1 ? '' : 's'}
                        </>
                    )}
                </button>
            )}

            {/* Enhanced source validation */}
            {!compact && links.length > 0 && (
                <div className="mt-4">
                    <SourceValidation links={links} showDetails={true} />
                </div>
            )}
        </div>
    );
}; 