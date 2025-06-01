import React, { useState, useEffect, useRef } from 'react';
import { Incident, Feedback, Version } from '../types';
import { mockService } from '../services/mockData';

interface FeedbackModalProps {
    incident: Incident;
    onClose: () => void;
    onSubmit: (feedback: Partial<Feedback>) => Promise<void>;
    explanationMode: 'none' | 'generic' | 'prism';
}

type ExplanationMode = 'general' | 'prism';

const PRISM_SCORES = [
    { key: 'logical_coherence', label: 'Logical Coherence' },
    { key: 'factual_accuracy', label: 'Factual Accuracy' },
    { key: 'practical_implementability', label: 'Practical Implementability' },
    { key: 'contextual_relevance', label: 'Contextual Relevance' },
    { key: 'uniqueness', label: 'Uniqueness' },
    { key: 'impact_scale', label: 'Impact Scale' },
];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
    incident,
    onClose,
    onSubmit,
    explanationMode,
}) => {
    const [feedback, setFeedback] = useState<Partial<Feedback>>({
        user_comment: '',
        suggested_incidents: [],
        index_labels: [],
        relevance: true,
        prism_scores: {
            logical_coherence: 0.5,
            factual_accuracy: 0.5,
            practical_implementability: 0.5,
            contextual_relevance: 0.5,
            uniqueness: 0.5,
            impact_scale: 0.5
        }
    });
    const [loading, setLoading] = useState(false);
    const [similarExemplars, setSimilarExemplars] = useState<Incident[]>([]);
    const [selectedExemplars, setSelectedExemplars] = useState<number[]>([]);
    const [newIndexLabel, setNewIndexLabel] = useState('');
    const [inputMode, setInputMode] = useState<'text' | 'voice' | 'image'>('text');
    const [versions, setVersions] = useState<Version[]>([]);
    const [currentVersion, setCurrentVersion] = useState<number>(0);
    const [showDiff, setShowDiff] = useState(false);
    const [selectedVersions, setSelectedVersions] = useState<[number, number]>([0, 0]);
    const [optimizationStatus, setOptimizationStatus] = useState<'idle' | 'optimizing' | 'complete'>('idle');
    const [optimizationFeedback, setOptimizationFeedback] = useState<string>('');
    const [showOptimization, setShowOptimization] = useState(false);
    const [optimizedExemplars, setOptimizedExemplars] = useState<Incident[]>([]);
    const [voiceTranscript, setVoiceTranscript] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageCaption, setImageCaption] = useState('');
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [prismSort, setPrismSort] = useState<string>('');
    const [prismFilters, setPrismFilters] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [exemplars, versions] = await Promise.all([
                    mockService.getSimilarExemplars(incident.id),
                    mockService.getVersions(incident.id)
                ]);
                setSimilarExemplars(exemplars);
                setVersions(versions);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [incident.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const newFeedback: Partial<Feedback> = {
                ...feedback,
                suggested_incidents: selectedExemplars
            };
            
            await onSubmit(newFeedback);
            
            const updatedVersions = await mockService.getVersions(incident.id);
            setVersions(updatedVersions);
            setCurrentVersion(updatedVersions.length - 1);
            
            setOptimizationStatus('optimizing');
            const optimizedIncident = await mockService.optimizeIncident(incident.id, newFeedback);
            setOptimizationStatus('complete');
            setOptimizationFeedback('Incident has been optimized based on your feedback.');
            
            const newExemplars = await mockService.getSimilarExemplars(incident.id);
            setSimilarExemplars(newExemplars);
            
            setFeedback({
                user_comment: '',
                suggested_incidents: [],
                index_labels: [],
                relevance: true,
                prism_scores: {
                    logical_coherence: 0.5,
                    factual_accuracy: 0.5,
                    practical_implementability: 0.5,
                    contextual_relevance: 0.5,
                    uniqueness: 0.5,
                    impact_scale: 0.5
                }
            });
            setSelectedExemplars([]);
        } catch (error) {
            console.error('Error in feedback loop:', error);
            setOptimizationStatus('idle');
        } finally {
            setLoading(false);
        }
    };

    const handleOptimize = async () => {
        setLoading(true);
        try {
            setOptimizationStatus('optimizing');
            const optimized = await mockService.optimizeExemplars(incident.id, selectedExemplars);
            setOptimizedExemplars(optimized);
            setShowOptimization(true);
            setOptimizationStatus('complete');
            setOptimizationFeedback('Exemplars have been optimized based on your feedback.');
        } catch (error) {
            console.error('Error optimizing exemplars:', error);
            setOptimizationStatus('idle');
        } finally {
            setLoading(false);
        }
    };

    const addIndexLabel = () => {
        if (newIndexLabel.trim()) {
            setFeedback(prev => ({
                ...prev,
                index_labels: [...(prev.index_labels || []), newIndexLabel.trim()]
            }));
            setNewIndexLabel('');
        }
    };

    const removeIndexLabel = (index: number) => {
        setFeedback(prev => ({
            ...prev,
            index_labels: (prev.index_labels || []).filter((_, i) => i !== index)
        }));
    };

    const toggleExemplar = (exemplarId: number) => {
        setSelectedExemplars(prev => 
            prev.includes(exemplarId)
                ? prev.filter(id => id !== exemplarId)
                : [...prev, exemplarId]
        );
    };

    const handleVersionSelect = (versionIndex: number) => {
        if (showDiff) {
            setSelectedVersions(prev => [prev[0], versionIndex]);
        } else {
            setCurrentVersion(versionIndex);
        }
    };

    const toggleDiffView = () => {
        setShowDiff(!showDiff);
        if (!showDiff) {
            setSelectedVersions([currentVersion, currentVersion]);
        }
    };

    const handleVoiceRecord = () => {
        setVoiceTranscript('Simulated transcript: "This is a demo voice input for feedback."');
        setFeedback(prev => ({ ...prev, user_comment: 'This is a demo voice input for feedback.' }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImagePreview(reader.result as string);
                setImageCaption('Simulated OCR: "This is a demo image caption for feedback."');
                setFeedback(prev => ({ ...prev, user_comment: 'This is a demo image caption for feedback.' }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePrismFilterChange = (key: string) => {
        setPrismFilters(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handlePrismScoreChange = (key: keyof typeof feedback.prism_scores, value: number) => {
        setFeedback(prev => ({
            ...prev,
            prism_scores: {
                logical_coherence: prev.prism_scores?.logical_coherence ?? 0.5,
                factual_accuracy: prev.prism_scores?.factual_accuracy ?? 0.5,
                practical_implementability: prev.prism_scores?.practical_implementability ?? 0.5,
                contextual_relevance: prev.prism_scores?.contextual_relevance ?? 0.5,
                uniqueness: prev.prism_scores?.uniqueness ?? 0.5,
                impact_scale: prev.prism_scores?.impact_scale ?? 0.5,
                [key]: value
            }
        }));
    };

    const renderExplanation = () => {
        switch (explanationMode) {
            case 'general':
                return (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                            This incident was selected based on similarities in purpose, technology, and ethical concerns.
                        </p>
                    </div>
                );
            case 'prism':
                return (
                    <div className="mt-2 space-y-3">
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">PRISM Analysis</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Logical Coherence</p>
                                    <p className="text-sm text-gray-600">{incident.prism_scores?.logical_coherence || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Factual Accuracy</p>
                                    <p className="text-sm text-gray-600">{incident.prism_scores?.factual_accuracy || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Practical Implementability</p>
                                    <p className="text-sm text-gray-600">{incident.prism_scores?.practical_implementability || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Contextual Relevance</p>
                                    <p className="text-sm text-gray-600">{incident.prism_scores?.contextual_relevance || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Uniqueness</p>
                                    <p className="text-sm text-gray-600">{incident.prism_scores?.uniqueness || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Impact Scale</p>
                                    <p className="text-sm text-gray-600">{incident.prism_scores?.impact_scale || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    const filteredExemplars = similarExemplars.filter(exemplar =>
        Object.entries(prismFilters).every(([key, checked]) =>
            !checked || (exemplar.prism_scores && (exemplar.prism_scores as any)[key] >= 0.8)
        )
    );
    let sortedExemplars = [...filteredExemplars];
    if (prismSort && prismSort !== 'similarity') {
        sortedExemplars.sort((a, b) =>
            ((b.prism_scores as any)?.[prismSort] || 0) - ((a.prism_scores as any)?.[prismSort] || 0)
        );
    } else if (prismSort === 'similarity') {
        sortedExemplars.sort(() => Math.random() - 0.5);
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Provide Feedback</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <span className="sr-only">Close</span>
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Relevance Toggle */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Is this incident relevant to your product?
                            </label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFeedback(prev => ({ ...prev, relevance: true }))}
                                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        feedback.relevance
                                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Yes
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFeedback(prev => ({ ...prev, relevance: false }))}
                                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        !feedback.relevance
                                            ? 'bg-rose-600 text-white hover:bg-rose-700'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    No
                                </button>
                            </div>
                        </div>

                        {/* PRISM Scores */}
                        {explanationMode === 'prism' && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-sm font-medium text-gray-900">
                                        PRISM Scores
                                </label>
                                    <span className="text-xs text-gray-500">
                                        Drag sliders to rate each aspect
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {PRISM_SCORES.map(score => (
                                        <div key={score.key} className="space-y-1">
                                            <div className="flex justify-between items-center">
                                                <label className="text-sm text-gray-700">
                                                    {score.label}
                                                </label>
                                                <span className="text-xs font-medium text-gray-900">
                                                    {Math.round((feedback.prism_scores?.[score.key as keyof typeof feedback.prism_scores] || 0.5) * 100)}%
                                                </span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.1"
                                                value={feedback.prism_scores?.[score.key as keyof typeof feedback.prism_scores] || 0.5}
                                                onChange={(e) => handlePrismScoreChange(
                                                    score.key as keyof typeof feedback.prism_scores,
                                                    parseFloat(e.target.value)
                                                )}
                                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Feedback Input */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <label htmlFor="feedback" className="block text-sm font-medium text-gray-900 mb-2">
                                Additional Comments
                            </label>
                            <textarea
                                id="feedback"
                                value={feedback.user_comment}
                                onChange={(e) => setFeedback(prev => ({ ...prev, user_comment: e.target.value }))}
                                rows={3}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Share your thoughts about this incident..."
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                                    loading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {loading ? 'Submitting...' : 'Submit Feedback'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}; 