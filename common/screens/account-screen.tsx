/* React native screen to allow for logging out and clearing credentials from encrypted cache */
import React, { Component} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import * as KeyChain from 'react-native-keychain';
import { NavigationScreenProps } from 'react-navigation';
import { tabBarIcon, HeaderPage, CenteredView} from '../components';
import { Button } from 'react-native-paper';

export interface AccountScreenProps extends NavigationScreenProps {
}

export interface AccountScreenState {
  userName?: string;
}

export default class AccountScreen extends Component<AccountScreenProps, AccountScreenState> {
  static navigationOptions = {
    title: 'Account',
    tabBarIcon: tabBarIcon('ios-person')
  };

  constructor(props: AccountScreenProps) {
    super(props);

    this.state = {
    }

    this.logout = this.logout.bind(this);
  }

  componentDidMount() {
      KeyChain.getGenericPassword()
        .then((v: any)=>{
          this.setState({userName: v.username});
        });
  }

  public render() {
    const {userName} = this.state;

    return (
      <HeaderPage title="Account">
        <CenteredView>
          <Text style={styles.userText}>{userName || ''}</Text>
        </CenteredView>
        <CenteredView>
          <Button onPress={this.logout} mode="contained" >Logout</Button>
        </CenteredView>
      </HeaderPage>
    );
  }

  public async logout() {
    await KeyChain.resetGenericPassword();
    this.props.navigation.navigate('Auth');
  }
}

const styles = StyleSheet.create({
  userText: {
    fontSize: 18,
    marginBottom: 12
  }
});
