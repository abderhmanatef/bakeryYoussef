// ========================================
// expenses.js - منطق صفحة المصروفات
// ========================================

let expenses = [];
let totalExpenses = 0;
let expenseSource = 'cash'; // القيمة الافتراضية: خزنة المحل

// ===== عند تحميل الصفحة =====
document.addEventListener('DOMContentLoaded', function() {
    const now = new Date();
    document.getElementById('currentDate').innerText = now.toLocaleDateString('ar-EG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    loadExpenses();
    calcItemTotal();
});

// ===== حساب إجمالي المصروف الحالي =====
function calcItemTotal() {
    const qty = parseFloat(document.getElementById('expenseQty').value) || 0;
    const price = parseFloat(document.getElementById('expensePrice').value) || 0;
    const total = qty * price;
    document.getElementById('expenseTotalDisplay').innerText = total.toFixed(2);
}

// ===== عند تغيير الكمية أو السعر =====
document.addEventListener('input', function(e) {
    if (e.target.id === 'expenseQty' || e.target.id === 'expensePrice') {
        calcItemTotal();
    }
});

// ===== تحديد مصدر الدفع =====
function setExpenseSource(source) {
    expenseSource = source;
    document.querySelectorAll('.source-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.value === source) {
            btn.classList.add('active');
        }
    });
}

// ===== إضافة مصروف =====
function addExpense() {
    const name = document.getElementById('expenseName').value.trim();
    const qty = parseFloat(document.getElementById('expenseQty').value) || 0;
    const price = parseFloat(document.getElementById('expensePrice').value) || 0;

    if (!name) {
        alert('⚠️ الرجاء كتابة اسم الخامة');
        return;
    }
    if (qty <= 0 || price <= 0) {
        alert('⚠️ الكمية والسعر يجب أن يكونوا أكبر من صفر');
        return;
    }

    const total = qty * price;
    expenses.push({
        name: name,
        qty: qty,
        price: price,
        total: total,
        source: expenseSource // ✅ حفظ مصدر الدفع
    });

    // إعادة تعيين الحقول
    document.getElementById('expenseName').value = '';
    document.getElementById('expenseQty').value = '';
    document.getElementById('expensePrice').value = '';
    calcItemTotal();

    renderExpenses();
    alert('✅ تم إضافة المصروف بنجاح!');
}

// ===== عرض المصروفات =====
function renderExpenses() {
    const container = document.getElementById('expensesList');
    if (expenses.length === 0) {
        container.innerHTML = '<p class="empty-msg">لا توجد مصروفات مسجلة اليوم</p>';
        document.getElementById('totalExpensesDisplay').innerText = '0.00';
        totalExpenses = 0;
        return;
    }

    let html = '';
    totalExpenses = 0;
    expenses.forEach((item, idx) => {
        totalExpenses += item.total;
        const sourceText = item.source === 'personal' ? '👤 شخصي' : '🏦 خزنة';
        html += `
            <div class="expense-item">
                <span>${item.name} (${item.qty} × ${item.price.toFixed(2)})</span>
                <span>${item.total.toFixed(2)} جنيه</span>
                <span style="font-size:12px; color:#888;">${sourceText}</span>
                <button class="delete-btn" onclick="removeExpense(${idx})">✖</button>
            </div>
        `;
    });
    container.innerHTML = html;
    document.getElementById('totalExpensesDisplay').innerText = totalExpenses.toFixed(2);
}

// ===== حذف مصروف =====
function removeExpense(index) {
    expenses.splice(index, 1);
    renderExpenses();
}

// ===== تسجيل المصروفات في localStorage =====
function submitExpenses() {
    if (expenses.length === 0) {
        alert('⚠️ أضف مصروفاً واحداً على الأقل');
        return;
    }

    let allExpenses = JSON.parse(localStorage.getItem('bakeryExpenses')) || [];
    expenses.forEach(exp => {
        allExpenses.push({
            name: exp.name,
            qty: exp.qty,
            price: exp.price,
            total: exp.total,
            source: exp.source || 'cash', // ✅ حفظ مصدر الدفع
            date: new Date().toLocaleString('ar-EG')
        });
    });
    localStorage.setItem('bakeryExpenses', JSON.stringify(allExpenses));

    // إعادة تعيين
    expenses = [];
    renderExpenses();
    document.getElementById('expenseName').value = '';
    document.getElementById('expenseQty').value = '';
    document.getElementById('expensePrice').value = '';
    calcItemTotal();
    setExpenseSource('cash'); // إعادة ضبط المصدر للافتراضي

    alert('✅ تم تسجيل المصروفات بنجاح!');
}

// ===== تحميل المصروفات من localStorage =====
function loadExpenses() {
    const allExpenses = JSON.parse(localStorage.getItem('bakeryExpenses')) || [];
    if (allExpenses.length > 0) {
        // عرض آخر 10 مصروفات
        expenses = allExpenses.slice(-10);
        renderExpenses();
    }
}