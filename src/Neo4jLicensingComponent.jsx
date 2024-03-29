import React, { useState } from 'react';
import neo4j from 'neo4j-driver';

const Neo4jLicensingComponent = () => {
  const [songInput, setSongInput] = useState({
    title: '',
  });

  const [licensingInput, setLicensingInput] = useState({
    companyName: '',
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

  const handleSubmitLicensing = async (e) => {
    e.preventDefault();

    const uri = 'neo4j+s://65e55caf.databases.neo4j.io';
    const user = 'neo4j';
    const password = 'hVUozIMUzjjnf8IxrcTyt15ASaEodaErxR-PgzAcdrw';

    const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
    const session = driver.session();

    try {
      // Check if the song already exists
      const existingSongQuery = `
        MATCH (song:Song {title: $songTitle})
        RETURN song
      `;
      const existingSongResult = await session.run(existingSongQuery, { songTitle: songInput.title });

      if (!existingSongResult.records.length) {
        throw new Error('The specified song does not exist.');
      }

      const createLicensedToRelationshipQuery = `
        MATCH (song:Song {title: $songTitle})
        CREATE (song)-[:LicensedTo {
          accessFlag: $accessFlag,
          txnHash: $txnHash,
          aclToken: $aclToken
        }]->(:LicensingCompany {
          companyName: $companyName,
          wallet: $licensingWallet,
          licenseFee: $licenseFee,
          views: $views,
          deadline: $deadline
        })
      `;
      await session.run(createLicensedToRelationshipQuery, {
        songTitle: songInput.title,
        accessFlag: true, // Replace with actual boolean value
        txnHash: 'YourTxnHash', // Replace with actual string value
        aclToken: 'YourACLToken', // Replace with actual string value
        companyName: licensingInput.companyName,
        licensingWallet: licensingInput.wallet,
        licenseFee: licensingInput.licenseFee,
        views: licensingInput.views,
        deadline: licensingInput.deadline
      });

      setSuccessMessage('Nodes and relationships created successfully');
    } catch (error) {
      console.error(error.message);
      setSuccessMessage('Error occurred during the process');
    } finally {
      session.close();
      driver.close();
    }
  };

  return (
    <div>
      {successMessage && <p>{successMessage}</p>}

      <h1>Welcome to the Neo4j React App!</h1>
      
      <form onSubmit={handleSubmitLicensing}>
        {/* Song Form */}
        <label>
          Song Title:
          <input type="text" name="title" value={songInput.title} onChange={handleSongInputChange} />
        </label>

        {/* Licensing Company Form */}
        <label>
          Company Name (Primary Key):
          <input type="text" name="companyName" value={licensingInput.companyName} onChange={handleLicensingInputChange} />
        </label>
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

        <button type="submit">Connect Licensing Company to Song</button>
      </form>
    </div>
  );
};

export default Neo4jLicensingComponent;
