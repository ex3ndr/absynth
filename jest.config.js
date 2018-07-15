module.exports = {
    testEnvironment: 'node',
    transform: {
        "^.+\\.tsx?$": "ts-jest"
    },
    moduleFileExtensions: [
        'ts',
        'tsx',
        'js',
        'jsx',
        'json',
        'node'
    ],
    moduleDirectories: [
        'node_modules',
        'src'
    ],
    testRegex: '.*\\.spec\\.ts$',
    testPathIgnorePatterns: ['/node_modules/'],
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
    ]
};