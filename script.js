const categories = [
  {
    name: "Кухня",
    items: [
      { name: "Холодильник", watts: 150 },
      { name: "Електрочайник", watts: 2000 },
      { name: "Мікрохвильовка", watts: 1200 },
      { name: "Мультиварка", watts: 860 },
      { name: "Тостер", watts: 800 },
      { name: "Кавоварка", watts: 1000 },
    ]
  },
  {
    name: "Освітлення",
    items: [
      { name: "LED лампа", watts: 15 },
      { name: "Настільна лампа", watts: 40 },
      { name: "LED стрічка (5м)", watts: 30 },
    ]
  },
  {
    name: "Опалення та вода",
    items: [
      { name: "Обігрівач (масляний)", watts: 1500 },
      { name: "Тепловентилятор", watts: 2000 },
      { name: "Водяний насос", watts: 800 },
      { name: "Бойлер (50л)", watts: 1500 },
    ]
  },
  {
    name: "Техніка та зв'язок",
    items: [
      { name: "WiFi роутер", watts: 20 },
      { name: "Зарядка телефону", watts: 10 },
      { name: "Ноутбук", watts: 65 },
      { name: "Телевізор", watts: 100 },
      { name: "Зарядка планшету", watts: 15 },
    ]
  },
  {
    name: "Інше",
    items: [
      { name: "Пральна машина", watts: 500 },
      { name: "Праска", watts: 2200 },
      { name: "Пилосос", watts: 1400 },
      { name: "Фен", watts: 1800 },
    ]
  }
];

const state = {};

function buildUI() {
  const container = document.getElementById('categories');

  categories.forEach((cat, ci) => {
    const title = document.createElement('div');
    title.className = 'section-title';
    title.innerHTML = `${cat.name} <span class="arrow open" id="arrow-${ci}">&#9656;</span>`;
    title.onclick = () => toggleCategory(ci);
    container.appendChild(title);

    const itemsDiv = document.createElement('div');
    itemsDiv.className = 'category-items';
    itemsDiv.id = `cat-${ci}`;

    cat.items.forEach((item, ii) => {
      const key = `${ci}-${ii}`;
      state[key] = { checked: false, qty: 1, watts: item.watts };

      const row = document.createElement('div');
      row.className = 'appliance-row';
      row.id = `row-${key}`;
      row.innerHTML = `
        <input type="checkbox" id="cb-${key}" onchange="toggle('${key}', this.checked)">
        <div class="info">
          <div class="app-name">${item.name}</div>
          <div class="app-watts">${item.watts} Вт</div>
        </div>
        <div class="qty-control">
          <button class="qty-btn" onclick="changeQty('${key}', -1)">&minus;</button>
          <span class="qty-val" id="qty-${key}">1</span>
          <button class="qty-btn" onclick="changeQty('${key}', 1)">&plus;</button>
        </div>
      `;
      itemsDiv.appendChild(row);
    });

    container.appendChild(itemsDiv);
  });
}

function toggleCategory(ci) {
  const el = document.getElementById(`cat-${ci}`);
  const arrow = document.getElementById(`arrow-${ci}`);
  el.classList.toggle('collapsed');
  arrow.classList.toggle('open');
}

function toggle(key, checked) {
  state[key].checked = checked;
  document.getElementById(`row-${key}`).classList.toggle('checked', checked);
  calculate();
}

function changeQty(key, delta) {
  const s = state[key];
  s.qty = Math.max(1, Math.min(10, s.qty + delta));
  document.getElementById(`qty-${key}`).textContent = s.qty;
  if (s.checked) calculate();
}

function calculate() {
  const genPower = parseInt(document.getElementById('genPower').value) || 0;
  const tankSize = parseFloat(document.getElementById('tankSize').value) || 0;

  let total = 0;
  for (const key in state) {
    const s = state[key];
    if (s.checked) total += s.watts * s.qty;
  }

  document.getElementById('totalLoad').textContent = total;

  const panel = document.getElementById('resultsPanel');
  const badge = document.getElementById('statusBadge');
  const bar = document.getElementById('loadBar');
  const warning = document.getElementById('warningBanner');

  if (genPower === 0) {
    badge.textContent = 'Введіть потужність';
    badge.className = 'status-badge neutral';
    panel.className = 'results-panel';
    bar.style.width = '0%';
    bar.className = 'load-bar-fill';
    document.getElementById('percentUsed').textContent = '—';
    document.getElementById('remaining').textContent = '—';
    warning.className = 'warning-banner';
  } else {
    const pct = (total / genPower) * 100;
    const remain = genPower - total;

    document.getElementById('percentUsed').textContent = Math.round(Math.min(pct, 999)) + '%';
    document.getElementById('percentUsed').className = pct > 100 ? 'value red' : 'value';
    document.getElementById('remaining').textContent = remain >= 0 ? remain + ' Вт' : 'Перевищено';
    document.getElementById('remaining').className = remain < 0 ? 'value red' : 'value';

    bar.style.width = Math.min(pct, 100) + '%';

    if (pct > 100) {
      bar.className = 'load-bar-fill danger';
      badge.textContent = 'Перевантаження';
      badge.className = 'status-badge danger';
      panel.className = 'results-panel danger';
    } else if (pct > 80) {
      bar.className = 'load-bar-fill warn';
      badge.textContent = 'Високе навантаження';
      badge.className = 'status-badge safe';
      panel.className = 'results-panel safe';
    } else {
      bar.className = 'load-bar-fill';
      badge.textContent = 'Безпечно';
      badge.className = 'status-badge safe';
      panel.className = 'results-panel safe';
    }

    if (pct > 80 && pct <= 100) {
      warning.textContent = 'Увага: навантаження понад 80%. Не вмикайте додаткові прилади.';
      warning.className = 'warning-banner show';
    } else if (pct > 100) {
      warning.textContent = 'Небезпека! Загальна потужність перевищує можливості генератора. Вимкніть деякі прилади!';
      warning.className = 'warning-banner show';
    } else {
      warning.className = 'warning-banner';
    }
  }

  // Runtime estimation
  // Approx fuel consumption: ~0.4 L/hr per 1000W at ~75% efficiency
  const runtimeEl = document.getElementById('runtime');
  const fuelEl = document.getElementById('fuelRate');

  if (total > 0 && tankSize > 0) {
    const litersPerHour = (total / 1000) * 0.4;
    const hours = tankSize / litersPerHour;
    fuelEl.textContent = litersPerHour.toFixed(1) + ' л/год';

    if (hours >= 1) {
      const h = Math.floor(hours);
      const m = Math.round((hours - h) * 60);
      runtimeEl.textContent = h + ' год' + (m > 0 ? ' ' + m + ' хв' : '');
    } else {
      runtimeEl.textContent = Math.round(hours * 60) + ' хв';
    }
  } else if (total > 0) {
    const litersPerHour = (total / 1000) * 0.4;
    fuelEl.textContent = litersPerHour.toFixed(1) + ' л/год';
    runtimeEl.textContent = 'Вкажіть бак';
  } else {
    runtimeEl.textContent = '—';
    fuelEl.textContent = '—';
  }
}

buildUI();