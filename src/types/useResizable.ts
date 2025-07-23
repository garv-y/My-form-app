import { useRef, useEffect } from "react";

export const useResizable = () => {
  const leftRef = useRef<HTMLDivElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const resizer = resizerRef.current;
    const left = leftRef.current;
    if (!resizer || !left) return;

    let x = 0;
    let leftWidth = 0;

    const onMouseDown = (e: MouseEvent) => {
      x = e.clientX;
      leftWidth = left.getBoundingClientRect().width;
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };

    const onMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - x;
      const newLeftWidth = leftWidth + dx;
      left.style.width = `${newLeftWidth}px`;
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    resizer.addEventListener("mousedown", onMouseDown);
    return () => {
      resizer.removeEventListener("mousedown", onMouseDown);
    };
  }, []);

  return { leftRef, resizerRef };
};
