const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './tests',
    testMatch: '**/*.spec.js',
    fullyParallel: false,
    workers: 2,
    timeout: 20_000,
    reporter: [['line']],
    use: {
        baseURL: 'http://127.0.0.1:4173',
        headless: true,
        viewport: { width: 1440, height: 1000 },
    },
    webServer: {
        command: 'python3 -m http.server 4173 --bind 127.0.0.1',
        url: 'http://127.0.0.1:4173/index.html',
        reuseExistingServer: false,
        timeout: 10_000,
    },
});
