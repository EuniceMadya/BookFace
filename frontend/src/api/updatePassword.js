import axios from 'axios';
import domain from './domain'

const updatePassword = (password, userId, token, openDialog) => {
  var CryptoJS = require('crypto-js');

  const key = CryptoJS.enc.Utf8.parse(process.env.REACT_APP_FUN_CIPHER_KEY);
  const iv = CryptoJS.enc.Utf8.parse(process.env.REACT_APP_FUN_CIPHER_IV);

  const pwd = CryptoJS.AES.encrypt(password, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 })
  const cipherpassword = pwd.toString();

  const payload = {
    Param_to_change: 'Password',
    New_value: cipherpassword,
    User_ID: userId,
  };

  axios({
    url: `${domain}/Homepage/set_user`,
    method: 'post',
    data: payload,
    headers: { Authorization: `Token ${token}` },
  })
    .then(() => {
      openDialog()
    })
}

export default updatePassword;
