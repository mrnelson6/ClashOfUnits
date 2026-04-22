"""Compute viable player/team pool sizes per scoring category."""
import pandas as pd
import json
import os

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

w = pd.read_parquet(os.path.join(DATA_DIR, "weekly.parquet"))
w = w[(w["season"] == 2024) & (w["season_type"] == "REG")]
pbp = pd.read_parquet(os.path.join(DATA_DIR, "pbp.parquet"))
pbp = pbp[(pbp["season"] == 2024) & (pbp["season_type"] == "REG")]

viable = {}


def count_players(df, col, threshold=0):
    return int(df[df[col].fillna(0) > threshold]["player_id"].nunique())


# --- Weekly stat categories ---
viable["Passing Yards"] = count_players(w, "passing_yards")
viable["Passing TDs"] = count_players(w, "passing_tds")
viable["Passing First Down"] = count_players(w, "passing_first_downs")
viable["2-pt Conversion (Pass)"] = count_players(w, "passing_2pt_conversions")
viable["Pass Intercepted"] = count_players(w, "interceptions")
viable["Pass Completed"] = count_players(w, "completions")
viable["Incomplete Pass"] = count_players(w, "attempts")
viable["Pass Attempt"] = count_players(w, "attempts")
viable["QB Sacked"] = count_players(w, "sacks")
viable["Rushing Yards"] = count_players(w, "rushing_yards")
viable["Rushing TD"] = count_players(w, "rushing_tds")
viable["Rushing First Down"] = count_players(w, "rushing_first_downs")
viable["2-pt Conversion (Rush)"] = count_players(w, "rushing_2pt_conversions")
viable["Rush Attempt"] = count_players(w, "carries")
viable["Reception"] = count_players(w, "receptions")
viable["Receiving Yards"] = count_players(w, "receiving_yards")
viable["Receiving TD"] = count_players(w, "receiving_tds")
viable["Receiving First Down"] = count_players(w, "receiving_first_downs")
viable["2-pt Conversion (Rec)"] = count_players(w, "receiving_2pt_conversions")
viable["Fumble"] = int(w[(w["rushing_fumbles"].fillna(0) + w["receiving_fumbles"].fillna(0) + w["sack_fumbles"].fillna(0)) > 0]["player_id"].nunique())
viable["Fumble Lost"] = int(w[(w["rushing_fumbles_lost"].fillna(0) + w["receiving_fumbles_lost"].fillna(0) + w["sack_fumbles_lost"].fillna(0)) > 0]["player_id"].nunique())

# Position-specific bonuses
for pos in ["RB", "WR", "TE"]:
    viable[f"Reception Bonus - {pos}"] = int(w[(w["position"] == pos) & (w["receptions"].fillna(0) > 0)]["player_id"].nunique())

viable["First Down Bonus - RB"] = int(w[(w["position"] == "RB") & ((w["rushing_first_downs"].fillna(0) + w["receiving_first_downs"].fillna(0)) > 0)]["player_id"].nunique())
viable["First Down Bonus - WR"] = int(w[(w["position"] == "WR") & (w["receiving_first_downs"].fillna(0) > 0)]["player_id"].nunique())
viable["First Down Bonus - TE"] = int(w[(w["position"] == "TE") & (w["receiving_first_downs"].fillna(0) > 0)]["player_id"].nunique())
viable["First Down Bonus - QB"] = int(w[(w["position"] == "QB") & ((w["passing_first_downs"].fillna(0) + w["rushing_first_downs"].fillna(0)) > 0)]["player_id"].nunique())

