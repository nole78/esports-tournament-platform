#!/bin/sh
# Run INSIDE the master container:
#   docker cp docker/setup-replication.sh project_master:/setup.sh
#   docker exec project_master sh /setup.sh
#
# STRATEGY:
#   1. Create schema on Master
#   2. Lock Master, read binlog position, dump schema
#   3. Import schema dump DIRECTLY into each Slave (bypassing replication)
#   4. Configure Slaves to start replication FROM current position
#   => Slaves have the schema already, replication only handles new data
ROOT_PASS="root1234"
REPL_USER="replicator"
REPL_PASS="repl1234"
DB_NAME="pulse_grid"
M="mysql  -h127.0.0.1    -P3306 -uroot -p${ROOT_PASS} --protocol=TCP --connect-timeout=5"
S1="mysql -hmysql-slave1 -P3306 -uroot -p${ROOT_PASS} --protocol=TCP --connect-timeout=5"
S2="mysql -hmysql-slave2 -P3306 -uroot -p${ROOT_PASS} --protocol=TCP --connect-timeout=5"
SCHEMA_FILE="/tmp/project_schema.sql"
echo ""
echo "========================================================"
echo "  Project -- MySQL Replication Setup"
echo "========================================================"
# ── 1. Wait for all nodes ─────────────────────────────────────
wait_mysql() {
  HOST=$1; NAME=$2
  printf "  Waiting for %s" "$NAME"
  i=0
  while [ $i -lt 30 ]; do
    mysql -h"$HOST" -P3306 -uroot -p"$ROOT_PASS" --protocol=TCP \
      --connect-timeout=3 -e "SELECT 1" > /dev/null 2>&1 \
      && echo " OK" && return 0
    printf "."; sleep 3; i=$((i+1))
  done
  echo " TIMEOUT"; exit 1
}

echo ""
echo "[ 1/5 ] Checking node availability..."
wait_mysql "127.0.0.1"    "Master"
wait_mysql "mysql-slave1" "Slave1"
wait_mysql "mysql-slave2" "Slave2"
sleep 2

# ── 2. Create schema on Master ────────────────────────────────
echo ""
echo "[ 2/5 ] Creating schema on Master..."

$M -e "DROP DATABASE IF EXISTS ${DB_NAME};"
$M -e "CREATE DATABASE ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# TODO: Replace the SQL below with your actual table definitions

$M ${DB_NAME} << 'SQL'
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
  FOREIGN KEY (tournament_game_id) REFERENCES games(game_id),
  CONSTRAINT tournament_name_length CHECK (LENGTH(tournament_name) BETWEEN 3 AND 120),
  CONSTRAINT tournament_max_teams_check CHECK (
    tournament_max_teams BETWEEN 4 AND 256 AND 
    ((tournament_max_teams & (tournament_max_teams - 1)) = 0)
  )
  
);

