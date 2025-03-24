import { makeAutoObservable, reaction } from "mobx";

const LOCAL_STORAGE_KEY = "mason:app";

// 0 = Sunday, 1 = Monday, etc. (following date-fns convention)
export type WeekStartDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface AppSettings {
  userUuid: string;
  startOfWeekDay: WeekStartDay;
}

class AppStore {
  userUuid = "8b356b88-a6ad-46d9-962c-d6f585b2b31a";
  workspaceUuid = "81d32fe9-456b-4a8f-960b-5968d294ee60";
  startOfWeekDay: WeekStartDay = 1;

  constructor() {
    this.loadFromLocalStorage();
    makeAutoObservable(this);

    reaction(
      () => ({
        userUuid: this.userUuid,
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

      if (data.userUuid) {
        this.userUuid = data.userUuid;
      }

      if (data.startOfWeekDay !== undefined) {
        this.startOfWeekDay = data.startOfWeekDay;
      }
    }
  }
}

export { AppStore };
