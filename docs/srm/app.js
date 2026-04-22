/* ==========================================================
   SRM Adjustment Equalizer - Interactive Application
   ========================================================== */

// ============ STATE ============
const state = {
  normMode: 'matt',
  customTarget: 283,
  capMax: 500,
  capMin: 0.001,
  roundTo: 0,
  sortCol: 'impact',
  sortDir: 'desc',
  sectionFilter: 'All',
  search: '',
  showNormalized: false,
  captureAdj: false,
};

// ============ MATT'S BUCKETS ============
const BUCKET_COLORS = ['#ef4444','#f97316','#f59e0b','#84cc16','#22c55e','#06b6d4','#3b82f6','#6366f1','#a855f7','#ec4899'];
let MATT_BUCKETS = [
  { min: 0,     max: 1.3,      factor: 100,  color: '#ef4444', label: 'Ultra-rare' },
  { min: 1.3,   max: 6,        factor: 50,   color: '#f97316', label: 'Very rare' },
  { min: 6,     max: 100,      factor: 10,   color: '#f59e0b', label: 'Rare' },
  { min: 100,   max: 400,      factor: 5,    color: '#84cc16', label: 'Uncommon' },
  { min: 400,   max: 1500,     factor: 3,    color: '#22c55e', label: 'Common' },
  { min: 1500,  max: 5000,     factor: 2,    color: '#06b6d4', label: 'Very common' },
  { min: 5000,  max: 18400,    factor: 1,    color: '#3b82f6', label: 'Abundant' },
  { min: 18400, max: Infinity,  factor: 0.5,  color: '#6366f1', label: 'Massive' },
];
function getMattBucket(impact) {
  return MATT_BUCKETS.find(b => impact >= b.min && impact < b.max)
      || MATT_BUCKETS[MATT_BUCKETS.length - 1];
}

let computed = null;
let barChart = null;
let barCategories = []; // top N for the bar chart

// ============ INIT ============
document.addEventListener('DOMContentLoaded', () => {
  computed = recalculate();
  initStaticStats();
  initHero();
  initBubbleChart();
  initCalculator();
  initBarChart();
  initDataTable();
  initSandbox();
  initMattSection();
  initPlayerViewer();
  initCopyButton();
  initStickyObserver();
});

// ============ STATIC STATS (freq/season reference) ============
function initStaticStats() {
  const freqs = SRM_DATA.categories
    .map(c => c.freqPerSeason)
    .filter(f => f != null && f > 0);
  const medFreq = median(freqs);
  const meanFreq = mean(freqs);
  document.getElementById('stat-med-freq').textContent = fmt(medFreq, 0);
  document.getElementById('stat-mean-freq').textContent = fmt(meanFreq, 0);
}

// ============ COPY ADJUSTMENTS (Appendix A row order) ============
// Maps each row of the Appendix A CSV to our internal category name.
// null = empty/header row (outputs blank). 175 rows total.
const APPENDIX_ROW_MAP = [
  // Rows 1-24: headers, notes, roster settings
  null,null,null,null,null,null,null,null,null,null,
  null,null,null,null,null,null,null,null,null,null,
  null,null,null,null,
  // Row 25: "Passing" header
  null,
  // Rows 26-38: Passing categories
  "Passing Yards","Passing TDs","Passing First Down","2-pt Conversion (Pass)",
  "Pass Intercepted","Pick 6 Thrown","Pass Completed","Incomplete Pass",
  "Pass Attempt","QB Sacked","40+ Yard Completion Bonus",
  "40+ Yard Pass TD Bonus","50+ Yard Pass TD Bonus",
  // Row 39: "Rushing" header
  null,
  // Rows 40-47: Rushing
  "Rushing Yards","Rushing TD","Rushing First Down","2-pt Conversion (Rush)",
  "Rush Attempt","40+ Yard Rush Bonus","40+ Yard Rush TD Bonus","50+ Yard Rush TD Bonus",
  // Row 48: "Receiving" header
  null,
  // Rows 49-63: Receiving
  "Reception","Receiving Yards","Receiving TD","Receiving First Down",
  "2-pt Conversion (Rec)","0-4 Yard Reception Bonus","5-9 Yard Reception Bonus",
  "10-19 Yard Reception Bonus","20-29 Yard Reception Bonus",
  "30-39 Yard Reception Bonus","40-49 Yard Reception Bonus",
  "50+ Yard Reception Bonus","Reception Bonus - RB",
  "Reception Bonus - WR","Reception Bonus - TE",
  // Row 64: "Kicking" header
  null,
  // Rows 65-80: Kicking
  "FG Made","FG Made (0-19 yards)","FG Made (20-29 yards)","FG Made (30-39 yards)",
  "FG Made (40-49 yards)","FG Made (50+ yards)","Points per FG yard",
  "Points per FG yard over 30","PAT Made","FG Missed",
  "FG Missed (0-19 yards)","FG Missed (20-29 yards)","FG Missed (30-39 yards)",
  "FG Missed (40-49 yards)","FG Missed (50+ yards)","PAT Missed",
  // Row 81: "Team Defense" header
  null,
  // Rows 82-121: Team Defense
  "Defense TD","Points Allowed (0)","Points Allowed (1-6)","Points Allowed (7-13)",
  "Points Allowed (14-20)","Points Allowed (21-27)","Points Allowed (28-34)",
  "Points Allowed (35+)","Points per Point Allowed",
  "Less Than 100 Total Yards Allowed","100-199 Yards Allowed",
  "200-299 Yards Allowed","300-349 Yards Allowed","350-399 Yards Allowed",
  "400-449 Yards Allowed","450-499 Yards Allowed","500-549 Yards Allowed",
  "550+ Yards Allowed","Points per Yards Allowed",
  "3 and Out","4th Down Stop","Hit on QB (Team Def)","Sack (Team Def)",
  "Sack Yards (Team Def)","Interception (Team Def)",
  "Interception Yards (Team Def)","Fumble Recovery (Team Def)",
  "Fumble Return Yards (Team Def)","Tackle For Loss (Team Def)",
  "Assisted Tackle (Team Def)","Solo Tackle (Team Def)","Tackle (Team Def)",
  "Safety (Team Def)","Forced Fumble (Team Def)","Blocked Kick","Forced Punt",
  "Pass Defended (Team Def)","2-pt Conversion Returns",
  "Missed FG Return Yards (Team Def)","Blocked Kick Return Yards (Team Def)",
  // Row 122: "Special Teams (D/ST)" header
  null,
  // Rows 123-128: Special Teams D/ST
  "Special Teams TD (D/ST)","Special Teams Forced Fumble (D/ST)",
  "Special Teams Fumble Recovery (D/ST)","Special Teams Solo Tackle (D/ST)",
  "Punt Return Yards (D/ST)","Kick Return Yards (D/ST)",
  // Row 129: "Special Teams Player" header/setting
  null,
  // Rows 130-135: Special Teams Player
  "Special Teams Player TD","Special Teams Player Forced Fumble",
  "Special Teams Player Fumble Recovery","Special Teams Player Solo Tackle",
  "Player Punt Return Yards","Player Kick Return Yards",
  // Row 136: "Misc" header
  null,
  // Rows 137-153: Misc
  "Fumble","Fumble Lost","Fumble Recovery TD",
  "100-199 Yard Rushing Game","200+ Yard Rushing Game",
  "100-199 Yard Receiving Game","200+ Yard Receiving Game",
  "300-399 Yard Passing Game","400+ Yard Passing Game",
  "100-199 Combined Rush + Rec Yards","200+ Combined Rush + Rec Yards",
  "25+ Pass Completions","20+ Carries",
  "First Down Bonus - RB","First Down Bonus - WR",
  "First Down Bonus - TE","First Down Bonus - QB",
  // Row 154: "Individual Defensive Player" header
  null,
  // Rows 155-175: IDP
  "IDP Touchdown","Sack (IDP)","Sack Yards (IDP)","Hit on QB (IDP)",
  "Tackle (IDP)","Tackle For Loss (IDP)","Blocked Punt, PAT, or FG (IDP)",
  "Interception (IDP)","Interception Return Yards (IDP)",
  "Fumble Recovery (IDP)","Fumble Recovery Return Yards (IDP)",
  "Forced Fumble (IDP)","Safety (IDP)","Assisted Tackle (IDP)",
  "Solo Tackle (IDP)","Pass Defended (IDP)",
  "10+ Tackle Bonus","2+ Sack Bonus","3+ Pass Defended Bonus",
  "50+ Yard Interception Return TD Bonus","50+ Yard Fumble Recovery Return TD Bonus",
];

