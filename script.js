// --- STATE MANAGEMENT ---
let gameHistory = '';
const MIN_HISTORY_LENGTH = 10;

// --- DOM ELEMENTS ---
const elements = {
    resultsContainer: document.getElementById('resultsContainer'),
    historyInput: document.getElementById('gameHistory'),
    predictionOutput: document.getElementById('predictionOutput'),
    analysisText: document.getElementById('analysisText'),
    phucFormulaResult: document.getElementById('phucFormulaResult'),
    slbInput: document.getElementById('slb'),
    conInput: document.getElementById('con'),
    caiInput: document.getElementById('cai'),
    playerPercent: document.getElementById('player-percent'),
    playerProgress: document.getElementById('player-progress'),
    bankerPercent: document.getElementById('banker-percent'),
    bankerProgress: document.getElementById('banker-progress'),
    tiePercent: document.getElementById('tie-percent'),
    tieProgress: document.getElementById('tie-progress'),
    backtestCorrect: document.getElementById('backtest-correct'),
    backtestIncorrect: document.getElementById('backtest-incorrect'),
    backtestNobet: document.getElementById('backtest-nobet'),
    beadPlate: document.getElementById('beadPlate'), // New
    bigRoad: document.getElementById('bigRoad'),
    bigEyeRoad: document.getElementById('bigEyeRoad'),
    smallRoad: document.getElementById('smallRoad'),
    cockroachRoad: document.getElementById('cockroachRoad'),
    bigEyeStats: document.getElementById('bigEyeStats'),
    smallStats: document.getElementById('smallStats'),
    cockroachStats: document.getElementById('cockroachStats')
};

// --- EVENT LISTENERS ---
document.getElementById('btn-add-p').addEventListener('click', () => addResult('P'));
document.getElementById('btn-add-b').addEventListener('click', () => addResult('B'));
document.getElementById('btn-add-t').addEventListener('click', () => addResult('T'));
document.getElementById('btn-undo').addEventListener('click', undoLast);
document.getElementById('btn-analyze-text').addEventListener('click', () => {
    gameHistory = elements.historyInput.value.toUpperCase().replace(/[^PBT]/g, '');
    runFullAnalysis();
});
elements.slbInput.addEventListener('input', runFullAnalysis);
elements.conInput.addEventListener('input', runFullAnalysis);
elements.caiInput.addEventListener('input', runFullAnalysis);


// --- CORE LOGIC FUNCTIONS ---

/**
 * NEW: Parses history for the Bead Plate (Bảng Hạt)
 * Fills top-to-bottom, left-to-right.
 */
function parseBeadPlate(history, rows = 6) {
    const results = history.split('');
    const plateMatrix = [];
    results.forEach((res, index) => {
        const col = Math.floor(index / rows);
        const row = index % rows;
        if (!plateMatrix[col]) {
            plateMatrix[col] = Array(rows).fill(null); // Initialize column with nulls
        }
        plateMatrix[col][row] = { val: res };
    });
    return plateMatrix;
}

