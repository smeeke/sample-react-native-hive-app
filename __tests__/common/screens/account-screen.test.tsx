import AccountScreen, { AccountScreenProps} from '../../../common/screens/account-screen';
import { shallow, ShallowWrapper } from 'enzyme';
import React from 'react';
import * as Keychain from 'react-native-keychain'; 
import {HeaderPage} from '../../../common/components';
import {Button} from 'react-native-paper';

jest.mock('react-native-keychain');

describe('Account Screen', () => {
  let wrapper: ShallowWrapper;
  let props: AccountScreenProps = {
    navigation: { navigate: jest.fn() } as any
  };

  const mountPromise = Promise.resolve({username: 'testuser'}); 

  beforeEach(() => {
    spyOn(Keychain, 'getGenericPassword').and.returnValue(mountPromise);
    wrapper = shallow(<AccountScreen {...props} />);
  });
  
  it('Should render outer view', ()=> {
      expect(wrapper.find(HeaderPage)).toHaveLength(1);
  });

  it('Should render logout button', ()=> {
    expect(wrapper.find(Button)).toHaveLength(1);
  });

  describe('When login pressed', () => {
    it('resets account', (done)=>{
      spyOn(Keychain, 'resetGenericPassword').and.callFake(() =>done());

      (wrapper.find(Button).prop('onPress') as any)(null as any);
    })

    it('Navigates to auth screen', ()=>{
      spyOn(Keychain, 'resetGenericPassword').and.returnValue(Promise.resolve());

      (wrapper.find(Button).prop('onPress') as any)(null as any);

      expect(props.navigation.navigate).toBeCalledWith('Auth');
    })
  });
});
