import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product, Incident, Feedback } from '../types';
import { apiService } from '../services/apiService';
import { FeedbackModal } from '../components/FeedbackModal';
import { ChatFeedbackModal } from '../components/ChatFeedbackModal';
import { FiFilter, FiX, FiEdit2, FiPlus, FiList, FiEye } from 'react-icons/fi';
import { ExemplarPanel } from '../components/ExemplarPanel';
import { PrismScoreTooltip } from '../components/PrismScoreTooltip';
import { ExplanationModeService } from '../services/explanationModeService';
import { SystemUncertaintyIndicator } from '../components/SystemUncertaintyIndicator';
import { PrismRangeSlider } from '../components/PrismRangeSlider';
import { ModeVisualIndicator, getModeTheme, ModeTransition } from '../components/ModeVisualIndicator';
import { IncidentLinks } from '../components/IncidentLinks';
import { TaxonomyImprovement } from '../components/TaxonomyImprovement';
import { TaxonomyFilterPanel } from '../components/TaxonomyFilterPanel';
import { UserImpactSummary } from '../components/UserImpactSummary';
import { UserImpactDashboard } from '../components/UserImpactDashboard';
import { UserImpactService } from '../services/userImpactService';
import { SystemTransparencyDashboard } from '../components/SystemTransparencyDashboard';
import { AlgorithmInsight } from '../components/AlgorithmInsight';
import { VisualFeedbackLoop } from '../components/VisualFeedbackLoop';
import { FeedbackLoopIndicator } from '../components/FeedbackLoopIndicator';
import { FeedbackLoopService } from '../services/feedbackLoopService';

const PRISM_SCORES = [
  { key: 'logical_coherence', label: 'Logical Coherence' },
  { key: 'factual_accuracy', label: 'Factual Accuracy' },
  { key: 'practical_implementability', label: 'Practical Implementability' },
  { key: 'contextual_relevance', label: 'Contextual Relevance' },
  { key: 'impact', label: 'Impact' },
  { key: 'exploitability', label: 'Exploitability' },
];

type ExplanationMode = 'generic' | 'prism';

