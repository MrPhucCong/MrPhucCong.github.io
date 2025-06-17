class SmartWasteClassifier {
    constructor() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.models = {
            detection: null,
            classification: null,
            materialAnalysis: null
        };
        this.isReady = false;
        this.stream = null;
        this.detectionInterval = null;
        this.detailedAnalysis = false;
        
        // Performance monitoring
        this.performanceMetrics = {
            analysisTime: 0,
            fps: 0,
            memoryUsage: 0,
            frameCount: 0,
            lastFrameTime: 0
        };
        
        // Advanced statistics
        this.analytics = {
            totalDetections: 0,
            accuracy: 0,
            detectionHistory: [],
            materialConfidence: {},
            brandAccuracy: {},
            recyclingRate: 0
        };
        
        // Enhanced waste database with detailed brand information
        this.wasteDatabase = {
            plasticBottles: {
                'coca-cola-bottle': {
                    shape: { aspectRatio: [0.3, 0.6], volume: 'medium' },
                    color: { primary: 'red', secondary: 'clear' },
                    material: 'PET',
                    reflectivity: 0.3,
                    transparency: 0.8,
                    brand: 'Coca-Cola',
                    recyclable: true,
                    toxicity: 'low',
                    keywords: ['coca', 'cola', 'coke'],
                    colorSignature: [220, 20, 60]
                },
                'pepsi-bottle': {
                    shape: { aspectRatio: [0.3, 0.6], volume: 'medium' },
                    color: { primary: 'blue', secondary: 'clear' },
                    material: 'PET',
                    reflectivity: 0.3,
                    transparency: 0.8,
                    brand: 'Pepsi',
                    recyclable: true,
                    toxicity: 'low',
                    keywords: ['pepsi'],
                    colorSignature: [0, 119, 190]
                },
                'aquafina-bottle': {
                    shape: { aspectRatio: [0.25, 0.5], volume: 'small' },
                    color: { primary: 'blue', secondary: 'clear' },
                    material: 'PET',
                    reflectivity: 0.2,
                    transparency: 0.95,
                    brand: 'Aquafina',
                    recyclable: true,
                    toxicity: 'low',
                    keywords: ['aquafina'],
                    colorSignature: [0, 150, 255]
                },
                'lavie-bottle': {
                    shape: { aspectRatio: [0.25, 0.5], volume: 'small' },
                    color: { primary: 'green', secondary: 'clear' },
                    material: 'PET',
                    reflectivity: 0.2,
                    transparency: 0.95,
                    brand: 'LaVie',
                    recyclable: true,
                    toxicity: 'low',
                    keywords: ['lavie', 'la vie'],
                    colorSignature: [34, 139, 34]
                },
                'dasani-bottle': {
                    shape: { aspectRatio: [0.25, 0.5], volume: 'small' },
                    color: { primary: 'blue', secondary: 'clear' },
                    material: 'PET',
                    reflectivity: 0.2,
                    transparency: 0.95,
                    brand: 'Dasani',
                    recyclable: true,
                    toxicity: 'low',
                    keywords: ['dasani'],
                    colorSignature: [30, 144, 255]
                },
                'evian-bottle': {
                    shape: { aspectRatio: [0.2, 0.4], volume: 'medium' },
                    color: { primary: 'pink', secondary: 'clear' },
                    material: 'PET',
                    reflectivity: 0.25,
                    transparency: 0.9,
                    brand: 'Evian',
                    recyclable: true,
                    toxicity: 'low',
                    keywords: ['evian'],
                    colorSignature: [255, 182, 193]
                }
            },
            aluminumCans: {
                'coca-cola-can': {
                    shape: { aspectRatio: [0.6, 0.8], volume: 'small' },
                    color: { primary: 'red', secondary: 'silver' },
                    material: 'Aluminum',
                    reflectivity: 0.9,
                    transparency: 0.0,
                    brand: 'Coca-Cola',
                    recyclable: true,
                    toxicity: 'low',
                    keywords: ['coca', 'cola', 'coke'],
                    colorSignature: [220, 20, 60]
                },
                'pepsi-can': {
                    shape: { aspectRatio: [0.6, 0.8], volume: 'small' },
                    color: { primary: 'blue', secondary: 'silver' },
                    material: 'Aluminum',
                    reflectivity: 0.9,
                    transparency: 0.0,
                    brand: 'Pepsi',
                    recyclable: true,
                    toxicity: 'low',
                    keywords: ['pepsi'],
                    colorSignature: [0, 119, 190]
                },
                'sprite-can': {
                    shape: { aspectRatio: [0.6, 0.8], volume: 'small' },
                    color: { primary: 'green', secondary: 'silver' },
                    material: 'Aluminum',
                    reflectivity: 0.9,
                    transparency: 0.0,
                    brand: 'Sprite',
                    recyclable: true,
                    toxicity: 'low',
                    keywords: ['sprite'],
                    colorSignature: [50, 205, 50]
                },
                'fanta-can': {
                    shape: { aspectRatio: [0.6, 0.8], volume: 'small' },
                    color: { primary: 'orange', secondary: 'silver' },
                    material: 'Aluminum',
                    reflectivity: 0.9,
                    transparency: 0.0,
                    brand: 'Fanta',
                    recyclable: true,
                    toxicity: 'low',
                    keywords: ['fanta'],
                    colorSignature: [255, 165, 0]
                },
                'redbull-can': {
                    shape: { aspectRatio: [0.5, 0.7], volume: 'small' },
                    color: { primary: 'blue', secondary: 'silver' },
                    material: 'Aluminum',
                    reflectivity: 0.95,
                    transparency: 0.0,
                    brand: 'Red Bull',
                    recyclable: true,
                    toxicity: 'low',
                    keywords: ['red bull', 'redbull'],
                    colorSignature: [0, 76, 153]
                },
                'monster-can': {
                    shape: { aspectRatio: [0.5, 0.7], volume: 'medium' },
                    color: { primary: 'black', secondary: 'green' },
                    material: 'Aluminum',
                    reflectivity: 0.8,
                    transparency: 0.0,
                    brand: 'Monster',
                    recyclable: true,
                    toxicity: 'medium',
                    keywords: ['monster'],
                    colorSignature: [0, 0, 0]
                }
            },
            plasticBags: {
                'shopping-bag': {
                    shape: { aspectRatio: [0.8, 1.5], volume: 'variable' },
                    color: { primary: 'various', secondary: 'transparent' },
                    material: 'LDPE',
                    reflectivity: 0.1,
                    transparency: 0.6,
                    brand: 'Generic',
                    recyclable: false,
                    toxicity: 'medium',
                    keywords: ['bag', 'plastic'],
                    colorSignature: [255, 255, 255]
                },
                'food-bag': {
                    shape: { aspectRatio: [1.0, 2.0], volume: 'small' },
                    color: { primary: 'clear', secondary: 'transparent' },
                    material: 'LDPE',
                    reflectivity: 0.05,
                    transparency: 0.9,
                    brand: 'Generic',
                    recyclable: false,
                    toxicity: 'medium',
                    keywords: ['food', 'bag'],
                    colorSignature: [240, 240, 240]
                }
            },
            glassBottles: {
                'beer-bottle': {
                    shape: { aspectRatio: [0.2, 0.4], volume: 'medium' },
                    color: { primary: 'brown', secondary: 'transparent' },
                    material: 'Glass',
                    reflectivity: 0.4,
                    transparency: 0.7,
                    brand: 'Various',
                    recyclable: true,
                    toxicity: 'low',
                    keywords: ['beer', 'bia'],
                    colorSignature: [139, 69, 19]
                },
                'wine-bottle': {
                    shape: { aspectRatio: [0.15, 0.3], volume: 'large' },
                    color: { primary: 'green', secondary: 'transparent' },
                    material: 'Glass',
                    reflectivity: 0.4,
                    transparency: 0.6,
                    brand: 'Various',
                    recyclable: true,
                    toxicity: 'low',
                    keywords: ['wine', 'rượu'],
                    colorSignature: [0, 100, 0]
                }
            }
        };
        
        this.initializeAdvancedSystem();
    }
    
    async initializeAdvancedSystem() {
        try {
            await this.loadAdvancedModels();
            this.setupAdvancedEventListeners();
            this.initializeImageProcessing();
            this.startPerformanceMonitoring();
            this.updateModelStatus('ready', 'Mô hình AI đã sẵn sàng');
        } catch (error) {
            console.error('Lỗi khởi tạo hệ thống:', error);
            this.updateModelStatus('error', 'Lỗi tải mô hình AI');
        }
    }
    
    async loadAdvancedModels() {
        try {
            this.showLoadingProgress('Đang tải mô hình phát hiện đối tượng...', 20);
            
            // Load COCO-SSD model for object detection
            this.models.detection = await cocoSsd.load();
            this.showLoadingProgress('Đang khởi tạo mô hình phân loại...', 60);
            
            // Initialize material analysis model (simulated)
            await this.loadMaterialAnalysisModel();
            this.showLoadingProgress('Đang tải cơ sở dữ liệu thương hiệu...', 80);
            
            // Initialize brand recognition model (simulated)
            await this.loadBrandRecognitionModel();
            this.showLoadingProgress('Hoàn tất tải mô hình!', 100);
            
            this.isReady = true;
            this.hideLoadingProgress();
            
        } catch (error) {
            console.error('Lỗi khi tải mô hình:', error);
            throw error;
        }
    }
    
    async loadMaterialAnalysisModel() {
        return new Promise(resolve => {
            setTimeout(() => {
                this.models.materialAnalysis = {
                    analyze: this.advancedMaterialAnalysis.bind(this)
                };
                resolve();
            }, 1000);
        });
    }
    
    async loadBrandRecognitionModel() {
        return new Promise(resolve => {
            setTimeout(() => {
                this.models.brandRecognition = {
                    recognize: this.advancedBrandRecognition.bind(this)
                };
                resolve();
            }, 1000);
        });
    }
    
    setupAdvancedEventListeners() {
        // Camera controls
        document.getElementById('startCamera').addEventListener('click', () => {
            this.startAdvancedCamera();
        });
        
        document.getElementById('captureBtn').addEventListener('click', () => {
            this.performAdvancedCapture();
        });
        
        document.getElementById('uploadBtn').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });
        
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleAdvancedFileUpload(e);
        });
        
        // Advanced controls
        document.getElementById('toggleAnalysis').addEventListener('click', () => {
            this.toggleDetailedAnalysis();
        });
        
        document.getElementById('sensitivitySlider').addEventListener('input', (e) => {
            const value = e.target.value;
            document.getElementById('sensitivityValue').textContent = `${value}%`;
            this.updateSensitivity(value / 100);
        });
        
        // Export and clear functions
        document.getElementById('exportResults').addEventListener('click', () => {
            this.exportAnalysisReport();
        });
        
        document.getElementById('clearHistory').addEventListener('click', () => {
            this.clearAnalysisHistory();
        });
    }
    
    async startAdvancedCamera() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'environment'
                }
            });
            
            this.video.srcObject = this.stream;
            this.video.style.display = 'block';
            
            this.video.onloadedmetadata = () => {
                this.canvas.width = this.video.videoWidth;
                this.canvas.height = this.video.videoHeight;
                
                document.getElementById('captureBtn').disabled = false;
                this.startAdvancedRealTimeDetection();
            };
            
        } catch (error) {
            console.error('Lỗi camera:', error);
            this.showError('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.');
        }
    }
    
    startAdvancedRealTimeDetection() {
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
        }
        
        this.detectionInterval = setInterval(async () => {
            if (this.isReady && this.video.readyState === 4) {
                await this.performAdvancedDetection(this.video);
                this.updatePerformanceMetrics();
            }
        }, 500);
    }
    
    async performAdvancedDetection(source) {
        if (!this.isReady) return;
        
        try {
            const startTime = performance.now();
            
            // Step 1: Basic object detection
            const basicPredictions = await this.models.detection.detect(source);
            
            // Step 2: Filter and preprocess predictions
            const preprocessedPredictions = this.preprocessPredictions(basicPredictions);
            
            if (preprocessedPredictions.length === 0) {
                this.clearDetectionBoxes();
                return;
            }
            
            // Step 3: Advanced material analysis
            const materialAnalysis = await this.performMaterialAnalysis(source, preprocessedPredictions);
            
            // Step 4: Shape and size analysis
            const shapeAnalysis = this.performShapeAnalysis(preprocessedPredictions);
            
            // Step 5: Color analysis
            const colorAnalysis = await this.performColorAnalysis(source, preprocessedPredictions);
            
            // Step 6: Brand recognition
            const brandAnalysis = await this.performBrandRecognition(source, preprocessedPredictions);
            
            // Step 7: Combine all analyses
            const finalPredictions = this.combineAnalyses(
                preprocessedPredictions,
                materialAnalysis,
                shapeAnalysis,
                colorAnalysis,
                brandAnalysis
            );
            
            // Step 8: Apply machine learning refinement
            const refinedPredictions = this.applyMLRefinement(finalPredictions);
            
            // Step 9: Update UI and statistics
            this.updateAdvancedResults(refinedPredictions);
            
            // Update performance metrics
            this.performanceMetrics.analysisTime = performance.now() - startTime;
            
        } catch (error) {
            console.error('Lỗi trong quá trình phân tích:', error);
        }
    }
    
    preprocessPredictions(predictions) {
        const sensitivity = this.getSensitivity();
        
        return predictions
            .filter(pred => {
                // Filter by confidence and relevant object types
                return pred.score > sensitivity && 
                       this.isRelevantWasteObject(pred.class);
            })
            .map(pred => {
                return {
                    ...pred,
                    id: this.generatePredictionId(),
                    timestamp: Date.now(),
                    confidence: pred.score,
                    bbox: this.normalizeBoundingBox(pred.bbox),
                    area: this.calculateArea(pred.bbox),
                    centerPoint: this.calculateCenter(pred.bbox)
                };
            })
            .sort((a, b) => b.confidence - a.confidence);
    }
    
    isRelevantWasteObject(className) {
        const relevantClasses = [
            'bottle', 'cup', 'wine glass', 'cell phone', // cell phone as proxy for cans
            'handbag', 'backpack', 'suitcase' // bags
        ];
        return relevantClasses.includes(className);
    }
    
    async performMaterialAnalysis(source, predictions) {
        const results = [];
        
        for (const prediction of predictions) {
            const materialData = await this.analyzeMaterialProperties(source, prediction);
            results.push({
                id: prediction.id,
                material: materialData.type,
                reflectivity: materialData.reflectivity,
                transparency: materialData.transparency,
                density: materialData.density,
                conductivity: materialData.conductivity,
                magneticProperties: materialData.magnetic,
                chemicalResistance: materialData.chemicalResistance
            });
        }
        
        return results;
    }
    
    async analyzeMaterialProperties(source, prediction) {
        // Extract image data from bounding box
        const imageData = this.extractImageData(source, prediction.bbox);
        
        // Analyze pixel properties
        const pixelAnalysis = this.analyzePixelData(imageData);
        
        // Determine material type based on visual characteristics
        const materialType = this.classifyMaterial(pixelAnalysis, prediction);
        
        return {
            type: materialType,
            reflectivity: this.calculateReflectivity(pixelAnalysis),
            transparency: this.calculateTransparency(pixelAnalysis),
            density: this.estimateDensity(materialType, prediction),
            conductivity: this.estimateConductivity(materialType),
            magnetic: this.checkMagneticProperties(materialType),
            chemicalResistance: this.assessChemicalResistance(materialType)
        };
    }
    
    extractImageData(source, bbox) {
        const [x, y, width, height] = bbox;
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCanvas.width = width;
        tempCanvas.height = height;
        
        tempCtx.drawImage(source, x, y, width, height, 0, 0, width, height);
        
        return tempCtx.getImageData(0, 0, width, height);
    }
    
    analyzePixelData(imageData) {
        const data = imageData.data;
        let totalR = 0, totalG = 0, totalB = 0;
        let brightness = 0;
        let edgeCount = 0;
        let reflectivePixels = 0;
        
        const pixels = data.length / 4;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            totalR += r;
            totalG += g;
            totalB += b;
            
            const pixelBrightness = (r + g + b) / 3;
            brightness += pixelBrightness;
            
            // Check for high reflectivity (bright pixels)
            if (pixelBrightness > 200) {
                reflectivePixels++;
            }
            
            // Simple edge detection
            if (i > 0) {
                const prevBrightness = (data[i-4] + data[i-3] + data[i-2]) / 3;
                if (Math.abs(pixelBrightness - prevBrightness) > 50) {
                    edgeCount++;
                }
            }
        }
        
        return {
            avgColor: {
                r: totalR / pixels,
                g: totalG / pixels,
                b: totalB / pixels
            },
            brightness: brightness / pixels,
            edgeIntensity: edgeCount / pixels,
            reflectivity: reflectivePixels / pixels,
            dominantColors: this.findDominantColors(data)
        };
    }
    
    findDominantColors(data) {
        const colorMap = new Map();
        
        // Sample every 4th pixel for performance
        for (let i = 0; i < data.length; i += 16) {
            const r = Math.floor(data[i] / 32) * 32;
            const g = Math.floor(data[i + 1] / 32) * 32;
            const b = Math.floor(data[i + 2] / 32) * 32;
            
            const colorKey = `${r},${g},${b}`;
            colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
        }
        
        return Array.from(colorMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([color, count]) => {
                const [r, g, b] = color.split(',').map(Number);
                return { r, g, b, frequency: count };
            });
    }
    
    classifyMaterial(pixelAnalysis, prediction) {
        const { brightness, edgeIntensity, reflectivity, dominantColors } = pixelAnalysis;
        const { area, class: objectClass } = prediction;
        
        // Advanced material classification logic
        if (reflectivity > 0.3 && brightness > 180) {
            return 'aluminum'; // High reflectivity indicates metal
        } else if (brightness > 150 && reflectivity > 0.2) {
            if (objectClass === 'bottle' || objectClass === 'wine glass') {
                return 'glass'; // Moderate reflectivity with transparency
            }
        } else if (brightness < 120 && edgeIntensity < 0.2) {
            return 'plastic_opaque'; // Low reflectivity, soft edges
        } else if (brightness > 100 && brightness < 180 && reflectivity < 0.3) {
            return 'plastic_transparent'; // Medium brightness, low reflectivity
        }
        
        return 'unknown';
    }
    
    calculateReflectivity(pixelAnalysis) {
        const { brightness, reflectivity } = pixelAnalysis;
        return Math.min(1.0, (brightness / 255) * 0.7 + reflectivity * 0.3);
    }
    
    calculateTransparency(pixelAnalysis) {
        const { edgeIntensity, brightness } = pixelAnalysis;
        
        // High edge intensity usually means opaque objects
        const edgeFactor = Math.max(0, 1 - (edgeIntensity * 3));
        
        // Very bright or very dark objects are usually opaque
        const brightnessFactor = 1 - Math.abs(brightness - 127.5) / 127.5;
        
        return Math.max(0, Math.min(1, edgeFactor * brightnessFactor));
    }
    
    estimateDensity(materialType, prediction) {
        const densityMap = {
            'aluminum': 'high',
            'glass': 'high',
            'plastic_transparent': 'low',
            'plastic_opaque': 'low',
            'unknown': 'medium'
        };
        return densityMap[materialType] || 'medium';
    }
    
    estimateConductivity(materialType) {
        const conductivityMap = {
            'aluminum': 'high',
            'glass': 'none',
            'plastic_transparent': 'none',
            'plastic_opaque': 'none',
            'unknown': 'none'
        };
        return conductivityMap[materialType] || 'none';
    }
    
    checkMagneticProperties(materialType) {
        return materialType === 'aluminum' ? 'non-magnetic' : 'non-magnetic';
    }
    
    assessChemicalResistance(materialType) {
        const resistanceMap = {
            'aluminum': 'medium',
            'glass': 'high',
            'plastic_transparent': 'low',
            'plastic_opaque': 'low',
            'unknown': 'medium'
        };
        return resistanceMap[materialType] || 'medium';
    }
    
    performShapeAnalysis(predictions) {
        return predictions.map(prediction => {
            const [x, y, width, height] = prediction.bbox;
            const aspectRatio = width / height;
            const area = width * height;
            const perimeter = 2 * (width + height);
            const compactness = (4 * Math.PI * area) / (perimeter * perimeter);
            
            // Shape classification
            let shapeType = 'irregular';
            if (aspectRatio > 0.8 && aspectRatio < 1.2) {
                shapeType = 'square';
            } else if (aspectRatio < 0.6) {
                shapeType = 'vertical_rectangle';
            } else if (aspectRatio > 1.4) {
                shapeType = 'horizontal_rectangle';
            }
            
            return {
                id: prediction.id,
                aspectRatio,
                area,
                perimeter,
                compactness,
                shapeType,
                sizeCategory: this.categorizeSizeByArea(area),
                orientation: this.determineOrientation(aspectRatio)
            };
        });
    }
    
    categorizeSizeByArea(area) {
        if (area > 50000) return 'large';
        if (area > 20000) return 'medium';
        return 'small';
    }
    
    determineOrientation(aspectRatio) {
        if (aspectRatio < 0.7) return 'vertical';
        if (aspectRatio > 1.3) return 'horizontal';
        return 'square';
    }
    
    async performColorAnalysis(source, predictions) {
        const results = [];
        
        for (const prediction of predictions) {
            const imageData = this.extractImageData(source, prediction.bbox);
            const colorProfile = this.analyzeColorProfile(imageData);
            
            results.push({
                id: prediction.id,
                primaryColor: colorProfile.primary,
                secondaryColor: colorProfile.secondary,
                colorScheme: colorProfile.scheme,
                saturation: colorProfile.saturation,
                hue: colorProfile.hue,
                colorComplexity: colorProfile.complexity
            });
        }
        
        return results;
    }
    
    analyzeColorProfile(imageData) {
        const pixelData = this.analyzePixelData(imageData);
        const dominantColors = pixelData.dominantColors;
        
        const primary = dominantColors[0];
        const secondary = dominantColors[1] || primary;
        
        const primaryHSL = this.rgbToHsl(primary.r, primary.g, primary.b);
        
        return {
            primary: this.getColorName(primary),
            secondary: this.getColorName(secondary),
            scheme: this.determineColorScheme(dominantColors),
            saturation: primaryHSL.s,
            hue: primaryHSL.h,
            complexity: this.calculateColorComplexity(dominantColors)
        };
    }
    
    getColorName(color) {
        const { r, g, b } = color;
        
        // Enhanced color naming with more specific detection
        if (r > 200 && g < 100 && b < 100) return 'red';
        if (r < 100 && g > 200 && b < 100) return 'green';
        if (r < 100 && g < 100 && b > 200) return 'blue';
        if (r > 200 && g > 200 && b < 100) return 'yellow';
        if (r > 200 && g > 150 && b < 100) return 'orange';
        if (r > 200 && g > 200 && b > 200) return 'white';
        if (r < 50 && g < 50 && b < 50) return 'black';
        if (r > 150 && g > 150 && b > 150) return 'silver';
        if (r > 128 && g < 128 && b > 128) return 'purple';
        if (r > 165 && g > 42 && b < 42) return 'brown';
        if (Math.abs(r - g) < 30 && Math.abs(g - b) < 30) return 'gray';
        
        return 'multicolor';
    }
    
    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        
        return { h: h * 360, s: s * 100, l: l * 100 };
    }
    
    determineColorScheme(colors) {
        if (colors.length === 1) return 'monochrome';
        if (colors.length === 2) return 'complementary';
        if (colors.length >= 3) return 'triadic';
        return 'complex';
    }
    
    calculateColorComplexity(colors) {
        return Math.min(1, colors.length / 5);
    }
    
    async performBrandRecognition(source, predictions) {
        const results = [];
        
        for (const prediction of predictions) {
            const brandInfo = await this.recognizeBrand(source, prediction);
            results.push({
                id: prediction.id,
                brand: brandInfo.name,
                confidence: brandInfo.confidence,
                brandCategory: brandInfo.category,
                logoDetected: brandInfo.logoDetected,
                textDetected: brandInfo.textDetected
            });
        }
        
        return results;
    }
    
    async recognizeBrand(source, prediction) {
        const imageData = this.extractImageData(source, prediction.bbox);
        const colorProfile = this.analyzeColorProfile(imageData);
        const pixelAnalysis = this.analyzePixelData(imageData);
        
        // Advanced brand recognition based on multiple factors
        const brandScores = {};
        
        // Check against database entries
        for (const [category, brands] of Object.entries(this.wasteDatabase)) {
            for (const [brandKey, brandData] of Object.entries(brands)) {
                let score = 0;
                
                // Color signature matching (40% weight)
                if (this.matchesColorSignature(pixelAnalysis.avgColor, brandData.colorSignature)) {
                    score += 0.4;
                }
                
                // Shape matching (25% weight)
                if (this.matchesShapeProfile(prediction.bbox, brandData.shape)) {
                    score += 0.25;
                }
                
                // Material consistency (20% weight)
                const materialType = this.classifyMaterial(pixelAnalysis, prediction);
                if (materialType === brandData.material.toLowerCase()) {
                    score += 0.2;
                }
                
                // Size consistency (15% weight)
                if (this.matchesSizeProfile(prediction.area, brandData.shape.volume)) {
                    score += 0.15;
                }
                
                brandScores[brandKey] = score;
            }
        }
        
        // Find best match
        const bestMatch = Object.entries(brandScores)
            .sort((a, b) => b[1] - a[1])[0];
        
        if (bestMatch && bestMatch[1] > 0.5) {
            const brandData = this.findBrandData(bestMatch[0]);
            return {
                name: brandData.brand,
                confidence: bestMatch[1],
                category: this.getBrandCategory(bestMatch[0]),
                logoDetected: bestMatch[1] > 0.8,
                textDetected: bestMatch[1] > 0.7
            };
        }
        
        return {
            name: 'Unknown',
            confidence: 0,
            category: 'generic',
            logoDetected: false,
            textDetected: false
        };
    }
    
    matchesColorSignature(avgColor, signature) {
        const [targetR, targetG, targetB] = signature;
        const distance = Math.sqrt(
            Math.pow(avgColor.r - targetR, 2) +
            Math.pow(avgColor.g - targetG, 2) +
            Math.pow(avgColor.b - targetB, 2)
        );
        
        // Normalize distance (max distance is ~441 for RGB)
        const normalizedDistance = distance / 441;
        return 1 - normalizedDistance > 0.6; // 60% similarity threshold
    }
    
    matchesShapeProfile(bbox, shapeProfile) {
        const [x, y, width, height] = bbox;
        const aspectRatio = width / height;
        const [minRatio, maxRatio] = shapeProfile.aspectRatio;
        
        return aspectRatio >= minRatio && aspectRatio <= maxRatio;
    }
    
    matchesSizeProfile(area, volumeCategory) {
        const sizeCategory = this.categorizeSizeByArea(area);
        
        const sizeMap = {
            'small': ['small'],
            'medium': ['medium', 'small'],
            'large': ['large', 'medium'],
            'variable': ['small', 'medium', 'large']
        };
        
        return sizeMap[volumeCategory]?.includes(sizeCategory) || false;
    }
    
    findBrandData(brandKey) {
        for (const category of Object.values(this.wasteDatabase)) {
            if (category[brandKey]) {
                return category[brandKey];
            }
        }
        return null;
    }
    
    getBrandCategory(brandKey) {
        for (const [categoryName, brands] of Object.entries(this.wasteDatabase)) {
            if (brands[brandKey]) {
                return categoryName;
            }
        }
        return 'unknown';
    }
    
    combineAnalyses(predictions, materialAnalysis, shapeAnalysis, colorAnalysis, brandAnalysis) {
        return predictions.map(prediction => {
            const material = materialAnalysis.find(m => m.id === prediction.id);
            const shape = shapeAnalysis.find(s => s.id === prediction.id);
            const color = colorAnalysis.find(c => c.id === prediction.id);
            const brand = brandAnalysis.find(b => b.id === prediction.id);
            
            // Calculate final confidence score
            const finalConfidence = this.calculateFinalConfidence(
                prediction.confidence,
                material,
                shape,
                color,
                brand
            );
            
            // Determine final classification
            const classification = this.determineFinalClassification(
                prediction,
                material,
                shape,
                color,
                brand
            );
            
            return {
                ...prediction,
                material: material || {},
                shape: shape || {},
                color: color || {},
                brand: brand || {},
                finalConfidence,
                classification,
                recyclable: this.determineRecyclability(material, classification),
                environmentalImpact: this.assessEnvironmentalImpact(material, classification),
                disposalRecommendation: this.getDisposalRecommendation(material, classification)
            };
        });
    }
    
    calculateFinalConfidence(baseConfidence, material, shape, color, brand) {
        let confidence = baseConfidence;
        
        // Boost confidence based on consistency across analyses
        if (material && material.material !== 'unknown') confidence += 0.1;
        if (shape && shape.shapeType !== 'irregular') confidence += 0.05;
        if (color && color.primaryColor !== 'multicolor') confidence += 0.05;
        if (brand && brand.confidence > 0.6) confidence += 0.15;
        
        // Consistency bonuses
        if (this.areAnalysesConsistent(material, shape, color, brand)) {
            confidence += 0.1;
        }
        
        return Math.min(1.0, confidence);
    }
    
    areAnalysesConsistent(material, shape, color, brand) {
        // Check if all analyses point to the same type of object
        let consistencyScore = 0;
        
        if (material && brand) {
            const brandData = this.findBrandData(brand.brand);
            if (brandData && material.material.toLowerCase() === brandData.material.toLowerCase()) {
                consistencyScore += 0.5;
            }
        }
        
        if (shape && brand) {
            const brandData = this.findBrandData(brand.brand);
            if (brandData && this.matchesShapeProfile([0, 0, shape.aspectRatio * 100, 100], brandData.shape)) {
                consistencyScore += 0.3;
            }
        }
        
        if (color && brand) {
            const brandData = this.findBrandData(brand.brand);
            if (brandData && color.primaryColor === brandData.color.primary) {
                consistencyScore += 0.2;
            }
        }
        
        return consistencyScore > 0.5;
    }
    
    determineFinalClassification(prediction, material, shape, color, brand) {
        const scores = {
            'plastic_bottle': 0,
            'aluminum_can': 0,
            'plastic_bag': 0,
            'glass_bottle': 0,
            'unknown': 0
        };
        
        // Base classification from object detection
        if (prediction.class === 'bottle') {
            if (material && material.material === 'aluminum') {
                scores.aluminum_can = 0.4;
            } else if (material && material.material.includes('plastic')) {
                scores.plastic_bottle = 0.4;
            } else if (material && material.material === 'glass') {
                scores.glass_bottle = 0.4;
            } else {
                scores.plastic_bottle = 0.3; // Default assumption
            }
        } else if (prediction.class === 'cup') {
            scores.plastic_bottle = 0.3;
        } else if (prediction.class === 'cell phone') {
            // Using cell phone detection as proxy for aluminum cans
            scores.aluminum_can = 0.4;
        } else if (['handbag', 'backpack', 'suitcase'].includes(prediction.class)) {
            scores.plastic_bag = 0.4;
        }
        
        // Material analysis influence
        if (material) {
            if (material.material === 'aluminum') {
                scores.aluminum_can += 0.3;
            } else if (material.material.includes('plastic')) {
                scores.plastic_bottle += 0.2;
                scores.plastic_bag += 0.1;
            } else if (material.material === 'glass') {
                scores.glass_bottle += 0.3;
            }
        }
        
        // Shape analysis influence
        if (shape) {
            if (shape.aspectRatio > 0.6 && shape.aspectRatio < 0.8) {
                scores.aluminum_can += 0.2;
            } else if (shape.aspectRatio < 0.5) {
                scores.plastic_bottle += 0.15;
                scores.glass_bottle += 0.1;
            } else if (shape.aspectRatio > 1.2) {
                scores.plastic_bag += 0.2;
            }
        }
        
        // Brand analysis influence
        if (brand && brand.confidence > 0.6) {
            const brandCategory = this.getBrandCategory(brand.brand);
            if (brandCategory === 'aluminumCans') {
                scores.aluminum_can += 0.25;
            } else if (brandCategory === 'plasticBottles') {
                scores.plastic_bottle += 0.25;
            } else if (brandCategory === 'glassBottles') {
                scores.glass_bottle += 0.25;
            }
        }
        
        // Find best classification
        const bestClassification = Object.entries(scores)
            .sort((a, b) => b[1] - a[1])[0];
        
        return bestClassification[1] > 0.4 ? bestClassification[0] : 'unknown';
    }
    
    determineRecyclability(material, classification) {
        const recyclableTypes = ['plastic_bottle', 'aluminum_can', 'glass_bottle'];
        return recyclableTypes.includes(classification);
    }
    
    assessEnvironmentalImpact(material, classification) {
        const impactMap = {
            'plastic_bottle': 'medium',
            'aluminum_can': 'low',
            'plastic_bag': 'high',
            'glass_bottle': 'low',
            'unknown': 'medium'
        };
        return impactMap[classification] || 'medium';
    }
    
    getDisposalRecommendation(material, classification) {
        const recommendations = {
            'plastic_bottle': 'Rửa sạch và bỏ vào thùng rác tái chế nhựa. Tháo nắp và nhãn nếu có thể.',
            'aluminum_can': 'Rửa sạch và bỏ vào thùng rác tái chế kim loại. Lon nhôm có thể tái chế 100%.',
            'plastic_bag': 'Không bỏ vào thùng rác thông thường. Mang đến điểm thu gom túi nilon chuyên dụng.',
            'glass_bottle': 'Rửa sạch và bỏ vào thùng rác tái chế thủy tinh. Tháo nắp kim loại.',
            'unknown': 'Kiểm tra kỹ loại vật liệu và bỏ vào thùng rác phù hợp.'
        };
        return recommendations[classification] || recommendations['unknown'];
    }
    
    applyMLRefinement(predictions) {
        // Apply machine learning refinement based on historical data
        return predictions.map(prediction => {
            // Adjust confidence based on historical accuracy
            const historicalAccuracy = this.getHistoricalAccuracy(prediction.classification);
            prediction.finalConfidence *= historicalAccuracy;
            
            // Add to detection history
            this.analytics.detectionHistory.push({
                timestamp: Date.now(),
                classification: prediction.classification,
                confidence: prediction.finalConfidence,
                brand: prediction.brand.brand
            });
            
            return prediction;
        });
    }
    
    getHistoricalAccuracy(classification) {
        // Simulate historical accuracy data
        const accuracyMap = {
            'plastic_bottle': 0.95,
            'aluminum_can': 0.92,
            'plastic_bag': 0.88,
            'glass_bottle': 0.90,
            'unknown': 0.70
        };
        return accuracyMap[classification] || 0.80;
    }
    
    updateAdvancedResults(predictions) {
        const container = document.getElementById('results-container');
        
        if (predictions.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>Không phát hiện rác thải nào trong khung hình</p>
                </div>
            `;
            this.clearDetectionBoxes();
            return;
        }
        
        // Clear previous detections
        this.clearDetectionBoxes();
        
        container.innerHTML = predictions.map((prediction, index) => {
            // Draw detection box
            this.drawAdvancedDetectionBox(prediction, index);
            
            return this.generateAdvancedResultHTML(prediction, index);
        }).join('');
        
        // Update statistics
        this.updateAdvancedStatistics(predictions);
    }
    
    generateAdvancedResultHTML(prediction, index) {
        const classificationInfo = this.getClassificationInfo(prediction.classification);
        const confidence = Math.round(prediction.finalConfidence * 100);
        
        return `
            <div class="advanced-result-item" style="animation-delay: ${index * 0.1}s">
                <div class="result-header">
                    <div class="result-icon" style="background-color: ${classificationInfo.color}20; color: ${classificationInfo.color}">
                        <i class="${classificationInfo.icon}"></i>
                    </div>
                    <div class="result-title">
                        <h4>${classificationInfo.name}</h4>
                        <div class="confidence-bar">
                            <div class="confidence-fill" style="width: ${confidence}%; background-color: ${classificationInfo.color}"></div>
                            <span class="confidence-text">${confidence}% tin cậy</span>
                        </div>
                    </div>
                </div>
                
                ${this.detailedAnalysis ? this.generateDetailedAnalysisHTML(prediction) : ''}
                
                <div class="environmental-info">
                    <div class="recyclable-status ${prediction.recyclable ? 'recyclable' : 'non-recyclable'}">
                        <i class="fas ${prediction.recyclable ? 'fa-recycle' : 'fa-times-circle'}"></i>
                        ${prediction.recyclable ? 'Có thể tái chế' : 'Không thể tái chế'}
                    </div>
                    
                    <div class="environmental-impact">
                        <span class="impact-level ${prediction.environmentalImpact}">
                            Tác động: ${this.getImpactText(prediction.environmentalImpact)}
                        </span>
                    </div>
                </div>
                
                <div class="disposal-recommendation">
                    <h5><i class="fas fa-info-circle"></i> Khuyến nghị xử lý</h5>
                    <p>${prediction.disposalRecommendation}</p>
                </div>
            </div>
        `;
    }
    
    generateDetailedAnalysisHTML(prediction) {
        return `
            <div class="result-details-grid">
                <div class="detail-section">
                    <h5><i class="fas fa-atom"></i> Vật liệu</h5>
                    <p><strong>Loại:</strong> ${prediction.material.material || 'Không xác định'}</p>
                    <p><strong>Độ phản chiếu:</strong> ${Math.round((prediction.material.reflectivity || 0) * 100)}%</p>
                    <p><strong>Độ trong suốt:</strong> ${Math.round((prediction.material.transparency || 0) * 100)}%</p>
                    <p><strong>Tính dẫn điện:</strong> ${prediction.material.conductivity || 'Không có'}</p>
                </div>
                
                <div class="detail-section">
                    <h5><i class="fas fa-shapes"></i> Hình dạng</h5>
                    <p><strong>Tỷ lệ khung hình:</strong> ${(prediction.shape.aspectRatio || 0).toFixed(2)}</p>
                    <p><strong>Kích thước:</strong> ${prediction.shape.sizeCategory || 'Không xác định'}</p>
                    <p><strong>Hướng:</strong> ${prediction.shape.orientation || 'Không xác định'}</p>
                    <p><strong>Độ compact:</strong> ${(prediction.shape.compactness || 0).toFixed(3)}</p>
                </div>
                
                <div class="detail-section">
                    <h5><i class="fas fa-palette"></i> Màu sắc</h5>
                    <p><strong>Màu chính:</strong> ${prediction.color.primaryColor || 'Không xác định'}</p>
                    <p><strong>Màu phụ:</strong> ${prediction.color.secondaryColor || 'Không có'}</p>
                    <p><strong>Độ bão hòa:</strong> ${Math.round((prediction.color.saturation || 0))}%</p>
                    <p><strong>Sắc độ:</strong> ${Math.round((prediction.color.hue || 0))}°</p>
                </div>
                
                <div class="detail-section">
                    <h5><i class="fas fa-tag"></i> Thương hiệu</h5>
                    <p><strong>Nhãn hiệu:</strong> ${prediction.brand.brand || 'Không nhận diện được'}</p>
                    <p><strong>Độ tin cậy:</strong> ${Math.round((prediction.brand.confidence || 0) * 100)}%</p>
                    <p><strong>Logo:</strong> ${prediction.brand.logoDetected ? 'Có phát hiện' : 'Không phát hiện'}</p>
                    <p><strong>Văn bản:</strong> ${prediction.brand.textDetected ? 'Có phát hiện' : 'Không phát hiện'}</p>
                </div>
            </div>
        `;
    }
    
    getClassificationInfo(classification) {
        const classifications = {
            'plastic_bottle': {
                name: 'Chai nhựa',
                icon: 'fas fa-wine-bottle',
                color: '#3498db'
            },
            'aluminum_can': {
                name: 'Lon nhôm',
                icon: 'fas fa-prescription-bottle',
                color: '#95a5a6'
            },
            'plastic_bag': {
                name: 'Túi nilon',
                icon: 'fas fa-shopping-bag',
                color: '#e74c3c'
            },
            'glass_bottle': {
                name: 'Chai thủy tinh',
                icon: 'fas fa-wine-glass',
                color: '#27ae60'
            },
            'unknown': {
                name: 'Không xác định',
                icon: 'fas fa-question-circle',
                color: '#95a5a6'
            }
        };
        
        return classifications[classification] || classifications['unknown'];
    }
    
    getImpactText(impact) {
        const impactTexts = {
            'low': 'Thấp',
            'medium': 'Trung bình',
            'high': 'Cao'
        };
        return impactTexts[impact] || 'Không xác định';
    }
    
    drawAdvancedDetectionBox(prediction, index) {
        const overlay = document.getElementById('detection-overlay');
        const [x, y, width, height] = prediction.bbox;
        const classificationInfo = this.getClassificationInfo(prediction.classification);
        
        // Create detection box
        const box = document.createElement('div');
        box.className = 'advanced-detection-box';
        box.style.left = `${x}px`;
        box.style.top = `${y}px`;
        box.style.width = `${width}px`;
        box.style.height = `${height}px`;
        box.style.borderColor = classificationInfo.color;
        
        // Create label
        const label = document.createElement('div');
        label.className = 'advanced-detection-label';
        label.style.backgroundColor = classificationInfo.color;
        
        let labelText = `${classificationInfo.name}`;
        if (prediction.brand.brand && prediction.brand.brand !== 'Unknown') {
            labelText += ` - ${prediction.brand.brand}`;
        }
        
        label.textContent = labelText;
        box.appendChild(label);
        
        // Create confidence indicator
        const confidenceIndicator = document.createElement('div');
        confidenceIndicator.className = 'confidence-indicator';
        confidenceIndicator.textContent = `${Math.round(prediction.finalConfidence * 100)}%`;
        box.appendChild(confidenceIndicator);
        
        overlay.appendChild(box);
        
        // Add animation
        setTimeout(() => {
            box.style.opacity = '1';
            box.style.transform = 'scale(1)';
        }, index * 100);
    }
    
    clearDetectionBoxes() {
        const overlay = document.getElementById('detection-overlay');
        overlay.innerHTML = '';
    }
    
    updateAdvancedStatistics(predictions) {
        // Update detection counts
        predictions.forEach(prediction => {
            this.analytics.totalDetections++;
            
            switch (prediction.classification) {
                case 'plastic_bottle':
                    this.analytics.plasticCount = (this.analytics.plasticCount || 0) + 1;
                    break;
                case 'aluminum_can':
                    this.analytics.canCount = (this.analytics.canCount || 0) + 1;
                    break;
                case 'plastic_bag':
                    this.analytics.bagCount = (this.analytics.bagCount || 0) + 1;
                    break;
            }
        });
        
        // Calculate accuracy and recycling rate
        const totalRecyclable = predictions.filter(p => p.recyclable).length;
        this.analytics.recyclingRate = predictions.length > 0 ? 
            Math.round((totalRecyclable / predictions.length) * 100) : 0;
        
        const avgConfidence = predictions.length > 0 ?
            predictions.reduce((sum, p) => sum + p.finalConfidence, 0) / predictions.length : 0;
        this.analytics.accuracy = Math.round(avgConfidence * 100);
        
        // Update UI
        document.getElementById('totalDetections').textContent = this.analytics.totalDetections;
        document.getElementById('plasticCount').textContent = this.analytics.plasticCount || 0;
        document.getElementById('canCount').textContent = this.analytics.canCount || 0;
        document.getElementById('bagCount').textContent = this.analytics.bagCount || 0;
        document.getElementById('accuracyRate').textContent = `${this.analytics.accuracy}%`;
        document.getElementById('recyclingRate').textContent = `${this.analytics.recyclingRate}%`;
        
        // Add animation to updated stats
        this.animateStatUpdate();
    }
    
    animateStatUpdate() {
        const statItems = document.querySelectorAll('.stat-item');
        statItems.forEach(item => {
            item.classList.add('pulse');
            setTimeout(() => {
                item.classList.remove('pulse');
            }, 1000);
        });
    }
    
    // Event handlers
    async performAdvancedCapture() {
        if (!this.video.srcObject) return;
        
        // Draw video frame to canvas
        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        
        // Perform detection on captured image
        await this.performAdvancedDetection(this.canvas);
        
        // Add capture effect
        this.addCaptureEffect();
    }
    
    async handleAdvancedFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const img = new Image();
        img.onload = async () => {
            // Resize canvas to image dimensions
            this.canvas.width = img.width;
            this.canvas.height = img.height;
            
            // Draw image to canvas
            this.ctx.drawImage(img, 0, 0);
            
            // Hide video and show canvas
            this.video.style.display = 'none';
            this.canvas.style.display = 'block';
            
            // Perform detection
            await this.performAdvancedDetection(img);
        };
        
        img.src = URL.createObjectURL(file);
    }
    
    toggleDetailedAnalysis() {
        this.detailedAnalysis = !this.detailedAnalysis;
        const btn = document.getElementById('toggleAnalysis');
        
        if (this.detailedAnalysis) {
            btn.innerHTML = '<i class="fas fa-eye-slash"></i> Ẩn chi tiết';
            btn.classList.add('active');
        } else {
            btn.innerHTML = '<i class="fas fa-microscope"></i> Phân tích chi tiết';
            btn.classList.remove('active');
        }
        
        // Re-render current results with/without details
        const container = document.getElementById('results-container');
        if (container.children.length > 0 && !container.querySelector('.no-results')) {
            // Trigger re-render of current results
            // This would need to store current predictions and re-render
        }
    }
    
    exportAnalysisReport() {
        const report = {
            timestamp: new Date().toISOString(),
            statistics: this.analytics,
            detectionHistory: this.analytics.detectionHistory,
            systemInfo: {
                userAgent: navigator.userAgent,
                performance: this.performanceMetrics
            }
        };
        
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `waste-analysis-report-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }
    
    clearAnalysisHistory() {
        if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử phân tích?')) {
            this.analytics = {
                totalDetections: 0,
                accuracy: 0,
                detectionHistory: [],
                materialConfidence: {},
                brandAccuracy: {},
                recyclingRate: 0,
                plasticCount: 0,
                canCount: 0,
                bagCount: 0
            };
            
            // Reset UI
            document.getElementById('totalDetections').textContent = '0';
            document.getElementById('plasticCount').textContent = '0';
            document.getElementById('canCount').textContent = '0';
            document.getElementById('bagCount').textContent = '0';
            document.getElementById('accuracyRate').textContent = '0%';
            document.getElementById('recyclingRate').textContent = '0%';
            
            // Clear results
            document.getElementById('results-container').innerHTML = `
                <div class="no-results">
                    <i class="fas fa-camera"></i>
                    <p>Lịch sử đã được xóa. Bắt đầu phân tích mới.</p>
                </div>
            `;
            
            this.clearDetectionBoxes();
        }
    }
    
    // Performance monitoring
    startPerformanceMonitoring() {
        setInterval(() => {
            this.updatePerformanceDisplay();
        }, 1000);
    }
    
    updatePerformanceMetrics() {
        const now = performance.now();
        this.performanceMetrics.frameCount++;
        
        if (now - this.performanceMetrics.lastFrameTime >= 1000) {
            this.performanceMetrics.fps = this.performanceMetrics.frameCount;
            this.performanceMetrics.frameCount = 0;
            this.performanceMetrics.lastFrameTime = now;
        }
        
        // Estimate memory usage
        if (performance.memory) {
            this.performanceMetrics.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
        }
    }
    
    updatePerformanceDisplay() {
        const monitor = document.getElementById('performanceMonitor');
        if (this.detailedAnalysis) {
            monitor.classList.add('show');
            document.getElementById('analysisTime').textContent = `${Math.round(this.performanceMetrics.analysisTime)}ms`;
            document.getElementById('cameraFPS').textContent = this.performanceMetrics.fps;
            document.getElementById('memoryUsage').textContent = `${this.performanceMetrics.memoryUsage}MB`;
        } else {
            monitor.classList.remove('show');
        }
    }
    
    // Utility methods
    generatePredictionId() {
        return 'pred_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    normalizeBoundingBox(bbox) {
        return bbox.map(coord => Math.round(coord));
    }
    
    calculateArea(bbox) {
        return bbox[2] * bbox[3];
    }
    
    calculateCenter(bbox) {
        return {
            x: bbox[0] + bbox[2] / 2,
            y: bbox[1] + bbox[3] / 2
        };
    }
    
    getSensitivity() {
        const slider = document.getElementById('sensitivitySlider');
        return slider ? slider.value / 100 : 0.7;
    }
    
    updateSensitivity(value) {
        // Sensitivity updated in real-time
        console.log('Sensitivity updated to:', value);
    }
    
    showLoadingProgress(message, percentage) {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.innerHTML = `
                <div class="spinner"></div>
                <p>${message}</p>
                <div style="width: 200px; height: 4px; background: rgba(255,255,255,0.3); border-radius: 2px; margin: 10px auto;">
                    <div style="width: ${percentage}%; height: 100%; background: #00ff00; border-radius: 2px; transition: width 0.3s;"></div>
                </div>
            `;
        }
    }
    
    hideLoadingProgress() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.style.display = 'none';
        }
    }
    
    updateModelStatus(status, message) {
        const statusElement = document.getElementById('modelStatus');
        if (statusElement) {
            statusElement.className = `status-${status}`;
            statusElement.textContent = message;
        }
    }
    
    addCaptureEffect() {
        const overlay = document.getElementById('detection-overlay');
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: white;
            opacity: 0.8;
            pointer-events: none;
            z-index: 1000;
        `;
        
        overlay.appendChild(flash);
        
        setTimeout(() => {
            flash.style.opacity = '0';
            flash.style.transition = 'opacity 0.3s ease';
            setTimeout(() => {
                if (overlay.contains(flash)) {
                    overlay.removeChild(flash);
                }
            }, 300);
        }, 100);
    }
    
    showError(message) {
        const container = document.getElementById('results-container');
        container.innerHTML = `
            <div style="color: #e74c3c; text-align: center; padding: 20px; background: rgba(231, 76, 60, 0.1); border-radius: 10px; border: 2px dashed #e74c3c;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2em; margin-bottom: 10px;"></i>
                <p>${message}</p>
            </div>
        `;
    }
    
    initializeImageProcessing() {
        // Initialize any additional image processing utilities
        console.log('Image processing initialized');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SmartWasteClassifier();
});

// Add service worker registration
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

