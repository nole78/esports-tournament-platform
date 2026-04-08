CREATE DATABASE pulse_grid CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE pulse_grid;

CREATE TABLE users (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name    VARCHAR(100) NOT NULL,
  gamer_tag     VARCHAR(40)  NOT NULL UNIQUE,
  email        VARCHAR(120) NOT NULL UNIQUE,
  passwordHash VARCHAR(255) NOT NULL,
  role         ENUM('player','admin') DEFAULT 'player',
  profile_picture TEXT,
  isActive     TINYINT(1)   DEFAULT 1,
  createdAt    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_gamer_tag (gamer_tag),
  INDEX idx_email (email)
);

CREATE TABLE teams(
  team_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  team_name VARCHAR(100) NOT NULL UNIQUE,
  team_tag VARCHAR(10) NOT NULL UNIQUE,
  team_logotip TEXT,
  team_description TEXT
);

CREATE TABLE games(
  game_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  game_name VARCHAR(100) NOT NULL UNIQUE,
  game_logotip TEXT,
  game_genre VARCHAR(50) NOT NULL,
  game_players INT UNSIGNED NOT NULL
);

CREATE TABLE tournaments(
  tournament_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tournament_name VARCHAR(100) NOT NULL UNIQUE,
  tournament_game_id INT UNSIGNED NOT NULL,
  tournament_format ENUM('single_elimination', 'double_elimination', 'round_robin') DEFAULT 'single_elimination',
  tournament_max_teams INT UNSIGNED NOT NULL,
  tournament_application_deadline DATETIME,
  tournament_prize_fund INT UNSIGNED NOT NULL,
  tournament_status ENUM('upcoming','active','completed') DEFAULT 'upcoming',
  FOREIGN KEY (tournament_game_id) REFERENCES games(game_id)
);

CREATE TABLE matches(
  match_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  blue_team_id INT UNSIGNED NOT NULL,
  red_team_id INT UNSIGNED NOT NULL,
  match_result VARCHAR(4),
  status ENUM('scheduled','ongoing','completed'),
  match_round ENUM('round_of_16','quarterfinal','semifinal','final'),
  FOREIGN KEY (blue_team_id) REFERENCES teams(team_id),
  FOREIGN KEY (red_team_id) REFERENCES teams(team_id)
);

CREATE TABLE team_members(
  team_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  role ENUM('captain','member'),
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (team_id, user_id),
  FOREIGN KEY (team_id) REFERENCES teams(team_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE tournament_registrations(
  team_id INT UNSIGNED NOT NULL,
  tournament_id INT UNSIGNED NOT NULL,
  seed INT UNSIGNED NULL,
  status ENUM('pending','confirmed','disqualified') DEFAULT 'pending',
  registered_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
  PRIMARY KEY (team_id, tournament_id),
  FOREIGN KEY (team_id) REFERENCES teams(team_id),
  FOREIGN KEY (tournament_id) REFERENCES tournaments(tournament_id)
);

CREATE TABLE match_players( 
  user_id INT UNSIGNED NOT NULL,
  team_id INT UNSIGNED NOT NULL,
  match_id INT UNSIGNED NOT NULL,
  performance_notes TEXT, 
  PRIMARY KEY (user_id, match_id, team_id),
  FOREIGN KEY (user_id) REFERENCES team_members(user_id),
  FOREIGN KEY (team_id) REFERENCES team_members(team_id),
  FOREIGN KEY (match_id) REFERENCES matches(match_id)
);

CREATE TABLE user_watchlist(
  user_id INT UNSIGNED NOT NULL,
  tournament_id INT UNSIGNED NOT NULL,
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, tournament_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (tournament_id) REFERENCES tournaments(tournament_id)
);

CREATE TABLE audit_log (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NULL,
  action     VARCHAR(80)  NOT NULL,
  entity     VARCHAR(40),
  entity_id   INT UNSIGNED NULL,
  meta       TEXT NULL,
  ipAddress  VARCHAR(45),
  createdAt  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);