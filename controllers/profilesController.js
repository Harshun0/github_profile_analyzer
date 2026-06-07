const pool = require('../db/connection');

async function getAllProfiles(req, res, next) {
  try {
    const [profiles] = await pool.execute(
      `SELECT id, username, name, bio, avatar_url, public_repos, followers, following,
              top_language, total_stars, account_created_at, last_analyzed_at
       FROM github_profiles
       ORDER BY last_analyzed_at DESC`
    );

    res.json({
      success: true,
      count: profiles.length,
      data: profiles,
    });
  } catch (err) {
    next(err);
  }
}

async function getProfileByUsername(req, res, next) {
  const { username } = req.params;
  const lookupUsername = username.trim();

  try {
    const [profiles] = await pool.execute(
      'SELECT * FROM github_profiles WHERE LOWER(username) = LOWER(?)',
      [lookupUsername]
    );

    if (profiles.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Profile "${lookupUsername}" not found in database. Run POST /api/analyze/${lookupUsername} first.`,
      });
    }

    res.json({
      success: true,
      data: profiles[0],
    });
  } catch (err) {
    next(err);
  }
}

async function getProfileRepos(req, res, next) {
  const { username } = req.params;
  const lookupUsername = username.trim();

  try {
    const [profiles] = await pool.execute(
      'SELECT id, username FROM github_profiles WHERE LOWER(username) = LOWER(?)',
      [lookupUsername]
    );

    if (profiles.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Profile "${lookupUsername}" not found in database.`,
      });
    }

    const profileId = profiles[0].id;
    const canonicalUsername = profiles[0].username;

    const [repos] = await pool.execute(
      `SELECT repo_name, repo_full_name, description, language, stars, forks, url, created_at_github
       FROM github_repos
       WHERE profile_id = ?
       ORDER BY stars DESC`,
      [profileId]
    );

    res.json({
      success: true,
      username: canonicalUsername,
      count: repos.length,
      data: repos,
    });
  } catch (err) {
    next(err);
  }
}

async function deleteProfile(req, res, next) {
  const { username } = req.params;
  const lookupUsername = username.trim();

  try {
    const [result] = await pool.execute(
      'DELETE FROM github_profiles WHERE LOWER(username) = LOWER(?)',
      [lookupUsername]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: `Profile "${lookupUsername}" not found in database.`,
      });
    }

    res.json({
      success: true,
      message: `Profile "${lookupUsername}" deleted successfully.`,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllProfiles,
  getProfileByUsername,
  getProfileRepos,
  deleteProfile,
};
