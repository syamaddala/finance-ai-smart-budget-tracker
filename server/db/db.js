require("dotenv").config()

const mysql = require("mysql2")

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

pool.getConnection((err, connection) => {
  if (err) {
    console.log("Database connection failed")
    console.log(err)
    return
  }

  console.log("MySQL Connected")

  if (connection) connection.release()
})

module.exports = pool.promise()