# Milestones: pool = players who could achieve it
viable["100-199 Yard Rushing Game"] = count_players(w, "rushing_yards")
viable["200+ Yard Rushing Game"] = viable["100-199 Yard Rushing Game"]
viable["100-199 Yard Receiving Game"] = count_players(w, "receiving_yards")
viable["200+ Yard Receiving Game"] = viable["100-199 Yard Receiving Game"]
viable["300-399 Yard Passing Game"] = count_players(w, "passing_yards")
viable["400+ Yard Passing Game"] = viable["300-399 Yard Passing Game"]
viable["100-199 Combined Rush + Rec Yards"] = int(w[(w["rushing_yards"].fillna(0) + w["receiving_yards"].fillna(0)) > 0]["player_id"].nunique())
viable["200+ Combined Rush + Rec Yards"] = viable["100-199 Combined Rush + Rec Yards"]
viable["25+ Pass Completions"] = viable["Pass Completed"]
viable["20+ Carries"] = viable["Rush Attempt"]

# --- PBP-derived offensive ---
comp = pbp[pbp["complete_pass"] == 1]
rushes = pbp[pbp["rush_attempt"] == 1]

viable["Pick 6 Thrown"] = int(pbp[pbp["interception"] == 1]["passer_player_id"].nunique())
n_receivers = int(comp["receiver_player_id"].nunique())
for cat in ["0-4 Yard Reception Bonus", "5-9 Yard Reception Bonus", "10-19 Yard Reception Bonus",
            "20-29 Yard Reception Bonus", "30-39 Yard Reception Bonus",
            "40-49 Yard Reception Bonus", "50+ Yard Reception Bonus"]:
    viable[cat] = n_receivers

n_deep_passers = int(comp["passer_player_id"].nunique())
viable["40+ Yard Completion Bonus"] = n_deep_passers
viable["40+ Yard Pass TD Bonus"] = n_deep_passers
viable["50+ Yard Pass TD Bonus"] = n_deep_passers
n_rushers = int(rushes["rusher_player_id"].nunique())
viable["40+ Yard Rush Bonus"] = n_rushers
viable["40+ Yard Rush TD Bonus"] = n_rushers
viable["50+ Yard Rush TD Bonus"] = n_rushers

# --- Kicking: distinct kickers ---
n_kickers = int(pbp[pbp["kicker_player_id"].notna()]["kicker_player_id"].nunique())
for cat in ["FG Made", "FG Made (0-19 yards)", "FG Made (20-29 yards)", "FG Made (30-39 yards)",
            "FG Made (40-49 yards)", "FG Made (50+ yards)", "Points per FG yard",
            "Points per FG yard over 30", "PAT Made", "FG Missed", "FG Missed (0-19 yards)",
            "FG Missed (20-29 yards)", "FG Missed (30-39 yards)", "FG Missed (40-49 yards)",
            "FG Missed (50+ yards)", "PAT Missed"]:
    viable[cat] = n_kickers

# --- Team Defense: always 32 ---
td_cats = [
    "Defense TD", "Points Allowed (0)", "Points Allowed (1-6)", "Points Allowed (7-13)",
    "Points Allowed (14-20)", "Points Allowed (21-27)", "Points Allowed (28-34)",
    "Points Allowed (35+)", "Points per Point Allowed",
    "Less Than 100 Total Yards Allowed", "100-199 Yards Allowed", "200-299 Yards Allowed",
    "300-349 Yards Allowed", "350-399 Yards Allowed", "400-449 Yards Allowed",
    "450-499 Yards Allowed", "500-549 Yards Allowed", "550+ Yards Allowed",
    "Points per Yards Allowed", "3 and Out", "4th Down Stop",
    "Hit on QB (Team Def)", "Sack (Team Def)", "Sack Yards (Team Def)",
    "Interception (Team Def)", "Interception Yards (Team Def)",
    "Fumble Recovery (Team Def)", "Fumble Return Yards (Team Def)",
    "Tackle For Loss (Team Def)", "Assisted Tackle (Team Def)",
    "Solo Tackle (Team Def)", "Tackle (Team Def)", "Safety (Team Def)",
    "Forced Fumble (Team Def)", "Blocked Kick", "Forced Punt",
    "Pass Defended (Team Def)", "2-pt Conversion Returns",
    "Missed FG Return Yards (Team Def)", "Blocked Kick Return Yards (Team Def)",
    "Special Teams TD (D/ST)", "Special Teams Forced Fumble (D/ST)",
    "Special Teams Fumble Recovery (D/ST)", "Special Teams Solo Tackle (D/ST)",
    "Punt Return Yards (D/ST)", "Kick Return Yards (D/ST)",
    "Special Teams Player TD", "Special Teams Player Forced Fumble",
    "Special Teams Player Fumble Recovery", "Special Teams Player Solo Tackle",
    "Player Punt Return Yards", "Player Kick Return Yards",
]
for cat in td_cats:
    viable[cat] = 32

