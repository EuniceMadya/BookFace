
import React, { useState, useEffect } from 'react';

import { UserContext } from './UserContext';
import App from './App'

class MainApp extends React.Component {
  constructor(props) {
    super(props);

    this.toggleToken = (data) => {
      this.setState(state => ({
        token : data.token,
        userId: data.id,
      }));
    };

    this.setloggedIn = (value) => {
      this.setState(state => ({
        loggedIn: value
      }));
    }

    this.state = {
      token: "default token",
      toggleToken: this.toggleToken,
      loggedIn: false,
      userId: 0,
      setloggedIn: this.setloggedIn
    };
  }

  render() {
    return (
      <UserContext.Provider value={this.state}>
        <App />
      </UserContext.Provider>
    );
  }
}

export default MainApp;

