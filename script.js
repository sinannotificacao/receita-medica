const fields = {
  nome: document.getElementById('nome'),
  dn: document.getElementById('dn'),
  idade: document.getElementById('idade'),
  cpf: document.getElementById('cpf'),
  cpfFeedback: document.getElementById('cpfFeedback'),
  tipo: document.getElementById('tipo'),
  solicitacao: document.getElementById('solicitacao'),
  dataMarcada: document.getElementById('dataMarcada'),
  hora: document.getElementById('hora'),
  localSelect: document.getElementById('localSelect'),
  localPreview: document.getElementById('selectedLocationPreview'),
  obs: document.getElementById('obs'),
};

const locationFields = {
  modal: document.getElementById('locationModal'),
  openBtn: document.getElementById('openLocationModal'),
  closeBtn: document.getElementById('closeLocationModal'),
  saveBtn: document.getElementById('saveLocationBtn'),
  nome: document.getElementById('localNome'),
  endereco: document.getElementById('localEndereco'),
  telefone: document.getElementById('localTelefone'),
  list: document.getElementById('savedLocationsList'),
};

const STORAGE_KEY = 'sus-locais-cadastrados';
const printBtn = document.getElementById('printBtn');
const previewTargets = ['copy1', 'copy2', 'printCopy1', 'printCopy2'];
let locations = [];

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

function maskPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
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

function setInputState(element, state) {
  element.classList.remove('valid', 'invalid');
  if (state) {
    element.classList.add(state);
  }
}

function updateCPFVisualState() {
  const cpfDigits = fields.cpf.value.replace(/\D/g, '');
  const cpfPreenchido = cpfDigits.length > 0;
  const cpfValido = isValidCPF(fields.cpf.value);

  setInputState(fields.cpf, cpfPreenchido ? (cpfValido ? 'valid' : 'invalid') : '');

  fields.cpfFeedback.className = 'field-feedback';
  fields.cpfFeedback.textContent = '';

  if (!cpfPreenchido) {
    return cpfValido;
  }

  fields.cpfFeedback.classList.add('show', cpfValido ? 'valid' : 'invalid');
  fields.cpfFeedback.textContent = cpfValido ? 'CPF válido.' : 'CPF inválido. Confira os números.';

  return cpfValido;
}

function updateDerivedFields() {
  fields.idade.value = calculateAge(fields.dn.value);
  fields.cpf.value = maskCPF(fields.cpf.value);
  locationFields.telefone.value = maskPhone(locationFields.telefone.value);
}

function getSelectedLocation() {
  const id = fields.localSelect.value;
  return locations.find((item) => item.id === id) || null;
}

function buildLocationText(location) {
  if (!location) return '';
  const pieces = [location.nome, location.endereco];
  if (location.telefone) {
    pieces.push(`Tel.: ${location.telefone}`);
  }
  return pieces.join(' - ');
}

function updateLocationPreview() {
  const selectedLocation = getSelectedLocation();
  const text = buildLocationText(selectedLocation);

  fields.localSelect.title = text || '';
  fields.localPreview.textContent = text;
  fields.localPreview.classList.toggle('hidden', !text);
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
    local: buildLocationText(getSelectedLocation()),
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
  updateLocationPreview();
  previewTargets.forEach(fillSlip);
  validateLive();
}

function validateLive() {
  const nomeValido = fields.nome.value.trim().length > 0;
  const cpfValido = updateCPFVisualState();
  const cadastroNomeValido = locationFields.nome.value.trim().length > 0 || locationFields.modal.classList.contains('hidden');
  const cadastroEnderecoValido = locationFields.endereco.value.trim().length > 0 || locationFields.modal.classList.contains('hidden');

  setInputState(fields.nome, nomeValido ? '' : 'invalid');
  setInputState(locationFields.nome, cadastroNomeValido ? '' : 'invalid');
  setInputState(locationFields.endereco, cadastroEnderecoValido ? '' : 'invalid');

  fields.nome.setCustomValidity(nomeValido ? '' : 'Informe o nome do paciente.');
  fields.cpf.setCustomValidity(cpfValido ? '' : 'Informe um CPF válido.');
  locationFields.nome.setCustomValidity(cadastroNomeValido ? '' : 'Informe o nome do local.');
  locationFields.endereco.setCustomValidity(cadastroEnderecoValido ? '' : 'Informe o endereço do local.');

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

function saveLocationsToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
}

function loadLocationsFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    locations = raw ? JSON.parse(raw) : [];
  } catch (error) {
    locations = [];
  }
}

