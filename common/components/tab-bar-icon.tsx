/* React native helper function to return an icon by name */
import React, {FunctionComponent} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface ITabBarIconProps {
  tintColor: string
}

export default function tabBarIcon(name: string) : FunctionComponent<ITabBarIconProps> {
  const TabBarIcon : FunctionComponent<ITabBarIconProps> = (props) => {
   return (<Ionicons name={name} color={props.tintColor} size={25} />)
  };
  
  return  TabBarIcon;
}


