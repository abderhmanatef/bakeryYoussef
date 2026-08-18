// ===== reports.js (نسخة متكاملة مع المصروفات) =====
document.addEventListener('DOMContentLoaded', function() {
    const now = new Date();
    document.getElementById('currentDate').innerText = now.toLocaleDateString('ar-EG', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    loadReportData();
    checkAutoReset();
});

function loadReportData() {
    // جلب كل البيانات
    const sales = JSON.parse(localStorage.getItem('bakerySales')) || [];
    const returns = JSON.parse(localStorage.getItem('bakeryReturns')) || [];
    const expenses = JSON.parse(localStorage.getItem('bakeryExpenses')) || [];

    // ===== 1. عرض المبيعات =====
    const salesTbody = document.getElementById('salesHistoryBody');
    if (sales.length === 0) {
        salesTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#999;">لا توجد مبيعات اليوم</td></tr>`;
    } else {
        salesTbody.innerHTML = sales.map((sale, index) => `
            <tr>
                <td>فاتورة #${index + 1}</td>
                <td>${sale.items || 'غير مسجل'}</td>
                <td>${sale.date || 'اليوم'}</td>
                <td>${(sale.total || 0).toFixed(2)} جنيه</td>
                <td><button class="btn-return" onclick="returnSale(${index})">إرجاع</button></td>
            </tr>
        `).join('');
    }

    // ===== 2. عرض المرتجعات =====
    const returnsTbody = document.getElementById('returnsHistoryBody');
    if (returns.length === 0) {
        returnsTbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#999;">لا توجد مرتجعات اليوم</td></tr>`;
    } else {
        returnsTbody.innerHTML = returns.map((item, index) => `
            <tr>
                <td>مرتجع #${index + 1}</td>
                <td>${item.items || 'غير مسجل'}</td>
                <td>${item.date || 'اليوم'}</td>
                <td>${(item.total || 0).toFixed(2)} جنيه</td>
            </tr>
        `).join('');
    }

    // ===== 3. عرض المصروفات (جديد) =====
    const expensesTbody = document.getElementById('expensesHistoryBody');
    if (expenses.length === 0) {
        expensesTbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#999;">لا توجد مصروفات مسجلة اليوم</td></tr>`;
    } else {
        expensesTbody.innerHTML = expenses.map((exp, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${exp.name || 'غير مسجل'}</td>
                <td>${exp.qty || 0}</td>
                <td>${(exp.price || 0).toFixed(2)}</td>
                <td>${(exp.total || 0).toFixed(2)}</td>
                <td>${exp.date || 'اليوم'}</td>
            </tr>
        `).join('');
    }

    // ===== 4. حساب الإجماليات =====
    const totalSales = sales.reduce((sum, item) => sum + Number(item.total || 0), 0);
    const totalReturns = returns.reduce((sum, item) => sum + Number(item.total || 0), 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.total || 0), 0);
    const net = totalSales - totalReturns - totalExpenses;

    // ===== 5. عرض الإجماليات في الكروت =====
    document.getElementById('totalSalesNum').innerText = totalSales.toFixed(2);
    document.getElementById('totalReturnsNum').innerText = totalReturns.toFixed(2);
    document.getElementById('totalExpensesNum').innerText = totalExpenses.toFixed(2);
    document.getElementById('totalNetNum').innerText = net.toFixed(2);
}

// ===== إرجاع فاتورة =====
function returnSale(index) {
    if (!confirm("هل أنت متأكد من إرجاع هذه الفاتورة؟")) return;
    let sales = JSON.parse(localStorage.getItem('bakerySales')) || [];
    let returns = JSON.parse(localStorage.getItem('bakeryReturns')) || [];
    const [item] = sales.splice(index, 1);
    returns.push(item);
    localStorage.setItem('bakerySales', JSON.stringify(sales));
    localStorage.setItem('bakeryReturns', JSON.stringify(returns));
    loadReportData();
}

// ===== تصفير اليوم (مسح المبيعات والمرتجعات فقط، المصروفات تفضل؟ هنخليها تتصفر معاهم عشان اليوم يبدأ من جديد) =====
function resetDay() {
    if (!confirm("⚠️ هل أنت متأكد من تصفير اليوم؟\nسيتم مسح: المبيعات، المرتجعات، والمصروفات.")) return;
    localStorage.removeItem('bakerySales');
    localStorage.removeItem('bakeryReturns');
    localStorage.removeItem('bakeryExpenses'); // ✅ مسح المصروفات مع اليوم
    alert('✅ تم تصفير اليوم بنجاح');
    loadReportData();
}

// ===== أرشفة اليوم كله (مع المصروفات) =====
function archiveDay() {
    const sales = JSON.parse(localStorage.getItem('bakerySales')) || [];
    const returns = JSON.parse(localStorage.getItem('bakeryReturns')) || [];
    const expenses = JSON.parse(localStorage.getItem('bakeryExpenses')) || [];

    if (sales.length === 0 && returns.length === 0 && expenses.length === 0) {
        alert('⚠️ لا توجد بيانات لأرشفتها (اليوم فاضي)');
        return;
    }

    // إنشاء كائن واحد لكل اليوم (مع المصروفات)
    const archive = {
        date: new Date().toISOString(),
        sales: sales,
        returns: returns,
        expenses: expenses  // ✅ المصروفات بتترشح مع اليوم
    };

    let archives = JSON.parse(localStorage.getItem('bakeryArchives')) || [];
    archives.push(archive);
    localStorage.setItem('bakeryArchives', JSON.stringify(archives));

    // تصفير اليوم (المبيعات، المرتجعات، المصروفات)
    localStorage.removeItem('bakerySales');
    localStorage.removeItem('bakeryReturns');
    localStorage.removeItem('bakeryExpenses');

    alert('✅ تمت أرشفة اليوم كله (مع المصروفات) وتصفير البيانات بنجاح!');
    loadReportData();
}

// ===== الذهاب لصفحة الأرشيف =====
function viewArchive() {
    window.location.href = 'archive.html';
}

// ===== التصفير التلقائي في منتصف الليل =====
function checkAutoReset() {
    const now = new Date();
    const lastReset = localStorage.getItem('lastResetDate');
    const today = now.toDateString();
    if (lastReset !== today) {
        const sales = JSON.parse(localStorage.getItem('bakerySales')) || [];
        const returns = JSON.parse(localStorage.getItem('bakeryReturns')) || [];
        const expenses = JSON.parse(localStorage.getItem('bakeryExpenses')) || [];
        
        if (sales.length > 0 || returns.length > 0 || expenses.length > 0) {
            const archive = {
                date: new Date().toISOString(),
                sales: sales,
                returns: returns,
                expenses: expenses
            };
            let archives = JSON.parse(localStorage.getItem('bakeryArchives')) || [];
            archives.push(archive);
            localStorage.setItem('bakeryArchives', JSON.stringify(archives));
        }
        localStorage.removeItem('bakerySales');
        localStorage.removeItem('bakeryReturns');
        localStorage.removeItem('bakeryExpenses');
        localStorage.setItem('lastResetDate', today);
        console.log('🔄 تم التصفير التلقائي في منتصف الليل (مع المصروفات)');
    }
}