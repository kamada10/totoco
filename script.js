// 車検見積もりアプリ
class CarInspectionApp {
    constructor() {
        this.selectedCarType = null;
        this.selectedYear = '2025';
        this.selectedCarDetail = null;
        this.selectedCourse = null;
        this.estimateData = null;
        
        // 重量税データ（エコカー減税なし）['13年未満', '13年経過', '18年経過']
        this.carTax = [
            [6600, 8200, 8800],    // 軽
            [8200, 11400, 12600],  // 乗用車（0.5t以下）
            [16400, 22800, 25200], // 乗用車（0.5t～1t以下）
            [24600, 34200, 37800], // 乗用車（1t～1.5t以下）
            [32800, 45600, 50400], // 乗用車（1.5t～2t以下）
            [41000, 57000, 63000], // 乗用車（2t～2.5t以下）
            [49200, 68400, 75600], // 乗用車（2.5t～3t以下）
            [6600, 8200, 8800],    // 小型貨物 総重量2t以下
            [9900, 12300, 13200],  // 小型貨物 総重量2.5t以下
            [12300, 17100, 18900], // 小型貨物 総重量3t以下
            [16400, 22800, 25200]  // 小型貨物 総重量4t以下
        ];
        
        // 重量税データ（エコカー減税適用）['本則税率', '50％減']
        this.ecocarTax = [
            [5000, 2500],    // 軽
            [5000, 2500],    // 乗用車（0.5t以下）
            [10000, 5000],   // 乗用車（0.5t～1t以下）
            [15000, 7500],   // 乗用車（1t～1.5t以下）
            [20000, 10000],  // 乗用車（1.5t～2t以下）
            [25000, 12500],  // 乗用車（2t～2.5t以下）
            [30000, 15000],  // 乗用車（2.5t～3t以下）
            [5000, 2500],    // 小型貨物 総重量2t以下
            [7500, 3700],    // 小型貨物 総重量2.5t以下
            [7500, 3700],    // 小型貨物 総重量3t以下
            [10000, 5000]    // 小型貨物 総重量4t以下
        ];
        
        // 車種別データ（実際のデータから）
        this.carData = {
            // 日本車
            21: { jyuryo: 7, insurance: 12850, tesuryo: 0, ecocar: 1, name: '軽車両全般' },
            22: { jyuryo: 3, insurance: 17650, tesuryo: 0, ecocar: 1, name: 'プリウス etc.' },
            23: { jyuryo: 2, insurance: 17650, tesuryo: 0, ecocar: 1, name: 'ヴィッツ etc.' },
            24: { jyuryo: 3, insurance: 17650, tesuryo: 0, ecocar: 1, name: 'カローラ etc.' },
            25: { jyuryo: 4, insurance: 17650, tesuryo: 0, ecocar: 1, name: 'クラウン etc.' },
            26: { jyuryo: 5, insurance: 17650, tesuryo: 0, ecocar: 1, name: 'エルグランド etc.' },
            27: { jyuryo: 7, insurance: 12850, tesuryo: 0, ecocar: 1, name: 'ライトバン全般' },
            // 輸入車
            28: { jyuryo: 2, insurance: 17650, tesuryo: 0, ecocar: 3, name: '小型車' },
            29: { jyuryo: 3, insurance: 17650, tesuryo: 0, ecocar: 3, name: '中型車' },
            30: { jyuryo: 4, insurance: 17650, tesuryo: 0, ecocar: 3, name: '大型車（1.5t超～2t以下）' },
            31: { jyuryo: 5, insurance: 17650, tesuryo: 0, ecocar: 3, name: '大型車（2t超～2.5t以下）' }
        };
        
        // コース別車検料（実際のデータから）
        this.coursePricing = {
            // 立ち会い車検 (14)
            "14_21": 16000, "14_22": 16000, "14_23": 16000, "14_24": 16000, "14_25": 16000, "14_26": 18000, "14_27": 16000,
            "14_28": 18000, "14_29": 18000, "14_30": 18000, "14_31": 18000,
            // ワンデイ車検 (15)
            "15_21": 19000, "15_22": 19000, "15_23": 19000, "15_24": 19000, "15_25": 19000, "15_26": 20000, "15_27": 19000,
            "15_28": 20000, "15_29": 20000, "15_30": 20000, "15_31": 20000,
            // クイック車検 (87)
            "87_21": 13800, "87_22": 13800, "87_23": 13800, "87_24": 13800, "87_25": 13800, "87_26": 13800, "87_27": 13800,
            "87_28": 16000, "87_29": 16000, "87_30": 16000, "87_31": 16000
        };
        
        // 固定料金
        this.stamp = 1800;      // 検査登録印紙代
        this.stampK = 1800;     // 軽自動車用印紙代
        
        this.init();
    }
    
