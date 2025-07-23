// hooks/useResizableDivider.ts
import { useRef, useState, useEffect } from "react";

export function useResizableDivider(initialLeftWidth = 480) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth);
  const isDragging = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;

      const containerLeft = containerRef.current.getBoundingClientRect().left;
      const newLeftWidth = e.clientX - containerLeft;

      // Enforce min/max width
      if (newLeftWidth > 300 && newLeftWidth < containerRef.current.offsetWidth - 300) {
        setLeftWidth(newLeftWidth);
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const startDragging = () => {
    isDragging.current = true;
  };

  return {
    containerRef,
    leftWidth,
    startDragging,
  };
}
