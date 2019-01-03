import React from 'react';
import { createStackNavigator, createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createMaterialBottomTabNavigator  } from 'react-navigation-material-bottom-tabs';
import { HomeScreen, LoginScreen, TemperatureGraphScreen, AuthLoadingScreen, AccountScreen, CutOutCheckScreen } from './common/screens';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import BackgroundFetch from "react-native-background-fetch";
import {BackgroundCutOutCheck} from './common/hive';
import ReactPushNotification, { PushNotification } from 'react-native-push-notification';

/* Override default theme to be 'duck yellow' */
const theme = {
  ...DefaultTheme,
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    primary: '#e8c714',
    accent: '#f1c40f',
  }
};

// Create a navigation stack with only the login page and no header
const AuthStack = createStackNavigator({ SignIn: LoginScreen }, {headerMode : 'none'});

// Create a navigator using tabs for after login
const AppNavigator = createMaterialBottomTabNavigator (
  {
    HomeScreen,
    TemperatureGraphScreen,
    CutOutCheckScreen,
    AccountScreen
  }
);

// Them main app component
const AppContainer = createAppContainer(createSwitchNavigator(
  {
    AuthLoading: AuthLoadingScreen, // Check if already have logged in
    App: AppNavigator, // If already logged in will render the app tabs
    Auth: AuthStack, // If no already logged in will render the login page
  },
  {
    initialRouteName: 'AuthLoading',
  }
));


export default class Apc extends React.Component {
  private registerBackgroundCheck() {
    // Configure background check
    BackgroundFetch.configure({
      minimumFetchInterval: 20, // <-- minutes (15 is minimum allowed)
      stopOnTerminate: false,   // <-- Android-only,
      startOnBoot: true,         // <-- Android-only,
      enableHeadless: true
    }, () => {
      console.log("[js] Received background-fetch event");
      BackgroundCutOutCheck(null).then(() => {
        console.log("[js] Async call completed OK");
      })
      .catch((err) => {
        console.log("[js] Error on background async call", err);
      });

      // Required: Signal completion of your task to native code
      // If you fail to do this, the OS can terminate your app
      // or assign battery-blame for consuming too much background-time
      BackgroundFetch.finish(BackgroundFetch.FETCH_RESULT_NEW_DATA);
    }, () => {
      console.log("[js] RNBackgroundFetch failed to start");
    });
  }

  private reportBackgroundCheckStatus() {
    // Optional: Query the authorization status.
    BackgroundFetch.status((status) => {
      switch(status) {
        case BackgroundFetch.STATUS_RESTRICTED:
          console.log("BackgroundFetch restricted");
          break;
        case BackgroundFetch.STATUS_DENIED:
          console.log("BackgroundFetch denied");
          break;
        case BackgroundFetch.STATUS_AVAILABLE:
          console.log("BackgroundFetch is enabled");
          break;
      }
    });
  }

  private registerForPushNotifications() {
    ReactPushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: function (token: any) {
        console.log('TOKEN:', token);
      },
      // (required) Called when a remote or local notification is opened or received
      onNotification: function (notification: PushNotification) {
        console.log('NOTIFICATION:', notification);
        // process the notification
      },
      // Should the initial notification be popped automatically
      // default: true
      popInitialNotification: true,
      /**
        * (optional) default: true
        * - Specified if permissions (ios) and token (android and ios) will requested or not,
        * - if not, you must call PushNotificationsHandler.requestPermissions() later
        */
      requestPermissions: true,
    });
  }

  private reportPushNotificationStatus() {
    ReactPushNotification.checkPermissions((v) => {
      console.log('Push notification permissions:', v);
    });
  }

  componentDidMount() {
    this.registerBackgroundCheck(); 
    this.reportBackgroundCheckStatus(); 
    
    this.registerForPushNotifications();
    this.reportPushNotificationStatus();
  }

  render() {
    // Render main app container
    return <PaperProvider theme={theme}><AppContainer /></PaperProvider>;
  }
}

