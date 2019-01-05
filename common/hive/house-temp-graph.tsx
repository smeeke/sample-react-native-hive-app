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

  key = 1;
  render() {
    const { consolidatedData, graphProps }  = this.props;
    const yMarginWidth = 25;
    let axesSvg = { fontSize: 10, fill: 'grey' };
    const verticalContentInset = { top: 0, bottom: 0};
    const yMin = 14;
    const yMax = 27;
    if(!consolidatedData) {
        return (<Text>Awaiting graph data</Text>)
    }

    // Horiziontal grid lines
    let GridLines = ({ x, y, data, ticks }:{ x:any, y:any, data:any, ticks:any}) => (
      <G >
        {
          ticks.map((tick:any) => (
            <Line 
              key={ tick }
              x1={ 0  }
              x2={ graphProps.width }
              y1={ y(tick) }
              y2={ y(tick) }
              stroke={ 'rgba(0,0,0,0.2)' }
            />
          ))
        }
      </G>
    )
    
    this.key = this.key + 1;

    return (
      // Surface is just a  drop shadowed box
      <Surface style={{ flex:1, padding: 15, elevation:5 }} onTouchEnd={() => this.forceUpdate()}>
        <View style={{display: 'flex', flex: 1, alignItems:'stretch'}}>
          <View style={{display: 'flex', flex: 1, flexDirection: 'row', alignItems:'stretch'}}>
            <YAxis key={this.key}
              min={yMin}
              max={yMax}
              numberOfTicks={6}
              data={consolidatedData}
              style={{ flex: 0, width: yMarginWidth }}
              contentInset={verticalContentInset}
              svg={axesSvg}
            />                
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
              style={ [StyleSheet.absoluteFill, {paddingLeft: yMarginWidth}] }
              data={ consolidatedData }
              svg={ {stroke: 'rgb(255, 65, 244)'} }
            ></MyLineChart>
          </View>
          <XAxis  key={this.key}
            style={{ flex:0, height: 10, paddingTop: 5, marginLeft: yMarginWidth - 5, marginRight: yMarginWidth / 2}}
            numberOfTicks={24}
            xAccessor={v => v.item.date}
            data={consolidatedData}
            contentInset={{ left: 0, right: 0 }}
            formatLabel={v => (new Date(v)).getHours()}
            svg={axesSvg}
          />
        </View>
        {/* <View style={{ flex: 1, marginLeft: 10 }}>


        </MyLineChart>
        </View>
 */}
      </Surface>
    )
  }
}

export default HouseTempGraph
