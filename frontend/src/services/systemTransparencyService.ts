export interface AlgorithmExplanation {
    id: string;
    name: string;
    type: 'similarity' | 'ranking' | 'scoring' | 'filtering' | 'classification';
    description: string;
    methodology: string;
    inputFactors: InputFactor[];
    outputFormat: string;
    confidence: number;
    limitations: string[];
    biases: string[];
    dataRequirements: string[];
    updateFrequency: string;
    lastUpdated: string;
}

export interface InputFactor {
    name: string;
    description: string;
    weight: number; // 0-1 scale
    dataType: 'text' | 'numeric' | 'categorical' | 'boolean';
    source: string;
    quality: number; // 0-1 scale
    impact: 'high' | 'medium' | 'low';
}

export interface DecisionTrace {
    id: string;
    timestamp: string;
    input: any;
    algorithm: string;
    steps: DecisionStep[];
    output: any;
    confidence: number;
    alternativeOptions: AlternativeOption[];
    warnings: string[];
    explanations: string[];
}

export interface DecisionStep {
    stepNumber: number;
    name: string;
    description: string;
    input: any;
    processing: string;
    output: any;
    confidence: number;
    timeMs: number;
}

export interface AlternativeOption {
    description: string;
    score: number;
    reasoning: string;
    tradeoffs: string[];
}

export interface SystemLimitation {
    id: string;
    category: 'data' | 'algorithm' | 'context' | 'ethical' | 'technical';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    affectedFeatures: string[];
    mitigationStrategies: string[];
    severity: number; // 0-1 scale
}

export interface DataSourceInfo {
    id: string;
    name: string;
    type: 'training' | 'real-time' | 'reference' | 'user-generated';
    description: string;
    size: string;
    lastUpdated: string;
    quality: number; // 0-1 scale
    coverage: string;
    biases: string[];
    limitations: string[];
    updateSchedule: string;
}

export interface ModelMetrics {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    confidenceDistribution: { range: string; percentage: number }[];
    performanceByCategory: { category: string; score: number }[];
    trainingDate: string;
    validationDate: string;
    testSetSize: number;
}

export interface SystemTransparencyReport {
    systemOverview: {
        version: string;
        architecture: string;
        components: string[];
        capabilities: string[];
        lastUpdated: string;
    };
    algorithms: AlgorithmExplanation[];
    limitations: SystemLimitation[];
    dataSources: DataSourceInfo[];
    modelMetrics: ModelMetrics;
    ethicalConsiderations: {
        biases: string[];
        fairnessMetrics: { metric: string; score: number }[];
        privacyMeasures: string[];
        accountabilityMeasures: string[];
    };
    userRights: {
        dataRights: string[];
        appealProcess: string[];
        contactInfo: string;
    };
}

