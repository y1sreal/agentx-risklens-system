export interface UserAction {
    id: string;
    type: 'feedback' | 'view' | 'filter' | 'taxonomy_improvement' | 'exemplar_optimization';
    timestamp: string;
    details: any;
    incidentId?: number;
    productId?: number;
}

export interface ImpactMetrics {
    totalActions: number;
    feedbackGiven: number;
    improvementsSuggested: number;
    improvementsApplied: number;
    incidentsViewed: number;
    systemOptimizations: number;
    qualityImprovements: number;
    collaborativeScore: number;
    influenceScore: number;
    consistencyScore: number;
}

export interface SystemImprovement {
    id: string;
    type: 'prism_score_update' | 'taxonomy_refinement' | 'algorithm_adjustment' | 'data_quality_boost';
    description: string;
    userContribution: number; // 0-1 scale
    impactMagnitude: number; // 0-1 scale
    affectedIncidents: number[];
    timestamp: string;
    beforeMetric?: number;
    afterMetric?: number;
}

export interface CollaborativeInsight {
    id: string;
    title: string;
    description: string;
    userCount: number;
    consensusLevel: number; // 0-1 scale
    impact: 'high' | 'medium' | 'low';
    category: 'bias_detection' | 'quality_improvement' | 'taxonomy_enhancement' | 'safety_concern';
    timestamp: string;
}

export interface UserImpactReport {
    userId: string;
    timeframe: {
        start: string;
        end: string;
    };
    metrics: ImpactMetrics;
    improvements: SystemImprovement[];
    insights: CollaborativeInsight[];
    trends: {
        activityTrend: number; // positive/negative
        qualityTrend: number;
        collaborationTrend: number;
    };
    achievements: Achievement[];
    nextSteps: string[];
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    category: 'feedback' | 'collaboration' | 'quality' | 'discovery' | 'optimization';
    unlocked: boolean;
    progress: number; // 0-1 scale
    requirement: string;
    impact: string;
}

class UserImpactService {
    private static userActions: UserAction[] = [];
    private static systemImprovements: SystemImprovement[] = [];
    private static collaborativeInsights: CollaborativeInsight[] = [];

    public static logAction(action: Omit<UserAction, 'id' | 'timestamp'>): void {
        const newAction: UserAction = {
            ...action,
            id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString()
        };
        this.userActions.push(newAction);
        this.processActionForImpact(newAction);
    }

    private static processActionForImpact(action: UserAction): void {
        // Simulate processing user actions for system improvements
        if (action.type === 'feedback' && Math.random() > 0.7) {
            this.generateSystemImprovement(action);
        }
        
        if (action.type === 'taxonomy_improvement' && Math.random() > 0.8) {
            this.generateCollaborativeInsight(action);
        }
    }

    private static generateSystemImprovement(sourceAction: UserAction): void {
        const improvements: SystemImprovement[] = [
            {
                id: `improvement_${Date.now()}`,
                type: 'prism_score_update',
                description: 'PRISM scores refined based on user feedback patterns',
                userContribution: 0.3 + Math.random() * 0.4,
                impactMagnitude: 0.6 + Math.random() * 0.3,
                affectedIncidents: [sourceAction.incidentId || 1],
                timestamp: new Date().toISOString(),
                beforeMetric: 0.7,
                afterMetric: 0.8
            },
            {
                id: `improvement_${Date.now() + 1}`,
                type: 'algorithm_adjustment',
                description: 'Similarity matching algorithm improved with feedback data',
                userContribution: 0.2 + Math.random() * 0.3,
                impactMagnitude: 0.5 + Math.random() * 0.4,
                affectedIncidents: [],
                timestamp: new Date().toISOString(),
                beforeMetric: 0.75,
                afterMetric: 0.82
            }
        ];

        this.systemImprovements.push(improvements[Math.floor(Math.random() * improvements.length)]);
    }

    private static generateCollaborativeInsight(sourceAction: UserAction): void {
        const insights: CollaborativeInsight[] = [
            {
                id: `insight_${Date.now()}`,
                title: 'Emerging Bias Pattern Detected',
                description: 'Multiple users identified similar bias concerns in facial recognition incidents',
                userCount: 5 + Math.floor(Math.random() * 10),
                consensusLevel: 0.8 + Math.random() * 0.2,
                impact: 'high',
                category: 'bias_detection',
                timestamp: new Date().toISOString()
            },
            {
                id: `insight_${Date.now() + 1}`,
                title: 'Taxonomy Standardization Success',
                description: 'Community-driven improvements to AI technology categorization',
                userCount: 3 + Math.floor(Math.random() * 7),
                consensusLevel: 0.7 + Math.random() * 0.3,
                impact: 'medium',
                category: 'taxonomy_enhancement',
                timestamp: new Date().toISOString()
            }
        ];

        this.collaborativeInsights.push(insights[Math.floor(Math.random() * insights.length)]);
    }

