import { useEffect, useState } from "react";

const STORAGE_KEY = "cat-companion-enabled";
const EVENT = "cat-companion-change";

function readInitial(): boolean {
  if (typeof window === "undefined") return true;
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === null ? true : v === "1";
}

export function useCatCompanion() {
  const [enabled, setEnabledState] = useState<boolean>(true);

  useEffect(() => {
    setEnabledState(readInitial());
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<boolean>).detail;
      if (typeof detail === "boolean") setEnabledState(detail);
      else setEnabledState(readInitial());
    };
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  function setEnabled(v: boolean) {
    setEnabledState(v);
    try {
      window.localStorage.setItem(STORAGE_KEY, v ? "1" : "0");
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent(EVENT, { detail: v }));
  }

  return { enabled, setEnabled };
}
