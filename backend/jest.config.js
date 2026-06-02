module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'index.js',
    'routes/**/*.js',
    '!routes/chat.js',
  ],
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80,
    },
  },
};
