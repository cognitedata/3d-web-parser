module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  // TODO 20191009 larsmoa: Disabled coverage because it borks line numbers for debugger
  // coverageDirectory: './coverage/',
  // collectCoverage: true
};
