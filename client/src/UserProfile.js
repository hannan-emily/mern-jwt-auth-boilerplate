import React from 'react';
import axios from 'axios';

const UserProfile = props => {
  return (
    <div>
      <p>Hello, {props.user.name}!</p>
      <button onClick={props.logout}>Logout!</button>
    </div>
  )
}

export default UserProfile;
