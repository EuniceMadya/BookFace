import axios from 'axios';
import domain from './domain'

const login = (email, password, goToDashboardView, openSnackBar, toggleToken, setloggedIn) => {

  var CryptoJS = require("crypto-js");

  const key = CryptoJS.enc.Utf8.parse(process.env.REACT_APP_FUN_CIPHER_KEY);
  const iv = CryptoJS.enc.Utf8.parse(process.env.REACT_APP_FUN_CIPHER_IV);
  const pwd = CryptoJS.AES.encrypt(password, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 })
  const cipherpassword = pwd.toString();

  axios.post(`${domain}/Homepage/login`, {
    email: email,
    password: cipherpassword,
  })
    .then((response) => {
      toggleToken(response.data);
      goToDashboardView();
      setloggedIn(true);
    })
    .catch(() => {
      openSnackBar();
    });
};

export default login;
