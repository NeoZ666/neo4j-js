import React, { useState, useEffect } from 'react';
import neo4j from 'neo4j-driver';

const Neo4jComponent = () => {
  const [artistInput, setArtistInput] = useState({
    username: '',
    numberOfSongs: 0,
    views: 0,
    wallet: 0
  });

  const [songInput, setSongInput] = useState({
    title: '',
    description: '',
    views: 0
  });

  const [successMessage, setSuccessMessage] = useState(null);

  const handleArtistInputChange = (e) => {
    setArtistInput({
      ...artistInput,
      [e.target.name]: e.target.value
    });
  };

  const handleSongInputChange = (e) => {
    setSongInput({
      ...songInput,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const uri = 'neo4j+s://65e55caf.databases.neo4j.io';
    const user = 'neo4j';
    const password = 'hVUozIMUzjjnf8IxrcTyt15ASaEodaErxR-PgzAcdrw';

    const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
    const session = driver.session();

    try {
      const createArtistQuery = `
        CREATE (artist:Artist $artistInput)
      `;
      await session.run(createArtistQuery, { artistInput });

      const createSongQuery = `
        CREATE (song:Song $songInput)
      `;
      await session.run(createSongQuery, { songInput });

      const createRelationshipQuery = `
        MATCH (artist:Artist {username: $artistUsername}),
              (song:Song {title: $songTitle})
        CREATE (artist)-[:owns]->(song)
      `;
      await session.run(createRelationshipQuery, {
        artistUsername: artistInput.username,
        songTitle: songInput.title
      });

      setSuccessMessage('Nodes and relationship created successfully');
    } catch (error) {
      console.error(error);
      setSuccessMessage('Error occurred during the process');
    } finally {
      session.close();
      driver.close();
    }
  };

  return (
    <div>
      {successMessage && <p>{successMessage}</p>}

      <h1>Welcome to the Neo4j Upload Song form!</h1>
      
      <form onSubmit={handleSubmit}>
        {/* Artist Form */}
        <label>
          Artist Username:
          <input type="text" name="username" value={artistInput.username} onChange={handleArtistInputChange} />
        </label>
        <label>
          Number of Songs:
          <input type="number" name="numberOfSongs" value={artistInput.numberOfSongs} onChange={handleArtistInputChange} />
        </label>
        <label>
          Views:
          <input type="number" name="views" value={artistInput.views} onChange={handleArtistInputChange} />
        </label>
        <label>
          Wallet:
          <input type="number" name="wallet" value={artistInput.wallet} onChange={handleArtistInputChange} />
        </label>

        {/* Song Form */}
        <label>
          Song Title:
          <input type="text" name="title" value={songInput.title} onChange={handleSongInputChange} />
        </label>
        <label>
          Description:
          <input type="text" name="description" value={songInput.description} onChange={handleSongInputChange} />
        </label>
        <label>
          Views:
          <input type="number" name="views" value={songInput.views} onChange={handleSongInputChange} />
        </label>

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Neo4jComponent;
