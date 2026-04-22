"""
Generate player_data.js with all positions: QB, RB, WR, TE, K, DEF, IDP.
Pulls from weekly stats + PBP for play-level categories.
"""
import pandas as pd
import json
import os

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
OUT_PATH = os.path.join(os.path.dirname(__file__), "..", "docs", "srm", "player_data.js")

print("Loading data...")
w = pd.read_parquet(os.path.join(DATA_DIR, "weekly.parquet"))
w = w[(w["season"] == 2024) & (w["season_type"] == "REG")].copy()
pbp = pd.read_parquet(os.path.join(DATA_DIR, "pbp.parquet"))
pbp = pbp[(pbp["season"] == 2024) & (pbp["season_type"] == "REG")].copy()
sched = pd.read_parquet(os.path.join(DATA_DIR, "schedules.parquet"))
sched = sched[(sched["season"] == 2024) & (sched["game_type"] == "REG")].copy()

STAT_COLS = [
    "completions", "attempts", "passing_yards", "passing_tds", "interceptions",
    "sacks", "sack_yards", "sack_fumbles", "sack_fumbles_lost",
    "passing_first_downs", "passing_2pt_conversions",
    "carries", "rushing_yards", "rushing_tds", "rushing_fumbles", "rushing_fumbles_lost",
    "rushing_first_downs", "rushing_2pt_conversions",
    "receptions", "targets", "receiving_yards", "receiving_tds",
    "receiving_fumbles", "receiving_fumbles_lost",
    "receiving_first_downs", "receiving_2pt_conversions",
    "special_teams_tds", "fantasy_points_ppr",
]
for col in STAT_COLS:
    if col in w.columns:
        w[col] = w[col].fillna(0)


def to_dict(row, cols):
    """Convert a row/series to dict, keeping only non-zero values."""
    d = {}
    for col in cols:
        val = float(row.get(col, 0) if pd.notna(row.get(col, 0)) else 0)
        if val != 0:
            d[col] = round(val, 1) if val != int(val) else int(val)
    return d


# ================================================================
#  PBP-derived offensive stats (reception brackets, bonuses, pick6)
# ================================================================
print("Computing PBP offensive stats...")
comp = pbp[pbp["complete_pass"] == 1].copy()
rushes = pbp[pbp["rush_attempt"] == 1].copy()

REC_COLS = ["rec_0_4", "rec_5_9", "rec_10_19", "rec_20_29",
            "rec_30_39", "rec_40_49", "rec_50_plus"]
PASS_BONUS_COLS = ["comp_40_plus", "pass_td_40_plus", "pass_td_50_plus"]
RUSH_BONUS_COLS = ["rush_40_plus", "rush_td_40_plus", "rush_td_50_plus"]


def rec_brackets(group):
    yg = group["yards_gained"]
    return pd.Series({"rec_0_4": ((yg >= 0) & (yg <= 4)).sum(),
                       "rec_5_9": ((yg >= 5) & (yg <= 9)).sum(),
                       "rec_10_19": ((yg >= 10) & (yg <= 19)).sum(),
                       "rec_20_29": ((yg >= 20) & (yg <= 29)).sum(),
                       "rec_30_39": ((yg >= 30) & (yg <= 39)).sum(),
                       "rec_40_49": ((yg >= 40) & (yg <= 49)).sum(),
                       "rec_50_plus": (yg >= 50).sum()})


def pass_bonuses(group):
    yg, td = group["yards_gained"], group["pass_touchdown"] == 1
    return pd.Series({"comp_40_plus": (yg >= 40).sum(),
                       "pass_td_40_plus": (td & (yg >= 40)).sum(),
                       "pass_td_50_plus": (td & (yg >= 50)).sum()})


def rush_bonuses(group):
    yg, td = group["yards_gained"], group["rush_touchdown"] == 1
    return pd.Series({"rush_40_plus": (yg >= 40).sum(),
                       "rush_td_40_plus": (td & (yg >= 40)).sum(),
                       "rush_td_50_plus": (td & (yg >= 50)).sum()})


