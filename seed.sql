-- =============================================================
--  ESPORTS TOURNAMENT DATABASE - INITIAL SEED
--  Formats: single_elimination | double_elimination | round_robin
--  4 teams per tournament, all matches generated
-- =============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- -------------------------------------------------------------
-- USERS  (passwordHash = bcrypt placeholder)
-- -------------------------------------------------------------
INSERT INTO users (id, full_name, gamer_tag, email, passwordHash, role, isActive) VALUES
  (1, 'Alice Johnson',  'AliceJ',      'alice@example.com', '$2b$12$HASH_ALICE_PLACEHOLDER',  'player', 1),
  (2, 'Bob Martinez',   'BobM.pro',    'bob@example.com',   '$2b$12$HASH_BOB_PLACEHOLDER',    'player', 1),
  (3, 'Carol Williams', 'Carol.Win',   'carol@example.com', '$2b$12$HASH_CAROL_PLACEHOLDER',  'player', 1),
  (4, 'David Lee',      'DaveLee99',   'david@example.com', '$2b$12$HASH_DAVID_PLACEHOLDER',  'player', 1),
  (5, 'Eva Brown',      'EvaB.gg',     'eva@example.com',   '$2b$12$HASH_EVA_PLACEHOLDER',    'player', 1),
  (6, 'Frank Chen',     'FrankC',      'frank@example.com', '$2b$12$HASH_FRANK_PLACEHOLDER',  'player', 1),
  (7, 'Grace Kim',      'GraceK',      'grace@example.com', '$2b$12$HASH_GRACE_PLACEHOLDER',  'player', 1),
  (8, 'Henry Park',     'HenryP',      'henry@example.com', '$2b$12$HASH_HENRY_PLACEHOLDER',  'player', 1),
  (9, 'Ivy Scott',      'IvyS.gg',     'ivy@example.com',   '$2b$12$HASH_IVY_PLACEHOLDER',    'player', 1),
  (10,'Jake Turner',    'JakeT',       'jake@example.com',  '$2b$12$HASH_JAKE_PLACEHOLDER',   'player', 1),
  (11,'Karen White',    'KarenW',      'karen@example.com', '$2b$12$HASH_KAREN_PLACEHOLDER',  'player', 1),
  (12,'Leo Harris',     'LeoH',        'leo@example.com',   '$2b$12$HASH_LEO_PLACEHOLDER',    'player', 1),
  (13,'Mia Adams',      'MiaA',        'mia@example.com',   '$2b$12$HASH_MIA_PLACEHOLDER',    'player', 1),
  (14,'Noah Clark',     'NoahC',       'noah@example.com',  '$2b$12$HASH_NOAH_PLACEHOLDER',   'player', 1),
  (15,'Olivia Lewis',   'OliviaL',     'olivia@example.com','$2b$12$HASH_OLIVIA_PLACEHOLDER', 'player', 1),
  (16,'Paul Walker',    'PaulW',       'paul@example.com',  '$2b$12$HASH_PAUL_PLACEHOLDER',   'player', 1),
  -- Admin user
  (17,'Admin User',     'AdminOne',    'admin@example.com', '$2b$12$HASH_ADMIN_PLACEHOLDER',  'admin',  1);

-- -------------------------------------------------------------
-- GAMES
-- -------------------------------------------------------------
INSERT INTO games (game_id, game_name, game_genre, players_per_team) VALUES
  (1, 'League of Legends', 'MOBA',        5),
  (2, 'Valorant',          'Tactical FPS', 5),
  (3, 'Rocket League',     'Sports',       3);

-- -------------------------------------------------------------
-- TEAMS  (4 teams, team_tag must match ^[A-Z0-9]{2,6}$)
-- -------------------------------------------------------------
INSERT INTO teams (team_id, team_name, team_tag, team_description) VALUES
  (1, 'Alpha Squad',    'ALPHA',  'Aggressive early-game style.'),
  (2, 'Beta Force',     'BETA',   'Macro-oriented team play.'),
  (3, 'Gamma Strike',   'GAMMA',  'Best teamfight composition.'),
  (4, 'Delta Legion',   'DELTA',  'Split-push specialists.');

-- -------------------------------------------------------------
-- TEAM MEMBERS  (4 players per team = 16 players total)
-- -------------------------------------------------------------
-- Alpha Squad (team 1): users 1-4
INSERT INTO team_members (team_id, user_id, role) VALUES
  (1, 1,  'captain'),
  (1, 2,  'member'),
  (1, 3,  'member'),
  (1, 4,  'member');

