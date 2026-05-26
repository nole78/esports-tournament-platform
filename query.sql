CREATE TABLE users (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name    VARCHAR(100) NOT NULL,
  gamer_tag     VARCHAR(40)  NOT NULL UNIQUE,
  email        VARCHAR(120) NOT NULL UNIQUE,
  passwordHash VARCHAR(255) NOT NULL,
  role         ENUM('player','admin') DEFAULT 'player',
  profile_picture LONGTEXT,
  isActive     TINYINT(1)   DEFAULT 1,
  createdAt    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_gamer_tag (gamer_tag),
  INDEX idx_email (email),
  CONSTRAINT gamer_tag_format CHECK (
    gamer_tag REGEXP '^[a-zA-Z0-9.-]{3,30}$'
  ),
  CONSTRAINT email_format CHECK (
    email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  )

);

CREATE TABLE teams(
  team_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  team_name VARCHAR(100) NOT NULL UNIQUE,
  team_tag VARCHAR(10) NOT NULL UNIQUE,
  team_logotip LONGTEXT,
  team_description TEXT,
  CONSTRAINT team_name_length CHECK (
    LENGTH(team_name) BETWEEN 2 AND 80
  ),
  CONSTRAINT team_tag_format CHECK (
    team_tag REGEXP '^[A-Z0-9]{2,6}$'
  )
);

CREATE TABLE games(
  game_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  game_name VARCHAR(100) NOT NULL UNIQUE,
  game_logotip LONGTEXT,
  game_genre VARCHAR(50) NOT NULL,
  players_per_team INT UNSIGNED NOT NULL
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
  FOREIGN KEY (tournament_game_id) REFERENCES games(game_id),
  CONSTRAINT tournament_name_length CHECK (LENGTH(tournament_name) BETWEEN 3 AND 120),
  CONSTRAINT tournament_max_teams_check CHECK (
    tournament_max_teams BETWEEN 4 AND 256 AND 
    (tournament_format = 'round_robin' OR ((tournament_max_teams & (tournament_max_teams - 1)) = 0))
  )
  
);

CREATE TABLE matches(
  match_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tournament_id INT UNSIGNED NOT NULL,
  blue_team_id INT UNSIGNED NULL,
  red_team_id INT UNSIGNED NULL,
  winner_team_id INT UNSIGNED NULL,
  status ENUM('scheduled','ongoing','completed') DEFAULT 'scheduled',
  round_number INT UNSIGNED NOT NULL,
  bracket_type ENUM('winner','loser','grand_final') NULL,

  blue_team_score TINYINT UNSIGNED NULL,
  red_team_score TINYINT UNSIGNED NULL,

  winner_to_match_id INT UNSIGNED NULL,
  winner_to_slot ENUM('blue','red') NULL,

  loser_to_match_id INT UNSIGNED NULL,
  loser_to_slot ENUM('blue','red') NULL,

  FOREIGN KEY (tournament_id)
    REFERENCES tournaments(tournament_id)
    ON DELETE CASCADE,
  FOREIGN KEY (blue_team_id)
    REFERENCES teams(team_id),
  FOREIGN KEY (red_team_id)
    REFERENCES teams(team_id),
  FOREIGN KEY (winner_team_id)
    REFERENCES teams(team_id),
  FOREIGN KEY (winner_to_match_id)
    REFERENCES matches(match_id),
  FOREIGN KEY (loser_to_match_id)
    REFERENCES matches(match_id)
);

CREATE TABLE team_members(
  team_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  role ENUM('captain','member'),
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (team_id, user_id),
  FOREIGN KEY (team_id) REFERENCES teams(team_id)
  ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
  ON DELETE CASCADE
);

CREATE TABLE tournament_registrations(
  team_id INT UNSIGNED NOT NULL,
  tournament_id INT UNSIGNED NOT NULL,
  seed INT UNSIGNED NULL,
  status ENUM('pending','confirmed','disqualified') DEFAULT 'pending',
  registered_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
  PRIMARY KEY (team_id, tournament_id),
  FOREIGN KEY (team_id) REFERENCES teams(team_id)
  ON DELETE CASCADE,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(tournament_id)
  ON DELETE CASCADE
);

CREATE TABLE match_players( 
  user_id INT UNSIGNED NOT NULL,
  team_id INT UNSIGNED NOT NULL,
  match_id INT UNSIGNED NOT NULL,
  performance_notes TEXT, 
  PRIMARY KEY (user_id, match_id, team_id),
  FOREIGN KEY (team_id, user_id) REFERENCES team_members(team_id, user_id),
  FOREIGN KEY (match_id) REFERENCES matches(match_id)
);

CREATE TABLE user_watchlist(
  user_id INT UNSIGNED NOT NULL,
  tournament_id INT UNSIGNED NOT NULL,
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, tournament_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
  ON DELETE CASCADE,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(tournament_id)
  ON DELETE CASCADE
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

CREATE TABLE team_invites(
  user_id INT UNSIGNED NOT NULL,
  team_id INT UNSIGNED NOT NULL,
  status ENUM('pending', 'accepted', 'rejected'),
  invited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, team_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (team_id) REFERENCES teams(team_id)
);