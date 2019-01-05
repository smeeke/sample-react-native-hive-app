/* React native screen to allow for logging out and clearing credentials from encrypted cache */
import React, { Component} from 'react';
import {View, StyleSheet, Text, Picker } from 'react-native';
import * as KeyChain from 'react-native-keychain';
import { NavigationScreenProps, NavigationEventSubscription } from 'react-navigation';
import { tabBarIcon, HeaderPage, CenteredView, ErrorMessage} from '../components';
import { Button, TextInput, Snackbar } from 'react-native-paper';
import { AppConfigState } from '../components/withConfig';
import { withHiveSubscription, HiveService } from '../hive';
import { INode, NodeType  } from '../hive/hive-interfaces';
import { IHiveSubscriptionState } from '../hive/withHiveSubscription';
import { AppConfigService } from '../services'
export interface AccountScreenProps extends NavigationScreenProps, AppConfigState, IHiveSubscriptionState {
}

export interface AccountScreenState {
  userName?: string;
  rateError?: string;
  rate?: string;
  temperatureSourceDeviceName?: string;
  showSaved: boolean;
  message: string;
}

class AccountScreen extends Component<AccountScreenProps, AccountScreenState> {
  static navigationOptions = {
    title: 'Account',
    tabBarIcon: tabBarIcon('ios-person')
  };

  constructor(props: AccountScreenProps) {
    super(props);

    this.state = {
      showSaved: false,
      message: ''
    }

    this.logout = this.logout.bind(this);
    this.tempRateChange = this.tempRateChange.bind(this);
    this.saveSettings = this.saveSettings.bind(this);
    this.temperatureSourceDeviceNameChange = this.temperatureSourceDeviceNameChange.bind(this);
  }

  willFocusSubscription : NavigationEventSubscription = undefined as any; 
  public configService = new AppConfigService();

  componentDidMount() {

    const { hive } = this.props;

      KeyChain.getGenericPassword()
        .then((v: any)=>{
          this.setState({userName: v.username});
        })
        .then(_ => hive.init());

      this.willFocusSubscription = this.props.navigation.addListener(
        'willFocus',
        payload => {
          this.configService.getSettings().then(settings => {
            this.setState({
                temperatureSourceDeviceName: settings.temperatureSourceDeviceName,
                rate: (settings.expectedTemperatureDeltaPerHour || 0.1).toString()
            })
          });
        }
      );
  }

  componentWillUnmount() {
    if(this.willFocusSubscription) {
      // Remove the listener 
      this.willFocusSubscription.remove();
    }
  }

  public render() {
    const {userName, rateError, rate, temperatureSourceDeviceName} = this.state;
    const  {nodes} = this.props;
    const thermostatNodes = nodes.filter(m => m.nodeType === NodeType.thermostat);
    return (
      <HeaderPage title="Account">
        <CenteredView>
          <Text style={styles.userText}>{userName || ''}</Text>
        </CenteredView>
        <View>
          <Text>Expected temp increase per hour</Text>
          <TextInput keyboardType="decimal-pad" value={rate} onChangeText={this.tempRateChange}/>
          {rateError && <ErrorMessage title={rateError}/>}
          <Text style={{marginTop:30}}>Thermostat device</Text>
          <Picker
            selectedValue={temperatureSourceDeviceName}
            onValueChange={this.temperatureSourceDeviceNameChange}>
            {
              thermostatNodes.map(m => <Picker.Item key={m.id} label={m.name} value={m.name} />)
            }
          </Picker>
        </View>
        <CenteredView>
          <Button onPress={this.logout} mode="outlined" >Logout</Button>
          <Button onPress={this.saveSettings} mode="contained" disabled={this.hasError} >Save Settings</Button>
        </CenteredView>
        <Snackbar
              visible={this.state.showSaved}
              onDismiss={() => this.setState({ showSaved: false })} 
              duration={2500}
              >{this.state.message}</Snackbar>
      </HeaderPage>
    );
  }

  public async logout() {
    await KeyChain.resetGenericPassword();
    this.props.navigation.navigate('Auth');
  }

  get hasError(): boolean {
    const { rateError} = this.state;
    return !!(rateError);
  }

  saveSettings() {
    const { setConfig } = this.props;
    const {rate, temperatureSourceDeviceName } = this.state;

    if(!this.hasError) {
      this.configService.saveSettings({
        expectedTemperatureDeltaPerHour: parseFloat(rate as string),
        temperatureSourceDeviceName: temperatureSourceDeviceName
      })
      .then(_ => this.setState({showSaved: true, message: 'Settings saved'}))
      .catch(_ => this.setState({showSaved: true, message: 'UNABLE to save settings'}) );

    }
  }

  tempRateChange(change: string) {
    let temp = parseFloat(change);
    const {expectedTemperatureDeltaPerHour, setConfig} = this.props;

    let errorString = temp <= 0 ? 'Rate of change must be grater than 0' : undefined;

    this.setState({rate: change, rateError: errorString});
  }

  temperatureSourceDeviceNameChange(change: string) {
    this.setState({temperatureSourceDeviceName: change});
  }
}

const styles = StyleSheet.create({
  userText: {
    fontSize: 18,
    marginBottom: 12
  }
});


export default withHiveSubscription()(AccountScreen);