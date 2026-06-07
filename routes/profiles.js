const express = require('express');
const {
  getAllProfiles,
  getProfileByUsername,
  getProfileRepos,
  deleteProfile,
} = require('../controllers/profilesController');

const router = express.Router();

router.get('/', getAllProfiles);
router.get('/:username/repos', getProfileRepos);
router.get('/:username', getProfileByUsername);
router.delete('/:username', deleteProfile);

module.exports = router;