-- Beta Force (team 2): users 5-8
INSERT INTO team_members (team_id, user_id, role) VALUES
  (2, 5,  'captain'),
  (2, 6,  'member'),
  (2, 7,  'member'),
  (2, 8,  'member');

-- Gamma Strike (team 3): users 9-12
INSERT INTO team_members (team_id, user_id, role) VALUES
  (3, 9,  'captain'),
  (3, 10, 'member'),
  (3, 11, 'member'),
  (3, 12, 'member');

-- Delta Legion (team 4): users 13-16
INSERT INTO team_members (team_id, user_id, role) VALUES
  (4, 13, 'captain'),
  (4, 14, 'member'),
  (4, 15, 'member'),
  (4, 16, 'member');

-- -------------------------------------------------------------
-- TOURNAMENTS
--   T1 = single_elimination   (game: LoL,         max_teams=4)
--   T2 = double_elimination   (game: Valorant,     max_teams=4)
--   T3 = round_robin          (game: Rocket League, max_teams=4)
--   max_teams must be power-of-2, 4 satisfies: 4 & 3 = 0 ✓
-- -------------------------------------------------------------
INSERT INTO tournaments
  (tournament_id, tournament_name, tournament_game_id, tournament_format,
   tournament_max_teams, tournament_application_deadline,
   tournament_prize_fund, tournament_status)
VALUES
  (1, 'LoL Spring Cup',      1, 'single_elimination', 4, '2026-06-01 23:59:59', 5000,  'active'),
  (2, 'Valorant Iron Gauntlet', 2, 'double_elimination', 4, '2026-06-05 23:59:59', 8000, 'upcoming'),
  (3, 'Rocket League Round Battle', 3, 'round_robin',       4, '2026-06-10 23:59:59', 3000, 'upcoming');

-- -------------------------------------------------------------
-- TOURNAMENT REGISTRATIONS  (all 4 teams in each tournament)
-- -------------------------------------------------------------
INSERT INTO tournament_registrations (team_id, tournament_id, seed, status) VALUES
  -- Tournament 1 (LoL Spring Cup)
  (1, 1, 1, 'confirmed'),
  (2, 1, 2, 'confirmed'),
  (3, 1, 3, 'confirmed'),
  (4, 1, 4, 'confirmed'),
  -- Tournament 2 (Valorant Iron Gauntlet)
  (1, 2, 1, 'confirmed'),
  (2, 2, 2, 'confirmed'),
  (3, 2, 3, 'confirmed'),
  (4, 2, 4, 'confirmed'),
  -- Tournament 3 (Rocket League Round Battle)
  (1, 3, 1, 'confirmed'),
  (2, 3, 2, 'confirmed'),
  (3, 3, 3, 'confirmed'),
  (4, 3, 4, 'confirmed');

-- =============================================================
-- MATCHES
-- =============================================================

-- ---------------------------------------------------------------
-- TOURNAMENT 1 — SINGLE ELIMINATION  (4 teams → 3 matches)
--
--  Round 1 (Semifinals):
--    Match 1: Alpha(1) vs Delta(4)   → winner → Match 3 blue slot
--    Match 2: Beta(2)  vs Gamma(3)   → winner → Match 3 red  slot
--  Round 2 (Final):
--    Match 3: winner1  vs winner2
--
--  Seeding: seed1 vs seed4, seed2 vs seed3
-- ---------------------------------------------------------------
INSERT INTO matches
  (match_id, tournament_id, blue_team_id, red_team_id, winner_team_id,
   status, round_number, bracket_type,
   blue_team_score, red_team_score,
   winner_to_match_id, winner_to_slot,
   loser_to_match_id, loser_to_slot)
VALUES
  -- Semifinal A  (Alpha vs Delta → Alpha wins 1-0)
  (1, 1, 1, 4, 1,
   'completed', 1, 'winner',
   1, 0,
   3, 'blue',   -- winner goes to match 3, blue slot
   NULL, NULL), -- single elim: loser is eliminated

  -- Semifinal B  (Beta vs Gamma → Gamma wins 1-0)
  (2, 1, 2, 3, 3,
   'completed', 1, 'winner',
   0, 1,
   3, 'red',    -- winner goes to match 3, red slot
   NULL, NULL),

  -- Grand Final  (Alpha vs Gamma → Alpha wins 2-1)
  (3, 1, 1, 3, 1,
   'completed', 2, 'winner',
   2, 1,
   NULL, NULL,
   NULL, NULL);

