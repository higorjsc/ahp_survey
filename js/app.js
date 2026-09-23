/**
 * Lógica principal da aplicação de pesquisa Fuzzy-AHP
 * (Sem manipulação de inline styles em elementos HTML - 100% via classes e CSS variables)
 */

document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("pairwiseComparisonsContainer");
  const form = document.getElementById("ahpForm");
  const alertContainer = document.getElementById("validationAlert");

  const pairs = generatePairwiseCombinations(CRITERIA);

  // Renderizar as 15 comparações paritárias
  renderComparisonCards(pairs, container);

  // Inicializar listeners de alteração
  setupEventListeners(pairs);

  // Atualizar progresso inicial
  updateProgress(pairs);

  // Manipular envio do formulário com validação e AJAX Formcarry
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Validar dados do participante
    const emailInput = document.getElementById("evaluatorEmail");
    const nameInput = document.getElementById("evaluatorName");

    if (!nameInput.value.trim() || !emailInput.value.trim()) {
      showAlert("Por favor, preencha seu Nome e E-mail antes de prosseguir.", "warning");
      nameInput.focus();
      return;
    }

    // Validar todas as 15 comparações
    const uncompletedPair = findFirstIncompletePair(pairs);
    if (uncompletedPair) {
      const cardElement = document.getElementById(`card_${uncompletedPair.pairKey}`);
      showAlert(
        `Atenção: A <strong>Comparação ${uncompletedPair.index} (${uncompletedPair.crit1.code} vs ${uncompletedPair.crit2.code})</strong> na Etapa 3 ainda não foi totalmente respondida.`,
        "danger"
      );
      if (cardElement) {
        cardElement.scrollIntoView({ behavior: "smooth", block: "center" });
        cardElement.classList.add("border-danger");
        setTimeout(() => cardElement.classList.remove("border-danger"), 3000);
      }
      return;
    }

    // Formulário 100% completo -> Enviar dados
    submitSurveyForm(form);
  });
});

/**
 * Renderiza os cards das 15 comparações
 */
