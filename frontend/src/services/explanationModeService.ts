import { Incident, Product } from '../types';

export type ExplanationMode = 'generic' | 'prism';

interface RetrievalConfig {
    algorithm: 'cosine' | 'dense_retriever' | 'hybrid';
    weightings: {
        technology_overlap: number;
        purpose_alignment: number;
        risk_domain_match: number;
        prism_composite: number;
    };
    confidence_threshold: number;
    explanation_style: 'brief' | 'detailed_prism';
    max_results: number;
}

// Different configurations for each explanation mode
const EXPLANATION_MODE_CONFIGS: Record<ExplanationMode, RetrievalConfig> = {
    generic: {
        algorithm: 'hybrid',
        weightings: {
            technology_overlap: 0.4,
            purpose_alignment: 0.3,
            risk_domain_match: 0.2,
            prism_composite: 0.1,
        },
        confidence_threshold: 0.5,
        explanation_style: 'brief',
        max_results: 10
    },
    prism: {
        algorithm: 'dense_retriever',
        weightings: {
            technology_overlap: 0.2,
            purpose_alignment: 0.2,
            risk_domain_match: 0.1,
            prism_composite: 0.5,
        },
        confidence_threshold: 0.6,
        explanation_style: 'detailed_prism',
        max_results: 10
    }
};

export class ExplanationModeService {
    private static calculateTechnologyOverlap(product: Product, incident: Incident): number {
        const productTech = new Set(product.technology.map(t => t.toLowerCase()));
        const incidentTech = new Set(incident.technologies.map(t => t.toLowerCase()));
        
        const intersection = new Set([...productTech].filter(t => incidentTech.has(t)));
        const union = new Set([...productTech, ...incidentTech]);
        
        return union.size > 0 ? intersection.size / union.size : 0;
    }

    private static calculatePurposeAlignment(product: Product, incident: Incident): number {
        const productPurposes = new Set(product.purpose?.map(p => p.toLowerCase()) || []);
        const incidentPurposes = new Set(['classification', 'prediction', 'generation', 'recommendation']); // Simulated
        
        const intersection = new Set([...productPurposes].filter(p => incidentPurposes.has(p)));
        const union = new Set([...productPurposes, ...incidentPurposes]);
        
        return union.size > 0 ? intersection.size / union.size : 0;
    }

    private static calculateRiskDomainMatch(product: Product, incident: Incident): number {
        // Simplified risk domain matching
        const productRisks = ['safety', 'privacy', 'security', 'ethics']; // Simulated
        return productRisks.includes(incident.risk_domain.toLowerCase()) ? 1.0 : 0.3;
    }

    private static calculatePrismComposite(incident: Incident): number {
        if (!incident.prism_scores) return 0;
        
        const scores = [
            incident.prism_scores.logical_coherence,
            incident.prism_scores.factual_accuracy,
            incident.prism_scores.practical_implementability,
            incident.prism_scores.contextual_relevance,
            incident.prism_scores.impact,
            incident.prism_scores.exploitability
        ];
        
        // Weighted average with higher weight on contextual relevance and impact
        // Weights now add up to exactly 1.0: 0.15 + 0.15 + 0.15 + 0.25 + 0.25 + 0.05 = 1.00
        const weights = [0.15, 0.15, 0.15, 0.25, 0.25, 0.05];
        return scores.reduce((sum, score, i) => sum + score * weights[i], 0);
    }

    private static cosineAlgorithm(product: Product, incident: Incident, config: RetrievalConfig): number {
        // Simplified cosine similarity based on technology and purpose vectors
        const techScore = this.calculateTechnologyOverlap(product, incident);
        const purposeScore = this.calculatePurposeAlignment(product, incident);
        const riskScore = this.calculateRiskDomainMatch(product, incident);
        
        return (
            techScore * config.weightings.technology_overlap +
            purposeScore * config.weightings.purpose_alignment +
            riskScore * config.weightings.risk_domain_match
        );
    }

    private static denseRetrieverAlgorithm(product: Product, incident: Incident, config: RetrievalConfig): number {
        // Dense retriever emphasizes semantic understanding via PRISM scores
        const techScore = this.calculateTechnologyOverlap(product, incident);
        const purposeScore = this.calculatePurposeAlignment(product, incident);
        const riskScore = this.calculateRiskDomainMatch(product, incident);
        const prismScore = this.calculatePrismComposite(incident);
        
        // Dense retriever uses contextualized embeddings (simulated)
        const semanticBoost = prismScore > 0.7 ? 1.2 : 1.0;
        
        return (
            techScore * config.weightings.technology_overlap +
            purposeScore * config.weightings.purpose_alignment +
            riskScore * config.weightings.risk_domain_match +
            prismScore * config.weightings.prism_composite
        ) * semanticBoost;
    }

