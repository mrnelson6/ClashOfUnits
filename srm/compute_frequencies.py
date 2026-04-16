"""
Compute Frequencies & Normalization for SRM Adjustment
======================================================
Counts how often each of the 142 scoring categories occurs per NFL season,
then calculates normalized adjustment increments so every category change
has roughly equal seasonal impact.

Usage:
    python compute_frequencies.py
    python compute_frequencies.py --csv          # also save results to CSV
    python compute_frequencies.py --section IDP  # show one section only

Output:
    - Frequency per season for each category
    - Current adjustment increment
    - Seasonal impact (freq * adjustment)
    - Normalized adjustment (equalized impact)
"""

import os
import sys
import pandas as pd
import numpy as np
from category_mapping import CATEGORIES

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")


# ====================================================================
#  Data loading
# ====================================================================
def load_data():
    print("Loading cached data...")
    pbp = pd.read_parquet(os.path.join(DATA_DIR, "pbp.parquet"))
    weekly = pd.read_parquet(os.path.join(DATA_DIR, "weekly.parquet"))
    schedules = pd.read_parquet(os.path.join(DATA_DIR, "schedules.parquet"))
    print(f"  PBP: {len(pbp):,} plays | Weekly: {len(weekly):,} rows | "
          f"Schedules: {len(schedules):,} games")
    return pbp, weekly, schedules


# ====================================================================
#  Weekly-based categories
# ====================================================================
def compute_weekly(w, results):
    """Categories computable from weekly player stats."""

    # --- Passing ---
    results["Passing Yards"] = w["passing_yards"].sum()
    results["Passing TDs"] = w["passing_tds"].sum()
    results["Passing First Down"] = w["passing_first_downs"].sum()
    results["2-pt Conversion (Pass)"] = w["passing_2pt_conversions"].sum()
    results["Pass Intercepted"] = w["interceptions"].sum()
    results["Pass Completed"] = w["completions"].sum()
    results["Incomplete Pass"] = (
        w["attempts"].fillna(0) - w["completions"].fillna(0)
    ).sum()
    results["Pass Attempt"] = w["attempts"].sum()
    results["QB Sacked"] = w["sacks"].sum()

    # --- Rushing ---
    results["Rushing Yards"] = w["rushing_yards"].sum()
    results["Rushing TD"] = w["rushing_tds"].sum()
    results["Rushing First Down"] = w["rushing_first_downs"].sum()
    results["2-pt Conversion (Rush)"] = w["rushing_2pt_conversions"].sum()
    results["Rush Attempt"] = w["carries"].sum()

    # --- Receiving ---
    results["Reception"] = w["receptions"].sum()
    results["Receiving Yards"] = w["receiving_yards"].sum()
    results["Receiving TD"] = w["receiving_tds"].sum()
    results["Receiving First Down"] = w["receiving_first_downs"].sum()
    results["2-pt Conversion (Rec)"] = w["receiving_2pt_conversions"].sum()

    # --- Position-filtered receptions ---
    for pos in ["RB", "WR", "TE"]:
        results[f"Reception Bonus - {pos}"] = (
            w.loc[w["position"] == pos, "receptions"].sum()
        )

    # --- Fumbles ---
    results["Fumble"] = (
        w["rushing_fumbles"].fillna(0)
        + w["receiving_fumbles"].fillna(0)
        + w["sack_fumbles"].fillna(0)
    ).sum()
    results["Fumble Lost"] = (
        w["rushing_fumbles_lost"].fillna(0)
        + w["receiving_fumbles_lost"].fillna(0)
        + w["sack_fumbles_lost"].fillna(0)
    ).sum()

    # --- Game milestone bonuses ---
    ry = w["rushing_yards"].fillna(0)
    results["100-199 Yard Rushing Game"] = ((ry >= 100) & (ry < 200)).sum()
    results["200+ Yard Rushing Game"] = (ry >= 200).sum()

    recy = w["receiving_yards"].fillna(0)
    results["100-199 Yard Receiving Game"] = ((recy >= 100) & (recy < 200)).sum()
    results["200+ Yard Receiving Game"] = (recy >= 200).sum()

    py = w["passing_yards"].fillna(0)
    results["300-399 Yard Passing Game"] = ((py >= 300) & (py < 400)).sum()
    results["400+ Yard Passing Game"] = (py >= 400).sum()

    combined = w["rushing_yards"].fillna(0) + w["receiving_yards"].fillna(0)
    results["100-199 Combined Rush + Rec Yards"] = (
        (combined >= 100) & (combined < 200)
    ).sum()
    results["200+ Combined Rush + Rec Yards"] = (combined >= 200).sum()

    results["25+ Pass Completions"] = (w["completions"].fillna(0) >= 25).sum()
    results["20+ Carries"] = (w["carries"].fillna(0) >= 20).sum()

    # --- First Down Bonus by position ---
    rb = w[w["position"] == "RB"]
    results["First Down Bonus - RB"] = (
        rb["rushing_first_downs"].fillna(0) + rb["receiving_first_downs"].fillna(0)
    ).sum()

    results["First Down Bonus - WR"] = (
        w.loc[w["position"] == "WR", "receiving_first_downs"].sum()
    )

    results["First Down Bonus - TE"] = (
        w.loc[w["position"] == "TE", "receiving_first_downs"].sum()
    )

    qb = w[w["position"] == "QB"]
    results["First Down Bonus - QB"] = (
        qb["passing_first_downs"].fillna(0) + qb["rushing_first_downs"].fillna(0)
    ).sum()


