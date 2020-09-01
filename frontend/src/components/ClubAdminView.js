import React, { useState, useEffect, useContext } from 'react';
import { Redirect, useParams } from 'react-router-dom';
import axios from 'axios';


import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Fab from '@material-ui/core/Fab';
import NavigationIcon from '@material-ui/icons/Navigation';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';

import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import Avatar from '@material-ui/core/Avatar';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import HomeIcon from '@material-ui/icons/Home';
import ForumIcon from '@material-ui/icons/Forum';
import PollIcon from '@material-ui/icons/Poll';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import SecurityIcon from '@material-ui/icons/Security';
import DashboardIcon from '@material-ui/icons/Dashboard';


import domain from '../api/domain';
import getAdmin from '../api/getAdmin';

import { UserContext } from '../UserContext';


function ClubAdminView(props) {
  // Get param from url.
  const { clubId } = useParams();

  const { token, userId } = useContext(UserContext);

  const [vpWidth, setVPWidth] = useState(window.innerWidth);

  const [toDash, setToDash] = useState(false);
  const [toHome, setToHome] = useState(false);
  const [toPoll, setToPoll] = useState(false);
  const [toMeeting, setToMeeting] = useState(false);

  const [toDiscuss, setToDiscuss] = useState(false);
  const [open, setOpen] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [updater, setUpdater] = useState(false);
  const [isOpenToNewMembers, setIsOpenToNewMembers] = useState(true);
  const [isAdmin, setIsAdmin] = useState(true);

  // for saving typing input:
  const [nameTyping, setNameTyping] = useState('');
  // display:

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
      background: '#DCDCDC',
      '&:hover': {
        background: 'linear-gradient(45deg, #ff9190 0%, #fdc094 100%)',
      },
    },
    button: {
      background: 'linear-gradient(45deg, #ffe5d8 0%, #ffcad4 100%)',
      boxShadow: '0 3px 7px 1px rgba(255, 212, 213, .3)',
    },

    delButton: {
      marginBottom: 40,
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

    profilePic: {
      margin: 12,
      width: 150,
      height: 150,
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
        setIsOpenToNewMembers(response.data.Open);
      });
  };

  // Life Cycle Hook. Executed when the view is mounted.
  useEffect(() => {
    getAdmin(clubId, userId, token, setIsAdmin);
    getClubName();
  }, []);

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

  const toDiscussView = () => {
    setToDiscuss(true);
  };

  const showPic = ({ target }) => {
    const fileReader = new FileReader();

    const file = target.files[0];

    fileReader.onload = (function () {
      return function (e) {
        setPicture(e.target.result);
      };
    }(file));

    // Read in the image file as a data URL.
    fileReader.readAsDataURL(file);
  };

  const updatePic = () => {
    const payload = {
      Param_to_change: 'Logo',
      New_value: picture,
      BookClub_ID: clubId,
      User_ID: userId,
    };
    axios({
      url: `${domain}/Homepage/set_club`,
      method: 'post',
      data: payload,
      headers: { Authorization: `Token ${token}` },
    })
      .then(() => {
        openDialog();
      });
  }

  const openDialog = () => {
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
  };

  const openConfirmDialog = () => {
    setOpenConfirm(true);
  };

  const closeConfirmDialog = () => {
    setOpenConfirm(false);
  };

  const onNameChange = (e) => {
    setNameTyping(e.target.value);
  };

  const updateName = () => {
    const payload = {
      Param_to_change: 'Name',
      New_value: nameTyping,
      BookClub_ID: clubId,
      User_ID: userId,
    };

    axios({
      url: `${domain}/Homepage/set_club`,
      method: 'post',
      data: payload,
      headers: { Authorization: `Token ${token}` },
    })
      .then(() => {
        getClubName();
        openDialog();
      });
  };

  const updateOpen = () => {
    const payload = {
      Param_to_change: 'Open',
      New_value: isOpenToNewMembers,
      BookClub_ID: clubId,
      User_ID: userId,
    };

    axios({
      url: `${domain}/Homepage/set_club`,
      method: 'post',
      data: payload,
      headers: { Authorization: `Token ${token}` },
    })
      .then(() => {
        // TODO
        openDialog();
      });
  };

  const deleteClub = () => {
    const payload = {
      BookClub_ID: clubId,
      User_ID: userId,
    };

    axios({
      url: `${domain}/Homepage/delete_book_club`,
      method: 'post',
      data: payload,
      headers: { Authorization: `Token ${token}` },
    })
      .then(() => {
        toDashboardView();
      });
  };

  const toggleIsOpenToNewMembers = () => {
    setIsOpenToNewMembers(!isOpenToNewMembers);
    setUpdater(!updater);
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
                <Fab variant="extended" aria-label="delete" className={classes.fab} onClick={toMeetingView}>
                  <PeopleAltIcon className={classes.extendedIcon} />
                  Meeting
                </Fab>
              </Grid>

              <Grid item>
                <Fab variant="extended" aria-label="delete" className={classes.fab} style={{ background: 'linear-gradient(45deg, #ffe5d8 0%, #ffcad4 100%)', boxShadow: '0 3px 7px 1px rgba(255, 212, 213, .3)' }}>
                  <SecurityIcon className={classes.extendedIcon} />
                  Admin
                </Fab>
              </Grid>

            </Grid>
          </Grid>

          <Divider className={classes.content} />
          <Grid item>
            <Grid continer direction="column" justify="flex-start" alignItems="center" spacing={4}>
              <Grid container direction="row" justify="center" alignItems="center" spacing={3} className={classes.content}>
                <Grid item>
                  <Typography variant="h3">Admin settings</Typography>
                </Grid>
              </Grid>
              <Card className={classes.card} style={{ marginTop: 30 }}>
                <Grid item>
                  <Grid container direction="column" justify="flex-start" alignItems="center" spacing={2} className={classes.content} style={{ paddingTop: 30 }}>
                    <Grid item>
                      <Grid container direction="row" justify="center" alignItems="center" spacing={8} className={classes.content}>
                        <Grid item>
                          <Avatar alt="profile pic" src={picture} className={classes.profilePic} />
                        </Grid>

                        <Grid item spacing={4}>
                          <label htmlFor="raised-button-file">
                            <input
                              accept="image/*"
                              className={classes.input}
                              style={{ display: 'none' }}
                              id="raised-button-file"
                              type="file"
                              multiple={false}
                              onChange={showPic}
                            />
                            <Button variant="raised" component="span" className={classes.button}>
                                Upload profile picture
                            </Button>
                          </label>
                          <p style={{ marginLeft: '1vh' }}>
                            Support file type: jpg, jpeg, png
                          </p>
                          <Button onClick={updatePic} className={classes.button}>
                            Confirm
                          </Button>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item>
                  <Grid container direction="row" justify="center" alignItems="center" spacing={2}>
                    <Grid item>
                      <TextField
                        label="Club Name"
                        value={nameTyping}
                        onChange={onNameChange}
                        margin="normal"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item>
                      <Button variant="contained" onClick={updateName} className={classes.button}>
                        Update Club Name
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item>
                  <Grid container direction="row" justify="center" alignItems="center" spacing={2}>
                    <Grid item>
                      <FormControlLabel
                        control={
                          <Switch checked={isOpenToNewMembers} onChange={toggleIsOpenToNewMembers} color="primary" />
                        }
                        label="Open to new members"
                      />
                    </Grid>
                    <Grid item>
                      <Button variant="contained" onClick={updateOpen} className={classes.button}>
                        Confirm
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item>
                  <Grid container direction="row" justify="center" alignItems="center" spacing={2}>

                    <Grid item>
                      <Button variant="outlined" onClick={openConfirmDialog} className={classes.delButton} spacing={2}>
                        DELETE
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>

              </Card>
            </Grid>

          </Grid>
        </Grid>

        <Dialog
          open={open}
          onClose={closeDialog}
        >
          <DialogTitle>Details Updated</DialogTitle>

          <DialogContent>
            <DialogContentText>
              We have updated your details.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog} color="primary" autoFocus>
              OK
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openConfirm}
          onClose={closeConfirmDialog}
        >
          <DialogTitle>Are you sure?</DialogTitle>

          <DialogContent>
            <DialogContentText>
              This action can not be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={deleteClub} color="primary" autoFocus style={{ marginTop: '15vh' }}>
                DELETE
            </Button>
            <Button onClick={closeConfirmDialog} color="primary" autoFocus>
              CANCEL
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>


      <Fab variant="extended" aria-label="Go Back" className={classes.goBackFab} onClick={toDashboardView}>
        <DashboardIcon className={classes.extendedIcon} />
        Dashboard
      </Fab>

      { toDiscuss ? (<Redirect to={`/club/${clubId}/discussion`} />) : <div />}
      { toDash ? (<Redirect to="/dashboard" />) : <div /> }
      { toHome ? (<Redirect to={`/club/${clubId}`} />) : <div /> }
      { toPoll ? (<Redirect to={`/club/${clubId}/poll`} />) : <div /> }
      { toMeeting ? (<Redirect to={`/club/${clubId}/meeting`} />) : <div /> }
    </div>
  );
}


export default ClubAdminView;