rec_wk = comp.groupby(["week", "receiver_player_id"]).apply(rec_brackets, include_groups=False).reset_index().rename(columns={"receiver_player_id": "player_id"})
pass_wk = comp.groupby(["week", "passer_player_id"]).apply(pass_bonuses, include_groups=False).reset_index().rename(columns={"passer_player_id": "player_id"})
rush_wk = rushes.groupby(["week", "rusher_player_id"]).apply(rush_bonuses, include_groups=False).reset_index().rename(columns={"rusher_player_id": "player_id"})
rec_szn = comp.groupby("receiver_player_id").apply(rec_brackets, include_groups=False).reset_index().rename(columns={"receiver_player_id": "player_id"})
pass_szn = comp.groupby("passer_player_id").apply(pass_bonuses, include_groups=False).reset_index().rename(columns={"passer_player_id": "player_id"})
rush_szn = rushes.groupby("rusher_player_id").apply(rush_bonuses, include_groups=False).reset_index().rename(columns={"rusher_player_id": "player_id"})

# Pick 6
p6_plays = pbp[(pbp["interception"] == 1) & (pbp["return_touchdown"] == 1)]
p6_szn = p6_plays.groupby("passer_player_id").size().reset_index(name="pick_6_thrown").rename(columns={"passer_player_id": "player_id"})
p6_wk = p6_plays.groupby(["week", "passer_player_id"]).size().reset_index(name="pick_6_thrown").rename(columns={"passer_player_id": "player_id"})

OFF_PBP_COLS = REC_COLS + PASS_BONUS_COLS + RUSH_BONUS_COLS + ["pick_6_thrown"]

# Milestones
MILE_COLS = ["games_100_199_rush", "games_200_rush", "games_100_199_rec", "games_200_rec",
             "games_300_399_pass", "games_400_pass", "games_100_199_combined",
             "games_200_combined", "games_25_completions", "games_20_carries", "games_played"]


def count_milestones(group):
    return pd.Series({
        "games_100_199_rush": ((group["rushing_yards"] >= 100) & (group["rushing_yards"] < 200)).sum(),
        "games_200_rush": (group["rushing_yards"] >= 200).sum(),
        "games_100_199_rec": ((group["receiving_yards"] >= 100) & (group["receiving_yards"] < 200)).sum(),
        "games_200_rec": (group["receiving_yards"] >= 200).sum(),
        "games_300_399_pass": ((group["passing_yards"] >= 300) & (group["passing_yards"] < 400)).sum(),
        "games_400_pass": (group["passing_yards"] >= 400).sum(),
        "games_100_199_combined": (((group["rushing_yards"] + group["receiving_yards"]) >= 100) & ((group["rushing_yards"] + group["receiving_yards"]) < 200)).sum(),
        "games_200_combined": ((group["rushing_yards"] + group["receiving_yards"]) >= 200).sum(),
        "games_25_completions": (group["completions"] >= 25).sum(),
        "games_20_carries": (group["carries"] >= 20).sum(),
        "games_played": len(group),
    })


# ================================================================
#  QB / RB / WR / TE
# ================================================================
print("Building QB/RB/WR/TE data...")
season = w.groupby(["player_id", "player_display_name", "position", "recent_team"])[STAT_COLS].sum().reset_index()
milestones = w.groupby("player_id").apply(count_milestones, include_groups=False).reset_index()
season = season.merge(milestones, on="player_id", how="left")
season = season.merge(rec_szn, on="player_id", how="left")
season = season.merge(pass_szn, on="player_id", how="left")
season = season.merge(rush_szn, on="player_id", how="left")
season = season.merge(p6_szn, on="player_id", how="left")

ALL_OFF_COLS = STAT_COLS + MILE_COLS + OFF_PBP_COLS
result = {}

