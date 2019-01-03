/* A react native component to render a graph of actul vs target temperature over time */
import React from 'react'
import { LineChart, YAxis, XAxis } from 'react-native-svg-charts'
import { View, Text} from 'react-native'
import { G, Line } from 'react-native-svg'
import {StyleSheet} from 'react-native';
import { DataItem } from '../screens/temperature-graph-screen'; 
import {Surface} from 'react-native-paper';

let MyLineChart = LineChart as any; //Type defs don't seem correct for LineChart

/* Conolidated data is two IHiveDataSets. One for target and one for actaul */
class HouseTempGraph extends React.PureComponent<{consolidatedData?: DataItem[], graphProps?: any}> {

  render() {
    const { consolidatedData }  = this.props;

    // Horiziontal grid lines
    const GridLines = ({ x, y, data, ticks }:{ x:any, y:any, data:any, ticks:any}) => (
      <G >
        {
          ticks.map((tick:any) => (
            <Line 
              key={ tick }
              x1={ '0%' }
              x2={ '100%' }
              y1={ y(tick) }
              y2={ y(tick) }
              stroke={ 'rgba(0,0,0,0.2)' }
            />
          ))
        }
      </G>
    )

    const axesSvg = { fontSize: 10, fill: 'grey' };
    const verticalContentInset = { top: 0, bottom: 0};
    const xAxisHeight = 0;
    const yMin = 14;
    const yMax = 27;
    if(!consolidatedData) {
        return (<Text>Awaiting graph data</Text>)
    }

    return (
      // Surface is just a  drop shadowed box
      <Surface style={{ padding: 20, elevation:5, ...this.props.graphProps }} onTouchEnd={() => this.forceUpdate()}>
        <YAxis
          min={yMin}
          max={yMax}
          numberOfTicks={8}
          data={consolidatedData}
          style={{ marginBottom: xAxisHeight}}
          contentInset={verticalContentInset}
          svg={axesSvg}
        />                
        <View style={{ flex: 1, marginLeft: 10 }}>

        <MyLineChart 
          yAccessor={(v: { index: number, item : DataItem}) => v.item.temperature}
          xAccessor={(v: { index: number, item : DataItem}) => v.item.date }
          style={ { flex: 1 } }
          data={ consolidatedData }
          yMax={yMax}
          yMin={yMin}
          svg={ {
              stroke: 'rgb(134, 65, 244)',
          } }
        >
        <GridLines x={0} y={0} data={[]} ticks={0} />
        </MyLineChart>
        <MyLineChart
          yMax={yMax}
          yMin={yMin}
          yAccessor={(v: { index: number, item : DataItem}) => v.item.targetTemperature}
          xAccessor={(v: { index: number, item : DataItem}) => v.item.date}
          style={ StyleSheet.absoluteFill }
          data={ consolidatedData }
          svg={ {stroke: 'rgb(255, 65, 244)'} }
        >
        </MyLineChart>
        </View>
        <XAxis
            style={{ position: "absolute", left: 7, right: 0, top: this.props.graphProps.height - 10, bottom: 0, zIndex:9} }
            numberOfTicks={12}
            xAccessor={v => v.item.date}
            data={consolidatedData}
            contentInset={{ left: 10, right: 10 }}
            formatLabel={v => (new Date(v)).getHours()}
            svg={axesSvg}
        />
      </Surface>
    )
  }
}

export default HouseTempGraph
