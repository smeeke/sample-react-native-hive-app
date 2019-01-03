import React from 'react';
import { Alert, ActivityIndicator } from 'react-native';
import { LoginForm, tabBarIcon, HeaderPage} from '../components'
import { ILoginResult } from '../components/login-form';
import { withHiveSubscription } from '../hive';
import * as Keychain from 'react-native-keychain';
import {IHiveSubscriptionState} from '../hive/withHiveSubscription';
import { NavigationScreenProps } from 'react-navigation';
import { withTheme, Theme } from 'react-native-paper';

export interface ILoginScreenProps extends IHiveSubscriptionState, NavigationScreenProps {
  theme: Theme
}


export interface ILoginScreenState {
  busy: boolean
}

class LoginScreen extends React.Component<ILoginScreenProps, ILoginScreenState> {
  static navigationOptions = {
    title: 'Login',
    tabBarIcon: tabBarIcon('ios-home')
  };

  constructor(props: ILoginScreenProps) {
    super(props);

    this.state = {
      busy: false
    }

    this.login = this.login.bind(this);
  }

  render() {
    const { busy } = this.state;
    const { theme } = this.props;

    return(
      <HeaderPage title="Login">
        { busy ? <ActivityIndicator size="large" color={theme.colors.accent }/> : <LoginForm onSubmit={this.login}/>}
      </HeaderPage>
    )
  }

  async login(result: ILoginResult) {
      const { hive } = this.props;

      try
      {
        this.setState({busy: true})
        await hive.login(result.userName, result.password);
        await Keychain.setGenericPassword(result.userName, result.password);
        await hive.init();

        this.props.navigation.navigate('App');
      }
      catch(err) {
        this.setState({busy:false});
        Alert.alert("Error", "Unable to login using supplied details");
        await Keychain.resetGenericPassword();
      }
  }
}

export default withTheme(withHiveSubscription()(LoginScreen) as any);
export { LoginScreen as LoginScreenClass }
