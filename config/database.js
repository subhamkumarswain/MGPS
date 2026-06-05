const oracledb = require('oracledb');

// Set up Oracle configuration
try {
  if (oracledb.initOracleClient) {
    oracledb.initOracleClient({ libDir: process.env.ORACLE_CLIENT_LIB_DIR || '' }).catch(err => {
      if (err.code === 'NJS-090-1') {
        console.log('Oracle Client Library already initialized');
      } else {
        console.error('Error initializing Oracle Client Library:', err);
      }
    });
  }
} catch (err) {
  console.log('Oracle Client initialization skipped (thin mode or already initialized)');
}

const dbConfig = {
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PASSWORD,
  connectString: process.env.ORACLE_CONNECTIONSTRING
};

// Create a connection pool
async function initializePool() {
  try {
    await oracledb.createPool({
      user: dbConfig.user,
      password: dbConfig.password,
      connectString: dbConfig.connectString,
      min: 2,
      max: 10,
      increment: 1
    });
    console.log('Database connection pool created successfully');
  } catch (err) {
    console.error('Error creating connection pool:', err);
    process.exit(1);
  }
}

// Get a connection from the pool
async function getConnection() {
  try {
    const conn = await oracledb.getConnection();
    return conn;
  } catch (err) {
    console.error('Error getting connection:', err);
    throw err;
  }
}

// Close connection
async function closeConnection(conn) {
  try {
    if (conn) {
      await conn.close();
    }
  } catch (err) {
    console.error('Error closing connection:', err);
  }
}

module.exports = {
  initializePool,
  getConnection,
  closeConnection
};
