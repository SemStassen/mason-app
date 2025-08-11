import { makeAutoObservable } from "mobx";

class ProjectPageStore {
  isInfoPanelOpen = true;

  constructor() {
    makeAutoObservable(this);
  }

  toggleInfoPanel() {
    this.isInfoPanelOpen = !this.isInfoPanelOpen;
  }
}

export { ProjectPageStore };