class SystemTransparencyService {
    private static algorithmExplanations: AlgorithmExplanation[] = [
        {
            id: 'cosine-similarity',
            name: 'Cosine Similarity Matching',
            type: 'similarity',
            description: 'Calculates similarity between incidents based on technology overlap and textual features',
            methodology: 'Uses vector representations of incident features to compute cosine similarity scores',
            inputFactors: [
                {
                    name: 'Technology Tags',
                    description: 'AI/ML technologies mentioned in incidents',
                    weight: 0.7,
                    dataType: 'categorical',
                    source: 'User-defined product tags',
                    quality: 0.8,
                    impact: 'high'
                },
                {
                    name: 'Risk Domain',
                    description: 'Primary risk category of the incident',
                    weight: 0.2,
                    dataType: 'categorical',
                    source: 'Expert annotations',
                    quality: 0.9,
                    impact: 'medium'
                },
                {
                    name: 'Text Features',
                    description: 'Extracted features from incident descriptions',
                    weight: 0.1,
                    dataType: 'text',
                    source: 'NLP processing',
                    quality: 0.6,
                    impact: 'low'
                }
            ],
            outputFormat: 'Similarity score between 0-1, ranked list of incidents',
            confidence: 0.75,
            limitations: [
                'Limited to exact technology tag matches',
                'Cannot understand context or nuance',
                'Vulnerable to inconsistent tagging'
            ],
            biases: [
                'Biased toward incidents with similar technology stacks',
                'May not capture cross-domain risks'
            ],
            dataRequirements: ['Technology tags', 'Risk domain classifications'],
            updateFrequency: 'Real-time with new data',
            lastUpdated: '2024-01-15'
        },
        {
            id: 'hybrid-ranking',
            name: 'Hybrid Risk Ranking',
            type: 'ranking',
            description: 'Combines multiple factors to rank incidents by relevance and risk',
            methodology: 'Weighted combination of similarity, impact, and domain expertise scores',
            inputFactors: [
                {
                    name: 'Similarity Score',
                    description: 'Cosine similarity to target product',
                    weight: 0.4,
                    dataType: 'numeric',
                    source: 'Similarity algorithm',
                    quality: 0.75,
                    impact: 'high'
                },
                {
                    name: 'Impact Scale',
                    description: 'Potential impact magnitude of incident',
                    weight: 0.3,
                    dataType: 'numeric',
                    source: 'Expert assessments',
                    quality: 0.8,
                    impact: 'high'
                },
                {
                    name: 'Risk Level',
                    description: 'Likelihood of incident occurrence',
                    weight: 0.2,
                    dataType: 'categorical',
                    source: 'Risk analysis',
                    quality: 0.7,
                    impact: 'medium'
                },
                {
                    name: 'PRISM Scores',
                    description: 'Multi-dimensional quality metrics',
                    weight: 0.1,
                    dataType: 'numeric',
                    source: 'PRISM evaluation',
                    quality: 0.85,
                    impact: 'medium'
                }
            ],
            outputFormat: 'Ranked list with composite scores',
            confidence: 0.82,
            limitations: [
                'Weights may not suit all use cases',
                'Relies on quality of input scores',
                'May amplify existing biases'
            ],
            biases: [
                'Favors high-impact incidents',
                'May underrepresent emerging risks'
            ],
            dataRequirements: ['All input scores', 'Expert annotations'],
            updateFrequency: 'Daily recalibration',
            lastUpdated: '2024-01-10'
        },
        {
            id: 'prism-scoring',
            name: 'PRISM Multi-Dimensional Scoring',
            type: 'scoring',
            description: 'Evaluates incidents across six dimensions of quality and relevance',
            methodology: 'Expert-designed rubric with ML-assisted scoring across multiple criteria',
            inputFactors: [
                {
                    name: 'Logical Coherence',
                    description: 'Internal consistency of incident narrative',
                    weight: 0.167,
                    dataType: 'numeric',
                    source: 'NLP analysis + expert review',
                    quality: 0.8,
                    impact: 'medium'
                },
                {
                    name: 'Factual Accuracy',
                    description: 'Verifiability of claims and details',
                    weight: 0.167,
                    dataType: 'numeric',
                    source: 'Fact-checking + source validation',
                    quality: 0.85,
                    impact: 'high'
                },
                {
                    name: 'Practical Implementability',
                    description: 'Feasibility of preventive measures',
                    weight: 0.167,
                    dataType: 'numeric',
                    source: 'Technical expert assessment',
                    quality: 0.75,
                    impact: 'high'
                },
                {
                    name: 'Contextual Relevance',
                    description: 'Applicability to specific use cases',
                    weight: 0.167,
                    dataType: 'numeric',
                    source: 'Domain expert judgment',
                    quality: 0.8,
                    impact: 'high'
                },
                {
                    name: 'Uniqueness',
                    description: 'Novel insights not covered elsewhere',
                    weight: 0.167,
                    dataType: 'numeric',
                    source: 'Similarity analysis + expert review',
                    quality: 0.7,
                    impact: 'medium'
                },
                {
                    name: 'Impact Scale',
                    description: 'Magnitude of potential consequences',
                    weight: 0.167,
                    dataType: 'numeric',
                    source: 'Risk assessment framework',
                    quality: 0.8,
                    impact: 'high'
                }
            ],
            outputFormat: 'Six scores (0-1) plus composite score',
            confidence: 0.88,
            limitations: [
                'Requires expert input for calibration',
                'Subjective elements in scoring',
                'May not capture all relevant factors'
            ],
            biases: [
                'Reflects expert judgment biases',
                'May favor certain incident types'
            ],
            dataRequirements: ['Incident text', 'Expert annotations', 'External validation sources'],
            updateFrequency: 'Weekly model updates',
            lastUpdated: '2024-01-12'
        }
    ];

