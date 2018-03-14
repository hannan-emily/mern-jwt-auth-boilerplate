import React, { Component } from 'react';
import Signup from './Signup';
import Login from './Login';
import UserProfile from './UserProfile';
import axios from 'axios';


class App extends Component {
  constructor(props) {
    super()
    this.state = {
      token: '',
      user: {}
    }
    this.liftTokenToState = this.liftTokenToState.bind(this)
    this.logout = this.logout.bind(this)
  }

  liftTokenToState = (data) => {
    this.setState({
      token: data.token,
      user: data.user
    })
  }

  logout() {
    console.log("logging out!")
    localStorage.removeItem('mernToken')
    this.setState({token: '', user: {}})
  }

  //this is where we put the life cycle hook to keep the user logged in
  //even when they hit refresh
  //adding localstorage for token?
  //we're passing in our current token from localStorage, and re-evaluating it
  // or checking for authorization on the axios.post route in else statement
  componentDidMount(){
    var token = localStorage.getItem('mernToken')
    if (token === 'undefined' || token === null || token === '' || token === undefined) {
      localStorage.removeItem('mernToken')
      this.setState({
        token: '',
        user: {}
      })
    } else {
      axios.post('/auth/me/from/token', {
        token: token
      }).then( result => {
        localStorage.setItem('mernToken', result.data.token)
        this.setState({
          token: result.data.token,
          user: result.data.user
        })
      }).catch( err => console.log(err) )
    }
  }

  render() {
    let user = this.state.user
    if (typeof user === 'object' && Object.keys(user).length > 0) {
      return (
        <div>
          <UserProfile user={user} logout={this.logout} />
        </div>
      )
    } else {
      return (
        <div className="App">
          <Signup liftToken={this.liftTokenToState} />
          <Login liftToken={this.liftTokenToState} />
        </div>
      )
    }
  }
}

export default App;
