import React, { useState, useEffect } from 'react';
import { FiArrowRight, FiClock, FiCheck, FiLoader, FiAlertCircle, FiEye, FiX } from 'react-icons/fi';
import { FeedbackLoopService, FeedbackLoopFlow, FeedbackLoopStage, FeedbackLoopVisualizationData } from '../services/feedbackLoopService';

interface VisualFeedbackLoopProps {
    userId?: string;
    showGlobalStats?: boolean;
    compact?: boolean;
    autoProgress?: boolean;
    onViewDetails?: (loopId: string) => void;
}

export const VisualFeedbackLoop: React.FC<VisualFeedbackLoopProps> = ({
    userId = 'current_user',
    showGlobalStats = true,
    compact = false,
    autoProgress = true,
    onViewDetails
}) => {
    const [userLoops, setUserLoops] = useState<FeedbackLoopFlow[]>([]);
    const [visualData, setVisualData] = useState<FeedbackLoopVisualizationData | null>(null);
    const [selectedLoop, setSelectedLoop] = useState<FeedbackLoopFlow | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        // Initialize with mock data if empty
        const existingLoops = FeedbackLoopService.getUserFeedbackLoops(userId);
        if (existingLoops.length === 0) {
            FeedbackLoopService.generateMockData();
        }

        loadFeedbackData();
    }, [userId]);

    useEffect(() => {
        let interval: number;
        
        if (autoProgress) {
            interval = window.setInterval(() => {
                FeedbackLoopService.simulateProgress();
                loadFeedbackData();
            }, 3000); // Update every 3 seconds
        }

        return () => {
            if (interval) window.clearInterval(interval);
        };
    }, [autoProgress]);

    const loadFeedbackData = () => {
        const loops = FeedbackLoopService.getUserFeedbackLoops(userId);
        const data = FeedbackLoopService.getVisualizationData();
        setUserLoops(loops);
        setVisualData(data);
    };

    const handleStageClick = (loop: FeedbackLoopFlow, stage: FeedbackLoopStage) => {
        if (stage.status === 'active') {
            setIsAnimating(true);
            FeedbackLoopService.advanceStage(loop.id, stage.id, stage.progress + 0.3);
            loadFeedbackData();
            setTimeout(() => setIsAnimating(false), 1000);
        }
    };

    const getStageStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-500 text-white';
            case 'active': return 'bg-blue-500 text-white animate-pulse';
            case 'pending': return 'bg-gray-300 text-gray-600';
            case 'failed': return 'bg-red-500 text-white';
            default: return 'bg-gray-300 text-gray-600';
        }
    };

    const getStageIcon = (stage: FeedbackLoopStage) => {
        if (stage.status === 'completed') return <FiCheck size={16} />;
        if (stage.status === 'active') return <div className="animate-spin"><FiLoader size={16} /></div>;
        if (stage.status === 'failed') return <FiAlertCircle size={16} />;
        return <FiClock size={16} />;
    };

    const renderStageFlow = (loop: FeedbackLoopFlow) => (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Feedback Loop Progress</h3>
                    <p className="text-sm text-gray-600">
                        Feedback ID: {loop.feedbackId} • Started: {new Date(loop.startTime).toLocaleString()}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <div className="text-2xl font-bold text-indigo-600">
                            {Math.round(loop.overallProgress * 100)}%
                        </div>
                        <div className="text-xs text-gray-500">Complete</div>
                    </div>
                    {onViewDetails && (
                        <button
                            onClick={() => onViewDetails(loop.id)}
                            className="p-2 text-gray-500 hover:text-gray-700"
                        >
                            <FiEye size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                <div
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${loop.overallProgress * 100}%` }}
                />
            </div>

            {/* Stage Flow */}
            <div className="flex items-center justify-between">
                {loop.stages.map((stage, index) => (
                    <React.Fragment key={stage.id}>
                        <div className="flex flex-col items-center group">
                            {/* Stage Circle */}
                            <button
                                onClick={() => handleStageClick(loop, stage)}
                                disabled={stage.status === 'pending' || stage.status === 'completed'}
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                                    getStageStatusColor(stage.status)
                                } ${stage.status === 'active' ? 'cursor-pointer hover:scale-110' : 'cursor-default'} ${
                                    isAnimating && stage.status === 'active' ? 'scale-110' : ''
                                }`}
                            >
                                {getStageIcon(stage)}
                            </button>

                            {/* Stage Info */}
                            <div className="mt-2 text-center max-w-20">
                                <div className="text-xs font-medium text-gray-900 truncate">
                                    {stage.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {stage.timeEstimate}
                                </div>
                                
                                {/* Progress for active stage */}
                                {stage.status === 'active' && (
                                    <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
                                        <div
                                            className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                                            style={{ width: `${stage.progress * 100}%` }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Tooltip on hover */}
                            <div className="absolute z-10 invisible group-hover:visible bg-gray-900 text-white text-xs rounded py-2 px-3 bottom-full mb-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                                <div className="font-medium">{stage.name}</div>
                                <div className="text-gray-300">{stage.description}</div>
                                {stage.outputs && (
                                    <div className="mt-1 text-gray-400">
                                        Outputs: {stage.outputs.slice(0, 2).join(', ')}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Arrow between stages */}
                        {index < loop.stages.length - 1 && (
                            <div className="flex-1 flex items-center justify-center px-2">
                                <div className={`transition-colors duration-300 ${
                                    loop.stages[index + 1].status !== 'pending' 
                                        ? 'text-green-500' 
                                        : 'text-gray-300'
                                }`}>
                                    <FiArrowRight size={20} />
                                </div>
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Current Stage Details */}
            {loop.stages.find(s => s.status === 'active') && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="text-blue-600 animate-spin"><FiLoader size={16} /></div>
                        <h4 className="font-medium text-blue-900">
                            Currently: {loop.stages.find(s => s.status === 'active')?.name}
                        </h4>
                    </div>
                    <p className="text-sm text-blue-800">
                        {loop.stages.find(s => s.status === 'active')?.description}
                    </p>
                    {loop.estimatedCompletion && (
                        <div className="text-xs text-blue-600 mt-2">
                            Estimated completion: {new Date(loop.estimatedCompletion).toLocaleString()}
                        </div>
                    )}
                </div>
            )}

            {/* Impact Summary */}
            {loop.impact.systemChanges.length > 0 && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                        <FiCheck size={16} />
                        System Improvements Generated
                    </h4>
                    <div className="space-y-2">
                        {loop.impact.systemChanges.slice(-2).map((change, index) => (
                            <div key={index} className="text-sm text-green-800">
                                <div className="font-medium">{change.description}</div>
                                <div className="text-xs text-green-600">
                                    Impact: {Math.round(change.magnitude * 100)}% • 
                                    Confidence: {Math.round(change.confidence * 100)}%
                                </div>
                            </div>
                        ))}
                        {loop.impact.systemChanges.length > 2 && (
                            <div className="text-xs text-green-600">
                                +{loop.impact.systemChanges.length - 2} more improvements
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    const renderGlobalStats = () => (
        visualData && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Feedback Loop Analytics</h3>
                
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{visualData.activeLoops}</div>
                        <div className="text-sm text-gray-500">Active Loops</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{visualData.completedLoops}</div>
                        <div className="text-sm text-gray-500">Completed</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{visualData.averageCompletionTime}</div>
                        <div className="text-sm text-gray-500">Avg. Time</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{visualData.systemImprovements}</div>
                        <div className="text-sm text-gray-500">Improvements</div>
                    </div>
                </div>

                {/* Impact Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-green-50 p-3 rounded-lg text-center">
                        <div className="text-lg font-bold text-green-600">
                            +{Math.round(visualData.impactMetrics.accuracyImprovement * 100)}%
                        </div>
                        <div className="text-xs text-green-700">Accuracy</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <div className="text-lg font-bold text-blue-600">
                            -{Math.round(visualData.impactMetrics.biasReduction * 100)}%
                        </div>
                        <div className="text-xs text-blue-700">Bias</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg text-center">
                        <div className="text-lg font-bold text-purple-600">
                            +{Math.round(visualData.impactMetrics.userSatisfaction * 100)}%
                        </div>
                        <div className="text-xs text-purple-700">Satisfaction</div>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg text-center">
                        <div className="text-lg font-bold text-orange-600">
                            +{Math.round(visualData.impactMetrics.dataQuality * 100)}%
                        </div>
                        <div className="text-xs text-orange-700">Data Quality</div>
                    </div>
                </div>

                {/* Stage Throughput */}
                <div>
                    <h4 className="font-medium text-gray-900 mb-3">Stage Performance</h4>
                    <div className="space-y-2">
                        {visualData.stageThroughput.map((stage, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">{stage.stage}</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-500">{stage.averageTime}</span>
                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-indigo-500 h-2 rounded-full"
                                            style={{ width: `${stage.successRate * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-gray-900 w-8">
                                        {Math.round(stage.successRate * 100)}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    );

    const renderCompactView = () => (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-blue-900">Feedback Loops Active</h4>
                <div className="text-sm text-blue-700">
                    {visualData?.activeLoops || 0} running
                </div>
            </div>
            
            {userLoops.slice(0, 1).map(loop => (
                <div key={loop.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-800">
                            Current: {loop.stages.find(s => s.status === 'active')?.name || 'Processing'}
                        </span>
                        <span className="text-sm font-medium text-blue-900">
                            {Math.round(loop.overallProgress * 100)}%
                        </span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                        <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${loop.overallProgress * 100}%` }}
                        />
                    </div>
                    <div className="text-xs text-blue-600">
                        {loop.impact.systemChanges.length} improvements generated
                    </div>
                </div>
            ))}

            {userLoops.length === 0 && (
                <div className="text-center text-blue-700 py-2">
                    <div className="text-sm">No active feedback loops</div>
                    <div className="text-xs text-blue-600">Provide feedback to start improving the system!</div>
                </div>
            )}
        </div>
    );

    if (compact) {
        return renderCompactView();
    }

    return (
        <div className="space-y-6">
            {/* Global Statistics */}
            {showGlobalStats && renderGlobalStats()}

            {/* User's Active Loops */}
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Feedback Loops</h2>
                {userLoops.length > 0 ? (
                    userLoops.map(loop => renderStageFlow(loop))
                ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                        <div className="text-gray-400 mb-3">
                            <FiLoader size={48} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Feedback Loops</h3>
                        <p className="text-gray-600 mb-4">
                            Start providing feedback on incidents to see your impact on system improvements!
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Refresh to Check for Updates
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}; 