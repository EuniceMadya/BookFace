import React, { useState, useEffect, useContext } from 'react';
import { Redirect, useParams } from 'react-router-dom';
import axios from 'axios';

import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Fab from '@material-ui/core/Fab';
import NavigationIcon from '@material-ui/icons/Navigation';
import Divider from '@material-ui/core/Divider';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardTimePicker } from '@material-ui/pickers';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import AddIcon from '@material-ui/icons/Add';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import CheckIcon from '@material-ui/icons/Check';
import Snackbar from '@material-ui/core/Snackbar';
import HomeIcon from '@material-ui/icons/Home';
import ForumIcon from '@material-ui/icons/Forum';
import PollIcon from '@material-ui/icons/Poll';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import SecurityIcon from '@material-ui/icons/Security';
import DashboardIcon from '@material-ui/icons/Dashboard';
import HistoryIcon from '@material-ui/icons/History';
import DonutLargeIcon from '@material-ui/icons/DonutLarge';


import getAdmin from '../api/getAdmin';
import domain from '../api/domain';

import { UserContext } from '../UserContext';

function MeetingView() {
  // Get param from url.
  const { clubId } = useParams();

  const { token, userId } = useContext(UserContext);

  const [meetings, setMeetings] = useState([[]]);

  const [snackBarOpened, setSnackBarOpened] = useState(false);
  const [snackBarDateOpened, setsnackBarDateOpened] = useState(false);
  const [snackBarLocationOpened, setsnackBarLocationOpened] = useState(false);

  const [pageIndex, setPageIndex] = useState(0);
  const [pages, setPages] = useState([]);

  const [isFuture, setFuture] = useState(true);

  const [newBook, setNewBook] = useState('');
  const [timeState, setTimeState] = useState(new Date());
  const [dateState, setDateState] = useState(new Date());
  const [newLocation, setNewLocation] = useState('');

  const [vpWidth, setVPWidth] = useState(window.innerWidth);

  const [dialogOpened, setDialogOpened] = useState(false);

  const [toDash, setToDash] = useState(false);
  const [toHome, setToHome] = useState(false);
  const [toDiscuss, setToDiscuss] = useState(false);
  const [toPoll, setToPoll] = useState(false);
  const [toAdmin, setToAdmin] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);

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
      width: ((vpWidth - 240) * 0.8 - 8 * 5 * 3) / 3,
    },
    attend: {
      background: 'linear-gradient(45deg, #ffe5d8 0%, #ffcad4 100%)',
      boxShadow: '0 3px 7px 1px rgba(255, 212, 213, .3)',
      width: 100,
    },
    going: {
      background: 'linear-gradient(45deg, #d3e7ee 0%, #abd1dc 100%)',
      boxShadow: '0 3px 7px 1px rgba(197, 223, 231, .3)',
      width: 100,
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
    addMeetingBtn: {
      margin: 0,
      top: 'auto',
      right: 20,
      bottom: 80,
      left: 'auto',
      position: 'fixed',
      background: 'linear-gradient(45deg, #ffe5d8 0%, #ffcad4 100%)',
      boxShadow: '0 3px 7px 1px rgba(255, 212, 213, .3)',
      color: 'black',
    },
  }));

  const loopPages = (array) => {
    const pageArray = [];
    for (let i = 0; i < array.length; i += 1) {
      pageArray[i] = (i + 1).toString();
    }
    setPages(pageArray);
  };

  const openSnackBar = () => {
    setSnackBarOpened(true);
  };

  const closeSnackBar = () => {
    setSnackBarOpened(false);
  };

  const snackBarDateOpenedFunc = () => {
    setsnackBarDateOpened(true);
  };


  const closeSnackBarDateFunc = () => {
    setsnackBarDateOpened(false);
  };

  const snackBarLocationOpenedFunc = () => {
    setsnackBarLocationOpened(true);
  };


  const closeSnackBarLocationFunc = () => {
    setsnackBarLocationOpened(false);
  };


  const dispMeetings = (meetingArray) => {
    const array = [];
    array.push([]);
    let outer = 0;
    let inner = 0;
    for (let i = 0; i < meetingArray.length; i += 1) {
      if (outer === 11) break;

      if (inner === 6) {
        outer += 1;
        inner = 0;
        array.push([]);
      }

      array[outer][inner] = meetingArray[i];
      const time = array[outer][inner].Time.split('T');
      const hours = time[1].split(':');
      const timeStamp = `${time[0]} ${hours[0]}:${hours[1]}`;
      array[outer][inner].TimeStamp = timeStamp;
      inner += 1;
    }

    loopPages(array);
    setMeetings(array);
  };

  // Style sheet.
  const classes = useStyles();

  const getMeetings = (time) => {
    const payload = {
      BookClub_ID: parseInt(clubId, 10),
      User_ID: userId,
    };

    axios({
      url: `${domain}/Homepage/get_${time}_meetings`,
      method: 'post',
      data: payload,
      headers: { Authorization: `Token ${token}` },
    })
      .then((response) => {
        dispMeetings(response.data);
      });
  };

  useEffect(() => {
    function handleResize() {
      setVPWidth(window.innerWidth);
    }

    getAdmin(clubId, userId, token, setIsAdmin);
    getMeetings('future');
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onNewBookChange = (e) => {
    setNewBook(e.target.value);
  };

  const onNewDateChange = (e) => {
    setDateState(e.target.value);
  };

  const onNewTimeChange = (e) => {
    setTimeState(e);
  };


  const onNewLocationChange = (e) => {
    setNewLocation(e.target.value);
  };


  const openDialog = () => {
    setDialogOpened(true);
  };

  const attendEvent = (meeting, attendance) => {
    const payload = {
      Meeting_ID: meeting.Meeting_ID,
      User_ID: userId,
    };

    axios({
      url: `${domain}/Homepage/${attendance}_meeting`,
      method: 'post',
      data: payload,
      headers: { Authorization: `Token ${token}` },
    })
      .then(() => {
        getMeetings('future');
      });
  };

  const closeDialog = () => {
    setDialogOpened(false);
    setNewBook('');
    setDateState(new Date());
    setTimeState(new Date());
    setNewLocation('');
  };


  const postMeeting = () => {
    if (newBook === '') {
      openSnackBar();
      return;
    }

    if (typeof dateState === 'object' || timeState === 'object') {
      snackBarDateOpenedFunc();
      return;
    }

    if (newLocation === '') {
      snackBarLocationOpenedFunc();
      return;
    }

    const newDate = dateState.split('-').reverse().join('-');
    const newTime = `${timeState.getHours().toString()}:${timeState.getMinutes().toString()}`;
    const payload = {
      BookClub_ID: parseInt(clubId, 10),
      User_ID: userId,
      Location: newLocation,
      Title: newBook,
      Time: `${newDate} ${newTime}`,
    };

    axios({
      url: `${domain}/Homepage/create_meeting`,
      method: 'post',
      data: payload,
      headers: { Authorization: `Token ${token}` },
    })
      .then(() => {
        getMeetings('future');
        setFuture(true);
      });

    closeDialog();
  };

  const toDashboardView = () => {
    setToDash(true);
  };

  const toHomeView = () => {
    setToHome(true);
  };

  const toDiscussView = () => {
    setToDiscuss(true);
  };

  const toPollView = () => {
    setToPoll(true);
  };

  const toAdminView = () => {
    setToAdmin(true);
  };

  const clickFuture = () => {
    getMeetings('future');
    setPageIndex(0);
    setFuture(true);
  };

  const clickPrev = () => {
    getMeetings('past');
    setPageIndex(0);
    setFuture(false);
  };

  const changeIndex = (index) => {
    setPageIndex(index);
  };

  const deleteMeeting = async (ID, time) => {
    const payload = {
      User_ID: parseInt(userId, 10),
      Meeting_ID: ID,
    };

    await axios({
      url: `${domain}/Homepage/delete_meeting`,
      method: 'post',
      data: payload,
      headers: { Authorization: `Token ${token}` },
    });

    await getMeetings(time);
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
                <Fab variant="extended" aria-label="delete" className={classes.fab} onClick={toHomeView}>
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
                <Fab variant="extended" aria-label="delete" className={classes.fab} style={{ background: 'linear-gradient(45deg, #ffe5d8 0%, #ffcad4 100%)', boxShadow: '0 3px 7px 1px rgba(255, 212, 213, .3)' }}>
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

          <Grid container direction="row" justify="space-evenly" alignItems="flex-end" style={{ marginTop: 40 }}>
            <Fab variant="extended" aria-label="delete" className={classes.fab} onClick={clickFuture} style={isFuture ? ({ background: 'linear-gradient(45deg, #ffe5d8 0%, #ffcad4 100%)', boxShadow: '0 3px 7px 1px rgba(255, 212, 213, .3)' }) : { color: 'default' }}>
              <DonutLargeIcon className={classes.extendedIcon} />
                Show Upcoming Meetings
            </Fab>
            <Fab variant="extended" aria-label="delete" className={classes.fab} onClick={clickPrev} style={!isFuture ? ({ background: 'linear-gradient(45deg, #ffe5d8 0%, #ffcad4 100%)', boxShadow: '0 3px 7px 1px rgba(255, 212, 213, .3)' }) : { color: 'default' }}>
              <HistoryIcon className={classes.extendedIcon} />
                Show Previous Meetings
            </Fab>
          </Grid>

          <Grid item>
            <Grid
              container
              direction="column"
              justify="flex-start"
              alignItems="flex-start"
              spacing={5}
              className={classes.content}
            >
              <Grid item>
                { isFuture ? <Typography variant="h3">Upcoming Meetings</Typography> : <Typography variant="h3">Previous Meetings</Typography>}
              </Grid>
              <Grid item>
                {
                  <Grid
                    container
                    direction="row"
                    justify="flex-start"
                    alignItems="center"
                    spacing={5}
                  >
                    {
                  meetings.length !== 0 && meetings[pageIndex].length !== 0 ? (
                    meetings[pageIndex].map((meeting, index) => {
                      return (
                        <Grid key={index} item>
                          <Paper className={classes.activityPaper}>
                            <Grid
                              container
                              direction="column"
                              justify="space-between"
                              alignItems="flex-start"
                              spacing={1}
                            >
                              <Grid item>
                                <Typography variant="h5">
                                  {meeting.Title}
                                </Typography>

                                <Typography variant="subtitle2">
                                  {meeting.TimeStamp}
                                </Typography>

                                <Typography variant="subtitle2">
                                  {`at ${meeting.Location}`}
                                </Typography>
                              </Grid>

                              <Grid
                                container
                                justify="space-between"
                              >

                                <Grid item>
                                  {
                                    isAdmin ? (
                                      <Button
                                        variant="contained"
                                        value={index}
                                        onClick={() => deleteMeeting(meeting.Meeting_ID, isFuture ? 'future' : 'past')}
                                      >
                                        Remove
                                      </Button>
                                    )
                                      : <div />
                                  }
                                </Grid>
                                <Grid item>
                                  {
                                    isFuture ? (
                                      <Grid item style={{ width: '100%' }}>
                                        <Grid container justify="flex-end">
                                          {
                                            meeting.user_attendance === 1 ? (
                                              <Button
                                                variant="contained"
                                                value={index}
                                                onClick={() => attendEvent(meeting, 'unattend')}
                                                className={classes.going}
                                              >
                                                <CheckIcon />
                                              </Button>
                                            ) : (
                                              <Button
                                                variant="contained"
                                                onClick={() => attendEvent(meeting, 'attend')}
                                                value={index}
                                                className={classes.attend}
                                              >
                                                Attend
                                              </Button>
                                            )
                                          }

                                        </Grid>
                                      </Grid>
                                    ) : (
                                      <Grid item style={{ width: '100%' }}>
                                        <Grid container justify="flex-end">
                                          {
                                            meeting.user_attendance === 1 ? (
                                              <Button variant="outlined" disabled>
                                                Attended
                                              </Button>
                                            ) : (
                                              <Button variant="outlined" disabled>
                                                Did not Attend
                                              </Button>
                                            )
                                          }
                                        </Grid>
                                      </Grid>
                                    )
                                }
                                </Grid>
                              </Grid>
                            </Grid>
                          </Paper>
                        </Grid>
                      );
                    })
                  )
                    : <div />
                }
                  </Grid>
                }
              </Grid>

              <Grid container direction="row" alignItems="flex-start" justify="center" spacing={3}>
                {pages.map((button, index) => (
                  <Grid item>
                    <Button variant="contained" color={pageIndex === index ? 'primary' : 'default'} onClick={() => changeIndex(index)}>
                      {button}
                    </Button>
                  </Grid>
                ))}
              </Grid>

            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Fab variant="extended" aria-label="Go Back" className={classes.goBackFab} onClick={toDashboardView}>
        <DashboardIcon className={classes.extendedIcon} />
        Dashboard
      </Fab>

      {
        isAdmin ? (
          <Fab color="primary" aria-label="add" className={classes.addMeetingBtn} onClick={openDialog}>
            <AddIcon />
          </Fab>
        )
          : <div />
      }
      <Dialog open={dialogOpened} onClose={closeDialog}>
        <DialogTitle>New Meeting</DialogTitle>
        <DialogContent style={{ width: 800 }}>
          <TextField
            margin="dense"
            label="Book"
            type="text"
            value={newBook}
            onChange={onNewBookChange}
            fullWidth
            style={{ width: 550 }}
          />
          <TextField
            id="date"
            label="Meeting Date"
            type="date"
            defaultValue="2019-10-22"
            value={dateState}
            onChange={onNewDateChange}
            InputLabelProps={{
              shrink: true,
            }}
            style={{ width: 550 }}
          />
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardTimePicker
              clearable
              id="time"
              ampm={false}
              label="Meeting Time"
              defaultValue="00:00"
              value={timeState}
              onChange={onNewTimeChange}
              KeyboardButtonProps={{
                'aria-label': 'change time',
              }}
            />
          </MuiPickersUtilsProvider>
          <TextField
            margin="dense"
            label="Location"
            type="text"
            value={newLocation}
            onChange={onNewLocationChange}
            fullWidth
            style={{ width: 550 }}
          />

        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={postMeeting} color="primary">
            Reply
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={snackBarOpened}
        onClose={closeSnackBar}
        message={<span>Please enter Book title!</span>}
      />
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={snackBarDateOpened}
        onClose={closeSnackBarDateFunc}
        message={<span>Please enter a date and time!</span>}
      />
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={snackBarLocationOpened}
        onClose={closeSnackBarLocationFunc}
        message={<span>Please enter a location!</span>}
      />

      { toDash ? (<Redirect to="/dashboard" />) : <div /> }
      { toHome ? (<Redirect to={`/club/${clubId}`} />) : <div /> }
      { toDiscuss ? (<Redirect to={`/club/${clubId}/discussion`} />) : <div /> }
      { toPoll ? (<Redirect to={`/club/${clubId}/poll`} />) : <div /> }
      { toAdmin && isAdmin ? (<Redirect to={`/club/${clubId}/admin`} />) : <div /> }
    </div>
  );
}


export default MeetingView;
