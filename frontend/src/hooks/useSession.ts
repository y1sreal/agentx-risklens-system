import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSessionStore } from '../store/sessionStore';

export const useSession = () => {
    const location = useLocation();
    const { sessions, activeSessionId, updateSession, initializeStore } = useSessionStore();
    
    const activeSession = sessions.find(s => s.id === activeSessionId);

    // Initialize store if needed
    useEffect(() => {
        initializeStore();
    }, [initializeStore]);

    // Update the last path whenever location changes
    useEffect(() => {
        if (activeSessionId) {
            updateSession(activeSessionId, { lastPath: location.pathname });
        }
    }, [location.pathname, activeSessionId, updateSession]);

    return {
        activeSession,
        sessionData: activeSession?.data || {},
        updateSessionData: (data: any) => {
            if (activeSessionId) {
                updateSession(activeSessionId, {
                    data: { ...(activeSession?.data || {}), ...data }
                });
            }
        }
    };
}; 