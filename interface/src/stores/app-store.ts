import { makeAutoObservable, reaction } from "mobx";

const LOCAL_STORAGE_KEY = "mason:app";

class AppStore {
  userUuid = "426c391c-8e99-4402-3c61-b0e6565ec16d";

  constructor() {
    this.loadFromLocalStorage();

    makeAutoObservable(this);
  }

  loadFromLocalStorage() {
    const app = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (app) {
      const data = JSON.parse(app);

      this.userUuid = data.userUuid;
    }
  }
}

const appStore = new AppStore();
export { appStore };