    async init() {
        try {
            console.log('車検見積もりアプリを初期化中...');
            
            // LIFF初期化
            await this.initializeLIFF();
            
            // イベントリスナー設定
            this.setupEventListeners();
            
            // 初期状態設定
            this.setInitialState();
            
            console.log('車検見積もりアプリの初期化が完了しました');
        } catch (error) {
            console.error('初期化エラー:', error);
            this.showError('アプリの初期化に失敗しました');
        }
    }
    
    async initializeLIFF() {
        try {
            // 開発環境の検出
            const isDevelopment = window.location.hostname === 'localhost' || 
                                window.location.hostname === '127.0.0.1' || 
                                window.location.protocol === 'file:';
            
            if (isDevelopment) {
                console.log('開発環境のためLIFF初期化をスキップ');
                return;
            }
            
            console.log('LIFF初期化中...');
            
            if (typeof liff === 'undefined') {
                throw new Error('LIFF SDKが読み込まれていません');
            }
            
            await liff.init({ liffId: '2008160458-GoKgrOPZ' });
            console.log('LIFF初期化完了');
            
        } catch (error) {
            console.error('LIFF初期化エラー:', error);
            // LIFF初期化に失敗してもアプリは続行
        }
    }
    
    setupEventListeners() {
        // 年式選択のイベントリスナー
        const yearSelect = document.getElementById('year-select');
        if (yearSelect) {
            yearSelect.addEventListener('change', (e) => {
                this.selectYear(e.target.value);
            });
        }
    }
    
    setInitialState() {
        // デフォルトで日本車を選択
        this.selectCarType(1);
        
        // 年式を2025年に設定
        this.selectYear('2025');
        
        // 見積もり結果を非表示
        this.hideEstimate();
    }
    
    selectCarType(carType) {
        console.log('車種選択:', carType);
        
        this.selectedCarType = carType;
        
        // ボタンの選択状態を更新
        const buttons = document.querySelectorAll('[data-cartype]');
        buttons.forEach(button => {
            button.classList.remove('selected');
            if (button.dataset.cartype == carType) {
                button.classList.add('selected');
            }
        });
        
        // 車種詳細カードの表示切り替え
        const japaneseCard = document.getElementById('japanese-car-card');
        const importCard = document.getElementById('import-car-card');
        const japaneseCourseCard = document.getElementById('japanese-course-card');
        const importCourseCard = document.getElementById('import-course-card');
        
        if (carType === 1) {
            // 日本車
            japaneseCard.style.display = 'block';
            importCard.style.display = 'none';
            japaneseCourseCard.style.display = 'block';
            importCourseCard.style.display = 'none';
        } else {
            // 輸入車
            japaneseCard.style.display = 'none';
            importCard.style.display = 'block';
            japaneseCourseCard.style.display = 'none';
            importCourseCard.style.display = 'block';
        }
        
        // 車種詳細とコースの選択をリセット
        this.resetCarDetailSelection();
        this.resetCourseSelection();
        this.hideEstimate();
    }
    
