const express = require('express');
const { createClaim, getMyClaims, getClaim, getClaimStats } = require('../controllers/claimsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // all routes require auth

router.post('/', createClaim);
router.get('/', getMyClaims);
router.get('/stats', getClaimStats);
router.get('/:id', getClaim);

module.exports = router;
