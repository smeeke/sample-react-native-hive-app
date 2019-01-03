import { shallow, ShallowWrapper } from 'enzyme';
import React, { Component } from 'react';

import { withHiveSubscription, HiveService}   from '../../../common/hive';
import { IHiveSubscriptionState } from '../../../common/hive/withHiveSubscription';


export default class TestComponent extends React.PureComponent<any, any> {
  public render() {
    return (
      <div></div>
    );
  }
}

let Target = withHiveSubscription()(TestComponent);

const createTestProps = (props: Object) => ({
  ...props
});

describe("withHiveSubscription", () => {
  let wrapper: ShallowWrapper;
  let props: Object;
  beforeEach(() => {
    props = createTestProps({ prop1:"p1", prop2:"p2"});
    wrapper = shallow(<Target {...props} />);
  });
  
  describe("rendering", () => {
    it("should render passed component", () => {
      expect(wrapper.find(TestComponent)).toHaveLength(1);
    });

    it("should pass prop1 and value", () => {
      expect(wrapper.prop('prop1')).toEqual("p1");
    });

    it("should pass prop2 and value", () => {
      expect(wrapper.prop('prop2')).toEqual("p2");
    });

    it("should set hive service property", () => {
      expect(wrapper.prop('hive')).toBeInstanceOf(HiveService);
    });
  });

  describe("lifecycle", () => {
   let component : Component<any, IHiveSubscriptionState>;
   beforeEach(()=>{
      component = wrapper.instance() as any;
    });

    it('componentDidMount registers change handler', () => {
      let initSpy = jest.spyOn(component.state.hive, "init").mockReturnValue(Promise.resolve({}));
      let regSpy = jest.spyOn(component.state.hive, "registerChangeHandler");
      
      if(component.componentDidMount) {
        component.componentDidMount();
      }

      expect(regSpy).toHaveBeenCalled();
    });

    it('componentWillUnmount unregisters change handler', () => {
      let initSpy = jest.spyOn(component.state.hive, "init").mockReturnValue(Promise.resolve({}));
      let regSpy = jest.spyOn(component.state.hive, "unRegisterChangeHandler");
      
      if(component.componentWillUnmount) {
        component.componentWillUnmount();
      }

      expect(regSpy).toHaveBeenCalled();
    });

    it('service is singleton', () => {
      if(component.componentDidMount) {
        component.componentDidMount();
      }

      let Target2 = withHiveSubscription()(TestComponent);
      wrapper = shallow(<Target2 />);
      let component2 = wrapper.instance() as any;

      expect(component.state.hive == component2.state.hive).toBeTruthy();
    });
  });
});