    selectYear(year) {
        console.log('年式選択:', year);
        
        this.selectedYear = year;
        
        // 年式選択を更新
        const yearSelect = document.getElementById('year-select');
        if (yearSelect) {
            yearSelect.value = year;
        }
        
        // 見積もりを更新
        this.updateEstimate();
    }
    
    selectCarDetail(carDetail) {
        console.log('車種詳細選択:', carDetail);
        
        this.selectedCarDetail = carDetail;
        
        // ボタンの選択状態を更新
        const buttons = document.querySelectorAll('[data-ctype]');
        buttons.forEach(button => {
            button.classList.remove('selected');
            // ボタンのonclick属性から正確な車種名を取得して比較
            const onclickAttr = button.getAttribute('onclick');
            if (onclickAttr && onclickAttr.includes(`'${carDetail}'`)) {
                button.classList.add('selected');
            }
        });
        
        // 見積もりを更新
        this.updateEstimate();
    }
    
    selectCourse(course) {
        console.log('コース選択:', course);
        
        this.selectedCourse = course;
        
        // ボタンの選択状態を更新
        const buttons = document.querySelectorAll('[data-costype]');
        buttons.forEach(button => {
            button.classList.remove('selected');
            if (button.textContent.includes(course)) {
                button.classList.add('selected');
            }
        });
        
        // 見積もりを更新
        this.updateEstimate();
    }
    
    resetCarDetailSelection() {
        this.selectedCarDetail = null;
        
        const buttons = document.querySelectorAll('[data-ctype]');
        buttons.forEach(button => {
            button.classList.remove('selected');
        });
    }
    
    resetCourseSelection() {
        this.selectedCourse = null;
        
        const buttons = document.querySelectorAll('[data-costype]');
        buttons.forEach(button => {
            button.classList.remove('selected');
        });
    }
    
    updateEstimate() {
        // 必要な選択が完了しているかチェック
        if (!this.selectedCarType || !this.selectedYear || !this.selectedCarDetail || !this.selectedCourse) {
            this.hideEstimate();
            return;
        }
        
        // 見積もり計算
        const estimate = this.calculateEstimate();
        
        // 見積もり結果を表示
        this.showEstimate(estimate);
    }
    
    calculateEstimate() {
        // 車種IDを取得
        const carId = this.getCarId();
        if (!carId) return null;
        
        const carInfo = this.carData[carId];
        const courseId = this.getCourseId();
        
        if (!carInfo || !courseId) return null;
        
        // コース別車検料を取得
        const courseKey = `${courseId}_${carId}`;
        const inspectionFee = this.coursePricing[courseKey] || 0;
        
        if (inspectionFee === 0) return null;
        
        // 年式から経過年数を計算
        const currentYear = new Date().getFullYear();
        const duration = currentYear - parseInt(this.selectedYear);
        
        // 重量税計算
        const weightTax = this.calculateWeightTax(carInfo.jyuryo, duration, carInfo.ecocar);
        const ecoWeightTax = this.calculateEcoWeightTax(carInfo.jyuryo, duration, carInfo.ecocar);
        const isEcoCarApplicable = this.isEcoCarApplicable(carInfo.jyuryo, carInfo.ecocar);
        
        // 各料金
        const insurance = carInfo.insurance;
        const stamp = carInfo.jyuryo === 7 ? this.stampK : this.stamp; // 軽自動車判定（jyuryo=7が軽自動車）
        const registrationFee = carInfo.tesuryo;
        // 合計計算（消費税は車検料に含まれているため別途加算しない）
        const totalPrice = weightTax + insurance + stamp + registrationFee + inspectionFee;
        const ecoTotalPrice = ecoWeightTax + insurance + stamp + registrationFee + inspectionFee;
        
        // デバッグ用ログ
        console.log('計算詳細:', {
            carId: carId,
            courseId: courseId,
            carInfo: carInfo,
            weightTax: weightTax,
            ecoWeightTax: ecoWeightTax,
            insurance: insurance,
            stamp: stamp,
            registrationFee: registrationFee,
            inspectionFee: inspectionFee,
            totalPrice: totalPrice,
            ecoTotalPrice: ecoTotalPrice,
            duration: duration,
            isEcoCar: carInfo.ecocar === 1,
            isEcoCarApplicable: isEcoCarApplicable,
            selectedYear: this.selectedYear,
            currentYear: new Date().getFullYear()
        });
        
        return {
            weightTax: weightTax,
            ecoWeightTax: ecoWeightTax,
            insurance: insurance,
            stamp: stamp,
            registrationFee: registrationFee,
            inspectionFee: inspectionFee,
            totalPrice: totalPrice,
            ecoTotalPrice: ecoTotalPrice,
            isEcoCar: carInfo.ecocar === 1,
            isEcoCarApplicable: isEcoCarApplicable,
            duration: duration
        };
    }
    