// Define sections with their row ranges (1-indexed, matching Appendix A CSV)
const APPENDIX_SECTIONS = [
  { name: 'Passing',             startRow: 26, endRow: 38 },
  { name: 'Rushing',             startRow: 40, endRow: 47 },
  { name: 'Receiving',           startRow: 49, endRow: 63 },
  { name: 'Kicking',             startRow: 65, endRow: 80 },
  { name: 'Team Defense',        startRow: 82, endRow: 121 },
  { name: 'Special Teams (D/ST)',startRow: 123, endRow: 128 },
  { name: 'Special Teams Player',startRow: 130, endRow: 135 },
  { name: 'Misc',                startRow: 137, endRow: 153 },
  { name: 'IDP',                 startRow: 155, endRow: 175 },
];

function initCopyButton() {
  const sel = document.getElementById('copy-section-select');
  sel.innerHTML = '<option value="all">All (full column)</option>';
  APPENDIX_SECTIONS.forEach((s, i) => {
    sel.innerHTML += `<option value="${i}">${s.name} (row ${s.startRow})</option>`;
  });

  document.getElementById('copy-adj-btn').addEventListener('click', () => {
    const lookup = {};
    computed.valid.forEach(c => { lookup[c.name] = c; });
    const choice = sel.value;

    let lines;
    let label;
    if (choice === 'all') {
      // Start from row 8 (Roster Settings) — skip rows 1-7
      // Row 8 = "SRM Increment" header for roster section
      // Rows 9-23 = roster settings → output "1"
      // Row 24 = "SRM Increment" header for scoring section
      // Row 25+ = section headers (blank) and scoring categories
      lines = APPENDIX_ROW_MAP.slice(7).map((catName, i) => {
        const row = i + 8; // 1-indexed row number
        if (row === 8 || row === 24) return 'SRM Increment';
        if (row >= 9 && row <= 23) return '\u00B11';
        if (catName === null) return '';
        const c = lookup[catName];
        return (c && c.normalizedAdj != null) ? '\u00B1' + parseFloat(c.normalizedAdj.toPrecision(6)) : '';
      });
      label = 'all rows (paste at Roster Settings row)';
    } else {
      const sec = APPENDIX_SECTIONS[parseInt(choice)];
      // Extract just this section's rows (0-indexed from APPENDIX_ROW_MAP)
      lines = [];
      for (let r = sec.startRow; r <= sec.endRow; r++) {
        const catName = APPENDIX_ROW_MAP[r - 1];
        if (catName === null) { lines.push(''); continue; }
        const c = lookup[catName];
        lines.push((c && c.normalizedAdj != null) ? '\u00B1' + parseFloat(c.normalizedAdj.toPrecision(6)) : '');
      }
      label = sec.name + ' (paste starting at row ' + sec.startRow + ')';
    }

    const text = lines.join('\n');
    navigator.clipboard.writeText(text).then(() => {
      const status = document.getElementById('copy-status');
      status.textContent = 'Copied ' + label + '!';
      setTimeout(() => { status.textContent = ''; }, 3000);
    });
  });
}

// ============ FIXED BAR VISIBILITY ============
function initStickyObserver() {
  const controls = document.querySelector('.sticky-controls');
  if (!controls) return;
  // Show the bar once user scrolls past the hero section
  const trigger = document.getElementById('problem');
  if (!trigger) return;
  const observer = new IntersectionObserver(([entry]) => {
    controls.classList.toggle('visible', entry.isIntersecting || entry.boundingClientRect.top < 0);
  }, { threshold: 0 });
  observer.observe(trigger);
  // Also show if already scrolled past on load
  if (trigger.getBoundingClientRect().top < window.innerHeight) {
    controls.classList.add('visible');
  }
}

// ============ UTILITIES ============
function fmt(n, decimals) {
  if (n == null) return 'N/A';
  if (Math.abs(n) >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: decimals ?? 1 });
  if (Math.abs(n) >= 1) return n.toFixed(decimals ?? 2);
  if (Math.abs(n) >= 0.01) return n.toFixed(decimals ?? 4);
  return n.toFixed(decimals ?? 6);
}

function median(arr) {
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function sectionColor(section) {
  return SRM_DATA.sections[section] || '#64748b';
}

// ============ RECALCULATION ============
function recalculate() {
  const cats = SRM_DATA.categories.map(c => ({ ...c }));
  const valid = cats.filter(c => c.freqPerSeason != null);

  // Compute raw impact (0 for categories that never occur)
  valid.forEach(c => { c.impact = (c.freqPerSeason || 0) * c.adjustment; });

  let target;
  let capped = 0;

  if (state.normMode === 'matt') {
    // Bucket-based normalization — fixed factors by impact tier
    valid.forEach(c => {
      c.factor = getMattBucket(c.impact).factor;
      c.normalizedAdj = c.adjustment * c.factor;
      c.adjustedImpact = c.freqPerSeason * c.normalizedAdj;
    });
    target = median(valid.map(c => c.adjustedImpact));
  } else {
    // Formula-based normalization
    const impacts = valid.map(c => c.impact);
    if (state.normMode === 'median') target = median(impacts);
    else if (state.normMode === 'mean') target = mean(impacts);
    else target = state.customTarget;

    valid.forEach(c => {
      c.factor = c.impact > 0 ? target / c.impact : (state.capMax < 500 ? state.capMax : 500);

      // Round first
      if (state.roundTo > 0) {
        c.factor = Math.round(c.factor / state.roundTo) * state.roundTo;
      }

      // Then enforce caps — snap to nearest valid rounded value within bounds
      if (state.capMin > 0.001 && c.factor < state.capMin) {
        c.factor = state.roundTo > 0
          ? Math.ceil(state.capMin / state.roundTo) * state.roundTo
          : state.capMin;
      }
      if (state.capMax < 500 && c.factor > state.capMax) {
        c.factor = state.roundTo > 0
          ? Math.floor(state.capMax / state.roundTo) * state.roundTo
          : state.capMax;
      }

      c.normalizedAdj = c.adjustment * c.factor;
      c.adjustedImpact = c.freqPerSeason * c.normalizedAdj;
    });

    capped = valid.filter(c =>
      (state.capMax < 500 && target / (c.freqPerSeason * c.adjustment) > state.capMax) ||
      (state.capMin > 0.001 && target / (c.freqPerSeason * c.adjustment) < state.capMin)
    ).length;
  }

  // Apply roster capture adjustment if enabled
  if (state.captureAdj) {
    const CAPTURE_SCALES = {
      'Team Defense': 0.5, 'Special Teams D/ST': 0.5,
    };
    valid.forEach(c => {
      const scale = CAPTURE_SCALES[c.section] || 1.0;
      if (scale !== 1.0) {
        c.factor *= scale;
        c.normalizedAdj = c.adjustment * c.factor;
        c.adjustedImpact = c.freqPerSeason * c.normalizedAdj;
      }
    });
  }

  // Stats
  const factors = valid.map(c => c.factor).filter(f => f > 0);
  const normalizedImpacts = valid.map(c => c.adjustedImpact).filter(x => x > 0);

  return {
    categories: cats,
    valid,
    target,
    maxFactor: Math.max(...factors),
    minFactor: Math.min(...factors),
    spreadAfter: normalizedImpacts.length > 0
      ? (Math.max(...normalizedImpacts) / Math.min(...normalizedImpacts)).toFixed(1)
      : '1.0',
    capped,
  };
}

// ============ HERO ============
function initHero() {
  const el = document.getElementById('spread-counter');
  const target = SRM_DATA.impactSpread;
  const duration = 2000;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(target * eased).toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target.toLocaleString();
  }
  // Trigger when scrolled into view (or immediately if visible)
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      requestAnimationFrame(tick);
      observer.disconnect();
    }
  }, { threshold: 0.3 });
  observer.observe(el);
}

// ============ BUBBLE CHART ============
let bubbleNodes = null;
let bubbleOriginal = {}; // name -> { r, impact }

