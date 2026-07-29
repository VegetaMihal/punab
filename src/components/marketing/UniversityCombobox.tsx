"use client";

import { useEffect, useRef, useState } from "react";

const OTHER_VALUE = "__other__";

export function UniversityCombobox({
  universities,
  value,
  onChange,
}: {
  universities: { id: string; name: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [query, setQuery] = useState(value === OTHER_VALUE ? "" : value);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const filtered =
    query.trim() === ""
      ? universities
      : universities.filter((u) => u.name.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function selectUniversity(name: string) {
    setQuery(name);
    onChange(name);
    setOpen(false);
  }

  function selectOther() {
    setQuery("");
    onChange(OTHER_VALUE);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <input
        type="text"
        className="ds-input"
        placeholder="Type to search your university…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setHighlight(0);
          if (value !== e.target.value) onChange("");
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!open) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, filtered.length));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
          } else if (e.key === "Enter") {
            e.preventDefault();
            if (highlight < filtered.length) {
              selectUniversity(filtered[highlight].name);
            } else {
              selectOther();
            }
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
      />
      {open && (
        <ul className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-lg">
          {filtered.length === 0 && (
            <li className="px-3 py-2 text-small text-[color:var(--color-text-muted)]">No matches.</li>
          )}
          {filtered.map((u, i) => (
            <li key={u.id}>
              <button
                type="button"
                onClick={() => selectUniversity(u.name)}
                className={`block w-full px-3 py-2 text-left text-small ${
                  i === highlight ? "bg-[color:var(--color-surface-2)]" : ""
                }`}
              >
                {u.name}
              </button>
            </li>
          ))}
          <li className="border-t border-[color:var(--color-border)]">
            <button
              type="button"
              onClick={selectOther}
              className={`block w-full px-3 py-2 text-left text-small font-medium ${
                highlight === filtered.length ? "bg-[color:var(--color-surface-2)]" : ""
              }`}
            >
              Other (not listed)
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