    private static hybridAlgorithm(product: Product, incident: Incident, config: RetrievalConfig): number {
        // Hybrid combines both approaches
        const cosineScore = this.cosineAlgorithm(product, incident, config);
        const denseScore = this.denseRetrieverAlgorithm(product, incident, config);
        
        // Weighted combination favoring dense retriever
        return cosineScore * 0.4 + denseScore * 0.6;
    }

    public static calculateSimilarity(
        product: Product, 
        incident: Incident, 
        mode: ExplanationMode
    ): number {
        const config = EXPLANATION_MODE_CONFIGS[mode];
        
        let score: number;
        switch (config.algorithm) {
            case 'cosine':
                score = this.cosineAlgorithm(product, incident, config);
                break;
            case 'dense_retriever':
                score = this.denseRetrieverAlgorithm(product, incident, config);
                break;
            case 'hybrid':
                score = this.hybridAlgorithm(product, incident, config);
                break;
        }
        
        // Apply confidence threshold
        return score >= config.confidence_threshold ? score : score * 0.5;
    }

    public static filterAndRankIncidents(
        product: Product, 
        incidents: Incident[], 
        mode: ExplanationMode
    ): Incident[] {
        const config = EXPLANATION_MODE_CONFIGS[mode];
        
        // Calculate scores for all incidents
        const scoredIncidents = incidents.map(incident => ({
            ...incident,
            similarity_score: this.calculateSimilarity(product, incident, mode),
            explanation_mode: mode
        }));
        
        // Filter by confidence threshold
        const filtered = scoredIncidents.filter(
            incident => incident.similarity_score >= config.confidence_threshold
        );
        
        // Sort by similarity score
        filtered.sort((a, b) => b.similarity_score - a.similarity_score);
        
        // Return top results based on mode configuration
        return filtered.slice(0, config.max_results);
    }

    public static generateExplanation(
        product: Product, 
        incident: Incident, 
        mode: ExplanationMode
    ): string {
        const config = EXPLANATION_MODE_CONFIGS[mode];
        
        switch (config.explanation_style) {
            case 'brief':
                const techOverlap = this.calculateTechnologyOverlap(product, incident);
                const riskDomain = incident.risk_domain;
                return `This incident is relevant because it involves similar technologies (${Math.round(techOverlap * 100)}% overlap) and addresses ${riskDomain.toLowerCase()} risks that may apply to your product.`;
                
            case 'detailed_prism':
                if (!incident.prism_scores) return 'PRISM scores not available for detailed analysis.';
                
                const prismAnalysis = [
                    `Logical Coherence: ${Math.round(incident.prism_scores.logical_coherence * 100)}% - ${this.interpretPrismScore('logical_coherence', incident.prism_scores.logical_coherence)}`,
                    `Factual Accuracy: ${Math.round(incident.prism_scores.factual_accuracy * 100)}% - ${this.interpretPrismScore('factual_accuracy', incident.prism_scores.factual_accuracy)}`,
                    `Contextual Relevance: ${Math.round(incident.prism_scores.contextual_relevance * 100)}% - ${this.interpretPrismScore('contextual_relevance', incident.prism_scores.contextual_relevance)}`,
                    `Impact Scale: ${Math.round(incident.prism_scores.impact * 100)}% - ${this.interpretPrismScore('impact', incident.prism_scores.impact)}`
                ];
                
                return `PRISM Analysis:\n${prismAnalysis.join('\n')}\n\nThis incident provides valuable insights for your product due to its strong performance across multiple PRISM dimensions.`;
                
            default:
                return 'Analysis not available.';
        }
    }

    private static interpretPrismScore(dimension: string, score: number): string {
        const interpretations = {
            logical_coherence: {
                high: 'Incident report is well-structured and internally consistent',
                medium: 'Some minor logical gaps but generally coherent',
                low: 'Significant logical inconsistencies in the report'
            },
            factual_accuracy: {
                high: 'Technical details are verifiable and accurate',
                medium: 'Most claims appear accurate with some uncertainties',
                low: 'Factual claims require verification'
            },
            contextual_relevance: {
                high: 'Highly relevant to similar AI deployment contexts',
                medium: 'Moderately relevant with some contextual similarities',
                low: 'Limited contextual relevance to your use case'
            },
            impact: {
                high: 'Demonstrates significant potential impact',
                medium: 'Shows moderate impact on stakeholders',
                low: 'Limited scope of demonstrated impact'
            }
        };
        
        const level = score >= 0.7 ? 'high' : score >= 0.4 ? 'medium' : 'low';
        return interpretations[dimension as keyof typeof interpretations]?.[level] || 'Score interpretation not available';
    }

    public static getModeDescription(mode: ExplanationMode): string {
        const descriptions = {
            generic: 'Balanced approach combining multiple factors including technology, purpose, and basic risk assessment. Good for general insights.',
            prism: 'Advanced analysis using comprehensive PRISM framework evaluation. Slower but provides deep, structured insights into incident transferability.'
        };
        
        return descriptions[mode];
    }

    public static getModeConfig(mode: ExplanationMode): RetrievalConfig {
        return EXPLANATION_MODE_CONFIGS[mode];
    }
} 