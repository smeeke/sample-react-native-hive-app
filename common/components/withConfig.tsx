/* A High Order Component that loadds and allows setting of app config
*/
import * as React from 'react';
import hoistNonReactStatic from 'hoist-non-react-statics';
import { AppConfigService } from '../services';
import { IConfig } from '../services/app-config.service';
import { Alert } from 'react-native';


export interface AppConfigState {
  temperatureSourceDeviceName?: string,
  expectedTemperatureDeltaPerHour?: number,
  setConfig: (config: IConfig) => void
}

function enhance(WrappedComponent: React.ComponentClass<any>, appConfigService: AppConfigService) {

  class HiveSubscription extends React.Component<any, AppConfigState> {

    constructor(props: any) {
      super(props);
      this.displayName = `AppConfig(${this.getDisplayName(WrappedComponent)})`;
      this.setConfig = this.setConfig.bind(this);

      this.state = {
        expectedTemperatureDeltaPerHour: 0.011,
        setConfig: this.setConfig

      } as AppConfigState;
    }

    configService = appConfigService;
    displayName : string;

    public setConfig(settings: IConfig) {
      const {setConfig, ...config} = this.state;
      let updated = {...config, ...settings};
      this.configService.saveSettings(updated)
        .then(_ => this.setState(updated));
    }

    public render() {
      return <WrappedComponent {...this.state} {...this.props}/>;
    }

    getDisplayName(component: React.ComponentClass) {
      return component.displayName || component.name || 'Component';
    }

    componentDidMount() {
      this.configService.getSettings()
        .then(settings => this.setState(settings as IConfig))
        .catch(_ => Alert.alert("Unable to read current settings"));
    }

    componentWillUnmount() {
    }
  };

  hoistNonReactStatic(HiveSubscription, WrappedComponent);

  return HiveSubscription;
}

export default function withConfig() {

  let service = new AppConfigService();

  return (wrappedComponent: React.ComponentClass<any,any>) => {
    return enhance(wrappedComponent, service);
  }
}

