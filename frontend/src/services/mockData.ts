import { Product, Incident, Feedback, Version } from '../types/index';

// Mock data
const mockProducts: Product[] = [
    {
        id: 1,
        name: "AI-Powered Facial Recognition System",
        description: "Advanced computer vision system for identity verification and access control using deep learning algorithms.",
        technology: ["Computer Vision", "Deep Learning", "Facial Recognition", "Neural Networks", "CNN"],
        purpose: ["Identity Verification", "Access Control", "Security Monitoring", "Biometric Authentication"],
        ethical_issues: ["Privacy Violation", "Algorithmic Bias", "Surveillance Concerns", "Data Protection"],
        created_at: "2023-01-15",
        updated_at: "2023-06-20"
    },
    {
        id: 2,
        name: "ChatBot Customer Service Platform",
        description: "Large language model-based conversational AI for automated customer support and engagement.",
        technology: ["Natural Language Processing", "Large Language Models", "Transformers", "Chatbots", "NLP"],
        purpose: ["Customer Service", "Automated Support", "Conversational AI", "Help Desk Automation"],
        ethical_issues: ["Misinformation Risk", "Job Displacement", "Data Privacy", "Manipulation"],
        created_at: "2023-02-10",
        updated_at: "2023-07-05"
    },
    {
        id: 3,
        name: "Autonomous Vehicle Navigation System",
        description: "Self-driving car technology using reinforcement learning and sensor fusion for safe navigation.",
        technology: ["Reinforcement Learning", "Computer Vision", "Sensor Fusion", "Deep Learning", "Autonomous Systems"],
        purpose: ["Transportation", "Safety Enhancement", "Traffic Optimization", "Autonomous Navigation"],
        ethical_issues: ["Safety Risks", "Liability Issues", "Job Displacement", "Decision Making Ethics"],
        created_at: "2023-03-05",
        updated_at: "2023-08-12"
    },
    {
        id: 4,
        name: "Medical Diagnosis AI Assistant",
        description: "AI system for medical image analysis and diagnostic assistance using convolutional neural networks.",
        technology: ["Medical AI", "Convolutional Neural Networks", "Image Recognition", "Deep Learning", "Computer Vision"],
        purpose: ["Medical Diagnosis", "Healthcare AI", "Diagnostic Assistance", "Medical Imaging"],
        ethical_issues: ["Medical Liability", "Diagnostic Accuracy", "Healthcare Bias", "Patient Privacy"],
        created_at: "2023-04-20",
        updated_at: "2023-09-01"
    },
    {
        id: 5,
        name: "Financial Fraud Detection Engine",
        description: "Machine learning system for real-time fraud detection and risk assessment in financial transactions.",
        technology: ["Machine Learning", "Anomaly Detection", "Supervised Learning", "Ensemble Methods", "Pattern Recognition"],
        purpose: ["Fraud Detection", "Risk Assessment", "Financial Security", "Transaction Monitoring"],
        ethical_issues: ["False Positives", "Financial Discrimination", "Privacy Concerns", "Algorithmic Transparency"],
        created_at: "2023-05-12",
        updated_at: "2023-09-18"
    },
    {
        id: 6,
        name: "Content Recommendation Algorithm",
        description: "Personalized content recommendation system using collaborative filtering and deep learning.",
        technology: ["Recommendation Systems", "Collaborative Filtering", "Deep Learning", "Neural Networks", "Machine Learning"],
        purpose: ["Content Personalization", "User Engagement", "Recommendation Systems", "Content Discovery"],
        ethical_issues: ["Filter Bubbles", "Addiction Potential", "Data Privacy", "Manipulation"],
        created_at: "2023-06-08",
        updated_at: "2023-10-03"
    },
    {
        id: 7,
        name: "Smart Home Security System",
        description: "AI-powered home security system that uses facial recognition and behavior analysis to detect potential threats.",
        technology: ["Computer Vision", "Edge Computing", "IoT"],
        purpose: ["Security", "Home Automation", "Surveillance"],
        ethical_issues: ["Privacy", "Surveillance", "Data Protection"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 8,
        name: "AI Content Moderator",
        description: "Automated system for detecting and filtering inappropriate content across social media platforms.",
        technology: ["NLP", "Computer Vision", "Deep Learning"],
        purpose: ["Content Moderation", "Community Safety", "Compliance"],
        ethical_issues: ["Censorship", "Bias", "Freedom of Expression"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 9,
        name: "Financial Trading Bot",
        description: "AI system that analyzes market data and executes trades automatically based on complex algorithms.",
        technology: ["Machine Learning", "Time Series Analysis", "High-Frequency Trading"],
        purpose: ["Financial Trading", "Investment", "Market Analysis"],
        ethical_issues: ["Market Manipulation", "Transparency", "Financial Risk"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 10,
        name: "AI Recruiting Assistant",
        description: "Automated system for screening resumes and conducting initial candidate interviews.",
        technology: ["NLP", "Machine Learning", "Sentiment Analysis"],
        purpose: ["HR", "Recruitment", "Talent Management"],
        ethical_issues: ["Bias", "Discrimination", "Fairness"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 11,
        name: "Smart Agriculture System",
        description: "IoT-based system for monitoring crop health and optimizing resource usage in farming.",
        technology: ["IoT", "Computer Vision", "Predictive Analytics"],
        purpose: ["Agriculture", "Sustainability", "Resource Optimization"],
        ethical_issues: ["Environmental Impact", "Data Ownership", "Food Security"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 12,
        name: "AI Legal Assistant",
        description: "System for analyzing legal documents and predicting case outcomes.",
        technology: ["NLP", "Machine Learning", "Knowledge Graphs"],
        purpose: ["Legal Analysis", "Document Review", "Case Prediction"],
        ethical_issues: ["Legal Liability", "Confidentiality", "Justice"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 13,
        name: "Smart City Traffic Management",
        description: "AI system for optimizing traffic flow and reducing congestion in urban areas.",
        technology: ["IoT", "Machine Learning", "Real-time Analytics"],
        purpose: ["Urban Planning", "Traffic Management", "Public Safety"],
        ethical_issues: ["Privacy", "Public Surveillance", "Equity"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 14,
        name: "AI Education Platform",
        description: "Personalized learning system that adapts to individual student needs and learning styles.",
        technology: ["Machine Learning", "NLP", "Adaptive Learning"],
        purpose: ["Education", "Personalized Learning", "Student Assessment"],
        ethical_issues: ["Data Privacy", "Educational Equity", "Bias"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 15,
        name: "Predictive Maintenance System",
        description: "AI system for predicting equipment failures and scheduling maintenance.",
        technology: ["IoT", "Predictive Analytics", "Machine Learning"],
        purpose: ["Industrial Maintenance", "Asset Management", "Risk Prevention"],
        ethical_issues: ["Safety", "Reliability", "Accountability"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 16,
        name: "AI Mental Health Assistant",
        description: "Virtual therapist that provides mental health support and crisis intervention.",
        technology: ["NLP", "Sentiment Analysis", "Machine Learning"],
        purpose: ["Mental Health", "Crisis Intervention", "Wellness"],
        ethical_issues: ["Privacy", "Medical Ethics", "Crisis Management"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 17,
        name: "Smart Energy Grid",
        description: "AI-powered system for optimizing energy distribution and consumption.",
        technology: ["IoT", "Machine Learning", "Grid Computing"],
        purpose: ["Energy Management", "Sustainability", "Resource Optimization"],
        ethical_issues: ["Energy Equity", "Grid Security", "Environmental Impact"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 18,
        name: "AI Journalism Assistant",
        description: "System for automated news writing and fact-checking.",
        technology: ["NLP", "Machine Learning", "Information Retrieval"],
        purpose: ["Journalism", "Content Creation", "Fact Checking"],
        ethical_issues: ["Misinformation", "Bias", "Media Ethics"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 19,
        name: "Smart Retail Analytics",
        description: "AI system for analyzing customer behavior and optimizing store layouts.",
        technology: ["Computer Vision", "Machine Learning", "Behavioral Analytics"],
        purpose: ["Retail Analytics", "Customer Experience", "Store Optimization"],
        ethical_issues: ["Privacy", "Surveillance", "Consumer Rights"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 20,
        name: "AI Environmental Monitor",
        description: "System for monitoring and predicting environmental changes and natural disasters.",
        technology: ["IoT", "Machine Learning", "Climate Modeling"],
        purpose: ["Environmental Protection", "Disaster Prevention", "Climate Monitoring"],
        ethical_issues: ["Data Accuracy", "Environmental Impact", "Public Safety"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 21,
        name: "Smart Manufacturing System",
        description: "AI-powered system for optimizing manufacturing processes and quality control.",
        technology: ["IoT", "Computer Vision", "Predictive Analytics"],
        purpose: ["Manufacturing", "Quality Control", "Process Optimization"],
        ethical_issues: ["Worker Safety", "Job Displacement", "Quality Standards"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 22,
        name: "AI Language Translation",
        description: "Real-time translation system for multiple languages with cultural context awareness.",
        technology: ["NLP", "Deep Learning", "Neural Machine Translation"],
        purpose: ["Language Translation", "Cultural Exchange", "Communication"],
        ethical_issues: ["Cultural Sensitivity", "Accuracy", "Language Preservation"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 23,
        name: "Smart Healthcare Monitoring",
        description: "Wearable-based system for continuous health monitoring and early disease detection.",
        technology: ["IoT", "Machine Learning", "Biometric Sensors"],
        purpose: ["Health Monitoring", "Disease Prevention", "Remote Care"],
        ethical_issues: ["Medical Privacy", "Data Security", "Healthcare Access"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 24,
        name: "AI Creative Assistant",
        description: "System for generating and enhancing creative content like art, music, and writing.",
        technology: ["Generative AI", "Deep Learning", "Creative Computing"],
        purpose: ["Content Creation", "Creative Assistance", "Artistic Expression"],
        ethical_issues: ["Copyright", "Authenticity", "Creative Ownership"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];

const mockIncidents: Incident[] = [
    {
        id: 1,
        title: "AI Chatbot Privacy Breach",
        description: "A popular AI chatbot was found to be storing and potentially exposing sensitive user conversations.",
        technologies: ["Natural Language Processing", "Machine Learning"],
        risk_level: "high",
        risk_domain: "Privacy",
        impact_scale: 0.8,
        confidence_score: 0.9,
        prism_scores: {
            logical_coherence: 0.9,
            factual_accuracy: 0.8,
            practical_implementability: 0.7,
            contextual_relevance: 0.9,
            uniqueness: 0.8,
            impact_scale: 0.8
        },
        created_at: "2024-03-15T10:00:00Z",
        updated_at: "2024-03-15T10:00:00Z"
    },
    {
        id: 2,
        title: "Autonomous Vehicle Navigation Error",
        description: "Self-driving car failed to recognize a temporary road construction sign, causing a minor accident.",
        technologies: ["Computer Vision", "Autonomous Systems"],
        risk_level: "high",
        risk_domain: "Safety",
        impact_scale: 0.9,
        confidence_score: 0.85,
        prism_scores: {
            logical_coherence: 0.9,
            factual_accuracy: 0.9,
            practical_implementability: 0.8,
            contextual_relevance: 0.9,
            uniqueness: 0.7,
            impact_scale: 0.9
        },
        created_at: "2024-03-15T10:00:00Z",
        updated_at: "2024-03-15T10:00:00Z"
    },
    {
        id: 3,
        title: "Facial Recognition Bias Incident",
        description: "AI system showed significant bias in recognizing faces of certain demographic groups.",
        technologies: ["Computer Vision", "Deep Learning"],
        risk_level: "high",
        risk_domain: "Bias",
        impact_scale: 0.85,
        confidence_score: 0.9,
        prism_scores: {
            logical_coherence: 0.8,
            factual_accuracy: 0.9,
            practical_implementability: 0.7,
            contextual_relevance: 0.9,
            uniqueness: 0.6,
            impact_scale: 0.85
        },
        created_at: "2024-03-15T10:00:00Z",
        updated_at: "2024-03-15T10:00:00Z"
    },
    {
        id: 4,
        title: "Healthcare AI Misdiagnosis",
        description: "AI diagnostic system provided incorrect treatment recommendations for rare conditions.",
        technologies: ["Machine Learning", "Medical AI"],
        risk_level: "high",
        risk_domain: "Safety",
        impact_scale: 0.95,
        confidence_score: 0.8,
        prism_scores: {
            logical_coherence: 0.7,
            factual_accuracy: 0.8,
            practical_implementability: 0.6,
            contextual_relevance: 0.9,
            uniqueness: 0.5,
            impact_scale: 0.95
        },
        created_at: "2024-03-15T10:00:00Z",
        updated_at: "2024-03-15T10:00:00Z"
    },
    {
        id: 5,
        title: "Financial Trading Algorithm Malfunction",
        description: "Automated trading system caused market volatility due to unexpected behavior.",
        technologies: ["Algorithmic Trading", "Machine Learning"],
        risk_level: "high",
        risk_domain: "Accountability",
        impact_scale: 0.9,
        confidence_score: 0.85,
        prism_scores: {
            logical_coherence: 0.8,
            factual_accuracy: 0.7,
            practical_implementability: 0.9,
            contextual_relevance: 0.8,
            uniqueness: 0.8,
            impact_scale: 0.9
        },
        created_at: "2024-03-15T10:00:00Z",
        updated_at: "2024-03-15T10:00:00Z"
    },
    {
        id: 6,
        title: "Smart Home Security Breach",
        description: "Hackers gained unauthorized access to home security cameras through AI system vulnerabilities.",
        technologies: ["IoT", "Computer Vision"],
        risk_level: "high",
        risk_domain: "Privacy",
        impact_scale: 0.85,
        confidence_score: 0.9,
        prism_scores: {
            logical_coherence: 0.9,
            factual_accuracy: 0.8,
            practical_implementability: 0.7,
            contextual_relevance: 0.9,
            uniqueness: 0.8,
            impact_scale: 0.85
        },
        created_at: "2024-03-15T10:00:00Z",
        updated_at: "2024-03-15T10:00:00Z"
    },
    {
        id: 7,
        title: "AI Content Moderation Overreach",
        description: "Automated content moderation system incorrectly flagged legitimate content as inappropriate.",
        technologies: ["NLP", "Machine Learning"],
        risk_level: "medium",
        risk_domain: "Bias",
        impact_scale: 0.7,
        confidence_score: 0.8,
        prism_scores: {
            logical_coherence: 0.8,
            factual_accuracy: 0.7,
            practical_implementability: 0.8,
            contextual_relevance: 0.8,
            uniqueness: 0.6,
            impact_scale: 0.7
        },
        created_at: "2024-03-15T10:00:00Z",
        updated_at: "2024-03-15T10:00:00Z"
    },
    {
        id: 8,
        title: "Smart City Surveillance Concerns",
        description: "AI-powered city surveillance system raised privacy concerns due to extensive data collection.",
        technologies: ["Computer Vision", "IoT"],
        risk_level: "high",
        risk_domain: "Privacy",
        impact_scale: 0.8,
        confidence_score: 0.9,
        prism_scores: {
            logical_coherence: 0.9,
            factual_accuracy: 0.8,
            practical_implementability: 0.8,
            contextual_relevance: 0.9,
            uniqueness: 0.7,
            impact_scale: 0.8
        },
        created_at: "2024-03-15T10:00:00Z",
        updated_at: "2024-03-15T10:00:00Z"
    },
    {
        id: 9,
        title: "AI Recruitment Bias",
        description: "Automated recruitment system showed bias against certain demographic groups.",
        technologies: ["NLP", "Machine Learning"],
        risk_level: "high",
        risk_domain: "Bias",
        impact_scale: 0.85,
        confidence_score: 0.9,
        prism_scores: {
            logical_coherence: 0.8,
            factual_accuracy: 0.9,
            practical_implementability: 0.7,
            contextual_relevance: 0.9,
            uniqueness: 0.6,
            impact_scale: 0.85
        },
        created_at: "2024-03-15T10:00:00Z",
        updated_at: "2024-03-15T10:00:00Z"
    },
    {
        id: 10,
        title: "Smart Grid Vulnerability",
        description: "AI-powered energy grid system was vulnerable to cyber attacks.",
        technologies: ["IoT", "Machine Learning"],
        risk_level: "high",
        risk_domain: "Safety",
        impact_scale: 0.9,
        confidence_score: 0.85,
        prism_scores: {
            logical_coherence: 0.9,
            factual_accuracy: 0.8,
            practical_implementability: 0.8,
            contextual_relevance: 0.9,
            uniqueness: 0.8,
            impact_scale: 0.9
        },
        created_at: "2024-03-15T10:00:00Z",
        updated_at: "2024-03-15T10:00:00Z"
    },
    {
        id: 11,
        title: "AI Legal Analysis Error",
        description: "Automated legal analysis system provided incorrect interpretations of case law.",
        technologies: ["NLP", "Machine Learning"],
        risk_level: "high",
        risk_domain: "Accountability",
        impact_scale: 0.85,
        confidence_score: 0.8,
        prism_scores: {
            logical_coherence: 0.7,
            factual_accuracy: 0.8,
            practical_implementability: 0.6,
            contextual_relevance: 0.9,
            uniqueness: 0.5,
            impact_scale: 0.85
        },
        created_at: "2024-03-15T10:00:00Z",
        updated_at: "2024-03-15T10:00:00Z"
    },
    {
        id: 12,
        title: "Smart Agriculture Data Breach",
        description: "Sensitive farming data was exposed due to vulnerabilities in agricultural IoT system.",
        technologies: ["IoT", "Machine Learning"],
        risk_level: "medium",
        risk_domain: "Privacy",
        impact_scale: 0.7,
        confidence_score: 0.85,
        prism_scores: {
            logical_coherence: 0.8,
            factual_accuracy: 0.9,
            practical_implementability: 0.7,
            contextual_relevance: 0.8,
            uniqueness: 0.7,
            impact_scale: 0.7
        },
        created_at: "2024-03-15T10:00:00Z",
        updated_at: "2024-03-15T10:00:00Z"
    },
    {
        id: 13,
        title: "AI Education Bias",
        description: "Automated grading system showed bias in evaluating student work.",
        technologies: ["NLP", "Machine Learning"],
        risk_level: "medium",
        risk_domain: "Bias",
        impact_scale: 0.75,
        confidence_score: 0.8,
        prism_scores: {
            logical_coherence: 0.8,
            factual_accuracy: 0.7,
            practical_implementability: 0.8,
            contextual_relevance: 0.8,
            uniqueness: 0.6,
            impact_scale: 0.75
        },
        created_at: "2024-03-15T10:00:00Z",
        updated_at: "2024-03-15T10:00:00Z"
    },
    {
        id: 14,
        title: "Smart Manufacturing Safety Incident",
        description: "AI-powered manufacturing system failed to detect a safety hazard.",
        technologies: ["Computer Vision", "IoT"],
        risk_level: "high",
        risk_domain: "Safety",
        impact_scale: 0.9,
        confidence_score: 0.85,
        prism_scores: {
            logical_coherence: 0.9,
            factual_accuracy: 0.8,
            practical_implementability: 0.8,
            contextual_relevance: 0.9,
            uniqueness: 0.7,
            impact_scale: 0.9
        },
        created_at: "2024-03-15T10:00:00Z",
        updated_at: "2024-03-15T10:00:00Z"
    },
    {
        id: 15,
        title: "AI Translation Cultural Insensitivity",
        description: "Automated translation system produced culturally insensitive content.",
        technologies: ["NLP", "Machine Learning"],
        risk_level: "medium",
        risk_domain: "Bias",
        impact_scale: 0.7,
        confidence_score: 0.8,
        prism_scores: {
            logical_coherence: 0.8,
            factual_accuracy: 0.7,
            practical_implementability: 0.8,
            contextual_relevance: 0.8,
            uniqueness: 0.6,
            impact_scale: 0.7
        },
        created_at: "2024-03-15T10:00:00Z",
        updated_at: "2024-03-15T10:00:00Z"
    },
    {
        id: 16,
        title: "Smart Healthcare Data Breach",
        description: "Unauthorized access to sensitive patient data through AI monitoring system.",
        technologies: ["IoT", "Machine Learning"],
        risk_level: "high",
        risk_domain: "Privacy",
        impact_scale: 0.9,
        confidence_score: 0.9,
        prism_scores: {
            logical_coherence: 0.9,
            factual_accuracy: 0.9,
            practical_implementability: 0.8,
            contextual_relevance: 0.9,
            uniqueness: 0.8,
            impact_scale: 0.9
        },
        created_at: "2024-03-15T10:00:00Z",
        updated_at: "2024-03-15T10:00:00Z"
    },
    {
        id: 17,
        title: "AI Creative Copyright Issue",
        description: "AI-generated content was found to infringe on existing copyrights.",
        technologies: ["Generative AI", "Deep Learning"],
        risk_level: "medium",
        risk_domain: "Accountability",
        impact_scale: 0.75,
        confidence_score: 0.8,
        prism_scores: {
            logical_coherence: 0.8,
            factual_accuracy: 0.7,
            practical_implementability: 0.8,
            contextual_relevance: 0.8,
            uniqueness: 0.6,
            impact_scale: 0.75
        },
        created_at: "2024-03-15T10:00:00Z",
        updated_at: "2024-03-15T10:00:00Z"
    },
    {
        id: 18,
        title: "Smart Retail Privacy Concerns",
        description: "AI-powered retail analytics system collected customer data without proper consent.",
        technologies: ["Computer Vision", "Machine Learning"],
        risk_level: "medium",
        risk_domain: "Privacy",
        impact_scale: 0.7,
        confidence_score: 0.85,
        prism_scores: {
            logical_coherence: 0.8,
            factual_accuracy: 0.9,
            practical_implementability: 0.7,
            contextual_relevance: 0.8,
            uniqueness: 0.7,
            impact_scale: 0.7
        },
        created_at: "2024-03-15T10:00:00Z",
        updated_at: "2024-03-15T10:00:00Z"
    },
    {
        id: 19,
        title: "AI Environmental Prediction Error",
        description: "Climate prediction system provided inaccurate forecasts leading to poor resource allocation.",
        technologies: ["Machine Learning", "Climate Modeling"],
        risk_level: "high",
        risk_domain: "Accountability",
        impact_scale: 0.85,
        confidence_score: 0.8,
        prism_scores: {
            logical_coherence: 0.7,
            factual_accuracy: 0.8,
            practical_implementability: 0.6,
            contextual_relevance: 0.9,
            uniqueness: 0.5,
            impact_scale: 0.85
        },
        created_at: "2024-03-15T10:00:00Z",
        updated_at: "2024-03-15T10:00:00Z"
    },
    {
        id: 20,
        title: "Smart Manufacturing Quality Control Failure",
        description: "AI quality control system failed to detect defective products in production line.",
        technologies: ["Computer Vision", "IoT"],
        risk_level: "high",
        risk_domain: "Safety",
        impact_scale: 0.9,
        confidence_score: 0.85,
        prism_scores: {
            logical_coherence: 0.9,
            factual_accuracy: 0.8,
            practical_implementability: 0.8,
            contextual_relevance: 0.9,
            uniqueness: 0.7,
            impact_scale: 0.9
        },
        created_at: "2024-03-15T10:00:00Z",
        updated_at: "2024-03-15T10:00:00Z"
    }
];

// Mock versions data
const mockVersions: Version[] = [];

// Mock service functions
export const mockService = {
    // Product functions
    async getProducts(): Promise<Product[]> {
        return mockProducts;
    },

    async getProduct(id: number): Promise<Product | null> {
        return mockProducts.find(p => p.id === id) || null;
    },

    async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
        const newProduct = {
            ...product,
            id: mockProducts.length + 1
        };
        mockProducts.push(newProduct);
        return newProduct;
    },

    async updateProduct(id: number, updates: Partial<Product>): Promise<Product> {
        const index = mockProducts.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Product not found');
        
        const updatedProduct = {
            ...mockProducts[index],
            ...updates,
            updated_at: new Date().toISOString()
        };
        mockProducts[index] = updatedProduct;
        return updatedProduct;
    },

    // Incident functions
    async getIncidents(): Promise<Incident[]> {
        return mockIncidents;
    },

    async getIncident(id: number): Promise<Incident | null> {
        return mockIncidents.find(i => i.id === id) || null;
    },

    async getSimilarIncidents(
        productId: number,
        limit: number = 5,
        sortBy: string = "similarity",
        riskDomain?: string,
        minSimilarity: number = 0.0,
        minRiskScore: number = 0.0
    ): Promise<Incident[]> {
        // Simulate similarity calculation
        const product = await this.getProduct(productId);
        if (!product) return [];

        const scoredIncidents = mockIncidents.map(incident => {
            const similarityScore = calculateSimilarityScore(product, incident);
            const riskScore = calculateRiskScore(incident);
            return {
                ...incident,
                similarity_score: similarityScore,
                risk_score: riskScore,
                relevance_score: similarityScore * riskScore
            };
        });

        // Apply filters
        let filtered = scoredIncidents.filter(incident => 
            incident.similarity_score >= minSimilarity &&
            incident.risk_score >= minRiskScore &&
            (!riskDomain || incident.risk_domain === riskDomain)
        );

        // Sort
        switch (sortBy) {
            case "similarity":
                filtered.sort((a, b) => b.similarity_score - a.similarity_score);
                break;
            case "risk":
                filtered.sort((a, b) => b.risk_score - a.risk_score);
                break;
            case "relevance":
                filtered.sort((a, b) => b.relevance_score - a.relevance_score);
                break;
        }

        return filtered.slice(0, limit);
    },

    // Version functions
    async getVersions(incidentId: number): Promise<Version[]> {
        return mockVersions.filter(v => v.incident_id === incidentId);
    },

    // Feedback functions
    getFeedbackHistory: async (incidentId: number): Promise<Feedback[]> => {
        // Simulated feedback history
        return [
            {
                id: 1,
                incident_id: incidentId,
                user_comment: "This is very relevant to our system",
                relevance: true,
                suggested_incidents: [],
                index_labels: [],
                prism_scores: {
                    logical_coherence: 0.8,
                    factual_accuracy: 0.7,
                    practical_implementability: 0.9,
                    contextual_relevance: 0.85,
                    uniqueness: 0.6,
                    impact_scale: 0.75
                },
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        ];
    },

    submitFeedback: async (incidentId: number, feedback: Partial<Feedback>): Promise<void> => {
        // Simulate feedback submission
        console.log('Submitting feedback:', { incidentId, feedback });
    },

    optimizeWithFeedback: async (incidentIds: number | number[], feedbackHistory: Feedback[]): Promise<void> => {
        // Simulate exemplar optimization
        console.log('Optimizing exemplars:', { incidentIds, feedbackHistory });
        
        // If single incident ID is provided, convert to array
        const ids = Array.isArray(incidentIds) ? incidentIds : [incidentIds];
        
        // Update PRISM scores for all incidents based on feedback
        ids.forEach(id => {
            const incident = mockIncidents.find(i => i.id === id);
            if (!incident || !incident.prism_scores) return;

            // Store prism scores in a variable to avoid undefined checks
            const prismScores = incident.prism_scores;

            // Apply feedback to update PRISM scores
            feedbackHistory.forEach(feedback => {
                if (!feedback.prism_scores) return;

                // Update each PRISM score
                const scores = {
                    logical_coherence: prismScores.logical_coherence,
                    factual_accuracy: prismScores.factual_accuracy,
                    practical_implementability: prismScores.practical_implementability,
                    contextual_relevance: prismScores.contextual_relevance,
                    uniqueness: prismScores.uniqueness,
                    impact_scale: prismScores.impact_scale
                };

                Object.entries(scores).forEach(([key, value]) => {
                    const feedbackValue = feedback.prism_scores?.[key as keyof typeof feedback.prism_scores] || 0;
                    prismScores[key as keyof typeof prismScores] = Math.min((value + feedbackValue) / 2, 1.0);
                });
            });
        });
    },

    // Exemplar and optimization functions
    async getSimilarExemplars(incidentId: number): Promise<Incident[]> {
        // Simulate finding similar exemplars
        return mockIncidents.filter(i => i.id !== incidentId).slice(0, 3);
    },

    async optimizeIncident(incidentId: number, feedback: Partial<Feedback>): Promise<Incident> {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const incident = mockIncidents.find(i => i.id === incidentId);
        if (!incident) throw new Error('Incident not found');
        // Update PRISM scores
        const newPrism = incident.prism_scores ? {
            ...incident.prism_scores,
            logical_coherence: Math.min((incident.prism_scores.logical_coherence || 0) + 0.1, 1.0),
            factual_accuracy: Math.min((incident.prism_scores.factual_accuracy || 0) + 0.1, 1.0),
            practical_implementability: Math.min((incident.prism_scores.practical_implementability || 0) + 0.1, 1.0),
            contextual_relevance: Math.min((incident.prism_scores.contextual_relevance || 0) + 0.1, 1.0),
            uniqueness: Math.min((incident.prism_scores.uniqueness || 0) + 0.1, 1.0),
            impact_scale: Math.min((incident.prism_scores.impact_scale || 0) + 0.1, 1.0)
        } : undefined;
        const optimizedIncident: Incident = {
            ...incident,
            description: `${incident.description}\n\nOptimized based on feedback: ${feedback.user_comment || 'No specific feedback provided'}`,
            updated_at: new Date().toISOString(),
            prism_scores: newPrism
        };
        const index = mockIncidents.findIndex(i => i.id === incidentId);
        if (index !== -1) mockIncidents[index] = optimizedIncident;
        return optimizedIncident;
    },

    async applyExemplar(incidentId: number, exemplarId: number): Promise<Incident> {
        const incident = mockIncidents.find(i => i.id === incidentId);
        const exemplar = mockIncidents.find(i => i.id === exemplarId);
        if (!incident || !exemplar) throw new Error('Incident or exemplar not found');
        return {
            ...incident,
            description: `${incident.description}\n\nApplied patterns from exemplar: ${exemplar.title}`,
            technologies: [...new Set([...incident.technologies, ...exemplar.technologies])],
        };
    },

    async optimizeExemplars(incidentId: number, selectedExemplarIds: number[]): Promise<Incident[]> {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get the selected exemplars
        const selectedExemplars = mockIncidents.filter(incident => 
            selectedExemplarIds.includes(incident.id)
        );

        // Simulate optimization by adding some variation to the exemplars
        return selectedExemplars.map(exemplar => ({
            ...exemplar,
            id: exemplar.id + 1000, // New ID to avoid conflicts
            title: `Optimized: ${exemplar.title}`,
            description: `[Optimized] ${exemplar.description}`,
            confidence_score: Math.min(exemplar.confidence_score + 0.1, 1.0),
            prism_scores: exemplar.prism_scores ? {
                ...exemplar.prism_scores,
                contextual_relevance: Math.min((exemplar.prism_scores.contextual_relevance || 0) + 0.1, 1.0),
                impact_scale: Math.min((exemplar.prism_scores.impact_scale || 0) + 0.1, 1.0)
            } : undefined
        }));
    }
};

// Helper functions
function calculateSimilarityScore(product: Product, incident: Incident): number {
    const techOverlap = product.technology.filter(t => incident.technologies.includes(t)).length;
    const totalTags = product.technology.length;
    const totalOverlap = techOverlap;
    return totalTags > 0 ? totalOverlap / totalTags : 0;
}

function calculateRiskScore(incident: Incident): number {
    const weights = {
        logical_coherence: 0.1,
        factual_accuracy: 0.1,
        practical_implementability: 0.1,
        contextual_relevance: 0.2,
        uniqueness: 0.2,
        impact_scale: 0.2,
    };
    const riskLevelMap = { 'low': 0.3, 'medium': 0.6, 'high': 0.9 };
    const prism = incident.prism_scores;
    const score = (
        (prism?.logical_coherence ?? 0) * weights.logical_coherence +
        (prism?.factual_accuracy ?? 0) * weights.factual_accuracy +
        (prism?.practical_implementability ?? 0) * weights.practical_implementability +
        (prism?.contextual_relevance ?? 0) * weights.contextual_relevance +
        (prism?.uniqueness ?? 0) * weights.uniqueness +
        (prism?.impact_scale ?? 0) * weights.impact_scale
    );
    const riskLevelFactor = riskLevelMap[incident.risk_level] || 0.5;
    return score * riskLevelFactor;
} 