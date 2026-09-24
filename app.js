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

// Ícone de enviar (chatbot)
const SEND_SVG = `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M5 12h14M13 6l6 6-6 6"/>
</svg>`;

// CPF: aceita apenas números
document.querySelectorAll('input[name="cpf"]').forEach((el) => {
  el.addEventListener("input", () => {
    el.value = el.value.replace(/\D/g, "").slice(0, 11);
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

// Pré-triagem via chatbot
const chatMessages = document.getElementById("chat-messages");
const chatInputArea = document.getElementById("chat-input-area");
if (chatMessages && chatInputArea) {
  const perguntas = [
    {
      id: "motivo",
      tipo: "texto",
      pergunta:
        "Oi! Antes da sua consulta, vou te fazer algumas perguntas rápidas. Qual o motivo que te trouxe até aqui?",
      placeholder: "Ex.: dor de cabeça, retorno, exame...",
    },
    {
      id: "sintomas",
      tipo: "multipla",
      pergunta: "Você está sentindo algum desses sintomas? Pode marcar mais de um.",
      opcoes: [
        { value: "febre", label: "Febre" },
        { value: "tosse", label: "Tosse" },
        { value: "dor_cabeca", label: "Dor de cabeça" },
        { value: "dor_corpo", label: "Dor no corpo" },
        { value: "falta_ar", label: "Falta de ar" },
        { value: "nausea", label: "Náusea" },
      ],
    },
    {
      id: "urgencia",
      tipo: "unica",
      pergunta: "Como você classificaria a urgência disso?",
      opcoes: [
        { value: "baixa", label: "Baixa" },
        { value: "media", label: "Média" },
        { value: "alta", label: "Alta" },
      ],
    },
    {
      id: "observacoes",
      tipo: "texto-opcional",
      pergunta: "Quer contar mais algum detalhe? Se não tiver nada, é só pular.",
      placeholder: "Observações (opcional)",
    },
  ];

  const respostas = {};
  let passo = 0;

  function addMensagem(texto, autor) {
    const el = document.createElement("div");
    el.className = `msg msg-${autor}`;
    el.textContent = texto;
    chatMessages.appendChild(el);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function labelSintomas(valores) {
    const mapa = Object.fromEntries(
      perguntas.find((p) => p.id === "sintomas").opcoes.map((o) => [o.value, o.label])
    );
    return valores.length
      ? valores.map((v) => mapa[v]).join(", ")
      : "Nenhum sintoma informado";
  }

  // Recomendação do especialista mais adequado a partir das respostas da pré-triagem.
  // TODO: substituir por uma chamada à IA de chatbot quando ela estiver disponível.
  // Por enquanto é uma regra simples (palavras-chave do motivo + sintomas marcados),
  // mas já recebe o objeto completo de respostas para facilitar a troca futura:
  // ex.: `async function escolherEspecialidadeIdeal(respostas) { return await iaChatbot.recomendar(respostas); }`
  function escolherEspecialidadeIdeal(respostas) {
    const texto = (respostas.motivo || "").toLowerCase();
    const sintomas = respostas.sintomas || [];

    if (
      texto.includes("crianc") ||
      texto.includes("filho") ||
      texto.includes("filha") ||
      texto.includes("bebe") ||
      texto.includes("bebê")
    ) {
      return "pediatria";
    }
    if (
      texto.includes("pele") ||
      texto.includes("mancha") ||
      texto.includes("alergia") ||
      texto.includes("coceira")
    ) {
      return "dermatologia";
    }
    if (sintomas.includes("falta_ar")) {
      return "cardiologia";
    }
    return "clinico_geral";
  }

  function renderPasso() {
    chatInputArea.innerHTML = "";

    if (passo >= perguntas.length) {
      const especialidadeRecomendada = escolherEspecialidadeIdeal(respostas);
      addMensagem(
        `Com base no que você me contou, o mais indicado é uma consulta de ${
          ESPECIALIDADES[especialidadeRecomendada]
        }. Já deixei essa sugestão registrada em "Minhas consultas" — é só escolher o dia e o horário por lá.`,
        "bot"
      );

      // TODO: integrar com a API de pré-triagem
      console.log("Pré-triagem:", respostas, "→ especialidade recomendada:", especialidadeRecomendada);
      sessionStorage.setItem("preTriagem", JSON.stringify(respostas));

      const consultas = JSON.parse(localStorage.getItem("consultas") || "[]");
      const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
      consultas.push({
        id: Date.now(),
        especialidade: especialidadeRecomendada,
        data: "",
        horario: "",
        origem: "pre-triagem",
        paciente: usuario.nome || "Paciente",
        preTriagem: respostas,
        atendida: false,
      });
      localStorage.setItem("consultas", JSON.stringify(consultas));

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn";
      btn.textContent = "ver minhas consultas";
      btn.addEventListener("click", () => {
        window.location.href = "consultas.html";
      });
      chatInputArea.appendChild(btn);
      return;
    }

    const p = perguntas[passo];
    addMensagem(p.pergunta, "bot");

    if (p.tipo === "texto" || p.tipo === "texto-opcional") {
      const row = document.createElement("div");
      row.className = "chat-send-row";

      const input = document.createElement("input");
      input.type = "text";
      input.className = "chat-text-input";
      input.placeholder = p.placeholder || "";

      const enviar = () => {
        const valor = input.value.trim();
        if (!valor && p.tipo === "texto") return;
        respostas[p.id] = valor;
        addMensagem(valor || "Pular", "user");
        passo++;
        renderPasso();
      };

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") enviar();
      });

      const sendBtn = document.createElement("button");
      sendBtn.type = "button";
      sendBtn.className = "chat-send-btn";
      sendBtn.innerHTML = SEND_SVG;
      sendBtn.addEventListener("click", enviar);

      row.appendChild(input);
      row.appendChild(sendBtn);
      chatInputArea.appendChild(row);

      if (p.tipo === "texto-opcional") {
        const pular = document.createElement("a");
        pular.href = "javascript:void(0)";
        pular.className = "secondary-link";
        pular.textContent = "pular";
        pular.addEventListener("click", () => {
          respostas[p.id] = "";
          addMensagem("Pular", "user");
          passo++;
          renderPasso();
        });
        chatInputArea.appendChild(pular);
      }

      input.focus();
    }

    if (p.tipo === "multipla") {
      const selecionados = new Set();
      const chips = document.createElement("div");
      chips.className = "chat-chips";
      p.opcoes.forEach((o) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "chat-chip";
        chip.textContent = o.label;
        chip.addEventListener("click", () => {
          if (selecionados.has(o.value)) {
            selecionados.delete(o.value);
            chip.classList.remove("selected");
          } else {
            selecionados.add(o.value);
            chip.classList.add("selected");
          }
        });
        chips.appendChild(chip);
      });
      chatInputArea.appendChild(chips);

      const confirmBtn = document.createElement("button");
      confirmBtn.type = "button";
      confirmBtn.className = "btn";
      confirmBtn.textContent = "confirmar";
      confirmBtn.addEventListener("click", () => {
        const valores = Array.from(selecionados);
        respostas[p.id] = valores;
        addMensagem(labelSintomas(valores), "user");
        passo++;
        renderPasso();
      });
      chatInputArea.appendChild(confirmBtn);
    }

    if (p.tipo === "unica") {
      const chips = document.createElement("div");
      chips.className = "chat-chips";
      p.opcoes.forEach((o) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "chat-chip";
        chip.textContent = o.label;
        chip.addEventListener("click", () => {
          respostas[p.id] = o.value;
          addMensagem(o.label, "user");
          passo++;
          renderPasso();
        });
        chips.appendChild(chip);
      });
      chatInputArea.appendChild(chips);
    }
  }

  renderPasso();
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
  const params = new URLSearchParams(window.location.search);
  const especialidadeParam = params.get("especialidade");
  const consultaId = params.get("consultaId");
  const especialidadeSelect = document.getElementById("especialidade");
  if (especialidadeParam && especialidadeSelect) {
    especialidadeSelect.value = especialidadeParam;
  }

  agendamentoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!horarioInput.value) {
      alert("Escolha um horário disponível.");
      return;
    }
    const consultas = JSON.parse(localStorage.getItem("consultas") || "[]");
    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
    let dados;

    if (consultaId) {
      // Completa a consulta que já existia (sugerida pela pré-triagem), em vez de duplicar.
      const consulta = consultas.find((c) => String(c.id) === consultaId);
      if (consulta) {
        consulta.especialidade = document.getElementById("especialidade").value;
        consulta.data = document.getElementById("data").value;
        consulta.horario = horarioInput.value;
        dados = consulta;
      }
    }

    if (!dados) {
      dados = {
        id: Date.now(),
        especialidade: document.getElementById("especialidade").value,
        data: document.getElementById("data").value,
        horario: horarioInput.value,
        paciente: usuario.nome || "Paciente",
        atendida: false,
      };
      consultas.push(dados);
    }

    // TODO: integrar com a API de agendamento
    console.log("Agendamento:", dados);
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
      .map((c) => {
        const pendente = status === "agendada" && !c.data;
        const statusClasse = pendente ? "pendente" : status;
        const statusLabel = pendente
          ? "aguardando horário"
          : status === "agendada"
          ? "agendada"
          : "realizada";
        const linhaData = pendente
          ? "Sugestão da pré-triagem"
          : `${formatarData(c.data)} às ${c.horario || "—"}`;
        const acao = pendente
          ? `<a class="consulta-action" href="agendamento.html?especialidade=${c.especialidade}&consultaId=${c.id}">marcar horário</a>`
          : "";
        return `
      <div class="consulta-card">
        <div class="consulta-top">
          <span class="consulta-especialidade">${
            ESPECIALIDADES[c.especialidade] || c.especialidade
          }</span>
          <span class="consulta-status ${statusClasse}">${statusLabel}</span>
        </div>
        <div class="consulta-data">${linhaData}</div>
        ${acao}
      </div>`;
      })
      .join("");
  }

  const consultas = JSON.parse(localStorage.getItem("consultas") || "[]");
  const hoje = new Date().toISOString().slice(0, 10);
  const proximas = consultas
    .filter((c) => !c.atendida && (!c.data || c.data >= hoje))
    .sort((a, b) => (a.data || "9999-99-99").localeCompare(b.data || "9999-99-99"));
  const historico = consultas
    .filter((c) => c.atendida || (c.data && c.data < hoje))
    .sort((a, b) => (b.data || "").localeCompare(a.data || ""));

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

