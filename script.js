/* =========================================================
   BLUEGRID AI
   MAIN JAVASCRIPT
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const API_URL = "https://bluegrid-ai.onrender.com";


/* =========================================================
   ISLAND DATA
========================================================= */

const islandData = {

    Agatti: {
        name: "Agatti",
        demand: 0.7,
        solarCF: 0.20,
        windCF: 0.35,
        otecCF: 0.80,
        lat: 10.8569,
        lon: 72.1958,
        image:
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80"
    },

    Kavaratti: {
        name: "Kavaratti",
        demand: 1.2,
        solarCF: 0.20,
        windCF: 0.35,
        otecCF: 0.80,
        lat: 10.5669,
        lon: 72.6420,
        image:
            "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=900&q=80"
    },

    Lakshadweep: {
        name: "Lakshadweep",
        demand: 1.0,
        solarCF: 0.20,
        windCF: 0.35,
        otecCF: 0.80,
        lat: 10.8505,
        lon: 72.7555,
        image:
            "https://images.unsplash.com/photo-1540202404-a2f29016b523?auto=format&fit=crop&w=900&q=80"
    },

    Minicoy: {
        name: "Minicoy",
        demand: 0.8,
        solarCF: 0.20,
        windCF: 0.35,
        otecCF: 0.80,
        lat: 8.2959,
        lon: 73.0485,
        image:
            "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=900&q=80"
    }

};


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let selectedIsland = islandData.Agatti;

let lastOptimizationResult = null;

let map = null;

let mapMarkers = {};

let generationChart = null;

let mixChart = null;


/* =========================================================
   DOM HELPER
========================================================= */

function $(id) {

    return document.getElementById(id);

}


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeDashboard();

});


async function initializeDashboard() {

    createIslandCards();

    createIslandSelector();

    initializeMap();

    selectIsland("Agatti");

    initializeButtons();

    updateTime();

    setInterval(updateTime, 1000);

    await checkBackend();

}


/* =========================================================
   BACKEND CHECK
========================================================= */

async function checkBackend() {

    const statusText = $("backendStatusText");

    try {

        const response =
            await fetch(`${API_URL}/api/health`, {
                method: "GET"
            });

        if (!response.ok) {
            throw new Error("Backend unavailable");
        }

        const data = await response.json();

        if (statusText) {

            statusText.textContent =
                data.status === "online"
                    ? "Backend Connected"
                    : "Backend Connected";

        }

    } catch (error) {

        if (statusText) {

            statusText.textContent =
                "Demo Mode";

        }

        console.log(
            "Backend not running. Demo calculation will be used."
        );

    }

}


/* =========================================================
   ISLAND CARDS
========================================================= */

function createIslandCards() {

    const grid = $("islandGrid");

    if (!grid) return;

    grid.innerHTML = "";

    Object.values(islandData).forEach(island => {

        const card =
            document.createElement("div");

        card.className = "island-card";

        card.dataset.name = island.name;

        card.innerHTML = `

            <img
                class="island-image"
                src="${island.image}"
                alt="${island.name}"
                onerror="this.style.display='none'"
            >

            <h3>${island.name}</h3>

            <div class="island-info">

                <span>
                    <b>⚡</b>
                    <span>
                        Peak Demand:
                        <b>${island.demand.toFixed(1)} MW</b>
                    </span>
                </span>

                <span>
                    ☀️ Solar CF
                    <b>${island.solarCF * 100}%</b>
                </span>

                <span>
                    ≋ Wind CF
                    <b>${island.windCF * 100}%</b>
                </span>

                <span>
                    🌊 OTEC CF
                    <b>${island.otecCF * 100}%</b>
                </span>

            </div>

            <button
                class="select-island"
                data-island="${island.name}"
            >
                Select Island
            </button>

        `;

        card.addEventListener(
            "click",
            () => selectIsland(island.name)
        );

        grid.appendChild(card);

    });

}


/* =========================================================
   ISLAND SELECTOR
========================================================= */

function createIslandSelector() {

    const selector = $("islandSelector");

    if (!selector) return;

    selector.innerHTML = "";

    Object.values(islandData).forEach(island => {

        const option =
            document.createElement("option");

        option.value = island.name;

        option.textContent = island.name;

        selector.appendChild(option);

    });

    selector.addEventListener("change", event => {

        selectIsland(event.target.value);

    });

}


/* =========================================================
   SELECT ISLAND
========================================================= */

