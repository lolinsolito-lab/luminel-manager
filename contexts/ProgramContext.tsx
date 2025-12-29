
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Program, VaultCategory } from '../types';
import programService from '../services/programService';
import categoryService from '../services/categoryService';

interface ProgramContextType {
  programs: Program[];
  categories: VaultCategory[];
  isLoading: boolean;
  addProgram: (program: Omit<Program, 'id'>) => Promise<void>;
  updateProgram: (id: string, program: Partial<Program>) => Promise<void>;
  deleteProgram: (id: string) => Promise<void>;
  refreshPrograms: () => Promise<void>;

  // Category management
  addCategory: (category: Omit<VaultCategory, 'id'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<VaultCategory>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

const ProgramContext = createContext<ProgramContextType | undefined>(undefined);

export const ProgramProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [categories, setCategories] = useState<VaultCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [programsData, categoriesData] = await Promise.all([
        programService.getPrograms(),
        categoryService.getCategories()
      ]);
      setPrograms(programsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching vault data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addProgram = async (programData: Omit<Program, 'id'>) => {
    try {
      const newProgram = await programService.createProgram(programData);
      setPrograms(prev => [newProgram, ...prev]);
    } catch (error) {
      console.error('Error adding program:', error);
      throw error;
    }
  };

  const updateProgram = async (id: string, updates: Partial<Program>) => {
    try {
      const updated = await programService.updateProgram(id, updates);
      setPrograms(prev => prev.map(p => p.id === id ? updated : p));
    } catch (error) {
      console.error('Error updating program:', error);
      throw error;
    }
  };

  const deleteProgram = async (id: string) => {
    try {
      await programService.deleteProgram(id);
      setPrograms(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting program:', error);
      throw error;
    }
  };

  const addCategory = async (categoryData: Omit<VaultCategory, 'id'>) => {
    try {
      const newCategory = await categoryService.createCategory(categoryData);
      setCategories(prev => [...prev, newCategory]);
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  };

  const updateCategory = async (id: string, updates: Partial<VaultCategory>) => {
    try {
      const updated = await categoryService.updateCategory(id, updates);
      setCategories(prev => prev.map(c => c.id === id ? updated : c));
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await categoryService.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  return (
    <ProgramContext.Provider value={{
      programs,
      categories,
      isLoading,
      addProgram,
      updateProgram,
      deleteProgram,
      refreshPrograms: fetchData,
      addCategory,
      updateCategory,
      deleteCategory
    }}>
      {children}
    </ProgramContext.Provider>
  );
};

export const usePrograms = () => {
  const context = useContext(ProgramContext);
  if (!context) {
    throw new Error('usePrograms must be used within a ProgramProvider');
  }
  return context;
};