-- ---------------------------------------------------------------
-- TOURNAMENT 2 — DOUBLE ELIMINATION  (4 teams → 7 matches)
--
--  Winner Bracket:
--    W1: seed1(Alpha) vs seed4(Delta)   → winner→W3 blue, loser→L1 blue
--    W2: seed2(Beta)  vs seed3(Gamma)   → winner→W3 red,  loser→L1 red
--    W3: WB Final (W1w vs W2w)          → winner→GF blue, loser→L2 red
--
--  Loser Bracket:
--    L1: W1-loser vs W2-loser           → winner→L2 blue
--    L2: L1w vs W3-loser               → winner→GF red
--
--  Grand Final:
--    GF: WB champion vs LB champion    (GF reset omitted for simplicity)
--
--  match_id mapping:
--    4  = W1   5  = W2   6  = W3
--    7  = L1   8  = L2
--    9  = Grand Final
-- ---------------------------------------------------------------
INSERT INTO matches
  (match_id, tournament_id, blue_team_id, red_team_id, winner_team_id,
   status, round_number, bracket_type,
   blue_team_score, red_team_score,
   winner_to_match_id, winner_to_slot,
   loser_to_match_id, loser_to_slot)
VALUES
  -- W1: Alpha vs Delta → Alpha wins
  (4, 2, 1, 4, 1,
   'completed', 1, 'winner',
   1, 0,
   6, 'blue',  -- winner → W3 blue
   7, 'blue'), -- loser  → L1 blue

  -- W2: Beta vs Gamma → Beta wins
  (5, 2, 2, 3, 2,
   'completed', 1, 'winner',
   1, 0,
   6, 'red',   -- winner → W3 red
   7, 'red'),  -- loser  → L1 red

  -- W3: Alpha vs Beta → Alpha wins (WB Final)
  (6, 2, 1, 2, 1,
   'completed', 2, 'winner',
   1, 0,
   9, 'blue',  -- winner → GF blue
   8, 'red'),  -- loser  → L2 red

  -- L1: Delta vs Gamma → Gamma wins (LB Round 1)
  (7, 2, 4, 3, 3,
   'completed', 1, 'loser',
   0, 1,
   8, 'blue',  -- winner → L2 blue
   NULL, NULL),

  -- L2: Gamma vs Beta → Beta wins (LB Final)
  (8, 2, 3, 2, 2,
   'completed', 2, 'loser',
   0, 1,
   9, 'red',   -- winner → GF red
   NULL, NULL),

  -- Grand Final: Alpha (WB) vs Beta (LB) → Alpha wins
  (9, 2, 1, 2, 1,
   'completed', 3, 'grand_final',
   2, 0,
   NULL, NULL,
   NULL, NULL);

-- ---------------------------------------------------------------
-- TOURNAMENT 3 — ROUND ROBIN  (4 teams → 6 matches, each pair once)
--
--  Pairs: (1v2)(1v3)(1v4)(2v3)(2v4)(3v4)
--  No bracket advancement — winner_to / loser_to all NULL
--  match_id 10-15
-- ---------------------------------------------------------------
INSERT INTO matches
  (match_id, tournament_id, blue_team_id, red_team_id, winner_team_id,
   status, round_number, bracket_type,
   blue_team_score, red_team_score,
   winner_to_match_id, winner_to_slot,
   loser_to_match_id, loser_to_slot)
VALUES
  -- Round 1: Alpha vs Beta
  (10, 3, 1, 2, 1,
   'scheduled', 1, NULL,
   NULL, NULL, NULL, NULL, NULL, NULL),

  -- Round 1: Gamma vs Delta
  (11, 3, 3, 4, NULL,
   'scheduled', 1, NULL,
   NULL, NULL, NULL, NULL, NULL, NULL),

  -- Round 2: Alpha vs Gamma
  (12, 3, 1, 3, NULL,
   'scheduled', 2, NULL,
   NULL, NULL, NULL, NULL, NULL, NULL),

  -- Round 2: Beta vs Delta
  (13, 3, 2, 4, NULL,
   'scheduled', 2, NULL,
   NULL, NULL, NULL, NULL, NULL, NULL),

  -- Round 3: Alpha vs Delta
  (14, 3, 1, 4, NULL,
   'scheduled', 3, NULL,
   NULL, NULL, NULL, NULL, NULL, NULL),

  -- Round 3: Beta vs Gamma
  (15, 3, 2, 3, NULL,
   'scheduled', 3, NULL,
   NULL, NULL, NULL, NULL, NULL, NULL);

