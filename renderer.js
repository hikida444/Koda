// Detect Platform and add class to body
if (navigator.userAgent.includes('Mac')) {
  document.body.classList.add('platform-mac');
}


// Dynamic Time-of-Day Quotes Database
const quotes = {
  morning: [
    "Хорошее утро, чтобы начать что-то новое.",
    "Свари кофе и давай сделаем первый шаг.",
    "Сегодня — чистый лист. С чего начнем?",
    "Утренний фокус задает ритм всему дню.",
    "Привет! Время настроить свой фокус."
  ],
  afternoon: [
    "Хороший день, чтобы позаниматься.",
    "Время войти в состояние потока.",
    "Фокусируемся на главном, не спеша.",
    "Твой прогресс создается прямо сейчас.",
    "Один шаг за другим. У тебя всё получится."
  ],
  evening: [
    "Вечерний фокус приносит лучшие идеи.",
    "Продуктивный вечер перед заслуженным отдыхом.",
    "Учеба в тишине — особенная магия.",
    "Отличный момент, чтобы подвести итоги дня.",
    "Спокойный фокус. Только ты и твоя задача."
  ]
};

// Get Contextual Quote based on Current Hour
function getContextQuote() {
  const hour = new Date().getHours();
  let category = 'afternoon';
  
  if (hour >= 5 && hour < 12) {
    category = 'morning';
  } else if (hour >= 12 && hour < 18) {
    category = 'afternoon';
  } else {
    category = 'evening';
  }
  
  const list = quotes[category];
  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex];
}

// Generate Beautiful SVG Gradient Avatars
const presetGradients = [
  { name: 'Неон', from: '#00f2fe', to: '#7f00ff' },
  { name: 'Персик', from: '#f6d365', to: '#fda085' },
  { name: 'Мята', from: '#d4fc79', to: '#96e6a1' },
  { name: 'Мечта', from: '#a1c4fd', to: '#c2e9fb' },
  { name: 'Закат', from: '#ff9a9e', to: '#fecfef' },
  { name: 'Лагуна', from: '#84fab0', to: '#8fd3f4' }
];

function generateGradientSVG(from, to) {
  return `<svg viewBox="0 0 100 100" width="100%" height="100%">
    <defs>
      <linearGradient id="grad-${from.replace('#', '')}-${to.replace('#', '')}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${from}" />
        <stop offset="100%" stop-color="${to}" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="50" fill="url(#grad-${from.replace('#', '')}-${to.replace('#', '')})" />
  </svg>`;
}

// State variables
let tempUsername = '';
let tempAvatarData = ''; // Base64 or Gradient ID

// Theme Toggle Handler
const drawerThemeToggle = document.getElementById('drawer-theme-toggle');
const drawerTrayToggle = document.getElementById('drawer-tray-toggle');

if (drawerThemeToggle) {
  // Wait for initial theme to be set in DOMContentLoaded before setting checked state
  drawerThemeToggle.addEventListener('change', (e) => {
    const isDark = e.target.checked;
    if (isDark) {
      document.body.classList.remove('light-theme');
      localStorage.setItem('koda_theme', 'dark');
    } else {
      document.body.classList.add('light-theme');
      localStorage.setItem('koda_theme', 'light');
    }
  });
}

if (drawerTrayToggle) {
  drawerTrayToggle.addEventListener('change', (e) => {
    localStorage.setItem('koda_tray_timer', e.target.checked ? 'true' : 'false');
    // Force update tray timer if running
    if (isTimerRunning) {
      updateTimerDisplay();
    }
  });
}

// ONBOARDING CONTROLLER


