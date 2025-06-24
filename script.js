// DOM Elements
const loginSection = document.getElementById('login-section');
const mainApp = document.getElementById('main-app');
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginErrorDiv = document.getElementById('login-error');
const logoutButton = document.getElementById('logout-button');

const productForm = document.getElementById('product-form');
const workerNameInput = document.getElementById('workerName');
const mixTypeInput = document.getElementById('mixType');
const productDateInput = document.getElementById('productDate');
const quantityCartonInput = document.getElementById('quantityCarton');
const quantityBoxInput = document.getElementById('quantityBox');
const quantityTangInput = document.getElementById('quantityTang');
const quantityQutiInput = document.getElementById('quantityQuti'); // New input
const productNotesInput = document.getElementById('productNotes');
const addProductButton = document.getElementById('add-product-button');
const cancelEditButton = document.getElementById('cancel-edit-button');

const productsTableBody = document.querySelector('#products-table tbody');
const noProductsMessage = document.getElementById('no-products-message');
const calculationResultsDiv = document.getElementById('calculation-results');
const exportExcelBtn = document.getElementById('export-excel-btn');
const exportWhatsappBtn = document.getElementById('export-whatsapp-btn');
const exportTelegramBtn = document.getElementById('export-telegram-btn');
const messageDisplay = document.getElementById('message-display');

// Global State
let products = [];
let editingIndex = null;

// --- Utility Functions ---

/**
 * Displays a message to the user.
 * @param {string} msg - The message text.
 * @param {'success'|'error'|'info'} type - Type of message for styling.
 */
function displayMessage(msg, type) {
    messageDisplay.textContent = msg;
    messageDisplay.className = `message-box ${type}`;
    messageDisplay.classList.remove('hidden');
    setTimeout(() => {
        messageDisplay.classList.add('hidden');
    }, 5000); // Hide after 5 seconds
}

// --- Login Logic ---

/**
 * Handles the login form submission.
 * @param {Event} e - The submit event.
 */
function handleLogin(e) {
    e.preventDefault();
    const username = usernameInput.value;
    const password = passwordInput.value;

    // Simple hardcoded authentication
    if (username === 'user' && password === 'pass') {
        loginSection.classList.add('hidden');
        mainApp.classList.remove('hidden');
        loginErrorDiv.textContent = '';
        // Set initial date for product form
        const today = new Date().toISOString().split('T')[0];
        productDateInput.value = today;
        renderProductsTable(); // Render table on login
        renderCalculationResults(); // Render calculations on login
    } else {
        loginErrorDiv.textContent = 'اسم المستخدم أو كلمة المرور غير صحيحة.';
    }
}

/**
 * Handles the logout action.
 */
function handleLogout() {
    mainApp.classList.add('hidden');
    loginSection.classList.remove('hidden');
    usernameInput.value = '';
    passwordInput.value = '';
    products = []; // Clear products on logout
    renderProductsTable();
    renderCalculationResults();
    displayMessage('تم تسجيل الخروج بنجاح.', 'success');
}

// --- Product Management Logic ---

/**
 * Renders the products table with current data.
 */
