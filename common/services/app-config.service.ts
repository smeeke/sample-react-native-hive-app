import { AsyncStorage } from 'react-native';

const rootKey = '@Junk';


export interface IConfig {
  temperatureSourceDeviceName?: string,
  expectedTemperatureDeltaPerHour?: number,
}

export default class AppConfigService {

  public async saveSettings(settings: IConfig) {
    await this.save('settings', settings);
  }

  public async getSettings() : Promise<IConfig> {
    return await this.get('settings');
  }

  private async save(key: string, value: IConfig) {
    await AsyncStorage.setItem(`${rootKey}:${key}`, JSON.stringify(value));
  }

  private async get(key: string) : Promise<IConfig> {
    return JSON.parse(await AsyncStorage.getItem(`${rootKey}:${key}`) || '{}') ;
  }
}