function initBubbleChart() {
  const container = document.getElementById('bubble-chart');
  const width = container.clientWidth || 900;
  const height = 450;

  const data = SRM_DATA.categories.filter(c => c.impact && c.impact > 0);

  const root = d3.hierarchy({ children: data })
    .sum(d => Math.sqrt(d.impact));

  d3.pack()
    .size([width, height])
    .padding(2)(root);

  const svg = d3.select('#bubble-chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  // Tooltip
  const tooltip = d3.select('#bubble-chart')
    .append('div')
    .attr('class', 'bubble-tooltip');

  const nodes = svg.selectAll('g')
    .data(root.leaves())
    .join('g')
    .attr('transform', d => `translate(${d.x},${d.y})`);

  // Store original radii for live updates
  root.leaves().forEach(d => {
    bubbleOriginal[d.data.name] = { r: d.r, impact: d.data.impact };
  });

  nodes.append('circle')
    .attr('r', d => d.r)
    .attr('fill', d => sectionColor(d.data.section))
    .attr('opacity', 0.75)
    .attr('stroke', d => sectionColor(d.data.section))
    .attr('stroke-width', 0.5)
    .on('mouseenter', (event, d) => {
      d3.select(event.target).attr('opacity', 1).attr('stroke-width', 2);
      const c = computed.valid.find(x => x.name === d.data.name);
      tooltip.classed('visible', true).html(
        `<strong>${d.data.name}</strong><br>` +
        `Section: ${d.data.section}<br>` +
        `Freq/season: ${fmt(d.data.freqPerSeason)}<br>` +
        `Original impact: ${fmt(d.data.impact)} pts<br>` +
        `Adjusted impact: ${c && c.adjustedImpact ? fmt(c.adjustedImpact) + ' pts' : 'N/A'}<br>` +
        `Factor: ${c && c.factor ? c.factor.toFixed(2) + 'x' : 'N/A'}`
      );
    })
    .on('mousemove', (event) => {
      const rect = container.getBoundingClientRect();
      tooltip
        .style('left', (event.clientX - rect.left + 14) + 'px')
        .style('top', (event.clientY - rect.top - 10) + 'px');
    })
    .on('mouseleave', (event) => {
      d3.select(event.target).attr('opacity', 0.75).attr('stroke-width', 0.5);
      tooltip.classed('visible', false);
    });

  // Labels for big bubbles
  nodes.filter(d => d.r > 28)
    .append('text')
    .text(d => {
      const name = d.data.name;
      const max = Math.floor(d.r / 3.2);
      return name.length > max ? name.slice(0, max - 1) + '\u2026' : name;
    })
    .attr('text-anchor', 'middle')
    .attr('dy', '0.35em')
    .attr('fill', 'white')
    .attr('font-size', d => Math.min(d.r / 4, 11) + 'px')
    .attr('font-weight', 500)
    .style('pointer-events', 'none');

  bubbleNodes = nodes;

  // Legend
  const legend = document.getElementById('bubble-legend');
  Object.entries(SRM_DATA.sections).forEach(([name, color]) => {
    legend.innerHTML += `<div class="legend-item"><span class="legend-dot" style="background:${color}"></span>${name}</div>`;
  });
}

function updateBubbleChart() {
  if (!bubbleNodes) return;
  const lookup = {};
  computed.valid.forEach(c => { lookup[c.name] = c; });

  bubbleNodes.select('circle')
    .transition()
    .duration(500)
    .attr('r', function(d) {
      const orig = bubbleOriginal[d.data.name];
      const c = lookup[d.data.name];
      if (!orig || !c || !c.adjustedImpact || !orig.impact) return orig ? orig.r : 0;
      // Scale area proportionally: newR = origR * sqrt(newImpact / origImpact)
      const scale = Math.sqrt(c.adjustedImpact / orig.impact);
      return orig.r * Math.min(scale, 3.5); // clamp growth to prevent overlap
    });
}

// ============ CALCULATOR ============
function initCalculator() {
  const sel1 = document.getElementById('calc-cat1');
  const sel2 = document.getElementById('calc-cat2');
  const cats = SRM_DATA.categories.filter(c => c.impact && c.impact > 0);

  cats.forEach(c => {
    sel1.innerHTML += `<option value="${c.name}">${c.name}</option>`;
    sel2.innerHTML += `<option value="${c.name}">${c.name}</option>`;
  });

  // Default: pick two dramatically different ones
  sel1.value = 'Rush Attempt';
  sel2.value = '200+ Yard Rushing Game';

  function update() {
    const c1 = cats.find(c => c.name === sel1.value);
    const c2 = cats.find(c => c.name === sel2.value);
    if (!c1 || !c2) return;

    const max = Math.max(c1.impact, c2.impact);
    const bar1 = document.getElementById('calc-bar1');
    const bar2 = document.getElementById('calc-bar2');

    bar1.style.width = (c1.impact / max * 100) + '%';
    bar1.style.background = sectionColor(c1.section);
    bar2.style.width = (c2.impact / max * 100) + '%';
    bar2.style.background = sectionColor(c2.section);

    document.getElementById('calc-value1').textContent = fmt(c1.impact) + ' pts/season';
    document.getElementById('calc-value2').textContent = fmt(c2.impact) + ' pts/season';

    const ratio = c1.impact > c2.impact
      ? (c1.impact / c2.impact)
      : (c2.impact / c1.impact);
    const bigger = c1.impact > c2.impact ? c1.name : c2.name;

    document.getElementById('calc-comparison').innerHTML =
      `Your +1 on <strong>${bigger}</strong> is worth <strong>${fmt(ratio, 0)}x</strong> more than the other`;
  }

  sel1.addEventListener('change', update);
  sel2.addEventListener('change', update);
  update();
}

// ============ BAR CHART ============
function initBarChart() {
  const sorted = computed.valid
    .slice()
    .sort((a, b) => b.impact - a.impact);
  barCategories = sorted;

  // Size the canvas dynamically so all ~142 bars are readable
  const canvas = document.getElementById('bar-chart-canvas');
  canvas.style.height = Math.max(600, sorted.length * 18) + 'px';

  const ctx = document.getElementById('bar-chart-canvas').getContext('2d');
  barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sorted.map(c => c.name),
      datasets: [{
        label: 'Impact / Season',
        data: sorted.map(c => c.impact),
        backgroundColor: sorted.map(c => sectionColor(c.section) + 'cc'),
        borderColor: sorted.map(c => sectionColor(c.section)),
        borderWidth: 1,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 800, easing: 'easeInOutCubic' },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const c = barCategories[ctx.dataIndex];
              return ` Impact: ${fmt(ctx.raw)} pts | Freq: ${fmt(c.freqPerSeason)}/szn`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(51,65,85,0.4)' },
          ticks: { color: '#94a3b8', callback: v => v >= 1000 ? (v/1000)+'k' : v },
        },
        y: {
          grid: { display: false },
          ticks: { color: '#e2e8f0', font: { size: 10 }, autoSkip: false },
        },
      },
    },
  });

  document.getElementById('toggle-btn').addEventListener('click', toggleBarChart);
}

function toggleBarChart() {
  state.showNormalized = !state.showNormalized;
  updateBarChartData();
}

function updateBarChartData() {
  const btn = document.getElementById('toggle-btn');
  const label = document.getElementById('toggle-label');
  const lookup = {};
  computed.valid.forEach(c => { lookup[c.name] = c; });

  if (state.showNormalized) {
    btn.textContent = 'Show Original';
    btn.classList.add('active');
    label.textContent = 'Currently: Normalized (equalized impact)';
    barChart.data.datasets[0].data = barCategories.map(c => {
      const comp = lookup[c.name];
      return comp && comp.adjustedImpact ? comp.adjustedImpact : computed.target;
    });
    barChart.data.datasets[0].label = 'Adjusted Impact / Season';
  } else {
    btn.textContent = 'Show Normalized';
    btn.classList.remove('active');
    label.textContent = 'Currently: Original (unequal impact)';
    barChart.data.datasets[0].data = barCategories.map(c => c.impact);
    barChart.data.datasets[0].label = 'Impact / Season';
  }
  barChart.update();
}

