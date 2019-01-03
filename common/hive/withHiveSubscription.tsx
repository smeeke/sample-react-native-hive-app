/* A High Order Component that injects the modified hive data and service as properties.
Also, registers for changes in data from hive so component will re-render when updates are 
pulled from hive
*/
import * as React from 'react';
import hoistNonReactStatic from 'hoist-non-react-statics';
import HiveService from './hive.service';
import { INode, ValueType, IHiveValueSet } from './hive-interfaces';


export interface HiveSubscriptionProps {
}

export interface IHiveSubscriptionState {
  hive: HiveService;
  sessionId?: string;
  nodes: INode[];
  [index: string] : IHiveValueSet | undefined | any
}

function enhance(WrappedComponent: React.ComponentClass<any>, hiveService: HiveService) {

  class HiveSubscription extends React.Component<HiveSubscriptionProps, IHiveSubscriptionState> {

    constructor(props: HiveSubscriptionProps) {
      super(props);
      this.state = {
        hive: hiveService,
        nodes: [],
        values: {} as any
      } as IHiveSubscriptionState;

      this.displayName = `HiveSubscription(${this.getDisplayName(WrappedComponent)})`;
      this.onDataChange = this.onDataChange.bind(this);
    }

    displayName : string;

    public render() {
      return <WrappedComponent {...this.state} {...this.props}/>;
    }

    getDisplayName(component: React.ComponentClass) {
      return component.displayName || component.name || 'Component';
    }

    onDataChange(data : any) {
      this.setState(data);
    }

    componentDidMount() {
      const { hive } = this.state;
      hive.registerChangeHandler(this.onDataChange);
    }

    componentWillUnmount() {
      const { hive } = this.state;
      hive.unRegisterChangeHandler(this.onDataChange);
    }
  };

  hoistNonReactStatic(HiveSubscription, WrappedComponent);

  return HiveSubscription;
}

let serviceSingleton: HiveService;

export default function withHiveSubscription() {

  let service = serviceSingleton;
  if(!service) {
    service = serviceSingleton = new HiveService();
  }

  return (wrappedComponent: React.ComponentClass<any,any>) => {
    return enhance(wrappedComponent, service);
  }
}

