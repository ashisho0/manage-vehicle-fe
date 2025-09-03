# Manage Vehicle Frontend

A React-based frontend application for managing vehicle driver timelines and schedules.

## Features

- **Driver Management**: View and select from available drivers
- **Timeline Visualization**: Interactive 24-hour timeline showing work and rest periods
- **Date Range Selection**: Choose custom date ranges or use quick filters
- **Real-time Data**: Fetches data from the backend API
- **Responsive Design**: Modern UI built with Tailwind CSS

## API Endpoints

The frontend integrates with the following backend endpoints:

- `GET /api/drivers` - Retrieve all available drivers
- `GET /api/timeline?driverId={id}&startDate={date}&endDate={date}` - Get timeline data for a driver and date range
- `POST /api/timeline` - Save timeline data (currently displays loaded data)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend server running on `http://localhost:3001`

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
```

## Usage

1. **Select a Driver**: Choose a driver from the dropdown menu
2. **Set Date Range**: Use the date pickers or quick filter buttons
3. **View Timeline**: The timeline will automatically load and display work/rest periods
4. **Navigate Days**: Each day shows a detailed timeline with summary statistics

## Timeline Visualization

- **Work Periods**: Displayed in green with duration information
- **Rest Periods**: Displayed in blue with duration information
- **24-Hour Grid**: Hour markers and time labels for easy navigation
- **Summary Cards**: Total work and rest time for each day

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   └── AppHeader.tsx          # Header with driver selection and date controls
│   └── logChecker/
│       ├── Timeline.tsx            # Timeline visualization component
│       ├── DaySchedule.tsx         # Individual day schedule display
│       └── TimelineContainer.tsx   # Main container for timeline management
├── pages/
│   └── LogCheckerPage.tsx         # Main page component
├── api.ts                         # API integration functions
├── types.ts                       # TypeScript type definitions
└── App.tsx                        # Root application component
```

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **date-fns** - Date manipulation utilities

## Configuration

The application is configured to connect to the backend at `http://localhost:3001` by default. This can be changed by setting the `REACT_APP_API_URL` environment variable.

## Development

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Hot Reload**: Automatic browser refresh during development
- **Build Optimization**: Production builds are optimized and minified
