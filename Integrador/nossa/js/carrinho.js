// ===== Doce Encanto — carrinho e favoritos (localStorage) =====

// Alguns navegadores bloqueiam o localStorage quando a página é aberta
// direto do arquivo (clicando duas vezes no .html, sem servidor local).
// Essa memória "de reserva" evita que o site quebre nesse caso — mas ela
// só dura enquanto a página estiver aberta. Para o carrinho funcionar de
// verdade entre as páginas, rode o site com um servidor local (por
// exemplo, a extensão "Live Server" do VS Code).
var memoriaReserva = { carrinho: [], favoritos: [] };

// pega o carrinho salvo, ou começa uma lista vazia
function pegarCarrinho() {
  try {
    var dados = localStorage.getItem("carrinho");
    return dados ? JSON.parse(dados) : [];
  } catch (e) {
    return memoriaReserva.carrinho;
  }
}

function salvarCarrinho(carrinho) {
  try {
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
  } catch (e) {
    memoriaReserva.carrinho = carrinho;
  }
  atualizarContadores();
}

function pegarFavoritos() {
  try {
    var dados = localStorage.getItem("favoritos");
    return dados ? JSON.parse(dados) : [];
  } catch (e) {
    return memoriaReserva.favoritos;
  }
}

function salvarFavoritos(favoritos) {
  try {
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
  } catch (e) {
    memoriaReserva.favoritos = favoritos;
  }
  atualizarContadores();
}

// adiciona 1 unidade do produto ao carrinho (chamado pelo botão "Adicionar")
function adicionarCarrinho(botao) {
  var card = botao.closest("[data-id]");
  var id = card.getAttribute("data-id");
  var nome = card.getAttribute("data-nome");
  var preco = parseFloat(card.getAttribute("data-preco"));
  var imagem = card.getAttribute("data-imagem");

  var carrinho = pegarCarrinho();
  var jaTem = false;

  for (var i = 0; i < carrinho.length; i++) {
    if (carrinho[i].id === id) {
      carrinho[i].quantidade = carrinho[i].quantidade + 1;
      jaTem = true;
    }
  }

  if (!jaTem) {
    carrinho.push({ id: id, nome: nome, preco: preco, imagem: imagem, quantidade: 1 });
  }

  salvarCarrinho(carrinho);

  var textoOriginal = botao.textContent;
  botao.textContent = "Adicionado!";
  setTimeout(function () {
    botao.textContent = textoOriginal;
  }, 900);
}

// liga/desliga favorito (chamado pelo coraçãozinho)
function favoritar(botao) {
  var card = botao.closest("[data-id]");
  var id = card.getAttribute("data-id");
  var nome = card.getAttribute("data-nome");
  var preco = parseFloat(card.getAttribute("data-preco"));
  var imagem = card.getAttribute("data-imagem");

  var favoritos = pegarFavoritos();
  var indiceEncontrado = -1;

  for (var i = 0; i < favoritos.length; i++) {
    if (favoritos[i].id === id) {
      indiceEncontrado = i;
    }
  }

  if (indiceEncontrado === -1) {
    favoritos.push({ id: id, nome: nome, preco: preco, imagem: imagem });
    botao.classList.add("ativo");
    botao.textContent = "♥";
  } else {
    favoritos.splice(indiceEncontrado, 1);
    botao.classList.remove("ativo");
    botao.textContent = "♡";
  }

  salvarFavoritos(favoritos);
}

// marca os corações que já são favoritos quando a página carrega
function marcarFavoritosNaPagina() {
  var favoritos = pegarFavoritos();
  var botoes = document.querySelectorAll(".btn-favorito");

  for (var i = 0; i < botoes.length; i++) {
    var card = botoes[i].closest("[data-id]");
    var id = card.getAttribute("data-id");
    for (var j = 0; j < favoritos.length; j++) {
      if (favoritos[j].id === id) {
        botoes[i].classList.add("ativo");
        botoes[i].textContent = "♥";
      }
    }
  }
}

// atualiza os numerinhos no menu (carrinho e favoritos)
function atualizarContadores() {
  var carrinho = pegarCarrinho();
  var favoritos = pegarFavoritos();
  var totalItens = 0;

  for (var i = 0; i < carrinho.length; i++) {
    totalItens = totalItens + carrinho[i].quantidade;
  }

  var contadorCarrinho = document.getElementById("contador-carrinho");
  var contadorFavoritos = document.getElementById("contador-favoritos");

  if (contadorCarrinho) {
    contadorCarrinho.textContent = totalItens;
    contadorCarrinho.style.display = totalItens > 0 ? "flex" : "none";
  }
  if (contadorFavoritos) {
    contadorFavoritos.textContent = favoritos.length;
    contadorFavoritos.style.display = favoritos.length > 0 ? "flex" : "none";
  }
}

// ===== página do carrinho =====

