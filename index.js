// Assuming you are using Node.js on the server-side
const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "mysql-298e5459-juliangabriel570-d1af.a.aivencloud.com",
  port: 21976,
  user: "avnadmin",
  password: "AVNS_BqpSAwKqIeMrFVry2Pv",
  database: "defaultdb",
  ssl: {
    rejectUnauthorized: true,
  },
});

exports.handler = async (event) => {
  const body = JSON.parse(event.body);

  // Perform user registration or login logic here using the provided data
  const username = body.username;
  const email = body.email;
  const idToken = body.idToken;

  // Insert or update user in the database
  const sql = "INSERT INTO users (username, email, id_token) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE username = ?";
  const values = [username, email, idToken, username];

  connection.query(sql, values, (error, results) => {
    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Internal Server Error" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Success" }),
    };
  });
};
