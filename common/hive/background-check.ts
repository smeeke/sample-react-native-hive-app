/* A helper class used by timed call to check if heating has cut out.
   Oil fireed boiler in use can cut out if sensor dirty, oil empty etc.
   This checks, using CutOutCheck helper created by service, if heating has cut out
   and send push notification to local device if it has  
*/
import BackgroundFetch from "react-native-background-fetch";
import PushNotificationAndroid from 'react-native-push-notification';
import hiveService from './hive.service';

const BackgroundCutOutCheck = async (event: any) : Promise <any> => {
    console.log('[BackgroundFetch HeadlessTask] start');

    let current = new Date();
    // Only check between 5 AM and 10 PM
    if(current.getHours() < 5 || current.getHours() >= 22) {
      BackgroundFetch.finish(BackgroundFetch.FETCH_RESULT_NO_DATA);
      console.log('Not checking as range is outside 5AM - 10PM ');
      return;
    }

    // Get a new instance of the service so we are independant of the UI service singleton
    let service = new hiveService();

    try
    {
      // Read the consturcted cut out helper populated with target and actual temperatures
      let check = await service.getCutOutCheck();

      if(check && check.hasCutOut) {
        // If cut out, send local push notification
        let msg = `${check.actualTemp.toFixed(1)} -> ${check.targetTemp.toFixed(1)} at ${check.tempGradiantPerMinute.toFixed(2)} per min`;
        console.log("Message is", msg);

        PushNotificationAndroid.localNotification({
          title: 'CHECK HEATING',
          message: msg
        });
        BackgroundFetch.finish(BackgroundFetch.FETCH_RESULT_NEW_DATA);
      } else {
        BackgroundFetch.finish(BackgroundFetch.FETCH_RESULT_NO_DATA);
      }

    } catch(err) {
      console.log(err);
      BackgroundFetch.finish(BackgroundFetch.FETCH_RESULT_FAILED);
    } 
}

export default BackgroundCutOutCheck;