# ====================================================================
#  PBP play-level categories
# ====================================================================
def compute_pbp(p, results, unavailable):
    """Categories requiring play-by-play data."""

    # --- Passing bonuses ---
    results["Pick 6 Thrown"] = (
        (p["interception"] == 1) & (p["return_touchdown"] == 1)
    ).sum()
    results["40+ Yard Completion Bonus"] = (
        (p["complete_pass"] == 1) & (p["yards_gained"] >= 40)
    ).sum()
    results["40+ Yard Pass TD Bonus"] = (
        (p["pass_touchdown"] == 1) & (p["yards_gained"] >= 40)
    ).sum()
    results["50+ Yard Pass TD Bonus"] = (
        (p["pass_touchdown"] == 1) & (p["yards_gained"] >= 50)
    ).sum()

    # --- Rushing bonuses ---
    results["40+ Yard Rush Bonus"] = (
        (p["rush_attempt"] == 1) & (p["yards_gained"] >= 40)
    ).sum()
    results["40+ Yard Rush TD Bonus"] = (
        (p["rush_touchdown"] == 1) & (p["yards_gained"] >= 40)
    ).sum()
    results["50+ Yard Rush TD Bonus"] = (
        (p["rush_touchdown"] == 1) & (p["yards_gained"] >= 50)
    ).sum()

    # --- Reception yardage brackets ---
    comp = p[p["complete_pass"] == 1]
    yg = comp["yards_gained"]
    results["0-4 Yard Reception Bonus"] = ((yg >= 0) & (yg <= 4)).sum()
    results["5-9 Yard Reception Bonus"] = ((yg >= 5) & (yg <= 9)).sum()
    results["10-19 Yard Reception Bonus"] = ((yg >= 10) & (yg <= 19)).sum()
    results["20-29 Yard Reception Bonus"] = ((yg >= 20) & (yg <= 29)).sum()
    results["30-39 Yard Reception Bonus"] = ((yg >= 30) & (yg <= 39)).sum()
    results["40-49 Yard Reception Bonus"] = ((yg >= 40) & (yg <= 49)).sum()
    results["50+ Yard Reception Bonus"] = (yg >= 50).sum()

    # --- Kicking ---
    fg = p[p["field_goal_attempt"] == 1].copy()
    fg_made = fg[fg["field_goal_result"] == "made"]
    fg_miss = fg[fg["field_goal_result"].isin(["missed", "blocked"])]
    kd_made = fg_made["kick_distance"].fillna(0)
    kd_miss = fg_miss["kick_distance"].fillna(0)

    results["FG Made"] = len(fg_made)
    results["FG Made (0-19 yards)"] = (kd_made <= 19).sum()
    results["FG Made (20-29 yards)"] = ((kd_made >= 20) & (kd_made <= 29)).sum()
    results["FG Made (30-39 yards)"] = ((kd_made >= 30) & (kd_made <= 39)).sum()
    results["FG Made (40-49 yards)"] = ((kd_made >= 40) & (kd_made <= 49)).sum()
    results["FG Made (50+ yards)"] = (kd_made >= 50).sum()
    results["Points per FG yard"] = kd_made.sum()
    results["Points per FG yard over 30"] = kd_made.apply(
        lambda x: max(0, x - 30)
    ).sum()
    results["PAT Made"] = (p["extra_point_result"] == "good").sum()

    results["FG Missed"] = len(fg_miss)
    results["FG Missed (0-19 yards)"] = (kd_miss <= 19).sum()
    results["FG Missed (20-29 yards)"] = ((kd_miss >= 20) & (kd_miss <= 29)).sum()
    results["FG Missed (30-39 yards)"] = ((kd_miss >= 30) & (kd_miss <= 39)).sum()
    results["FG Missed (40-49 yards)"] = ((kd_miss >= 40) & (kd_miss <= 49)).sum()
    results["FG Missed (50+ yards)"] = (kd_miss >= 50).sum()
    results["PAT Missed"] = p["extra_point_result"].isin(
        ["failed", "blocked", "aborted"]
    ).sum()

    # --- Team defense play-level ---
    # Defense TD = INT return TD + fumble return TD (non-ST) + blocked kick return TD
    non_st = p[~p["play_type"].isin(["kickoff", "punt"])]
    results["Defense TD"] = (non_st["return_touchdown"] == 1).sum()

    results["Sack (Team Def)"] = (p["sack"] == 1).sum()
    sack_plays = p[p["sack"] == 1]
    results["Sack Yards (Team Def)"] = sack_plays["yards_gained"].abs().sum()

    results["Interception (Team Def)"] = (p["interception"] == 1).sum()
    int_plays = p[p["interception"] == 1]
    results["Interception Yards (Team Def)"] = (
        int_plays["return_yards"].fillna(0).sum()
    )

    results["Fumble Recovery (Team Def)"] = (p["fumble_lost"] == 1).sum()
    fum_plays = p[p["fumble_lost"] == 1]
    results["Fumble Return Yards (Team Def)"] = (
        fum_plays["fumble_recovery_1_yards"].fillna(0).abs().sum()
    )

    results["Tackle For Loss (Team Def)"] = (p["tackled_for_loss"] == 1).sum()
    results["Safety (Team Def)"] = (p["safety"] == 1).sum()
    results["Forced Fumble (Team Def)"] = (p["fumble_forced"] == 1).sum()

    # Tackles - count individual credits from PBP columns
    solo_cols = [
        c for c in p.columns
        if c.startswith("solo_tackle_") and c.endswith("_player_id")
    ]
    assist_cols = [
        c for c in p.columns
        if c.startswith("assist_tackle_") and c.endswith("_player_id")
    ]
    total_solo = sum(p[col].notna().sum() for col in solo_cols)
    total_assist = sum(p[col].notna().sum() for col in assist_cols)

    results["Solo Tackle (Team Def)"] = total_solo
    results["Assisted Tackle (Team Def)"] = total_assist
    results["Tackle (Team Def)"] = total_solo + total_assist

    # Blocked kicks
    results["Blocked Kick"] = (
        (p["field_goal_result"] == "blocked").sum()
        + (p["extra_point_result"] == "blocked").sum()
        + (p.get("punt_blocked", pd.Series(dtype=float)) == 1).sum()
    )

    # Forced Punt = total punts (each punt credited to opposing defense)
    results["Forced Punt"] = (p["play_type"] == "punt").sum()

    # QB hits
    results["Hit on QB (Team Def)"] = (p["qb_hit"] == 1).sum()

    # Pass defended - count plays with at least one PD
    pd_cols = [
        c for c in p.columns
        if c.startswith("pass_defense_") and c.endswith("_player_id")
    ]
    results["Pass Defended (Team Def)"] = p[pd_cols].notna().any(axis=1).sum()

    # 2-pt conversion returns
    results["2-pt Conversion Returns"] = (
        p["defensive_two_point_conv"].fillna(0) == 1
    ).sum()

    # Return yards on missed FGs and blocked kicks
    missed_fg_plays = p[
        (p["field_goal_attempt"] == 1)
        & (p["field_goal_result"].isin(["missed"]))
    ]
    results["Missed FG Return Yards (Team Def)"] = (
        missed_fg_plays["return_yards"].fillna(0).sum()
    )

    blocked_plays = p[
        (p["field_goal_result"] == "blocked")
        | (p["extra_point_result"] == "blocked")
        | (p.get("punt_blocked", pd.Series(dtype=float)) == 1)
    ]
    results["Blocked Kick Return Yards (Team Def)"] = (
        blocked_plays["return_yards"].fillna(0).sum()
    )

    # --- 3 and Out ---
    # Drives ending in punt with <= 3 offensive plays
    off_plays = p[p["play_type"].isin(["pass", "run", "qb_kneel", "qb_spike"])]
    drive_play_counts = off_plays.groupby(
        ["game_id", "posteam", "fixed_drive"]
    ).size()
    drive_results = (
        p.dropna(subset=["fixed_drive_result"])
        .groupby(["game_id", "posteam", "fixed_drive"])["fixed_drive_result"]
        .first()
    )
    punt_drives = drive_results[drive_results == "Punt"]
    # Align indices and count drives with <= 3 plays that ended in punt
    three_and_out = drive_play_counts.reindex(punt_drives.index).dropna()
    results["3 and Out"] = (three_and_out <= 3).sum()

    # --- 4th Down Stop ---
    results["4th Down Stop"] = (p["fourth_down_failed"] == 1).sum()

    # --- Fumble Recovery TD (any player, offense or defense) ---
    results["Fumble Recovery TD"] = (
        (p["fumble"] == 1) & (p["return_touchdown"] == 1)
    ).sum()
    # Also check for fumble plays where td_team != posteam (def recovery TD)
    # that might not have return_touchdown flagged
    fum_td_alt = (
        (p["fumble_lost"] == 1)
        & (p["touchdown"] == 1)
        & (p["td_team"] != p["posteam"])
    ).sum()
    if fum_td_alt > results["Fumble Recovery TD"]:
        results["Fumble Recovery TD"] = fum_td_alt

    # --- Special Teams (D/ST and Player share same frequencies) ---
    st_plays = p[p["play_type"].isin(["kickoff", "punt"])]

    results["Special Teams TD (D/ST)"] = (
        st_plays["return_touchdown"] == 1
    ).sum()

    results["Special Teams Forced Fumble (D/ST)"] = (
        st_plays["fumble_forced"] == 1
    ).sum()

    results["Special Teams Fumble Recovery (D/ST)"] = (
        st_plays["fumble_lost"] == 1
    ).sum()

    st_solo_tackles = sum(
        st_plays[col].notna().sum()
        for col in solo_cols
        if col in st_plays.columns
    )
    results["Special Teams Solo Tackle (D/ST)"] = st_solo_tackles

    punt_returns = p[
        (p["play_type"] == "punt") & (p["return_yards"].notna())
    ]
    results["Punt Return Yards (D/ST)"] = punt_returns["return_yards"].sum()

    kick_returns = p[
        (p["play_type"] == "kickoff") & (p["return_yards"].notna())
    ]
    results["Kick Return Yards (D/ST)"] = kick_returns["return_yards"].sum()

    # Special Teams Player = same frequencies as D/ST
    results["Special Teams Player TD"] = results["Special Teams TD (D/ST)"]
    results["Special Teams Player Forced Fumble"] = results[
        "Special Teams Forced Fumble (D/ST)"
    ]
    results["Special Teams Player Fumble Recovery"] = results[
        "Special Teams Fumble Recovery (D/ST)"
    ]
    results["Special Teams Player Solo Tackle"] = results[
        "Special Teams Solo Tackle (D/ST)"
    ]
    results["Player Punt Return Yards"] = results["Punt Return Yards (D/ST)"]
    results["Player Kick Return Yards"] = results["Kick Return Yards (D/ST)"]

    # --- IDP (same underlying events as Team Def) ---
    results["IDP Touchdown"] = results["Defense TD"]  # same pool
    results["Sack (IDP)"] = results["Sack (Team Def)"]
    results["Sack Yards (IDP)"] = results["Sack Yards (Team Def)"]
    results["Tackle (IDP)"] = results["Tackle (Team Def)"]
    results["Tackle For Loss (IDP)"] = results["Tackle For Loss (Team Def)"]
    results["Interception (IDP)"] = results["Interception (Team Def)"]
    results["Interception Return Yards (IDP)"] = results[
        "Interception Yards (Team Def)"
    ]
    results["Fumble Recovery (IDP)"] = results["Fumble Recovery (Team Def)"]
    results["Fumble Recovery Return Yards (IDP)"] = results[
        "Fumble Return Yards (Team Def)"
    ]
    results["Forced Fumble (IDP)"] = results["Forced Fumble (Team Def)"]
    results["Safety (IDP)"] = results["Safety (Team Def)"]
    results["Assisted Tackle (IDP)"] = results["Assisted Tackle (Team Def)"]
    results["Solo Tackle (IDP)"] = results["Solo Tackle (Team Def)"]
    results["Pass Defended (IDP)"] = results["Pass Defended (Team Def)"]

    # Hit on QB (IDP) - count individual player credits (may exceed play count)
    qb_hit_cols = [
        c for c in p.columns
        if c.startswith("qb_hit_") and c.endswith("_player_id")
    ]
    if qb_hit_cols:
        results["Hit on QB (IDP)"] = sum(
            p[col].notna().sum() for col in qb_hit_cols
        )
    else:
        # Fall back to play-level count
        results["Hit on QB (IDP)"] = results["Hit on QB (Team Def)"]
        unavailable.append(
            "Hit on QB (IDP): no per-player qb_hit columns found; "
            "using play-level count as fallback"
        )

    # Blocked Punt, PAT, or FG (IDP)
    if "blocked_player_id" in p.columns:
        results["Blocked Punt, PAT, or FG (IDP)"] = (
            p["blocked_player_id"].notna().sum()
        )
    else:
        results["Blocked Punt, PAT, or FG (IDP)"] = results["Blocked Kick"]
        unavailable.append(
            "Blocked Punt, PAT, or FG (IDP): no blocked_player_id column; "
            "using total blocked kicks as fallback"
        )

    # --- 50+ yard return TD bonuses ---
    int_ret = p[(p["interception"] == 1) & (p["return_touchdown"] == 1)]
    results["50+ Yard Interception Return TD Bonus"] = (
        int_ret["return_yards"].fillna(0) >= 50
    ).sum()

    # Fumble recovery return TD 50+ yards
    fum_ret_td = p[
        (p["fumble_lost"] == 1)
        & (p["touchdown"] == 1)
        & (p["td_team"] != p["posteam"])
    ]
    results["50+ Yard Fumble Recovery Return TD Bonus"] = (
        fum_ret_td["fumble_recovery_1_yards"].fillna(0).abs() >= 50
    ).sum()


