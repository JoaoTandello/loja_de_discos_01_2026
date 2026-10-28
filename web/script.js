const API_URL = "http://localhost:3000";

const loginView = document.getElementById("loginView");
const appView = document.getElementById("appView");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const globalMessage = document.getElementById("globalMessage");
const discoModal = document.getElementById("discoModal");
const discoForm = document.getElementById("discoForm");
const discoMessage = document.getElementById("discoMessage");
const confirmModal = document.getElementById("confirmModal");

let usuarioAtual = null;
let discos = [];
let discoExcluirId = null;

function mostrarMensagem(elemento, mensagem, sucesso = false) {
  elemento.textContent = mensagem;
  elemento.classList.toggle("success", sucesso);
}

async function requisicao(caminho, opcoes = {}) {
  const resposta = await fetch(`${API_URL}${caminho}`, {
    ...opcoes,
    headers: {
      "Content-Type": "application/json",
      ...(opcoes.headers || {})
    }
  });

  const texto = await resposta.text();
  let dados = {};
  try {
    dados = texto ? JSON.parse(texto) : {};
  } catch {
    dados = { erro: texto || "Resposta inválida do servidor." };
  }

  if (!resposta.ok) {
    throw new Error(dados.erro || dados.mensagem || "Não foi possível concluir a solicitação.");
  }

  return dados;
}

loginForm.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mostrarMensagem(loginMessage, "Entrando...");

  try {
    const dados = await requisicao("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: document.getElementById("email").value.trim(),
        senha: document.getElementById("senha").value
      })
    });

    usuarioAtual = dados.usuario;
    loginView.classList.add("hidden");
    appView.classList.remove("hidden");
    document.getElementById("userName").textContent = usuarioAtual.nome;
    document.getElementById("userEmail").textContent = usuarioAtual.email;
    document.getElementById("userInitials").textContent = usuarioAtual.nome.charAt(0).toUpperCase();
    mostrarMensagem(loginMessage, "");
    await carregarDiscos();
    mostrarSecao("dashboard");
  } catch (erro) {
    mostrarMensagem(loginMessage, erro.message);
  }
});

document.getElementById("logoutButton").addEventListener("click", () => {
  usuarioAtual = null;
  appView.classList.add("hidden");
  loginView.classList.remove("hidden");
  loginForm.reset();
  mostrarMensagem(loginMessage, "");
});

document.querySelectorAll(".nav-item").forEach((botao) => {
  botao.addEventListener("click", () => mostrarSecao(botao.dataset.section));
});

document.querySelectorAll("[data-go]").forEach((botao) => {
  botao.addEventListener("click", () => mostrarSecao(botao.dataset.go));
});

function mostrarSecao(nome) {
  document.querySelectorAll(".section").forEach((secao) => secao.classList.add("hidden"));
  document.getElementById(`${nome}Section`).classList.remove("hidden");
  document.querySelectorAll(".nav-item").forEach((botao) => {
    botao.classList.toggle("active", botao.dataset.section === nome);
  });

  const titulos = {
    dashboard: "Visão geral",
    discos: "Discos",
    movimentacoes: "Movimentar estoque"
  };

  document.getElementById("pageTitle").textContent = titulos[nome];
  document.getElementById("newDiscoButton").classList.toggle("hidden", nome === "movimentacoes");
  if (nome === "movimentacoes") atualizarSelectDiscos();
  if (nome === "discos") renderizarTabelaDiscos();
}

document.getElementById("newDiscoButton").addEventListener("click", abrirCadastro);
document.getElementById("newDiscoButton2").addEventListener("click", abrirCadastro);
document.getElementById("closeModal").addEventListener("click", fecharModal);
document.getElementById("cancelModal").addEventListener("click", fecharModal);
document.querySelectorAll("[data-close]").forEach((item) => item.addEventListener("click", fecharModal));

function abrirCadastro() {
  discoForm.reset();
  document.getElementById("discoId").value = "";
  document.getElementById("modalTitle").textContent = "Cadastrar disco";
  mostrarMensagem(discoMessage, "");
  discoModal.classList.remove("hidden");
}

function fecharModal() {
  discoModal.classList.add("hidden");
}

