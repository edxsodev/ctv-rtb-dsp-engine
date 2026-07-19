/**
 * AD-NEXUS 3D CTV Tech Lab - Main Application & 3D Router Script
 */

let currentTab = "overview";
let rtbEngine = null;
let threeScene = null;
let selectedLogData = { reqJson: "// No log selected", respJson: "// No response" };
let currentInspectMode = "req";

// Pre-loaded realistic Indian Connected TV campaigns
let activeCampaigns = [
    {
        id: 101,
        name: "Tata Punch EV - Smart TV Campaign",
        publishers: ["Amagi ADS PLUS", "Samsung Ads India", "Disney+ Hotstar Exchange"],
        geo: "Pan-India",
        cpm: 750,
        budget: 1500000,
        spend: 34500,
        impressions: 46000,
        starts: 44200, q1: 42100, q2: 40500, q3: 39100, q4: 38200,
        status: "active",
        creativeUrl: "https://assets.mixkit.co/videos/preview/mixkit-car-driving-in-neon-city-43184-large.mp4",
        domain: "tatamotors.ev"
    },
    {
        id: 102,
        name: "JioCinema Sports HD",
        publishers: ["Samsung Ads India", "LG Channels India", "Xiaomi PatchWall"],
        geo: "Mumbai",
        cpm: 950,
        budget: 2500000,
        spend: 142500,
        impressions: 150000,
        starts: 146000, q1: 142000, q2: 139000, q3: 135000, q4: 132000,
        status: "active",
        creativeUrl: "https://assets.mixkit.co/videos/preview/mixkit-stadium-lights-in-the-dark-41558-large.mp4",
        domain: "jiocinema.com"
    },
    {
        id: 103,
        name: "Amul Taste of India",
        publishers: ["Amagi ADS PLUS", "Xiaomi PatchWall"],
        geo: "Delhi NCR",
        cpm: 550,
        budget: 500000,
        spend: 11000,
        impressions: 20000,
        starts: 19500, q1: 18800, q2: 18200, q3: 17700, q4: 17200,
        status: "active",
        creativeUrl: "https://assets.mixkit.co/videos/preview/mixkit-chef-cooking-food-in-a-kitchen-42797-large.mp4",
        domain: "amul.com"
    }
];

