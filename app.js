// IDEAL Estética Automotiva - App Logic v2
// Full system: Auth, Services (13 with P/M/G pricing), Payment discounts,
// Photo capture with AI, Inspection/Vistoria, Supabase sync, WhatsApp, CSV export.

document.addEventListener('DOMContentLoaded', () => {
    // Auth DOM Elements
    const loginScreen = document.getElementById('login-screen');
    const loginCard = document.getElementById('login-card');
    const loginForm = document.getElementById('login-form');
    const loginErrorMsg = document.getElementById('login-error-msg');
    const mainAppContainer = document.getElementById('main-app-container');
    const logoutBtn = document.getElementById('logout-btn');

    // DOM Elements
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const checklistForm = document.getElementById('checklist-form');
    const clientNameInput = document.getElementById('client-name');
    const clientWhatsappInput = document.getElementById('client-whatsapp');
    const vehicleBrandInput = document.getElementById('vehicle-brand');
    const vehicleModelInput = document.getElementById('vehicle-model');
    const vehicleColorInput = document.getElementById('vehicle-color');
    const vehiclePlateInput = document.getElementById('vehicle-plate');
    
    const preExistingDamagesTextarea = document.getElementById('pre-existing-damages');
    const damageTags = document.querySelectorAll('.tag');
    
    const entryDateInput = document.getElementById('entry-date');
    const deliveryDateInput = document.getElementById('delivery-date');
    const totalAmountDisplay = document.getElementById('total-amount-display');
    const totalFinalDisplay = document.getElementById('total-final-display');
    const discountInfoDisplay = document.getElementById('discount-info-display');
    
    const clearBtn = document.getElementById('clear-btn');
    const searchInput = document.getElementById('search-input');
    const historyListContainer = document.getElementById('history-list-container');
    const historyCounter = document.getElementById('history-counter');
    const exportCsvBtn = document.getElementById('export-csv-btn');
    
    // Modals
    const previewModal = document.getElementById('preview-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modalCloseActionBtn = document.getElementById('modal-close-action-btn');
    const printBtn = document.getElementById('print-btn');
    const whatsappSendBtn = document.getElementById('whatsapp-send-btn');
    
    // Settings Modal
    const settingsToggleBtn = document.getElementById('settings-toggle-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const supabaseUrlInput = document.getElementById('supabase-url');
    const supabaseKeyInput = document.getElementById('supabase-key');
    const settingsStatusBox = document.getElementById('settings-status-box');
    const settingsStatusText = document.getElementById('settings-status-text');
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    const testSettingsBtn = document.getElementById('test-settings-btn');
    const clearSettingsBtn = document.getElementById('clear-settings-btn');
    const connectionStatusBadge = document.getElementById('connection-status-badge');

    // Receipt Preview Fields
    const rClient = document.getElementById('r-client');
    const rWhatsapp = document.getElementById('r-whatsapp');
    const rBrand = document.getElementById('r-brand');
    const rVehicle = document.getElementById('r-vehicle');
    const rColor = document.getElementById('r-color');
    const rPlate = document.getElementById('r-plate');
    const rServices = document.getElementById('r-services');
    const rDamages = document.getElementById('r-damages');
    const rEntry = document.getElementById('r-entry');
    const rDelivery = document.getElementById('r-delivery');
    const rTotal = document.getElementById('r-total');
    
    // Toast
    const toast = document.getElementById('toast');

    // AI Validation Modal DOM Elements
    const aiValidationModal = document.getElementById('ai-validation-modal');
    const closeAiValidationBtn = document.getElementById('close-ai-validation-btn');
    const aiCancelBtn = document.getElementById('ai-cancel-btn');
    const aiConfirmBtn = document.getElementById('ai-confirm-btn');
    const aiCapturedImg = document.getElementById('ai-captured-img');
    const aiLoadingSteps = document.getElementById('ai-loading-steps');
    const aiResultsForm = document.getElementById('ai-results-form');
    
    // Steps
    const stepUpload = document.getElementById('step-upload');
    const stepDetect = document.getElementById('step-detect');
    const stepFinish = document.getElementById('step-finish');
    
    // Validation Inputs
    const aiValBrand = document.getElementById('ai-val-brand');
    const aiValModel = document.getElementById('ai-val-model');
    const aiValColor = document.getElementById('ai-val-color');
    const aiValPlate = document.getElementById('ai-val-plate');
    const aiSizeBtns = document.querySelectorAll('.ai-size-btn');
    
    let aiSelectedSize = 'P'; // Default size in validation modal

    // State Variables
    let checklists = [];
    let currentPreviewChecklist = null;
    let supabaseClient = null;
    let isOnline = false;
    let editingChecklistId = null; // ID of the checklist currently being edited

    // =============================================
    // === SERVICE PRICING MATRIX (13 services) ====
    // =============================================
    let SERVICE_CATALOG = [
        { id: 'ducha',           name: 'Ducha',                    icon: '🚿', prices: { P: 30,  M: 40,   G: 50   } },
        { id: 'lavacao',         name: 'Lavação',                  icon: '🚗', prices: { P: 80,  M: 100,  G: 150  } },
        { id: 'lavacao_det',     name: 'Lavação Detalhada',        icon: '🧽', prices: { P: 150, M: 180,  G: 200  } },
        { id: 'lavagem_motor',   name: 'Lavagem de Motor',         icon: '🔧', prices: { P: 80,  M: 120,  G: 160  } },
        { id: 'lavagem_banco',   name: 'Lavagem Assoalho/Banco',   icon: '🪣', prices: { P: 150, M: 200,  G: 250  } },
        { id: 'lavagem_verniz',  name: 'Lavagem Banco c/ Verniz',  icon: '🪣', prices: { P: 200, M: 250,  G: 300  } },
        { id: 'higienizacao',    name: 'Higienização',             icon: '🧼', prices: { P: 500, M: 600,  G: 750  } },
        { id: 'polimento',       name: 'Polimento',                icon: '✨', prices: { P: 300, M: 400,  G: 650  } },
        { id: 'vitrificacao',    name: 'Vitrificação',             icon: '💎', prices: { P: 800, M: 1000, G: 1500 } },
        { id: 'polimento_farol', name: 'Polimento de Faróis',      icon: '🔦', prices: { fixed: 120 } },
        { id: 'descont_vidro',   name: 'Descontaminação de Vidro', icon: '🧊', prices: { fixed: 50  } },
        { id: 'pintura_roda',    name: 'Pintura de Roda',          icon: '🎨', prices: { fixed: 60  } },
    ];

    // Vehicle size state
    let currentVehicleSize = 'P'; // P = Pequeno, M = Médio, G = Grande
    // Track manually adjusted prices per service
    let manualPriceOverrides = {};

    // Payment state
    let currentPaymentMethod = 'cartao'; // cartao, pix, dinheiro
    let currentInstallments = 1;

    // Photo state
    let capturedPhotoBase64 = null;
    let capturedPhotoUrl = null;

    // =============================================
    // === VEHICLE SIZE SELECTOR ===================
    // =============================================
    function initVehicleSizeSelector() {
        const sizeBtns = document.querySelectorAll('.size-selector-btn');
        sizeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                sizeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentVehicleSize = btn.dataset.size;
                updateAllServicePrices();
                calculateTotal();
            });
        });
    }

    function getServicePrice(service, size) {
        if (service.prices.fixed !== undefined) {
            return service.prices.fixed;
        }
        return service.prices[size] || service.prices['P'];
    }

    function updateAllServicePrices() {
        const serviceItems = document.querySelectorAll('.service-item[data-service-id]');
        serviceItems.forEach(item => {
            const serviceId = item.dataset.serviceId;
            const catalogItem = SERVICE_CATALOG.find(s => s.id === serviceId);
            if (!catalogItem) return;
            
            const priceInput = item.querySelector('.service-price');
            // Only update if user hasn't manually overridden
            if (!manualPriceOverrides[serviceId]) {
                const newPrice = getServicePrice(catalogItem, currentVehicleSize);
                priceInput.value = newPrice.toFixed(2);
            }
        });
    }

    // =============================================
    // === DYNAMIC SERVICE LIST RENDERING ==========
    // =============================================
    function renderServicesList() {
        const container = document.getElementById('services-list-container');
        if (!container) return;

        let html = SERVICE_CATALOG.map(service => {
            const price = getServicePrice(service, currentVehicleSize);
            const isFixed = service.prices.fixed !== undefined;
            return `
                <div class="service-item" data-service-id="${service.id}">
                    <label class="checkbox-container">
                        <input type="checkbox" class="service-checkbox" data-service="${service.name}">
                        <span class="checkmark"></span>
                        <span class="service-name">${service.icon} ${service.name}</span>
                        ${isFixed ? '<span class="service-fixed-tag">Preço Único</span>' : ''}
                    </label>
                    <div class="price-controls">
                        <button type="button" class="price-adj-btn price-minus" title="−R$ 10">
                            <i class="fa-solid fa-minus"></i>
                        </button>
                        <div class="price-input-wrapper">
                            <span>R$</span>
                            <input type="number" class="service-price" value="${price.toFixed(2)}" min="0" step="0.01">
                        </div>
                        <button type="button" class="price-adj-btn price-plus" title="+R$ 10">
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Custom service row
        html += `
            <div class="service-item custom-service-row">
                <label class="checkbox-container">
                    <input type="checkbox" id="custom-service-checkbox" data-service="Outros">
                    <span class="checkmark"></span>
                    <input type="text" id="custom-service-name" placeholder="📝 Outro serviço: ______________" disabled>
                </label>
                <div class="price-controls">
                    <button type="button" class="price-adj-btn price-minus" title="−R$ 10" disabled>
                        <i class="fa-solid fa-minus"></i>
                    </button>
                    <div class="price-input-wrapper">
                        <span>R$</span>
                        <input type="number" id="custom-service-price" value="0.00" min="0" step="0.01" disabled>
                    </div>
                    <button type="button" class="price-adj-btn price-plus" title="+R$ 10" disabled>
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = html;
        attachServiceListeners();
    }

    function attachServiceListeners() {
        const serviceItems = document.querySelectorAll('.service-item');
        
        serviceItems.forEach(item => {
            const checkbox = item.querySelector('.service-checkbox, #custom-service-checkbox');
            const priceInput = item.querySelector('.service-price, #custom-service-price');
            const minusBtn = item.querySelector('.price-minus');
            const plusBtn = item.querySelector('.price-plus');
            const serviceId = item.dataset.serviceId;

            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    const priceWrapper = item.querySelector('.price-input-wrapper');
                    if (checkbox.checked) {
                        priceWrapper.classList.add('highlight-price');
                        item.classList.add('service-selected');
                    } else {
                        priceWrapper.classList.remove('highlight-price');
                        item.classList.remove('service-selected');
                    }

                    // Handle custom service
                    if (checkbox.id === 'custom-service-checkbox') {
                        const customName = document.getElementById('custom-service-name');
                        const customPrice = document.getElementById('custom-service-price');
                        const customMinusBtn = item.querySelector('.price-minus');
                        const customPlusBtn = item.querySelector('.price-plus');
                        customName.disabled = !checkbox.checked;
                        customPrice.disabled = !checkbox.checked;
                        customMinusBtn.disabled = !checkbox.checked;
                        customPlusBtn.disabled = !checkbox.checked;
                        if (checkbox.checked) {
                            customName.focus();
                            customName.required = true;
                        } else {
                            customName.required = false;
                            customName.value = '';
                            customPrice.value = '0.00';
                        }
                    }

                    calculateTotal();
                });
            }

            if (priceInput) {
                priceInput.addEventListener('input', () => {
                    if (serviceId) {
                        manualPriceOverrides[serviceId] = true;
                    }
                    calculateTotal();
                });
            }

            if (minusBtn) {
                minusBtn.addEventListener('click', () => {
                    if (priceInput.disabled) return;
                    let val = parseFloat(priceInput.value) || 0;
                    val = Math.max(0, val - 10);
                    priceInput.value = val.toFixed(2);
                    if (serviceId) manualPriceOverrides[serviceId] = true;
                    calculateTotal();
                });
            }

            if (plusBtn) {
                plusBtn.addEventListener('click', () => {
                    if (priceInput.disabled) return;
                    let val = parseFloat(priceInput.value) || 0;
                    val += 10;
                    priceInput.value = val.toFixed(2);
                    if (serviceId) manualPriceOverrides[serviceId] = true;
                    calculateTotal();
                });
            }
        });
    }

    // =============================================
    // === PAYMENT METHOD ===========================
    // =============================================
    function initPaymentMethod() {
        const payBtns = document.querySelectorAll('.payment-method-btn');
        payBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                payBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentPaymentMethod = btn.dataset.method;
                
                // Show/hide installment options
                const installmentSection = document.getElementById('installment-section');
                if (currentPaymentMethod === 'cartao') {
                    installmentSection.style.display = 'flex';
                } else {
                    installmentSection.style.display = 'none';
                    currentInstallments = 1;
                    const installSelect = document.getElementById('installment-select');
                    if (installSelect) installSelect.value = '1';
                }
                
                calculateTotal();
            });
        });

        const installSelect = document.getElementById('installment-select');
        if (installSelect) {
            installSelect.addEventListener('change', () => {
                currentInstallments = parseInt(installSelect.value) || 1;
                calculateTotal();
            });
        }
    }

    function getDiscountRate() {
        switch (currentPaymentMethod) {
            case 'pix': return 0.05;      // 5% off
            case 'dinheiro': return 0.10;  // 10% off
            default: return 0;            // Cartão = base price
        }
    }

    function getPaymentMethodLabel() {
        switch (currentPaymentMethod) {
            case 'pix': return '📱 PIX (-5%)';
            case 'dinheiro': return '💵 Dinheiro (-10%)';
            default: return '💳 Cartão';
        }
    }

    // =============================================
    // === PHOTO CAPTURE & AI V2 ===================
    // =============================================
    function initPhotoCapture() {
        const photoInput = document.getElementById('vehicle-photo-input');
        const photoBtn = document.getElementById('photo-capture-btn');
        const photoPreview = document.getElementById('photo-preview-container');
        const photoImg = document.getElementById('photo-preview-img');
        const photoRemoveBtn = document.getElementById('photo-remove-btn');

        if (!photoInput || !photoBtn) return;

        photoBtn.addEventListener('click', () => {
            photoInput.click();
        });

        photoInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                // Compress the image
                const compressed = await compressImage(file, 1200, 0.6);
                capturedPhotoBase64 = compressed;

                // Open the IA Validation Modal and trigger analysis
                openAiValidationModal(compressed);
            } catch (err) {
                console.error('Erro ao processar foto:', err);
                showToast('Erro ao processar a foto.', 'error');
            }
        });

        if (photoRemoveBtn) {
            photoRemoveBtn.addEventListener('click', () => {
                photoRemoveBtnAction();
            });
        }
    }

    async function compressImage(file, maxWidth, quality) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let w = img.width;
                    let h = img.height;
                    if (w > maxWidth) {
                        h = Math.round(h * maxWidth / w);
                        w = maxWidth;
                    }
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, w, h);
                    resolve(canvas.toDataURL('image/jpeg', quality));
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Plate format helper: AAA-0000 or AAA0A00 (Mercosul)
    function formatPlateInput(val) {
        val = val.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (val.length > 7) val = val.substring(0, 7);
        
        if (val.length === 7) {
            const isTraditional = /^[A-Z]{3}[0-9]{4}$/.test(val);
            if (isTraditional) {
                return val.substring(0, 3) + '-' + val.substring(3);
            }
        }
        return val;
    }

    function openAiValidationModal(imageSrc) {
        if (!aiValidationModal) return;
        
        aiCapturedImg.src = imageSrc;
        aiResultsForm.style.display = 'none';
        aiLoadingSteps.style.display = 'flex';
        aiConfirmBtn.disabled = true;
        
        // Reset steps
        resetStepItem(stepUpload, 'Enviando imagem...');
        resetStepItem(stepDetect, 'Analisando placa e modelo...');
        resetStepItem(stepFinish, 'Finalizando extração...');
        
        aiValidationModal.classList.add('active');
        
        // Trigger Serverless Function
        runAiAnalysis(imageSrc);
    }

    function resetStepItem(stepEl, defaultText) {
        if (!stepEl) return;
        stepEl.className = 'ai-step-item';
        stepEl.innerHTML = `<i class="fa-regular fa-circle"></i> ${defaultText}`;
    }

    function setStepStatus(stepEl, status, text) {
        if (!stepEl) return;
        stepEl.className = `ai-step-item ${status}`;
        if (status === 'active') {
            stepEl.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${text}`;
        } else if (status === 'success') {
            stepEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${text}`;
        } else if (status === 'error') {
            stepEl.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> ${text}`;
        }
    }

    async function runAiAnalysis(base64Image) {
        try {
            // Step 1: Upload / send
            setStepStatus(stepUpload, 'active', 'Enviando imagem para análise...');
            await new Promise(resolve => setTimeout(resolve, 800)); // Smooth transition
            setStepStatus(stepUpload, 'success', 'Imagem enviada com sucesso!');

            // Step 2: Extraction
            setStepStatus(stepDetect, 'active', 'IA identificando veículo e placa...');
            
            const response = await Promise.race([
                fetch('/api/analyze-vehicle', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: base64Image })
                }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 15000))
            ]);

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || `Servidor respondeu com status ${response.status}`);
            }

            const parsed = await response.json();
            setStepStatus(stepDetect, 'success', 'Placa e modelo identificados!');

            // Step 3: Structuring
            setStepStatus(stepFinish, 'active', 'Estruturando dados para revisão...');
            await new Promise(resolve => setTimeout(resolve, 600));
            setStepStatus(stepFinish, 'success', 'Dados prontos!');

            // Populate modal form
            aiValBrand.value = parsed.marca || '';
            aiValModel.value = parsed.modelo || '';
            aiValColor.value = parsed.cor || '';
            
            const cleanedPlate = (parsed.placa || '').toUpperCase().replace(/[^A-Z0-9-]/g, '');
            aiValPlate.value = formatPlateInput(cleanedPlate);

            // Porte mapping
            const sizeMap = { 'pequeno': 'P', 'medio': 'M', 'grande': 'G', 'p': 'P', 'm': 'M', 'g': 'G' };
            aiSelectedSize = sizeMap[(parsed.porte || '').toLowerCase()] || 'P';

            aiSizeBtns.forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.size === aiSelectedSize) {
                    btn.classList.add('active');
                }
            });

            // Transition UI
            setTimeout(() => {
                aiLoadingSteps.style.display = 'none';
                aiResultsForm.style.display = 'flex';
                aiConfirmBtn.disabled = false;
            }, 600);

        } catch (err) {
            console.error('AI analysis error:', err);
            
            if (stepDetect.classList.contains('active')) {
                setStepStatus(stepDetect, 'error', 'IA indisponível no momento.');
            } else {
                setStepStatus(stepUpload, 'error', 'Falha ao enviar imagem.');
            }
            
            showToast('IA falhou: ' + err.message, 'error');

            // Fallback: show empty form so operator can write manually in the modal
            setTimeout(() => {
                aiLoadingSteps.style.display = 'none';
                aiResultsForm.style.display = 'flex';
                aiConfirmBtn.disabled = false;
                
                aiValBrand.value = '';
                aiValModel.value = '';
                aiValColor.value = '';
                aiValPlate.value = '';
                
                aiSizeBtns.forEach(btn => btn.classList.remove('active'));
                document.querySelector('.ai-size-btn[data-size="P"]').classList.add('active');
                aiSelectedSize = 'P';
            }, 1800);
        }
    }

    function closeAiValidationModal() {
        if (aiValidationModal) aiValidationModal.classList.remove('active');
        aiCapturedImg.src = '';
    }

    function photoRemoveBtnAction() {
        capturedPhotoBase64 = null;
        capturedPhotoUrl = null;
        const photoPreview = document.getElementById('photo-preview-container');
        const photoImg = document.getElementById('photo-preview-img');
        const photoBtn = document.getElementById('photo-capture-btn');
        const photoInput = document.getElementById('vehicle-photo-input');
        
        if (photoPreview) photoPreview.style.display = 'none';
        if (photoImg) photoImg.src = '';
        if (photoBtn) photoBtn.classList.remove('has-photo');
        if (photoInput) photoInput.value = '';
    }

    function initAiModalEventListeners() {
        if (!aiValidationModal) return;

        closeAiValidationBtn.addEventListener('click', () => {
            closeAiValidationModal();
            photoRemoveBtnAction();
        });

        aiCancelBtn.addEventListener('click', () => {
            closeAiValidationModal();
            photoRemoveBtnAction();
        });

        // Size selector within modal
        aiSizeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                aiSizeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                aiSelectedSize = btn.dataset.size;
            });
        });

        // Plate masking within modal
        aiValPlate.addEventListener('input', (e) => {
            let val = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
            if (val.length > 8) val = val.substring(0, 8);
            e.target.value = val;
        });

        aiValPlate.addEventListener('blur', (e) => {
            let val = e.target.value.replace(/[^A-Z0-9]/g, '');
            if (val.length === 7) {
                e.target.value = formatPlateInput(val);
            }
        });

        // Confirm Action
        aiConfirmBtn.addEventListener('click', () => {
            // Apply fields to main form
            vehicleBrandInput.value = aiValBrand.value.trim();
            vehicleModelInput.value = aiValModel.value.trim();
            vehicleColorInput.value = aiValColor.value.trim();
            vehiclePlateInput.value = aiValPlate.value.trim().toUpperCase();

            // Set vehicle size in main form
            const mainSizeBtns = document.querySelectorAll('.size-selector-btn');
            mainSizeBtns.forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.size === aiSelectedSize) {
                    btn.classList.add('active');
                    currentVehicleSize = aiSelectedSize;
                }
            });

            // Update main form preview
            const photoPreview = document.getElementById('photo-preview-container');
            const photoImg = document.getElementById('photo-preview-img');
            const photoBtn = document.getElementById('photo-capture-btn');
            
            if (photoPreview && photoImg && capturedPhotoBase64) {
                photoImg.src = capturedPhotoBase64;
                photoPreview.style.display = 'block';
            }
            if (photoBtn) photoBtn.classList.add('has-photo');

            updateAllServicePrices();
            calculateTotal();
            closeAiValidationModal();
            showToast('Dados do veículo aplicados com sucesso!', 'success');
        });
    }

    // =============================================
    // === PHOTO STORAGE (Supabase / Local) ========
    // =============================================
    async function uploadPhotoToStorage(base64Image, plate) {
        if (!isOnline || !supabaseClient || !base64Image) return null;

        try {
            // Convert base64 to blob
            const response = await fetch(base64Image);
            const blob = await response.blob();
            
            const timestamp = Date.now();
            const safePlate = (plate || 'unknown').replace(/[^A-Z0-9]/gi, '');
            const filePath = `${safePlate}_${timestamp}.jpg`;

            const { data, error } = await supabaseClient.storage
                .from('vehicle-photos')
                .upload(filePath, blob, {
                    contentType: 'image/jpeg',
                    upsert: false
                });

            if (error) {
                console.warn('Storage upload error (bucket may not exist):', error.message);
                return null;
            }

            // Get public URL
            const { data: urlData } = supabaseClient.storage
                .from('vehicle-photos')
                .getPublicUrl(filePath);

            return urlData?.publicUrl || null;
        } catch (err) {
            console.warn('Photo upload failed:', err);
            return null;
        }
    }

    // --- Inspection / Vistoria Setup ---
    const inspectionCategories = [
        {
            id: 'exterior',
            name: 'Exterior & Pintura',
            icon: 'fa-solid fa-car-side',
            items: [
                { id: 'capo', name: 'Capô', weight: 4 },
                { id: 'teto', name: 'Teto', weight: 4 },
                { id: 'pc_dianteiro', name: 'Para-choque Dianteiro', weight: 3 },
                { id: 'pc_traseiro', name: 'Para-choque Traseiro', weight: 3 },
                { id: 'lat_esquerda', name: 'Lateral Esquerda', weight: 5 },
                { id: 'lat_direita', name: 'Lateral Direita', weight: 5 },
                { id: 'tampa_porta_malas', name: 'Tampa do Porta-malas', weight: 3 },
                { id: 'retrovisores', name: 'Retrovisores', weight: 2 }
            ]
        },
        {
            id: 'vidros',
            name: 'Vidros & Iluminação',
            icon: 'fa-regular fa-eye',
            items: [
                { id: 'para_brisa', name: 'Para-brisa', weight: 5 },
                { id: 'vidro_traseiro', name: 'Vidro Traseiro', weight: 3 },
                { id: 'vidros_laterais', name: 'Vidros Laterais', weight: 3 },
                { id: 'farois', name: 'Faróis Dianteiros', weight: 3 },
                { id: 'lanternas', name: 'Lanternas Traseiras', weight: 3 }
            ]
        },
        {
            id: 'rodas',
            name: 'Rodas & Pneus',
            icon: 'fa-solid fa-circle-notch',
            items: [
                { id: 'roda_diant_esq', name: 'Roda/Pneu Diant. Esquerdo', weight: 4 },
                { id: 'roda_diant_dir', name: 'Roda/Pneu Diant. Direito', weight: 4 },
                { id: 'roda_tras_esq', name: 'Roda/Pneu Tras. Esquerdo', weight: 4 },
                { id: 'roda_tras_dir', name: 'Roda/Pneu Tras. Direito', weight: 4 },
                { id: 'estepe', name: 'Estepe', weight: 2 }
            ]
        },
        {
            id: 'interior',
            name: 'Interior & Cabine',
            icon: 'fa-solid fa-couch',
            items: [
                { id: 'bancos_diant', name: 'Bancos Dianteiros', weight: 4 },
                { id: 'bancos_tras', name: 'Bancos Traseiros', weight: 3 },
                { id: 'painel', name: 'Painel / Console', weight: 3 },
                { id: 'volante', name: 'Volante & Comandos', weight: 3 },
                { id: 'forro_teto', name: 'Forro de Teto', weight: 3 },
                { id: 'carpete_tapetes', name: 'Carpete & Tapetes', weight: 2 },
                { id: 'ar_condicionado', name: 'Ar-condicionado', weight: 2 }
            ]
        },
        {
            id: 'acessorios',
            name: 'Itens & Acessórios',
            icon: 'fa-solid fa-toolbox',
            items: [
                { id: 'macaco_chave', name: 'Macaco & Chave de roda', weight: 2 },
                { id: 'triangulo', name: 'Triângulo de Segurança', weight: 2 },
                { id: 'antena', name: 'Antena externa', weight: 1 },
                { id: 'pertences', name: 'Pertences de Valor', weight: 2 }
            ]
        }
    ];

    let currentInspectionState = {};

    function initDefaultInspectionState() {
        inspectionCategories.forEach(cat => {
            cat.items.forEach(item => {
                currentInspectionState[item.id] = 'OK';
            });
        });
    }
    initDefaultInspectionState();

    const inspectionScoreDisplay = document.getElementById('inspection-score-display');
    const inspectionClassDisplay = document.getElementById('inspection-class-display');
    const scoreBadgeContainer = document.getElementById('score-badge-container');
    const scoreIcon = document.getElementById('score-icon');
    const inspectionAccordionContainer = document.getElementById('inspection-accordion-container');

    function renderInspectionAccordion() {
        if (!inspectionAccordionContainer) return;
        
        inspectionAccordionContainer.innerHTML = inspectionCategories.map(cat => {
            const itemsHtml = cat.items.map(item => {
                const state = currentInspectionState[item.id] || 'OK';
                return `
                    <div class="inspection-item-row" data-id="${item.id}" data-weight="${item.weight}">
                        <span class="inspection-item-name">${item.name}</span>
                        <div class="inspection-btn-group">
                            <button type="button" class="inspection-state-btn ${state === 'OK' ? 'active' : ''}" data-state="OK" title="OK / Sem avarias">OK</button>
                            <button type="button" class="inspection-state-btn ${state === 'RISCO' ? 'active' : ''}" data-state="RISCO" title="Risco / Desgaste / Mancha">Risco</button>
                            <button type="button" class="inspection-state-btn ${state === 'AMASSADO' ? 'active' : ''}" data-state="AMASSADO" title="Amassado / Rasgado / Trincado">Amassado</button>
                            <button type="button" class="inspection-state-btn ${state === 'NA' ? 'active' : ''}" data-state="NA" title="Não Aplicável">N/A</button>
                        </div>
                    </div>
                `;
            }).join('');

            return `
                <div class="accordion-item" id="accordion-${cat.id}">
                    <button type="button" class="accordion-trigger">
                        <span><i class="${cat.icon}"></i> ${cat.name}</span>
                        <i class="fa-solid fa-chevron-down chevron-icon"></i>
                    </button>
                    <div class="accordion-content">
                        <div class="inspection-items-grid">
                            ${itemsHtml}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Attach Accordion Toggle listeners
        const triggers = inspectionAccordionContainer.querySelectorAll('.accordion-trigger');
        triggers.forEach(trigger => {
            trigger.addEventListener('click', () => {
                const item = trigger.closest('.accordion-item');
                const isActive = item.classList.contains('active');
                
                // Close all
                inspectionAccordionContainer.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('active'));
                
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        });

        // Attach Button group toggle listeners
        const stateButtons = inspectionAccordionContainer.querySelectorAll('.inspection-state-btn');
        stateButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const row = btn.closest('.inspection-item-row');
                const itemId = row.getAttribute('data-id');
                const state = btn.getAttribute('data-state');
                
                row.querySelectorAll('.inspection-state-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                currentInspectionState[itemId] = state;
                updateScoreBadge();
            });
        });
    }

    function calculateInspectionScore() {
        let totalWeight = 0;
        let earnedWeight = 0;
        
        inspectionCategories.forEach(cat => {
            cat.items.forEach(item => {
                const state = currentInspectionState[item.id] || 'OK';
                if (state !== 'NA') {
                    totalWeight += item.weight;
                    if (state === 'OK') {
                        earnedWeight += item.weight;
                    } else if (state === 'RISCO') {
                        earnedWeight += item.weight * 0.5;
                    }
                }
            });
        });
        
        return totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 100;
    }

    function getScoreClassification(score) {
        if (score >= 90) return { text: 'Excelente', class: 'score-excellent', icon: 'fa-regular fa-smile-beam' };
        if (score >= 75) return { text: 'Bom', class: 'score-good', icon: 'fa-regular fa-smile' };
        if (score >= 50) return { text: 'Regular', class: 'score-regular', icon: 'fa-regular fa-meh' };
        return { text: 'Crítico', class: 'score-critical', icon: 'fa-regular fa-frown' };
    }

    function updateScoreBadge() {
        const score = calculateInspectionScore();
        const info = getScoreClassification(score);
        
        if (inspectionScoreDisplay) inspectionScoreDisplay.textContent = `${score}%`;
        if (inspectionClassDisplay) inspectionClassDisplay.textContent = info.text;
        
        if (scoreBadgeContainer) {
            scoreBadgeContainer.className = 'score-conservation-badge ' + info.class;
        }
        
        if (scoreIcon) {
            scoreIcon.className = info.icon;
        }
    }

    function generateInspectionSummary() {
        let summaries = [];
        
        inspectionCategories.forEach(cat => {
            let catIssues = [];
            cat.items.forEach(item => {
                const state = currentInspectionState[item.id] || 'OK';
                if (state === 'RISCO') {
                    catIssues.push(`${item.name} (Risco)`);
                } else if (state === 'AMASSADO') {
                    catIssues.push(`${item.name} (Amassado)`);
                }
            });
            if (catIssues.length > 0) {
                summaries.push(`${cat.name}: ${catIssues.join(', ')}`);
            }
        });
        
        return summaries.length > 0 ? summaries.join(' | ') : 'Sem avarias visíveis';
    }

    function parseDamagesString(damagesStr) {
        if (!damagesStr) return { text: 'Sem avarias visíveis.', state: null };
        
        if (damagesStr.includes(' ||| ')) {
            const parts = damagesStr.split(' ||| ');
            try {
                const text = parts[0];
                const state = JSON.parse(parts[1]);
                return { text, state };
            } catch (e) {
                return { text: damagesStr, state: null };
            }
        }
        
        return { text: damagesStr, state: null };
    }

    // --- Authentication Logic ---
    async function sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Read and normalise username to lowercase
        const usernameInput = document.getElementById('login-username').value.trim().toLowerCase();
        const passwordInput = document.getElementById('login-password').value;
        
        // Hashing password
        const passwordHash = await sha256(passwordInput);
        
        let accessAuthorized = false;
        let userRole = 'operator';
        
        // Credentials validation online via Supabase
        if (isOnline && supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('users')
                    .select('*')
                    .eq('username', usernameInput)
                    .eq('active', true)
                    .single();
                
                if (!error && data) {
                    if (data.password_hash === passwordHash) {
                        accessAuthorized = true;
                        userRole = data.role || 'operator';
                    }
                }
            } catch (err) {
                console.warn('Erro na autenticação online Supabase:', err);
            }
        }
        
        // Fallback credentials validation (Password: ideal123)
        if (!accessAuthorized) {
            const allowedUsers = ['guilherme', 'tony', 'mateus', 'matheus', 'peterson'];
            const fallbackHash = '25f87a436337cad46fe53ecbef2be05e5d5b7a7913c9b779ded8eae595ab9442';
            if (allowedUsers.includes(usernameInput) && passwordHash === fallbackHash) {
                accessAuthorized = true;
                userRole = (usernameInput === 'guilherme' || usernameInput === 'tony') ? 'admin' : 'operator';
            }
        }
        
        if (accessAuthorized) {
            localStorage.setItem('ideal_logged_in', 'true');
            // Store the logged in username capitalized for custom greeting
            const capitalizedUser = usernameInput.charAt(0).toUpperCase() + usernameInput.slice(1);
            localStorage.setItem('ideal_logged_user', capitalizedUser);
            localStorage.setItem('ideal_logged_role', userRole);
            
            loginErrorMsg.style.display = 'none';
            
            // Show admin button if admin
            const adminToggleBtn = document.getElementById('admin-toggle-btn');
            if (adminToggleBtn) {
                adminToggleBtn.style.display = (userRole === 'admin') ? 'flex' : 'none';
            }
            
            // Success transition
            loginCard.style.transform = 'scale(0.95)';
            loginScreen.style.opacity = '0';
            setTimeout(() => {
                loginScreen.classList.add('hidden');
                mainAppContainer.style.display = 'flex';
                initApp();
                showToast(`Acesso autorizado. Bem-vindo, ${capitalizedUser}!`, 'success');
            }, 300);
        } else {
            // Error shake feedback
            loginErrorMsg.style.display = 'flex';
            loginCard.classList.add('shake');
            setTimeout(() => {
                loginCard.classList.remove('shake');
            }, 500);
            
            document.getElementById('login-password').value = '';
            document.getElementById('login-password').focus();
        }
    });

    logoutBtn.addEventListener('click', () => {
        if (confirm('Deseja realmente sair do sistema?')) {
            localStorage.removeItem('ideal_logged_in');
            localStorage.removeItem('ideal_logged_user');
            localStorage.removeItem('ideal_logged_role');
            location.reload();
        }
    });

    function checkAuth() {
        const loggedIn = localStorage.getItem('ideal_logged_in') === 'true';
        if (loggedIn) {
            loginScreen.classList.add('hidden');
            mainAppContainer.style.display = 'flex';
            initApp();
            
            // Show admin button if user is admin
            const role = localStorage.getItem('ideal_logged_role') || 'operator';
            const adminToggleBtn = document.getElementById('admin-toggle-btn');
            if (adminToggleBtn) {
                adminToggleBtn.style.display = (role === 'admin') ? 'flex' : 'none';
            }
        } else {
            loginScreen.classList.remove('hidden');
            mainAppContainer.style.display = 'none';
            document.getElementById('login-username').focus();
        }
    }

    async function loadServices() {
        // Read cached services from localStorage if available
        const localServices = localStorage.getItem('ideal_services');
        if (localServices) {
            try {
                SERVICE_CATALOG = JSON.parse(localServices);
            } catch (e) {
                console.warn('Falha ao ler cache de serviços:', e);
            }
        }
        
        if (isOnline && supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('services')
                    .select('*')
                    .eq('active', true);
                
                if (error) throw error;
                
                if (data && data.length > 0) {
                    SERVICE_CATALOG = data.map(item => ({
                        id: item.id,
                        name: item.name,
                        icon: item.icon,
                        prices: item.prices
                    }));
                    localStorage.setItem('ideal_services', JSON.stringify(SERVICE_CATALOG));
                }
            } catch (err) {
                console.warn('Erro ao carregar serviços do Supabase:', err);
            }
        }
        
        // Re-render UI list
        renderServicesList();
    }

    async function initApp() {
        // Render local catalog immediately for UX
        renderServicesList();
        initVehicleSizeSelector();
        initPaymentMethod();
        initPhotoCapture();
        initAiModalEventListeners();
        initializeDates();
        calculateTotal();
        
        // Connect to database and sync
        await initSupabase();
        await loadServices(); // Updates SERVICES_CATALOG and re-renders
        initAdminPanel(); // Initialize Admin Panel listeners
        
        renderInspectionAccordion();
        updateScoreBadge();
    }

    // --- Init Dates ---
    function initializeDates() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1); // default 24h prediction

        entryDateInput.value = formatDateTimeForInput(now);
        deliveryDateInput.value = formatDateTimeForInput(tomorrow);
    }

    // Formatting date helper
    function formatDateTimeForInput(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    function formatDateTimeToBrazilian(dateTimeStr) {
        if (!dateTimeStr) return '';
        const d = new Date(dateTimeStr);
        if (isNaN(d.getTime())) return dateTimeStr;
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} às ${hours}:${minutes}h`;
    }

    // --- Theme Toggle ---
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
        document.body.classList.remove('light-mode');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }

    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        themeToggleBtn.innerHTML = isLight ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
        showToast('Tema alterado!', 'success');
    });

    // --- Price Calculation ---
    function calculateTotal() {
        let subtotal = 0;
        const serviceCheckboxes = document.querySelectorAll('.service-item[data-service-id] .service-checkbox');
        
        serviceCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const item = checkbox.closest('.service-item');
                const priceInput = item.querySelector('.service-price');
                subtotal += parseFloat(priceInput.value) || 0;
            }
        });

        // Custom service
        const customCb = document.getElementById('custom-service-checkbox');
        const customPrice = document.getElementById('custom-service-price');
        if (customCb && customCb.checked) {
            subtotal += parseFloat(customPrice.value) || 0;
        }

        // Apply discount
        const discountRate = getDiscountRate();
        const discountAmount = subtotal * discountRate;
        const finalTotal = subtotal - discountAmount;

        // Update displays
        if (totalAmountDisplay) {
            totalAmountDisplay.textContent = subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        
        if (totalFinalDisplay) {
            totalFinalDisplay.textContent = finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            
            if (discountRate > 0) {
                totalFinalDisplay.classList.add('has-discount');
            } else {
                totalFinalDisplay.classList.remove('has-discount');
            }
        }
        
        if (discountInfoDisplay) {
            if (discountRate > 0) {
                discountInfoDisplay.style.display = 'flex';
                discountInfoDisplay.innerHTML = `<i class="fa-solid fa-tag"></i> Desconto ${currentPaymentMethod === 'pix' ? 'PIX' : 'Dinheiro'}: <strong>−R$ ${discountAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>`;
            } else {
                discountInfoDisplay.style.display = 'none';
            }
        }

        // Installment info
        const installmentInfo = document.getElementById('installment-info');
        if (installmentInfo && currentPaymentMethod === 'cartao' && currentInstallments > 1) {
            const perInstallment = finalTotal / currentInstallments;
            installmentInfo.style.display = 'block';
            if (currentInstallments <= 2) {
                installmentInfo.textContent = `${currentInstallments}x de R$ ${perInstallment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} sem juros`;
            } else {
                installmentInfo.textContent = `${currentInstallments}x de R$ ${perInstallment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (juros da maquininha)`;
            }
        } else if (installmentInfo) {
            installmentInfo.style.display = 'none';
        }

        return finalTotal;
    }

    // --- Pre-existing Damages Tags ---
    damageTags.forEach(tag => {
        tag.addEventListener('click', () => {
            const damageValue = tag.getAttribute('data-damage');
            let currentText = preExistingDamagesTextarea.value.trim();

            if (currentText.includes(damageValue)) {
                const escapedValue = damageValue.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                const regex = new RegExp(`(?:,\\s*)?${escapedValue}(?:,\\s*)?`, 'g');
                let newText = currentText.replace(regex, ', ').trim();
                if (newText.startsWith(',')) newText = newText.substring(1).trim();
                if (newText.endsWith(',')) newText = newText.substring(0, newText.length - 1).trim();
                newText = newText.replace(/,\s*,/g, ', ');
                preExistingDamagesTextarea.value = newText;
                tag.classList.remove('active-tag');
            } else {
                if (currentText === "") {
                    preExistingDamagesTextarea.value = damageValue;
                } else {
                    preExistingDamagesTextarea.value = currentText + ", " + damageValue;
                }
                tag.classList.add('active-tag');
            }
        });
    });

    preExistingDamagesTextarea.addEventListener('input', () => {
        const text = preExistingDamagesTextarea.value;
        damageTags.forEach(tag => {
            const val = tag.getAttribute('data-damage');
            if (text.includes(val)) {
                tag.classList.add('active-tag');
            } else {
                tag.classList.remove('active-tag');
            }
        });
    });

    // --- Inputs Masking ---
    vehiclePlateInput.addEventListener('input', (e) => {
        let val = e.target.value.toUpperCase();
        val = val.replace(/[^A-Z0-9-]/g, '');
        if (val.length > 8) val = val.substring(0, 8);
        e.target.value = val;
    });

    vehiclePlateInput.addEventListener('blur', (e) => {
        let val = e.target.value.replace(/[^A-Z0-9]/g, '');
        if (val.length === 7) {
            e.target.value = formatPlateInput(val);
        }
    });

    clientWhatsappInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 11) val = val.substring(0, 11);
        let formatted = '';
        if (val.length > 0) formatted = '(' + val.substring(0, 2);
        if (val.length > 2) formatted += ') ' + val.substring(2, 7);
        if (val.length > 7) formatted += '-' + val.substring(7, 11);
        e.target.value = formatted;
    });

    // --- Form Actions ---
    clearBtn.addEventListener('click', () => {
        if (confirm('Deseja realmente limpar todos os campos?')) {
            resetForm();
            showToast('Formulário limpo!', 'success');
        }
    });

    function resetForm() {
        checklistForm.reset();
        manualPriceOverrides = {};
        currentVehicleSize = 'P';
        currentPaymentMethod = 'cartao';
        currentInstallments = 1;
        capturedPhotoBase64 = null;
        capturedPhotoUrl = null;
        editingChecklistId = null;
        
        const saveBtn = document.getElementById('save-btn');
        if (saveBtn) {
            saveBtn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Salvar e Gerar`;
        }
        
        // Reset size selector
        document.querySelectorAll('.size-selector-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.size === 'P') btn.classList.add('active');
        });
        
        // Reset payment
        document.querySelectorAll('.payment-method-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.method === 'cartao') btn.classList.add('active');
        });
        const installmentSection = document.getElementById('installment-section');
        if (installmentSection) installmentSection.style.display = 'flex';
        const installSelect = document.getElementById('installment-select');
        if (installSelect) installSelect.value = '1';
        
        // Reset photo
        const photoPreview = document.getElementById('photo-preview-container');
        const photoBtn = document.getElementById('photo-capture-btn');
        if (photoPreview) photoPreview.style.display = 'none';
        if (photoBtn) photoBtn.classList.remove('has-photo');
        
        damageTags.forEach(tag => tag.classList.remove('active-tag'));
        
        renderServicesList();
        initializeDates();
        calculateTotal();
        initDefaultInspectionState();
        renderInspectionAccordion();
        updateScoreBadge();
    }

    // --- Supabase Config & Integration ---
    async function initSupabase() {
        let url = localStorage.getItem('supabase_url');
        let key = localStorage.getItem('supabase_key');

        // Check for pre-configuration in config.js loaded in window context
        const config = window.IDEAL_CONFIG || window.SUPABASE_CONFIG;
        if (config && config.url && config.anonKey) {
            url = config.url;
            key = config.anonKey;
            
            // Cache locally as backup
            if (!localStorage.getItem('supabase_url')) {
                localStorage.setItem('supabase_url', url);
                localStorage.setItem('supabase_key', key);
            }
        }

        if (url && key) {
            try {
                supabaseClient = window.supabase.createClient(url, key);
                const { data, error } = await supabaseClient
                    .from('checklists')
                    .select('id')
                    .limit(1);

                if (error) throw error;

                isOnline = true;
                updateConnectionBadge(true);
                updateSettingsStatusBox('success', 'Conectado ao Supabase com sucesso! Sincronização ativa.');
                await syncLocalDataToCloud();
            } catch (err) {
                console.error('Erro de conexão com o Supabase:', err);
                isOnline = false;
                updateConnectionBadge(false, 'Erro de Conexão');
                updateSettingsStatusBox('error', `Falha de conexão: ${err.message || 'Verifique as chaves e tabelas'}`);
            }
        } else {
            isOnline = false;
            supabaseClient = null;
            updateConnectionBadge(false);
            updateSettingsStatusBox('info', 'Banco de dados não configurado (Operando localmente).');
        }
        await loadChecklists();
    }

    function updateConnectionBadge(online, text = '') {
        if (online) {
            connectionStatusBadge.className = 'status-badge status-online';
            connectionStatusBadge.querySelector('.status-label').textContent = 'Online';
        } else {
            connectionStatusBadge.className = 'status-badge status-offline';
            connectionStatusBadge.querySelector('.status-label').textContent = text || 'Modo Local';
        }
    }

    function updateSettingsStatusBox(type, text) {
        settingsStatusBox.className = 'settings-status-box';
        if (type === 'success') {
            settingsStatusBox.classList.add('status-success');
            settingsStatusBox.querySelector('i').className = 'fa-solid fa-circle-check';
        } else if (type === 'error') {
            settingsStatusBox.classList.add('status-error');
            settingsStatusBox.querySelector('i').className = 'fa-solid fa-circle-xmark';
        } else {
            settingsStatusBox.querySelector('i').className = 'fa-solid fa-circle-info';
        }
        settingsStatusText.textContent = text;
    }

    // --- Load Data ---
    async function loadChecklists() {
        const localData = (JSON.parse(localStorage.getItem('ideal_checklists')) || []).filter(c => c.client && c.client.trim() !== '' && c.totalValue > 0);
        
        if (isOnline && supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('checklists')
                    .select('*')
                    .order('id', { ascending: false });

                if (error) throw error;

                checklists = data.map(dbRow => {
                    const vehicleParts = (dbRow.vehicle || '').split(' | ');
                    const brand = vehicleParts.length > 1 ? vehicleParts[0] : '';
                    const vehicle = vehicleParts.length > 1 ? vehicleParts[1] : dbRow.vehicle;
                    const color = vehicleParts.length > 2 ? vehicleParts[2] : '';
                    return {
                        id: dbRow.id,
                        client: dbRow.client,
                        whatsapp: dbRow.whatsapp,
                        brand: brand,
                        vehicle: vehicle,
                        color: color,
                        plate: dbRow.plate,
                        services: dbRow.services,
                        damages: dbRow.damages,
                        entryDate: dbRow.entry_date,
                        deliveryDate: dbRow.delivery_date,
                        totalValue: parseFloat(dbRow.total_value),
                        paymentMethod: dbRow.payment_method || null,
                        vehicleSize: dbRow.vehicle_size || null,
                        photoUrl: dbRow.photo_url || null,
                        discount: dbRow.discount || 0
                    };
                }).filter(c => c.client && c.client.trim() !== '' && c.totalValue > 0);
                
                localStorage.setItem('ideal_checklists', JSON.stringify(checklists));
            } catch (err) {
                console.error('Erro ao buscar do Supabase, usando cache local:', err);
                checklists = localData;
                showToast('Erro de sincronização. Usando dados offline.', 'error');
            }
        } else {
            checklists = localData;
        }

        // Clean up any empty/zero checklists from localStorage
        const cleanedChecklists = checklists.filter(c => c.client && c.client.trim() !== '' && c.totalValue > 0);
        if (cleanedChecklists.length !== checklists.length) {
            checklists = cleanedChecklists;
            const storageList = checklists.map(c => {
                const copy = { ...c };
                delete copy.photoBase64;
                return copy;
            });
            localStorage.setItem('ideal_checklists', JSON.stringify(storageList));
        }

        renderHistory();
    }

    // --- Save Data ---
    checklistForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const selectedServices = [];
        const serviceCheckboxes = document.querySelectorAll('.service-item[data-service-id] .service-checkbox');
        
        serviceCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const item = checkbox.closest('.service-item');
                const priceInput = item.querySelector('.service-price');
                selectedServices.push({
                    name: checkbox.getAttribute('data-service'),
                    price: parseFloat(priceInput.value) || 0
                });
            }
        });

        const customCb = document.getElementById('custom-service-checkbox');
        const customNameInput = document.getElementById('custom-service-name');
        const customPriceInput = document.getElementById('custom-service-price');
        if (customCb && customCb.checked && customNameInput.value.trim() !== '') {
            selectedServices.push({
                name: customNameInput.value.trim(),
                price: parseFloat(customPriceInput.value) || 0
            });
        }

        if (selectedServices.length === 0) {
            showToast('Selecione pelo menos um serviço!', 'error');
            return;
        }

        const autoSummary = generateInspectionSummary();
        const customText = preExistingDamagesTextarea.value.trim();
        let finalDamagesText = autoSummary;
        
        if (customText && customText !== 'Sem avarias visíveis.' && customText !== 'Sem avarias') {
            if (finalDamagesText && finalDamagesText !== 'Sem avarias visíveis') {
                finalDamagesText += " [Obs: " + customText + "]";
            } else {
                finalDamagesText = customText;
            }
        }
        
        const serializedDamages = finalDamagesText + " ||| " + JSON.stringify(currentInspectionState);

        // Calculate totals
        const finalTotal = calculateTotal();
        const subtotal = selectedServices.reduce((sum, s) => sum + s.price, 0);
        const discountRate = getDiscountRate();
        const discountAmount = subtotal * discountRate;

        // Upload photo if available
        let photoUrl = null;
        if (capturedPhotoBase64) {
            photoUrl = await uploadPhotoToStorage(capturedPhotoBase64, vehiclePlateInput.value.trim());
            if (!photoUrl && capturedPhotoBase64) {
                // Store base64 in localStorage as fallback (limited)
                photoUrl = 'local:' + capturedPhotoBase64.substring(0, 100); // Reference marker
            }
        }

        const newChecklist = {
            id: editingChecklistId || Date.now().toString(),
            client: clientNameInput.value.trim(),
            whatsapp: clientWhatsappInput.value.trim(),
            brand: vehicleBrandInput.value.trim(),
            vehicle: vehicleModelInput.value.trim(),
            color: vehicleColorInput.value.trim(),
            plate: vehiclePlateInput.value.trim().toUpperCase(),
            services: selectedServices,
            damages: serializedDamages,
            entryDate: entryDateInput.value,
            deliveryDate: deliveryDateInput.value,
            totalValue: finalTotal,
            // v2 fields
            paymentMethod: currentPaymentMethod,
            vehicleSize: currentVehicleSize,
            discount: discountAmount,
            installments: currentPaymentMethod === 'cartao' ? currentInstallments : 1,
            photoUrl: photoUrl,
            photoBase64: capturedPhotoBase64 || null
        };

        // Double check validation to prevent empty checklists
        if (!newChecklist.client || !newChecklist.vehicle || newChecklist.totalValue <= 0) {
            showToast('Erro: Checklist inválido ou vazio.', 'error');
            return;
        }

        if (editingChecklistId) {
            const idx = checklists.findIndex(c => c.id === editingChecklistId);
            if (idx !== -1) {
                checklists[idx] = newChecklist;
            } else {
                checklists.unshift(newChecklist);
            }
        } else {
            checklists.unshift(newChecklist);
        }
        
        // Save to localStorage (exclude heavy base64 from storage to save space)
        const storageList = checklists.map(c => {
            const copy = { ...c };
            delete copy.photoBase64; // Don't persist base64 in localStorage
            return copy;
        });
        localStorage.setItem('ideal_checklists', JSON.stringify(storageList));

        if (isOnline && supabaseClient) {
            try {
                const { error } = await supabaseClient
                    .from('checklists')
                    .upsert([{
                        id: newChecklist.id,
                        client: newChecklist.client,
                        whatsapp: newChecklist.whatsapp,
                        vehicle: `${newChecklist.brand} | ${newChecklist.vehicle} | ${newChecklist.color}`,
                        plate: newChecklist.plate,
                        services: newChecklist.services,
                        damages: newChecklist.damages,
                        entry_date: newChecklist.entryDate,
                        delivery_date: newChecklist.deliveryDate,
                        total_value: newChecklist.totalValue
                    }]);

                if (error) throw error;
                showToast(editingChecklistId ? 'Checklist atualizado online!' : 'Checklist salvo online!', 'success');
            } catch (err) {
                console.error('Erro ao salvar no Supabase:', err);
                showToast('Salvo apenas localmente (erro ao enviar para a nuvem).', 'error');
            }
        } else {
            showToast(editingChecklistId ? 'Checklist atualizado localmente!' : 'Checklist salvo localmente!', 'success');
        }

        if (editingChecklistId) {
            editingChecklistId = null;
            const saveBtn = document.getElementById('save-btn');
            if (saveBtn) {
                saveBtn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Salvar e Gerar`;
            }
        }

        renderHistory();
        openPreviewModal(newChecklist);
        resetForm();
    });

    // --- Sync offline data to Supabase ---
    async function syncLocalDataToCloud() {
        if (!isOnline || !supabaseClient) return;

        const localChecklists = JSON.parse(localStorage.getItem('ideal_checklists')) || [];
        if (localChecklists.length === 0) return;

        try {
            const { data: cloudIds, error: fetchErr } = await supabaseClient
                .from('checklists')
                .select('id');

            if (fetchErr) throw fetchErr;

            const existingCloudIds = new Set(cloudIds.map(row => row.id));
            const itemsToInsert = localChecklists.filter(item => !existingCloudIds.has(item.id));

            if (itemsToInsert.length > 0) {
                const rowsToInsert = itemsToInsert.map(item => ({
                    id: item.id,
                    client: item.client,
                    whatsapp: item.whatsapp,
                    vehicle: `${item.brand || ''} | ${item.vehicle || ''} | ${item.color || ''}`,
                    plate: item.plate,
                    services: item.services,
                    damages: item.damages,
                    entry_date: item.entryDate,
                    delivery_date: item.deliveryDate,
                    total_value: item.totalValue
                }));

                const { error: insertErr } = await supabaseClient
                    .from('checklists')
                    .insert(rowsToInsert);

                if (insertErr) throw insertErr;
                showToast(`Sincronizados ${itemsToInsert.length} registros locais!`, 'success');
            }
        } catch (err) {
            console.error('Erro na sincronização automática:', err);
        }
    }

    // --- Render History ---
    function renderHistory() {
        const query = searchInput.value.toLowerCase().trim();
        const dateFilter = document.getElementById('filter-date') ? document.getElementById('filter-date').value : 'all';
        const paymentFilter = document.getElementById('filter-payment') ? document.getElementById('filter-payment').value : 'all';

        const filtered = checklists.filter(c => {
            // Text Search Filter
            const matchesSearch = !query || 
                (c.client && c.client.toLowerCase().includes(query)) || 
                (c.plate && c.plate.toLowerCase().includes(query)) || 
                (c.vehicle && c.vehicle.toLowerCase().includes(query)) ||
                (c.brand && c.brand.toLowerCase().includes(query));

            // Payment Filter
            const matchesPayment = paymentFilter === 'all' || c.paymentMethod === paymentFilter;

            // Date Filter
            let matchesDate = true;
            if (dateFilter !== 'all') {
                if (!c.entryDate) {
                    matchesDate = false;
                } else {
                    const entryDateObj = new Date(c.entryDate);
                    if (isNaN(entryDateObj.getTime())) {
                        matchesDate = false;
                    } else {
                        const now = new Date();
                        if (dateFilter === 'today') {
                            matchesDate = entryDateObj.getDate() === now.getDate() &&
                                          entryDateObj.getMonth() === now.getMonth() &&
                                          entryDateObj.getFullYear() === now.getFullYear();
                        } else if (dateFilter === 'week') {
                            const sevenDaysAgo = new Date();
                            sevenDaysAgo.setDate(now.getDate() - 7);
                            sevenDaysAgo.setHours(0, 0, 0, 0);
                            matchesDate = entryDateObj >= sevenDaysAgo;
                        } else if (dateFilter === 'month') {
                            matchesDate = entryDateObj.getMonth() === now.getMonth() &&
                                          entryDateObj.getFullYear() === now.getFullYear();
                        }
                    }
                }
            }

            return matchesSearch && matchesPayment && matchesDate;
        });

        // Update Analytics Widgets based on filtered results
        const totalRevenueObj = filtered.reduce((sum, c) => sum + (c.totalValue || 0), 0);
        const statsTotalRevenue = document.getElementById('stats-total-revenue');
        const statsTotalCount = document.getElementById('stats-total-count');

        if (statsTotalRevenue) {
            statsTotalRevenue.textContent = totalRevenueObj.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }
        if (statsTotalCount) {
            statsTotalCount.textContent = filtered.length;
        }

        historyCounter.textContent = `${filtered.length} checklist${filtered.length === 1 ? '' : 's'} encontrado${filtered.length === 1 ? '' : 's'}`;

        if (filtered.length === 0) {
            historyListContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-folder-open"></i>
                    <p>${query || dateFilter !== 'all' || paymentFilter !== 'all' ? 'Nenhum resultado encontrado.' : 'Nenhum checklist registrado.'}</p>
                </div>
            `;
            return;
        }

        historyListContainer.innerHTML = filtered.map(c => {
            const formattedDate = formatDateTimeToBrazilian(c.entryDate).split(' às ')[0];
            const totalFmt = c.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            const paymentIcon = c.paymentMethod === 'pix' ? '📱' : c.paymentMethod === 'dinheiro' ? '💵' : '💳';
            return `
                <div class="history-card" data-id="${c.id}">
                    <div class="card-header">
                        <div class="card-title-container">
                            <span class="card-client-name">${escapeHTML(c.client)}</span>
                            <span class="card-date"><i class="fa-regular fa-calendar"></i> ${formattedDate}</span>
                        </div>
                        <span class="card-plate-tag">${escapeHTML(c.plate)}</span>
                    </div>
                    <div class="card-details">
                        <span class="card-vehicle"><i class="fa-solid fa-car-side"></i> ${c.brand ? escapeHTML(c.brand) + ' ' : ''}${escapeHTML(c.vehicle)}</span>
                        <span class="card-total">${paymentIcon} ${totalFmt}</span>
                    </div>
                    <div class="card-footer">
                        <button class="card-action-btn btn-view" title="Visualizar Comprovante" onclick="event.stopPropagation(); window.viewChecklist('${c.id}')">
                            <i class="fa-solid fa-receipt"></i>
                        </button>
                        <button class="card-action-btn btn-delete" title="Excluir" onclick="event.stopPropagation(); window.deleteChecklist('${c.id}')">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    searchInput.addEventListener('input', renderHistory);
    
    const filterDateInput = document.getElementById('filter-date');
    const filterPaymentInput = document.getElementById('filter-payment');
    if (filterDateInput) {
        filterDateInput.addEventListener('change', renderHistory);
    }
    if (filterPaymentInput) {
        filterPaymentInput.addEventListener('change', renderHistory);
    }

    function escapeHTML(str) {
        if (!str) return '';
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // --- Modal Control ---
    function openPreviewModal(checklist) {
        currentPreviewChecklist = checklist;
        rClient.textContent = checklist.client;
        rWhatsapp.textContent = checklist.whatsapp;
        if (rBrand) rBrand.textContent = checklist.brand || '';
        rVehicle.textContent = checklist.vehicle || '';
        if (rColor) rColor.textContent = checklist.color || '';
        rPlate.textContent = checklist.plate;
        
        // Parse damages string
        const parsed = parseDamagesString(checklist.damages);
        rDamages.textContent = parsed.text || 'Sem avarias visíveis.';
        
        rEntry.textContent = formatDateTimeToBrazilian(checklist.entryDate);
        rDelivery.textContent = formatDateTimeToBrazilian(checklist.deliveryDate);
        rTotal.textContent = checklist.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        
        rServices.innerHTML = checklist.services.map(s => {
            return `
                <li>
                    <span>• ${escapeHTML(s.name)}</span>
                    <span>R$ ${s.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </li>
            `;
        }).join('');

        // Payment info in receipt
        const rPayment = document.getElementById('r-payment');
        const rDiscount = document.getElementById('r-discount');
        const rInstallments = document.getElementById('r-installments');
        const rPaymentSection = document.getElementById('receipt-payment-section');
        const rPaymentDivider = document.getElementById('receipt-payment-divider');

        if (checklist.paymentMethod) {
            if (rPaymentSection) rPaymentSection.style.display = 'block';
            if (rPaymentDivider) rPaymentDivider.style.display = 'block';
            
            const pmLabels = { 'cartao': '💳 Cartão', 'pix': '📱 PIX', 'dinheiro': '💵 Dinheiro' };
            if (rPayment) rPayment.textContent = pmLabels[checklist.paymentMethod] || checklist.paymentMethod;
            
            if (rDiscount) {
                if (checklist.discount > 0) {
                    rDiscount.textContent = `−R$ ${checklist.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
                    rDiscount.parentElement.style.display = 'block';
                } else {
                    rDiscount.parentElement.style.display = 'none';
                }
            }
            
            if (rInstallments) {
                if (checklist.installments && checklist.installments > 1) {
                    const perInst = checklist.totalValue / checklist.installments;
                    rInstallments.textContent = `${checklist.installments}x de R$ ${perInst.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
                    rInstallments.parentElement.style.display = 'block';
                } else {
                    rInstallments.parentElement.style.display = 'none';
                }
            }
        } else {
            // Legacy record
            if (rPaymentSection) rPaymentSection.style.display = 'none';
            if (rPaymentDivider) rPaymentDivider.style.display = 'none';
        }

        // Photo in receipt
        const rPhotoContainer = document.getElementById('receipt-photo-container');
        const rPhotoImg = document.getElementById('r-photo-img');
        if (checklist.photoBase64 && rPhotoContainer && rPhotoImg) {
            rPhotoImg.src = checklist.photoBase64;
            rPhotoContainer.style.display = 'block';
        } else if (checklist.photoUrl && !checklist.photoUrl.startsWith('local:') && rPhotoContainer && rPhotoImg) {
            rPhotoImg.src = checklist.photoUrl;
            rPhotoContainer.style.display = 'block';
        } else if (rPhotoContainer) {
            rPhotoContainer.style.display = 'none';
        }

        // Handle inspection layout in modal
        const rInspectionDivider = document.getElementById('receipt-inspection-divider');
        const rInspectionSection = document.getElementById('receipt-inspection-section');
        const rInspectionScore = document.getElementById('r-inspection-score');
        const rInspectionClass = document.getElementById('r-inspection-class');
        const rScoreBadge = document.getElementById('r-score-badge');
        const rInspectionGrid = document.getElementById('r-inspection-grid');

        if (parsed.state) {
            let totalWeight = 0;
            let earnedWeight = 0;
            let nonOkItems = [];

            inspectionCategories.forEach(cat => {
                cat.items.forEach(item => {
                    const state = parsed.state[item.id] || 'OK';
                    if (state !== 'NA') {
                        totalWeight += item.weight;
                        if (state === 'OK') {
                            earnedWeight += item.weight;
                        } else if (state === 'RISCO') {
                            earnedWeight += item.weight * 0.5;
                            nonOkItems.push({ name: item.name, status: 'Risco', class: 'status-txt-risco' });
                        } else if (state === 'AMASSADO') {
                            nonOkItems.push({ name: item.name, status: 'Amassado', class: 'status-txt-amassado' });
                        }
                    } else {
                        nonOkItems.push({ name: item.name, status: 'N/A', class: 'status-txt-na' });
                    }
                });
            });

            const score = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 100;
            const info = getScoreClassification(score);

            if (rInspectionScore) rInspectionScore.textContent = `${score}%`;
            if (rInspectionClass) rInspectionClass.textContent = `(${info.text})`;
            if (rScoreBadge) rScoreBadge.className = 'receipt-score-badge ' + info.class;

            if (rInspectionGrid) {
                const displayItems = nonOkItems.filter(item => item.status !== 'OK');
                if (displayItems.length > 0) {
                    rInspectionGrid.innerHTML = displayItems.map(item => `
                        <div class="receipt-inspection-item">
                            <span class="receipt-item-label">${item.name}</span>
                            <span class="receipt-item-status ${item.class}">${item.status}</span>
                        </div>
                    `).join('');
                } else {
                    rInspectionGrid.innerHTML = '<div style="grid-column: 1 / -1; color: var(--accent-green); font-weight:600; text-align:center; padding: 10px 0;">Todos os itens inspecionados em perfeito estado (100% OK).</div>';
                }
            }

            if (rInspectionDivider) rInspectionDivider.style.display = 'block';
            if (rInspectionSection) rInspectionSection.style.display = 'block';
        } else {
            // Legacy record or no inspection state
            if (rInspectionDivider) rInspectionDivider.style.display = 'none';
            if (rInspectionSection) rInspectionSection.style.display = 'none';
        }

        previewModal.classList.add('active');
    }

    function closeModal() {
        previewModal.classList.remove('active');
        currentPreviewChecklist = null;
    }

    closeModalBtn.addEventListener('click', closeModal);
    modalCloseActionBtn.addEventListener('click', closeModal);
    previewModal.addEventListener('click', (e) => {
        if (e.target === previewModal) closeModal();
    });

    printBtn.addEventListener('click', () => {
        window.print();
    });

    whatsappSendBtn.addEventListener('click', () => {
        if (!currentPreviewChecklist) return;
        const c = currentPreviewChecklist;
        
        let msg = `🚗 *IDEAL ESTÉTICA AUTOMOTIVA* 🚗\n`;
        msg += `*Comprovante de Entrada — Checklist*\n\n`;
        msg += `👤 *Cliente:* ${c.client}\n`;
        msg += `📱 *WhatsApp:* ${c.whatsapp}\n`;
        msg += `🚘 *Veículo:* ${c.brand ? c.brand + ' ' : ''}${c.vehicle}${c.color ? ' (' + c.color + ')' : ''}\n`;
        msg += `🎫 *Placa:* ${c.plate}\n\n`;
        
        msg += `🛠️ *Serviço(s) Contratado(s):*\n`;
        c.services.forEach(s => {
            msg += `• _${s.name}_ — R$ ${s.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
        });
        msg += `\n`;
        
        // Payment info
        if (c.paymentMethod) {
            const pmLabels = { 'cartao': '💳 Cartão', 'pix': '📱 PIX', 'dinheiro': '💵 Dinheiro' };
            msg += `💰 *Forma de Pagamento:* ${pmLabels[c.paymentMethod] || c.paymentMethod}\n`;
            if (c.discount > 0) {
                msg += `🏷️ *Desconto:* −R$ ${c.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
            }
            if (c.installments && c.installments > 1) {
                const perInst = c.totalValue / c.installments;
                msg += `📋 *Parcelas:* ${c.installments}x de R$ ${perInst.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
            }
            msg += `\n`;
        }

        // Parse damages and inspection score
        const parsed = parseDamagesString(c.damages);
        if (parsed.state) {
            let totalWeight = 0;
            let earnedWeight = 0;
            inspectionCategories.forEach(cat => {
                cat.items.forEach(item => {
                    const state = parsed.state[item.id] || 'OK';
                    if (state !== 'NA') {
                        totalWeight += item.weight;
                        if (state === 'OK') earnedWeight += item.weight;
                        else if (state === 'RISCO') earnedWeight += item.weight * 0.5;
                    }
                });
            });
            const score = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 100;
            const info = getScoreClassification(score);
            msg += `📊 *Conservação do Veículo:* ${score}% (${info.text})\n\n`;
        }
        
        msg += `⚠️ *Avarias Pré-existentes:*\n`;
        msg += `_${parsed.text}_\n\n`;
        msg += `📅 *Entrada:* ${formatDateTimeToBrazilian(c.entryDate)}\n`;
        msg += `🏁 *Previsão de Entrega:* ${formatDateTimeToBrazilian(c.deliveryDate)}\n\n`;
        msg += `💰 *VALOR TOTAL DO SERVIÇO:*\n`;
        msg += `*R$ ${c.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*\n\n`;
        msg += `_Obrigado pela preferência e confiança!_ 🙏`;

        const cleanPhone = c.whatsapp.replace(/\D/g, '');
        const phoneWithDDI = cleanPhone.length === 11 || cleanPhone.length === 10 ? '55' + cleanPhone : cleanPhone;
        const waUrl = `https://api.whatsapp.com/send?phone=${phoneWithDDI}&text=${encodeURIComponent(msg)}`;
        
        window.open(waUrl, '_blank');
        showToast('Abrindo WhatsApp...', 'success');
    });

    const modalEditBtn = document.getElementById('modal-edit-btn');
    if (modalEditBtn) {
        modalEditBtn.addEventListener('click', () => {
            if (!currentPreviewChecklist) return;
            const c = currentPreviewChecklist;

            // 1. Populate basic client & vehicle inputs
            clientNameInput.value = c.client || '';
            clientWhatsappInput.value = c.whatsapp || '';
            vehicleBrandInput.value = c.brand || '';
            vehicleModelInput.value = c.vehicle || '';
            vehicleColorInput.value = c.color || '';
            vehiclePlateInput.value = c.plate || '';

            // 2. Set vehicle size
            const size = c.size || 'P';
            currentVehicleSize = size;
            const mainSizeBtns = document.querySelectorAll('.size-selector-btn');
            mainSizeBtns.forEach(btn => {
                if (btn.dataset.size === size) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            // 3. Set entry and delivery dates
            if (c.entryDate) entryDateInput.value = c.entryDate.substring(0, 16);
            if (c.deliveryDate) deliveryDateInput.value = c.deliveryDate.substring(0, 16);

            // 4. Set payment method and installments
            const method = c.paymentMethod || 'cartao';
            currentPaymentMethod = method;
            const paymentBtns = document.querySelectorAll('.payment-method-btn');
            paymentBtns.forEach(btn => {
                if (btn.dataset.method === method) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            const installmentsSelect = document.getElementById('installment-select');
            const installmentsWrapper = document.getElementById('installment-section');
            if (method === 'cartao') {
                if (installmentsWrapper) installmentsWrapper.style.display = 'flex';
                if (installmentsSelect) {
                    installmentsSelect.value = c.installments || 1;
                    currentInstallments = parseInt(c.installments) || 1;
                }
            } else {
                if (installmentsWrapper) installmentsWrapper.style.display = 'none';
                currentInstallments = 1;
            }

            // 5. Populate photo if any
            if (c.photoBase64) {
                capturedPhotoBase64 = c.photoBase64;
                const photoPreview = document.getElementById('photo-preview-container');
                const photoImg = document.getElementById('photo-preview-img');
                const photoBtn = document.getElementById('photo-capture-btn');
                if (photoPreview && photoImg) {
                    photoImg.src = c.photoBase64;
                    photoPreview.style.display = 'block';
                }
                if (photoBtn) photoBtn.classList.add('has-photo');
            } else {
                photoRemoveBtnAction();
            }

            // 6. Reset manual price overrides
            manualPriceOverrides = {};

            // 7. Check services checkboxes and set custom service if any
            const serviceCheckboxes = document.querySelectorAll('.service-item[data-service-id] .service-checkbox');
            serviceCheckboxes.forEach(checkbox => {
                const item = checkbox.closest('.service-item');
                const priceWrapper = item.querySelector('.price-input-wrapper');
                const priceInput = item.querySelector('.service-price');
                const serviceName = checkbox.getAttribute('data-service');
                
                const matchedService = c.services.find(s => s.name === serviceName);
                if (matchedService) {
                    checkbox.checked = true;
                    item.classList.add('service-selected');
                    if (priceWrapper) priceWrapper.classList.add('highlight-price');
                    priceInput.value = matchedService.price.toFixed(2);
                    
                    const serviceId = item.dataset.serviceId;
                    const catalogItem = SERVICE_CATALOG.find(s => s.id === serviceId);
                    if (catalogItem) {
                        const standardPrice = getServicePrice(catalogItem, size);
                        if (Math.abs(standardPrice - matchedService.price) > 0.01) {
                            manualPriceOverrides[serviceId] = true;
                        }
                    }
                } else {
                    checkbox.checked = false;
                    item.classList.remove('service-selected');
                    if (priceWrapper) priceWrapper.classList.remove('highlight-price');
                    
                    const serviceId = item.dataset.serviceId;
                    const catalogItem = SERVICE_CATALOG.find(s => s.id === serviceId);
                    if (catalogItem) {
                        const standardPrice = getServicePrice(catalogItem, size);
                        priceInput.value = standardPrice.toFixed(2);
                    }
                }
            });

            // Handle custom service
            const customCb = document.getElementById('custom-service-checkbox');
            const customNameInput = document.getElementById('custom-service-name');
            const customPriceInput = document.getElementById('custom-service-price');
            const customItem = customCb ? customCb.closest('.service-item') : null;
            const customMinusBtn = customItem ? customItem.querySelector('.price-minus') : null;
            const customPlusBtn = customItem ? customItem.querySelector('.price-plus') : null;
            const customPriceWrapper = customItem ? customItem.querySelector('.price-input-wrapper') : null;

            const standardServiceNames = SERVICE_CATALOG.map(s => s.name);
            const customService = c.services.find(s => !standardServiceNames.includes(s.name));

            if (customService && customCb) {
                customCb.checked = true;
                if (customItem) customItem.classList.add('service-selected');
                if (customPriceWrapper) customPriceWrapper.classList.add('highlight-price');
                if (customNameInput) {
                    customNameInput.value = customService.name;
                    customNameInput.disabled = false;
                }
                if (customPriceInput) {
                    customPriceInput.value = customService.price.toFixed(2);
                    customPriceInput.disabled = false;
                }
                if (customMinusBtn) customMinusBtn.disabled = false;
                if (customPlusBtn) customPlusBtn.disabled = false;
            } else if (customCb) {
                customCb.checked = false;
                if (customItem) customItem.classList.remove('service-selected');
                if (customPriceWrapper) customPriceWrapper.classList.remove('highlight-price');
                if (customNameInput) {
                    customNameInput.value = '';
                    customNameInput.disabled = true;
                }
                if (customPriceInput) {
                    customPriceInput.value = '0.00';
                    customPriceInput.disabled = true;
                }
                if (customMinusBtn) customMinusBtn.disabled = true;
                if (customPlusBtn) customPlusBtn.disabled = true;
            }

            // 8. Load Inspection State
            const parsedDamages = parseDamagesString(c.damages);
            if (parsedDamages.state) {
                currentInspectionState = { ...parsedDamages.state };
            } else {
                currentInspectionState = {};
                inspectionCategories.forEach(cat => {
                    cat.items.forEach(item => {
                        currentInspectionState[item.id] = 'OK';
                    });
                });
            }
            renderInspectionAccordion();
            updateScoreBadge();

            let customText = parsedDamages.text || '';
            if (customText.includes(' [Obs: ')) {
                const match = customText.match(/\[Obs: (.*)\]/);
                if (match) {
                    customText = match[1];
                }
            }
            if (customText === 'Sem avarias visíveis.' || customText === 'Sem avarias') {
                customText = '';
            }
            preExistingDamagesTextarea.value = customText;

            // 9. Change Save Button Text and ID state
            editingChecklistId = c.id;
            const submitBtn = document.getElementById('save-btn');
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Atualizar Checklist';
            }

            // 10. Scroll to form and close preview modal
            closeModal();
            const formPanel = document.querySelector('.form-panel');
            if (formPanel) {
                formPanel.scrollIntoView({ behavior: 'smooth' });
            }
            showToast('Checklist carregado para edição!', 'info');
        });
    }

    // --- Global Click Actions from DOM ---
    window.viewChecklist = function(id) {
        const item = checklists.find(c => c.id === id);
        if (item) openPreviewModal(item);
    };

    window.deleteChecklist = async function(id) {
        if (confirm('Deseja realmente excluir este registro?')) {
            let deletedOnCloud = false;

            if (isOnline && supabaseClient) {
                try {
                    const { error } = await supabaseClient
                        .from('checklists')
                        .delete()
                        .eq('id', id);

                    if (error) throw error;
                    deletedOnCloud = true;
                } catch (err) {
                    console.error('Erro ao excluir no Supabase:', err);
                    alert('Falha ao excluir online. O registro foi mantido.');
                    return;
                }
            }

            checklists = checklists.filter(c => c.id !== id);
            localStorage.setItem('ideal_checklists', JSON.stringify(checklists));
            renderHistory();
            showToast(deletedOnCloud ? 'Excluído online!' : 'Excluído localmente.', 'success');
        }
    };

    // --- Export CSV ---
    exportCsvBtn.addEventListener('click', () => {
        if (checklists.length === 0) {
            showToast('Não há registros para exportar.', 'error');
            return;
        }

        let csvContent = '\uFEFF';
        csvContent += '"ID";"Cliente";"WhatsApp";"Marca";"Modelo";"Cor";"Placa";"Serviços";"Avarias";"Pagamento";"Desconto";"Data de Entrada";"Previsão de Entrega";"Valor Total (R$)"\n';
        
        checklists.forEach(c => {
            const servicesStr = c.services.map(s => `${s.name} (R$ ${s.price})`).join(', ');
            const totalValStr = c.totalValue.toFixed(2).replace('.', ',');
            const parsedDamages = parseDamagesString(c.damages).text;
            const pmLabels = { 'cartao': 'Cartão', 'pix': 'PIX', 'dinheiro': 'Dinheiro' };
            const paymentStr = pmLabels[c.paymentMethod] || 'N/A';
            const discountStr = c.discount ? c.discount.toFixed(2).replace('.', ',') : '0,00';
            
            csvContent += `"${c.id}";` +
                          `"${(c.client || '').replace(/"/g, '""')}";` +
                          `"${c.whatsapp || ''}";` +
                          `"${(c.brand || '').replace(/"/g, '""')}";` +
                          `"${(c.vehicle || '').replace(/"/g, '""')}";` +
                          `"${(c.color || '').replace(/"/g, '""')}";` +
                          `"${c.plate || ''}";` +
                          `"${servicesStr.replace(/"/g, '""')}";` +
                          `"${parsedDamages.replace(/"/g, '""')}";` +
                          `"${paymentStr}";` +
                          `"${discountStr}";` +
                          `"${formatDateTimeToBrazilian(c.entryDate)}";` +
                          `"${formatDateTimeToBrazilian(c.deliveryDate)}";` +
                          `"${totalValStr}"\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `ideal_checklists.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Planilha CSV exportada!', 'success');
    });

    // --- Settings Modal Actions ---
    settingsToggleBtn.addEventListener('click', () => {
        supabaseUrlInput.value = localStorage.getItem('supabase_url') || '';
        supabaseKeyInput.value = localStorage.getItem('supabase_key') || '';
        if (isOnline) {
            updateSettingsStatusBox('success', 'Conectado ao Supabase! Banco de dados ativo.');
        } else {
            updateSettingsStatusBox('info', 'Banco de dados não configurado (Operando localmente).');
        }
        settingsModal.classList.add('active');
    });

    function closeSettings() {
        settingsModal.classList.remove('active');
    }

    closeSettingsBtn.addEventListener('click', closeSettings);
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) closeSettings();
    });

    testSettingsBtn.addEventListener('click', async () => {
        const testUrl = supabaseUrlInput.value.trim();
        const testKey = supabaseKeyInput.value.trim();

        if (!testUrl || !testKey) {
            updateSettingsStatusBox('error', 'Preencha o URL e a Chave para testar.');
            return;
        }

        updateSettingsStatusBox('info', 'Testando conexão...');

        try {
            const client = window.supabase.createClient(testUrl, testKey);
            const { data, error } = await client.from('checklists').select('id').limit(1);
            if (error) throw error;
            updateSettingsStatusBox('success', 'Conexão bem-sucedida! Tabela "checklists" está acessível.');
        } catch (err) {
            updateSettingsStatusBox('error', `Erro: ${err.message || 'Configurações inválidas'}`);
        }
    });

    saveSettingsBtn.addEventListener('click', async () => {
        const newUrl = supabaseUrlInput.value.trim();
        const newKey = supabaseKeyInput.value.trim();

        if (!newUrl || !newKey) {
            showToast('Por favor, preencha ambos os campos.', 'error');
            return;
        }

        localStorage.setItem('supabase_url', newUrl);
        localStorage.setItem('supabase_key', newKey);
        showToast('Credenciais salvas. Conectando...', 'success');
        await initSupabase();
        closeSettings();
    });

    clearSettingsBtn.addEventListener('click', () => {
        if (confirm('Deseja realmente desconectar o banco de dados online?')) {
            localStorage.removeItem('supabase_url');
            localStorage.removeItem('supabase_key');
            isOnline = false;
            supabaseClient = null;
            updateConnectionBadge(false);
            closeSettings();
            loadChecklists();
            showToast('Banco de dados desconectado!', 'success');
        }
    });

    // --- Toast Alert Notification ---
    function showToast(message, type = 'success') {
        toast.textContent = message;
        toast.className = 'toast active ' + type;
        setTimeout(() => {
            toast.classList.remove('active');
        }, 3000);
    }


    // =============================================
    // === ADMIN PANEL MODULE ======================
    // =============================================
    const adminModal = document.getElementById('admin-modal');
    const adminToggleBtn = document.getElementById('admin-toggle-btn');
    const closeAdminBtn = document.getElementById('close-admin-btn');
    const adminCloseActionBtn = document.getElementById('admin-close-action-btn');

    // Admin Tab elements
    const tabBtnServices = document.getElementById('tab-btn-services');
    const tabBtnUsers = document.getElementById('tab-btn-users');
    const adminServicesTab = document.getElementById('admin-services-tab');
    const adminUsersTab = document.getElementById('admin-users-tab');

    // Services views
    const serviceListView = document.getElementById('service-list-view');
    const serviceFormView = document.getElementById('service-form-view');
    const adminServicesTbody = document.getElementById('admin-services-tbody');
    const adminAddServiceBtn = document.getElementById('admin-add-service-btn');
    const serviceFormCancelBtn = document.getElementById('service-form-cancel-btn');
    const adminServiceForm = document.getElementById('admin-service-form');

    // Users views
    const userListView = document.getElementById('user-list-view');
    const userFormView = document.getElementById('user-form-view');
    const adminUsersTbody = document.getElementById('admin-users-tbody');
    const adminAddUserBtn = document.getElementById('admin-add-user-btn');
    const userFormCancelBtn = document.getElementById('user-form-cancel-btn');
    const adminUserForm = document.getElementById('admin-user-form');

    // Admin state
    let adminUsersList = [];

    function initAdminPanel() {
        if (!adminToggleBtn) return;

        adminToggleBtn.addEventListener('click', () => {
            adminModal.classList.add('active');
            switchAdminTab('admin-services-tab');
            loadAdminData();
        });

        const closeAdmin = () => {
            adminModal.classList.remove('active');
        };

        closeAdminBtn.addEventListener('click', closeAdmin);
        adminCloseActionBtn.addEventListener('click', closeAdmin);
        adminModal.addEventListener('click', (e) => {
            if (e.target === adminModal) closeAdmin();
        });

        // Tab Switching
        tabBtnServices.addEventListener('click', () => switchAdminTab('admin-services-tab'));
        tabBtnUsers.addEventListener('click', () => switchAdminTab('admin-users-tab'));

        // Services view toggles
        adminAddServiceBtn.addEventListener('click', () => showServiceForm(null));
        serviceFormCancelBtn.addEventListener('click', hideServiceForm);

        // Pricing type toggle
        const pricingTypeRadios = document.getElementsByName('service-pricing-type');
        pricingTypeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                togglePricingFields(e.target.value);
            });
        });

        // Save service
        adminServiceForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveAdminService();
        });

        // Users view toggles
        adminAddUserBtn.addEventListener('click', () => showUserForm(null));
        userFormCancelBtn.addEventListener('click', hideUserForm);

        // Save user
        adminUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveAdminUser();
        });
    }

    function switchAdminTab(tabId) {
        const tabs = [adminServicesTab, adminUsersTab];
        const buttons = [tabBtnServices, tabBtnUsers];

        tabs.forEach(tab => {
            if (tab) tab.style.display = 'none';
        });
        buttons.forEach(btn => {
            if (btn) btn.classList.remove('active');
        });

        const activeTab = document.getElementById(tabId);
        if (activeTab) activeTab.style.display = 'block';

        const activeBtn = document.querySelector(`.admin-tab-btn[data-tab="${tabId}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        // Hide any forms and return to lists
        hideServiceForm();
        hideUserForm();
    }

    function togglePricingFields(type) {
        const tieredInputs = document.getElementById('tiered-prices-inputs');
        const fixedInput = document.getElementById('fixed-price-input');
        if (type === 'tiered') {
            tieredInputs.style.display = 'flex';
            fixedInput.style.display = 'none';
        } else {
            tieredInputs.style.display = 'none';
            fixedInput.style.display = 'block';
        }
    }

    async function loadAdminData() {
        renderAdminServicesTable();
        await loadAdminUsersList();
    }

    function renderAdminServicesTable() {
        if (!adminServicesTbody) return;

        adminServicesTbody.innerHTML = SERVICE_CATALOG.map(s => {
            let priceHtml = '';
            if (s.prices.fixed !== undefined) {
                priceHtml = `<span class="pricing-badge pricing-badge-fixed">Fixo: R$ ${s.prices.fixed.toFixed(2)}</span>`;
            } else {
                priceHtml = `<span class="pricing-badge">P: R$ ${(s.prices.P || 0).toFixed(2)}</span> ` +
                            `<span class="pricing-badge">M: R$ ${(s.prices.M || 0).toFixed(2)}</span> ` +
                            `<span class="pricing-badge">G: R$ ${(s.prices.G || 0).toFixed(2)}</span>`;
            }

            return `
                <tr>
                    <td style="font-size: 1.2rem; text-align: center;">${s.icon || '🛠️'}</td>
                    <td><strong>${escapeHTML(s.name)}</strong></td>
                    <td>${priceHtml}</td>
                    <td>
                        <button type="button" class="btn btn-accent-outline" onclick="window.editAdminService('${s.id}')">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button type="button" class="btn btn-danger-outline" onclick="window.deleteAdminService('${s.id}')">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function showServiceForm(serviceId) {
        serviceListView.style.display = 'none';
        serviceFormView.style.display = 'block';

        const idInput = document.getElementById('service-form-id');
        const nameInput = document.getElementById('service-form-name');
        const iconInput = document.getElementById('service-form-icon');
        const titleEl = document.getElementById('service-form-title');

        if (serviceId) {
            // Edit mode
            titleEl.textContent = 'Editar Serviço';
            const s = SERVICE_CATALOG.find(item => item.id === serviceId);
            if (s) {
                idInput.value = s.id;
                nameInput.value = s.name;
                iconInput.value = s.icon;
                
                if (s.prices.fixed !== undefined) {
                    document.querySelector('input[name="service-pricing-type"][value="fixed"]').checked = true;
                    togglePricingFields('fixed');
                    document.getElementById('service-form-price-fixed').value = s.prices.fixed;
                } else {
                    document.querySelector('input[name="service-pricing-type"][value="tiered"]').checked = true;
                    togglePricingFields('tiered');
                    document.getElementById('service-form-price-p').value = s.prices.P || 0;
                    document.getElementById('service-form-price-m').value = s.prices.M || 0;
                    document.getElementById('service-form-price-g').value = s.prices.G || 0;
                }
            }
        } else {
            // Add mode
            titleEl.textContent = 'Adicionar Novo Serviço';
            adminServiceForm.reset();
            idInput.value = '';
            togglePricingFields('tiered');
            document.getElementById('service-form-price-p').value = '0.00';
            document.getElementById('service-form-price-m').value = '0.00';
            document.getElementById('service-form-price-g').value = '0.00';
            document.getElementById('service-form-price-fixed').value = '0.00';
        }
    }

    function hideServiceForm() {
        serviceListView.style.display = 'block';
        serviceFormView.style.display = 'none';
    }

    async function saveAdminService() {
        const id = document.getElementById('service-form-id').value;
        const name = document.getElementById('service-form-name').value.trim();
        const icon = document.getElementById('service-form-icon').value.trim();
        const type = document.querySelector('input[name="service-pricing-type"]:checked').value;
        
        let prices = {};
        if (type === 'fixed') {
            prices.fixed = parseFloat(document.getElementById('service-form-price-fixed').value) || 0;
        } else {
            prices.P = parseFloat(document.getElementById('service-form-price-p').value) || 0;
            prices.M = parseFloat(document.getElementById('service-form-price-m').value) || 0;
            prices.G = parseFloat(document.getElementById('service-form-price-g').value) || 0;
        }

        // Generate clean ID from name if new
        const finalId = id || name.toLowerCase().replace(/[^a-z0-9]/g, '_');

        const serviceObject = {
            id: finalId,
            name,
            icon,
            prices
        };

        // Update local catalog
        const existingIdx = SERVICE_CATALOG.findIndex(s => s.id === finalId);
        if (existingIdx !== -1) {
            SERVICE_CATALOG[existingIdx] = serviceObject;
        } else {
            SERVICE_CATALOG.push(serviceObject);
        }

        // Save locally
        localStorage.setItem('ideal_services', JSON.stringify(SERVICE_CATALOG));

        // Save online to Supabase
        if (isOnline && supabaseClient) {
            try {
                const { error } = await supabaseClient
                    .from('services')
                    .upsert({
                        id: finalId,
                        name,
                        icon,
                        prices,
                        active: true
                    });
                if (error) throw error;
                showToast('Serviço salvo online!', 'success');
            } catch (err) {
                console.error('Failed to save service online:', err);
                showToast('Salvo apenas localmente.', 'info');
            }
        } else {
            showToast('Serviço salvo localmente.', 'success');
        }

        // Reload
        renderServicesList();
        renderAdminServicesTable();
        hideServiceForm();
    }

    window.editAdminService = function(id) {
        showServiceForm(id);
    };

    window.deleteAdminService = async function(id) {
        if (confirm('Deseja realmente deletar este serviço?')) {
            SERVICE_CATALOG = SERVICE_CATALOG.filter(s => s.id !== id);
            localStorage.setItem('ideal_services', JSON.stringify(SERVICE_CATALOG));

            if (isOnline && supabaseClient) {
                try {
                    const { error } = await supabaseClient
                        .from('services')
                        .update({ active: false })
                        .eq('id', id);
                    if (error) throw error;
                    showToast('Serviço removido online!', 'success');
                } catch (err) {
                    console.error('Failed to remove service online:', err);
                    showToast('Removido apenas localmente.', 'info');
                }
            } else {
                showToast('Serviço removido localmente.', 'success');
            }

            renderServicesList();
            renderAdminServicesTable();
        }
    };

    // Operators Logic
    async function loadAdminUsersList() {
        adminUsersList = [
            { username: 'guilherme', role: 'admin', active: true },
            { username: 'tony', role: 'admin', active: true },
            { username: 'mateus', role: 'operator', active: true },
            { username: 'matheus', role: 'operator', active: true },
            { username: 'peterson', role: 'operator', active: true }
        ];

        if (isOnline && supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('users')
                    .select('username, role, active');
                
                if (!error && data && data.length > 0) {
                    adminUsersList = data;
                }
            } catch (err) {
                console.warn('Failed to load users from Supabase:', err);
            }
        }

        renderAdminUsersTable();
    }

    function renderAdminUsersTable() {
        if (!adminUsersTbody) return;

        adminUsersTbody.innerHTML = adminUsersList.map(u => {
            const roleLabel = u.role === 'admin' ? 'Administrador' : 'Operador';
            const statusClass = u.active ? 'active' : 'inactive';
            const statusLabel = u.active ? 'Ativo' : 'Inativo';
            return `
                <tr>
                    <td><strong>${escapeHTML(u.username)}</strong></td>
                    <td>${roleLabel}</td>
                    <td><span class="status-pill ${statusClass}">${statusLabel}</span></td>
                    <td>
                        <button type="button" class="btn btn-accent-outline" onclick="window.editAdminUser('${u.username}')">
                            <i class="fa-solid fa-user-pen"></i>
                        </button>
                        <button type="button" class="btn btn-danger-outline" onclick="window.deleteAdminUser('${u.username}')">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function showUserForm(username) {
        userListView.style.display = 'none';
        userFormView.style.display = 'block';

        const usernameInput = document.getElementById('user-form-username');
        const passwordInput = document.getElementById('user-form-password');
        const roleSelect = document.getElementById('user-form-role');
        const titleEl = document.getElementById('user-form-title');
        const passwordHint = document.getElementById('password-field-hint');

        if (username) {
            titleEl.textContent = 'Editar Operador';
            const u = adminUsersList.find(item => item.username === username);
            if (u) {
                usernameInput.value = u.username;
                usernameInput.disabled = true;
                roleSelect.value = u.role || 'operator';
                passwordInput.value = '';
                passwordInput.required = false;
                passwordHint.style.display = 'block';
            }
        } else {
            titleEl.textContent = 'Adicionar Novo Operador';
            adminUserForm.reset();
            usernameInput.disabled = false;
            passwordInput.required = true;
            passwordHint.style.display = 'none';
        }
    }

    function hideUserForm() {
        userListView.style.display = 'block';
        userFormView.style.display = 'none';
    }

    async function saveAdminUser() {
        const usernameInput = document.getElementById('user-form-username');
        const passwordInput = document.getElementById('user-form-password');
        const roleSelect = document.getElementById('user-form-role');
        
        const username = usernameInput.value.trim().toLowerCase();
        const role = roleSelect.value;
        const password = passwordInput.value;

        const isEditing = usernameInput.disabled;

        let passwordHash = null;
        if (password) {
            passwordHash = await sha256(password);
        }

        if (!isEditing && !passwordHash) {
            showToast('Senha é obrigatória para novos operadores.', 'error');
            return;
        }

        if (isOnline && supabaseClient) {
            try {
                const userRow = {
                    username,
                    role,
                    active: true
                };
                if (passwordHash) {
                    userRow.password_hash = passwordHash;
                }

                const { error } = await supabaseClient
                    .from('users')
                    .upsert(userRow);

                if (error) throw error;
                showToast('Operador salvo com sucesso no Supabase!', 'success');
            } catch (err) {
                console.error('Failed to save user in Supabase:', err);
                showToast('Falha ao salvar operador online.', 'error');
                return;
            }
        } else {
            showToast('Operador salvo localmente.', 'success');
        }

        await loadAdminUsersList();
        hideUserForm();
    }

    window.editAdminUser = function(username) {
        showUserForm(username);
    };

    window.deleteAdminUser = async function(username) {
        const currentLogged = localStorage.getItem('ideal_logged_user') || '';
        if (currentLogged.toLowerCase() === username.toLowerCase()) {
            showToast('Você não pode excluir o seu próprio usuário!', 'error');
            return;
        }

        if (confirm(`Deseja realmente deletar o operador "${username}"?`)) {
            if (isOnline && supabaseClient) {
                try {
                    const { error } = await supabaseClient
                        .from('users')
                        .delete()
                        .eq('username', username);
                    if (error) throw error;
                    showToast('Operador excluído no Supabase!', 'success');
                } catch (err) {
                    console.error('Failed to delete user in Supabase:', err);
                    showToast('Erro ao remover operador.', 'error');
                }
            } else {
                adminUsersList = adminUsersList.filter(u => u.username !== username);
                renderAdminUsersTable();
                showToast('Operador removido localmente.', 'success');
            }

            await loadAdminUsersList();
        }
    }

    // --- App Start ---
    checkAuth();

    // Visual focus card clicking
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.history-card');
        if (card && !e.target.closest('.card-action-btn')) {
            const id = card.getAttribute('data-id');
            window.viewChecklist(id);
        }
    });
});