// ============ DATA TABLE ============
function initDataTable() {
  // Section filter tabs
  const filters = document.getElementById('section-filters');
  const sections = ['All', ...Object.keys(SRM_DATA.sections)];
  sections.forEach(s => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn' + (s === 'All' ? ' active' : '');
    btn.dataset.section = s;
    btn.textContent = s;
    btn.addEventListener('click', () => {
      filters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.sectionFilter = s;
      renderTable();
    });
    filters.appendChild(btn);
  });

  // Search
  document.getElementById('table-search').addEventListener('input', (e) => {
    state.search = e.target.value;
    renderTable();
  });

  // Sort headers
  document.querySelectorAll('#data-table th').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.col;
      if (state.sortCol === col) state.sortDir = state.sortDir === 'desc' ? 'asc' : 'desc';
      else { state.sortCol = col; state.sortDir = 'desc'; }
      renderTable();
    });
  });

  renderTable();
}

function renderTable() {
  let data = computed.valid.slice();

  // Filter
  if (state.sectionFilter !== 'All') {
    data = data.filter(c => c.section === state.sectionFilter);
  }
  if (state.search) {
    const q = state.search.toLowerCase();
    data = data.filter(c => c.name.toLowerCase().includes(q));
  }

  // Sort
  const col = state.sortCol;
  const dir = state.sortDir === 'asc' ? 1 : -1;
  data.sort((a, b) => {
    let va = a[col], vb = b[col];
    if (va == null) va = -Infinity;
    if (vb == null) vb = -Infinity;
    if (typeof va === 'string') return dir * va.localeCompare(vb);
    return dir * (va - vb);
  });

  // Update sort indicators
  document.querySelectorAll('#data-table th').forEach(th => {
    th.classList.toggle('sorted', th.dataset.col === col);
    const arrow = th.querySelector('.sort-arrow');
    if (arrow) arrow.remove();
    if (th.dataset.col === col) {
      th.innerHTML += `<span class="sort-arrow">${state.sortDir === 'asc' ? '\u25B2' : '\u25BC'}</span>`;
    }
  });

  // Render rows
  const tbody = document.getElementById('table-body');
  tbody.innerHTML = data.map(c => {
    const adjImpact = c.adjustedImpact != null ? c.adjustedImpact
      : (c.freqPerSeason && c.normalizedAdj ? c.freqPerSeason * c.normalizedAdj : null);
    return `
    <tr>
      <td>${c.name}</td>
      <td><span class="section-badge" style="background:${sectionColor(c.section)}">${c.section}</span></td>
      <td>${fmt(c.freqPerSeason)}</td>
      <td>${c.adjustment}</td>
      <td>${fmt(c.impact)}</td>
      <td>${c.normalizedAdj != null ? fmt(c.normalizedAdj) : 'N/A'}</td>
      <td>${c.factor != null ? fmt(c.factor) + 'x' : 'N/A'}</td>
      <td>${adjImpact != null ? fmt(adjImpact) : 'N/A'}</td>
    </tr>`;
  }).join('');
}

// ============ SANDBOX ============
function initSandbox() {
  // Normalization mode (select dropdown)
  const modeSelect = document.getElementById('norm-mode-select');
  const ctSlider = document.getElementById('custom-target');
  const ctVal = document.getElementById('custom-target-val');

  modeSelect.addEventListener('change', () => {
    state.normMode = modeSelect.value;
    applyModeUI();
    updateAll();
  });

  ctSlider.addEventListener('input', () => {
    state.customTarget = parseFloat(ctSlider.value);
    ctVal.textContent = fmt(state.customTarget, 0);
    if (state.normMode === 'custom') updateAll();
  });

  // Factor cap sliders
  const capMaxSlider = document.getElementById('cap-max');
  const capMaxVal = document.getElementById('cap-max-val');
  capMaxSlider.addEventListener('input', () => {
    state.capMax = parseFloat(capMaxSlider.value);
    capMaxVal.textContent = state.capMax >= 500 ? 'Off' : state.capMax + 'x';
    updateAll();
  });

  const capMinSlider = document.getElementById('cap-min');
  const capMinVal = document.getElementById('cap-min-val');
  capMinSlider.addEventListener('input', () => {
    state.capMin = parseFloat(capMinSlider.value);
    capMinVal.textContent = state.capMin <= 0.001 ? 'Off' : state.capMin + 'x';
    updateAll();
  });

  // Rounding
  document.getElementById('round-to').addEventListener('change', (e) => {
    state.roundTo = parseFloat(e.target.value);
    updateAll();
  });

  // Capture rate adjustment
  document.getElementById('capture-adj').addEventListener('change', (e) => {
    state.captureAdj = e.target.checked;
    updateAll();
  });

  updateSandboxStats();
  applyModeUI();
}

function updateSandboxStats() {
  document.getElementById('stat-target').textContent = fmt(computed.target, 1);
  document.getElementById('stat-spread-after').textContent = computed.spreadAfter + 'x';
  document.getElementById('stat-capped').textContent = computed.capped;
}

function applyModeUI() {
  const mode = state.normMode;
  const ctSlider = document.getElementById('custom-target');
  const ctVal = document.getElementById('custom-target-val');
  ctSlider.classList.toggle('hidden', mode !== 'custom');
  ctVal.classList.toggle('hidden', mode !== 'custom');

  // Caps & rounding don't apply to Matt mode
  const isMatt = mode === 'matt';
  document.getElementById('cap-min').disabled = isMatt;
  document.getElementById('cap-max').disabled = isMatt;
  document.getElementById('round-to').disabled = isMatt;

  // Matt button active state
  const mattBtn = document.getElementById('enable-matt');
  if (mattBtn) {
    mattBtn.classList.toggle('matt-active', isMatt);
    mattBtn.textContent = isMatt
      ? "Matt's Recommendation is Active"
      : "Apply Matt's Recommendation to All Charts";
  }
}

// ============ MATT'S RECOMMENDATION SECTION ============
function initMattSection() {
  renderBucketEditor();

  document.getElementById('enable-matt').addEventListener('click', () => {
    state.normMode = 'matt';
    document.getElementById('norm-mode-select').value = 'matt';
    applyModeUI();
    updateAll();
    document.getElementById('fix').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function assignBucketColors() {
  MATT_BUCKETS.forEach((b, i) => { b.color = BUCKET_COLORS[i % BUCKET_COLORS.length]; });
}

function renderBucketEditor() {
  const grid = document.getElementById('bucket-grid');
  if (!grid) return;
  assignBucketColors();

  // Summary cards
  const cards = MATT_BUCKETS.map((b, i) => {
    const count = SRM_DATA.categories.filter(c =>
      c.impact != null && c.impact >= b.min && c.impact < b.max
    ).length;
    const rangeStr = b.max === Infinity ? `${b.min}+` : `${b.min} - ${b.max}`;
    return `
      <div class="bucket-card" style="border-top-color:${b.color}">
        <div class="bucket-label">${b.label}</div>
        <div class="bucket-range">${rangeStr}</div>
        <div class="bucket-range-sub">impact / season</div>
        <div class="bucket-factor" style="color:${b.color}">${b.factor}x</div>
        <div class="bucket-count">${count} categor${count === 1 ? 'y' : 'ies'}</div>
      </div>`;
  }).join('');
  grid.innerHTML = cards;

  // Editor table
  let editor = document.getElementById('bucket-editor');
  if (!editor) {
    editor = document.createElement('div');
    editor.id = 'bucket-editor';
    grid.parentNode.insertBefore(editor, grid.nextSibling);
  }

  let rows = MATT_BUCKETS.map((b, i) => {
    const isLast = i === MATT_BUCKETS.length - 1;
    return `<tr>
      <td><span class="legend-dot" style="background:${b.color};width:12px;height:12px;display:inline-block;border-radius:50%;vertical-align:middle"></span></td>
      <td><input type="text" class="bucket-input" data-idx="${i}" data-field="label" value="${b.label}"></td>
      <td><input type="number" class="bucket-input bucket-num" data-idx="${i}" data-field="min" value="${b.min}" step="any"></td>
      <td><input type="number" class="bucket-input bucket-num" data-idx="${i}" data-field="max" value="${isLast ? '' : b.max}" step="any" ${isLast ? 'placeholder="∞" disabled' : ''}></td>
      <td><input type="number" class="bucket-input bucket-num" data-idx="${i}" data-field="factor" value="${b.factor}" step="any"></td>
      <td>${MATT_BUCKETS.length > 1 ? `<button class="bucket-del" data-idx="${i}" title="Remove">&times;</button>` : ''}</td>
    </tr>`;
  }).join('');

  editor.innerHTML = `
    <table class="bucket-edit-table">
      <thead><tr><th></th><th>Label</th><th>Min Impact</th><th>Max Impact</th><th>Factor</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <button id="add-bucket-btn" class="btn" style="margin-top:8px;padding:6px 16px;font-size:0.85rem;background:var(--surface);color:var(--text);border:1px solid var(--border);">+ Add Bucket</button>
  `;

  // Event: edit inputs
  editor.querySelectorAll('.bucket-input').forEach(input => {
    input.addEventListener('change', () => {
      const idx = parseInt(input.dataset.idx);
      const field = input.dataset.field;
      if (field === 'label') {
        MATT_BUCKETS[idx].label = input.value;
      } else {
        MATT_BUCKETS[idx][field] = parseFloat(input.value) || 0;
      }
      // Auto-chain: set next bucket's min = this bucket's max
      if (field === 'max' && idx < MATT_BUCKETS.length - 1) {
        MATT_BUCKETS[idx + 1].min = MATT_BUCKETS[idx].max;
      }
      if (field === 'min' && idx > 0) {
        MATT_BUCKETS[idx - 1].max = MATT_BUCKETS[idx].min;
      }
      renderBucketEditor();
      if (state.normMode === 'matt') updateAll();
    });
  });

  // Event: delete bucket
  editor.querySelectorAll('.bucket-del').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx);
      const removed = MATT_BUCKETS.splice(idx, 1)[0];
      // Fix gap: if not first/last, extend neighbor
      if (idx < MATT_BUCKETS.length) {
        MATT_BUCKETS[idx].min = idx > 0 ? MATT_BUCKETS[idx - 1].max : 0;
      } else if (MATT_BUCKETS.length > 0) {
        MATT_BUCKETS[MATT_BUCKETS.length - 1].max = Infinity;
      }
      renderBucketEditor();
      if (state.normMode === 'matt') updateAll();
    });
  });

  // Event: add bucket
  document.getElementById('add-bucket-btn').addEventListener('click', () => {
    const last = MATT_BUCKETS[MATT_BUCKETS.length - 1];
    // Insert before the last bucket, splitting its range
    const splitPoint = last.min > 0 ? last.min * 2 : 100;
    const newBucket = { min: splitPoint, max: Infinity, factor: Math.max(0.5, last.factor / 2), color: '', label: 'New' };
    last.max = splitPoint;
    MATT_BUCKETS.push(newBucket);
    MATT_BUCKETS.sort((a, b) => a.min - b.min);
    // Last bucket always goes to infinity
    MATT_BUCKETS[MATT_BUCKETS.length - 1].max = Infinity;
    renderBucketEditor();
    if (state.normMode === 'matt') updateAll();
  });
}