    public static calculateMetrics(userId: string, timeframe: { start: string; end: string }): ImpactMetrics {
        const userActionsInTimeframe = this.userActions.filter(action => 
            action.timestamp >= timeframe.start && action.timestamp <= timeframe.end
        );

        const feedbackActions = userActionsInTimeframe.filter(a => a.type === 'feedback');
        const viewActions = userActionsInTimeframe.filter(a => a.type === 'view');
        const improvementActions = userActionsInTimeframe.filter(a => a.type === 'taxonomy_improvement');

        // Calculate collaborative score based on consistency and quality
        const collaborativeScore = this.calculateCollaborativeScore(userActionsInTimeframe);
        const influenceScore = this.calculateInfluenceScore(userId);
        const consistencyScore = this.calculateConsistencyScore(userActionsInTimeframe);

        return {
            totalActions: userActionsInTimeframe.length,
            feedbackGiven: feedbackActions.length,
            improvementsSuggested: improvementActions.length,
            improvementsApplied: improvementActions.filter(a => a.details?.applied).length,
            incidentsViewed: viewActions.length,
            systemOptimizations: this.systemImprovements.filter(imp => 
                imp.userContribution > 0 && 
                imp.timestamp >= timeframe.start && 
                imp.timestamp <= timeframe.end
            ).length,
            qualityImprovements: this.calculateQualityImprovements(userActionsInTimeframe),
            collaborativeScore,
            influenceScore,
            consistencyScore
        };
    }

    private static calculateCollaborativeScore(actions: UserAction[]): number {
        if (actions.length === 0) return 0;
        
        const feedbackActions = actions.filter(a => a.type === 'feedback');
        const constructiveFeedback = feedbackActions.filter(a => 
            a.details?.user_comment && a.details.user_comment.length > 10
        ).length;
        
        const collaborationWeight = constructiveFeedback / Math.max(actions.length, 1);
        return Math.min(collaborationWeight * 2, 1);
    }

    private static calculateInfluenceScore(userId: string): number {
        const userImprovements = this.systemImprovements.filter(imp => imp.userContribution > 0);
        const totalContribution = userImprovements.reduce((sum, imp) => sum + imp.userContribution, 0);
        return Math.min(totalContribution / 5, 1); // Normalize to 0-1 scale
    }

    private static calculateConsistencyScore(actions: UserAction[]): number {
        if (actions.length < 2) return 0;
        
        // Simple consistency metric based on regular activity
        const timeSpread = new Date(actions[actions.length - 1].timestamp).getTime() - 
                         new Date(actions[0].timestamp).getTime();
        const daySpread = timeSpread / (1000 * 60 * 60 * 24);
        const actionsPerDay = actions.length / Math.max(daySpread, 1);
        
        return Math.min(actionsPerDay / 3, 1); // Normalize assuming 3 actions/day is high consistency
    }

    private static calculateQualityImprovements(actions: UserAction[]): number {
        const improvementActions = actions.filter(a => 
            a.type === 'taxonomy_improvement' || 
            (a.type === 'feedback' && a.details?.prism_scores)
        );
        return improvementActions.length;
    }

