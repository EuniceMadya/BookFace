import React, { useState, useEffect, useContext } from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import axios from 'axios';

import Fab from '@material-ui/core/Fab';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/Button';
import ButtonBase from '@material-ui/core/ButtonBase';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';
import AddIcon from '@material-ui/icons/Add';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardActionArea from '@material-ui/core/CardActionArea';
import Avatar from '@material-ui/core/Avatar';
import { red } from '@material-ui/core/colors';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import List from '@material-ui/core/List';
import domain from '../api/domain';


import { UserContext } from '../UserContext';

const useStyles = makeStyles(() => ({

  media: {
    height: 60,
    paddingTop: '70%', // 16:9
  },

  avatar: {
    background: 'radial-gradient( circle farthest-corner at 10% 20%,  rgba(75,108,183,1) 0%, rgba(55,82,141,1) 90% )',
  },

  button: {
    background: 'linear-gradient(45deg, #ffe5d8 0%, #ffcad4 100%)',
    boxShadow: '0 3px 7px 1px rgba(255, 212, 213, .3)',
  },

  profilePic: {
    marginLeft: 50,
    marginRight: 80,
    width: 80,
    height: 80,
  },

  addClub: {
    margin: 0,
    top: 'auto',
    right: 20,
    bottom: 20,
    left: 'auto',
    position: 'fixed',
    background: 'linear-gradient(45deg, #ffe5d8 0%, #ffcad4 100%)',
    boxShadow: '0 3px 7px 1px rgba(255, 212, 213, .3)',
  },

}));

