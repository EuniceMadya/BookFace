import React, { useState, useEffect, useContext } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import Snackbar from '@material-ui/core/Snackbar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Logo from '../logos/bookface.jpg';

import { UserContext } from '../UserContext';

import login from '../api/login';
import domain from '../api/domain';

function RegisterView(props) {
  const { toggleToken, setloggedIn } = useContext(UserContext);

  // States
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmedPassword, setConfirmedPassword] = useState('');
  const [snackBarOpened, setSnackBarOpened] = useState(false);
  const [toLogin, setToLogin] = useState(false);
  const [toDash, settoDash] = useState(false);
  const [regisFailOpened, setRegisFailOpened] = useState(false);

  // Life Cycle Hook. Executed when the view is mounted.
  useEffect(() => {
    props.setViewName('Register');
  }, []);


  const goToLoginView = () => {
    setToLogin(true);
  };

  const onEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const onUserNameChange = (e) => {
    setUserName(e.target.value);
  };

  const onPasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const onConfirmPasswordChange = (e) => {
    setConfirmedPassword(e.target.value);
  };

  const goToDashboardView = () => {
    settoDash(true);
  };

  const openSnackBar = () => {
    setSnackBarOpened(true);
  };

  const closeSnackBar = () => {
    setSnackBarOpened(false);
  };

  const openErrorMsg = () => {
    setRegisFailOpened(true);
  };

  const closeErrorMsg = () => {
    setRegisFailOpened(false);
  };

  const register = () => {
    if (confirmedPassword !== password) {
      openSnackBar();
    } else {
      const CryptoJS = require('crypto-js');

      const key = CryptoJS.enc.Utf8.parse(process.env.REACT_APP_FUN_CIPHER_KEY);
      const iv = CryptoJS.enc.Utf8.parse(process.env.REACT_APP_FUN_CIPHER_IV);

      const pwd = CryptoJS.AES.encrypt(password, key,
        { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 })

      const cipherpassword = pwd.toString();

      axios.post(`${domain}/Homepage/register`, {
        username: userName,
        email: email,
        password: cipherpassword,
      })
        .then(() => {
          login(email, password, goToDashboardView, null, toggleToken, setloggedIn);
        })
        .catch(() => {
          openErrorMsg();
        });
    }
  };

  return (
    <div className="RegisterView">
      <CssBaseline />

      <Grid container direction="column" alignItems="center" justify="center" style={{ marginTop: '3vh' }}>
        <Grid item>
          <Card style={{ width: 550, height: 710 }}>
            <Grid container direction="column" alignItems="center" justify="center" spacing={2} style={{ marginTop: 35 }}>
              <Grid item>
                <img src={Logo} width='150' height='150'/>
              </Grid>

              <Grid item>
                <TextField
                  id="email"
                  label="Email"
                  className="textField"
                  value={email}
                  onChange={onEmailChange}
                  margin="normal"
                  variant="outlined"
                  style={{ width: 400 }}
                />
              </Grid>

              <TextField
                id="userName"
                label="User Name"
                className="textField"
                value={userName}
                onChange={onUserNameChange}
                margin="normal"
                variant="outlined"
                style={{ width: 400 }}
              />

              <Grid item>
                <TextField
                  id="password"
                  label="Password"
                  type="password"
                  className="textField"
                  value={password}
                  onChange={onPasswordChange}
                  margin="normal"
                  variant="outlined"
                  style={{ width: 400 }}
                />
              </Grid>

              <Grid item>
                <TextField
                  id="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  className="textField"
                  value={confirmedPassword}
                  onChange={onConfirmPasswordChange}
                  margin="normal"
                  variant="outlined"
                  style={{ width: 400 }}
                />
              </Grid>

              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={register}
                  style={{
                    background: 'linear-gradient(45deg, #ff9190 0%, #fdc094 100%)',
                    boxShadow: '0 3px 7px 1px rgba(255, 105, 135, .3)',
                    width: 400,
                  }}
                >
                  Join!
                </Button>
              </Grid>

              <Grid item>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={goToLoginView}
                  style={{ width: 400 }}
                >
                  Already have an account? Login!
                </Button>
              </Grid>

            </Grid>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        open={snackBarOpened}
        onClose={closeSnackBar}
        message={<span>Oh no! Passwords do not match.</span>}
      />

      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        open={regisFailOpened}
        onClose={closeErrorMsg}
        message={<span>Something went wrong.</span>}
      />

      { toLogin ? (<Redirect to="/login" />) : <div /> }
      { toDash ? (<Redirect to="/dashboard" />) : <div /> }
    </div>
  );
}

export default RegisterView;