for pos in ["QB", "RB", "WR", "TE"]:
    pos_df = season[season["position"] == pos].nlargest(10, "fantasy_points_ppr")
    players = []
    for _, row in pos_df.iterrows():
        pid = row["player_id"]
        s = to_dict(row, ALL_OFF_COLS)
        pw = w[w["player_id"] == pid].sort_values("week")
        weeks = []
        for _, wr in pw.iterrows():
            wk_num = int(wr["week"])
            wk = {"week": wk_num}
            wk.update(to_dict(wr, STAT_COLS))
            for pbp_df, cols in [(rec_wk, REC_COLS), (pass_wk, PASS_BONUS_COLS),
                                 (rush_wk, RUSH_BONUS_COLS), (p6_wk, ["pick_6_thrown"])]:
                match = pbp_df[(pbp_df["player_id"] == pid) & (pbp_df["week"] == wk_num)]
                if len(match):
                    for col in cols:
                        val = float(match.iloc[0].get(col, 0))
                        if val != 0:
                            wk[col] = int(val)
            weeks.append(wk)
        players.append({"name": row["player_display_name"], "team": row["recent_team"],
                         "season": s, "weeks": weeks})
    result[pos] = players
    print(f"  {pos}: {[p['name'] for p in players]}")


# ================================================================
#  KICKERS
# ================================================================
print("Building K data...")
fg = pbp[pbp["field_goal_attempt"] == 1].copy()
pat = pbp[pbp["extra_point_attempt"] == 1].copy()

K_COLS = ["k_fg_made", "k_fg_made_0_19", "k_fg_made_20_29", "k_fg_made_30_39",
          "k_fg_made_40_49", "k_fg_made_50_plus", "k_fg_yard_total", "k_fg_yard_over_30",
          "k_fg_missed", "k_fg_missed_0_19", "k_fg_missed_20_29", "k_fg_missed_30_39",
          "k_fg_missed_40_49", "k_fg_missed_50_plus", "k_pat_made", "k_pat_missed"]


def kicker_stats(group):
    made = group[group["field_goal_result"] == "made"]
    miss = group[group["field_goal_result"].isin(["missed", "blocked"])]
    kd_m = made["kick_distance"].fillna(0)
    kd_x = miss["kick_distance"].fillna(0)
    # Also include PATs from same kicker (need to be passed in separately)
    return pd.Series({
        "k_fg_made": len(made), "k_fg_made_0_19": (kd_m <= 19).sum(),
        "k_fg_made_20_29": ((kd_m >= 20) & (kd_m <= 29)).sum(),
        "k_fg_made_30_39": ((kd_m >= 30) & (kd_m <= 39)).sum(),
        "k_fg_made_40_49": ((kd_m >= 40) & (kd_m <= 49)).sum(),
        "k_fg_made_50_plus": (kd_m >= 50).sum(),
        "k_fg_yard_total": kd_m.sum(),
        "k_fg_yard_over_30": kd_m.apply(lambda x: max(0, x - 30)).sum(),
        "k_fg_missed": len(miss), "k_fg_missed_0_19": (kd_x <= 19).sum(),
        "k_fg_missed_20_29": ((kd_x >= 20) & (kd_x <= 29)).sum(),
        "k_fg_missed_30_39": ((kd_x >= 30) & (kd_x <= 39)).sum(),
        "k_fg_missed_40_49": ((kd_x >= 40) & (kd_x <= 49)).sum(),
        "k_fg_missed_50_plus": (kd_x >= 50).sum(),
    })


def pat_stats(group):
    return pd.Series({
        "k_pat_made": (group["extra_point_result"] == "good").sum(),
        "k_pat_missed": group["extra_point_result"].isin(["failed", "blocked", "aborted"]).sum(),
    })


# Season FG stats per kicker
k_fg_szn = fg.groupby(["kicker_player_id", "kicker_player_name"]).apply(
    kicker_stats, include_groups=False).reset_index()
k_pat_szn = pat.groupby(["kicker_player_id", "kicker_player_name"]).apply(
    pat_stats, include_groups=False).reset_index()
k_szn = k_fg_szn.merge(k_pat_szn, on=["kicker_player_id", "kicker_player_name"], how="outer").fillna(0)
k_szn["k_score"] = k_szn["k_fg_made"] * 3 + k_szn["k_pat_made"]

# Weekly
k_fg_wk = fg.groupby(["week", "kicker_player_id"]).apply(
    kicker_stats, include_groups=False).reset_index()