document.addEventListener('DOMContentLoaded', () => {
  // Theme is applied instantly in index.html <script> to prevent flash.
  // Sync drawer toggle switch state with current theme
  if (drawerThemeToggle) {
    drawerThemeToggle.checked = !document.body.classList.contains('light-theme');
  }
  if (drawerTrayToggle) {
    drawerTrayToggle.checked = localStorage.getItem('koda_tray_timer') === 'true';
  }

  const savedName = localStorage.getItem('koda_user_name');
  const savedAvatar = localStorage.getItem('koda_user_avatar');
  const savedCategories = localStorage.getItem('koda_user_categories');

  if (savedName && savedAvatar && savedCategories) {
    // Show boot splash for existing user
    showScreen('screen-boot');
    document.getElementById('splash-greeting').textContent = `Хорошего дня, ${savedName}!`;
    
    // Prepare main screen data in background
    setupMainScreen(savedName, savedAvatar, false, true);
    
    // Trigger text fade up animation
    setTimeout(() => {
      const greeting = document.getElementById('splash-greeting');
      if(greeting) {
        greeting.style.opacity = '1';
        greeting.style.transform = 'translateY(0)';
      }
    }, 100);
    
    setTimeout(() => {
      const bootScreen = document.getElementById('screen-boot');
      bootScreen.style.opacity = '0';
      
      // Resize window right before switching to main screen
      if (window.electronAPI) {
        window.electronAPI.resizeWindow(400, 680, false);
      }
      
      setTimeout(() => {
        showScreen('screen-main');
        bootScreen.style.opacity = ''; // clear inline style to let CSS hide it
      }, 500);
    }, 1500);
  } else {
    // New user (Registration): Show boot splash, then go to name entry
    if (window.electronAPI) {
      window.electronAPI.resizeWindow(380, 480, false);
    }
    showScreen('screen-boot');
    const greeting = document.getElementById('splash-greeting');
    if (greeting) {
      greeting.textContent = 'Добро пожаловать!';
      setTimeout(() => {
        greeting.style.opacity = '1';
        greeting.style.transform = 'translateY(0)';
      }, 100);
    }
    
    setTimeout(() => {
      showScreen('screen-name');
    }, 2500);
  }
});

// Screen Switcher
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

// NAME ONBOARDING LOGIC
const usernameInput = document.getElementById('input-username');
const btnNextName = document.getElementById('btn-next-name');

usernameInput.addEventListener('input', () => {
  const value = usernameInput.value.trim();
  if (value.length > 0) {
    btnNextName.removeAttribute('disabled');
  } else {
    btnNextName.setAttribute('disabled', 'true');
  }
});

btnNextName.addEventListener('click', () => {
  tempUsername = usernameInput.value.trim();
  if (tempUsername) {
    showScreen('screen-avatar');
    initAvatarScreen();
  }
});

// AVATAR PICKER LOGIC
const avatarCarousel = document.getElementById('avatar-carousel');
const btnNextAvatar = document.getElementById('btn-next-avatar');
const btnFinishOnboarding = document.getElementById('btn-finish-onboarding');
const fileUploader = document.getElementById('file-uploader');
const btnUploadAvatar = document.getElementById('btn-upload-avatar');

function initAvatarScreen() {
  // Remove existing presets to prevent duplication
  const presets = avatarCarousel.querySelectorAll('.preset-item');
  presets.forEach(p => p.remove());

  // Inject gradient presets
  presetGradients.forEach((grad, index) => {
    const item = document.createElement('div');
    item.className = 'avatar-item preset-item';
    item.dataset.index = index;
    item.dataset.type = 'preset';
    
    const svgHTML = generateGradientSVG(grad.from, grad.to);
    
    item.innerHTML = `
      <div class="avatar-circle">
        ${svgHTML}
      </div>
      <span class="avatar-label">${grad.name}</span>
    `;

    item.addEventListener('click', () => {
      selectAvatar(item, `preset:${index}`);
    });

    avatarCarousel.appendChild(item);
  });
}

// Handle Custom File Upload Click
btnUploadAvatar.addEventListener('click', () => {
  fileUploader.click();
});

fileUploader.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target.result;
      
      // Update the upload circle to show the uploaded image
      const circle = btnUploadAvatar.querySelector('.avatar-circle');
      circle.innerHTML = `<img class="avatar-img" src="${base64Data}">`;
      
      // Select the upload option
      selectAvatar(btnUploadAvatar, base64Data);
    };
    reader.readAsDataURL(file);
  }
});