function refreshLocationSelect() {
  const previousValue = fields.localSelect.value;
  fields.localSelect.innerHTML = '<option value="">Selecione um local cadastrado</option>';

  locations.forEach((location) => {
    const option = document.createElement('option');
    option.value = location.id;
    option.textContent = `${location.nome} - ${location.endereco}`;
    fields.localSelect.appendChild(option);
  });

  if (locations.some((location) => location.id === previousValue)) {
    fields.localSelect.value = previousValue;
  }

  updateLocationPreview();
}

function createLocationInfoLine(text, isStrong = false) {
  const line = document.createElement(isStrong ? 'strong' : 'span');
  line.textContent = text;
  return line;
}

function renderLocationList() {
  locationFields.list.innerHTML = '';

  if (!locations.length) {
    const empty = document.createElement('div');
    empty.className = 'saved-location-empty';
    empty.textContent = 'Nenhum local cadastrado ainda.';
    locationFields.list.appendChild(empty);
    return;
  }

  locations.forEach((location) => {
    const item = document.createElement('div');
    item.className = 'saved-location-item';

    const info = document.createElement('div');
    info.className = 'saved-location-info';
    info.appendChild(createLocationInfoLine(location.nome, true));
    info.appendChild(createLocationInfoLine(location.endereco));
    if (location.telefone) {
      info.appendChild(createLocationInfoLine(`Tel.: ${location.telefone}`));
    }

    const controls = document.createElement('div');
    controls.className = 'saved-location-controls';

    const selectBtn = document.createElement('button');
    selectBtn.type = 'button';
    selectBtn.className = 'secondary-btn';
    selectBtn.textContent = 'Usar';
    selectBtn.addEventListener('click', () => {
      fields.localSelect.value = location.id;
      closeLocationModal();
      renderAll();
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'danger-btn';
    deleteBtn.textContent = 'Excluir';
    deleteBtn.addEventListener('click', () => {
      const wasSelected = fields.localSelect.value === location.id;
      locations = locations.filter((itemLocation) => itemLocation.id !== location.id);
      saveLocationsToStorage();
      refreshLocationSelect();
      renderLocationList();
      if (wasSelected) {
        fields.localSelect.value = '';
      }
      renderAll();
    });

    controls.appendChild(selectBtn);
    controls.appendChild(deleteBtn);
    item.appendChild(info);
    item.appendChild(controls);
    locationFields.list.appendChild(item);
  });
}

function clearLocationForm() {
  locationFields.nome.value = '';
  locationFields.endereco.value = '';
  locationFields.telefone.value = '';
  validateLive();
}

function openLocationModal() {
  locationFields.modal.classList.remove('hidden');
  renderLocationList();
  setTimeout(() => locationFields.nome.focus(), 0);
}

function closeLocationModal() {
  locationFields.modal.classList.add('hidden');
  clearLocationForm();
}

function saveLocation() {
  const nome = locationFields.nome.value.trim();
  const endereco = locationFields.endereco.value.trim();
  const telefone = locationFields.telefone.value.trim();

  setInputState(locationFields.nome, nome ? '' : 'invalid');
  setInputState(locationFields.endereco, endereco ? '' : 'invalid');
  locationFields.nome.setCustomValidity(nome ? '' : 'Informe o nome do local.');
  locationFields.endereco.setCustomValidity(endereco ? '' : 'Informe o endereço do local.');

  if (!nome) {
    locationFields.nome.reportValidity();
    locationFields.nome.focus();
    return;
  }

  if (!endereco) {
    locationFields.endereco.reportValidity();
    locationFields.endereco.focus();
    return;
  }

  const location = {
    id: `${Date.now()}`,
    nome,
    endereco,
    telefone,
  };

  locations.push(location);
  saveLocationsToStorage();
  refreshLocationSelect();
  renderLocationList();
  fields.localSelect.value = location.id;
  closeLocationModal();
  renderAll();
}

Object.values(fields).forEach((el) => {
  if (!el || typeof el.addEventListener !== 'function') return;
  el.addEventListener('input', renderAll);
  el.addEventListener('change', renderAll);
});

locationFields.openBtn.addEventListener('click', openLocationModal);
locationFields.closeBtn.addEventListener('click', closeLocationModal);
locationFields.saveBtn.addEventListener('click', saveLocation);
locationFields.telefone.addEventListener('input', renderAll);
locationFields.nome.addEventListener('input', validateLive);
locationFields.endereco.addEventListener('input', validateLive);
locationFields.modal.addEventListener('click', (event) => {
  if (event.target === locationFields.modal) {
    closeLocationModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !locationFields.modal.classList.contains('hidden')) {
    closeLocationModal();
  }
});

printBtn.addEventListener('click', () => {
  if (validateBeforePrint()) {
    window.print();
  }
});

loadLocationsFromStorage();
refreshLocationSelect();
renderLocationList();
renderAll();
