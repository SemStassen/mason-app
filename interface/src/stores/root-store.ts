import { AppStore } from "./app-store";
import { ProjectPageStore } from "./project-page-store";
import { TrackerStore } from "./tracker-store";
import { UiStore } from "./ui-store";

class RootStore {
  uiStore: UiStore;
  appStore: AppStore;
  trackerStore: TrackerStore;
  projectPageStore: ProjectPageStore;

  constructor() {
    this.trackerStore = new TrackerStore();
    this.uiStore = new UiStore();
    this.appStore = new AppStore();
    this.projectPageStore = new ProjectPageStore();
  }
}

export const rootStore = new RootStore();
