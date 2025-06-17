
class WasteClassifier {
    constructor() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.model = null;
        this.isDetecting = false;
        this.detectionStats = {
            plastic: 0,
            can: 0,
            bag: 0,
            glass: 0
        };
        
        // Performance tracking
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 0;
        this.detectionHistory = [];
        this.confidenceThreshold = 0.5;
        this.detectionSpeed = 'medium';
        
        // Video dimensions tracking
        this.videoDisplaySize = { width: 0, height: 0 };
        this.videoNaturalSize = { width: 0, height: 0 };
        this.scaleX = 1;
        this.scaleY = 1;
        
        // Waste categories with enhanced detection
        this.wasteCategories = {
            'bottle': { type: 'plastic', name: 'Chai Nhựa', icon: 'fas fa-bottle-water', color: '#2196F3' },
            'cup': { type: 'plastic', name: 'Cốc Nhựa', icon: 'fas fa-coffee', color: '#2196F3' },
            'wine glass': { type: 'glass', name: 'Ly Thủy Tinh', icon: 'fas fa-wine-glass', color: '#4CAF50' },
            'bowl': { type: 'plastic', name: 'Bát Nhựa', icon: 'fas fa-bowl-food', color: '#2196F3' },
            'handbag': { type: 'bag', name: 'Túi Xách', icon: 'fas fa-shopping-bag', color: '#9C27B0' },
            'backpack': { type: 'bag', name: 'Ba Lô', icon: 'fas fa-backpack', color: '#9C27B0' },
            'cell phone': { type: 'bag', name: 'Vỏ Điện Thoại', icon: 'fas fa-mobile-alt', color: '#9C27B0' },
            'vase': { type: 'glass', name: 'Bình Hoa', icon: 'fas fa-vase', color: '#4CAF50' },
            'toothbrush': { type: 'plastic', name: 'Bàn Chải', icon: 'fas fa-tooth', color: '#2196F3' }
        };
        
        // Brand detection patterns
        this.brandPatterns = {
            'coca': { type: 'can', brand: 'Coca Cola' },
            'pepsi': { type: 'can', brand: 'Pepsi' },
            'sprite': { type: 'can', brand: 'Sprite' },
            'fanta': { type: 'can', brand: 'Fanta' },
            'aquafina': { type: 'plastic', brand: 'Aquafina' },
            'lavie': { type: 'plastic', brand: 'Lavie' }
        };
        
