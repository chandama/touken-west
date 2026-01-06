import React from 'react';
import Footer from '../components/Footer';
import DarkModeToggle from '../components/DarkModeToggle';
import useDocumentMeta from '../hooks/useDocumentMeta.js';
import '../styles/StaticPage.css';

const SITE_URL = 'https://nihonto-db.com';

const Acknowledgements = () => {
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  React.useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  // Set meta tags for SEO
  useDocumentMeta({
    title: 'Acknowledgements - Nihonto DB',
    description: 'Acknowledgements for Nihonto DB. Thanks to the organizations and individuals who contributed to this Japanese sword database.',
    canonicalUrl: `${SITE_URL}/acknowledgements`,
    ogType: 'website'
  });

  return (
    <div className="static-page">
      <header className="static-header">
        <div className="header-content">
          <a href="/" className="header-logo-link">
            <img src="/shimazu-mon.svg" alt="Nihonto DB" className="header-logo" />
            <span className="header-title">Nihonto DB</span>
          </a>
          <DarkModeToggle isDarkMode={isDarkMode} onToggle={() => setIsDarkMode(!isDarkMode)} />
        </div>
      </header>

      <main className="static-content">
        <h1>Acknowledgements</h1>

        <section>
          <p>
            This project has been a passion of mine for years. The biggest barrier was always
            "Where to begin?"—a question that kept this on the backburner for almost two years
            as I experimented with ways to create a portable "Nihonto Digital Encyclopedia" for
            sword shows in the USA and Japan.
          </p>
          <p>
            That stumbling block was removed when <strong>Jussi Ekholm</strong> graciously shared
            his Koto Sword Index with the Nihonto Message Board. His index catalogues over 15,000
            koto-era swords from NBTHK sources, museums, national treasures, shrines, temples, and
            an extensive library of books—meticulously cross-referenced with signatures, dates,
            measurements, and authentication information.
          </p>
          <p>
            Jussi's index is the backbone of this website. Thank you for supporting my efforts to
            transform your years of hard work into a searchable, filterable platform that helps
            sword enthusiasts find information about their favorite smiths, schools, and swordmaking
            traditions. This would not have been possible without you.
          </p>
        </section>

        <section>
          <h2>Special Thanks</h2>
          <ul>
            <li>
              <strong>Mike Yamasaki</strong> – For taking the time to help me as a novice at my
              first San Francisco sword show and teaching me so much over the years
            </li>
            <li>
              <strong>Nihonto Message Board</strong> – Many members have been wonderful resources,
              and I've had the pleasure of meeting them at Dai Token Ichi and other shows
            </li>
            <li>
              <strong>Markus Sesko</strong> – Your translations and books are essential for any
              serious student of nihonto
            </li>
            <li>
              <a href="https://nbthk-ab2.org/" target="_blank" rel="noopener noreferrer">
                <strong>NBTHK-AB</strong>
              </a> – The American Branch membership is a wonderful community; I'm fortunate to
              see so many of your collections
            </li>
            <li>
              <a href="https://www.touken.or.jp/" target="_blank" rel="noopener noreferrer">
                <strong>NBTHK</strong>
              </a> – For all you do for the preservation of nihonto
            </li>
          </ul>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            For questions, corrections, or contributions, please contact us at:{' '}
            <a href="mailto:support@nihonto-db.com">support@nihonto-db.com</a>
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Acknowledgements;
