import React from 'react';
import { default as Joyride } from 'react-joyride';
import type { CallBackProps, Step, STATUS } from 'react-joyride';
import { useOnboardingStore } from '../../store/onboardingStore';
import type { TourType } from '../../store/onboardingStore';

interface OnboardingTourProps {
  tourType: TourType;
  steps: Step[];
  run?: boolean;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ tourType, steps, run = true }) => {
  const { showTour, currentTour, completeTour, skipTour } = useOnboardingStore();

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      if (status === STATUS.FINISHED) {
        completeTour(tourType);
      } else {
        skipTour();
      }
    }
  };

  const shouldRun = showTour && currentTour === tourType && run;

  return (
    <Joyride
      steps={steps}
      run={shouldRun}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#8b5cf6',
          textColor: '#1f2937',
          backgroundColor: '#ffffff',
          overlayColor: 'rgba(0, 0, 0, 0.7)',
          arrowColor: '#ffffff',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: '12px',
          padding: '20px',
        },
        buttonNext: {
          backgroundColor: '#8b5cf6',
          borderRadius: '8px',
          padding: '10px 20px',
          fontSize: '14px',
          fontWeight: '600',
        },
        buttonBack: {
          color: '#6b7280',
          marginRight: '10px',
        },
        buttonSkip: {
          color: '#9ca3af',
        },
      }}
      locale={{
        back: 'Назад',
        close: 'Закрыть',
        last: 'Завершить',
        next: 'Далее',
        skip: 'Пропустить',
      }}
    />
  );
};
