import React from "react";
import { TimeBlock } from "../../types";

interface TimelineProps {
  blocks: TimeBlock[];
  onBlockClick: (index: number, newType: "Work" | "Rest" | "default") => void;
  onBlockDrag: (startIndex: number, endIndex: number) => void;
  totalWork: number;
  totalRest: number;
}

export const Timeline: React.FC<TimelineProps> = ({
  blocks,
  onBlockClick,
  onBlockDrag,
  totalWork,
  totalRest,
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStartIndex, setDragStartIndex] = React.useState<number | null>(
    null
  );
  const [isMouseDown, setIsMouseDown] = React.useState(false);

  const handleMouseDown = (index: number, event: React.MouseEvent) => {
    event.preventDefault();
    setIsMouseDown(true);
    setDragStartIndex(index);
    setIsDragging(false);
  };

  const handleMouseUp = (index: number) => {
    if (!isDragging && dragStartIndex === index) {
      // Single click - toggle between Work and Rest directly
      const currentBlock = blocks[index];
      let newType: "Work" | "Rest" | "default";

      // Toggle between Work and Rest, skip default state
      if (currentBlock.type === "Work") {
        newType = "Rest";
      } else {
        newType = "Work";
      }

      onBlockClick(index, newType);
    }

    // Reset states
    setIsMouseDown(false);
    setIsDragging(false);
    setDragStartIndex(null);
  };

  const handleMouseEnter = (index: number) => {
    if (isMouseDown && dragStartIndex !== null) {
      // User is dragging - start drag operation if not already started
      if (!isDragging && dragStartIndex !== index) {
        setIsDragging(true);
      }
      // Call onBlockDrag when dragging to update the selection
      if (isDragging || dragStartIndex !== index) {
        onBlockDrag(dragStartIndex, index);
      }
    }
  };

  const handleMouseOver = (index: number) => {
    // Also handle mouseover for better responsiveness
    if (isMouseDown && dragStartIndex !== null && dragStartIndex !== index) {
      if (!isDragging) {
        setIsDragging(true);
      }
      onBlockDrag(dragStartIndex, index);
    }
  };

  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      // Reset drag state if mouse is released outside
      setIsMouseDown(false);
      setIsDragging(false);
      setDragStartIndex(null);
    };

    document.addEventListener("mouseup", handleGlobalMouseUp);
    return () => document.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} hr ${mins} min`;
  };

  return (
    <div className="w-full">
      {/* Timeline grid with row labels and summary */}
      <div className="flex">
        {/* Row labels */}
        <div className="flex flex-col mr-3 min-w-[50px]">
          <div className="h-8 flex items-center font-semibold text-gray-800">
            Work
          </div>
          <div className="h-8 flex items-center font-semibold text-gray-800">
            Rest
          </div>
        </div>

        {/* Timeline blocks */}
        <div className="flex flex-col">
          {/* Work row */}
          <div className="flex">
            {blocks.map((block, index) => {
              // Check if this is the first block of an hour (every 4 blocks)
              const isFirstBlockOfHour = index % 4 === 0;
              const hour = Math.floor(index / 4);

              return (
                <div
                  key={`work-${index}`}
                  className={`timeline-block ${
                    block.type === "Work" ? "work" : "default"
                  } relative`}
                  onMouseDown={(event) => handleMouseDown(index, event)}
                  onMouseUp={() => handleMouseUp(index)}
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseOver={() => handleMouseOver(index)}
                  style={{
                    borderRight:
                      (index + 1) % 4 === 0
                        ? "3px solid #666"
                        : "1px solid #d1d5db",
                    userSelect: "none",
                  }}
                >
                  {/* Show hour label in the first block of every hour */}
                  {isFirstBlockOfHour && (
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 mt-2 font-medium">
                      {hour === 0
                        ? "🌙"
                        : hour === 12
                        ? "☀️"
                        : hour.toString().padStart(2, "0")}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Rest row - touching the Work row above */}
          <div className="flex -mt-0.5">
            {blocks.map((block, index) => {
              return (
                <div
                  key={`rest-${index}`}
                  className={`timeline-block ${
                    block.type === "Rest" ? "rest" : "default"
                  } relative`}
                  onMouseDown={(event) => handleMouseDown(index, event)}
                  onMouseUp={() => handleMouseUp(index)}
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseOver={() => handleMouseOver(index)}
                  style={{
                    borderRight:
                      (index + 1) % 4 === 0
                        ? "3px solid #666"
                        : "1px solid #d1d5db",
                    userSelect: "none",
                  }}
                ></div>
              );
            })}
          </div>
        </div>

        {/* Summary column at the end */}
        <div className="flex flex-col min-w-[80px]">
          <div className="h-8 flex flex-col items-center justify-center text-xs text-gray-800 bg-gray-50 border border-gray-300">
            <div className="text-xs">Total Work:</div>
            <div className="text-xs ">{formatDuration(totalWork)}</div>
          </div>
          <div className="h-8 flex flex-col items-center justify-center text-xs text-gray-800 bg-gray-50 border border-gray-300">
            <div className="text-xs">Total Rest:</div>
            <div className="text-xs">{formatDuration(totalRest)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
