import * as React from 'react'
import Auth from '../auth/Auth'
import { Button } from 'semantic-ui-react'

interface LogInProps {
  auth: Auth
}

interface LogInState {}

export class LogIn extends React.PureComponent<LogInProps, LogInState> {
  onLogin = () => {
    this.props.auth.login()
  }

  render() {
    const login = {
      fontFamily: "Sans-Serif"
    };

    return (
      <div style={login}>
        <h1>Log in to Feed</h1>

        <Button onClick={this.onLogin} size="huge" color="green" >
          Log in
        </Button>
      </div>
    )
  }
}
