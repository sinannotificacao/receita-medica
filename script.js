const fields = {
  patientName: document.getElementById('patientName'),
  birthDate: document.getElementById('birthDate'),
  cpf: document.getElementById('cpf'),
  requestType: document.getElementById('requestType'),
  requestDescription: document.getElementById('requestDescription'),
  scheduledDate: document.getElementById('scheduledDate'),
  scheduledTime: document.getElementById('scheduledTime'),
  location: document.getElementById('location'),
  notes: document.getElementById('notes')
};

const placeholders = {
  patientName: '______________________________________________',
  birthDate: '____/____/________',
  cpf: '___.___.___-__',
  requestType: 'EXAME',
  requestDescription: '______________________________________________',
  scheduledDate: '____/____/________',
  scheduledTime: '____:____',
  location: '______________________________________________',
  notes: '______________________________________________'
};

const printArea = document.getElementById('printArea');

function formatDate(value) {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

function formatCpf(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  const a = digits.slice(0, 3);
  const b = digits.slice(3, 6);
  const c = digits.slice(6, 9);
  const d = digits.slice(9, 11);

  let out = a;
  if (b) out += `.${b}`;
  if (c) out += `.${c}`;
  if (d) out += `-${d}`;
  return out;
}

function formatTime(value) {
  return value || '';
}

function setMirroredValue(key, value) {
  const output = value || placeholders[key];
  document.querySelectorAll(`[data-field="${key}"]`).forEach((el) => {
    el.textContent = output;
  });
}

function refreshPreview() {
  setMirroredValue('patientName', fields.patientName.value.trim().toUpperCase());
  setMirroredValue('birthDate', formatDate(fields.birthDate.value));
  setMirroredValue('cpf', formatCpf(fields.cpf.value));
  setMirroredValue('requestType', (fields.requestType.value || 'EXAME').toUpperCase());
  setMirroredValue('requestDescription', fields.requestDescription.value.trim().toUpperCase());
  setMirroredValue('scheduledDate', formatDate(fields.scheduledDate.value));
  setMirroredValue('scheduledTime', formatTime(fields.scheduledTime.value));
  setMirroredValue('location', fields.location.value.trim().toUpperCase());
  setMirroredValue('notes', fields.notes.value.trim().toUpperCase());
}

function applyCopyMode() {
  const selected = document.querySelector('input[name="copyMode"]:checked')?.value || 'normal';
  printArea.classList.toggle('mode-inverted', selected === 'inverted');
  printArea.classList.toggle('mode-normal', selected !== 'inverted');
}

Object.entries(fields).forEach(([key, input]) => {
  input.addEventListener('input', (event) => {
    if (key === 'cpf') {
      event.target.value = formatCpf(event.target.value);
    }
    refreshPreview();
  });

  input.addEventListener('change', refreshPreview);
});

document.querySelectorAll('input[name="copyMode"]').forEach((radio) => {
  radio.addEventListener('change', applyCopyMode);
});

document.getElementById('clearBtn').addEventListener('click', () => {
  document.getElementById('requestForm').reset();
  document.querySelector('input[name="copyMode"][value="normal"]').checked = true;
  applyCopyMode();
  refreshPreview();
});

document.getElementById('printBtn').addEventListener('click', () => {
  refreshPreview();
  applyCopyMode();
  window.print();
});

applyCopyMode();
refreshPreview();