-- =============================================================
-- MATCH PLAYERS  (completed matches: T1 all 3, T2 all 6)
-- Each team contributes all 4 of its members per match.
-- =============================================================

-- ---- Tournament 1 ----

-- Match 1: Alpha(1,2,3,4) vs Delta(13,14,15,16)
INSERT INTO match_players (user_id, team_id, match_id) VALUES
  (1, 1, 1),(2, 1, 1),(3, 1, 1),(4, 1, 1),
  (13,4, 1),(14,4, 1),(15,4, 1),(16,4, 1);

-- Match 2: Beta(5,6,7,8) vs Gamma(9,10,11,12)
INSERT INTO match_players (user_id, team_id, match_id) VALUES
  (5, 2, 2),(6, 2, 2),(7, 2, 2),(8, 2, 2),
  (9, 3, 2),(10,3, 2),(11,3, 2),(12,3, 2);

-- Match 3: Alpha vs Gamma (Grand Final T1)
INSERT INTO match_players (user_id, team_id, match_id) VALUES
  (1, 1, 3),(2, 1, 3),(3, 1, 3),(4, 1, 3),
  (9, 3, 3),(10,3, 3),(11,3, 3),(12,3, 3);

-- ---- Tournament 2 ----

-- Match 4 W1: Alpha vs Delta
INSERT INTO match_players (user_id, team_id, match_id) VALUES
  (1, 1, 4),(2, 1, 4),(3, 1, 4),(4, 1, 4),
  (13,4, 4),(14,4, 4),(15,4, 4),(16,4, 4);

-- Match 5 W2: Beta vs Gamma
INSERT INTO match_players (user_id, team_id, match_id) VALUES
  (5, 2, 5),(6, 2, 5),(7, 2, 5),(8, 2, 5),
  (9, 3, 5),(10,3, 5),(11,3, 5),(12,3, 5);

-- Match 6 W3: Alpha vs Beta
INSERT INTO match_players (user_id, team_id, match_id) VALUES
  (1, 1, 6),(2, 1, 6),(3, 1, 6),(4, 1, 6),
  (5, 2, 6),(6, 2, 6),(7, 2, 6),(8, 2, 6);

-- Match 7 L1: Delta vs Gamma
INSERT INTO match_players (user_id, team_id, match_id) VALUES
  (13,4, 7),(14,4, 7),(15,4, 7),(16,4, 7),
  (9, 3, 7),(10,3, 7),(11,3, 7),(12,3, 7);

-- Match 8 L2: Gamma vs Beta
INSERT INTO match_players (user_id, team_id, match_id) VALUES
  (9, 3, 8),(10,3, 8),(11,3, 8),(12,3, 8),
  (5, 2, 8),(6, 2, 8),(7, 2, 8),(8, 2, 8);

-- Match 9 Grand Final T2: Alpha vs Beta
INSERT INTO match_players (user_id, team_id, match_id) VALUES
  (1, 1, 9),(2, 1, 9),(3, 1, 9),(4, 1, 9),
  (5, 2, 9),(6, 2, 9),(7, 2, 9),(8, 2, 9);

-- =============================================================
-- AUDIT LOG  (sample entries)
-- =============================================================
INSERT INTO audit_log (user_id, action, entity, entity_id, meta, ipAddress) VALUES
  (17, 'CREATE', 'tournament', 1, '{"name":"LoL Spring Cup"}',         '127.0.0.1'),
  (17, 'CREATE', 'tournament', 2, '{"name":"Valorant Iron Gauntlet"}', '127.0.0.1'),
  (17, 'CREATE', 'tournament', 3, '{"name":"Rocket League Round Battle"}', '127.0.0.1'),
  (1,  'REGISTER', 'tournament_registration', 1, '{"team_id":1,"tournament_id":1}', '192.168.1.10'),
  (5,  'REGISTER', 'tournament_registration', 1, '{"team_id":2,"tournament_id":1}', '192.168.1.11'),
  (9,  'REGISTER', 'tournament_registration', 1, '{"team_id":3,"tournament_id":1}', '192.168.1.12'),
  (13, 'REGISTER', 'tournament_registration', 1, '{"team_id":4,"tournament_id":1}', '192.168.1.13');

SET FOREIGN_KEY_CHECKS = 1;