function parseBigRoad(history) {
    // ... no changes to this function
    const results = history.split('');
    const bigRoadMatrix = [];
    if (results.length === 0) return bigRoadMatrix;
    let currentCol = -1;
    let lastResult = '';
    let tieCount = 0;
    results.forEach(res => {
        if (res === 'T') {
            tieCount++;
        } else {
            if (currentCol === -1 || res !== lastResult) {
                currentCol++;
                bigRoadMatrix.push([]);
                lastResult = res;
            }
            bigRoadMatrix[currentCol].push({ val: res, tie: tieCount });
            tieCount = 0;
        }
    });
    return bigRoadMatrix;
}
function generateDerivedRoad(bigRoadMatrix, colOffset) {
    // ... no changes to this function
    const derivedRoad = [];
    if (!bigRoadMatrix || bigRoadMatrix.length <= colOffset) return derivedRoad;
    let derivedCol = -1;
    let lastDerivedResult = null;
    for (let c = colOffset; c < bigRoadMatrix.length; c++) {
        for (let r = 0; r < bigRoadMatrix[c].length; r++) {
            let isRed;
            const refColIndex = c - colOffset;
            const refCol = bigRoadMatrix[refColIndex];
            const currentEntryInRefCol = refCol[r];
            if (currentEntryInRefCol) {
                isRed = true;
            } else {
                if (bigRoadMatrix[c].length === refCol.length) {
                    isRed = true;
                } else {
                    isRed = false;
                }
            }
            const newDerivedResult = { val: isRed ? 'Red' : 'Blue' };
            if (lastDerivedResult !== newDerivedResult.val) {
                derivedCol++;
                derivedRoad.push([]);
                lastDerivedResult = newDerivedResult.val;
            }
            derivedRoad[derivedCol].push(newDerivedResult);
        }
    }
    return derivedRoad;
}
function getRoadPrediction(history) {
    // ... no changes to this function
    const cleanHistory = history.replace(/T/g, '');
    if (cleanHistory.length < MIN_HISTORY_LENGTH) {
        return { roadPrediction: 'NO_BET', roadAnalysis: `Cần ít nhất ${MIN_HISTORY_LENGTH} ván (không tính Hòa).`, roads: {} };
    }
    const bigRoadMatrix = parseBigRoad(history);
    const roads = {
        bigEye: generateDerivedRoad(bigRoadMatrix, 1),
        small: generateDerivedRoad(bigRoadMatrix, 2),
        cockroach: generateDerivedRoad(bigRoadMatrix, 3),
    };
    const getRoadTrend = (road) => {
        if (!road || road.length === 0) return 'Neutral';
        const flatRoad = road.flat().slice(-5);
        if (flatRoad.length < 3) return 'Neutral';
        const redCount = flatRoad.filter(b => b.val === 'Red').length;
        const blueCount = flatRoad.length - redCount;
        if (redCount / flatRoad.length >= 0.6) return 'Red';
        if (blueCount / flatRoad.length >= 0.6) return 'Blue';
        return 'Neutral';
    };
    const trends = Object.values(roads).map(getRoadTrend).filter(t => t !== 'Neutral');
    const redTrends = trends.filter(t => t === 'Red').length;
    const blueTrends = trends.length - redTrends;
    
    let roadPrediction = 'NO_BET';
    let roadAnalysis = '';
    const lastResult = cleanHistory.slice(-1);

    if (trends.length >= 2 && redTrends / trends.length >= 0.67) {
        roadPrediction = lastResult;
        roadAnalysis = `Hệ thống Cầu phụ gợi ý THEO VÁN TRƯỚC.`;
    } else if (trends.length >= 2 && blueTrends / trends.length >= 0.67) {
        roadPrediction = lastResult === 'P' ? 'B' : 'P';
        roadAnalysis = `Hệ thống Cầu phụ gợi ý BẺ CẦU.`;
    } else {
        roadAnalysis = `Hệ thống Cầu phụ KHÔNG có tín hiệu rõ ràng.`;
    }
    return { roadPrediction, roadAnalysis, roads };
}
function calculatePhucFormula() {
    // ... no changes to this function
    const slb = parseInt(elements.slbInput.value);
    const con = parseInt(elements.conInput.value);
    const cai = parseInt(elements.caiInput.value);
    const svb = gameHistory.replace(/T/g, '').length + 1;

    if (isNaN(slb) || isNaN(con) || isNaN(cai)) {
        return { prediction: null, text: "Vui lòng nhập đủ dữ liệu ván trước." };
    }

    const k1 = svb - slb;
    const k2 = con + cai;
    const k1IsEven = k1 % 2 === 0;
    const k2IsEven = k2 % 2 === 0;
    
    let resultIsEven;
    if (k1IsEven && k2IsEven) resultIsEven = true;
    else if (!k1IsEven && !k2IsEven) resultIsEven = false;
    else if (k1IsEven && !k2IsEven) resultIsEven = false;
    else if (!k1IsEven && k2IsEven) resultIsEven = true;

    const prediction = resultIsEven ? 'P' : 'B';
    const resultText = resultIsEven ? 'Chẵn -> PLAYER' : 'Lẻ -> BANKER';
    const text = `CT Phúc SVB: (k1=${k1}, k2=${k2}) -> ${resultText}`;

    return { prediction, text };
}
function calculateStatistics(history) { /* no changes */ return { player: (history.match(/P/g) || []).length, banker: (history.match(/B/g) || []).length, tie: (history.match(/T/g) || []).length, p_pct: (((history.match(/P/g) || []).length / ((history.match(/P/g) || []).length + (history.match(/B/g) || []).length) * 100) || 0).toFixed(1), b_pct: (((history.match(/B/g) || []).length / ((history.match(/P/g) || []).length + (history.match(/B/g) || []).length) * 100) || 0).toFixed(1), t_pct: (((history.match(/T/g) || []).length / history.length * 100) || 0).toFixed(1), };}
function runBacktest(history) { /* no changes */ const results = { correct: 0, incorrect: 0, noBet: 0 }; const cleanHistory = history.replace(/T/g, ''); for (let i = MIN_HISTORY_LENGTH; i < cleanHistory.length; i++) { const subHistory = history.substring(0, i); const actualResult = cleanHistory[i]; const { roadPrediction } = getRoadPrediction(subHistory); if (roadPrediction === 'NO_BET') results.noBet++; else if (roadPrediction === actualResult) results.correct++; else results.incorrect++; } return results; }


