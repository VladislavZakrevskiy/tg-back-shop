const express = require('express');
const multer = require('multer');
const router = express.Router()
const imageController = require('../controllers/controller.images')

const imageUpload = multer({
   dest: 'images',
  }); 

router.post('/:id', imageUpload.single('image'), imageController.upload)
router.get('/:id', imageController.load)




module.exports = router