import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './test', fullyParallel: false, retries: process.env.CI ? 1 : 0,
  reporter: 'list', timeout: 60000,
  use: { baseURL: 'http://127.0.0.1:3000', headless: true, screenshot: 'only-on-failure', launchOptions: { args: ['--disable-renderer-backgrounding', '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion'] }, ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) },
  webServer: { command: '"' + process.execPath + '" node_modules/vite/bin/vite.js --host 127.0.0.1', url: 'http://127.0.0.1:3000', reuseExistingServer: !process.env.CI }
});