function selectIsland(name) {

    if (!islandData[name]) return;

    selectedIsland = islandData[name];

    highlightSelectedIsland(name);

    updateMonitoring();

    updateAI();

    updateMap(name);

    updateDashboardValues();

}


/* =========================================================
   HIGHLIGHT CARD
========================================================= */

function highlightSelectedIsland(name) {

    document
        .querySelectorAll(".island-card")
        .forEach(card => {

            card.classList.toggle(
                "selected",
                card.dataset.name === name
            );

        });


    const selector = $("islandSelector");

    if (selector) {

        selector.value = name;

    }

}


/* =========================================================
   SEARCH
========================================================= */

const searchInput = $("islandSearch");

if (searchInput) {

    searchInput.addEventListener(
        "input",
        filterIslands
    );

}


function filterIslands() {

    const query =
        $("islandSearch").value
            .trim()
            .toLowerCase();

    let found = false;

    document
        .querySelectorAll(".island-card")
        .forEach(card => {

            const name =
                card.dataset.name.toLowerCase();

            const visible =
                name.includes(query);

            card.style.display =
                visible ? "" : "none";

            if (visible) {
                found = true;
            }

        });


    const noResults =
        $("noIslandResults");

    if (noResults) {

        noResults.style.display =
            found ? "none" : "block";

    }

}


const clearSearch = $("clearSearch");

if (clearSearch) {

    clearSearch.addEventListener(
        "click",
        () => {

            $("islandSearch").value = "";

            filterIslands();

        }
    );

}


/* =========================================================
   MONITORING
========================================================= */

function updateMonitoring() {

    const island = selectedIsland;

    const renewablePotential =
        (
            island.solarCF * 0.30 +
            island.windCF * 0.25 +
            island.otecCF * 0.45
        ) * 100;


    setText(
        "liveDemand",
        `${island.demand.toFixed(2)} MW`
    );

    setText(
        "liveSolar",
        `${(island.solarCF * 100).toFixed(1)}%`
    );

    setText(
        "liveWind",
        `${(island.windCF * 100).toFixed(1)}%`
    );

    setText(
        "liveOtec",
        `${(island.otecCF * 100).toFixed(1)}%`
    );

    setText(
        "liveRenewable",
        `${renewablePotential.toFixed(1)}%`
    );


    const ring =
        document.querySelector(".ring");

    if (ring) {

        ring.style.background =
            `conic-gradient(
                #00f5b4 0 ${renewablePotential}%,
                #084e70 ${renewablePotential}% 100%
            )`;

    }

}


/* =========================================================
   AI INTELLIGENCE
========================================================= */

function updateAI() {

    const island = selectedIsland;

    const potential =
        (
            island.solarCF * 0.30 +
            island.windCF * 0.25 +
            island.otecCF * 0.45
        ) * 100;


    setText(
        "renewablePotential",
        `${potential.toFixed(1)}%`
    );


    setText(
        "storagePotential",
        "4.0 h"
    );


    let badge =
        "MODERATE POTENTIAL";

    let recommendation =
        "Moderate renewable potential detected. BlueGrid will balance Solar, Wind and OTEC with storage.";


    if (potential >= 60) {

        badge = "HIGH POTENTIAL";

        recommendation =
            "Strong renewable characteristics detected. A hybrid renewable system should be evaluated.";

    }


    if ($("aiPotentialBadge")) {

        $("aiPotentialBadge").textContent =
            badge;

    }


    setText(
        "automaticRecommendation",
        recommendation
    );


    setText(
        "automaticAnalysisText",
        `Demand is estimated at ${island.demand.toFixed(1)} MW. Solar ${(island.solarCF * 100).toFixed(0)}%, Wind ${(island.windCF * 100).toFixed(0)}%, OTEC ${(island.otecCF * 100).toFixed(0)}%.`
    );

}


/* =========================================================
   MAP
========================================================= */

function initializeMap() {

    const mapElement = $("map");

    if (!mapElement) return;

    map =
        L.map("map", {
            zoomControl: true
        })
        .setView(
            [10.2, 72.6],
            6
        );


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution:
                "&copy; OpenStreetMap contributors",

            maxZoom: 18
        }
    ).addTo(map);


    Object.values(islandData)
        .forEach(island => {

            const marker =
                L.marker([
                    island.lat,
                    island.lon
                ]).addTo(map);


            marker.bindPopup(`
                <div style="
                    min-width:140px;
                    color:#09243d;
                ">
                    <strong>${island.name}</strong>
                    <br>
                    Demand:
                    ${island.demand.toFixed(1)} MW
                    <br>
                    Solar:
                    ${island.solarCF * 100}%
                    <br>
                    Wind:
                    ${island.windCF * 100}%
                    <br>
                    OTEC:
                    ${island.otecCF * 100}%
                </div>
            `);


            marker.on(
                "click",
                () => {

                    selectIsland(
                        island.name
                    );

                }
            );


            mapMarkers[island.name] =
                marker;

        });

}


