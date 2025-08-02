// Global variables
let rounds = [];
let patternDS = [];

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize form
    const form = document.getElementById('inputForm');
    form.addEventListener('submit', handleFormSubmit);
    
    // Load data from localStorage if exists
    loadDataFromStorage();
    
    // Update all displays
    updateAllDisplays();
});

// Form submission handler
function handleFormSubmit(e) {
    e.preventDefault();
    addRound();
}

// Calculate prediction based on formula
function calculatePrediction(svb, slb, con, cai, shouldReverse = false) {
    const k1 = svb - slb;
    const k2 = con + cai;
    
    let prediction;
    // Cùng chẵn hoặc cùng lẻ → Chẵn → Con
    if ((k1 % 2 === 0 && k2 % 2 === 0) || (k1 % 2 === 1 && k2 % 2 === 1)) {
        prediction = 'Con';
    } else {
        // Khác tính chẵn lẻ → Lẻ → Cái
        prediction = 'Cái';
    }
    
    // Đảo kết quả nếu cần
    if (shouldReverse) {
        prediction = prediction === 'Con' ? 'Cái' : 'Con';
    }
    
    return { k1, k2, prediction };
}

// Advanced pattern analysis
function analyzePattern() {
    if (patternDS.length < 2) return null;
    
    const patterns = {
        recent: patternDS.slice(-5).join(''),
        full: patternDS.join(''),
        analysis: {}
    };
    
    // Count transitions
    let transitions = 0;
    for (let i = 1; i < patterns.recent.length; i++) {
        if (patterns.recent[i] !== patterns.recent[i-1]) transitions++;
    }
    
    // Analyze pattern type
    patterns.analysis.transitions = transitions;
    patterns.analysis.alternating = transitions >= patterns.recent.length - 1;
    patterns.analysis.consecutive = transitions === 0;
    patterns.analysis.mixed = !patterns.analysis.alternating && !patterns.analysis.consecutive;
    
    // Count consecutive occurrences
    let currentChar = patternDS[patternDS.length - 1];
    let consecutiveCount = 1;
    for (let i = patternDS.length - 2; i >= 0; i--) {
        if (patternDS[i] === currentChar) {
            consecutiveCount++;
        } else {
            break;
        }
    }
    patterns.analysis.consecutiveCount = consecutiveCount;
    
    // Detect cycles
    patterns.analysis.cycle = detectCycle(patternDS);
    
    // Calculate entropy (randomness measure)
    patterns.analysis.entropy = calculateEntropy(patternDS);
    
    // Machine Learning features
    patterns.analysis.mlFeatures = extractMLFeatures(patternDS);
    
    // Generate recommendation with confidence score
    const recommendation = generateSmartRecommendation(patterns.analysis);
    patterns.analysis.recommendation = recommendation.text;
    patterns.analysis.confidence = recommendation.confidence;
    patterns.analysis.strategy = recommendation.strategy;
    
    return patterns;
}

// Calculate entropy to measure randomness
function calculateEntropy(arr) {
    if (arr.length === 0) return 0;
    
    const counts = {};
    arr.forEach(char => counts[char] = (counts[char] || 0) + 1);
    
    let entropy = 0;
    const total = arr.length;
    
    Object.values(counts).forEach(count => {
        const p = count / total;
        if (p > 0) entropy -= p * Math.log2(p);
    });
    
    return entropy;
}

// Extract machine learning features
function extractMLFeatures(arr) {
    if (arr.length < 5) return null;
    
    const features = {
        // Frequency features
        dFrequency: arr.filter(x => x === 'D').length / arr.length,
        sFrequency: arr.filter(x => x === 'S').length / arr.length,
        
        // Run length features
        maxDRun: getMaxRunLength(arr, 'D'),
        maxSRun: getMaxRunLength(arr, 'S'),
        avgRunLength: getAverageRunLength(arr),
        
        // Pattern features
        last3Pattern: arr.slice(-3).join(''),
        last5Pattern: arr.slice(-5).join(''),
        
        // Trend features
        recentTrend: calculateRecentTrend(arr),
        momentum: calculateMomentum(arr)
    };
    
    return features;
}

// Get maximum run length
function getMaxRunLength(arr, char) {
    let maxRun = 0;
    let currentRun = 0;
    
    arr.forEach(c => {
        if (c === char) {
            currentRun++;
            maxRun = Math.max(maxRun, currentRun);
        } else {
            currentRun = 0;
        }
    });
    
    return maxRun;
}

// Get average run length
function getAverageRunLength(arr) {
    if (arr.length === 0) return 0;
    
    let runs = 1;
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] !== arr[i-1]) runs++;
    }
    
    return arr.length / runs;
}

