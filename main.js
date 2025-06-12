// Datos de los horarios ocupados por día (1=lunes, 2=martes, etc.)
let horariosOcupados = {
  1: [10, 11, 12], // Lunes: 10:00, 11:00, 12:00 ocupados
  2: [14, 15],     // Martes: 14:00, 15:00 ocupados
  3: [16],         // Miércoles: 16:00 ocupado
  4: [10, 13],     // Jueves: 10:00, 13:00 ocupados
  5: []            // Viernes: todos los horarios disponibles
};

let diaSeleccionado = null;
let horaSeleccionada = null;

// Función para generar los días de la semana
function generarCalendario() {
  const calendarContainer = document.getElementById('calendar');
  const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  // Limpiar el calendario
  calendarContainer.innerHTML = '';

  // Crear los días de la semana
  dias.forEach((dia, index) => {
    const diaDiv = document.createElement('div');
    diaDiv.textContent = dia;
    diaDiv.classList.add('calendar-day');
    diaDiv.dataset.dia = index + 1; // Asignamos el día (1 = lunes, 2 = martes, ...)
    
    // Verificar si el día tiene horarios ocupados
    if (horariosOcupados[index + 1].length > 0) {
      diaDiv.classList.add('disabled');
    } else {
      diaDiv.classList.add('enabled');
      diaDiv.addEventListener('click', () => seleccionarDia(index + 1));
    }
    
    calendarContainer.appendChild(diaDiv);
  });
}

// Función para seleccionar un día
function seleccionarDia(dia) {
  diaSeleccionado = dia;
  document.querySelectorAll('.calendar div').forEach(div => div.classList.remove('selected'));
  document.querySelector(`[data-dia="${dia}"]`).classList.add('selected');
  mostrarHorasDisponibles(dia);
}

// Función para mostrar las horas disponibles para un día
function mostrarHorasDisponibles(dia) {
  let horasDisponibles = obtenerHorasDisponibles(dia);
  let selectHora = document.getElementById('hora');
  
  // Limpiar las horas anteriores
  selectHora.innerHTML = '<option value="">Selecciona una hora</option>';

  if (horasDisponibles.length > 0) {
    horasDisponibles.forEach(hora => {
      let option = document.createElement("option");
      option.value = hora;
      option.textContent = `${hora}:00`;
      selectHora.appendChild(option);
    });
  } else {
    selectHora.innerHTML = '<option value="">No hay horas disponibles</option>';
  }

  // Habilitar el botón de reserva si hay una hora seleccionada
  document.getElementById('reservar').disabled = false;
}

// Función para obtener las horas disponibles para un día específico
function obtenerHorasDisponibles(dia) {
  let horas = [];
  for (let hora = 10; hora <= 18; hora++) {
    if (!horariosOcupados[dia].includes(hora)) {
      horas.push(hora);
    }
  }
  return horas;
}

// Función para reservar una clase
function reservarClase() {
  horaSeleccionada = parseInt(document.getElementById('hora').value);
  
  if (!horaSeleccionada) {
    document.getElementById('mensaje').textContent = 'Por favor, selecciona una hora válida.';
    document.getElementById('mensaje').style.color = 'red';
    return;
  }

  // Verificar si la hora está ocupada
  if (horariosOcupados[diaSeleccionado].includes(horaSeleccionada)) {
    document.getElementById('mensaje').textContent = `La clase a las ${horaSeleccionada}:00 ya está ocupada. Elige otra hora.`;
    document.getElementById('mensaje').style.color = 'red';
  } else {
    // Reservar el horario
    horariosOcupados[diaSeleccionado].push(horaSeleccionada);

    // Mostrar mensaje de éxito
    document.getElementById('mensaje').textContent = `¡Clase reservada el ${getDia(diaSeleccionado)} a las ${horaSeleccionada}:00!`;
    document.getElementById('mensaje').style.color = 'green';

    // Deshabilitar ese horario
    mostrarHorasDisponibles(diaSeleccionado);
  }
}

// Función para obtener el nombre del día en formato texto
function getDia(dia) {
  switch (dia) {
    case 1: return 'Lunes';
    case 2: return 'Martes';
    case 3: return 'Miércoles';
    case 4: return 'Jueves';
    case 5: return 'Viernes';
    default: return 'Día no válido';
  }
}

// Inicializar el calendario al cargar la página
window.onload = function() {
  generarCalendario();
};
