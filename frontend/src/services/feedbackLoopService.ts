export interface FeedbackLoopStage {
    id: string;
    name: string;
    description: string;
    icon: string;
    status: 'pending' | 'active' | 'completed' | 'failed';
    progress: number; // 0-1
    timeEstimate?: string;
    dependencies?: string[];
    outputs?: string[];
}

export interface FeedbackLoopFlow {
    id: string;
    userId: string;
    feedbackId: string;
    startTime: string;
    currentStage: string;
    stages: FeedbackLoopStage[];
    overallProgress: number;
    estimatedCompletion?: string;
    actualCompletion?: string;
    impact: FeedbackImpact;
}

export interface FeedbackImpact {
    systemChanges: SystemChange[];
    metricsImprovement: MetricImprovement[];
    affectedUsers: number;
    confidenceIncrease: number;
    dataQualityIncrease: number;
}

export interface SystemChange {
    type: 'algorithm_update' | 'data_addition' | 'model_retrain' | 'weight_adjustment' | 'bias_correction';
    description: string;
    magnitude: number; // 0-1 scale
    confidence: number; // 0-1 scale
    timestamp: string;
}

export interface MetricImprovement {
    metric: string;
    before: number;
    after: number;
    improvement: number;
    unit: string;
}

export interface FeedbackLoopVisualizationData {
    totalLoops: number;
    activeLoops: number;
    completedLoops: number;
    averageCompletionTime: string;
    userParticipation: number;
    systemImprovements: number;
    stageThroughput: { stage: string; averageTime: string; successRate: number }[];
    impactMetrics: {
        accuracyImprovement: number;
        biasReduction: number;
        userSatisfaction: number;
        dataQuality: number;
    };
}

class FeedbackLoopService {
    private static feedbackLoops: FeedbackLoopFlow[] = [];
    private static stageDefinitions: FeedbackLoopStage[] = [
        {
            id: 'collection',
            name: 'Feedback Collection',
            description: 'User feedback is collected and validated',
            icon: '📝',
            status: 'completed',
            progress: 1.0,
            timeEstimate: '< 1 minute',
            outputs: ['Validated feedback data', 'User sentiment analysis']
        },
        {
            id: 'analysis',
            name: 'Feedback Analysis',
            description: 'AI analyzes feedback patterns and identifies improvement opportunities',
            icon: '🔍',
            status: 'active',
            progress: 0.7,
            timeEstimate: '2-5 minutes',
            dependencies: ['collection'],
            outputs: ['Pattern insights', 'Priority scores', 'Change recommendations']
        },
        {
            id: 'validation',
            name: 'Expert Validation',
            description: 'Human experts review and validate proposed changes',
            icon: '👥',
            status: 'pending',
            progress: 0.0,
            timeEstimate: '1-2 hours',
            dependencies: ['analysis'],
            outputs: ['Validated changes', 'Risk assessments', 'Implementation plans']
        },
        {
            id: 'implementation',
            name: 'System Update',
            description: 'Approved changes are implemented in the system',
            icon: '⚙️',
            status: 'pending',
            progress: 0.0,
            timeEstimate: '10-30 minutes',
            dependencies: ['validation'],
            outputs: ['Updated algorithms', 'New model weights', 'Enhanced data']
        },
        {
            id: 'testing',
            name: 'Quality Testing',
            description: 'Changes are tested to ensure they improve system performance',
            icon: '🧪',
            status: 'pending',
            progress: 0.0,
            timeEstimate: '30-60 minutes',
            dependencies: ['implementation'],
            outputs: ['Performance metrics', 'Quality scores', 'Regression tests']
        },
        {
            id: 'deployment',
            name: 'Live Deployment',
            description: 'Validated improvements are deployed to the live system',
            icon: '🚀',
            status: 'pending',
            progress: 0.0,
            timeEstimate: '5-15 minutes',
            dependencies: ['testing'],
            outputs: ['Live system updates', 'User notifications', 'Monitoring dashboards']
        },
        {
            id: 'monitoring',
            name: 'Impact Monitoring',
            description: 'Monitor the impact of changes on system performance and user experience',
            icon: '📊',
            status: 'pending',
            progress: 0.0,
            timeEstimate: '24-48 hours',
            dependencies: ['deployment'],
            outputs: ['Impact reports', 'User satisfaction metrics', 'Performance analytics']
        }
    ];