// --- RENDER FUNCTIONS ---
function renderRoad(container, roadMatrix, roadType) {
    container.innerHTML = '';
    if (!roadMatrix) return;
    
    // The main render loop now handles all road types
    roadMatrix.forEach(col => {
        const colDiv = document.createElement('div');
        col.forEach(bead => {
            if (!bead) {
                // For Bead Plate, render an empty spot
                if(roadType === 'bead') colDiv.appendChild(document.createElement('div'));
                return;
            };

            const beadDiv = document.createElement('div');
            beadDiv.className = `road-bead bead-${bead.val.toLowerCase()}`;
            
            if (roadType === 'bead') {
                beadDiv.textContent = bead.val;
            } else if (roadType === 'big') {
                if (bead.tie > 0) {
                    const slash = document.createElement('div');
                    slash.className = 'tie-slash';
                    beadDiv.appendChild(slash);
                }
            } else { // derived
                beadDiv.classList.add(`derived-${bead.val.toLowerCase()}`);
            }
            colDiv.appendChild(beadDiv);
        });
        container.appendChild(colDiv);
    });
}

function renderRoadStats(statsEl, roadMatrix) {
    if (!roadMatrix || roadMatrix.length === 0) {
        statsEl.innerHTML = 'Chưa đủ dữ liệu'; return;
    }
    const flatRoad = roadMatrix.flat();
    const redCount = flatRoad.filter(b => b.val === 'Red').length;
    const blueCount = flatRoad.length - redCount;
    statsEl.innerHTML = `Thống kê: <span class="red-stat"><strong>${redCount}</strong> Đỏ</span> / <span class="blue-stat"><strong>${blueCount}</strong> Xanh</span>`;
}