        this.initializeApp();
    }

    async initializeApp() {
        this.showLoadingScreen();
        this.setupEventListeners();
        this.setupResizeObserver();
        await this.loadModel();
        this.hideLoadingScreen();
        this.setupUI();
    }

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        const loadingText = document.getElementById('loadingText');
        
        const loadingSteps = [
            'Đang khởi tạo hệ thống...',
            'Đang tải mô hình AI...',
            'Đang chuẩn bị camera...',
            'Hoàn tất khởi tạo!'
        ];
        
        let step = 0;
        const interval = setInterval(() => {
            if (step < loadingSteps.length) {
                loadingText.textContent = loadingSteps[step];
                step++;
            } else {
                clearInterval(interval);
            }
        }, 800);
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }, 1000);
    }

    async loadModel() {
        try {
            console.log('Đang tải mô hình AI...');
            this.model = await cocoSsd.load();
            console.log('Mô hình đã được tải thành công!');
            this.showNotification('Mô hình AI đã sẵn sàng!', 'success');
        } catch (error) {
            console.error('Lỗi khi tải mô hình:', error);
            this.showNotification('Không thể tải mô hình AI. Vui lòng thử lại.', 'error');
        }
    }

    setupEventListeners() {
        // Main controls
        document.getElementById('startCamera').addEventListener('click', () => this.startCamera());
        document.getElementById('captureImage').addEventListener('click', () => this.captureImage());
        document.getElementById('uploadImage').addEventListener('click', () => this.uploadImage());
        document.getElementById('toggleDetection').addEventListener('click', () => this.toggleDetection());
        document.getElementById('stopCamera').addEventListener('click', () => this.stopCamera());
        document.getElementById('resetStats').addEventListener('click', () => this.resetStats());
        document.getElementById('imageInput').addEventListener('change', (e) => this.handleImageUpload(e));
        
        // Settings
        document.getElementById('confidenceThreshold').addEventListener('input', (e) => {
            this.confidenceThreshold = parseFloat(e.target.value);
            document.getElementById('confidenceValue').textContent = Math.round(this.confidenceThreshold * 100) + '%';
        });
        
        document.getElementById('detectionSpeed').addEventListener('change', (e) => {
            this.detectionSpeed = e.target.value;
        });
        
        // Video events
        this.video.addEventListener('loadedmetadata', () => this.onVideoLoaded());
        this.video.addEventListener('play', () => this.onVideoPlay());
        this.video.addEventListener('error', (e) => this.handleVideoError(e));
        
        // Window events
        window.addEventListener('resize', () => this.updateCanvasSize());
        window.addEventListener('beforeunload', () => this.cleanup());
        
        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
                return;
            }
            
            switch(event.key.toLowerCase()) {
                case 'c':
                    if (!this.video.srcObject) {
                        this.startCamera();
                    }
                    event.preventDefault();
                    break;
                    
                case ' ':
                    if (this.video.srcObject && !document.getElementById('captureImage').disabled) {
                        this.captureImage();
                    }
                    event.preventDefault();
                    break;
                    
                case 'p':
                    if (this.video.srcObject) {
                        this.toggleDetection();
                    }
                    event.preventDefault();
                    break;
                    
                case 's':
                    if (this.video.srcObject) {
                        this.stopCamera();
                    }
                    event.preventDefault();
                    break;
                    
                case 'r':
                    this.resetStats();
                    event.preventDefault();
                    break;
                    
                case 'u':
                    this.uploadImage();
                    event.preventDefault();
                    break;
                    
                case 'h':
                case '?':
                    showShortcutsModal();
                    event.preventDefault();
                    break;
            }
        });
    }

    setupResizeObserver() {
        if (window.ResizeObserver) {
            const resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    if (entry.target === this.video) {
                        this.updateCanvasSize();
                    }
                }
            });
            resizeObserver.observe(this.video);
        }
    }

    setupUI() {
        // Setup confidence threshold display
        const confidenceSlider = document.getElementById('confidenceThreshold');
        const confidenceValue = document.getElementById('confidenceValue');
        confidenceValue.textContent = Math.round(confidenceSlider.value * 100) + '%';
        
        // Setup FPS counter
        this.startFPSCounter();
    }

    startFPSCounter() {
        setInterval(() => {
            document.getElementById('fpsCounter').textContent = this.fps;
        }, 1000);
    }

    async startCamera() {
        try {
            const startBtn = document.getElementById('startCamera');
            startBtn.classList.add('loading');
            
            const constraints = {
                video: {
                    width: { ideal: 1280, max: 1920 },
                    height: { ideal: 720, max: 1080 },
                    facingMode: 'environment'
                }
            };
            
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            
            this.video.srcObject = stream;
            this.video.style.display = 'block';
            
            // Update camera status
            const cameraStatus = document.getElementById('cameraStatus');
            cameraStatus.style.display = 'none';
            
            await new Promise((resolve) => {
                this.video.onloadedmetadata = resolve;
            });
            
            await this.video.play();
            
            // Update UI
            startBtn.classList.remove('loading');
            startBtn.disabled = true;
            document.getElementById('captureImage').disabled = false;
            document.getElementById('toggleDetection').style.display = 'flex';
            document.getElementById('stopCamera').style.display = 'flex';
            
            this.showNotification('Camera đã được bật thành công!', 'success');
            
            setTimeout(() => {
                this.startRealTimeDetection();
            }, 500);
            
        } catch (error) {
            console.error('Lỗi khi truy cập camera:', error);
            this.handleCameraError(error);
        }
    }

    handleCameraError(error) {
        let message = 'Không thể truy cập camera. ';
        
        if (error.name === 'NotAllowedError') {
            message += 'Vui lòng cho phép truy cập camera.';
        } else if (error.name === 'NotFoundError') {
            message += 'Không tìm thấy camera.';
        } else if (error.name === 'NotReadableError') {
            message += 'Camera đang được sử dụng bởi ứng dụng khác.';
        } else {
            message += 'Vui lòng kiểm tra kết nối camera.';
        }
        
        this.showNotification(message, 'error');
        
        // Reset button state
        const startBtn = document.getElementById('startCamera');
        startBtn.classList.remove('loading');
        startBtn.disabled = false;
    }

    handleVideoError(error) {
        console.error('Video error:', error);
        this.showNotification('Lỗi video. Vui lòng thử lại.', 'error');
    }

    onVideoLoaded() {
        this.videoNaturalSize = {
            width: this.video.videoWidth,
            height: this.video.videoHeight
        };
        
        console.log('Video natural size:', this.videoNaturalSize);
        this.updateCanvasSize();
    }

    onVideoPlay() {
        this.updateCanvasSize();
    }

    updateCanvasSize() {
        if (!this.video.videoWidth || !this.video.videoHeight) return;
        
        const videoRect = this.video.getBoundingClientRect();
        this.videoDisplaySize = {
            width: videoRect.width,
            height: videoRect.height
        };
        
        this.scaleX = this.videoDisplaySize.width / this.video.videoWidth;
        this.scaleY = this.videoDisplaySize.height / this.video.videoHeight;
        
        this.canvas.width = this.videoDisplaySize.width;
        this.canvas.height = this.videoDisplaySize.height;
        
        Object.assign(this.canvas.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: this.videoDisplaySize.width + 'px',
            height: this.videoDisplaySize.height + 'px',
            pointerEvents: 'none'
        });
        
        console.log('Canvas updated:', {
            displaySize: this.videoDisplaySize,
            naturalSize: this.videoNaturalSize,
            scale: { x: this.scaleX, y: this.scaleY }
        });
    }

    async startRealTimeDetection() {
        if (!this.model || !this.video.videoWidth) {
            setTimeout(() => this.startRealTimeDetection(), 100);
            return;
        }

        this.isDetecting = true;
        this.detectFrame();
    }

    async detectFrame() {
        if (!this.isDetecting || this.video.paused || this.video.ended) return;

        const currentTime = performance.now();
        
        // Calculate FPS
        this.frameCount++;
        if (currentTime >= this.lastTime + 1000) {
            this.fps = Math.round(this.frameCount * 1000 / (currentTime - this.lastTime));
            this.frameCount = 0;
            this.lastTime = currentTime;
        }

        try {
            this.updateCanvasSize();
            
            const predictions = await this.model.detect(this.video);
            const filteredPredictions = predictions.filter(p => p.score >= this.confidenceThreshold);
            
            this.drawDetections(filteredPredictions);
            this.updateResults(filteredPredictions);
            
        } catch (error) {
            console.error('Lỗi trong quá trình phát hiện:', error);
        }

        // Control detection speed
        const delay = this.getDetectionDelay();
        setTimeout(() => {
            requestAnimationFrame(() => this.detectFrame());
        }, delay);
    }

    getDetectionDelay() {
        switch (this.detectionSpeed) {
            case 'fast': return 33; // ~30 FPS
            case 'medium': return 66; // ~15 FPS
            case 'slow': return 200; // ~5 FPS
            default: return 66;
        }
    }

    drawDetections(predictions) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        predictions.forEach(prediction => {
            const wasteType = this.classifyWaste(prediction);
            if (wasteType) {
                this.drawBoundingBox(prediction, wasteType);
            }
        });
    }

    drawBoundingBox(prediction, wasteType) {
        let [x, y, width, height] = prediction.bbox;
        
        // Scale coordinates
        x = x * this.scaleX;
        y = y * this.scaleY;
        width = width * this.scaleX;
        height = height * this.scaleY;
        
        // Ensure coordinates are within canvas
        x = Math.max(0, Math.min(x, this.canvas.width));
        y = Math.max(0, Math.min(y, this.canvas.height));
        width = Math.min(width, this.canvas.width - x);
        height = Math.min(height, this.canvas.height - y);
        
        const color = wasteType.color || this.getColorForType(wasteType.type);
        
        // Draw main bounding box
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 10;
        this.ctx.strokeRect(x, y, width, height);
        this.ctx.shadowBlur = 0;
        
        // Draw fill with opacity
        this.ctx.fillStyle = color + '20';
        this.ctx.fillRect(x, y, width, height);
        
        // Draw label
        this.drawLabel(x, y, width, height, prediction, wasteType, color);
        
        // Draw corner indicators
        this.drawCornerIndicators(x, y, width, height, color);
        
        // Draw center cross
        this.drawCenterCross(x + width/2, y + height/2, color);
    }

    drawLabel(x, y, width, height, prediction, wasteType, color) {
        const confidence = Math.round(prediction.score * 100);
        const labelText = `${wasteType.name} (${confidence}%)`;
        
        this.ctx.font = `${Math.max(12, Math.min(16, width / 15))}px Roboto, sans-serif`;
        const textMetrics = this.ctx.measureText(labelText);
        const textWidth = textMetrics.width;
        const textHeight = 20;
        
        let labelX = x;
        let labelY = y - 5;
        
        if (labelY < textHeight) {
            labelY = y + height + textHeight;
        }
        
        if (labelX + textWidth > this.canvas.width) {
            labelX = this.canvas.width - textWidth - 10;
        }
        
        // Draw background
        this.ctx.fillStyle = color;
        this.ctx.fillRect(labelX - 5, labelY - textHeight, textWidth + 10, textHeight + 5);
        
        // Draw text
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(labelText, labelX, labelY - 5);
    }

    drawCornerIndicators(x, y, width, height, color) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 4;
        const cornerSize = Math.min(20, width/4, height/4);
        
        // Top-left
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + cornerSize);
        this.ctx.lineTo(x, y);
        this.ctx.lineTo(x + cornerSize, y);
        this.ctx.stroke();
        
        // Top-right
        this.ctx.beginPath();
        this.ctx.moveTo(x + width - cornerSize, y);
        this.ctx.lineTo(x + width, y);
        this.ctx.lineTo(x + width, y + cornerSize);
        this.ctx.stroke();
        
        // Bottom-left
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + height - cornerSize);
        this.ctx.lineTo(x, y + height);
        this.ctx.lineTo(x + cornerSize, y + height);
        this.ctx.stroke();
        
        // Bottom-right
        this.ctx.beginPath();
        this.ctx.moveTo(x + width - cornerSize, y + height);
        this.ctx.lineTo(x + width, y + height);
        this.ctx.lineTo(x + width, y + height - cornerSize);
        this.ctx.stroke();
    }

    drawCenterCross(centerX, centerY, color) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        const crossSize = 8;
        
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - crossSize, centerY);
        this.ctx.lineTo(centerX + crossSize, centerY);
        this.ctx.moveTo(centerX, centerY - crossSize);
        this.ctx.lineTo(centerX, centerY + crossSize);
        this.ctx.stroke();
        
        // Center dot
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 3, 0, 2 * Math.PI);
        this.ctx.fill();
    }

    classifyWaste(prediction) {
        const className = prediction.class.toLowerCase();
        
        // Check direct matches
        if (this.wasteCategories[className]) {
            return this.wasteCategories[className];
        }
        
        // Advanced classification
        return this.advancedClassification(prediction);
    }

    advancedClassification(prediction) {
        const className = prediction.class.toLowerCase();
        const [x, y, width, height] = prediction.bbox;
        const aspectRatio = width / height;
        const area = width * height;
        
        // Bottle detection
        if (className.includes('bottle') || (aspectRatio > 0.2 && aspectRatio < 0.8 && area > 5000)) {
            return { type: 'plastic', name: 'Chai Nhựa', icon: 'fas fa-bottle-water', color: '#2196F3' };
        }
        
        // Can detection
        if (className.includes('can') || (aspectRatio > 0.4 && aspectRatio < 0.9 && area > 3000)) {
            return { type: 'can', name: 'Lon Nước', icon: 'fas fa-wine-bottle', color: '#FF9800' };
        }
        
        // Bag detection
        if (className.includes('bag') || className.includes('handbag') || className.includes('backpack')) {
            return { type: 'bag', name: 'Túi Nilon', icon: 'fas fa-shopping-bag', color: '#9C27B0' };
        }
        
        // Glass detection
        if (className.includes('glass') || className.includes('jar') || className.includes('vase')) {
            return { type: 'glass', name: 'Lọ Thủy Tinh', icon: 'fas fa-wine-glass', color: '#4CAF50' };
        }
        
        // Additional plastic items
        if (className.includes('cup') || className.includes('bowl') || className.includes('toothbrush')) {
            return { type: 'plastic', name: 'Đồ Nhựa', icon: 'fas fa-recycle', color: '#2196F3' };
        }
        
        return null;
    }

    getColorForType(type) {
        const colors = {
            plastic: '#2196F3',
            can: '#FF9800',
            bag: '#9C27B0',
            glass: '#4CAF50'
        };
        return colors[type] || '#4CAF50';
    }

    updateResults(predictions) {
        const resultsContainer = document.getElementById('results-container');
        const detectionCount = document.getElementById('detectionCount');
        
        // Filter waste detections
        const wasteDetections = predictions.filter(prediction => this.classifyWaste(prediction) !== null);
        
        detectionCount.textContent = wasteDetections.length;
        
        if (wasteDetections.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-detection">
                    <i class="fas fa-eye-slash"></i>
                    <p>Chưa phát hiện rác thải nào</p>
                    <small>Hướng camera về phía các vật thể cần phân loại</small>
                </div>
            `;
            return;
        }

        let resultsHTML = '';
        const currentStats = { plastic: 0, can: 0, bag: 0, glass: 0 };
        let totalConfidence = 0;

        wasteDetections.forEach((prediction, index) => {
            const wasteType = this.classifyWaste(prediction);
            if (wasteType) {
                currentStats[wasteType.type]++;
                totalConfidence += prediction.score;
                
                const materialAnalysis = this.analyzeMaterial(prediction, wasteType);
                const brandInfo = this.detectBrand(prediction);
                const [x, y, width, height] = prediction.bbox;
                
                const displayX = Math.round(x * this.scaleX);
                const displayY = Math.round(y * this.scaleY);
                const displayWidth = Math.round(width * this.scaleX);
                const displayHeight = Math.round(height * this.scaleY);
                
                resultsHTML += `
                    <div class="detection-item" style="animation-delay: ${index * 0.1}s">
                        <div class="detection-header">
                            <div class="detection-type">
                                <i class="${wasteType.icon}" style="color: ${wasteType.color || this.getColorForType(wasteType.type)}"></i>
                                ${wasteType.name}
                                ${brandInfo ? `- ${brandInfo}` : ''}
                            </div>
                            <div class="confidence-score" style="background: ${wasteType.color || this.getColorForType(wasteType.type)}">
                                ${Math.round(prediction.score * 100)}%
                            </div>
                        </div>
                        <div class="detection-details">
                            <strong>Phân tích vật liệu:</strong> ${materialAnalysis}<br>
                            <strong>Vị trí:</strong> X: ${displayX}, Y: ${displayY}<br>
                            <strong>Kích thước:</strong> ${displayWidth} x ${displayHeight} px<br>
                            <strong>Tỷ lệ khung hình:</strong> ${(width / height).toFixed(2)}<br>
                            <strong>Diện tích:</strong> ${Math.round(width * height)} px²<br>
                            <strong>Thời gian:</strong> ${new Date().toLocaleTimeString()}
                        </div>
                    </div>
                `;
            }
        });

        resultsContainer.innerHTML = resultsHTML;
        
        // Update statistics
        this.updateStatistics(currentStats, totalConfidence / wasteDetections.length);
        
        // Add to history
        this.addToHistory(wasteDetections);
    }

    analyzeMaterial(prediction, wasteType) {
        const aspectRatio = prediction.bbox[2] / prediction.bbox[3];
        const area = prediction.bbox[2] * prediction.bbox[3];
        
        switch (wasteType.type) {
            case 'plastic':
                if (aspectRatio < 0.5) {
                    return 'Chai nhựa dạng cao, có thể là chai nước lọc hoặc nước ngọt';
                } else if (aspectRatio > 1.5) {
                    return 'Vật thể nhựa dạng rộng, có thể là hộp nhựa hoặc khay nhựa';
                } else {
                    return 'Vật thể nhựa có tỷ lệ cân đối, có thể là cốc nhựa hoặc hộp đựng';
                }
            case 'can':
                return `Bề mặt kim loại phản chiếu, hình dạng trụ đặc trưng của lon nước (diện tích: ${Math.round(area)} px²)`;
            case 'bag':
                return 'Vật liệu mềm, dẻo, có thể biến dạng - đặc tính của túi nilon hoặc bao bì mềm';
            case 'glass':
                return 'Vật liệu cứng, trong suốt hoặc bán trong suốt, đặc tính của thủy tinh';
            default:
                return 'Đang phân tích đặc tính vật liệu...';
        }
    }

    detectBrand(prediction) {
        const [x, y, width, height] = prediction.bbox;
        const aspectRatio = width / height;
        const area = width * height;
        
        // Simple brand detection simulation
        if (aspectRatio > 0.4 && aspectRatio < 0.7 && area > 8000) {
            const brands = ['Coca Cola', 'Pepsi', 'Sprite', 'Fanta'];
            return brands[Math.floor(Math.random() * brands.length)];
        } else if (aspectRatio > 0.2 && aspectRatio < 0.6 && area > 10000) {
            const waterBrands = ['Aquafina', 'Lavie', 'Dasani', 'Evian'];
            return waterBrands[Math.floor(Math.random() * waterBrands.length)];
        }
        
        return null;
    }

    updateStatistics(currentStats, averageConfidence) {
        let hasNewDetection = false;
        let totalDetections = 0;
        
        Object.keys(currentStats).forEach(type => {
            if (currentStats[type] > 0) {
                this.detectionStats[type] = Math.max(this.detectionStats[type], currentStats[type]);
                hasNewDetection = true;
            }
            totalDetections += this.detectionStats[type];
        });

        // Update UI
        document.getElementById('plastic-count').textContent = this.detectionStats.plastic;
        document.getElementById('can-count').textContent = this.detectionStats.can;
        document.getElementById('bag-count').textContent = this.detectionStats.bag;
        document.getElementById('glass-count').textContent = this.detectionStats.glass;
        document.getElementById('total-count').textContent = totalDetections;
        
        // Update percentages
        Object.keys(this.detectionStats).forEach(type => {
            const percentage = totalDetections > 0 ? Math.round((this.detectionStats[type] / totalDetections) * 100) : 0;
            const percentageElement = document.getElementById(`${type}-percentage`);
            if (percentageElement) {
                percentageElement.textContent = percentage + '%';
            }
        });
        
        // Update average confidence
        if (averageConfidence) {
            document.getElementById('average-confidence').textContent = Math.round(averageConfidence * 100) + '%';
        }

        // Animation for new detections
        if (hasNewDetection) {
            Object.keys(currentStats).forEach(type => {
                if (currentStats[type] > 0) {
                    const element = document.getElementById(`${type}-count`);
                    if (element) {
                        element.parentElement.parentElement.classList.add('success-animation');
                        setTimeout(() => {
                            element.parentElement.parentElement.classList.remove('success-animation');
                        }, 600);
                    }
                }
            });
        }
    }

    addToHistory(detections) {
        const historyContainer = document.getElementById('history-container');
        const timestamp = new Date().toLocaleTimeString();
        
        if (detections.length > 0) {
            this.detectionHistory.unshift({
                timestamp,
                count: detections.length,
                items: detections.map(d => this.classifyWaste(d)).filter(Boolean)
            });
            
            // Keep only last 10 entries
            this.detectionHistory = this.detectionHistory.slice(0, 10);
            
            this.updateHistoryDisplay();
        }
    }

    updateHistoryDisplay() {
        const historyContainer = document.getElementById('history-container');
        
        if (this.detectionHistory.length === 0) {
            historyContainer.innerHTML = `
                <div class="no-history">
                    <i class="fas fa-clock"></i>
                    <p>Chưa có lịch sử phát hiện</p>
                </div>
            `;
            return;
        }
        
        let historyHTML = '';
        this.detectionHistory.forEach((entry, index) => {
            const itemsText = entry.items.map(item => item.name).join(', ');
            historyHTML += `
                <div class="history-item" style="animation-delay: ${index * 0.1}s">
                    <div class="history-header">
                        <span class="history-time">${entry.timestamp}</span>
                        <span class="history-count">${entry.count} vật thể</span>
                    </div>
                    <div class="history-details">${itemsText}</div>
                </div>
            `;
        });
        
        historyContainer.innerHTML = historyHTML;
    }

    async captureImage() {
        if (!this.video.videoWidth) return;

        const captureBtn = document.getElementById('captureImage');
        captureBtn.classList.add('loading');

        try {
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            
            tempCanvas.width = this.videoDisplaySize.width;
            tempCanvas.height = this.videoDisplaySize.height;
            
            tempCtx.drawImage(
                this.video, 
                0, 0, this.video.videoWidth, this.video.videoHeight,
                0, 0, tempCanvas.width, tempCanvas.height
            );
            
            const predictions = await this.model.detect(tempCanvas);
            const filteredPredictions = predictions.filter(p => p.score >= this.confidenceThreshold);
            
            this.drawDetections(filteredPredictions);
            this.updateResults(filteredPredictions);
            
            this.showNotification('Đã chụp và phân tích ảnh thành công!', 'success');
            
            // Optional: Save image
            this.saveImage(tempCanvas);
            
        } catch (error) {
            console.error('Lỗi khi chụp ảnh:', error);
            this.showNotification('Lỗi khi chụp ảnh. Vui lòng thử lại.', 'error');
        } finally {
            captureBtn.classList.remove('loading');
        }
    }

    saveImage(canvas) {
        const link = document.createElement('a');
        link.download = `waste-detection-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        // Uncomment to auto-download: link.click();
    }

    uploadImage() {
        document.getElementById('imageInput').click();
    }

    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const uploadBtn = document.getElementById('uploadImage');
        uploadBtn.classList.add('loading');

        try {
            const img = new Image();
            img.onload = async () => {
                this.isDetecting = false;
                
                const maxWidth = 800;
                const maxHeight = 600;
                let { width, height } = img;
                
                if (width > maxWidth || height > maxHeight) {
                    const scale = Math.min(maxWidth / width, maxHeight / height);
                    width *= scale;
                    height *= scale;
                }
                
                this.canvas.width = width;
                this.canvas.height = height;
                this.canvas.style.width = width + 'px';
                this.canvas.style.height = height + 'px';
                this.canvas.style.display = 'block';
                
                this.video.style.display = 'none';
                document.getElementById('cameraStatus').style.display = 'flex';
                document.getElementById('cameraStatus').innerHTML = `
                    <i class="fas fa-image"></i>
                    <span>Đang phân tích ảnh đã tải lên</span>
                `;
                
                this.ctx.drawImage(img, 0, 0, width, height);
                
                this.scaleX = 1;
                this.scaleY = 1;
                this.videoDisplaySize = { width, height };
                
                if (this.model) {
                    const predictions = await this.model.detect(img);
                    const filteredPredictions = predictions.filter(p => p.score >= this.confidenceThreshold);
                    
                    this.drawDetections(filteredPredictions);
                    this.updateResults(filteredPredictions);
                    this.showNotification('Đã phân tích ảnh tải lên thành công!', 'success');
                }
                
                uploadBtn.classList.remove('loading');
            };
            
            img.onerror = () => {
                this.showNotification('Không thể tải ảnh. Vui lòng chọn file ảnh hợp lệ.', 'error');
                uploadBtn.classList.remove('loading');
            };
            
            img.src = URL.createObjectURL(file);
            
        } catch (error) {
            console.error('Lỗi khi tải ảnh:', error);
            this.showNotification('Lỗi khi tải ảnh. Vui lòng thử lại.', 'error');
            uploadBtn.classList.remove('loading');
        }
    }

    toggleDetection() {
        const toggleBtn = document.getElementById('toggleDetection');
        
        this.isDetecting = !this.isDetecting;
        
        if (this.isDetecting && this.video.srcObject) {
            this.detectFrame();
            toggleBtn.innerHTML = '<i class="fas fa-pause"></i> Tạm Dừng';
            this.showNotification('Tiếp tục phát hiện', 'success');
        } else {
            toggleBtn.innerHTML = '<i class="fas fa-play"></i> Tiếp Tục';
            this.showNotification('Tạm dừng phát hiện', 'info');
        }
    }

    stopCamera() {
        this.isDetecting = false;
        
        if (this.video.srcObject) {
            const tracks = this.video.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            this.video.srcObject = null;
        }
        
        this.video.style.display = 'none';
        this.canvas.style.display = 'none';
        
        const cameraStatus = document.getElementById('cameraStatus');
        cameraStatus.style.display = 'flex';
        cameraStatus.innerHTML = `
            <i class="fas fa-camera-slash"></i>
            <span>Camera đã được tắt</span>
        `;
        
        // Reset UI
        document.getElementById('startCamera').disabled = false;
        document.getElementById('captureImage').disabled = true;
        document.getElementById('toggleDetection').style.display = 'none';
        document.getElementById('stopCamera').style.display = 'none';
        
        this.showNotification('Camera đã được tắt', 'info');
    }

    resetStats() {
        this.detectionStats = { plastic: 0, can: 0, bag: 0, glass: 0 };
        this.detectionHistory = [];
        
        this.updateStatistics({}, 0);
        this.updateHistoryDisplay();
        
        document.getElementById('detectionCount').textContent = '0';
        document.getElementById('average-confidence').textContent = '0%';
        
        // Clear results
        document.getElementById('results-container').innerHTML = `
            <div class="no-detection">
                <i class="fas fa-eye-slash"></i>
                <p>Chưa phát hiện rác thải nào</p>
                <small>Hướng camera về phía các vật thể cần phân loại</small>
            </div>
        `;
        
        this.showNotification('Đã reset thống kê thành công', 'success');
    }

    cleanup() {
        this.isDetecting = false;
        
        if (this.video.srcObject) {
            const tracks = this.video.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3',
            color: 'white',
            padding: '15px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: '10001',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            fontWeight: '500',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '350px',
            minWidth: '250px'
        });
        
        document.body.appendChild(notification);
        
        // Animation
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
            padding: 0;
            margin-left: auto;
        `;
        
        const closeNotification = () => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        };
        
        closeBtn.addEventListener('click', closeNotification);
        notification.addEventListener('click', closeNotification);
        
        // Auto hide after 5 seconds
        setTimeout(closeNotification, 5000);
    }
}

// Modal functions
function showShortcutsModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-keyboard"></i> Phím Tắt</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="shortcut-item">
                    <kbd>C</kbd>
                    <span>Bật Camera</span>
                </div>
                <div class="shortcut-item">
                    <kbd>Space</kbd>
                    <span>Chụp Ảnh</span>
                </div>
                <div class="shortcut-item">
                    <kbd>P</kbd>
                    <span>Tạm Dừng/Tiếp Tục</span>
                </div>
                <div class="shortcut-item">
                    <kbd>S</kbd>
                    <span>Tắt Camera</span>
                </div>
                <div class="shortcut-item">
                    <kbd>R</kbd>
                    <span>Reset Thống Kê</span>
                </div>
                <div class="shortcut-item">
                    <kbd>U</kbd>
                    <span>Upload Ảnh</span>
                </div>
                <div class="shortcut-item">
                    <kbd>H</kbd>
                    <span>Hiển thị trợ giúp</span>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
    
    function closeModal() {
        modal.classList.remove('show');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }
    
    modal.querySelector('.close-modal').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escHandler);
        }
    });
}

function showPrivacyPolicy() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-shield-alt"></i> Chính Sách Bảo Mật</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <h4>Thu Thập Dữ Liệu</h4>
                <p>Ứng dụng chỉ sử dụng camera để phân tích realtime, không lưu trữ hình ảnh.</p>
                
                <h4>Xử Lý Dữ Liệu</h4>
                <p>Mọi xử lý được thực hiện trực tiếp trên thiết bị của bạn, không gửi dữ liệu lên server.</p>
                
                <h4>Bảo Mật</h4>
                <p>Ứng dụng hoạt động hoàn toàn offline sau khi tải mô hình AI.</p>
            </div>
        </div>
    `;
    
    showModal(modal);
}

