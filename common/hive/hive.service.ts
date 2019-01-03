import axios, { AxiosRequestConfig, AxiosPromise } from 'axios';
import { IHiveSessionResponse } from './hive-interfaces';
import CutOutCheck from './cut-out-check';
import { IHiveValueSet, ValueType, Operation, Unit, IHiveNode, INode, NodeType, NodeTypeIdentifiers } from './hive-interfaces'
import * as Keychain from 'react-native-keychain';

interface IServiceState {
  sessionId: string,
  nodes: INode[],
  [index: string] : IHiveValueSet | undefined | any
}

export default class HiveService {
  private baseUri = 'https://api-prod.bgchprod.info:443/omnia'; // Base Hive API url
  private baseHeaders = { // Headers passed with every v6 API
    "Content-Type" : "application/vnd.alertme.zoo-6.1+json",
    "Accept" : "application/vnd.alertme.zoo-6.1+json",
    "X-Omnia-Client": "Hive Web Dashboard"
  }

  public state: IServiceState = {
    sessionId: undefined as any, // Current login session identifier
    nodes: [] as any // List of nodes retrieved from the Hive APi. i.e. hub, thernostat etc
  }

  private _initialised: boolean = false;
  private onDataChangeHandlers: (({}) => void)[] = []; // Callbacks for each client interested in knowing when data has changed
  private loggedInAt?: Date; // The date the session identifier was obtained

  constructor() {
    this.buildNode = this.buildNode.bind(this);
    this.buildNodes = this.buildNodes.bind(this);
    this.getCutOutCheck = this.getCutOutCheck.bind(this);
    this.init = this.init.bind(this);
    this.readValues = this.readValues.bind(this);
    this.getValues = this.getValues.bind(this);
  }

  public registerChangeHandler(handler : ({}) => void) {
    // Keep a list of thos using the service that want notified when a change happens
    let existing = this.onDataChangeHandlers.find((v) => v == handler);
    if(existing) {
      return;
    }

    this.onDataChangeHandlers.push(handler);
  }

  public getNodeId(name: string): string {
    // Look up the the node name and return the id
    const { nodes } = this.state;
    const thermostat = nodes.find((n) => n.name === name);
    if(!thermostat || !thermostat.id) {
        return null as any;
    }

    return thermostat.id;
  }

  public unRegisterChangeHandler(handler : ({}) => void) {
    // Remove a ahandler 
    let existing = this.onDataChangeHandlers.findIndex((v) => v == handler);
    if(existing < 0) {
      return;
    }
    this.onDataChangeHandlers.splice(existing, 1);
  }

  public get sessionId(): string {
    return this.state.sessionId;
  }

  public set sessionId(value: string) {
    this.setState({sessionId: value});
  }

  login(userName: string, password: string) : Promise<string> {
    // Login into account using params passed to constructor
    let config : AxiosRequestConfig = { headers: this.baseHeaders };
    this.sessionId= undefined as any;
    return axios.post<IHiveSessionResponse>(`${this.baseUri}/auth/sessions`, {
            "sessions": [{"username": userName, "password": password, "caller": "WEB"}]
          }, config)
      .then((response) => {
        let sessions = response.data.sessions;

        if(response.data.sessions && response.data.sessions.length) {
          this.sessionId = sessions[0].sessionId;
        }

        return this.sessionId;
      })
  }

  get isInitialized(): boolean {
    return !!(this.sessionId && this.state.nodes && this.state.nodes.length);
  }

  async init() {

    let userDetails = (await Keychain.getGenericPassword()) as any;

    if(this._initialised) { // If already initialised just return
      if(Date.now() > this.expiresAt()) {
        this.loggedInAt = this.getTime();
        return this
          .login(userDetails.username, userDetails.password)
          .then(() => this.getNodes());
      }
      return Promise.resolve();
    }

    this.loggedInAt = this.getTime();
    
    return this.login(userDetails.username, userDetails.password)
      .then(() => this.getNodes())
      .then(() => this._initialised = true);
  }

  public currentNodes(): INode[] {
    return this.state.nodes || [];
  }

  public getNodes(changeHandler?: ({}) => void): Promise<INode[]> {
    // Retrieve the nodes for a login
    return this.get<{ nodes: IHiveNode[] }>('/nodes')
    .then((rawNodes) => {
      let nodeData = rawNodes.data.nodes as IHiveNode[];
      let res = nodeData ? nodeData.reduce(this.buildNodes, [] as INode[]) : [];

      this.setState({ nodes: res});
      return res;
    });
  }

