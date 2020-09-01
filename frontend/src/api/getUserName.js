import axios from 'axios';
import domain from './domain'

const getUserName = (userId, userNameTyping, token, setUserName, setPicture) => {
  const payload = {
    User_ID: userId
  };

  axios({
    url: `${domain}/Homepage/set_user`,
    method: 'post',
    data: payload,
    headers: { Authorization: `Token ${token}` }
  })
    .then((response) => {
      setUserName(response.data.username)
      setPicture(response.data.profile_pic)
    })
}

export default getUserName;
