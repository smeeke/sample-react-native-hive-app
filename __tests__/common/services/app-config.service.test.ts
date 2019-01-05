import AppConfigService from "../../../common/services/app-config.service";
import { AsyncStorage } from "react-native"

jest.mock('react-native', () => {
  let items:{[index:string]: any} = {};

  return {
      AsyncStorage: {
          setItem: jest.fn((item, value) => {
              items[item] = value;
              return Promise.resolve(value);
          }),
          getItem: jest.fn((item, value) => {
              return Promise.resolve(items[item]);
          })
      }
  }
});

describe('AppConfigService', () => {
  
  let target: AppConfigService;

  beforeAll(()=>{
  });

  beforeEach(() => {
    target = new AppConfigService();
  })

  afterEach(() => {
    jest.resetAllMocks();
  })

  afterAll(()=> {
    jest.unmock('react-native');
  })

  it('can be constructed', () => {
    expect(target).toBeDefined();
  })

  it('save saves to storage', (done) => {
    target.saveSettings({rate: 55}).then(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@Junk:settings', '{"rate":55}');
      done();
    });
 })

 it('getMinRate retrieves from storage', (done) => {
    target.getSettings().then(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@Junk:settings');
      done();
    });
  })
})
