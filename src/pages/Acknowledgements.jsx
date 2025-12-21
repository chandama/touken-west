import React from 'react';
import Footer from '../components/Footer';
import DarkModeToggle from '../components/DarkModeToggle';
import '../styles/StaticPage.css';

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
          <h2>Organizations</h2>
          <ul>
            <li>
              <a href="https://www.touken.or.jp/" target="_blank" rel="noopener noreferrer">
                NBTHK (Nihon Bijutsu Token Hozon Kyokai)
              </a>
            </li>
            <li>
              <a href="https://nbthk-ab2.org/" target="_blank" rel="noopener noreferrer">
                NBTHK-AB (American Branch)
              </a>
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
