import { makeAutoObservable, reaction } from "mobx";

type Theme = "system" | "light" | "dark";

const LOCAL_STORAGE_KEY = "mason:ui";

class TrackerStore {
  dateInView = new Date();
  daysInView = 1;

  currentDate = new Date();
  private intervalId?: number;

  constructor() {
    makeAutoObservable(this);
    this.startUpdatingCurrentDate();
  }

  setDateInView(date: Date) {
    this.dateInView = date;
  }

  setDaysInView(amount: number) {
    this.daysInView = amount;
  }

  private startUpdatingCurrentDate() {
    // Calculate delay until start of next minute
    const now = new Date();
    const msUntilNextMinute =
      60000 - (now.getSeconds() * 1000 + now.getMilliseconds());

    // Initial timeout to align with start of next minute
    setTimeout(() => {
      this.currentDate = new Date();

      // Then update every minute
      this.intervalId = setInterval(() => {
        this.currentDate = new Date();
      }, 60000);
    }, msUntilNextMinute);
  }

  dispose() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

class UiStore {
  // General
  isSidebarOpen = true;
  uses24HourClock = true;
  theme: Theme = "system";

  tracker = new TrackerStore();

  // Developer debug tools
  isInspectorOpen = false;

  constructor() {
    this.loadFromLocalStorage();

    makeAutoObservable(this);

    this.applyTheme();

    reaction(
      () => ({
        isSidebarOpen: this.isSidebarOpen,
        uses24HourClock: this.uses24HourClock,
        theme: this.theme,
      }),
      (data) => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      },
    );

    reaction(
      () => this.theme,
      () => {
        this.applyTheme();
      },
    );
  }

  applyTheme() {
    const root = window.document.documentElement;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
    const themeToApply = this.theme === "system" ? systemTheme : this.theme;

    // Remove both classes first to ensure clean state
    root.classList.remove("light", "dark");
    // Add the appropriate class
    root.classList.add(themeToApply);

    // Optional: Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector("meta[name='theme-color']");
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        themeToApply === "dark" ? "#0f172a" : "#ffffff",
      );
    }
  }

  setTheme(theme: Theme) {
    this.theme = theme;
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleInspector() {
    this.isInspectorOpen = !this.isInspectorOpen;
  }

  loadFromLocalStorage() {
    const ui = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (ui) {
      const data = JSON.parse(ui);

      this.isSidebarOpen = data.isSidebarOpen ?? true;
      this.uses24HourClock = data.uses24hourClock ?? true;
      this.theme = data.theme ?? "system";
    }
  }
}

const uiStore = new UiStore();
export { uiStore };
