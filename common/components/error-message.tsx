/* React native helper component to display an error message */

import React, { FunctionComponent} from 'react';
import { Text } from 'react-native';
import { withTheme, Theme} from 'react-native-paper';

interface ErrorMessageProps {
  title: string,
  theme: Theme
}

const ErrorMessage: FunctionComponent<ErrorMessageProps> = ({title, theme}) => {
  return <Text style={{color: theme.colors.error, marginBottom: 10}}>{title}</Text>;
};

export default withTheme(ErrorMessage);