# --- IDP ---
def unique_from_cols(prefix, suffix="_player_id"):
    cols = [c for c in pbp.columns if c.startswith(prefix) and c.endswith(suffix)]
    ids = set()
    for c in cols:
        ids.update(pbp[c].dropna().unique())
    return len(ids)

n_tacklers = unique_from_cols("solo_tackle_") + unique_from_cols("assist_tackle_")
# Actually count unique IDs across all tackle columns
all_tackler_ids = set()
for c in pbp.columns:
    if (c.startswith("solo_tackle_") or c.startswith("assist_tackle_")) and c.endswith("_player_id"):
        all_tackler_ids.update(pbp[c].dropna().unique())
n_tacklers = len(all_tackler_ids)

n_sackers = int(pbp["sack_player_id"].dropna().nunique())
n_interceptors = int(pbp["interception_player_id"].dropna().nunique()) if "interception_player_id" in pbp.columns else n_tacklers
n_ff = unique_from_cols("forced_fumble_player_")
n_fr = int(pbp["fumble_recovery_1_player_id"].dropna().nunique())
n_pd = unique_from_cols("pass_defense_")
n_qbhit = unique_from_cols("qb_hit_") if any(c.startswith("qb_hit_") and c.endswith("_player_id") for c in pbp.columns) else n_tacklers
n_tfl = unique_from_cols("tackle_for_loss_")

idp_map = {
    "Tackle (IDP)": n_tacklers, "Solo Tackle (IDP)": n_tacklers,
    "Assisted Tackle (IDP)": n_tacklers, "Sack (IDP)": n_sackers,
    "Sack Yards (IDP)": n_sackers, "Interception (IDP)": n_interceptors,
    "Interception Return Yards (IDP)": n_interceptors,
    "Forced Fumble (IDP)": n_ff, "Fumble Recovery (IDP)": n_fr,
    "Fumble Recovery Return Yards (IDP)": n_fr,
    "Tackle For Loss (IDP)": n_tfl, "Hit on QB (IDP)": n_qbhit,
    "Pass Defended (IDP)": n_pd, "Safety (IDP)": n_tacklers,
    "Blocked Punt, PAT, or FG (IDP)": n_tacklers,
    "IDP Touchdown": n_tacklers, "10+ Tackle Bonus": n_tacklers,
    "2+ Sack Bonus": n_sackers, "3+ Pass Defended Bonus": n_pd,
    "50+ Yard Interception Return TD Bonus": n_interceptors,
    "50+ Yard Fumble Recovery Return TD Bonus": n_fr,
}
viable.update(idp_map)
viable["Fumble Recovery TD"] = n_fr

# Print summary
print("=== Viable Pool Sizes (sample) ===")
samples = [
    ("Pass Attempt (QB pool)", "Pass Attempt"),
    ("Rush Attempt (RB+QB+WR)", "Rush Attempt"),
    ("Reception (WR+TE+RB)", "Reception"),
    ("FG Made (kickers)", "FG Made"),
    ("Sack - Team DEF", "Sack (Team Def)"),
    ("Sack - IDP", "Sack (IDP)"),
    ("Tackle - IDP", "Tackle (IDP)"),
    ("Interception - IDP", "Interception (IDP)"),
]
for label, cat in samples:
    print(f"  {label:35s} {viable[cat]:>5} viable")

print(f"\nTotal categories with viable counts: {len(viable)}")

# Save
with open("viable_counts.json", "w") as f:
    json.dump(viable, f, indent=2)
print("Saved to srm/viable_counts.json")
