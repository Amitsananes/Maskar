"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui";

export type MachineResult = { id: string; name: string };

type MachineSearchProps = {
  selected: MachineResult | null;
  onSelect: (machine: MachineResult | null) => void;
};

export function MachineSearch({ selected, onSelect }: MachineSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MachineResult[]>([]);
  const [open, setOpen] = useState(false);

  const search = useCallback(async (q: string) => {
    if (q.length < 1) {
      setResults([]);
      return;
    }
    const res = await fetch(`/api/machines/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setResults(data.results ?? []);
  }, []);

  useEffect(() => {
    if (selected) {
      setQuery(`${selected.id} — ${selected.name}`);
      return;
    }
    const t = setTimeout(() => search(query), 250);
    return () => clearTimeout(t);
  }, [query, search, selected]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <Input
          className="ps-11"
          placeholder="חפש לפי מזהה מכונה או מיקום..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onSelect(null);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
      </div>

      {selected && (
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
            <Check className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-900">{selected.id}</p>
            <p className="truncate text-sm text-slate-600">{selected.name}</p>
          </div>
          <button
            type="button"
            className="text-xs font-medium text-slate-500 hover:text-slate-800"
            onClick={() => {
              onSelect(null);
              setQuery("");
            }}
          >
            שנה
          </button>
        </div>
      )}

      {open && !selected && results.length > 0 && (
        <ul
          className="absolute z-20 mt-2 max-h-52 w-full overflow-auto rounded-2xl border border-slate-200 bg-white py-1 shadow-card"
          role="listbox"
        >
          {results.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                className="flex w-full items-start gap-3 px-4 py-3 text-right transition hover:bg-slate-50"
                onClick={() => {
                  onSelect(m);
                  setQuery(`${m.id} — ${m.name}`);
                  setResults([]);
                  setOpen(false);
                }}
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                <span className="min-w-0">
                  <span className="block font-semibold text-slate-900">{m.id}</span>
                  <span className="block truncate text-sm text-slate-500">{m.name}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
