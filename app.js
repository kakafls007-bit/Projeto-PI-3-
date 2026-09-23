// Ícone (cruz + coração) usado em todas as telas
const LOGO_SVG = `
<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M38 14 h24 a6 6 0 0 1 6 6 v14 h14 a6 6 0 0 1 6 6 v10 a6 6 0 0 1 -6 6 H68 v14 a6 6 0 0 1 -6 6 H38 a6 6 0 0 1 -6 -6 V56 H18 a6 6 0 0 1 -6 -6 V40 a6 6 0 0 1 6 -6 h14 V20 a6 6 0 0 1 6 -6 Z"
        stroke="white" stroke-width="4.5" stroke-linejoin="round" fill="none"/>
  <path d="M58 30 c3.5-4 10-4 12.5 0.5 c2.5 4.5 -1 9 -12.5 17 c-11.5-8-15-12.5-12.5-17 c2.5-4.5 9-4.5 12.5-0.5Z"
        fill="white"/>
</svg>`;

document.querySelectorAll(".logo-icon").forEach((el) => {
  el.innerHTML = LOGO_SVG;
});

// Ícone de seta para o botão "voltar"
const BACK_SVG = `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M15 18l-6-6 6-6"/>
</svg>`;

document.querySelectorAll(".back-btn").forEach((el) => {
  el.innerHTML = BACK_SVG;
  el.addEventListener("click", (e) => {
    e.preventDefault();
    const fallback = el.getAttribute("data-fallback") || "home.html";
    if (document.referrer && document.referrer.includes(window.location.host)) {
      history.back();
    } else {
      window.location.href = fallback;
    }
  });
});

// Formulário de login
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // TODO: integrar com a API de autenticação
    console.log("Login:", {
      cpf: document.getElementById("cpf").value,
      senha: document.getElementById("senha").value,
    });
    window.location.href = "home.html";
  });
}

// Formulário de cadastro
const cadastroForm = document.getElementById("cadastro-form");
if (cadastroForm) {
  cadastroForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // TODO: integrar com a API de cadastro
    const dados = {
      nome: document.getElementById("nome").value,
      cpf: document.getElementById("cpf").value,
      telefone: document.getElementById("telefone").value,
      email: document.getElementById("email").value,
      cidade: document.getElementById("cidade").value,
      plano: document.getElementById("plano").value,
    };
    console.log("Cadastro:", dados);
    localStorage.setItem("usuario", JSON.stringify(dados));
    window.location.href = "index.html";
  });
}

// Formulário de recuperação de senha
const recuperarForm = document.getElementById("recuperar-form");
if (recuperarForm) {
  recuperarForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // TODO: integrar com a API de recuperação de senha
    console.log("Recuperar senha para CPF:", document.getElementById("cpf-recuperar").value);
    window.location.href = "confirmacao.html";
  });
}

// Formulário de pré-triagem
const triagemForm = document.getElementById("triagem-form");
if (triagemForm) {
  triagemForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const sintomas = Array.from(
      document.querySelectorAll('input[name="sintomas"]:checked')
    ).map((el) => el.value);
    const dados = {
      motivo: document.getElementById("motivo").value,
      sintomas,
      urgencia: document.getElementById("urgencia").value,
      observacoes: document.getElementById("observacoes").value,
    };
    // TODO: integrar com a API de pré-triagem
    console.log("Pré-triagem:", dados);
    sessionStorage.setItem("preTriagem", JSON.stringify(dados));
    window.location.href = "agendamento.html";
  });
}

// Seleção de horário (agendamento)
const slotButtons = document.querySelectorAll(".slot-btn");
const horarioInput = document.getElementById("horario");
if (slotButtons.length && horarioInput) {
  slotButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      slotButtons.forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      horarioInput.value = btn.textContent.trim();
    });
  });
}

// Formulário de agendamento
const agendamentoForm = document.getElementById("agendamento-form");
if (agendamentoForm) {
  agendamentoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!horarioInput.value) {
      alert("Escolha um horário disponível.");
      return;
    }
    const dados = {
      id: Date.now(),
      especialidade: document.getElementById("especialidade").value,
      data: document.getElementById("data").value,
      horario: horarioInput.value,
    };
    // TODO: integrar com a API de agendamento
    console.log("Agendamento:", dados);
    const consultas = JSON.parse(localStorage.getItem("consultas") || "[]");
    consultas.push(dados);
    localStorage.setItem("consultas", JSON.stringify(consultas));
    sessionStorage.setItem("agendamento", JSON.stringify(dados));
    window.location.href = "agendamento-confirmado.html";
  });
}

const ESPECIALIDADES = {
  clinico_geral: "Clínico geral",
  pediatria: "Pediatria",
  cardiologia: "Cardiologia",
  dermatologia: "Dermatologia",
};

