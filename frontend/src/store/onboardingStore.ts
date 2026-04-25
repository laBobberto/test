import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TourType = 'dashboard' | 'map' | 'social' | 'profile';

interface OnboardingState {
  completedTours: TourType[];
  currentTour: TourType | null;
  showTour: boolean;
  startTour: (tour: TourType) => void;
  completeTour: (tour: TourType) => void;
  skipTour: () => void;
  resetTours: () => void;
  isTourCompleted: (tour: TourType) => boolean;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      completedTours: [],
      currentTour: null,
      showTour: false,
      startTour: (tour) => set({ currentTour: tour, showTour: true }),
      completeTour: (tour) =>
        set((state) => ({
          completedTours: [...state.completedTours, tour],
          currentTour: null,
          showTour: false,
        })),
      skipTour: () => set({ currentTour: null, showTour: false }),
      resetTours: () => set({ completedTours: [], currentTour: null, showTour: false }),
      isTourCompleted: (tour) => get().completedTours.includes(tour),
    }),
    {
      name: 'onboarding-storage',
    }
  )
);
