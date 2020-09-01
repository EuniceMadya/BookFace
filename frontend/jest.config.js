module.exports = {
    verbose: true,
    bail: true,
    collectCoverage: true,
	  moduleFileExtensions: ['js', 'jsx'],
	  transform: {
	    '^.+\\.(js|jsx)?$': 'babel-jest',     
	    '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
	  },
	  moduleNameMapper: {
	    '^@/(.*)$': '<rootDir>/src/$1'
	  },
	  testMatch: [
	    '<rootDir>/test/**/*.spec.(js|jsx|ts|tsx)'
	  ],
	  transformIgnorePatterns: ['<rootDir>/node_modules/']
};
