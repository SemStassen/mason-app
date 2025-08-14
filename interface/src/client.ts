import { createMasonClient } from '@mason/sdk/mason-client';

export const masonClient = createMasonClient({
  basePath: '',
  credentials: 'include',
});
