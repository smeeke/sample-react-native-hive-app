/** @format */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

import BackgroundFetch from "react-native-background-fetch";
import {BackgroundCutOutCheck}  from './common/hive';

// Register your BackgroundFetch HeadlessTask
BackgroundFetch.registerHeadlessTask(BackgroundCutOutCheck);

AppRegistry.registerComponent(appName, () => App);
