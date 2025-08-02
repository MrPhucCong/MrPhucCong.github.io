/**
 * PhucNC-AI Baccarat System - Professional Edition
 * Tích hợp đầy đủ 4 bảng cầu: Big Road, Big Eye Boy, Small Road, Cockroach Pig
 */
const BaccaratSystem = {
    // --- STATE MANAGEMENT ---
    state: {
        history: [], // Lịch sử kết quả gốc: ['P', 'B', 'T']
        bigRoadMatrix: [], // Ma trận 2D của Big Road để tính toán
        derivedRoads: { // Kết quả của các bảng cầu phụ
            bigEyeBoy: [],
            smallRoad: [],
            cockroachPig: []
        }
    },

    // --- DOM ELEMENTS ---
    DOM: {}, // Sẽ được gán trong hàm init

    // --- MAIN INITIALIZATION ---
    init() {
        this.DOM = {
            svbInput: document.getElementById('svb'),
            slbInput: document.getElementById('slb'),
            conInput: document.getElementById('con'),
            caiInput: document.getElementById('cai'),
            predictBtn: document.getElementById('predict-btn'),
            resultBox: document.getElementById('prediction-result'),
            bigRoadContainer: document.getElementById('big-road'),
            bigEyeBoyContainer: document.getElementById('big-eye-boy'),
            smallRoadContainer: document.getElementById('small-road'),
            cockroachPigContainer: document.getElementById('cockroach-pig'),
            resultButtons: document.querySelectorAll('.controls .btn[data-result]'),
            resetBtn: document.getElementById('reset-btn'),
        };
        this.addEventListeners();
        console.log("Baccarat Professional System Initialized.");
    },

    addEventListeners() {
        this.DOM.predictBtn.addEventListener('click', () => this.handlePrediction());
        this.DOM.resultButtons.forEach(btn => {
            btn.addEventListener('click', () => this.addResult(btn.dataset.result));
        });
        this.DOM.resetBtn.addEventListener('click', () => this.reset());
    },

    // --- CORE LOGIC MODULES ---

    /**
     * Module tính toán theo "Công thức của Phúc"
     */
    calculatePhucFormula(svb, slb, con, cai) {
        const k1 = (svb + 1) - slb;
        const k2 = con + cai;
        const isK1Even = k1 % 2 === 0;
        const isK2Even = k2 % 2 === 0;
        
        let prediction = null;
        if (isK1Even === isK2Even) { prediction = 'P'; } 
        else { prediction = 'B'; }

        const reason = `k1(${k1}) [${isK1Even ? 'Chẵn' : 'Lẻ'}] & k2(${k2}) [${isK2Even ? 'Chẵn' : 'Lẻ'}] ➜ ${prediction === 'P' ? 'CON' : 'CÁI'}`;
        return { prediction, reason };
    },

    /**
     * Module phân tích các bảng cầu phụ
     */
    analyzeDerivedRoads() {
        const roads = this.state.derivedRoads;
        const lastBigEye = roads.bigEyeBoy.slice(-1)[0];
        const lastSmall = roads.smallRoad.slice(-1)[0];
        const lastCockroach = roads.cockroachPig.slice(-1)[0];

        if (!lastBigEye && !lastSmall && !lastCockroach) {
            return { prediction: null, reason: "Chưa đủ dữ liệu cho các bảng cầu phụ." };
        }
        
        // Logic đồng thuận đơn giản: Nếu 2/3 bảng cầu phụ gần nhất cùng màu
        const votes = [lastBigEye, lastSmall, lastCockroach].filter(Boolean);
        const redVotes = votes.filter(v => v === 'R').length;
        const blueVotes = votes.filter(v => v === 'B').length;

        if (redVotes >= 2) return { prediction: 'B', reason: `Cầu phụ nghiêng về ĐỎ (Trật tự) ➜ Theo CÁI` };
        if (blueVotes >= 2) return { prediction: 'P', reason: `Cầu phụ nghiêng về XANH (Hỗn loạn) ➜ Theo CON` };

        return { prediction: null, reason: "Tín hiệu các bảng cầu phụ không đồng nhất." };
    },

    // --- MAIN HANDLERS ---

    handlePrediction() {
        const svb = parseInt(this.DOM.svbInput.value);
        const slb = parseInt(this.DOM.slbInput.value);
        const con = parseInt(this.DOM.conInput.value);
        const cai = parseInt(this.DOM.caiInput.value);

        if (isNaN(svb) || isNaN(slb) || isNaN(con) || isNaN(cai)) {
            this.updatePredictionResult({ decision: 'Thiếu thông tin', reason: 'Vui lòng nhập đủ 4 thông số.', status: 'warning' });
            return;
        }

        const phucResult = this.calculatePhucFormula(svb, slb, con, cai);
        const roadmapResult = this.analyzeDerivedRoads();

        if (phucResult.prediction && phucResult.prediction === roadmapResult.prediction) {
            this.updatePredictionResult({
                decision: `ĐỒNG THUẬN ➜ CƯỢC ${phucResult.prediction === 'P' ? 'CON' : 'CÁI'}`,
                reason: `<li><b>Công thức Phúc:</b> ${phucResult.reason}</li><li><b>Bảng cầu phụ:</b> ${roadmapResult.reason}</li>`,
                status: phucResult.prediction
            });
        } else {
            this.updatePredictionResult({
                decision: 'CHƯA ĐỒNG THUẬN',
                reason: `<li><b>Công thức Phúc:</b> ${phucResult.reason}</li><li><b>Bảng cầu phụ:</b> ${roadmapResult.reason}</li>`,
                status: 'neutral'
            });
        }
    },

    updatePredictionResult({ decision, reason, status }) {
        const colorMap = { 'P': 'var(--player-color)', 'B': 'var(--banker-color)', 'warning': 'var(--warning-color)', 'neutral': 'var(--border-color)' };
        this.DOM.resultBox.style.borderColor = colorMap[status] || 'var(--border-color)';
        this.DOM.resultBox.innerHTML = `<strong>${decision}</strong><ul>${reason}</ul>`;
    },

    addResult(result) {
        this.state.history.push(result);
        this.updateAllRoads();
    },

    reset() {
        if (confirm("Anh có chắc muốn xóa toàn bộ lịch sử cầu không?")) {
            this.state = { history: [], bigRoadMatrix: [], derivedRoads: { bigEyeBoy: [], smallRoad: [], cockroachPig: [] } };
            this.DOM.resultBox.innerHTML = "Chờ phân tích...";
            this.DOM.resultBox.style.borderColor = 'var(--border-color)';
            this.updateAllRoads();
        }
    },
    
    // --- ROADMAP GENERATION ---

    updateAllRoads() {
        // 1. Tạo ma trận Big Road
        this.generateBigRoadMatrix();
        
        // 2. Từ ma trận Big Road, tạo các bảng cầu phụ
        this.generateDerivedRoads();
        
        // 3. Hiển thị tất cả lên giao diện
        this.renderBigRoad();
        this.renderDerivedRoad('bigEyeBoy', this.DOM.bigEyeBoyContainer);
        this.renderDerivedRoad('smallRoad', this.DOM.smallRoadContainer);
        this.renderDerivedRoad('cockroachPig', this.DOM.cockroachPigContainer);
    },

    generateBigRoadMatrix() {
        const matrix = Array(6).fill(null).map(() => Array(this.state.history.length).fill(null));
        let col = 0, row = 0;
        let lastResult = null;

        this.state.history.forEach(result => {
            if (result === 'T') {
                if (matrix[row] && matrix[row][col]) {
                    matrix[row][col].tie = (matrix[row][col].tie || 0) + 1;
                }
                return;
            }
            if (result !== lastResult && lastResult !== null) { col++; row = 0; } 
            else if (row >= 5) { col++; } 
            else if(lastResult !== null) { row++; }
            
            if (matrix[row]) {
                matrix[row][col] = { result };
            }
            lastResult = result;
        });
        this.state.bigRoadMatrix = matrix;
    },

    generateDerivedRoads() {
        const matrix = this.state.bigRoadMatrix;
        this.state.derivedRoads.bigEyeBoy = [];
        this.state.derivedRoads.smallRoad = [];
        this.state.derivedRoads.cockroachPig = [];

        for (let c = 0; c < matrix[0].length; c++) {
            for (let r = 0; r < matrix.length; r++) {
                if (!matrix[r][c]) continue;

                // Big Eye Boy (So sánh với cột - 1)
                if (r === 0 && c >= 1) {
                    const currentDepth = this.getColumnDepth(c);
                    const prevDepth = this.getColumnDepth(c - 1);
                    this.state.derivedRoads.bigEyeBoy.push(currentDepth === prevDepth ? 'R' : 'B');
                } else if (r > 0 && c >= 1) {
                     this.state.derivedRoads.bigEyeBoy.push(matrix[r-1][c] ? 'R' : 'B');
                }

                // Small Road (So sánh với cột - 2)
                if (r === 0 && c >= 2) {
                    const currentDepth = this.getColumnDepth(c);
                    const prevDepth = this.getColumnDepth(c - 2);
                    this.state.derivedRoads.smallRoad.push(currentDepth === prevDepth ? 'R' : 'B');
                } else if (r > 0 && c >= 2) {
                    this.state.derivedRoads.smallRoad.push(matrix[r-1][c] ? 'R' : 'B');
                }

                // Cockroach Pig (So sánh với cột - 3)
                if (r === 0 && c >= 3) {
                    const currentDepth = this.getColumnDepth(c);
                    const prevDepth = this.getColumnDepth(c - 3);
                    this.state.derivedRoads.cockroachPig.push(currentDepth === prevDepth ? 'R' : 'B');
                } else if (r > 0 && c >= 3) {
                    this.state.derivedRoads.cockroachPig.push(matrix[r-1][c] ? 'R' : 'B');
                }
            }
        }
    },
    
    getColumnDepth(colIndex) {
        let depth = 0;
        for(let r = 0; r < 6; r++) {
            if(this.state.bigRoadMatrix[r][colIndex]) depth++;
            else break;
        }
        return depth;
    },

    // --- RENDERING ---
    
    renderBigRoad() {
        const container = this.DOM.bigRoadContainer;
        container.innerHTML = '';
        this.state.bigRoadMatrix.forEach((row, r) => {
            row.forEach((cellData, c) => {
                if (cellData) {
                    const cell = document.createElement('div');
                    cell.className = `road-cell ${cellData.result === 'P' ? 'player' : 'banker'}`;
                    cell.style.gridArea = `${r + 1} / ${c + 1}`;
                    if (cellData.tie) {
                        const tieEl = document.createElement('div');
                        tieEl.className = 'tie-slash';
                        cell.appendChild(tieEl);
                    }
                    container.appendChild(cell);
                }
            });
        });
    },

    renderDerivedRoad(roadName, container) {
        container.innerHTML = '';
        const data = this.state.derivedRoads[roadName];
        let col = 0, row = 0;
        let lastResult = null;

        data.forEach(result => {
            if (result !== lastResult && lastResult !== null) { col++; row = 0; } 
            else if (row >= 5) { col++; } 
            else if(lastResult !== null) { row++; }
            lastResult = result;
            const cell = document.createElement('div');
            cell.className = `road-cell small ${result === 'R' ? 'red' : 'blue'}`;
            cell.style.gridArea = `${row + 1} / ${col + 1}`;
            container.appendChild(cell);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => BaccaratSystem.init());