// Step Data for Interactive Bidding Explorer
const AUCTION_STEPS = {
    1: {
        title: "Step 1: Smart TV Ad Break Trigger",
        desc: "Jab customer Samsung ya LG TV par Amagi/JioCinema stream dekh raha hota hai, content break aate hi Smart TV OS ek OpenRTB bid request trigger karti hai.",
        techNote: "Protocol: HTTP/2 POST over TLS 1.3 | Latency Target: < 120ms",
        code: `{
  "event": "AD_BREAK_START",
  "device_os": "Samsung Tizen 6.5",
  "screen_resolution": "1920x1080",
  "app_name": "Amagi Food India",
  "channel_id": "ch-789"
}`
    },
    2: {
        title: "Step 2: OpenRTB 2.5 Request Generation",
        desc: "Supply Exchange (Amagi ADS PLUS ya Samsung Ads) user ke device, city, video player parameters, aur floor price (eCPM) ka JSON payload bhejti hai.",
        techNote: "Format: OpenRTB 2.5 Payload | Floor Price: ₹450 eCPM | Sec-Fetch: 1",
        code: `{
  "id": "br-in-9921",
  "imp": [{
    "id": "imp-1",
    "video": { "w": 1920, "h": 1080, "minduration": 5, "maxduration": 30, "protocols": [2, 3, 5] },
    "bidfloor": 450.00,
    "bidfloorcur": "INR"
  }],
  "device": { "make": "Samsung", "os": "Tizen", "geo": { "city": "Mumbai", "country": "IND" } }
}`
    },
    3: {
        title: "Step 3: DSP Engine Bidder Evaluation",
        desc: "Hamara RTB Bidder 30-40ms ke andar saare active campaigns ko target criteria (Geo, Budget, eCPM Floor) se match karta hai aur highest score wale campaign ki bid lagata hai.",
        techNote: "Algorithmic Score: Target eCPM (₹750) - Floor (₹450) = ₹300 Margin | Action: Place Bid ₹680",
        code: `// Bidder Logic Output
{
  "status": "BID_MATCHED",
  "selected_campaign": "Tata Punch EV - Smart TV Campaign",
  "floor_price": "₹450.00",
  "placed_bid_price": "₹680.00 eCPM",
  "decision_time_ms": 32
}`
    },
    4: {
        title: "Step 4: VAST 4.2 XML Response Construction",
        desc: "Engine 1080p MP4 Video link aur Tracking Beacons (Impression, 25%, 50%, 75%, 100%) wala VAST XML payload tayyar karke Exchange ko wapas bhejta hai.",
        techNote: "Payload: VAST 4.2 Linear XML | MediaFormat: video/mp4 (2500 kbps)",
        code: `<VAST version="4.2">
  <Ad id="101">
    <InLine>
      <AdSystem>WL-RTB-India-Engine</AdSystem>
      <Impression>https://rtb-dsp.in/track/imp?bid=101</Impression>
      <MediaFiles>
        <MediaFile delivery="progressive" type="video/mp4" width="1920" height="1080">
          https://assets.mixkit.co/videos/preview/mixkit-car-driving-in-neon-city-43184-large.mp4
        </MediaFile>
      </MediaFiles>
    </InLine>
  </Ad>
</VAST>`
    },
    5: {
        title: "Step 5: Smart TV Ad Render & Quartile Tracking",
        desc: "Smart TV player VAST XML ko parse karta hai, video play karta hai, aur har 25% progress par tracking pixel hit karta hai. Completion Rate (VCR) 85%+ hota hai!",
        techNote: "Playback State: Playing HD | Tracking Events: start -> q1 -> q2 -> q3 -> complete",
        code: `{
  "vast_events": [
    { "event": "start", "time": "00:00:00", "status": "200 OK" },
    { "event": "firstQuartile", "time": "00:00:03.75", "status": "200 OK" },
    { "event": "midpoint", "time": "00:00:07.50", "status": "200 OK" },
    { "event": "complete", "time": "00:00:15.00", "status": "200 OK" }
  ]
}`
    }
};

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    // 1. Setup Three.js 3D Scene
    if (typeof THREE !== "undefined") {
        threeScene = new CTV3DScene("threejs-canvas-container");
    }

    // 2. Setup RTB Bidding Engine
    rtbEngine = new CTBRTBSimulator();
    rtbEngine.setCampaigns(activeCampaigns);

    rtbEngine.onLog((log) => {
        handleNewLogEntry(log);
        if (log.type === "win" && threeScene) {
            threeScene.triggerWinFlash();
        }
    });

    rtbEngine.onStatsUpdate(handleStatsUpdate);

    renderCampaignsTable();
    populateVendorTable();
    updateROICalculations();
    showAuctionStep(1);

    rtbEngine.start(1200);
});

// SPA Tab Router
function switchTab(tabId) {
    currentTab = tabId;
    
    document.querySelectorAll(".nav-item").forEach(el => el.classList.remove("active"));
    const activeNavBtn = document.getElementById(`tab-${tabId}`);
    if (activeNavBtn) activeNavBtn.classList.add("active");

    document.querySelectorAll(".tab-pane").forEach(el => el.classList.remove("active"));
    const activePane = document.getElementById(`pane-${tabId}`);
    if (activePane) activePane.classList.add("active");

    const titleHeading = document.getElementById("page-title-heading");
    const titleDesc = document.getElementById("page-subtitle-desc");

    switch(tabId) {
        case "overview":
            titleHeading.textContent = "3D Interactive Connected TV (CTV) Tech Lab";
            titleDesc.textContent = "Visualizing real-time video ad auctions between Smart TVs (Samsung, LG, Sony) and ad exchanges (Amagi, Samsung Ads).";
            break;
        case "stepbystep":
            titleHeading.textContent = "Step-by-Step Interactive Bidding Explorer";
            titleDesc.textContent = "Click through each stage of a 100ms Connected TV OpenRTB 2.5 auction.";
            showAuctionStep(1);
            break;
        case "simulator":
            titleHeading.textContent = "Live OpenRTB Terminal & Inspector";
            titleDesc.textContent = "Real-time stream of incoming bid requests and VAST response payload Inspector.";
            break;
        case "campaigns":
            titleHeading.textContent = "DSP Campaign Manager";
            titleDesc.textContent = "Manage active advertisers, target eCPMs (₹), and target Smart TV supply channels.";
            renderCampaignsTable();
            break;
        case "analytics":
            titleHeading.textContent = "VAST Performance & Quartile Analytics";
            titleDesc.textContent = "Real-time metrics on video completion rates (VCR), win rates, and Smart TV OS share.";
            break;
        case "calculator":
            titleHeading.textContent = "White-Label Licensing Models & Infrastructure";
            titleDesc.textContent = "Compare flat subscription licensing vs commission-based DSP rev-share.";
            updateROICalculations();
            break;
    }
}

