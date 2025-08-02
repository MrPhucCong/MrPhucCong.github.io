const MIN_HISTORY_LENGTH = 10;

// --- CORE LOGIC FUNCTIONS ---
// These functions perform calculations and return data, they don't touch the DOM.

function parseBigRoad(history) {
    const results = history.toUpperCase().replace(/[^PBT]/g, '').split('');
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
            tieCount = 0; // Reset tie count after assigning it
        }
    });
    return bigRoadMatrix;
}

function generateDerivedRoad(bigRoadMatrix, colOffset) {
    const derivedRoad = [];
    if (!bigRoadMatrix || bigRoadMatrix.length <= colOffset) return derivedRoad;

    let derivedCol = -1;
    let lastDerivedResult = null;
    
    for (let c = colOffset; c < bigRoadMatrix.length; c++) {
        for (let r = 0; r < bigRoadMatrix[c].length; r++) {
            const currentEntry = bigRoadMatrix[c][r];
            if (!currentEntry) continue;

            let isRed; // Red = Orderly, Blue = Choppy
            const refColIndex = c - colOffset;
            const refCol = bigRoadMatrix[refColIndex];
            
            const entryAtSameRow = refCol[r];
            const entryAtPrevRow = refCol[r - 1];

            if (entryAtSameRow) {
                isRed = true; // Columns are equal length at this point
            } else {
                // Current col is longer than ref col. Compare to ref col's previous entry.
                if (entryAtPrevRow) {
                    isRed = false; // It's choppy/uneven.
                } else {
                    // A common interpretation is to compare the length of the column
                    // prior to the current one with the reference column.
                     const prevCol = bigRoadMatrix[c-1];
                     isRed = prevCol.length === bigRoadMatrix[refColIndex].length;
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

function getPrediction(history) {
    const cleanHistory = history.replace(/T/g, '');
    if (cleanHistory.length < MIN_HISTORY_LENGTH) {
        return { prediction: 'NO_BET', analysis: 'Lịch sử quá ngắn để đưa ra gợi ý đáng tin cậy. Vui lòng nhập thêm.' };
    }
    
    const bigRoadMatrix = parseBigRoad(history);
    const bigEyeRoad = generateDerivedRoad(bigRoadMatrix, 1);
    const smallRoad = generateDerivedRoad(bigRoadMatrix, 2);
    const cockroachRoad = generateDerivedRoad(bigRoadMatrix, 3);
    
    const getRoadTrend = (road) => {
        if (!road || road.length === 0) return 'Neutral';
        const flatRoad = road.flat().slice(-5); // Look at last 5 entries
        if(flatRoad.length < 3) return 'Neutral';
        const redCount = flatRoad.filter(b => b.val === 'Red').length;
        const blueCount = flatRoad.filter(b => b.val === 'Blue').length;
        if (redCount / flatRoad.length >= 0.6) return 'Red';
        if (blueCount / flatRoad.length >= 0.6) return 'Blue';
        return 'Neutral';
    };

    const trends = [getRoadTrend(bigEyeRoad), getRoadTrend(smallRoad), getRoadTrend(cockroachRoad)]
        .filter(t => t !== 'Neutral');

    const redTrends = trends.filter(t => t === 'Red').length;
    const blueTrends = trends.filter(t => t === 'Blue').length;
    
    let prediction = 'NO_BET';
    let analysis = '';
    const lastResult = cleanHistory.slice(-1);

    if (trends.length >= 2 && redTrends / trends.length >= 0.67) {
        prediction = lastResult;
        analysis = `Hầu hết các bảng cầu phụ (${redTrends}/${trends.length}) cho thấy cầu đang đi <strong>TRẬT TỰ (Đỏ)</strong>. Xu hướng có khả năng sẽ lặp lại. Gợi ý ưu tiên theo cầu hiện tại.`;
    } else if (trends.length >= 2 && blueTrends / trends.length >= 0.67) {
        prediction = lastResult === 'P' ? 'B' : 'P';
        analysis = `Hầu hết các bảng cầu phụ (${blueTrends}/${trends.length}) cho thấy cầu đang đi <strong>HỖN LOẠN (Xanh)</strong>. Xu hướng có khả năng sẽ bị bẻ gãy. Gợi ý ưu tiên đánh ngược lại cầu hiện tại.`;
    } else {
        prediction = 'NO_BET';
        analysis = `Các bảng cầu phụ không cho thấy tín hiệu đồng thuận (${redTrends} Đỏ, ${blueTrends} Xanh). Cầu đang trong giai đoạn khó đoán, nên quan sát thêm.`;
    }

    return { prediction, analysis };
}

function calculateStatistics(history) {
    const cleanHistory = history.toUpperCase().replace(/[^PBT]/g, '');
    const total = cleanHistory.length;
    if (total === 0) return { player: 0, banker: 0, tie: 0, total: 0, p_pct: 0, b_pct: 0, t_pct: 0 };
    
    const player = (cleanHistory.match(/P/g) || []).length;
    const banker = (cleanHistory.match(/B/g) || []).length;
    const tie = (cleanHistory.match(/T/g) || []).length;
    const nonTieTotal = player + banker;
    
    return {
        player, banker, tie, total,
        p_pct: nonTieTotal > 0 ? (player / nonTieTotal * 100).toFixed(1) : "0.0",
        b_pct: nonTieTotal > 0 ? (banker / nonTieTotal * 100).toFixed(1) : "0.0",
        t_pct: total > 0 ? (tie / total * 100).toFixed(1) : "0.0",
    };
}

function runBacktest(history) {
    const results = { correct: 0, incorrect: 0, noBet: 0 };
    const cleanHistory = history.toUpperCase().replace(/[^PBT]/g, '');

    for (let i = MIN_HISTORY_LENGTH; i < cleanHistory.length; i++) {
        const subHistory = cleanHistory.substring(0, i);
        const actualResult = cleanHistory[i];
        if(actualResult === 'T') continue; // Skip ties for backtesting accuracy

        const { prediction } = getPrediction(subHistory);

        if (prediction === 'NO_BET') {
            results.noBet++;
        } else if (prediction === actualResult) {
            results.correct++;
        } else {
            results.incorrect++;
        }
    }
    return results;
}

// --- RENDER FUNCTIONS ---
// These functions take data and update the DOM.

function renderRoad(elementId, roadMatrix, roadType) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    if (!roadMatrix) return;
    
    roadMatrix.forEach(col => {
        const colDiv = document.createElement('div');
        col.forEach(bead => {
            if (!bead) return; 
            const beadDiv = document.createElement('div');
            
            if (roadType === 'big') {
                beadDiv.className = `road-bead bead-${bead.val.toLowerCase()}`;
                if (bead.tie > 0) {
                     const tieText = document.createTextNode(bead.tie);
                     beadDiv.appendChild(tieText);
                     const slash = document.createElement('div');
                     slash.className = 'tie-slash';
                     beadDiv.appendChild(slash);
                }
            } else { // Derived roads
                beadDiv.className = `road-bead derived-${bead.val.toLowerCase()}`;
            }
            colDiv.appendChild(beadDiv);
        });
        container.appendChild(colDiv);
    });
}

function renderRoadStats(elementId, roadMatrix) {
    const statsEl = document.getElementById(elementId);
    if (!roadMatrix || roadMatrix.length === 0) {
         statsEl.innerHTML = ''; return;
    }
    const flatRoad = roadMatrix.flat();
    const redCount = flatRoad.filter(b => b.val === 'Red').length;
    const blueCount = flatRoad.filter(b => b.val === 'Blue').length;
    statsEl.innerHTML = `Thống kê: <span class="red-stat"><strong>${redCount}</strong> Đỏ</span> / <span class="blue-stat"><strong>${blueCount}</strong> Xanh</span>`;
}

function renderPrediction(prediction, analysis) {
    const predictionOutput = document.getElementById('predictionOutput');
    const analysisText = document.getElementById('analysisText');
    
    let predictionHTML = '';
    if (prediction === 'P') {
        predictionHTML = `<div class="prediction-value prediction-player">Ưu tiên: PLAYER (CON)</div>`;
    } else if (prediction === 'B') {
        predictionHTML = `<div class="prediction-value prediction-banker">Ưu tiên: BANKER (CÁI)</div>`;
    } else {
        predictionHTML = `<div class="prediction-value prediction-nobet">⚠️ KHÔNG CƯỢC</div>`;
    }
    predictionOutput.innerHTML = predictionHTML;
    analysisText.innerHTML = analysis;
}

function renderStatistics(stats) {
    // Note: P and B percentages are calculated based on non-tie results for a more standard comparison.
    document.getElementById('player-percent').textContent = `${stats.p_pct}%`;
    document.getElementById('player-progress').style.width = `${stats.p_pct}%`;
    document.getElementById('player-progress').textContent = stats.player;

    document.getElementById('banker-percent').textContent = `${stats.b_pct}%`;
    document.getElementById('banker-progress').style.width = `${stats.b_pct}%`;
    document.getElementById('banker-progress').textContent = stats.banker;
    
    document.getElementById('tie-percent').textContent = `${stats.t_pct}%`;
    document.getElementById('tie-progress').style.width = `${stats.t_pct}%`;
    document.getElementById('tie-progress').textContent = stats.tie;
}

function renderBacktest(results) {
    document.getElementById('backtest-correct').textContent = results.correct;
    document.getElementById('backtest-incorrect').textContent = results.incorrect;
    document.getElementById('backtest-nobet').textContent = results.noBet;
}

// --- MAIN CONTROLLER FUNCTIONS ---

function analyzeBaccarat() {
    const history = document.getElementById('gameHistory').value;
    if (history.replace(/[^PBT]/g, '').length < MIN_HISTORY_LENGTH) {
        alert(`Vui lòng nhập lịch sử có ít nhất ${MIN_HISTORY_LENGTH} ván (không tính Hòa) để phân tích chính xác.`);
        return;
    }

    document.getElementById('resultsContainer').style.display = 'block';

    // 1. Calculate & Render Statistics
    const stats = calculateStatistics(history);
    renderStatistics(stats);
    
    // 2. Run & Render Backtest
    const backtestResults = runBacktest(history);
    renderBacktest(backtestResults);

    // 3. Parse and Render Roads
    const bigRoadMatrix = parseBigRoad(history);
    renderRoad('bigRoad', bigRoadMatrix, 'big');
    
    const bigEyeRoad = generateDerivedRoad(bigRoadMatrix, 1);
    renderRoad('bigEyeRoad', bigEyeRoad, 'derived');
    renderRoadStats('bigEyeStats', bigEyeRoad);

    const smallRoad = generateDerivedRoad(bigRoadMatrix, 2);
    renderRoad('smallRoad', smallRoad, 'derived');
    renderRoadStats('smallStats', smallRoad);

    const cockroachRoad = generateDerivedRoad(bigRoadMatrix, 3);
    renderRoad('cockroachRoad', cockroachRoad, 'derived');
    renderRoadStats('cockroachStats', cockroachRoad);

    // 4. Get and Render Final Prediction
    const { prediction, analysis } = getPrediction(history);
    renderPrediction(prediction, analysis);
}

function generateSampleData() {
    document.getElementById('gameHistory').value = 'BPBPBBPBPPBPBBPBBBBBPBBPBPBPPBPBBPBPBBPBPBBPBPPBPBPPBB';
    analyzeBaccarat();
}

function clearAll() {
    document.getElementById('gameHistory').value = '';
    document.getElementById('resultsContainer').style.display = 'none';
}

