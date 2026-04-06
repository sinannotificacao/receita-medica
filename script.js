const fields = {
  nome: document.getElementById('nome'),
  dn: document.getElementById('dn'),
  cpf: document.getElementById('cpf'),
  tipo: document.getElementById('tipo'),
  solicitacao: document.getElementById('solicitacao'),
  dataMarcada: document.getElementById('dataMarcada'),
  hora: document.getElementById('hora'),
  local: document.getElementById('local'),
  obs: document.getElementById('obs'),
};

const previewTargets = ['copy1', 'copy2', 'printCopy1', 'printCopy2'];

function values() {
  return {
    nome: fields.nome.value.trim(),
    dn: fields.dn.value.trim(),
    cpf: fields.cpf.value.trim(),
    tipo: fields.tipo.value.trim(),
    solicitacao: fields.solicitacao.value.trim(),
    dataMarcada: fields.dataMarcada.value.trim(),
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
  previewTargets.forEach(fillSlip);
}

Object.values(fields).forEach((el) => {
  el.addEventListener('input', renderAll);
  el.addEventListener('change', renderAll);
});

renderAll();
