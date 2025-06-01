import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Incident, Feedback } from '../types';
import { mockService } from '../services/mockData';

export const FeedbackPanel: React.FC = () => {
    const [searchParams] = useSearchParams();
    const incidentId = searchParams.get('incidentId');
    const [incident, setIncident] = useState<Incident | null>(null);
    const [feedback, setFeedback] = useState<Partial<Feedback>>({
        user_comment: '',
        suggested_incidents: [],
        index_labels: []
    });
    const [newSuggestedIncident, setNewSuggestedIncident] = useState('');
    const [newIndexLabel, setNewIndexLabel] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIncident = async () => {
            if (!incidentId) return;
            try {
                const data = await mockService.getIncident(parseInt(incidentId));
                setIncident(data);
            } catch (error) {
                console.error('Error fetching incident:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchIncident();
    }, [incidentId]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
        if (!incidentId) return;

        try {
            await mockService.submitFeedback(parseInt(incidentId), feedback as Feedback);
        // Reset form
        setFeedback({
                user_comment: '',
                suggested_incidents: [],
                index_labels: []
        });
            alert('Feedback submitted successfully!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
            alert('Error submitting feedback. Please try again.');
    }
  };

    if (loading) {
        return <div className="text-center py-8">Loading incident...</div>;
    }

    if (!incident) {
        return <div className="text-center py-8">Incident not found</div>;
    }

  return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6">Feedback Panel</h2>

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
                <div className="flex flex-wrap gap-2 mt-2">
                    {incident.purposes.map((purpose, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                            {purpose}
                        </span>
                    ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                    {incident.ethical_issues.map((issue, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                        >
                            {issue}
                        </span>
                    ))}
            </div>
          </div>

            <form onSubmit={handleSubmit} className="space-y-6">
          <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Comments
            </label>
            <textarea
                        value={feedback.user_comment}
                        onChange={(e) => setFeedback(prev => ({ ...prev, user_comment: e.target.value }))}
              rows={4}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Share your thoughts about this incident..."
            />
          </div>

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

          <button
            type="submit"
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Submit Feedback
          </button>
        </form>
    </div>
  );
}; 