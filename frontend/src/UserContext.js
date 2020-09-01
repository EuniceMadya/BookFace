import React from 'react';

export const UserContext = React.createContext({
  token: "default token",
  toggleToken: (token) => {},
  userId: 0,
  profilePic: "dummyPath",
  loggedIn: false,
  setLoggedIn: () => {},
});