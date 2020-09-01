import React, { useState, useEffect, useContext } from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import axios from 'axios';

import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import Avatar from '@material-ui/core/Avatar';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Fab from '@material-ui/core/Fab';
import NavigationIcon from '@material-ui/icons/Navigation';

import updatePassword from '../api/updatePassword';


import domain from '../api/domain';

import { UserContext } from '../UserContext';


function AccountSettingView(props) {
  const { token, userId } = useContext(UserContext);

  const [vpWidth, setVPWidth] = useState(window.innerWidth);

  const [open, setOpen] = useState(false);

  // for saving typing input:
  const [userNameTyping, setUserNameTyping] = useState('');
  // display:
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [picture, setPicture] = useState('https://fun-group-bucket.s3-ap-southeast-2.amazonaws.com/blank-profile-picture.png');


  const [toDash, setToDash] = useState(false);

  // styles
  const useStyles = makeStyles((theme) => ({
    content: {
      width: (vpWidth - 240) * 0.8,
    },
    card: {
      padding: theme.spacing(2, 3),
    },
    button: {
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
    profilePic: {
      margin: 0,
      width: 200,
      height: 200,
    },
  }));

  // Style sheet.
  const classes = useStyles();


  const fileInput = React.createRef();


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
        setUserName(response.data.username);
        setPicture(response.data.profile_pic);
      });
  };

  // Life Cycle Hook. Executed when the view is mounted.
  useEffect(() => {
    props.setViewName('Account Setting');
    props.disableRedirect();
    getUserName();
  }, []);

  useEffect(() => {
    function handleResize() {
      setVPWidth(window.innerWidth);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onUserNameChange = (e) => {
    setUserNameTyping(e.target.value);
  };

  const onPasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const openDialog = () => {
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
  };

  const goBack = () => {
    props.disableRedirect();
    setToDash(true);
  }

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
      Param_to_change: 'Profile_pic',
      New_value: picture,
      User_ID: userId,
    };
    axios({
      url: `${domain}/Homepage/set_user`,
      method: 'post',
      data: payload,
      headers: { Authorization: `Token ${token}` },
    })
      .then(() => {
        getUserName();
        openDialog();
      });
  };

  const updateUserName = () => {
    const payload = {
      Param_to_change: 'Username',
      New_value: userNameTyping,
      User_ID: userId,
    };

    axios({
      url: `${domain}/Homepage/set_user`,
      method: 'post',
      data: payload,
      headers: { Authorization: `Token ${token}` },
    })
      .then(() => {
        getUserName();
        openDialog();
      });
  };

  return (
    <div>
      <Grid container direction="column" alignItems="center" justify="center" spacing={2} style={{ marginTop: '15vh' }}>

        <Grid item>
          <Typography variant="h3">
            Hello,
            {' '}
            {userName}
            . This is settings
          </Typography>
        </Grid>
        <Grid item>
          <Card className={classes.card} style={{ width: '100%', height: '120%' }}>
            <Grid continer direction="column" justify="flex-start" alignItems="center" spacing={2}>
              <Grid item>
                <Grid container direction="row" justify="center" alignItems="center" spacing={5} className={classes.content}>
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
                        ref={fileInput}
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
              <Grid item>
                <Grid container direction="row" justify="center" alignItems="center" spacing={2}>
                  <Grid item>
                    <TextField
                      label="User Name"
                      value={userNameTyping}
                      onChange={onUserNameChange}
                      margin="normal"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item>
                    <Button variant="contained" onClick={updateUserName} className={classes.button}>
                      Update User Name
                    </Button>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item>
                <Grid container direction="row" justify="center" alignItems="center" spacing={2}>
                  <Grid item>
                    <TextField
                      label="Password"
                      value={password}
                      onChange={onPasswordChange}
                      margin="normal"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item>
                    <Button variant="contained" onClick={() => updatePassword(password, userId, token, openDialog)} className={classes.button}>
                      Update Password
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Card>
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

      <Fab variant="extended" aria-label="Go Back" className={classes.goBackFab} onClick={goBack}>
        <NavigationIcon className={classes.extendedIcon} />
        Dashboard
      </Fab>
      { toDash ? (<Redirect to="/dashboard" />) : <div /> }
    </div>
  );
}

export default withRouter(AccountSettingView);