function DashboardView(props) {
  const { token, userId } = useContext(UserContext);

  const classes = useStyles();
  const fileInput = React.createRef();


  // Life Cycle Hook. Executed when the view is mounted.
  useEffect(() => {
    props.setViewName('Dashboard')
    props.history.length = 0
  }, []);

  const [toClub, redirectClub] = useState(false);

  const [clubIndex, setClubIndex] = useState(0);

  const [tags, setTags] = useState('');

  const [pages, setPages] = useState([]);

  const [pageIndex, setIndex] = useState(0);

  const [clubs, setClubs] = useState([[]]);

  const [dialogOpened, setDialogOpened] = useState(false);

  const [newName, setNewName] = useState('');

  const [newTag, setNewTag] = useState('');

  const [newTags, setNewTags] = useState([]);

  const [picture, setPicture] = useState('https://fun-group-bucket.s3-ap-southeast-2.amazonaws.com/blank-profile-picture.png');

  const [vpWidth, setVPWidth] = useState(window.innerWidth);

  const [showPages, setShowPages] = useState(false);


  useEffect(() => {
    function handleResize() {
      setVPWidth(window.innerWidth);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const getClubs = async () => {
      const payload = {
        id: parseInt(userId, 10),
      };

      const response = await axios({
        url: `${domain}/Homepage/get_book_clubs`,
        method: 'post',
        data: payload,
        headers: { Authorization: `Token ${token}` },
      });

      const effect = [];
      effect.push(response.data);

      setClubs(effect);
      setShowPages(false);
    };

    getClubs();
  }, []);


  const loopPages = (array) => {
    const pageArray = [];
    for (let i = 0; i < array.length; i += 1) {
      pageArray[i] = (i + 1).toString();
    }
    setPages(pageArray);
  };

  const dispClubs = (clubArray) => {
    const array = [];
    array.push([]);
    let outer = 0;
    let inner = 0;
    for (let i = 0; i < clubArray.length; i += 1) {
      if (outer === 11) break;
      array[outer][inner] = clubArray[i];
      inner += 1;
      if (inner === 6) {
        outer += 1;
        inner = 0;
        array.push([]);
      }
    }

    console.log(array);

    loopPages(array);
    setClubs(array);
  };

  const searchClubs = async (tagString) => {
    setIndex(0);

    if (tagString === '') {
      const getClubs = async () => {
        const payload = {
          id: parseInt(userId, 10),
        };

        const response = await axios({
          url: `${domain}/Homepage/get_book_clubs`,
          method: 'post',
          data: payload,
          headers: { Authorization: `Token ${token}` },
        });

        const effect = [];
        effect.push(response.data);

        setClubs(effect);
        setShowPages(false);
      };

      getClubs();
    } else {
      const tagArray = tagString.split(',');
      for (let i = 0; i < tagArray.length; i += 1) tagArray[i] = tagArray[i].trim(' ');

      const payload = {
        Tags: tagArray,
      };

      const response = await axios({
        url: `${domain}/Homepage/search_book_clubs`,
        method: 'post',
        data: payload,
        headers: { Authorization: `Token ${token}` },
      });

      dispClubs(response.data);
      setShowPages(true);
    }
  };

  const changeIndex = (index) => {
    setIndex(index);
  };

  const onSearchBarChange = (e) => {
    setTags(e.target.value);
  };

  const goToClub = (ID) => {
    setClubIndex(ID);
    redirectClub(true);
  };

  const onNewNameChange = (e) => {
    setNewName(e.target.value);
  };

  const onNewTagChange = (e) => {
    setNewTag(e.target.value);
  };

  const onAddTagChange = () => {
    const dupNewTags = newTags;
    dupNewTags.push(newTag);

    setNewTags(dupNewTags);
    setNewTag('');
  };

  const openDialog = () => {
    setDialogOpened(true);
  };


  const closeDialog = () => {
    setDialogOpened(false);
    setNewName('');
    setNewTag('');
    setNewTags([]);
  };

  const postClub = () => {
    const payload = {
      Name: newName,
      Profile_Pic: picture,
      Tags: newTags,
      User_ID: userId,
    };

    axios({
      url: `${domain}/Homepage/create_book_club`,
      method: 'post',
      data: payload,
      headers: { Authorization: `Token ${token}` },
    })
      .then(() => {
        const clubTags = newTags.join(', ');
        searchClubs(clubTags);
      });

    closeDialog();
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

  // Render the view.
  return (
    <div className="DashBoardView">
      <Grid container direction="row" alignItems="center" justify="center" spacing={2} style={{ marginTop: 40 }}>
        <Grid item>
          <TextField
            id="searchbar"
            label="Search by Tag"
            className="searchbar"
            margin="normal"
            onChange={onSearchBarChange}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                searchClubs(tags);
              }
            }}
            variant="outlined"
            InputProps={{
              style: { fontSize: 20 },
            }}
            InputLabelProps={{
              style: { fontSize: 25 },
            }}
            style={{ width: 600 }}
          />
        </Grid>

        <Grid item>
          <IconButton
            variant="contained"
            color="default"
            onClick={() => searchClubs(tags)}
            style={{
              width: 50,
              height: 60,
              marginTop: 5,
              marginLeft: 10,
            }}
          >
            <SearchIcon />
          </IconButton>
        </Grid>
      </Grid>



      <Grid container direction="column" alignItems="center" justify="center" spacing={3} style={{ marginTop: 30 }}>
        <Grid item>
          <Grid container justify="flex-start" style={{ width: (vpWidth - 240) * 0.9 }}>
            <Typography variant="h3">
              { showPages ? "Search Results" : "My Favourite Clubs" }
            </Typography>
          </Grid>
        </Grid>

        <Grid style={{ width: (vpWidth - 240) * 0.9 }}>
          <List>
            <Grid container direction="row" alignItems="space-evenly" justify="center" spacing={3}>
              {clubs[pageIndex].map((club) => (
                <Grid item>
                  <ButtonBase onClick={() => goToClub(club.BookClub_ID)}>
                    <Card style={{ width: 340, height: 300 }}>
                      <CardActionArea>
                        <CardHeader
                          avatar={(
                            <Avatar aria-label="BookClub" className={classes.avatar}>
                              {club.Name.charAt(0)}
                            </Avatar>
                            )}

                          title={(
                            <Typography variant="body2" color="textPrimary" component="p">
                              {club.Name}
                            </Typography>
                          )}
                        />
                        <CardMedia
                          className={classes.media}
                          image={club.Profile_Pic}
                        />
                      </CardActionArea>
                    </Card>
                  </ButtonBase>
                </Grid>
              ))}
            </Grid>
          </List>
        </Grid>


      </Grid>
      <List>
        <Grid container direction="row" alignItems="flex-start" justify="center" spacing={3} style={{ marginTop: 30 }}>
          {showPages ? (pages.map((button, index) => (
            <Grid item>
              <Button variant="contained" color={pageIndex === index ? 'primary' : 'default'} onClick={() => changeIndex(index)}>
                {button}
              </Button>
            </Grid>
          )))
            : <div />}
        </Grid>
      </List>

      <Dialog open={dialogOpened} onClose={closeDialog}>
        <DialogTitle>New Club</DialogTitle>
        <DialogContent style={{ width: 800 }}>

          <Grid item>
            <Grid container direction="row" justify="flex-start" alignItems="center" spacing={5} className={classes.content}>
              <Grid item>
                <Avatar alt="profile pic" src={picture} className={classes.profilePic} />
              </Grid>

              <Grid item spacing={4}>
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
                <label htmlFor='raised-button-file'>
                  <Button variant="raised" component="span" className={classes.button}>
                    Upload profile picture
                  </Button>
                </label>
                <p style={{ marginLeft: '1vh' }}>
                Support file type: jpg, jpeg, png
                </p>

              </Grid>
            </Grid>
          </Grid>

          <Grid
            container
            direction="column"
            justify="center"
            alignItems="flex-start"
            spacing={1}
          >
            <Grid item>
              <TextField
                margin="dense"
                label="Name"
                type="text"
                value={newName}
                onChange={onNewNameChange}
                fullWidth
                style={{ width: 550 }}
              />
            </Grid>
            <Grid item>
              <TextField
                margin="dense"
                label="Tag"
                type="text"
                value={newTag}
                onChange={onNewTagChange}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    onAddTagChange();
                  }
                }
              }
                fullWidth
                style={{ width: 550 }}
              />
            </Grid>

            <Grid item>
              <Button variant="contained" color="primary" onClick={onAddTagChange} className={classes.margin}>
                <AddIcon fontSize="inherit" />
              </Button>
            </Grid>

            <Grid item>
              {
                newTags.map((tag, index) => (
                  <Typography>
                    {`${index}. ${tag}`}
                  </Typography>
                ))
              }
            </Grid>
          </Grid>

        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={postClub} color="primary">
            Post
          </Button>
        </DialogActions>
      </Dialog>

      <Fab className={classes.addClub} onClick={openDialog}>
        <AddIcon />
      </Fab>

      { toClub ? (<Redirect to={`/club/${clubIndex}`} />) : <div /> }
    </div>

  );
}


export default withRouter(DashboardView);
