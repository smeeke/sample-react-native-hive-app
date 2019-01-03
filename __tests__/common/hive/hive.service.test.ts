import { HiveService }  from '../../../common/hive';
import axios from 'axios';
import AxiosMockAdapter from 'axios-mock-adapter';
import { Unit, Operation, ValueType, NodeTypeIdentifiers, NodeType } from '../../../common/hive/hive-interfaces';
import * as Keychain from 'react-native-keychain'; 

jest.mock('react-native-keychain');

describe('HiveService', () => {

  const userName = 'user1';
  const password  = 'password1';
  let target: HiveService;

  describe('Constructor', () => {
    beforeEach(()=>{

    });

    it('creates instance', ()=>{
      target = new HiveService();
      expect(target).toBeInstanceOf(HiveService);
    })
  });

  describe('network calls', () => {  
    let mockAxios: AxiosMockAdapter | any;
    const baseUri = 'https://api-prod.bgchprod.info:443/omnia';
    let mockChangeHandler: ({}) => void;

    beforeEach(()=>{
      mockAxios = new AxiosMockAdapter(axios);
      target = new HiveService();        
      mockChangeHandler = jest.fn();
      target.registerChangeHandler(mockChangeHandler);
      jest.spyOn(Keychain, 'getGenericPassword').mockReturnValue({username:'u', password: 'p'});
    });

    afterEach(() => {
      target.unRegisterChangeHandler(mockChangeHandler);
      mockAxios.reset();
    })

    describe('login', () => {
      it('posts to expected uri', (done)=> {
        mockAxios.onPost(`${baseUri}/auth/sessions`).reply(200, {})
          .onAny().reply(500);
        
        target.login(userName, password).then(() => {
          expect(mockAxios.history.post.length).toBe(1);
        })      
        .then(done)
        .catch(done.fail);
      });

      it('posts expected user data', (done)=> {
        const expectedData = JSON.stringify({
          "sessions": [{
              "username": userName,
              "password": password,
              "caller": "WEB"
          }]
        });

        mockAxios.onPost(`${baseUri}/auth/sessions`).reply(200, {})
          .onAny().reply(500);
        
        target.login(userName, password).then(() => {
          let data = mockAxios.history.post[0].data; 
          expect(data).toBe(expectedData)
        })      
        .then(done)
        .catch(done.fail);
      });

      it('posts expected headers', (done)=> {
        mockAxios.onPost(`${baseUri}/auth/sessions`).reply(200, {})
          .onAny().reply(500);
        
        target.login(userName, password).then(() => {
          let headers = mockAxios.history.post[0].headers; 
          expect(headers["Content-Type"]).toEqual("application/vnd.alertme.zoo-6.1+json");
          expect(headers["Accept"]).toEqual("application/vnd.alertme.zoo-6.1+json");
          expect(headers["X-Omnia-Client"]).toEqual("Hive Web Dashboard");
        })      
        .then(done)
        .catch(done.fail);
      });

      it('returns undefined if no sessions from server', (done)=> {
        mockAxios.onPost(`${baseUri}/auth/sessions`).reply(200, {})
          .onAny().reply(500);
        
        target.login(userName, password).then((res: string) => {
          expect(res).toBeUndefined();
        })      
        .then(done)
        .catch(done.fail);
      });

      it('returns undefined if empty sessions from server', (done)=> {
        mockAxios.onPost(`${baseUri}/auth/sessions`).reply(200, { sessions: []})
          .onAny().reply(500);
        
        target.login(userName, password).then((res: string) => {
          expect(res).toBeUndefined();
        })      
        .then(done)
        .catch(done.fail);
      });

      it('returns session id from server', (done)=> {
        const sessionId = "123";
        mockAxios.onPost(`${baseUri}/auth/sessions`).reply(200, { sessions: [{sessionId: sessionId}]})
          .onAny().reply(500);
        
        target.login(userName, password).then((res: string) => {
          expect(res).toEqual(sessionId);
        })      
        .then(done)
        .catch(done.fail);
      });

      it('sets session id on class property', (done)=> {
        const sessionId = "123";
        mockAxios.onPost(`${baseUri}/auth/sessions`).reply(200, { sessions: [{sessionId: sessionId}]})
          .onAny().reply(500);
        
        target.login(userName, password).then((res: string) => {
          expect(target.sessionId).toEqual(sessionId);
        })      
        .then(done)
        .catch(done.fail);
      });
    });

    describe('init', () => {
      it('calls login', (done)=> {
        const result = { sessions: [ { sessionId: 99 }]};
        mockAxios.onPost(/.*/).reply(200, { sessions: result});
        mockAxios.onGet(/.*/).reply(200, { });

        target.init().then(() => {
          expect(mockAxios.history.post[0].url).toEqual(`${baseUri}/auth/sessions`);
        })
        .then(done)
        .catch(done.fail);
      });

      it('initializes only once if call multiple times', (done)=> {
        const result = { sessions: [ { sessionId: 99 }]};
        mockAxios.onPost(/.*/).reply(200, { sessions: result});
        mockAxios.onGet(/.*/).reply(200, { });

        target.init()
          .then(() => target.init())
          .then(() => {
            expect(mockAxios.history.post.length).toEqual(1);
          })      
          .then(done)
          .catch(done.fail);
      });

      it('initialize logs in if session is expired', (done)=> {
        const result = { sessions: [ { sessionId: 99 }]};
        mockAxios.onPost(/.*/).reply(200, { sessions: result});
        mockAxios.onGet(/.*/).reply(200, { });

        let timeSpy = jest.spyOn(target, "getTime")
          .mockReturnValueOnce(new Date(Date.now() - (21*60*1000)));
        
        target.init()
          .then(() => target.init())
          .then(() => {
            expect(mockAxios.history.post.length).toEqual(2);
          })      
          .then(done)
          .catch(done.fail);
      });

      it('calls change handler with sessionId', (done)=> {
        const sessionId = "123";
        mockAxios.onPost(`${baseUri}/auth/sessions`).reply(200, { sessions: [{sessionId: sessionId}]})
          .onAny().reply(500);
        mockAxios.onGet(/.*/).reply(200, { });

        target.init().then(() => {
          expect(mockChangeHandler).toHaveBeenCalledWith({sessionId: sessionId});
        })      
        .then(done)
        .catch(done.fail);
      });

      it('calls get nodes', (done)=> {
        const sessionId = "123";
        mockAxios.onPost(`${baseUri}/auth/sessions`).reply(200, { sessions: [{sessionId: sessionId}]})
          .onAny().reply(500);
        mockAxios.onGet(/.*/).reply(200, { });

        target.init().then(() => {
          expect(mockAxios.history.get[0].url).toEqual(`${baseUri}/nodes`);
        })      
        .then(done)
        .catch(done.fail);
      });
    });

    describe('get', () => {
      beforeEach(()=>{
        target = new HiveService();        
      });

      it('passess session header', (done) => {
        const result = { sessions: [ { sessionId: 99 }]};
        mockAxios.onPost(`${baseUri}/auth/sessions`)
          .reply(200, { sessions: [{sessionId: '123'}]});

        mockAxios.onGet(/.*/).reply(200, )
        .onAny().reply(500);
      
        target.login(userName, password)
          .then(() => {
            return target.get('any');
          })
          .then(() => {
            let headers = mockAxios.history.get[0].headers; 
            expect(headers["X-Omnia-Access-Token"]).toBeTruthy();
          })      
          .then(done)
          .catch(done.fail);
      });

      it('calls passed uri', (done) => {
        const result = { sessions: [ { sessionId: 99 }]};
 
        mockAxios.onGet(`${baseUri}/test`).reply(200, {})
        .onAny().reply(500);
      
        target.get('/test')
          .then(() => {
            expect(mockAxios.history.get.length).toBe(1);
          })      
          .then(done)
          .catch(done.fail);
      });
    });

    describe('values', () => {
      const valueType = ValueType.percentage;
      const deviceId = 'dev1';
      const end = Date.now();
      const start = end - 60 * 60 * 1000;
      const rate = 5;
      const unit = Unit.hours;
      const operation = Operation.min;
      const channelParams = `${valueType}@${deviceId}?start=${start}&end=${end}&rate=${rate}&timeUnit=${unit}&operation=${operation}`;
  
      beforeEach(()=>{
        const sessionId = "123";
        mockAxios.onPost(`${baseUri}/auth/sessions`).reply(200, { sessions: [{sessionId: sessionId}]})
          .onAny().reply(500);     
      });
    
      describe('getValues', () => {
        it('calls expected url', (done)=> {
          mockAxios.onGet(/.*/).reply(200, { });
  
          const channelParams = `${valueType}@${deviceId}?start=${start}&end=${end}&rate=${rate}&timeUnit=${unit}&operation=${operation}`;
  
          target.getValues(valueType, deviceId, operation, start, end, rate, unit).then(() => {
            expect(mockAxios.history.get[0].url).toEqual(`${baseUri}/channels/${channelParams}`);
          })        
          .then(done)
          .catch(done.fail);
        });

        it('calls expected url', (done)=> {
          mockAxios.onGet(/.*/).reply(200, { });

          target.getValues(valueType, deviceId, operation, start, end, rate, unit).then(() => {
            expect(mockAxios.history.get[0].url).toEqual(`${baseUri}/channels/${channelParams}`);
          })        
          .then(done)
          .catch(done.fail);
        });

        it('returns data', (done)=> {
          mockAxios.onGet(/.*/).reply(200, {data: {}});

          target.getValues(valueType, deviceId, operation, start, end, rate, unit).then((data) => {
            expect(data).toBeDefined();
          })        
          .then(done)
          .catch(done.fail);
        });

        it('calls on change with state of correct type', (done)=> {
          mockAxios.onGet(/.*/).reply(200, { channels: [{}]});

          target.getValues(valueType, deviceId, operation, start, end, rate, unit).then(() => {
            let callParam = (mockChangeHandler as any).mock.calls[0][0];
            expect(callParam).toBeDefined();
            expect(callParam[valueType]).toBeDefined();
          })        
          .then(done)
          .catch(done.fail);
        });
      });
    });

    describe('getNodes', () => {
      beforeEach(()=>{
        const sessionId = "123";
        mockAxios.onPost(`${baseUri}/auth/sessions`).reply(200, { sessions: [{sessionId: sessionId}]})
          .onAny().reply(500);     
      });

      it('calls expected url', (done)=> {
        mockAxios.onGet(/.*/).reply(200, { });

        target.getNodes().then(() => {
          expect(mockAxios.history.get[0].url).toEqual(`${baseUri}/nodes`);
        })        
        .then(done)
        .catch(done.fail);
      });

      it('return entry for each node', (done)=> {
        const testData = { nodes : [
          {attributes: { nodeType : { reportedValue: NodeTypeIdentifiers.Hub}}},
          {attributes: { nodeType : { reportedValue: NodeTypeIdentifiers.Hub}}}
        ]};
        mockAxios.onGet(/.*/).reply(200, testData);

        target.getNodes().then((data) => {
          expect(data.length).toEqual(testData.nodes.length);
        })        
        .then(done)
        .catch(done.fail);
      });

      it('return entry for hub', (done)=> {
        const testData = { nodes : [
          {attributes: { nodeType : { reportedValue: NodeTypeIdentifiers.Hub}}}
        ]};
        mockAxios.onGet(/.*/).reply(200, testData);

        target.getNodes().then((data) => {
          expect(data[0].nodeType).toEqual(NodeType.hub);
        })        
        .then(done)
        .catch(done.fail);
      });

      it('return entry for thermostat', (done)=> {
        const testData = { nodes : [
          {attributes: { nodeType : { reportedValue: NodeTypeIdentifiers.Thermostat}}}
        ]};
        mockAxios.onGet(/.*/).reply(200, testData);

        target.getNodes().then((data) => {
          expect(data[0].nodeType).toEqual(NodeType.thermostat);
        })        
        .then(done)
        .catch(done.fail);
      });

      it('return entry for plug', (done)=> {
        const testData = { nodes : [
          {attributes: { nodeType : { reportedValue: NodeTypeIdentifiers.Plug}}}
        ]};
        mockAxios.onGet(/.*/).reply(200, testData);

        target.getNodes().then((data) => {
          expect(data[0].nodeType).toEqual(NodeType.plug);
        })        
        .then(done)
        .catch(done.fail);
      });

      it('return empty array for unknown items', (done)=> {
        const testData = { nodes : [
          {attributes: { nodeType : { reportedValue: "unknown"}}}
        ]};
        mockAxios.onGet(/.*/).reply(200, testData);

        target.getNodes().then((data) => {
          expect(data.length).toEqual(0);
        })        
        .then(done)
        .catch(done.fail);
      });

      it('fires on change handler', (done)=> {
        const testData = { nodes : [
          {attributes: { nodeType : { reportedValue: NodeTypeIdentifiers.Plug}}}
        ]};
        mockAxios.onGet(/.*/).reply(200, testData);

        target.getNodes().then(() => {
          expect(mockChangeHandler).toHaveBeenCalled();
        })        
        .then(done)
        .catch(done.fail);
      });
    });
  });

  describe('isInitialized', ()=> {
    it('isInitialized returns true if nodes populated', () => {
      target.state = { sessionId: 'ss', nodes: [ {} as any] } as any;

      expect(target.isInitialized).toBeTruthy()
    });

    it('isInitialized returns false if nodes not populated', () => {
      target.sessionId = 'set';
      target.state = { sessionId: 'ss', nodes: [] } as any;

      expect(target.isInitialized).toBeFalsy()
    });

    it('isInitialized returns false if session id not populated', () => {
      target.sessionId = undefined as any;
      target.state = { nodes: [] } as any;

      expect(target.isInitialized).toBeFalsy()
    });
  });
});