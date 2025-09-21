import React from 'react';
import Banner from '../components/Banner';
import About from '../components/About';
import Activities from '../components/Activities';
import Goals from '../components/Goals';
import Contact from '../components/Contact';

const Home: React.FC = () => {
  return (
    <div className="home-page">
      <Banner />
      <About />
      <Activities />
      <Goals />
      <Contact />
    </div>
  );
};

export default Home;