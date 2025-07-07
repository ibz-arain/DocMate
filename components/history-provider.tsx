"use client";

import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';

export interface HistoryEntry {
  id: string;
  type: 'summary' | 'quick-format' | 'template-format' | 'chat' | 'chart-generator';
  title: string;
  content: any;
  selectedText: string;
  selectionData?: any;
  documentName?: string;
  templateName?: string;
  timestamp: number;
  pageNumber?: number;
}

const HISTORY_STORAGE_KEY = 'docmate-history';
const MAX_HISTORY_ENTRIES = 50;

interface HistoryContextType {
  history: HistoryEntry[];
  isLoading: boolean;
  addHistoryEntry: (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => string;
  removeHistoryEntry: (id: string) => void;
  clearHistory: () => void;
  getHistoryByType: (type: HistoryEntry['type']) => HistoryEntry[];
  searchHistory: (query: string) => HistoryEntry[];
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

interface HistoryProviderProps {
  children: ReactNode;
}

export function HistoryProvider({ children }: HistoryProviderProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load history from localStorage on mount
  useEffect(() => {
    const loadHistory = () => {
      try {
        const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (stored) {
          const parsedHistory = JSON.parse(stored);
          setHistory(parsedHistory);
        }
      } catch (error) {
        console.error('Failed to load history from localStorage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  // Save history to localStorage whenever it changes (except during initial load)
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
      } catch (error) {
        console.error('Failed to save history to localStorage:', error);
      }
    }
  }, [history, isLoading]);

  const addHistoryEntry = useCallback((entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };

    setHistory(prev => {
      const updated = [newEntry, ...prev];
      // Keep only the most recent entries
      const trimmed = updated.slice(0, MAX_HISTORY_ENTRIES);
      return trimmed;
    });

    return newEntry.id;
  }, []);

  const removeHistoryEntry = useCallback((id: string) => {
    setHistory(prev => {
      const filtered = prev.filter(entry => entry.id !== id);
      return filtered;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  }, []);

  const getHistoryByType = useCallback((type: HistoryEntry['type']) => {
    return history.filter(entry => entry.type === type);
  }, [history]);

  const searchHistory = useCallback((query: string) => {
    if (!query.trim()) return history;
    
    const lowercaseQuery = query.toLowerCase();
    return history.filter(entry => 
      entry.title.toLowerCase().includes(lowercaseQuery) ||
      entry.selectedText.toLowerCase().includes(lowercaseQuery) ||
      entry.documentName?.toLowerCase().includes(lowercaseQuery) ||
      entry.templateName?.toLowerCase().includes(lowercaseQuery)
    );
  }, [history]);

  const value = {
    history,
    isLoading,
    addHistoryEntry,
    removeHistoryEntry,
    clearHistory,
    getHistoryByType,
    searchHistory,
  };

  return (
    <HistoryContext.Provider value={value}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory(): HistoryContextType {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
} 