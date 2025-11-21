"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export function usePageView<T extends string>(
  defaultView: T,
  paramName: string = "view"
): [T, (view: T) => void] {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setViewState] = useState<T>(defaultView);

  useEffect(() => {
    const viewParam = searchParams.get(paramName) as T;
    if (viewParam) {
      setViewState(viewParam);
    }
  }, [searchParams, paramName]);

  const setView = (newView: T) => {
    setViewState(newView);
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramName, newView);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return [view, setView];
}