# ====================================================================
#  PBP aggregated to game level (IDP bonuses, yards allowed)
# ====================================================================
def compute_pbp_game_agg(p, results, unavailable):
    """Categories that require aggregating PBP to per-player-game or per-team-game."""

    # --- Yards Allowed brackets (team defense) ---
    # Sum offensive yards per team per game
    off_plays = p[p["play_type"].isin(["pass", "run"])]
    team_game_yards = (
        off_plays.groupby(["game_id", "posteam"])["yards_gained"]
        .sum()
        .reset_index()
    )
    # Yards allowed by defteam = yards gained by posteam
    yds = team_game_yards["yards_gained"]
    results["Less Than 100 Total Yards Allowed"] = (yds < 100).sum()
    results["100-199 Yards Allowed"] = ((yds >= 100) & (yds < 200)).sum()
    results["200-299 Yards Allowed"] = ((yds >= 200) & (yds < 300)).sum()
    results["300-349 Yards Allowed"] = ((yds >= 300) & (yds < 350)).sum()
    results["350-399 Yards Allowed"] = ((yds >= 350) & (yds < 400)).sum()
    results["400-449 Yards Allowed"] = ((yds >= 400) & (yds < 450)).sum()
    results["450-499 Yards Allowed"] = ((yds >= 450) & (yds < 500)).sum()
    results["500-549 Yards Allowed"] = ((yds >= 500) & (yds < 550)).sum()
    results["550+ Yards Allowed"] = (yds >= 550).sum()
    results["Points per Yards Allowed"] = yds.sum()

    # --- IDP game bonuses ---
    solo_cols = [
        c for c in p.columns
        if c.startswith("solo_tackle_") and c.endswith("_player_id")
    ]
    assist_cols = [
        c for c in p.columns
        if c.startswith("assist_tackle_") and c.endswith("_player_id")
    ]

    # 10+ Tackle Bonus: aggregate tackles per player per game
    tackle_frames = []
    for col in solo_cols + assist_cols:
        df = p[["game_id", col]].dropna(subset=[col])
        df = df.rename(columns={col: "player_id"})
        tackle_frames.append(df)
    if tackle_frames:
        all_tackles = pd.concat(tackle_frames, ignore_index=True)
        tackles_per_pg = all_tackles.groupby(["game_id", "player_id"]).size()
        results["10+ Tackle Bonus"] = (tackles_per_pg >= 10).sum()
    else:
        results["10+ Tackle Bonus"] = 0
        unavailable.append("10+ Tackle Bonus: could not aggregate tackle columns")

    # 2+ Sack Bonus: aggregate sacks per player per game
    sack_frames = []
    if "sack_player_id" in p.columns:
        full = p[p["sack_player_id"].notna()][
            ["game_id", "sack_player_id"]
        ].rename(columns={"sack_player_id": "player_id"})
        full["credit"] = 1.0
        sack_frames.append(full)
    for col in ["half_sack_1_player_id", "half_sack_2_player_id"]:
        if col in p.columns:
            half = p[p[col].notna()][["game_id", col]].rename(
                columns={col: "player_id"}
            )
            half["credit"] = 0.5
            sack_frames.append(half)
    if sack_frames:
        all_sacks = pd.concat(sack_frames, ignore_index=True)
        sacks_per_pg = all_sacks.groupby(["game_id", "player_id"])["credit"].sum()
        results["2+ Sack Bonus"] = (sacks_per_pg >= 2).sum()
    else:
        results["2+ Sack Bonus"] = 0
        unavailable.append("2+ Sack Bonus: could not aggregate sack columns")

    # 3+ Pass Defended Bonus
    pd_cols = [
        c for c in p.columns
        if c.startswith("pass_defense_") and c.endswith("_player_id")
    ]
    if pd_cols:
        pd_frames = []
        for col in pd_cols:
            df = p[["game_id", col]].dropna(subset=[col])
            df = df.rename(columns={col: "player_id"})
            pd_frames.append(df)
        all_pds = pd.concat(pd_frames, ignore_index=True)
        pds_per_pg = all_pds.groupby(["game_id", "player_id"]).size()
        results["3+ Pass Defended Bonus"] = (pds_per_pg >= 3).sum()
    else:
        results["3+ Pass Defended Bonus"] = 0
        unavailable.append("3+ Pass Defended Bonus: no pass_defense columns")


