import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Incident, Feedback, Version } from '../types';
import { mockService } from '../services/mockData';
import { diffWords } from 'diff';

type SortOption = 'relevance' | 'similarity' | 'risk' | 'prism';
type FilterOption = 'all' | 'safety' | 'privacy' | 'bias' | 'accountability';

export const FeedbackLoop: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const incidentId = searchParams.get('incidentId');
    const [incident, setIncident] = useState<Incident | null>(null);
    const [versions, setVersions] = useState<Version[]>([]);
    const [currentVersion, setCurrentVersion] = useState<number>(0);
    const [feedback, setFeedback] = useState<Partial<Feedback>>({
        user_comment: '',
        suggested_incidents: [],
        index_labels: [],
        suggested_changes: []
    });
    const [newSuggestedIncident, setNewSuggestedIncident] = useState('');
    const [newIndexLabel, setNewIndexLabel] = useState('');
    const [newSuggestedChange, setNewSuggestedChange] = useState('');
    const [loading, setLoading] = useState(true);
    const [showDiff, setShowDiff] = useState(false);
    const [selectedVersions, setSelectedVersions] = useState<[number, number]>([0, 0]);
    const [similarExemplars, setSimilarExemplars] = useState<Incident[]>([]);
    const [optimizationStatus, setOptimizationStatus] = useState<'idle' | 'optimizing' | 'complete'>('idle');
    const [optimizationFeedback, setOptimizationFeedback] = useState<string>('');
    const [sortBy, setSortBy] = useState<SortOption>('relevance');
    const [filterBy, setFilterBy] = useState<FilterOption>('all');
    const [showMultimodalInput, setShowMultimodalInput] = useState(false);
    const [inputMode, setInputMode] = useState<'text' | 'voice' | 'image'>('text');

    useEffect(() => {
        const fetchData = async () => {
            if (!incidentId) return;
            try {
                const [incidentData, versionData, exemplars] = await Promise.all([
                    mockService.getIncident(parseInt(incidentId)),
                    mockService.getVersions(parseInt(incidentId)),
                    mockService.getSimilarExemplars(parseInt(incidentId))
                ]);
                setIncident(incidentData);
                setVersions(versionData);
                setSimilarExemplars(exemplars);
                if (versionData.length > 0) {
                    setFeedback(versionData[versionData.length - 1].feedback);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [incidentId]);

    const handleOptimize = async () => {
        if (!incident) return;
        
        setOptimizationStatus('optimizing');
        try {
            const optimizedIncident = await mockService.optimizeIncident(incident.id, feedback as Feedback);
            setIncident(optimizedIncident);
            setOptimizationStatus('complete');
            setOptimizationFeedback('Incident has been optimized based on your feedback and similar exemplars.');
        } catch (error) {
            console.error('Error optimizing incident:', error);
            setOptimizationStatus('idle');
            setOptimizationFeedback('Failed to optimize incident. Please try again.');
        }
    };

    const handleApplyExemplar = async (exemplarId: number) => {
        if (!incident) return;

        try {
            const updatedIncident = await mockService.applyExemplar(incident.id, exemplarId);
            setIncident(updatedIncident);
            setOptimizationFeedback(`Applied patterns from exemplar ${exemplarId}`);
        } catch (error) {
            console.error('Error applying exemplar:', error);
            setOptimizationFeedback('Failed to apply exemplar. Please try again.');
        }
    };

    const handleAddSuggestedIncident = () => {
        if (newSuggestedIncident.trim()) {
            setFeedback(prev => ({
                ...prev,
                suggested_incidents: [...(prev.suggested_incidents || []), newSuggestedIncident.trim()]
            }));
            setNewSuggestedIncident('');
        }
    };

    const handleRemoveSuggestedIncident = (index: number) => {
        setFeedback(prev => ({
            ...prev,
            suggested_incidents: (prev.suggested_incidents || []).filter((_, i) => i !== index)
        }));
    };

    const handleAddIndexLabel = () => {
        if (newIndexLabel.trim()) {
            setFeedback(prev => ({
                ...prev,
                index_labels: [...(prev.index_labels || []), newIndexLabel.trim()]
            }));
            setNewIndexLabel('');
        }
    };

    const handleRemoveIndexLabel = (index: number) => {
        setFeedback(prev => ({
            ...prev,
            index_labels: (prev.index_labels || []).filter((_, i) => i !== index)
        }));
    };

    const handleAddSuggestedChange = () => {
        if (newSuggestedChange.trim()) {
            setFeedback(prev => ({
                ...prev,
                suggested_changes: [...(prev.suggested_changes || []), newSuggestedChange.trim()]
            }));
            setNewSuggestedChange('');
        }
    };

    const handleRemoveSuggestedChange = (index: number) => {
        setFeedback(prev => ({
            ...prev,
            suggested_changes: (prev.suggested_changes || []).filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!incidentId) return;

        try {
            await mockService.submitFeedback(parseInt(incidentId), feedback as Feedback);
            
            // 由于submitFeedback返回void，我们自己创建一个新版本对象
            const newVersion: Version = {
                id: versions.length + 1,
                incident_id: parseInt(incidentId),
                description: incident?.description || '',
                feedback: feedback as Feedback,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            setVersions(prev => [...prev, newVersion]);
            setCurrentVersion(versions.length);
            alert('Feedback submitted successfully!');
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('Error submitting feedback. Please try again.');
        }
    };

    const handleCompareVersions = (version1: number, version2: number) => {
        setSelectedVersions([version1, version2]);
        setShowDiff(true);
    };

    const handleSortChange = (newSort: SortOption) => {
        setSortBy(newSort);
        // Re-sort exemplars based on new criteria
        const sortedExemplars = [...similarExemplars].sort((a, b) => {
            switch (newSort) {
                case 'relevance':
                    return ((b.contextual_relevance || 0) * (b.impact_scale || 0)) - ((a.contextual_relevance || 0) * (a.impact_scale || 0));
                case 'similarity':
                    return (b.logical_coherence || 0) - (a.logical_coherence || 0);
                case 'risk':
                    return (b.exploitability || 0) - (a.exploitability || 0);
                case 'prism':
                    return ((b.logical_coherence || 0) + (b.factual_accuracy || 0) + (b.practical_implementability || 0)) / 3 -
                           ((a.logical_coherence || 0) + (a.factual_accuracy || 0) + (a.practical_implementability || 0)) / 3;
                default:
                    return 0;
            }
        });
        setSimilarExemplars(sortedExemplars);
    };

    const handleFilterChange = (newFilter: FilterOption) => {
        setFilterBy(newFilter);
        // Re-filter exemplars based on new criteria
        const filteredExemplars = similarExemplars.filter(exemplar => {
            if (newFilter === 'all') return true;
            return exemplar.ethical_issues?.includes(newFilter) || false;
        });
        setSimilarExemplars(filteredExemplars);
    };

    const renderDiff = () => {
        if (!showDiff || selectedVersions[0] === selectedVersions[1]) return null;

        const v1 = versions[selectedVersions[0]];
        const v2 = versions[selectedVersions[1]];

        const commentDiff = diffWords(v1.feedback.user_comment, v2.feedback.user_comment);
        const suggestedIncidentsDiff = diffWords(
            v1.feedback.suggested_incidents.join(', '),
            v2.feedback.suggested_incidents.join(', ')
        );
        const indexLabelsDiff = diffWords(
            v1.feedback.index_labels.join(', '),
            v2.feedback.index_labels.join(', ')
        );

        return (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Version Comparison</h3>
                <div className="space-y-4">
                    <div>
                        <h4 className="font-medium mb-2">Comments</h4>
                        <div className="bg-white p-3 rounded">
                            {commentDiff.map((part, i) => (
                                <span
                                    key={i}
                                    className={part.added ? 'bg-green-200' : part.removed ? 'bg-red-200' : ''}
                                >
                                    {part.value}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-medium mb-2">Suggested Incidents</h4>
                        <div className="bg-white p-3 rounded">
                            {suggestedIncidentsDiff.map((part, i) => (
                                <span
                                    key={i}
                                    className={part.added ? 'bg-green-200' : part.removed ? 'bg-red-200' : ''}
                                >
                                    {part.value}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-medium mb-2">Index Labels</h4>
                        <div className="bg-white p-3 rounded">
                            {indexLabelsDiff.map((part, i) => (
                                <span
                                    key={i}
                                    className={part.added ? 'bg-green-200' : part.removed ? 'bg-red-200' : ''}
                                >
                                    {part.value}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderExemplars = () => (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Similar Exemplars</h3>
                <div className="flex gap-4">
                    <select
                        value={sortBy}
                        onChange={(e) => handleSortChange(e.target.value as SortOption)}
                        className="rounded-md border-gray-300"
                    >
                        <option value="relevance">Sort by Relevance</option>
                        <option value="similarity">Sort by Similarity</option>
                        <option value="risk">Sort by Risk</option>
                        <option value="prism">Sort by PRISM Score</option>
                    </select>
                    <select
                        value={filterBy}
                        onChange={(e) => handleFilterChange(e.target.value as FilterOption)}
                        className="rounded-md border-gray-300"
                    >
                        <option value="all">All Domains</option>
                        <option value="safety">Safety</option>
                        <option value="privacy">Privacy</option>
                        <option value="bias">Bias</option>
                        <option value="accountability">Accountability</option>
                    </select>
                </div>
            </div>
            <div className="space-y-4">
                {similarExemplars.map((exemplar) => (
                    <div key={exemplar.id} className="bg-white p-4 rounded-lg shadow">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{exemplar.title}</h4>
                            <div className="flex gap-2">
                                <span className="text-sm text-gray-500">
                                    Relevance: {(exemplar.contextual_relevance * 100).toFixed(0)}%
                                </span>
                                <span className="text-sm text-gray-500">
                                    PRISM: {((exemplar.logical_coherence + exemplar.factual_accuracy + exemplar.practical_implementability) / 3 * 100).toFixed(0)}%
                                </span>
                            </div>
                        </div>
                        <p className="text-gray-600 mb-3">{exemplar.description}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {exemplar.technologies.map((tech, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                                {exemplar.ethical_issues.map((issue, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                                    >
                                        {issue}
                                    </span>
                                ))}
                            </div>
                            <button
                                onClick={() => handleApplyExemplar(exemplar.id)}
                                className="text-sm text-indigo-600 hover:text-indigo-800"
                            >
                                Apply Exemplar Patterns
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderMultimodalInput = () => (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Input Method</h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => setInputMode('text')}
                        className={`px-4 py-2 rounded-md ${
                            inputMode === 'text' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'
                        }`}
                    >
                        Text
                    </button>
                    <button
                        onClick={() => setInputMode('voice')}
                        className={`px-4 py-2 rounded-md ${
                            inputMode === 'voice' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'
                        }`}
                    >
                        Voice
                    </button>
                    <button
                        onClick={() => setInputMode('image')}
                        className={`px-4 py-2 rounded-md ${
                            inputMode === 'image' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'
                        }`}
                    >
                        Image
                    </button>
                </div>
            </div>
            {inputMode === 'text' && (
                <textarea
                    value={feedback.user_comment}
                    onChange={(e) => setFeedback(prev => ({ ...prev, user_comment: e.target.value }))}
                    rows={4}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Share your thoughts about this incident..."
                />
            )}
            {inputMode === 'voice' && (
                <div className="text-center py-4">
                    <button className="px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700">
                        Start Recording
                    </button>
                    <p className="mt-2 text-sm text-gray-500">Voice input coming soon</p>
                </div>
            )}
            {inputMode === 'image' && (
                <div className="text-center py-4">
                    <button className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                        Upload Image
                    </button>
                    <p className="mt-2 text-sm text-gray-500">Image input coming soon</p>
                </div>
            )}
        </div>
    );

    const renderOptimizationStatus = () => (
        <div className="mt-4">
            {optimizationStatus === 'optimizing' && (
                <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Optimizing incident...</p>
                </div>
            )}
            {optimizationFeedback && (
                <div className={`p-4 rounded-lg ${
                    optimizationStatus === 'complete' ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'
                }`}>
                    {optimizationFeedback}
                </div>
            )}
        </div>
    );

    if (loading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    if (!incident) {
        return <div className="text-center py-8">Incident not found</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Feedback & Optimization Panel</h2>
                <div className="flex gap-4">
                    <button
                        onClick={handleOptimize}
                        disabled={optimizationStatus === 'optimizing'}
                        className={`px-4 py-2 rounded-md ${
                            optimizationStatus === 'optimizing'
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700'
                        } text-white`}
                    >
                        Optimize Incident
                    </button>
                    {versions.length > 1 && (
                        <div className="flex gap-2">
                            <select
                                value={selectedVersions[0]}
                                onChange={(e) => setSelectedVersions([parseInt(e.target.value), selectedVersions[1]])}
                                className="rounded-md border-gray-300"
                            >
                                {versions.map((_, i) => (
                                    <option key={i} value={i}>Version {i + 1}</option>
                                ))}
                            </select>
                            <select
                                value={selectedVersions[1]}
                                onChange={(e) => setSelectedVersions([selectedVersions[0], parseInt(e.target.value)])}
                                className="rounded-md border-gray-300"
                            >
                                {versions.map((_, i) => (
                                    <option key={i} value={i}>Version {i + 1}</option>
                                ))}
                            </select>
                            <button
                                onClick={() => handleCompareVersions(selectedVersions[0], selectedVersions[1])}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                                Compare Versions
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {renderOptimizationStatus()}
            {renderDiff()}
            {renderExemplars()}
            {renderMultimodalInput()}

            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h3 className="text-lg font-semibold mb-2">{incident.title}</h3>
                <p className="text-gray-600 mb-4">{incident.description}</p>
                <div className="flex flex-wrap gap-2">
                    {incident.technologies.map((tech, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                            {tech}
                        </span>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Suggested Incidents
                    </label>
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={newSuggestedIncident}
                            onChange={(e) => setNewSuggestedIncident(e.target.value)}
                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="Add a suggested incident"
                        />
                        <button
                            type="button"
                            onClick={handleAddSuggestedIncident}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                            Add
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {feedback.suggested_incidents?.map((incident, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                            >
                                {incident}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveSuggestedIncident(index)}
                                    className="ml-2 text-indigo-600 hover:text-indigo-800"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Index Labels
                    </label>
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={newIndexLabel}
                            onChange={(e) => setNewIndexLabel(e.target.value)}
                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="Add an index label"
                        />
                        <button
                            type="button"
                            onClick={handleAddIndexLabel}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                            Add
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {feedback.index_labels?.map((label, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                            >
                                {label}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveIndexLabel(index)}
                                    className="ml-2 text-green-600 hover:text-green-800"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Suggested Changes
                    </label>
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={newSuggestedChange}
                            onChange={(e) => setNewSuggestedChange(e.target.value)}
                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="Suggest a change to improve the incident description"
                        />
                        <button
                            type="button"
                            onClick={handleAddSuggestedChange}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                            Add
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {feedback.suggested_changes?.map((change, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800"
                            >
                                {change}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveSuggestedChange(index)}
                                    className="ml-2 text-yellow-600 hover:text-yellow-800"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between">
                    <button
                        type="button"
                        onClick={() => navigate(`/review?productId=${incident.product_id}`)}
                        className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                        Back to Review
                    </button>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={handleOptimize}
                            disabled={optimizationStatus === 'optimizing'}
                            className={`px-6 py-2 rounded-md ${
                                optimizationStatus === 'optimizing'
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700'
                            } text-white`}
                        >
                            Optimize & Continue
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                            Submit Feedback
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}; 