"use client";

import { useEffect, useRef, useState } from "react";
import { searchAdminMemberCandidatesAction } from "@/actions/admin-access";

type Candidate = { id: string; full_name: string; email: string };

/** Type-to-search picker restricted to approved members who aren't already admins — no manual email entry. */
export function AdminMemberCombobox({ name }: { name: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      const matches = await searchAdminMemberCandidatesAction(query);
      setResults(matches);
      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div ref={boxRef} className="relative min-w-[260px] flex-1">
      <label htmlFor={`${name}-search`} className="text-xs font-medium text-stone-700 dark:text-stone-300">
        Approved member
      </label>
      <input type="hidden" name={name} value={selected?.id ?? ""} required />
      <input
        id={`${name}-search`}
        type="text"
        className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-900"
        placeholder="Type a name or email…"
        autoComplete="off"
        value={selected ? `${selected.full_name} (${selected.email})` : query}
        onChange={(e) => {
          setSelected(null);
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {open && (
        <div className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-stone-300 bg-white shadow-lg dark:border-stone-700 dark:bg-stone-900">
          {loading && <p className="px-3 py-2 text-xs text-muted">Searching…</p>}
          {!loading && results.length === 0 && (
            <p className="px-3 py-2 text-xs text-muted">
              {query.trim().length < 2 ? "Type at least 2 characters to search" : "No approved members match"}
            </p>
          )}
          {!loading &&
            results.map((m) => (
              <button
                key={m.id}
                type="button"
                className="block w-full px-3 py-2 text-left text-sm hover:bg-stone-100 dark:hover:bg-stone-800"
                onClick={() => {
                  setSelected(m);
                  setQuery("");
                  setOpen(false);
                }}
              >
                {m.full_name} ({m.email})
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
