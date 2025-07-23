// hooks/useResizableDivider.ts
import { useRef, useState, useEffect } from "react";

// Custom hook to manage a resizable left/right divider layout
export function useResizableDivider(initialLeftWidth = 480) {
  // Ref for the main container that wraps both left and right panes
  const containerRef = useRef<HTMLDivElement>(null);

  // State to hold the current width of the left pane
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth);

  // Ref to track whether the mouse is currently dragging
  const isDragging = useRef(false);

  useEffect(() => {
    // Handles mouse movement while dragging
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;

      // Calculate the left boundary of the container
      const containerLeft = containerRef.current.getBoundingClientRect().left;

      // New width = mouse X position - container's left offset
      const newLeftWidth = e.clientX - containerLeft;

      // Enforce minimum and maximum width limits
      if (
        newLeftWidth > 300 && // Min width
        newLeftWidth < containerRef.current.offsetWidth - 300 // Max width (based on total container size)
      ) {
        setLeftWidth(newLeftWidth);
      }
    };

    // Ends dragging on mouse release
    const handleMouseUp = () => {
      isDragging.current = false;
    };

    // Attach global mouse move and up listeners
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    // Cleanup listeners on component unmount
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // Called when the user starts dragging the divider
  const startDragging = () => {
    isDragging.current = true;
  };

  return {
    containerRef, // attach to the outer container
    leftWidth,     // use to set left panel width
    startDragging, // call on mousedown of the divider
  };
}