    private static systemLimitations: SystemLimitation[] = [
        {
            id: 'data-coverage',
            category: 'data',
            title: 'Limited Data Coverage',
            description: 'Training data may not cover all possible AI incident scenarios, particularly emerging technologies',
            impact: 'medium',
            affectedFeatures: ['Similarity matching', 'Risk prediction', 'PRISM scoring'],
            mitigationStrategies: [
                'Regular data updates from multiple sources',
                'Community contribution programs',
                'Expert curation processes'
            ],
            severity: 0.6
        },
        {
            id: 'bias-amplification',
            category: 'ethical',
            title: 'Potential Bias Amplification',
            description: 'System may amplify existing biases in training data or expert judgments',
            impact: 'high',
            affectedFeatures: ['All recommendation algorithms', 'PRISM scoring'],
            mitigationStrategies: [
                'Regular bias audits',
                'Diverse expert panels',
                'Fairness metrics monitoring',
                'User feedback integration'
            ],
            severity: 0.8
        },
        {
            id: 'context-limitations',
            category: 'algorithm',
            title: 'Limited Context Understanding',
            description: 'Algorithms cannot fully understand complex contextual factors or organizational nuances',
            impact: 'medium',
            affectedFeatures: ['Similarity matching', 'Relevance scoring'],
            mitigationStrategies: [
                'Human-in-the-loop validation',
                'Contextual metadata collection',
                'User customization options'
            ],
            severity: 0.5
        },
        {
            id: 'real-time-accuracy',
            category: 'technical',
            title: 'Real-time Accuracy Constraints',
            description: 'Trade-off between response speed and accuracy in real-time recommendations',
            impact: 'low',
            affectedFeatures: ['Live filtering', 'Instant recommendations'],
            mitigationStrategies: [
                'Precomputed similarity indices',
                'Adaptive timeout settings',
                'Progressive enhancement'
            ],
            severity: 0.3
        }
    ];

    private static dataSources: DataSourceInfo[] = [
        {
            id: 'ai-incident-db',
            name: 'AI Incident Database',
            type: 'training',
            description: 'Curated database of documented AI failures and incidents',
            size: '2,500+ incidents',
            lastUpdated: '2024-01-15',
            quality: 0.85,
            coverage: 'Global, 2010-present, multiple domains',
            biases: ['English-language bias', 'Technology company focus', 'Reporting bias toward severe incidents'],
            limitations: ['Incomplete for proprietary systems', 'Delayed reporting of recent incidents'],
            updateSchedule: 'Weekly additions, monthly quality reviews'
        },
        {
            id: 'user-feedback',
            name: 'User Feedback Data',
            type: 'user-generated',
            description: 'Feedback and ratings from system users',
            size: '500+ feedback entries',
            lastUpdated: '2024-01-16',
            quality: 0.7,
            coverage: 'Current user base, last 6 months',
            biases: ['Self-selection bias', 'Expert user skew'],
            limitations: ['Limited sample size', 'Subjective assessments'],
            updateSchedule: 'Real-time collection, weekly aggregation'
        },
        {
            id: 'expert-annotations',
            name: 'Expert Annotations',
            type: 'reference',
            description: 'Professional risk assessments and incident classifications',
            size: '1,200+ annotated incidents',
            lastUpdated: '2024-01-10',
            quality: 0.9,
            coverage: 'Major incident categories, expert consensus',
            biases: ['Academic perspective bias', 'Western regulatory focus'],
            limitations: ['Resource intensive', 'Limited scalability'],
            updateSchedule: 'Monthly expert review sessions'
        }
    ];

    public static getAlgorithmExplanation(algorithmId: string): AlgorithmExplanation | null {
        return this.algorithmExplanations.find(alg => alg.id === algorithmId) || null;
    }

    public static getAllAlgorithms(): AlgorithmExplanation[] {
        return [...this.algorithmExplanations];
    }

    public static getSystemLimitations(): SystemLimitation[] {
        return [...this.systemLimitations];
    }

    public static getDataSources(): DataSourceInfo[] {
        return [...this.dataSources];
    }

