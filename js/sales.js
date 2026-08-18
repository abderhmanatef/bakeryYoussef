// ========================================
// sales.js - منطق صفحة البيع (بدون مصدر الدفع)
// ========================================

let cart = [];
let totalCart = 0;

// ===== عند تحميل الصفحة =====
document.addEventListener('DOMContentLoaded', function() {
    // عرض التاريخ الحالي
    const now = new Date();
    document.getElementById('currentDate').innerText = now.toLocaleDateString('ar-EG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    renderCart();
});

// ===== إضافة منتج للسلة =====
function addCurrentProduct() {
    const name = document.getElementById('productName').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value) || 0;

    // التحقق من صحة البيانات
    if (!name) {
        alert('⚠️ الرجاء كتابة اسم المنتج');
        return;
    }
    if (price <= 0) {
        alert('⚠️ السعر يجب أن يكون أكبر من صفر');
        return;
    }

    // إضافة المنتج (الكمية 1 افتراضياً)
    cart.push({
        name: name,
        price: price,
        itemTotal: price // السعر نفسه لأن الكمية 1
    });

    // مسح حقل السعر
    document.getElementById('productPrice').value = '';
    // إعادة عرض السلة وحساب الباقي
    renderCart();
    calcChange();
}

// ===== عرض السلة =====
function renderCart() {
    const container = document.getElementById('cartItemsList');
    const totalEl = document.getElementById('cartTotalDisplay');

    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-msg">لا توجد منتجات مضافة بعد</p>';
        totalEl.innerText = '0.00';
        totalCart = 0;
        return;
    }

    let html = '';
    totalCart = 0;

    cart.forEach((item, index) => {
        totalCart += item.price;
        html += `
            <div class="cart-item">
                <span>${item.name}</span>
                <span>${item.price.toFixed(2)} جنيه</span>
                <button class="delete-btn" onclick="removeItem(${index})">✖</button>
            </div>
        `;
    });

    container.innerHTML = html;
    totalEl.innerText = totalCart.toFixed(2);
}

// ===== حذف منتج من السلة =====
function removeItem(index) {
    cart.splice(index, 1);
    renderCart();
    calcChange();
}

// ===== حساب الباقي =====
function calcChange() {
    const paid = parseFloat(document.getElementById('paidAmount').value) || 0;
    const change = paid - totalCart;
    const changeEl = document.getElementById('changeDisplay');

    if (change >= 0) {
        changeEl.innerText = change.toFixed(2);
        changeEl.style.color = '#168238'; // أخضر
    } else {
        changeEl.innerText = '0.00';
        changeEl.style.color = '#d33'; // أحمر (غير كافٍ)
    }
}

// ===== تسجيل البيع =====
function submitSale() {
    // التحقق من وجود منتجات
    if (cart.length === 0) {
        alert('⚠️ أضف منتجاً واحداً على الأقل للفاتورة');
        return;
    }

    const paid = parseFloat(document.getElementById('paidAmount').value) || 0;
    if (paid < totalCart) {
        alert('⚠️ المبلغ المدفوع أقل من إجمالي الفاتورة');
        return;
    }

    // بناء كائن الفاتورة (من غير source)
    const sale = {
        date: new Date().toLocaleString('ar-EG'),
        items: cart.map(item => `${item.name} (${item.price.toFixed(2)})`).join('، '),
        total: totalCart,
        paid: paid,
        change: paid - totalCart
    };

    // حفظ في localStorage
    let sales = JSON.parse(localStorage.getItem('bakerySales')) || [];
    sales.push(sale);
    localStorage.setItem('bakerySales', JSON.stringify(sales));

    // إعادة تعيين كل شيء
    cart = [];
    renderCart();
    document.getElementById('paidAmount').value = 0;
    document.getElementById('changeDisplay').innerText = '0.00';
    document.getElementById('changeDisplay').style.color = '#168238';
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';

    alert('✅ تم تسجيل البيع بنجاح!');
}