import axios from 'axios';
import domain from './domain'

const updateUserName = (userId, userNameTyping, token, getUserName, openDialog) => {
  const payload = {
    Param_to_change: 'Username',
    New_value: userNameTyping,
    User_ID: userId
  };

  axios({
    url: `${domain}/Homepage/set_user`,
    method: 'post',
    data: payload,
    headers: { Authorization: `Token ${token}` }
  })
    .then(() => {
      getUserName()
      openDialog()
    })
}

export default updateUserName;