discoForm.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const id = document.getElementById("discoId").value;
  const dados = {
    titulo: document.getElementById("titulo").value.trim(),
    artista: document.getElementById("artista").value.trim(),
    genero: document.getElementById("genero").value.trim(),
    preco_custo: Number(document.getElementById("precoCusto").value),
    preco_venda: Number(document.getElementById("precoVenda").value),
    quantidade_estoque: Number(document.getElementById("quantidade").value),
    estoque_minimo: Number(document.getElementById("estoqueMinimo").value)
  };

  try {
    const caminho = id ? `/discos/atualizar/${id}` : "/discos/adicionar";
    const metodo = id ? "PUT" : "POST";
    await requisicao(caminho, { method: metodo, body: JSON.stringify(dados) });
    fecharModal();
    mostrarMensagem(globalMessage, id ? "Disco atualizado com sucesso." : "Disco cadastrado com sucesso.", true);
    await carregarDiscos();
    mostrarSecao("discos");
  } catch (erro) {
    mostrarMensagem(discoMessage, erro.message);
  }
});

async function carregarDiscos() {
  try {
    const busca = document.getElementById("searchDiscos").value.trim();
    const ordenar = document.getElementById("sortDiscos").value;
    const parametros = new URLSearchParams();
    if (busca) parametros.set("busca", busca);
    if (ordenar) parametros.set("ordenar", ordenar);
    const query = parametros.toString() ? `?${parametros.toString()}` : "";

    discos = await requisicao(`/discos/listar${query}`);
    if (!Array.isArray(discos)) discos = [];
    renderizarResumo();
    renderizarTabelaDiscos();
    atualizarSelectDiscos();
  } catch (erro) {
    mostrarMensagem(globalMessage, `Erro ao carregar discos: ${erro.message}`);
  }
}

document.getElementById("searchButton").addEventListener("click", carregarDiscos);
document.getElementById("searchDiscos").addEventListener("keydown", (evento) => {
  if (evento.key === "Enter") carregarDiscos();
});
document.getElementById("sortDiscos").addEventListener("change", carregarDiscos);

function statusDisco(disco) {
  if (Number(disco.quantidade_estoque) <= 0) return { texto: "Sem estoque", classe: "empty" };
  if (Number(disco.quantidade_estoque) < Number(disco.estoque_minimo)) return { texto: "Estoque baixo", classe: "low" };
  return { texto: "Disponível", classe: "ok" };
}

function formatarDinheiro(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function renderizarResumo() {
  document.getElementById("totalDiscos").textContent = discos.length;
  document.getElementById("totalUnidades").textContent = discos.reduce((total, disco) => total + Number(disco.quantidade_estoque || 0), 0);
  document.getElementById("estoqueBaixo").textContent = discos.filter((disco) => Number(disco.quantidade_estoque) < Number(disco.estoque_minimo)).length;

  const recentes = discos.slice(0, 5);
  document.getElementById("recentDiscos").innerHTML = recentes.length ? recentes.map((disco) => {
    const status = statusDisco(disco);
    return `<tr>
      <td><div class="disc-title">${escapar(disco.titulo)}</div><div class="disc-artist">${escapar(disco.artista)}</div></td>
      <td>${escapar(disco.genero || "Geral")}</td>
      <td>${formatarDinheiro(disco.preco_venda)}</td>
      <td>${Number(disco.quantidade_estoque)}</td>
      <td><span class="status ${status.classe}">${status.texto}</span></td>
    </tr>`;
  }).join("") : '<tr><td colspan="5" class="empty-row">Nenhum disco cadastrado ainda.</td></tr>';
}

function renderizarTabelaDiscos() {
  const tabela = document.getElementById("discosTable");
  if (!tabela) return;

  tabela.innerHTML = discos.length ? discos.map((disco) => {
    const status = statusDisco(disco);
    return `<tr>
      <td><div class="disc-title">${escapar(disco.titulo)}</div><div class="disc-artist">${escapar(disco.artista)}</div></td>
      <td>${escapar(disco.genero || "Geral")}</td>
      <td>${formatarDinheiro(disco.preco_custo)}</td>
      <td>${formatarDinheiro(disco.preco_venda)}</td>
      <td>${Number(disco.quantidade_estoque)}</td>
      <td><span class="status ${status.classe}">${status.texto}</span></td>
      <td><div class="row-actions"><button class="icon-button" data-edit="${disco.id_disco}" title="Editar">✎</button><button class="icon-button delete" data-delete="${disco.id_disco}" title="Excluir">×</button></div></td>
    </tr>`;
  }).join("") : '<tr><td colspan="7" class="empty-row">Nenhum disco encontrado.</td></tr>';

  tabela.querySelectorAll("[data-edit]").forEach((botao) => botao.addEventListener("click", () => editarDisco(botao.dataset.edit)));
  tabela.querySelectorAll("[data-delete]").forEach((botao) => botao.addEventListener("click", () => confirmarExclusao(botao.dataset.delete)));
}

function escapar(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, (caractere) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[caractere]));
}

