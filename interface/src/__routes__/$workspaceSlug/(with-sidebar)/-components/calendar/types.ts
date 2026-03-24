export type ITimeEntry = {
  id: string;
  startedAt: Date;
  stoppedAt: Date;
  project: {
    name: string;
    hexColor: string;
  };
};