    getCarId() {
        // 選択された車種からIDを取得
        const buttons = document.querySelectorAll('[data-ctype]');
        for (let button of buttons) {
            if (button.classList.contains('selected')) {
                return parseInt(button.dataset.ctype);
            }
        }
        return null;
    }
    
    getCourseId() {
        // 選択されたコースからIDを取得
        const buttons = document.querySelectorAll('[data-costype]');
        for (let button of buttons) {
            if (button.classList.contains('selected')) {
                return parseInt(button.dataset.costype);
            }
        }
        return null;
    }
    
    calculateWeightTax(jyuryo, duration, ecocar) {
        // エコカー減税なしの場合（常に計算）
        if (duration < 13) {
            return this.carTax[jyuryo][0]; // 13年未満
        } else if (duration < 18) {
            return this.carTax[jyuryo][1]; // 13年経過
        } else {
            return this.carTax[jyuryo][2]; // 18年経過
        }
    }
    
    calculateEcoWeightTax(jyuryo, duration, ecocar) {
        // エコカー減税適用の場合（日本車のみ、ecocar === 1）
        if (ecocar === 1) {
            const currentYear = new Date().getFullYear();
            const isKeikamotsu = jyuryo >= 7 && jyuryo <= 10; // 軽貨物判定
            const ecoGenzeiLimitYear = isKeikamotsu ? 3 : 4; // 軽貨物は3年、それ以外は4年
            
            if ((parseInt(this.selectedYear) + ecoGenzeiLimitYear) <= currentYear) {
                return this.ecocarTax[jyuryo][0]; // 本則税率
            } else {
                return 0; // 2023年5月時点では全額免除
            }
        }
        // 輸入車（ecocar === 3）の場合は常に0を返す
        return 0;
    }
    
    isEcoCarApplicable(jyuryo, ecocar) {
        // エコカー減免が適用されるかどうかを判定
        if (ecocar === 1) {
            const currentYear = new Date().getFullYear();
            const isKeikamotsu = jyuryo >= 7 && jyuryo <= 10; // 軽貨物判定
            const ecoGenzeiLimitYear = isKeikamotsu ? 3 : 4; // 軽貨物は3年、それ以外は4年
            
            // エコカー減免期間内の場合にtrueを返す
            return (parseInt(this.selectedYear) + ecoGenzeiLimitYear) > currentYear;
        }
        return false;
    }
    
