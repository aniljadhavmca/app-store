let cart = [];
let products = {};
const backend = "/api";

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.innerText = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2000);
}

async function loadProducts(){
    const res = await fetch(backend+"/products");
    products = await res.json();
    const container = document.getElementById("products");
    container.innerHTML = "";

    Object.keys(products).forEach(id=>{
        const p = products[id];
        container.innerHTML += `
        <div class="card">
            <img src="${p.image}" class="product-img">
            <h3>${p.name}</h3>
            <p class="price">Rs ${p.price}</p>
            <button onclick="addToCart(${id})">Add to Cart</button>
        </div>`;
    });
}

function addToCart(id){
    const item = cart.find(p=>p.id===id);

    if(item){
        item.qty++;
    } else {
        cart.push({id:id, qty:1});
    }

    updateCartUI();
    showToast("Item added to cart");
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

        cartItems.innerHTML+=`
        <div>
            ${product.name} x ${item.qty}
        </div>`;
    });

    cartTotal.innerText=total;
    cartCount.innerText=count;
}

function toggleCart(){
    document.getElementById("cart-sidebar").classList.toggle("active");
    document.getElementById("overlay").classList.toggle("active");
}

async function checkout(){
    const name=document.getElementById("cust_name").value;
    const email=document.getElementById("cust_email").value;
    const address=document.getElementById("cust_address").value;

    if(!name || !email || cart.length===0){
        showToast(" Fill delivery details & add items");
        return;
    }

    const res=await fetch(backend+"/create-checkout-session",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({cart,customer:{name,email,address}})
    });

    const data=await res.json();
    window.location.href=data.url;
}

loadProducts();
