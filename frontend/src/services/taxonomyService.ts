export interface TaxonomyNode {
    id: string;
    name: string;
    description?: string;
    parent?: string;
    children?: string[];
    aliases?: string[];
    relatedTerms?: string[];
    category: string;
    level: number; // 0 = root, 1 = category, 2 = subcategory, etc.
}

export interface TaxonomyMatch {
    node: TaxonomyNode;
    score: number;
    matchType: 'exact' | 'alias' | 'semantic' | 'partial' | 'hierarchical';
    confidence: number;
}

// Comprehensive AI/ML Technology Taxonomy
const TECHNOLOGY_TAXONOMY: TaxonomyNode[] = [
    // Root level categories
    {
        id: 'ml-core',
        name: 'Machine Learning',
        description: 'Core machine learning technologies and algorithms',
        category: 'technology',
        level: 0,
        children: ['supervised', 'unsupervised', 'reinforcement', 'deep-learning']
    },
    {
        id: 'ai-systems',
        name: 'AI Systems',
        description: 'High-level AI system architectures and approaches',
        category: 'technology',
        level: 0,
        children: ['autonomous', 'recommendation', 'decision-support', 'robotics']
    },
    {
        id: 'data-processing',
        name: 'Data Processing',
        description: 'Data handling and processing technologies',
        category: 'technology',
        level: 0,
        children: ['nlp', 'computer-vision', 'speech', 'data-mining']
    },

    // Machine Learning subcategories
    {
        id: 'supervised',
        name: 'Supervised Learning',
        parent: 'ml-core',
        category: 'technology',
        level: 1,
        children: ['classification', 'regression', 'ensemble'],
        aliases: ['supervised-ml', 'labeled-learning']
    },
    {
        id: 'unsupervised',
        name: 'Unsupervised Learning',
        parent: 'ml-core',
        category: 'technology',
        level: 1,
        children: ['clustering', 'dimensionality-reduction', 'anomaly-detection'],
        aliases: ['unsupervised-ml', 'unlabeled-learning']
    },
    {
        id: 'reinforcement',
        name: 'Reinforcement Learning',
        parent: 'ml-core',
        category: 'technology',
        level: 1,
        children: ['q-learning', 'policy-gradient', 'actor-critic'],
        aliases: ['rl', 'reinforcement-learning']
    },
    {
        id: 'deep-learning',
        name: 'Deep Learning',
        parent: 'ml-core',
        category: 'technology',
        level: 1,
        children: ['neural-networks', 'cnn', 'rnn', 'transformer'],
        aliases: ['dl', 'deep-neural-networks']
    },

    // Specific algorithms and models
    {
        id: 'neural-networks',
        name: 'Neural Networks',
        parent: 'deep-learning',
        category: 'technology',
        level: 2,
        aliases: ['nn', 'artificial-neural-networks', 'multilayer-perceptron'],
        relatedTerms: ['backpropagation', 'gradient-descent']
    },
    {
        id: 'cnn',
        name: 'Convolutional Neural Networks',
        parent: 'deep-learning',
        category: 'technology',
        level: 2,
        aliases: ['convnet', 'conv-net', 'convolutional-networks'],
        relatedTerms: ['image-processing', 'feature-extraction']
    },
    {
        id: 'rnn',
        name: 'Recurrent Neural Networks',
        parent: 'deep-learning',
        category: 'technology',
        level: 2,
        children: ['lstm', 'gru'],
        aliases: ['recurrent-networks'],
        relatedTerms: ['sequence-modeling', 'time-series']
    },
    {
        id: 'transformer',
        name: 'Transformer Models',
        parent: 'deep-learning',
        category: 'technology',
        level: 2,
        children: ['bert', 'gpt', 'attention'],
        aliases: ['transformers', 'attention-models'],
        relatedTerms: ['self-attention', 'encoder-decoder']
    },

    // NLP Technologies
    {
        id: 'nlp',
        name: 'Natural Language Processing',
        parent: 'data-processing',
        category: 'technology',
        level: 1,
        children: ['language-models', 'text-analysis', 'machine-translation'],
        aliases: ['natural-language-processing', 'computational-linguistics']
    },
    {
        id: 'language-models',
        name: 'Language Models',
        parent: 'nlp',
        category: 'technology',
        level: 2,
        children: ['llm', 'chat-models'],
        aliases: ['lm', 'language-modeling']
    },
    {
        id: 'llm',
        name: 'Large Language Models',
        parent: 'language-models',
        category: 'technology',
        level: 3,
        aliases: ['large-language-models', 'foundation-models'],
        relatedTerms: ['gpt', 'bert', 'chatgpt', 'generative-ai']
    },

    // Computer Vision
    {
        id: 'computer-vision',
        name: 'Computer Vision',
        parent: 'data-processing',
        category: 'technology',
        level: 1,
        children: ['image-recognition', 'object-detection', 'facial-recognition'],
        aliases: ['cv', 'machine-vision', 'visual-ai']
    },
    {
        id: 'facial-recognition',
        name: 'Facial Recognition',
        parent: 'computer-vision',
        category: 'technology',
        level: 2,
        aliases: ['face-recognition', 'facial-detection', 'biometric-identification'],
        relatedTerms: ['biometrics', 'identity-verification']
    }
];

