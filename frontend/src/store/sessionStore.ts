import create from 'zustand';
import { persist } from 'zustand/middleware';

export interface Session {
    id: string;
    name: string;
    timestamp: string;
    lastPath: string;
    data?: {
        productId?: string;
        incidentId?: string;
        filters?: Record<string, any>;
        sortSettings?: Record<string, any>;
    };
}

interface SessionState {
    sessions: Session[];
    activeSessionId: string | null;
    addSession: (session: Omit<Session, 'id' | 'timestamp'>) => void;
    updateSession: (id: string, updates: Partial<Session>) => void;
    deleteSession: (id: string) => void;
    setActiveSession: (id: string) => void;
    updateSessionData: (id: string, data: Session['data']) => void;
    initializeStore: () => void;
}

const createDefaultSession = (): Session => ({
    id: Date.now().toString(),
    name: 'Default Session',
    timestamp: new Date().toLocaleString(),
    lastPath: '/',
});

export const useSessionStore = create<SessionState>()(
    persist(
        (set, get) => ({
            sessions: [],
            activeSessionId: null,
            initializeStore: () => {
                const state = get();
                if (state.sessions.length === 0) {
                    const defaultSession = createDefaultSession();
                    set({
                        sessions: [defaultSession],
                        activeSessionId: defaultSession.id,
                    });
                } else if (!state.activeSessionId || !state.sessions.find(s => s.id === state.activeSessionId)) {
                    set({ activeSessionId: state.sessions[0].id });
                }
            },
            addSession: (sessionData) => set((state) => {
                const newSession = {
                    ...sessionData,
                    id: Date.now().toString(),
                    timestamp: new Date().toLocaleString(),
                };
                return {
                    sessions: [...state.sessions, newSession],
                    activeSessionId: newSession.id,
                };
            }),
            updateSession: (id, updates) => set((state) => ({
                sessions: state.sessions.map((session) =>
                    session.id === id ? { ...session, ...updates } : session
                ),
            })),
            deleteSession: (id) => set((state) => {
                // Prevent deleting the last session
                if (state.sessions.length <= 1) {
                    return state;
                }
                
                const newSessions = state.sessions.filter((s) => s.id !== id);
                return {
                    sessions: newSessions,
                    activeSessionId:
                        state.activeSessionId === id
                            ? newSessions[0]?.id || null
                            : state.activeSessionId,
                };
            }),
            setActiveSession: (id) => set({ activeSessionId: id }),
            updateSessionData: (id, data) => set((state) => ({
                sessions: state.sessions.map((session) =>
                    session.id === id
                        ? { ...session, data: { ...session.data, ...data } }
                        : session
                ),
            })),
        }),
        {
            name: 'agentx-sessions',
            version: 1,
            onRehydrateStorage: () => (state) => {
                // Initialize store after rehydration
                if (state) {
                    state.initializeStore();
                }
            },
        }
    )
); 