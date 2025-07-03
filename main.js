// Elementos DOM
const form = document.getElementById('bookingForm');
const nombreInput = document.getElementById('nombre');
const apellidoInput = document.getElementById('apellido');
const fechaInput = document.getElementById('fecha');
const horaSelect = document.getElementById('hora');
const reservasTable = document.querySelector('#reservasTable tbody');
const mensajeDiv = document.getElementById('mensaje');
const filtroMes = document.getElementById('filtroMes');

let reservas = [];

// Cargar reservas guardadas desde localStorage con validación
function cargarReservas() {
  const data = localStorage.getItem('reservas');
  if (!data) return;
  try {
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      reservas = parsed.filter(r =>
        r &&
        typeof r.fecha === 'string' && r.fecha.length >= 10 &&
        typeof r.nombre === 'string' && r.nombre.trim() !== '' &&
        typeof r.apellido === 'string' && r.apellido.trim() !== '' &&
        typeof r.hora === 'string' && r.hora.trim() !== ''
      );
    }
  } catch (e) {
    console.warn('Error leyendo reservas de localStorage:', e);
    reservas = [];
  }
}

// Guardar reservas en localStorage
function guardarReservas() {
  localStorage.setItem('reservas', JSON.stringify(reservas));
}

// Validar que la fecha sea lunes a viernes
function esDiaHabil(fechaStr) {
  const fecha = new Date(fechaStr);
  const dia = fecha.getDay();
  return dia >= 1 && dia <= 5;
}

// Mostrar mensajes temporales con estilos
function mostrarMensaje(texto, tipo = 'info') {
  mensajeDiv.textContent = texto;
  mensajeDiv.className = `mensaje mostrar ${tipo}`;
  setTimeout(() => mensajeDiv.classList.remove('mostrar'), 4000);
}

// Actualizar el select de horas deshabilitando las ya ocupadas para la fecha
function actualizarHorariosOcupados() {
  const fechaSel = fechaInput.value;
  for (let opt of horaSelect.options) {
    if (opt.value) opt.disabled = false;
  }
  reservas.forEach(r => {
    if (r.fecha === fechaSel) {
      for (let opt of horaSelect.options) {
        if (opt.value === r.hora) opt.disabled = true;
      }
    }
  });
}

// Escapar texto para evitar inyección HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Renderizar tabla de reservas aplicando filtro por mes
function renderReservas() {
  reservasTable.innerHTML = '';
  const mesSeleccionado = filtroMes.value;
  const hoy = new Date().toISOString().split('T')[0];

  let filtradas = reservas;
  if (mesSeleccionado) {
    filtradas = reservas.filter(r => r.fecha.startsWith(mesSeleccionado));
  }

  filtradas.forEach(r => {
    const tr = document.createElement('tr');
    if (r.fecha === hoy) tr.classList.add('hoy');
    tr.innerHTML = `
      <td>${escapeHtml(r.nombre)}</td>
      <td>${escapeHtml(r.apellido)}</td>
      <td>${escapeHtml(r.fecha)}</td>
      <td>${escapeHtml(r.hora)}</td>
      <td class="acciones">
        <button class="editar" onclick="editarReserva('${r.id}')">Editar</button>
        <button class="eliminar" onclick="eliminarReserva('${r.id}')">Eliminar</button>
      </td>
    `;
    reservasTable.appendChild(tr);
  });
}

// Llenar select de filtro de meses únicos de las reservas
function llenarFiltroMes() {
  const meses = [...new Set(
    reservas
      .filter(r => typeof r.fecha === 'string' && r.fecha.length >= 7)
      .map(r => r.fecha.slice(0,7))
  )];
  filtroMes.innerHTML = '<option value="">-- Ver todas --</option>';
  meses.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m;
    opt.textContent = m;
    filtroMes.appendChild(opt);
  });
}

// Función para editar reserva: llena el formulario con datos
function editarReserva(id) {
  const r = reservas.find(r => r.id === id);
  if (r) {
    nombreInput.value = r.nombre;
    apellidoInput.value = r.apellido;
    fechaInput.value = r.fecha;
    horaSelect.value = r.hora;
    form.dataset.editing = id;
    actualizarHorariosOcupados();
  }
}

// Función para eliminar reserva y actualizar vista
function eliminarReserva(id) {
  reservas = reservas.filter(r => r.id !== id);
  guardarYRenderizar();
  mostrarMensaje('Reserva eliminada', 'exito');
}

// Guarda, ordena y actualiza la interfaz
function guardarYRenderizar() {
  reservas.sort((a,b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora));
  guardarReservas();
  renderReservas();
  actualizarHorariosOcupados();
  llenarFiltroMes();
}

// Manejo envío formulario (crear o editar reserva)
form.addEventListener('submit', e => {
  e.preventDefault();

  const nombre = nombreInput.value.trim();
  const apellido = apellidoInput.value.trim();
  const fecha = fechaInput.value;
  const hora = horaSelect.value;

  if (!nombre || !apellido || !fecha || !hora) {
    mostrarMensaje('Completa todos los campos.', 'error');
    return;
  }

  if (!esDiaHabil(fecha)) {
    mostrarMensaje('Solo puedes reservar de lunes a viernes.', 'error');
    return;
  }

  if (form.dataset.editing) {
    reservas = reservas.filter(r => r.id !== form.dataset.editing);
    delete form.dataset.editing;
  }

  if (reservas.some(r => r.fecha === fecha && r.hora === hora)) {
    mostrarMensaje('Horario no disponible', 'error');
    return;
  }

  reservas.push({
    id: Date.now().toString(),
    nombre,
    apellido,
    fecha,
    hora
  });

  form.reset();
  mostrarMensaje('Reserva exitosa. Por favor llegar 10 minutos antes.', 'exito');
  guardarYRenderizar();
});

// Evento para filtro por mes
filtroMes.addEventListener('change', renderReservas);

// Inicializar fecha mínima a hoy
fechaInput.setAttribute('min', new Date().toISOString().split('T')[0]);

// Cargar reservas y renderizar
cargarReservas();
guardarYRenderizar();

// Exponer funciones para botones editar y eliminar
window.editarReserva = editarReserva;
window.eliminarReserva = eliminarReserva;
