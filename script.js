document.addEventListener('DOMContentLoaded', function () {
    let products = document.querySelector('.products');
    let cart = {};
    let cartDropdown = document.getElementById('cart-dropdown');
    let cartIcon = document.querySelector('.cart');
    let cartCount = document.getElementById('count');
    let productDetails = null;

    // Check if there are items in the cart in local storage
    cartIcon.addEventListener('click', () => {
        cartDropdown.classList.toggle('active');
        updateCartDropdown();
    });

    // Fetch products from the API
    async function fetchProducts(url) {
        let data = await fetch(url);
        let response = await data.json();

        response.forEach(product => {
            let product_title = product.title;
            products.innerHTML += `
                <div class="product" data-productID="${product.id}">
                    <img src="${product.image}" alt="" class="product-img">
                    <div class="product-content">
                        <h2 class="product-title">${product_title.length > 15 ? product_title.substring(0, 18).concat('...') : product_title}</h2>
                        <h4 class="product-category">${product.category}</h4>
                        <div class="product-price-container">
                            <h3 class="product-price">$${product.price}</h3>
                            <a href="#!" data-productID="${product.id}" data-producttitle="${product.title}" data-productprice="${product.price}" data-productimage="${product.image}" class="add-to-cart">Add to Cart</a>
                        </div>
                    </div>
                </div>
            `;
        });

        document.querySelectorAll('.product').forEach(product => {
            product.addEventListener('click', viewProductDetails);
        });

        let addToCartButtons = document.querySelectorAll('.add-to-cart');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', addToCart);
        });
    }

    // View the details of a product
    function viewProductDetails(event) {
        let productId = event.currentTarget.dataset.productid;

        // Fetch the product details from the API
        fetch(`https://fakestoreapi.com/products/${productId}`)
            .then(response => response.json())
            .then(product => {
                products.style.display = 'none';

                if (!productDetails) {
                    productDetails = document.createElement('div');
                    productDetails.classList.add('product-details');
                    document.body.appendChild(productDetails);
                }

                productDetails.style.display = 'block';
                productDetails.innerHTML = `
                    <h1>Product Details</h1>
                    <img src="${product.image}" alt="${product.title}">
                    <h2>${product.title}</h2>
                    <p>${product.description}</p>
                    <p><b>Category:</b> ${product.category}</p>
                    <p><b>Price:</b> $${product.price}</p>
                    <div class="pd-btns">
                        <a href="#!" data-productID="${product.id}" data-producttitle="${product.title}" data-productprice="${product.price}" data-productimage="${product.image}" class="add-to-cart1">Add to Cart</a>
                        <a href="#" class="back-btn">Back to Listing</a>
                    </div>
                `;

                // Attach the addToCart event listener to the new button in the product details
                let addToCartButton = productDetails.querySelector('.add-to-cart1');
                addToCartButton.addEventListener('click', addToCart);

                // back button
                let backButton = productDetails.querySelector('.back-btn');
                backButton.addEventListener('click', returnToListing);
            })
            .catch(error => console.error('Error fetching product details:', error));
    }

    // Return to the product listing
    function returnToListing(event) {
        event.preventDefault(); // Prevent the default link behavior
        products.style.display = 'grid';
        productDetails.style.display = 'none';
    }

    // Add a product to the cart
    function addToCart(event) {
        event.stopPropagation(); // Stop event from bubbling up to product click event
        let productId = event.target.dataset.productid;
        let productTitle = event.target.dataset.producttitle;
        let productPrice = event.target.dataset.productprice;
        let productImage = event.target.dataset.productimage;

        if (cart[productId]) {
            cart[productId].quantity += 1;
        } else {
            cart[productId] = {
                title: productTitle,
                price: parseFloat(productPrice),
                quantity: 1,
                image: productImage
            };
        }
        updateCartCount();
        updateCartDropdown();
    }

    // Update the cart count in the header
    function updateCartCount() {
        let totalItems = Object.values(cart).reduce((sum, product) => sum + product.quantity, 0);
        cartCount.textContent = totalItems;
    }

    // Update the cart dropdown with the current cart items
    function updateCartDropdown() {
        cartDropdown.innerHTML = '';
        if (Object.keys(cart).length === 0) {
            cartDropdown.innerHTML = '<p>Your cart is empty</p>';
        } else {
            let totalPrice = 0;
            for (let productId in cart) {
                let cartItem = cart[productId];
                totalPrice += cartItem.price * cartItem.quantity;
                cartDropdown.innerHTML += `
                    <div class="cart-item">
                        <img src="${cartItem.image}" alt="${cartItem.title}" class="cart-item-img">
                        <h4>${cartItem.title.length > 20 ? cartItem.title.substring(0, 20) + '...' : cartItem.title}</h4>
                        <div class="quantity-control">
                            <button class="decrease-quantity" data-productid="${productId}">-</button>
                            <input type="text" value="${cartItem.quantity}" readonly>
                            <button class="increase-quantity" data-productid="${productId}">+</button>
                        </div>
                        <div class="item-price"><b>Price:</b><span>$${cartItem.price}</span></div>
                    </div>
                `;
            }
            cartDropdown.innerHTML += `
                <div class="total-price">
                    Total: $${totalPrice.toFixed(2)}
                </div>
            `;

            let decreaseButtons = cartDropdown.querySelectorAll('.decrease-quantity');
            let increaseButtons = cartDropdown.querySelectorAll('.increase-quantity');

            decreaseButtons.forEach(button => {
                button.addEventListener('click', decreaseQuantity);
            });

            increaseButtons.forEach(button => {
                button.addEventListener('click', increaseQuantity);
            });
        }
    }

    // Decrease the quantity of a product in the cart
    function decreaseQuantity(event) {
        let productId = event.target.dataset.productid;
        if (cart[productId].quantity > 1) {
            cart[productId].quantity -= 1;
        } else {
            delete cart[productId];
        }
        updateCartCount();
        updateCartDropdown();
    }

    // Increase the quantity of a product in the cart
    function increaseQuantity(event) {
        let productId = event.target.dataset.productid;
        cart[productId].quantity += 1;
        updateCartCount();
        updateCartDropdown();
    }

    // Fetch products from the API
    fetchProducts('https://fakestoreapi.com/products');
});
