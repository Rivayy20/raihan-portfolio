import { useContext } from 'react';
import { PortfolioDataContext } from '../context/PortfolioDataContext';

export function usePortfolioData() {
  return useContext(PortfolioDataContext);
}