// ============ PLAYER IMPACT VIEWER ============
const WEEKLY_STAT_MAP = [
  // Passing
  { cat: 'Passing Yards',        cols: ['passing_yards'],           adj: 0.02 },
  { cat: 'Passing TDs',          cols: ['passing_tds'],             adj: 1.0 },
  { cat: 'Passing First Down',   cols: ['passing_first_downs'],     adj: 1.0 },
  { cat: 'Pass Completed',       cols: ['completions'],             adj: 1.0 },
  { cat: 'Incomplete Pass',      cols: ['attempts'], sub: ['completions'], adj: 1.0 },
  { cat: 'Pass Attempt',         cols: ['attempts'],                adj: 1.0 },
  { cat: 'Pass Intercepted',     cols: ['interceptions'],           adj: 1.0 },
  { cat: 'QB Sacked',            cols: ['sacks'],                   adj: 1.0 },
  { cat: '2-pt Conversion (Pass)', cols: ['passing_2pt_conversions'], adj: 1.0 },
  // Rushing
  { cat: 'Rushing Yards',        cols: ['rushing_yards'],           adj: 0.1 },
  { cat: 'Rushing TD',           cols: ['rushing_tds'],             adj: 1.0 },
  { cat: 'Rushing First Down',   cols: ['rushing_first_downs'],     adj: 1.0 },
  { cat: 'Rush Attempt',         cols: ['carries'],                 adj: 1.0 },
  { cat: '2-pt Conversion (Rush)', cols: ['rushing_2pt_conversions'], adj: 1.0 },
  // Receiving
  { cat: 'Reception',            cols: ['receptions'],              adj: 1.0 },
  { cat: 'Receiving Yards',      cols: ['receiving_yards'],         adj: 0.1 },
  { cat: 'Receiving TD',         cols: ['receiving_tds'],           adj: 1.0 },
  { cat: 'Receiving First Down', cols: ['receiving_first_downs'],   adj: 1.0 },
  { cat: '2-pt Conversion (Rec)', cols: ['receiving_2pt_conversions'], adj: 1.0 },
  // Reception yardage brackets (from PBP)
  { cat: '0-4 Yard Reception Bonus',   cols: ['rec_0_4'],   adj: 1.0 },
  { cat: '5-9 Yard Reception Bonus',   cols: ['rec_5_9'],   adj: 1.0 },
  { cat: '10-19 Yard Reception Bonus', cols: ['rec_10_19'], adj: 1.0 },
  { cat: '20-29 Yard Reception Bonus', cols: ['rec_20_29'], adj: 1.0 },
  { cat: '30-39 Yard Reception Bonus', cols: ['rec_30_39'], adj: 1.0 },
  { cat: '40-49 Yard Reception Bonus', cols: ['rec_40_49'], adj: 1.0 },
  { cat: '50+ Yard Reception Bonus',   cols: ['rec_50_plus'], adj: 1.0 },
  // Pass bonuses (from PBP, credited to passer)
  { cat: '40+ Yard Completion Bonus',  cols: ['comp_40_plus'],    adj: 1.0 },
  { cat: '40+ Yard Pass TD Bonus',     cols: ['pass_td_40_plus'], adj: 1.0 },
  { cat: '50+ Yard Pass TD Bonus',     cols: ['pass_td_50_plus'], adj: 1.0 },
  // Rush bonuses (from PBP)
  { cat: '40+ Yard Rush Bonus',        cols: ['rush_40_plus'],    adj: 1.0 },
  { cat: '40+ Yard Rush TD Bonus',     cols: ['rush_td_40_plus'], adj: 1.0 },
  { cat: '50+ Yard Rush TD Bonus',     cols: ['rush_td_50_plus'], adj: 1.0 },
  // Misc
  { cat: 'Fumble',               cols: ['rushing_fumbles','receiving_fumbles','sack_fumbles'], adj: 1.0 },
  { cat: 'Fumble Lost',          cols: ['rushing_fumbles_lost','receiving_fumbles_lost','sack_fumbles_lost'], adj: 1.0 },
  // Milestones (season = pre-computed count, weekly = derived from raw stats)
  { cat: '100-199 Yard Rushing Game',   cols: ['games_100_199_rush'],   adj: 1.0,
    derive: s => { const v = s.rushing_yards||0; return (v >= 100 && v < 200) ? 1 : 0; } },
  { cat: '200+ Yard Rushing Game',      cols: ['games_200_rush'],       adj: 1.0,
    derive: s => (s.rushing_yards||0) >= 200 ? 1 : 0 },
  { cat: '100-199 Yard Receiving Game', cols: ['games_100_199_rec'],    adj: 1.0,
    derive: s => { const v = s.receiving_yards||0; return (v >= 100 && v < 200) ? 1 : 0; } },
  { cat: '200+ Yard Receiving Game',    cols: ['games_200_rec'],        adj: 1.0,
    derive: s => (s.receiving_yards||0) >= 200 ? 1 : 0 },
  { cat: '300-399 Yard Passing Game',   cols: ['games_300_399_pass'],   adj: 1.0,
    derive: s => { const v = s.passing_yards||0; return (v >= 300 && v < 400) ? 1 : 0; } },
  { cat: '400+ Yard Passing Game',      cols: ['games_400_pass'],       adj: 1.0,
    derive: s => (s.passing_yards||0) >= 400 ? 1 : 0 },
  { cat: '100-199 Combined Rush + Rec Yards', cols: ['games_100_199_combined'], adj: 1.0,
    derive: s => { const v = (s.rushing_yards||0)+(s.receiving_yards||0); return (v >= 100 && v < 200) ? 1 : 0; } },
  { cat: '200+ Combined Rush + Rec Yards',    cols: ['games_200_combined'],     adj: 1.0,
    derive: s => ((s.rushing_yards||0)+(s.receiving_yards||0)) >= 200 ? 1 : 0 },
  { cat: '25+ Pass Completions',        cols: ['games_25_completions'], adj: 1.0,
    derive: s => (s.completions||0) >= 25 ? 1 : 0 },
  { cat: '20+ Carries',                 cols: ['games_20_carries'],     adj: 1.0,
    derive: s => (s.carries||0) >= 20 ? 1 : 0 },
  // Pick 6 (from PBP, credited to passer)
  { cat: 'Pick 6 Thrown',               cols: ['pick_6_thrown'],        adj: 1.0 },
  // Position-specific reception bonuses (same stat, different scoring category)
  { cat: 'Reception Bonus - RB', cols: ['receptions'], adj: 1.0, pos: ['RB'] },
  { cat: 'Reception Bonus - WR', cols: ['receptions'], adj: 1.0, pos: ['WR'] },
  { cat: 'Reception Bonus - TE', cols: ['receptions'], adj: 1.0, pos: ['TE'] },
  // Position-specific first down bonuses
  { cat: 'First Down Bonus - RB', cols: ['rushing_first_downs','receiving_first_downs'], adj: 1.0, pos: ['RB'] },
  { cat: 'First Down Bonus - WR', cols: ['receiving_first_downs'], adj: 1.0, pos: ['WR'] },
  { cat: 'First Down Bonus - TE', cols: ['receiving_first_downs'], adj: 1.0, pos: ['TE'] },
  { cat: 'First Down Bonus - QB', cols: ['passing_first_downs','rushing_first_downs'], adj: 1.0, pos: ['QB'] },

  // ====== KICKING ======
  { cat: 'FG Made',              cols: ['k_fg_made'],         adj: 1.0, pos: ['K'] },
  { cat: 'FG Made (0-19 yards)', cols: ['k_fg_made_0_19'],    adj: 1.0, pos: ['K'] },
  { cat: 'FG Made (20-29 yards)',cols: ['k_fg_made_20_29'],   adj: 1.0, pos: ['K'] },
  { cat: 'FG Made (30-39 yards)',cols: ['k_fg_made_30_39'],   adj: 1.0, pos: ['K'] },
  { cat: 'FG Made (40-49 yards)',cols: ['k_fg_made_40_49'],   adj: 1.0, pos: ['K'] },
  { cat: 'FG Made (50+ yards)',  cols: ['k_fg_made_50_plus'], adj: 1.0, pos: ['K'] },
  { cat: 'Points per FG yard',  cols: ['k_fg_yard_total'],   adj: 0.1, pos: ['K'] },
  { cat: 'Points per FG yard over 30', cols: ['k_fg_yard_over_30'], adj: 0.1, pos: ['K'] },
  { cat: 'PAT Made',            cols: ['k_pat_made'],         adj: 1.0, pos: ['K'] },
  { cat: 'FG Missed',           cols: ['k_fg_missed'],        adj: 1.0, pos: ['K'] },
  { cat: 'FG Missed (0-19 yards)', cols: ['k_fg_missed_0_19'],adj: 1.0, pos: ['K'] },
  { cat: 'FG Missed (20-29 yards)',cols: ['k_fg_missed_20_29'],adj: 1.0, pos: ['K'] },
  { cat: 'FG Missed (30-39 yards)',cols: ['k_fg_missed_30_39'],adj: 1.0, pos: ['K'] },
  { cat: 'FG Missed (40-49 yards)',cols: ['k_fg_missed_40_49'],adj: 1.0, pos: ['K'] },
  { cat: 'FG Missed (50+ yards)', cols: ['k_fg_missed_50_plus'],adj: 1.0, pos: ['K'] },
  { cat: 'PAT Missed',          cols: ['k_pat_missed'],       adj: 1.0, pos: ['K'] },

  // ====== TEAM DEFENSE ======
  { cat: 'Defense TD',                    cols: ['td_def_td'],              adj: 1.0, pos: ['DEF'] },
  { cat: 'Points Allowed (0)',            cols: ['td_pts_0'],              adj: 1.0, pos: ['DEF'] },
  { cat: 'Points Allowed (1-6)',          cols: ['td_pts_1_6'],            adj: 1.0, pos: ['DEF'] },
  { cat: 'Points Allowed (7-13)',         cols: ['td_pts_7_13'],           adj: 1.0, pos: ['DEF'] },
  { cat: 'Points Allowed (14-20)',        cols: ['td_pts_14_20'],          adj: 1.0, pos: ['DEF'] },
  { cat: 'Points Allowed (21-27)',        cols: ['td_pts_21_27'],          adj: 1.0, pos: ['DEF'] },
  { cat: 'Points Allowed (28-34)',        cols: ['td_pts_28_34'],          adj: 1.0, pos: ['DEF'] },
  { cat: 'Points Allowed (35+)',          cols: ['td_pts_35_plus'],        adj: 1.0, pos: ['DEF'] },
  { cat: 'Points per Point Allowed',      cols: ['td_pts_allowed'],       adj: 1.0, pos: ['DEF'] },
  { cat: 'Less Than 100 Total Yards Allowed', cols: ['td_yds_lt_100'],    adj: 1.0, pos: ['DEF'] },
  { cat: '100-199 Yards Allowed',         cols: ['td_yds_100_199'],       adj: 1.0, pos: ['DEF'] },
  { cat: '200-299 Yards Allowed',         cols: ['td_yds_200_299'],       adj: 1.0, pos: ['DEF'] },
  { cat: '300-349 Yards Allowed',         cols: ['td_yds_300_349'],       adj: 1.0, pos: ['DEF'] },
  { cat: '350-399 Yards Allowed',         cols: ['td_yds_350_399'],       adj: 1.0, pos: ['DEF'] },
  { cat: '400-449 Yards Allowed',         cols: ['td_yds_400_449'],       adj: 1.0, pos: ['DEF'] },
  { cat: '450-499 Yards Allowed',         cols: ['td_yds_450_499'],       adj: 1.0, pos: ['DEF'] },
  { cat: '500-549 Yards Allowed',         cols: ['td_yds_500_549'],       adj: 1.0, pos: ['DEF'] },
  { cat: '550+ Yards Allowed',            cols: ['td_yds_550_plus'],      adj: 1.0, pos: ['DEF'] },
  { cat: 'Points per Yards Allowed',      cols: ['td_yds_allowed'],       adj: 0.1, pos: ['DEF'] },
  { cat: '3 and Out',                     cols: ['td_three_and_outs'],    adj: 1.0, pos: ['DEF'] },
  { cat: '4th Down Stop',                 cols: ['td_fourth_down_stops'], adj: 1.0, pos: ['DEF'] },
  { cat: 'Hit on QB (Team Def)',           cols: ['td_qb_hits'],          adj: 1.0, pos: ['DEF'] },
  { cat: 'Sack (Team Def)',                cols: ['td_sacks'],            adj: 1.0, pos: ['DEF'] },
  { cat: 'Sack Yards (Team Def)',          cols: ['td_sack_yards'],       adj: 0.1, pos: ['DEF'] },
  { cat: 'Interception (Team Def)',        cols: ['td_interceptions'],    adj: 1.0, pos: ['DEF'] },
  { cat: 'Interception Yards (Team Def)',  cols: ['td_int_yards'],        adj: 0.1, pos: ['DEF'] },
  { cat: 'Fumble Recovery (Team Def)',     cols: ['td_fumble_recoveries'],adj: 1.0, pos: ['DEF'] },
  { cat: 'Fumble Return Yards (Team Def)', cols: ['td_fumble_return_yards'],adj: 0.1, pos: ['DEF'] },
  { cat: 'Tackle For Loss (Team Def)',     cols: ['td_tfl'],             adj: 1.0, pos: ['DEF'] },
  { cat: 'Assisted Tackle (Team Def)',     cols: ['td_assist_tackles'],   adj: 1.0, pos: ['DEF'] },
  { cat: 'Solo Tackle (Team Def)',         cols: ['td_solo_tackles'],     adj: 1.0, pos: ['DEF'] },
  { cat: 'Tackle (Team Def)',              cols: ['td_tackles'],          adj: 1.0, pos: ['DEF'] },
  { cat: 'Safety (Team Def)',              cols: ['td_safeties'],         adj: 1.0, pos: ['DEF'] },
  { cat: 'Forced Fumble (Team Def)',       cols: ['td_forced_fumbles'],   adj: 1.0, pos: ['DEF'] },
  { cat: 'Blocked Kick',                  cols: ['td_blocked_kicks'],    adj: 1.0, pos: ['DEF'] },
  { cat: 'Forced Punt',                   cols: ['td_forced_punts'],     adj: 1.0, pos: ['DEF'] },
  { cat: 'Pass Defended (Team Def)',       cols: ['td_pass_defended'],    adj: 1.0, pos: ['DEF'] },
  { cat: '2-pt Conversion Returns',        cols: ['td_2pt_returns'],     adj: 1.0, pos: ['DEF'] },
  // Special Teams D/ST
  { cat: 'Special Teams TD (D/ST)',             cols: ['td_st_td'],              adj: 1.0, pos: ['DEF'] },
  { cat: 'Special Teams Forced Fumble (D/ST)',  cols: ['td_st_forced_fumble'],   adj: 1.0, pos: ['DEF'] },
  { cat: 'Special Teams Fumble Recovery (D/ST)',cols: ['td_st_fumble_recovery'],  adj: 1.0, pos: ['DEF'] },
  { cat: 'Punt Return Yards (D/ST)',            cols: ['td_punt_return_yards'],  adj: 0.1, pos: ['DEF'] },
  { cat: 'Kick Return Yards (D/ST)',            cols: ['td_kick_return_yards'],  adj: 0.1, pos: ['DEF'] },

  // ====== IDP ======
  { cat: 'Tackle (IDP)',                   cols: ['idp_tackles'],           adj: 1.0, pos: ['IDP'] },
  { cat: 'Solo Tackle (IDP)',              cols: ['idp_solo_tackles'],      adj: 1.0, pos: ['IDP'] },
  { cat: 'Assisted Tackle (IDP)',          cols: ['idp_assist_tackles'],    adj: 1.0, pos: ['IDP'] },
  { cat: 'Sack (IDP)',                     cols: ['idp_sacks'],            adj: 1.0, pos: ['IDP'] },
  { cat: 'Sack Yards (IDP)',               cols: ['idp_sack_yards'],       adj: 0.1, pos: ['IDP'] },
  { cat: 'Interception (IDP)',             cols: ['idp_interceptions'],    adj: 1.0, pos: ['IDP'] },
  { cat: 'Interception Return Yards (IDP)',cols: ['idp_int_return_yards'], adj: 0.1, pos: ['IDP'] },
  { cat: 'Forced Fumble (IDP)',            cols: ['idp_forced_fumbles'],   adj: 1.0, pos: ['IDP'] },
  { cat: 'Fumble Recovery (IDP)',          cols: ['idp_fumble_recoveries'],adj: 1.0, pos: ['IDP'] },
  { cat: 'Fumble Recovery Return Yards (IDP)',cols: ['idp_fumble_return_yards'],adj: 0.1, pos: ['IDP'] },
  { cat: 'Tackle For Loss (IDP)',          cols: ['idp_tfl'],              adj: 1.0, pos: ['IDP'] },
  { cat: 'Hit on QB (IDP)',                cols: ['idp_qb_hits'],          adj: 1.0, pos: ['IDP'] },
  { cat: 'Pass Defended (IDP)',            cols: ['idp_pass_defended'],    adj: 1.0, pos: ['IDP'] },
  { cat: 'Safety (IDP)',                   cols: ['idp_safeties'],         adj: 1.0, pos: ['IDP'] },
  { cat: 'Blocked Punt, PAT, or FG (IDP)', cols: ['idp_blocked_kicks'],   adj: 1.0, pos: ['IDP'] },
  { cat: 'IDP Touchdown',                  cols: ['idp_td'],              adj: 1.0, pos: ['IDP'] },
  { cat: '10+ Tackle Bonus',               cols: ['idp_games_10_tackles'], adj: 1.0, pos: ['IDP'],
    derive: s => (s.idp_tackles||0) >= 10 ? 1 : 0 },
  { cat: '2+ Sack Bonus',                  cols: ['idp_games_2_sacks'],   adj: 1.0, pos: ['IDP'],
    derive: s => (s.idp_sacks||0) >= 2 ? 1 : 0 },
  { cat: '3+ Pass Defended Bonus',         cols: ['idp_games_3_pass_defended'],adj: 1.0, pos: ['IDP'],
    derive: s => (s.idp_pass_defended||0) >= 3 ? 1 : 0 },
];

