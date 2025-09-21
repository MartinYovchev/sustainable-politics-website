import React from 'react';
import useTranslation from '../hooks/useTranslationHook';

const Activities: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section id="activities" className="wrapper alt style2">
      <section className="spotlight">
        <div className="image">
          <img src="images/pic01.jpg" alt="" />
        </div>
        <div className="content">
          <h2>{t('activities.goals')}</h2>
          <p>{t('activities.goals_description')}</p>
        </div>
      </section>
      <section className="spotlight">
        <div className="image">
          <img src="images/pic02.jpg" alt="" />
        </div>
        <div className="content">
          <h2>{t('activities.our_activities')}</h2>
          <p>{t('activities.our_activities_description')}</p>
        </div>
      </section>
      <section className="spotlight">
        <div className="image">
          <img src="images/pic03.jpg" alt="" />
        </div>
        <div className="content">
          <h2>{t('activities.team')}</h2>
          <p>{t('activities.team_description')}</p>
          <ul className="actions fit stacked">
            <li>{t('activities.team_experience1')}</li>
            <li>{t('activities.team_experience2')}</li>
            <li>{t('activities.team_experience3')}</li>
          </ul>
        </div>
      </section>
    </section>
  );
};

export default Activities;