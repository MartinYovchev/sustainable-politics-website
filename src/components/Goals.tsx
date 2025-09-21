import React from 'react';
import useTranslation from '../hooks/useTranslationHook';
import Carousel from './Carousel';

const Goals: React.FC = () => {
  const { t } = useTranslation();

  // Group goals into 3 slides to match the working version exactly
  const goalGroups = [
    [
      { icon: 'fas fa-paper-plane', title: t('goals.values.title'), description: t('goals.values.description') },
      { icon: 'fas fa-heart', title: t('goals.cooperation.title'), description: t('goals.cooperation.description') },
      { icon: 'fas fa-laptop', title: t('goals.innovation.title'), description: t('goals.innovation.description') },
    ],
    [
      { icon: 'fas fa-flag', title: t('goals.education.title'), description: t('goals.education.description') },
      { icon: 'fas fa-lightbulb', title: t('goals.entrepreneurship.title'), description: t('goals.entrepreneurship.description') },
      { icon: 'fas fa-leaf', title: t('goals.sustainability.title'), description: t('goals.sustainability.description') },
    ],
    [
      { icon: 'fas fa-tree', title: t('goals.environment.title'), description: t('goals.environment.description') },
      { icon: 'fas fa-globe-europe', title: t('goals.transborder.title'), description: t('goals.transborder.description') },
    ]
  ];

  // Create slides with the exact structure from the working version
  const slides = goalGroups.map((goalGroup, groupIndex) => (
    <div key={groupIndex} className="goals-group">
      {goalGroup.map((goal, index) => (
        <ul key={index}>
          <li className="icon">
            <div className="icon-container">
              <i className={goal.icon}></i>
            </div>
            <h3>{goal.title}</h3>
            <p>{goal.description}</p>
          </li>
        </ul>
      ))}
    </div>
  ));

  return (
    <section id="goals" className="wrapper style3 special goals-carousel">
      <div className="inner">
        <header className="major">
          <h2>{t('goals.title')}</h2>
          <p>{t('goals.subtitle')}</p>
        </header>

        <Carousel autoSlideDelay={7000}>
          {slides}
        </Carousel>
      </div>
    </section>
  );
};

export default Goals;