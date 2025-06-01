import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useSessionStore, Session } from '../store/sessionStore';

export const SessionSidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { sessions, activeSessionId, addSession, updateSession, deleteSession, setActiveSession } = useSessionStore();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleNewSession = () => {
        addSession({
            name: `Session ${sessions.length + 1}`,
            lastPath: location.pathname,
        });
    };

    const handleEditSession = (session: Session) => {
        setEditingId(session.id);
        setEditName(session.name);
    };

    const handleSaveEdit = (id: string) => {
        updateSession(id, { name: editName });
        setEditingId(null);
    };

    const handleDeleteSession = (id: string) => {
        deleteSession(id);
    };

    const handleSessionClick = (session: Session) => {
        setActiveSession(session.id);
        navigate(session.lastPath);
    };

    return (
        <div className={`${isCollapsed ? 'w-16' : 'w-64'} h-screen bg-gray-50 border-r border-gray-200 flex flex-col relative transition-all duration-300 ease-in-out`}>
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-6 bg-white border border-gray-200 rounded-full p-1.5 shadow-md z-10 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
                {isCollapsed ? <FiChevronRight size={14} /> : <FiChevronLeft size={14} />}
            </button>
            
            <div className={`p-4 border-b border-gray-200 flex flex-col ${isCollapsed ? 'items-center' : ''}`}>
                {!isCollapsed && <h2 className="text-lg font-semibold text-gray-900 mb-4">Sessions</h2>}
                <button
                    onClick={handleNewSession}
                    className={`
                        ${isCollapsed ? 'w-10 h-10 p-0' : 'w-full px-4 py-2.5'} 
                        flex items-center justify-center 
                        border border-gray-300 rounded-md 
                        shadow-sm text-sm font-medium 
                        text-gray-700 bg-white 
                        hover:bg-gray-50 hover:border-gray-400 
                        transition-all duration-200
                    `}
                    title="New Session"
                >
                    <FiPlus size={isCollapsed ? 16 : 14} />
                    {!isCollapsed && <span className="ml-2">New Session</span>}
                </button>
            </div>
            
            <div className={`flex-1 overflow-y-auto ${isCollapsed ? 'px-2 py-3' : 'p-4'} space-y-2`}>
                {sessions.map(session => (
                    <div
                        key={session.id}
                        className={`
                            rounded-lg border 
                            ${activeSessionId === session.id
                                ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                                : 'border-gray-200 hover:border-gray-300'
                            } 
                            transition-all duration-200
                        `}
                        title={isCollapsed ? session.name : undefined}
                    >
                        <div
                            onClick={() => handleSessionClick(session)}
                            className={`
                                w-full text-left cursor-pointer
                                ${isCollapsed ? 'p-2' : 'p-3'}
                                ${activeSessionId === session.id ? 'text-indigo-700' : 'text-gray-700'}
                            `}
                        >
                            {editingId === session.id && !isCollapsed ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="flex-1 px-2 py-1 border border-gray-300 rounded-md text-sm"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSaveEdit(session.id);
                                        }}
                                        className="p-1 text-green-600 hover:text-green-700"
                                    >
                                        <FiCheck size={14} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingId(null);
                                        }}
                                        className="p-1 text-gray-600 hover:text-gray-700"
                                    >
                                        <FiX size={14} />
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                                        {!isCollapsed && (
                                            <span className="font-medium text-inherit line-clamp-1">{session.name}</span>
                                        )}
                                        {isCollapsed ? (
                                            <div className={`
                                                w-8 h-8 rounded-full 
                                                flex items-center justify-center 
                                                bg-white border border-gray-200
                                                ${activeSessionId === session.id ? 'border-indigo-200 text-indigo-700' : 'text-gray-700'}
                                                font-semibold text-sm
                                            `}>
                                                {session.name.charAt(0).toUpperCase()}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditSession(session);
                                                    }}
                                                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    <FiEdit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteSession(session.id);
                                                    }}
                                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                >
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {!isCollapsed && (
                                        <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                                            {session.timestamp}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}; 