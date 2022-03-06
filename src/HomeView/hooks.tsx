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

type DimensionsType = {
  width: number,
  height: number,
}

type TranslateType = {
  x: number,
  y: number,
}

export const useCenteredTree = (defaultTranslate = { x: 0, y: 0 }): [DimensionsType, TranslateType, any] => {
  const [translate, setTranslate] = useState(defaultTranslate);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useCallback((containerElem) => {
    if (containerElem !== null) {
      const { width, height } = containerElem.getBoundingClientRect();
      setDimensions({ width, height });
      setTranslate({ x: width / 2, y: height / 2 });
    }
  }, []);
  return [dimensions, translate, containerRef];
};