export const IncidentReview: React.FC = () => {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [useChatFeedback, setUseChatFeedback] = useState(true);
    const [sortBy, setSortBy] = useState<'relevance' | 'impact' | 'risk'>('relevance');
    const [riskDomain, setRiskDomain] = useState<string>('all');
    const [prismFilters, setPrismFilters] = useState<{ [key: string]: boolean }>({});
    const [prismRangeFilters, setPrismRangeFilters] = useState<{ [key: string]: [number, number] }>({});
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [explanationMode, setExplanationMode] = useState<ExplanationMode>('generic');
    const [isEditingProduct, setIsEditingProduct] = useState(false);
    const [editedProduct, setEditedProduct] = useState<Partial<Product>>({});
    const [showAddIncidentModal, setShowAddIncidentModal] = useState(false);
    const [newIncident, setNewIncident] = useState<Partial<Incident>>({
        title: '',
        description: '',
        technologies: [],
        risk_level: 'medium',
        risk_domain: 'Safety',
        impact_scale: 0.5,
        confidence_score: 0.5,
        prism_scores: {
            logical_coherence: 0.5,
            factual_accuracy: 0.5,
            practical_implementability: 0.5,
            contextual_relevance: 0.5,
            impact: 0.5,
            exploitability: 0.5
        }
    });
    const [showFilters, setShowFilters] = useState(false);
    const [showExemplarPanel, setShowExemplarPanel] = useState(false);
    const [feedbackHistory, setFeedbackHistory] = useState<Feedback[]>([]);
    const [showTaxonomyImprovement, setShowTaxonomyImprovement] = useState(false);
    const [taxonomyFilteredIncidents, setTaxonomyFilteredIncidents] = useState<Incident[]>([]);
    const [useTaxonomyFiltering, setUseTaxonomyFiltering] = useState(false);
    const [showUserImpactDashboard, setShowUserImpactDashboard] = useState(false);
    const [showUserImpactSummary, setShowUserImpactSummary] = useState(true);
    const [showSystemTransparency, setShowSystemTransparency] = useState(false);
    const [showAlgorithmInsight, setShowAlgorithmInsight] = useState(true);
    const [showFeedbackLoopDashboard, setShowFeedbackLoopDashboard] = useState(false);
    const [showFeedbackLoopIndicator, setShowFeedbackLoopIndicator] = useState(true);
    const [processingMode, setProcessingMode] = useState(false);
    // Cache processed incidents to avoid recalculation
    const [processedIncidents, setProcessedIncidents] = useState<{
        generic: Incident[];
        prism: Incident[];
        productId: number | null;
    }>({
        generic: [],
        prism: [],
        productId: null
    });

    const processedIncidentsRef = useRef<{
        generic: Incident[];
        prism: Incident[];
        productId: number | null;
    }>({
        generic: [],
        prism: [],
        productId: null
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!productId) return;
            try {
                const [productData, incidentsData] = await Promise.all([
                    apiService.getProduct(parseInt(productId)),
                    apiService.getSimilarIncidents(parseInt(productId), 50) // Get more incidents for initial filtering
                ]);
                setProduct(productData);
                
                // Check if we need to process incidents for this product
                const currentProductId = parseInt(productId);
                if (processedIncidentsRef.current.productId !== currentProductId) {
                    // Process for both modes and cache results
                    setProcessingMode(true);
                    try {
                        const [genericIncidents, prismIncidents] = await Promise.all([
                            processIncidentsForMode(productData, incidentsData, 'generic'),
                            processIncidentsForMode(productData, incidentsData, 'prism')
                        ]);
                        
                        processedIncidentsRef.current = {
                            generic: genericIncidents,
                            prism: prismIncidents,
                            productId: currentProductId
                        };
                        
                        // Set initial incidents based on current mode
                        setIncidents(explanationMode === 'generic' ? genericIncidents : prismIncidents);
                    } finally {
                        setProcessingMode(false);
                    }
                } else {
                    // Use cached results
                    setIncidents(explanationMode === 'generic' ? processedIncidentsRef.current.generic : processedIncidentsRef.current.prism);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [productId]);

    // Process incidents when explanation mode changes - use cache if available
    useEffect(() => {
        if (product && processedIncidentsRef.current.productId === parseInt(productId!)) {
            // Use cached results
            setIncidents(explanationMode === 'generic' ? processedIncidentsRef.current.generic : processedIncidentsRef.current.prism);
        }
    }, [explanationMode, processedIncidentsRef, productId]);

    const processIncidentsForMode = async (product: Product, allIncidents: Incident[], mode: ExplanationMode): Promise<Incident[]> => {
        // Step 1: Use cosine similarity to filter to top 15 most similar incidents
        const similarityScores = allIncidents.map(incident => ({
            ...incident,
            similarity_score: ExplanationModeService.calculateSimilarity(product, incident, 'generic')
        }));
        
        // Sort by similarity and take top 15
        const top15Similar = similarityScores
            .sort((a, b) => b.similarity_score - a.similarity_score)
            .slice(0, 15);

        // Step 2: Process ALL 15 incidents in ONE API call
        try {
            console.log(`Processing ${top15Similar.length} incidents in ${mode} mode with single bulk API call`);
            
            // Prepare single bulk request with all incidents
            const bulkRequest = {
                product_name: product.name,
                product_description: product.description,
                incidents: top15Similar.map(incident => ({
                    id: incident.id,
                    title: incident.title,
                    description: incident.description,
                    technologies: incident.technologies
                })),
                context: mode === 'prism' 
                    ? `Technologies: ${product.technology.join(', ')}. Purposes: ${product.purpose?.join(', ') || 'General AI'}`
                    : `Generic analysis for: ${product.technology.join(', ')}`,
                mode: mode
            };

            // Make single bulk API call
            const bulkResponse = await apiService.bulkCalculatePRISMScore(bulkRequest);
            
            console.log(`=== BULK API RESPONSE ===`);
            console.log(`Mode: ${mode}`);
            console.log(`Response structure:`, bulkResponse);
            console.log(`Number of incident_scores:`, bulkResponse.incident_scores?.length || 0);
            console.log(`First score sample:`, bulkResponse.incident_scores?.[0]);
            
            // Process response - expecting array of scores for each incident
            const processedIncidents = top15Similar.map((incident, index) => {
                const scoreData = bulkResponse.incident_scores[index];
                
                if (mode === 'prism') {
                    const processed = {
                        ...incident,
                        prism_scores: {
                            logical_coherence: (scoreData.logical_coherence || 50) / 100, // Convert from 1-100 to 0-1
                            factual_accuracy: (scoreData.factual_accuracy || 50) / 100,
                            practical_implementability: (scoreData.practical_implementability || 50) / 100,
                            contextual_relevance: (scoreData.contextual_relevance || 50) / 100,
                            impact: (scoreData.impact || 50) / 100,
                            exploitability: (scoreData.exploitability || 50) / 100
                        },
                        confidence_score: (scoreData.overall_score || 50) / 100, // Convert from 1-100 to 0-1
                        prism_reasoning: scoreData.reasoning || 'PRISM analysis'
                    };
                    
                    console.log(`PRISM processed incident ${incident.id}: confidence=${processed.confidence_score}, overall_raw=${scoreData.overall_score || 'undefined'}`);
                    return processed;
                } else {
                    const processed = {
                        ...incident,
                        confidence_score: (scoreData.confidence_score || 50) / 100, // Convert from 1-100 to 0-1
                        generic_reasoning: scoreData.reasoning || 'Generic analysis'
                    };
                    
                    console.log(`Generic processed incident ${incident.id}: confidence=${processed.confidence_score}, confidence_raw=${scoreData.confidence_score || 'undefined'}`);
                    return processed;
                }
            });

            console.log(`Bulk processing complete. Score range:`, {
                min: Math.min(...processedIncidents.map(i => i.confidence_score || 0)),
                max: Math.max(...processedIncidents.map(i => i.confidence_score || 0)),
                count: processedIncidents.length
            });

            // Return sorted by confidence score
            return processedIncidents.sort((a, b) => (b.confidence_score || 0) - (a.confidence_score || 0));
            
        } catch (error) {
            console.error(`Error in bulk ${mode} processing:`, error);
            // Fallback to similarity scores
            return top15Similar.map(incident => ({
                ...incident,
                confidence_score: incident.similarity_score || 0.5
            }));
        }
    };

    useEffect(() => {
        if (product) {
            setEditedProduct(product);
        }
    }, [product]);

    // Track user actions
    const trackUserAction = (type: 'feedback' | 'view' | 'filter' | 'taxonomy_improvement' | 'exemplar_optimization', details: any, incidentId?: number) => {
        UserImpactService.logAction({
            type,
            details,
            incidentId,
            productId: product?.id
        });
    };

    const handleIncidentClick = async (incident: Incident) => {
        setSelectedIncident(incident);
        setShowFeedbackModal(true);
        
        // Track incident view
        trackUserAction('view', { duration: 0 }, incident.id);
        
        // Fetch feedback history when selecting an incident
        try {
            const history = await apiService.getFeedbackHistory(incident.id);
            setFeedbackHistory(history);
        } catch (error) {
            console.error('Error fetching feedback history:', error);
        }
    };

    const handleFeedbackSubmit = async (feedback: Partial<Feedback>) => {
        if (!selectedIncident) return;
        try {
            await apiService.submitFeedback(selectedIncident.id, feedback);
            
            // Create a feedback loop for this submission
            const feedbackLoop = FeedbackLoopService.createFeedbackLoop(
                `fb_${selectedIncident.id}_${Date.now()}`,
                'current_user'
            );
            
            // Track feedback submission
            trackUserAction('feedback', {
                user_comment: feedback.user_comment,
                relevance: feedback.relevance,
                prism_scores: feedback.prism_scores,
                feedback_loop_id: feedbackLoop.id
            }, selectedIncident.id);
            
            // Update feedback history
            const history = await apiService.getFeedbackHistory(selectedIncident.id);
            setFeedbackHistory(history);
            setShowFeedbackModal(false);
        } catch (error) {
            console.error('Error submitting feedback:', error);
        }
    };

    const handleOptimizeExemplars = async () => {
        try {
            // Optimize exemplars based on all feedback collected
            await apiService.optimizeWithFeedback(incidents.map(i => i.id), feedbackHistory);
            
            // Track exemplar optimization
            trackUserAction('exemplar_optimization', {
                incident_count: incidents.length,
                feedback_count: feedbackHistory.length
            });
            
            // Refresh the entire page data
            const [productData, updatedIncidents] = await Promise.all([
                apiService.getProduct(parseInt(productId || '')),
                apiService.getSimilarIncidents(parseInt(productId || ''), 50)
            ]);
            setProduct(productData);
            
            // Reprocess incidents for current mode
            const processedIncidents = await processIncidentsForMode(productData, updatedIncidents, explanationMode);
            setIncidents(processedIncidents);
            
            // Clear feedback history since it's been applied
            setFeedbackHistory([]);
            
            // Show success message or notification
            alert('Exemplars optimized successfully. Incidents have been updated.');
        } catch (error) {
            console.error('Error optimizing exemplars:', error);
            alert('Error optimizing exemplars. Please try again.');
        }
    };

    // Separate function to handle exemplar panel visibility
    const handleViewExemplars = async () => {
        try {
            // If we don't have a selected incident for viewing exemplars, use the first incident
            if (!selectedIncident && incidents.length > 0) {
                setSelectedIncident(incidents[0]);
            }
            setShowExemplarPanel(true);
        } catch (error) {
            console.error('Error viewing exemplars:', error);
        }
    };

    const clearAllFilters = () => {
        setPrismRangeFilters({});
        setRiskDomain('all');
        setSortBy('relevance');
        setSortOrder('desc');
        setExplanationMode('generic');
    };

    const handleProductEdit = async () => {
        try {
            if (product && editedProduct) {
                await apiService.updateProduct(product.id, editedProduct);
                setProduct({ ...product, ...editedProduct });
                setIsEditingProduct(false);
            }
        } catch (error) {
            console.error('Error updating product:', error);
        }
    };

    const handleTaxonomySuggestionApply = (type: 'technology' | 'purpose', oldTerm: string, newTerm: string) => {
        if (!product) return;
        
        if (type === 'technology') {
            const newTech = product.technology.map(tech => tech === oldTerm ? newTerm : tech);
            setEditedProduct(prev => ({ ...prev, technology: newTech }));
        } else {
            const newPurpose = (product.purpose || []).map(purpose => purpose === oldTerm ? newTerm : purpose);
            setEditedProduct(prev => ({ ...prev, purpose: newPurpose }));
        }
        
        trackUserAction('taxonomy_improvement', {
            type,
            old_term: oldTerm,
            new_term: newTerm
        });
    };

    const handleTaxonomyFilterChange = (filteredIncidents: Incident[]) => {
        setTaxonomyFilteredIncidents(filteredIncidents);
    };

    const handleAddIncident = async () => {
        try {
            // This would typically involve calling an API to add a new incident
            console.log('Adding new incident:', newIncident);
            setShowAddIncidentModal(false);
            // Reset the form
            setNewIncident({
                title: '',
                description: '',
                technologies: [],
                risk_level: 'medium',
                risk_domain: 'Safety',
                impact_scale: 0.5,
                confidence_score: 0.5,
                prism_scores: {
                    logical_coherence: 0.5,
                    factual_accuracy: 0.5,
                    practical_implementability: 0.5,
                    contextual_relevance: 0.5,
                    impact: 0.5,
                    exploitability: 0.5
                }
            });
        } catch (error) {
            console.error('Error adding incident:', error);
        }
    };

    // Helper function to sort incidents
    const sortedIncidents = useMemo(() => {
        let incidents_to_sort = useTaxonomyFiltering ? taxonomyFilteredIncidents : incidents;
        
        // Apply risk domain filter
        if (riskDomain !== 'all') {
            incidents_to_sort = incidents_to_sort.filter(incident => 
                incident.risk_domain.toLowerCase() === riskDomain.toLowerCase()
            );
        }
        
        // Apply PRISM range filters (only in PRISM mode)
        if (explanationMode === 'prism' && Object.keys(prismRangeFilters).length > 0) {
            incidents_to_sort = incidents_to_sort.filter(incident => {
                if (!incident.prism_scores) return false;
                
                return Object.entries(prismRangeFilters).every(([key, [min, max]]) => {
                    const score = incident.prism_scores?.[key as keyof typeof incident.prism_scores] || 0;
                    return score >= min && score <= max;
                });
            });
        }
        
        // Sort incidents
        const sorted = [...incidents_to_sort].sort((a, b) => {
            let valueA, valueB;
            
            switch (sortBy) {
                case 'relevance':
                    valueA = a.confidence_score || 0;
                    valueB = b.confidence_score || 0;
                    break;
                case 'impact':
                    valueA = a.impact_scale || 0;
                    valueB = b.impact_scale || 0;
                    break;
                case 'risk':
                    valueA = getRiskLevelValue(a.risk_level);
                    valueB = getRiskLevelValue(b.risk_level);
                    break;
                default:
                    valueA = a.confidence_score || 0;
                    valueB = b.confidence_score || 0;
            }
            
            return sortOrder === 'desc' ? valueB - valueA : valueA - valueB;
        });
        
        return sorted;
    }, [incidents, taxonomyFilteredIncidents, useTaxonomyFiltering, riskDomain, prismRangeFilters, sortBy, sortOrder, explanationMode]);

    const getRiskLevelValue = (risk: string) => {
        switch (risk) {
            case 'high': return 3;
            case 'medium': return 2;
            case 'low': return 1;
            default: return 0;
        }
    };

    const handleExplanationModeChange = (mode: ExplanationMode) => {
        setExplanationMode(mode);
        trackUserAction('filter', {
            filter_type: 'explanation_mode',
            value: mode
        });
    };

    const handleRiskDomainChange = (domain: string) => {
        setRiskDomain(domain);
        trackUserAction('filter', {
            filter_type: 'risk_domain',
            value: domain
        });
    };

    const handlePrismRangeFilterChange = (key: string, range: [number, number]) => {
        setPrismRangeFilters(prev => ({ ...prev, [key]: range }));
        trackUserAction('filter', {
            filter_type: 'prism_range',
            dimension: key,
            range
        });
    };

    // Get current algorithm based on explanation mode
    const getCurrentAlgorithm = () => {
        switch (explanationMode) {
            case 'generic': return 'cosine-similarity-llm';
            case 'prism': return 'prism-scoring-llm';
            default: return 'cosine-similarity-llm';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* System Transparency Dashboard Modal */}
            {showSystemTransparency && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-7xl max-h-[90vh] overflow-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-semibold text-gray-900">System Transparency Dashboard</h2>
                                <button
                                    onClick={() => setShowSystemTransparency(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <FiX size={24} />
                                </button>
                            </div>
                            <SystemTransparencyDashboard 
                                currentAlgorithm={getCurrentAlgorithm()}
                                showDecisionTrace={true}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Visual Feedback Loop Dashboard Modal */}
            {showFeedbackLoopDashboard && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-7xl max-h-[90vh] overflow-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-semibold text-gray-900">Feedback Loop Dashboard</h2>
                                <button
                                    onClick={() => setShowFeedbackLoopDashboard(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <FiX size={24} />
                                </button>
                            </div>
                            <VisualFeedbackLoop 
                                userId="current_user"
                                showGlobalStats={true}
                                autoProgress={true}
                                onViewDetails={(loopId) => console.log('View loop details:', loopId)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* User Impact Dashboard Modal */}
            {showUserImpactDashboard && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-semibold text-gray-900">User Impact Dashboard</h2>
                                <button
                                    onClick={() => setShowUserImpactDashboard(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <FiX size={24} />
                                </button>
                            </div>
                            <UserImpactDashboard userId="current_user" />
                        </div>
                    </div>
                </div>
            )}

            {/* Product Overview Card - Now at the top */}
            <div className="bg-white shadow-lg mb-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                            <p className="mt-2 text-gray-600">{product.description}</p>
                            {/* Technologies */}
                            <div className="mt-4">
                                <div className="text-xs font-semibold text-gray-500 mb-1">Technologies</div>
                                <div className="flex flex-wrap gap-2">
                                    {product.technology.map((tech, index) => (
                                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            {/* Purposes */}
                            <div className="mt-4">
                                <div className="text-xs font-semibold text-gray-500 mb-1">Purposes</div>
                                <div className="flex flex-wrap gap-2">
                                    {product.purpose && product.purpose.map((purpose, index) => (
                                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-800">
                                            {purpose}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => setShowSystemTransparency(true)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <FiEye size={16} />
                                <span className="ml-2">System Transparency</span>
                            </button>
                            <button
                                onClick={() => setIsEditingProduct(true)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <FiEdit2 size={16} />
                                <span className="ml-2">Edit Product</span>
                            </button>
                            <button
                                onClick={() => setShowAddIncidentModal(true)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 bg-indigo-600 rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700"
                            >
                                <FiPlus size={16} />
                                <span className="ml-2">Add Incident</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Product Modal */}
            {isEditingProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">Edit Product</h2>
                            <button
                                onClick={() => {
                                    setIsEditingProduct(false);
                                    setEditedProduct(product);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <FiX size={24} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={editedProduct.name || ''}
                                    onChange={(e) => setEditedProduct(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Product name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={editedProduct.description || ''}
                                    onChange={(e) => setEditedProduct(prev => ({ ...prev, description: e.target.value }))}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Product description"
                                />
                            </div>
                            {/* Technologies 编辑 */}
                            <div>
                                <div className="text-xs font-semibold text-gray-500 mb-1">Technologies</div>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {editedProduct.technology?.map((tech, index) => (
                                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800">
                                            {tech}
                                            <button
                                                onClick={() => {
                                                    const newTech = editedProduct.technology?.filter((_, i) => i !== index);
                                                    setEditedProduct(prev => ({ ...prev, technology: newTech }));
                                                }}
                                                className="ml-1 text-indigo-600 hover:text-indigo-800"
                                            >
                                                <FiX size={14} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    placeholder="Add technology and press Enter"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.currentTarget.value) {
                                            e.preventDefault();
                                            const newTech = [...(editedProduct.technology || []), e.currentTarget.value];
                                            setEditedProduct(prev => ({ ...prev, technology: newTech }));
                                            e.currentTarget.value = '';
                                        }
                                    }}
                                />
                            </div>
                            {/* Purposes 编辑 */}
                            <div>
                                <div className="text-xs font-semibold text-gray-500 mb-1">Purposes</div>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {editedProduct.purpose?.map((purpose, index) => (
                                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-teal-100 text-teal-800">
                                            {purpose}
                                            <button
                                                onClick={() => {
                                                    const newPurpose = editedProduct.purpose?.filter((_, i) => i !== index);
                                                    setEditedProduct(prev => ({ ...prev, purpose: newPurpose }));
                                                }}
                                                className="ml-1 text-teal-600 hover:text-teal-800"
                                            >
                                                <FiX size={14} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    placeholder="Add purpose and press Enter"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.currentTarget.value) {
                                            e.preventDefault();
                                            const newPurpose = [...(editedProduct.purpose || []), e.currentTarget.value];
                                            setEditedProduct(prev => ({ ...prev, purpose: newPurpose }));
                                            e.currentTarget.value = '';
                                        }
                                    }}
                                />
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <button
                                    onClick={() => {
                                        setIsEditingProduct(false);
                                        setEditedProduct(product);
                                    }}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleProductEdit}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Incident Modal */}
            {showAddIncidentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">Add New Incident</h2>
                            <button
                                onClick={() => setShowAddIncidentModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <FiX size={24} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={newIncident.title}
                                    onChange={(e) => setNewIncident(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Enter incident title"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={newIncident.description}
                                    onChange={(e) => setNewIncident(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    rows={4}
                                    placeholder="Enter incident description"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Technologies</label>
                                <input
                                    type="text"
                                    value={newIncident.technologies?.join(', ')}
                                    onChange={(e) => setNewIncident(prev => ({ 
                                        ...prev, 
                                        technologies: e.target.value.split(',').map(tech => tech.trim()).filter(Boolean)
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Enter technologies (comma-separated)"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
                                    <select
                                        value={newIncident.risk_level}
                                        onChange={(e) => setNewIncident(prev => ({ ...prev, risk_level: e.target.value as 'low' | 'medium' | 'high' }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Risk Domain</label>
                                    <select
                                        value={newIncident.risk_domain}
                                        onChange={(e) => setNewIncident(prev => ({ ...prev, risk_domain: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="Safety">Safety</option>
                                        <option value="Privacy">Privacy</option>
                                        <option value="Security">Security</option>
                                        <option value="Ethics">Ethics</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <button
                                    onClick={() => setShowAddIncidentModal(false)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddIncident}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Add Incident
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* User Impact Summary - New section */}
                {showUserImpactSummary && (
                    <UserImpactSummary
                        userId="current_user"
                        showDetails={true}
                        onViewFullDashboard={() => setShowUserImpactDashboard(true)}
                        onDismiss={() => setShowUserImpactSummary(false)}
                    />
                )}

                {/* Feedback Loop Indicator - New section */}
                {showFeedbackLoopIndicator && (
                    <div className="mb-6">
                        <FeedbackLoopIndicator
                            userId="current_user"
                            compact={false}
                            showDetails={true}
                            onViewFull={() => setShowFeedbackLoopDashboard(true)}
                            onDismiss={() => setShowFeedbackLoopIndicator(false)}
                            autoUpdate={true}
                        />
                    </div>
                )}

                {/* Algorithm Insight - New section */}
                {showAlgorithmInsight && (
                    <div className="mb-6">
                        <AlgorithmInsight
                            algorithmId={getCurrentAlgorithm()}
                            compact={true}
                            onViewFullTransparency={() => setShowSystemTransparency(true)}
                            onDismiss={() => setShowAlgorithmInsight(false)}
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left Sidebar - Filter and Sort Combined */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <ModeVisualIndicator mode={explanationMode} variant="icon" size="sm" />
                                    <h2 className="text-lg font-semibold text-gray-900">Sort & Filter</h2>
                                </div>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="lg:hidden p-2 rounded-md hover:bg-gray-100"
                                >
                                    {showFilters ? <FiX size={20} /> : <FiFilter size={20} />}
                                </button>
                            </div>

                            <div className={`${showFilters ? 'block' : 'hidden'} lg:block space-y-6`}>
                                {/* Transparency Actions */}
                                <div className="border-b pb-4">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">System Insights</h4>
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => setShowSystemTransparency(true)}
                                            className="w-full px-3 py-2 text-sm text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
                                        >
                                            View Transparency Dashboard
                                        </button>
                                        <button
                                            onClick={() => setShowFeedbackLoopDashboard(true)}
                                            className="w-full px-3 py-2 text-sm text-purple-600 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                                        >
                                            View Feedback Loops
                                        </button>
                                        <button
                                            onClick={() => setShowAlgorithmInsight(!showAlgorithmInsight)}
                                            className="w-full px-3 py-2 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            {showAlgorithmInsight ? 'Hide' : 'Show'} Algorithm Info
                                        </button>
                                        <button
                                            onClick={() => setShowFeedbackLoopIndicator(!showFeedbackLoopIndicator)}
                                            className="w-full px-3 py-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                                        >
                                            {showFeedbackLoopIndicator ? 'Hide' : 'Show'} Loop Status
                                        </button>
                                    </div>
                                </div>

                                {/* Sort Controls */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">Sort by</label>
                                    <div className="flex flex-col gap-2">
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value as 'relevance' | 'impact' | 'risk')}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="relevance">Relevance</option>
                                            <option value="impact">Impact</option>
                                            <option value="risk">Risk Level</option>
                                        </select>
                                        <button
                                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            {sortOrder === 'asc' ? 'Sort Ascending' : 'Sort Descending'}
                                        </button>
                                    </div>
                                </div>

                                <div className="border-t pt-6">
                                    {/* Risk Domain Filter */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-900 mb-2">Risk Domain</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['All', 'Safety', 'Privacy', 'Security', 'Ethics'].map((domain) => (
                                                <button
                                                    key={domain}
                                                    onClick={() => handleRiskDomainChange(domain === 'All' ? 'all' : domain)}
                                                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                                                        (domain === 'All' && riskDomain === 'all') || riskDomain === domain
                                                            ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-500'
                                                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {domain}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* PRISM Score Filters with tracking */}
                                    {explanationMode === 'prism' && (
                                        <ModeTransition mode="prism" className="space-y-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <ModeVisualIndicator mode="prism" variant="badge" size="sm" />
                                                <h4 className="font-medium text-indigo-900">PRISM Score Filters</h4>
                                            </div>
                                            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                                                <p className="text-xs text-indigo-700 mb-3">
                                                    Filter incidents by PRISM score ranges. Use sliders to set minimum and maximum values.
                                                </p>
                                                <div className="space-y-4">
                                                    {PRISM_SCORES.map(({ key, label }) => (
                                                        <PrismRangeSlider
                                                            key={key}
                                                            dimension={key}
                                                            label={label}
                                                            value={prismRangeFilters[key] || [0, 1]}
                                                            onChange={(range) => handlePrismRangeFilterChange(key, range)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </ModeTransition>
                                    )}

                                    {/* Clear Filters Button */}
                                    {(Object.values(prismRangeFilters).some(range => range[0] > 0 || range[1] < 1) || riskDomain !== 'all') && (
                                        <button
                                            onClick={clearAllFilters}
                                            className="w-full mt-6 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {/* Explanation Modes - Redesigned with tracking */}
                        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <ModeVisualIndicator mode={explanationMode} variant="icon" size="md" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Analysis Mode</h3>
                                        <p className="text-sm text-gray-500">Choose how you want to analyze and understand incidents</p>
                                    </div>
                                </div>
                                
                                {/* Mode Selector with tracking */}
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    <button
                                        onClick={() => handleExplanationModeChange('generic')}
                                        disabled={processingMode}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                            explanationMode === 'generic'
                                                ? 'bg-white text-gray-900 shadow-sm border-l-4 border-blue-500'
                                                : 'text-gray-600 hover:text-gray-900'
                                        } ${processingMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {processingMode && explanationMode === 'generic' ? (
                                            <div className="flex items-center gap-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                                Processing...
                                            </div>
                                        ) : (
                                            'Generic Mode'
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleExplanationModeChange('prism')}
                                        disabled={processingMode}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                            explanationMode === 'prism'
                                                ? 'bg-white text-gray-900 shadow-sm border-l-4 border-indigo-500'
                                                : 'text-gray-600 hover:text-gray-900'
                                        } ${processingMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {processingMode && explanationMode === 'prism' ? (
                                            <div className="flex items-center gap-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                                                Processing...
                                            </div>
                                        ) : (
                                            'PRISM Mode'
                                        )}
                                    </button>
                                </div>
                            </div>
                            
                            {/* Mode Description with Visual Enhancement */}
                            <ModeTransition mode={explanationMode} className="mt-4">
                                <ModeVisualIndicator 
                                    mode={explanationMode} 
                                    variant="banner" 
                                    showDescription={true}
                                />
                                <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                                    {explanationMode === 'generic' && (
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <ModeVisualIndicator mode="generic" variant="accent" />
                                                <p className="text-sm text-gray-600">Generic AI analysis for incident transferability assessment.</p>
                                            </div>
                                        </div>
                                    )}
                                    {explanationMode === 'prism' && (
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <ModeVisualIndicator mode="prism" variant="accent" />
                                                <p className="text-sm text-gray-600">Multi-dimensional PRISM analysis for comprehensive incident evaluation.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ModeTransition>
                        </div>

                        {/* Taxonomy Improvement Section */}
                        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Technology & Purpose Taxonomy</h3>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setUseTaxonomyFiltering(!useTaxonomyFiltering)}
                                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                            useTaxonomyFiltering 
                                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        Smart Filtering {useTaxonomyFiltering ? 'ON' : 'OFF'}
                                    </button>
                                    <button
                                        onClick={() => setShowTaxonomyImprovement(!showTaxonomyImprovement)}
                                        className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                                    >
                                        {showTaxonomyImprovement ? 'Hide' : 'Show'} Improvements
                                    </button>
                                </div>
                            </div>

                            {showTaxonomyImprovement && product && (
                                <TaxonomyImprovement
                                    technologies={product.technology || []}
                                    purposes={product.purpose || []}
                                    onSuggestionApply={handleTaxonomySuggestionApply}
                                    showHierarchy={true}
                                />
                            )}

                            {useTaxonomyFiltering && (
                                <div className="mt-4">
                                    <TaxonomyFilterPanel
                                        incidents={incidents}
                                        onFilterChange={handleTaxonomyFilterChange}
                                        showAdvanced={true}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Incident Cards */}
                        <div className="space-y-6">
                            {/* Mode Status Banner */}
                            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <ModeVisualIndicator mode={explanationMode} variant="icon" size="md" />
                                        <div>
                                            <h4 className="font-medium text-gray-900">
                                                {explanationMode === 'generic' ? 'AI Analysis Active' : 'PRISM Framework Active'}
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                                {sortedIncidents.length} incident{sortedIncidents.length === 1 ? '' : 's'} found using{' '}
                                                {explanationMode === 'generic' ? 'AI Analysis' : 'PRISM Analysis'}
                                            </p>
                                        </div>
                                    </div>
                                    <ModeVisualIndicator 
                                        mode={explanationMode} 
                                        variant="badge" 
                                        showDescription={false}
                                        size="md"
                                    />
                                </div>
                            </div>

                            {sortedIncidents.length === 0 ? (
                                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">No Incidents Found</h2>
                                    <p className="text-gray-600 mb-6">
                                        There are no incidents available for this product yet. Incidents will be generated as the system learns more about your product.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Processing overlay */}
                                    {processingMode && (
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-white bg-opacity-80 rounded-lg z-10 flex items-center justify-center">
                                                <div className="text-center">
                                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                                                    <p className="text-lg font-medium text-gray-900">Processing with {explanationMode === 'prism' ? 'PRISM LLM' : 'Generic LLM'}</p>
                                                    <p className="text-sm text-gray-500 mt-2">
                                                        {explanationMode === 'prism' 
                                                            ? 'Calculating 6-dimensional PRISM scores...' 
                                                            : 'Calculating confidence scores...'
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="grid grid-cols-1 gap-6">
                                        {processingMode ? (
                                            // Show skeleton loading cards while processing
                                            Array.from({ length: 5 }).map((_, index) => (
                                                <div key={index} className="bg-white rounded-xl shadow p-6 animate-pulse">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                                                        <div className="flex-1">
                                                            <div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>
                                                            <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
                                                            <div className="h-4 bg-gray-200 rounded mb-4 w-2/3"></div>
                                                            <div className="flex gap-2 mb-4">
                                                                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                                                                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            sortedIncidents.map((incident) => {
                                                const modeTheme = getModeTheme(explanationMode);
                                                return (
                                                    <ModeTransition mode={explanationMode} key={incident.id}>
                                                        <div className={`bg-white rounded-xl shadow p-6 transition-all border-l-4 ${
                                                            explanationMode === 'generic' ? 'border-l-blue-500 bg-blue-50' : 
                                                            explanationMode === 'prism' ? 'border-l-indigo-500 bg-indigo-50' :
                                                            'border-l-gray-500 bg-gray-50'
                                                        } hover:shadow-lg`}>
                                                            <div className="flex items-start gap-4">
                                                                {/* Mode-linked accent and risk indicator */}
                                                                <div className="flex flex-col items-center gap-2">
                                                                    <div className={`w-12 h-12 rounded-lg ${
                                                                        incident.risk_level === 'high' ? 'bg-red-100' :
                                                                        incident.risk_level === 'medium' ? 'bg-yellow-100' :
                                                                        'bg-green-100'
                                                                    } flex items-center justify-center flex-shrink-0`}>
                                                                        <svg className={`w-6 h-6 ${
                                                                            incident.risk_level === 'high' ? 'text-red-600' :
                                                                            incident.risk_level === 'medium' ? 'text-yellow-600' :
                                                                            'text-green-600'
                                                                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                                        </svg>
                                                                    </div>
                                                                    <ModeVisualIndicator 
                                                                        mode={explanationMode} 
                                                                        variant="badge" 
                                                                        size="sm"
                                                                    />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex justify-between items-start mb-4">
                                                                        <h3 className="text-xl font-semibold text-gray-900">{incident.title}</h3>
                                                                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                                                                            incident.risk_level === 'high' ? 'bg-red-100 text-red-800' :
                                                                            incident.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                            'bg-green-100 text-green-800'
                                                                        }`}>
                                                                            {incident.risk_level.charAt(0).toUpperCase() + incident.risk_level.slice(1)} Likelihood
                                                                        </span>
                                                                    </div>
                                                                    
                                                                    <p className="text-gray-600 mb-4">{incident.description}</p>
                                                                    
                                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                                        {incident.technologies.map((tech, index) => (
                                                                            <span
                                                                                key={index}
                                                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                                                    product.technology.includes(tech)
                                                                                        ? 'bg-red-100 text-red-800 border-2 border-red-300'
                                                                                        : 'bg-gray-100 text-gray-800'
                                                                                }`}
                                                                            >
                                                                                {tech}
                                                                            </span>
                                                                        ))}
                                                                    </div>

                                                                    {explanationMode === 'prism' && incident.prism_scores && (
                                                                        <div className="mt-4">
                                                                            <h4 className="text-sm font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                                                                                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                                </svg>
                                                                                PRISM Metrics
                                                                            </h4>
                                                                            <div className="grid grid-cols-2 gap-3">
                                                                                {PRISM_SCORES.map(score => {
                                                                                    const value = incident.prism_scores?.[score.key as keyof typeof incident.prism_scores] || 0;
                                                                                    return (
                                                                                        <div key={score.key} className="space-y-1">
                                                                                            <div className="flex justify-between items-center">
                                                                                                <div className="flex items-center gap-2">
                                                                                                    <label className="text-xs font-medium text-indigo-700">
                                                                                                        {score.label}
                                                                                                    </label>
                                                                                                    <PrismScoreTooltip 
                                                                                                        dimension={score.key} 
                                                                                                        score={value} 
                                                                                                    />
                                                                                                </div>
                                                                                                <span className="text-xs font-bold text-indigo-800">
                                                                                                    {Math.round(value * 100)}%
                                                                                                </span>
                                                                                            </div>
                                                                                            <div className="w-full bg-indigo-100 rounded-full h-2">
                                                                                                <div
                                                                                                    className={`h-2 rounded-full transition-all duration-300 ${
                                                                                                        value >= 0.7 ? 'bg-green-500' :
                                                                                                        value >= 0.4 ? 'bg-yellow-500' :
                                                                                                        'bg-red-500'
                                                                                                    }`}
                                                                                                    style={{ width: `${value * 100}%` }}
                                                                                                />
                                                                                            </div>
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* System Uncertainty Indicator */}
                                                                    <div className="mt-4">
                                                                        <SystemUncertaintyIndicator
                                                                            key={`uncertainty-${incident.id}`}
                                                                            incident={incident}
                                                                            mode={explanationMode}
                                                                            similarity_score={incident.similarity_score || incident.confidence_score || 0}
                                                                            explanationMode={explanationMode}
                                                                        />
                                                                    </div>

                                                                    {/* Real Incident Links */}
                                                                    <div className="mt-4">
                                                                        <IncidentLinks 
                                                                            incidentId={incident.id}
                                                                            links={incident.links}
                                                                            compact={false}
                                                                            maxVisible={3}
                                                                        />
                                                                    </div>

                                                                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                                                        <div className="flex items-center gap-4">
                                                                            {/* Impact display removed as requested */}
                                                                        </div>
                                                                        <button
                                                                            onClick={() => handleIncidentClick(incident)}
                                                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md"
                                                                        >
                                                                            💬 Chat Feedback
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </ModeTransition>
                                                );
                                            })
                                        )}
                                    </div>

                                    {/* Exemplar Controls - Now at the bottom */}
                                    <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
                                        <div className="flex flex-col space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">Exemplar Management</h3>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {feedbackHistory.length === 0 
                                                            ? "Provide feedback on incidents above to optimize exemplars"
                                                            : `Feedback provided on ${feedbackHistory.length} incident${feedbackHistory.length === 1 ? '' : 's'}`
                                                        }
                                                    </p>
                                                </div>
                                                <div className="flex gap-4">
                                                    <button
                                                        onClick={handleViewExemplars}
                                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                                                    >
                                                        <FiList size={16} />
                                                        View Current Exemplars
                                                    </button>
                                                    <button
                                                        onClick={handleOptimizeExemplars}
                                                        disabled={feedbackHistory.length === 0}
                                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                                                            feedbackHistory.length === 0
                                                                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                        }`}
                                                    >
                                                        <FiEdit2 size={16} />
                                                        Optimize Exemplars
                                                    </button>
                                                </div>
                                            </div>
                                            {feedbackHistory.length > 0 && (
                                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Feedback</h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        {feedbackHistory.slice(-3).map((feedback, index) => (
                                                            <div key={index} className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-200">
                                                                {feedback.user_comment}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {selectedIncident && showFeedbackModal && (
                <>
                    {useChatFeedback ? (
                        <ChatFeedbackModal
                            incident={selectedIncident}
                            onClose={() => setShowFeedbackModal(false)}
                            onSubmit={handleFeedbackSubmit}
                            explanationMode={explanationMode}
                        />
                    ) : (
                        <FeedbackModal
                            incident={selectedIncident}
                            onClose={() => setShowFeedbackModal(false)}
                            onSubmit={handleFeedbackSubmit}
                            explanationMode={explanationMode}
                        />
                    )}
                </>
            )}

            {showExemplarPanel && (
                <ExemplarPanel
                    isOpen={showExemplarPanel}
                    onClose={() => {
                        setShowExemplarPanel(false);
                    }}
                    incidentId={selectedIncident?.id || incidents[0]?.id || 0}
                    feedbackHistory={feedbackHistory}
                />
            )}
        </div>
    );
}; 