    showEstimate(estimate) {
        const estimateCard = document.getElementById('estimate-card');
        if (!estimateCard) return;
        
        // 選択内容を表示
        document.getElementById('estimate-year').textContent = this.getYearText(this.selectedYear);
        document.getElementById('estimate-car').textContent = this.selectedCarDetail;
        document.getElementById('estimate-course').textContent = this.selectedCourse;
        
        // 料金を表示
        // 通常料金（エコカー減免適用なし）
        document.getElementById('total-price').textContent = `${estimate.totalPrice.toLocaleString()}円`;
        document.getElementById('weight-tax').textContent = `${estimate.weightTax.toLocaleString()}円`;
        
        // エコカー減免適用の場合の表示
        console.log('表示判定:', {
            isEcoCar: estimate.isEcoCar,
            isEcoCarApplicable: estimate.isEcoCarApplicable,
            ecoWeightTax: estimate.ecoWeightTax
        });
        
        if (estimate.isEcoCar) {
            // 日本車でエコカー減免が適用される場合のみ表示
            document.getElementById('eco-total-price').textContent = `${estimate.ecoTotalPrice.toLocaleString()}円`;
            document.getElementById('eco-weight-tax').textContent = `${estimate.ecoWeightTax.toLocaleString()}円`;
            
            // エコカー減免適用の表示を表示
            document.getElementById('eco-price-display').style.display = 'block';
            document.getElementById('eco-weight-tax-item').style.display = 'block';
            console.log('エコカー減免適用項目を表示');
        } else {
            // エコカー減免が適用されない場合は非表示
            document.getElementById('eco-price-display').style.display = 'none';
            document.getElementById('eco-weight-tax-item').style.display = 'none';
            console.log('エコカー減免適用項目を非表示');
        }
        
        document.getElementById('liability-insurance').textContent = `${estimate.insurance.toLocaleString()}円`;
        document.getElementById('inspection-stamp').textContent = `${estimate.stamp.toLocaleString()}円`;
        document.getElementById('registration-fee').textContent = `${estimate.registrationFee.toLocaleString()}円`;
        document.getElementById('inspection-fee').textContent = `${estimate.inspectionFee.toLocaleString()}円`;
        
        // 見積もりカードを表示
        estimateCard.style.display = 'block';
        
        // 見積もりカードにスクロール
        estimateCard.scrollIntoView({ behavior: 'smooth' });
    }
    
    hideEstimate() {
        const estimateCard = document.getElementById('estimate-card');
        if (estimateCard) {
            estimateCard.style.display = 'none';
        }
    }
    
    getYearText(year) {
        const yearMap = {
            '2025': '2025年（令和7年）',
            '2024': '2024年（令和6年）',
            '2023': '2023年（令和5年）',
            '2022': '2022年（令和4年）',
            '2021': '2021年（令和3年）',
            '2020': '2020年（令和2年）',
            '2019': '2019年（平31・令和元年）',
            '2018': '2018年（平成30年）',
            '2017': '2017年（平成29年）',
            '2016': '2016年（平成28年）',
            '2015': '2015年（平成27年）',
            '2014': '2014年（平成26年）',
            '2013': '2013年（平成25年）',
            '2012': '2012年（平成24年）',
            '2011': '2011年（平成23年）',
            '2010': '2010年（平成22年）',
            '2009': '2009年（平成21年）',
            '2008': '2008年（平成20年）',
            '2007': '2007年（平成19年）',
            '2006': '2006年（平成18年）以前'
        };
        return yearMap[year] || year;
    }
    
    showError(message) {
        console.error('エラー:', message);
        // エラー表示の実装（必要に応じて）
    }
}

// グローバル関数（HTMLから呼び出し用）
function selectCarType(carType) {
    if (window.carInspectionApp) {
        window.carInspectionApp.selectCarType(carType);
    }
}

function selectYear() {
    const yearSelect = document.getElementById('year-select');
    if (yearSelect && window.carInspectionApp) {
        window.carInspectionApp.selectYear(yearSelect.value);
    }
}

function selectCarDetail(carDetail) {
    if (window.carInspectionApp) {
        window.carInspectionApp.selectCarDetail(carDetail);
    }
}

function selectCourse(course) {
    if (window.carInspectionApp) {
        window.carInspectionApp.selectCourse(course);
    }
}

function showComingSoon() {
    alert('車検のご予約機能は準備中です。\nいずれ設定いたします。');
}

// アプリ初期化
document.addEventListener('DOMContentLoaded', () => {
    // Lucideアイコンを初期化
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    window.carInspectionApp = new CarInspectionApp();
});