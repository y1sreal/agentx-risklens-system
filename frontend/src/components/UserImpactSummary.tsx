import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiAward, FiEye, FiX } from 'react-icons/fi';
import { UserImpactService, ImpactMetrics, Achievement } from '../services/userImpactService';

interface UserImpactSummaryProps {
    userId?: string;
    showDetails?: boolean;
    onViewFullDashboard?: () => void;
    onDismiss?: () => void;
}

export const UserImpactSummary: React.FC<UserImpactSummaryProps> = ({
    userId = 'current_user',
    showDetails = false,
    onViewFullDashboard,
    onDismiss
}) => {
    const [metrics, setMetrics] = useState<ImpactMetrics | null>(null);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Initialize sample data if needed
        UserImpactService.initializeSampleData();
        
        const report = UserImpactService.getUserImpactReport(userId, 7); // Last 7 days
        setMetrics(report.metrics);
        setAchievements(report.achievements);
    }, [userId]);

    if (!isVisible || !metrics) return null;

    const handleDismiss = () => {
        setIsVisible(false);
        if (onDismiss) onDismiss();
    };

    const getImpactLevel = () => {
        const score = (metrics.collaborativeScore + metrics.influenceScore) / 2;
        if (score >= 0.7) return { level: 'High', color: 'text-green-600', bg: 'bg-green-50 border-green-200' };
        if (score >= 0.4) return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' };
        return { level: 'Growing', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' };
    };

    const recentAchievements = achievements.filter(a => a.unlocked).slice(0, 2);
    const nextAchievement = achievements.find(a => !a.unlocked && a.progress > 0);
    const impactInfo = getImpactLevel();

    return (
        <div className={`border rounded-lg p-4 mb-4 ${impactInfo.bg}`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="text-indigo-600"><FiTrendingUp size={18} /></div>
                    <h3 className="font-medium text-gray-900">Your Impact This Week</h3>
                </div>
                <div className="flex items-center gap-2">
                    {onViewFullDashboard && (
                        <button
                            onClick={onViewFullDashboard}
                            className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                        >
                            <FiEye size={14} />
                            View Full Dashboard
                        </button>
                    )}
                    <button
                        onClick={handleDismiss}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <FiX size={16} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-3">
                <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{metrics.totalActions}</div>
                    <div className="text-xs text-gray-500">Actions</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{metrics.feedbackGiven}</div>
                    <div className="text-xs text-gray-500">Feedback</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{metrics.systemOptimizations}</div>
                    <div className="text-xs text-gray-500">Improvements</div>
                </div>
                <div className="text-center">
                    <div className={`text-lg font-bold ${impactInfo.color}`}>
                        {impactInfo.level}
                    </div>
                    <div className="text-xs text-gray-500">Impact</div>
                </div>
            </div>

            {showDetails && (
                <div className="space-y-3 pt-3 border-t border-gray-200">
                    {/* Recent Achievements */}
                    {recentAchievements.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                <FiAward size={14} color="#F59E0B" />
                                Recent Achievements
                            </h4>
                            <div className="space-y-1">
                                {recentAchievements.map(achievement => (
                                    <div key={achievement.id} className="flex items-center gap-2 text-sm">
                                        <span className="text-base">{achievement.icon}</span>
                                        <span className="text-gray-700">{achievement.title}</span>
                                        <span className="text-green-600 text-xs">✓</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Next Achievement Progress */}
                    {nextAchievement && (
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Next Achievement</h4>
                            <div className="bg-white rounded p-3 border border-gray-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-base">{nextAchievement.icon}</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {nextAchievement.title}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-indigo-500 h-2 rounded-full transition-all"
                                            style={{ width: `${nextAchievement.progress * 100}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-600">{nextAchievement.requirement}</span>
                                        <span className="text-indigo-600 font-medium">
                                            {Math.round(nextAchievement.progress * 100)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quick Tips */}
                    <div className="bg-white rounded p-3 border border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Tips</h4>
                        <div className="text-xs text-gray-600 space-y-1">
                            {metrics.feedbackGiven === 0 && (
                                <p>💡 Provide feedback on incidents to start improving the system</p>
                            )}
                            {metrics.feedbackGiven > 0 && metrics.collaborativeScore < 0.5 && (
                                <p>💡 Write more detailed feedback comments for better impact</p>
                            )}
                            {metrics.systemOptimizations === 0 && (
                                <p>💡 Your feedback helps optimize the system algorithms</p>
                            )}
                            {metrics.totalActions > 5 && (
                                <p>🎉 Great activity! You're making a real difference</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}; 