    public static generateDecisionTrace(
        input: any, 
        algorithm: string, 
        output: any, 
        context?: any
    ): DecisionTrace {
        const algorithmInfo = this.getAlgorithmExplanation(algorithm);
        const trace: DecisionTrace = {
            id: `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            input,
            algorithm,
            steps: this.generateStepsForAlgorithm(algorithm, input, output),
            output,
            confidence: algorithmInfo?.confidence || 0.5,
            alternativeOptions: this.generateAlternatives(algorithm, output),
            warnings: this.generateWarnings(algorithm, input, output),
            explanations: this.generateExplanations(algorithm, input, output, context)
        };

        return trace;
    }

    private static generateStepsForAlgorithm(algorithm: string, input: any, output: any): DecisionStep[] {
        const steps: DecisionStep[] = [];

        if (algorithm === 'cosine-similarity') {
            steps.push(
                {
                    stepNumber: 1,
                    name: 'Input Preprocessing',
                    description: 'Extract and normalize technology tags and features',
                    input: input,
                    processing: 'Technology tag extraction, text tokenization',
                    output: { technologies: input.technologies || [], features: 'normalized' },
                    confidence: 0.9,
                    timeMs: 5
                },
                {
                    stepNumber: 2,
                    name: 'Vector Representation',
                    description: 'Convert features to numerical vectors',
                    input: { technologies: input.technologies || [] },
                    processing: 'One-hot encoding, TF-IDF vectorization',
                    output: { vector_dim: 1000, sparsity: 0.95 },
                    confidence: 0.85,
                    timeMs: 15
                },
                {
                    stepNumber: 3,
                    name: 'Similarity Computation',
                    description: 'Calculate cosine similarity with candidate incidents',
                    input: { query_vector: 'processed', candidate_count: 100 },
                    processing: 'Cosine similarity calculation, ranking',
                    output: output,
                    confidence: 0.75,
                    timeMs: 25
                }
            );
        }

        return steps;
    }

    private static generateAlternatives(algorithm: string, output: any): AlternativeOption[] {
        const alternatives: AlternativeOption[] = [];

        if (algorithm === 'cosine-similarity') {
            alternatives.push(
                {
                    description: 'Semantic similarity using embeddings',
                    score: 0.7,
                    reasoning: 'Would capture deeper meaning but require more computation',
                    tradeoffs: ['Higher accuracy', 'Slower performance', 'More complex']
                },
                {
                    description: 'Exact keyword matching',
                    score: 0.4,
                    reasoning: 'Faster but less flexible than vector similarity',
                    tradeoffs: ['Very fast', 'Limited recall', 'No semantic understanding']
                }
            );
        }

        return alternatives;
    }

    private static generateWarnings(algorithm: string, input: any, output: any): string[] {
        const warnings: string[] = [];

        if (algorithm === 'cosine-similarity') {
            if (!input.technologies || input.technologies.length === 0) {
                warnings.push('No technology tags provided - results may be less accurate');
            }
            if (input.technologies && input.technologies.length > 10) {
                warnings.push('Many technology tags may dilute similarity scores');
            }
        }

        return warnings;
    }

    private static generateExplanations(algorithm: string, input: any, output: any, context?: any): string[] {
        const explanations: string[] = [];

        if (algorithm === 'cosine-similarity') {
            explanations.push(
                `Found ${output.length || 0} similar incidents based on technology overlap`,
                'Similarity scores reflect degree of shared technologies and risk domains',
                'Higher scores indicate stronger matches with your product profile'
            );
        }

        return explanations;
    }

    public static getSystemTransparencyReport(): SystemTransparencyReport {
        return {
            systemOverview: {
                version: '2.1.0',
                architecture: 'Hybrid AI system with human oversight',
                components: [
                    'Similarity matching engine',
                    'PRISM scoring framework', 
                    'User feedback integration',
                    'Expert annotation system'
                ],
                capabilities: [
                    'Incident similarity analysis',
                    'Risk assessment and ranking',
                    'Multi-dimensional quality scoring',
                    'Real-time filtering and search'
                ],
                lastUpdated: '2024-01-15'
            },
            algorithms: this.algorithmExplanations,
            limitations: this.systemLimitations,
            dataSources: this.dataSources,
            modelMetrics: {
                accuracy: 0.82,
                precision: 0.79,
                recall: 0.85,
                f1Score: 0.82,
                confidenceDistribution: [
                    { range: '0.9-1.0', percentage: 25 },
                    { range: '0.8-0.9', percentage: 35 },
                    { range: '0.7-0.8', percentage: 25 },
                    { range: '0.6-0.7', percentage: 10 },
                    { range: '0.0-0.6', percentage: 5 }
                ],
                performanceByCategory: [
                    { category: 'Computer Vision', score: 0.87 },
                    { category: 'NLP', score: 0.84 },
                    { category: 'Autonomous Systems', score: 0.79 },
                    { category: 'Healthcare AI', score: 0.81 },
                    { category: 'Financial AI', score: 0.83 }
                ],
                trainingDate: '2024-01-01',
                validationDate: '2024-01-08',
                testSetSize: 500
            },
            ethicalConsiderations: {
                biases: [
                    'Training data skewed toward reported incidents',
                    'Expert annotations may reflect cultural biases',
                    'Technology category definitions may favor certain domains'
                ],
                fairnessMetrics: [
                    { metric: 'Demographic Parity', score: 0.78 },
                    { metric: 'Equal Opportunity', score: 0.82 },
                    { metric: 'Calibration', score: 0.85 }
                ],
                privacyMeasures: [
                    'Data anonymization protocols',
                    'Minimal data collection practices',
                    'User consent mechanisms',
                    'Right to deletion compliance'
                ],
                accountabilityMeasures: [
                    'Decision audit trails',
                    'Human oversight requirements',
                    'Regular bias testing',
                    'Explainability requirements'
                ]
            },
            userRights: {
                dataRights: [
                    'Right to access your data',
                    'Right to correct inaccuracies',
                    'Right to delete your data',
                    'Right to data portability'
                ],
                appealProcess: [
                    'Submit appeal through system interface',
                    'Human review within 5 business days',
                    'Detailed explanation of decision',
                    'Option for external review'
                ],
                contactInfo: 'transparency@aiincidents.example.com'
            }
        };
    }
}

export { SystemTransparencyService }; 