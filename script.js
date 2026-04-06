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
  patientName: '__________________________',
  birthDate: '____/____/________',
  cpf: '___.___.___-__',
  requestType: 'Exame',
  requestDescription: '______________________________________________',
  scheduledDate: '____/____/________',
  scheduledTime: '____:____',
  location: '______________________________________________',
  notes: '______________________________________________'
};

function formatDate(value) {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

function formatTime(value) {
  return value || '';
}

function formatCpf(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  const parts = [];
  if (digits.length > 0) parts.push(digits.slice(0, 3));
  if (digits.length >= 4) parts.push(digits.slice(3, 6));
  if (digits.length >= 7) parts.push(digits.slice(6, 9));
  let formatted = parts.join('.');
  if (digits.length >= 10) formatted += `-${digits.slice(9, 11)}`;
  return formatted;
}

function setMirroredValue(key, value) {
  document.querySelectorAll(`[data-field="${key}"]`).forEach(el => {
    el.textContent = value || placeholders[key];
  });
}

function refreshPreview() {
  setMirroredValue('patientName', fields.patientName.value.trim());
  setMirroredValue('birthDate', formatDate(fields.birthDate.value));
  setMirroredValue('cpf', formatCpf(fields.cpf.value));
  setMirroredValue('requestType', fields.requestType.value);
  setMirroredValue('requestDescription', fields.requestDescription.value.trim());
  setMirroredValue('scheduledDate', formatDate(fields.scheduledDate.value));
  setMirroredValue('scheduledTime', formatTime(fields.scheduledTime.value));
  setMirroredValue('location', fields.location.value.trim());
  setMirroredValue('notes', fields.notes.value.trim());
}

Object.entries(fields).forEach(([key, input]) => {
  input.addEventListener('input', event => {
    if (key === 'cpf') {
      event.target.value = formatCpf(event.target.value);
    }
    refreshPreview();
  });
  input.addEventListener('change', refreshPreview);
});

document.getElementById('clearBtn').addEventListener('click', () => {
  document.getElementById('requestForm').reset();
  refreshPreview();
});

document.getElementById('printBtn').addEventListener('click', () => {
  refreshPreview();
  window.print();
});

refreshPreview();
