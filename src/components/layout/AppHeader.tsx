import React from "react";
import { format, addDays } from "date-fns";
import { useDrivers } from "../../api";

interface AppHeaderProps {
  selectedDriver: string;
  startDate: string;
  endDate: string;
  onDriverChange: (driver: string) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  selectedDriver,
  startDate,
  endDate,
  onDriverChange,
  onStartDateChange,
  onEndDateChange,
}) => {
  const { data: drivers, isLoading, error } = useDrivers();

  const handleQuickFilter = (days: number) => {
    const newStartDate = format(addDays(new Date(), -days), "yyyy-MM-dd");
    const newEndDate = format(new Date(), "yyyy-MM-dd");
    onStartDateChange(newStartDate);
    onEndDateChange(newEndDate);
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow-md mb-5">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4 items-center">
          <select
            className="p-2 border border-gray-300 rounded bg-white text-sm min-w-[150px]"
            value={selectedDriver}
            onChange={(e) => onDriverChange(e.target.value)}
            disabled={isLoading}
          >
            {isLoading ? (
              <option>Loading drivers...</option>
            ) : (
              drivers?.map((driver) => (
                <option key={driver.id} value={driver.name}>
                  {driver.name}
                </option>
              ))
            )}
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="p-2 border border-gray-300 rounded text-sm"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="p-2 border border-gray-300 rounded text-sm"
          />
        </div>

        <div>Quick Filters</div>
        <button
          onClick={() => handleQuickFilter(7)}
          className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
        >
          Last 7 days
        </button>
        <button
          onClick={() => handleQuickFilter(14)}
          className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
        >
          Last 14 days
        </button>
        <button
          onClick={() => handleQuickFilter(28)}
          className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
        >
          Last 28 days
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          Error loading drivers: {error.message}
        </div>
      )}
    </div>
  );
};

export default AppHeader;