function selectAvatar(element, dataValue) {
  // Unselect all items
  document.querySelectorAll('.avatar-item').forEach(item => item.classList.remove('selected'));
  
  // Select clicked item
  element.classList.add('selected');
  tempAvatarData = dataValue;
  
  // Enable finish button
  btnNextAvatar.removeAttribute('disabled');
}

// Next to Categories Screen
btnNextAvatar.addEventListener('click', () => {
  if (tempUsername && tempAvatarData) {
    showScreen('screen-categories');
  }
});

// CATEGORIES LOGIC
let selectedCategories = new Set();
const categoriesGrid = document.getElementById('categories-grid');
const customCategoryInput = document.getElementById('input-custom-category');

function updateCategoriesFinishButton() {
  if (selectedCategories.size > 0) {
    btnFinishOnboarding.removeAttribute('disabled');
  } else {
    btnFinishOnboarding.setAttribute('disabled', 'true');
  }
}

function toggleCategory(pillElement, categoryName) {
  if (selectedCategories.has(categoryName)) {
    selectedCategories.delete(categoryName);
    pillElement.classList.remove('selected');
  } else {
    selectedCategories.add(categoryName);
    pillElement.classList.add('selected');
  }
  updateCategoriesFinishButton();
}

// Preset pills click listener
document.querySelectorAll('.category-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    toggleCategory(pill, pill.dataset.category);
  });
});

// Custom category logic
customCategoryInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const val = customCategoryInput.value.trim();
    if (val && !selectedCategories.has(val)) {
      // Create a new pill
      const newPill = document.createElement('div');
      newPill.className = 'category-pill selected';
      newPill.dataset.category = val;
      newPill.innerText = val;
      
      newPill.addEventListener('click', () => toggleCategory(newPill, val));
      
      categoriesGrid.appendChild(newPill);
      selectedCategories.add(val);
      updateCategoriesFinishButton();
      
      // Clear input
      customCategoryInput.value = '';
    }
  }
});

// Finish Onboarding
btnFinishOnboarding.addEventListener('click', () => {
  if (tempUsername && tempAvatarData && selectedCategories.size > 0) {
    localStorage.setItem('koda_user_name', tempUsername);
    localStorage.setItem('koda_user_avatar', tempAvatarData);
    localStorage.setItem('koda_user_categories', JSON.stringify(Array.from(selectedCategories)));
    
    showScreen('screen-main');
    setupMainScreen(tempUsername, tempAvatarData, true);
  }
});

// --- DASHBOARD LOGIC ---
let activeCategory = '';
let elapsedSeconds = 0;
let accumulatedSeconds = 0;
let sessionStartTime = null;
let isTimerRunning = false;
let timerInterval = null;

const dashboardTotalTime = document.getElementById('dashboard-total-time');
const dashboardCategoriesList = document.getElementById('dashboard-categories-list');

const focusCategoryLabel = document.getElementById('focus-subject');
const focusSessionTimer = document.getElementById('focus-session-timer');
const btnFocusPause = document.getElementById('btn-focus-pause');
const btnFocusExit = document.getElementById('btn-focus-exit');

