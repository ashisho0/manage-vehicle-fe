export interface TimelineEvent {
  startTime: string;
  eventType: 'Work' | 'Rest';
}

export interface TimelineData {
  driverId: string;
  date: string;
  events: TimelineEvent[];
}

export interface Driver {
  id: number;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  isActive: boolean;
  createdAt: string;
}

export interface DaySchedule {
  date: string;
  blocks: TimeBlock[];
  totalWork: number;
  totalRest: number;
}

export interface TimeBlock {
  time: string;
  type: 'Work' | 'Rest' | 'default';
  startTime: string;
}

// Backend API types
export interface TimeBlockAPI {
  startTime: string;
  endTime: string;
  state: 'Work' | 'Rest';
  duration: number;
}

export interface DaySummary {
  totalWork: {
    hours: number;
    minutes: number;
  };
  totalRest: {
    hours: number;
    minutes: number;
  };
}

export interface DayTimeline {
  timeline: TimeBlockAPI[];
  summary: DaySummary;
}

export interface TimelineResponse {
  driver: {
    id: number;
    name: string;
    licenseNumber: string;
  };
  dateRange: {
    start: string;
    end: string;
  };
  timeline: {
    [date: string]: DayTimeline;
  };
}

export interface TimelineRequest {
  driverId: number;
  dateRange: {
    start: string;
    end: string;
  };
  timeline: TimelineEvent[];
}

export interface DriversResponse {
  message: string;
  data: Driver[];
}

export interface TimelineGetResponse {
  message: string;
  data: TimelineResponse;
}
