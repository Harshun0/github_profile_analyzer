CREATE DATABASE IF NOT EXISTS github_analyzer;
USE github_analyzer;

CREATE TABLE IF NOT EXISTS github_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  bio TEXT,
  avatar_url VARCHAR(512),
  public_repos INT DEFAULT 0,
  followers INT DEFAULT 0,
  following INT DEFAULT 0,
  top_language VARCHAR(100),
  total_stars INT DEFAULT 0,
  account_created_at DATETIME,
  last_analyzed_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username)
);

CREATE TABLE IF NOT EXISTS github_repos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  profile_id INT NOT NULL,
  repo_name VARCHAR(255) NOT NULL,
  repo_full_name VARCHAR(512) NOT NULL,
  description TEXT,
  language VARCHAR(100),
  stars INT DEFAULT 0,
  forks INT DEFAULT 0,
  url VARCHAR(512),
  created_at_github DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (profile_id) REFERENCES github_profiles(id) ON DELETE CASCADE,
  UNIQUE KEY unique_profile_repo (profile_id, repo_name),
  INDEX idx_profile_id (profile_id)
);
