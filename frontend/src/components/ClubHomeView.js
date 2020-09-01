import React, { useState, useEffect, useContext } from 'react';
import { Redirect, useParams, withRouter } from 'react-router-dom';
import axios from 'axios';


import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Fab from '@material-ui/core/Fab';
import NavigationIcon from '@material-ui/icons/Navigation';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Snackbar from '@material-ui/core/Snackbar';
import HomeIcon from '@material-ui/icons/Home';
import ForumIcon from '@material-ui/icons/Forum';
import PollIcon from '@material-ui/icons/Poll';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import SecurityIcon from '@material-ui/icons/Security';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import AddCircleIcon from '@material-ui/icons/AddCircle';

import getAdmin from '../api/getAdmin';
import domain from '../api/domain';

import { UserContext } from '../UserContext';

function ClubHomeView(props) {
  // Get param from url.
  const { clubId } = useParams();

  const { token, userId } = useContext(UserContext);

  const [titles, setTitles] = useState([]);
  const [activities, setActivities] = useState([]);

  const [vpWidth, setVPWidth] = useState(window.innerWidth);

  const [toDash, setToDash] = useState(false);
  const [toDiscuss, setToDiscuss] = useState(false);
  const [toPoll, setToPoll] = useState(false);
  const [toMeeting, setToMeeting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [toAdmin, setToAdmin] = useState(false);

  const [clubName, setClubName] = useState('');
  const [useClubId, setUseClubName] = useState(clubId);
  const [isOpen, setIsOpen] = useState(false);


  const [inClub, setInClub] = useState(false);

  const [picture, setPicture] = useState('https://fun-group-bucket.s3-ap-southeast-2.amazonaws.com/blank-profile-picture.png');

  const [snackBarOpened, setSnackBarOpened] = useState(false);

  const useStyles = makeStyles((theme) => ({
    fab: {
      margin: theme.spacing(1),
    },
    extendedIcon: {
      marginRight: theme.spacing(1),
    },
    clubHomeView: {
      paddingTop: 20,
    },
    forumLogo: {
      width: 150,
      height: 150,
    },
    content: {
      width: (vpWidth - 240) * 0.8,
    },
    activityPaper: {
      padding: theme.spacing(3, 2),
    },
    goBackFab: {
      margin: 0,
      top: 'auto',
      right: 20,
      bottom: 20,
      left: 'auto',
      position: 'fixed',
      background: 'linear-gradient(45deg, #ffe5d8 0%, #ffcad4 100%)',
      boxShadow: '0 3px 7px 1px rgba(255, 212, 213, .3)',
    },
  }));


  // Style sheet.
  const classes = useStyles();


  useEffect(() => {
    function handleResize() {
      setVPWidth(window.innerWidth);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetch = async () => {
      const payload = {
        BookClub_ID: parseInt(clubId, 10),
      };

      let response = await axios({
        url: `${domain}/Homepage/get_discussions`,
        method: 'post',
        data: payload,
        headers: { Authorization: `Token ${token}` },
      });

      const rawDiscussions = response.data;

      response = await axios({
        url: `${domain}/Homepage/get_current_polls`,
        method: 'post',
        data: payload,
        headers: { Authorization: `Token ${token}` },
      });

      const rawPolls = response.data;
      const newTitles = [];
      const newActivities = [];

      for (let i = 0; i < Math.min(5, rawDiscussions.length); i += 1) {
        newTitles.push(`New Discussion: ${rawDiscussions[i].Title}`);
        newActivities.push(`Posted by ${rawDiscussions[i].User_ID.username}`);
      }

      for (let i = 0; i < Math.min(5, rawPolls.length); i += 1) {
        newTitles.push(`New Poll: ${rawPolls[i].Title}`);
        newActivities.push(`Ending by ${rawPolls[i].End_Time}`);
      }

      setTitles(newTitles);
      setActivities(newActivities);
    };

    fetch();
  }, []);

  const getClubName = () => {
    const payload = {
      BookClub_ID: parseInt(clubId, 10),
    };

    axios({
      url: `${domain}/Homepage/get_single_bookclub`,
      method: 'post',
      data: payload,
      headers: { Authorization: `Token ${token}` },
    })
      .then((response) => {
        props.setViewName(response.data.Name);
        setPicture(response.data.Profile_Pic);
        setClubName(response.data.Name);
        setIsOpen(response.data.Open)
      });
  };

  const isInClub = () => {
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
        for (let i = 0; i < response.data.length; i += 1) {
          if (response.data[i].BookClub_ID === parseInt(clubId, 10)) {
            setInClub(true);
            break;
          }
        }
      });
  };

  // Life Cycle Hook. Executed when the view is mounted.
  useEffect(() => {
    getClubName();
    isInClub();
    getAdmin(clubId, userId, token, setIsAdmin);
  }, []);

  const toDashboardView = () => {
    setToDash(true);
  };

  const toDiscussView = () => {
    setToDiscuss(true);
  };

  const toPollView = () => {
    setToPoll(true);
  };

  const toMeetingView = () => {
    setToMeeting(true);
  };

  const toAdminView = () => {
    setToAdmin(true);
  };

  const openSnackBar = () => {
    setSnackBarOpened(true);
  };

  const joinClub = () => {
    const payload = {
      BookClub_ID: parseInt(clubId, 10),
      User_ID: userId,
    };

    axios({
      url: `${domain}/Homepage/join_book_club`,
      method: 'post',
      data: payload,
      headers: { Authorization: `Token ${token}` },
    })
      .then(() => {
        isInClub();
      })
      .catch(() => {
        openSnackBar();
      });
  };

  const leaveClub = () => {
    const payload = {
      BookClub_ID: parseInt(clubId, 10),
      User_ID: userId,
    };

    axios({
      url: `${domain}/Homepage/leave_club`,
      method: 'post',
      data: payload,
      headers: { Authorization: `Token ${token}` },
    })
      .then(() => {
        isInClub();
      })
      .catch(() => {
        openSnackBar();
      });

    toDashboardView();
  };

  const closeSnackBar = () => {
    setSnackBarOpened(false);
  };

  return (
    <div className={classes.clubHomeView}>
      <Grid
        container
        direction="column"
        justify="center"
        alignItems="center"
      >
        <Grid
          container
          direction="column"
          justify="center"
          alignItems="center"
          spacing={10}
          className={classes.content}
        >
          <Grid item>
            <Grid
              container
              direction="row"
              justify="space-between"
              alignItems="center"
              spacing={5}
              className={classes.content}
            >
              <Grid item>
                <Fab variant="extended" aria-label="delete" className={classes.fab} style={{ background: 'linear-gradient(45deg, #ffe5d8 0%, #ffcad4 100%)', boxShadow: '0 3px 7px 1px rgba(255, 212, 213, .3)' }}>
                  <HomeIcon className={classes.extendedIcon} />
                  Home
                </Fab>
              </Grid>

              <Grid item>
                <Fab variant="extended" aria-label="delete" className={classes.fab} onClick={toDiscussView}>
                  <ForumIcon className={classes.extendedIcon} />
                  Discussion
                </Fab>
              </Grid>

              <Grid item>
                <Fab variant="extended" aria-label="delete" className={classes.fab} onClick={toPollView}>
                  <PollIcon className={classes.extendedIcon} />
                  Poll
                </Fab>
              </Grid>

              <Grid item>
                <Fab variant="extended" aria-label="delete" className={classes.fab} onClick={toMeetingView}>
                  <PeopleAltIcon className={classes.extendedIcon} />
                  Meeting
                </Fab>
              </Grid>

              {isAdmin ? (
                <Grid item>
                  <Fab variant="extended" aria-label="delete" className={classes.fab} onClick={toAdminView}>
                    <SecurityIcon className={classes.extendedIcon} />
                    Admin
                  </Fab>
                </Grid>
              ) : (<></>)}
            </Grid>
          </Grid>

          <Divider className={classes.content} />

          <Grid item>
            <Grid
              container
              direction="row"
              justify="space-between"
              alignItems="flex-start"
              spacing={2}
              className={classes.content}
            >
              <Grid item>
                <Grid
                  container
                  direction="row"
                  justify="flex-start"
                  alignItems="flex-start"
                  spacing={2}
                  className={classes.content}
                >
                  <Grid item>
                    <img src={picture} className={classes.forumLogo} />
                  </Grid>

                  <Grid item>
                    <Typography variant="h3">
                      Welcome to
                      {' '}
                      {clubName}
                      !
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item>
                {
                  !inClub && isOpen ? (
                    <Fab variant="extended" aria-label="delete" className={classes.fab} onClick={joinClub} style={{ background: 'linear-gradient(45deg, #ffe5d8 0%, #ffcad4 100%)', boxShadow: '0 3px 7px 1px rgba(255, 212, 213, .3)' }}>
                      <AddCircleIcon className={classes.extendedIcon} />
                      Join club!
                    </Fab>
                  )
                    : (
                      inClub ? (
                      <Fab variant="outlined" aria-label="delete" onClick={leaveClub}>
                        <ExitToAppIcon className={classes.extendedIcon} />
                        Leave club!
                      </Fab>
                      )
                        : <div />
                    )
                }
              </Grid>

            </Grid>
          </Grid>

          <Divider className={classes.content} />

          <Grid item>
            <Grid
              container
              direction="row"
              justify="flex-start"
              alignItems="flex-start"
              spacing={2}
              className={classes.content}
            >
              <Grid item>
                <Grid
                  container
                  direction="column"
                  justify="flex-start"
                  alignItems="flex-start"
                  spacing={3}
                >
                  <Grid item>
                    <Typography variant="h3">Activities</Typography>
                  </Grid>

                  {
                    titles.map((title, index) => (
                      <Grid item className={classes.content}>
                        <Paper className={classes.activityPaper}>
                          <Typography variant="h6">
                            {title}
                          </Typography>
                          <Typography component="p">
                            {activities[index]}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))
                  }
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Fab variant="extended" aria-label="Go Back" className={classes.goBackFab} onClick={toDashboardView}>
        <DashboardIcon className={classes.extendedIcon} />
        Dashboard
      </Fab>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        open={snackBarOpened}
        onClose={closeSnackBar}
        message={<span>Sorry, this club is closed to new members!</span>}
      />
      { toDash ? (<Redirect to="/dashboard" />) : <div /> }
      { toDiscuss ? (<Redirect to={`/club/${clubId}/discussion`} />) : <div /> }
      { toPoll ? (<Redirect to={`/club/${clubId}/poll`} />) : <div /> }
      { toMeeting ? (<Redirect to={`/club/${clubId}/meeting`} />) : <div /> }
      { toAdmin && isAdmin ? (<Redirect to={`/club/${clubId}/admin`} />) : <div /> }
      { clubId !== useClubId ? (<Redirect to={`/club/${clubId}`} />) : <div /> }
    </div>
  );
}


export default withRouter(ClubHomeView);