const playerState = { pos: 'QB', cat: 'Passing Yards' };

function getStatVal(statsObj, mapping) {
  let val = 0;
  let found = false;
  for (const col of mapping.cols) {
    if (statsObj[col] !== undefined) { found = true; val += statsObj[col]; }
  }
  // Only derive for weekly data (has 'week' key). For season data, missing = 0.
  if (!found && mapping.derive && statsObj.week !== undefined) {
    return mapping.derive(statsObj);
  }
  if (mapping.sub) for (const col of mapping.sub) val -= (statsObj[col] || 0);
  return val;
}

function initPlayerViewer() {
  if (typeof PLAYER_DATA === 'undefined') return;

  // Position tabs
  document.querySelectorAll('.pos-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pos-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      playerState.pos = btn.dataset.pos;
      updatePlayerCategoryOptions();
      renderPlayerTable();
    });
  });

  // Custom category dropdown
  const catBtn = document.getElementById('player-cat-btn');
  const catList = document.getElementById('player-cat-list');

  catBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = !catList.classList.contains('hidden');
    catList.classList.toggle('hidden');
    if (!isOpen) updatePlayerCategoryOptions();
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!document.getElementById('player-cat-wrapper').contains(e.target)) {
      catList.classList.add('hidden');
    }
  });

  updatePlayerCategoryOptions();
  renderPlayerTable();
}

