import { useRef, useEffect } from "react";

// This custom hook enables resizable panels using mouse drag
export const useResizable = () => {
  // Reference to the left panel you want to resize
  const leftRef = useRef<HTMLDivElement>(null);

  // Reference to the draggable resizer element between panels
  const resizerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const resizer = resizerRef.current;
    const left = leftRef.current;
    if (!resizer || !left) return;

    let x = 0;               // Initial mouse X position
    let leftWidth = 0;       // Initial width of the left panel

    // Triggered when mouse is pressed down on the resizer
    const onMouseDown = (e: MouseEvent) => {
      x = e.clientX;                         // Store initial X
      leftWidth = left.getBoundingClientRect().width; // Store initial left panel width
      document.addEventListener("mousemove", onMouseMove); // Start tracking mouse movement
      document.addEventListener("mouseup", onMouseUp);     // Listen for release
    };

    // Triggered on mouse move after mousedown
    const onMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - x;             // Change in X
      const newLeftWidth = leftWidth + dx;  // Calculate new width
      left.style.width = `${newLeftWidth}px`; // Apply new width to the left panel
    };

    // Triggered when mouse is released
    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove); // Cleanup move listener
      document.removeEventListener("mouseup", onMouseUp);     // Cleanup up listener
    };

    // Start listening for mouse drag on resizer
    resizer.addEventListener("mousedown", onMouseDown);

    // Cleanup listener on unmount
    return () => {
      resizer.removeEventListener("mousedown", onMouseDown);
    };
  }, []);

  // Return references to be attached to actual DOM elements
  return { leftRef, resizerRef };
};
