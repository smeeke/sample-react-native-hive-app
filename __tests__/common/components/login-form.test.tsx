import { shallow, ShallowWrapper } from 'enzyme';
import React from 'react';
import {View, TextInput} from  'react-native';
import {LoginForm, ErrorMessage} from '../../../common/components';

describe('Login Form', () => {
  let props: Object;

  it('Should render outer view', ()=> {
    let wrapper = shallow(<LoginForm  onSubmit={()=>{}}/>);
    expect(wrapper.find(View)).toHaveLength(1);
  });

  it('Should render user name field', ()=> {
    let wrapper = shallow(<LoginForm  onSubmit={()=>{}}/>);
    expect(wrapper.findWhere((c)=>c.key() === 'userName')).toHaveLength(1);
  });

  it('Should render password field', ()=> {
    let wrapper = shallow(<LoginForm  onSubmit={()=>{}}/>);
    expect(wrapper.findWhere((c)=>c.key() === 'password')).toHaveLength(1);
  });

  it('Should submit details on button click', (done)=> {
    const data = {userName: 'u', password: 'u'};
    let wrapper = shallow(<LoginForm  onSubmit={(v)=>{
      expect(v).toEqual(data);
      done();
    }}/>);

    wrapper.setState(data);

    let temp = control(wrapper, 'submit').prop('onPress');
    (temp as any)();
  });

  it('Should not submit details if both fields not present', ()=> {
    let wrapper = shallow(<LoginForm  onSubmit={(v)=>{
      throw(new Error('Should not submit'));
    }}/>);

    let temp = control(wrapper, 'submit').prop('onPress');
    (temp as any)();
  });

  it('Should render username warning', ()=> {
    let wrapper = shallow(<LoginForm  onSubmit={(v)=>{throw(new Error('Should not submit'));}} />);

    wrapper.setState({password: 'p'});
    let temp = (control(wrapper, 'submit').prop('onPress') as any)();

    expect(wrapper.find(ErrorMessage).prop('title')).toEqual('User name is required');
  });

  it('Should render password warning', ()=> {
    let wrapper = shallow(<LoginForm  onSubmit={(v)=>{throw(new Error('Should not submit'));}} />);

    wrapper.setState({userName: 'p'});
    let temp = (control(wrapper, 'submit').prop('onPress') as any)();

    expect(wrapper.find(ErrorMessage).prop('title')).toEqual('Password is required');
  });
});

function control(wrapper: ShallowWrapper, key: string) : ShallowWrapper {
  return wrapper.findWhere((c)=>c.key() === key);
}
