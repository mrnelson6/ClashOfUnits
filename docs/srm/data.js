const SRM_DATA = {
  "seasons": [
    2021,
    2022,
    2023,
    2024
  ],
  "numSeasons": 4,
  "medianImpact": 282.5,
  "meanImpact": 2595.1,
  "maxImpact": 32837.2,
  "minImpact": 0.8,
  "impactSpread": 41046,
  "totalPlays": 198513,
  "sections": {
    "Passing": "#3b82f6",
    "Rushing": "#22c55e",
    "Receiving": "#f59e0b",
    "Kicking": "#a855f7",
    "Team Defense": "#ef4444",
    "Special Teams D/ST": "#14b8a6",
    "Special Teams Player": "#06b6d4",
    "Misc": "#64748b",
    "IDP": "#ec4899"
  },
  "categories": [
    {
      "name": "Passing Yards",
      "section": "Passing",
      "adjustment": 0.1,
      "granularity": "per_yard",
      "freqPerSeason": 128856.8,
      "impact": 12885.7,
      "normalizedAdj": 0.002192,
      "factor": 0.0219
    },
    {
      "name": "Passing TDs",
      "section": "Passing",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 788.8,
      "impact": 788.8,
      "normalizedAdj": 0.358162,
      "factor": 0.3582
    },
    {
      "name": "Passing First Down",
      "section": "Passing",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 6165.0,
      "impact": 6165.0,
      "normalizedAdj": 0.045823,
      "factor": 0.0458
    },
    {
      "name": "2-pt Conversion (Pass)",
      "section": "Passing",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 41.8,
      "impact": 41.8,
      "normalizedAdj": 6.766467,
      "factor": 6.7665
    },
    {
      "name": "Pass Intercepted",
      "section": "Passing",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 418.8,
      "impact": 418.8,
      "normalizedAdj": 0.674627,
      "factor": 0.6746
    },
    {
      "name": "Pick 6 Thrown",
      "section": "Passing",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 38.0,
      "impact": 38.0,
      "normalizedAdj": 7.434211,
      "factor": 7.4342
    },
    {
      "name": "Pass Completed",
      "section": "Passing",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 11790.8,
      "impact": 11790.8,
      "normalizedAdj": 0.023959,
      "factor": 0.024
    },
    {
      "name": "Incomplete Pass",
      "section": "Passing",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 6436.0,
      "impact": 6436.0,
      "normalizedAdj": 0.043894,
      "factor": 0.0439
    },
    {
      "name": "Pass Attempt",
      "section": "Passing",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 18226.8,
      "impact": 18226.8,
      "normalizedAdj": 0.015499,
      "factor": 0.0155
    },
    {
      "name": "QB Sacked",
      "section": "Passing",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 1316.2,
      "impact": 1316.2,
      "normalizedAdj": 0.214625,
      "factor": 0.2146
    },
    {
      "name": "40+ Yard Completion Bonus",
      "section": "Passing",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 263.5,
      "impact": 263.5,
      "normalizedAdj": 1.072106,
      "factor": 1.0721
    },
    {
      "name": "40+ Yard Pass TD Bonus",
      "section": "Passing",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 97.8,
      "impact": 97.8,
      "normalizedAdj": 2.890026,
      "factor": 2.89
    },
    {
      "name": "50+ Yard Pass TD Bonus",
      "section": "Passing",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 60.8,
      "impact": 60.8,
      "normalizedAdj": 4.650206,
      "factor": 4.6502
    },
    {
      "name": "Rushing Yards",
      "section": "Rushing",
      "adjustment": 0.1,
      "granularity": "per_yard",
      "freqPerSeason": 63760.0,
      "impact": 6376.0,
      "normalizedAdj": 0.004431,
      "factor": 0.0443
    },
    {
      "name": "Rushing TD",
      "section": "Rushing",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 493.2,
      "impact": 493.2,
      "normalizedAdj": 0.572732,
      "factor": 0.5727
    },
    {
      "name": "Rushing First Down",
      "section": "Rushing",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 3625.0,
      "impact": 3625.0,
      "normalizedAdj": 0.077931,
      "factor": 0.0779
    },
    {
      "name": "2-pt Conversion (Rush)",
      "section": "Rushing",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 22.2,
      "impact": 22.2,
      "normalizedAdj": 12.696629,
      "factor": 12.6966
    },
    {
      "name": "Rush Attempt",
      "section": "Rushing",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 14639.0,
      "impact": 14639.0,
      "normalizedAdj": 0.019298,
      "factor": 0.0193
    },
    {
      "name": "40+ Yard Rush Bonus",
      "section": "Rushing",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 62.2,
      "impact": 62.2,
      "normalizedAdj": 4.538153,
      "factor": 4.5382
    },
    {
      "name": "40+ Yard Rush TD Bonus",
      "section": "Rushing",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 26.8,
      "impact": 26.8,
      "normalizedAdj": 10.560748,
      "factor": 10.5607
    },
    {
      "name": "50+ Yard Rush TD Bonus",
      "section": "Rushing",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 17.5,
      "impact": 17.5,
      "normalizedAdj": 16.142857,
      "factor": 16.1429
    },
    {
      "name": "Reception",
      "section": "Receiving",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 11790.8,
      "impact": 11790.8,
      "normalizedAdj": 0.023959,
      "factor": 0.024
    },
    {
      "name": "Receiving Yards",
      "section": "Receiving",
      "adjustment": 0.1,
      "granularity": "per_yard",
      "freqPerSeason": 128836.5,
      "impact": 12883.7,
      "normalizedAdj": 0.002193,
      "factor": 0.0219
    },
    {
      "name": "Receiving TD",
      "section": "Receiving",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 787.8,
      "impact": 787.8,
      "normalizedAdj": 0.358616,
      "factor": 0.3586
    },
    {
      "name": "Receiving First Down",
      "section": "Receiving",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 6163.8,
      "impact": 6163.8,
      "normalizedAdj": 0.045832,
      "factor": 0.0458
    },
    {
      "name": "2-pt Conversion (Rec)",
      "section": "Receiving",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 41.8,
      "impact": 41.8,
      "normalizedAdj": 6.766467,
      "factor": 6.7665
    },
    {
      "name": "0-4 Yard Reception Bonus",
      "section": "Receiving",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 2224.8,
      "impact": 2224.8,
      "normalizedAdj": 0.126981,
      "factor": 0.127
    },
    {
      "name": "5-9 Yard Reception Bonus",
      "section": "Receiving",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 4127.5,
      "impact": 4127.5,
      "normalizedAdj": 0.068443,
      "factor": 0.0684
    },
    {
      "name": "10-19 Yard Reception Bonus",
      "section": "Receiving",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 3475.2,
      "impact": 3475.2,
      "normalizedAdj": 0.081289,
      "factor": 0.0813
    },
    {
      "name": "20-29 Yard Reception Bonus",
      "section": "Receiving",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 1018.2,
      "impact": 1018.2,
      "normalizedAdj": 0.277437,
      "factor": 0.2774
    },
    {
      "name": "30-39 Yard Reception Bonus",
      "section": "Receiving",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 331.0,
      "impact": 331.0,
      "normalizedAdj": 0.853474,
      "factor": 0.8535
    },
    {
      "name": "40-49 Yard Reception Bonus",
      "section": "Receiving",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 146.2,
      "impact": 146.2,
      "normalizedAdj": 1.931624,
      "factor": 1.9316
    },
    {
      "name": "50+ Yard Reception Bonus",
      "section": "Receiving",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 117.2,
      "impact": 117.2,
      "normalizedAdj": 2.409382,
      "factor": 2.4094
    },
    {
      "name": "Reception Bonus - RB",
      "section": "Receiving",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 2461.0,
      "impact": 2461.0,
      "normalizedAdj": 0.114791,
      "factor": 0.1148
    },
    {
      "name": "Reception Bonus - WR",
      "section": "Receiving",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 6589.5,
      "impact": 6589.5,
      "normalizedAdj": 0.042871,
      "factor": 0.0429
    },
    {
      "name": "Reception Bonus - TE",
      "section": "Receiving",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 2639.8,
      "impact": 2639.8,
      "normalizedAdj": 0.107018,
      "factor": 0.107
    },
    {
      "name": "FG Made",
      "section": "Kicking",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 906.2,
      "impact": 906.2,
      "normalizedAdj": 0.311724,
      "factor": 0.3117
    },
    {
      "name": "FG Made (0-19 yards)",
      "section": "Kicking",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 2.0,
      "impact": 2.0,
      "normalizedAdj": 141.25,
      "factor": 141.25
    },
    {
      "name": "FG Made (20-29 yards)",
      "section": "Kicking",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 234.2,
      "impact": 234.2,
      "normalizedAdj": 1.205977,
      "factor": 1.206
    },
    {
      "name": "FG Made (30-39 yards)",
      "section": "Kicking",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 280.0,
      "impact": 280.0,
      "normalizedAdj": 1.008929,
      "factor": 1.0089
    },
    {
      "name": "FG Made (40-49 yards)",
      "section": "Kicking",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 233.2,
      "impact": 233.2,
      "normalizedAdj": 1.211147,
      "factor": 1.2111
    },
    {
      "name": "FG Made (50+ yards)",
      "section": "Kicking",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 156.8,
      "impact": 156.8,
      "normalizedAdj": 1.802233,
      "factor": 1.8022
    },
    {
      "name": "Points per FG yard",
      "section": "Kicking",
      "adjustment": 0.1,
      "granularity": "per_yard",
      "freqPerSeason": 34264.8,
      "impact": 3426.5,
      "normalizedAdj": 0.008245,
      "factor": 0.0824
    },
    {
      "name": "Points per FG yard over 30",
      "section": "Kicking",
      "adjustment": 0.1,
      "granularity": "per_yard",
      "freqPerSeason": 8272.5,
      "impact": 827.2,
      "normalizedAdj": 0.034149,
      "factor": 0.3415
    },
    {
      "name": "PAT Made",
      "section": "Kicking",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 1151.8,
      "impact": 1151.8,
      "normalizedAdj": 0.245279,
      "factor": 0.2453
    },
    {
      "name": "FG Missed",
      "section": "Kicking",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 159.8,
      "impact": 159.8,
      "normalizedAdj": 1.768388,
      "factor": 1.7684
    },
    {
      "name": "FG Missed (0-19 yards)",
      "section": "Kicking",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": null,
      "impact": null,
      "normalizedAdj": null,
      "factor": null
    },
    {
      "name": "FG Missed (20-29 yards)",
      "section": "Kicking",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 4.8,
      "impact": 4.8,
      "normalizedAdj": 59.473684,
      "factor": 59.4737
    },
    {
      "name": "FG Missed (30-39 yards)",
      "section": "Kicking",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 19.5,
      "impact": 19.5,
      "normalizedAdj": 14.487179,
      "factor": 14.4872
    },
    {
      "name": "FG Missed (40-49 yards)",
      "section": "Kicking",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 63.5,
      "impact": 63.5,
      "normalizedAdj": 4.448819,
      "factor": 4.4488
    },
    {
      "name": "FG Missed (50+ yards)",
      "section": "Kicking",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 72.0,
      "impact": 72.0,
      "normalizedAdj": 3.923611,
      "factor": 3.9236
    },
    {
      "name": "PAT Missed",
      "section": "Kicking",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 61.8,
      "impact": 61.8,
      "normalizedAdj": 4.574899,
      "factor": 4.5749
    },
    {
      "name": "Defense TD",
      "section": "Team Defense",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 55.0,
      "impact": 55.0,
      "normalizedAdj": 5.136364,
      "factor": 5.1364
    },
    {
      "name": "Points Allowed (0)",
      "section": "Team Defense",
      "adjustment": 1.0,
      "granularity": "team_game",
      "freqPerSeason": 5.5,
      "impact": 5.5,
      "normalizedAdj": 51.363636,
      "factor": 51.3636
    },
    {
      "name": "Points Allowed (1-6)",
      "section": "Team Defense",
      "adjustment": 1.0,
      "granularity": "team_game",
      "freqPerSeason": 20.5,
      "impact": 20.5,
      "normalizedAdj": 13.780488,
      "factor": 13.7805
    },
    {
      "name": "Points Allowed (7-13)",
      "section": "Team Defense",
      "adjustment": 1.0,
      "granularity": "team_game",
      "freqPerSeason": 77.2,
      "impact": 77.2,
      "normalizedAdj": 3.656958,
      "factor": 3.657
    },
    {
      "name": "Points Allowed (14-20)",
      "section": "Team Defense",
      "adjustment": 1.0,
      "granularity": "team_game",
      "freqPerSeason": 146.8,
      "impact": 146.8,
      "normalizedAdj": 1.925043,
      "factor": 1.925
    },
    {
      "name": "Points Allowed (21-27)",
      "section": "Team Defense",
      "adjustment": 1.0,
      "granularity": "team_game",
      "freqPerSeason": 136.2,
      "impact": 136.2,
      "normalizedAdj": 2.073394,
      "factor": 2.0734
    },
    {
      "name": "Points Allowed (28-34)",
      "section": "Team Defense",
      "adjustment": 1.0,
      "granularity": "team_game",
      "freqPerSeason": 100.0,
      "impact": 100.0,
      "normalizedAdj": 2.825,
      "factor": 2.825
    },
    {
      "name": "Points Allowed (35+)",
      "section": "Team Defense",
      "adjustment": 1.0,
      "granularity": "team_game",
      "freqPerSeason": 57.2,
      "impact": 57.2,
      "normalizedAdj": 4.934498,
      "factor": 4.9345
    },
    {
      "name": "Points per Point Allowed",
      "section": "Team Defense",
      "adjustment": 1.0,
      "granularity": "per_yard",
      "freqPerSeason": 12167.0,
      "impact": 12167.0,
      "normalizedAdj": 0.023219,
      "factor": 0.0232
    },
    {
      "name": "Less Than 100 Total Yards Allowed",
      "section": "Team Defense",
      "adjustment": 1.0,
      "granularity": "team_game",
      "freqPerSeason": 1.2,
      "impact": 1.2,
      "normalizedAdj": 226.0,
      "factor": 226.0
    },
    {
      "name": "100-199 Yards Allowed",
      "section": "Team Defense",
      "adjustment": 1.0,
      "granularity": "team_game",
      "freqPerSeason": 23.8,
      "impact": 23.8,
      "normalizedAdj": 11.894737,
      "factor": 11.8947
    },
    {
      "name": "200-299 Yards Allowed",
      "section": "Team Defense",
      "adjustment": 1.0,
      "granularity": "team_game",
      "freqPerSeason": 147.0,
      "impact": 147.0,
      "normalizedAdj": 1.921769,
      "factor": 1.9218
    },
    {
      "name": "300-349 Yards Allowed",
      "section": "Team Defense",
      "adjustment": 1.0,
      "granularity": "team_game",
      "freqPerSeason": 123.0,
      "impact": 123.0,
      "normalizedAdj": 2.296748,
      "factor": 2.2967
    },
    {
      "name": "350-399 Yards Allowed",
      "section": "Team Defense",
      "adjustment": 1.0,
      "granularity": "team_game",
      "freqPerSeason": 122.8,
      "impact": 122.8,
      "normalizedAdj": 2.301426,
      "factor": 2.3014
    },
    {
      "name": "400-449 Yards Allowed",
      "section": "Team Defense",
      "adjustment": 1.0,
      "granularity": "team_game",
      "freqPerSeason": 78.0,
      "impact": 78.0,
      "normalizedAdj": 3.621795,
      "factor": 3.6218
    },
    {
      "name": "450-499 Yards Allowed",
      "section": "Team Defense",
      "adjustment": 1.0,
      "granularity": "team_game",
      "freqPerSeason": 33.0,
      "impact": 33.0,
      "normalizedAdj": 8.560606,
      "factor": 8.5606
    },
    {
      "name": "500-549 Yards Allowed",
      "section": "Team Defense",
      "adjustment": 1.0,
      "granularity": "team_game",
      "freqPerSeason": 10.5,
      "impact": 10.5,
      "normalizedAdj": 26.904762,
      "factor": 26.9048
    },
    {
      "name": "550+ Yards Allowed",
      "section": "Team Defense",
      "adjustment": 1.0,
      "granularity": "team_game",
      "freqPerSeason": 4.2,
      "impact": 4.2,
      "normalizedAdj": 66.470588,
      "factor": 66.4706
    },
    {
      "name": "Points per Yards Allowed",
      "section": "Team Defense",
      "adjustment": 0.1,
      "granularity": "per_yard",
      "freqPerSeason": 184361.0,
      "impact": 18436.1,
      "normalizedAdj": 0.001532,
      "factor": 0.0153
    },
    {
      "name": "3 and Out",
      "section": "Team Defense",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 1224.2,
      "impact": 1224.2,
      "normalizedAdj": 0.230754,
      "factor": 0.2308
    },
    {
      "name": "4th Down Stop",
      "section": "Team Defense",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 363.2,
      "impact": 363.2,
      "normalizedAdj": 0.777701,
      "factor": 0.7777
    },
    {
      "name": "Hit on QB (Team Def)",
      "section": "Team Defense",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 2914.2,
      "impact": 2914.2,
      "normalizedAdj": 0.096937,
      "factor": 0.0969
    },
    {
      "name": "Sack (Team Def)",
      "section": "Team Defense",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 1316.2,
      "impact": 1316.2,
      "normalizedAdj": 0.214625,
      "factor": 0.2146
    },
    {
      "name": "Sack Yards (Team Def)",
      "section": "Team Defense",
      "adjustment": 0.1,
      "granularity": "per_yard",
      "freqPerSeason": 8826.5,
      "impact": 882.7,
      "normalizedAdj": 0.032006,
      "factor": 0.3201
    },
    {
      "name": "Interception (Team Def)",
      "section": "Team Defense",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 418.8,
      "impact": 418.8,
      "normalizedAdj": 0.674627,
      "factor": 0.6746
    },
    {
      "name": "Interception Yards (Team Def)",
      "section": "Team Defense",
      "adjustment": 0.1,
      "granularity": "per_yard",
      "freqPerSeason": 5166.2,
      "impact": 516.6,
      "normalizedAdj": 0.054682,
      "factor": 0.5468
    },
    {
      "name": "Fumble Recovery (Team Def)",
      "section": "Team Defense",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 282.5,
      "impact": 282.5,
      "normalizedAdj": 1.0,
      "factor": 1.0
    },
    {
      "name": "Fumble Return Yards (Team Def)",
      "section": "Team Defense",
      "adjustment": 0.1,
      "granularity": "per_yard",
      "freqPerSeason": 1121.2,
      "impact": 112.1,
      "normalizedAdj": 0.251951,
      "factor": 2.5195
    },
    {
      "name": "Tackle For Loss (Team Def)",
      "section": "Team Defense",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 1228.8,
      "impact": 1228.8,
      "normalizedAdj": 0.229908,
      "factor": 0.2299
    },
    {
      "name": "Assisted Tackle (Team Def)",
      "section": "Team Defense",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 13178.2,
      "impact": 13178.2,
      "normalizedAdj": 0.021437,
      "factor": 0.0214
    },
    {
      "name": "Solo Tackle (Team Def)",
      "section": "Team Defense",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 19659.0,
      "impact": 19659.0,
      "normalizedAdj": 0.01437,
      "factor": 0.0144
    },
    {
      "name": "Tackle (Team Def)",
      "section": "Team Defense",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 32837.2,
      "impact": 32837.2,
      "normalizedAdj": 0.008603,
      "factor": 0.0086
    },
    {
      "name": "Safety (Team Def)",
      "section": "Team Defense",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 13.2,
      "impact": 13.2,
      "normalizedAdj": 21.320755,
      "factor": 21.3208
    },
    {
      "name": "Forced Fumble (Team Def)",
      "section": "Team Defense",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 427.2,
      "impact": 427.2,
      "normalizedAdj": 0.661205,
      "factor": 0.6612
    },
    {
      "name": "Blocked Kick",
      "section": "Team Defense",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 37.8,
      "impact": 37.8,
      "normalizedAdj": 7.483444,
      "factor": 7.4834
    },
    {
      "name": "Forced Punt",
      "section": "Team Defense",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 2146.8,
      "impact": 2146.8,
      "normalizedAdj": 0.131594,
      "factor": 0.1316
    },
    {
      "name": "Pass Defended (Team Def)",
      "section": "Team Defense",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 2226.8,
      "impact": 2226.8,
      "normalizedAdj": 0.126867,
      "factor": 0.1269
    },
    {
      "name": "2-pt Conversion Returns",
      "section": "Team Defense",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 0.8,
      "impact": 0.8,
      "normalizedAdj": 376.666667,
      "factor": 376.6667
    },
    {
      "name": "Missed FG Return Yards (Team Def)",
      "section": "Team Defense",
      "adjustment": 0.1,
      "granularity": "per_yard",
      "freqPerSeason": null,
      "impact": null,
      "normalizedAdj": null,
      "factor": null
    },
    {
      "name": "Blocked Kick Return Yards (Team Def)",
      "section": "Team Defense",
      "adjustment": 0.1,
      "granularity": "per_yard",
      "freqPerSeason": null,
      "impact": null,
      "normalizedAdj": null,
      "factor": null
    },
    {
      "name": "Special Teams TD (D/ST)",
      "section": "Special Teams D/ST",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 12.0,
      "impact": 12.0,
      "normalizedAdj": 23.541667,
      "factor": 23.5417
    },
    {
      "name": "Special Teams Forced Fumble (D/ST)",
      "section": "Special Teams D/ST",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 34.8,
      "impact": 34.8,
      "normalizedAdj": 8.129496,
      "factor": 8.1295
    },
    {
      "name": "Special Teams Fumble Recovery (D/ST)",
      "section": "Special Teams D/ST",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 34.0,
      "impact": 34.0,
      "normalizedAdj": 8.308824,
      "factor": 8.3088
    },
    {
      "name": "Special Teams Solo Tackle (D/ST)",
      "section": "Special Teams D/ST",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 1273.2,
      "impact": 1273.2,
      "normalizedAdj": 0.221873,
      "factor": 0.2219
    },
    {
      "name": "Punt Return Yards (D/ST)",
      "section": "Special Teams D/ST",
      "adjustment": 0.1,
      "granularity": "per_yard",
      "freqPerSeason": 8527.8,
      "impact": 852.8,
      "normalizedAdj": 0.033127,
      "factor": 0.3313
    },
    {
      "name": "Kick Return Yards (D/ST)",
      "section": "Special Teams D/ST",
      "adjustment": 0.1,
      "granularity": "per_yard",
      "freqPerSeason": 21590.2,
      "impact": 2159.0,
      "normalizedAdj": 0.013085,
      "factor": 0.1308
    },
    {
      "name": "Special Teams Player TD",
      "section": "Special Teams Player",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 12.0,
      "impact": 12.0,
      "normalizedAdj": 23.541667,
      "factor": 23.5417
    },
    {
      "name": "Special Teams Player Forced Fumble",
      "section": "Special Teams Player",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 34.8,
      "impact": 34.8,
      "normalizedAdj": 8.129496,
      "factor": 8.1295
    },
    {
      "name": "Special Teams Player Fumble Recovery",
      "section": "Special Teams Player",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 34.0,
      "impact": 34.0,
      "normalizedAdj": 8.308824,
      "factor": 8.3088
    },
    {
      "name": "Special Teams Player Solo Tackle",
      "section": "Special Teams Player",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 1273.2,
      "impact": 1273.2,
      "normalizedAdj": 0.221873,
      "factor": 0.2219
    },
    {
      "name": "Player Punt Return Yards",
      "section": "Special Teams Player",
      "adjustment": 0.1,
      "granularity": "per_yard",
      "freqPerSeason": 8527.8,
      "impact": 852.8,
      "normalizedAdj": 0.033127,
      "factor": 0.3313
    },
    {
      "name": "Player Kick Return Yards",
      "section": "Special Teams Player",
      "adjustment": 0.1,
      "granularity": "per_yard",
      "freqPerSeason": 21590.2,
      "impact": 2159.0,
      "normalizedAdj": 0.013085,
      "factor": 0.1308
    },
    {
      "name": "Fumble",
      "section": "Misc",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 517.0,
      "impact": 517.0,
      "normalizedAdj": 0.546422,
      "factor": 0.5464
    },
    {
      "name": "Fumble Lost",
      "section": "Misc",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 241.8,
      "impact": 241.8,
      "normalizedAdj": 1.168563,
      "factor": 1.1686
    },
    {
      "name": "Fumble Recovery TD",
      "section": "Misc",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 18.0,
      "impact": 18.0,
      "normalizedAdj": 15.694444,
      "factor": 15.6944
    },
    {
      "name": "100-199 Yard Rushing Game",
      "section": "Misc",
      "adjustment": 1.0,
      "granularity": "game",
      "freqPerSeason": 102.2,
      "impact": 102.2,
      "normalizedAdj": 2.762836,
      "factor": 2.7628
    },
    {
      "name": "200+ Yard Rushing Game",
      "section": "Misc",
      "adjustment": 1.0,
      "granularity": "game",
      "freqPerSeason": 1.5,
      "impact": 1.5,
      "normalizedAdj": 188.333333,
      "factor": 188.3333
    },
    {
      "name": "100-199 Yard Receiving Game",
      "section": "Misc",
      "adjustment": 1.0,
      "granularity": "game",
      "freqPerSeason": 176.5,
      "impact": 176.5,
      "normalizedAdj": 1.600567,
      "factor": 1.6006
    },
    {
      "name": "200+ Yard Receiving Game",
      "section": "Misc",
      "adjustment": 1.0,
      "granularity": "game",
      "freqPerSeason": 3.0,
      "impact": 3.0,
      "normalizedAdj": 94.166667,
      "factor": 94.1667
    },
    {
      "name": "300-399 Yard Passing Game",
      "section": "Misc",
      "adjustment": 1.0,
      "granularity": "game",
      "freqPerSeason": 89.0,
      "impact": 89.0,
      "normalizedAdj": 3.174157,
      "factor": 3.1742
    },
    {
      "name": "400+ Yard Passing Game",
      "section": "Misc",
      "adjustment": 1.0,
      "granularity": "game",
      "freqPerSeason": 9.5,
      "impact": 9.5,
      "normalizedAdj": 29.736842,
      "factor": 29.7368
    },
    {
      "name": "100-199 Combined Rush + Rec Yards",
      "section": "Misc",
      "adjustment": 1.0,
      "granularity": "game",
      "freqPerSeason": 377.2,
      "impact": 377.2,
      "normalizedAdj": 0.74884,
      "factor": 0.7488
    },
    {
      "name": "200+ Combined Rush + Rec Yards",
      "section": "Misc",
      "adjustment": 1.0,
      "granularity": "game",
      "freqPerSeason": 7.2,
      "impact": 7.2,
      "normalizedAdj": 38.965517,
      "factor": 38.9655
    },
    {
      "name": "25+ Pass Completions",
      "section": "Misc",
      "adjustment": 1.0,
      "granularity": "game",
      "freqPerSeason": 149.5,
      "impact": 149.5,
      "normalizedAdj": 1.889632,
      "factor": 1.8896
    },
    {
      "name": "20+ Carries",
      "section": "Misc",
      "adjustment": 1.0,
      "granularity": "game",
      "freqPerSeason": 114.5,
      "impact": 114.5,
      "normalizedAdj": 2.467249,
      "factor": 2.4672
    },
    {
      "name": "First Down Bonus - RB",
      "section": "Misc",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 3447.0,
      "impact": 3447.0,
      "normalizedAdj": 0.081955,
      "factor": 0.082
    },
    {
      "name": "First Down Bonus - WR",
      "section": "Misc",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 3923.2,
      "impact": 3923.2,
      "normalizedAdj": 0.072007,
      "factor": 0.072
    },
    {
      "name": "First Down Bonus - TE",
      "section": "Misc",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 1375.2,
      "impact": 1375.2,
      "normalizedAdj": 0.205417,
      "factor": 0.2054
    },
    {
      "name": "First Down Bonus - QB",
      "section": "Misc",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 6954.5,
      "impact": 6954.5,
      "normalizedAdj": 0.040621,
      "factor": 0.0406
    },
    {
      "name": "IDP Touchdown",
      "section": "IDP",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 55.0,
      "impact": 55.0,
      "normalizedAdj": 5.136364,
      "factor": 5.1364
    },
    {
      "name": "Sack (IDP)",
      "section": "IDP",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 1316.2,
      "impact": 1316.2,
      "normalizedAdj": 0.214625,
      "factor": 0.2146
    },
    {
      "name": "Sack Yards (IDP)",
      "section": "IDP",
      "adjustment": 0.1,
      "granularity": "per_yard",
      "freqPerSeason": 8826.5,
      "impact": 882.7,
      "normalizedAdj": 0.032006,
      "factor": 0.3201
    },
    {
      "name": "Hit on QB (IDP)",
      "section": "IDP",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 3053.8,
      "impact": 3053.8,
      "normalizedAdj": 0.092509,
      "factor": 0.0925
    },
    {
      "name": "Tackle (IDP)",
      "section": "IDP",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 32837.2,
      "impact": 32837.2,
      "normalizedAdj": 0.008603,
      "factor": 0.0086
    },
    {
      "name": "Tackle For Loss (IDP)",
      "section": "IDP",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 1228.8,
      "impact": 1228.8,
      "normalizedAdj": 0.229908,
      "factor": 0.2299
    },
    {
      "name": "Blocked Punt, PAT, or FG (IDP)",
      "section": "IDP",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 37.8,
      "impact": 37.8,
      "normalizedAdj": 7.483444,
      "factor": 7.4834
    },
    {
      "name": "Interception (IDP)",
      "section": "IDP",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 418.8,
      "impact": 418.8,
      "normalizedAdj": 0.674627,
      "factor": 0.6746
    },
    {
      "name": "Interception Return Yards (IDP)",
      "section": "IDP",
      "adjustment": 0.1,
      "granularity": "per_yard",
      "freqPerSeason": 5166.2,
      "impact": 516.6,
      "normalizedAdj": 0.054682,
      "factor": 0.5468
    },
    {
      "name": "Fumble Recovery (IDP)",
      "section": "IDP",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 282.5,
      "impact": 282.5,
      "normalizedAdj": 1.0,
      "factor": 1.0
    },
    {
      "name": "Fumble Recovery Return Yards (IDP)",
      "section": "IDP",
      "adjustment": 0.1,
      "granularity": "per_yard",
      "freqPerSeason": 1121.2,
      "impact": 112.1,
      "normalizedAdj": 0.251951,
      "factor": 2.5195
    },
    {
      "name": "Forced Fumble (IDP)",
      "section": "IDP",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 427.2,
      "impact": 427.2,
      "normalizedAdj": 0.661205,
      "factor": 0.6612
    },
    {
      "name": "Safety (IDP)",
      "section": "IDP",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 13.2,
      "impact": 13.2,
      "normalizedAdj": 21.320755,
      "factor": 21.3208
    },
    {
      "name": "Assisted Tackle (IDP)",
      "section": "IDP",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 13178.2,
      "impact": 13178.2,
      "normalizedAdj": 0.021437,
      "factor": 0.0214
    },
    {
      "name": "Solo Tackle (IDP)",
      "section": "IDP",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 19659.0,
      "impact": 19659.0,
      "normalizedAdj": 0.01437,
      "factor": 0.0144
    },
    {
      "name": "Pass Defended (IDP)",
      "section": "IDP",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 2226.8,
      "impact": 2226.8,
      "normalizedAdj": 0.126867,
      "factor": 0.1269
    },
    {
      "name": "10+ Tackle Bonus",
      "section": "IDP",
      "adjustment": 1.0,
      "granularity": "game",
      "freqPerSeason": 283.0,
      "impact": 283.0,
      "normalizedAdj": 0.998233,
      "factor": 0.9982
    },
    {
      "name": "2+ Sack Bonus",
      "section": "IDP",
      "adjustment": 1.0,
      "granularity": "game",
      "freqPerSeason": 145.0,
      "impact": 145.0,
      "normalizedAdj": 1.948276,
      "factor": 1.9483
    },
    {
      "name": "3+ Pass Defended Bonus",
      "section": "IDP",
      "adjustment": 1.0,
      "granularity": "game",
      "freqPerSeason": 64.8,
      "impact": 64.8,
      "normalizedAdj": 4.362934,
      "factor": 4.3629
    },
    {
      "name": "50+ Yard Interception Return TD Bonus",
      "section": "IDP",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 13.2,
      "impact": 13.2,
      "normalizedAdj": 21.320755,
      "factor": 21.3208
    },
    {
      "name": "50+ Yard Fumble Recovery Return TD Bonus",
      "section": "IDP",
      "adjustment": 1.0,
      "granularity": "play",
      "freqPerSeason": 3.2,
      "impact": 3.2,
      "normalizedAdj": 86.923077,
      "factor": 86.9231
    }
  ]
};
