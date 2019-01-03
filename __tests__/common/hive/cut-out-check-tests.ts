import { CutOutCheck } from '../../../common/hive';

describe('CutOutCheck', ()=>{
  let target: CutOutCheck;

  beforeEach(()=>{
  })

  it('Can be constructed', ()=>{
    const targetTemp: any = { values:{ "1": 20, "1000": 20 }};
    const actualTemp:any = { values:{ "1": 10, "1000": 20 }};

    let target = new CutOutCheck(targetTemp, actualTemp);

    expect(target).toBeDefined();
  })

  it('tempGradiantPerMinute returns expected when increasing', ()=>{
    
    const targetTemp: any = { values:{ "0": 20, "60000": 20 }};
    const actualTemp:any = { values:{ "0": 10, "60000": 20 }};
    let target = new CutOutCheck(targetTemp, actualTemp);

    let gradient = target.tempGradiantPerMinute;

    expect(gradient).toBeGreaterThanOrEqual(10.0);
    expect(gradient).toBeLessThan(10.1);
  })

  it('tempGradiantPerMinute returns expected when decreasing', ()=>{
    
    const targetTemp: any = { values:{ "0": 20, "60000": 20 }};
    const actualTemp:any = { values:{ "0": 20, "60000": 10 }};
    let target = new CutOutCheck(targetTemp, actualTemp);

    let gradient = target.tempGradiantPerMinute;

    expect(gradient).toBeLessThanOrEqual(-10.0);
    expect(gradient).toBeGreaterThan(-10.1);
  })

  it('targetTemp returns expected', ()=>{
    const targetTemp: any = { values:{ "0": 20, "60000": 20 }};
    const actualTemp:any = { values:{ "0": 20, "60000": 10 }};
    let target = new CutOutCheck(targetTemp, actualTemp);

    let gradient = target.tempGradiantPerMinute;

    expect(target.targetTemp).toEqual(20);
  })

  it('actualTemp returns expected', ()=>{
    const targetTemp: any = { values:{ "0": 20, "60000": 20 }};
    const actualTemp:any = { values:{ "0": 20, "60000": 10 }};
    let target = new CutOutCheck(targetTemp, actualTemp);

    let gradient = target.tempGradiantPerMinute;

    expect(target.actualTemp).toEqual(10);
  })

  it('isHeating returns true when not at temp', ()=>{
    const targetTemp: any = { values:{ "0": 20, "60000": 20 }};
    const actualTemp:any = { values:{ "0": 20, "60000": 10 }};
    let target = new CutOutCheck(targetTemp, actualTemp);

    let gradient = target.tempGradiantPerMinute;

    expect(target.isHeating).toBeTruthy();
  })

  it('isHeating returns false when targetTemp within 1 degree', ()=>{
    const targetTemp: any = { values:{ "0": 20, "60000": 20 }};
    const actualTemp:any = { values:{ "0": 20, "60000": 19.5 }};
    let target = new CutOutCheck(targetTemp, actualTemp);

    let gradient = target.tempGradiantPerMinute;

    expect(target.isHeating).toBeFalsy();
  })

  it('isHeating returns false when actual temp over target', ()=>{
    const targetTemp: any = { values:{ "0": 20, "60000": 20 }};
    const actualTemp:any = { values:{ "0": 20, "60000": 21 }};
    let target = new CutOutCheck(targetTemp, actualTemp);

    let gradient = target.tempGradiantPerMinute;

    expect(target.isHeating).toBeFalsy();
  })

  it('isHeating returns false when target at or below 1', ()=>{
    const targetTemp: any = { values:{ "0": 20, "60000": 1 }};
    const actualTemp:any = { values:{ "0": 20, "60000": -10 }};
    let target = new CutOutCheck(targetTemp, actualTemp);

    let gradient = target.tempGradiantPerMinute;

    expect(target.isHeating).toBeFalsy();
  })

  it('isHeating returns false when target has changed', ()=>{
    const targetTemp: any = { values:{ "0": 20, "60000": 10 }};
    const actualTemp:any = { values:{ "0": 20, "60000": -10 }};
    let target = new CutOutCheck(targetTemp, actualTemp);

    let gradient = target.tempGradiantPerMinute;

    expect(target.isHeating).toBeFalsy();
  })

  it('hasCutOut returns false when not heating', ()=>{
    const targetTemp: any = { values:{ "0": 20, "60000": 10 }};
    const actualTemp:any = { values:{ "0": 17, "60000": 10 }};
    let target = new CutOutCheck(targetTemp, actualTemp);

    let gradient = target.tempGradiantPerMinute;

    expect(target.hasCutOut).toBeFalsy();
  })

  it('hasCutOut returns false when gradient within limits', ()=>{
    const targetTemp: any = { values:{ "0": 20, "60000": 20 }};
    const actualTemp:any = { values:{ "0": 10.0 - 0.01259, "60000": 10 }};
    let target = new CutOutCheck(targetTemp, actualTemp);

    let gradient = target.tempGradiantPerMinute;

    expect(target.hasCutOut).toBeFalsy();
  })

  it('hasCutOut returns true when gradient outwith limits', ()=>{
    const targetTemp: any = { values:{ "0": 20, "60000": 20 }};
    const actualTemp:any = { values:{ "0": 10.0 - 0.0124, "60000": 10 }};
    let target = new CutOutCheck(targetTemp, actualTemp);

    let gradient = target.tempGradiantPerMinute;

    expect(target.hasCutOut).toBeTruthy();
  })
});

