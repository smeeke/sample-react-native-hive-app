/* React native helper component to display content centered on page  */

import React, { StatelessComponent } from 'react';
import {View, StyleSheet} from 'react-native';

interface CenteredViewProps {
  children?: any
}

const CenteredView: StatelessComponent<CenteredViewProps> = (props) => {
  return <View style={styles.container}>
    {props.children}
  </View>;
};

const styles = StyleSheet.create({
    container: {
      display:'flex',
      flexDirection: "row",
      alignItems: 'center',
      justifyContent:'space-around',
      marginTop: 15
    }
});
export default CenteredView;