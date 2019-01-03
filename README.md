# A Sample React native app using Hive Home
Sample typescript react native app that uses the Hive heating API to display a temperature graph of actual vs target.

##Overview
This is a sample react native app tested on an Android Samsung S9. The goals were:
* Check out react native
* Access a temperature graph using data from our Hive heating system
* Provide notifications if the oil fired heating has cut out

### Hive
All of the hive APi has been wrapped up into a helper service **[hive.service.ts](https://github.com/smeeke/sample-react-native-hive-app/blob/master/common/hive/hive.service.ts)**.
Components that wish access this can use the high order component **[withHiveSubscription](https://github.com/smeeke/sample-react-native-hive-app/blob/master/common/hive/withHiveSubscription.tsx)**.
This will login, give access to service and fire prop changes when data is updated. Sample use can be found in **(temperature-graph-screen.tsx)[https://github.com/smeeke/sample-react-native-hive-app/blob/master/common/screens/temperature-graph-screen.tsx]** and look like this:
```
    hive.init()
      .then(()=>{
        let id = hive.getNodeId('Thermostat');
        hive.getValues(ValueType.targetTemperature, id, Operation.average, start, end.valueOf(), interval )
          .then(() => hive.getValues(ValueType.temperature, id, Operation.average, start, end.valueOf(), interval ))
          .then(() => {
            this.setState({temperaturesLoaded : true });
          })
```
There is also a check for the heating having cut out. For us, this can happen if the oil has run out, the optical flame sensor has become dirty. This is carried by checking actual vs target temperatures every 20 minutes and checking for lack of heating.

### React Native App
The app is a pretty basic react native application tested on Android. It does however, implement many of the common patterns requried. These include:
Local Push notification using **react-native-push-notification**
Background checks when terminated using **react-native-background-fetch**
Material design using **react-native-paper**
Charts using **react-native-svg-charts**
Secure(ish) storage using **react-native-keychain**
Navigation using **react-navigation** and **react-navigation-material-bottom-tabs**

##References
Access to the Hive APi inspired by the excelent articals at: http://www.smartofthehome.com/2016/05/hive-rest-api-v6/

Hive home products
https://www.hivehome.com/


