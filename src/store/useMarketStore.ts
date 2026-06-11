import { create } from 'zustand';

export type LocationType = 'India' | 'Dubai';

interface MarketState {
  location: LocationType;
  currency: 'INR' | 'AED';
  currencySymbol: '₹' | 'AED ';
  isFetching: boolean;
  setLocation: (location: LocationType) => void;
}

export const useMarketStore = create<MarketState>((set) => ({
  location: 'India',
  currency: 'INR',
  currencySymbol: '₹',
  isFetching: false,
  setLocation: (location) => {
    if (location === 'India') {
      // India opens directly / immediately
      set({
        location: 'India',
        currency: 'INR',
        currencySymbol: '₹',
        isFetching: false,
      });
    } else {
      // Dubai triggers a loading/fetching state for prices
      set({ isFetching: true });
      setTimeout(() => {
        set({
          location: 'Dubai',
          currency: 'AED',
          currencySymbol: 'AED ',
          isFetching: false,
        });
      }, 1000); // 1-second simulated API request
    }
  },
}));