function renderAll(data) {
    // ... no changes to this function
    const predMap = {'P': 'PLAYER', 'B': 'BANKER', 'NO_BET': '⚠️ KHÔNG CƯỢC'};
    const predClass = `prediction-${data.finalPrediction.toLowerCase()}`;
    elements.predictionOutput.innerHTML = `<div class="prediction-value ${predClass}">${predMap[data.finalPrediction]}</div>`;
    elements.analysisText.innerHTML = data.finalAnalysis;
    elements.phucFormulaResult.innerHTML = data.phucPrediction.text;
    elements.playerPercent.textContent = `${data.stats.p_pct}%`;
    elements.playerProgress.style.width = `${data.stats.p_pct}%`;
    elements.playerProgress.textContent = data.stats.player;
    elements.bankerPercent.textContent = `${data.stats.b_pct}%`;
    elements.bankerProgress.style.width = `${data.stats.b_pct}%`;
    elements.bankerProgress.textContent = data.stats.banker;
    elements.tiePercent.textContent = `${data.stats.t_pct}%`;
    elements.tieProgress.style.width = `${data.stats.t_pct}%`;
    elements.tieProgress.textContent = data.stats.tie;
    elements.backtestCorrect.textContent = data.backtest.correct;
    elements.backtestIncorrect.textContent = data.backtest.incorrect;
    elements.backtestNobet.textContent = data.backtest.nobet;

    // Render new Bead Plate
    renderRoad(elements.beadPlate, data.beadPlateMatrix, 'bead');
    // Render other roads
    renderRoad(elements.bigRoad, data.bigRoadMatrix, 'big');
    renderRoad(elements.bigEyeRoad, data.roads.bigEye, 'derived');
    renderRoad(elements.smallRoad, data.roads.small, 'derived');
    renderRoad(elements.cockroachRoad, data.roads.cockroach, 'derived');
    renderRoadStats(elements.bigEyeStats, data.roads.bigEye);
    renderRoadStats(elements.smallStats, data.roads.small);
    renderRoadStats(elements.cockroachStats, data.roads.cockroach);
}

// --- CONTROLLERS ---
function addResult(result) {
    gameHistory += result;
    elements.slbInput.value = '';
    elements.conInput.value = '';
    elements.caiInput.value = '';
    runFullAnalysis();
}
function undoLast() {
    if (gameHistory.length > 0) {
        gameHistory = gameHistory.slice(0, -1);
        runFullAnalysis();
    }
}

function runFullAnalysis() {
    elements.historyInput.value = gameHistory;
    
    if (gameHistory.length === 0) {
        elements.resultsContainer.style.display = 'none';
        return;
    }
    elements.resultsContainer.style.display = 'block';

    // Consensus Logic
    let finalPrediction = 'NO_BET';
    let finalAnalysis = '';
    const { roadPrediction, roadAnalysis, roads } = getRoadPrediction(gameHistory);
    const phucPrediction = calculatePhucFormula();
    
    if (roadPrediction !== 'NO_BET' && phucPrediction.prediction !== null) {
        if (roadPrediction === phucPrediction.prediction) {
            finalPrediction = roadPrediction;
            finalAnalysis = `✅ <strong>ĐỒNG THUẬN TUYỆT ĐỐI!</strong> Cả hệ thống Cầu phụ và Công thức SVB đều cùng chỉ về <strong>${finalPrediction === 'P' ? 'PLAYER' : 'BANKER'}</strong>.`;
        } else {
            finalPrediction = 'NO_BET';
            finalAnalysis = `❌ <strong>KHÔNG ĐỒNG THUẬN!</strong> Hệ thống Cầu phụ gợi ý <strong>${roadPrediction === 'P' ? 'PLAYER' : 'BANKER'}</strong>, trong khi Công thức SVB gợi ý <strong>${phucPrediction.prediction === 'P' ? 'PLAYER' : 'BANKER'}</strong>. Khuyến nghị không cược.`;
        }
    } else {
        if (phucPrediction.prediction === null) {
            finalAnalysis = `Chờ nhập dữ liệu cho Công thức SVB để có gợi ý cuối cùng. ${roadAnalysis}`;
        } else {
            finalAnalysis = `Hệ thống Cầu phụ không có tín hiệu rõ ràng. Không đủ điều kiện để vào cược.`;
        }
    }

    // Prepare data for rendering
    const dataToRender = {
        finalPrediction,
        finalAnalysis,
        phucPrediction,
        stats: calculateStatistics(gameHistory),
        backtest: runBacktest(gameHistory),
        beadPlateMatrix: parseBeadPlate(gameHistory), // New
        bigRoadMatrix: parseBigRoad(gameHistory),
        roads,
    };

    renderAll(dataToRender);
}
