import React from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

interface TutorialProps {
  run: boolean;
  setRun: (run: boolean) => void;
}

export function Tutorial({ run, setRun }: TutorialProps) {
  const steps: Step[] = [
    {
      target: 'body',
      placement: 'center',
      title: 'Bienvenue sur Iqra Quest !',
      content: 'Découvrez comment utiliser notre plateforme d\'apprentissage islamique en quelques étapes simples.',
      disableBeacon: true,
    },
    {
      target: 'header',
      title: 'Navigation Principale',
      content: 'Accédez facilement aux différentes sciences islamiques (Fiqh, Hadiths, etc.) depuis ce menu.',
      disableBeacon: true,
    },
    {
      target: '.theme-toggle-btn',
      title: 'Mode Clair / Sombre',
      content: 'Adaptez l\'affichage à votre préférence pour un confort de lecture optimal, de jour comme de nuit.',
      disableBeacon: true,
    },
    {
      target: '#learning-categories',
      title: 'Catégories d\'apprentissage',
      content: 'Sélectionnez un domaine pour commencer vos leçons vidéo et lire les supports de cours.',
      disableBeacon: true,
    },
    {
      target: '#chatbot-toggle',
      title: 'Guide IA Iqra',
      content: 'Une question ? Notre assistant virtuel est disponible 24h/24 pour vous aider dans vos recherches.',
      disableBeacon: true,
    }
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    
    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem('tutorialCompleted', 'true');
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#ca8a04',
          textColor: '#0f172a',
          backgroundColor: '#ffffff',
          arrowColor: '#ffffff',
          overlayColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 10000,
        },
        tooltipContainer: {
          textAlign: 'left'
        },
        buttonNext: {
          backgroundColor: '#ca8a04',
          borderRadius: '8px',
          padding: '8px 16px',
        },
        buttonBack: {
          marginRight: 10,
          color: '#64748b'
        },
        buttonSkip: {
          color: '#64748b'
        }
      }}
      locale={{
        back: 'Précédent',
        close: 'Fermer',
        last: 'Terminer',
        next: 'Suivant',
        skip: 'Passer'
      }}
    />
  );
}
