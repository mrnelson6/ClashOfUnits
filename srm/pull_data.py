"""
NFL Data Pull Script
====================
Downloads historical NFL data for SRM frequency normalization.
Data is cached locally in the data/ directory so subsequent runs are fast.

Usage:
    python pull_data.py
"""

import os
import nfl_data_py as nfl
import pandas as pd

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
YEARS = [2021, 2022, 2023, 2024]


def pull_pbp():
    """Download play-by-play data (every play, 300+ columns)."""
    path = os.path.join(DATA_DIR, "pbp.parquet")
    if os.path.exists(path):
        print(f"  PBP data already cached at {path}")
        return pd.read_parquet(path)

    print(f"  Downloading play-by-play data for {YEARS} (this may take a few minutes)...")
    pbp = nfl.import_pbp_data(YEARS)
    pbp.to_parquet(path)
    print(f"  Saved {len(pbp):,} plays ({len(pbp.columns)} columns)")
    return pbp


def pull_weekly():
    """Download weekly player stats (per-player, per-game aggregations)."""
    path = os.path.join(DATA_DIR, "weekly.parquet")
    if os.path.exists(path):
        print(f"  Weekly data already cached at {path}")
        return pd.read_parquet(path)

    print(f"  Downloading weekly player stats for {YEARS}...")
    weekly = nfl.import_weekly_data(YEARS)
    weekly.to_parquet(path)
    print(f"  Saved {len(weekly):,} player-weeks ({len(weekly.columns)} columns)")
    return weekly


def pull_rosters():
    """Download seasonal roster data (player positions, teams).

    Note: weekly data already has position/position_group columns, so this is
    mainly a backup reference. import_seasonal_rosters is lighter than weekly.
    """
    path = os.path.join(DATA_DIR, "rosters.parquet")
    if os.path.exists(path):
        print(f"  Roster data already cached at {path}")
        return pd.read_parquet(path)

    print(f"  Downloading roster data for {YEARS}...")
    rosters = nfl.import_seasonal_rosters(YEARS)
    rosters.to_parquet(path)
    print(f"  Saved {len(rosters):,} roster entries ({len(rosters.columns)} columns)")
    return rosters


def pull_schedules():
    """Download game schedule/results (for final scores -> team defense points allowed)."""
    path = os.path.join(DATA_DIR, "schedules.parquet")
    if os.path.exists(path):
        print(f"  Schedule data already cached at {path}")
        return pd.read_parquet(path)

    print(f"  Downloading schedule data for {YEARS}...")
    schedules = nfl.import_schedules(YEARS)
    schedules.to_parquet(path)
    print(f"  Saved {len(schedules):,} games ({len(schedules.columns)} columns)")
    return schedules


def main():
    os.makedirs(DATA_DIR, exist_ok=True)

    print("=" * 60)
    print("NFL Data Pull for SRM Frequency Normalization")
    print(f"Seasons: {YEARS}")
    print("=" * 60)

    print("\n[1/4] Play-by-play data")
    pbp = pull_pbp()

    print("\n[2/4] Weekly player stats")
    weekly = pull_weekly()

    print("\n[3/4] Roster data")
    rosters = pull_rosters()

    print("\n[4/4] Schedule / game results")
    schedules = pull_schedules()

    # --- Summary ---
    print("\n" + "=" * 60)
    print("DOWNLOAD SUMMARY")
    print("=" * 60)
    print(f"  Play-by-play : {len(pbp):>9,} plays  x {len(pbp.columns):>3} cols")
    print(f"  Weekly stats  : {len(weekly):>9,} rows   x {len(weekly.columns):>3} cols")
    print(f"  Rosters       : {len(rosters):>9,} rows   x {len(rosters.columns):>3} cols")
    print(f"  Schedules     : {len(schedules):>9,} games  x {len(schedules.columns):>3} cols")
    print(f"\n  All data saved to: {os.path.abspath(DATA_DIR)}")

    # --- Print key columns for reference ---
    print("\n" + "-" * 60)
    print("KEY WEEKLY COLUMNS (for review):")
    print("-" * 60)
    for col in sorted(weekly.columns):
        print(f"  {col}")

    print("\n" + "-" * 60)
    print("KEY PBP COLUMNS (filtered, for review):")
    print("-" * 60)
    keywords = [
        "pass", "rush", "receiv", "touchdown", "fumble", "intercept",
        "sack", "first_down", "field_goal", "extra_point", "kick",
        "punt", "tackle", "two_point", "yards_gained", "return",
        "safety", "blocked", "qb_hit",
    ]
    key_cols = sorted(c for c in pbp.columns if any(k in c for k in keywords))
    for col in key_cols[:80]:
        print(f"  {col}")
    if len(key_cols) > 80:
        print(f"  ... and {len(key_cols) - 80} more")


if __name__ == "__main__":
    main()
