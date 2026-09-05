const modal = document.querySelector('#mission-modal');
const modalTitle = document.querySelector('#modal-title');
const modalCopy = document.querySelector('#modal-copy');
const missionCopy = {
  'El Conde': 'La primera coordenada esta activa. Sigue la senal por la Zona Colonial.',
  Planeta: 'La ruta global esta lista. Preparate para el salto Santo Domingo > Miami > Tokyo.',
  Catacumbas: 'Acceso clasificado detectado. Esta mision requiere el paquete Deluxe.'
};

document.querySelectorAll('.mission-button').forEach((button) => {
  button.addEventListener('click', () => {
    const mission = button.dataset.mission;
    modalTitle.textContent = mission;
    modalCopy.textContent = missionCopy[mission];
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  });
});

function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

document.querySelector('.modal-close').addEventListener('click', closeModal);
modal.addEventListener('click', (event) => {
  if (event.target === modal) closeModal();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeModal();
});

document.querySelectorAll('.nav-link').forEach((link) => {
  link.addEventListener('click', () => {
    document.querySelectorAll('.nav-link').forEach((item) => item.classList.remove('active'));
    link.classList.add('active');
  });
});

document.querySelectorAll('.checkout').forEach((link) => {
  link.addEventListener('click', () => console.info(`Checkout iniciado: ${link.dataset.plan}`));
});

document.querySelectorAll('.upload-input').forEach((input) => {
  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;
    const video = document.querySelector(`#${input.id.replace('-upload', '-preview')}`);
    video.src = URL.createObjectURL(file);
    video.classList.add('ready');
    input.previousElementSibling.querySelector('.video-placeholder').textContent = file.name;
    video.play().catch(() => {});
  });
});

const defaultProducts = {
  premium: { name: 'Premium', description: '3 misiones, covers 4K y videoclips.', price: '$9.99', link: 'https://buy.stripe.com/test_fZueVc3QpdSA9cW7Skao800' },
  deluxe: { name: 'Deluxe', description: 'Todo el universo, pelicula completa, soundtrack y CD original.', price: '$19.99', link: 'https://buy.stripe.com/test_aFa4gy3QpaGobl4dcEao801' }
};
const savedProducts = JSON.parse(localStorage.getItem('mision-planeta-products') || 'null') || defaultProducts;
const adminStatus = document.querySelector('#admin-status');

function updateStoreCard(plan) {
  const product = savedProducts[plan];
  const card = document.querySelector(`[data-product="${plan}"]`);
  if (!card || !product) return;
  card.querySelector('.product-name').textContent = product.name;
  card.querySelector('.product-description').textContent = product.description;
  card.querySelector('.product-price').textContent = product.price;
  card.querySelector('.checkout').href = product.link;
}

Object.keys(savedProducts).forEach(updateStoreCard);

document.querySelectorAll('.editor').forEach((form) => {
  const product = savedProducts[form.dataset.plan];
  Object.entries(product).forEach(([key, value]) => {
    const field = form.elements.namedItem(key);
    if (field) field.value = value;
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    savedProducts[form.dataset.plan] = Object.fromEntries(new FormData(form).entries());
    localStorage.setItem('mision-planeta-products', JSON.stringify(savedProducts));
    updateStoreCard(form.dataset.plan);
    adminStatus.textContent = `${savedProducts[form.dataset.plan].name} actualizado localmente.`;
  });
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js'));
}
const gameCanvas = document.querySelector('#orbit-run');
const gameStart = document.querySelector('#game-start');
if (gameCanvas && gameStart) {
  const context = gameCanvas.getContext('2d');
  const scoreNode = document.querySelector('#game-score');
  const statusNode = document.querySelector('#game-status');
  const keys = new Set();
  let animationId;
  let game;
  let gameActive = false;

  function resetGame() {
    game = { shipX: 360, signals: [], hazards: [], score: 0, lastSignal: 0, lastHazard: 0, startedAt: performance.now(), ended: false };
    scoreNode.textContent = '0';
    statusNode.textContent = 'EN RUTA';
  }

  function draw(time) {
    const { width, height } = gameCanvas;
    context.fillStyle = '#081218';
    context.fillRect(0, 0, width, height);
    for (let index = 0; index < 70; index += 1) {
      const x = (index * 89) % width;
      const y = (index * 53 + Math.floor(time / 25)) % height;
      context.fillStyle = index % 8 === 0 ? '#d9f45a' : '#aeb8ad';
      context.fillRect(x, y, 2, 2);
    }
    if (keys.has('ArrowLeft') || keys.has('a')) game.shipX = Math.max(28, game.shipX - 7);
    if (keys.has('ArrowRight') || keys.has('d')) game.shipX = Math.min(width - 28, game.shipX + 7);
    if (time - game.lastSignal > 700) { game.signals.push({ x: 35 + Math.random() * (width - 70), y: -15 }); game.lastSignal = time; }
    if (time - game.lastHazard > 1050) { game.hazards.push({ x: 35 + Math.random() * (width - 70), y: -28 }); game.lastHazard = time; }
    game.signals.forEach((signal) => { signal.y += 3.4; });
    game.hazards.forEach((hazard) => { hazard.y += 4.7; });
    game.signals = game.signals.filter((signal) => {
      if (Math.abs(signal.x - game.shipX) < 31 && Math.abs(signal.y - (height - 45)) < 30) { game.score += 1; scoreNode.textContent = String(game.score); return false; }
      return signal.y < height + 20;
    });
    const hit = game.hazards.some((hazard) => Math.abs(hazard.x - game.shipX) < 34 && Math.abs(hazard.y - (height - 45)) < 32);
    game.signals.forEach((signal) => { context.fillStyle = '#d9f45a'; context.beginPath(); context.arc(signal.x, signal.y, 8, 0, Math.PI * 2); context.fill(); });
    game.hazards.forEach((hazard) => { context.fillStyle = '#ff7043'; context.beginPath(); context.arc(hazard.x, hazard.y, 15, 0, Math.PI * 2); context.fill(); });
    context.fillStyle = '#eef0e8'; context.beginPath(); context.moveTo(game.shipX, height - 75); context.lineTo(game.shipX - 20, height - 25); context.lineTo(game.shipX + 20, height - 25); context.closePath(); context.fill();
    if (hit) { game.ended = true; gameActive = false; statusNode.textContent = `MISIÓN FINALIZADA · ${game.score} SEÑALES`; gameStart.textContent = 'Jugar otra vez'; return; }
    animationId = requestAnimationFrame(draw);
  }
  gameStart.addEventListener('click', () => { cancelAnimationFrame(animationId); gameActive = true; resetGame(); gameStart.textContent = 'Reiniciar demo'; animationId = requestAnimationFrame(draw); });
  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (gameActive && ['arrowleft', 'arrowright', 'a', 'd'].includes(key)) { keys.add(key === 'arrowleft' ? 'ArrowLeft' : key === 'arrowright' ? 'ArrowRight' : key); event.preventDefault(); }
  });
  window.addEventListener('keyup', (event) => keys.delete(event.key.toLowerCase() === 'arrowleft' ? 'ArrowLeft' : event.key.toLowerCase() === 'arrowright' ? 'ArrowRight' : event.key.toLowerCase()));
}