function updateTimerDisplay() {
  const timeStr = formatTime(elapsedSeconds);
  if (focusSessionTimer) focusSessionTimer.innerText = timeStr;
  if (window.electronAPI) {
    const showTray = localStorage.getItem('koda_tray_timer') === 'true';
    window.electronAPI.updateTrayTimer(showTray ? timeStr : '');
  }
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getTodaySessions() {
  const sessions = JSON.parse(localStorage.getItem('koda_sessions') || '[]');
  const today = new Date().toDateString();
  return sessions.filter(s => new Date(s.date).toDateString() === today);
}

function updateDashboardData() {
  const todaySessions = getTodaySessions();
  const totalSeconds = todaySessions.reduce((sum, s) => sum + s.duration, 0);
  dashboardTotalTime.innerText = formatTime(totalSeconds);

  const cats = JSON.parse(localStorage.getItem('koda_user_categories') || '[]');
  dashboardCategoriesList.innerHTML = '';
  
  cats.forEach((cat, index) => {
    const catSeconds = todaySessions.filter(s => s.category === cat).reduce((sum, s) => sum + s.duration, 0);
    
    const li = document.createElement('li');
    li.className = 'category-row';
    li.style.opacity = '0';
    li.style.transform = 'translateY(10px)';
    li.style.transition = 'opacity 0.4s ease, transform 0.4s ease, border-color 0.5s ease, box-shadow 0.5s ease';
    
    setTimeout(() => {
      li.style.opacity = '1';
      li.style.transform = 'translateY(0)';
    }, index * 80);
    li.innerHTML = `
      <button class="category-play-btn" data-category="${cat}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      </button>
      <div class="category-name">${cat}</div>
      <div class="category-time">${formatTime(catSeconds)}</div>
    `;
    
    li.querySelector('.category-play-btn').addEventListener('click', () => {
      startFocusSession(cat);
    });
    
    dashboardCategoriesList.appendChild(li);
  });
}

function startFocusSession(category) {
  if (timerInterval) clearInterval(timerInterval);
  activeCategory = category;
  accumulatedSeconds = 0;
  elapsedSeconds = 0;
  sessionStartTime = Date.now();
  isTimerRunning = true;
  if (focusCategoryLabel) focusCategoryLabel.innerText = category;
  
  updateTimerDisplay();
  
  // Show screen
  showScreen('screen-focus');
  
  btnFocusPause.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
  
  timerInterval = setInterval(tickTimer, 1000);
}

function tickTimer() {
  if (isTimerRunning && sessionStartTime) {
    const currentRunSeconds = Math.floor((Date.now() - sessionStartTime) / 1000);
    elapsedSeconds = accumulatedSeconds + currentRunSeconds;
    updateTimerDisplay();
  }
}

btnFocusPause.addEventListener('click', () => {
  if (isTimerRunning) {
    clearInterval(timerInterval);
    isTimerRunning = false;
    if (sessionStartTime) {
      accumulatedSeconds += Math.floor((Date.now() - sessionStartTime) / 1000);
      sessionStartTime = null;
    }
    btnFocusPause.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
  } else {
    isTimerRunning = true;
    sessionStartTime = Date.now();
    btnFocusPause.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
    timerInterval = setInterval(tickTimer, 1000);
  }
});

btnFocusExit.addEventListener('click', () => {
  clearInterval(timerInterval);
  if (isTimerRunning && sessionStartTime) {
    accumulatedSeconds += Math.floor((Date.now() - sessionStartTime) / 1000);
    elapsedSeconds = accumulatedSeconds;
  }
  isTimerRunning = false;
  
  if (window.electronAPI) {
    window.electronAPI.updateTrayTimer('');
  }
  
  if (elapsedSeconds > 0) {
    const sessions = JSON.parse(localStorage.getItem('koda_sessions') || '[]');
    sessions.push({
      category: activeCategory,
      date: new Date().toISOString(),
      duration: elapsedSeconds
    });
    localStorage.setItem('koda_sessions', JSON.stringify(sessions));
  }
  
  updateDashboardData();
  showScreen('screen-main');
});

function setupMainScreen(name, avatar, isFirstTime = false, skipResize = false) {
  // Resize window for the compact vertical dashboard
  if (!skipResize && window.electronAPI) {
    window.electronAPI.resizeWindow(400, 680, false);
    window.electronAPI.updateTrayTimer('');
  }

  updateDashboardData();
}

// --- DRAWER LOGIC ---
const headerMenuBtn = document.querySelector('.header-menu-btn');
const sideDrawer = document.getElementById('side-drawer');
const drawerOverlay = document.getElementById('drawer-overlay');
const closeDrawerBtn = document.getElementById('btn-close-drawer');
const btnLogout = document.getElementById('btn-logout');

function openDrawer() {
  if (sideDrawer && drawerOverlay) {
    sideDrawer.classList.add('open');
    drawerOverlay.classList.add('active');
    
    // Populate user data
    document.getElementById('drawer-user-name').innerText = localStorage.getItem('koda_user_name') || 'Гость';
    const avatar = localStorage.getItem('koda_user_avatar');
    const avatarImg = document.getElementById('drawer-user-avatar');
    if (avatarImg && avatar) {
      if (avatar.startsWith('preset:')) {
        const index = parseInt(avatar.split(':')[1]);
        const grad = presetGradients[index];
        const svgHTML = generateGradientSVG(grad.from, grad.to);
        const wrapper = avatarImg.parentNode;
        wrapper.innerHTML = svgHTML;
        const newSvg = wrapper.querySelector('svg');
        if (newSvg) {
          newSvg.classList.add('drawer-avatar-img');
          newSvg.id = 'drawer-user-avatar';
        }
      } else {
        avatarImg.src = avatar;
      }
    }
  }
}

function closeDrawer() {
  if (sideDrawer && drawerOverlay) {
    sideDrawer.classList.remove('open');
    drawerOverlay.classList.remove('active');
  }
}

if (headerMenuBtn) headerMenuBtn.addEventListener('click', openDrawer);
if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeDrawer);
if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