function showAuctionStep(stepNum) {
    const data = AUCTION_STEPS[stepNum];
    if (!data) return;

    document.querySelectorAll(".step-nav-btn").forEach(btn => btn.classList.remove("active"));
    const activeBtn = document.getElementById(`step-btn-${stepNum}`);
    if (activeBtn) activeBtn.classList.add("active");

    const detailContainer = document.getElementById("step-detail-content");
    if (!detailContainer) return;

    detailContainer.innerHTML = `
        <div class="step-content-grid">
            <div class="step-desc-panel">
                <h3>${data.title}</h3>
                <p>${data.desc}</p>
                <div class="tech-tag" style="font-size: 0.8rem; padding: 6px 12px; margin-top: 10px;">
                    ⚙️ ${data.techNote}
                </div>
            </div>
            <div class="step-payload-panel">
                <pre><code>${data.code}</code></pre>
            </div>
        </div>
    `;
}

function highlight3DConcept(concept) {
    if (concept === 'tv') {
        alert("📺 Smart TV Node: Tizen/webOS TV app triggers OpenRTB 2.5 JSON request over HTTP/2.");
    } else if (concept === 'exchange') {
        alert("📡 Supply Exchange Node: Amagi ADS PLUS / Samsung Ads routes request within 120ms latency window.");
    } else if (concept === 'server') {
        alert("⚡ RTB Engine Tower: Match engine evaluates active campaigns, checks bid floor & returns VAST 4.2 video XML.");
    }
}

function toggleEngine() {
    const btn = document.getElementById("btn-toggle-engine");
    if (rtbEngine.isRunning) {
        rtbEngine.stop();
        btn.querySelector(".btn-icon").textContent = "▶️";
        btn.querySelector(".btn-text").textContent = "Resume Live Engine";
        document.querySelector(".status-dot").classList.remove("pulsing");
        document.querySelector(".status-text").textContent = "Engine Suspended";
    } else {
        rtbEngine.start(1200);
        btn.querySelector(".btn-icon").textContent = "⏸️";
        btn.querySelector(".btn-text").textContent = "Pause Live Engine";
        document.querySelector(".status-dot").classList.add("pulsing");
        document.querySelector(".status-text").textContent = "RTB Bidder Active (100ms)";
    }
}

function formatINR(val) {
    if (val >= 10000000) {
        return `₹${(val / 10000000).toFixed(2)} Cr`;
    } else if (val >= 100000) {
        return `₹${(val / 100000).toFixed(2)} Lakhs`;
    } else {
        return `₹${val.toLocaleString('en-IN')}`;
    }
}

