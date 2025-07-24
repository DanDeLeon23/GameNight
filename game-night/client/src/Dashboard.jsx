import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);
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
      .then(data => setFriends(data));
  }, []);

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

  const commonAppIDs = [...gameMaps[0].keys()].filter(appid =>
    gameMaps.every(map => map.has(appid))
  );

  const sharedGames = commonAppIDs.map(appid => gameMaps[0].get(appid));
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
        <ul>
          {friends.map(friend => (
            <li key={friend.steamid}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedFriends.has(friend.steamid)}
                  onChange={() => toggleFriend(friend.steamid)}
                />
                <img src={friend.avatar} alt={friend.personaname} width={32} />
                {' '}
                {friend.personaname}
              </label>
            </li>
          ))}
        </ul>
      )}

      <p>Selected Friends: {selectedFriends.size}</p>
      
      <button onClick={handleFindCommonGames}>
        Find Multiplayer Games in Common
      </button>

      <ul>
        {commonGames.map(game => (
            <li key={game.appid}>
            <img src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/capsule_sm_120.jpg`} alt={game.name} />
            {game.name}
            </li>
        ))}
      </ul>


    </div>
  );
}