    public static getAchievements(): Achievement[] {
        const achievements: Achievement[] = [
            {
                id: 'first_feedback',
                title: 'First Feedback',
                description: 'Provided your first incident feedback',
                icon: '💬',
                category: 'feedback',
                unlocked: this.userActions.some(a => a.type === 'feedback'),
                progress: this.userActions.filter(a => a.type === 'feedback').length > 0 ? 1 : 0,
                requirement: 'Provide feedback on any incident',
                impact: 'Helps improve system accuracy'
            },
            {
                id: 'quality_contributor',
                title: 'Quality Contributor',
                description: 'Provided 10+ high-quality feedback entries',
                icon: '⭐',
                category: 'quality',
                unlocked: this.userActions.filter(a => a.type === 'feedback').length >= 10,
                progress: Math.min(this.userActions.filter(a => a.type === 'feedback').length / 10, 1),
                requirement: 'Provide 10 feedback entries',
                impact: 'Significantly improves incident scoring'
            },
            {
                id: 'taxonomy_expert',
                title: 'Taxonomy Expert',
                description: 'Applied 5+ taxonomy improvements',
                icon: '🏷️',
                category: 'optimization',
                unlocked: this.userActions.filter(a => a.type === 'taxonomy_improvement').length >= 5,
                progress: Math.min(this.userActions.filter(a => a.type === 'taxonomy_improvement').length / 5, 1),
                requirement: 'Apply 5 taxonomy suggestions',
                impact: 'Standardizes system terminology'
            },
            {
                id: 'community_leader',
                title: 'Community Leader',
                description: 'Contributed to 3+ collaborative insights',
                icon: '👥',
                category: 'collaboration',
                unlocked: this.collaborativeInsights.length >= 3,
                progress: Math.min(this.collaborativeInsights.length / 3, 1),
                requirement: 'Contribute to community insights',
                impact: 'Shapes system direction'
            },
            {
                id: 'explorer',
                title: 'Explorer',
                description: 'Reviewed 50+ incidents across different domains',
                icon: '🔍',
                category: 'discovery',
                unlocked: this.userActions.filter(a => a.type === 'view').length >= 50,
                progress: Math.min(this.userActions.filter(a => a.type === 'view').length / 50, 1),
                requirement: 'View 50 incidents',
                impact: 'Broadens understanding of AI risks'
            }
        ];

        return achievements;
    }

    public static getUserImpactReport(userId: string, timeframeDays: number = 30): UserImpactReport {
        const end = new Date();
        const start = new Date(end.getTime() - timeframeDays * 24 * 60 * 60 * 1000);
        
        const timeframe = {
            start: start.toISOString(),
            end: end.toISOString()
        };

        const metrics = this.calculateMetrics(userId, timeframe);
        const userImprovements = this.systemImprovements.filter(imp => 
            imp.userContribution > 0 && 
            imp.timestamp >= timeframe.start && 
            imp.timestamp <= timeframe.end
        );

        const achievements = this.getAchievements();

        // Calculate trends (simplified)
        const activityTrend = metrics.totalActions > 10 ? 0.1 : -0.05;
        const qualityTrend = metrics.collaborativeScore > 0.7 ? 0.15 : 0;
        const collaborationTrend = metrics.influenceScore > 0.5 ? 0.1 : -0.02;

        const nextSteps = this.generateNextSteps(metrics, achievements);

        return {
            userId,
            timeframe,
            metrics,
            improvements: userImprovements,
            insights: this.collaborativeInsights.slice(-5), // Recent insights
            trends: {
                activityTrend,
                qualityTrend,
                collaborationTrend
            },
            achievements,
            nextSteps
        };
    }

    private static generateNextSteps(metrics: ImpactMetrics, achievements: Achievement[]): string[] {
        const steps: string[] = [];
        
        if (metrics.feedbackGiven < 5) {
            steps.push('Provide more incident feedback to improve system accuracy');
        }
        
        if (metrics.improvementsSuggested === 0) {
            steps.push('Try using taxonomy improvements to standardize terminology');
        }
        
        if (metrics.collaborativeScore < 0.5) {
            steps.push('Write more detailed feedback comments to help the community');
        }
        
        const unlockedAchievements = achievements.filter(a => !a.unlocked);
        if (unlockedAchievements.length > 0) {
            const nextAchievement = unlockedAchievements.sort((a, b) => b.progress - a.progress)[0];
            steps.push(`Work towards: ${nextAchievement.title} - ${nextAchievement.requirement}`);
        }
        
        if (steps.length === 0) {
            steps.push('Continue your excellent contributions to maintain system quality');
        }
        
        return steps.slice(0, 3); // Limit to top 3 suggestions
    }

    public static getSystemImprovements(): SystemImprovement[] {
        return this.systemImprovements.slice().sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
    }

    public static getCollaborativeInsights(): CollaborativeInsight[] {
        return this.collaborativeInsights.slice().sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
    }

    // Initialize with some sample data
    public static initializeSampleData(): void {
        // Add some sample actions
        this.logAction({
            type: 'feedback',
            details: {
                user_comment: 'This incident is very relevant to our facial recognition system',
                relevance: true,
                prism_scores: { contextual_relevance: 0.9 }
            },
            incidentId: 1,
            productId: 1
        });

        this.logAction({
            type: 'taxonomy_improvement',
            details: {
                applied: true,
                from: 'Face Recognition',
                to: 'Facial Recognition'
            },
            productId: 1
        });

        this.logAction({
            type: 'view',
            details: { duration: 45 },
            incidentId: 2
        });
    }
}

export { UserImpactService }; 