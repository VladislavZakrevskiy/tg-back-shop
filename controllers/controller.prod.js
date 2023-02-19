const db = require('../db')

class prodController {
    async makeProd(req, res){
        const {title, price} = req.body
        try {
            const data = await db.query('insert into products(title, price) values ($1,$2) returning *', [title, price])
            res.json(data.rows[0])
        } catch (error) {
            console.log(error)
        }
        
    }

    async deleteProd(req, res){
        const {title} = req.body
        db
        .query('delete from products where title = $1', [title])
        .then(data=>res.json(data))
        .catch(e=>console.log(e))
    }

    async getAllProd(req, res){ 
        console.log('yes')
        db
        .query('select * from products')
        .then(data=>res.json(data))
        .catch(e=>console.log(e))
    }
}

module.exports = new prodController()