    public static createFeedbackLoop(feedbackId: string, userId: string): FeedbackLoopFlow {
        const loop: FeedbackLoopFlow = {
            id: `loop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId,
            feedbackId,
            startTime: new Date().toISOString(),
            currentStage: 'collection',
            stages: this.stageDefinitions.map(stage => ({ ...stage })),
            overallProgress: 0.14, // 1/7 stages completed
            estimatedCompletion: this.calculateEstimatedCompletion(),
            impact: {
                systemChanges: [],
                metricsImprovement: [],
                affectedUsers: 0,
                confidenceIncrease: 0,
                dataQualityIncrease: 0
            }
        };

        // Start the first stage as completed
        loop.stages[0].status = 'completed';
        loop.stages[0].progress = 1.0;
        
        // Set second stage as active
        if (loop.stages[1]) {
            loop.stages[1].status = 'active';
            loop.stages[1].progress = 0.3; // Some initial progress
        }

        this.feedbackLoops.push(loop);
        return loop;
    }

    private static calculateEstimatedCompletion(): string {
        // Estimate based on average completion times
        const now = new Date();
        const estimatedHours = 2 + Math.random() * 3; // 2-5 hours
        const completionTime = new Date(now.getTime() + estimatedHours * 60 * 60 * 1000);
        return completionTime.toISOString();
    }

    public static advanceStage(loopId: string, stageId: string, progress?: number): void {
        const loop = this.feedbackLoops.find(l => l.id === loopId);
        if (!loop) return;

        const stageIndex = loop.stages.findIndex(s => s.id === stageId);
        if (stageIndex === -1) return;

        const stage = loop.stages[stageIndex];
        
        if (progress !== undefined) {
            stage.progress = Math.min(progress, 1.0);
        }

        // Complete stage if progress is 1.0
        if (stage.progress >= 1.0) {
            stage.status = 'completed';
            
            // Start next stage
            const nextStage = loop.stages[stageIndex + 1];
            if (nextStage) {
                nextStage.status = 'active';
                nextStage.progress = 0.1; // Small initial progress
                loop.currentStage = nextStage.id;
            }
        }

        // Update overall progress
        const completedStages = loop.stages.filter(s => s.status === 'completed').length;
        const activeStageProgress = loop.stages.find(s => s.status === 'active')?.progress || 0;
        loop.overallProgress = (completedStages + activeStageProgress) / loop.stages.length;

        // Add system changes for certain stages
        if (stage.status === 'completed') {
            this.generateSystemChanges(loop, stage);
        }
    }

    private static generateSystemChanges(loop: FeedbackLoopFlow, stage: FeedbackLoopStage): void {
        const changes: SystemChange[] = [];

        switch (stage.id) {
            case 'analysis':
                changes.push({
                    type: 'algorithm_update',
                    description: 'Updated similarity weights based on feedback patterns',
                    magnitude: 0.3,
                    confidence: 0.8,
                    timestamp: new Date().toISOString()
                });
                break;
            case 'implementation':
                changes.push({
                    type: 'model_retrain',
                    description: 'Retrained PRISM scoring model with new feedback data',
                    magnitude: 0.6,
                    confidence: 0.9,
                    timestamp: new Date().toISOString()
                });
                break;
            case 'deployment':
                changes.push({
                    type: 'bias_correction',
                    description: 'Applied bias correction to reduce technology domain preference',
                    magnitude: 0.4,
                    confidence: 0.7,
                    timestamp: new Date().toISOString()
                });
                break;
        }

        loop.impact.systemChanges.push(...changes);
    }

    public static getFeedbackLoop(loopId: string): FeedbackLoopFlow | null {
        return this.feedbackLoops.find(l => l.id === loopId) || null;
    }

    public static getUserFeedbackLoops(userId: string): FeedbackLoopFlow[] {
        return this.feedbackLoops.filter(l => l.userId === userId);
    }

    public static getActiveFeedbackLoops(): FeedbackLoopFlow[] {
        return this.feedbackLoops.filter(l => 
            l.overallProgress < 1.0 && 
            !l.actualCompletion
        );
    }

    public static getVisualizationData(): FeedbackLoopVisualizationData {
        const totalLoops = this.feedbackLoops.length;
        const activeLoops = this.getActiveFeedbackLoops().length;
        const completedLoops = this.feedbackLoops.filter(l => l.overallProgress >= 1.0).length;

        // Calculate average completion time
        const completedLoopsWithTime = this.feedbackLoops.filter(l => l.actualCompletion);
        const avgCompletionMs = completedLoopsWithTime.length > 0 
            ? completedLoopsWithTime.reduce((sum, loop) => {
                const start = new Date(loop.startTime).getTime();
                const end = new Date(loop.actualCompletion!).getTime();
                return sum + (end - start);
            }, 0) / completedLoopsWithTime.length
            : 4 * 60 * 60 * 1000; // Default 4 hours

        const avgCompletionHours = Math.round(avgCompletionMs / (60 * 60 * 1000) * 10) / 10;

        // Calculate stage throughput
        const stageThroughput = this.stageDefinitions.map(stageDef => {
            const stageCompletions = this.feedbackLoops.flatMap(loop => 
                loop.stages.filter(s => s.id === stageDef.id && s.status === 'completed')
            );
            
            return {
                stage: stageDef.name,
                averageTime: stageDef.timeEstimate || 'Unknown',
                successRate: stageCompletions.length / Math.max(totalLoops, 1)
            };
        });

        return {
            totalLoops,
            activeLoops,
            completedLoops,
            averageCompletionTime: `${avgCompletionHours}h`,
            userParticipation: Math.min(totalLoops / 10, 1), // Normalize to user base
            systemImprovements: this.feedbackLoops.reduce((sum, loop) => 
                sum + loop.impact.systemChanges.length, 0),
            stageThroughput,
            impactMetrics: {
                accuracyImprovement: 0.15, // 15% improvement
                biasReduction: 0.23, // 23% bias reduction
                userSatisfaction: 0.18, // 18% satisfaction increase
                dataQuality: 0.12 // 12% data quality improvement
            }
        };
    }

    public static simulateProgress(): void {
        // Simulate progress for active loops
        const activeLoops = this.getActiveFeedbackLoops();
        
        activeLoops.forEach(loop => {
            const activeStage = loop.stages.find(s => s.status === 'active');
            if (activeStage) {
                const currentProgress = activeStage.progress;
                const increment = 0.1 + Math.random() * 0.2; // 10-30% progress
                const newProgress = Math.min(currentProgress + increment, 1.0);
                
                this.advanceStage(loop.id, activeStage.id, newProgress);
            }
        });
    }

    public static generateMockData(): void {
        // Create some sample feedback loops for demonstration
        const mockFeedback = [
            { id: 'fb1', userId: 'user1' },
            { id: 'fb2', userId: 'user1' },
            { id: 'fb3', userId: 'user2' },
        ];

        mockFeedback.forEach(feedback => {
            const loop = this.createFeedbackLoop(feedback.id, feedback.userId);
            
            // Simulate some progress
            this.advanceStage(loop.id, 'collection', 1.0);
            if (Math.random() > 0.3) {
                this.advanceStage(loop.id, 'analysis', 0.8 + Math.random() * 0.2);
            }
            if (Math.random() > 0.6) {
                this.advanceStage(loop.id, 'analysis', 1.0);
                this.advanceStage(loop.id, 'validation', 0.2 + Math.random() * 0.3);
            }
        });
    }

    public static getStageDescription(stageId: string): FeedbackLoopStage | null {
        return this.stageDefinitions.find(s => s.id === stageId) || null;
    }

    public static getSystemImpactSummary(userId?: string): {
        totalImpact: number;
        recentChanges: SystemChange[];
        userContribution: number;
    } {
        const relevantLoops = userId 
            ? this.feedbackLoops.filter(l => l.userId === userId)
            : this.feedbackLoops;

        const allChanges = relevantLoops.flatMap(loop => loop.impact.systemChanges);
        const recentChanges = allChanges
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 5);

        const totalImpact = allChanges.reduce((sum, change) => sum + change.magnitude, 0);
        const userContribution = userId 
            ? totalImpact / Math.max(this.feedbackLoops.length, 1)
            : totalImpact;

        return {
            totalImpact,
            recentChanges,
            userContribution
        };
    }
}

export { FeedbackLoopService }; 