/* React native screen to display graph of target vs actual temperatures */
import * as React from 'react';
import {ActivityIndicator, StyleSheet, Text, View, Alert, Dimensions } from 'react-native';
import {withHiveSubscription} from '../hive';
import {ValueType, Operation, IHiveSessionResponse, IHiveValueSet} from '../hive/hive-interfaces';
import {IHiveSubscriptionState} from '../hive/withHiveSubscription';
import {HouseTempGraph} from '../hive';
import { tabBarIcon, HeaderPage, CenteredView} from '../components'
import { Button, withTheme, Theme } from 'react-native-paper';

export type DataItem = {
  date: Date,
  temperature: number, 
  targetTemperature: number
}

export interface ITemperatureGraphProps extends IHiveSubscriptionState{
  theme: Theme
}

export interface ITemperatureGraphState {
  temperaturesLoaded: boolean | undefined;
}

class TemperatureGraphScreen extends React.Component<ITemperatureGraphProps, ITemperatureGraphState> {
  constructor(props: ITemperatureGraphProps) {
    super(props);

    this.state = {
        temperaturesLoaded: undefined
    }

    this.refreshOnOrientationChange = this.refreshOnOrientationChange.bind(this);
  }

  static navigationOptions = {
    title: 'Graph',
    tabBarIcon: tabBarIcon('ios-pulse')
  };

  
  componentWillUnmount() {
    Dimensions.removeEventListener('change', this.refreshOnOrientationChange);
  }
  
  componentDidMount() {
    Dimensions.addEventListener('change', this.refreshOnOrientationChange)
    this.loadData();
  }

  refreshOnOrientationChange() {
    this.forceUpdate();
  }

  componentDidUpdate() {
    const { hive } = this.props;
    const { temperaturesLoaded } = this.state;

    if(hive.isInitialized && temperaturesLoaded === undefined) {
      this.loadData();
    }    

  }

  public render() {
    const {temperaturesLoaded} = this.state;
    const consolidatedData = this.buildConsolidatedData();
    let width = Dimensions.get('window').width;
    let height = Dimensions.get('window').height;
  
    return (
      <HeaderPage title="Temperature Graph">
        {
          temperaturesLoaded === false && <View>
            <ActivityIndicator size="large" color={this.props.theme.colors.accent} />
          </View>
        }
        {            
          temperaturesLoaded === true && <View style={styles.graphContainer}>
            <HouseTempGraph consolidatedData={consolidatedData} graphProps={ {height: height - 100, width: width - 30}}/>
            <CenteredView>
            <Button mode="outlined" onPress={() => this.reLoad()}>Reload</Button>
            </CenteredView>
          </View>
        }
      </HeaderPage>
    );
  }

  private loadData() {
    const { hive } = this.props;

    // Flag so we won't try and do another reload while in progress
    this.setState({temperaturesLoaded : false});

    // Calculate our data range values
    const end = new Date();
    const start = this.getStartDate(end, 48);
    const interval = 30;

    // Read in the data for the range
    hive.init()
      .then(()=>{
        let id = hive.getNodeId('Thermostat');
        hive.getValues(ValueType.targetTemperature, id, Operation.average, start, end.valueOf(), interval )
          .then(() => hive.getValues(ValueType.temperature, id, Operation.average, start, end.valueOf(), interval ))
          .then(() => {
            this.setState({temperaturesLoaded : true });
          })
          .catch((err)=>{
            Alert.alert('Error loading data', `Failed to load all data values from hive: ${err.toString()}`, [
                {text: 'Try again', onPress: () => this.setState({temperaturesLoaded: undefined})},
                {text: 'Cancel', style: 'cancel'}
              ], {cancelable: true}
            );
          });
      });
  }

  private getStartDate(end: Date, numberOfHours: number) {
    end.setMilliseconds(0);
    end.setSeconds(0);
    end.setMinutes(end.getMinutes() - (end.getMinutes() % 15));
    let start = end.valueOf() - (numberOfHours * 60 * 60 * 1000);
    return start;
  }

  private reLoad() {
    // Clear our loaded flag to trigger an update
    this.setState( { temperaturesLoaded: undefined});
  }

  private buildConsolidatedData() {
    // pull out our state and build a list of value by time
    const {
      [ValueType.temperature]: temperatures,
      [ValueType.targetTemperature]: targetTemperatures
    } = this.props;

    if(!temperatures || !targetTemperatures) {
      return;
    }

    let data: DataItem[] = [];
    let keys = Object.keys(temperatures.values);
    keys.forEach(key => {
      let item = {
          date: new Date(parseInt(key)),
          temperature: temperatures.values[key],
          targetTemperature: targetTemperatures.values[key]
      }
      data.push(item);
    });

    return data;
  }

  private mapItems(data: IHiveValueSet): {date:Date, value: any, key: string}[] {
    if(!data || !data.values) {
      return [];
    }
    let items = Object.keys(data.values).map(v => {
      return { date: new Date(parseInt(v)), value: data.values[v], "key": v };
    });

    return items;
  }
}

const styles = StyleSheet.create({
  graphContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: 'stretch',
    justifyContent: 'space-evenly'
  },
  graph: {
      flex: 0,
      flexDirection: "row",
      alignItems: 'stretch',
      padding: 0
    }
});

export default withTheme(withHiveSubscription()(TemperatureGraphScreen) as any);
