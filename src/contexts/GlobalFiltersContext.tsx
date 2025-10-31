/**
 * Context global para filtros compartidos entre vistas
 * Evita duplicación de estado en Dashboard, Employees, Compensation
 */

import React, { createContext, useContext, useState, PropsWithChildren } from "react";

interface GlobalFiltersContextType {
  year: number;
  companyId: string;
  searchTerm: string;
  setYear: (year: number) => void;
  setCompanyId: (id: string) => void;
  setSearchTerm: (term: string) => void;
  resetFilters: () => void;
}

const GlobalFiltersContext = createContext<GlobalFiltersContextType | undefined>(
  undefined
);

export const GlobalFiltersProvider = ({ children }: PropsWithChildren) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [companyId, setCompanyId] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const resetFilters = () => {
    setYear(new Date().getFullYear());
    setCompanyId("all");
    setSearchTerm("");
  };

  return (
    <GlobalFiltersContext.Provider
      value={{
        year,
        companyId,
        searchTerm,
        setYear,
        setCompanyId,
        setSearchTerm,
        resetFilters,
      }}
    >
      {children}
    </GlobalFiltersContext.Provider>
  );
};

/**
 * Hook para acceder a filtros globales
 * 
 * @throws {Error} Si se usa fuera de GlobalFiltersProvider
 * 
 * @example
 * const { year, companyId, setYear } = useGlobalFilters();
 */
export const useGlobalFilters = () => {
  const context = useContext(GlobalFiltersContext);
  if (!context) {
    throw new Error("useGlobalFilters must be used within GlobalFiltersProvider");
  }
  return context;
};
