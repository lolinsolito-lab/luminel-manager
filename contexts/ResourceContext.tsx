
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Resource } from '../types';
import resourceService from '../services/resourceService';
import { useUser } from './UserContext';

interface ResourceContextType {
    resources: Resource[];
    isLoading: boolean;
    addResource: (resource: Omit<Resource, 'id'>) => Promise<void>;
    updateResource: (id: string, updates: Partial<Resource>) => Promise<void>;
    deleteResource: (id: string) => Promise<void>;
    refreshResources: () => Promise<void>;
}

const ResourceContext = createContext<ResourceContextType | undefined>(undefined);

export const ResourceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { isAuthenticated } = useUser();

    const fetchResources = async () => {
        try {
            setIsLoading(true);
            const data = await resourceService.getResources();
            setResources(data);
        } catch (error) {
            console.error('Error fetching resources:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchResources();
        } else {
            setIsLoading(false);
        }
    }, [isAuthenticated]);


    const addResource = async (resourceData: Omit<Resource, 'id'>) => {
        try {
            const newResource = await resourceService.createResource(resourceData);
            setResources(prev => [newResource, ...prev]);
        } catch (error) {
            console.error('Error adding resource:', error);
            throw error;
        }
    };

    const updateResource = async (id: string, updates: Partial<Resource>) => {
        try {
            const updated = await resourceService.updateResource(id, updates);
            setResources(prev => prev.map(r => r.id === id ? updated : r));
        } catch (error) {
            console.error('Error updating resource:', error);
            throw error;
        }
    };

    const deleteResource = async (id: string) => {
        try {
            await resourceService.deleteResource(id);
            setResources(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            console.error('Error deleting resource:', error);
            throw error;
        }
    };

    return (
        <ResourceContext.Provider value={{
            resources,
            isLoading,
            addResource,
            updateResource,
            deleteResource,
            refreshResources: fetchResources
        }}>
            {children}
        </ResourceContext.Provider>
    );
};

export const useResources = () => {
    const context = useContext(ResourceContext);
    if (!context) {
        throw new Error('useResources must be used within a ResourceProvider');
    }
    return context;
};
