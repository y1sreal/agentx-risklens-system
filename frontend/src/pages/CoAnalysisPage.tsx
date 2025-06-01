import React, { useState, useEffect } from 'react';
import { FiChevronUp, FiChevronDown, FiThumbsUp, FiThumbsDown, FiPlus, FiMove } from 'react-icons/fi';
import { PrismOnboarding } from '../components/PrismOnboarding';

interface Incident {
    id: number;
    title: string;
    description: string;
    confidence_score: number;
    impact_scale: number;
    risk_level: 'low' | 'medium' | 'high';
    technologies: string[];
    risk_domain: string;
    prism_scores?: {
        logical_coherence: number;
        factual_accuracy: number;
        practical_implementability: number;
        contextual_relevance: number;
        uniqueness: number;
        impact_scale: number;
    };
}

interface Exemplar {
    id: number;
    title: string;
    description: string;
    similarity_score: number;
}

export const CoAnalysisPage: React.FC = () => {
    const [productDescription, setProductDescription] = useState('');
    const [domain, setDomain] = useState('all');
    const [showPrismAnalysis, setShowPrismAnalysis] = useState(false);
    const [showSystemPrompt, setShowSystemPrompt] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [showOnboarding, setShowOnboarding] = useState(true);

    // Mock data for demonstration
    const mockIncidents: Incident[] = [
        {
            id: 1,
            title: "Data Privacy Breach",
            description: "AI system accidentally exposes sensitive user data through API endpoint",
            confidence_score: 0.85,
            impact_scale: 0.9,
            risk_level: 'high',
            technologies: ['Machine Learning', 'API'],
            risk_domain: 'privacy',
            prism_scores: {
                logical_coherence: 0.8,
                factual_accuracy: 0.9,
                practical_implementability: 0.7,
                contextual_relevance: 0.85,
                uniqueness: 0.75,
                impact_scale: 0.9
            }
        },
        // Add more mock incidents as needed
    ];

    const mockExemplars: Exemplar[] = [
        {
            id: 1,
            title: "Similar Privacy Incident",
            description: "Previous case of data exposure in healthcare AI system",
            similarity_score: 0.92
        },
        // Add more mock exemplars as needed
    ];

    const handleDragStart = (index: number) => setDraggedIndex(index);
    const handleDragOver = (index: number) => {
        if (draggedIndex === null || draggedIndex === index) return;
        // Handle reordering logic here
    };
    const handleDragEnd = () => setDraggedIndex(null);

    return (
        <div className="min-h-screen bg-gray-50">
            {showOnboarding && <PrismOnboarding onClose={() => setShowOnboarding(false)} />}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Input Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Input</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Product Description
                                    </label>
                                    <textarea
                                        value={productDescription}
                                        onChange={(e) => setProductDescription(e.target.value)}
                                        className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Describe your AI product..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Domain
                                    </label>
                                    <select
                                        value={domain}
                                        onChange={(e) => setDomain(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="all">All Domains</option>
                                        <option value="safety">Safety</option>
                                        <option value="privacy">Privacy</option>
                                        <option value="bias">Bias</option>
                                        <option value="accountability">Accountability</option>
                                    </select>
                                </div>
                                <button className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg">
                                    Generate Recommendations
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Recommended Incidents Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Recommended Incidents</h2>
                                <button
                                    onClick={() => setShowPrismAnalysis(!showPrismAnalysis)}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100"
                                >
                                    {showPrismAnalysis ? (
                                        <>
                                            <span>Hide PRISM</span>
                                            <span><FiChevronUp /></span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Show PRISM</span>
                                            <span><FiChevronDown /></span>
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="space-y-4">
                                {mockIncidents.map((incident, index) => (
                                    <div
                                        key={incident.id}
                                        draggable
                                        onDragStart={() => handleDragStart(index)}
                                        onDragOver={(e) => { e.preventDefault(); handleDragOver(index); }}
                                        onDragEnd={handleDragEnd}
                                        className={`bg-white rounded-xl shadow p-6 transition-all border-2 flex flex-col relative
                                            ${draggedIndex === index ? 'border-indigo-500 ring-4 ring-indigo-100 z-10 scale-105 shadow-2xl' :
                                                draggedIndex !== null && draggedIndex !== index ? 'border-dashed border-indigo-200' : 'border-transparent'}
                                        `}
                                        style={{
                                            opacity: draggedIndex === index ? 0.7 : 1,
                                            cursor: 'grab',
                                            transition: 'box-shadow 0.2s, transform 0.2s, border 0.2s',
                                        }}
                                    >
                                        <div className="absolute top-2 right-2 cursor-grab text-gray-400 hover:text-indigo-600">
                                            <FiMove size={20} />
                                        </div>
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-xl font-semibold text-gray-900">{incident.title}</h3>
                                            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                                                incident.risk_level === 'high' ? 'bg-red-100 text-red-800' :
                                                incident.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                                {incident.risk_level.charAt(0).toUpperCase() + incident.risk_level.slice(1)} Risk
                                            </span>
                                        </div>
                                        <p className="text-gray-600 mb-4">{incident.description}</p>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {incident.technologies.map((tech, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                        {showPrismAnalysis && incident.prism_scores && (
                                            <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                                                <h4 className="text-sm font-medium text-indigo-900 mb-2">PRISM Analysis</h4>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {Object.entries(incident.prism_scores).map(([key, value]) => (
                                                        <div key={key} className="flex items-center justify-between">
                                                            <span className="text-xs text-indigo-700">{key.replace(/_/g, ' ')}</span>
                                                            <span className="text-xs font-medium text-indigo-900">{Math.round(value * 100)}%</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm text-gray-500">
                                                    Relevance: {Math.round(incident.confidence_score * 100)}%
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    Impact: {Math.round(incident.impact_scale * 100)}%
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                                                    <span><FiThumbsUp /></span>
                                                </button>
                                                <button className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg">
                                                    <span><FiThumbsDown /></span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Feedback & Iteration Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Feedback & Iteration</h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Suggested Improvements</h3>
                                    <div className="space-y-4">
                                        {mockExemplars.map(exemplar => (
                                            <div key={exemplar.id} className="p-4 bg-gray-50 rounded-lg">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-medium text-gray-900">{exemplar.title}</h4>
                                                    <span className="text-sm text-gray-500">
                                                        {Math.round(exemplar.similarity_score * 100)}% similar
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600">{exemplar.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Incident</h3>
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            placeholder="Incident Title"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                        <textarea
                                            placeholder="Incident Description"
                                            className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                        <button className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                                            <span><FiPlus /></span>
                                            Add Incident
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <button
                                        onClick={() => setShowSystemPrompt(!showSystemPrompt)}
                                        className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2"
                                    >
                                        {showSystemPrompt ? 'Hide System Prompt' : 'Show System Prompt'}
                                    </button>
                                    {showSystemPrompt && (
                                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                            <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                                                {`System: You are an AI assistant helping to analyze potential incidents and risks in AI systems.
                                                Your goal is to provide accurate, relevant, and actionable insights while maintaining
                                                ethical considerations and practical implementability.`}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}; 