// Calculate recent trend
function calculateRecentTrend(arr) {
    if (arr.length < 10) return 'neutral';
    
    const recent = arr.slice(-10);
    const dCount = recent.filter(x => x === 'D').length;
    
    if (dCount >= 7) return 'strong_d';
    if (dCount >= 6) return 'weak_d';
    if (dCount <= 3) return 'strong_s';
    if (dCount <= 4) return 'weak_s';
    return 'neutral';
}

// Calculate momentum
function calculateMomentum(arr) {
    if (arr.length < 5) return 0;
    
    const recent = arr.slice(-5);
    const older = arr.slice(-10, -5);
    
    const recentD = recent.filter(x => x === 'D').length / recent.length;
    const olderD = older.length > 0 ? older.filter(x => x === 'D').length / older.length : 0.5;
    
    return recentD - olderD;
}

// Generate smart recommendation
function generateSmartRecommendation(analysis) {
    let confidence = 0;
    let strategy = '';
    let text = '';
    
    // Multi-strategy approach
    const strategies = {
        alternating: checkAlternatingStrategy(analysis),
        consecutive: checkConsecutiveStrategy(analysis),
        cycle: checkCycleStrategy(analysis),
        ml: checkMLStrategy(analysis),
        entropy: checkEntropyStrategy(analysis)
    };
    
    // Find best strategy
    let bestStrategy = null;
    let maxConfidence = 0;
    
    Object.entries(strategies).forEach(([name, result]) => {
        if (result && result.confidence > maxConfidence) {
            maxConfidence = result.confidence;
            bestStrategy = { name, ...result };
        }
    });
    
    if (bestStrategy) {
        confidence = bestStrategy.confidence;
        strategy = bestStrategy.name;
        text = bestStrategy.recommendation;
    } else {
        confidence = 'Thấp';
        strategy = 'default';
        text = 'Mẫu phức tạp - Cân nhắc kỹ lưỡng';
    }
    
    return { confidence, strategy, text };
}

// Strategy checkers
function checkAlternatingStrategy(analysis) {
    if (!analysis.alternating) return null;
    
    return {
        confidence: 'Cao',
        recommendation: 'Mẫu đan xen rõ ràng - Nên đảo kết quả'
    };
}

function checkConsecutiveStrategy(analysis) {
    if (!analysis.consecutive || analysis.consecutiveCount < 3) return null;
    
    if (analysis.consecutiveCount >= 5) {
        return {
            confidence: 'Trung bình',
            recommendation: 'Chuỗi lặp dài - Có thể sắp đổi hướng'
        };
    }
    
    return {
        confidence: 'Cao',
        recommendation: 'Đang trong chuỗi lặp - Không nên đảo'
    };
}

function checkCycleStrategy(analysis) {
    if (!analysis.cycle) return null;
    
    return {
        confidence: 'Trung bình',
        recommendation: `Phát hiện chu kỳ ${analysis.cycle} - Dự đoán theo chu kỳ`
    };
}

function checkMLStrategy(analysis) {
    if (!analysis.mlFeatures) return null;
    
    const features = analysis.mlFeatures;
    
    // Rule-based ML prediction
    if (features.recentTrend === 'strong_d' && features.momentum > 0.3) {
        return {
            confidence: 'Cao',
            recommendation: 'Xu hướng D mạnh - Không nên đảo'
        };
    }
    
    if (features.recentTrend === 'strong_s' && features.momentum < -0.3) {
        return {
            confidence: 'Cao',
            recommendation: 'Xu hướng S mạnh - Nên đảo kết quả'
        };
    }
    
    if (features.avgRunLength < 1.5) {
        return {
            confidence: 'Trung bình',
            recommendation: 'Tần suất đổi cao - Xem xét đảo theo S'
        };
    }
    
    return null;
}

function checkEntropyStrategy(analysis) {
    if (analysis.entropy < 0.5) {
        return {
            confidence: 'Trung bình',
            recommendation: 'Entropy thấp - Mẫu có quy luật'
        };
    }
    
    if (analysis.entropy > 0.95) {
        return {
            confidence: 'Thấp',
            recommendation: 'Entropy cao - Mẫu ngẫu nhiên'
        };
    }
    
    return null;
}

// Detect cycle in pattern
function detectCycle(arr) {
    if (arr.length < 4) return null;
    
    for (let cycleLength = 2; cycleLength <= Math.floor(arr.length / 2); cycleLength++) {
        let isCycle = true;
        const lastCycle = arr.slice(-cycleLength);
        const previousCycle = arr.slice(-cycleLength * 2, -cycleLength);
        
        if (lastCycle.join('') === previousCycle.join('')) {
            return cycleLength;
        }
    }
    
    return null;
}

