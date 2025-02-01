module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      diagnostics: {
        warnOnly: true
      }
    }],
  },
  testMatch: ['**/tests/**/*.test.(ts|tsx)'],
  roots: ['<rootDir>/src', '<rootDir>/tests']
};