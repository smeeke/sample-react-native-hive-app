/* React native screen to show loading and route to either login aor app pages */
import React from 'react';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import * as Keychain from 'react-native-keychain';
import { NavigationScreenProps } from 'react-navigation';

export default class AuthLoadingScreen extends React.Component<NavigationScreenProps> {
  constructor(props: NavigationScreenProps) {
    super(props);
    this.bootstrapAsync();
  }

  // Fetch the details from storage then navigate to our appropriate place
  private bootstrapAsync = async () => {
    const currentCredentials = await Keychain.getGenericPassword();

    // This will switch to the App screen or Auth screen and this loading
    // screen will be unmounted and thrown away.
    this.props.navigation.navigate(currentCredentials ? 'App' : 'Auth');
  };

  // Render any loading content that you like here
  render() {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large"/>
        <StatusBar barStyle="default" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDFDFD',
  }
});