if (btnLogout) {
  btnLogout.addEventListener('click', () => {
    const isConfirmed = confirm('Вы действительно хотите выйти?\n\nВнимание: Это удалит вашу статистику и сбросит профиль.');
    if (isConfirmed) {
      localStorage.clear();
      window.location.reload();
    }
  });
}

const btnGithubLink = document.getElementById('btn-github-link');
if (btnGithubLink) {
  btnGithubLink.addEventListener('click', () => {
    if (window.electronAPI && window.electronAPI.openExternal) {
      window.electronAPI.openExternal('https://github.com/hikida444/Koda');
    }
  });
}

const btnOpenEditCategories = document.getElementById('btn-open-edit-categories');
const btnCloseEdit = document.getElementById('btn-close-edit');
const btnAddNewCategory = document.getElementById('btn-add-new-category');
const editCategoriesList = document.getElementById('edit-categories-list');

if (btnOpenEditCategories) {
  btnOpenEditCategories.addEventListener('click', () => {
    showScreen('screen-edit-categories');
    renderEditCategories();
  });
}

if (btnCloseEdit) {
  btnCloseEdit.addEventListener('click', () => {
    showScreen('screen-main');
    updateDashboardData();
  });
}

function showCustomPrompt(title, defaultValue, callback) {
  const overlay = document.getElementById('prompt-overlay');
  const titleEl = document.getElementById('prompt-title');
  const inputEl = document.getElementById('prompt-input');
  const btnOk = document.getElementById('prompt-ok');
  const btnCancel = document.getElementById('prompt-cancel');
  const modal = overlay.querySelector('.prompt-modal');

  titleEl.innerText = title;
  inputEl.value = defaultValue || '';
  
  // Animate in
  overlay.style.opacity = '1';
  overlay.style.pointerEvents = 'auto';
  modal.style.opacity = '1';
  modal.style.transform = 'scale(1) translateY(0)';
  
  setTimeout(() => inputEl.focus(), 50);

  function closePrompt() {
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    modal.style.opacity = '0';
    modal.style.transform = 'scale(0.9) translateY(10px)';
  }

  // Cleanup old listeners to avoid stacking
  const newBtnOk = btnOk.cloneNode(true);
  const newBtnCancel = btnCancel.cloneNode(true);
  btnOk.parentNode.replaceChild(newBtnOk, btnOk);
  btnCancel.parentNode.replaceChild(newBtnCancel, btnCancel);

  newBtnOk.onclick = () => {
    closePrompt();
    inputEl.onkeydown = null;
    callback(inputEl.value);
  };

  newBtnCancel.onclick = () => {
    closePrompt();
    inputEl.onkeydown = null;
    callback(null);
  };

  inputEl.onkeydown = (e) => {
    if (e.key === 'Enter') newBtnOk.click();
    if (e.key === 'Escape') newBtnCancel.click();
  };
}

