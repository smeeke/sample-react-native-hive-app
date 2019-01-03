# React Native app using Hive API
Sample typescript React Native app that uses the Hive heating API to display a temperature graph of actual vs target.

### Overview
This is a sample react native app tested on an Android Samsung S9. The goals were:
* Check out react native
* Access a temperature graph using data from our Hive heating system
* Provide notifications if the oil fired heating has cut out

### Hive
All of the hive APi has been wrapped up into a helper service  **[hive.service.ts](https://github.com/smeeke/sample-react-native-hive-app/blob/master/common/hive/hive.service.ts)**

Components that wish to access this can use the high order component  **[withHiveSubscription.tsx](https://github.com/smeeke/sample-react-native-hive-app/blob/master/common/hive/withHiveSubscription.tsx)**

This will login, give access to service and fire prop changes when data is updated.

Sample use can be found in [temperature-graph-screen.tsx](https://github.com/smeeke/sample-react-native-hive-app/blob/master/common/screens/temperature-graph-screen.tsx) and looks like this:

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
There is also a check for the heating having cut out. For us, this can happen if the oil has run out, the optical flame sensor has become dirty.

This is carried by checking actual vs target temperatures every 20 minutes and checking for lack of heating. This is implemented in [cut-out-check.ts](https://github.com/smeeke/sample-react-native-hive-app/blob/master/common/hive/cut-out-check.ts)


### React Native App
The app is a pretty basic react native application tested on Android. However, it does implement many of the common patterns requried for more substantial applications. These include:

* API calls using **axios**
* Routing to login using different nav stacks
* Local Push notification using **react-native-push-notification**
* Background checks when terminated using **react-native-background-fetch**
* Material design using **react-native-paper**
* Charts using **react-native-svg-charts**
* Secure(ish) storage using **react-native-keychain**
* Navigation using **react-navigation** and **react-navigation-material-bottom-tabs**


### References
Access to the Hive API inspired by the excelent articals at [www.smartofthehome.com](http://www.smartofthehome.com/2016/05/hive-rest-api-v6/)

Uses data collected from Hive home products [www.hivehome.com](https://www.hivehome.com/)