function renderCampaignsTable() {
    const tbody = document.querySelector("#campaigns-table tbody");
    if (!tbody) return;

    let totalBudget = 0, totalSpend = 0, totalImpressions = 0, activeCount = 0;

    tbody.innerHTML = activeCampaigns.map(camp => {
        totalBudget += camp.budget;
        totalSpend += camp.spend;
        totalImpressions += (camp.impressions || 0);
        if (camp.status === "active") activeCount++;

        const vcr = camp.starts > 0 ? ((camp.q4 / camp.starts) * 100).toFixed(1) : "0.0";

        return `
            <tr>
                <td><strong>${camp.name}</strong></td>
                <td>${camp.publishers.map(p => `<span class="badge badge-cpm">${p}</span>`).join(" ")}</td>
                <td>${camp.geo}</td>
                <td><strong>₹${camp.cpm.toLocaleString('en-IN')}</strong> eCPM</td>
                <td>${formatINR(camp.budget)}</td>
                <td>₹${camp.spend.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td>${(camp.impressions || 0).toLocaleString('en-IN')}</td>
                <td><strong>${vcr}%</strong> (${(camp.q4 || 0).toLocaleString('en-IN')} complete)</td>
                <td>
                    <span class="badge ${camp.status === 'active' ? 'badge-active' : 'badge-paused'}">
                        ${camp.status.toUpperCase()}
                    </span>
                </td>
                <td>
                    <button class="act-btn" title="Toggle Pause" onclick="toggleCampaignStatus(${camp.id})">
                        ${camp.status === 'active' ? '⏸️' : '▶️'}
                    </button>
                    <button class="act-btn" title="Delete" onclick="deleteCampaign(${camp.id})">🗑️</button>
                </td>
            </tr>
        `;
    }).join("");

    document.getElementById("summary-active-count").textContent = activeCount;
    document.getElementById("summary-total-budget").textContent = formatINR(totalBudget);
    document.getElementById("summary-total-spend").textContent = `₹${totalSpend.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById("summary-total-impressions").textContent = totalImpressions.toLocaleString('en-IN');
}

function toggleCampaignStatus(id) {
    const camp = activeCampaigns.find(c => c.id === id);
    if (camp) {
        camp.status = camp.status === "active" ? "paused" : "active";
        rtbEngine.setCampaigns(activeCampaigns);
        renderCampaignsTable();
    }
}

function deleteCampaign(id) {
    activeCampaigns = activeCampaigns.filter(c => c.id !== id);
    rtbEngine.setCampaigns(activeCampaigns);
    renderCampaignsTable();
}

function openCampaignModal() {
    document.getElementById("campaign-modal").classList.add("active");
}

function closeCampaignModal() {
    document.getElementById("campaign-modal").classList.remove("active");
}

function handleCampaignSubmit(e) {
    e.preventDefault();
    const name = document.getElementById("camp-name").value;
    const budget = parseFloat(document.getElementById("camp-budget").value);
    const cpm = parseFloat(document.getElementById("camp-cpm").value);
    const geo = document.getElementById("camp-geo").value;
    const creativeUrl = document.getElementById("camp-creative-url").value;

    const checkedPubs = Array.from(document.querySelectorAll('input[name="camp-publishers"]:checked'))
                             .map(el => el.value);

    const newCamp = {
        id: Date.now(),
        name,
        publishers: checkedPubs.length > 0 ? checkedPubs : ["Amagi ADS PLUS", "Samsung Ads India"],
        geo, cpm, budget, spend: 0, impressions: 0, starts: 0,
        q1: 0, q2: 0, q3: 0, q4: 0, status: "active", creativeUrl, domain: "advertiser.in"
    };

    activeCampaigns.push(newCamp);
    rtbEngine.setCampaigns(activeCampaigns);
    renderCampaignsTable();
    closeCampaignModal();
    e.target.reset();
}

function handleNewLogEntry(log) {
    const consoleFeed = document.getElementById("log-console");
    if (!consoleFeed) return;

    const logDiv = document.createElement("div");
    logDiv.className = `log-item type-${log.type}`;
    logDiv.innerHTML = `
        <div class="log-header">
            <span>[${log.timestamp}] [${log.type.toUpperCase()}]</span>
        </div>
        <div class="log-msg">${log.message}</div>
    `;

    logDiv.onclick = () => {
        document.querySelectorAll(".log-item").forEach(el => el.classList.remove("selected-log"));
        logDiv.classList.add("selected-log");

        if (log.details) {
            selectedLogData = {
                reqJson: log.details.reqJson || "// Request payload is step par available nahi hai",
                respJson: log.details.respJson || "// Response payload (VAST XML) available nahi hai"
            };
        } else {
            selectedLogData = {
                reqJson: `// System message: ${log.message}`,
                respJson: `// Log type: ${log.type}`
            };
        }
        updateInspectorView();
    };

    consoleFeed.appendChild(logDiv);
    if (consoleFeed.children.length > 50) consoleFeed.removeChild(consoleFeed.firstChild);
    consoleFeed.scrollTop = consoleFeed.scrollHeight;
}

function clearLogs() {
    const consoleFeed = document.getElementById("log-console");
    if (consoleFeed) consoleFeed.innerHTML = "";
}

function switchInspectTab(mode) {
    currentInspectMode = mode;
    document.getElementById("inspect-tab-req").classList.toggle("active", mode === "req");
    document.getElementById("inspect-tab-resp").classList.toggle("active", mode === "resp");
    updateInspectorView();
}