// Smart prediction logic
function shouldReverseNextPrediction() {
    if (patternDS.length === 0) return false;
    
    const lastResult = patternDS[patternDS.length - 1];
    const patterns = analyzePattern();
    
    // If last result was wrong (S)
    if (lastResult === 'S') {
        // Use ML-based decision
        if (patterns && patterns.analysis.mlFeatures) {
            const ml = patterns.analysis.mlFeatures;
            
            // Strong alternating pattern
            if (patterns.analysis.alternating) {
                return true;
            }
            
            // High entropy with S trend
            if (patterns.analysis.entropy > 0.8 && ml.sFrequency > 0.6) {
                return true;
            }
            
            // Breaking long consecutive pattern
            if (patterns.analysis.consecutiveCount >= 4) {
                return true;
            }
            
            // Momentum shift
            if (ml.momentum < -0.3) {
                return true;
            }
        }
    }
    
    // Advanced heuristics
    if (patterns) {
        // Check strategy recommendation
        if (patterns.analysis.strategy === 'alternating') {
            return lastResult === 'S';
        }
        
        if (patterns.analysis.strategy === 'ml' && patterns.analysis.recommendation.includes('đảo')) {
            return true;
        }
        
        // Cycle-based prediction
        if (patterns.analysis.cycle) {
            const position = patternDS.length % patterns.analysis.cycle;
            const expectedNext = patternDS[patternDS.length - patterns.analysis.cycle];
            return expectedNext === 'S';
        }
        
        // Entropy-based decision
        if (patterns.analysis.entropy > 0.95) {
            // High randomness - use frequency-based approach
            const sCount = patternDS.filter(x => x === 'S').length;
            const dCount = patternDS.filter(x => x === 'D').length;
            return sCount > dCount && lastResult === 'S';
        }
    }
    
    return false;
}

// Add new round
function addRound() {
    const svb = parseInt(document.getElementById('svb').value);
    const slb = parseInt(document.getElementById('slb').value);
    const con = parseInt(document.getElementById('con').value);
    const cai = parseInt(document.getElementById('cai').value);
    
    // Validate input
    if (!validateInput(svb, slb, con, cai)) {
        return;
    }
    
    const roundIndex = rounds.length + 1;
    
    // Calculate prediction
    let shouldReverse = false;
    if (rounds.length > 0) {
        shouldReverse = shouldReverseNextPrediction();
    }
    
    const { k1, k2, prediction } = calculatePrediction(svb, slb, con, cai, shouldReverse);
    
    // Create round object
    const round = {
        index: roundIndex,
        svb, slb, con, cai,
        k1, k2,
        prediction,
        actualResult: '',
        isCorrect: null,
        reversed: shouldReverse,
        timestamp: new Date().toISOString()
    };
    
    rounds.push(round);
    
    // Save to storage
    saveDataToStorage();
    
    // Update displays
    updateAllDisplays();
    
    // Show toast
    showToast('success', 'Đã thêm ván bài mới');
    
    // Auto increment SVB for next round
    document.getElementById('svb').value = svb + 1;
    
    // Smooth scroll to table
    document.querySelector('.table-card').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
    });
}

// Validate input
function validateInput(svb, slb, con, cai) {
    if (isNaN(svb) || isNaN(slb) || isNaN(con) || isNaN(cai)) {
        showToast('error', 'Vui lòng nhập đầy đủ thông tin!');
        return false;
    }
    
    if (con < 0 || con > 9 || cai < 0 || cai > 9) {
        showToast('error', 'Điểm con và cái phải từ 0-9!');
        return false;
    }
    
    if (svb < 1) {
        showToast('error', 'Số ván phải lớn hơn 0!');
        return false;
    }
    
    if (slb < 0) {
        showToast('error', 'Số lá bài không thể âm!');
        return false;
    }
    
    return true;
}

// Update actual result
function updateActualResult(index, value) {
    if (value) {
        rounds[index].actualResult = value;
        rounds[index].isCorrect = rounds[index].prediction === value;
        
        // Update pattern
        patternDS[index] = rounds[index].isCorrect ? 'D' : 'S';
        
        // Save to storage
        saveDataToStorage();
        
        // Update displays
        updateAllDisplays();
        
        // Show toast
        const resultText = rounds[index].isCorrect ? 'Dự đoán đúng!' : 'Dự đoán sai!';
        const toastType = rounds[index].isCorrect ? 'success' : 'error';
        showToast(toastType, resultText);
    }
}

// Delete round
function deleteRound(index) {
    if (confirm('Bạn có chắc muốn xóa ván này?')) {
        rounds.splice(index, 1);
        patternDS.splice(index, 1);
        
        // Re-index rounds
        rounds.forEach((round, i) => {
            round.index = i + 1;
        });
        
        // Save and update
        saveDataToStorage();
        updateAllDisplays();
        
        showToast('info', 'Đã xóa ván bài');
    }
}

// Update all displays
function updateAllDisplays() {
    updateTable();
    updateStats();
    updatePatternAnalysis();
    updateNextPrediction();
}