k_pat_wk = pat.groupby(["week", "kicker_player_id"]).apply(
    pat_stats, include_groups=False).reset_index()
k_wk = k_fg_wk.merge(k_pat_wk, on=["week", "kicker_player_id"], how="outer").fillna(0)

# Get team from PBP
kicker_teams = pbp[pbp["kicker_player_id"].notna()].groupby("kicker_player_id")["posteam"].first()

top_k = k_szn.nlargest(10, "k_score")
kickers = []
for _, row in top_k.iterrows():
    pid = row["kicker_player_id"]
    name = row["kicker_player_name"]
    team = kicker_teams.get(pid, "?")
    s = to_dict(row, K_COLS)
    pw = k_wk[k_wk["kicker_player_id"] == pid].sort_values("week")
    weeks = []
    for _, wr in pw.iterrows():
        wk = {"week": int(wr["week"])}
        wk.update(to_dict(wr, K_COLS))
        weeks.append(wk)
    kickers.append({"name": name, "team": team, "season": s, "weeks": weeks})
result["K"] = kickers
print(f"  K: {[p['name'] for p in kickers]}")


# ================================================================
#  TEAM DEFENSE
# ================================================================
print("Building DEF data...")

# Points allowed per team per week from schedule
home = sched[["game_id", "week", "home_team", "away_score"]].rename(
    columns={"home_team": "team", "away_score": "pts_allowed"})
away = sched[["game_id", "week", "away_team", "home_score"]].rename(
    columns={"away_team": "team", "home_score": "pts_allowed"})
team_pts = pd.concat([home, away], ignore_index=True)

# Yards allowed: sum yards_gained by opposing offense
off_plays = pbp[pbp["play_type"].isin(["pass", "run"])]
yds_by_offense = off_plays.groupby(["game_id", "posteam"])["yards_gained"].sum().reset_index()
# Yards allowed by defteam = yards gained by posteam
# Need to map posteam -> defteam. Each game has exactly 2 teams.
game_teams = pbp.groupby("game_id")[["home_team", "away_team"]].first().reset_index()
yds_by_offense = yds_by_offense.merge(game_teams, on="game_id")
yds_by_offense["defteam"] = yds_by_offense.apply(
    lambda r: r["away_team"] if r["posteam"] == r["home_team"] else r["home_team"], axis=1)
team_yds = yds_by_offense[["game_id", "defteam", "yards_gained"]].rename(
    columns={"defteam": "team", "yards_gained": "yds_allowed"})
# Add week
game_weeks = pbp.groupby("game_id")["week"].first().reset_index()
team_yds = team_yds.merge(game_weeks, on="game_id")

# Defensive play stats per team per game
solo_cols = [c for c in pbp.columns if c.startswith("solo_tackle_") and c.endswith("_player_id")]
assist_cols = [c for c in pbp.columns if c.startswith("assist_tackle_") and c.endswith("_player_id")]
pd_cols = [c for c in pbp.columns if c.startswith("pass_defense_") and c.endswith("_player_id")]

DEF_STAT_COLS = [
    "td_sacks", "td_sack_yards", "td_interceptions", "td_int_yards",
    "td_fumble_recoveries", "td_fumble_return_yards", "td_tfl",
    "td_forced_fumbles", "td_safeties", "td_blocked_kicks",
    "td_qb_hits", "td_pass_defended", "td_def_td",
    "td_solo_tackles", "td_assist_tackles", "td_tackles",
    "td_forced_punts", "td_three_and_outs", "td_fourth_down_stops",
    "td_2pt_returns",
    "td_st_td", "td_st_forced_fumble", "td_st_fumble_recovery",
    "td_punt_return_yards", "td_kick_return_yards",
]

BRACKET_COLS = [
    "td_pts_allowed", "td_yds_allowed",
    "td_pts_0", "td_pts_1_6", "td_pts_7_13", "td_pts_14_20",
    "td_pts_21_27", "td_pts_28_34", "td_pts_35_plus",
    "td_yds_lt_100", "td_yds_100_199", "td_yds_200_299",
    "td_yds_300_349", "td_yds_350_399", "td_yds_400_449",
    "td_yds_450_499", "td_yds_500_549", "td_yds_550_plus",
]