function updateMap(name) {

    if (!map) return;

    const island = islandData[name];

    map.flyTo(
        [island.lat, island.lon],
        8,
        {
            duration: 1.2
        }
    );


    const marker =
        mapMarkers[name];

    if (marker) {

        marker.openPopup();

    }

}


/* =========================================================
   OPTIMIZATION
========================================================= */

const optimizeButton =
    $("optimizeBtn");

if (optimizeButton) {

    optimizeButton.addEventListener(
        "click",
        runOptimization
    );

}


async function runOptimization() {

    const island = selectedIsland;

    setText(
        "resultStatus",
        "Calculating..."
    );


    if (optimizeButton) {

        optimizeButton.disabled = true;

        optimizeButton.textContent =
            "⚡ Calculating...";

    }


    setText(
        "optimizerEngineStatus",
        "AI Engine calculating..."
    );


    try {

        let result;


        try {

            const response =
                await fetch(
                    `${API_URL}/api/optimize`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            demand_mw:
                                island.demand,

                            solar_max_kw:
                                1500,

                            wind_max_kw:
                                1500,

                            otec_max_kw:
                                1500,

                            battery_max_kwh:
                                5000

                        })

                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Backend request failed"
                );

            }


            const data =
                await response.json();


            result =
                data.result || data;

        } catch (backendError) {

            console.log(
                "Using local demo optimizer."
            );

            result =
                localOptimizer(island);

        }


        lastOptimizationResult =
            result;


        displayOptimizationResult(
            result
        );


        generateCharts(
            result
        );


        generateReport(
            result
        );


        document
            .getElementById("results")
            ?.scrollIntoView({
                behavior: "smooth"
            });


    } catch (error) {

        console.error(
            "Optimization error:",
            error
        );

        alert(
            "Unable to complete optimization."
        );

    } finally {

        if (optimizeButton) {

            optimizeButton.disabled = false;

            optimizeButton.textContent =
                "⚡ Optimize Energy Mix";

        }

    }

}


/* =========================================================
   LOCAL OPTIMIZER
========================================================= */

function localOptimizer(island) {

    const demandKW =
        island.demand * 1000;


    const solarKW =
        Math.min(
            demandKW * 0.30,
            1500
        );


    const windKW =
        Math.min(
            demandKW * 0.25,
            1500
        );


    const otecKW =
        Math.min(
            demandKW * 0.45,
            1500
        );


    const batteryKWh =
        Math.min(
            demandKW * 4,
            5000
        );


    const annualDemand =
        demandKW * 8760;


    const renewableMWh =
        (
            solarKW * island.solarCF +
            windKW * island.windCF +
            otecKW * island.otecCF
        ) * 8760 / 1000;


    const renewablePct =
        Math.min(
            100,
            renewableMWh /
            annualDemand *
            100
        );


    const reliability =
        Math.min(
            99.5,
            90 + renewablePct * 0.095
        );


    const reserveHours =
        batteryKWh /
        demandKW;


    const lcoe =
        Math.max(
            3.5,
            7.5 -
            renewablePct * 0.025
        );


    const score =
        Math.min(
            100,
            renewablePct * .45 +
            reliability * .40 +
            Math.min(
                reserveHours / 8 * 100,
                100
            ) * .15
        );


    const totalCapacity =
        solarKW +
        windKW +
        otecKW;


    return {

        solar_kw:
            Math.round(solarKW),

        wind_kw:
            Math.round(windKW),

        otec_kw:
            Math.round(otecKW),

        battery_kwh:
            Math.round(batteryKWh),

        renewable_mwh:
            Math.round(renewableMWh),

        renewable_pct:
            Number(
                renewablePct.toFixed(1)
            ),

        reliability:
            Number(
                reliability.toFixed(1)
            ),

        reserve_hours:
            Number(
                reserveHours.toFixed(1)
            ),

        lcoe:
            Number(
                lcoe.toFixed(2)
            ),

        score:
            Math.round(score),

        solar_share:
            totalCapacity
                ? solarKW / totalCapacity * 100
                : 0,

        wind_share:
            totalCapacity
                ? windKW / totalCapacity * 100
                : 0,

        otec_share:
            totalCapacity
                ? otecKW / totalCapacity * 100
                : 0,

        active_sources:
            3,

        recommendation:
            "BlueGrid recommends a balanced hybrid system using Solar, Wind and OTEC with battery storage to improve renewable contribution and system resilience.",

        engine:
            "BlueGrid AI Local Optimization Engine"

    };

}


