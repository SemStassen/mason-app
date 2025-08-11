import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { OpenApi } from '@effect/platform';
import { MasonApi } from '../../../apps/server/src/api/contract/index';

const __dirname = dirname(fileURLToPath(import.meta.url));

const spec = OpenApi.fromApi(MasonApi, {
  additionalPropertiesStrategy: 'strict',
});

const outputDir = join(__dirname, './../spec');
const outputFile = join(outputDir, 'openapi.json');

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputFile, JSON.stringify(spec, null, 2), 'utf8');
