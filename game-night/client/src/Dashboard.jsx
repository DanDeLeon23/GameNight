import { useEffect, useState } from 'react';
import './FriendsGrid.css';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [friendDetails, setFriendDetails] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState(new Set());
  const [commonGames, setCommonGames] = useState([]);



  useEffect(() => {
    // Fetch user profile
    fetch('http://localhost:3001/profile', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => setUser(data));

    // Fetch enriched friend details
    fetch('http://localhost:3001/friends/details', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        const sorted = data.sort(function(a, b) {
          return a.personaname.localeCompare(b.personaname)
        });
        setFriendDetails(sorted);
        setFriends(sorted);
      });
  }, []);


//LOADING TEXT
  if (!user || !user.id) return <p>Loading profile...</p>;



   // Toggle a friend's selection
  const toggleFriend = (steamid) => {
    const updated = new Set(selectedFriends); //sets are better for id storage as they ensure there are no duplicated, faster on lookup O(1), easier to use for the toggle using .has and .delete, instead of using an array 
    if (updated.has(steamid)) {
      updated.delete(steamid);
    } else {
      updated.add(steamid);
    }
    setSelectedFriends(updated);
  };

  
  const handleFindCommonGames = async () => {
  const idsToCompare = [user.id, ...Array.from(selectedFriends)];
  
  //Fetch all Games
  const allGameLists = await Promise.all(
    idsToCompare.map(id =>
      fetch(`http://localhost:3001/games/${id}`, { credentials: 'include' })
        .then(res => res.json())
        .catch(() => [])
    )
  );

  const gameMaps = allGameLists.map(games =>
    new Map(games.map(game => [game.appid, game]))
  );

  //Filter list to have common games
  const commonAppIDs = [...gameMaps[0].keys()].filter(appid => 
    gameMaps.every(map => map.has(appid))
  );

  const sharedGames = commonAppIDs.map(appid => gameMaps[0].get(appid));
  sharedGames.sort(function(a, b) {
    return a.name.localeCompare(b.name);
  });
  setCommonGames(sharedGames);
  console.log('Shared Games:', sharedGames);
};

  return (
    <div>
      <h2>Welcome, {user.displayName}</h2>
      <img src={user.photos?.[0]?.value} alt="Avatar" />
      <p>Steam ID: {user.id}</p>
      <a href="http://localhost:3001/logout">Logout</a>

      <hr />

      <h3>Select Friends to Play With</h3>
      {friends.length === 0 ? (
        <p>Loading friends...</p>
      ) : (
        <div className="friends-grid">
          {friendDetails.map(friend => {
          // 1. Define the class name based on whether friend is selected
          let cardClass = 'friend-card';
          if (selectedFriends.has(friend.steamid)) {
            cardClass += ' selected';
          }
          // 2. Return the JSX for this friend with the computed class
          return (
            <div 
            key={friend.steamid} 
            className={cardClass}
            onClick={() =>toggleFriend(friend.steamid)}>
              <img 
                src={friend.avatarfull} 
                alt={friend.personaname} 
                className="friend-avatar"
              />
              <p>{friend.personaname}</p>
            </div>
          );
        })}
        </div>
      )}

      <p>Selected Friends: {selectedFriends.size}</p>
      
      <button onClick={handleFindCommonGames}>
        Find Multiplayer Games in Common
      </button>

      <p>Total Common Games: {commonGames.length}</p>
      <input
      type="text"
      placeholder="Search games..."
      onChange={e => {
        const filtered = sharedGames.filter(game =>
          game.name.toLowerCase().includes(e.target.value.toLowerCase())
        );
        setCommonGames(filtered);
      }}
      />
      <div className="friends-grid">
        {commonGames.map(game => (
          <div key={game.appid} className="friend-card">
            <a
              href={`https://store.steampowered.com/app/${game.appid}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/capsule_sm_120.jpg`}
                alt={game.name}
              />
              {game.name}
            </a>
          </div>
        ))
        }
      </div>
    </div>
  );
}