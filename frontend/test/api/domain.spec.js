const domain = require('../../src/api/domain');

// make sure we can access the url for backend api calls
test('backend domain is exported', () => {
    expect(domain).not.toBe(undefined);
});