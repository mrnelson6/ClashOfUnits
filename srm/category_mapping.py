"""
SRM Category Mapping for Frequency Normalization
=================================================
Maps all scoring categories from srmcategories.txt to their data sources
and computation logic so we can count how often each event occurs in a season.

Run directly to print the review table:
    python category_mapping.py

Each category has:
  name        - Exact name from the scoring rules
  section     - Scoring section (Passing, Rushing, etc.)
  adjustment  - Current rule-change increment (1.0 or 0.1 for per-yard)
  granularity - Event level: play, game, team_game, per_yard
  source      - Data needed: weekly, pbp, schedule, roster+weekly, pbp_agg
  logic       - Human-readable computation description
  review_flag - Items needing your confirmation (None = looks clear)
"""


def _c(name, section, adj, gran, source, logic, flag=None):
    return {
        "name": name,
        "section": section,
        "adjustment": adj,
        "granularity": gran,
        "source": source,
        "logic": logic,
        "review_flag": flag,
    }


CATEGORIES = [
    # ================================================================
    #  PASSING  (13 categories)
    # ================================================================
    _c("Passing Yards", "Passing", 0.1, "per_yard", "weekly",
       "Sum weekly.passing_yards for all players/games. Each yard = 1 unit."),

    _c("Passing TDs", "Passing", 1.0, "play", "weekly",
       "Sum weekly.passing_tds for all players/games."),

    _c("Passing First Down", "Passing", 1.0, "play", "weekly",
       "Sum weekly.passing_first_downs for all players/games."),

    _c("2-pt Conversion (Pass)", "Passing", 1.0, "play", "weekly",
       "Sum weekly.passing_2pt_conversions. Credited to the passer."),

    _c("Pass Intercepted", "Passing", 1.0, "play", "weekly",
       "Sum weekly.interceptions (thrown by QB, negative event)."),

    _c("Pick 6 Thrown", "Passing", 1.0, "play", "pbp",
       "Count PBP rows where interception==1 AND return_touchdown==1. "
       "Credited to the passer as a negative event."),

    _c("Pass Completed", "Passing", 1.0, "play", "weekly",
       "Sum weekly.completions for all players/games."),

    _c("Incomplete Pass", "Passing", 1.0, "play", "weekly",
       "Sum (weekly.attempts - weekly.completions) for all players/games. "
       "Interceptions count as incompletions (included in this count)."),

    _c("Pass Attempt", "Passing", 1.0, "play", "weekly",
       "Sum weekly.attempts for all players/games."),

    _c("QB Sacked", "Passing", 1.0, "play", "weekly",
       "Sum weekly.sacks (times sacked, from QB perspective)."),

    _c("40+ Yard Completion Bonus", "Passing", 1.0, "play", "pbp",
       "Count PBP rows where complete_pass==1 AND yards_gained>=40. "
       "Credited to the passer."),

    _c("40+ Yard Pass TD Bonus", "Passing", 1.0, "play", "pbp",
       "Count PBP rows where pass_touchdown==1 AND yards_gained>=40."),

    _c("50+ Yard Pass TD Bonus", "Passing", 1.0, "play", "pbp",
       "Count PBP rows where pass_touchdown==1 AND yards_gained>=50."),

    # ================================================================
    #  RUSHING  (8 categories)
    # ================================================================
    _c("Rushing Yards", "Rushing", 0.1, "per_yard", "weekly",
       "Sum weekly.rushing_yards for all players/games."),

    _c("Rushing TD", "Rushing", 1.0, "play", "weekly",
       "Sum weekly.rushing_tds for all players/games."),

    _c("Rushing First Down", "Rushing", 1.0, "play", "weekly",
       "Sum weekly.rushing_first_downs for all players/games."),

    _c("2-pt Conversion (Rush)", "Rushing", 1.0, "play", "weekly",
       "Sum weekly.rushing_2pt_conversions. Credited to the rusher."),

    _c("Rush Attempt", "Rushing", 1.0, "play", "weekly",
       "Sum weekly.carries for all players/games."),

    _c("40+ Yard Rush Bonus", "Rushing", 1.0, "play", "pbp",
       "Count PBP rows where rush_attempt==1 AND yards_gained>=40."),

    _c("40+ Yard Rush TD Bonus", "Rushing", 1.0, "play", "pbp",
       "Count PBP rows where rush_touchdown==1 AND yards_gained>=40."),

    _c("50+ Yard Rush TD Bonus", "Rushing", 1.0, "play", "pbp",
       "Count PBP rows where rush_touchdown==1 AND yards_gained>=50."),

    # ================================================================
    #  RECEIVING  (15 categories)
    # ================================================================
    _c("Reception", "Receiving", 1.0, "play", "weekly",
       "Sum weekly.receptions for all players/games."),

    _c("Receiving Yards", "Receiving", 0.1, "per_yard", "weekly",
       "Sum weekly.receiving_yards for all players/games."),

    _c("Receiving TD", "Receiving", 1.0, "play", "weekly",
       "Sum weekly.receiving_tds for all players/games."),

    _c("Receiving First Down", "Receiving", 1.0, "play", "weekly",
       "Sum weekly.receiving_first_downs for all players/games."),

    _c("2-pt Conversion (Rec)", "Receiving", 1.0, "play", "weekly",
       "Sum weekly.receiving_2pt_conversions. Credited to the receiver."),

    _c("0-4 Yard Reception Bonus", "Receiving", 1.0, "play", "pbp",
       "Count PBP rows where complete_pass==1 AND 0<=yards_gained<=4. "
       "Credited to the receiver."),

    _c("5-9 Yard Reception Bonus", "Receiving", 1.0, "play", "pbp",
       "Count PBP rows where complete_pass==1 AND 5<=yards_gained<=9."),

    _c("10-19 Yard Reception Bonus", "Receiving", 1.0, "play", "pbp",
       "Count PBP rows where complete_pass==1 AND 10<=yards_gained<=19."),

    _c("20-29 Yard Reception Bonus", "Receiving", 1.0, "play", "pbp",
       "Count PBP rows where complete_pass==1 AND 20<=yards_gained<=29."),

    _c("30-39 Yard Reception Bonus", "Receiving", 1.0, "play", "pbp",
       "Count PBP rows where complete_pass==1 AND 30<=yards_gained<=39."),

    _c("40-49 Yard Reception Bonus", "Receiving", 1.0, "play", "pbp",
       "Count PBP rows where complete_pass==1 AND 40<=yards_gained<=49."),

    _c("50+ Yard Reception Bonus", "Receiving", 1.0, "play", "pbp",
       "Count PBP rows where complete_pass==1 AND yards_gained>=50."),

    _c("Reception Bonus - RB", "Receiving", 1.0, "play", "roster+weekly",
       "Sum weekly.receptions WHERE position=='RB'. "
       "Flat bonus per reception for running backs."),

    _c("Reception Bonus - WR", "Receiving", 1.0, "play", "roster+weekly",
       "Sum weekly.receptions WHERE position=='WR'. "
       "Flat bonus per reception for wide receivers."),

    _c("Reception Bonus - TE", "Receiving", 1.0, "play", "roster+weekly",
       "Sum weekly.receptions WHERE position=='TE'. "
       "Flat bonus per reception for tight ends."),

    # ================================================================
    #  KICKING  (16 categories)
    # ================================================================
    _c("FG Made", "Kicking", 1.0, "play", "pbp",
       "Count PBP rows where field_goal_result=='made'."),

    _c("FG Made (0-19 yards)", "Kicking", 1.0, "play", "pbp",
       "Count PBP where field_goal_result=='made' AND kick_distance<=19. "
       "Note: extremely rare in modern NFL."),

    _c("FG Made (20-29 yards)", "Kicking", 1.0, "play", "pbp",
       "Count PBP where field_goal_result=='made' AND 20<=kick_distance<=29."),

    _c("FG Made (30-39 yards)", "Kicking", 1.0, "play", "pbp",
       "Count PBP where field_goal_result=='made' AND 30<=kick_distance<=39."),

    _c("FG Made (40-49 yards)", "Kicking", 1.0, "play", "pbp",
       "Count PBP where field_goal_result=='made' AND 40<=kick_distance<=49."),

    _c("FG Made (50+ yards)", "Kicking", 1.0, "play", "pbp",
       "Count PBP where field_goal_result=='made' AND kick_distance>=50."),

    _c("Points per FG yard", "Kicking", 0.1, "per_yard", "pbp",
       "Sum of kick_distance for all made FGs. Each yard = 1 unit."),

    _c("Points per FG yard over 30", "Kicking", 0.1, "per_yard", "pbp",
       "Sum of max(0, kick_distance - 30) for each made FG. "
       "Additional points for each FG yard beyond 30. Adjustment is +/-0.1."),

    _c("PAT Made", "Kicking", 1.0, "play", "pbp",
       "Count PBP where extra_point_result=='good'."),

    _c("FG Missed", "Kicking", 1.0, "play", "pbp",
       "Count PBP where field_goal_result in ('missed','blocked'). "
       "Includes blocked FGs (kicker penalty). Blocked kick is also "
       "separately credited to the defense."),

    _c("FG Missed (0-19 yards)", "Kicking", 1.0, "play", "pbp",
       "Count PBP where FG missed/blocked AND kick_distance<=19."),

    _c("FG Missed (20-29 yards)", "Kicking", 1.0, "play", "pbp",
       "Count PBP where FG missed/blocked AND 20<=kick_distance<=29."),

    _c("FG Missed (30-39 yards)", "Kicking", 1.0, "play", "pbp",
       "Count PBP where FG missed/blocked AND 30<=kick_distance<=39."),

    _c("FG Missed (40-49 yards)", "Kicking", 1.0, "play", "pbp",
       "Count PBP where FG missed/blocked AND 40<=kick_distance<=49."),

    _c("FG Missed (50+ yards)", "Kicking", 1.0, "play", "pbp",
       "Count PBP where FG missed/blocked AND kick_distance>=50."),

    _c("PAT Missed", "Kicking", 1.0, "play", "pbp",
       "Count PBP where extra_point_result in ('failed','blocked','aborted')."),

    # ================================================================
    #  TEAM DEFENSE  (40 categories)
    # ================================================================
    _c("Defense TD", "Team Defense", 1.0, "play", "pbp",
       "Count defensive TDs: interception return TDs + fumble return TDs + "
       "blocked kick return TDs. Aggregate by defensive team per game."),

    _c("Points Allowed (0)", "Team Defense", 1.0, "team_game", "schedule",
       "Count team-games where opponent scored 0 points. "
       "Use schedule data: for home team, opponent score = away_score."),

    _c("Points Allowed (1-6)", "Team Defense", 1.0, "team_game", "schedule",
       "Count team-games where opponent scored 1-6 points."),

    _c("Points Allowed (7-13)", "Team Defense", 1.0, "team_game", "schedule",
       "Count team-games where opponent scored 7-13 points."),

    _c("Points Allowed (14-20)", "Team Defense", 1.0, "team_game", "schedule",
       "Count team-games where opponent scored 14-20 points."),

    _c("Points Allowed (21-27)", "Team Defense", 1.0, "team_game", "schedule",
       "Count team-games where opponent scored 21-27 points."),

    _c("Points Allowed (28-34)", "Team Defense", 1.0, "team_game", "schedule",
       "Count team-games where opponent scored 28-34 points."),

    _c("Points Allowed (35+)", "Team Defense", 1.0, "team_game", "schedule",
       "Count team-games where opponent scored 35+ points."),

    _c("Points per Point Allowed", "Team Defense", 1.0, "per_yard", "schedule",
       "Total points scored across all games (sum of all team scores). "
       "Each point allowed = 1 unit. Typically a negative value per point. "
       "High impact per adjustment -- normalization will account for this."),

    _c("Less Than 100 Total Yards Allowed", "Team Defense", 1.0, "team_game", "pbp_agg",
       "Count team-games where defense allowed <100 total yards. "
       "Aggregate PBP yards_gained by offensive team per game."),

    _c("100-199 Yards Allowed", "Team Defense", 1.0, "team_game", "pbp_agg",
       "Count team-games where defense allowed 100-199 total yards."),

    _c("200-299 Yards Allowed", "Team Defense", 1.0, "team_game", "pbp_agg",
       "Count team-games where defense allowed 200-299 total yards."),

    _c("300-349 Yards Allowed", "Team Defense", 1.0, "team_game", "pbp_agg",
       "Count team-games where defense allowed 300-349 total yards."),

    _c("350-399 Yards Allowed", "Team Defense", 1.0, "team_game", "pbp_agg",
       "Count team-games where defense allowed 350-399 total yards."),

    _c("400-449 Yards Allowed", "Team Defense", 1.0, "team_game", "pbp_agg",
       "Count team-games where defense allowed 400-449 total yards."),

    _c("450-499 Yards Allowed", "Team Defense", 1.0, "team_game", "pbp_agg",
       "Count team-games where defense allowed 450-499 total yards."),

    _c("500-549 Yards Allowed", "Team Defense", 1.0, "team_game", "pbp_agg",
       "Count team-games where defense allowed 500-549 total yards."),

    _c("550+ Yards Allowed", "Team Defense", 1.0, "team_game", "pbp_agg",
       "Count team-games where defense allowed 550+ total yards."),

    _c("Points per Yards Allowed", "Team Defense", 0.1, "per_yard", "pbp_agg",
       "Total yards allowed across all team-games. Each yard = 1 unit. "
       "Typically a negative value per yard."),

    _c("3 and Out", "Team Defense", 1.0, "play", "pbp",
       "Count opponent drives ending in punt after <=3 offensive plays. "
       "Use PBP drive grouping: series_result=='Punt' with play count <= 3."),

    _c("4th Down Stop", "Team Defense", 1.0, "play", "pbp",
       "Count plays where down==4 AND the offense failed to convert "
       "(no first down, no TD). Filter PBP: fourth_down_failed==1."),

    _c("Hit on QB (Team Def)", "Team Defense", 1.0, "play", "pbp",
       "Count PBP rows where qb_hit==1, aggregated by defensive team. "
       "Includes any hit on the QB, not just sacks."),

    _c("Sack (Team Def)", "Team Defense", 1.0, "play", "pbp",
       "Count PBP rows where sack==1, aggregated by defensive team."),

    _c("Sack Yards (Team Def)", "Team Defense", 0.1, "per_yard", "pbp",
       "Sum of yards_gained (negative) on sack plays by defensive team. "
       "We take the absolute value of yards lost."),

    _c("Interception (Team Def)", "Team Defense", 1.0, "play", "pbp",
       "Count PBP rows where interception==1, aggregated by defensive team."),

    _c("Interception Yards (Team Def)", "Team Defense", 0.1, "per_yard", "pbp",
       "Sum of return_yards on interception plays by defensive team."),

    _c("Fumble Recovery (Team Def)", "Team Defense", 1.0, "play", "pbp",
       "Count PBP rows where the defensive team recovered a fumble. "
       "Use fumble_lost==1 (from offensive perspective)."),

    _c("Fumble Return Yards (Team Def)", "Team Defense", 0.1, "per_yard", "pbp",
       "Sum of fumble return yards by defensive team."),

    _c("Tackle For Loss (Team Def)", "Team Defense", 1.0, "play", "pbp",
       "Count PBP rows where tackled_for_loss==1, by defensive team."),

    _c("Assisted Tackle (Team Def)", "Team Defense", 1.0, "play", "pbp",
       "Count assist tackles from PBP tackle columns (assist_tackle_*_player_id), "
       "aggregated by defensive team per game."),

    _c("Solo Tackle (Team Def)", "Team Defense", 1.0, "play", "pbp",
       "Count solo tackles from PBP tackle columns (solo_tackle_*_player_id), "
       "aggregated by defensive team per game."),

    _c("Tackle (Team Def)", "Team Defense", 1.0, "play", "pbp",
       "Count all tackles (solo + assisted) by defensive team per game."),

    _c("Safety (Team Def)", "Team Defense", 1.0, "play", "pbp",
       "Count PBP rows where safety==1, credited to defensive team."),

    _c("Forced Fumble (Team Def)", "Team Defense", 1.0, "play", "pbp",
       "Count PBP rows with forced_fumble_player_1 set, by defensive team."),

    _c("Blocked Kick", "Team Defense", 1.0, "play", "pbp",
       "Count PBP rows where a FG, PAT, or punt was blocked. "
       "Check field_goal_result=='blocked' OR extra_point_result=='blocked' "
       "OR punt_blocked==1."),

    _c("Forced Punt", "Team Defense", 1.0, "play", "pbp",
       "Count all punt plays in PBP (play_type=='punt'). Each punt is "
       "credited to the opposing defense as a 'forced punt'."),

    _c("Pass Defended (Team Def)", "Team Defense", 1.0, "play", "pbp",
       "Count PBP rows with pass_defense_1_player_id set, by defensive team."),

    _c("2-pt Conversion Returns", "Team Defense", 1.0, "play", "pbp",
       "Count PBP rows where defensive_two_point_conv==1. "
       "Extremely rare (~1 per season). Data confirmed available."),

    _c("Missed FG Return Yards (Team Def)", "Team Defense", 0.1, "per_yard", "pbp",
       "Sum of return yards on missed FG attempts by the defensive team."),

    _c("Blocked Kick Return Yards (Team Def)", "Team Defense", 0.1, "per_yard", "pbp",
       "Sum of return yards on blocked kicks by the defensive team."),

    # ================================================================
    #  SPECIAL TEAMS - D/ST  (6 categories)
    #  These are credited to the team D/ST roster slot.
    # ================================================================
    _c("Special Teams TD (D/ST)", "Special Teams D/ST", 1.0, "play", "pbp",
       "Count kick return TDs + punt return TDs. "
       "PBP: return_touchdown==1 on kickoff/punt plays."),

    _c("Special Teams Forced Fumble (D/ST)", "Special Teams D/ST", 1.0, "play", "pbp",
       "Count forced fumbles on special teams plays (kickoff/punt)."),

    _c("Special Teams Fumble Recovery (D/ST)", "Special Teams D/ST", 1.0, "play", "pbp",
       "Count fumble recoveries on special teams plays."),

    _c("Special Teams Solo Tackle (D/ST)", "Special Teams D/ST", 1.0, "play", "pbp",
       "Count solo tackles on special teams plays (kickoff/punt coverage)."),

    _c("Punt Return Yards (D/ST)", "Special Teams D/ST", 0.1, "per_yard", "pbp",
       "Sum of return_yards on punt return plays, by returning team."),

    _c("Kick Return Yards (D/ST)", "Special Teams D/ST", 0.1, "per_yard", "pbp",
       "Sum of return_yards on kickoff return plays, by returning team."),

    # ================================================================
    #  SPECIAL TEAMS - PLAYER  (6 categories)
    #  These are credited to the individual player.
    # ================================================================
    _c("Special Teams Player TD", "Special Teams Player", 1.0, "play", "pbp",
       "Count return TDs credited to individual return players."),

    _c("Special Teams Player Forced Fumble", "Special Teams Player", 1.0, "play", "pbp",
       "Count forced fumbles by individual players on ST plays."),

    _c("Special Teams Player Fumble Recovery", "Special Teams Player", 1.0, "play", "pbp",
       "Count fumble recoveries by individual players on ST plays."),

    _c("Special Teams Player Solo Tackle", "Special Teams Player", 1.0, "play", "pbp",
       "Count solo tackles by individual players on ST plays."),

    _c("Player Punt Return Yards", "Special Teams Player", 0.1, "per_yard", "pbp",
       "Sum of return_yards on punt returns, credited per player."),

    _c("Player Kick Return Yards", "Special Teams Player", 0.1, "per_yard", "pbp",
       "Sum of return_yards on kickoff returns, credited per player."),

    # ================================================================
    #  MISC  (17 categories)
    # ================================================================
    _c("Fumble", "Misc", 1.0, "play", "weekly",
       "Sum of all fumbles (lost or not) by offensive players: "
       "weekly.rushing_fumbles + receiving_fumbles + sack_fumbles."),

    _c("Fumble Lost", "Misc", 1.0, "play", "weekly",
       "Sum of fumbles lost: weekly.rushing_fumbles_lost + "
       "receiving_fumbles_lost + sack_fumbles_lost."),

    _c("Fumble Recovery TD", "Misc", 1.0, "play", "pbp",
       "Count any fumble recovery returned for a TD, credited to the "
       "individual player who recovered it (offense or defense/IDP). "
       "PBP: fumble_recovery_1 with touchdown."),

    _c("100-199 Yard Rushing Game", "Misc", 1.0, "game", "weekly",
       "Count player-games where 100 <= weekly.rushing_yards <= 199."),

    _c("200+ Yard Rushing Game", "Misc", 1.0, "game", "weekly",
       "Count player-games where weekly.rushing_yards >= 200."),

    _c("100-199 Yard Receiving Game", "Misc", 1.0, "game", "weekly",
       "Count player-games where 100 <= weekly.receiving_yards <= 199."),

    _c("200+ Yard Receiving Game", "Misc", 1.0, "game", "weekly",
       "Count player-games where weekly.receiving_yards >= 200."),

    _c("300-399 Yard Passing Game", "Misc", 1.0, "game", "weekly",
       "Count player-games where 300 <= weekly.passing_yards <= 399."),

    _c("400+ Yard Passing Game", "Misc", 1.0, "game", "weekly",
       "Count player-games where weekly.passing_yards >= 400."),

    _c("100-199 Combined Rush + Rec Yards", "Misc", 1.0, "game", "weekly",
       "Count player-games where 100 <= (rushing_yards + receiving_yards) <= 199."),

    _c("200+ Combined Rush + Rec Yards", "Misc", 1.0, "game", "weekly",
       "Count player-games where (rushing_yards + receiving_yards) >= 200."),

    _c("25+ Pass Completions", "Misc", 1.0, "game", "weekly",
       "Count player-games where weekly.completions >= 25."),

    _c("20+ Carries", "Misc", 1.0, "game", "weekly",
       "Count player-games where weekly.carries >= 20."),

    _c("First Down Bonus - RB", "Misc", 1.0, "play", "roster+weekly",
       "Sum of (rushing_first_downs + receiving_first_downs) WHERE position=='RB'. "
       "Flat bonus per first down for running backs."),

    _c("First Down Bonus - WR", "Misc", 1.0, "play", "roster+weekly",
       "Sum of receiving_first_downs WHERE position=='WR'. "
       "Flat bonus per first down for wide receivers."),

    _c("First Down Bonus - TE", "Misc", 1.0, "play", "roster+weekly",
       "Sum of receiving_first_downs WHERE position=='TE'. "
       "Flat bonus per first down for tight ends."),

    _c("First Down Bonus - QB", "Misc", 1.0, "play", "roster+weekly",
       "Sum of (passing_first_downs + rushing_first_downs) WHERE position=='QB'. "
       "Flat bonus per first down for quarterbacks."),

    # ================================================================
    #  INDIVIDUAL DEFENSIVE PLAYER (IDP)  (21 categories)
    #  Same events as Team Defense but credited to individual players.
    #  Frequency counts are equivalent but attributed differently.
    # ================================================================
    _c("IDP Touchdown", "IDP", 1.0, "play", "pbp",
       "Count defensive/ST TDs credited to individual players. "
       "PBP: td_player_id on interception/fumble return plays."),

    _c("Sack (IDP)", "IDP", 1.0, "play", "pbp",
       "Count sacks per individual player. PBP columns: "
       "sack_player_id, half_sack_1_player_id, half_sack_2_player_id."),

    _c("Sack Yards (IDP)", "IDP", 0.1, "per_yard", "pbp",
       "Sum of yards lost on sacks, credited per player. "
       "Half-sacks split the yards."),

    _c("Hit on QB (IDP)", "IDP", 1.0, "play", "pbp",
       "Count QB hits per individual player. PBP: qb_hit_*_player_id columns."),

    _c("Tackle (IDP)", "IDP", 1.0, "play", "pbp",
       "Count all tackles (solo + assisted) per individual player. "
       "PBP: solo_tackle_*_player_id + assist_tackle_*_player_id."),

    _c("Tackle For Loss (IDP)", "IDP", 1.0, "play", "pbp",
       "Count TFL per player. PBP: tackle_for_loss_*_player_id columns."),

    _c("Blocked Punt, PAT, or FG (IDP)", "IDP", 1.0, "play", "pbp",
       "Count blocked kicks per individual player. "
       "PBP: blocked_player_id on punt/FG/PAT plays."),

    _c("Interception (IDP)", "IDP", 1.0, "play", "pbp",
       "Count INTs per individual player. PBP: interception_player_id."),

    _c("Interception Return Yards (IDP)", "IDP", 0.1, "per_yard", "pbp",
       "Sum of INT return yards per individual player."),

    _c("Fumble Recovery (IDP)", "IDP", 1.0, "play", "pbp",
       "Count fumble recoveries per player. "
       "PBP: fumble_recovery_1_player_id for defensive recoveries."),

    _c("Fumble Recovery Return Yards (IDP)", "IDP", 0.1, "per_yard", "pbp",
       "Sum of fumble recovery return yards per player."),

    _c("Forced Fumble (IDP)", "IDP", 1.0, "play", "pbp",
       "Count forced fumbles per player. PBP: forced_fumble_player_*_player_id."),

    _c("Safety (IDP)", "IDP", 1.0, "play", "pbp",
       "Count safeties credited to individual players. "
       "PBP: safety==1, cross-ref with tackle/sack player."),

    _c("Assisted Tackle (IDP)", "IDP", 1.0, "play", "pbp",
       "Count assisted tackles per player. PBP: assist_tackle_*_player_id."),

    _c("Solo Tackle (IDP)", "IDP", 1.0, "play", "pbp",
       "Count solo tackles per player. PBP: solo_tackle_*_player_id."),

    _c("Pass Defended (IDP)", "IDP", 1.0, "play", "pbp",
       "Count passes defended per player. PBP: pass_defense_*_player_id."),

    _c("10+ Tackle Bonus", "IDP", 1.0, "game", "pbp_agg",
       "Count player-games where a defender had 10+ tackles. "
       "Aggregate PBP tackles per player per game, then count games >= 10."),

    _c("2+ Sack Bonus", "IDP", 1.0, "game", "pbp_agg",
       "Count player-games where a defender had 2+ sacks. "
       "Aggregate PBP sacks per player per game, then count games >= 2."),

    _c("3+ Pass Defended Bonus", "IDP", 1.0, "game", "pbp_agg",
       "Count player-games where a defender had 3+ passes defended. "
       "Aggregate PBP pass_defense per player per game, count games >= 3."),

    _c("50+ Yard Interception Return TD Bonus", "IDP", 1.0, "play", "pbp",
       "Count INTs returned 50+ yards for a TD. "
       "PBP: interception==1 AND return_touchdown==1 AND return_yards>=50."),

    _c("50+ Yard Fumble Recovery Return TD Bonus", "IDP", 1.0, "play", "pbp",
       "Count fumble recoveries returned 50+ yards for a TD. "
       "PBP: fumble recovery with return_touchdown==1 AND return_yards>=50."),
]