function updateInspectorView() {
    const contentCode = document.getElementById("json-inspector-content");
    if (!contentCode) return;

    if (currentInspectMode === "req") {
        contentCode.textContent = selectedLogData.reqJson;
    } else {
        contentCode.textContent = selectedLogData.respJson;
    }
}

function handleStatsUpdate(stats) {
    const evalBidsEl = document.getElementById("analytic-eval-bids");
    const placedBidsEl = document.getElementById("analytic-placed-bids");
    const wonBidsEl = document.getElementById("analytic-won-bids");
    const winRateEl = document.getElementById("analytic-win-rate");

    if (evalBidsEl) evalBidsEl.textContent = stats.totalRequests.toLocaleString('en-IN');
    if (placedBidsEl) placedBidsEl.textContent = stats.bidsPlaced.toLocaleString('en-IN');
    if (wonBidsEl) wonBidsEl.textContent = stats.bidsWon.toLocaleString('en-IN');
    
    const winRate = stats.bidsPlaced > 0 ? ((stats.bidsWon / stats.bidsPlaced) * 100).toFixed(1) : "0.0";
    if (winRateEl) winRateEl.textContent = `${winRate}%`;

    const totalStarts = stats.vastStarts || 1;
    updateFunnelStage("start", stats.vastStarts, 100);
    updateFunnelStage("q1", stats.vast25, (stats.vast25 / totalStarts) * 100);
    updateFunnelStage("q2", stats.vast50, (stats.vast50 / totalStarts) * 100);
    updateFunnelStage("q3", stats.vast75, (stats.vast75 / totalStarts) * 100);
    updateFunnelStage("q4", stats.vast100, (stats.vast100 / totalStarts) * 100);

    renderPublisherPieChart(stats.byPublisher);
    renderDeviceBarChart(stats.byDevice);
    renderAccessibleSummaryTable(stats);

    if (currentTab === "campaigns") renderCampaignsTable();
}

function updateFunnelStage(stageId, count, percent) {
    const bar = document.getElementById(`funnel-${stageId}-bar`);
    const val = document.getElementById(`funnel-${stageId}-val`);
    const pFixed = percent.toFixed(1);
    if (bar) bar.style.width = `${pFixed}%`;
    if (val) val.textContent = `${(count || 0).toLocaleString('en-IN')} (${pFixed}%)`;
}

function renderPublisherPieChart(byPublisher) {
    const svg = document.getElementById("publisher-pie-chart");
    const legend = document.getElementById("publisher-chart-legend");
    if (!svg || !legend) return;

    const colors = ["#2563eb", "#06b6d4", "#7c3aed", "#10b981", "#d97706"];
    const pubs = Object.keys(byPublisher);
    let totalReqs = 0;
    pubs.forEach(p => totalReqs += byPublisher[p].requests);

    if (totalReqs === 0) {
        svg.innerHTML = `<circle cx="100" cy="100" r="70" fill="#f1f5f9" />`;
        legend.innerHTML = `<div class="legend-item"><span class="legend-color-label">Awaiting live TV requests...</span></div>`;
        return;
    }

    let startAngle = 0;
    let svgPaths = "";
    let legendHtml = "";

    pubs.forEach((pub, idx) => {
        const count = byPublisher[pub].requests;
        const portion = count / totalReqs;
        const angle = portion * 360;
        const color = colors[idx % colors.length];

        const x1 = 100 + 70 * Math.cos(Math.PI * startAngle / 180);
        const y1 = 100 + 70 * Math.sin(Math.PI * startAngle / 180);
        const endAngle = startAngle + angle;
        const x2 = 100 + 70 * Math.cos(Math.PI * endAngle / 180);
        const y2 = 100 + 70 * Math.sin(Math.PI * endAngle / 180);
        const largeArc = angle > 180 ? 1 : 0;

        if (portion > 0) {
            svgPaths += `<path d="M 100 100 L ${x1} ${y1} A 70 70 0 ${largeArc} 1 ${x2} ${y2} Z" fill="${color}" opacity="0.9" />`;
        }

        legendHtml += `
            <div class="legend-item">
                <span class="legend-color-label">
                    <span class="color-box" style="background-color: ${color};"></span>
                    ${pub}
                </span>
                <span class="legend-value">${count.toLocaleString('en-IN')} (${(portion * 100).toFixed(0)}%)</span>
            </div>
        `;
        startAngle = endAngle;
    });

    svg.innerHTML = svgPaths;
    legend.innerHTML = legendHtml;
}