// Update table
function updateTable() {
    const tbody = document.getElementById('resultsBody');
    
    if (rounds.length === 0) {
        tbody.innerHTML = `
            <tr class="empty-row">
                <td colspan="12">
                    <div class="empty-table">
                        <i class="fas fa-inbox"></i>
                        <p>Chưa có dữ liệu</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = rounds.map((round, index) => `
        <tr>
            <td>${round.index}</td>
            <td>${round.svb}</td>
            <td>${round.slb}</td>
            <td>${round.con}</td>
            <td>${round.cai}</td>
            <td>${round.k1}</td>
            <td>${round.k2}</td>
            <td><span class="result-badge ${round.prediction === 'Con' ? 'result-correct' : 'result-wrong'}">${round.prediction}</span></td>
            <td>
                <select onchange="updateActualResult(${index}, this.value)">
                    <option value="">Chọn</option>
                    <option value="Con" ${round.actualResult === 'Con' ? 'selected' : ''}>Con</option>
                    <option value="Cái" ${round.actualResult === 'Cái' ? 'selected' : ''}>Cái</option>
                </select>
            </td>
            <td>
                ${round.isCorrect === true ? '<span class="result-badge result-correct">D</span>' : 
                  round.isCorrect === false ? '<span class="result-badge result-wrong">S</span>' : 
                  '-'}
            </td>
            <td>${round.reversed ? '<i class="fas fa-check" style="color: var(--success-color)"></i>' : '<i class="fas fa-times" style="color: var(--danger-color)"></i>'}</td>
            <td>
                <button class="action-btn" onclick="deleteRound(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Update statistics
function updateStats() {
    const totalRounds = rounds.length;
    const correctCount = rounds.filter(r => r.isCorrect === true).length;
    const wrongCount = rounds.filter(r => r.isCorrect === false).length;
    const answeredCount = correctCount + wrongCount;
    const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
    
    document.getElementById('totalRounds').textContent = totalRounds;
    document.getElementById('correctCount').textContent = correctCount;
    document.getElementById('wrongCount').textContent = wrongCount;
    document.getElementById('accuracy').textContent = accuracy + '%';
    
    // Animate values
    animateValue('totalRounds', totalRounds);
    animateValue('correctCount', correctCount);
    animateValue('wrongCount', wrongCount);
    animateValue('accuracy', accuracy, '%');
}

// Update pattern analysis display
function updatePatternAnalysis() {
    const patternString = patternDS.join('') || '';
    const patternDisplay = document.getElementById('patternString');
    
    if (patternString) {
        // Highlight pattern with colors
        patternDisplay.innerHTML = patternString.split('').map((char, index) => {
            const isRecent = index >= patternString.length - 5;
            const className = char === 'D' ? 'result-correct' : 'result-wrong';
            const style = isRecent ? 'font-weight: bold; font-size: 1.6rem;' : '';
            return `<span class="${className}" style="${style}">${char}</span>`;
        }).join('');
    } else {
        patternDisplay.innerHTML = '<span class="empty-pattern">Chưa có dữ liệu</span>';
    }
    
    const patterns = analyzePattern();
    const analysisDiv = document.getElementById('patternAnalysis');
    
    if (patterns) {
        let mlInfo = '';
        if (patterns.analysis.mlFeatures) {
            const ml = patterns.analysis.mlFeatures;
            mlInfo = `
                <div class="pattern-item">
                    <h4>Xu hướng</h4>
                    <div class="value">${ml.recentTrend.replace('_', ' ').toUpperCase()}</div>
                </div>
                <div class="pattern-item">
                    <h4>Entropy</h4>
                    <div class="value">${patterns.analysis.entropy.toFixed(2)}</div>
                </div>
            `;
        }
        
        analysisDiv.innerHTML = `
            <div class="pattern-item">
                <h4>Mẫu gần nhất</h4>
                <div class="value">${patterns.recent || 'N/A'}</div>
            </div>
            <div class="pattern-item">
                <h4>Loại mẫu</h4>
                <div class="value">${patterns.analysis.alternating ? 'Đan xen' : 
                                   patterns.analysis.consecutive ? 'Lặp liên tiếp' : 
                                   patterns.analysis.cycle ? `Chu kỳ ${patterns.analysis.cycle}` :
                                   'Hỗn hợp'}</div>
            </div>
            ${mlInfo}
            <div class="pattern-item">
                <h4>Chiến lược</h4>
                <div class="value" style="text-transform: uppercase; font-size: 0.8rem;">${patterns.analysis.strategy || 'default'}</div>
            </div>
            <div class="pattern-item">
                <h4>Độ tin cậy</h4>
                <div class="value" style="color: ${patterns.analysis.confidence === 'Cao' ? 'var(--success-color)' : 
                                                   patterns.analysis.confidence === 'Trung bình' ? 'var(--warning-color)' : 