ALL_DEF_COLS = DEF_STAT_COLS + BRACKET_COLS


def def_game_stats(group):
    non_st = group[~group["play_type"].isin(["kickoff", "punt"])]
    st = group[group["play_type"].isin(["kickoff", "punt"])]
    # Count tackles
    n_solo = sum(group[c].notna().sum() for c in solo_cols if c in group.columns)
    n_assist = sum(group[c].notna().sum() for c in assist_cols if c in group.columns)
    n_pd = sum(group[c].notna().sum() for c in pd_cols if c in group.columns)
    # 3 and outs: drives ending in punt with <=3 offensive plays
    off = group[group["play_type"].isin(["pass", "run", "qb_kneel", "qb_spike"])]
    drive_counts = off.groupby("fixed_drive").size()
    drive_results = group.dropna(subset=["fixed_drive_result"]).groupby("fixed_drive")["fixed_drive_result"].first()
    punt_drives = drive_results[drive_results == "Punt"]
    aligned = drive_counts.reindex(punt_drives.index).dropna()
    three_and_outs = (aligned <= 3).sum()

    return pd.Series({
        "td_sacks": (group["sack"] == 1).sum(),
        "td_sack_yards": group.loc[group["sack"] == 1, "yards_gained"].abs().sum(),
        "td_interceptions": (group["interception"] == 1).sum(),
        "td_int_yards": group.loc[group["interception"] == 1, "return_yards"].fillna(0).sum(),
        "td_fumble_recoveries": (group["fumble_lost"] == 1).sum(),
        "td_fumble_return_yards": group.loc[group["fumble_lost"] == 1, "fumble_recovery_1_yards"].fillna(0).abs().sum(),
        "td_tfl": (group["tackled_for_loss"] == 1).sum(),
        "td_forced_fumbles": (group["fumble_forced"] == 1).sum(),
        "td_safeties": (group["safety"] == 1).sum(),
        "td_blocked_kicks": ((group["field_goal_result"] == "blocked").sum()
                              + (group["extra_point_result"] == "blocked").sum()
                              + (group.get("punt_blocked", pd.Series(dtype=float)) == 1).sum()),
        "td_qb_hits": (group["qb_hit"] == 1).sum(),
        "td_pass_defended": n_pd,
        "td_def_td": (non_st["return_touchdown"] == 1).sum(),
        "td_solo_tackles": n_solo,
        "td_assist_tackles": n_assist,
        "td_tackles": n_solo + n_assist,
        "td_forced_punts": (group["play_type"] == "punt").sum(),
        "td_three_and_outs": three_and_outs,
        "td_fourth_down_stops": (group["fourth_down_failed"] == 1).sum(),
        "td_2pt_returns": (group["defensive_two_point_conv"].fillna(0) == 1).sum(),
        "td_st_td": (st["return_touchdown"] == 1).sum(),
        "td_st_forced_fumble": (st["fumble_forced"] == 1).sum(),
        "td_st_fumble_recovery": (st["fumble_lost"] == 1).sum(),
        "td_punt_return_yards": group.loc[group["play_type"] == "punt", "return_yards"].fillna(0).sum(),
        "td_kick_return_yards": group.loc[group["play_type"] == "kickoff", "return_yards"].fillna(0).sum(),
    })


# Compute per team per game (defteam perspective)
# For each game, plays where defteam == team
def_weekly = pbp.groupby(["game_id", "week", "defteam"]).apply(
    def_game_stats, include_groups=False).reset_index().rename(columns={"defteam": "team"})

# Merge points/yards allowed
def_weekly = def_weekly.merge(team_pts, on=["game_id", "team"], how="left", suffixes=("", "_sched"))
def_weekly = def_weekly.merge(team_yds[["game_id", "team", "yds_allowed"]], on=["game_id", "team"], how="left")
def_weekly["td_pts_allowed"] = def_weekly["pts_allowed"].fillna(0)
def_weekly["td_yds_allowed"] = def_weekly["yds_allowed"].fillna(0)

