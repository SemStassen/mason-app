import {
  AuthApi,
  Configuration,
  type ConfigurationParameters,
  WorkspaceApi,
} from './generated-client';

class MasonApi {
  readonly auth: AuthApi;
  readonly workspace: WorkspaceApi;

  constructor(configurationParameters?: ConfigurationParameters) {
    const configuration = new Configuration(configurationParameters);
    this.auth = new AuthApi(configuration);
    this.workspace = new WorkspaceApi(configuration);
  }
}

export function createMasonClient(
  configurationParameters?: ConfigurationParameters
) {
  return new MasonApi(configurationParameters);
}
