import { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, Search, Check, X } from 'lucide-react';
import './LocationPicker.css';

const regions = [
  { id: 'tashkent',      uz: 'Toshkent',        ru: 'Ташкент',        en: 'Tashkent' },
  { id: 'samarkand',     uz: 'Samarqand',        ru: 'Самарканд',      en: 'Samarkand' },
  { id: 'fergana',       uz: "Farg'ona",         ru: 'Фергана',        en: 'Fergana' },
  { id: 'andijan',       uz: 'Andijon',          ru: 'Андижан',        en: 'Andijan' },
  { id: 'namangan',      uz: 'Namangan',         ru: 'Наманган',       en: 'Namangan' },
  { id: 'bukhara',       uz: 'Buxoro',           ru: 'Бухара',         en: 'Bukhara' },
  { id: 'navoi',         uz: 'Navoiy',           ru: 'Навои',          en: 'Navoi' },
  { id: 'kashkadarya',   uz: 'Qashqadaryo',      ru: 'Кашкадарья',     en: 'Kashkadarya' },
  { id: 'surkhandarya',  uz: 'Surxondaryo',      ru: 'Сурхандарья',    en: 'Surkhandarya' },
  { id: 'khorezm',       uz: 'Xorazm',           ru: 'Хорезм',         en: 'Khorezm' },
  { id: 'syrdarya',      uz: 'Sirdaryo',         ru: 'Сырдарья',       en: 'Sirdarya' },
  { id: 'jizzakh',       uz: 'Jizzax',           ru: 'Джизак',         en: 'Jizzakh' },
  { id: 'karakalpakstan',uz: "Qoraqalpog'iston", ru: 'Каракалпакстан', en: 'Karakalpakstan' },
];

const labels = {
  uz: { location: 'Joylashuv', search: 'Viloyat qidirish...', notFound: 'Topilmadi' },
  ru: { location: 'Местоположение', search: 'Поиск региона...', notFound: 'Не найдено' },
  en: { location: 'Location', search: 'Search region...', notFound: 'Not found' },
};

export default function LocationPicker({ lang = 'uz' }) {
  const [open, setOpen]         = useState(false);
  const [selected, setSelected] = useState(regions[0]);
  const [search, setSearch]     = useState('');
  const ref                     = useRef(null);

  const lk = ['ru', 'en'].includes(lang) ? lang : 'uz';
  const lb = labels[lk];

  const filtered = regions.filter((r) =>
    r[lk].toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div className="loc-picker" ref={ref}>

      {/* Trigger */}
      <button
        className="loc-trigger"
        onClick={() => { setOpen((o) => !o); setSearch(''); }}
      >
        <span className="loc-value">
          <MapPin size={14} className="loc-pin" />
          {selected[lk]}
          <ChevronDown size={14} className={`loc-chevron ${open ? 'rotated' : ''}`} />
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="loc-dropdown">
          {/* Search */}
          <div className="loc-search-wrap">
            <Search size={14} className="loc-search-icon" />
            <input
              autoFocus
              type="text"
              placeholder={lb.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="loc-clear" onClick={() => setSearch('')}>
                <X size={13} />
              </button>
            )}
          </div>

          {/* List */}
          <ul className="loc-list">
            {filtered.length === 0 && (
              <li className="loc-empty">{lb.notFound}</li>
            )}
            {filtered.map((r) => (
              <li
                key={r.id}
                className={`loc-option ${selected.id === r.id ? 'selected' : ''}`}
                onClick={() => { setSelected(r); setOpen(false); setSearch(''); }}
              >
                <MapPin size={13} className="loc-opt-pin" />
                <span>{r[lk]}</span>
                {selected.id === r.id && <Check size={14} className="loc-check" />}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
