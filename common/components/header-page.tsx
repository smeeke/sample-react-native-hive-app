/* React native helper component to header panel with title and conent filling remainer  */

import React, { FunctionComponent} from 'react';
import {View, StyleSheet} from 'react-native';
import { Appbar } from 'react-native-paper';
import { PAGE } from '../../style.constants';

interface IHeaderPage {
  title: string,
  subTitle?: string,
  chidren?:any
}

const HeaderPage: FunctionComponent<IHeaderPage> = ({children, title, subTitle}) => {
  return (
    <View style={styles.container}>
    <Appbar.Header style={styles.header}>
      <Appbar.Content title={title} subtitle={subTitle} />
    </Appbar.Header>
    <View style={styles.pageContent}>
      {children}
    </View>
  </View>);
};

const styles = StyleSheet.create({
  container: {
    flex:1,
  },
  header: {
    flex:0,
  },
  pageContent: {
    marginTop: 15,
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: PAGE.backgroundColor,
    padding: 15
  },
  userText: {
    fontSize: 18,
    marginBottom: 12
  }
});

export default HeaderPage;