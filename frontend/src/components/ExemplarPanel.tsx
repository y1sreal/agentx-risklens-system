import React, { useState, useEffect } from 'react';
import { Incident, Feedback } from '../types';
import { mockService } from '../services/mockData';
import { FiX } from 'react-icons/fi';

interface ExemplarPanelProps {
    isOpen: boolean;
    onClose: () => void;
    incidentId: number;
    feedbackHistory: Feedback[];
}

export const ExemplarPanel: React.FC<ExemplarPanelProps> = ({
    isOpen,
    onClose,
    incidentId,
    feedbackHistory,
}) => {
    const [exemplars, setExemplars] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExemplars = async () => {
            try {
                const data = await mockService.getSimilarExemplars(incidentId);
                setExemplars(data);
            } catch (error) {
                console.error('Error fetching exemplars:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchExemplars();
        }
    }, [incidentId, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-40">
            <div className="h-full flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Current Exemplars</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <FiX size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {exemplars.map((exemplar) => (
                                <div
                                    key={exemplar.id}
                                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                                >
                                    <h3 className="font-medium text-gray-900 mb-2">{exemplar.title}</h3>
                                    <p className="text-sm text-gray-600 mb-3">{exemplar.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {exemplar.technologies.map((tech, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                    {exemplar.prism_scores && (
                                        <div className="mt-3 grid grid-cols-2 gap-2">
                                            {Object.entries(exemplar.prism_scores).map(([key, value]) => (
                                                <div key={key} className="flex items-center gap-2">
                                                    <div className="flex-1">
                                                        <div className="text-xs text-gray-500 capitalize">
                                                            {key.replace(/_/g, ' ')}
                                                        </div>
                                                        <div className="h-1.5 w-full bg-gray-200 rounded-full">
                                                            <div
                                                                className="h-full bg-indigo-600 rounded-full"
                                                                style={{ width: `${value * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-700">
                                                        {Math.round(value * 100)}%
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}; 