function renderizarCarrinho() {
  var lista = document.getElementById("lista-carrinho");
  if (!lista) return;

  var carrinho = pegarCarrinho();

  if (carrinho.length === 0) {
    lista.innerHTML =
      '<div class="estado-vazio">' +
      "<h3>Seu carrinho está vazio</h3>" +
      "<p>Que tal escolher um donut ou uma torta?</p>" +
      '<a class="botao" href="../inicio/index.html">Ver produtos</a>' +
      "</div>";
    document.getElementById("resumo-pedido").style.display = "none";
    return;
  }

  document.getElementById("resumo-pedido").style.display = "block";

  var html = "";
  var subtotal = 0;

  for (var i = 0; i < carrinho.length; i++) {
    var item = carrinho[i];
    var totalItem = item.preco * item.quantidade;
    subtotal = subtotal + totalItem;

    html +=
      '<div class="item-carrinho" data-id="' + item.id + '">' +
      '<img src="' + item.imagem + '" alt="' + item.nome + '">' +
      "<div>" +
      "<h4>" + item.nome + "</h4>" +
      '<span class="preco">R$ ' + item.preco.toFixed(2).replace(".", ",") + "</span>" +
      "</div>" +
      '<div class="controle-quantidade">' +
      '<button onclick="mudarQuantidade(\'' + item.id + "', -1)\">-</button>" +
      "<span>" + item.quantidade + "</span>" +
      '<button onclick="mudarQuantidade(\'' + item.id + "', 1)\">+</button>" +
      "</div>" +
      '<button class="btn-remover" onclick="removerDoCarrinho(\'' + item.id + '\')">remover</button>' +
      "</div>";
  }

  lista.innerHTML = html;

  var taxaEntrega = 6.9;
  document.getElementById("valor-subtotal").textContent = "R$ " + subtotal.toFixed(2).replace(".", ",");
  document.getElementById("valor-entrega").textContent = "R$ " + taxaEntrega.toFixed(2).replace(".", ",");
  document.getElementById("valor-total").textContent = "R$ " + (subtotal + taxaEntrega).toFixed(2).replace(".", ",");
}

function mudarQuantidade(id, diferenca) {
  var carrinho = pegarCarrinho();

  for (var i = 0; i < carrinho.length; i++) {
    if (carrinho[i].id === id) {
      carrinho[i].quantidade = carrinho[i].quantidade + diferenca;
    }
  }

  carrinho = carrinho.filter(function (item) {
    return item.quantidade > 0;
  });

  salvarCarrinho(carrinho);
  renderizarCarrinho();
}

function removerDoCarrinho(id) {
  var carrinho = pegarCarrinho();
  carrinho = carrinho.filter(function (item) {
    return item.id !== id;
  });
  salvarCarrinho(carrinho);
  renderizarCarrinho();
}

// ===== página de favoritos =====

function renderizarFavoritos() {
  var grade = document.getElementById("grade-favoritos");
  if (!grade) return;

  var favoritos = pegarFavoritos();

  if (favoritos.length === 0) {
    grade.innerHTML =
      '<div class="estado-vazio">' +
      "<h3>Você ainda não tem favoritos</h3>" +
      '<p>Toque no coraçãozinho de um produto para guardá-lo aqui.</p>' +
      '<a class="botao" href="../inicio/index.html">Ver produtos</a>' +
      "</div>";
    return;
  }

  var html = "";
  for (var i = 0; i < favoritos.length; i++) {
    var item = favoritos[i];
    html +=
      '<div class="produto-card" data-id="' + item.id + '" data-nome="' + item.nome +
      '" data-preco="' + item.preco + '" data-imagem="' + item.imagem + '">' +
      '<div class="produto-imagem">' +
      '<img src="' + item.imagem + '" alt="' + item.nome + '">' +
      '<button class="btn-favorito ativo" onclick="favoritar(this); renderizarFavoritos();">♥</button>' +
      "</div>" +
      '<div class="produto-info">' +
      "<h3>" + item.nome + "</h3>" +
      '<div class="produto-rodape">' +
      '<span class="preco">R$ ' + item.preco.toFixed(2).replace(".", ",") + "</span>" +
      '<button class="btn-adicionar" onclick="adicionarCarrinho(this)">Adicionar</button>' +
      "</div></div></div>";
  }
  grade.innerHTML = html;
}

// ===== página de compras (checkout) =====

function renderizarResumoCompra() {
  var resumo = document.getElementById("resumo-itens-compra");
  if (!resumo) return;

  var carrinho = pegarCarrinho();
  var html = "";
  var subtotal = 0;

  for (var i = 0; i < carrinho.length; i++) {
    var item = carrinho[i];
    var totalItem = item.preco * item.quantidade;
    subtotal = subtotal + totalItem;
    html +=
      '<div class="linha-resumo"><span>' + item.quantidade + "x " + item.nome +
      '</span><span>R$ ' + totalItem.toFixed(2).replace(".", ",") + "</span></div>";
  }

  if (carrinho.length === 0) {
    html = '<p class="produto-descricao">Seu carrinho está vazio.</p>';
  }

  resumo.innerHTML = html;

  var taxaEntrega = carrinho.length > 0 ? 6.9 : 0;
  document.getElementById("compra-subtotal").textContent = "R$ " + subtotal.toFixed(2).replace(".", ",");
  document.getElementById("compra-entrega").textContent = "R$ " + taxaEntrega.toFixed(2).replace(".", ",");
  document.getElementById("compra-total").textContent = "R$ " + (subtotal + taxaEntrega).toFixed(2).replace(".", ",");
}

function finalizarCompra(evento) {
  evento.preventDefault();
  localStorage.removeItem("carrinho");
  document.getElementById("formulario-compra").style.display = "none";
  document.getElementById("resumo-pedido-compra").style.display = "none";
  document.getElementById("confirmacao-compra").style.display = "block";
  var grade = document.getElementById("grade-checkout");
  if (grade) { grade.classList.add("pedido-concluido"); }
  atualizarContadores();
}

// roda em todas as páginas assim que o HTML carrega
document.addEventListener("DOMContentLoaded", function () {
  atualizarContadores();
  marcarFavoritosNaPagina();
  renderizarCarrinho();
  renderizarFavoritos();
  renderizarResumoCompra();
});