function renderProductsTable() {
    productsTableBody.innerHTML = ''; // Clear existing rows
    if (products.length === 0) {
        noProductsMessage.classList.remove('hidden');
    } else {
        noProductsMessage.classList.add('hidden');
        products.forEach((product, index) => {
            const row = productsTableBody.insertRow();
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${product.workerName}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${product.mixType}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${product.date}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${product.quantityCarton}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${product.quantityBox}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${product.quantityTang}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${product.quantityQuti}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${product.totalQuantity}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium actions">
                    <button class="edit-button" data-index="${index}" aria-label="تعديل المنتج">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="icon"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium actions">
                    <button class="delete-button" data-index="${index}" aria-label="حذف المنتج">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="icon"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                    </button>
                </td>
            `;
        });

        // Attach event listeners to new buttons
        productsTableBody.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', (e) => handleEditProduct(parseInt(e.currentTarget.dataset.index)));
        });
        productsTableBody.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', (e) => handleDeleteProduct(parseInt(e.currentTarget.dataset.index)));
        });
    }
}

/**
 * Handles adding or updating a product.
 * @param {Event} e - The submit event.
 */
function handleAddOrUpdateProduct(e) {
    e.preventDefault();

    const workerName = workerNameInput.value;
    const mixType = mixTypeInput.value;
    const date = productDateInput.value;
    const quantityCarton = parseInt(quantityCartonInput.value) || 0;
    const quantityBox = parseInt(quantityBoxInput.value) || 0;
    const quantityTang = parseInt(quantityTangInput.value) || 0;
    const quantityQuti = parseInt(quantityQutiInput.value) || 0; // New quantity
    const notes = productNotesInput.value;

    if (!workerName || !mixType || !date) {
        displayMessage('الرجاء تعبئة جميع الحقول الإلزامية: اسم العامل، نوع الخلطة، والتاريخ.', 'error');
        return;
    }

    const totalQuantity = quantityCarton + quantityBox + quantityTang + quantityQuti;
    if (totalQuantity <= 0) {
        displayMessage('يجب إدخال كمية لا تقل عن 1 (كرتون، علبة، تانج، أو قوطي).', 'error');
        return;
    }

    const productData = {
        workerName, mixType, date,
        quantityCarton, quantityBox, quantityTang, quantityQuti, // Store individual quantities
        totalQuantity, notes
    };

    if (editingIndex !== null) {
        // Update existing product
        products[editingIndex] = productData;
        displayMessage('تم تحديث المنتج بنجاح!', 'success');
        editingIndex = null;
        addProductButton.textContent = 'إضافة منتج';
        addProductButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="icon"><path d="M12 5v14"/><path d="M5 12h14"/></svg><span>إضافة منتج</span>`;
        cancelEditButton.classList.add('hidden');
    } else {
        // Add new product
        products.push(productData);
        displayMessage('تمت إضافة المنتج بنجاح!', 'success');
    }

    // Reset form fields
    productForm.reset();
    productDateInput.value = new Date().toISOString().split('T')[0]; // Reset date to today
    quantityCartonInput.value = 0;
    quantityBoxInput.value = 0;
    quantityTangInput.value = 0;
    quantityQutiInput.value = 0; // Reset new quantity
    workerNameInput.focus(); // Keep focus on first input

    renderProductsTable();
    renderCalculationResults();
}

/**
 * Sets the form to edit mode with the selected product's data.
 * @param {number} index - The index of the product to edit.
 */
function handleEditProduct(index) {
    editingIndex = index;
    const product = products[index];

    workerNameInput.value = product.workerName;
    mixTypeInput.value = product.mixType;
    productDateInput.value = product.date;
    quantityCartonInput.value = product.quantityCarton;
    quantityBoxInput.value = product.quantityBox;
    quantityTangInput.value = product.quantityTang;
    quantityQutiInput.value = product.quantityQuti; // Set new quantity
    productNotesInput.value = product.notes;

    addProductButton.textContent = 'تحديث المنتج';
    addProductButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="icon"><path d="M5 12h14"/><path d="M12 5v14"/></svg><span>تحديث المنتج</span>`; // Reusing plus as save. ideally a save icon
    cancelEditButton.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
}

/**
 * Deletes a product from the list.
 * @param {number} index - The index of the product to delete.
 */
function handleDeleteProduct(index) {
    products.splice(index, 1);
    displayMessage('تم حذف المنتج بنجاح!', 'success');
    renderProductsTable();
    renderCalculationResults();
    if (editingIndex === index) { // If deleting the currently edited item
        editingIndex = null;
        productForm.reset();
        productDateInput.value = new Date().toISOString().split('T')[0];
        quantityCartonInput.value = 0;
        quantityBoxInput.value = 0;
        quantityTangInput.value = 0;
        quantityQutiInput.value = 0;
        addProductButton.textContent = 'إضافة منتج';
        addProductButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="icon"><path d="M12 5v14"/><path d="M5 12h14"/></svg><span>إضافة منتج</span>`;
        cancelEditButton.classList.add('hidden');
    }
}

/**
 * Calculates and returns aggregated results based on current products.
 * @returns {Object} An object containing aggregated quantities by worker and mix type.
 */
function getAggregatedProductData() { // Renamed and made standalone
    const results = {}; // { workerName: { mixType: { totalQuantity, carton, box, tang, quti } } }

    products.forEach(product => {
        const { workerName, mixType, totalQuantity, quantityCarton, quantityBox, quantityTang, quantityQuti } = product;

        if (!results[workerName]) {
            results[workerName] = {};
        }
        if (!results[workerName][mixType]) {
            results[workerName][mixType] = {
                totalQuantity: 0,
                carton: 0,
                box: 0,
                tang: 0,
                quti: 0
            };
        }
        results[workerName][mixType].totalQuantity += totalQuantity;
        results[workerName][mixType].carton += quantityCarton;
        results[workerName][mixType].box += quantityBox;
        results[workerName][mixType].tang += quantityTang;
        results[workerName][mixType].quti += quantityQuti;
    });
    return results;
}


/**
 * Renders the calculated aggregated results to the UI.
 */
function renderCalculationResults() {
    const results = getAggregatedProductData(); // Use the standalone function

    calculationResultsDiv.innerHTML = ''; // Clear previous results

    if (Object.keys(results).length === 0) {
        calculationResultsDiv.innerHTML = '<p class="text-center text-gray-500">لا توجد نتائج حسابات بعد.</p>';
    } else {
        for (const workerName in results) {
            const workerDiv = document.createElement('div');
            workerDiv.className = 'border border-gray-200 rounded-lg p-4 bg-gray-50';
            let mixTypesHtml = '';
            for (const mixType in results[workerName]) {
                const { totalQuantity, carton, box, tang, quti } = results[workerName][mixType];
                mixTypesHtml += `
                    <li class="text-gray-600">
                        ${mixType}:
                        <br/>
                        - الكمية الإجمالية: ${totalQuantity}
                        <br/>
                        - كرتون: ${carton}
                        <br/>
                        - علبة: ${box}
                        <br/>
                        - تانج: ${tang}
                        <br/>
                        - قوطي: ${quti}
                    </li>
                `;
            }
            workerDiv.innerHTML = `
                <h3 class="text-lg font-semibold text-gray-700 mb-2">اسم العامل: ${workerName}</h3>
                <ul class="list-disc list-inside space-y-1 pr-5">
                    ${mixTypesHtml}
                </ul>
            `;
            calculationResultsDiv.appendChild(workerDiv);
        }
    }
}

// --- Export Functions ---

/**
 * Exports aggregated data to WhatsApp.
 */
function exportToWhatsApp() {
    const results = getAggregatedProductData(); // Use the standalone function
    if (Object.keys(results).length === 0) {
        displayMessage('لا توجد بيانات لتصديرها إلى واتساب.', 'error');
        return;
    }

    let whatsappMessage = "📊 *تقريرالعمل اليومي* 📊\n\n";

    for (const workerName in results) {
        whatsappMessage += `👤 *اسم العامل:* ${workerName}\n`;
        for (const mixType in results[workerName]) {
            const { totalQuantity, carton, box, tang, quti } = results[workerName][mixType];
            whatsappMessage += `  _نوع الخلطة:_ ${mixType}\n`;
            whatsappMessage += `    - الكمية الإجمالية: ${totalQuantity}\n`;
            whatsappMessage += `    - تفاصيل الكميات:\n`;
            whatsappMessage += `      ▪️ كرتون: ${carton}\n`;
            whatsappMessage += `      ▪️ علبة: ${box}\n`;
            whatsappMessage += `      ▪️ تانج: ${tang}\n`;
            whatsappMessage += `      ▪️ قوطي: ${quti}\n`;
        }
        whatsappMessage += '\n';
    }

    whatsappMessage += "تاريخ التقرير: " + new Date().toLocaleDateString('en-US') + "\n";
    whatsappMessage += "---------------------------------\n";
    whatsappMessage += "تم إنشاء هذا التقرير تلقائيًا .";

    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`; // Universal WhatsApp link

    window.open(whatsappUrl, '_blank');

    displayMessage('تم فتح واتساب برسالة التقرير. يرجى النقر على إرسال.', 'success');
}

/**
 * Exports all product data to an Excel (CSV) file.
 */
function exportToExcel() {
    if (products.length === 0) {
        displayMessage('لا توجد بيانات لتصديرها.', 'error');
        return;
    }

    const headers = [
        "اسم العامل", "نوع الخلطة", "التاريخ",
        "كمية كرتون", "كمية علبة", "كمية تانج", "كمية قوطي", // New header
        "الكمية الإجمالية", "ملاحظات"
    ];

    const rows = products.map(p => [
        p.workerName, p.mixType, p.date,
        p.quantityCarton, p.quantityBox, p.quantityTang, p.quantityQuti, // New data point
        p.totalQuantity, p.notes
    ]);

    // Using XLSX library
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "تقرير الإنتاجية");
    XLSX.writeFile(wb, "تقرير_الإنتاجية.xlsx");

    displayMessage('تم تصدير البيانات إلى ملف Excel بنجاح!', 'success');
}

/**
 * Simulates exporting data to Telegram.
 */
function exportToTelegram() {
    displayMessage('تصدير إلى تيليجرام يتطلب خدمة خلفية (مثل Firebase Functions) للتفاعل مع Telegram Bot API. هذه الوظيفة محاكاة هنا.', 'info');
}


// --- Event Listeners ---
loginForm.addEventListener('submit', handleLogin);
logoutButton.addEventListener('click', handleLogout);
productForm.addEventListener('submit', handleAddOrUpdateProduct);
cancelEditButton.addEventListener('click', () => {
    editingIndex = null;
    productForm.reset();
    productDateInput.value = new Date().toISOString().split('T')[0];
    quantityCartonInput.value = 0;
    quantityBoxInput.value = 0;
    quantityTangInput.value = 0;
    quantityQutiInput.value = 0;
    productNotesInput.value = '';
    addProductButton.textContent = 'إضافة منتج';
    addProductButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="icon"><path d="M12 5v14"/><path d="M5 12h14"/></svg><span>إضافة منتج</span>`;
    cancelEditButton.classList.add('hidden');
    displayMessage('تم إلغاء التعديل.', 'info');
});
exportExcelBtn.addEventListener('click', exportToExcel);
exportWhatsappBtn.addEventListener('click', exportToWhatsApp);
exportTelegramBtn.addEventListener('click', exportToTelegram);

// Initial render for calculation results (empty)
renderCalculationResults();
