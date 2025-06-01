import React, { useState, useRef, useEffect } from 'react';
import { Incident, Feedback } from '../types';
import { FiX, FiSend, FiUser, FiSettings, FiHelpCircle } from 'react-icons/fi';
import { PrismScoreComparison } from './PrismScoreComparison';
import { FeedbackLoopDiagram } from './FeedbackLoopDiagram';

interface ChatFeedbackModalProps {
    incident: Incident;
    onClose: () => void;
    onSubmit: (feedback: Partial<Feedback>) => Promise<void>;
    explanationMode: 'none' | 'generic' | 'prism';
}

interface ChatMessage {
    id: string;
    type: 'user' | 'system';
    content: string;
    timestamp: Date;
    prismScore?: { dimension: string; score: number };
}

const systemResponses = {
    greeting: "Hi! I can help you provide feedback on this incident. You can ask me questions or share your thoughts about:",
    greetingOptions: [
        "Why was this incident recommended?",
        "I disagree with a PRISM score",
        "Suggest a similar incident",
        "Rate the overall relevance"
    ],
    whyRecommended: "This incident was recommended because it shares similar technologies with your product and has a high contextual relevance score. The AI system identified patterns in deployment context and potential risk factors that match your use case.",
    prismScoreHelp: "I can help you adjust PRISM scores. Which dimension would you like to discuss? You can mention: Logical Coherence, Factual Accuracy, Practical Implementability, Contextual Relevance, Exploitability, or Impact Scale.",
    relevanceQuestion: "On a scale of 1-10, how relevant is this incident to your product? Consider your technology stack, deployment environment, and user base."
};

