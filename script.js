const fields = {
  nome: document.getElementById('nome'),
  dn: document.getElementById('dn'),
  idade: document.getElementById('idade'),
  cpf: document.getElementById('cpf'),
  tipo: document.getElementById('tipo'),
  solicitacao: document.getElementById('solicitacao'),
  dataMarcada: document.getElementById('dataMarcada'),
  hora: document.getElementById('hora'),
  local: document.getElementById('local'),
  obs: document.getElementById('obs'),
};

const printBtn = document.getElementById('printBtn');
const previewTargets = ['copy1', 'copy2', 'printCopy1', 'printCopy2'];

function formatDateBR(value) {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function calculateAge(value) {
  if (!value) return '';
  const birth = new Date(`${value}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return '';

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  const dayDiff = today.getDate() - birth.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  if (age < 0) return '';
  return `${age} ano${age === 1 ? '' : 's'}`;
}

function maskCPF(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function isValidCPF(value) {
  const cpf = value.replace(/\D/g, '');
  if (!cpf) return true;
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    sum += Number(cpf.charAt(i)) * (10 - i);
  }
  let digit = (sum * 10) % 11;
  if (digit === 10) digit = 0;
  if (digit !== Number(cpf.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i += 1) {
    sum += Number(cpf.charAt(i)) * (11 - i);
  }
  digit = (sum * 10) % 11;
  if (digit === 10) digit = 0;
  return digit === Number(cpf.charAt(10));
}

function updateDerivedFields() {
  fields.idade.value = calculateAge(fields.dn.value);
  fields.cpf.value = maskCPF(fields.cpf.value);
}

function values() {
  return {
    nome: fields.nome.value.trim(),
    dn: formatDateBR(fields.dn.value),
    idade: fields.idade.value.trim(),
    cpf: fields.cpf.value.trim(),
    tipo: fields.tipo.value.trim(),
    solicitacao: fields.solicitacao.value.trim(),
    dataMarcada: formatDateBR(fields.dataMarcada.value),
    hora: fields.hora.value.trim(),
    local: fields.local.value.trim(),
    obs: fields.obs.value.trim(),
  };
}

function fillSlip(containerId) {
  const container = document.getElementById(containerId);
  const template = document.getElementById('slipTemplate');
  const clone = template.content.cloneNode(true);
  const data = values();

  clone.querySelectorAll('[data-bind]').forEach((el) => {
    const key = el.getAttribute('data-bind');
    el.textContent = data[key] || ' ';
  });

  container.innerHTML = '';
  container.appendChild(clone);
}

function renderAll() {
  updateDerivedFields();
  previewTargets.forEach(fillSlip);
  validateLive();
}

function validateLive() {
  const nomeValido = fields.nome.value.trim().length > 0;
  const cpfValido = isValidCPF(fields.cpf.value);

  fields.nome.classList.toggle('invalid', !nomeValido);
  fields.cpf.classList.toggle('invalid', !cpfValido);

  fields.nome.setCustomValidity(nomeValido ? '' : 'Informe o nome do paciente.');
  fields.cpf.setCustomValidity(cpfValido ? '' : 'Informe um CPF válido.');

  return nomeValido && cpfValido;
}

function validateBeforePrint() {
  renderAll();

  if (!validateLive()) {
    if (!fields.nome.value.trim()) {
      fields.nome.reportValidity();
      fields.nome.focus();
      return false;
    }

    if (!isValidCPF(fields.cpf.value)) {
      fields.cpf.reportValidity();
      fields.cpf.focus();
      return false;
    }
  }

  return true;
}

Object.values(fields).forEach((el) => {
  el.addEventListener('input', renderAll);
  el.addEventListener('change', renderAll);
});

printBtn.addEventListener('click', () => {
  if (validateBeforePrint()) {
    window.print();
  }
});

renderAll();
