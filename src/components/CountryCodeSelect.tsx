import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { CountryCode } from '../api/profile';
import './CountryCodeSelect.css';

interface Props {
  countries: CountryCode[];
  value: string;
  onChange: (dialCode: string) => void;
  disabled?: boolean;
  id?: string;
  placeholder?: string;
  variant?: 'dark' | 'profile';
  'aria-label'?: string;
}

const CountryCodeSelect: React.FC<Props> = ({
  countries,
  value,
  onChange,
  disabled,
  id,
  placeholder = 'Code',
  variant = 'dark',
  'aria-label': ariaLabel,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const [lastIso, setLastIso] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedMatch = useMemo(() => {
    if (!value) return null;
    return (
      countries.find((c) => c.iso === lastIso && c.dial_code === value) ??
      countries.find((c) => c.dial_code === value) ??
      null
    );
  }, [value, lastIso, countries]);

  const displayLabel = selectedMatch
    ? `${selectedMatch.iso} ${selectedMatch.dial_code}`
    : value || '';

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    const qDigits = q.replace(/\+/g, '');
    return countries.filter((c) => {
      const name = c.name.toLowerCase();
      const iso = c.iso.toLowerCase();
      const dial = c.dial_code.toLowerCase();
      const dialDigits = c.dial_code.replace(/\+/g, '');
      return (
        name.includes(q) ||
        iso.includes(q) ||
        dial.includes(q) ||
        (qDigits.length > 0 && dialDigits.includes(qDigits))
      );
    });
  }, [query, countries]);

  const effectiveHighlight = filtered.length
    ? Math.min(highlight, filtered.length - 1)
    : 0;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.children[effectiveHighlight] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [effectiveHighlight, open]);

  const select = (c: CountryCode) => {
    setLastIso(c.iso);
    onChange(c.dial_code);
    setOpen(false);
    setQuery('');
    setHighlight(0);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        setHighlight(0);
        return;
      }
      setHighlight((h) => Math.min(h + 1, Math.max(filtered.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        setHighlight(0);
        return;
      }
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      if (open) {
        e.preventDefault();
        const pick = filtered[effectiveHighlight];
        if (pick) select(pick);
      }
    } else if (e.key === 'Escape') {
      if (open) {
        e.preventDefault();
        setOpen(false);
        setQuery('');
        inputRef.current?.blur();
      }
    } else if (e.key === 'Tab') {
      setOpen(false);
      setQuery('');
    } else if (e.key === 'Backspace' && !query && value) {
      onChange('');
      setLastIso('');
    }
  };

  const onFocus = () => {
    if (disabled) return;
    setQuery('');
    setHighlight(0);
    setOpen(true);
  };

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setHighlight(0);
    setOpen(true);
  };

  const clear = () => {
    onChange('');
    setLastIso('');
    setQuery('');
    setHighlight(0);
    inputRef.current?.focus();
  };

  const inputValue = open ? query : displayLabel;
  const placeholderText = value ? displayLabel : placeholder;

  return (
    <div
      className={`cc-select cc-select-${variant} ${disabled ? 'cc-select-disabled' : ''}`}
      ref={wrapperRef}
    >
      <input
        ref={inputRef}
        id={id}
        type="text"
        className="cc-select-input"
        value={inputValue}
        placeholder={placeholderText}
        onChange={onInput}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        disabled={disabled}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls={id ? `${id}-list` : undefined}
        aria-label={ariaLabel}
        autoComplete="off"
        spellCheck={false}
      />
      {value && !disabled && (
        <button
          type="button"
          className="cc-select-clear"
          onMouseDown={(e) => {
            e.preventDefault();
            clear();
          }}
          tabIndex={-1}
          aria-label="Clear country code"
        >
          ×
        </button>
      )}
      <span className="cc-select-caret" aria-hidden="true">
        ▾
      </span>
      {open && (
        <ul
          ref={listRef}
          id={id ? `${id}-list` : undefined}
          className="cc-select-list"
          role="listbox"
        >
          {filtered.length === 0 ? (
            <li className="cc-select-empty">No matches</li>
          ) : (
            filtered.map((c, i) => (
              <li
                key={`${c.iso}-${c.dial_code}`}
                role="option"
                aria-selected={i === effectiveHighlight}
                className={[
                  'cc-select-option',
                  i === effectiveHighlight ? 'cc-highlight' : '',
                  selectedMatch &&
                  selectedMatch.iso === c.iso &&
                  selectedMatch.dial_code === c.dial_code
                    ? 'cc-selected'
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onMouseDown={(e) => {
                  e.preventDefault();
                  select(c);
                }}
                onMouseEnter={() => setHighlight(i)}
              >
                <span className="cc-iso">{c.iso}</span>
                <span className="cc-dial">{c.dial_code}</span>
                <span className="cc-name">{c.name}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default CountryCodeSelect;