// Login do profissional
const loginProfissionalForm = document.getElementById("login-profissional-form");
if (loginProfissionalForm) {
  loginProfissionalForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // TODO: integrar com a API de autenticação de profissionais
    console.log("Login profissional:", {
      registro: document.getElementById("registro").value,
    });
    window.location.href = "painel-profissional.html";
  });
}

const SINTOMAS_LABELS = {
  febre: "Febre",
  tosse: "Tosse",
  dor_cabeca: "Dor de cabeça",
  dor_corpo: "Dor no corpo",
  falta_ar: "Falta de ar",
  nausea: "Náusea",
};

const URGENCIAS = { baixa: "Baixa", media: "Média", alta: "Alta" };

function formatarDataBR(iso) {
  if (!iso) return "—";
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

// Painel do profissional (fila de atendimentos)
const painelTabs = document.getElementById("painel-tabs");
if (painelTabs) {
  function renderFila(container, lista, concluida) {
    if (!lista.length) {
      container.innerHTML = `<p class="empty-state">${
        concluida
          ? "Nenhum atendimento concluído ainda."
          : "Nenhuma consulta aguardando atendimento."
      }</p>`;
      return;
    }
    container.innerHTML = lista
      .map(
        (c) => `
      <a class="consulta-card consulta-card-link" href="consulta-profissional.html?consultaId=${c.id}">
        <div class="consulta-top">
          <span class="consulta-especialidade">${
            ESPECIALIDADES[c.especialidade] || c.especialidade
          }</span>
          <span class="consulta-status ${concluida ? "realizada" : "agendada"}">${
          concluida ? "concluída" : "aguardando"
        }</span>
        </div>
        <div class="consulta-data">${c.paciente || "Paciente"} · ${formatarDataBR(
          c.data
        )} às ${c.horario || "—"}</div>
      </a>`
      )
      .join("");
  }

  const consultasProfissional = JSON.parse(localStorage.getItem("consultas") || "[]");
  const aguardando = consultasProfissional
    .filter((c) => c.data && !c.atendida)
    .sort((a, b) => a.data.localeCompare(b.data));
  const concluidas = consultasProfissional
    .filter((c) => c.atendida)
    .sort((a, b) => (b.data || "").localeCompare(a.data || ""));

  renderFila(document.getElementById("lista-aguardando"), aguardando, false);
  renderFila(document.getElementById("lista-concluidas"), concluidas, true);

  const painelTabButtons = painelTabs.querySelectorAll(".tab-btn");
  painelTabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      painelTabButtons.forEach((b) => b.classList.remove("active"));
      document
        .querySelectorAll(".tab-panel")
        .forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
    });
  });
}

