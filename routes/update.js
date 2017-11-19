var express = require('express');
var router = express.Router();

/* GET home page. */
router.post('/update', function(req, res, next) {
  console.log(req.body)
  // res.render('index', { title: 'Express' });
});

module.exports = router;
