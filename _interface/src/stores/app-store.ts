import { makeAutoObservable, reaction } from "mobx";

const LOCAL_STORAGE_KEY = "mason:app";

// 0 = Sunday, 1 = Monday, etc. (following date-fns convention)
export type WeekStartDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface AppSettings {
  userId: string | null;
  workspaceIds: Array<string>;
  activeWorkspaceId: string | null;
}

class AppStore {
  public userId: string | null = null;
  public workspaceIds: Array<string> = [];
  public activeWorkspaceId: string | null = null;
  startOfWeekDay: WeekStartDay = 1;

  constructor() {
    this.loadFromLocalStorage();
    makeAutoObservable(this);

    reaction(
      () => ({
        userId: this.userId,
        workspaceIds: this.workspaceIds,
        activeWorkspaceId: this.activeWorkspaceId,
      }),
      (data) => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      },
    );
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  addWorkspaceId(workspaceId: string) {
    if (!this.workspaceIds.includes(workspaceId)) {
      this.workspaceIds.push(workspaceId);
    }
  }

  removeWorkspaceId(workspaceId: string) {
    this.workspaceIds = this.workspaceIds.filter((id) => id !== workspaceId);
  }

  setActiveWorkspaceId(workspaceId: string) {
    if (!this.workspaceIds.includes(workspaceId)) {
      throw new Error("Workspace ID not found in workspace IDs");
    }

    this.activeWorkspaceId = workspaceId;
  }

  loadFromLocalStorage() {
    const app = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (app) {
      const data = JSON.parse(app) as Partial<AppSettings>;
      if (data.userId) this.userId = data.userId;
      if (data.workspaceIds) this.workspaceIds = data.workspaceIds;
      if (data.activeWorkspaceId)
        this.activeWorkspaceId = data.activeWorkspaceId;
    }
  }
}

export { AppStore };