function renderEditCategories() {
  if (!editCategoriesList) return;
  const cats = JSON.parse(localStorage.getItem('koda_user_categories') || '[]');
  editCategoriesList.innerHTML = '';
  
  cats.forEach((cat, index) => {
    const li = document.createElement('li');
    li.className = 'edit-category-row';
    li.style.opacity = '0';
    li.style.transform = 'translateY(10px)';
    li.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    
    // Staggered animation
    setTimeout(() => {
      li.style.opacity = '1';
      li.style.transform = 'translateY(0)';
    }, index * 80);
    
    const nameDiv = document.createElement('div');
    nameDiv.className = 'edit-category-name';
    nameDiv.innerText = cat;
    
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'edit-category-actions';
    
    // Rename button
    const renameBtn = document.createElement('button');
    renameBtn.className = 'edit-action-btn';
    renameBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>';
    renameBtn.onclick = () => {
      showCustomPrompt('Новое название для сферы:', cat, (newName) => {
        if (newName && newName.trim() !== '' && newName.trim() !== cat) {
          const newCat = newName.trim();
          if (cats.includes(newCat)) {
            alert('Такая сфера уже есть.');
            return;
          }
          
          // Update in categories list
          const catIndex = cats.indexOf(cat);
          cats[catIndex] = newCat;
          localStorage.setItem('koda_user_categories', JSON.stringify(cats));
          
          // Update history sessions
          const sessions = JSON.parse(localStorage.getItem('koda_sessions') || '[]');
          sessions.forEach(s => {
            if (s.category === cat) s.category = newCat;
          });
          localStorage.setItem('koda_sessions', JSON.stringify(sessions));
          
          renderEditCategories();
        }
      });
    };
    
    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'edit-action-btn delete-btn';
    deleteBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
    deleteBtn.onclick = () => {
      if (confirm(`Удалить сферу "${cat}"? Все связанные с ней сессии (история времени) также будут удалены.`)) {
        const newCats = cats.filter(c => c !== cat);
        localStorage.setItem('koda_user_categories', JSON.stringify(newCats));
        
        const sessions = JSON.parse(localStorage.getItem('koda_sessions') || '[]');
        const newSessions = sessions.filter(s => s.category !== cat);
        localStorage.setItem('koda_sessions', JSON.stringify(newSessions));
        
        renderEditCategories();
      }
    };
    
    actionsDiv.appendChild(renameBtn);
    actionsDiv.appendChild(deleteBtn);
    
    li.appendChild(nameDiv);
    li.appendChild(actionsDiv);
    
    editCategoriesList.appendChild(li);
  });
}

if (btnAddNewCategory) {
  btnAddNewCategory.addEventListener('click', () => {
    showCustomPrompt('Введите название новой сферы:', '', (newCat) => {
      if (newCat && newCat.trim().length > 0) {
        const cats = JSON.parse(localStorage.getItem('koda_user_categories') || '[]');
        if (!cats.includes(newCat.trim())) {
          cats.push(newCat.trim());
          localStorage.setItem('koda_user_categories', JSON.stringify(cats));
          renderEditCategories();
        } else {
          alert('Такая сфера уже есть.');
        }
      }
    });
  });
}

// --- STATISTICS LOGIC ---
const btnOpenStats = document.getElementById('btn-open-stats');
const btnStatsBack = document.getElementById('btn-stats-back');

if (btnOpenStats) {
  btnOpenStats.addEventListener('click', () => {
    closeDrawer();
    generateStats();
    showScreen('screen-stats');
  });
}

if (btnStatsBack) {
  btnStatsBack.addEventListener('click', () => {
    showScreen('screen-main');
  });
}

const STATS_COLORS = ['#ff2a5f', '#00f2fe', '#f8d347', '#7f00ff', '#34C759', '#FF9500'];

let activeStatsDateStr = null;

