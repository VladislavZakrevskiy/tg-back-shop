const express = require('express');
const router = express.Router()
const prodController = require('../controllers/controller.prod')

router.post('/make', prodController.makeProd)
router.delete('/delete', prodController.deleteProd)
router.get('/get', prodController.getAllProd)

module.exports = router