function renderDeviceBarChart(byDevice) {
    const container = document.getElementById("device-os-chart");
    if (!container) return;

    const devices = Object.keys(byDevice);
    let maxVal = 1;
    devices.forEach(d => { if (byDevice[d] > maxVal) maxVal = byDevice[d]; });

    container.innerHTML = devices.map(dev => {
        const val = byDevice[dev];
        const pct = (val / maxVal) * 100;
        return `
            <div class="chart-bar-row">
                <span class="bar-label">${dev}</span>
                <div class="bar-track">
                    <div class="bar-fill" style="width: ${pct}%;"></div>
                </div>
                <span class="bar-value">${val.toLocaleString('en-IN')}</span>
            </div>
        `;
    }).join("");
}

function renderAccessibleSummaryTable(stats) {
    const tbody = document.querySelector("#accessible-data-summary tbody");
    if (!tbody) return;
    const pubs = Object.keys(stats.byPublisher);
    tbody.innerHTML = pubs.map(p => {
        const data = stats.byPublisher[p];
        return `
            <tr>
                <td>${p}</td>
                <td>${data.requests}</td>
                <td>${data.bids}</td>
                <td>${data.wins}</td>
                <td>₹${data.spend.toFixed(2)}</td>
            </tr>
        `;
    }).join("");
}

function populateVendorTable() {
    const tbody = document.getElementById("vendor-comparison-body");
    if (!tbody) return;
    tbody.innerHTML = VENDOR_PRICING.map(v => `
        <tr>
            <td>
                <strong>${v.name}</strong>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">${v.tagline}</div>
            </td>
            <td><span class="badge badge-active">${v.setupTime}</span></td>
            <td>
                <strong>${formatINR(v.monthlyFeeINR)}/mo</strong> 
                ${v.revSharePercent > 0 ? `+ ${v.revSharePercent}% rev-share` : '(0% rev-share)'}
            </td>
            <td>${v.bestFor}</td>
            <td>
                <ul style="padding-left: 14px; font-size: 0.78rem; color: var(--text-secondary);">
                    ${v.features.map(f => `<li>${f}</li>`).join("")}
                </ul>
            </td>
        </tr>
    `).join("");
}

function updateROICalculations() {
    const slider = document.getElementById("slider-media-spend");
    const qpsSelect = document.getElementById("select-qps-tier");
    if (!slider || !qpsSelect) return;

    const spendINR = parseFloat(slider.value);
    const qps = parseInt(qpsSelect.value);

    document.getElementById("val-media-spend").textContent = formatINR(spendINR);
    document.getElementById("val-qps-tier").textContent = `${qps.toLocaleString('en-IN')} QPS`;

    const result = calculateROI(spendINR, qps);

    const maxVal = Math.max(result.revShareCost, result.totalSubscriptionCost);
    const revBarPct = (result.revShareCost / maxVal) * 100;
    const subBarPct = (result.totalSubscriptionCost / maxVal) * 100;

    document.getElementById("roi-revshare-bar").style.width = `${revBarPct}%`;
    document.getElementById("roi-subscription-bar").style.width = `${subBarPct}%`;

    document.getElementById("roi-revshare-val").textContent = `${formatINR(result.revShareCost)}/mo (${result.revShareRatePercent}% rev-share)`;
    document.getElementById("roi-subscription-val").textContent = `${formatINR(result.totalSubscriptionCost)}/mo (${formatINR(result.subscriptionBaseFee)} base + ${formatINR(result.infraCost)} cloud)`;

    const alertBox = document.getElementById("roi-summary-alert-box");
    if (result.isSubscriptionBetter) {
        document.getElementById("roi-savings-amount").textContent = `${formatINR(result.netMonthlySavings)} Saved / month`;
        document.getElementById("roi-savings-percent").textContent = `🎉 White-label subscription caps tech costs at high volumes (${result.savingsPercentage}% savings).`;
    } else {
        document.getElementById("roi-savings-amount").textContent = `Flat Fee Break-Even Threshold`;
        document.getElementById("roi-savings-percent").textContent = `💡 At low spend (< ₹25 Lakhs/mo), commission fees are close to flat base fees.`;
    }
}
