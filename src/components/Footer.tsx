import React from 'react';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  return (
    <footer id="footer">
      <ul className="icons">
        <li>
          <a
            href="mailto:info.sustainable.politics@gmail.com"
            className="icon solid fa-envelope"
            title="info.sustainable.politics@gmail.com"
          >
            <span className="label">Email</span>
          </a>
        </li>
      </ul>
      <ul className="copyright">
        <li>&copy; Център за Устойчиви Политики</li>
        <li>{year}</li>
        <li>
          Created by{' '}
          <a
            href="https://www.linkedin.com/in/martin-yovchev-43643928a/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Martin Yovchev
          </a>
        </li>
      </ul>
    </footer>
  );
};

export default Footer;