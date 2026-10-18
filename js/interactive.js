/**
 * KINETIQ AI - Interactive Controllers & Dynamic Components
 * Handles: Before/After Slider, AI Coach Simulator, SaaS Dashboard Logic,
 * Program Catalog Filters, Pricing Toggle, Contact Form Validation.
 */

document.addEventListener('DOMContentLoaded', () => {
  initTransformationSlider();
  initAICoachChat();
  initDashboardController();
  initProgramCatalog();
  initPricingToggle();
  initContactForm();
});

/* --------------------------------------------------------------------------
   1. Dual-Handle Before/After Transformation Slider
   -------------------------------------------------------------------------- */
function initTransformationSlider() {
  const container = document.querySelector('.comparison-slider');
  if (!container) return;

  const overlay = container.querySelector('.comparison-overlay');
  const handle = container.querySelector('.slider-handle');
  if (!overlay || !handle) return;

  let isDragging = false;

  const updatePosition = (clientX) => {
    const rect = container.getBoundingClientRect();
    let x = clientX - rect.left;
    if (x < 0) x = 0;
    if (x > rect.width) x = rect.width;

    const percentage = (x / rect.width) * 100;
    overlay.style.width = `${percentage}%`;
    handle.style.left = `${percentage}%`;
  };

  handle.addEventListener('mousedown', () => { isDragging = true; });
  window.addEventListener('mouseup', () => { isDragging = false; });
  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    updatePosition(e.clientX);
  });

  // Touch support for mobile devices
  handle.addEventListener('touchstart', () => { isDragging = true; }, { passive: true });
  window.addEventListener('touchend', () => { isDragging = false; });
  window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    updatePosition(e.touches[0].clientX);
  }, { passive: true });

  // Container click directly jumps handle
  container.addEventListener('click', (e) => {
    updatePosition(e.clientX);
  });
}

/* --------------------------------------------------------------------------
   2. Interactive AI Coach (ARIA) Chat Simulator
   -------------------------------------------------------------------------- */
