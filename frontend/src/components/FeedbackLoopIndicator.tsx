import React, { useState, useEffect } from 'react';
import { FiZap, FiCheck, FiLoader, FiArrowRight, FiEye, FiX } from 'react-icons/fi';
import { FeedbackLoopService, FeedbackLoopFlow } from '../services/feedbackLoopService';

interface FeedbackLoopIndicatorProps {
    userId?: string;
    compact?: boolean;
    showDetails?: boolean;
    onViewFull?: () => void;
    onDismiss?: () => void;
    autoUpdate?: boolean;
}

export const FeedbackLoopIndicator: React.FC<FeedbackLoopIndicatorProps> = ({
    userId = 'current_user',
    compact = false,
    showDetails = true,
    onViewFull,
    onDismiss,
    autoUpdate = true
}) => {
    const [activeLoops, setActiveLoops] = useState<FeedbackLoopFlow[]>([]);
    const [totalImpact, setTotalImpact] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        loadLoops();
    }, [userId]);

    useEffect(() => {
        let interval: number;
        
        if (autoUpdate) {
            interval = window.setInterval(() => {
                FeedbackLoopService.simulateProgress();
                loadLoops();
                triggerAnimation();
            }, 4000);
        }

        return () => {
            if (interval) window.clearInterval(interval);
        };
    }, [autoUpdate]);

    const loadLoops = () => {
        const loops = FeedbackLoopService.getUserFeedbackLoops(userId);
        const activeLo = loops.filter(l => l.overallProgress < 1.0);
        
        setActiveLoops(activeLo);
        
        // Calculate total impact from all loops
        const impact = loops.reduce((sum, loop) => 
            sum + loop.impact.systemChanges.reduce((cSum, change) => 
                cSum + change.magnitude, 0), 0);
        setTotalImpact(impact);
    };

    const triggerAnimation = () => {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 1000);
    };

    const getMostActiveLoop = (): FeedbackLoopFlow | null => {
        if (activeLoops.length === 0) return null;
        return activeLoops.reduce((mostActive, current) => 
            current.overallProgress > mostActive.overallProgress ? current : mostActive
        );
    };

    const getCurrentStage = (loop: FeedbackLoopFlow) => {
        return loop.stages.find(s => s.status === 'active');
    };

    const getStageIcon = (stageName: string) => {
        const iconMap: { [key: string]: React.ReactNode } = {
            'Feedback Collection': '📝',
            'Feedback Analysis': '🔍',
            'Expert Validation': '👥',
            'System Update': '⚙️',
            'Quality Testing': '🧪',
            'Live Deployment': '🚀',
            'Impact Monitoring': '📊'
        };
        return iconMap[stageName] || '⚡';
    };

    const renderCompactIndicator = () => {
        const mostActive = getMostActiveLoop();
        
        return (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`transition-transform duration-300 ${isAnimating ? 'scale-110' : ''}`}>
                            <div className="text-blue-600">
                                <FiZap size={20} />
                            </div>
                        </div>
                        <div>
                            <div className="font-medium text-blue-900 text-sm">
                                Feedback Loop Active
                            </div>
                            {mostActive && (
                                <div className="text-xs text-blue-700">
                                    {getCurrentStage(mostActive)?.name || 'Processing'}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {mostActive && (
                            <div className="text-right">
                                <div className="text-sm font-bold text-blue-900">
                                    {Math.round(mostActive.overallProgress * 100)}%
                                </div>
                            </div>
                        )}
                        {onDismiss && (
                            <button
                                onClick={onDismiss}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FiX size={14} />
                            </button>
                        )}
                    </div>
                </div>
                
                {mostActive && (
                    <div className="mt-2">
                        <div className="w-full bg-blue-200 rounded-full h-1.5">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${mostActive.overallProgress * 100}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderDetailedIndicator = () => {
        if (activeLoops.length === 0) {
            return (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-gray-400 mb-2">
                        <FiZap size={24} />
                    </div>
                    <div className="text-sm text-gray-600">
                        No active feedback loops
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        Provide feedback to improve the system!
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-white border border-gray-200 rounded-lg">
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`transition-transform duration-300 ${isAnimating ? 'scale-110 rotate-12' : ''}`}>
                                <div className="text-indigo-600"><FiZap size={20} /></div>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">Active Feedback Loops</h4>
                                <p className="text-sm text-gray-600">
                                    {activeLoops.length} loop{activeLoops.length === 1 ? '' : 's'} improving the system
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <div className="text-lg font-bold text-indigo-600">
                                    +{Math.round(totalImpact * 100)}%
                                </div>
                                <div className="text-xs text-gray-500">Total Impact</div>
                            </div>
                            {onViewFull && (
                                <button
                                    onClick={onViewFull}
                                    className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1"
                                >
                                    <FiEye size={14} />
                                    View All
                                </button>
                            )}
                            {onDismiss && (
                                <button
                                    onClick={onDismiss}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FiX size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Loop List */}
                <div className="divide-y divide-gray-100">
                    {activeLoops.slice(0, 3).map((loop, index) => {
                        const currentStage = getCurrentStage(loop);
                        return (
                            <div key={loop.id} className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="text-lg">
                                            {currentStage ? getStageIcon(currentStage.name) : '⚡'}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900 text-sm">
                                                {currentStage?.name || 'Processing'}
                                            </div>
                                            <div className="text-xs text-gray-600">
                                                Feedback ID: {loop.feedbackId}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-gray-900">
                                            {Math.round(loop.overallProgress * 100)}%
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {currentStage?.timeEstimate || 'Processing'}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Progress Bar */}
                                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500 ease-out"
                                        style={{ width: `${loop.overallProgress * 100}%` }}
                                    />
                                </div>

                                {/* Stage Progress */}
                                {currentStage && (
                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                        <div className="animate-spin text-blue-500">
                                            <FiLoader size={12} />
                                        </div>
                                        <span>{currentStage.description}</span>
                                        <div className="flex-1"></div>
                                        <span>{Math.round(currentStage.progress * 100)}% stage complete</span>
                                    </div>
                                )}

                                {/* System Changes */}
                                {loop.impact.systemChanges.length > 0 && (
                                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                                        <div className="flex items-center gap-1 text-green-700">
                                            <FiCheck size={12} />
                                            <span className="font-medium">
                                                {loop.impact.systemChanges.length} improvement{loop.impact.systemChanges.length === 1 ? '' : 's'} generated
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {activeLoops.length > 3 && (
                        <div className="p-3 text-center text-sm text-gray-500">
                            +{activeLoops.length - 3} more active loop{activeLoops.length - 3 === 1 ? '' : 's'}
                        </div>
                    )}
                </div>

                {/* Quick Stats */}
                <div className="p-3 bg-gray-50 border-t border-gray-200">
                    <div className="grid grid-cols-3 gap-3 text-center text-xs">
                        <div>
                            <div className="font-medium text-gray-900">
                                {activeLoops.reduce((sum, loop) => 
                                    sum + loop.impact.systemChanges.length, 0)}
                            </div>
                            <div className="text-gray-500">Changes</div>
                        </div>
                        <div>
                            <div className="font-medium text-gray-900">
                                {Math.round(activeLoops.reduce((sum, loop) => 
                                    sum + loop.overallProgress, 0) / Math.max(activeLoops.length, 1) * 100)}%
                            </div>
                            <div className="text-gray-500">Avg Progress</div>
                        </div>
                        <div>
                            <div className="font-medium text-gray-900">
                                {activeLoops.filter(loop => loop.estimatedCompletion && 
                                    new Date(loop.estimatedCompletion) < new Date(Date.now() + 60 * 60 * 1000)).length}
                            </div>
                            <div className="text-gray-500">Completing Soon</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (compact) {
        return renderCompactIndicator();
    }

    return renderDetailedIndicator();
}; 