import { deals, advert } from "../data/deals.js";

let dealHtml = "";
let advertHtml = "";

// Generate HTML for deals and adverts
deals.forEach((deal) => {
    dealHtml += `
        <div class="deal-item">
            <img src="${deal.image}" alt="${deal.title}" class="deal-image">
            <p class="deal-title">${deal.title}</p>
        </div>
    `;
});

advert.forEach((ad) => {
    advertHtml += `
        <div class="advert-item">
            <img src="${ad.image}" alt="${ad.title}">
        </div>
    `;
});

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - script running');
    
    // Insert generated HTML first
    document.querySelector(".deals").innerHTML = dealHtml;
    document.querySelector(".advert-slide").innerHTML = advertHtml;
    
    // Initialize slideshow after content is loaded
    initSlideshow();

    // Cart functionality
    document.getElementById('cartButton').addEventListener('click', function() {
        document.getElementById('cartModal').style.display = 'block';
    });

    document.querySelector('.close-cart').addEventListener('click', function() {
        document.getElementById('cartModal').style.display = 'none';
    });
});

// Slideshow functionality
let slideIndex = 0;
let slideInterval;

function initSlideshow() {
    const slides = document.querySelectorAll(".advert-item");
    if (slides.length === 0) {
        console.error("No slides found");
        return;
    }
    
    // Show first slide and hide others
    slides.forEach((slide, index) => {
        slide.style.display = index === 0 ? "block" : "none";
    });
    
    startAutoSlide();

    initShoppingCart();
    
    const slider = document.querySelector('.advert-slide');
    if (slider) {
        slider.addEventListener('mouseenter', stopAutoSlide);
        slider.addEventListener('mouseleave', startAutoSlide);
    }
}

function plusSlides(n) {
    showSlides(slideIndex += n);
}

function showSlides(n) {
    const slides = document.querySelectorAll(".advert-item");
    if (slides.length === 0) return;
    
    if (n >= slides.length) { slideIndex = 0 }
    if (n < 0) { slideIndex = slides.length - 1 }
    
    slides.forEach(slide => {
        slide.style.display = "none";
    });
    
    slides[slideIndex].style.display = "block";
}

function startAutoSlide() {
    stopAutoSlide(); // Clear any existing interval
    slideInterval = setInterval(() => {
        plusSlides(1);
    }, 3000); // Change slide every 3 seconds
}

function stopAutoSlide() {
    if (slideInterval) {
        clearInterval(slideInterval);
    }
}

function initShoppingCart() {
    // Get cart from localStorage or initialize empty array
    updateCartCount();
    
    // Cart button click event
    const cartButton = document.getElementById('cartButton');
    const cartModal = document.getElementById('cartModal');
    const closeCart = document.querySelector('.close-cart');
    
    if (cartButton && cartModal) {
      cartButton.addEventListener('click', function() {
        displayCartItems();
        cartModal.style.display = 'block';
      });
      
      closeCart.addEventListener('click', function() {
        cartModal.style.display = 'none';
      });
      
      window.addEventListener('click', function(event) {
        if (event.target === cartModal) {
          cartModal.style.display = 'none';
        }
      });
      
      // Checkout button
      const checkoutBtn = document.getElementById('checkoutBtn');
      if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
          checkout();
        });
      }
      
      // Clear cart button
      const clearCartBtn = document.getElementById('clearCartBtn');
      if (clearCartBtn) {
        clearCartBtn.addEventListener('click', function() {
          clearCart();
        });
      }
    }
  }

function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
  }
  
  function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
  
  function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const cart = getCart();
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
      });
    }
    
    saveCart(cart);
    updateCartCount();
    
    // Show confirmation message
    const message = `${product.name} added to cart!`;
    showToast(message);
  }
  
  function updateCartCount() {
    const cart = getCart();
    const cartCount = document.querySelector('.cart-count');
    
    if (cartCount) {
      const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
      cartCount.textContent = totalItems;
    }
  }
  
  function displayCartItems() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const cart = getCart();
    
    if (cartItems) {
      // Clear previous items
      cartItems.innerHTML = '';
      
      if (cart.length === 0) {
        cartItems.innerHTML = '<p>Your cart is empty.</p>';
        cartTotal.textContent = '₦0';
        return;
      }
      
      // Calculate total
      let total = 0;
      
      // Add each item to the cart display
      cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItemHTML = `
          <div class="cart-item" data-id="${item.id}">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
              <p class="cart-item-name">${item.name}</p>
              <p class="cart-item-price">₦${item.price.toLocaleString()}</p>
              <div class="cart-item-quantity">
                <button class="quantity-btn decrease" onclick="decreaseQuantity(${item.id})">-</button>
                <span class="quantity-value">${item.quantity}</span>
                <button class="quantity-btn increase" onclick="increaseQuantity(${item.id})">+</button>
                <button class="remove-item" onclick="removeFromCart(${item.id})">Remove</button>
              </div>
            </div>
          </div>
        `;
        
        cartItems.innerHTML += cartItemHTML;
      });
      
      // Update total
      cartTotal.textContent = `₦${total.toLocaleString()}`;
    }
  }
  
  function increaseQuantity(productId) {
    const cart = getCart();
    const item = cart.find(item => item.id === productId);
    
    if (item) {
      item.quantity += 1;
      saveCart(cart);
      displayCartItems();
      updateCartCount();
    }
  }
  
  function decreaseQuantity(productId) {
    const cart = getCart();
    const item = cart.find(item => item.id === productId);
    
    if (item) {
      item.quantity -= 1;
      
      if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
      }
      
      saveCart(cart);
      displayCartItems();
      updateCartCount();
    }
  }
  
  function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    displayCartItems();
    updateCartCount();
  }
  
  function clearCart() {
    localStorage.removeItem('cart');
    displayCartItems();
    updateCartCount();
    showToast('Cart cleared!');
  }
  
  function checkout() {
    const cart = getCart();
    
    if (cart.length === 0) {
      showToast('Your cart is empty!');
      return;
    }
    
    // In a real application, this would redirect to a checkout page
    showToast('Proceeding to checkout...');
    
    // For demo purposes, clear the cart after "checkout"
    setTimeout(() => {
      clearCart();
      document.getElementById('cartModal').style.display = 'none';
      showToast('Thank you for your purchase!');
    }, 2000);
  }