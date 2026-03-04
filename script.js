// --- DADOS DOS PRODUTOS ---
import { produtos } from "./data.js";

let carrinho = [];
let estadoFiltro = 'todos';
let estadoBusca = '';

// Variáveis para a Rolagem Infinita
let produtosFiltrados = [];
let itensPorPagina = 12; // Quantos produtos carrega por vez (pode alterar se quiser)
let itensAtuais = 8;

// --- INICIALIZAÇÃO ---
document.addEventListener("DOMContentLoaded", () => {
    // 1. Força o menu lateral a começar ESCONDIDO
    const sidebar = document.getElementById('sidebar');
    if (sidebar && window.innerWidth > 768) {
        sidebar.classList.add('collapsed');
    }

    // 2. Carrega os produtos iniciais
    atualizarExibicao();
});

// --- LÓGICA DE FILTRO E PESQUISA ---
function setFilter(tipo) {
    estadoFiltro = tipo;
    
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.filter-btn[data-tipo="${tipo}"]`).classList.add('active');

    if (window.innerWidth <= 768) {
        toggleSidebar(); // Fecha no celular após escolher
    }
    
    atualizarExibicao();
}

function handleSearch() {
    estadoBusca = document.getElementById('search-input').value.toLowerCase();
    atualizarExibicao();
}

// --- LÓGICA DE ROLAGEM INFINITA ---
function atualizarExibicao() {
    // 1. Filtra a lista completa de produtos
    produtosFiltrados = produtos.filter(p => {
        const passaFiltro = estadoFiltro === 'todos' || p.tipo.includes(estadoFiltro);
        const passaBusca = estadoBusca === '' || p.nome.toLowerCase().includes(estadoBusca);
        return passaFiltro && passaBusca;
    });

    // 2. Limpa o container e reseta o contador
    const container = document.getElementById('products-container');
    container.innerHTML = '';
    itensAtuais = 0;
    
    if (produtosFiltrados.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: #A0AEC0;">Nenhuma peça encontrada.</p>';
        return;
    }

    // 3. Carrega o primeiro lote
    carregarMaisProdutos();
}

function carregarMaisProdutos() {
    // Se já carregou todos, a função para aqui (evita erros)
    if (itensAtuais >= produtosFiltrados.length) return;

    const container = document.getElementById('products-container');
    
    // Pega apenas os próximos produtos (ex: do 0 ao 8, depois do 8 ao 16...)
    const proximosProdutos = produtosFiltrados.slice(itensAtuais, itensAtuais + itensPorPagina);

    // Adiciona apenas as cartas novas no final da lista
    proximosProdutos.forEach(produto => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <div class="img-container" onclick="verImagem('${produto.img}', '${produto.nome}')">
                <img src="${produto.img}" alt="${produto.nome}" class="card-img" loading="lazy">
            </div>
            <div class="card-body">
                <h3 class="card-title">${produto.nome}</h3>
                <p class="card-prazo">🕒 ${produto.prazo}</p>
                <p class="price">R$ ${produto.preco.toFixed(2).replace('.', ',')}</p>
                <div class="qtd-control">
                    <button class="qtd-btn" onclick="mudarQtd(${produto.id}, -1)">-</button>
                    <span id="qtd-${produto.id}">1</span>
                    <button class="qtd-btn" onclick="mudarQtd(${produto.id}, 1)">+</button>
                </div>
                <button class="add-btn" onclick="adicionarAoCarrinho(${produto.id})">Adicionar</button>
            </div>
        `;
        container.appendChild(div);
    });

    // Atualiza a contagem de itens mostrados
    itensAtuais += itensPorPagina;
}

// --- EVENTO DE ROLAGEM (Scroll to Top + Rolagem Infinita) ---
window.addEventListener('scroll', () => {
    // Lógica do Botão de Subir
    const btn = document.getElementById("scrollTopBtn");
    if (window.scrollY > 300) {
        btn.style.display = "flex";
    } else {
        btn.style.display = "none";
    }

    // Lógica da Rolagem Infinita (Mais precisa para qualquer navegador)
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    
    // Se faltarem 400 pixels para chegar ao fim da página, carrega o próximo lote
    if (scrollTop + clientHeight >= scrollHeight - 400) {
        carregarMaisProdutos();
    }
});

function mudarQtd(id, delta) {
    const span = document.getElementById(`qtd-${id}`);
    let qtd = parseInt(span.innerText) + delta;
    if (qtd < 1) qtd = 1;
    span.innerText = qtd;
}

// --- CARRINHO DE COMPRAS ---
function adicionarAoCarrinho(id) {
    const produto = produtos.find(p => p.id === id);
    const qtd = parseInt(document.getElementById(`qtd-${id}`).innerText);
    
    const itemExistente = carrinho.find(item => item.id === id);
    if (itemExistente) {
        itemExistente.qtd += qtd;
    } else {
        carrinho.push({ ...produto, qtd });
    }
    
    document.getElementById(`qtd-${id}`).innerText = "1"; // Reseta o contador
    mostrarMensagem("Adicionado com sucesso! 💜");
    atualizarCarrinho();
}

function removerDoCarrinho(index) {
    carrinho.splice(index, 1);
    atualizarCarrinho();
}

