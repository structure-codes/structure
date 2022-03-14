import { useState, useEffect, useCallback } from "react";

export const useMousePosition = (isDragging: boolean) => {
  const [mousePosition, setMousePosition] = useState<{ x: number | null; y: number | null }>({
    x: null,
    y: null,
  });

  useEffect(() => {
    const updateMousePosition = (ev: MouseEvent) => {
      if (isDragging) ev.preventDefault();
      setMousePosition({ x: ev.clientX, y: ev.clientY });
    };
    window.addEventListener("mousemove", updateMousePosition);

    return () => window.removeEventListener("mousemove", updateMousePosition);
  }, [isDragging]);

  return mousePosition;
};