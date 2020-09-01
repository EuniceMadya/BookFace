import MainApp from '../src/MainApp';
import React from 'react';
import { mount } from 'enzyme';
import renderer from 'react-test-renderer';


describe('MainApp', () => {
    it('renders without error', () => {
	  const view = renderer.create(MainApp).toJSON();
	  expect(view).toMatchSnapshot();
	});
});