// AI Purpose/Application Taxonomy
const PURPOSE_TAXONOMY: TaxonomyNode[] = [
    // Root categories
    {
        id: 'automation',
        name: 'Automation',
        description: 'Automating tasks and processes',
        category: 'purpose',
        level: 0,
        children: ['process-automation', 'decision-automation', 'content-automation']
    },
    {
        id: 'analysis',
        name: 'Analysis & Insights',
        description: 'Data analysis and generating insights',
        category: 'purpose',
        level: 0,
        children: ['predictive-analytics', 'pattern-recognition', 'anomaly-detection-purpose']
    },
    {
        id: 'interaction',
        name: 'Human Interaction',
        description: 'Systems that interact with humans',
        category: 'purpose',
        level: 0,
        children: ['customer-service', 'personal-assistant', 'education']
    },
    {
        id: 'content-generation',
        name: 'Content Generation',
        description: 'Creating or generating content',
        category: 'purpose',
        level: 0,
        children: ['text-generation', 'image-generation', 'creative-ai']
    },

    // Specific applications
    {
        id: 'customer-service',
        name: 'Customer Service',
        parent: 'interaction',
        category: 'purpose',
        level: 1,
        children: ['chatbots', 'support-automation'],
        aliases: ['customer-support', 'helpdesk-automation']
    },
    {
        id: 'chatbots',
        name: 'Chatbots',
        parent: 'customer-service',
        category: 'purpose',
        level: 2,
        aliases: ['conversational-ai', 'virtual-assistant', 'chat-assistant']
    },
    {
        id: 'recommendation',
        name: 'Recommendation Systems',
        parent: 'analysis',
        category: 'purpose',
        level: 1,
        aliases: ['recommender-systems', 'content-recommendation', 'product-recommendation']
    },
    {
        id: 'fraud-detection',
        name: 'Fraud Detection',
        parent: 'analysis',
        category: 'purpose',
        level: 1,
        aliases: ['fraud-prevention', 'security-monitoring', 'risk-assessment']
    },
    {
        id: 'medical-diagnosis',
        name: 'Medical Diagnosis',
        parent: 'analysis',
        category: 'purpose',
        level: 1,
        aliases: ['healthcare-ai', 'diagnostic-ai', 'medical-ai']
    }
];

export class TaxonomyService {
    private static technologyNodes = new Map<string, TaxonomyNode>();
    private static purposeNodes = new Map<string, TaxonomyNode>();
    private static initialized = false;

    private static initialize() {
        if (this.initialized) return;

        // Build technology taxonomy
        TECHNOLOGY_TAXONOMY.forEach(node => {
            this.technologyNodes.set(node.id, node);
        });

        // Build purpose taxonomy
        PURPOSE_TAXONOMY.forEach(node => {
            this.purposeNodes.set(node.id, node);
        });

        this.initialized = true;
    }

    public static findTechnologyMatches(term: string, maxResults = 5): TaxonomyMatch[] {
        this.initialize();
        return this.findMatches(term, this.technologyNodes, maxResults);
    }

    public static findPurposeMatches(term: string, maxResults = 5): TaxonomyMatch[] {
        this.initialize();
        return this.findMatches(term, this.purposeNodes, maxResults);
    }

    private static findMatches(term: string, nodes: Map<string, TaxonomyNode>, maxResults: number): TaxonomyMatch[] {
        const matches: TaxonomyMatch[] = [];
        const lowerTerm = term.toLowerCase().trim();

        nodes.forEach(node => {
            const match = this.calculateMatch(lowerTerm, node);
            if (match && match.score > 0) {
                matches.push(match);
            }
        });

        // Sort by score (descending) and confidence
        matches.sort((a, b) => {
            if (Math.abs(a.score - b.score) < 0.01) {
                return b.confidence - a.confidence;
            }
            return b.score - a.score;
        });

        return matches.slice(0, maxResults);
    }

    private static calculateMatch(term: string, node: TaxonomyNode): TaxonomyMatch | null {
        const nodeName = node.name.toLowerCase();
        
        // Exact match
        if (nodeName === term) {
            return {
                node,
                score: 1.0,
                matchType: 'exact',
                confidence: 1.0
            };
        }

        // Alias match
        if (node.aliases) {
            for (const alias of node.aliases) {
                if (alias.toLowerCase() === term) {
                    return {
                        node,
                        score: 0.95,
                        matchType: 'alias',
                        confidence: 0.9
                    };
                }
            }
        }

        // Partial match (contains)
        if (nodeName.includes(term) || term.includes(nodeName)) {
            const ratio = Math.min(term.length, nodeName.length) / Math.max(term.length, nodeName.length);
            return {
                node,
                score: 0.7 * ratio,
                matchType: 'partial',
                confidence: 0.6 * ratio
            };
        }

        // Semantic match (simple word overlap)
        const termWords = term.split(/[\s\-_]+/);
        const nodeWords = nodeName.split(/[\s\-_]+/);
        const overlap = termWords.filter(word => 
            nodeWords.some(nodeWord => 
                nodeWord.includes(word) || word.includes(nodeWord)
            )
        ).length;

        if (overlap > 0) {
            const score = overlap / Math.max(termWords.length, nodeWords.length);
            if (score > 0.3) {
                return {
                    node,
                    score: 0.5 * score,
                    matchType: 'semantic',
                    confidence: 0.4 * score
                };
            }
        }

        return null;
    }

