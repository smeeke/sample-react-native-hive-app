/*
  Helper class to deterine if heating has cut out. An oil fired boiler can out if oil runs out,
  sensor detecting flame is dirty etc.

  This detects cut out bu measuring if:
  Heating set set to temp, actual is below this temp and has not increased by expected amount in last 30 minutes.
*/
import {IHiveValueSet} from './hive-interfaces';

export default class CutOutCheck {
  constructor(public target: IHiveValueSet, public actual: IHiveValueSet, public rateChangePerHour: number) {
  }

  private _keys: string[] = undefined as any; // Used to cache the times to check

  get keys(): string[] {
    // Extracts the time property names from the passed record or from cache 
    if(!this._keys) {
      this._keys = Object.keys(this.actual.values);
    }
    
    return this._keys;
  } 

  get startTime() : number {
    // The time of first temp reading in set
    return parseInt(this.keys[0]);
  }

  get endTime() : number {
    // The time of last temp reading in set
    return parseInt(this.keys[this.keys.length - 1]);
  }

  get tempDifference() : number {
    // The difference in temperature in time checked
    return this.actual.values[this.startTime] -  this.actual.values[this.endTime];
  }

  get timeSpan() : number {
    // The time interval temeratures were measured across
    return this.startTime - this.endTime;
  }

  get tempGradiantPerMinute() {
    // The rate at which temperature is chaning over measured time
    return this.tempDifference / (this.timeSpan / 1000 / 60);
  }

  get targetTemp() {
    // The value the temerature is set to on the the thermostat
    let keys = Object.keys(this.target.values);
    return this.target.values[keys[keys.length - 1]];
  }

  get actualTemp() {
    // The temerature reach at end of measured time
    return this.actual.values[this.endTime];
  }

  get isHeating() {
    // Returns true if heating is considered to be asking for heat

    if(this.target.values[this.startTime] != this.target.values[this.endTime]) {
      /* If target temp is not same at start and end of interval measured then consider as not heating.
        This is to elimate an spurious result if heating just on at end of measured interval
      */
      return false;
    }

    /*
     Consider heating if target temp is greater the 1 deg and difference between actual and target is greater the 1 deg.
     The elimiates counting decreases in temp as it bounces around the set target temp
    */
    return this.targetTemp > 1 
      && this.targetTemp - this.actualTemp > 1 
  }

  get hasCutOut() {
    // Returns true if heating is needed and has not increased at expected rate per minute 
    const expectedGradiantPerMinute = this.rateChangePerHour / 60;
    if(!this.isHeating) {
      return false;
    }

    return this.tempGradiantPerMinute <= 0 
      || this.tempGradiantPerMinute < expectedGradiantPerMinute;
  }
}