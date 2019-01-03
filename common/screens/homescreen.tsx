/* React native screen to display basic node information */

import React, {Component, ReactElement} from 'react';
import {Platform, StyleSheet, Text, ScrollView} from 'react-native';

import { tabBarIcon, HeaderPage } from '../components';
import { NavigationScreenProps } from 'react-navigation';
import { withHiveSubscription, HiveService } from '../hive';
import { INode } from '../hive/hive-interfaces';
import { DataTable } from 'react-native-paper';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

interface Props extends NavigationScreenProps {
  hive: HiveService
}

interface State { nodes: INode[]}

export class HomeScreen extends Component<Props, State> {
  static navigationOptions = {
    title: 'Home',
    tabBarIcon: tabBarIcon('ios-home')
  };

  constructor(props: Props)  {
    super(props);
    this.state = {
      nodes: []
    }
  }

  componentDidMount() {
    const { hive } = this.props;
    hive.init()
    .then(_ => hive.getNodes())
    .then(nodes => this.setState({nodes}));
  }

  render() {
    return (
      <HeaderPage title="Home">
        <Text style={styles.welcome}>Welcome to home Hive app</Text>
        <ScrollView style={styles.scroll}>
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>Name</DataTable.Title>
            <DataTable.Title>Type</DataTable.Title>
            <DataTable.Title>Last seen</DataTable.Title>
          </DataTable.Header>

          { this.renderNodeRows(this.state.nodes)}
          </DataTable>
        </ScrollView>
      </HeaderPage>
    );
  }

  renderNodeRows(nodes: INode[]): ReactElement<any>[] {
    var res: ReactElement<any>[] = [];
    nodes.forEach(node => {
      res.push(
      <DataTable.Row key={node.id} style={styles.tableRow}>
        <DataTable.Cell>{node.name}</DataTable.Cell>
        <DataTable.Cell>{node.nodeType}</DataTable.Cell>
        <DataTable.Cell>{new Date(node.lastSeen).toLocaleDateString()}</DataTable.Cell>
      </DataTable.Row>
      )
    });
  
    return res;
  }
}


const styles = StyleSheet.create({
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  tableRow: {
    height: 30
  },
  scroll: {
    flex: 1,
    height: 100
  }
});

export default withHiveSubscription()(HomeScreen);