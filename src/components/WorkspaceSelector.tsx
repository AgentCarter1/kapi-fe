import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getWorkspaces } from '../api/endpoints/workspaces';
import type { Workspace } from '../api/endpoints/workspaces';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCurrentWorkspace } from '../store/slices/authSlice';

export const WorkspaceSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const currentWorkspace = useAppSelector((state) => state.auth.currentWorkspace);

  const { data: workspaces, isLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: getWorkspaces,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Set default workspace on initial load
  useEffect(() => {
    if (workspaces && workspaces.length > 0 && !currentWorkspace) {
      const defaultWorkspace = workspaces.find((w) => w.isDefault) || workspaces[0];
      dispatch(setCurrentWorkspace(defaultWorkspace));
    }
  }, [workspaces, currentWorkspace, dispatch]);

  const handleWorkspaceSelect = (workspace: Workspace) => {
    dispatch(setCurrentWorkspace(workspace));
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600">
        <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        <span>Loading...</span>
      </div>
    );
  }

  if (!workspaces || workspaces.length === 0) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <svg
          className="w-5 h-5 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        <span className="max-w-[150px] truncate">
          {currentWorkspace?.workspaceName || 'Select Workspace'}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase border-b border-gray-200">
            Select Workspace
          </div>
          <div className="max-h-60 overflow-y-auto">
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                onClick={() => handleWorkspaceSelect(workspace)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                  currentWorkspace?.workspaceId === workspace.workspaceId
                    ? 'bg-blue-50 border-l-4 border-blue-500'
                    : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {workspace.workspaceName}
                      </p>
                      {workspace.isDefault && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{workspace.accountType}</p>
                  </div>
                  {currentWorkspace?.workspaceId === workspace.workspaceId && (
                    <svg
                      className="w-5 h-5 text-blue-500 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

