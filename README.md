# GitHub Profile Analyzer API

Backend service that analyzes a GitHub user's public profile using the GitHub REST API and stores useful insights in MySQL.

## Assignment Overview

| Requirement | Status |
|-------------|--------|
| Fetch public GitHub profile by username | Done |
| Store useful insights in MySQL | Done |
| API to fetch all analyzed profiles | Done |
| API to fetch single profile data | Done |
| Node.js + Express.js + MySQL | Done |
| Third-party GitHub API integration | Done |

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL (mysql2)
- **Third-party API:** GitHub REST API (axios)
- **Other:** dotenv, cors, helmet

## Features

### Required
- Analyze a GitHub user by username
- Store profile insights in MySQL
- List all analyzed profiles
- Get a single stored profile

### Bonus / Improvements
- Repo-level insights stored in `github_repos` (language, stars, forks, description)
- Computes `top_language` and `total_stars` across all repos
- Upsert on re-analyze (no duplicate profiles)
- Rate limiting (100 requests / 15 minutes)
- Security headers via Helmet
- Centralized error handling (GitHub 404, rate limits, DB errors)
- Health check endpoint

## Stored Insights

### `github_profiles`
| Field | Description |
|-------|-------------|
| username | GitHub login |
| name | Display name |
| bio | Profile bio |
| avatar_url | Profile picture URL |
| public_repos | Public repository count |
| followers | Follower count |
| following | Following count |
| top_language | Most used language across repos |
| total_stars | Sum of stars across all repos |
| account_created_at | GitHub account creation date |
| last_analyzed_at | Last time profile was analyzed |

### `github_repos`
| Field | Description |
|-------|-------------|
| repo_name | Repository name |
| repo_full_name | Full name (owner/repo) |
| description | Repo description |
| language | Primary language |
| stars | Star count |
| forks | Fork count |
| url | GitHub URL |
| created_at_github | Repo creation date on GitHub |

## Database Schema

Schema file: [`schema.sql`](./schema.sql)

```bash
# Local MySQL
mysql -u root -p < schema.sql

# Railway / hosted MySQL (tables only — skip CREATE DATABASE)
# Run the CREATE TABLE statements from schema.sql in your hosted DB
```

## Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Github_Analyzer
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=github_analyzer
GITHUB_TOKEN=          # optional, recommended for production
```

### 4. Create database tables

```bash
mysql -u root -p < schema.sql
```

### 5. Start the server

```bash
npm start
```

Server runs at `http://localhost:3000`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/analyze/:username` | Fetch from GitHub and store/update profile |
| GET | `/api/profiles` | Get all analyzed profiles |
| GET | `/api/profiles/:username` | Get single profile |
| GET | `/api/profiles/:username/repos` | Get stored repo insights |
| DELETE | `/api/profiles/:username` | Delete profile from database |

## Example Requests

```bash
# Analyze a user
curl -X POST http://localhost:3000/api/analyze/octocat

# List all profiles
curl http://localhost:3000/api/profiles

# Get one profile
curl http://localhost:3000/api/profiles/octocat

# Get repos for a user
curl http://localhost:3000/api/profiles/octocat/repos
```

### Sample Response — Analyze Profile

```json
{
  "success": true,
  "message": "Profile \"octocat\" analyzed and stored successfully.",
  "data": {
    "username": "octocat",
    "name": "The Octocat",
    "public_repos": 8,
    "followers": 22879,
    "following": 9,
    "top_language": "CSS",
    "total_stars": 21499,
    "last_analyzed_at": "2026-06-07T20:52:19.000Z"
  },
  "reposStored": 8
}
```

## Postman Collection

Import the collection from:

```
postman/GitHub-Profile-Analyzer.postman_collection.json
```

Set the `baseUrl` variable to your live API URL (e.g. `https://your-app.up.railway.app`).

## Deploy to Railway (Live API)

You already have MySQL on Railway. To deploy the API:

1. Push this project to GitHub
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
3. Select your repository
4. Add environment variables in Railway dashboard:
   - `PORT` = `3000`
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (from your Railway MySQL service)
   - `GITHUB_TOKEN` (optional)
5. Run the `CREATE TABLE` statements from `schema.sql` in your Railway MySQL database
6. Railway will give you a public URL like `https://your-app.up.railway.app`

Test live:

```bash
curl https://your-app.up.railway.app/health
curl -X POST https://your-app.up.railway.app/api/analyze/octocat
```

## Project Structure

```
├── server.js
├── schema.sql
├── db/connection.js
├── routes/
├── controllers/
├── services/githubService.js
├── middleware/
└── postman/
```

## Author

Your Name — replace with your details before submission.
