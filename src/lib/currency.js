import { useState, useEffect, useCallback } from "react";
import { CURRENCIES } from "./healthcareData";

export function useCurrency() {
  const [currency, setCurrencyState] = useState(() => localStorage.getItem("dgh_currency") || "USD");
  useEffect(() => { localStorage.setItem("dgh_currency", currency); }, [currency]);
  const setCurrency = useCallback((c) => setCurrencyState(c), []);
  return { currency, setCurrency, currencies: CURRENCIES };
}