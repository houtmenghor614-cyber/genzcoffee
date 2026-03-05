(function() {
            // mobile menu
            const menuToggle = document.getElementById('menuToggle');
            const mobileMenu = document.getElementById('mobileMenu');
            const menuBackdrop = document.getElementById('menuBackdrop');
            const closeMenuBtn = document.getElementById('closeMenuBtn');
            if (menuToggle) {
                menuToggle.addEventListener('click', () => mobileMenu.classList.remove('translate-x-full'));
                closeMenuBtn.addEventListener('click', () => mobileMenu.classList.add('translate-x-full'));
                menuBackdrop.addEventListener('click', () => mobileMenu.classList.add('translate-x-full'));
            }

            // slideshow
            const wrapper = document.getElementById('slidesWrapper');
            const slides = document.querySelectorAll('#slidesWrapper > div');
            const prev = document.getElementById('prevSlide');
            const next = document.getElementById('nextSlide');
            const dots = document.querySelectorAll('.slide-dot');
            let idx = 0;
            function goToSlide(index) {
                if (index < 0) index = slides.length-1;
                if (index >= slides.length) index = 0;
                wrapper.style.transform = `translateX(-${index * 100}%)`;
                dots.forEach((d,i) => {
                    d.classList.toggle('active-dot', i===index);
                    d.classList.toggle('!bg-amber-200/60', i!==index);
                });
                idx = index;
            }
            if (prev && next) {
                prev.addEventListener('click', ()=> goToSlide(idx-1));
                next.addEventListener('click', ()=> goToSlide(idx+1));
                dots.forEach((dot,i)=> dot.addEventListener('click', ()=> goToSlide(i)));
                goToSlide(0);
                setInterval(() => goToSlide(idx+1), 5000);
            }

            // ---------- CART WITH LOCALSTORAGE (shared) ----------
            let cartItems = [];
            function loadCart() {
                const stored = localStorage.getItem('genzCart');
                if (stored) { try { cartItems = JSON.parse(stored); } catch { cartItems = []; } }
                else cartItems = [];
            }
            function saveCart() { localStorage.setItem('genzCart', JSON.stringify(cartItems)); }
            loadCart();

            const cartIconBtn = document.getElementById('cartIconBtn');
            const cartDrawer = document.getElementById('cartDrawer');
            const cartBackdrop = document.getElementById('cartBackdrop');
            const closeCartBtn = document.getElementById('closeCartBtn');
            const cartCountSpan = document.getElementById('cartCount');
            const cartItemsContainer = document.getElementById('cartItemsContainer');
            const cartTotalSpan = document.getElementById('cartTotal');
            const orderFromCartBtn = document.getElementById('orderFromCartBtn');
            
            const detailModal = document.getElementById('detailModal');
            const closeDetailModal = document.getElementById('closeDetailModal');
            const detailName = document.getElementById('detailName');
            const detailBasePrice = document.getElementById('detailBasePrice');
            const detailFinalPrice = document.getElementById('detailFinalPrice');
            const addToCartFromDetail = document.getElementById('addToCartFromDetail');
            
            const sizeSmall = document.getElementById('sizeSmall');
            const sizeMedium = document.getElementById('sizeMedium');
            const sizeLarge = document.getElementById('sizeLarge');
            const sugarOptions = document.querySelectorAll('.sugar-option');
            
            let currentProduct = { name: 'Espresso Romano', price: 4.20 };
            let selectedMultiplier = 1.2;
            let selectedSugar = '0';

            function updateDetailPrice() {
                if (!currentProduct) return;
                const base = currentProduct.price;
                let final = base * selectedMultiplier;
                final = Math.round(final * 100) / 100;
                if (detailBasePrice) detailBasePrice.textContent = `$${base.toFixed(2)}`;
                if (detailFinalPrice) detailFinalPrice.textContent = `$${final.toFixed(2)}`;
            }

            if (sizeSmall) {
                sizeSmall.addEventListener('click', ()=>{
                    [sizeSmall, sizeMedium, sizeLarge].forEach(b => b.classList.remove('border-amber-600', 'bg-amber-50'));
                    sizeSmall.classList.add('border-amber-600', 'bg-amber-50');
                    selectedMultiplier = 1.0;
                    updateDetailPrice();
                });
                sizeMedium.addEventListener('click', ()=>{
                    [sizeSmall, sizeMedium, sizeLarge].forEach(b => b.classList.remove('border-amber-600', 'bg-amber-50'));
                    sizeMedium.classList.add('border-amber-600', 'bg-amber-50');
                    selectedMultiplier = 1.2;
                    updateDetailPrice();
                });
                sizeLarge.addEventListener('click', ()=>{
                    [sizeSmall, sizeMedium, sizeLarge].forEach(b => b.classList.remove('border-amber-600', 'bg-amber-50'));
                    sizeLarge.classList.add('border-amber-600', 'bg-amber-50');
                    selectedMultiplier = 1.5;
                    updateDetailPrice();
                });
            }

            sugarOptions.forEach(btn => {
                btn.addEventListener('click', ()=>{
                    sugarOptions.forEach(b => b.classList.remove('border-amber-600', 'bg-amber-50'));
                    btn.classList.add('border-amber-600', 'bg-amber-50');
                    selectedSugar = btn.dataset.sugar;
                });
            });

            document.querySelectorAll('.detail-trigger').forEach(card => {
                card.addEventListener('click', (e) => {
                    if (e.target.classList.contains('add-quick') || e.target.closest('.add-quick')) return;
                    const prod = JSON.parse(card.dataset.product);
                    currentProduct = prod;
                    if (detailName) detailName.textContent = prod.name;
                    if (detailBasePrice) detailBasePrice.textContent = `$${prod.price.toFixed(2)}`;
                    selectedMultiplier = 1.2;
                    selectedSugar = '0';
                    [sizeSmall, sizeMedium, sizeLarge].forEach(b => b?.classList.remove('border-amber-600', 'bg-amber-50'));
                    if (sizeMedium) sizeMedium.classList.add('border-amber-600', 'bg-amber-50');
                    sugarOptions.forEach(b => {
                        b.classList.remove('border-amber-600', 'bg-amber-50');
                        if (b.dataset.sugar === '0') b.classList.add('border-amber-600', 'bg-amber-50');
                    });
                    updateDetailPrice();
                    if (detailModal) detailModal.classList.remove('hidden');
                });
            });

            document.querySelectorAll('.add-quick').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const prod = JSON.parse(btn.dataset.product);
                    cartItems.push({ name: prod.name, basePrice: prod.price, size: 'medium', sugar: '0%', finalPrice: prod.price * 1.2 });
                    saveCart();
                    updateCartUI();
                });
            });

            if (addToCartFromDetail) {
                addToCartFromDetail.addEventListener('click', ()=>{
                    const final = currentProduct.price * selectedMultiplier;
                    cartItems.push({
                        name: currentProduct.name,
                        basePrice: currentProduct.price,
                        size: selectedMultiplier === 1.0 ? 'small' : (selectedMultiplier === 1.2 ? 'medium' : 'large'),
                        sugar: selectedSugar + '%',
                        finalPrice: Math.round(final * 100) / 100
                    });
                    saveCart();
                    detailModal.classList.add('hidden');
                    updateCartUI();
                });
            }

            if (closeDetailModal) {
                closeDetailModal.addEventListener('click', ()=> detailModal.classList.add('hidden'));
                detailModal.addEventListener('click', (e)=> e.target === detailModal && detailModal.classList.add('hidden'));
            }

            function openCart() { cartDrawer?.classList.remove('translate-x-full'); }
            if (cartIconBtn) cartIconBtn.addEventListener('click', openCart);
            if (closeCartBtn) closeCartBtn.addEventListener('click', ()=> cartDrawer.classList.add('translate-x-full'));
            if (cartBackdrop) cartBackdrop.addEventListener('click', ()=> cartDrawer.classList.add('translate-x-full'));

            function updateCartUI() {
                if (cartCountSpan) cartCountSpan.textContent = cartItems.length;
                if (cartCountSpan) cartCountSpan.classList.toggle('cart-pulse', cartItems.length>0);
                if (!cartItemsContainer) return;
                if (cartItems.length===0) {
                    cartItemsContainer.innerHTML = '<div class="text-center text-stone-400 py-8">cart is empty</div>';
                    if (cartTotalSpan) cartTotalSpan.textContent = '$0.00';
                    return;
                }
                let html = '', total = 0;
                cartItems.forEach((item, index) => {
                    total += item.finalPrice;
                    html += `<div class="flex justify-between items-center bg-stone-50 p-3 rounded-xl">
                        <div><span class="font-medium">${item.name}</span>
                        <span class="text-xs block text-stone-500">${item.size}, ${item.sugar} sugar</span>
                        <span class="text-sm font-semibold">$${item.finalPrice.toFixed(2)}</span></div>
                        <button class="remove-item text-red-500 hover:text-red-700 text-xl" data-index="${index}"><i class="far fa-trash-alt"></i></button>
                    </div>`;
                });
                cartItemsContainer.innerHTML = html;
                if (cartTotalSpan) cartTotalSpan.textContent = `$${total.toFixed(2)}`;
                document.querySelectorAll('.remove-item').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        cartItems.splice(btn.dataset.index, 1);
                        saveCart();
                        updateCartUI();
                    });
                });
            }

            const checkoutModal = document.getElementById('checkoutModal');
            const closeCheckout = document.getElementById('closeCheckout');
            const fullName = document.getElementById('fullName');
            const phoneNumber = document.getElementById('phoneNumber');
            const address = document.getElementById('address');
            const notes = document.getElementById('notes');
            const submitBtn = document.getElementById('submitOrder');
            const checkoutItemsSummary = document.getElementById('checkoutItemsSummary');

            if (orderFromCartBtn) {
                orderFromCartBtn.addEventListener('click', ()=>{
                    if (cartItems.length===0) { alert('cart empty'); return; }
                    let summary = cartItems[0].name;
                    if (cartItems.length>1) summary += ` +${cartItems.length-1} more`;
                    const total = cartItems.reduce((s,it)=> s+it.finalPrice,0).toFixed(2);
                    if (checkoutItemsSummary) checkoutItemsSummary.innerText = summary + ` · $${total}`;
                    cartDrawer?.classList.add('translate-x-full');
                    if (checkoutModal) checkoutModal.classList.remove('hidden');
                    if (fullName) fullName.value = ''; if (phoneNumber) phoneNumber.value = ''; if (address) address.value = ''; if (notes) notes.value = '';
                });
            }

            if (closeCheckout) {
                closeCheckout.addEventListener('click', ()=> checkoutModal.classList.add('hidden'));
                checkoutModal.addEventListener('click', (e)=> e.target === checkoutModal && checkoutModal.classList.add('hidden'));
            }

            const TOKEN = '8485770628:AAF6Fek1S6x9qaSM55eDWCdIYyI3799ke50';
            const CHAT_ID = '5724123597';
            if (submitBtn) {
                submitBtn.addEventListener('click', function() {
                    const name = fullName?.value.trim() || '';
                    const phone = phoneNumber?.value.trim() || '';
                    const addr = address?.value.trim() || '';
                    const optionalNotes = notes?.value.trim() || '';
                    if (!name || !phone || !addr) { alert('❌ fill required fields'); return; }
                    if (cartItems.length===0) { alert('❌ cart empty'); return; }

                    let itemsList = '';
                    cartItems.forEach((item, i) => {
                        itemsList += `${i+1}. ${item.name} (${item.size}, ${item.sugar} sugar) - $${item.finalPrice.toFixed(2)}%0A`;
                    });
                    const total = cartItems.reduce((s,it)=> s+it.finalPrice,0).toFixed(2);
                    let msg = `🆕 *NEW ORDER (CART)*%0A👤 *Name:* ${name}%0A📞 *Phone:* ${phone}%0A🏠 *Address:* ${addr}%0A`;
                    if (optionalNotes) msg += `📝 *Notes:* ${optionalNotes}%0A`;
                    msg += `🛒 *ITEMS:*%0A${itemsList}💵 *TOTAL:* $${total}`;

                    const url = `https://api.telegram.org/bot${TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${msg}&parse_mode=Markdown`;
                    submitBtn.disabled = true; submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> sending...`;
                    fetch(url).then(res=>res.json()).then(data=>{
                        if (data.ok) {
                            alert('✅ order sent!'); cartItems = []; saveCart(); updateCartUI();
                            if (fullName) fullName.value=''; if (phoneNumber) phoneNumber.value=''; if (address) address.value=''; if (notes) notes.value='';
                            if (checkoutModal) checkoutModal.classList.add('hidden');
                        } else alert('⚠️ Telegram error: '+data.description);
                    }).catch(()=>alert('network error')).finally(()=>{
                        submitBtn.disabled=false; submitBtn.innerHTML = `<i class="fab fa-telegram"></i> confirm order → Telegram`;
                    });
                });
            }
            updateCartUI();
            window.addEventListener('storage', (e) => { if (e.key === 'genzCart') { loadCart(); updateCartUI(); } });
        })();