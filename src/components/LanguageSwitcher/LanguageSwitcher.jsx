import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Globe } from 'lucide-react';
import './LanguageSwitcher.css';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'uz', label: "O'zbek" },
  { code: 'ru', label: 'Русский' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = languages.find((l) => l.code === i18n.language) || languages[0];

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="lang-switcher" ref={ref}>
      <button className="lang-btn" onClick={() => setOpen((o) => !o)}>
        <Globe size={15} strokeWidth={2} />
        <span className="lang-label">{current.label}</span>
        <ChevronDown size={14} className={`lang-chevron ${open ? 'open' : ''}`} />
      </button>
      {open && (
        <ul className="lang-dropdown">
          {languages.map((lang) => (
            <li
              key={lang.code}
              className={`lang-option ${lang.code === current.code ? 'active' : ''}`}
              onClick={() => {
                i18n.changeLanguage(lang.code);
                setOpen(false);
              }}
            >
              <span>{lang.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