  public async getCutOutCheck() : Promise<CutOutCheck> {
    // Reads the target and current temperatures for last 30 minutes and returns a cut out check object
    let end: number = Date.now();
    let start: number = end - (30 * 60 * 1000);
    let id: string = undefined as any;

    await this.init()
    id = await this.getNodeId('Thermostat');
    if(!id) {
      throw new Error('No device id found for thermostat');
    }
    let targets = await this.readValues(ValueType.targetTemperature, id, Operation.average, start, end, 15 );
    let actuals = await this.readValues(ValueType.temperature, id, Operation.average, start, end, 15 );
    
    return new CutOutCheck(targets,actuals);
  }

  public readValues(
    // Reads a set of values from the hive API
    valueType: ValueType,
    deviceId: string, 
    operation:Operation = Operation.average,
    start: number = Date.now() - (24 * 60 * 60 * 1000),
    end: number = Date.now(),
    rate: number = 30,
    unit: Unit = Unit.minutes) : Promise<IHiveValueSet> {
      // Read in the historic values for a device
      const channelParams = `${valueType}@${deviceId}?start=${start}&end=${end}&rate=${rate}&timeUnit=${unit}&operation=${operation}`;
      return this.get<IHiveValueSet>(`/channels/${channelParams}`)
        .then((rawData) => {
          let dataValues = rawData.data as any;
          if(dataValues && dataValues.channels && dataValues.channels.length) {
            return dataValues.channels[0];
          }

          return {};
        });
  }

  public getValues(
    valueType: ValueType,
    deviceId: string, 
    operation:Operation = Operation.average,
    start: number = Date.now() - (24 * 60 * 60 * 1000),
    end: number = Date.now(),
    rate: number = 30,
    unit: Unit = Unit.minutes) : Promise<IHiveValueSet> {
      // Read in the historic values for a device 
      return this.readValues(valueType, deviceId, operation, start, end, rate, unit)
        .then((dataValues) => {
          if(dataValues) { 
            // Record them in our local service state ANDnotify clients of change
            this.setState({ [valueType]: dataValues});
          }

          return dataValues;
        });
  }

  public get<T>(url : string) : AxiosPromise<T> {
    // Generic GET request helper
    const fullUrl = `${this.baseUri}${url}`;
    let config : AxiosRequestConfig = {      
      headers: {...this.baseHeaders, "X-Omnia-Access-Token": this.sessionId} // every call after login needs the sessions token header
    };

    return axios.get<T>(fullUrl, config);
  };

  public getTime() {
    // Helper to facilitate testing
    return new Date();
  }

  private expiresAt() : number {
    // Used to determine age of login sessions to facilitate re-login
    return this.loggedInAt ? this.loggedInAt.getTime() + 10*60*1000 : 0;
  }

  private buildNodes(accumulator: INode[], data: IHiveNode) : INode[] {
    // Build the nodes associated with this login
    let res: INode = undefined as any;

    if(data && data.attributes && data.attributes.nodeType) {
      switch(data.attributes.nodeType.reportedValue) {
        case NodeTypeIdentifiers.Hub:
          res = this.buildNode(data, NodeType.hub);
        break;

        case NodeTypeIdentifiers.Thermostat:
        res = this.buildNode(data, NodeType.thermostat);
        break;

        case NodeTypeIdentifiers.Plug:
          res = this.buildNode(data, NodeType.plug);
        break;
      }

      if(res) {
        accumulator.push(res);
      }
    }

    return accumulator;
  }

  private buildNode(data: IHiveNode, typeOfNode: NodeType) : INode {
    //Build an individual node by extracting key data from result 
    const res: INode = {
      id: data.id,
      key: data.id,
      href: data.href,
      name: data.name,
      parentNodeId: data.parentNodeId,
      lastSeen: data.lastSeen,
      createdOn: data.createdOn,
      nodeType: typeOfNode
    };

    return res;
  }

  private setState(stateChange : any) {
    // updates the state of this service
    this.state = {...this.state, ...stateChange};

    // Let each registered client know updated data is avaiable
    this.onDataChangeHandlers.forEach(callback => {
      callback(stateChange);
    });
  }
}
