import App from '../src/App';
import React from 'react';
import { mount } from 'enzyme';
import renderer from 'react-test-renderer';


describe('App', () => {
    it('renders without error', () => {
	  const view = renderer.create(App).toJSON();
	  expect(view).toMatchSnapshot();
	});
});