/* =========================================================
   DISPLAY RESULT
========================================================= */

function displayOptimizationResult(result) {

    const solar =
        Number(result.solar_kw || 0);

    const wind =
        Number(result.wind_kw || 0);

    const otec =
        Number(result.otec_kw || 0);

    const battery =
        Number(result.battery_kwh || 0);

    const renewable =
        Number(result.renewable_pct || 0);

    const reliability =
        Number(result.reliability || 0);

    const reserve =
        Number(result.reserve_hours || 0);

    const lcoe =
        Number(result.lcoe || 0);

    const score =
        Number(result.score || 0);


    setText(
        "solarResult",
        `${solar} kW`
    );

    setText(
        "windResult",
        `${wind} kW`
    );

    setText(
        "otecResult",
        `${otec} kW`
    );

    setText(
        "batteryResult",
        `${battery} kWh`
    );


    setText(
        "renewablePercent",
        `${renewable}%`
    );

    setText(
        "reliabilityResult",
        `${reliability}%`
    );

    setText(
        "reserveResult",
        `${reserve} h`
    );

    setText(
        "lcoeResult",
        `₹${lcoe}`
    );

    setText(
        "scoreResult",
        score
    );


    setText(
        "solarResultLarge",
        `${solar} kW`
    );

    setText(
        "windResultLarge",
        `${wind} kW`
    );

    setText(
        "otecResultLarge",
        `${otec} kW`
    );

    setText(
        "batteryResultLarge",
        `${battery} kWh`
    );

    setText(
        "renewablePercentLarge",
        `${renewable}%`
    );

    setText(
        "reliabilityLarge",
        `${reliability}%`
    );

    setText(
        "reserveLarge",
        `${reserve} h`
    );

    setText(
        "lcoeLarge",
        `₹${lcoe}`
    );

    setText(
        "scoreLarge",
        score
    );


    setText(
        "recommendationText",
        result.recommendation
            || "Hybrid renewable system recommended."
    );


    setText(
        "aiResultRecommendation",
        result.recommendation
            || "Hybrid renewable system recommended."
    );


    setText(
        "annualGeneration",
        `${Math.round(
            result.renewable_mwh || 0
        ).toLocaleString()} MWh`
    );


    setText(
        "peakDemand",
        `${selectedIsland.demand.toFixed(2)} MW`
    );


    setText(
        "storageCapacity",
        `${battery.toLocaleString()} kWh`
    );


    updateMixValues(result);

}


/* =========================================================
   ENERGY MIX
========================================================= */

function updateMixValues(result) {

    const solar =
        Number(result.solar_share || 0);

    const wind =
        Number(result.wind_share || 0);

    const otec =
        Number(result.otec_share || 0);

    const renewable =
        Number(result.renewable_pct || 0);


    setText(
        "solarMixPercent",
        `${solar.toFixed(0)}%`
    );

    setText(
        "windMixPercent",
        `${wind.toFixed(0)}%`
    );

    setText(
        "otecMixPercent",
        `${otec.toFixed(0)}%`
    );


    setText(
        "mixCenterValue",
        `${renewable.toFixed(1)}%`
    );

}


/* =========================================================
   CHARTS
========================================================= */

function generateCharts(result) {

    createGenerationChart(result);

    createMixChart(result);

}


/* =========================================================
   GENERATION CHART
========================================================= */

