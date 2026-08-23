// Footer Component
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p className="footer-text">
          © {currentYear} ResQ. All rights reserved.
        </p>
        <p className="footer-team">
          Made with ❤️ by <span className="team-name">Code Titans Team</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;

