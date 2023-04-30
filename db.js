const Pool = require('pg').Pool
const pool = new Pool({
    user: "postgres",
    password: "1234",
    host: "localhost",
    port: 5432,
    database:"tg_bot"
})

// render не дает > 1 db. у меня уже 1
 
module.exports = pool