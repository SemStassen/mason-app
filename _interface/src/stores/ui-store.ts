import { makeAutoObservable, reaction } from "mobx";

type Theme = "system" | "light" | "dark";

const LOCAL_STORAGE_KEY = "mason:ui";

class UiStore {
  // General
  isSidebarOpen = true;
  uses24HourClock = true;
  theme: Theme = "system";

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

export { UiStore };
