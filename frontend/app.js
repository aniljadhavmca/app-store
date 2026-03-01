let cart = [];
let products = {};
const backend = "/api";

async function loadProducts(){
    const res = await fetch(backend+"/products");
    products = await res.json();
    const container = document.getElementById("products");

    Object.keys(products).forEach(id=>{
        const p = products[id];
        container.innerHTML += `
        <div class="card">
            <img src="${p.image}" class="product-img">
            <h3>${p.name}</h3>
            <p class="price">Rs {p.price}</p>
            <button onclick="addToCart(${id})">Add to Cart</button>
        </div>`;
    });
}

function addToCart(id){
    const item = cart.find(p=>p.id===id);
    if(item){item.qty++}else{cart.push({id,qty:1})}
    updateCartUI();
}

function updateCartUI(){
    const cartItems = document.getElementById("cart-items");
    const cartCount = document.getElementById("cart-count");
    const cartTotal = document.getElementById("cart-total");

    cartItems.innerHTML="";
    let total=0,count=0;

    cart.forEach(item=>{
        const product=products[item.id];
        total+=product.price*item.qty;
        count+=item.qty;
        cartItems.innerHTML+=`${product.name} x ${item.qty}<br>`;
    });

    cartTotal.innerText=total;
    cartCount.innerText=count;
}

function toggleCart(){
    document.getElementById("cart-sidebar").classList.toggle("active");
    document.getElementById("overlay").classList.toggle("active");
}

async function checkout(){
    const name=cust_name.value;
    const email=cust_email.value;
    const address=cust_address.value;

    const res=await fetch(backend+"/create-checkout-session",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({cart,customer:{name,email,address}})
    });

    const data=await res.json();
    window.location.href=data.url;
}

loadProducts();