// Detalhe da consulta (visão do profissional)
const consultaDetalhe = document.getElementById("consulta-detalhe");
if (consultaDetalhe) {
  const params = new URLSearchParams(window.location.search);
  const consultaId = params.get("consultaId");
  const consultasDetalhe = JSON.parse(localStorage.getItem("consultas") || "[]");
  const consulta = consultasDetalhe.find((c) => String(c.id) === consultaId);

  if (!consulta) {
    document.getElementById("consulta-nao-encontrada").style.display = "block";
  } else {
    const triagem = consulta.preTriagem;
    const sintomasLabel =
      triagem && triagem.sintomas && triagem.sintomas.length
        ? triagem.sintomas.map((s) => SINTOMAS_LABELS[s] || s).join(", ")
        : "Nenhum sintoma informado";

    const info = document.createElement("div");
    info.innerHTML = `
      <div class="summary-box">
        <div class="summary-row"><span class="label">Paciente</span><span class="value">${
          consulta.paciente || "—"
        }</span></div>
        <div class="summary-row"><span class="label">Especialidade</span><span class="value">${
          ESPECIALIDADES[consulta.especialidade] || consulta.especialidade
        }</span></div>
        <div class="summary-row"><span class="label">Data</span><span class="value">${formatarDataBR(
          consulta.data
        )}</span></div>
        <div class="summary-row"><span class="label">Horário</span><span class="value">${
          consulta.horario || "—"
        }</span></div>
      </div>
      ${
        triagem
          ? `
      <p class="intro-text left" style="margin-bottom:16px;">Pré-triagem do paciente</p>
      <div class="summary-box">
        <div class="summary-row"><span class="label">Motivo</span><span class="value">${
          triagem.motivo || "—"
        }</span></div>
        <div class="summary-row"><span class="label">Sintomas</span><span class="value">${sintomasLabel}</span></div>
        <div class="summary-row"><span class="label">Urgência</span><span class="value">${
          URGENCIAS[triagem.urgencia] || "—"
        }</span></div>
        <div class="summary-row"><span class="label">Observações</span><span class="value">${
          triagem.observacoes || "—"
        }</span></div>
      </div>`
          : `<p class="empty-state">Esta consulta não veio de uma pré-triagem pelo chatbot.</p>`
      }
    `;
    consultaDetalhe.appendChild(info);

    const bottomArea = document.createElement("div");
    bottomArea.className = "bottom-area";

    if (consulta.atendida) {
      bottomArea.innerHTML = `<p class="empty-state">Atendimento já concluído.</p>`;
    } else {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn";
      btn.textContent = "concluir atendimento";
      btn.addEventListener("click", () => {
        // TODO: integrar com a API de atendimento
        consulta.atendida = true;
        localStorage.setItem("consultas", JSON.stringify(consultasDetalhe));
        window.location.href = "painel-profissional.html";
      });
      bottomArea.appendChild(btn);
    }
    consultaDetalhe.appendChild(bottomArea);
  }
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