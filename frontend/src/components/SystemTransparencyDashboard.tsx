import React, { useState, useEffect } from 'react';
import { FiCpu, FiDatabase, FiAlertTriangle, FiBarChart, FiShield, FiBookOpen, FiEye, FiSettings, FiInfo } from 'react-icons/fi';
import { SystemTransparencyService, SystemTransparencyReport, AlgorithmExplanation, SystemLimitation, DataSourceInfo, DecisionTrace } from '../services/systemTransparencyService';

interface SystemTransparencyDashboardProps {
    showDecisionTrace?: boolean;
    currentAlgorithm?: string;
    compact?: boolean;
}

export const SystemTransparencyDashboard: React.FC<SystemTransparencyDashboardProps> = ({
    showDecisionTrace = false,
    currentAlgorithm,
    compact = false
}) => {
    const [transparencyReport, setTransparencyReport] = useState<SystemTransparencyReport | null>(null);
    const [selectedTab, setSelectedTab] = useState<'overview' | 'algorithms' | 'limitations' | 'data' | 'ethics'>('overview');
    const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmExplanation | null>(null);
    const [decisionTrace, setDecisionTrace] = useState<DecisionTrace | null>(null);

    useEffect(() => {
        const report = SystemTransparencyService.getSystemTransparencyReport();
        setTransparencyReport(report);
        
        if (currentAlgorithm) {
            const algInfo = SystemTransparencyService.getAlgorithmExplanation(currentAlgorithm);
            setSelectedAlgorithm(algInfo);
        }
    }, [currentAlgorithm]);

    useEffect(() => {
        if (showDecisionTrace && currentAlgorithm) {
            // Generate a sample decision trace
            const trace = SystemTransparencyService.generateDecisionTrace(
                { technologies: ['Computer Vision', 'Deep Learning'] },
                currentAlgorithm,
                { incidents: 5, avgScore: 0.75 }
            );
            setDecisionTrace(trace);
        }
    }, [showDecisionTrace, currentAlgorithm]);

    if (!transparencyReport) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'high': return 'text-red-600 bg-red-50 border-red-200';
            case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'low': return 'text-green-600 bg-green-50 border-green-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getQualityColor = (score: number) => {
        if (score >= 0.8) return 'text-green-600';
        if (score >= 0.6) return 'text-yellow-600';
        return 'text-red-600';
    };

    const renderOverview = () => (
        <div className="space-y-6">
            {/* System Overview */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="text-indigo-600"><FiCpu size={20} /></div>
                    System Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-medium text-gray-800 mb-3">Architecture</h4>
                        <p className="text-sm text-gray-600 mb-3">{transparencyReport.systemOverview.architecture}</p>
                        <div className="text-sm">
                            <span className="text-gray-500">Version:</span>
                            <span className="ml-2 font-mono text-indigo-600">{transparencyReport.systemOverview.version}</span>
                        </div>
                        <div className="text-sm mt-1">
                            <span className="text-gray-500">Last Updated:</span>
                            <span className="ml-2">{transparencyReport.systemOverview.lastUpdated}</span>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-800 mb-3">Components</h4>
                        <div className="space-y-2">
                            {transparencyReport.systemOverview.components.map((component, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                    <span className="text-gray-700">{component}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Model Performance */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="text-green-600"><FiBarChart size={20} /></div>
                    Model Performance
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                            {Math.round(transparencyReport.modelMetrics.accuracy * 100)}%
                        </div>
                        <div className="text-sm text-gray-500">Accuracy</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                            {Math.round(transparencyReport.modelMetrics.precision * 100)}%
                        </div>
                        <div className="text-sm text-gray-500">Precision</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                            {Math.round(transparencyReport.modelMetrics.recall * 100)}%
                        </div>
                        <div className="text-sm text-gray-500">Recall</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                            {transparencyReport.modelMetrics.f1Score.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">F1 Score</div>
                    </div>
                </div>

                {/* Performance by Category */}
                <div>
                    <h4 className="font-medium text-gray-800 mb-3">Performance by Category</h4>
                    <div className="space-y-2">
                        {transparencyReport.modelMetrics.performanceByCategory.map((cat, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">{cat.category}</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-indigo-500 h-2 rounded-full"
                                            style={{ width: `${cat.score * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 w-12">
                                        {Math.round(cat.score * 100)}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                    <div className="text-2xl font-bold text-indigo-600 mb-1">
                        {transparencyReport.algorithms.length}
                    </div>
                    <div className="text-sm text-gray-600">Algorithms</div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600 mb-1">
                        {transparencyReport.limitations.length}
                    </div>
                    <div className="text-sm text-gray-600">Known Limitations</div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                        {transparencyReport.dataSources.length}
                    </div>
                    <div className="text-sm text-gray-600">Data Sources</div>
                </div>
            </div>
        </div>
    );

    const renderAlgorithms = () => (
        <div className="space-y-6">
            {transparencyReport.algorithms.map((algorithm) => (
                <div key={algorithm.id} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{algorithm.name}</h3>
                            <p className="text-gray-600 mb-2">{algorithm.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="capitalize bg-gray-100 px-2 py-1 rounded">{algorithm.type}</span>
                                <span>Confidence: {Math.round(algorithm.confidence * 100)}%</span>
                                <span>Updated: {algorithm.lastUpdated}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedAlgorithm(selectedAlgorithm?.id === algorithm.id ? null : algorithm)}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            {selectedAlgorithm?.id === algorithm.id ? 'Hide Details' : 'View Details'}
                        </button>
                    </div>

                    {selectedAlgorithm?.id === algorithm.id && (
                        <div className="space-y-4 pt-4 border-t border-gray-200">
                            {/* Methodology */}
                            <div>
                                <h4 className="font-medium text-gray-800 mb-2">Methodology</h4>
                                <p className="text-sm text-gray-600">{algorithm.methodology}</p>
                            </div>

                            {/* Input Factors */}
                            <div>
                                <h4 className="font-medium text-gray-800 mb-3">Input Factors</h4>
                                <div className="space-y-3">
                                    {algorithm.inputFactors.map((factor, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-3">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h5 className="font-medium text-gray-900">{factor.name}</h5>
                                                    <p className="text-sm text-gray-600">{factor.description}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        Weight: {Math.round(factor.weight * 100)}%
                                                    </div>
                                                    <div className={`text-xs px-2 py-1 rounded ${
                                                        factor.impact === 'high' ? 'bg-red-100 text-red-700' :
                                                        factor.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-green-100 text-green-700'
                                                    }`}>
                                                        {factor.impact} impact
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span>Source: {factor.source}</span>
                                                <span className={getQualityColor(factor.quality)}>
                                                    Quality: {Math.round(factor.quality * 100)}%
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Limitations and Biases */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium text-gray-800 mb-2">Limitations</h4>
                                    <div className="space-y-1">
                                        {algorithm.limitations.map((limitation, index) => (
                                            <div key={index} className="text-sm text-orange-700 bg-orange-50 p-2 rounded">
                                                • {limitation}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-800 mb-2">Potential Biases</h4>
                                    <div className="space-y-1">
                                        {algorithm.biases.map((bias, index) => (
                                            <div key={index} className="text-sm text-red-700 bg-red-50 p-2 rounded">
                                                • {bias}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    const renderLimitations = () => (
        <div className="space-y-4">
            {transparencyReport.limitations.map((limitation) => (
                <div key={limitation.id} className={`rounded-lg border p-6 ${getImpactColor(limitation.impact)}`}>
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">{limitation.title}</h3>
                            <p className="text-gray-700 mb-3">{limitation.description}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(limitation.impact)}`}>
                                {limitation.impact} impact
                            </span>
                            <div className="text-xs text-gray-500">
                                Severity: {Math.round(limitation.severity * 100)}%
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-medium text-gray-800 mb-2">Affected Features</h4>
                            <div className="space-y-1">
                                {limitation.affectedFeatures.map((feature, index) => (
                                    <div key={index} className="text-sm text-gray-600 bg-white/50 p-2 rounded">
                                        • {feature}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-800 mb-2">Mitigation Strategies</h4>
                            <div className="space-y-1">
                                {limitation.mitigationStrategies.map((strategy, index) => (
                                    <div key={index} className="text-sm text-gray-600 bg-white/50 p-2 rounded">
                                        ✓ {strategy}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderDataSources = () => (
        <div className="space-y-4">
            {transparencyReport.dataSources.map((source) => (
                <div key={source.id} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">{source.name}</h3>
                            <p className="text-gray-600 mb-2">{source.description}</p>
                            <div className="flex items-center gap-4 text-sm">
                                <span className="bg-gray-100 px-2 py-1 rounded capitalize">{source.type}</span>
                                <span className="text-gray-500">Size: {source.size}</span>
                                <span className={getQualityColor(source.quality)}>
                                    Quality: {Math.round(source.quality * 100)}%
                                </span>
                            </div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                            Updated: {source.lastUpdated}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <h4 className="font-medium text-gray-800 mb-2">Coverage</h4>
                            <p className="text-sm text-gray-600">{source.coverage}</p>
                            <div className="text-xs text-gray-500 mt-1">
                                Update: {source.updateSchedule}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-800 mb-2">Known Biases</h4>
                            <div className="space-y-1">
                                {source.biases.map((bias, index) => (
                                    <div key={index} className="text-sm text-orange-700 bg-orange-50 p-1 rounded">
                                        • {bias}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-800 mb-2">Limitations</h4>
                            <div className="space-y-1">
                                {source.limitations.map((limitation, index) => (
                                    <div key={index} className="text-sm text-red-700 bg-red-50 p-1 rounded">
                                        • {limitation}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderEthics = () => (
        <div className="space-y-6">
            {/* Ethical Considerations */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="text-purple-600"><FiShield size={20} /></div>
                    Ethical Considerations
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-medium text-gray-800 mb-3">Known Biases</h4>
                        <div className="space-y-2">
                            {transparencyReport.ethicalConsiderations.biases.map((bias, index) => (
                                <div key={index} className="text-sm text-red-700 bg-red-50 p-3 rounded">
                                    • {bias}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-800 mb-3">Fairness Metrics</h4>
                        <div className="space-y-2">
                            {transparencyReport.ethicalConsiderations.fairnessMetrics.map((metric, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <span className="text-sm text-gray-700">{metric.metric}</span>
                                    <span className={`text-sm font-medium ${getQualityColor(metric.score)}`}>
                                        {Math.round(metric.score * 100)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Privacy and Accountability */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h4 className="font-medium text-gray-800 mb-3">Privacy Measures</h4>
                    <div className="space-y-2">
                        {transparencyReport.ethicalConsiderations.privacyMeasures.map((measure, index) => (
                            <div key={index} className="text-sm text-blue-700 bg-blue-50 p-2 rounded flex items-center gap-2">
                                <div className="text-blue-600"><FiShield size={14} /></div>
                                {measure}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h4 className="font-medium text-gray-800 mb-3">Accountability Measures</h4>
                    <div className="space-y-2">
                        {transparencyReport.ethicalConsiderations.accountabilityMeasures.map((measure, index) => (
                            <div key={index} className="text-sm text-green-700 bg-green-50 p-2 rounded flex items-center gap-2">
                                <div className="text-green-600"><FiEye size={14} /></div>
                                {measure}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* User Rights */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Rights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-medium text-gray-800 mb-3">Data Rights</h4>
                        <div className="space-y-2">
                            {transparencyReport.userRights.dataRights.map((right, index) => (
                                <div key={index} className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                    ✓ {right}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-800 mb-3">Appeal Process</h4>
                        <div className="space-y-2">
                            {transparencyReport.userRights.appealProcess.map((step, index) => (
                                <div key={index} className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                    {index + 1}. {step}
                                </div>
                            ))}
                        </div>
                        <div className="mt-3 text-sm text-indigo-600">
                            Contact: {transparencyReport.userRights.contactInfo}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const tabs = [
        { id: 'overview', label: 'Overview', icon: FiBookOpen },
        { id: 'algorithms', label: 'Algorithms', icon: FiCpu },
        { id: 'limitations', label: 'Limitations', icon: FiAlertTriangle },
        { id: 'data', label: 'Data Sources', icon: FiDatabase },
        { id: 'ethics', label: 'Ethics & Rights', icon: FiShield }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">System Transparency</h2>
                <p className="text-gray-600">
                    Understanding how our AI system works, its limitations, and your rights
                </p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg border border-gray-200">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6" aria-label="Tabs">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setSelectedTab(tab.id as any)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                                        selectedTab === tab.id
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <Icon size={16} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>
                <div className="p-6">
                    {selectedTab === 'overview' && renderOverview()}
                    {selectedTab === 'algorithms' && renderAlgorithms()}
                    {selectedTab === 'limitations' && renderLimitations()}
                    {selectedTab === 'data' && renderDataSources()}
                    {selectedTab === 'ethics' && renderEthics()}
                </div>
            </div>

            {/* Decision Trace (if enabled) */}
            {showDecisionTrace && decisionTrace && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="text-indigo-600"><FiSettings size={20} /></div>
                        Decision Trace
                        <span className="text-sm text-gray-500 font-normal">({decisionTrace.algorithm})</span>
                    </h3>
                    
                    <div className="space-y-4">
                        {/* Trace Steps */}
                        <div className="space-y-3">
                            {decisionTrace.steps.map((step, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium text-gray-900">
                                            Step {step.stepNumber}: {step.name}
                                        </h4>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <span>Confidence: {Math.round(step.confidence * 100)}%</span>
                                            <span>•</span>
                                            <span>{step.timeMs}ms</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                                    <div className="text-xs text-gray-500">
                                        Processing: {step.processing}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Warnings */}
                        {decisionTrace.warnings.length > 0 && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                                    <FiAlertTriangle size={16} />
                                    Warnings
                                </h4>
                                <div className="space-y-1">
                                    {decisionTrace.warnings.map((warning, index) => (
                                        <div key={index} className="text-sm text-yellow-700">
                                            • {warning}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Explanations */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                                <FiInfo size={16} />
                                Explanations
                            </h4>
                            <div className="space-y-1">
                                {decisionTrace.explanations.map((explanation, index) => (
                                    <div key={index} className="text-sm text-blue-700">
                                        • {explanation}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}; 