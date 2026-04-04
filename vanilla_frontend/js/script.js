// Base API URL
const API_URL = '/api';

// --- Auth Utilities ---
const getToken = () => localStorage.getItem('token');
const setToken = (token) => localStorage.setItem('token', token);
const removeToken = () => localStorage.removeItem('token');

const authFetch = async (url, options = {}) => {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
    };
    return fetch(url, { ...options, headers });
};

// --- Page Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    if (path.endsWith('index.html') || path === '/' || path.endsWith('NNPTUD_Ngay31-3/')) {
        loadPortfolio();
        setupContactForm();
        updateNavAuth();
    } else if (path.endsWith('login.html')) {
        setupLoginForm();
    } else if (path.endsWith('register.html')) {
        setupRegisterForm();
    } else if (path.endsWith('admin.html')) {
        checkAdmin();
        setupAdminDashboard();
    }
});

// --- Register Form ---
function setupRegisterForm() {
    const form = document.getElementById('register-form');
    if (!form) return;
    form.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        const errorMsg = document.getElementById('error-msg');

        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (res.ok) {
                alert('Account created! Please login.');
                window.location.href = 'login.html';
            } else {
                errorMsg.classList.remove('hidden');
                errorMsg.textContent = result.error || 'Registration failed';
            }
        } catch (err) {
            errorMsg.classList.remove('hidden');
        }
    };
}

// --- Nav Auth Update ---
function updateNavAuth() {
    const authLinks = document.getElementById('auth-links');
    if (!authLinks) return;
    const token = getToken();
    if (token) {
        authLinks.innerHTML = `
            <a href="admin.html" class="text-sm font-bold bg-blue-600 px-4 py-2 rounded-lg text-white">Dashboard</a>
            <button onclick="logout()" class="text-sm font-medium text-slate-400 hover:text-red-400">Logout</button>
        `;
    }
}

window.logout = () => {
    removeToken();
    window.location.href = 'index.html';
};

// --- Portfolio Loading ---
async function loadPortfolio() {
    try {
        const [projectsRes, skillsRes, blogsRes, productsRes] = await Promise.all([
            fetch(`${API_URL}/projects`),
            fetch(`${API_URL}/skills`),
            fetch(`${API_URL}/blogs`),
            fetch(`${API_URL}/v2/products`)
        ]);

        const projects = await projectsRes.json();
        const skills = await skillsRes.json();
        const blogs = await blogsRes.json();
        const products = await productsRes.json();

        const projectsGrid = document.getElementById('projects-grid');
        if (projectsGrid) {
            projectsGrid.innerHTML = projects.map(p => `
                <div class="bg-slate-800 rounded-[32px] overflow-hidden border border-slate-700 shadow-xl group hover:border-blue-500/50 transition-all animate-fade-in">
                    <div class="aspect-video overflow-hidden">
                        <img src="${p.image || 'https://via.placeholder.com/800x450'}" class="w-full h-full object-cover group-hover:scale-105 transition-all duration-500">
                    </div>
                    <div class="p-8">
                        <h3 class="text-2xl font-bold mb-3">${p.title}</h3>
                        <p class="text-slate-400 mb-6">${p.description}</p>
                        ${p.link ? `<a href="${p.link}" target="_blank" class="text-blue-500 font-bold hover:underline">View Project &rarr;</a>` : ''}
                    </div>
                </div>
            `).join('');
        }

        const productsList = document.getElementById('products-list');
        if (productsList) {
            productsList.innerHTML = products.map(p => `
                <div class="bg-slate-800/50 p-6 rounded-3xl border border-slate-700 hover:border-emerald-500/50 transition-all animate-fade-in flex flex-col">
                    <img src="${p.image || 'https://via.placeholder.com/400x400'}" class="w-full aspect-square rounded-2xl object-cover mb-6">
                    <h3 class="text-xl font-bold mb-2">${p.name}</h3>
                    <p class="text-slate-400 text-sm mb-6 line-clamp-2">${p.description}</p>
                    <div class="mt-auto flex justify-between items-center">
                        <span class="text-2xl font-black text-emerald-400">$${p.price}</span>
                        <button onclick="orderProduct('${p._id}', '${p.name}', ${p.price})" class="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold transition-all text-sm">Order</button>
                    </div>
                </div>
            `).join('');
        }

        const blogsList = document.getElementById('blogs-list');
        if (blogsList) {
            blogsList.innerHTML = blogs.map(b => `
                <div class="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:bg-slate-800 transition-all animate-fade-in">
                    <img src="${b.thumbnail || 'https://via.placeholder.com/400x200'}" class="w-full h-40 rounded-xl object-cover mb-6">
                    <h3 class="text-xl font-bold mb-3 line-clamp-2">${b.title}</h3>
                    <p class="text-slate-400 text-sm line-clamp-3 mb-6">${b.content}</p>
                    <div class="text-xs text-slate-500">${new Date(b.createdAt).toLocaleDateString()}</div>
                </div>
            `).join('');
        }

        const skillsList = document.getElementById('skills-list');
        if (skillsList) {
            skillsList.innerHTML = skills.map(s => `
                <div class="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg animate-fade-in">
                    <div class="flex justify-between mb-4">
                        <span class="font-bold text-lg">${s.name}</span>
                        <span class="text-blue-500 font-bold">${s.level}%</span>
                    </div>
                    <div class="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                        <div class="bg-blue-600 h-full rounded-full" style="width: ${s.level}%"></div>
                    </div>
                </div>
            `).join('');
        }

    } catch (err) {
        console.error('Error loading portfolio:', err);
    }
}

