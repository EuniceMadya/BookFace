import axios from 'axios';
import domain from './domain'

const getAdmin = (clubId, userId, token, setAdmin) => {
  const payload = {
    BookClub_ID: parseInt(clubId, 10),
    User_ID: parseInt(userId, 10),
  };

  axios({
    url: `${domain}/Homepage/is_admin`,
    method: 'post',
    data: payload,
    headers: { Authorization: `Token ${token}` },
  })
    .then((response) => {
      setAdmin(response.data.isAdmin)
    })
}

export default getAdmin;
