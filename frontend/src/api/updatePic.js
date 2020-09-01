import axios from 'axios';
import domain from './domain'

const updatePic = (userId, picture, token, getUserName, openDialog) =>{
  const payload = {
    Param_to_change: 'Profile_pic',
    New_value: picture,
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

export default updatePic;
