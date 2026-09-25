/**
 * Lógica da Aplicação de Pesquisa Fuzzy-AHP
 * Gerenciamento de Stepper Multi-Etapas com Nomes de Critérios e Subcritérios,
 * Renderização em Matriz Compacta, Validação e Persistência em Local Storage
 * (100% sem inline styles no HTML - manipulação via CSS variables e classes)
 */

document.addEventListener("DOMContentLoaded", function () {
  const STORAGE_KEY = "ahp_cave_survey_progress_data";

  let currentStep = 1;
  const totalSteps = SURVEY_STEPS.length;
  const allPairs = getAllSurveyPairs();

  // Elementos globais do DOM
  const form = document.getElementById("ahpForm");
  const stepperTrack = document.getElementById("stepperTrack");
  const progressBar = document.getElementById("ahpProgressBar");
  const progressText = document.getElementById("ahpProgressText");
  const currentStepBadge = document.getElementById("currentStepBadge");
  const currentStepName = document.getElementById("currentStepName");
  const validationAlert = document.getElementById("validationAlert");
  const saveStatusText = document.getElementById("saveStatusText");
  const saveStatusIcon = document.getElementById("saveStatusIcon");
  const confirmResetBtn = document.getElementById("confirmResetBtn");

  // 1. Renderizar os botões do Stepper com nome dos critérios/subcritérios
  renderStepperPills();

  // 2. Renderizar as matrizes de comparação para as etapas 2 a 8
  renderAllComparisonMatrices();

  // 3. Inicializar event listeners nos inputs cadastrais e paritários
  setupComparisonEventListeners();
  setupEvaluatorAutoSave();

  // 4. Inicializar navegação entre steps e botão de reset
  setupNavigationEventListeners();
  setupResetListener();

  // Verifica se o questionário acabou de ser resetado para exibir mensagem de sucesso
  if (sessionStorage.getItem("ahp_survey_just_reset") === "true") {
    sessionStorage.removeItem("ahp_survey_just_reset");
    showAlert("O questionário e os dados do navegador foram resetados com sucesso!", "success");
  }

  // 5. Restaurar progresso prévio salvo em Local Storage (se houver)
  const wasRestored = loadProgressFromLocalStorage();

  // 6. Atualizar progresso inicial
  updateAllProgress();

  // 7. Atualizar resumo inicial
  updateReviewSummary();

  /**
   * Renderiza os 9 botões do Stepper horizontal com nomes reais de critérios e subcritérios
   */
  function renderStepperPills() {
    if (!stepperTrack) return;
    let html = "";

    SURVEY_STEPS.forEach((step) => {
      const isActive = step.stepIndex === 1 ? "active" : "";
      html += `
        <button type="button" 
                class="stepper-nav-btn ${isActive}" 
                id="stepperPill_${step.stepIndex}" 
                data-step-index="${step.stepIndex}"
                title="${step.title}">
          <div class="stepper-badge-wrap">
            <span class="stepper-code-badge ${step.badgeClass || ''}" id="pillNum_${step.stepIndex}">
              ${step.codeBadge}
            </span>
          </div>
          <div class="stepper-text-wrap">
            <span class="stepper-cat-label">${step.category}</span>
            <span class="stepper-name-label">${step.navTitle}</span>
          </div>
          <div class="stepper-check-indicator" id="stepperCheck_${step.stepIndex}"></div>
        </button>
      `;
    });

    stepperTrack.innerHTML = html;

    // Listener para navegação ao clicar nos botões do stepper
    const pills = stepperTrack.querySelectorAll(".stepper-nav-btn");
    pills.forEach((pill) => {
      pill.addEventListener("click", function () {
        const targetStep = parseInt(this.getAttribute("data-step-index"), 10);
        if (targetStep === currentStep) return;

        // O usuário precisa responder a etapa 1 antes de avançar para as demais
        if (targetStep > 1 && !validateEvaluatorData()) {
          goToStep(1);
          return;
        }

        // Navegação livre entre as etapas 2 a 9 (ordem não fixada)
        goToStep(targetStep);
      });
    });
  }

  /**
   * Renderiza os cards compactos em matriz para todas as etapas de comparação
   */
  function renderAllComparisonMatrices() {
    SURVEY_STEPS.forEach((step) => {
      if (step.type === "comparisons" && Array.isArray(step.pairs)) {
        const matrixContainer = document.getElementById(`matrixContainer_step_${step.stepIndex}`);
        if (matrixContainer) {
          renderMatrixCards(step.pairs, matrixContainer, step);
        }
      }
    });
  }

  /**
   * Renderiza os cards de uma etapa específica em formato de matriz
   */
  function renderMatrixCards(pairs, container, step) {
    let html = "";

    pairs.forEach((pair) => {
      const { index, crit1, crit2, pairKey } = pair;
      const themeCode1 = (crit1.parentCode || crit1.code).toLowerCase();
      const themeCode2 = (crit2.parentCode || crit2.code).toLowerCase();

      html += `
        <div class="criteria-card-item" id="card_${pairKey}" data-pair="${pairKey}">
          <!-- Cabeçalho Compacto do Card -->
          <div class="criteria-card-header">
            <span class="card-pair-badge">
              <i class="bi bi-shuffle me-1"></i>Par ${index} de ${pairs.length}
            </span>
            <span class="badge bg-light text-secondary border badge-status" id="status_${pairKey}">
              Pendente
            </span>
          </div>

          <!-- Corpo Compacto do Card -->
          <div class="criteria-card-body">
            <!-- Pergunta 1: Rádios Seletores Compactos -->
            <div>
              <div class="pair-card-subtitle">1. Qual critério é mais relevante?</div>
              <div class="pair-radio-grid">
                <!-- Opção 1 -->
                <label class="custom-radio-compact" title="${crit1.description || crit1.fullName}">
                  <input type="radio" 
                         name="mais_importante_${pairKey}" 
                         value="${crit1.fullName}" 
                         data-pair="${pairKey}"
                         data-chosen-code="${crit1.code}"
                         data-chosen="${crit1.fullName}" 
                         data-other="${crit2.fullName}"
                         required>
                  <div class="radio-pill">
                    <span class="radio-indicator-dot"></span>
                    <div class="radio-text-label">
                      <span class="badge badge-criteria-${themeCode1}">${crit1.code}</span>
                      <span class="text-truncate">${crit1.name}</span>
                    </div>
                  </div>
                </label>

                <!-- Opção 2 -->
                <label class="custom-radio-compact" title="${crit2.description || crit2.fullName}">
                  <input type="radio" 
                         name="mais_importante_${pairKey}" 
                         value="${crit2.fullName}" 
                         data-pair="${pairKey}"
                         data-chosen-code="${crit2.code}"
                         data-chosen="${crit2.fullName}" 
                         data-other="${crit1.fullName}"
                         required>
                  <div class="radio-pill">
                    <span class="radio-indicator-dot"></span>
                    <div class="radio-text-label">
                      <span class="badge badge-criteria-${themeCode2}">${crit2.code}</span>
                      <span class="text-truncate">${crit2.name}</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <!-- Pergunta 2: Intensidade (Escala Verbal de Saaty) -->
            <div class="intensity-block is-disabled" id="intensity_block_${pairKey}">
              <label class="dynamic-question-label" id="label_intensidade_${pairKey}">
                <i class="bi bi-lock-fill me-1 text-muted"></i> 2. Grau de superioridade:
              </label>
              <select class="form-select form-select-sm saaty-select" 
                      id="select_intensidade_${pairKey}" 
                      name="intensidade_saaty_${pairKey}" 
                      disabled 
                      required>
                <option value="" disabled selected>Selecione a prioridade acima...</option>
                ${SAATY_SCALE_OPTIONS.map((opt) => `<option value="${opt}">${opt}</option>`).join("")}
              </select>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  /**
   * Configura listeners de alteração nos inputs de comparação e auto-salvamento
   */
  function setupComparisonEventListeners() {
    allPairs.forEach((pair) => {
      const { pairKey } = pair;
      const radios = document.querySelectorAll(`input[name="mais_importante_${pairKey}"]`);
      const select = document.getElementById(`select_intensidade_${pairKey}`);
      const label = document.getElementById(`label_intensidade_${pairKey}`);
      const card = document.getElementById(`card_${pairKey}`);
      const statusBadge = document.getElementById(`status_${pairKey}`);
      const intensityBlock = document.getElementById(`intensity_block_${pairKey}`);

      radios.forEach((radio) => {
        radio.addEventListener("change", function () {
          const chosenCode = this.getAttribute("data-chosen-code");

          // Desbloqueia visualmente o container do select
          if (intensityBlock) {
            intensityBlock.classList.remove("is-disabled");
          }

          // Atualização dinâmica do texto
          if (label) {
            label.innerHTML = `<i class="bi bi-unlock-fill me-1 text-primary"></i> 2. Grau de superioridade de <span class="highlight-crit">${chosenCode}</span> sobre o outro:`;
          }

          // Habilita o select
          if (select) {
            select.disabled = false;
            if (!select.value) {
              select.options[0].textContent = "Selecione o grau de superioridade...";
            }
          }

          checkSinglePairCompletion(pairKey, card, statusBadge, select);
          updateAllProgress();
          updateStepCompletionText(pair.stepIndex);
          saveProgressToLocalStorage();
        });
      });

      if (select) {
        select.addEventListener("change", function () {
          checkSinglePairCompletion(pairKey, card, statusBadge, select);
          updateAllProgress();
          updateStepCompletionText(pair.stepIndex);
          saveProgressToLocalStorage();
        });
      }
    });
  }

  /**
   * Configura auto-salvamento nos campos de identificação do especialista e observações
   */
  function setupEvaluatorAutoSave() {
    const fields = ["evaluatorName", "evaluatorEmail", "evaluatorOrg", "evaluatorRole", "evaluatorNotes"];
    fields.forEach((fieldId) => {
      const el = document.getElementById(fieldId);
      if (el) {
        el.addEventListener("input", function () {
          saveProgressToLocalStorage();
          updateStepperVisual();
        });
      }
    });
  }

  /**
   * Configura o listener do botão superior de reset com modal/mensagem de confirmação
   */
  function setupResetListener() {
    const btnResetHero = document.getElementById("btnResetHero");

    if (btnResetHero) {
      btnResetHero.addEventListener("click", function (e) {
        e.preventDefault();
        const modalEl = document.getElementById("resetConfirmModal");
        if (modalEl && typeof bootstrap !== "undefined") {
          const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
          modalInstance.show();
        } else {
          // Fallback de confirmação nativa caso bootstrap não esteja inicializado
          const confirmed = window.confirm(
            "Confirmação: Tem certeza de que deseja resetar todo o questionário?\n\nTodos os dados gravados no navegador serão apagados e a página será recarregada."
          );
          if (confirmed) {
            resetAllProgress();
          }
        }
      });
    }

    if (confirmResetBtn) {
      confirmResetBtn.addEventListener("click", function () {
        resetAllProgress();
      });
    }
  }

  /**
   * Verifica o estado de preenchimento de um único par
   */
  function checkSinglePairCompletion(pairKey, card, statusBadge, select) {
    const radioChecked = document.querySelector(`input[name="mais_importante_${pairKey}"]:checked`);
    const selectValue = select ? select.value : "";

    if (radioChecked && selectValue) {
      if (card) card.classList.add("is-completed");
      if (statusBadge) {
        statusBadge.textContent = "Respondido ✓";
        statusBadge.className = "badge bg-success badge-status";
      }
    } else if (radioChecked) {
      if (card) card.classList.remove("is-completed");
      if (statusBadge) {
        statusBadge.textContent = "Defina o grau";
        statusBadge.className = "badge bg-warning text-dark badge-status";
      }
    } else {
      if (card) card.classList.remove("is-completed");
      if (statusBadge) {
        statusBadge.textContent = "Pendente";
        statusBadge.className = "badge bg-light text-secondary border badge-status";
      }
    }
  }

  /**
   * Configura listeners para os botões de avançar e voltar de cada etapa
   */
  function setupNavigationEventListeners() {
    // Botão da Etapa 1
    const btnNextStep1 = document.getElementById("btnNextStep1");
    if (btnNextStep1) {
      btnNextStep1.addEventListener("click", function () {
        if (validateEvaluatorData()) {
          goToStep(2);
        }
      });
    }

    // Botões genéricos "Avançar"
    const nextButtons = document.querySelectorAll(".btn-step-next");
    nextButtons.forEach((btn) => {
      btn.addEventListener("click", function () {
        const target = parseInt(this.getAttribute("data-target-step"), 10);

        // O usuário precisa responder a etapa 1 antes de avançar para as demais
        if (target > 1 && !validateEvaluatorData()) {
          goToStep(1);
          return;
        }

        // Navegação livre entre etapas 2 a 9 (não fixa a ordem)
        goToStep(target);
      });
    });

    // Botões genéricos "Voltar"
    const prevButtons = document.querySelectorAll(".btn-step-prev");
    prevButtons.forEach((btn) => {
      btn.addEventListener("click", function () {
        const target = parseInt(this.getAttribute("data-target-step"), 10);
        goToStep(target);
      });
    });

    // Submissão do formulário: exige 100% de todas as etapas anteriores respondidas
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();

        // 1. Validação obrigatória da Etapa 1 (Especialista)
        if (!validateEvaluatorData()) {
          goToStep(1);
          highlightStepError(1, 6000);
          return;
        }

        // 2. Validação obrigatória de todas as etapas de comparação (2 a 8) para envio
        let firstIncompleteStep = null;
        let firstIncompletePair = null;
        let totalMissing = 0;
        const incompleteStepIndexes = [];

        for (let s = 2; s <= 8; s++) {
          const stepDef = SURVEY_STEPS.find((item) => item.stepIndex === s);
          if (stepDef && stepDef.type === "comparisons" && Array.isArray(stepDef.pairs)) {
            const missingInStep = stepDef.pairs.filter((pair) => {
              const radioChecked = document.querySelector(`input[name="mais_importante_${pair.pairKey}"]:checked`);
              const select = document.getElementById(`select_intensidade_${pair.pairKey}`);
              return !radioChecked || !select || !select.value;
            });

            if (missingInStep.length > 0) {
              totalMissing += missingInStep.length;
              incompleteStepIndexes.push(s);
              if (!firstIncompleteStep) {
                firstIncompleteStep = stepDef;
                firstIncompletePair = missingInStep[0];
              }
            }
          }
        }

        // Se houver qualquer comparação pendente em qualquer etapa
        if (firstIncompleteStep && firstIncompletePair) {
          // Destaca com contornos vermelhos os botões de step com respostas faltantes por 6 segundos
          incompleteStepIndexes.forEach((stepIdx) => {
            highlightStepError(stepIdx, 6000);
          });

          goToStep(firstIncompleteStep.stepIndex);

          const cardElement = document.getElementById(`card_${firstIncompletePair.pairKey}`);
          showAlert(
            `Para submeter o questionário, é obrigatório responder todas as etapas anteriores. Faltam respostas na <strong>Etapa ${firstIncompleteStep.stepIndex}: ${firstIncompleteStep.title}</strong> (Total pendente: ${totalMissing} comparação(ões)).`,
            "danger"
          );

          if (cardElement) {
            cardElement.scrollIntoView({ behavior: "smooth", block: "center" });
            cardElement.classList.add("highlight-invalid-card");
            setTimeout(() => cardElement.classList.remove("highlight-invalid-card"), 6000);
          }
          return;
        }

        // Todas as etapas foram 100% respondidas -> Enviar
        submitSurveyForm(form);
      });
    }
  }

  /**
   * Aplica contorno vermelho no step com respostas pendentes durante 6 segundos
   */
  function highlightStepError(stepIndex, duration = 6000) {
    const pill = document.getElementById(`stepperPill_${stepIndex}`);
    if (pill) {
      pill.classList.add("step-error-outline");
      setTimeout(() => {
        pill.classList.remove("step-error-outline");
      }, duration);
    }
  }

  /**
   * Valida obrigatoriamente os dados do especialista (Etapa 1)
   */
  function validateEvaluatorData() {
    clearAlert();
    const nameInput = document.getElementById("evaluatorName");
    const emailInput = document.getElementById("evaluatorEmail");

    if (!nameInput || !nameInput.value.trim()) {
      showAlert("Por favor, preencha seu <strong>Nome Completo</strong> na Etapa 1 antes de prosseguir.", "warning");
      if (nameInput) nameInput.focus();
      return false;
    }

    if (!emailInput || !emailInput.value.trim() || !validateEmailFormat(emailInput.value.trim())) {
      showAlert("Por favor, preencha um <strong>E-mail válido</strong> institucional ou profissional na Etapa 1 antes de prosseguir.", "warning");
      if (emailInput) emailInput.focus();
      return false;
    }

    return true;
  }

  /**
   * Navega para a etapa informada
   */
  function goToStep(targetStep) {
    if (targetStep < 1 || targetStep > totalSteps) return;

    // Ocultar etapa atual
    const currentView = document.getElementById(`stepView_${currentStep}`);
    if (currentView) {
      currentView.classList.remove("active");
    }

    // Exibir etapa de destino
    const targetView = document.getElementById(`stepView_${targetStep}`);
    if (targetView) {
      targetView.classList.add("active");
    }

    currentStep = targetStep;
    clearAlert();

    // Atualizar visual do Stepper horizontal
    updateStepperVisual();

    // Se for o step 9 (Revisão e Submissão), atualiza o resumo
    if (currentStep === 9) {
      updateReviewSummary();
    }

    // Salva a etapa atual no Local Storage
    saveProgressToLocalStorage();

    // Scroll suave para o início do container principal
    const mainContainer = document.querySelector(".main-container");
    if (mainContainer) {
      mainContainer.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  /**
   * Atualiza as classes ativas/concluídas nos botões do Stepper
   */
  function updateStepperVisual() {
    SURVEY_STEPS.forEach((step) => {
      const pill = document.getElementById(`stepperPill_${step.stepIndex}`);
      const checkEl = document.getElementById(`stepperCheck_${step.stepIndex}`);
      if (!pill) return;

      const isCurrent = step.stepIndex === currentStep;
      let isCompleted = false;

      if (step.stepIndex === 1) {
        const nameVal = document.getElementById("evaluatorName")?.value.trim();
        const emailVal = document.getElementById("evaluatorEmail")?.value.trim();
        isCompleted = Boolean(nameVal && emailVal);
      } else if (step.type === "comparisons" && Array.isArray(step.pairs)) {
        const answeredInStep = step.pairs.filter((pair) => {
          const radio = document.querySelector(`input[name="mais_importante_${pair.pairKey}"]:checked`);
          const sel = document.getElementById(`select_intensidade_${pair.pairKey}`);
          return radio && sel && sel.value;
        }).length;
        isCompleted = answeredInStep === step.pairs.length;
      }

      pill.classList.toggle("active", isCurrent);
      pill.classList.toggle("is-completed", isCompleted);

      if (checkEl) {
        if (isCompleted) {
          checkEl.innerHTML = `<i class="bi bi-check-circle-fill"></i>`;
        } else {
          checkEl.innerHTML = "";
        }
      }
    });

    // Atualiza indicador textual no topo da barra sticky
    const currentStepDef = SURVEY_STEPS.find((s) => s.stepIndex === currentStep);
    if (currentStepBadge) {
      currentStepBadge.textContent = `Etapa ${currentStep} de ${totalSteps}`;
    }
    if (currentStepName && currentStepDef) {
      currentStepName.textContent = currentStepDef.title;
    }
  }

  /**
   * Atualiza a barra de progresso geral e o texto de progresso
   */
  function updateAllProgress() {
    let completedTotal = 0;

    allPairs.forEach((pair) => {
      const radio = document.querySelector(`input[name="mais_importante_${pair.pairKey}"]:checked`);
      const select = document.getElementById(`select_intensidade_${pair.pairKey}`);
      if (radio && select && select.value) {
        completedTotal++;
      }
    });

    const percentage = Math.round((completedTotal / allPairs.length) * 100);

    // Variável CSS customizada (100% sem inline styles no elemento HTML)
    document.documentElement.style.setProperty("--progress-percentage", `${percentage}%`);

    if (progressBar) {
      progressBar.setAttribute("aria-valuenow", percentage);
    }

    if (progressText) {
      progressText.textContent = `${completedTotal} de ${allPairs.length} comparações concluídas (${percentage}%)`;
    }

    // Atualiza botões do stepper
    updateStepperVisual();
  }

  /**
   * Atualiza o contador de respondidas no rodapé do step
   */
  function updateStepCompletionText(stepIndex) {
    const indicator = document.getElementById(`stepCompletion_${stepIndex}`);
    const stepDef = SURVEY_STEPS.find((s) => s.stepIndex === stepIndex);
    if (indicator && stepDef && Array.isArray(stepDef.pairs)) {
      const answeredInStep = stepDef.pairs.filter((pair) => {
        const radio = document.querySelector(`input[name="mais_importante_${pair.pairKey}"]:checked`);
        const sel = document.getElementById(`select_intensidade_${pair.pairKey}`);
        return radio && sel && sel.value;
      }).length;
      indicator.textContent = `${answeredInStep} de ${stepDef.pairs.length} respondidas`;
    }
  }

  /**
   * Atualiza o resumo da Etapa 9 (Revisão e Envio)
   */
  function updateReviewSummary() {
    const nameInput = document.getElementById("evaluatorName");
    const emailInput = document.getElementById("evaluatorEmail");
    const orgInput = document.getElementById("evaluatorOrg");
    const roleInput = document.getElementById("evaluatorRole");

    const summaryName = document.getElementById("summaryName");
    const summaryEmail = document.getElementById("summaryEmail");
    const summaryOrg = document.getElementById("summaryOrg");
    const summaryRole = document.getElementById("summaryRole");
    const summaryGroupsStatus = document.getElementById("summaryGroupsStatus");

    if (summaryName) summaryName.textContent = nameInput?.value.trim() || "Não informado";
    if (summaryEmail) summaryEmail.textContent = emailInput?.value.trim() || "Não informado";
    if (summaryOrg) summaryOrg.textContent = orgInput?.value.trim() || "-";
    if (summaryRole) summaryRole.textContent = roleInput?.value.trim() || "-";

    if (summaryGroupsStatus) {
      let html = "";
      SURVEY_STEPS.forEach((step) => {
        if (step.type === "comparisons" && Array.isArray(step.pairs)) {
          const totalPairs = step.pairs.length;
          const answered = step.pairs.filter((pair) => {
            const radio = document.querySelector(`input[name="mais_importante_${pair.pairKey}"]:checked`);
            const sel = document.getElementById(`select_intensidade_${pair.pairKey}`);
            return radio && sel && sel.value;
          }).length;

          const isFull = answered === totalPairs;
          const badgeClass = isFull ? "bg-success" : "bg-warning text-dark";
          const icon = isFull ? '<i class="bi bi-check-circle-fill me-1"></i>' : '<i class="bi bi-hourglass-split me-1"></i>';

          html += `
            <div class="col-md-6 mb-2">
              <button type="button" class="btn w-100 p-2 border rounded bg-light-subtle d-flex justify-content-between align-items-center review-step-btn text-start shadow-none" data-target-step="${step.stepIndex}" title="Clique para navegar até a análise de ${step.navTitle}">
                <span class="text-truncate me-2 fw-semibold text-dark">
                  <span class="badge ${step.badgeClass || 'bg-secondary'} me-1">${step.codeBadge}</span>
                  ${step.navTitle}
                </span>
                <span class="badge ${badgeClass}">${icon}${answered}/${totalPairs}</span>
              </button>
            </div>
          `;
        }
      });
      summaryGroupsStatus.innerHTML = html;

      // Listener para navegação direta a partir do resumo
      const reviewBtns = summaryGroupsStatus.querySelectorAll(".review-step-btn");
      reviewBtns.forEach((btn) => {
        btn.addEventListener("click", function () {
          const stepTarget = parseInt(this.getAttribute("data-target-step"), 10);
          if (stepTarget) {
            goToStep(stepTarget);
          }
        });
      });
    }
  }

  /**
   * Salva o estado atual do questionário em Local Storage
   */
  function saveProgressToLocalStorage() {
    try {
      const data = {
        timestamp: new Date().toISOString(),
        currentStep: currentStep,
        evaluator: {
          name: document.getElementById("evaluatorName")?.value || "",
          email: document.getElementById("evaluatorEmail")?.value || "",
          instituicao: document.getElementById("evaluatorOrg")?.value || "",
          area_atuacao: document.getElementById("evaluatorRole")?.value || "",
          message: document.getElementById("evaluatorNotes")?.value || ""
        },
        comparisons: {}
      };

      allPairs.forEach((pair) => {
        const radioChecked = document.querySelector(`input[name="mais_importante_${pair.pairKey}"]:checked`);
        const select = document.getElementById(`select_intensidade_${pair.pairKey}`);
        if (radioChecked || (select && select.value)) {
          data.comparisons[pair.pairKey] = {
            chosenValue: radioChecked ? radioChecked.value : null,
            chosenCode: radioChecked ? radioChecked.getAttribute("data-chosen-code") : null,
            otherName: radioChecked ? radioChecked.getAttribute("data-other") : null,
            intensity: select && select.value ? select.value : null
          };
        }
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      updateSaveIndicator(true);
    } catch (err) {
      console.warn("Aviso: não foi possível salvar em localStorage:", err);
    }
  }

  /**
   * Atualiza o indicador visual de salvamento automático
   */
  function updateSaveIndicator(isSaved) {
    if (!saveStatusText || !saveStatusIcon) return;
    if (isSaved) {
      saveStatusIcon.className = "bi bi-cloud-check text-success";
      saveStatusText.textContent = "Salvo localmente";
    } else {
      saveStatusIcon.className = "bi bi-arrow-repeat text-warning";
      saveStatusText.textContent = "Salvando...";
    }
  }

  /**
   * Restaura o progresso do usuário a partir da Local Storage
   */
  function loadProgressFromLocalStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;

      const data = JSON.parse(raw);
      if (!data) return false;

      // 1. Restaurar dados do especialista
      if (data.evaluator) {
        const nameInput = document.getElementById("evaluatorName");
        const emailInput = document.getElementById("evaluatorEmail");
        const orgInput = document.getElementById("evaluatorOrg");
        const roleInput = document.getElementById("evaluatorRole");
        const notesInput = document.getElementById("evaluatorNotes");

        if (nameInput && data.evaluator.name) nameInput.value = data.evaluator.name;
        if (emailInput && data.evaluator.email) emailInput.value = data.evaluator.email;
        if (orgInput && data.evaluator.instituicao) orgInput.value = data.evaluator.instituicao;
        if (roleInput && data.evaluator.area_atuacao) roleInput.value = data.evaluator.area_atuacao;
        if (notesInput && data.evaluator.message) notesInput.value = data.evaluator.message;
      }

      // 2. Restaurar comparações paritárias
      let restoredComparisons = 0;
      if (data.comparisons) {
        allPairs.forEach((pair) => {
          const saved = data.comparisons[pair.pairKey];
          if (!saved) return;

          const radios = document.querySelectorAll(`input[name="mais_importante_${pair.pairKey}"]`);
          radios.forEach((radio) => {
            if (radio.value === saved.chosenValue) {
              radio.checked = true;

              const intensityBlock = document.getElementById(`intensity_block_${pair.pairKey}`);
              const label = document.getElementById(`label_intensidade_${pair.pairKey}`);
              const select = document.getElementById(`select_intensidade_${pair.pairKey}`);
              const chosenCode = radio.getAttribute("data-chosen-code");

              if (intensityBlock) {
                intensityBlock.classList.remove("is-disabled");
              }
              if (label) {
                label.innerHTML = `<i class="bi bi-unlock-fill me-1 text-primary"></i> 2. Grau de superioridade de <span class="highlight-crit">${chosenCode}</span> sobre o outro:`;
              }
              if (select) {
                select.disabled = false;
                if (saved.intensity) {
                  select.value = saved.intensity;
                }
              }

              const card = document.getElementById(`card_${pair.pairKey}`);
              const statusBadge = document.getElementById(`status_${pair.pairKey}`);
              checkSinglePairCompletion(pair.pairKey, card, statusBadge, select);
              restoredComparisons++;
            }
          });
        });
      }

      // 3. Restaurar etapa prévia (se maior que 1)
      if (data.currentStep && data.currentStep > 1 && data.currentStep <= totalSteps) {
        goToStep(data.currentStep);
      }

      // Se algo relevante foi restaurado, exibe aviso informativo
      if (restoredComparisons > 0 || (data.evaluator && data.evaluator.name)) {
        showRestoredNotification(restoredComparisons);
      }

      return true;
    } catch (err) {
      console.warn("Erro ao restaurar progresso de localStorage:", err);
      return false;
    }
  }

  /**
   * Exibe alerta sutil de progresso restaurado
   */
  function showRestoredNotification(count) {
    if (!validationAlert) return;
    validationAlert.innerHTML = `
      <div class="alert alert-info alert-dismissible fade show shadow-sm py-2 px-3 small d-flex justify-content-between align-items-center" role="alert">
        <div>
          <i class="bi bi-cloud-check-fill me-2 text-primary"></i>
          <strong>Progresso restaurado:</strong> Suas respostas anteriores (${count} comparações) foram recuperadas do armazenamento local do navegador.
        </div>
        <button type="button" class="btn-close py-2" data-bs-dismiss="alert" aria-label="Fechar"></button>
      </div>
    `;
  }

  /**
   * Exclui o progresso da Local Storage e reinicia o formulário e o navegador
   */
  function resetAllProgress() {
    try {
      localStorage.clear();
      sessionStorage.clear();
      sessionStorage.setItem("ahp_survey_just_reset", "true");
    } catch (err) {
      console.warn("Erro ao limpar storage:", err);
    }

    if (form) {
      try {
        form.reset();
      } catch (e) {}
    }

    // Fecha o modal de confirmação caso aberto
    const modalEl = document.getElementById("resetConfirmModal");
    if (modalEl && typeof bootstrap !== "undefined") {
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) modalInstance.hide();
    }

    // Recarrega o navegador do zero no endereço limpo
    window.location.href = window.location.pathname;
  }

  /**
   * Envia o formulário com dados via Web3Forms
   */
  function submitSurveyForm(formElement) {
    const submitBtn = document.getElementById("submitBtn");
    const originalBtnText = submitBtn.innerHTML;

    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      Enviando todas as avaliações...
    `;

    const formData = new FormData(formElement);
    const object = Object.fromEntries(formData.entries());
    const json = JSON.stringify(object);

    fetch(formElement.action, {
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
          // Limpa o LocalStorage para permitir novo preenchimento posterior limpo
          try {
            localStorage.removeItem(STORAGE_KEY);
          } catch (e) {}

          showSuccessModal();
        } else {
          formElement.submit();
        }
      })
      .catch((error) => {
        console.warn("AJAX submit fallback to native POST:", error);
        formElement.submit();
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

  /**
   * Exibe alertas de validação no container global
   */
  function showAlert(message, type = "danger") {
    if (!validationAlert) return;

    validationAlert.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show shadow-sm" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
    validationAlert.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function clearAlert() {
    if (validationAlert) {
      validationAlert.innerHTML = "";
    }
  }

  function validateEmailFormat(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
});
