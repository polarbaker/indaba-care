module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.jest.json',
    }],
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@chakra-ui|uuid|pouchdb|pouchdb-browser|firebase|react-firebase-hooks))',
  ],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/tests/__mocks__/fileMock.js',
    '^@chakra-ui/drawer$': '<rootDir>/node_modules/@chakra-ui/react/dist/cjs/index.cjs',
    '^@chakra-ui/switch$': '<rootDir>/node_modules/@chakra-ui/react/dist/cjs/index.cjs',
    '^@chakra-ui/form-control$': '<rootDir>/node_modules/@chakra-ui/react/dist/cjs/index.cjs',
    '^pouchdb-browser$': '<rootDir>/tests/__mocks__/pouchdb-browser.js',
    '^../../src/lib/db': '<rootDir>/tests/__mocks__/db.js',
  },
  testPathIgnorePatterns: ['/node_modules/', '/.next/', 'mobile-scaffold'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/pages/_app.tsx',
    '!src/pages/_document.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