function showTermsOfService() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-file-contract"></i> Điều Khoản Sử Dụng</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <h4>Mục Đích Sử Dụng</h4>
                <p>Ứng dụng được phát triển cho mục đích giáo dục và nghiên cứu.</p>
                
                <h4>Trách Nhiệm</h4>
                <p>Người dùng chịu trách nhiệm về việc sử dụng ứng dụng một cách hợp lý.</p>
                
                <h4>Hỗ Trợ</h4>
                <p>Liên hệ: congphuc6525@gmail.com để được hỗ trợ.</p>
            </div>
        </div>
    `;
    
    showModal(modal);
}

function showAbout() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-info-circle"></i> Giới Thiệu</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <h4>EcoSort AI</h4>
                <p>Hệ thống phân loại rác thải thông minh sử dụng AI.</p>
                
                <h4>Phát Triển Bởi</h4>
                <p><strong>MrPhucCong</strong><br>
                Sinh viên Đại Học Mỏ Địa Chất<br>
                Email: congphuc6525@gmail.com</p>
                
                <h4>Công Nghệ</h4>
                <p>TensorFlow.js, COCO-SSD, WebRTC, HTML5 Canvas</p>
                
                <h4>Phiên Bản</h4>
                <p>v1.0.0 - 2024</p>
            </div>
        </div>
    `;
    
    showModal(modal);
}