// Resumo do agendamento confirmado
const resumoAgendamento = document.getElementById("resumo-agendamento");
if (resumoAgendamento) {
  const dados = JSON.parse(sessionStorage.getItem("agendamento") || "{}");
  document.getElementById("resumo-especialidade").textContent =
    ESPECIALIDADES[dados.especialidade] || "—";
  document.getElementById("resumo-data").textContent = dados.data || "—";
  document.getElementById("resumo-horario").textContent = dados.horario || "—";
}

// Minhas consultas (histórico e próximas)
const tabsWrap = document.getElementById("consultas-tabs");
if (tabsWrap) {
  function formatarData(iso) {
    if (!iso) return "—";
    const [ano, mes, dia] = iso.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  function renderLista(container, lista, status) {
    if (!lista.length) {
      container.innerHTML = `<p class="empty-state">${
        status === "agendada"
          ? "Você não tem consultas marcadas."
          : "Ainda não há consultas realizadas."
      }</p>`;
      return;
    }
    container.innerHTML = lista
      .map(
        (c) => `
      <div class="consulta-card">
        <div class="consulta-top">
          <span class="consulta-especialidade">${
            ESPECIALIDADES[c.especialidade] || c.especialidade
          }</span>
          <span class="consulta-status ${status}">${
          status === "agendada" ? "agendada" : "realizada"
        }</span>
        </div>
        <div class="consulta-data">${formatarData(c.data)} às ${c.horario || "—"}</div>
      </div>`
      )
      .join("");
  }

  const consultas = JSON.parse(localStorage.getItem("consultas") || "[]");
  const hoje = new Date().toISOString().slice(0, 10);
  const proximas = consultas
    .filter((c) => c.data >= hoje)
    .sort((a, b) => a.data.localeCompare(b.data));
  const historico = consultas
    .filter((c) => c.data < hoje)
    .sort((a, b) => b.data.localeCompare(a.data));

  renderLista(document.getElementById("lista-proximas"), proximas, "agendada");
  renderLista(document.getElementById("lista-historico"), historico, "realizada");

  const tabButtons = tabsWrap.querySelectorAll(".tab-btn");
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      document
        .querySelectorAll(".tab-panel")
        .forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
    });
  });
}

// Tela de perfil (leitura dos dados salvos localmente)
const perfilInfo = document.getElementById("perfil-info");
if (perfilInfo) {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const planos = {
    basico: "Básico",
    intermediario: "Intermediário",
    premium: "Premium",
  };
  document.getElementById("info-nome").textContent = usuario.nome || "—";
  document.getElementById("info-cpf").textContent = usuario.cpf || "—";
  document.getElementById("info-telefone").textContent = usuario.telefone || "—";
  document.getElementById("info-email").textContent = usuario.email || "—";
  document.getElementById("info-cidade").textContent = usuario.cidade || "—";
  document.getElementById("info-plano").textContent = planos[usuario.plano] || "—";
}

// Excluir cadastro (Delete do CRUD de identidade)
const btnExcluir = document.getElementById("btn-excluir");
if (btnExcluir) {
  btnExcluir.addEventListener("click", () => {
    const confirmar = confirm(
      "Tem certeza que deseja excluir seu cadastro? Essa ação não pode ser desfeita."
    );
    if (confirmar) {
      // TODO: integrar com a API (DELETE do cadastro)
      localStorage.removeItem("usuario");
      window.location.href = "index.html";
    }
  });
}

// Formulário de edição de perfil (Update do CRUD de identidade)
const perfilEditarForm = document.getElementById("perfil-editar-form");
if (perfilEditarForm) {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  if (usuario.nome) document.getElementById("nome").value = usuario.nome;
  if (usuario.cpf) document.getElementById("cpf").value = usuario.cpf;
  if (usuario.telefone) document.getElementById("telefone").value = usuario.telefone;
  if (usuario.email) document.getElementById("email").value = usuario.email;
  if (usuario.cidade) document.getElementById("cidade").value = usuario.cidade;
  if (usuario.plano) document.getElementById("plano").value = usuario.plano;

  perfilEditarForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const dados = {
      nome: document.getElementById("nome").value,
      cpf: document.getElementById("cpf").value,
      telefone: document.getElementById("telefone").value,
      email: document.getElementById("email").value,
      cidade: document.getElementById("cidade").value,
      plano: document.getElementById("plano").value,
    };
    // TODO: integrar com a API (PUT/PATCH do cadastro)
    console.log("Perfil atualizado:", dados);
    localStorage.setItem("usuario", JSON.stringify(dados));
    window.location.href = "perfil.html";
  });
}