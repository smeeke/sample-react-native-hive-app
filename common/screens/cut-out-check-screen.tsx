/* React native screen to display if heating has cut out and basic data values */
import React, {Component} from 'react';
import { tabBarIcon, HeaderPage, CenteredView } from '../components';
import { CutOutCheck, withHiveSubscription } from '../hive';
import { Alert, ActivityIndicator, StyleSheet, View } from 'react-native';
import { IHiveSubscriptionState} from '../hive/withHiveSubscription';
import { Button, withTheme, Theme, Text, DataTable } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';

export interface CutOutCheckScreenProps extends IHiveSubscriptionState {
  theme: Theme
}

export interface CutOutCheckScreenState {
  loading: boolean,
  cutOutCheck: CutOutCheck | undefined 
}

class CutOutCheckScreen extends Component<CutOutCheckScreenProps, CutOutCheckScreenState> {
  static navigationOptions = {
    title: 'Cutout Check',
    tabBarIcon: tabBarIcon('ios-thermometer')
  };

  constructor(props: CutOutCheckScreenProps) {
    super(props);

    this.state = {
      loading: false,
      cutOutCheck: undefined
    }

    this.loadData = this.loadData.bind(this);
  }

  componentDidMount() {
    const { hive } = this.props;
    this.loadData();
  }

  public render() {
    const { loading, cutOutCheck } = this.state;
    const { theme } = this.props;

    return (
      <HeaderPage title="Cutout Check">
        { loading && <ActivityIndicator size="large" color={theme.colors.accent }/>}
        { cutOutCheck && cutOutCheck.hasCutOut && <Text style={{color: theme.colors.error, fontSize: 25, marginBottom:15}}>Check for cutout</Text>}

        { cutOutCheck && <DataTable style={styles.table}>
            <DataTable.Header>
              <DataTable.Title>Target</DataTable.Title>
              <DataTable.Title>Actual</DataTable.Title>
              <DataTable.Title>Diff</DataTable.Title>
              <DataTable.Title>Per Hour</DataTable.Title>
              <DataTable.Title style={styles.cell}>Status</DataTable.Title>

            </DataTable.Header>

            <DataTable.Row style={styles.tableRow}>
              <DataTable.Cell >{cutOutCheck.targetTemp.toFixed(2)}</DataTable.Cell>
              <DataTable.Cell >{cutOutCheck.actualTemp.toFixed(2)}</DataTable.Cell>
              <DataTable.Cell >{cutOutCheck.tempDifference.toFixed(2)}</DataTable.Cell>
              <DataTable.Cell >{(cutOutCheck.tempGradiantPerMinute * 60).toFixed(2)}</DataTable.Cell>
              <DataTable.Cell style={styles.cell}>{cutOutCheck.hasCutOut ? <Icon name="exclamation" style={{color: theme.colors.error, fontSize: 25}}/> 
                : <Icon name="heart" style={{color: '#00EE00'}}/> 
               }</DataTable.Cell>
            </DataTable.Row>
          </DataTable>}

        <CenteredView>
        { !loading && <Button mode="outlined" onPress={this.loadData}>Reload</Button> }
        </CenteredView>
      </HeaderPage>
    );
  }

  private loadData() {
    const { hive } = this.props;

    this.setState({loading : true});
      hive.getCutOutCheck()
      .then((cutout)=>{
        this.setState({cutOutCheck : cutout, loading: false });
      })          
      .catch((err)=>{
        this.setState({cutOutCheck : undefined, loading: false });
        Alert.alert('Error loading data', `Failed to load all data values from hive: ${err.toString()}`, [
            {text: 'Try again', onPress: () => this.loadData()},
            {text: 'Cancel', style: 'cancel' }
          ], {cancelable: true}
        );
      });
  }
}

const styles = StyleSheet.create({
  tableRow: {
    height: 40
  },
  cell: {
    justifyContent: 'center'
  },
  table: {
    marginTop: 30,
    marginBottom: 30
  }
});
export default withTheme(withHiveSubscription()(CutOutCheckScreen) as any);