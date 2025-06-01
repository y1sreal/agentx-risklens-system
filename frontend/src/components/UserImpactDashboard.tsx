import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiAward, FiUsers, FiTarget, FiArrowUp, FiArrowDown, FiInfo, FiCheck, FiClock, FiZap } from 'react-icons/fi';
import { UserImpactService, UserImpactReport, Achievement, SystemImprovement, CollaborativeInsight } from '../services/userImpactService';

interface UserImpactDashboardProps {
    userId?: string;
    timeframeDays?: number;
    compact?: boolean;
}

export const UserImpactDashboard: React.FC<UserImpactDashboardProps> = ({
    userId = 'current_user',
    timeframeDays = 30,
    compact = false
}) => {
    const [impactReport, setImpactReport] = useState<UserImpactReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedTimeframe, setSelectedTimeframe] = useState(timeframeDays);

    useEffect(() => {
        const loadImpactData = async () => {
            setLoading(true);
            // Initialize sample data if needed
            UserImpactService.initializeSampleData();
            
            const report = UserImpactService.getUserImpactReport(userId, selectedTimeframe);
            setImpactReport(report);
            setLoading(false);
        };

        loadImpactData();
    }, [userId, selectedTimeframe]);

    if (loading || !impactReport) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const { metrics, improvements, insights, trends, achievements, nextSteps } = impactReport;

    const getTrendIcon = (trend: number) => {
        if (trend > 0) return <div className="text-green-500"><FiArrowUp size={16} /></div>;
        if (trend < 0) return <div className="text-red-500"><FiArrowDown size={16} /></div>;
        return <span className="text-gray-400">—</span>;
    };

    const getTrendColor = (trend: number) => {
        if (trend > 0) return 'text-green-600';
        if (trend < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    const getScoreColor = (score: number) => {
        if (score >= 0.8) return 'text-green-600';
        if (score >= 0.6) return 'text-yellow-600';
        return 'text-orange-600';
    };

    const getScoreBg = (score: number) => {
        if (score >= 0.8) return 'bg-green-50 border-green-200';
        if (score >= 0.6) return 'bg-yellow-50 border-yellow-200';
        return 'bg-orange-50 border-orange-200';
    };

    const renderMetricsGrid = () => (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-600">Total Actions</h4>
                    {getTrendIcon(trends.activityTrend)}
                </div>
                <div className="text-2xl font-bold text-gray-900">{metrics.totalActions}</div>
                <div className={`text-xs ${getTrendColor(trends.activityTrend)}`}>
                    {trends.activityTrend > 0 ? '+' : ''}{(trends.activityTrend * 100).toFixed(1)}% trend
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-600">Feedback Given</h4>
                    <div className="text-indigo-500"><FiZap size={16} /></div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{metrics.feedbackGiven}</div>
                <div className="text-xs text-gray-500">
                    Quality: {Math.round(metrics.collaborativeScore * 100)}%
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-600">System Impact</h4>
                    <div className="text-purple-500"><FiTarget size={16} /></div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{metrics.systemOptimizations}</div>
                <div className="text-xs text-purple-600">
                    Influence: {Math.round(metrics.influenceScore * 100)}%
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-600">Collaboration</h4>
                    {getTrendIcon(trends.collaborationTrend)}
                </div>
                <div className="text-2xl font-bold text-gray-900">
                    {Math.round(metrics.collaborativeScore * 100)}%
                </div>
                <div className={`text-xs ${getTrendColor(trends.collaborationTrend)}`}>
                    Consistency: {Math.round(metrics.consistencyScore * 100)}%
                </div>
            </div>
        </div>
    );

    const renderAchievements = () => (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiAward size={20} color="#F59E0B" />
                Achievements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.slice(0, compact ? 3 : 6).map((achievement) => (
                    <div
                        key={achievement.id}
                        className={`p-4 rounded-lg border transition-all ${
                            achievement.unlocked 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-gray-50 border-gray-200'
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            <div className="text-2xl">{achievement.icon}</div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className={`font-medium ${
                                        achievement.unlocked ? 'text-green-900' : 'text-gray-700'
                                    }`}>
                                        {achievement.title}
                                    </h4>
                                    {achievement.unlocked && (
                                        <FiCheck size={16} color="#10B981" />
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                    {achievement.description}
                                </p>
                                <div className="space-y-2">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all ${
                                                achievement.unlocked ? 'bg-green-500' : 'bg-indigo-500'
                                            }`}
                                            style={{ width: `${achievement.progress * 100}%` }}
                                        />
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {achievement.requirement}
                                    </div>
                                    <div className="text-xs text-indigo-600 font-medium">
                                        Impact: {achievement.impact}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderSystemImprovements = () => (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiTrendingUp size={20} color="#059669" />
                System Improvements
                <span className="text-sm text-gray-500 font-normal">
                    ({improvements.length} this period)
                </span>
            </h3>
            
            {improvements.length > 0 ? (
                <div className="space-y-4">
                    {improvements.slice(0, compact ? 2 : 4).map((improvement) => (
                        <div key={improvement.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 mb-1">
                                        {improvement.description}
                                    </h4>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <FiUsers size={14} />
                                            Your contribution: {Math.round(improvement.userContribution * 100)}%
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <FiTarget size={14} />
                                            Impact: {Math.round(improvement.impactMagnitude * 100)}%
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <FiClock size={14} />
                                            {new Date(improvement.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        improvement.type === 'prism_score_update' ? 'bg-blue-100 text-blue-700' :
                                        improvement.type === 'algorithm_adjustment' ? 'bg-purple-100 text-purple-700' :
                                        improvement.type === 'taxonomy_refinement' ? 'bg-green-100 text-green-700' :
                                        'bg-orange-100 text-orange-700'
                                    }`}>
                                        {improvement.type.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                            
                            {improvement.beforeMetric && improvement.afterMetric && (
                                <div className="mt-3 p-3 bg-gray-50 rounded">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Before: {improvement.beforeMetric.toFixed(2)}</span>
                                        <div className="text-green-500"><FiArrowUp size={16} /></div>
                                        <span className="text-green-600 font-medium">
                                            After: {improvement.afterMetric.toFixed(2)}
                                        </span>
                                        <span className="text-xs text-green-600">
                                            +{((improvement.afterMetric - improvement.beforeMetric) * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    <div className="mx-auto mb-2 text-gray-400"><FiInfo size={32} /></div>
                    <p>No system improvements recorded yet.</p>
                    <p className="text-sm">Your feedback and actions will start generating improvements!</p>
                </div>
            )}
        </div>
    );

    const renderCollaborativeInsights = () => (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiUsers size={20} color="#8B5CF6" />
                Community Insights
            </h3>
            
            {insights.length > 0 ? (
                <div className="space-y-4">
                    {insights.slice(0, compact ? 2 : 3).map((insight) => (
                        <div key={insight.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 mb-1">{insight.title}</h4>
                                    <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span>{insight.userCount} contributors</span>
                                        <span>Consensus: {Math.round(insight.consensusLevel * 100)}%</span>
                                        <span>{new Date(insight.timestamp).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    insight.impact === 'high' ? 'bg-red-100 text-red-700' :
                                    insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-green-100 text-green-700'
                                }`}>
                                    {insight.impact} impact
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    <div className="mx-auto mb-2 text-gray-400"><FiUsers size={32} /></div>
                    <p>No community insights available yet.</p>
                    <p className="text-sm">Continue contributing to help generate collaborative insights!</p>
                </div>
            )}
        </div>
    );

    const renderNextSteps = () => (
        <div className={`p-4 rounded-lg border ${getScoreBg(metrics.collaborativeScore)}`}>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FiTarget size={18} />
                Next Steps
            </h3>
            <div className="space-y-2">
                {nextSteps.map((step, index) => (
                    <div key={index} className="flex items-start gap-2">
                        <span className="text-indigo-600 font-bold text-sm mt-0.5">{index + 1}.</span>
                        <span className="text-sm text-gray-700">{step}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Impact Dashboard</h2>
                        <p className="text-gray-600">
                            Track how your contributions improve the AI incident analysis system
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-gray-700">Timeframe:</label>
                        <select
                            value={selectedTimeframe}
                            onChange={(e) => setSelectedTimeframe(Number(e.target.value))}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value={7}>Last 7 days</option>
                            <option value={30}>Last 30 days</option>
                            <option value={90}>Last 90 days</option>
                            <option value={365}>Last year</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            {renderMetricsGrid()}

            {/* Achievements */}
            {renderAchievements()}

            {/* System Improvements and Community Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    {renderSystemImprovements()}
                </div>
                <div>
                    {renderCollaborativeInsights()}
                </div>
            </div>

            {/* Next Steps */}
            {renderNextSteps()}
        </div>
    );
}; 