function initAICoachChat() {
  const chatContainer = document.querySelector('.chat-messages-container');
  const chatForm = document.querySelector('.chat-input-bar');
  const chatInput = document.querySelector('.chat-input-field');
  const promptChips = document.querySelectorAll('.prompt-chip');

  if (!chatContainer) return;

  const responses = {
    sleep: {
      text: "Based on your Oura sync, your HRV dropped 18% and deep sleep was only 48 minutes last night. I have auto-regulated today's Heavy Squats: reducing intensity by 10%, cutting 1 working set, and shifting load toward posterior chain recovery.",
      badge: "ARIA Biometric Auto-Regulation",
      detail: "Squat load adjusted: 140kg → 125kg · Rest interval +45s · Pre-workout hydration +500ml sodium electrolyte"
    },
    quick: {
      text: "Here is your high-density 35-minute Hypertrophy protocol optimized for dumbbells:",
      badge: "Target: Upper Torso & Delts",
      detail: "1. DB Incline Press (4 sets x 8-10, RPE 8)\n2. Chest-Supported DB Row (4 sets x 10-12)\n3. Lean-Away DB Lateral Raise (3 sets x 15, myo-reps)\n4. Incline DB Bicep Curl (3 sets x 12)"
    },
    nutrition: {
      text: "To hit your target 195g protein and optimize mTOR protein synthesis post-session, here is your personalized metabolic refuel blueprint:",
      badge: "Post-Workout Nutritional Prescription",
      detail: "• 45g Whey Isolate / Plant Blend + 5g Creatine Creapure\n• 75g Complex Carbs (Jasmine rice + blueberries)\n• 400mg Magnesium Glycinate for cortisol suppression"
    },
    default: {
      text: "Analyzing your metabolic markers and strain profile... Your neural readiness is at 94%. Today's physiological window is primed for maximal power output.",
      badge: "Neural Readiness Summary",
      detail: "CNS Fatigue: Low · Glycogen Level: 92% · Recommended Window: 17:00 - 19:30"
    }
  };

  function appendMessage(sender, text, cardData = null) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender}`;

    if (sender === 'user') {
      bubble.textContent = text;
      chatContainer.appendChild(bubble);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    } else {
      // Simulate live typing
      const textWrapper = document.createElement('div');
      bubble.appendChild(textWrapper);
      chatContainer.appendChild(bubble);

      let i = 0;
      const speed = 18;
      const typeInterval = setInterval(() => {
        textWrapper.textContent += text.charAt(i);
        i++;
        chatContainer.scrollTop = chatContainer.scrollHeight;
        if (i >= text.length) {
          clearInterval(typeInterval);
          if (cardData) {
            const card = document.createElement('div');
            card.className = 'ai-recommendation-card';
            card.innerHTML = `
              <div class="ai-card-title">${cardData.badge}</div>
              <div style="font-size: 0.88rem; color: #cbd5e1; white-space: pre-line; line-height: 1.6;">${cardData.detail}</div>
            `;
            bubble.appendChild(card);
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }
        }
      }, speed);
    }
  }

  // Handle Prompt Chips
  promptChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const type = chip.getAttribute('data-prompt');
      const userText = chip.textContent.trim();
      appendMessage('user', userText);

      setTimeout(() => {
        const resp = responses[type] || responses.default;
        appendMessage('ai', resp.text, resp);
      }, 500);
    });
  });

  // Handle Input submission
  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = chatInput.value.trim();
      if (!val) return;

      appendMessage('user', val);
      chatInput.value = '';

      setTimeout(() => {
        let resp = responses.default;
        const lower = val.toLowerCase();
        if (lower.includes('sleep') || lower.includes('tired') || lower.includes('hrv')) {
          resp = responses.sleep;
        } else if (lower.includes('quick') || lower.includes('minute') || lower.includes('workout')) {
          resp = responses.quick;
        } else if (lower.includes('protein') || lower.includes('diet') || lower.includes('food')) {
          resp = responses.nutrition;
        }
        appendMessage('ai', resp.text, resp);
      }, 600);
    });
  }
}

/* --------------------------------------------------------------------------
   3. SaaS Dashboard Preview Controller
   -------------------------------------------------------------------------- */
function initDashboardController() {
  const timeBtns = document.querySelectorAll('.time-range-btn');
  const tasks = document.querySelectorAll('.workout-task-item');
  const calorieVal = document.querySelector('[data-dash-calories]');
  const strainVal = document.querySelector('[data-dash-strain]');
  const recoveryVal = document.querySelector('[data-dash-recovery]');
  const pillars = document.querySelectorAll('.chart-bar-pillar');

  // Time Range toggling
  timeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      timeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const range = btn.getAttribute('data-range');
      if (range === 'today') {
        if (calorieVal) calorieVal.textContent = '2,410 kcal';
        if (strainVal) strainVal.textContent = '14.2';
        if (recoveryVal) recoveryVal.textContent = '94%';
        setPillarHeights([70, 45, 85, 95, 60, 40, 80]);
      } else if (range === 'week') {
        if (calorieVal) calorieVal.textContent = '18,240 kcal';
        if (strainVal) strainVal.textContent = '15.6 avg';
        if (recoveryVal) recoveryVal.textContent = '88% avg';
        setPillarHeights([85, 90, 75, 100, 65, 80, 95]);
      } else if (range === 'month') {
        if (calorieVal) calorieVal.textContent = '74,800 kcal';
        if (strainVal) strainVal.textContent = '16.1 avg';
        if (recoveryVal) recoveryVal.textContent = '91% avg';
        setPillarHeights([60, 75, 80, 90, 85, 95, 100]);
      }
      if (window.showToast) {
        showToast(`Dashboard refreshed for: ${range.toUpperCase()}`);
      }
    });
  });

  function setPillarHeights(heights) {
    pillars.forEach((pillar, i) => {
      if (heights[i]) {
        pillar.style.height = `${heights[i]}%`;
      }
    });
  }

  // Interactive Workout Checklist
  tasks.forEach(task => {
    task.addEventListener('click', () => {
      task.classList.toggle('completed');
      const isDone = task.classList.contains('completed');
      const taskName = task.querySelector('.task-name').textContent;

      if (isDone && window.showToast) {
        showToast(`Completed: ${taskName} (+180 kcal logged)`);
      }
    });
  });
}

/* --------------------------------------------------------------------------
   4. Filterable Program Catalog & Syllabus Modal
   -------------------------------------------------------------------------- */
function initProgramCatalog() {
  const filterBtns = document.querySelectorAll('.program-filter-btn');
  const programCards = document.querySelectorAll('.program-catalog-card');
  const searchInput = document.querySelector('.program-search-input');

  if (!programCards.length) return;

  function filterPrograms() {
    const activeBtn = document.querySelector('.program-filter-btn.active');
    const selectedCategory = activeBtn ? activeBtn.getAttribute('data-category') : 'all';
    const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';

    programCards.forEach(card => {
      const cardCategory = card.getAttribute('data-category');
      const cardTitle = card.querySelector('.program-title').textContent.toLowerCase();
      const cardDesc = card.querySelector('.program-desc').textContent.toLowerCase();

      const matchesCategory = (selectedCategory === 'all' || cardCategory === selectedCategory);
      const matchesSearch = !searchQuery || cardTitle.includes(searchQuery) || cardDesc.includes(searchQuery);

      if (matchesCategory && matchesSearch) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterPrograms();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', filterPrograms);
  }

  // Program Detail Syllabus Modal data binding
  document.querySelectorAll('[data-preview-program]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = btn.closest('.program-catalog-card');
      if (!card) return;

      const title = card.querySelector('.program-title').textContent;
      const desc = card.querySelector('.program-desc').textContent;
      const modal = document.getElementById('program-syllabus-modal');

      if (modal) {
        const modalTitle = modal.querySelector('.modal-program-title');
        const modalDesc = modal.querySelector('.modal-program-desc');
        if (modalTitle) modalTitle.textContent = title;
        if (modalDesc) modalDesc.textContent = desc;
        openModal('program-syllabus-modal');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   5. Pricing Billing Toggle (Monthly / Annual)
   -------------------------------------------------------------------------- */
function initPricingToggle() {
  const toggleWrapper = document.querySelector('.pricing-toggle-btn');
  const options = document.querySelectorAll('.pricing-toggle-btn .toggle-option');
  const priceElements = document.querySelectorAll('[data-price-monthly]');
  const periodElements = document.querySelectorAll('.plan-cycle');

  if (!toggleWrapper) return;

  options.forEach(option => {
    option.addEventListener('click', () => {
      options.forEach(opt => opt.classList.remove('active'));
      option.classList.add('active');

      const isAnnual = option.getAttribute('data-period') === 'annual';

      priceElements.forEach(priceEl => {
        const monthly = priceEl.getAttribute('data-price-monthly');
        const annual = priceEl.getAttribute('data-price-annual');

        priceEl.style.opacity = '0';
        priceEl.style.transform = 'translateY(-6px)';

        setTimeout(() => {
          priceEl.textContent = isAnnual ? annual : monthly;
          priceEl.style.opacity = '1';
          priceEl.style.transform = 'translateY(0)';
        }, 150);
      });

      periodElements.forEach(p => {
        p.textContent = isAnnual ? '/ month, billed annually' : '/ month, billed monthly';
      });
    });
  });
}

/* --------------------------------------------------------------------------
   6. Contact & Enterprise Demo Booking Form
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contact-inquiry-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    // Loading state
    submitBtn.innerHTML = `
      <span style="display:inline-block; width:16px; height:16px; border:2px solid #07080b; border-top-color:transparent; border-radius:50%; animation: spin 0.6s linear infinite;"></span>
      Processing Concierge Request...
    `;
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      form.reset();

      if (window.showToast) {
        showToast('Inquiry received! A Kinetiq Performance Director will contact you within 4 hours.');
      }
    }, 1200);
  });
}