function renderComparisonCards(pairs, container) {
  let html = "";

  pairs.forEach((pair) => {
    const { index, crit1, crit2, pairKey } = pair;
    const code1Lower = crit1.code.toLowerCase();
    const code2Lower = crit2.code.toLowerCase();

    html += `
      <div class="card criteria-card mb-4 shadow-sm" id="card_${pairKey}" data-pair="${pairKey}">
        <div class="card-header bg-white comparison-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <span class="badge bg-secondary me-2">Comparação ${index} de ${pairs.length}</span>
            <span class="fw-bold fs-6 text-dark">${crit1.fullName} <span class="text-muted fw-normal">vs</span> ${crit2.fullName}</span>
          </div>
          <span class="badge bg-light text-secondary border badge-status" id="status_${pairKey}">Pendente</span>
        </div>
        
        <div class="card-body p-4">
          <!-- Pergunta 1: Rádios -->
          <div class="mb-4">
            <label class="form-label fw-bold d-block text-dark mb-3">
              Qual critério você julga mais importante?
            </label>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="custom-radio-card w-100">
                  <input type="radio" 
                         name="mais_importante_${pairKey}" 
                         value="${crit1.fullName}" 
                         data-pair="${pairKey}"
                         data-chosen-code="${crit1.code}"
                         data-chosen="${crit1.fullName}" 
                         data-other="${crit2.fullName}"
                         required>
                  <div class="radio-content">
                    <span class="radio-indicator"></span>
                    <div>
                      <span class="badge badge-criteria-${code1Lower}">${crit1.code}</span>
                      <strong class="ms-1">${crit1.name}</strong>
                    </div>
                  </div>
                </label>
              </div>

              <div class="col-md-6">
                <label class="custom-radio-card w-100">
                  <input type="radio" 
                         name="mais_importante_${pairKey}" 
                         value="${crit2.fullName}" 
                         data-pair="${pairKey}"
                         data-chosen-code="${crit2.code}"
                         data-chosen="${crit2.fullName}" 
                         data-other="${crit1.fullName}"
                         required>
                  <div class="radio-content">
                    <span class="radio-indicator"></span>
                    <div>
                      <span class="badge badge-criteria-${code2Lower}">${crit2.code}</span>
                      <strong class="ms-1">${crit2.name}</strong>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <!-- Pergunta 2: Select com escala de Saaty textual -->
          <div class="intensity-question-block is-disabled" id="intensity_block_${pairKey}">
            <label class="form-label dynamic-question-label text-dark mb-2" id="label_intensidade_${pairKey}">
              <i class="bi bi-lock-fill me-1 text-muted" id="lock_icon_${pairKey}"></i> O quão mais importante o critério selecionado é mais importante que o outro?
            </label>
            <select class="form-select form-select-lg saaty-select" 
                    id="select_intensidade_${pairKey}" 
                    name="intensidade_saaty_${pairKey}" 
                    disabled 
                    required>
              <option value="" disabled selected>Selecione o critério mais importante na pergunta acima primeiro...</option>
              ${SAATY_SCALE_OPTIONS.map((opt) => `<option value="${opt}">${opt}</option>`).join("")}
            </select>
            <div class="form-text text-muted mt-2 intensity-hint-disabled">
              <i class="bi bi-info-circle me-1"></i> Responda à pergunta 1 acima para habilitar esta seleção.
            </div>
            <div class="form-text text-muted mt-2 intensity-hint-enabled">
              Valores textuais da escala de Saaty (sem conversão numérica).
            </div>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

/**
 * Configura listeners de eventos para atualização dinâmica dos textos e progresso
 */
function setupEventListeners(pairs) {
  pairs.forEach((pair) => {
    const { pairKey } = pair;
    const radios = document.querySelectorAll(`input[name="mais_importante_${pairKey}"]`);
    const select = document.getElementById(`select_intensidade_${pairKey}`);
    const label = document.getElementById(`label_intensidade_${pairKey}`);
    const card = document.getElementById(`card_${pairKey}`);
    const statusBadge = document.getElementById(`status_${pairKey}`);
    const intensityBlock = document.getElementById(`intensity_block_${pairKey}`);

    radios.forEach((radio) => {
      radio.addEventListener("change", function () {
        const checkedLabel = this.getAttribute("data-chosen");
        const uncheckedLabel = this.getAttribute("data-other");

        // Desbloqueia visualmente o container do select
        intensityBlock.classList.remove("is-disabled");

        // Atualização dinâmica do texto solicitada:
        // "O quão mais importante o critério {radio_checked_label} é mais importante que {radio_unchecked_label}?"
        label.innerHTML = `<i class="bi bi-unlock-fill me-1 text-primary"></i> O quão mais importante o critério <span class="highlight-crit">${checkedLabel}</span> é mais importante que <span class="highlight-crit">${uncheckedLabel}</span>?`;

        // Habilita o select
        select.disabled = false;
        if (!select.value) {
          select.options[0].textContent = "Selecione a opção de importância...";
        }

        checkPairCompletion(pairKey, card, statusBadge, select);
        updateProgress(pairs);
      });
    });

    select.addEventListener("change", function () {
      checkPairCompletion(pairKey, card, statusBadge, select);
      updateProgress(pairs);
    });
  });
}

/**
 * Verifica se um par está completamente respondido
 */
function checkPairCompletion(pairKey, card, statusBadge, select) {
  const radioChecked = document.querySelector(`input[name="mais_importante_${pairKey}"]:checked`);
  const selectValue = select.value;

  if (radioChecked && selectValue) {
    card.classList.add("is-completed");
    statusBadge.textContent = "Respondido ✓";
    statusBadge.className = "badge bg-success badge-status";
  } else if (radioChecked) {
    card.classList.remove("is-completed");
    statusBadge.textContent = "Selecione a intensidade";
    statusBadge.className = "badge bg-warning text-dark badge-status";
  } else {
    card.classList.remove("is-completed");
    statusBadge.textContent = "Pendente";
    statusBadge.className = "badge bg-light text-secondary border badge-status";
  }
}

/**
 * Localiza o primeiro par não respondido
 */
function findFirstIncompletePair(pairs) {
  for (const pair of pairs) {
    const radioChecked = document.querySelector(`input[name="mais_importante_${pair.pairKey}"]:checked`);
    const select = document.getElementById(`select_intensidade_${pair.pairKey}`);
    if (!radioChecked || !select || !select.value) {
      return pair;
    }
  }
  return null;
}

/**
 * Atualiza a barra de progresso no topo usando a variável CSS --progress-percentage
 */
function updateProgress(pairs) {
  let completedCount = 0;
  pairs.forEach((pair) => {
    const radioChecked = document.querySelector(`input[name="mais_importante_${pair.pairKey}"]:checked`);
    const select = document.getElementById(`select_intensidade_${pair.pairKey}`);
    if (radioChecked && select && select.value) {
      completedCount++;
    }
  });

  const percentage = Math.round((completedCount / pairs.length) * 100);
  const progressBar = document.getElementById("ahpProgressBar");
  const progressText = document.getElementById("ahpProgressText");

  // Atualiza via CSS variable (sem inline style no elemento)
  document.documentElement.style.setProperty("--progress-percentage", `${percentage}%`);

  if (progressBar) {
    progressBar.setAttribute("aria-valuenow", percentage);
  }

  if (progressText) {
    progressText.textContent = `${completedCount} de ${pairs.length} comparações concluídas (${percentage}%)`;
  }
}

/**
 * Exibe alertas de validação para o usuário
 */
function showAlert(message, type = "danger") {
  const alertContainer = document.getElementById("validationAlert");
  if (!alertContainer) return;

  alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show shadow-sm" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
  alertContainer.scrollIntoView({ behavior: "smooth", block: "center" });
}

/**
 * Submete o formulário à API (Web3Forms) com suporte a feedback assíncrono
 */
function submitSurveyForm(form) {
  const submitBtn = document.getElementById("submitBtn");
  const originalBtnText = submitBtn.innerHTML;

  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
    Enviando respostas...
  `;

  const formData = new FormData(form);
  const object = Object.fromEntries(formData.entries());
  const json = JSON.stringify(object);

  fetch(form.action, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: json
  })
    .then(async (response) => {
      let data = null;
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        if (text.includes("Form submitted successfully") || text.includes("success") || response.status === 200) {
          data = { success: true };
        }
      }

      if (response.ok && (data?.success === true || response.status === 200)) {
        showSuccessModal();
      } else {
        form.submit();
      }
    })
    .catch((error) => {
      console.warn("AJAX submit fallback to native POST:", error);
      form.submit();
    })
    .finally(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    });
}

/**
 * Exibe modal de confirmação de envio bem-sucedido
 */
function showSuccessModal() {
  const successModalElement = document.getElementById("successModal");
  if (successModalElement && typeof bootstrap !== "undefined") {
    const modal = new bootstrap.Modal(successModalElement);
    modal.show();
  } else {
    alert("Respostas enviadas com sucesso! Muito obrigado pela sua contribuição.");
  }
}