function updatePlayerCategoryOptions() {
  const catList = document.getElementById('player-cat-list');
  const catBtn = document.getElementById('player-cat-btn');
  const pos = playerState.pos;
  const prev = playerState.cat;

  // Build list of valid categories
  const players = PLAYER_DATA[pos] || [];
  const validCats = [];
  WEEKLY_STAT_MAP.forEach(m => {
    if (m.pos && !m.pos.includes(pos)) return;
    const hasVal = players.some(p => getStatVal(p.season, m) !== 0);
    if (hasVal) validCats.push(m.cat);
  });

  // Restore selection or pick first
  if (!validCats.includes(prev) && validCats.length) playerState.cat = validCats[0];

  // Update button text
  const selComp = computed.valid.find(c => c.name === playerState.cat);
  const selAdj = selComp ? '\u00B1' + parseFloat(selComp.normalizedAdj.toPrecision(6)) : '';
  catBtn.textContent = playerState.cat + (selAdj ? '  (' + selAdj + ')' : '');

  // Populate list items
  catList.innerHTML = validCats.map(cat => {
    const compCat = computed.valid.find(c => c.name === cat);
    const adj = compCat ? '\u00B1' + parseFloat(compCat.normalizedAdj.toPrecision(6)) : '';
    const selected = cat === playerState.cat ? ' selected' : '';
    return `<div class="cat-dropdown-item${selected}" data-cat="${cat}">
      <span>${cat}</span>
      <span class="cat-adj">${adj}</span>
    </div>`;
  }).join('');

  // Hover → preview table
  catList.querySelectorAll('.cat-dropdown-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
      playerState.cat = item.dataset.cat;
      renderPlayerTable();
      // Visual highlight
      catList.querySelectorAll('.cat-dropdown-item').forEach(el => el.classList.remove('previewing'));
      item.classList.add('previewing');
    });

    // Click → commit and close
    item.addEventListener('click', () => {
      playerState.cat = item.dataset.cat;
      catList.classList.add('hidden');
      updatePlayerCategoryOptions(); // refresh button text
      renderPlayerTable();
    });
  });

  // On mouse leave, revert to committed selection
  catList.addEventListener('mouseleave', () => {
    // Keep whatever was last hovered — user can see the preview persists
  });
}

