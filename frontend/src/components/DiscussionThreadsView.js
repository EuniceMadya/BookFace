import React, { useState, useEffect, useContext } from 'react';
import { Redirect, useParams } from 'react-router-dom';
import axios from 'axios';

import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Fab from '@material-ui/core/Fab';
import NavigationIcon from '@material-ui/icons/Navigation';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import AddIcon from '@material-ui/icons/Add';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import Snackbar from '@material-ui/core/Snackbar';
import HomeIcon from '@material-ui/icons/Home';
import ForumIcon from '@material-ui/icons/Forum';
import PollIcon from '@material-ui/icons/Poll';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import SecurityIcon from '@material-ui/icons/Security';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';


import getAdmin from '../api/getAdmin';
import domain from '../api/domain';

import { UserContext } from '../UserContext';

function DiscussionThreadsView(props) {
  // Get param from url.
  const { clubId, discuzId, threadTitle } = useParams();

  const { token, userId } = useContext(UserContext);

  const [newContent, setNewContent] = useState('');

  const [vpWidth, setVPWidth] = useState(window.innerWidth);

  const [dialogOpened, setDialogOpened] = useState(false);

  const [snackBarOpened, setSnackBarOpened] = useState(false);

  const [toDiscuss, setToDiscuss] = useState(false);
  const [toHome, setToHome] = useState(false);
  const [toPoll, setToPoll] = useState(false);
  const [toMeeting, setToMeeting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [toAdmin, setToAdmin] = useState(false);

  const [threads, setThreads] = useState([[]]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pages, setPages] = useState([]);

  const [picture, setPicture] = useState('https://fun-group-bucket.s3-ap-southeast-2.amazonaws.com/blank-profile-picture.png');

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
    addComment: {
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
    deleteDiscuz: {
      margin: 0,
      top: 'auto',
      right: 'auto',
      bottom: 20,
      left: 20,
      position: 'fixed',
    },
  }));


  // Style sheet.
  const classes = useStyles();

  const openSnackBar = () => {
    setSnackBarOpened(true);
  };


  const closeSnackBar = () => {
    setSnackBarOpened(false);
  };


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
        props.setViewName(response.data.Name)
      });
  };

  const getUserName = () => {
    const payload = {
      User_ID: userId,
    };

    axios({
      url: `${domain}/Homepage/get_user`,
      method: 'post',
      data: payload,
      headers: { Authorization: `Token ${token}` },
    })
      .then((response) => {
        setPicture(response.data.profile_pic);
      });
  };

  useEffect(() => {
    function handleResize() {
      setVPWidth(window.innerWidth);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    getUserName();
    getClubName();
  }, []);

  const loopPages = (array) => {
    const pageArray = [];
    for (let i = 0; i < array.length; i += 1) {
      pageArray[i] = (i + 1).toString();
    }
    setPages(pageArray);
  };

  const dispThreads = (threadArray) => {
    const array = [];
    array.push([]);
    let outer = 0;
    let inner = 0;
    for (let i = 0; i < threadArray.length; i += 1) {
      if (outer === 11) break;

      if (inner === 5) {
        outer += 1;
        inner = 0;
        array.push([]);
      }

      array[outer][inner] = threadArray[i];
      const time = array[outer][inner].Time.split('T');
      const hours = time[1].split(':');
      const timeStamp = `${time[0]} ${hours[0]}:${hours[1]}`;
      array[outer][inner].TimeStamp = timeStamp;
      inner += 1;
    }

    loopPages(array);
    setThreads(array);
  };

  const getThreads = () => {
    const payload = {
      Discussion_ID: parseInt(discuzId, 10),
    };

    axios({
      url: `${domain}/Homepage/get_discussion_threads`,
      method: 'post',
      data: payload,
      headers: { Authorization: `Token ${token}` },
    })
      .then((response) => {
        dispThreads(response.data.Threads);
      });
  };

  // Life Cycle Hook. Executed when the view is mounted.
  useEffect(() => {
    getAdmin(clubId, userId, token, setIsAdmin);
    getThreads();
  }, []);


  const onNewContentChange = (e) => {
    setNewContent(e.target.value);
  };

  const openDialog = () => {
    setDialogOpened(true);
  };


  const closeDialog = () => {
    setDialogOpened(false);
    setNewContent('');
  };

  const postComment = () => {
    if (newContent === '') {
      openSnackBar();
      return;
    }
    const payload = {
      User_ID: parseInt(userId, 10),
      Discussion_ID: parseInt(discuzId, 10),
      Content: newContent,
    };

    axios({
      url: `${domain}/Homepage/post_reply`,
      method: 'post',
      data: payload,
      headers: { Authorization: `Token ${token}` },
    })
      .then(() => {
        getThreads();
      });

    closeDialog();
  };

  const toDiscussView = () => {
    setToDiscuss(true);
  };

  const toHomeView = () => {
    setToHome(true);
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

  const changeIndex = (index) => {
    setPageIndex(index);
  };

  const deleteDiscussion = async () => {
    const payload = {
      User_ID: parseInt(userId, 10),
      Discussion_ID: discuzId,
    };

    await axios({
      url: `${domain}/Homepage/delete_discussion`,
      method: 'post',
      data: payload,
      headers: { Authorization: `Token ${token}` },
    });

    await setToDiscuss(true);
  };

  const deleteThread = async (ID) => {
    const payload = {
      User_ID: parseInt(userId, 10),
      Thread_ID: ID,
    };

    await axios({
      url: `${domain}/Homepage/delete_thread`,
      method: 'post',
      data: payload,
      headers: { Authorization: `Token ${token}` },
    });

    await getThreads();
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
                <Fab variant="extended" aria-label="delete" className={classes.fab} style={{ background: 'linear-gradient(45deg, #ffe5d8 0%, #ffcad4 100%)', boxShadow: '0 3px 7px 1px rgba(255, 212, 213, .3)' }} onClick={toDiscussView}>
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

          {
            isAdmin ? (
              <Fab variant="extended" aria-label="delete" className={classes.deleteDiscuz} onClick={deleteDiscussion}>
                <HighlightOffIcon className={classes.extendedIcon} />
              Delete Discussion
              </Fab>
            )
              : <div />
          }

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

                  {
                  threads[pageIndex].map((thread, index) => (
                    <Grid item className={classes.content}>
                      <Paper className={classes.activityPaper}>
                        {
                          index === 0 && pageIndex === 0 ? (
                            <div>
                              <Avatar alt="profile pic" src={picture} style={{ marginBottom: 20 }} />

                              <Typography variant="h3">
                                {threadTitle}
                              </Typography>

                              <Typography variant="subtitle1" style={{ marginBottom: 20 }}>
                                {' '}
                              Originally Posted by
                                {' '}
                                {thread.User_ID.username}
                                {' '}
                                at
                                {' '}
                                {thread.TimeStamp}
                              </Typography>
                              <Typography variant="p">{thread.Content}</Typography>
                            </div>
                          )
                            : (
                              <Grid
                                container
                                direction="row"
                                justify="space-between"
                                alignItems="center"
                              >

                                <Grid item>
                                  <Grid
                                    container
                                    direction="column"
                                    justify="space-between"
                                    alignItems="flex-start"
                                    spacing={1}
                                  >
                                    <Grid item>
                                      <Avatar alt="profile pic" src={thread.User_ID.profile_pic} style={{ marginBottom: 20 }} />
                                    </Grid>

                                    <Grid item>
                                      <Typography variant="p">
                                        {thread.Content}
                                      </Typography>
                                    </Grid>

                                    <Grid item>
                                      <Grid item>
                                        <Typography variant="p">
                                          Author:
                                          {' '}
                                          {thread.User_ID.username}
                                        </Typography>
                                      </Grid>

                                      <Grid item>
                                        <Typography variant="p">
                                          Date Posted:
                                          {' '}
                                          {thread.TimeStamp}
                                        </Typography>
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                </Grid>
                                <Grid item>
                                  {
                                    isAdmin ? (
                                      <Fab variant="extended" aria-label="delete" className={classes.fab} onClick={() => deleteThread(thread.Thread_ID)}>
                                        <HighlightOffIcon className={classes.extendedIcon} />
                                        Remove
                                      </Fab>
                                    )
                                      : <div />
                                  }
                                </Grid>
                              </Grid>
                            )
                        }
                      </Paper>
                    </Grid>
                  ))
                }

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
        </Grid>
      </Grid>

      <Fab variant="extended" aria-label="Go Back" className={classes.goBackFab} onClick={toDiscussView}>
        <ArrowBackIosIcon className={classes.extendedIcon} />
        Go Back
      </Fab>

      <Fab color="primary" aria-label="add" className={classes.addComment} onClick={openDialog}>
        <AddIcon />
      </Fab>

      <Dialog open={dialogOpened} onClose={closeDialog}>
        <DialogTitle>Reply</DialogTitle>
        <DialogContent style={{ width: 800 }}>
          <TextField
            label="Reply"
            multiline
            rows="7"
            margin="normal"
            variant="outlined"
            style={{ width: 550 }}
            value={newContent}
            onChange={onNewContentChange}
            fullWidth
          />

        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={postComment} color="primary">
            Reply
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={snackBarOpened}
        onClose={closeSnackBar}
        message={<span>Empty Reply!</span>}
      />
      { toHome ? (<Redirect to={`/club/${clubId}`} />) : <div /> }
      { toDiscuss ? (<Redirect to={`/club/${clubId}/discussion`} />) : <div /> }
      { toPoll ? (<Redirect to={`/club/${clubId}/poll`} />) : <div /> }
      { toMeeting ? (<Redirect to={`/club/${clubId}/meeting`} />) : <div /> }
      { toAdmin && isAdmin ? (<Redirect to={`/club/${clubId}/admin`} />) : <div /> }
    </div>
  );
}


export default DiscussionThreadsView;
