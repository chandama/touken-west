import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-links">
          <a href="/privacy">Privacy Policy</a>
          <span className="footer-divider">|</span>
          <a href="/data-deletion">Data Deletion</a>
          <span className="footer-divider">|</span>
          <a href="/acknowledgements">Acknowledgements</a>
        </div>
        <div className="footer-copyright">
          &copy; {currentYear} Touken West. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