function createGenerationChart(result) {

    const canvas =
        $("generationChart");

    if (!canvas) return;


    if (generationChart) {

        generationChart.destroy();

    }


    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
    ];


    const baseDemand =
        selectedIsland.demand;


    const renewable =
        Number(result.renewable_pct || 0);


    const supply =
        months.map(
            (_, index) =>
                Number(
                    (
                        baseDemand *
                        (
                            .85 +
                            Math.sin(
                                index / 2
                            ) * .12
                        ) *
                        (renewable / 100)
                    ).toFixed(2)
                )
        );


    const demand =
        months.map(
            (_, index) =>
                Number(
                    (
                        baseDemand *
                        (
                            .88 +
                            Math.cos(
                                index / 2
                            ) * .08
                        )
                    ).toFixed(2)
                )
        );


    generationChart =
        new Chart(
            canvas,
            {
                type: "line",

                data: {

                    labels: months,

                    datasets: [

                        {
                            label:
                                "Renewable Supply",

                            data: supply,

                            borderColor:
                                "#00eaff",

                            backgroundColor:
                                "rgba(0,234,255,.12)",

                            fill: true,

                            tension: .4,

                            borderWidth: 2,

                            pointRadius: 2

                        },

                        {
                            label:
                                "Island Demand",

                            data: demand,

                            borderColor:
                                "#ff9d00",

                            backgroundColor:
                                "rgba(255,157,0,.08)",

                            fill: true,

                            tension: .4,

                            borderWidth: 2,

                            pointRadius: 2

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    },

                    scales: {

                        x: {

                            ticks: {
                                color: "#80a9c1",
                                font: {
                                    size: 8
                                }
                            },

                            grid: {
                                color:
                                    "rgba(0,180,255,.08)"
                            }

                        },

                        y: {

                            beginAtZero: true,

                            ticks: {
                                color: "#80a9c1",
                                font: {
                                    size: 8
                                }
                            },

                            grid: {
                                color:
                                    "rgba(0,180,255,.08)"
                            }

                        }

                    }

                }

            }
        );

}


/* =========================================================
   MIX CHART
========================================================= */

