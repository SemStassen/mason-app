import { type } from '@tauri-apps/plugin-os';

type OperatingSystem = 'linux' | 'windows' | 'macOS' | 'unknown';

export function getOs(): OperatingSystem {
  switch (type()) {
    case 'linux':
      return 'linux';
    case 'windows':
      return 'windows';
    case 'macos':
      return 'macOS';
    default:
      return 'unknown';
  }
}