# ====================================================================
#  Schedule-based categories
# ====================================================================
def compute_schedule(sched, results):
    """Categories from game schedule / final scores."""
    # Build a team-game view: each row = one team's game
    home = sched[["game_id", "home_team", "away_score"]].rename(
        columns={"home_team": "team", "away_score": "pts_allowed"}
    )
    away = sched[["game_id", "away_team", "home_score"]].rename(
        columns={"away_team": "team", "home_score": "pts_allowed"}
    )
    team_games = pd.concat([home, away], ignore_index=True)
    pts = team_games["pts_allowed"]

    results["Points Allowed (0)"] = (pts == 0).sum()
    results["Points Allowed (1-6)"] = ((pts >= 1) & (pts <= 6)).sum()
    results["Points Allowed (7-13)"] = ((pts >= 7) & (pts <= 13)).sum()
    results["Points Allowed (14-20)"] = ((pts >= 14) & (pts <= 20)).sum()
    results["Points Allowed (21-27)"] = ((pts >= 21) & (pts <= 27)).sum()
    results["Points Allowed (28-34)"] = ((pts >= 28) & (pts <= 34)).sum()
    results["Points Allowed (35+)"] = (pts >= 35).sum()
    results["Points per Point Allowed"] = pts.sum()


# ====================================================================
#  Master computation
# ====================================================================
def compute_all(pbp, weekly, schedules):
    """Compute frequencies for all 142 categories. Returns (results, unavailable)."""
    results = {}
    unavailable = []

    # Filter to regular season
    w = weekly[weekly["season_type"] == "REG"].copy()
    p = pbp[pbp["season_type"] == "REG"].copy()
    # Schedules: filter to REG if game_type column exists
    if "game_type" in schedules.columns:
        s = schedules[schedules["game_type"] == "REG"].copy()
    else:
        s = schedules.copy()

    compute_weekly(w, results)
    compute_pbp(p, results, unavailable)
    compute_pbp_game_agg(p, results, unavailable)
    compute_schedule(s, results)

    return results, unavailable


