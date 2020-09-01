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
import Checkbox from '@material-ui/core/Checkbox';
import Snackbar from '@material-ui/core/Snackbar';
import HomeIcon from '@material-ui/icons/Home';
import ForumIcon from '@material-ui/icons/Forum';
import PollIcon from '@material-ui/icons/Poll';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import SecurityIcon from '@material-ui/icons/Security';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import DashboardIcon from '@material-ui/icons/Dashboard';
import HistoryIcon from '@material-ui/icons/History';
import DonutLargeIcon from '@material-ui/icons/DonutLarge';

import getAdmin from '../api/getAdmin';
import domain from '../api/domain';

import { UserContext } from '../UserContext';


function PollView() {
  // Get param from url.
  const { clubId } = useParams();

  const { token, userId } = useContext(UserContext);

  const [polls, setPolls] = useState({ Polls: [[]], Options: [[]] });
  const [snackBarOpened, setSnackBarOpened] = useState(false);
  const [snackBarDateOpened, setsnackBarDateOpened] = useState(false);
  const[snackBarChoiceOpened, setsnackBarChoiceOpened] = useState(false);
  // Somehow react doesn't recognise the update on "attendings", this is used to update rendering.
  const [updater, setUpdater] = useState(false);

  const [newPolls, setNewPolls] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newOption, setNewOption] = useState('');
  const [dateState, setDateState] = useState(new Date());
  const [vpWidth, setVPWidth] = useState(window.innerWidth);

  const [dialogOpened, setDialogOpened] = useState(false);

  const [toDash, setToDash] = useState(false);
  const [toHome, setToHome] = useState(false);
  const [toDiscuss, setToDiscuss] = useState(false);
  const [toMeeting, setToMeeting] = useState(false);

  const [pageIndex, setPageIndex] = useState(0);
  const [pages, setPages] = useState([]);

  const [isCurrent, setCurrent] = useState(true);
  const [isPrev, setPrev] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);
  const [toAdmin, setToAdmin] = useState(false);

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
    attend: {
      background: 'linear-gradient(45deg, #ffe5d8 0%, #ffcad4 100%)',
      boxShadow: '0 3px 7px 1px rgba(255, 212, 213, .3)',
      width: 100,
    },
    activityPaper: {
      padding: theme.spacing(3, 2),
    },
    going: {
      background: 'linear-gradient(45deg, #ffe5d8 0%, #ffcad4 100%)',
      boxShadow: '0 3px 7px 1px rgba(255, 212, 213, .3)',
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

  // Style sheet.
  const classes = useStyles();

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

  const openSnackBarChoice = () => {
    setsnackBarChoiceOpened(true);
  }

  const closeSnackBarChoice = () => {
    setsnackBarChoiceOpened(false);
  }

  const loopPages = (array) => {
    const pageArray = [];
    for (let i = 0; i < array.length; i += 1) {
      pageArray[i] = (i + 1).toString();
    }
    setPages(pageArray);
  };

  const getOptions = (pArray, pollArray) => {
    const array = [];
    let index = 0;

    for (let i = 0; i < pArray.length; i += 1) {
      array.push([]);
      for (let j = 0; j < 4; j += 1) {
        if (index >= pollArray.length) break;
        array[i].push([]);

        const poll = pollArray[index].Poll_ID;
        index += 1;

        const payload = {
          Poll_ID: parseInt(poll, 10),
          User_ID: userId,
        };

        axios({
          url: `${domain}/Homepage/get_poll_info`,
          method: 'post',
          data: payload,
          headers: { Authorization: `Token ${token}` },
        })
          .then((response) => {
            for (let k = 0; k < response.data.length; k += 1) {
              array[i][j][k] = response.data[k];
              array[i][j][k].Checked = array[i][j][k].user_vote !== 0;
            }
          });
      }
      setUpdater(!updater);
    }
    setPolls({ Polls: pArray, Options: array });
  };

  const dispPolls = (pollArray) => {
    const array = [];
    array.push([]);
    let outer = 0;
    let inner = 0;
    for (let i = 0; i < pollArray.length; i += 1) {
      if (outer === 11) break;

      if (inner === 4) {
        outer += 1;
        inner = 0;
        array.push([]);
      }

      pollArray[i].showOptions = false;
      array[outer][inner] = pollArray[i];
      inner += 1;
    }

    loopPages(array);
    getOptions(array, pollArray);
  };

  const getPolls = (time) => {
    const payload = {
      BookClub_ID: parseInt(clubId, 10),
    };

    axios({
      url: `${domain}/Homepage/get_${time}_polls`,
      method: 'post',
      data: payload,
      headers: { Authorization: `Token ${token}` },
    })
      .then((response) => {
        dispPolls(response.data);
      });
  };

  useEffect(() => {
    function handleResize() {
      setVPWidth(window.innerWidth);
    }

    getAdmin(clubId, userId, token, setIsAdmin);
    getPolls('current');
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onNewTitleChange = (e) => {
    setNewTitle(e.target.value);
  };

  const onNewOptionChange = (e) => {
    setNewOption(e.target.value);
  };

  const onNewDateChange = (e) => {
    setDateState(e.target.value);
  };

  const onAddOptionChange = () => {
    const dupNewPolls = newPolls;
    dupNewPolls.push(newOption);

    setNewPolls(dupNewPolls);
    setNewOption('');
    setUpdater(!updater);
  };

  const votePoll = (poll, option) => {
    const payload = {
      Poll_ID: poll.Poll_ID,
      Choice_ID: option.Choice_ID,
      User_ID: userId,
    };

    axios({
      url: `${domain}/Homepage/vote_poll`,
      method: 'post',
      data: payload,
      headers: { Authorization: `Token ${token}` },
    })
      .then(() => {
        getPolls('current');
      });
  };

  const submitPoll = (poll, options) => {
    const payload = {
      User_ID: userId,
      Poll_ID: poll.Poll_ID,
    };

    axios({
      url: `${domain}/Homepage/delete_vote`,
      method: 'post',
      data: payload,
      headers: { Authorization: `Token ${token}` },
    })
      .then(() => {
        let noneChecked = true;
        for (let i = 0; i < options.length; i += 1) {
          if (options[i].Checked) {
            noneChecked = false;
            votePoll(poll, options[i]);
          }
        }
        if (noneChecked) getPolls('current');
      });
  };

  const onSelectChange = (option) => {
    option.Checked = !option.Checked;
    setUpdater(!updater);
  };


  const openDialog = () => {
    setDialogOpened(true);
  };


  const closeDialog = () => {
    setDialogOpened(false);
    setNewTitle('');
    setNewOption('');
    setDateState(new Date());
    setNewPolls([]);
  };

  const postPolls = () => {

    if (newTitle === '') {
      openSnackBar();
      return;
    }

    if (typeof dateState === 'object') {
      snackBarDateOpenedFunc();
      return;
    }
    if (newPolls.length < 2) {
      openSnackBar();
      return;
    }
    let i;
    for (i = 0; i < newPolls.length; i += 1 ) {
      if(newPolls[i] === '') {
        openSnackBarChoice();
        return;
      }
    }


    const newDate = dateState.split('-').reverse().join('-');
    const payload = {
      BookClub_ID: parseInt(clubId, 10),
      User_ID: userId,
      Time: `${newDate} 00:00:00`,
      Title: newTitle,
      Choices: newPolls,
    };

    axios({
      url: `${domain}/Homepage/create_poll`,
      method: 'post',
      data: payload,
      headers: { Authorization: `Token ${token}` },
    })
      .then(() => {
        getPolls('current');
        setCurrent(true);
        setPrev(false);
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

  const toMeetingView = () => {
    setToMeeting(true);
  };

  const toAdminView = () => {
    setToAdmin(true);
  };

  const clickCurrent = () => {
    setUpdater(!updater);
    setPrev(false);
    getPolls('current');
    setPageIndex(0);
    setCurrent(true);
  };

  const clickPrev = () => {
    setCurrent(false);
    getPolls('past');
    setPageIndex(0);
    setPrev(true);
  };

  const changeIndex = (index) => {
    setPageIndex(index);
  };

  const showOptions = (poll) => {
    poll.showOptions = !poll.showOptions;
    setUpdater(!updater);
  };

  const deletePoll = async (ID, time) => {
    const payload = {
      User_ID: parseInt(userId, 10),
      Poll_ID: ID,
    };

    await axios({
      url: `${domain}/Homepage/delete_poll`,
      method: 'post',
      data: payload,
      headers: { Authorization: `Token ${token}` },
    });

    await getPolls(time);
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
              spacing={1}
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
                <Fab variant="extended" aria-label="delete" className={classes.fab} style={{ background: 'linear-gradient(45deg, #ffe5d8 0%, #ffcad4 100%)', boxShadow: '0 3px 7px 1px rgba(255, 212, 213, .3)' }}>
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

              <Grid item style={{ marginTop: 30 }}>
                <Divider className={classes.content} />
              </Grid>

            </Grid>
          </Grid>

          <Grid container direction="row" justify="space-evenly" alignItems="flex-end" spacing="15vh">
            <Fab variant="extended" aria-label="delete" className={classes.fab} onClick={clickCurrent} style={isCurrent ? ({ background: 'linear-gradient(45deg, #ffe5d8 0%, #ffcad4 100%)', boxShadow: '0 3px 7px 1px rgba(255, 212, 213, .3)' }) : { color: 'default' }}>
              <DonutLargeIcon className={classes.extendedIcon} />
                View Current Polls
            </Fab>
            <Fab variant="extended" aria-label="delete" className={classes.fab} onClick={clickPrev} style={isPrev ? ({ background: 'linear-gradient(45deg, #ffe5d8 0%, #ffcad4 100%)', boxShadow: '0 3px 7px 1px rgba(255, 212, 213, .3)' }) : { color: 'default' }}>
              <HistoryIcon className={classes.extendedIcon} />
                View Previous Polls
            </Fab>
          </Grid>

          <Grid item>
            <Grid
              container
              direction="column"
              justify="flex-start"
              alignItems="flex-start"
              spacing={3}
            >

              {
                (isCurrent || isPrev) ? (
                  <Grid
                    container
                    direction="column"
                    justify="flex-start"
                    alignItems="flex-start"
                    spacing={3}
                  >
                    <Grid item>
                      {
                        isCurrent ? (<Typography variant="h3">Active Polls</Typography>) : (<Typography variant="h3">Previous Polls</Typography>)
                      }
                    </Grid>
                    {
                  polls.Polls[pageIndex].map((poll, index) => (
                    <Grid item className={classes.content}>
                      <Paper className={classes.activityPaper}>
                        <Grid container direction="row" justify="space-between" alignItems="flex-start">
                          <Grid item>
                            <Grid
                              container
                              direction="column"
                              justify="space-between"
                              alignItems="flex-start"
                              spacing={1}
                            >
                              <Grid item>
                                <Typography variant="h5">
                                  {poll.Title}
                                </Typography>
                              </Grid>

                              <Grid item>
                                <Typography variant="subtitle1">
                                  {isCurrent ? `Ends on ${poll.End_Time}` : `Ended on ${poll.End_Time}`}
                                </Typography>
                              </Grid>

                              <Grid item>
                                <Grid item>
                                  <Grid
                                    container
                                    direction="column"
                                    justify="center"
                                    alignItems="flex-start"
                                  >

                                    <Grid
                                      container
                                      direction="row"
                                      justify="space-between"
                                      alignItems="center"
                                      spacing={10}
                                    >
                                      <Grid item>
                                        {
                                      polls.Options[pageIndex].length !== 0 && poll.showOptions ? (
                                        polls.Options[pageIndex][index].map((option, pIndex) => (

                                          <Grid item>
                                            {
                                            isCurrent ? (
                                              <Grid item>
                                                <Checkbox
                                                  checked={option.Checked}
                                                  value={[index, pIndex]}
                                                  onClick={() => onSelectChange(option)}
                                                  color="primary"
                                                  inputProps={{
                                                    'aria-label': 'secondary checkbox',
                                                  }}
                                                />
                                                <Typography variant="p">
                                                  {option.Description}
                                                </Typography>
                                              </Grid>
                                            )
                                              : (
                                                <Grid item>
                                                  <Typography variant="p">
                                                    {`${option.Description}: ${option.vote_count} votes`}
                                                  </Typography>
                                                </Grid>
                                              )
                                          }
                                          </Grid>
                                        ))
                                      )
                                        : <div />
                                  }
                                      </Grid>
                                      <Grid item>
                                        {
                                    poll.showOptions && isCurrent ? (
                                      <Fab variant="extended" onClick={() => submitPoll(poll, polls.Options[pageIndex][index])} style={{ background: 'linear-gradient(45deg, #ffe5d8 0%, #ffcad4 100%)', boxShadow: '0 3px 7px 1px rgba(255, 212, 213, .3)' }}>
                                        <NavigationIcon className={classes.extendedIcon} />
                                      Vote!
                                      </Fab>
                                    )
                                      : <div />
                                  }
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                  <Grid item>
                                    <Button variant="outlined" size="small" onClick={() => showOptions(poll)}>
                                      {isCurrent ? (poll.showOptions ? 'Hide Options' : 'Show Options') : (poll.showOptions ? 'Hide Results' : 'Show Results')}
                                    </Button>
                                  </Grid>
                                </Grid>
                              </Grid>
                            </Grid>
                          </Grid>
                          <Grid item>
                            <Grid item>
                              {
                                isAdmin ? (
                                  <Fab variant="extended" aria-label="delete" className={classes.fab} onClick={() => deletePoll(poll.Poll_ID, isCurrent ? 'current' : 'past')}>
                                    <HighlightOffIcon className={classes.extendedIcon} />
                                  Remove
                                  </Fab>
                                )
                                  : <div />
                              }
                            </Grid>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  ))
                }
                  </Grid>
                )
                  : <div />
              }
            </Grid>
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
        <DialogTitle>New Poll</DialogTitle>
        <DialogContent style={{ width: 800 }}>

          <Grid
            container
            direction="column"
            justify="center"
            alignItems="flex-start"
            spacing={1}
          >
            <Grid item>
              <TextField
                margin="dense"
                label="Title"
                type="text"
                value={newTitle}
                onChange={onNewTitleChange}
                fullWidth
                style={{ width: 550 }}
              />
            </Grid>
            <TextField
              id="date"
              label="End Date"
              type="date"
              defaultValue="2019-10-22"
              value={dateState}
              onChange={onNewDateChange}
              InputLabelProps={{
                shrink: true,
              }}
              style={{ width: 550 }}
            />
            <Grid item>
              <TextField
                margin="dense"
                label="Option"
                type="text"
                value={newOption}
                onChange={onNewOptionChange}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    onAddOptionChange();
                  }
                }}
                fullWidth
                style={{ width: 550 }}
              />
            </Grid>

            <Grid item>
              <Button variant="contained" color="primary" onClick={onAddOptionChange} className={classes.margin}>
                <AddIcon fontSize="inherit" />
              </Button>
            </Grid>

            <Grid item>
              {
                newPolls.map((poll, index) => (
                  <Typography>
                    {`${index}. ${poll}`}
                  </Typography>
                ))
              }
            </Grid>
          </Grid>

        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={postPolls} color="primary">
            Post
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={snackBarOpened}
        onClose={closeSnackBar}
        message={<span>Empty Title or Less than 2 choices!</span>}
      />
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={snackBarDateOpened}
        onClose={closeSnackBarDateFunc}
        message={<span>Please enter a date!</span>}
      />

      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={snackBarChoiceOpened}
        onClose={closeSnackBarChoice}
        message={<span>Please do not enter empty choice!</span>}
      />

      { toDash ? (<Redirect to="/dashboard" />) : <div /> }
      { toHome ? (<Redirect to={`/club/${clubId}`} />) : <div /> }
      { toDiscuss ? (<Redirect to={`/club/${clubId}/discussion`} />) : <div /> }
      { toMeeting ? (<Redirect to={`/club/${clubId}/meeting`} />) : <div /> }
      { toAdmin && isAdmin ? (<Redirect to={`/club/${clubId}/admin`} />) : <div /> }
    </div>
  );
}


export default PollView;
