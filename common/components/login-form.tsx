/* React native helper component to display a login form  */
import React from 'react';
import { View, StyleSheet } from 'react-native'
import { ErrorMessage } from '.';
import { TextInput, Button } from 'react-native-paper';
import { CenteredView } from './';
enum fields {
  userName = 'userName',
  password = 'password'
};

interface ValidatedTextInputProps {
  name: string,
  onChange: (name: string, value: string) => void,
  required?: boolean
}

const ValidatedTextInput: React.SFC<ValidatedTextInputProps> = (props) => {
  return <TextInput />;
};

export interface ILoginResult {
  userName: string;
  password: string;
}

export interface LoginFormState extends ILoginResult {
  userNameError?: string;
  passwordError?: string;
  showError: boolean;
}

export interface LoginFormProps {
  onSubmit: (res: ILoginResult) => void;
}

export default class LoginForm extends React.Component<LoginFormProps, LoginFormState> {
  constructor(props: LoginFormProps) {
    super(props);

    this.state = {
      userName: '',
      password: '',
      showError: false
    }

    this.fieldChange = this.fieldChange.bind(this);
    this.submit = this.submit.bind(this);
  }

  public render() {
    return (
        <View>
          <TextInput autoFocus key="userName" label="user name"  value={this.state.userName} onChangeText={(v) => this.fieldChange({userName:v})} />
          {this.state.showError == true && !this.state.userName && <ErrorMessage title="User name is required" />}

          <TextInput secureTextEntry={true} key="password" label="password"  value={this.state.password} onChangeText={(v) => this.fieldChange({password:v})} />
          {this.state.showError == true && !this.state.password && <ErrorMessage title="Password is required" />}

          <CenteredView>
            <Button key="submit" mode='contained' onPress={this.submit}>Login</Button>
          </CenteredView>
        </View>)
  }

  fieldChange(stateChange: any) {
    this.setState(stateChange);
  }

  submit() {
    if(!this.state.userName  || !this.state.password) {
      this.setState({showError: true});
      return;
    }

    this.props.onSubmit( {
      userName: this.state.userName,
      password: this.state.password
    });
  }
}