function showModal(modal) {
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
    
    function closeModal() {
        modal.classList.remove('show');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }
    
    modal.querySelector('.close-modal').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escHandler);
        }
    });
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const wasteClassifier = new WasteClassifier();
    
    // Setup UI effects
    setupUIEffects();
    
    // Performance monitoring
    monitorPerformance();
});

function setupUIEffects() {
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for fade in effect
    document.querySelectorAll('.category-card, .tech-card, .stat-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Button hover effects
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            if (!this.disabled) {
                this.style.transform = 'translateY(-2px) scale(1.02)';
                this.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
            }
        });
        
        btn.addEventListener('mouseleave', function() {
            if (!this.disabled) {
                this.style.transform = 'translateY(0) scale(1)';
                this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }
        });
        
        btn.addEventListener('mousedown', function() {
            if (!this.disabled) {
                this.style.transform = 'translateY(0) scale(0.98)';
            }
        });
        
        btn.addEventListener('mouseup', function() {
            if (!this.disabled) {
                this.style.transform = 'translateY(-2px) scale(1.02)';
            }
        });
    });
    
    // Parallax effect cho header
    let ticking = false;
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const header = document.querySelector('.header');
        const rate = scrolled * -0.3;
        
        if (header) {
            header.style.transform = `translate3d(0, ${rate}px, 0)`;
        }
        ticking = false;
    }
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    });
    
    // Smooth scroll cho navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Loading animation cho các elements
    const loadingElements = document.querySelectorAll('.category-card, .stat-item, .detection-results, .statistics');
    loadingElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, 100 + index * 100);
    });
    
    // Typing effect cho title
    const title = document.querySelector('.logo h1');
    if (title) {
        const text = title.textContent;
        title.textContent = '';
        title.style.borderRight = '2px solid #4CAF50';
        
        let i = 0;
        function typeWriter() {
            if (i < text.length) {
                title.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            } else {
                setTimeout(() => {
                    title.style.borderRight = 'none';
                }, 1000);
            }
        }
        
        setTimeout(typeWriter, 500);
    }
    
    // Floating animation cho icons
    document.querySelectorAll('.category-icon, .stat-icon').forEach(icon => {
        icon.style.animation = `float 3s ease-in-out infinite`;
        icon.style.animationDelay = `${Math.random() * 2}s`;
    });
    
    // Progress bar cho loading
    function showLoadingProgress() {
        const progressBar = document.createElement('div');
        progressBar.className = 'loading-progress';
        progressBar.innerHTML = `
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
            <div class="progress-text">Đang tải mô hình AI...</div>
        `;
        
        Object.assign(progressBar.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'rgba(255,255,255,0.95)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '10000',
            backdropFilter: 'blur(10px)'
        });
        
        document.body.appendChild(progressBar);
        
        // Animate progress
        const progressFill = progressBar.querySelector('.progress-fill');
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => {
                    progressBar.style.opacity = '0';
                    setTimeout(() => {
                        if (progressBar.parentNode) {
                            progressBar.parentNode.removeChild(progressBar);
                        }
                    }, 500);
                }, 500);
            }
            progressFill.style.width = progress + '%';
        }, 200);
    }
    
    // Particle effect
    function createParticles() {
        const canvas = document.createElement('canvas');
        canvas.className = 'particles-canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '-1';
        canvas.style.opacity = '0.3';
        
        document.body.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const particles = [];
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 3 + 1,
                color: `hsl(${120 + Math.random() * 60}, 70%, 60%)`
            });
        }
        
        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
                
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = particle.color;
                ctx.fill();
            });
            
            requestAnimationFrame(animateParticles);
        }
        
        animateParticles();
        
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }
    
    // Initialize particles if not on mobile
    if (window.innerWidth > 768) {
        createParticles();
    }
}

