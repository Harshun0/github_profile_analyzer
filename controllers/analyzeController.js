const pool = require('../db/connection');
const {
  fetchUserProfile,
  fetchUserRepos,
  computeInsights,
} = require('../services/githubService');

async function analyzeProfile(req, res, next) {
  const { username } = req.params;

  if (!username || !username.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Username is required.',
    });
  }

  const lookupUsername = username.trim();

  try {
    const [profile, repos] = await Promise.all([
      fetchUserProfile(lookupUsername),
      fetchUserRepos(lookupUsername),
    ]);

    const canonicalUsername = profile.login;

    const { totalStars, topLanguage } = computeInsights(repos);
    const now = new Date();

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [existing] = await connection.execute(
        'SELECT id FROM github_profiles WHERE LOWER(username) = LOWER(?)',
        [canonicalUsername]
      );

      let profileId;

      const profileData = [
        profile.name || null,
        profile.bio || null,
        profile.avatar_url || null,
        profile.public_repos ?? 0,
        profile.followers ?? 0,
        profile.following ?? 0,
        topLanguage,
        totalStars,
        profile.created_at ? new Date(profile.created_at) : null,
        now,
      ];

      if (existing.length > 0) {
        profileId = existing[0].id;

        await connection.execute(
          `UPDATE github_profiles SET
            name = ?, bio = ?, avatar_url = ?,
            public_repos = ?, followers = ?, following = ?,
            top_language = ?, total_stars = ?,
            account_created_at = ?, last_analyzed_at = ?
          WHERE id = ?`,
          [...profileData, profileId]
        );

        await connection.execute(
          'DELETE FROM github_repos WHERE profile_id = ?',
          [profileId]
        );
      } else {
        const [result] = await connection.execute(
          `INSERT INTO github_profiles
            (username, name, bio, avatar_url, public_repos, followers, following,
             top_language, total_stars, account_created_at, last_analyzed_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [canonicalUsername, ...profileData]
        );
        profileId = result.insertId;
      }

      if (repos.length > 0) {
        const repoValues = repos.map((repo) => [
          profileId,
          repo.name,
          repo.full_name,
          repo.description || null,
          repo.language || null,
          repo.stargazers_count ?? 0,
          repo.forks_count ?? 0,
          repo.html_url || null,
          repo.created_at ? new Date(repo.created_at) : null,
        ]);

        const placeholders = repoValues.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
        const flatValues = repoValues.flat();

        await connection.execute(
          `INSERT INTO github_repos
            (profile_id, repo_name, repo_full_name, description, language, stars, forks, url, created_at_github)
          VALUES ${placeholders}`,
          flatValues
        );
      }

      await connection.commit();

      const [savedProfile] = await pool.execute(
        'SELECT * FROM github_profiles WHERE id = ?',
        [profileId]
      );

      res.status(existing.length > 0 ? 200 : 201).json({
        success: true,
        message: existing.length > 0
          ? `Profile "${canonicalUsername}" updated successfully.`
          : `Profile "${canonicalUsername}" analyzed and stored successfully.`,
        data: savedProfile[0],
        reposStored: repos.length,
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    next(err);
  }
}

module.exports = { analyzeProfile };