function createMixChart(result) {

    const canvas =
        $("mixChart");

    if (!canvas) return;


    if (mixChart) {

        mixChart.destroy();

    }


    mixChart =
        new Chart(
            canvas,
            {
                type: "doughnut",

                data: {

                    labels: [
                        "Solar",
                        "Wind",
                        "OTEC"
                    ],

                    datasets: [

                        {

                            data: [

                                Number(
                                    result.solar_share || 0
                                ),

                                Number(
                                    result.wind_share || 0
                                ),

                                Number(
                                    result.otec_share || 0
                                )

                            ],

                            backgroundColor: [

                                "#ffe14a",
                                "#00d9ff",
                                "#008cff"

                            ],

                            borderColor:
                                "#031c35",

                            borderWidth: 3

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    cutout: "70%",

                    plugins: {

                        legend: {
                            display: false
                        }

                    }

                }

            }
        );

}


/* =========================================================
   REPORT
========================================================= */

function generateReport(result) {

    if (!result) return;


    const reportID =
        "BG-" +
        Date.now()
            .toString()
            .slice(-6);


    setText(
        "reportId",
        reportID
    );


    setText(
        "reportDate",
        new Date()
            .toLocaleString()
    );


    setText(
        "reportIsland",
        selectedIsland.name
    );


    setText(
        "reportDemand",
        `${selectedIsland.demand.toFixed(2)} MW`
    );


    setText(
        "reportSolar",
        `${selectedIsland.solarCF * 100}%`
    );


    setText(
        "reportWind",
        `${selectedIsland.windCF * 100}%`
    );


    setText(
        "reportOtec",
        `${selectedIsland.otecCF * 100}%`
    );


    setText(
        "reportSolarPower",
        `${result.solar_kw} kW`
    );


    setText(
        "reportWindPower",
        `${result.wind_kw} kW`
    );


    setText(
        "reportOtecPower",
        `${result.otec_kw} kW`
    );


    setText(
        "reportBattery",
        `${result.battery_kwh} kWh`
    );


    setText(
        "reportRenewable",
        `${result.renewable_pct}%`
    );


    setText(
        "reportReliability",
        `${result.reliability}%`
    );


    setText(
        "reportReserve",
        `${result.reserve_hours} hours`
    );


    setText(
        "reportLcoe",
        `₹${result.lcoe}`
    );


    setText(
        "reportScore",
        `${result.score}/100`
    );


    setText(
        "reportGeneration",
        `${result.renewable_mwh} MWh`
    );


    const recommendation =
        result.recommendation ||
        "Hybrid renewable energy system recommended.";


    setText(
        "reportRecommendation",
        recommendation
    );


    setText(
        "reportAiSummary",
        `BlueGrid AI analyzed ${selectedIsland.name}, which has an estimated peak demand of ${selectedIsland.demand.toFixed(2)} MW. The calculated system combines Solar, Wind and OTEC generation with battery storage. The modeled renewable contribution is ${result.renewable_pct}% with an estimated reliability of ${result.reliability}%.`
    );

}


/* =========================================================
   TIME
========================================================= */

function updateTime() {

    const element =
        $("lastUpdate");

    if (!element) return;

    const now =
        new Date();

    element.textContent =
        "Last Update: " +
        now.toLocaleTimeString();

}


/* =========================================================
   DASHBOARD VALUES
========================================================= */

function updateDashboardValues() {

    setText(
        "peakDemand",
        `${selectedIsland.demand.toFixed(2)} MW`
    );

}


/* =========================================================
   BUTTONS
========================================================= */

function initializeButtons() {


    $("generateReportBtn")
        ?.addEventListener(
            "click",
            () => {

                $("report")
                    ?.scrollIntoView({
                        behavior: "smooth"
                    });

            }
        );


    $("generateReportButton")
        ?.addEventListener(
            "click",
            () => {

                if (!lastOptimizationResult) {

                    alert(
                        "Please run the optimizer first."
                    );

                    return;

                }

                generateReport(
                    lastOptimizationResult
                );

                alert(
                    "Detailed report generated successfully."
                );

            }
        );


    $("printReportBtn")
        ?.addEventListener(
            "click",
            () => {

                window.print();

            }
        );


    $("downloadPdfBtn")
        ?.addEventListener(
            "click",
            downloadPDF
        );


    $("downloadPdfButton")
        ?.addEventListener(
            "click",
            downloadPDF
        );


    $("viewAnalyticsBtn")
        ?.addEventListener(
            "click",
            () => {

                $("analytics")
                    ?.scrollIntoView({
                        behavior: "smooth"
                    });

            }
        );


    $("viewAnalysisBtn")
        ?.addEventListener(
            "click",
            () => {

                $("intelligence")
                    ?.scrollIntoView({
                        behavior: "smooth"
                    });

            }
        );

}


/* =========================================================
   PDF
========================================================= */

function downloadPDF() {

    if (!lastOptimizationResult) {

        alert(
            "Please run the optimizer first."
        );

        return;

    }


    if (
        typeof window.jspdf ===
        "undefined"
    ) {

        alert(
            "PDF library could not be loaded."
        );

        return;

    }


    const {
        jsPDF
    } = window.jspdf;


    const pdf =
        new jsPDF();


    let y = 20;


    pdf.setFontSize(22);

    pdf.setTextColor(
        0,
        150,
        220
    );

    pdf.text(
        "BlueGrid AI",
        20,
        y
    );


    y += 10;


    pdf.setFontSize(12);

    pdf.setTextColor(
        40,
        40,
        40
    );

    pdf.text(
        "Optimal Hybrid Renewable Energy Planner",
        20,
        y
    );


    y += 15;


    pdf.setFontSize(11);

    pdf.text(
        `Island: ${selectedIsland.name}`,
        20,
        y
    );

    y += 8;

    pdf.text(
        `Peak Demand: ${selectedIsland.demand} MW`,
        20,
        y
    );

    y += 12;


    const r =
        lastOptimizationResult;


    pdf.text(
        `Solar: ${r.solar_kw} kW`,
        20,
        y
    );

    y += 8;

    pdf.text(
        `Wind: ${r.wind_kw} kW`,
        20,
        y
    );

    y += 8;

    pdf.text(
        `OTEC: ${r.otec_kw} kW`,
        20,
        y
    );

    y += 8;

    pdf.text(
        `Battery: ${r.battery_kwh} kWh`,
        20,
        y
    );

    y += 12;


    pdf.text(
        `Renewable Energy: ${r.renewable_pct}%`,
        20,
        y
    );

    y += 8;

    pdf.text(
        `Reliability: ${r.reliability}%`,
        20,
        y
    );

    y += 8;

    pdf.text(
        `Reserve: ${r.reserve_hours} hours`,
        20,
        y
    );

    y += 8;

    pdf.text(
        `LCOE: Rs.${r.lcoe}`,
        20,
        y
    );

    y += 8;

    pdf.text(
        `BlueGrid Score: ${r.score}/100`,
        20,
        y
    );

    y += 15;


    pdf.setFontSize(10);

    const recommendation =
        r.recommendation ||
        "Hybrid renewable system recommended.";


    const lines =
        pdf.splitTextToSize(
            recommendation,
            165
        );


    pdf.text(
        lines,
        20,
        y
    );


    pdf.save(
        `BlueGrid-${selectedIsland.name}-Report.pdf`
    );

}


/* =========================================================
   HELPER
========================================================= */

function setText(id, value) {

    const element =
        $(id);

    if (element) {

        element.textContent =
            value;

    }

}