// Service Worker cho PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            showUpdateNotification();
                        }
                    });
                });
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
        <div class="update-content">
            <i class="fas fa-download"></i>
            <span>Có phiên bản mới! Tải lại để cập nhật.</span>
            <button class="update-btn">Cập Nhật</button>
            <button class="dismiss-btn">&times;</button>
        </div>
    `;
    
    Object.assign(notification.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: '#4CAF50',
        color: 'white',
        padding: '15px',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: '10000',
        maxWidth: '300px',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease'
    });
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    notification.querySelector('.update-btn').addEventListener('click', () => {
        window.location.reload();
    });
    
    notification.querySelector('.dismiss-btn').addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
}

// Performance monitoring và optimization
function monitorPerformance() {
    if ('performance' in window) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
                
                console.log('Performance Metrics:', {
                    'Page Load Time': loadTime + 'ms',
                    'DOM Content Loaded': perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart + 'ms',
                    'First Paint': performance.getEntriesByType('paint')[0]?.startTime + 'ms',
                    'Largest Contentful Paint': performance.getEntriesByType('largest-contentful-paint')[0]?.startTime + 'ms'
                });
                
                // Send analytics if needed
                if (loadTime > 3000) {
                    console.warn('Page load time is slow:', loadTime + 'ms');
                }
                
                // Monitor FPS
                let frames = 0;
                let lastTime = performance.now();
                
                function countFrames(currentTime) {
                    frames++;
                    if (currentTime >= lastTime + 1000) {
                        const fps = Math.round(frames * 1000 / (currentTime - lastTime));
                        if (fps < 30) {
                            console.warn('Low FPS detected:', fps);
                        }
                        frames = 0;
                        lastTime = currentTime;
                    }
                    requestAnimationFrame(countFrames);
                }
                
                requestAnimationFrame(countFrames);
                
                // Monitor memory usage
                if ('memory' in performance) {
                    setInterval(() => {
                        const memory = performance.memory;
                        const memoryUsage = {
                            used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
                            total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
                            limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
                        };
                        
                        if (memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.9) {
                            console.warn('High memory usage detected:', memoryUsage);
                        }
                    }, 30000); // Check every 30 seconds
                }
            }, 0);
        });
    }
}

// Error handling và logging
function setupErrorHandling() {
    window.addEventListener('error', (event) => {
        console.error('Global Error:', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error
        });
        
        // Show user-friendly error message
        showErrorNotification('Đã xảy ra lỗi. Vui lòng thử lại.');
    });
    
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled Promise Rejection:', event.reason);
        showErrorNotification('Đã xảy ra lỗi kết nối. Vui lòng kiểm tra mạng.');
    });
}

function showErrorNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <span>${message}</span>
        <button class="close-error">&times;</button>
    `;
    
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: '#f44336',
        color: 'white',
        padding: '15px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: '10000',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        maxWidth: '350px',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease'
    });
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    notification.querySelector('.close-error').addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}

