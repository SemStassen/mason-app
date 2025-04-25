import { makeAutoObservable, reaction } from "mobx";

const LOCAL_STORAGE_KEY = "mason:app";

// 0 = Sunday, 1 = Monday, etc. (following date-fns convention)
export type WeekStartDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface AppSettings {
  userId: string;
  startOfWeekDay: WeekStartDay;
}

class AppStore {
  userId = "070b6f5e-77fb-4841-b92b-359646fe1e61";
  workspaceId = "8964dc14-37d3-4648-8353-b5c378e9559d";
  startOfWeekDay: WeekStartDay = 1;

  constructor() {
    this.loadFromLocalStorage();
    makeAutoObservable(this);

    reaction(
      () => ({
        userUuid: this.userId,
        startOfWeekDay: this.startOfWeekDay,
      }),
      (data) => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      },
    );
  }

  setStartOfWeekDay(day: WeekStartDay) {
    this.startOfWeekDay = day;
  }

  loadFromLocalStorage() {
    const app = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (app) {
      const data = JSON.parse(app) as Partial<AppSettings>;

      if (data.userId) {
        this.userId = data.userId;
      }

      if (data.startOfWeekDay !== undefined) {
        this.startOfWeekDay = data.startOfWeekDay;
      }
    }
  }
}

export { AppStore };