# ====================================================================
#  Normalization
# ====================================================================
def normalize(results, categories, num_seasons):
    """Compute normalized adjustment increments.

    Returns a list of dicts with all category info plus:
      freq_total, freq_per_season, impact, normalized_adj, factor
    """
    rows = []
    cat_lookup = {c["name"]: c for c in categories}

    for cat in categories:
        name = cat["name"]
        freq_total = results.get(name)
        adj = cat["adjustment"]

        if freq_total is None:
            rows.append({
                **cat,
                "freq_total": None,
                "freq_per_season": None,
                "impact": None,
                "normalized_adj": None,
                "factor": None,
            })
            continue

        freq_total = float(freq_total)
        freq_season = freq_total / num_seasons
        impact = freq_season * adj

        rows.append({
            **cat,
            "freq_total": freq_total,
            "freq_per_season": freq_season,
            "impact": impact,
            "normalized_adj": None,  # filled below
            "factor": None,
        })

    # Compute median impact for normalization reference
    impacts = [r["impact"] for r in rows if r["impact"] and r["impact"] > 0]
    if not impacts:
        return rows
    median_impact = float(np.median(impacts))

    for row in rows:
        if row["impact"] and row["impact"] > 0:
            row["factor"] = median_impact / row["impact"]
            row["normalized_adj"] = row["adjustment"] * row["factor"]

    return rows, median_impact


