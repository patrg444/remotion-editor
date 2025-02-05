import { app } from 'electron';
import path from 'path';

export async function initialize() {
  // Set app user model id for windows
  if (process.platform === 'win32') {
    app.setAppUserModelId(app.getName());
  }

  // Add app path to environment
  process.env.APP_PATH = app.getAppPath();
  process.env.USER_DATA_PATH = app.getPath('userData');

  // Set up protocol handlers
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient('remotion-editor', process.execPath, [path.resolve(process.argv[1])]);
    }
  } else {
    app.setAsDefaultProtocolClient('remotion-editor');
  }
}
