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
  premium: { name: 'Premium', description: '3 misiones, covers 4K y videoclips.', price: '$9.99', link: 'https://buy.stripe.com/6oU9AT3HTcSN8fa9jSdjO03' },
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