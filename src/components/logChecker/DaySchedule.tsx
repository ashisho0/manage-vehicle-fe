import React from "react";
import { DaySchedule as DayScheduleType, Driver } from "../../types";
import { Timeline } from "./Timeline";
import { format, parseISO } from "date-fns";
import { formatTimezoneDisplay } from "../../utils/timezone";

interface DayScheduleProps {
  schedule: DayScheduleType;
  onBlockClick: (index: number, newType: "Work" | "Rest" | "default") => void;
  onBlockDrag: (startIndex: number, endIndex: number) => void;
  onScheduleTypeChange: (scheduleType: string) => void;
  selectedDriver: Driver | null;
}

const DaySchedule: React.FC<DayScheduleProps> = ({
  schedule,
  onBlockClick,
  onBlockDrag,
  onScheduleTypeChange,
  selectedDriver,
}) => {
  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, "d MMMM");
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 mb-5">
      <div className="text-2xl mb-4 text-gray-800">
        {formatDate(schedule.date)}
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-gray-400 font-medium">Driver</span>
          <span className="text-gray-800 text-sm font-medium">
            {selectedDriver?.name || "Loading..."}
          </span>
        </div>

        <div className="flex flex-col gap-1 w-4/5">
          <select
            className="p-2 border border-gray-300 rounded bg-white text-sm"
            defaultValue="Standard Solo"
            onChange={(e) => onScheduleTypeChange(e.target.value)}
          >
            <option value="Standard Solo">Standard Solo</option>
            <option value="Team Driver">Team Driver</option>
            <option value="Sleeper Berth">Sleeper Berth</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-sm text-gray-400 font-medium">Time Zone</span>
          <span className="text-gray-800 text-sm font-medium">
            {formatTimezoneDisplay()}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-sm text-gray-400 font-medium">
            License Number
          </span>
          <span className="text-gray-800 text-sm font-medium">
            {selectedDriver?.licenseNumber || "Loading..."}
          </span>
        </div>
      </div>

      <Timeline
        blocks={schedule.blocks}
        onBlockClick={onBlockClick}
        onBlockDrag={onBlockDrag}
        totalWork={schedule.totalWork}
        totalRest={schedule.totalRest}
      />
    </div>
  );
};

export default DaySchedule;
