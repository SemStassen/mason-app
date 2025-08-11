export const HOTKEYS = {
  tracker: {
    goToNextPeriod: {
      key: "right",
      keyDescription: "Arrow right",
      description: "Go to next view",
    },
    goToPreviousPeriod: {
      key: "left",
      keyDescription: "Arrow left",
      description: "Go to previous view",
    },
    goToToday: {
      key: "t",
      keyDescription: "t",
      description: "Go to today",
    },
    setDayView: {
      key: "d",
      keyDescription: "d",
      description: "Set day view",
    },
    setWeekView: {
      key: "w",
      keyDescription: "w",
      description: "Set week view",
    },
  },
  navigation: {
    toggleSidebar: {
      key: "[",
      keyDescription: "Square bracket left",
      description: "Toggle the sidebar",
    },
    goToDashboard: {
      key: "g+d",
      keyDescription: "g and d",
      description: "Go to dashboard",
    },
    goToTracker: {
      key: "g+t",
      keyDescription: "g and t",
      description: "Go to tracker",
    },
    goToProjects: {
      key: "g+p",
      keyDescription: "g and p",
      description: "Go to projects",
    },
    goToSettings: {
      key: "g+s",
      keyDescription: "g and s",
      description: "Go to settings",
    },
  },
} as const;
