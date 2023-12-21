// Neo4jLicensingComponent.js
import React, { useState, useEffect } from 'react';
import neo4j from 'neo4j-driver';

const Neo4jLicensingComponent = () => {
  const [songInput, setSongInput] = useState({
    title: '',
    description: '',
    views: 0
  });

  const [licensingInput, setLicensingInput] = useState({
    wallet: '',
    licenseFee: 0,
    views: 0,
    deadline: ''
  });

  const [successMessage, setSuccessMessage] = useState(null);

  const handleSongInputChange = (e) => {
    setSongInput({
      ...songInput,
      [e.target.name]: e.target.value
    });
  };

  const handleLicensingInputChange = (e) => {
    setLicensingInput({
      ...licensingInput,
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
      const createSongQuery = `
        CREATE (song:Song $songInput)
      `;
      await session.run(createSongQuery, { songInput });

      const createLicensingCompanyQuery = `
        CREATE (licensingCompany:LicensingCompany $licensingInput)
      `;
      await session.run(createLicensingCompanyQuery, { licensingInput });

      const createRelationshipQuery = `
        MATCH (song:Song {title: $songTitle}),
              (licensingCompany:LicensingCompany {wallet: $licensingWallet})
        CREATE (song)-[:LicensedTo {
          accessFlag: $accessFlag,
          txnHash: $txnHash,
          aclToken: $aclToken
        }]->(licensingCompany)
      `;
      await session.run(createRelationshipQuery, {
        songTitle: songInput.title,
        licensingWallet: licensingInput.wallet,
        accessFlag: true, // Replace with actual boolean value
        txnHash: 'YourTxnHash', // Replace with actual string value
        aclToken: 'YourACLToken' // Replace with actual string value
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

      <h1>Welcome to the Neo4j Licensing React App!</h1>
      
      <form onSubmit={handleSubmit}>
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

        {/* Licensing Company Form */}
        <label>
          Licensing Wallet:
          <input type="text" name="wallet" value={licensingInput.wallet} onChange={handleLicensingInputChange} />
        </label>
        <label>
          License Fee:
          <input type="number" name="licenseFee" value={licensingInput.licenseFee} onChange={handleLicensingInputChange} />
        </label>
        <label>
          Views:
          <input type="number" name="views" value={licensingInput.views} onChange={handleLicensingInputChange} />
        </label>
        <label>
          Deadline:
          <input type="text" name="deadline" value={licensingInput.deadline} onChange={handleLicensingInputChange} />
        </label>

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Neo4jLicensingComponent;
