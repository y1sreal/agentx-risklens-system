export interface Product {
    id: number;
    name: string;
    description: string;
    technology: string[];
    purpose: string[];
    image_urls: string[];
    product_url: string;
    pricing_model?: string;
    user_count?: string;
    created_at: string;
    updated_at: string;
}

export interface PRISMScore {
    id: number;
    logical_coherence: number;
    factual_accuracy: number;
    practical_implementability: number;
    contextual_relevance: number;
    impact: number;
    exploitability: number;
    overall_score?: number;
    reasoning: string;
}

export interface IncidentLink {
    id: string;
    type: 'source' | 'related' | 'verification' | 'documentation' | 'news' | 'research';
    title: string;
    url: string;
    description?: string;
    domain?: string;
    date?: string;
    verified?: boolean;
    language?: string;
}

export interface Incident {
    id: number;
    title: string;
    description: string;
    technologies: string[];
    risk_level: 'low' | 'medium' | 'high';
    risk_domain: string;
    impact_scale: number;
    confidence_score: number;
    prism_scores?: {
        logical_coherence: number;
        factual_accuracy: number;
        practical_implementability: number;
        contextual_relevance: number;
        impact: number;
        exploitability: number;
    };
    links?: IncidentLink[];
    product_id?: number;
    created_at: string;
    updated_at: string;
    // Processing-related properties
    similarity_score?: number;
    prism_reasoning?: string;
    generic_reasoning?: string;
}

export interface Feedback {
    id: number;
    incident_id: number;
    user_comment: string;
    suggested_incidents: number[];
    index_labels: string[];
    suggested_changes?: string[];
    relevance: boolean;
    prism_scores?: {
        logical_coherence: number;
        factual_accuracy: number;
        practical_implementability: number;
        contextual_relevance: number;
        impact: number;
        exploitability: number;
    };
    created_at: string;
    updated_at: string;
}

export interface Version {
    id: number;
    incident_id: number;
    description: string;
    feedback: Feedback;
    created_at: string;
    updated_at: string;
}

export type DisplayMode = 'none' | 'generic' | 'full'; 