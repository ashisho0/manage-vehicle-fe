import React, { useState, useCallback, useEffect } from "react";
import { useDrivers, useTimeline, useSaveTimeline } from "../../api";
import { TimelineEvent, DaySchedule } from "../../types";
import DayScheduleComponent from "./DaySchedule";
import { format } from "date-fns";
import { getCurrentTimezoneOffset } from "../../utils/timezone";

interface TimelineContainerProps {
  selectedDriver: string;
  startDate: string;
  endDate: string;
}

const TimelineContainer: React.FC<TimelineContainerProps> = ({
  selectedDriver,
  startDate,
  endDate,
}) => {
  const [schedules, setSchedules] = useState<DaySchedule[]>([]);
  const [originalSchedules, setOriginalSchedules] = useState<DaySchedule[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [userModifiedBlocks, setUserModifiedBlocks] = useState<Set<string>>(
    new Set()
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: drivers } = useDrivers();
  const driver = drivers?.find((d) => d.name === selectedDriver);

  const {
    data: timelineData,
    isLoading,
    error: timelineError,
    refetch: refetchTimeline,
  } = useTimeline(driver?.id || null, startDate, endDate);

  const saveTimelineMutation = useSaveTimeline();

  const generateTimeBlocks = useCallback((): {
    type: "Work" | "Rest" | "default";
    time: string;
  }[] => {
    const blocks = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const time = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        blocks.push({ type: "default" as const, time });
      }
    }
    return blocks;
  }, []);

  const initializeSchedules = useCallback(() => {
    const newSchedules: DaySchedule[] = [];
    const currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      const dateStr = format(currentDate, "yyyy-MM-dd");
      const blocks = generateTimeBlocks();

      newSchedules.push({
        date: dateStr,
        blocks: blocks.map((block) => ({
          ...block,
          startTime:
            dateStr + "T" + block.time + ":00" + getCurrentTimezoneOffset(),
        })),
        totalWork: 0,
        totalRest: 0,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    setSchedules(newSchedules);
  }, [startDate, endDate, generateTimeBlocks]);

  useEffect(() => {
    if (driver?.id) {
      refetchTimeline();
    }
  }, [driver?.id, refetchTimeline]);

  useEffect(() => {
    if (timelineData && driver) {
      const defaultSchedules: DaySchedule[] = [];
      const currentDate = new Date(startDate);
      const end = new Date(endDate);

      while (currentDate <= end) {
        const dateStr = format(currentDate, "yyyy-MM-dd");
        const blocks = generateTimeBlocks().map((block) => ({
          ...block,
          startTime:
            dateStr + "T" + block.time + ":00" + getCurrentTimezoneOffset(),
        }));

        defaultSchedules.push({
          date: dateStr,
          blocks,
          totalWork: 0,
          totalRest: 0,
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      const newSchedules: DaySchedule[] = [];
      const processDate = new Date(startDate);

      while (processDate <= end) {
        const dateStr = format(processDate, "yyyy-MM-dd");
        const dayData = timelineData.timeline[dateStr];

        if (dayData && dayData.timeline && Array.isArray(dayData.timeline)) {
          const blocks = generateTimeBlocks().map((block) => ({
            ...block,
            startTime:
              dateStr + "T" + block.time + ":00" + getCurrentTimezoneOffset(),
          }));

          dayData.timeline.forEach((apiBlock, index) => {
            if (!apiBlock || !apiBlock.startTime || !apiBlock.endTime) {
              return;
            }

            try {
              const startTime = apiBlock.startTime;
              const endTime = apiBlock.endTime;

              if (!startTime || !endTime) {
                console.warn("Invalid time format:", {
                  startTime: apiBlock.startTime,
                  endTime: apiBlock.endTime,
                });
                return;
              }

              blocks.forEach((block) => {
                const blockTime = block.time;

                const [blockHour, blockMinute] = blockTime
                  .split(":")
                  .map(Number);
                const blockTimeInMinutes = blockHour * 60 + blockMinute;

                const [startHour, startMinute] = startTime
                  .split(":")
                  .map(Number);
                const startTimeInMinutes = startHour * 60 + startMinute;

                const [endHour, endMinute] = endTime.split(":").map(Number);
                const endTimeInMinutes = endHour * 60 + endMinute;

                if (
                  blockTimeInMinutes >= startTimeInMinutes &&
                  blockTimeInMinutes < endTimeInMinutes
                ) {
                  if (apiBlock.state === "Work") {
                    block.type = "Work";
                  } else if (apiBlock.state === "Rest") {
                    block.type = "Rest";
                  }
                }
              });
            } catch (error) {
              console.error(
                "Error processing timeline block:",
                error,
                apiBlock
              );
            }
          });

          const totalWork = dayData.summary?.totalWork
            ? dayData.summary.totalWork.hours * 60 +
              dayData.summary.totalWork.minutes
            : 0;
          const totalRest = dayData.summary?.totalRest
            ? dayData.summary.totalRest.hours * 60 +
              dayData.summary.totalRest.minutes
            : 0;

          newSchedules.push({
            date: dateStr,
            blocks,
            totalWork,
            totalRest,
          });
        } else {
          const blocks = generateTimeBlocks().map((block) => ({
            ...block,
            startTime:
              dateStr + "T" + block.time + ":00" + getCurrentTimezoneOffset(),
          }));

          newSchedules.push({
            date: dateStr,
            blocks,
            totalWork: 0,
            totalRest: 0,
          });
        }

        processDate.setDate(processDate.getDate() + 1);
      }

      setSchedules(newSchedules);
      setOriginalSchedules(JSON.parse(JSON.stringify(newSchedules)));
      setHasChanges(false);
    } else if (!timelineData && !isLoading) {
      initializeSchedules();
    }
  }, [
    timelineData,
    driver,
    startDate,
    endDate,
    generateTimeBlocks,
    initializeSchedules,
    isLoading,
  ]);

  const handleBlockClick = useCallback(
    (
      date: string,
      blockIndex: number,
      newType: "Work" | "Rest" | "default"
    ) => {
      setSchedules((prevSchedules) => {
        const newSchedules = prevSchedules.map((schedule) => {
          if (schedule.date === date) {
            const newBlocks = [...schedule.blocks];
            const oldType = newBlocks[blockIndex].type;
            newBlocks[blockIndex] = {
              ...newBlocks[blockIndex],
              type: newType,
            };

            // Update totals
            let newTotalWork = schedule.totalWork;
            let newTotalRest = schedule.totalRest;

            if (oldType === "Work") {
              newTotalWork -= 15;
            } else if (oldType === "Rest") {
              newTotalRest -= 15;
            }

            if (newType === "Work") {
              newTotalWork += 15;
            } else if (newType === "Rest") {
              newTotalRest += 15;
            }

            // Track this specific block as user-modified
            const blockKey = `${date}-${blockIndex}`;
            setUserModifiedBlocks((prev) => {
              const newSet = new Set(prev);
              newSet.add(blockKey);
              return newSet;
            });

            return {
              ...schedule,
              blocks: newBlocks,
              totalWork: newTotalWork,
              totalRest: newTotalRest,
            };
          }
          return schedule;
        });

        setHasChanges(true);
        return newSchedules;
      });
    },
    []
  );

  const handleBlockDrag = useCallback(
    (scheduleIndex: number, startIndex: number, endIndex: number) => {
      setSchedules((prevSchedules) => {
        const newSchedules = [...prevSchedules];
        const schedule = newSchedules[scheduleIndex];
        const blocks = schedule.blocks;

        const typeToApply =
          blocks[startIndex].type === "default"
            ? "Work"
            : blocks[startIndex].type;

        for (let i = startIndex; i <= endIndex; i++) {
          const oldType = blocks[i].type;
          blocks[i].type = typeToApply;

          if (oldType === "Work") schedule.totalWork -= 15;
          else if (oldType === "Rest") schedule.totalRest -= 15;

          if (typeToApply === "Work") schedule.totalWork += 15;
          else if (typeToApply === "Rest") schedule.totalRest += 15;
        }

        setHasChanges(true);
        return newSchedules;
      });
    },
    []
  );

  const getChangedEvents = useCallback(() => {
    if (!hasChanges || userModifiedBlocks.size === 0) {
      return [];
    }

    const modifiedDates = new Set<string>();
    userModifiedBlocks.forEach((blockKey) => {
      const [yy, mm, dd] = blockKey.split("-");
      const date = `${yy}-${mm}-${dd}`;
      modifiedDates.add(date);
    });

    const changes: TimelineEvent[] = [];

    modifiedDates.forEach((date) => {
      const schedule = schedules.find((s) => s.date === date);
      if (!schedule) return;

      let previousType: "Work" | "Rest" | "default" | null = null;

      schedule.blocks.forEach((block) => {
        if (block.type === "Work" || block.type === "Rest") {
          if (block.type !== previousType) {
            changes.push({
              startTime: block.startTime,
              eventType: block.type,
            });
          }
        }
        previousType = block.type;
      });
    });

    changes.sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    return changes;
  }, [schedules, hasChanges, userModifiedBlocks]);

  const handleSave = useCallback(async () => {
    if (!driver) {
      setMessage("Error: Driver not found");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    if (!hasChanges) {
      setMessage("No changes to save");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      setMessage("Saving...");
      setError(null);

      const changedEvents = getChangedEvents();

      if (changedEvents.length === 0) {
        setMessage("No changes to save");
        setTimeout(() => setMessage(""), 3000);
        return;
      }

      await saveTimelineMutation.mutateAsync({
        driverId: driver.id,
        dateRange: {
          start: startDate,
          end: endDate,
        },
        timeline: changedEvents,
      });

      setOriginalSchedules(JSON.parse(JSON.stringify(schedules)));
      setHasChanges(false);
      setUserModifiedBlocks(new Set());
      setMessage("Timeline saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Save error:", error);
      setError("Failed to save timeline");
      setMessage("Error saving timeline");
      setTimeout(() => setMessage(""), 3000);
    }

    setTimeout(() => setMessage(""), 3000);
  }, [
    schedules,
    driver,
    startDate,
    endDate,
    saveTimelineMutation,
    hasChanges,
    getChangedEvents,
  ]);

  const handleReset = useCallback(() => {
    setSchedules(JSON.parse(JSON.stringify(originalSchedules)));
    setHasChanges(false);
    setUserModifiedBlocks(new Set());
    setMessage("Timeline reset to original state");
    setTimeout(() => setMessage(""), 3000);
  }, [originalSchedules]);

  useEffect(() => {
    if (timelineError) {
      setError("Failed to load timeline data");
    }
  }, [timelineError]);

  if (isLoading && schedules.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading timeline...</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end gap-4 items-center">
        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={saveTimelineMutation.isPending}
            className="px-6 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {saveTimelineMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        )}
        <button
          onClick={handleReset}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Reset
        </button>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg ${
            message.includes("Error")
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {message}
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}

      {schedules.map((schedule, index) => (
        <DayScheduleComponent
          key={schedule.date}
          schedule={schedule}
          onBlockClick={(blockIndex, newType) => {
            handleBlockClick(schedule.date, blockIndex, newType);
          }}
          onBlockDrag={(startIndex, endIndex) =>
            handleBlockDrag(index, startIndex, endIndex)
          }
          onScheduleTypeChange={(scheduleType) =>
            console.log("Schedule type changed:", scheduleType)
          }
          selectedDriver={driver || null}
        />
      ))}
    </div>
  );
};

export default TimelineContainer;
