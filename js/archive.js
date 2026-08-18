// ===== archive.js =====
document.addEventListener('DOMContentLoaded', function() {
    const now = new Date();
    document.getElementById('currentDate').innerText = now.toLocaleDateString('ar-EG', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    loadArchive();
});

function loadArchive() {
    const archives = JSON.parse(localStorage.getItem('bakeryArchives')) || [];
    const container = document.getElementById('archiveContainer');

    if (archives.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:40px; color:#999;">📭 لا يوجد أرشيف حتى الآن</div>`;
        return;
    }

    let html = '';
    // عرض الأحدث أولاً
    archives.slice().reverse().forEach((archive, idx) => {
        const date = new Date(archive.date).toLocaleDateString('ar-EG', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

        // حساب إجمالي اليوم كله من كل الفواتير
        const totalSales = archive.sales.reduce((s, i) => s + Number(i.total || 0), 0);
        const totalReturns = archive.returns.reduce((s, i) => s + Number(i.total || 0), 0);
        const totalItems = archive.sales.length + archive.returns.length;

        html += `
            <div class="archive-item" style="
                background: #f9f9f9;
                padding: 15px;
                margin-bottom: 15px;
                border-radius: 8px;
                border-right: 4px solid #2d7d9a;
            ">
                <h4>📅 ${date}</h4>
                <div style="display: grid; grid-template-columns: repeat(3,1fr); gap:10px; margin:10px 0;">
                    <div>
                        <strong>🛒 المبيعات</strong><br>
                        <span style="color:#168238; font-size:20px;">${totalSales.toFixed(2)} جنيه</span>
                        <br><small>(${archive.sales.length} فاتورة)</small>
                    </div>
                    <div>
                        <strong>🔁 المرتجعات</strong><br>
                        <span style="color:#d33; font-size:20px;">${totalReturns.toFixed(2)} جنيه</span>
                        <br><small>(${archive.returns.length} فاتورة)</small>
                    </div>
                    <div>
                        <strong>📊 صافي اليوم</strong><br>
                        <span style="color:#2d7d9a; font-size:20px;">${(totalSales - totalReturns).toFixed(2)} جنيه</span>
                    </div>
                </div>
                <div style="font-size:13px; color:#888; margin-bottom:10px;">
                    📄 إجمالي المعاملات: ${totalItems} عملية
                </div>
                <button onclick="deleteArchive(${archives.length - 1 - idx})" style="
                    background: #d33; color:white; border:none; padding:5px 14px; border-radius:5px; cursor:pointer;
                ">🗑️ حذف هذا اليوم</button>
            </div>
        `;
    });

    container.innerHTML = html;
}

function deleteArchive(index) {
    if (!confirm('⚠️ هل أنت متأكد من حذف هذا اليوم من الأرشيف؟')) return;
    let archives = JSON.parse(localStorage.getItem('bakeryArchives')) || [];
    archives.splice(index, 1);
    localStorage.setItem('bakeryArchives', JSON.stringify(archives));
    loadArchive();
    alert('✅ تم الحذف');
}

function deleteAllArchive() {
    if (!confirm('⚠️ هل أنت متأكد من حذف كل الأرشيف؟')) return;
    localStorage.removeItem('bakeryArchives');
    loadArchive();
    alert('✅ تم حذف كل الأرشيف');
}