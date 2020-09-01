import React, { useState, useEffect, useContext } from 'react';
import { Redirect } from 'react-router-dom';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Snackbar from '@material-ui/core/Snackbar';
import Card from '@material-ui/core/Card';
import Logo from '../logos/bookface.jpg';
import { UserContext } from '../UserContext';

import login from '../api/login';


function LoginView(props) {
  const { setloggedIn } = useContext(UserContext);

  // States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [snackBarOpened, setSnackBarOpened] = useState(false);
  const [toReg, setToReg] = useState(false);
  const [toDash, setToDash] = useState(false);


  // Life Cycle Hook. Executed when the view is mounted.
  useEffect(() => {
    props.setViewName('Login');
  }, [props]);


  const goToRegisterView = () => {
    setToReg(true);
  };


  const goToDashboardView = () => {
    setToDash(true);
  };


  const onEmailChange = (e) => {
    setEmail(e.target.value);
  };


  const onPasswordChange = (e) => {
    setPassword(e.target.value);
  };


  const openSnackBar = () => {
    setSnackBarOpened(true);
  };


  const closeSnackBar = () => {
    setSnackBarOpened(false);
  };

  return (
    <div className="LoginView">
      <Grid container direction="column" alignItems="center" justify="center" style={{ marginTop: '15vh' }}>
        <Grid item>
          <Card style={{ width: 550, height: 550 }}>
            <Grid container direction="column" alignItems="center" justify="center" spacing={2} style={{ marginTop: 40 }}>
              <Grid item>
                <img src={Logo} width='150' height='150'/>
              </Grid>
              <Grid item>
                <UserContext.Consumer>
                  {({ toggleToken }) => (
                    <TextField
                      id="email"
                      label="Email"
                      className="textField"
                      value={email}
                      onChange={onEmailChange}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          login(email, password, goToDashboardView, openSnackBar,
                            toggleToken, setloggedIn);
                        }
                      }}
                      margin="normal"
                      variant="outlined"
                      style={{ width: 400 }}
                    />
                  )}
                </UserContext.Consumer>
              </Grid>
              <Grid item>
                <UserContext.Consumer>
                  {({ toggleToken }) => (
                    <TextField
                      id="password"
                      label="Password"
                      type="password"
                      className="textField"
                      value={password}
                      onChange={onPasswordChange}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          login(email, password, goToDashboardView, openSnackBar,
                            toggleToken, setloggedIn);
                        }
                      }}
                      margin="normal"
                      variant="outlined"
                      style={{ width: 400 }}
                    />
                  )}
                </UserContext.Consumer>
              </Grid>
              <Grid item>
                <UserContext.Consumer>
                  {({ toggleToken }) => (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        login(email, password, goToDashboardView, openSnackBar,
                          toggleToken, setloggedIn);
                      }}
                      style={{
                        background: 'linear-gradient(45deg, #ff9190 0%, #fdc094 100%)',
                        boxShadow: '0 3px 7px 1px rgba(255, 105, 135, .3)',
                        width: 280,
                        marginRight: 20,
                      }}
                    >
                      Login!
                    </Button>
                  )}
                </UserContext.Consumer>

                <Button
                  variant="outlined"
                  color="primary"
                  onClick={goToRegisterView}
                  style={{ width: 100 }}
                >
                  Register
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
        message={<span>Invalid login!</span>}
      />

      { toReg ? (<Redirect to="/register" />) : <div /> }
      { toDash ? (<Redirect to="/dashboard" />) : <div /> }
    </div>

  );
}

export default LoginView;