# ====================================================================
#  Output
# ====================================================================
def print_results(rows, median_impact, num_seasons, section_filter=None):
    """Print formatted results table."""
    if section_filter:
        rows = [r for r in rows if r["section"].lower() == section_filter.lower()]

    # Column widths
    w_num = 4
    w_name = 44
    w_sec = 22
    w_freq = 12
    w_adj = 6
    w_impact = 12
    w_new = 10
    w_factor = 8

    header = (
        f"{'#':>{w_num}} | "
        f"{'Category':<{w_name}} | "
        f"{'Section':<{w_sec}} | "
        f"{'Freq/Szn':>{w_freq}} | "
        f"{'Adj':>{w_adj}} | "
        f"{'Impact/Szn':>{w_impact}} | "
        f"{'New Adj':>{w_new}} | "
        f"{'Factor':>{w_factor}}"
    )
    sep = "-" * len(header)

    print(sep)
    print(header)
    print(sep)

    current_section = None
    for i, row in enumerate(rows, 1):
        if row["section"] != current_section:
            if current_section is not None:
                print(sep)
            current_section = row["section"]

        freq = row["freq_per_season"]
        impact = row["impact"]
        new_adj = row["normalized_adj"]
        factor = row["factor"]

        freq_str = f"{freq:>12,.1f}" if freq is not None else f"{'N/A':>12}"
        adj_str = f"{row['adjustment']:>6.1f}"
        impact_str = f"{impact:>12,.1f}" if impact is not None else f"{'N/A':>12}"

        if new_adj is not None:
            if new_adj >= 100:
                new_str = f"{new_adj:>10,.1f}"
            elif new_adj >= 1:
                new_str = f"{new_adj:>10.2f}"
            else:
                new_str = f"{new_adj:>10.4f}"
        else:
            new_str = f"{'N/A':>10}"

        factor_str = f"{factor:>8.2f}x" if factor is not None else f"{'N/A':>8}"

        print(
            f"{i:>{w_num}} | "
            f"{row['name']:<{w_name}} | "
            f"{row['section']:<{w_sec}} | "
            f"{freq_str} | "
            f"{adj_str} | "
            f"{impact_str} | "
            f"{new_str} | "
            f"{factor_str}"
        )

    print(sep)

    # Summary stats
    valid = [r for r in rows if r["impact"] is not None and r["impact"] > 0]
    if valid:
        impacts_list = [r["impact"] for r in valid]
        print(f"\nSeasons analyzed: {num_seasons}")
        print(f"Median impact (normalization target): {median_impact:,.1f}")
        print(f"Impact range BEFORE normalization: "
              f"{min(impacts_list):,.1f} to {max(impacts_list):,.1f} "
              f"({max(impacts_list)/min(impacts_list):,.0f}x spread)")
        print(f"Impact range AFTER normalization: all equal at {median_impact:,.1f}")

        # Top 5 highest / lowest impact (most affected by normalization)
        sorted_rows = sorted(valid, key=lambda r: r["impact"], reverse=True)
        print(f"\nTop 5 HIGHEST impact (get the smallest new adjustments):")
        for r in sorted_rows[:5]:
            print(f"  {r['name']:<40} impact={r['impact']:>12,.1f}  "
                  f"new_adj={r['normalized_adj']:.4f}")

        print(f"\nTop 5 LOWEST impact (get the largest new adjustments):")
        for r in sorted_rows[-5:]:
            print(f"  {r['name']:<40} impact={r['impact']:>12,.1f}  "
                  f"new_adj={r['normalized_adj']:.2f}")


