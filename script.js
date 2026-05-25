document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================================================
    // СТАТУСНІ МАСИВИ (ГЛОБАЛЬНІ ДЛЯ ЦЬОГО СКРИПТА)
    // ==========================================================================
    let cart = [];
    let inventory = []; 

    // Спільне плаваюче сповіщення Toast
    let toast = document.querySelector('.toast-notification');
    if (!toast) {
        toast = document.createElement('div');
        toast.classList.add('toast-notification');
        document.body.appendChild(toast);
    }

    function showToast(message, isActivation = false) {
        if (!toast) return;
        toast.textContent = message;
        if (isActivation) {
            toast.classList.add('activation-toast');
        } else {
            toast.classList.remove('activation-toast');
        }
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }

    // ==========================================================================
    // 1. КОД КАРУСЕЛІ
    // ==========================================================================
    const slidesContainer = document.querySelector('.slides');
    const slideItems = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const indicatorsContainer = document.querySelector('.indicators');
    
    let currentSlideIndex = 0;
    const totalSlides = slideItems ? slideItems.length : 0;

    if (slidesContainer && totalSlides > 0 && indicatorsContainer && prevBtn && nextBtn) {
        indicatorsContainer.innerHTML = '';
        slideItems.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.classList.add('indicator');
            if (index === 0) dot.classList.add('active');
            dot.setAttribute('aria-label', `Слайд ${index + 1}`);
            indicatorsContainer.appendChild(dot);
        });

        const indicators = document.querySelectorAll('.indicator');

        function goToSlide(index) {
            currentSlideIndex = index;
            if (currentSlideIndex >= totalSlides) currentSlideIndex = 0;
            if (currentSlideIndex < 0) currentSlideIndex = totalSlides - 1;

            slidesContainer.style.transform = `translateX(-${currentSlideIndex * 100}%)`;

            indicators.forEach(dot => dot.classList.remove('active'));
            if (indicators[currentSlideIndex]) {
                indicators[currentSlideIndex].classList.add('active');
            }
        }

        nextBtn.addEventListener('click', () => goToSlide(currentSlideIndex + 1));
        prevBtn.addEventListener('click', () => goToSlide(currentSlideIndex - 1));

        indicators.forEach((dot, index) => {
            dot.addEventListener('click', () => goToSlide(index));
        });

        setInterval(() => {
            goToSlide(currentSlideIndex + 1);
        }, 5000);
    }

    // ==========================================================================
    // 2. КЕРУВАННЯ КОШИКОМ (ДОДАВАННЯ ТА ВІДОБРАЖЕННЯ)
    // ==========================================================================
    const cartLink = document.querySelector('.cart-link');
    const cartModal = document.getElementById('cart-modal');
    const closeCartBtn = document.querySelector('.close-cart-btn');
    const cartCountElement = document.getElementById('cart-count');
    const cartItemsList = document.querySelector('.cart-items-list');
    const cartTotalPriceElement = document.getElementById('cart-total-price');
    const checkoutBtn = document.querySelector('.checkout-btn');
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

    if (cartLink && cartModal) {
        cartLink.addEventListener('click', (e) => {
            e.preventDefault();
            cartModal.style.display = 'flex';
            renderCart();
        });

        if (closeCartBtn) {
            closeCartBtn.addEventListener('click', () => {
                cartModal.style.display = 'none';
            });
        }

        window.addEventListener('click', (e) => {
            if (e.target === cartModal) {
                cartModal.style.display = 'none';
            }
        });
    }

    if (addToCartButtons) {
        addToCartButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const card = e.target.closest('.product-card');
                if (!card) return;

                const nameEl = card.querySelector('.product-name');
                const priceEl = card.querySelector('.product-price');
                
                const name = nameEl ? nameEl.textContent.trim() : "Товар";
                const priceText = priceEl ? priceEl.textContent : "0";
                const price = parseInt(priceText.replace(/[^0-9]/g, '')) || 0; 

                const existingItem = cart.find(item => item.name === name);

                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    cart.push({ name: name, price: price, quantity: 1 });
                }

                updateCartBadge();
                showToast(`«${name}» додано в кошик!`);
                
                if (cartCountElement) {
                    cartCountElement.style.transform = 'scale(1.3)';
                    setTimeout(() => cartCountElement.style.transform = 'scale(1)', 200);
                }
            });
        });
    }

    function updateCartBadge() {
        if (!cartCountElement) return;
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }

    function renderCart() {
        if (!cartItemsList) return;
        cartItemsList.innerHTML = '';

        if (cart.length === 0) {
            cartItemsList.innerHTML = '<p class="empty-cart-message">Кошик порожній</p>';
            if (cartTotalPriceElement) cartTotalPriceElement.textContent = '0 ₴';
            return;
        }

        let totalPrice = 0;
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            totalPrice += itemTotal;

            const itemRow = document.createElement('div');
            itemRow.classList.add('cart-item');
            itemRow.innerHTML = `
                <div class="cart-item-info">
                    <div>
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-price">${item.price} ₴</div>
                    </div>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn minus-btn" data-index="${index}">-</button>
                    <span class="item-count">${item.quantity}</span>
                    <button class="quantity-btn plus-btn" data-index="${index}">+</button>
                </div>
                <button class="delete-item-btn" data-index="${index}">&#128465;</button>
            `;
            cartItemsList.appendChild(itemRow);
        });

        if (cartTotalPriceElement) cartTotalPriceElement.textContent = `${totalPrice} ₴`;
        initCartButtons();
    }

    function initCartButtons() {
        document.querySelectorAll('.minus-btn').forEach(btn => {
            btn.replaceWith(btn.cloneNode(true)); 
        });
        document.querySelectorAll('.plus-btn').forEach(btn => {
            btn.replaceWith(btn.cloneNode(true));
        });
        document.querySelectorAll('.delete-item-btn').forEach(btn => {
            btn.replaceWith(btn.cloneNode(true));
        });

        document.querySelectorAll('.plus-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                if(cart[index]) {
                    cart[index].quantity += 1;
                    updateCartBadge();
                    renderCart();
                }
            });
        });

        document.querySelectorAll('.minus-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                if(cart[index]) {
                    if (cart[index].quantity > 1) {
                        cart[index].quantity -= 1;
                    } else {
                        cart.splice(index, 1);
                    }
                    updateCartBadge();
                    renderCart();
                }
            });
        });

        document.querySelectorAll('.delete-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                if(cart[index]) {
                    cart.splice(index, 1);
                    updateCartBadge();
                    renderCart();
                }
            });
        });
    }

    // ==========================================================================
    // 3. МЕХАНІКА ОПЛАТИ ТА МОДАЛЬНОГО ВІКНА ІНВЕНТАРЯ
    // ==========================================================================
    const inventoryModal = document.getElementById('inventory-modal');
    const inventoryGrid = document.getElementById('inventory-grid');
    const inventoryNavLink = document.getElementById('inventory-nav-link');
    const closeInventoryBtn = document.querySelector('.close-inventory-btn');

    if (inventoryNavLink && inventoryModal) {
        inventoryNavLink.addEventListener('click', (e) => {
            e.preventDefault();
            inventoryModal.style.display = 'flex';
            renderInventory();
        });
    }

    if (closeInventoryBtn && inventoryModal) {
        closeInventoryBtn.addEventListener('click', () => {
            inventoryModal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === inventoryModal) {
                inventoryModal.style.display = 'none';
            }
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Ваш кошик порожній!');
                return;
            }

            // Переносимо речі з нашого глобального кошика в інвентар
            cart.forEach(cartItem => {
                const existingInvItem = inventory.find(invItem => invItem.name === cartItem.name);
                if (existingInvItem) {
                    existingInvItem.quantity += cartItem.quantity;
                } else {
                    inventory.push({ name: cartItem.name, quantity: cartItem.quantity });
                }
            });

            // Очищуємо кошик повністю
            cart = [];
            updateCartBadge();
            if (cartModal) cartModal.style.display = 'none';

            // Відкриваємо вікно інвентаря з купленими предметами
            renderInventory();
            if (inventoryModal) {
                inventoryModal.style.display = 'flex';
            }
        });
    }

    function renderInventory() {
        if (!inventoryGrid) return;
        inventoryGrid.innerHTML = '';

        if (inventory.length === 0) {
            inventoryGrid.innerHTML = '<p class="empty-inventory-message">Ви ще нічого не придбали. Оплатіть товари в кошику, щоб вони з\'явилися тут!</p>';
            return;
        }

        inventory.forEach((item, index) => {
            const card = document.createElement('div');
            card.classList.add('inventory-card');
            card.innerHTML = `
                <span class="inventory-qty-badge">Кількість: ${item.quantity} шт.</span>
                <h3 class="product-name">${item.name}</h3>
                <button class="activate-btn" data-index="${index}">Активувати</button>
            `;
            inventoryGrid.appendChild(card);
        });

        initInventoryButtons();
    }

    function initInventoryButtons() {
        document.querySelectorAll('.inventory-card .activate-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                if (inventory[index]) {
                    inventory[index].quantity -= 1;
                    
                    if (inventory[index].quantity === 0) {
                        inventory.splice(index, 1);
                    }

                    renderInventory();
                    showToast("Доставка успішна, можете спробувати реалізувати ваше придбання в житті", true);
                }
            });
        });
    }

    // ==========================================================================
    // 4. ФІЛЬТРАЦІЯ ТОВАРІВ ЗА ПОСТЕРАМИ
    // ==========================================================================
    const banners = document.querySelectorAll('.category-banner');
    const productsContainer = document.getElementById('products-section');
    const productCards = document.querySelectorAll('.product-card');
    const dynamicTitle = document.getElementById('dynamic-title');
    const showAllNav = document.getElementById('show-all-nav');

    if (banners && banners.length > 0 && productsContainer) {
        function filterCategory(categoryName, categoryTitle) {
            productsContainer.classList.add('active');
            if (dynamicTitle) dynamicTitle.textContent = categoryTitle;

            if (productCards) {
                productCards.forEach(card => {
                    if (card.classList.contains('inventory-card')) return;
                    if (card.dataset.category === categoryName || categoryName === 'all') {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            }

            setTimeout(() => {
                productsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }

        banners.forEach(banner => {
            banner.addEventListener('click', () => {
                const category = banner.dataset.targetCategory;
                const h2Element = banner.querySelector('h2');
                const title = h2Element ? h2Element.textContent : "";
                filterCategory(category, `Категорія: ${title}`);
            });
        });

        if (showAllNav) {
            showAllNav.addEventListener('click', (e) => {
                e.preventDefault();
                filterCategory('all', 'Всі товари');
            });
        }
    }

    // ==========================================================================
    // 5. МОДАЛЬНЕ ВІКНО КОНТАКТІВ ТА КОПІЮВАННЯ
    // ==========================================================================
    const contactsLink = document.getElementById('contacts-link');
    const contactsModal = document.getElementById('contacts-modal');
    const closeContactsBtn = document.querySelector('.close-contacts-btn');

    if (contactsLink && contactsModal) {
        contactsLink.addEventListener('click', (e) => {
            e.preventDefault();
            contactsModal.style.display = 'flex';
        });

        if (closeContactsBtn) {
            closeContactsBtn.addEventListener('click', () => {
                contactsModal.style.display = 'none';
            });
        }

        window.addEventListener('click', (e) => {
            if (e.target === contactsModal) {
                contactsModal.style.display = 'none';
            }
        });
    }

    const copyLinks = document.querySelectorAll('.copy-click');
    if (copyLinks) {
        copyLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const textToCopy = link.dataset.copy;
                if (textToCopy) {
                    navigator.clipboard.writeText(textToCopy).then(() => {
                        showToast('Скопійовано в буфер обміну!');
                    });
                }
            });
        });
    }
});