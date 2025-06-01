import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiX, FiChevronDown, FiChevronRight, FiTag } from 'react-icons/fi';
import { TaxonomyService, TaxonomyNode, TaxonomyMatch } from '../services/taxonomyService';
import { Incident } from '../types';

interface TaxonomyFilterPanelProps {
    incidents: Incident[];
    onFilterChange: (filteredIncidents: Incident[]) => void;
    showAdvanced?: boolean;
}

interface FilterState {
    searchTerm: string;
    selectedTechnologies: Set<string>;
    selectedPurposes: Set<string>;
    technologyCategories: Set<string>;
    purposeCategories: Set<string>;
    similarityThreshold: number;
    useSemanticMatching: boolean;
}

export const TaxonomyFilterPanel: React.FC<TaxonomyFilterPanelProps> = ({
    incidents,
    onFilterChange,
    showAdvanced = false
}) => {
    const [filterState, setFilterState] = useState<FilterState>({
        searchTerm: '',
        selectedTechnologies: new Set(),
        selectedPurposes: new Set(),
        technologyCategories: new Set(),
        purposeCategories: new Set(),
        similarityThreshold: 0.7,
        useSemanticMatching: true
    });

    const [technologySuggestions, setTechnologySuggestions] = useState<TaxonomyMatch[]>([]);
    const [purposeSuggestions, setPurposeSuggestions] = useState<TaxonomyMatch[]>([]);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Extract unique technologies and purposes from incidents
    const [availableTechnologies, setAvailableTechnologies] = useState<string[]>([]);
    const [availablePurposes, setAvailablePurposes] = useState<string[]>([]);

    useEffect(() => {
        // Extract all unique technologies and purposes from incidents
        const techSet = new Set<string>();
        const purposeSet = new Set<string>();

        incidents.forEach(incident => {
            incident.technologies.forEach(tech => techSet.add(tech));
            // Assume purposes might be derived from ethical_issues or other fields
            incident.ethical_issues?.forEach(issue => purposeSet.add(issue));
        });

        setAvailableTechnologies(Array.from(techSet));
        setAvailablePurposes(Array.from(purposeSet));
    }, [incidents]);

    useEffect(() => {
        if (filterState.searchTerm.length > 2) {
            const techMatches = TaxonomyService.findTechnologyMatches(filterState.searchTerm, 5);
            const purposeMatches = TaxonomyService.findPurposeMatches(filterState.searchTerm, 5);
            
            setTechnologySuggestions(techMatches);
            setPurposeSuggestions(purposeMatches);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    }, [filterState.searchTerm]);

    useEffect(() => {
        applyFilters();
    }, [filterState, incidents]);

    const applyFilters = () => {
        let filtered = [...incidents];

        // Text search with semantic matching
        if (filterState.searchTerm) {
            filtered = filtered.filter(incident => {
                const searchLower = filterState.searchTerm.toLowerCase();
                
                // Direct text match
                const directMatch = incident.title.toLowerCase().includes(searchLower) ||
                                  incident.description.toLowerCase().includes(searchLower) ||
                                  incident.technologies.some(tech => tech.toLowerCase().includes(searchLower));

                if (directMatch) return true;

                // Semantic matching if enabled
                if (filterState.useSemanticMatching) {
                    const techSimilarity = TaxonomyService.calculateSimilarity(
                        [filterState.searchTerm],
                        incident.technologies
                    );
                    
                    return techSimilarity >= filterState.similarityThreshold;
                }

                return false;
            });
        }

        // Technology filters
        if (filterState.selectedTechnologies.size > 0) {
            filtered = filtered.filter(incident => {
                return incident.technologies.some(tech => {
                    // Direct match
                    if (filterState.selectedTechnologies.has(tech)) return true;
                    
                    // Semantic match
                    if (filterState.useSemanticMatching) {
                        const matches = TaxonomyService.findTechnologyMatches(tech, 1);
                        if (matches.length > 0) {
                            const selectedArray = Array.from(filterState.selectedTechnologies);
                            return selectedArray.some(selectedTech => {
                                const selectedMatches = TaxonomyService.findTechnologyMatches(selectedTech, 1);
                                return selectedMatches.some(sm => 
                                    matches.some(m => m.node.id === sm.node.id || 
                                                    m.node.parent === sm.node.parent)
                                );
                            });
                        }
                    }
                    
                    return false;
                });
            });
        }

        // Purpose filters (if available)
        if (filterState.selectedPurposes.size > 0) {
            filtered = filtered.filter(incident => {
                const incidentPurposes = incident.ethical_issues || [];
                return incidentPurposes.some(purpose => {
                    if (filterState.selectedPurposes.has(purpose)) return true;
                    
                    if (filterState.useSemanticMatching) {
                        const matches = TaxonomyService.findPurposeMatches(purpose, 1);
                        if (matches.length > 0) {
                            const selectedArray = Array.from(filterState.selectedPurposes);
                            return selectedArray.some(selectedPurpose => {
                                const selectedMatches = TaxonomyService.findPurposeMatches(selectedPurpose, 1);
                                return selectedMatches.some(sm => 
                                    matches.some(m => m.node.id === sm.node.id)
                                );
                            });
                        }
                    }
                    
                    return false;
                });
            });
        }

        onFilterChange(filtered);
    };

    const handleTechnologyToggle = (tech: string) => {
        setFilterState(prev => {
            const newSelected = new Set(prev.selectedTechnologies);
            if (newSelected.has(tech)) {
                newSelected.delete(tech);
            } else {
                newSelected.add(tech);
            }
            return { ...prev, selectedTechnologies: newSelected };
        });
    };

    const handlePurposeToggle = (purpose: string) => {
        setFilterState(prev => {
            const newSelected = new Set(prev.selectedPurposes);
            if (newSelected.has(purpose)) {
                newSelected.delete(purpose);
            } else {
                newSelected.add(purpose);
            }
            return { ...prev, selectedPurposes: newSelected };
        });
    };

    const addSuggestion = (match: TaxonomyMatch, type: 'technology' | 'purpose') => {
        if (type === 'technology') {
            handleTechnologyToggle(match.node.name);
        } else {
            handlePurposeToggle(match.node.name);
        }
        setFilterState(prev => ({ ...prev, searchTerm: '' }));
        setShowSuggestions(false);
    };

    const clearAllFilters = () => {
        setFilterState({
            searchTerm: '',
            selectedTechnologies: new Set(),
            selectedPurposes: new Set(),
            technologyCategories: new Set(),
            purposeCategories: new Set(),
            similarityThreshold: 0.7,
            useSemanticMatching: true
        });
    };

    const hasActiveFilters = filterState.searchTerm || 
                           filterState.selectedTechnologies.size > 0 || 
                           filterState.selectedPurposes.size > 0;

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <FiFilter size={16} />
                    Smart Taxonomy Filters
                </h3>
                {hasActiveFilters && (
                    <button
                        onClick={clearAllFilters}
                        className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                    >
                        <FiX size={14} />
                        Clear All
                    </button>
                )}
            </div>

            {/* Search with Suggestions */}
            <div className="relative">
                <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <FiSearch size={16} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search technologies, purposes, or concepts..."
                        value={filterState.searchTerm}
                        onChange={(e) => setFilterState(prev => ({ ...prev, searchTerm: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                {/* Search Suggestions */}
                {showSuggestions && (technologySuggestions.length > 0 || purposeSuggestions.length > 0) && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                        {technologySuggestions.length > 0 && (
                            <div className="p-2">
                                <div className="text-xs font-medium text-gray-500 mb-2">Technologies</div>
                                {technologySuggestions.map((match, index) => (
                                    <button
                                        key={`tech-${index}`}
                                        onClick={() => addSuggestion(match, 'technology')}
                                        className="w-full text-left p-2 hover:bg-gray-50 rounded flex items-center justify-between"
                                    >
                                        <div>
                                            <div className="font-medium text-sm">{match.node.name}</div>
                                            {match.node.description && (
                                                <div className="text-xs text-gray-500">{match.node.description}</div>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {Math.round(match.score * 100)}%
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {purposeSuggestions.length > 0 && (
                            <div className="p-2 border-t border-gray-100">
                                <div className="text-xs font-medium text-gray-500 mb-2">Purposes</div>
                                {purposeSuggestions.map((match, index) => (
                                    <button
                                        key={`purpose-${index}`}
                                        onClick={() => addSuggestion(match, 'purpose')}
                                        className="w-full text-left p-2 hover:bg-gray-50 rounded flex items-center justify-between"
                                    >
                                        <div>
                                            <div className="font-medium text-sm">{match.node.name}</div>
                                            {match.node.description && (
                                                <div className="text-xs text-gray-500">{match.node.description}</div>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {Math.round(match.score * 100)}%
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Selected Technologies */}
            {availableTechnologies.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                        Technologies ({filterState.selectedTechnologies.size} selected)
                    </h4>
                    <div className="max-h-32 overflow-y-auto">
                        <div className="flex flex-wrap gap-2">
                            {availableTechnologies.map(tech => {
                                const isSelected = filterState.selectedTechnologies.has(tech);
                                const matches = TaxonomyService.findTechnologyMatches(tech, 1);
                                const matchQuality = matches[0]?.score || 0;
                                
                                return (
                                    <button
                                        key={tech}
                                        onClick={() => handleTechnologyToggle(tech)}
                                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                            isSelected
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        <div className="flex items-center gap-1">
                                            <span>{tech}</span>
                                            {matchQuality > 0 && (
                                                <span className={`text-xs ${
                                                    matchQuality >= 0.9 ? 'text-green-300' :
                                                    matchQuality >= 0.7 ? 'text-yellow-300' :
                                                    'text-red-300'
                                                }`}>
                                                    ●
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Selected Purposes */}
            {availablePurposes.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                        Purposes ({filterState.selectedPurposes.size} selected)
                    </h4>
                    <div className="max-h-32 overflow-y-auto">
                        <div className="flex flex-wrap gap-2">
                            {availablePurposes.map(purpose => {
                                const isSelected = filterState.selectedPurposes.has(purpose);
                                const matches = TaxonomyService.findPurposeMatches(purpose, 1);
                                const matchQuality = matches[0]?.score || 0;
                                
                                return (
                                    <button
                                        key={purpose}
                                        onClick={() => handlePurposeToggle(purpose)}
                                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                            isSelected
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        <div className="flex items-center gap-1">
                                            <span>{purpose}</span>
                                            {matchQuality > 0 && (
                                                <span className={`text-xs ${
                                                    matchQuality >= 0.9 ? 'text-green-300' :
                                                    matchQuality >= 0.7 ? 'text-yellow-300' :
                                                    'text-red-300'
                                                }`}>
                                                    ●
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Advanced Options */}
            {showAdvanced && (
                <div className="border-t pt-4 space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Advanced Options</h4>
                    
                    <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-600">Semantic Matching</label>
                        <button
                            onClick={() => setFilterState(prev => ({ 
                                ...prev, 
                                useSemanticMatching: !prev.useSemanticMatching 
                            }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                filterState.useSemanticMatching ? 'bg-indigo-600' : 'bg-gray-200'
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    filterState.useSemanticMatching ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-600">
                            Similarity Threshold: {Math.round(filterState.similarityThreshold * 100)}%
                        </label>
                        <input
                            type="range"
                            min="0.3"
                            max="1"
                            step="0.1"
                            value={filterState.similarityThreshold}
                            onChange={(e) => setFilterState(prev => ({ 
                                ...prev, 
                                similarityThreshold: parseFloat(e.target.value) 
                            }))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>
            )}

            {/* Filter Summary */}
            {hasActiveFilters && (
                <div className="bg-indigo-50 border border-indigo-200 rounded p-3">
                    <div className="text-sm text-indigo-800">
                        <strong>Active Filters:</strong>
                        {filterState.searchTerm && <span className="ml-2">Search: "{filterState.searchTerm}"</span>}
                        {filterState.selectedTechnologies.size > 0 && (
                            <span className="ml-2">Tech: {filterState.selectedTechnologies.size}</span>
                        )}
                        {filterState.selectedPurposes.size > 0 && (
                            <span className="ml-2">Purpose: {filterState.selectedPurposes.size}</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}; 