window.orderProduct = async (productId, name, price) => {
    const token = getToken();
    if (!token) {
        alert('Please login to order products');
        window.location.href = 'login.html';
        return;
    }

    if (!confirm(`Do you want to order ${name} for $${price}?`)) return;

    try {
        // Lấy thông tin người dùng hiện tại để lấy ID customer (giả định role user có thông tin này)
        const meRes = await authFetch(`${API_URL}/auth/me`);
        const me = await meRes.json();
        
        // Tạo order
        const res = await authFetch(`${API_URL}/v2/orders`, {
            method: 'POST',
            body: JSON.stringify({
                customer: me._id, // Trong mô hình này, ta dùng user id làm customer id cho đơn giản nếu chưa có model Customer riêng biệt cho user
                products: [{
                    product: productId,
                    quantity: 1,
                    price: price
                }],
                totalAmount: price,
                status: 'pending'
            })
        });

        if (res.ok) {
            alert('Order placed successfully!');
        } else {
            const err = await res.json();
            alert(`Order failed: ${err.error || 'Unknown error'}`);
        }
    } catch (err) {
        alert('Connection error');
    }
};

// --- Contact Form ---
function setupContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    form.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        try {
            const res = await fetch(`${API_URL}/customers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                alert('Success! Your message has been sent.');
                form.reset();
            }
        } catch (err) {
            alert('Error sending message.');
        }
    };
}

// --- Login Form ---
function setupLoginForm() {
    const form = document.getElementById('login-form');
    if (!form) return;
    form.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        const errorMsg = document.getElementById('error-msg');

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (res.ok) {
                setToken(result.token);
                // Phân quyền hướng đi sau khi đăng nhập
                if (result.user.role === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'index.html';
                }
            } else {
                errorMsg.classList.remove('hidden');
                errorMsg.textContent = result.error || 'Login failed';
            }
        } catch (err) {
            errorMsg.classList.remove('hidden');
            errorMsg.textContent = 'Connection error';
        }
    };
}

// --- Admin Dashboard ---
// Modal elements will be found when needed to avoid issues with DOM loading
const getModalElements = () => {
    const container = document.getElementById('modal-container');
    const content = document.getElementById('modal-content');
    return { container, content };
};

window.openModal = (html) => {
    const { container, content } = getModalElements();
    if (!container || !content) {
        console.error('Modal elements not found!');
        return;
    }
    content.innerHTML = html;
    container.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
};

window.closeModal = () => {
    const { container } = getModalElements();
    if (container) {
        container.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
};

// Global click listener for modal background
document.addEventListener('click', (e) => {
    const { container } = getModalElements();
    if (container && e.target === container) {
        closeModal();
    }
});

async function checkAdmin() {
    const token = getToken();
    if (!token) {
        console.warn('No token found, redirecting to login');
        window.location.href = 'login.html';
        return;
    }

    try {
        const res = await authFetch(`${API_URL}/auth/me`);
        const user = await res.json();
        
        if (!res.ok) {
            console.error('Auth failed:', user.error);
            removeToken();
            window.location.href = 'login.html';
            return;
        }

        if (user.role !== 'admin') {
            console.warn('User is not an admin, role:', user.role);
            // Nếu không phải admin, cho về trang chủ thay vì bắt đăng nhập lại
            window.location.href = 'index.html';
        } else {
            document.getElementById('user-info').textContent = `Hello, ${user.username}`;
        }
    } catch (err) {
        console.error('Network error during checkAdmin:', err);
        window.location.href = 'login.html';
    }
}

function setupAdminDashboard() {
    const tabsNav = document.getElementById('tabs-nav');
    if (!tabsNav) return;

    tabsNav.addEventListener('click', (e) => {
        const tab = e.target.dataset.tab;
        if (!tab) return;
        
        // Update active style
        tabsNav.querySelectorAll('button').forEach(btn => {
            btn.classList.remove('bg-blue-600', 'text-white');
            btn.classList.add('text-slate-400', 'hover:bg-slate-700/50');
        });
        e.target.classList.add('bg-blue-600', 'text-white');
        e.target.classList.remove('text-slate-400', 'hover:bg-slate-700/50');

        renderTabContent(tab);
    });

    renderTabContent('projects'); // Default tab
}

async function renderTabContent(tab) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `<div class="p-20 text-center text-slate-500 animate-pulse">Loading ${tab}...</div>`;

    try {
        // Handle different API paths for new models
        let url = `${API_URL}/${tab}`;
        if (['products', 'orders', 'roles', 'settings', 'auditlogs'].includes(tab)) {
            url = `${API_URL}/v2/${tab}`;
        }

        const res = await authFetch(url);
        const data = await res.json();

        if (tab === 'projects') {
            renderProjectsAdmin(data);
        } else if (tab === 'blogs') {
            renderBlogsAdmin(data);
        } else if (tab === 'skills') {
            renderSkillsAdmin(data);
        } else if (tab === 'customers') {
            renderContactsAdmin(data);
        } else if (tab === 'products') {
            renderProductsAdmin(data);
        } else if (tab === 'orders') {
            renderOrdersAdmin(data);
        } else if (tab === 'auditlogs') {
            renderAuditLogsAdmin(data);
        }
    } catch (err) {
        contentArea.innerHTML = `<div class="p-20 text-center text-red-500">Error loading data.</div>`;
    }
}

// Helper to store items temporarily for modal editing
window._currentAdminData = {};

function renderBlogsAdmin(blogs) {
    const contentArea = document.getElementById('content-area');
    blogs.forEach(b => window._currentAdminData[b._id] = b);
    
    contentArea.innerHTML = `
        <div class="flex justify-between items-center mb-10">
            <h3 class="text-3xl font-black text-white">Blog Posts</h3>
            <button onclick="openBlogModal()" class="bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded-2xl font-bold transition-colors">New Post</button>
        </div>
        <div class="space-y-4">
            ${blogs.map(b => `
                <div class="bg-slate-900/50 p-6 rounded-3xl flex justify-between items-center border border-slate-700/50 group hover:border-orange-500/50 transition-all">
                    <div class="flex items-center gap-6">
                        <img src="${b.thumbnail || 'https://via.placeholder.com/100'}" class="w-16 h-16 rounded-xl object-cover">
                        <div>
                            <h4 class="font-bold text-xl text-white">${b.title}</h4>
                            <p class="text-slate-500 text-sm line-clamp-1">${b.content.substring(0, 50)}...</p>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button class="p-3 text-orange-400 hover:bg-orange-500/10 rounded-xl font-bold" onclick="openBlogModal('${b._id}')">Edit</button>
                        <button class="p-3 text-red-400 hover:bg-red-500/10 rounded-xl" onclick="deleteItem('blogs', '${b._id}')">Delete</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

window.openBlogModal = (blogId = null) => {
    const blog = blogId ? window._currentAdminData[blogId] : null;
    const isEdit = !!blog;
    // ... rest of the function remains same but uses 'blog' instead of being passed directly
    const html = `
        <div class="p-10">
            <div class="flex justify-between items-center mb-8">
                <h3 class="text-3xl font-black text-white">${isEdit ? 'Edit Post' : 'New Blog Post'}</h3>
                <button onclick="closeModal()" class="text-slate-400 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
            <form id="blog-form" class="space-y-6">
                <input type="hidden" name="id" value="${blog?._id || ''}">
                <div>
                    <label class="block text-sm font-bold text-slate-400 mb-2">Title</label>
                    <input type="text" name="title" value="${blog?.title || ''}" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors" required>
                </div>
                <div>
                    <label class="block text-sm font-bold text-slate-400 mb-2">Content</label>
                    <textarea name="content" rows="6" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors" required>${blog?.content || ''}</textarea>
                </div>
                <div>
                    <label class="block text-sm font-bold text-slate-400 mb-2">Thumbnail Image</label>
                    <input type="file" name="thumbnail" class="w-full text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-700 cursor-pointer">
                    ${isEdit && blog.thumbnail ? `<p class="mt-2 text-xs text-slate-500">Current: ${blog.thumbnail}</p>` : ''}
                </div>
                <button type="submit" class="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-orange-500/20">
                    ${isEdit ? 'Update Post' : 'Publish Post'}
                </button>
            </form>
        </div>
    `;
    openModal(html);

    const form = document.getElementById('blog-form');
    form.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const id = formData.get('id');
        const isEditMode = !!id;

        try {
            const url = isEditMode ? `${API_URL}/blogs/${id}` : `${API_URL}/blogs`;
            const method = isEditMode ? 'PATCH' : 'POST';
            
            const token = getToken();
            const res = await fetch(url, {
                method: method,
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                closeModal();
                renderTabContent('blogs');
            } else {
                alert('Failed to save blog post');
            }
        } catch (err) {
            alert('Connection error');
        }
    };
};

function renderProductsAdmin(products) {
    const contentArea = document.getElementById('content-area');
    products.forEach(p => window._currentAdminData[p._id] = p);

    contentArea.innerHTML = `
        <div class="flex justify-between items-center mb-10">
            <h3 class="text-3xl font-black text-white">Products</h3>
            <button onclick="openProductModal()" class="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-2xl font-bold transition-colors">New Product</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${products.map(p => `
                <div class="bg-slate-900/50 p-6 rounded-3xl border border-slate-700/50 group hover:border-blue-500/50 transition-all">
                    <div class="flex items-center gap-6 mb-4">
                        <img src="${p.image || 'https://via.placeholder.com/100'}" class="w-16 h-16 rounded-xl object-cover">
                        <div class="flex-1">
                            <h4 class="font-bold text-xl text-white">${p.name}</h4>
                            <div class="flex justify-between items-center">
                                <p class="text-emerald-400 font-bold">$${p.price}</p>
                                <p class="text-slate-500 text-xs">Stock: ${p.stock || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button class="flex-1 p-2 bg-slate-800 hover:bg-slate-700 text-blue-400 font-bold rounded-xl transition-colors" onclick="openProductModal('${p._id}')">Edit</button>
                        <button class="p-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors" onclick="deleteItemV2('products', '${p._id}')">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

window.openProductModal = (productId = null) => {
    const product = productId ? window._currentAdminData[productId] : null;
    const isEdit = !!product;
    const html = `
        <div class="p-10">
            <div class="flex justify-between items-center mb-8">
                <h3 class="text-3xl font-black text-white">${isEdit ? 'Edit Product' : 'Add New Product'}</h3>
                <button onclick="closeModal()" class="text-slate-400 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
            <form id="product-form" class="space-y-6">
                <input type="hidden" name="id" value="${product?._id || ''}">
                <div>
                    <label class="block text-sm font-bold text-slate-400 mb-2">Product Name</label>
                    <input type="text" name="name" value="${product?.name || ''}" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" required>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-bold text-slate-400 mb-2">Price ($)</label>
                        <input type="number" name="price" value="${product?.price || ''}" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" required>
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-slate-400 mb-2">Stock</label>
                        <input type="number" name="stock" value="${product?.stock || 0}" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" required>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-bold text-slate-400 mb-2">Description</label>
                    <textarea name="description" rows="3" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" required>${product?.description || ''}</textarea>
                </div>
                <div>
                    <label class="block text-sm font-bold text-slate-400 mb-2">Product Image</label>
                    <input type="file" name="image" class="w-full text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer">
                    ${isEdit && product.image ? `<p class="mt-2 text-xs text-slate-500">Current: ${product.image}</p>` : ''}
                </div>
                <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20">
                    ${isEdit ? 'Update Product' : 'Create Product'}
                </button>
            </form>
        </div>
    `;
    openModal(html);

    const form = document.getElementById('product-form');
    form.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const id = formData.get('id');
        const isEditMode = !!id;

        try {
            const url = isEditMode ? `${API_URL}/v2/products/${id}` : `${API_URL}/v2/products`;
            const method = isEditMode ? 'PATCH' : 'POST';
            
            // Using authFetch but with special handling for FormData
            const token = getToken();
            const res = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (res.ok) {
                closeModal();
                renderTabContent('products');
            } else {
                const err = await res.json();
                alert(`Error: ${err.error || 'Failed to save product'}`);
            }
        } catch (err) {
            console.error('Save error:', err);
            alert('Connection error');
        }
    };
};

function renderOrdersAdmin(orders) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <h3 class="text-3xl font-black mb-10 text-white">Orders Management</h3>
        <div class="space-y-6">
            ${orders.map(o => `
                <div class="bg-slate-900/50 p-8 rounded-[32px] border border-slate-700/50 hover:border-blue-500/30 transition-all">
                    <div class="flex justify-between items-start mb-6">
                        <div>
                            <h4 class="font-black text-2xl text-blue-500 mb-1">Order #${o._id.slice(-6).toUpperCase()}</h4>
                            <p class="text-slate-500 text-sm">Customer: <span class="text-slate-300 font-bold">${o.customer?.username || o.customer?.first_name || 'Guest'}</span></p>
                        </div>
                        <div class="flex flex-col items-end">
                            <span class="px-4 py-2 bg-slate-800 rounded-full text-xs font-black uppercase tracking-widest ${getStatusColor(o.status)}">${o.status}</span>
                            <p class="text-slate-500 text-xs mt-2">${new Date(o.createdAt).toLocaleString()}</p>
                        </div>
                    </div>
                    
                    <div class="bg-slate-900/50 rounded-2xl p-4 mb-6 border border-slate-800">
                        <h5 class="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Items</h5>
                        <div class="space-y-3">
                            ${o.products.map(p => `
                                <div class="flex justify-between items-center text-sm">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-500">IMG</div>
                                        <span class="font-bold text-white">${p.product?.name || 'Deleted Product'}</span>
                                        <span class="text-slate-500">x${p.quantity}</span>
                                    </div>
                                    <span class="font-black text-emerald-400">$${p.price * p.quantity}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
                            <span class="font-black text-white">Total Amount</span>
                            <span class="text-2xl font-black text-emerald-400">$${o.totalAmount}</span>
                        </div>
                    </div>

                    <div class="flex flex-wrap gap-2">
                        <select onchange="updateOrderStatus('${o._id}', this.value)" class="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm font-bold text-white focus:outline-none focus:border-blue-500 cursor-pointer">
                            <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="processing" ${o.status === 'processing' ? 'selected' : ''}>Processing</option>
                            <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                            <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                            <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                        <button class="p-2 px-4 text-red-400 hover:bg-red-500/10 rounded-xl font-bold text-sm transition-colors ml-auto" onclick="deleteItemV2('orders', '${o._id}')">Delete Order</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function getStatusColor(status) {
    switch (status) {
        case 'pending': return 'text-orange-400 bg-orange-400/10';
        case 'processing': return 'text-blue-400 bg-blue-400/10';
        case 'shipped': return 'text-purple-400 bg-purple-400/10';
        case 'delivered': return 'text-emerald-400 bg-emerald-400/10';
        case 'cancelled': return 'text-red-400 bg-red-400/10';
        default: return 'text-slate-400 bg-slate-400/10';
    }
}

window.updateOrderStatus = async (id, status) => {
    try {
        const res = await authFetch(`${API_URL}/v2/orders/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
        if (res.ok) {
            renderTabContent('orders');
        } else {
            alert('Failed to update status');
        }
    } catch (err) {
        alert('Connection error');
    }
};

function renderAuditLogsAdmin(logs) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <h3 class="text-3xl font-black mb-10">Audit Logs</h3>
        <div class="space-y-2">
            ${logs.map(l => `
                <div class="bg-slate-900/30 p-4 rounded-xl border border-slate-700/30 text-sm">
                    <span class="text-blue-400 font-bold">[${l.action}]</span> 
                    <span class="text-slate-300">${l.modelName}</span> by 
                    <span class="text-emerald-400">${l.user?.username || 'System'}</span>
                    <span class="float-right text-slate-500">${new Date(l.createdAt).toLocaleString()}</span>
                </div>
            `).join('')}
        </div>
    `;
}

window.deleteItemV2 = async (type, id) => {
    if (!confirm('Delete this item?')) return;
    try {
        const res = await authFetch(`${API_URL}/v2/${type}/${id}`, { method: 'DELETE' });
        if (res.ok) renderTabContent(type);
    } catch (err) {
        alert('Error deleting item.');
    }
};

function renderProjectsAdmin(projects) {
    const contentArea = document.getElementById('content-area');
    projects.forEach(p => window._currentAdminData[p._id] = p);

    contentArea.innerHTML = `
        <div class="flex justify-between items-center mb-10">
            <h3 class="text-3xl font-black text-white">Projects</h3>
            <button onclick="openProjectModal()" class="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-2xl font-bold transition-colors">New Project</button>
        </div>
        <div class="space-y-4">
            ${projects.map(p => `
                <div class="bg-slate-900/50 p-6 rounded-3xl flex justify-between items-center border border-slate-700/50 group hover:border-blue-500/50 transition-all">
                    <div class="flex items-center gap-6">
                        <img src="${p.image || 'https://via.placeholder.com/100'}" class="w-16 h-16 rounded-xl object-cover">
                        <div>
                            <h4 class="font-bold text-xl text-white">${p.title}</h4>
                            <p class="text-slate-500 text-sm">${p.description}</p>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button class="p-3 text-blue-400 hover:bg-blue-500/10 rounded-xl font-bold" onclick="openProjectModal('${p._id}')">Edit</button>
                        <button class="p-3 text-red-400 hover:bg-red-500/10 rounded-xl" onclick="deleteItem('projects', '${p._id}')">Delete</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

window.openProjectModal = (projectId = null) => {
    const project = productId ? window._currentAdminData[productId] : null;
    const isEdit = !!project;
    const html = `
        <div class="p-10">
            <div class="flex justify-between items-center mb-8">
                <h3 class="text-3xl font-black text-white">${isEdit ? 'Edit Project' : 'New Project'}</h3>
                <button onclick="closeModal()" class="text-slate-400 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
            <form id="project-form" class="space-y-6">
                <input type="hidden" name="id" value="${project?._id || ''}">
                <div>
                    <label class="block text-sm font-bold text-slate-400 mb-2">Title</label>
                    <input type="text" name="title" value="${project?.title || ''}" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" required>
                </div>
                <div>
                    <label class="block text-sm font-bold text-slate-400 mb-2">Description</label>
                    <textarea name="description" rows="3" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" required>${project?.description || ''}</textarea>
                </div>
                <div>
                    <label class="block text-sm font-bold text-slate-400 mb-2">Link (Optional)</label>
                    <input type="text" name="link" value="${project?.link || ''}" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors">
                </div>
                <div>
                    <label class="block text-sm font-bold text-slate-400 mb-2">Project Image</label>
                    <input type="file" name="image" class="w-full text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer">
                    ${isEdit && project.image ? `<p class="mt-2 text-xs text-slate-500">Current: ${project.image}</p>` : ''}
                </div>
                <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20">
                    ${isEdit ? 'Update Project' : 'Create Project'}
                </button>
            </form>
        </div>
    `;
    openModal(html);

    const form = document.getElementById('project-form');
    form.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const id = formData.get('id');
        const isEditMode = !!id;

        try {
            const url = isEditMode ? `${API_URL}/projects/${id}` : `${API_URL}/projects`;
            const method = isEditMode ? 'PATCH' : 'POST';
            
            const token = getToken();
            const res = await fetch(url, {
                method: method,
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                closeModal();
                renderTabContent('projects');
            } else {
                alert('Failed to save project');
            }
        } catch (err) {
            alert('Connection error');
        }
    };
};

function renderSkillsAdmin(skills) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <h3 class="text-3xl font-black mb-10">Skills</h3>
        <div class="space-y-4">
            ${skills.map(s => `
                <div class="bg-slate-900/50 p-6 rounded-3xl flex justify-between items-center border border-slate-700/50">
                    <span class="font-bold text-xl">${s.name} (${s.level}%)</span>
                    <button class="p-3 text-red-400 hover:bg-red-500/10 rounded-xl" onclick="deleteItem('skills', '${s._id}')">Delete</button>
                </div>
            `).join('')}
        </div>
    `;
}

function renderContactsAdmin(contacts) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <h3 class="text-3xl font-black mb-10">Contact Inquiries</h3>
        <div class="space-y-6">
            ${contacts.map(c => `
                <div class="bg-slate-900/50 p-8 rounded-[32px] border border-slate-700/50">
                    <div class="flex justify-between items-center mb-4">
                        <h4 class="text-2xl font-black">${c.first_name} ${c.last_name}</h4>
                        <span class="text-slate-500 text-sm">${new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p class="text-blue-400 mb-4">${c.email}</p>
                    <div class="bg-slate-900 p-6 rounded-2xl italic text-slate-400">"${c.notes}"</div>
                </div>
            `).join('')}
        </div>
    `;
}

window.deleteItem = async (type, id) => {
    if (!confirm('Delete this item?')) return;
    try {
        const res = await authFetch(`${API_URL}/${type}/${id}`, { method: 'DELETE' });
        if (res.ok) renderTabContent(type);
    } catch (err) {
        alert('Error deleting item.');
    }
};