# Point brackets per game
for col_name, lo, hi in [("td_pts_0", 0, 0), ("td_pts_1_6", 1, 6), ("td_pts_7_13", 7, 13),
                          ("td_pts_14_20", 14, 20), ("td_pts_21_27", 21, 27),
                          ("td_pts_28_34", 28, 34), ("td_pts_35_plus", 35, 999)]:
    def_weekly[col_name] = ((def_weekly["td_pts_allowed"] >= lo) & (def_weekly["td_pts_allowed"] <= hi)).astype(int)

# Yard brackets per game
for col_name, lo, hi in [("td_yds_lt_100", -999, 99), ("td_yds_100_199", 100, 199),
                          ("td_yds_200_299", 200, 299), ("td_yds_300_349", 300, 349),
                          ("td_yds_350_399", 350, 399), ("td_yds_400_449", 400, 449),
                          ("td_yds_450_499", 450, 499), ("td_yds_500_549", 500, 549),
                          ("td_yds_550_plus", 550, 9999)]:
    def_weekly[col_name] = ((def_weekly["td_yds_allowed"] >= lo) & (def_weekly["td_yds_allowed"] <= hi)).astype(int)

# Season totals per team
def_season = def_weekly.groupby("team")[DEF_STAT_COLS + BRACKET_COLS].sum().reset_index()
def_season["def_score"] = (def_season["td_def_td"] * 6 + def_season["td_sacks"] * 2
                            + def_season["td_interceptions"] * 3 + def_season["td_fumble_recoveries"] * 2
                            + def_season["td_safeties"] * 2 + def_season["td_blocked_kicks"] * 2
                            + def_season["td_st_td"] * 6)

top_def = def_season.nlargest(10, "def_score")
defenses = []
for _, row in top_def.iterrows():
    team = row["team"]
    s = to_dict(row, ALL_DEF_COLS)
    dw = def_weekly[def_weekly["team"] == team].sort_values("week_sched" if "week_sched" in def_weekly.columns else "week")
    weeks = []
    for _, wr in dw.iterrows():
        wk = {"week": int(wr.get("week_sched", wr.get("week", 0)))}
        wk.update(to_dict(wr, ALL_DEF_COLS))
        weeks.append(wk)
    defenses.append({"name": f"{team} D/ST", "team": team, "season": s, "weeks": weeks})
result["DEF"] = defenses
print(f"  DEF: {[p['name'] for p in defenses]}")


# ================================================================
#  IDP (Individual Defensive Players)
# ================================================================
print("Building IDP data...")

IDP_COLS = [
    "idp_solo_tackles", "idp_assist_tackles", "idp_tackles",
    "idp_sacks", "idp_sack_yards", "idp_interceptions", "idp_int_return_yards",
    "idp_forced_fumbles", "idp_fumble_recoveries", "idp_fumble_return_yards",
    "idp_tfl", "idp_qb_hits", "idp_pass_defended",
    "idp_safeties", "idp_blocked_kicks", "idp_td",
    "idp_games_10_tackles", "idp_games_2_sacks", "idp_games_3_pass_defended",
]

# Melt tackle columns to get per-player credits
print("  Melting tackle columns...")
id_name_pairs = []
for prefix in ["solo_tackle_", "assist_tackle_"]:
    id_cols = [c for c in pbp.columns if c.startswith(prefix) and c.endswith("_player_id")]
    name_cols = [c.replace("_player_id", "_player_name") for c in id_cols]
    for ic, nc in zip(id_cols, name_cols):
        if ic in pbp.columns and nc in pbp.columns:
            stat = "solo" if "solo" in prefix else "assist"
            df = pbp[["game_id", "week", ic, nc]].dropna(subset=[ic]).rename(
                columns={ic: "player_id", nc: "player_name"})
            df["stat"] = stat
            id_name_pairs.append(df)

tackle_df = pd.concat(id_name_pairs, ignore_index=True)