    public static getNodePath(nodeId: string, category: 'technology' | 'purpose'): TaxonomyNode[] {
        this.initialize();
        const nodes = category === 'technology' ? this.technologyNodes : this.purposeNodes;
        const path: TaxonomyNode[] = [];
        
        let currentNode = nodes.get(nodeId);
        while (currentNode) {
            path.unshift(currentNode);
            currentNode = currentNode.parent ? nodes.get(currentNode.parent) : undefined;
        }
        
        return path;
    }

    public static getChildren(nodeId: string, category: 'technology' | 'purpose'): TaxonomyNode[] {
        this.initialize();
        const nodes = category === 'technology' ? this.technologyNodes : this.purposeNodes;
        const node = nodes.get(nodeId);
        
        if (!node?.children) return [];
        
        return node.children
            .map(childId => nodes.get(childId))
            .filter((child): child is TaxonomyNode => child !== undefined);
    }

    public static calculateSimilarity(terms1: string[], terms2: string[]): number {
        if (terms1.length === 0 || terms2.length === 0) return 0;

        let totalScore = 0;
        let maxPossibleScore = 0;

        terms1.forEach(term1 => {
            const matches1 = this.findTechnologyMatches(term1, 1);
            const matches2 = this.findPurposeMatches(term1, 1);
            const allMatches = [...matches1, ...matches2];
            
            let bestScore = 0;
            terms2.forEach(term2 => {
                // Direct string similarity
                const directSimilarity = this.calculateStringSimilarity(term1, term2);
                bestScore = Math.max(bestScore, directSimilarity);

                // Semantic similarity through taxonomy
                allMatches.forEach(match => {
                    const term2Matches = [
                        ...this.findTechnologyMatches(term2, 1),
                        ...this.findPurposeMatches(term2, 1)
                    ];
                    
                    term2Matches.forEach(match2 => {
                        if (match.node.id === match2.node.id) {
                            bestScore = Math.max(bestScore, 0.8);
                        } else if (match.node.parent === match2.node.parent && match.node.parent) {
                            bestScore = Math.max(bestScore, 0.6);
                        }
                    });
                });
            });
            
            totalScore += bestScore;
            maxPossibleScore += 1;
        });

        return maxPossibleScore > 0 ? totalScore / maxPossibleScore : 0;
    }

    private static calculateStringSimilarity(str1: string, str2: string): number {
        const lower1 = str1.toLowerCase();
        const lower2 = str2.toLowerCase();
        
        if (lower1 === lower2) return 1.0;
        if (lower1.includes(lower2) || lower2.includes(lower1)) {
            return Math.min(lower1.length, lower2.length) / Math.max(lower1.length, lower2.length);
        }
        
        // Simple Jaccard similarity on words
        const words1 = new Set(lower1.split(/[\s\-_]+/));
        const words2 = new Set(lower2.split(/[\s\-_]+/));
        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);
        
        return intersection.size / union.size;
    }

    public static suggestImprovements(technologies: string[], purposes: string[]): {
        technologySuggestions: TaxonomyMatch[];
        purposeSuggestions: TaxonomyMatch[];
        qualityScore: number;
    } {
        this.initialize();

        const technologySuggestions: TaxonomyMatch[] = [];
        const purposeSuggestions: TaxonomyMatch[] = [];
        
        // Find better matches for existing terms
        technologies.forEach(tech => {
            const matches = this.findTechnologyMatches(tech, 3);
            const bestMatch = matches[0];
            if (bestMatch && bestMatch.matchType !== 'exact' && bestMatch.score > 0.7) {
                technologySuggestions.push(bestMatch);
            }
        });

        purposes.forEach(purpose => {
            const matches = this.findPurposeMatches(purpose, 3);
            const bestMatch = matches[0];
            if (bestMatch && bestMatch.matchType !== 'exact' && bestMatch.score > 0.7) {
                purposeSuggestions.push(bestMatch);
            }
        });

        // Calculate overall quality score
        const techQuality = technologies.length > 0 
            ? technologies.reduce((sum, tech) => {
                const matches = this.findTechnologyMatches(tech, 1);
                return sum + (matches[0]?.score || 0);
            }, 0) / technologies.length 
            : 0;

        const purposeQuality = purposes.length > 0
            ? purposes.reduce((sum, purpose) => {
                const matches = this.findPurposeMatches(purpose, 1);
                return sum + (matches[0]?.score || 0);
            }, 0) / purposes.length
            : 0;

        const qualityScore = (techQuality + purposeQuality) / 2;

        return {
            technologySuggestions,
            purposeSuggestions,
            qualityScore
        };
    }
} 