def save_csv(rows, path):
    """Save results to CSV."""
    df = pd.DataFrame([
        {
            "Category": r["name"],
            "Section": r["section"],
            "Current Adjustment": r["adjustment"],
            "Granularity": r["granularity"],
            "Freq Total (4 seasons)": r["freq_total"],
            "Freq Per Season": round(r["freq_per_season"], 1) if r["freq_per_season"] else None,
            "Impact Per Season": round(r["impact"], 1) if r["impact"] else None,
            "Normalized Adjustment": round(r["normalized_adj"], 6) if r["normalized_adj"] else None,
            "Factor": round(r["factor"], 4) if r["factor"] else None,
        }
        for r in rows
    ])
    df.to_csv(path, index=False)
    print(f"\nResults saved to: {path}")


# ====================================================================
#  Main
# ====================================================================
def main():
    save_to_csv = "--csv" in sys.argv
    section = None
    for arg in sys.argv[1:]:
        if arg.startswith("--"):
            continue
        section = arg

    pbp, weekly, schedules = load_data()
    num_seasons = len(weekly["season"].unique())
    print(f"Seasons in data: {sorted(weekly['season'].unique())} ({num_seasons} seasons)\n")

    print("Computing frequencies for all 142 categories...")
    results, unavailable = compute_all(pbp, weekly, schedules)

    # Report what we computed
    matched = sum(1 for c in CATEGORIES if c["name"] in results)
    print(f"  Computed: {matched}/{len(CATEGORIES)} categories")
    missing = [c["name"] for c in CATEGORIES if c["name"] not in results]
    if missing:
        print(f"  Missing ({len(missing)}):")
        for name in missing:
            print(f"    - {name}")

    if unavailable:
        print(f"\n  Data notes ({len(unavailable)}):")
        for note in unavailable:
            print(f"    * {note}")

    print("\nNormalizing...")
    rows, median_impact = normalize(results, CATEGORIES, num_seasons)

    print()
    print_results(rows, median_impact, num_seasons, section)

    if save_to_csv:
        csv_path = os.path.join(
            os.path.dirname(os.path.abspath(__file__)), "srm_normalized.csv"
        )
        save_csv(rows, csv_path)


if __name__ == "__main__":
    main()
