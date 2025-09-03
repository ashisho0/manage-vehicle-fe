import React, { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import AppHeader from "../components/layout/AppHeader";
import TimelineContainer from "../components/logChecker/TimelineContainer";
import { useDrivers } from "../api";

const LogCheckerPage: React.FC = () => {
  const { data: drivers } = useDrivers();
  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState<string>(
    format(addDays(new Date(), 6), "yyyy-MM-dd")
  );

  useEffect(() => {
    if (drivers && drivers.length > 0 && !selectedDriver) {
      setSelectedDriver(drivers[0].name);
    }
  }, [drivers, selectedDriver]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-5">
        <AppHeader
          selectedDriver={selectedDriver}
          startDate={startDate}
          endDate={endDate}
          onDriverChange={setSelectedDriver}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />

        <TimelineContainer
          selectedDriver={selectedDriver}
          startDate={startDate}
          endDate={endDate}
        />
      </div>
    </div>
  );
};

export default LogCheckerPage;