function atualizarCarrinho() {
    const itensContainer = document.getElementById('cart-items');
    const totalSpan = document.getElementById('cart-total');
    const badge = document.getElementById('cart-count');
    
    itensContainer.innerHTML = '';
    let total = 0;
    let totalItens = 0;

    if (carrinho.length === 0) {
        itensContainer.innerHTML = '<p style="text-align: center; color: #777; padding: 20px;">Seu carrinho está vazio.</p>';
    }

    carrinho.forEach((item, index) => {
        total += item.preco * item.qtd;
        totalItens += item.qtd;
        
        itensContainer.innerHTML += `
            <div class="cart-item">
                <div style="flex-grow: 1;">
                    <div style="font-size: 0.9rem; font-weight: 600; color: white;">${item.nome}</div>
                    <div style="font-size: 0.8rem; color: #FF1493;">${item.qtd}x R$ ${item.preco.toFixed(2).replace('.', ',')}</div>
                </div>
                <button onclick="removerDoCarrinho(${index})" style="background: rgba(255,0,0,0.1); border:none; color:#ff4444; padding:8px; border-radius:8px; cursor:pointer;">
                    <span class="material-icons-round" style="font-size:18px;">delete</span>
                </button>
            </div>
        `;
    });

    totalSpan.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
    badge.innerText = totalItens;
}

function toggleCart() {
    const modal = document.getElementById('cart-modal');
    const overlay = document.getElementById('cart-overlay');
    if (modal.style.display === 'flex') {
        modal.style.display = 'none';
        overlay.style.display = 'none';
    } else {
        modal.style.display = 'flex';
        overlay.style.display = 'block';
    }
}

// --- CONTROLES DE INTERFACE (SIDEBAR, LIGHTBOX, TOAST) ---
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    if (window.innerWidth <= 768) {
        // Lógica Mobile
        sidebar.classList.toggle('open');
        overlay.classList.toggle('open');
    } else {
        // Lógica Desktop (Recolher/Expandir)
        sidebar.classList.toggle('collapsed');
    }
}

function verImagem(url, nome) {
    document.getElementById('lightbox-img').src = url;
    document.getElementById('lightbox-caption').innerText = nome;
    document.getElementById('lightbox').style.display = 'flex';
}

function fecharImagem() {
    document.getElementById('lightbox').style.display = 'none';
}

function mostrarMensagem(texto) {
    let msgDiv = document.getElementById('msg-toast');
    if (!msgDiv) {
        msgDiv = document.createElement('div');
        msgDiv.id = 'msg-toast';
        msgDiv.style.cssText = `
            position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
            background: linear-gradient(135deg, #FF1493, #8A2BE2); color: white; padding: 12px 24px; border-radius: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3); z-index: 3000; font-weight: 600; font-size: 0.9rem;
            opacity: 0; transition: opacity 0.3s, bottom 0.3s; pointer-events: none;
        `;
        document.body.appendChild(msgDiv);
    }
    msgDiv.innerText = texto;
    msgDiv.style.opacity = '1';
    msgDiv.style.bottom = '80px'; 
    setTimeout(() => { msgDiv.style.opacity = '0'; msgDiv.style.bottom = '30px'; }, 2500);
}

// --- CHECKOUT WHATSAPP ---
// --- FINALIZAR COMPRA NO WHATSAPP ---
function checkoutWhatsApp() {
    // 1. Verifica se o carrinho está vazio antes de enviar
    if (carrinho.length === 0) {
        mostrarMensagem("O seu carrinho está vazio! Adicione alguns produtos primeiro.");
        return;
    }

    // 2. Montar a mensagem estilo "Recibo Profissional"
    let texto = "✨ *NOVO PEDIDO - ATELIÊ MB CRIATIVE* ✨\n\n";
    texto += "Olá! Gostaria de finalizar o seguinte pedido:\n\n";

    let total = 0;
    carrinho.forEach((item, index) => {
        let subtotal = item.preco * item.qtd;
        total += subtotal;
        
        // Formatação bonita com emojis e negrito
        texto += `🔹 *${item.qtd}x* ${item.nome}\n`;
        texto += `   Valor un.: R$ ${item.preco.toFixed(2).replace('.', ',')} | Sub: R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
    });

    texto += `\n💰 *TOTAL DO PEDIDO: R$ ${total.toFixed(2).replace('.', ',')}*\n\n`;
    texto += "Aguardo as instruções para o pagamento e envio. Muito obrigado(a)!";

    // 3. Enviar para o WhatsApp (usando o número que estava no seu footer)
    const numeroWhatsApp = "5581997192611"; // Pode alterar se precisar
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(texto)}`;
    
    // Abre o WhatsApp numa nova aba
    window.open(url, '_blank');

    // 4. LIMPAR O CARRINHO
    carrinho = []; // Esvazia a lista de produtos
    
    // Atualiza a interface (a função que desenha o carrinho na tela precisa rodar novamente para mostrar vazio)
    // Nota: Se a sua função que atualiza a tela tiver outro nome (ex: renderCart), troque aqui. Mas geralmente chama-se atualizarCarrinho().
    if (typeof atualizarCarrinho === "function") {
        atualizarCarrinho(); 
    }

    toggleCart();

    // 6. Mensagem de sucesso no site
    mostrarMensagem("A enviar pedido para o WhatsApp...");
}

// --- SCROLL TO TOP ---
window.onscroll = function() {
    const btn = document.getElementById("scrollTopBtn");
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        btn.style.display = "flex";
    } else {
        btn.style.display = "none";
    }
};

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}


// ==========================================
// EXPORTANDO FUNÇÕES PARA O HTML (MÓDULO)
// ==========================================
window.setFilter = setFilter;
window.handleSearch = handleSearch;
window.verImagem = verImagem;
window.fecharImagem = fecharImagem;
window.mudarQtd = mudarQtd;
window.adicionarAoCarrinho = adicionarAoCarrinho;
window.removerDoCarrinho = removerDoCarrinho;
window.toggleCart = toggleCart;
window.toggleSidebar = toggleSidebar;
window.checkoutWhatsApp = checkoutWhatsApp;
window.scrollToTop = scrollToTop;