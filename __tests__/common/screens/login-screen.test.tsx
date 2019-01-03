jest.mock('react-native-background-fetch');

import {LoginScreenClass, ILoginScreenProps} from '../../../common/screens/login-screen';
import { shallow, ShallowWrapper } from 'enzyme';
import React from 'react';
import {View} from  'react-native';
import { LoginForm} from '../../../common/components';
import {HeaderPage} from '../../../common/components';



describe('Login Screen', () => {
  let wrapper: ShallowWrapper;
  let props: ILoginScreenProps = {
    hive:  jest.fn() as any,
    navigation: {} as any,
    navigationOptions: {} as any,
    nodes: [],
    theme: jest.fn() as any
  };

  beforeEach(() => {
    wrapper = shallow(<LoginScreenClass {...props} />);
  });
  
  it('Should render outer view', ()=> {
      expect(wrapper.find(HeaderPage)).toHaveLength(1);
  });

  it('Should render login from', ()=> {
    expect(wrapper.find(LoginForm)).toHaveLength(1);
  });
});
