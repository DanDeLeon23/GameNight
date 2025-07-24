const express = require('express');
const session = require('express-session');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', // Allow Vite dev server to access backend
  credentials: true
}));
app.use(session({
  secret: 'super secret session key', // Used to encrypt session cookie
  resave: false,                      // Don’t force save on every request
  saveUninitialized: true            // Save new sessions that haven't been modified yet
}));
app.use(passport.initialize());
app.use(passport.session());

// Passport config
passport.serializeUser((user, done) => done(null, user)); //serializeUser: Save the entire user object.
passport.deserializeUser((obj, done) => done(null, obj)); //deserializeUser: Restore the user from the session.

passport.use(new SteamStrategy({
  returnURL: `${process.env.BASE_URL}/auth/steam/return`,
  realm: process.env.BASE_URL,
  apiKey: process.env.STEAM_API_KEY
}, (identifier, profile, done) => {
  return done(null, profile);
}));

// Auth routes
app.get('/auth/steam', passport.authenticate('steam')); //This is the login route. It redirects the user to Steam for authentication.

app.get('/auth/steam/return',
  passport.authenticate('steam', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('http://localhost:5173/dashboard');
  }
);

app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

app.get('/profile', (req, res) => {
  res.json(req.user || {});
});

// Route to get the user's Steam friends list
app.get('/friends', async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const steamID = req.user.id;

  try {
    const response = await axios.get(`http://api.steampowered.com/ISteamUser/GetFriendList/v0001/`, {
      params: {
        key: process.env.STEAM_API_KEY,
        steamid: steamID,
        relationship: 'friend'
      }
    });

    const friends = response.data.friendslist.friends;
    res.json(friends);
  } catch (error) {
    console.error('Error fetching friends list:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch friends list' });
  }
});

//Route for freinds details
app.get('/friends/details', async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const steamID = req.user.id;

  try {
    // First, get friend list (same as before)
    const friendsResponse = await axios.get(`http://api.steampowered.com/ISteamUser/GetFriendList/v0001/`, {
      params: {
        key: process.env.STEAM_API_KEY,
        steamid: steamID,
        relationship: 'friend'
      }
    });

    const friends = friendsResponse.data.friendslist.friends;
    const friendIDs = friends.map(f => f.steamid).join(',');

    if (friendIDs.length === 0) {
      return res.json([]);
    }

    // Then, get detailed info for all friends
    const detailsResponse = await axios.get(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/`, {
      params: {
        key: process.env.STEAM_API_KEY,
        steamids: friendIDs
      }
    });
    //summary pulls steamid,persona name, profileurl, avatar, online status, last login, ect. (mainly going to us avatar and name)

    const friendDetails = detailsResponse.data.response.players;
    res.json(friendDetails);
  } catch (error) {
    console.error('Error fetching friend details:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch friend details' });
  }
});

app.get('/games/:steamid', async (req, res) => {
    const steamid = req.params.steamid;
    const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${process.env.STEAM_API_KEY}&steamid=${steamid}&include_appinfo=true&include_played_free_games=true`;

    try{
        const response = await axios.get(url)
        const games = response.data.response.games || []
        res.json(games);
    } catch (error) {
        console.error('Error fetching games:', error);
        res.status(500).json({ error: 'Failed to fetch games' });
    }
})



// Start server
app.listen(process.env.PORT, () => {
  console.log(`✅ Server running at http://localhost:${process.env.PORT}`);
});

