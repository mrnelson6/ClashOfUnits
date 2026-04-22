/* ==========================================================
   SRM Adjustment Equalizer - Interactive Application
   ========================================================== */

// ============ STATE ============
const state = {
  normMode: 'median',
  customTarget: 283,
  capMax: 500,
  capMin: 0.001,
  roundTo: 0,
  sortCol: 'impact',
  sortDir: 'desc',
  sectionFilter: 'All',
  search: '',
  showNormalized: false,
};

// ============ MATT'S BUCKETS ============
const MATT_BUCKETS = [
  { min: 0,     max: 1.3,      factor: 300,  color: '#ef4444', label: 'Ultra-rare' },
  { min: 1.3,   max: 12,       factor: 50,   color: '#f97316', label: 'Very rare' },
  { min: 12,    max: 125,      factor: 10,   color: '#f59e0b', label: 'Rare' },
  { min: 125,   max: 400,      factor: 5,    color: '#84cc16', label: 'Uncommon' },
  { min: 400,   max: 1100,     factor: 3,    color: '#22c55e', label: 'Common' },
  { min: 1100,  max: 2700,     factor: 2,    color: '#06b6d4', label: 'Very common' },
  { min: 2700,  max: Infinity, factor: 1,    color: '#3b82f6', label: 'Abundant' },
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
  const valid = cats.filter(c => c.freqPerSeason && c.freqPerSeason > 0);

  // Compute raw impact
  valid.forEach(c => { c.impact = c.freqPerSeason * c.adjustment; });

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
      c.factor = target / c.impact;

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

  updateSandboxStats();
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
  const grid = document.getElementById('bucket-grid');
  if (!grid) return;

  grid.innerHTML = MATT_BUCKETS.map(b => {
    const count = SRM_DATA.categories.filter(c =>
      c.impact && c.impact >= b.min && c.impact < b.max
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

  document.getElementById('enable-matt').addEventListener('click', () => {
    state.normMode = 'matt';
    document.getElementById('norm-mode-select').value = 'matt';
    applyModeUI();
    updateAll();
    document.getElementById('fix').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

// ============ GLOBAL UPDATE ============
function updateAll() {
  computed = recalculate();
  updateSandboxStats();
  renderTable();
  updateBubbleChart();
  updateBarChartData();
}