export const ChatFeedbackModal: React.FC<ChatFeedbackModalProps> = ({
    incident,
    onClose,
    onSubmit,
    explanationMode,
}) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [quickOptions, setQuickOptions] = useState<string[]>(systemResponses.greetingOptions);
    const [showQuickOptions, setShowQuickOptions] = useState(true);
    const [feedbackData, setFeedbackData] = useState<Partial<Feedback>>({
        user_comment: '',
        relevance: true,
        prism_scores: incident.prism_scores ? { ...incident.prism_scores } : undefined
    });
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
    const [originalScores, setOriginalScores] = useState(incident.prism_scores);
    const [updatedScores, setUpdatedScores] = useState(incident.prism_scores);
    const [showFeedbackLoop, setShowFeedbackLoop] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Initialize with greeting
        const initialMessage: ChatMessage = {
            id: '1',
            type: 'system',
            content: systemResponses.greeting,
            timestamp: new Date()
        };
        setMessages([initialMessage]);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const addMessage = (content: string, type: 'user' | 'system', prismScore?: { dimension: string; score: number }) => {
        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            type,
            content,
            timestamp: new Date(),
            prismScore
        };
        setMessages(prev => [...prev, newMessage]);
    };

    const simulateTyping = (callback: () => void) => {
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            callback();
        }, 1000 + Math.random() * 1000);
    };

    const handleSystemResponse = (userMessage: string) => {
        const lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.includes('why') && lowerMessage.includes('recommend')) {
            simulateTyping(() => {
                addMessage(systemResponses.whyRecommended, 'system');
            });
        } else if (lowerMessage.includes('disagree') || lowerMessage.includes('prism') || lowerMessage.includes('score')) {
            simulateTyping(() => {
                addMessage(systemResponses.prismScoreHelp, 'system');
            });
        } else if (lowerMessage.includes('relevant') || lowerMessage.includes('relevance')) {
            simulateTyping(() => {
                addMessage(systemResponses.relevanceQuestion, 'system');
            });
        } else if (lowerMessage.includes('logical coherence')) {
            const currentScore = incident.prism_scores?.logical_coherence || 0.5;
            simulateTyping(() => {
                addMessage(`The current Logical Coherence score is ${Math.round(currentScore * 100)}%. This measures whether the incident description is internally consistent. Would you like to adjust this score?`, 'system');
            });
        } else if (lowerMessage.includes('factual accuracy')) {
            const currentScore = incident.prism_scores?.factual_accuracy || 0.5;
            simulateTyping(() => {
                addMessage(`The current Factual Accuracy score is ${Math.round(currentScore * 100)}%. This assesses technical correctness. What score would you give it?`, 'system');
            });
        } else {
            // Generic response
            simulateTyping(() => {
                addMessage("I understand your feedback. Is there anything specific about the PRISM scores or incident relevance you'd like to discuss?", 'system');
            });
        }
    };

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

        // Add user message
        addMessage(inputValue, 'user');
        
        // Update feedback comment
        setFeedbackData(prev => ({
            ...prev,
            user_comment: prev.user_comment + (prev.user_comment ? '\n' : '') + inputValue
        }));

        // Generate system response
        handleSystemResponse(inputValue);
        
        setInputValue('');
    };

    const handleQuickResponse = (response: string) => {
        setInputValue(response);
    };

    const handleSubmit = async () => {
        try {
            // Simulate updating PRISM scores based on feedback
            if (incident.prism_scores && feedbackData.prism_scores) {
                const updated = { ...incident.prism_scores };
                
                // Apply some simulated changes based on feedback
                Object.keys(updated).forEach(key => {
                    const userScore = feedbackData.prism_scores?.[key as keyof typeof feedbackData.prism_scores];
                    if (userScore !== undefined) {
                        // Blend user input with original score (weighted average)
                        updated[key as keyof typeof updated] = (updated[key as keyof typeof updated] + userScore) / 2;
                    }
                });
                
                setUpdatedScores(updated);
            }
            
            setFeedbackSubmitted(true);
            
            // Show success message
            addMessage("Thank you! Your feedback has been recorded and will help improve future recommendations.", 'system');
            addMessage("You can see how your input affected the PRISM scores below.", 'system');
            
            // Don't close immediately - let user see the feedback visualization
            // await onSubmit(feedbackData);
            // onClose();
        } catch (error) {
            console.error('Error submitting feedback:', error);
            addMessage("Sorry, there was an error submitting your feedback. Please try again.", 'system');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full h-[600px] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Chat Feedback</h2>
                        <p className="text-sm text-gray-500">{incident.title}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <FiX size={24} />
                    </button>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {message.type === 'system' && (
                                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <FiSettings size={16} color="white" />
                                </div>
                            )}
                            <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                    message.type === 'user'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-100 text-gray-900'
                                }`}
                            >
                                <p className="text-sm">{message.content}</p>
                                {message.prismScore && (
                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                        <span className="text-xs font-medium">
                                            {message.prismScore.dimension}: {Math.round(message.prismScore.score * 100)}%
                                        </span>
                                    </div>
                                )}
                                <p className="text-xs mt-1 opacity-70">
                                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            {message.type === 'user' && (
                                <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                                    <FiUser size={16} color="white" />
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Quick Response Options (after greeting) */}
                    {messages.length === 1 && (
                        <div className="space-y-2">
                            {systemResponses.greetingOptions.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleQuickResponse(option)}
                                    className="block w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors"
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="flex gap-3 justify-start">
                            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <FiSettings size={16} color="white" />
                            </div>
                            <div className="bg-gray-100 px-4 py-2 rounded-lg">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Feedback Visualization - shown after submission */}
                {feedbackSubmitted && originalScores && updatedScores && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                        <div className="space-y-6">
                            {/* PRISM Score Comparison */}
                            <PrismScoreComparison
                                beforeScores={originalScores}
                                afterScores={updatedScores}
                                userFeedback={feedbackData.user_comment}
                                changedDimensions={Object.keys(originalScores).filter(key => {
                                    const before = originalScores[key as keyof typeof originalScores];
                                    const after = updatedScores[key as keyof typeof updatedScores];
                                    return Math.abs(after - before) >= 0.05;
                                })}
                            />

                            {/* Show Feedback Loop Diagram */}
                            <div className="mt-4">
                                <button
                                    onClick={() => setShowFeedbackLoop(!showFeedbackLoop)}
                                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                >
                                    <FiHelpCircle size={16} />
                                    {showFeedbackLoop ? 'Hide' : 'Learn more about'} how your feedback improves the system
                                </button>
                                
                                {showFeedbackLoop && (
                                    <div className="mt-4">
                                        <FeedbackLoopDiagram 
                                            isAnimated={true}
                                            currentStep={3} // Start from feedback step
                                            showDetails={false}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Final Actions */}
                            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={async () => {
                                        await onSubmit(feedbackData);
                                        onClose();
                                    }}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Apply Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div className="border-t border-gray-200 p-4">
                    {!feedbackSubmitted && (
                        <>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Type your feedback or ask a question..."
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputValue.trim()}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FiSend size={16} />
                                </button>
                            </div>
                            
                            {/* Submit Button */}
                            <div className="mt-3 flex justify-end">
                                <button
                                    onClick={handleSubmit}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                                >
                                    Submit Feedback
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}; 