function generateStats() {
  const sessions = JSON.parse(localStorage.getItem('koda_sessions') || '[]');
  const now = new Date();
  
  // Last 7 days labels and data
  const days = [];
  const dayTotals = {};
  for(let i=6; i>=0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const weekday = d.toLocaleDateString('ru-RU', { weekday: 'short' });
    days.push({ dateStr, weekday });
    dayTotals[dateStr] = 0;
  }

  sessions.forEach(s => {
    const sessionDateStr = s.date.split('T')[0];
    if (dayTotals[sessionDateStr] !== undefined) {
      dayTotals[sessionDateStr] += s.duration;
    }
  });

  // Render Bar Chart
  const maxDaySeconds = Math.max(...Object.values(dayTotals), 1);
  const barChartContainer = document.getElementById('stats-bar-chart');
  barChartContainer.innerHTML = '';
  
  days.forEach(day => {
    const seconds = dayTotals[day.dateStr];
    const heightPercent = Math.max((seconds / maxDaySeconds) * 100, 2);
    
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    let valStr = `${h}ч ${m}м`;
    if (h === 0) valStr = `${m}м`;
    if (seconds === 0) valStr = '0м';

    const div = document.createElement('div');
    div.className = 'bar-wrapper';
    if (activeStatsDateStr === day.dateStr) {
      div.classList.add('active');
    } else if (activeStatsDateStr !== null) {
      div.classList.add('inactive');
    }

    div.innerHTML = `
      <div class="bar-value">${valStr}</div>
      <div class="bar-fill" style="height: ${heightPercent}%"></div>
      <div class="bar-label">${day.weekday}</div>
    `;
    
    div.addEventListener('click', () => {
      if (activeStatsDateStr === day.dateStr) {
        activeStatsDateStr = null;
      } else {
        activeStatsDateStr = day.dateStr;
      }
      generateStats();
    });

    barChartContainer.appendChild(div);
  });

  renderDoughnutChart(sessions, days);
}

function renderDoughnutChart(sessions, days) {
  const categoryTotals = {};
  let totalSeconds = 0;

  sessions.forEach(s => {
    const sessionDateStr = s.date.split('T')[0];
    const isWithinWeek = days.some(d => d.dateStr === sessionDateStr);
    if (!isWithinWeek) return;

    if (activeStatsDateStr === null || activeStatsDateStr === sessionDateStr) {
      if (!categoryTotals[s.category]) {
        categoryTotals[s.category] = 0;
      }
      categoryTotals[s.category] += s.duration;
      totalSeconds += s.duration;
    }
  });

  document.getElementById('stats-total-week').innerText = formatTime(totalSeconds);

  const doughnutSvg = document.getElementById('stats-doughnut-chart');
  const legendContainer = document.getElementById('stats-legend');
  
  doughnutSvg.innerHTML = `<circle cx="50" cy="50" r="40" class="doughnut-circle doughnut-bg" />`;
  legendContainer.innerHTML = '';

  const catEntries = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  if (catEntries.length === 0) return; // empty circle without data
  
  let currentOffset = 0;
  const circumference = 2 * Math.PI * 40;

  catEntries.forEach(([cat, seconds], index) => {
    const percentage = seconds / Math.max(totalSeconds, 1);
    const strokeLength = percentage * circumference;
    const color = STATS_COLORS[index % STATS_COLORS.length];

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '50');
    circle.setAttribute('cy', '50');
    circle.setAttribute('r', '40');
    circle.setAttribute('class', 'doughnut-circle');
    circle.setAttribute('stroke', color);
    
    const gap = catEntries.length > 1 ? 2 : 0;
    
    circle.setAttribute('stroke-dasharray', `0 ${circumference}`);
    circle.setAttribute('stroke-dashoffset', -currentOffset);
    
    doughnutSvg.appendChild(circle);

    setTimeout(() => {
      circle.setAttribute('stroke-dasharray', `${Math.max(strokeLength - gap, 0)} ${circumference}`);
    }, 50);

    currentOffset += strokeLength;

    const legItem = document.createElement('div');
    legItem.className = 'legend-item';
    
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    let valStr = `${h}ч ${m}м`;
    if (h === 0) valStr = `${m}м`;

    legItem.innerHTML = `
      <div class="legend-left">
        <div class="legend-color" style="background: ${color}"></div>
        <div class="legend-name">${cat}</div>
      </div>
      <div class="legend-time">${valStr}</div>
    `;
    legendContainer.appendChild(legItem);
  });
}
