/**
 * API Service for PRISM Backend Integration
 * Connects frontend with real database data and PRISM scoring
 */

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

export interface ApiProduct {
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

export interface ApiIncident {
    id: number;
    title: string;
    description: string;
    technologies: string[];
    risk_level: 'low' | 'medium' | 'high';
    risk_domain: string;
    impact_scale: number;
    confidence_score: number;
    prism_scores: {
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

export interface ApiIncidentProductMapping {
    id: number;
    incident_id: number;
    product_id: number;
    mapping_confidence: number;
    transferability_score: number;
    is_human_validated: boolean;
    created_at: string;
}

export interface PRISMScoreRequest {
    product_name: string;
    product_description: string;
    incident_description: string;
    context?: string;
    mode?: string;
}

export interface PRISMScoreResponse {
    logical_coherence: number;
    factual_accuracy: number;
    practical_implementability: number;
    contextual_relevance: number;
    impact: number;
    exploitability: number;
    overall_score: number;
    reasoning: string;
}

export interface BulkPRISMScoreRequest {
    product_name: string;
    product_description: string;
    incidents: Array<{
        id: number;
        title: string;
        description: string;
        technologies: string[];
    }>;
    context?: string;
    mode: string;
}

export interface BulkPRISMScoreResponse {
    incident_scores: Array<{
        incident_id: number;
        confidence_score?: number; // For generic mode
        logical_coherence?: number; // For PRISM mode
        factual_accuracy?: number;
        practical_implementability?: number;
        contextual_relevance?: number;
        impact?: number;
        exploitability?: number;
        overall_score?: number;
        reasoning: string;
    }>;
}

export interface ProductSearchParams {
    search?: string;
    page?: number;
    limit?: number;
    technology?: string[];
    purpose?: string[];
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
}

class ApiService {
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;
        const config: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error ${response.status}: ${errorText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API request failed: ${endpoint}`, error);
            throw error;
        }
    }

    // Product endpoints
    async getProducts(params: ProductSearchParams = {}): Promise<PaginatedResponse<ApiProduct>> {
        const searchParams = new URLSearchParams();
        
        if (params.search) searchParams.append('search', params.search);
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());
        if (params.technology) {
            params.technology.forEach(tech => searchParams.append('technology', tech));
        }
        if (params.purpose) {
            params.purpose.forEach(purpose => searchParams.append('purpose', purpose));
        }

        const query = searchParams.toString();
        const endpoint = `/api/products${query ? `?${query}` : ''}`;
        
        return this.request<PaginatedResponse<ApiProduct>>(endpoint);
    }

    async getProduct(id: number): Promise<ApiProduct> {
        return this.request<ApiProduct>(`/api/products/${id}`);
    }

    async createProduct(product: Omit<ApiProduct, 'id' | 'created_at' | 'updated_at'>): Promise<ApiProduct> {
        return this.request<ApiProduct>('/api/products', {
            method: 'POST',
            body: JSON.stringify(product),
        });
    }

    async updateProduct(id: number, product: Partial<ApiProduct>): Promise<ApiProduct> {
        return this.request<ApiProduct>(`/api/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(product),
        });
    }

    // Incident endpoints
    async getIncidents(page = 1, limit = 50, search?: string): Promise<PaginatedResponse<ApiIncident>> {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        
        if (search) params.append('search', search);
        
        return this.request<PaginatedResponse<ApiIncident>>(`/api/incidents?${params}`);
    }

    async getIncident(id: number): Promise<ApiIncident> {
        return this.request<ApiIncident>(`/api/incidents/${id}`);
    }

    // Incident-Product mappings
    async getIncidentProductMappings(
        incident_id?: number,
        product_id?: number
    ): Promise<ApiIncidentProductMapping[]> {
        const params = new URLSearchParams();
        if (incident_id) params.append('incident_id', incident_id.toString());
        if (product_id) params.append('product_id', product_id.toString());
        
        const query = params.toString();
        const endpoint = `/api/mappings${query ? `?${query}` : ''}`;
        
        return this.request<ApiIncidentProductMapping[]>(endpoint);
    }

    async getIncidentsForProduct(product_id: number): Promise<ApiIncident[]> {
        return this.request<ApiIncident[]>(`/api/products/${product_id}/incidents`);
    }

    async getSimilarIncidents(product_id: number, limit: number = 20): Promise<ApiIncident[]> {
        const response = await this.request<{
            product_id: number;
            product_name: string;
            total_incidents: number;
            incidents: any[];
            sort_by: string;
            risk_domain: string | null;
        }>(`/api/products/${product_id}/incidents?limit=${limit}`);
        
        // Convert backend format to frontend ApiIncident format
        return response.incidents.map(incident => ({
            id: incident.id,
            title: incident.title,
            description: incident.description,
            technologies: incident.technologies || [],
            risk_level: incident.risk_level || 'medium',
            risk_domain: incident.risk_domain || 'Safety',
            impact_scale: incident.impact_scale || 0.5,
            confidence_score: incident.risk_confidence || 0.5,
            prism_scores: {
                logical_coherence: incident.logical_coherence || 3,
                factual_accuracy: incident.factual_accuracy || 3,
                practical_implementability: incident.practical_implementability || 3,
                contextual_relevance: incident.contextual_relevance || 3,
                impact: incident.impact_scale || 3,
                exploitability: incident.prism_scores?.exploitability || 3
            },
            created_at: incident.created_at || new Date().toISOString(),
            updated_at: incident.updated_at || new Date().toISOString()
        }));
    }

    async getFeedbackHistory(incident_id: number): Promise<any[]> {
        // Placeholder implementation - return empty array for now
        return [];
    }

    async submitFeedback(incident_id: number, feedback: any): Promise<void> {
        // Placeholder implementation
        console.log('Feedback submitted for incident:', incident_id, feedback);
    }

    async optimizeWithFeedback(incident_ids: number[], feedback_history: any[]): Promise<void> {
        // Placeholder implementation
        console.log('Optimizing with feedback for incidents:', incident_ids, feedback_history);
    }

    // PRISM Scoring
    async calculatePRISMScore(request: PRISMScoreRequest): Promise<PRISMScoreResponse> {
        return this.request<PRISMScoreResponse>('/api/prism/score', {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }

    async batchCalculatePRISMScore(requests: PRISMScoreRequest[]): Promise<PRISMScoreResponse[]> {
        return this.request<PRISMScoreResponse[]>('/api/prism/score/batch', {
            method: 'POST',
            body: JSON.stringify({ requests }),
        });
    }

    async bulkCalculatePRISMScore(request: BulkPRISMScoreRequest): Promise<BulkPRISMScoreResponse> {
        return this.request<BulkPRISMScoreResponse>('/api/prism/score/bulk', {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }

    // Analytics endpoints
    async getSystemStats(): Promise<{
        total_products: number;
        total_incidents: number;
        total_mappings: number;
        products_with_images: number;
        human_validated_mappings: number;
    }> {
        return this.request('/api/stats');
    }

    // Technology and Purpose suggestions
    async getTechnologySuggestions(): Promise<string[]> {
        return this.request<string[]>('/api/suggestions/technologies');
    }

    async getPurposeSuggestions(): Promise<string[]> {
        return this.request<string[]>('/api/suggestions/purposes');
    }

    // Search suggestions
    async getSearchSuggestions(query: string, type: 'products' | 'incidents' = 'products'): Promise<string[]> {
        return this.request<string[]>(`/api/search/suggestions?q=${encodeURIComponent(query)}&type=${type}`);
    }
}

export const apiService = new ApiService();
export default apiService; 