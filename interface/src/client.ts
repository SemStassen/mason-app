import { createMasonClient } from '@mason/sdk/mason-client';

const masonClient = createMasonClient({
  basePath: '/api',
  credentials: 'include',
});
