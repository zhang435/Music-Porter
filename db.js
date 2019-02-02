const Credentials = require("./pw");
const {
    Client
} = require('pg');

var XIAMI_TABLENAME = "xiami"
var NETEASE_TABLENAME = "netease"

// heroku pg:psql -a  still-brushlands-47642  

async function connect() {
    // config is in local or server env
    credential = Credentials.DB_CONNECTION_SERVER;

    if (credential.connectionString === undefined) {
        credential = Credentials.DB_CONNECTION_LOCAL
    }
    console.log("DATABASE_URL", process.env.DATABASE_URL)
    const client = new Client(credential);


    return new Promise((resolve, reject) => {
        client.connect((err, client, done) => {
            if (err) {
                resolve({
                    success: false,
                    message: err
                })
            }

            resolve({
                success: true,
                val: client
            });
        });
    })
}


function insert(source, playListUrl) {

    const now = new Date()
    connect().then(res => {
        if (res.success) {
            var client = res.val;

            q = `insert into ${source} values('${playListUrl}','${now.toISOString()}');`
            console.log(q);
            client.query(q, (err, res) => {
                if (err) {
                    console.debug("database connection error", err);
                    return;
                } else {
                    client.end();
                    console.debug("successful insert url, close connection");
                }
            });
        }
    })
}

module.exports = {
    insert,
    XIAMI_TABLENAME,
    NETEASE_TABLENAME
}