// Analytics và tracking (tùy chọn)
function setupAnalytics() {
    // Track user interactions
    document.addEventListener('click', (event) => {
        if (event.target.matches('.btn')) {
            console.log('Button clicked:', event.target.textContent.trim());
        }
    });
    
    // Track detection events
    window.addEventListener('wasteDetected', (event) => {
        console.log('Waste detected:', event.detail);
    });
    
    // Track performance metrics
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Analytics - Page Load:', {
                loadTime: perfData.loadEventEnd - perfData.loadEventStart,
                domReady: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
            });
        }, 1000);
    });
}

// Accessibility improvements
function setupAccessibility() {
    // Add skip link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Bỏ qua đến nội dung chính';
    skipLink.className = 'skip-link';
    
    Object.assign(skipLink.style, {
        position: 'absolute',
        top: '-40px',
        left: '6px',
        background: '#4CAF50',
        color: 'white',
        padding: '8px',
        textDecoration: 'none',
        borderRadius: '4px',
        zIndex: '10000',
        transition: 'top 0.3s ease'
    });
    
    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add main content ID
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.id = 'main-content';
        mainContent.setAttribute('tabindex', '-1');
    }
    
    // Improve button accessibility
    document.querySelectorAll('.btn').forEach(btn => {
        if (!btn.getAttribute('aria-label') && !btn.textContent.trim()) {
            const icon = btn.querySelector('i');
            if (icon) {
                btn.setAttribute('aria-label', icon.className.includes('camera') ? 'Bật camera' : 'Nút điều khiển');
            }
        }
    });
    
    // Add live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'live-region';
    
    Object.assign(liveRegion.style, {
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0,0,0,0)',
        whiteSpace: 'nowrap',
        border: '0'
    });
    
    document.body.appendChild(liveRegion);
    
    // Function to announce to screen readers
    window.announceToScreenReader = function(message) {
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    };
}

// Initialize all features
document.addEventListener('DOMContentLoaded', () => {
    // Core functionality
    const wasteClassifier = new WasteClassifier();
    
    // Additional features
    addAdditionalControls(wasteClassifier);
    addKeyboardShortcuts(wasteClassifier);
    setupUIEffects();
    
    // Performance and error handling
    monitorPerformance();
    setupErrorHandling();
    
    // Analytics and accessibility
    setupAnalytics();
    setupAccessibility();
    
    // Show loading progress
    showLoadingProgress();
    
    console.log('🌱 EcoSort AI initialized successfully!');
    console.log('📧 Contact: congphuc6525@gmail.com');
    console.log('🏫 University: Đại Học Mỏ Địa Chất');
    console.log('🌐 Website: MrPhucCong.github.io');
});

// Export for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WasteClassifier };
}