# Sacks
sack_frames = []
if "sack_player_id" in pbp.columns and "sack_player_name" in pbp.columns:
    sf = pbp[pbp["sack_player_id"].notna()][["game_id", "week", "sack_player_id", "sack_player_name", "yards_gained"]].copy()
    sf = sf.rename(columns={"sack_player_id": "player_id", "sack_player_name": "player_name"})
    sf["credit"] = 1.0
    sack_frames.append(sf)
for hc in ["half_sack_1", "half_sack_2"]:
    ic, nc = f"{hc}_player_id", f"{hc}_player_name"
    if ic in pbp.columns:
        sf = pbp[pbp[ic].notna()][["game_id", "week", ic, nc, "yards_gained"]].copy()
        sf = sf.rename(columns={ic: "player_id", nc: "player_name"})
        sf["credit"] = 0.5
        sack_frames.append(sf)
sack_df = pd.concat(sack_frames, ignore_index=True) if sack_frames else pd.DataFrame()

# Other IDP events (melt simpler columns)
def melt_col(prefix, stat_name):
    """Melt PBP columns like forced_fumble_player_1_player_id -> (player_id, player_name, stat)."""
    frames = []
    id_cols = [c for c in pbp.columns if c.startswith(prefix) and c.endswith("_player_id")]
    for ic in id_cols:
        nc = ic.replace("_player_id", "_player_name")
        if nc not in pbp.columns:
            nc = None
        cols = ["game_id", "week", ic]
        if nc:
            cols.append(nc)
        df = pbp[cols].dropna(subset=[ic])
        rename = {ic: "player_id"}
        if nc:
            rename[nc] = "player_name"
        df = df.rename(columns=rename)
        if "player_name" not in df.columns:
            df["player_name"] = ""
        df["stat"] = stat_name
        frames.append(df[["game_id", "week", "player_id", "player_name", "stat"]])
    return pd.concat(frames, ignore_index=True) if frames else pd.DataFrame(columns=["game_id", "week", "player_id", "player_name", "stat"])


int_df = melt_col("interception_", "interception")
ff_df = melt_col("forced_fumble_player_", "forced_fumble")
fr_df = melt_col("fumble_recovery_", "fumble_recovery")
tfl_df = melt_col("tackle_for_loss_", "tfl")
qbh_df = melt_col("qb_hit_", "qb_hit")
pdef_df = melt_col("pass_defense_", "pass_defended")
blk_df = melt_col("blocked_", "blocked_kick")

# Build per-player per-week IDP stats
print("  Aggregating per player per week...")
# Tackles
tackle_wk = tackle_df.groupby(["week", "player_id", "player_name", "stat"]).size().unstack(fill_value=0).reset_index()
if "solo" not in tackle_wk.columns:
    tackle_wk["solo"] = 0
if "assist" not in tackle_wk.columns:
    tackle_wk["assist"] = 0
tackle_wk["idp_solo_tackles"] = tackle_wk["solo"]
tackle_wk["idp_assist_tackles"] = tackle_wk["assist"]
tackle_wk["idp_tackles"] = tackle_wk["solo"] + tackle_wk["assist"]

# Sacks per player per week
sack_wk = pd.DataFrame()
if len(sack_df):
    sack_wk = sack_df.groupby(["week", "player_id", "player_name"]).agg(
        idp_sacks=("credit", "sum"),
        idp_sack_yards=("yards_gained", lambda x: x.abs().sum())
    ).reset_index()

# Simple count stats per player per week
def count_stat(df, stat_col_name):
    if len(df) == 0:
        return pd.DataFrame(columns=["week", "player_id", "player_name", stat_col_name])
    return df.groupby(["week", "player_id", "player_name"]).size().reset_index(name=stat_col_name)


int_wk = count_stat(int_df, "idp_interceptions")
ff_wk = count_stat(ff_df, "idp_forced_fumbles")
fr_wk = count_stat(fr_df, "idp_fumble_recoveries")
tfl_wk_agg = count_stat(tfl_df, "idp_tfl")
qbh_wk = count_stat(qbh_df, "idp_qb_hits")
pdef_wk = count_stat(pdef_df, "idp_pass_defended")
blk_wk = count_stat(blk_df, "idp_blocked_kicks")

