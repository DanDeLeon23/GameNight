import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);

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

  return (
    <div>
      <h2>Welcome, {user.displayName}</h2>
      <img src={user.photos?.[0]?.value} alt="Avatar" />
      <p>Steam ID: {user.id}</p>
      <a href="http://localhost:3001/logout">Logout</a>

      <hr />

      <h3>Your Friends</h3>
      {friends.length === 0 ? (
        <p>Loading friends...</p>
      ) : (
        <ul>
          {friends.map(friend => (
            <li key={friend.steamid}>
              <img src={friend.avatar} alt={friend.personaname} width={32} />
              {' '}
              {friend.personaname}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}