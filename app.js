const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());
const databasePath = path.join(__dirname, "cricketTeam.db");
let database = null;
const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (error) {
    console.log(`DB ERROR: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//GET ALL PLAYERS
app.get("/players/", async (request, response) => {
  const getAllPlayersQuery = `
    SELECT *
    FROM cricket_team;
    `;
  const allPlayers = await database.all(getAllPlayersQuery);
  response.send(allPlayers);
});

//ADDING NEW PLAYER
app.post("/players/", async (request, response) => {
  try {
    const { playerName, jerseyNumber, role } = request.body;
    const addPlayerQuery = `
    INSERT INTO
    cricket_team (player_name, jersey_number, role)
    VALUES ('${playerName}', '${jerseyNumber}', '${role}');
    `;
    await database.run(addPlayerQuery);
    response.send("Player Added To Team");
  } catch (error) {
    console.log(`DB ERROR: ${error.message}`);
  }
});

//GETTING PLAYER ON THE BASIS OF PLAYER ID
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT *
    FROM cricket_team
    WHERE player_id = ${playerId};
    `;
  const getPlayer = await database.get(getPlayerQuery);
  response.send(getPlayer);
});

//UPDATING PLAYER ON THE BASIS OF PLAYER ID
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const updatePlayerQuery = `
    UPDATE cricket_team
    SET 
        player_name = ${playerName},
        jersey_number = ${jerseyNumber},
        role = ${role}
    WHERE player_id = ${playerId};
    `;
  await database.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//DELETE PLAYER ON THE BASIS OD PLAYER ID
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM cricket_team
    WHERE player_id = ${playerId}`;
  await database.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