# ====================================================================
#  Review table printer
# ====================================================================
def print_review_table(section_filter=None):
    """Print a formatted table of all categories for human review.

    Args:
        section_filter: Optional string to show only one section
                        (e.g., 'Passing', 'Kicking', 'IDP')
    """
    cats = CATEGORIES
    if section_filter:
        cats = [c for c in cats if c["section"].lower() == section_filter.lower()]

    # Column widths
    w_num = 4
    w_name = 44
    w_sec = 22
    w_adj = 5
    w_gran = 10
    w_src = 14

    header = (
        f"{'#':>{w_num}} | "
        f"{'Category':<{w_name}} | "
        f"{'Section':<{w_sec}} | "
        f"{'Adj':>{w_adj}} | "
        f"{'Level':<{w_gran}} | "
        f"{'Source':<{w_src}} | "
        f"Flag"
    )
    sep = "-" * len(header)

    print(sep)
    print(header)
    print(sep)

    current_section = None
    for i, cat in enumerate(cats, 1):
        # Section divider
        if cat["section"] != current_section:
            if current_section is not None:
                print(sep)
            current_section = cat["section"]

        adj_str = f"{cat['adjustment']:.1f}"
        flag_str = "***" if cat["review_flag"] else ""

        print(
            f"{i:>{w_num}} | "
            f"{cat['name']:<{w_name}} | "
            f"{cat['section']:<{w_sec}} | "
            f"{adj_str:>{w_adj}} | "
            f"{cat['granularity']:<{w_gran}} | "
            f"{cat['source']:<{w_src}} | "
            f"{flag_str}"
        )

    print(sep)
    print(f"\nTotal categories: {len(cats)}")

    # Print flagged items
    flagged = [c for c in cats if c["review_flag"]]
    if flagged:
        print(f"\n{'=' * 60}")
        print(f"ITEMS FLAGGED FOR YOUR REVIEW ({len(flagged)}):")
        print(f"{'=' * 60}")
        for c in flagged:
            print(f"\n  >> {c['name']} ({c['section']})")
            print(f"     {c['review_flag']}")


def print_logic_detail(section_filter=None):
    """Print full computation logic for each category."""
    cats = CATEGORIES
    if section_filter:
        cats = [c for c in cats if c["section"].lower() == section_filter.lower()]

    current_section = None
    for i, cat in enumerate(cats, 1):
        if cat["section"] != current_section:
            current_section = cat["section"]
            print(f"\n{'=' * 60}")
            print(f"  {current_section.upper()}")
            print(f"{'=' * 60}")

        print(f"\n  [{i}] {cat['name']}  (adj: {cat['adjustment']}, {cat['granularity']})")
        print(f"      Source: {cat['source']}")
        print(f"      Logic:  {cat['logic']}")
        if cat["review_flag"]:
            print(f"      FLAG:   {cat['review_flag']}")


if __name__ == "__main__":
    import sys

    section = None
    mode = "table"

    for arg in sys.argv[1:]:
        if arg == "--detail":
            mode = "detail"
        else:
            section = arg

    if mode == "detail":
        print_logic_detail(section)
    else:
        print_review_table(section)

    print(f"\nRun with --detail for full computation logic.")
    print(f"Run with a section name to filter (e.g., python category_mapping.py Passing)")
