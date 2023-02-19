const db = require('../db')
const path = require('path');



class imageController {
    async upload(req, res) {
        const {id} = req.params
        const { filename, mimetype, size } = req.file;
        const filepath = req.file.path
        await db
        .query('insert into image_files (filename, filepath, mimetype,size, prod_id) values ($1,$2,$3,$4, $5)', [filename, filepath, mimetype, size, id])
        .then(()=>{
            res.json('suc')
        })
        .catch(e => {
            res.json('rej')
          console.log(e)
        })
      }
    async load(req, res){
        const {id} = req.params
        const images = await db
        .query('select * from image_files where prod_id = $1', [id])
        .catch(e => {
            console.log(e)
        })
        try {
            if (images.rows[0]) {
                const dirname = path.resolve();
                const fullfilepath = path.join(dirname, images.rows[0].filepath);
                return res.type(images.rows[0].mimetype).sendFile(fullfilepath);
            }
            return res.status(400).json({ success: false, message: 'not found'});
            }
            catch (error) {
            res.status(404).json({ success: false, message: 'not found', stack: err.stack })    
            }
        }
}


module.exports = new imageController()