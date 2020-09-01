import React, { useState, useEffect, useContext } from 'react';
import {
  BrowserRouter as Router, Switch, Route, Redirect,
} from 'react-router-dom';
import axios from 'axios';

// Import UI Components.
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import PersonOutlineIcon from '@material-ui/icons/PersonOutline';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ChatBubbleIcon from '@material-ui/icons/ChatBubble';
import MenuIcon from '@material-ui/icons/Menu';
import Grid from '@material-ui/core/Grid';
import AccountSettingView from './components/AccountSettingView';
import MeetingView from './components/MeetingView';
import DiscussionThreadsView from './components/DiscussionThreadsView';
import RegisterView from './components/RegisterView';
import DashboardView from './components/DashboardView';
import LoginView from './components/LoginView';
import ClubHomeView from './components/ClubHomeView';
import ClubDiscussionView from './components/ClubDiscussionView';
import PollView from './components/PollView';
import ClubAdminView from './components/ClubAdminView';
import ClubRedirect from './components/ClubRedirect';


import { UserContext } from './UserContext';

import domain from './api/domain';


function App() {
  // grab user dets from context
  const {
    token, toggleToken, loggedIn, setloggedIn, userId,
  } = useContext(UserContext);

  // States.
  const [toAccount, setToAccount] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openedWidth, setOpenedWidth] = useState(0);
  const [clubIndex, setClubIndex] = useState(0);
  const [clubs, setClubs] = useState([]);
  const [toClub, setToClub] = useState(false);
  const [viewName, setViewName] = useState('');
  const [updater, setUpdater] = useState(false);

  const getClubs = () => {
    const payload = {
      id: parseInt(userId, 10),
    };

    axios({
      url: `${domain}/Homepage/get_book_clubs`,
      method: 'post',
      data: payload,
      headers: { Authorization: `Token ${token}` },
    })
      .then((response) => {
        setClubs(response.data);
      });
  };

  const openMenu = () => {
    if (menuOpen) {
      setMenuOpen(false);
      setOpenedWidth(0);
      getClubs();
    } else {
      getClubs();
      setMenuOpen(true);
      setOpenedWidth(240);
    }
  };

  const setLoginState = (loggedInState) => {
    setloggedIn(loggedInState);
  };

  const logout = () => {
    // set the token back to it's default.
    toggleToken('default token');
    setLoginState(false);
    setOpenedWidth(0);
  };

  const disableRedirect = () => {
    setToAccount(false);
    setToClub(false);
  };

  useEffect(() => {
    disableRedirect();
    setUpdater(!updater);
  }, [toAccount, toClub]);

  const goToAccountView = () => {
    setToAccount(true);
  };

  const goToClub = (ID) => {
    setClubIndex(ID);
    setToClub(true);
    openMenu();
  };


  return (
    <div className="App">
      <CssBaseline />

      <div className="DrawerWrapper">
        {
          loggedIn && menuOpen ? (
            <div>
              <Drawer variant="permanent" anchor="left">
                <Typography style={{ width: openedWidth, height: 56 }} />
                <List style={{ width: openedWidth }}>
                  {clubs.map((club, index) => (
                    <ListItem button key={club.Name} onClick={() => goToClub(club.BookClub_ID)}>
                      <ListItemIcon>
                        {index % 2 === 0 ? <ChatBubbleIcon /> : <ChatBubbleIcon />}
                      </ListItemIcon>
                      <ListItemText primary={club.Name} />
                    </ListItem>
                  ))}
                </List>
              </Drawer>
            </div>
          )
            : <div />
        }

        <div className="AppBarWrapper">
          <AppBar position="fixed" style={{ paddingLeft: openedWidth }}>
            <Toolbar>
              <Grid container direction="row" justify="space-between" style={{ width: '100%' }}>
                <Grid item>
                  <Grid container direction="row" justify="flex-start" alignItems="center" spacing={2}>
                    <Grid item>
                      <IconButton edge="end" disabled={!loggedIn} onClick={openMenu} color="inherit" aria-label="menu">
                        <MenuIcon />
                      </IconButton>
                    </Grid>

                    <Grid item>
                      <Typography variant="h6" noWrap>
                        {viewName}
                      </Typography>
                    </Grid>

                  </Grid>
                </Grid>
                <Grid item>
                  <Grid container direction="row" justify="flex-end" alignItems="center" spacing={2}>
                    <Grid item>
                      {
                        loggedIn ? (
                          <div>
                            <Grid item>
                              <IconButton color="inherit" onClick={goToAccountView}>
                                <PersonOutlineIcon />
                              </IconButton>
                            </Grid>
                          </div>
                        )
                          : <div />
                      }
                    </Grid>

                    <Grid item>
                      {
                        loggedIn ? (
                          <Button color="inherit" onClick={logout}>
                          logout
                          </Button>
                        )
                          : <div />
                      }
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Toolbar>
          </AppBar>
        </div>

      </div>
      <div className="ViewWrapper" style={{ marginLeft: openedWidth, marginTop: 90 }}>
        <Router>

          { !loggedIn ? (<Redirect to="/login/" />) : <div /> }
          { toAccount ? (<Redirect to="/account_setting" />) : <div /> }
          { toClub ? (<Redirect to={`/redirect/${clubIndex}`} />) : <div /> }

          <Switch>
            <Route path="/account_setting">
              <AccountSettingView
                setLoginState={setLoginState}
                setViewName={setViewName}
                disableRedirect={disableRedirect}
              />
            </Route>

            <Route path="/club/:clubId/poll">
              <PollView setLoginState={setLoginState} setViewName={setViewName} />
            </Route>

            <Route path="/club/:clubId/meeting">
              <MeetingView setLoginState={setLoginState} setViewName={setViewName} />
            </Route>

            <Route path="/club/:clubId/discussion/:discuzId/:threadTitle">
              <DiscussionThreadsView setLoginState={setLoginState} setViewName={setViewName} />
            </Route>

            <Route path="/club/:clubId/discussion">
              <ClubDiscussionView setLoginState={setLoginState} setViewName={setViewName} />
            </Route>

            <Route path="/club/:clubId/admin">
              <ClubAdminView setLoginState={setLoginState} setViewName={setViewName} />
            </Route>

            <Route path="/redirect/:clubId">
              <ClubRedirect />
            </Route>

            <Route path="/club/:clubId">
              <ClubHomeView setLoginState={setLoginState} setViewName={setViewName} />
            </Route>

            <Route path="/login">
              <LoginView setLoginState={setLoginState} setViewName={setViewName} />
            </Route>

            <Route path="/register">
              <RegisterView setLoginState={setLoginState} setViewName={setViewName} />
            </Route>

            <Route path="/dashboard">
              <DashboardView setLoginState={setLoginState} setViewName={setViewName} />
            </Route>

            <Route path="/">
              <DashboardView setLoginState={setLoginState} setViewName={setViewName} />
            </Route>

          </Switch>
        </Router>
      </div>
    </div>
  );
}

export default App;
