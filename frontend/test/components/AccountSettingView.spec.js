import AccountSettingView from '../../src/components/AccountSettingView';
import React from 'react';
import { mount } from 'enzyme';
import renderer from 'react-test-renderer';


describe('AccountSettingView', () => {
    it('renders without error', () => {
	  const view = renderer.create(AccountSettingView).toJSON();
	  expect(view).toMatchSnapshot();
	});
});