# Merge all IDP weekly stats
idp_base = tackle_wk[["week", "player_id", "player_name", "idp_solo_tackles", "idp_assist_tackles", "idp_tackles"]].copy()
for df in [sack_wk, int_wk, ff_wk, fr_wk, tfl_wk_agg, qbh_wk, pdef_wk, blk_wk]:
    if len(df):
        idp_base = idp_base.merge(df.drop(columns=["player_name"], errors="ignore"),
                                   on=["week", "player_id"], how="outer")
idp_base = idp_base.fillna(0)

# Season totals
stat_agg_cols = [c for c in idp_base.columns if c.startswith("idp_")]
idp_season = idp_base.groupby(["player_id", "player_name"])[stat_agg_cols].sum().reset_index()

# Milestone bonuses
def idp_milestones(player_wk):
    return pd.Series({
        "idp_games_10_tackles": (player_wk["idp_tackles"] >= 10).sum(),
        "idp_games_2_sacks": (player_wk.get("idp_sacks", pd.Series([0])) >= 2).sum(),
        "idp_games_3_pass_defended": (player_wk.get("idp_pass_defended", pd.Series([0])) >= 3).sum(),
    })


idp_miles = idp_base.groupby("player_id").apply(idp_milestones, include_groups=False).reset_index()
idp_season = idp_season.merge(idp_miles, on="player_id", how="left")

# INT return yards and fumble return yards (from PBP directly)
int_plays = pbp[pbp["interception"] == 1]
int_ret_szn = int_plays.groupby("interception_player_id")["return_yards"].sum().reset_index()
int_ret_szn.columns = ["player_id", "idp_int_return_yards"]
idp_season = idp_season.merge(int_ret_szn, on="player_id", how="left").fillna(0)

# IDP TD
non_st = pbp[~pbp["play_type"].isin(["kickoff", "punt"])]
ret_td = non_st[non_st["return_touchdown"] == 1]
if "td_player_id" in ret_td.columns:
    td_counts = ret_td.groupby("td_player_id").size().reset_index(name="idp_td")
    td_counts.columns = ["player_id", "idp_td"]
    idp_season = idp_season.merge(td_counts, on="player_id", how="left").fillna(0)

# Get top 10 by tackles
top_idp = idp_season.nlargest(10, "idp_tackles")
# Get team from roster or PBP
player_teams = {}
for col_id, col_team in [("solo_tackle_1_player_id", "solo_tackle_1_team"),
                          ("interception_player_id", "defteam"),
                          ("sack_player_id", "defteam")]:
    if col_id in pbp.columns and col_team in pbp.columns:
        mapping = pbp[pbp[col_id].notna()].groupby(col_id)[col_team].first()
        for pid, team in mapping.items():
            if pid not in player_teams:
                player_teams[pid] = team

idp_players = []
for _, row in top_idp.iterrows():
    pid = row["player_id"]
    name = row["player_name"]
    team = player_teams.get(pid, "?")
    s = to_dict(row, IDP_COLS)
    pw = idp_base[idp_base["player_id"] == pid].sort_values("week")
    weeks = []
    for _, wr in pw.iterrows():
        wk = {"week": int(wr["week"])}
        wk.update(to_dict(wr, [c for c in stat_agg_cols if c in wr.index]))
        weeks.append(wk)
    idp_players.append({"name": name, "team": team, "season": s, "weeks": weeks})
result["IDP"] = idp_players
print(f"  IDP: {[p['name'] for p in idp_players]}")


# ================================================================
#  Write output
# ================================================================
with open(OUT_PATH, "w") as f:
    f.write("const PLAYER_DATA = ")
    json.dump(result, f, indent=1)
    f.write(";\n")

size = os.path.getsize(OUT_PATH)
print(f"\nWrote {size:,} bytes to {OUT_PATH}")
print(f"Positions: {list(result.keys())}")
for pos in result:
    print(f"  {pos}: {len(result[pos])} entries")