CREATE TABLE matches(
  match_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  blue_team_id INT UNSIGNED NOT NULL,
  red_team_id INT UNSIGNED NOT NULL,
  match_result VARCHAR(4),
  status ENUM('scheduled','ongoing','completed'),
  match_round ENUM('round_of_16','quarterfinal','semifinal','final'),
  FOREIGN KEY (blue_team_id) REFERENCES teams(team_id),
  FOREIGN KEY (red_team_id) REFERENCES teams(team_id),
  CONSTRAINT match_score_format CHECK (
    match_result REGEXP '^[0-9]:[0-9]$'
  )
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
SQL

MASTER_TABLES=$($M -s --skip-column-names \
  -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='${DB_NAME}';" 2>/dev/null)
echo "  Master tables: ${MASTER_TABLES}"
if [ "${MASTER_TABLES:-0}" -lt "2" ]; then
  echo "  ERROR: Schema creation failed on Master"
  exit 1
fi

# ── 3. Lock Master, get binlog position, dump schema ─────────
echo ""
echo "[ 3/5 ] Locking Master, reading binlog position, dumping schema..."

$M -e "FLUSH TABLES WITH READ LOCK;" > /dev/null 2>&1

STATUS=$($M --skip-column-names -e "SHOW MASTER STATUS;" 2>/dev/null)
BINLOG_FILE=$(echo "$STATUS" | awk '{print $1}')
BINLOG_POS=$(echo  "$STATUS" | awk '{print $2}')

if [ -z "$BINLOG_FILE" ] || [ -z "$BINLOG_POS" ]; then
  echo "  ERROR: Could not read SHOW MASTER STATUS"
  exit 1
fi
echo "  File     : $BINLOG_FILE"
echo "  Position : $BINLOG_POS"

mysqldump -h127.0.0.1 -P3306 -uroot -p"${ROOT_PASS}" --protocol=TCP \
  --no-data --skip-lock-tables --no-tablespaces \
  ${DB_NAME} > "$SCHEMA_FILE" 2>/dev/null

$M -e "UNLOCK TABLES;" > /dev/null 2>&1

DUMP_LINES=$(wc -l < "$SCHEMA_FILE")
echo "  Schema dump: ${DUMP_LINES} lines"

# ── 4. Import schema into Slaves, then configure replication ──
echo ""
echo "[ 4/5 ] Importing schema into Slave1..."
$S1 -e "DROP DATABASE IF EXISTS ${DB_NAME}; CREATE DATABASE ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
$S1 ${DB_NAME} < "$SCHEMA_FILE"

S1_TABLES=$(mysql -hmysql-slave1 -P3306 -uroot -p"$ROOT_PASS" --protocol=TCP \
  -s --skip-column-names --connect-timeout=5 \
  -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='${DB_NAME}';" 2>/dev/null)
echo "  Slave1 tables after import: ${S1_TABLES:-0}"

printf "STOP REPLICA;\nRESET REPLICA ALL;\nCHANGE REPLICATION SOURCE TO SOURCE_HOST='mysql-master', SOURCE_PORT=3306, SOURCE_USER='%s', SOURCE_PASSWORD='%s', SOURCE_LOG_FILE='%s', SOURCE_LOG_POS=%s, GET_SOURCE_PUBLIC_KEY=1;\nSTART REPLICA;\n" \
  "$REPL_USER" "$REPL_PASS" "$BINLOG_FILE" "$BINLOG_POS" | $S1
echo "  Slave1 replication started"

echo "  Importing schema into Slave2..."
$S2 -e "DROP DATABASE IF EXISTS ${DB_NAME}; CREATE DATABASE ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
$S2 ${DB_NAME} < "$SCHEMA_FILE"

S2_TABLES=$(mysql -hmysql-slave2 -P3306 -uroot -p"$ROOT_PASS" --protocol=TCP \
  -s --skip-column-names --connect-timeout=5 \
  -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='${DB_NAME}';" 2>/dev/null)
echo "  Slave2 tables after import: ${S2_TABLES:-0}"

printf "STOP REPLICA;\nRESET REPLICA ALL;\nCHANGE REPLICATION SOURCE TO SOURCE_HOST='mysql-master', SOURCE_PORT=3306, SOURCE_USER='%s', SOURCE_PASSWORD='%s', SOURCE_LOG_FILE='%s', SOURCE_LOG_POS=%s, GET_SOURCE_PUBLIC_KEY=1;\nSTART REPLICA;\n" \
  "$REPL_USER" "$REPL_PASS" "$BINLOG_FILE" "$BINLOG_POS" | $S2
echo "  Slave2 replication started"

sleep 3

# ── 5. Verify ─────────────────────────────────────────────────
echo ""
echo "[ 5/5 ] Verifying replication..."
echo ""

check_slave() {
  HOST=$1; NAME=$2
  STATUS=$(mysql -h"$HOST" -P3306 -uroot -p"$ROOT_PASS" \
    --protocol=TCP --connect-timeout=5 \
    -e "SHOW REPLICA STATUS\G" 2>/dev/null)

  IO=$(echo  "$STATUS" | grep "Replica_IO_Running:"  | awk '{print $2}')
  SQL=$(echo "$STATUS" | grep "Replica_SQL_Running:" | awk '{print $2}')
  ERR=$(echo "$STATUS" | grep "Last_Error:" | sed 's/.*Last_Error: //')
  BEHIND=$(echo "$STATUS" | grep "Seconds_Behind_Source:" | awk '{print $2}')

  TABLES=$(mysql -h"$HOST" -P3306 -uroot -p"$ROOT_PASS" --protocol=TCP \
    --connect-timeout=5 -s --skip-column-names \
    -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='${DB_NAME}';" \
    2>/dev/null)

  echo "  $NAME:"
  echo "    IO_Running     : ${IO:-N/A}"
  echo "    SQL_Running    : ${SQL:-N/A}"
  echo "    Seconds_Behind : ${BEHIND:-N/A}"
  echo "    Tables         : ${TABLES:-0}"

  if [ "$IO" = "Yes" ] && [ "$SQL" = "Yes" ]; then
    echo "    >>> REPLICATION ACTIVE <<<" 
  else
    echo "    >>> CHECK FAILED <<<"
    [ -n "$ERR" ] && [ "$ERR" != "" ] && echo "    Last_Error: $ERR"
  fi
  echo ""
}

check_slave "mysql-slave1" "Slave1"
check_slave "mysql-slave2" "Slave2"

rm -f "$SCHEMA_FILE"

echo "========================================================"
echo "  Done! Start the server: cd server && npm run dev"
echo "========================================================"
