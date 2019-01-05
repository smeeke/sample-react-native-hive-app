export interface IHiveSession {
  // Login info
  "id": string,
  "username": string,
  "userId": string,
  "extCustomerLevel": number,
  "latestSupportedApiVersion": number,
  "sessionId": string
}

export interface IHiveSessionResponse {
  // Data returned from a login
  "meta": {},
  "links": {},
  "linked": {},
  "sessions": IHiveSession[]
}

export enum NodeType {
  // Interesting node types
  hub = 'hub',
  thermostat = 'thermostat',
  plug = 'plug'
}

export interface IHiveNode {
  // Bare bones of data for each node
  id: string,
  href: string,
  name: string,
  parentNodeId: string,
  lastSeen: number,
  createdOn: number,
  attributes: {
    nodeType: {
      reportedValue: string
    }
  }
} 

export interface INode {
  // Shaped data representing node extracted from raw hive data.
  id: string,
  key: string,
  href: string,
  name: string,
  parentNodeId: string,
  lastSeen: number,
  createdOn: number,
  nodeType?: NodeType
} 

export const NodeTypeIdentifiers = {
  // Identifiers for nos within Hive data
  Hub: "http://alertme.com/schema/json/node.class.hub.json#",
  Thermostat: "http://alertme.com/schema/json/node.class.thermostat.json#",
  Plug: "http://alertme.com/schema/json/node.class.smartplug.json#"
}

export enum Unit {
  // Unit type for passing to data fetch query 
  milliseconds = 'MILLISECONDS',
  seconds = 'SECONDS',
  minutes = 'MINUTES',
  hours = 'HOURS',
  days = 'DAYS',
  weeks = 'WEEKS',
  months = 'MONTHS',
  years = 'YEARS'
}

export enum Operation {
  // Type of operation to be applied by Hive API to data retrieved
  min = 'MIN',
  max = 'MAX',
  average = 'AVG',
  dataset = 'DATASET'
}

export enum ValueType {
  // Which data set to retrieve fro node
  temperature = 'temperature', // actual temp
  targetTemperature = 'targettemperature', // target, or thermostat set temp
  percentage = 'signal', //Percentage of actual to target
  controllerState = 'controllerstate' // The on and off heating and hot watter 1 = heating, 2 = hot water
} 

export interface IHiveValueSet {
  // Shaped set of data from hive result
  id: string,
  href: string,
  start: number,
  end: number,
  timeUnit: Unit,
  rate: number,
  timeZone: string,
  unit: string,
  values: {
    [index:string]: number
  }
}
