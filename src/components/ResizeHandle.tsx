import { useCallback, useEffect, useState } from "react";

interface ResizeHandleProps {
  direction: "horizontal" | "vertical";
  onResize: (delta: number) => void;
}

export function ResizeHandle({ direction, onResize }: ResizeHandleProps) {
  const [dragging, setDragging] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      onResize(direction === "horizontal" ? e.movementX : e.movementY);
    };

    const handleMouseUp = () => setDragging(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = direction === "horizontal" ? "col-resize" : "row-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [dragging, direction, onResize]);

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`shrink-0 transition-colors ${
        direction === "horizontal"
          ? "w-[3px] cursor-col-resize hover:bg-[var(--accent)]/40"
          : "h-[3px] cursor-row-resize hover:bg-[var(--accent)]/40"
      } ${dragging ? "bg-[var(--accent)]" : ""}`}
    />
  );
}