function calcTotalDiff(player, pos) {
  // Sum the diff across applicable stat categories for this player's position
  let total = 0;
  const breakdown = [];
  WEEKLY_STAT_MAP.forEach(m => {
    // Skip categories restricted to other positions
    if (m.pos && !m.pos.includes(pos)) return;
    const statVal = getStatVal(player.season, m);
    if (statVal === 0) return;
    const compCat = computed.valid.find(c => c.name === m.cat);
    const newAdj = compCat ? compCat.normalizedAdj : m.adj;
    const normImpact = statVal * newAdj;
    const diff = statVal * (newAdj - m.adj);
    breakdown.push({ cat: m.cat, stat: statVal, normImpact, diff });
    total += diff;
  });
  return { total, breakdown };
}

function calcWeekTotalDiff(weekStats, pos) {
  let total = 0;
  WEEKLY_STAT_MAP.forEach(m => {
    if (m.pos && !m.pos.includes(pos)) return;
    const statVal = getStatVal(weekStats, m);
    if (statVal === 0) return;
    const compCat = computed.valid.find(c => c.name === m.cat);
    const newAdj = compCat ? compCat.normalizedAdj : m.adj;
    total += statVal * (newAdj - m.adj);
  });
  return total;
}

function renderPlayerTable() {
  if (typeof PLAYER_DATA === 'undefined') return;
  const players = PLAYER_DATA[playerState.pos] || [];
  const mapping = WEEKLY_STAT_MAP.find(m => m.cat === playerState.cat);
  if (!mapping) return;

  // Find the corresponding category in computed data for new adj
  const compCat = computed.valid.find(c => c.name === mapping.cat);
  const newAdj = compCat ? compCat.normalizedAdj : mapping.adj;

  // Update stat column header
  document.getElementById('pth-stat').textContent = mapping.cat;

  const tbody = document.getElementById('player-body');
  let html = '';

  players.forEach((p, i) => {
    const statVal = getStatVal(p.season, mapping);
    const oldImpact = statVal * mapping.adj;
    const newImpact = statVal * newAdj;
    const diff = newImpact - oldImpact;
    const diffClass = diff > 0.05 ? 'impact-positive' : diff < -0.05 ? 'impact-negative' : 'impact-neutral';
    const diffPrefix = diff > 0 ? '+' : '';
    const pprPts = p.season.fantasy_points_ppr || 0;
    const rowId = `pw-${playerState.pos}-${i}`;

    // Cumulative diff across all stat categories
    const { total: totalDiff, breakdown } = calcTotalDiff(p, playerState.pos);
    const tdClass = totalDiff > 0.05 ? 'impact-positive' : totalDiff < -0.05 ? 'impact-negative' : 'impact-neutral';
    const tdPrefix = totalDiff > 0 ? '+' : '';

    html += `<tr class="player-row" data-expand="${rowId}">
      <td>${i + 1}</td>
      <td><strong>${p.name}</strong></td>
      <td>${p.team}</td>
      <td>${fmt(pprPts, 1)}</td>
      <td>${fmt(statVal, statVal === Math.floor(statVal) ? 0 : 1)}</td>
      <td>${fmt(oldImpact, 1)}</td>
      <td>${fmt(newImpact, 1)}</td>
      <td class="diff-cell ${diffClass}">${diffPrefix}${fmt(diff, 1)}</td>
      <td class="diff-cell ${tdClass} td-hover-cell" data-breakdown-idx="${i}">${tdPrefix}${fmt(totalDiff, 1)}</td>
    </tr>`;

    // Store breakdown data for tooltip
    if (!window._breakdowns) window._breakdowns = {};
    window._breakdowns[`${playerState.pos}-${i}`] = breakdown;

    // Week-by-week rows (hidden by default)
    (p.weeks || []).forEach(w => {
      const wStat = getStatVal(w, mapping);
      const wOld = wStat * mapping.adj;
      const wNew = wStat * newAdj;
      const wDiff = wNew - wOld;
      const wClass = wDiff > 0.05 ? 'impact-positive' : wDiff < -0.05 ? 'impact-negative' : 'impact-neutral';
      const wPre = wDiff > 0 ? '+' : '';
      const wPpr = w.fantasy_points_ppr || 0;

      // Weekly cumulative diff
      const wTotal = calcWeekTotalDiff(w, playerState.pos);
      const wtClass = wTotal > 0.05 ? 'impact-positive' : wTotal < -0.05 ? 'impact-negative' : 'impact-neutral';
      const wtPre = wTotal > 0 ? '+' : '';

      html += `<tr class="week-row" data-parent="${rowId}">
        <td>Wk ${w.week}</td>
        <td colspan="2"></td>
        <td>${fmt(wPpr, 1)}</td>
        <td>${fmt(wStat, wStat === Math.floor(wStat) ? 0 : 1)}</td>
        <td>${fmt(wOld, 1)}</td>
        <td>${fmt(wNew, 1)}</td>
        <td class="${wClass}">${wPre}${fmt(wDiff, 1)}</td>
        <td class="${wtClass}">${wtPre}${fmt(wTotal, 1)}</td>
      </tr>`;
    });
  });

  tbody.innerHTML = html;

  // Click to expand/collapse weeks
  tbody.querySelectorAll('.player-row').forEach(row => {
    row.addEventListener('click', () => {
      const id = row.dataset.expand;
      const weekRows = tbody.querySelectorAll(`tr[data-parent="${id}"]`);
      const isOpen = weekRows[0]?.classList.contains('visible');
      weekRows.forEach(r => r.classList.toggle('visible', !isOpen));
    });
  });

  // Total Diff hover tooltip
  let tip = document.getElementById('td-tooltip');
  if (!tip) {
    tip = document.createElement('div');
    tip.id = 'td-tooltip';
    tip.className = 'td-tooltip';
    document.body.appendChild(tip);
  }

  function hideTip() {
    // Small delay so mouse can travel from cell to tooltip
    tip._hideTimer = setTimeout(() => { tip.classList.remove('visible'); }, 150);
  }
  function cancelHide() {
    clearTimeout(tip._hideTimer);
  }

  tip.addEventListener('mouseenter', cancelHide);
  tip.addEventListener('mouseleave', () => { tip.classList.remove('visible'); });

  tbody.querySelectorAll('.td-hover-cell').forEach(cell => {
    cell.addEventListener('mouseenter', (e) => {
      cancelHide();
      const idx = cell.dataset.breakdownIdx;
      const bd = window._breakdowns?.[`${playerState.pos}-${idx}`];
      if (!bd || !bd.length) return;

      function renderTipTable(data, sortBy) {
        const sorted = [...data].sort((a, b) =>
          sortBy === 'diff' ? Math.abs(b.diff) - Math.abs(a.diff) : Math.abs(b.normImpact) - Math.abs(a.normImpact)
        );
        const filtered = sortBy === 'diff' ? sorted.filter(b => Math.abs(b.diff) > 0.005) : sorted;
        return filtered.map(b => {
          const pre = b.diff > 0 ? '+' : '';
          const cls = b.diff > 0 ? 'impact-positive' : b.diff < 0 ? 'impact-negative' : '';
          return `<tr>
            <td>${b.cat}</td>
            <td style="text-align:right">${b.stat}</td>
            <td style="text-align:right">${fmt(b.normImpact, 1)}</td>
            <td style="text-align:right" class="${cls}">${pre}${fmt(b.diff, 1)}</td>
          </tr>`;
        }).join('');
      }

      tip.innerHTML = `
        <div class="tip-tabs">
          <button class="tip-tab active" data-sort="diff">Biggest Changes</button>
          <button class="tip-tab" data-sort="impact">Full Breakdown</button>
        </div>
        <table><thead><tr><th>Category</th><th>Stat</th><th>Norm Impact</th><th>Diff</th></tr></thead>
        <tbody class="tip-body">${renderTipTable(bd, 'diff')}</tbody></table>`;

      tip.querySelectorAll('.tip-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          tip.querySelectorAll('.tip-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          tip.querySelector('.tip-body').innerHTML = renderTipTable(bd, tab.dataset.sort);
        });
      });

      // Position near the cell, then stop following
      const rect = cell.getBoundingClientRect();
      tip.style.left = (rect.right + window.scrollX + 12) + 'px';
      tip.style.top = (rect.top + window.scrollY - 10) + 'px';
      tip.classList.add('visible');
    });

    cell.addEventListener('mouseleave', hideTip);
  });
}

// ============ GLOBAL UPDATE ============
function updateAll() {
  computed = recalculate();
  updateSandboxStats();
  renderTable();
  updateBubbleChart();
  updateBarChartData();
  updatePlayerCategoryOptions();
  renderPlayerTable();
}
