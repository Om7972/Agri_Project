import { create } from 'zustand';

export type LocationType = 'India' | 'Dubai';
export type LanguageType = 'en' | 'hi' | 'mr' | 'ar';

interface MarketState {
  location: LocationType;
  currency: 'INR' | 'AED';
  currencySymbol: '₹' | 'AED ';
  language: LanguageType;
  isFetching: boolean;
  setLocation: (location: LocationType) => void;
  setLanguage: (language: LanguageType) => void;
}

export const useMarketStore = create<MarketState>((set) => ({
  location: 'India',
  currency: 'INR',
  currencySymbol: '₹',
  language: 'en',
  isFetching: false,
  setLocation: (location) => {
    if (location === 'India') {
      set({
        location: 'India',
        currency: 'INR',
        currencySymbol: '₹',
        isFetching: false,
      });
    } else {
      set({ isFetching: true });
      setTimeout(() => {
        set({
          location: 'Dubai',
          currency: 'AED',
          currencySymbol: 'AED ',
          isFetching: false,
        });
      }, 1000);
    }
  },
  setLanguage: (language) => set({ language }),
}));
