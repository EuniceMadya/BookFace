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
import Snackbar from '@material-ui/core/Snackbar';
import HomeIcon from '@material-ui/icons/Home';
import ForumIcon from '@material-ui/icons/Forum';
import PollIcon from '@material-ui/icons/Poll';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import SecurityIcon from '@material-ui/icons/Security';
import DashboardIcon from '@material-ui/icons/Dashboard';


import getAdmin from '../api/getAdmin';
import domain from '../api/domain';

import { UserContext } from '../UserContext';


function ClubDiscussionView(props) {
  // Get param from url.
  const { clubId } = useParams();

  const { token, userId } = useContext(UserContext);
  const [snackBarOpened, setSnackBarOpened] = useState(false);


  const [vpWidth, setVPWidth] = useState(window.innerWidth);
  const [dialogOpened, setDialogOpened] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [toDash, setToDash] = useState(false);
  const [toHome, setToHome] = useState(false);
  const [toPoll, setToPoll] = useState(false);
  const [toMeeting, setToMeeting] = useState(false);
  const [pages, setPages] = useState([]);
  const [discussions, setDiscussions] = useState([[]]);
  const [pageIndex, setPageIndex] = useState(0);
  const [discussID, setDiscussID] = useState(0);
  const [toThreads, setToThreads] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [toAdmin, setToAdmin] = useState(false);
  const [updater, setUpdater] = useState(false);
  const [title, setTitle] = useState("");

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
      background: 'white',
      '&:hover': {
        background: '#eeeeee',
      },
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
    addDiscussion: {
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


  // Style sheet.
  const classes = useStyles();


  useEffect(() => {
    function handleResize() {
      setVPWidth(window.innerWidth);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const openSnackBar = () => {
    setSnackBarOpened(true);
  };


  const closeSnackBar = () => {
    setSnackBarOpened(false);
  };


  const getClubName = async () => {
    const payload = {
      BookClub_ID: parseInt(clubId, 10),
    };

    // Load Club Name
    const response = await axios({
      url: `${domain}/Homepage/get_single_bookclub`,
      method: 'post',
      data: payload,
      headers: { Authorization: `Token ${token}` },
    });

    props.setViewName(response.data.Name);
  };

  const loopPages = (array) => {
    const pageArray = [];
    for (let i = 0; i < array.length; i += 1) {
      pageArray[i] = (i + 1).toString();
    }
    setPages(pageArray);
  };

  const dispDiscussions = async (clubArray) => {
    const newDiscussions = [];
    newDiscussions.push([]);

    let outer = 0;
    let inner = 0;

    for (let i = 0; i < clubArray.length; i += 1) {
      if (outer === 11) break;

      if (inner === 4) {
        outer += 1;
        inner = 0;
        newDiscussions.push([]);
      }

      newDiscussions[outer][inner] = clubArray[i];
      const time = newDiscussions[outer][inner].Time.split('T');
      const hours = time[1].split(':');
      const timeStamp = `${time[0]} ${hours[0]}:${hours[1]}`;
      newDiscussions[outer][inner].TimeStamp = timeStamp;

      newDiscussions[outer][inner].content = '';

      const response = await axios({
        url: `${domain}/Homepage/get_discussion_threads`,
        method: 'post',
        data: {
          Discussion_ID: parseInt(newDiscussions[outer][inner].Discussion_ID, 10),
        },
        headers: { Authorization: `Token ${token}` },
      });

      if (response.data.Threads.length > 1) {
        newDiscussions[outer][inner].content = response.data.Threads[0].Content;
      }

      inner += 1;
    }

    loopPages(newDiscussions);
    setDiscussions(newDiscussions);
  };


  const getDiscussions = async () => {
    const payload = {
      BookClub_ID: parseInt(clubId, 10),
    };

    const response = await axios({
      url: `${domain}/Homepage/get_discussions`,
      method: 'post',
      data: payload,
      headers: { Authorization: `Token ${token}` },
    });

    await dispDiscussions(response.data);
  };


  // Life Cycle Hook. Executed when the view is mounted.
  useEffect(() => {
    const fetch = async () => {
      await getClubName();
      await getAdmin(clubId, userId, token, setIsAdmin);
      await getDiscussions();
    };

    fetch();
  }, []);

  const openDialog = () => {
    setDialogOpened(true);
  };

  const closeDialog = () => {
    setDialogOpened(false);
    setNewContent('');
    setNewTitle('');
  };

  const postDiscussion = async () => {
    if (newTitle === '') {
      openSnackBar();
      return;
    }
    if (newContent === '') {
      openSnackBar();
      return;
    }

    const payload = {
      Title: newTitle,
      BookClub_ID: parseInt(clubId, 10),
      User_ID: userId,
      Content: newContent,
    };

    await axios({
      url: `${domain}/Homepage/post_discussion`,
      method: 'post',
      data: payload,
      headers: { Authorization: `Token ${token}` },
    })
      .then(() => {
        getDiscussions();
      });

    closeDialog();
  };

  const onNewContentChange = (e) => {
    setNewContent(e.target.value);
  };

  const onNewTitleChange = (e) => {
    setNewTitle(e.target.value);
  };

  const toDashboardView = () => {
    setToDash(true);
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

  const goToDiscussThreadView = (ID, threadTitle) => {
    setDiscussID(ID);
    setTitle(threadTitle);
    setToThreads(true);
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
                <Fab variant="extended" aria-label="delete" className={classes.fab} style={{ background: 'linear-gradient(45deg, #ffe5d8 0%, #ffcad4 100%)', boxShadow: '0 3px 7px 1px rgba(255, 212, 213, .3)' }}>
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
                    <Typography variant="h3">Discussion</Typography>
                  </Grid>

                  {
                    discussions[pageIndex].map((discussion) => (
                      <Grid item className={classes.content}>
                        <Paper className={classes.activityPaper}>
                          <Grid
                            container
                            direction="row"
                            justify="space-between"
                            alignItems="center"
                            onClick={() => goToDiscussThreadView(discussion.Discussion_ID, discussion.Title)}
                          >

                            <Grid item>
                              <Typography variant="h6">
                                {discussion.Title}
                              </Typography>
                            </Grid>

                            <Grid item>
                              <Grid item>
                                <Typography variant="p">
                                  Author:
                                  {' '}
                                  {discussion.User_ID.username}
                                </Typography>
                              </Grid>

                              <Grid item>
                                <Typography variant="p">
                                  Date Posted:
                                  {' '}
                                  {discussion.TimeStamp}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Grid>
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

      <Fab color="primary" aria-label="add" className={classes.addDiscussion} onClick={openDialog}>
        <AddIcon />
      </Fab>

      <Fab variant="extended" aria-label="Go Back" className={classes.goBackFab} onClick={toDashboardView}>
        <DashboardIcon className={classes.extendedIcon} />
        Dashboard
      </Fab>

      <Dialog open={dialogOpened} onClose={closeDialog}>
        <DialogTitle>New Discussion</DialogTitle>
        <DialogContent style={{ width: 800 }}>
          <TextField
            margin="dense"
            label="Title"
            type="text"
            value={newTitle}
            onChange={onNewTitleChange}
            fullWidth
            style={{ width: 550 }}
          />

          <TextField
            label="Description"
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
          <Button onClick={postDiscussion} color="primary">
            Post
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={snackBarOpened}
        onClose={closeSnackBar}
        message={<span>Empty Title or Description!</span>}
      />
      { toDash ? (<Redirect to="/dashboard" />) : <div /> }
      { toHome ? (<Redirect to={`/club/${clubId}`} />) : <div /> }
      { toPoll ? (<Redirect to={`/club/${clubId}/poll`} />) : <div /> }
      { toMeeting ? (<Redirect to={`/club/${clubId}/meeting`} />) : <div /> }
      { toThreads ? (<Redirect to={`/club/${clubId}/discussion/${discussID}/${title}`} />) : <div /> }
      { toAdmin && isAdmin ? (<Redirect to={`/club/${clubId}/admin`} />) : <div /> }
    </div>
  );
}


export default ClubDiscussionView;
