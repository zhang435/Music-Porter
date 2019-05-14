var DB_CONNECTION_LOCAL = {
    user: "xplywmiccxoqla",
    password: "0a116ba1d118df5e9a21b651a479f6ad637d775ed08bc0ca7c5abdb08aba92a3",
    database: "db048t0ojvr0hg",
    host: "ec2-23-21-244-254.compute-1.amazonaws.com",
    port: 5432,
    ssl: true
  };
  
  var DB_CONNECTION_SERVER = {
    connectionString: process.env.DATABASE_URL,
    ssl: true
  };
  module.exports = {
    DB_CONNECTION_LOCAL,
    DB_CONNECTION_SERVER
  };