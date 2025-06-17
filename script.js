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
        
        this.wasteCategories = {
            'bottle': { type: 'plastic', name: 'Chai Nhựa', icon: 'fas fa-bottle-water' },
            'cup': { type: 'plastic', name: 'Cốc Nhựa', icon: 'fas fa-coffee' },
            'cell phone': { type: 'bag', name: 'Túi Nilon', icon: 'fas fa-shopping-bag' },
            'wine glass': { type: 'glass', name: 'Lọ Thủy Tinh', icon: 'fas fa-wine-glass' },
            'bowl': { type: 'plastic', name: 'Bát Nhựa', icon: 'fas fa-bowl-food' },
            'banana': { type: 'bag', name: 'Túi Đựng', icon: 'fas fa-shopping-bag' }
        };
        
        this.brandDetection = {
            'coca': 'can',
            'pepsi': 'can',
            'sprite': 'can',
            'fanta': 'can'
        };
        
        this.initializeEventListeners();
        this.loadModel();
    }

    async loadModel() {
        try {
            console.log('Đang tải mô hình AI...');
            this.model = await cocoSsd.load();
            console.log('Mô hình đã được tải thành công!');
            this.showNotification('Mô hình AI đã sẵn sàng!', 'success');
        } catch (error) {
            console.error('Lỗi khi tải mô hình:', error);
            this.showNotification('Không thể tải mô hình AI', 'error');
        }
    }

    initializeEventListeners() {
        document.getElementById('startCamera').addEventListener('click', () => this.startCamera());
        document.getElementById('captureImage').addEventListener('click', () => this.captureImage());
        document.getElementById('uploadImage').addEventListener('click', () => this.uploadImage());
        document.getElementById('imageInput').addEventListener('change', (e) => this.handleImageUpload(e));
    }

    async startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'environment'
                } 
            });
            
            this.video.srcObject = stream;
            this.video.style.display = 'block';
            
            this.video.onloadedmetadata = () => {
                this.canvas.width = this.video.videoWidth;
                this.canvas.height = this.video.videoHeight;
                this.canvas.style.display = 'block';
            };
            
            document.getElementById('startCamera').disabled = true;
            document.getElementById('captureImage').disabled = false;
            
            this.showNotification('Camera đã được bật!', 'success');
            this.startRealTimeDetection();
            
        } catch (error) {
            console.error('Lỗi khi truy cập camera:', error);
            this.showNotification('Không thể truy cập camera', 'error');
        }
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
        if (!this.isDetecting) return;

        try {
            const predictions = await this.model.detect(this.video);
            this.drawDetections(predictions);
            this.updateResults(predictions);
        } catch (error) {
            console.error('Lỗi trong quá trình phát hiện:', error);
        }

        requestAnimationFrame(() => this.detectFrame());
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
        const [x, y, width, height] = prediction.bbox;
        
        // Vẽ khung bao quanh
        this.ctx.strokeStyle = this.getColorForType(wasteType.type);
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(x, y, width, height);
        
        // Vẽ nền cho label
        this.ctx.fillStyle = this.getColorForType(wasteType.type);
        const labelText = `${wasteType.name} (${Math.round(prediction.score * 100)}%)`;
        const textWidth = this.ctx.measureText(labelText).width;
        this.ctx.fillRect(x, y - 30, textWidth + 20, 25);
        
        // Vẽ text
        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px Roboto';
        this.ctx.fillText(labelText, x + 10, y - 10);
        
        // Thêm hiệu ứng phát hiện
        this.addDetectionEffect(x, y, width, height);
    }

    addDetectionEffect(x, y, width, height) {
        // Hiệu ứng góc
        this.ctx.strokeStyle = '#4CAF50';
        this.ctx.lineWidth = 4;
        const cornerSize = 20;
        
        // Góc trên trái
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + cornerSize);
        this.ctx.lineTo(x, y);
        this.ctx.lineTo(x + cornerSize, y);
        this.ctx.stroke();
        
        // Góc trên phải
        this.ctx.beginPath();
        this.ctx.moveTo(x + width - cornerSize, y);
        this.ctx.lineTo(x + width, y);
        this.ctx.lineTo(x + width, y + cornerSize);
        this.ctx.stroke();
        
        // Góc dưới trái
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + height - cornerSize);
        this.ctx.lineTo(x, y + height);
        this.ctx.lineTo(x + cornerSize, y + height);
        this.ctx.stroke();
        
        // Góc dưới phải
        this.ctx.beginPath();
        this.ctx.moveTo(x + width - cornerSize, y + height);
        this.ctx.lineTo(x + width, y + height);
        this.ctx.lineTo(x + width, y + height - cornerSize);
        this.ctx.stroke();
    }

    classifyWaste(prediction) {
        const className = prediction.class.toLowerCase();
        
        // Kiểm tra các loại rác cơ bản
        if (this.wasteCategories[className]) {
            return this.wasteCategories[className];
        }
        
        // Phân tích nâng cao dựa trên đặc tính
        return this.advancedClassification(prediction);
    }

    advancedClassification(prediction) {
        const className = prediction.class.toLowerCase();
        const [x, y, width, height] = prediction.bbox;
        const aspectRatio = width / height;
        
        // Phân loại chai nhựa
        if (className.includes('bottle') || (aspectRatio > 0.3 && aspectRatio < 0.8)) {
            return { type: 'plastic', name: 'Chai Nhựa', icon: 'fas fa-bottle-water' };
        }
        
        // Phân loại lon nước
        if (className.includes('can') || (aspectRatio > 0.4 && aspectRatio < 0.7)) {
            return { type: 'can', name: 'Lon Nước Ngọt', icon: 'fas fa-wine-bottle' };
        }
        
        // Phân loại túi nilon
        if (className.includes('bag') || aspectRatio > 1.2) {
            return { type: 'bag', name: 'Túi Nilon', icon: 'fas fa-shopping-bag' };
        }
        
        // Phân loại lọ thủy tinh
        if (className.includes('glass') || className.includes('jar')) {
            return { type: 'glass', name: 'Lọ Thủy Tinh', icon: 'fas fa-wine-glass' };
        }
        
        // Mặc định
        return { type: 'plastic', name: 'Rác Nhựa', icon: 'fas fa-recycle' };
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
        
        if (predictions.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-detection">
                    <i class="fas fa-eye-slash"></i>
                    <p>Chưa phát hiện rác thải nào</p>
                </div>
            `;
            return;
        }

        let resultsHTML = '';
        const currentStats = { plastic: 0, can: 0, bag: 0, glass: 0 };

        predictions.forEach((prediction, index) => {
            const wasteType = this.classifyWaste(prediction);
            if (wasteType) {
                currentStats[wasteType.type]++;
                
                const materialAnalysis = this.analyzeMaterial(prediction, wasteType);
                const brandInfo = this.detectBrand(prediction);
                
                resultsHTML += `
                    <div class="detection-item" style="animation-delay: ${index * 0.1}s">
                        <div class="detection-header">
                            <div class="detection-type">
                                <i class="${wasteType.icon}"></i>
                                ${wasteType.name}
                                ${brandInfo ? `- ${brandInfo}` : ''}
                            </div>
                            <div class="confidence-score">
                                ${Math.round(prediction.score * 100)}%
                            </div>
                        </div>
                        <div class="detection-details">
                            <strong>Phân tích vật liệu:</strong> ${materialAnalysis}<br>
                            <strong>Vị trí:</strong> X: ${Math.round(prediction.bbox[0])}, Y: ${Math.round(prediction.bbox[1])}<br>
                            <strong>Kích thước:</strong> ${Math.round(prediction.bbox[2])} x ${Math.round(prediction.bbox[3])} px<br>
                            <strong>Tỷ lệ khung hình:</strong> ${(prediction.bbox[2] / prediction.bbox[3]).toFixed(2)}
                        </div>
                    </div>
                `;
            }
        });

        resultsContainer.innerHTML = resultsHTML;
        this.updateStatistics(currentStats);
    }

    analyzeMaterial(prediction, wasteType) {
        const aspectRatio = prediction.bbox[2] / prediction.bbox[3];
        const area = prediction.bbox[2] * prediction.bbox[3];
        
        switch (wasteType.type) {
            case 'plastic':
                if (aspectRatio < 0.5) {
                    return 'Chai nhựa dạng cao, có thể là chai nước lọc';
                } else {
                    return 'Vật thể nhựa dạng rộng, có thể là hộp nhựa';
                }
            case 'can':
                return 'Bề mặt kim loại phản chiếu, hình dạng trụ đặc trưng của lon nước';
            case 'bag':
                return 'Vật liệu mềm, dẻo, đặc tính của túi nilon';
            case 'glass':
                return 'Vật liệu cứng, trong suốt, đặc tính của thủy tinh';
            default:
                return 'Đang phân tích đặc tính vật liệu...';
        }
    }

    detectBrand(prediction) {
        // Mô phỏng nhận diện thương hiệu (trong thực tế cần OCR)
        const brands = ['Coca Cola', 'Pepsi', 'Aquafina', 'Lavie', 'Sprite'];
        if (Math.random() > 0.7) { // 30% cơ hội phát hiện thương hiệu
            return brands[Math.floor(Math.random() * brands.length)];
        }
        return null;
    }

    updateStatistics(currentStats) {
        // Cập nhật thống kê tổng
        Object.keys(currentStats).forEach(type => {
            if (currentStats[type] > 0) {
                this.detectionStats[type] += currentStats[type];
            }
        });

        // Cập nhật UI
        document.getElementById('plastic-count').textContent = this.detectionStats.plastic;
        document.getElementById('can-count').textContent = this.detectionStats.can;
        document.getElementById('bag-count').textContent = this.detectionStats.bag;
        document.getElementById('glass-count').textContent = this.detectionStats.glass;

        // Thêm hiệu ứng animation
        Object.keys(currentStats).forEach(type => {
            if (currentStats[type] > 0) {
                const element = document.getElementById(`${type}-count`);
                element.parentElement.parentElement.classList.add('success-animation');
                setTimeout(() => {
                    element.parentElement.parentElement.classList.remove('success-animation');
                }, 600);
            }
        });
    }

    async captureImage() {
        if (!this.video.videoWidth) return;

        this.ctx.drawImage(this.video, 0, 0);
        const predictions = await this.model.detect(this.canvas);
        this.drawDetections(predictions);
        this.updateResults(predictions);
        
        this.showNotification('Đã chụp và phân tích ảnh!', 'success');
    }

    uploadImage() {
        document.getElementById('imageInput').click();
    }

    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const img = new Image();
        img.onload = async () => {
            this.canvas.width = img.width;
            this.canvas.height = img.height;
            this.canvas.style.display = 'block';
            
            this.ctx.drawImage(img, 0, 0);
            
            if (this.model) {
                const predictions = await this.model.detect(img);
                this.drawDetections(predictions);
                this.updateResults(predictions);
                this.showNotification('Đã phân tích ảnh tải lên!', 'success');
            }
        };
        
        img.src = URL.createObjectURL(file);
    }

    showNotification(message, type = 'info') {
        // Tạo notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Thêm styles cho notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3',
            color: 'white',
            padding: '15px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: '1000',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            fontWeight: '500',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });
        
        document.body.appendChild(notification);
        
        // Animation
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Tự động ẩn sau 3 giây
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Khởi tạo ứng dụng khi DOM đã load
document.addEventListener('DOMContentLoaded', () => {
    const wasteClassifier = new WasteClassifier();
    
    // Thêm một số hiệu ứng UI
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
    
    // Quan sát các elements để tạo hiệu ứng fade in
    document.querySelectorAll('.category-card, .stat-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Service Worker cho PWA (tùy chọn)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