async function editarDisco(id) {
  try {
    const disco = await requisicao(`/discos/buscar/${id}`);
    document.getElementById("discoId").value = disco.id_disco;
    document.getElementById("titulo").value = disco.titulo || "";
    document.getElementById("artista").value = disco.artista || "";
    document.getElementById("genero").value = disco.genero || "";
    document.getElementById("precoCusto").value = Number(disco.preco_custo);
    document.getElementById("precoVenda").value = Number(disco.preco_venda);
    document.getElementById("quantidade").value = Number(disco.quantidade_estoque);
    document.getElementById("estoqueMinimo").value = Number(disco.estoque_minimo);
    document.getElementById("modalTitle").textContent = "Editar disco";
    mostrarMensagem(discoMessage, "");
    discoModal.classList.remove("hidden");
  } catch (erro) {
    mostrarMensagem(globalMessage, erro.message);
  }
}

function confirmarExclusao(id) {
  discoExcluirId = id;
  confirmModal.classList.remove("hidden");
}

function fecharConfirmacao() {
  confirmModal.classList.add("hidden");
  discoExcluirId = null;
}

document.getElementById("closeConfirm").addEventListener("click", fecharConfirmacao);
document.getElementById("cancelDelete").addEventListener("click", fecharConfirmacao);
document.querySelectorAll("[data-close-confirm]").forEach((item) => item.addEventListener("click", fecharConfirmacao));

document.getElementById("confirmDelete").addEventListener("click", async () => {
  if (!discoExcluirId) return;

  try {
    await requisicao(`/discos/excluir/${discoExcluirId}`, { method: "DELETE" });
    fecharConfirmacao();
    mostrarMensagem(globalMessage, "Disco excluído com sucesso.", true);
    await carregarDiscos();
  } catch (erro) {
    fecharConfirmacao();
    mostrarMensagem(globalMessage, erro.message);
  }
});

function atualizarSelectDiscos() {
  const select = document.getElementById("movementDisco");
  const selecionado = select.value;
  select.innerHTML = '<option value="">Selecione um disco</option>';
  discos.forEach((disco) => {
    const opcao = document.createElement("option");
    opcao.value = disco.id_disco;
    opcao.textContent = `${disco.titulo} — estoque: ${disco.quantidade_estoque}`;
    select.appendChild(opcao);
  });
  if (discos.some((disco) => String(disco.id_disco) === selecionado)) select.value = selecionado;
}

document.getElementById("movementDate").value = new Date().toLocaleDateString("en-CA");

document.getElementById("movementForm").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  if (!usuarioAtual) {
    mostrarMensagem(document.getElementById("movementMessage"), "Faça login novamente.");
    return;
  }

  const dados = {
    id_disco: Number(document.getElementById("movementDisco").value),
    id_usuario: Number(usuarioAtual.id_usuario),
    tipo_movimentacao: document.getElementById("movementType").value,
    quantidade: Number(document.getElementById("movementQuantity").value),
    data_movimentacao: document.getElementById("movementDate").value,
    observacao: document.getElementById("movementNote").value.trim()
  };

  try {
    const resultado = await requisicao("/movimentacoes/adicionar", {
      method: "POST",
      body: JSON.stringify(dados)
    });
    mostrarMensagem(document.getElementById("movementMessage"), resultado.mensagem || "Movimentação registrada com sucesso.", true);
    document.getElementById("movementQuantity").value = "";
    document.getElementById("movementNote").value = "";
    await carregarDiscos();
    atualizarSelectDiscos();
    if (resultado.alerta) mostrarMensagem(globalMessage, resultado.alerta);
  } catch (erro) {
    mostrarMensagem(document.getElementById("movementMessage"), erro.message);
  }
});
