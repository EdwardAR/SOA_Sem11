const URL_CLIENTES = 'http://localhost:3000';
const URL_CITAS = 'http://localhost:3001';
const URL_FACTURACION = 'http://localhost:3002';

const estado = {
  clientes: [],
  citas: [],
  facturas: []
};

const elementos = {
  clienteForm: document.getElementById('clienteForm'),
  clienteId: document.getElementById('clienteId'),
  clienteNombre: document.getElementById('clienteNombre'),
  clienteApellido: document.getElementById('clienteApellido'),
  clienteDocumento: document.getElementById('clienteDocumento'),
  clienteTelefono: document.getElementById('clienteTelefono'),
  clienteEmail: document.getElementById('clienteEmail'),
  clienteFechaNacimiento: document.getElementById('clienteFechaNacimiento'),
  clientesTable: document.getElementById('clientesTable'),
  citaForm: document.getElementById('citaForm'),
  citaId: document.getElementById('citaId'),
  citaClienteId: document.getElementById('citaClienteId'),
  citaFecha: document.getElementById('citaFecha'),
  citaHora: document.getElementById('citaHora'),
  citaEspecialidad: document.getElementById('citaEspecialidad'),
  citaMedico: document.getElementById('citaMedico'),
  citaMotivo: document.getElementById('citaMotivo'),
  citasTable: document.getElementById('citasTable'),
  facturaForm: document.getElementById('facturaForm'),
  facturaId: document.getElementById('facturaId'),
  facturaCitaId: document.getElementById('facturaCitaId'),
  facturaFechaEmision: document.getElementById('facturaFechaEmision'),
  facturaConcepto: document.getElementById('facturaConcepto'),
  facturaMonto: document.getElementById('facturaMonto'),
  facturaEstado: document.getElementById('facturaEstado'),
  facturasTable: document.getElementById('facturasTable'),
  alertContainer: document.getElementById('alertContainer')
};

function mostrarMensaje(mensaje, tipo = 'success') {
  const toastId = `toast-${Date.now()}`;
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-bg-${tipo} border-0 show`;
  toast.id = toastId;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${mensaje}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;
  elementos.alertContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3500);
}

async function requestJSON(url, options = {}) {
  const respuesta = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const contenido = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    throw new Error(contenido.mensaje || 'Operacion no completada');
  }

  return contenido;
}

function limpiarFormularioCliente() {
  elementos.clienteId.value = '';
  elementos.clienteForm.reset();
}

function limpiarFormularioCita() {
  elementos.citaId.value = '';
  elementos.citaForm.reset();
  elementos.citaClienteId.value = '';
}

function limpiarFormularioFactura() {
  elementos.facturaId.value = '';
  elementos.facturaForm.reset();
  elementos.facturaEstado.value = 'Pendiente';
  elementos.facturaCitaId.value = '';
}

async function cargarClientes() {
  estado.clientes = await requestJSON(`${URL_CLIENTES}/clientes`);
  renderClientes();
  renderSelects();
  renderCitas();
  renderFacturas();
}

async function cargarCitas() {
  estado.citas = await requestJSON(`${URL_CITAS}/citas`);
  renderCitas();
  renderSelects();
  renderFacturas();
}

async function cargarFacturas() {
  estado.facturas = await requestJSON(`${URL_FACTURACION}/facturas`);
  renderFacturas();
}

function nombreCliente(clienteId) {
  const cliente = estado.clientes.find((item) => item.id === Number(clienteId));
  return cliente ? `${cliente.nombre} ${cliente.apellido}` : `Cliente ${clienteId}`;
}

function resumenCita(cita) {
  return `${cita.fecha} ${cita.hora}`;
}

function renderClientes() {
  elementos.clientesTable.innerHTML = estado.clientes.map((cliente) => `
    <tr>
      <td>${cliente.id}</td>
      <td>${cliente.nombre} ${cliente.apellido}</td>
      <td>${cliente.documento}</td>
      <td>${cliente.telefono}</td>
      <td>${cliente.email}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary me-2" data-action="editar-cliente" data-id="${cliente.id}">Editar</button>
        <button class="btn btn-sm btn-outline-danger" data-action="eliminar-cliente" data-id="${cliente.id}">Eliminar</button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="6" class="text-center text-muted py-4">Sin clientes registrados</td></tr>';
}

function renderCitas() {
  elementos.citasTable.innerHTML = estado.citas.map((cita) => `
    <tr>
      <td>${cita.id}</td>
      <td>${nombreCliente(cita.clienteId)}</td>
      <td>${cita.fecha}</td>
      <td>${cita.hora}</td>
      <td>${cita.especialidad}</td>
      <td><span class="badge text-bg-${cita.estado === 'Cancelada' ? 'secondary' : 'success'}">${cita.estado}</span></td>
      <td>
        <button class="btn btn-sm btn-outline-primary me-2" data-action="editar-cita" data-id="${cita.id}">Editar</button>
        <button class="btn btn-sm btn-outline-warning" data-action="cancelar-cita" data-id="${cita.id}">Cancelar</button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="7" class="text-center text-muted py-4">Sin citas registradas</td></tr>';
}

function renderFacturas() {
  elementos.facturasTable.innerHTML = estado.facturas.map((factura) => {
    const cita = estado.citas.find((item) => item.id === Number(factura.citaId));
    return `
      <tr>
        <td>${factura.id}</td>
        <td>${factura.citaId}</td>
        <td>${factura.clienteId ? nombreCliente(factura.clienteId) : (cita ? nombreCliente(cita.clienteId) : 'Sin cliente')}</td>
        <td>${factura.fechaEmision}</td>
        <td>$${Number(factura.monto).toLocaleString('es-CO')}</td>
        <td><span class="badge text-bg-${factura.estado === 'Pagada' ? 'success' : factura.estado === 'Anulada' ? 'secondary' : 'warning'}">${factura.estado}</span></td>
        <td>
          <button class="btn btn-sm btn-outline-primary me-2" data-action="editar-factura" data-id="${factura.id}">Editar</button>
          <button class="btn btn-sm btn-outline-danger" data-action="eliminar-factura" data-id="${factura.id}">Eliminar</button>
        </td>
      </tr>
    `;
  }).join('') || '<tr><td colspan="7" class="text-center text-muted py-4">Sin facturas registradas</td></tr>';
}

function renderSelects() {
  elementos.citaClienteId.innerHTML = ['<option value="">Seleccione un cliente</option>']
    .concat(estado.clientes.map((cliente) => `<option value="${cliente.id}">${cliente.nombre} ${cliente.apellido}</option>`))
    .join('');

  elementos.facturaCitaId.innerHTML = ['<option value="">Seleccione una cita</option>']
    .concat(estado.citas.map((cita) => `<option value="${cita.id}">Cita #${cita.id} - ${nombreCliente(cita.clienteId)} - ${resumenCita(cita)}</option>`))
    .join('');
}

async function guardarCliente(evento) {
  evento.preventDefault();

  const payload = {
    nombre: elementos.clienteNombre.value.trim(),
    apellido: elementos.clienteApellido.value.trim(),
    documento: elementos.clienteDocumento.value.trim(),
    telefono: elementos.clienteTelefono.value.trim(),
    email: elementos.clienteEmail.value.trim(),
    fechaNacimiento: elementos.clienteFechaNacimiento.value
  };

  const id = elementos.clienteId.value;
  if (id) {
    await requestJSON(`${URL_CLIENTES}/clientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    mostrarMensaje('Cliente actualizado correctamente');
  } else {
    await requestJSON(`${URL_CLIENTES}/clientes`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    mostrarMensaje('Cliente registrado correctamente');
  }

  limpiarFormularioCliente();
  await cargarClientes();
}

async function guardarCita(evento) {
  evento.preventDefault();

  const payload = {
    clienteId: Number(elementos.citaClienteId.value),
    fecha: elementos.citaFecha.value,
    hora: elementos.citaHora.value,
    especialidad: elementos.citaEspecialidad.value.trim(),
    medico: elementos.citaMedico.value.trim(),
    motivo: elementos.citaMotivo.value.trim()
  };

  const id = elementos.citaId.value;
  if (id) {
    await requestJSON(`${URL_CITAS}/citas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    mostrarMensaje('Cita actualizada correctamente');
  } else {
    await requestJSON(`${URL_CITAS}/citas`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    mostrarMensaje('Cita registrada correctamente');
  }

  limpiarFormularioCita();
  await cargarCitas();
}

async function guardarFactura(evento) {
  evento.preventDefault();

  const payload = {
    citaId: Number(elementos.facturaCitaId.value),
    fechaEmision: elementos.facturaFechaEmision.value,
    concepto: elementos.facturaConcepto.value.trim(),
    monto: Number(elementos.facturaMonto.value),
    estado: elementos.facturaEstado.value
  };

  const id = elementos.facturaId.value;
  if (id) {
    await requestJSON(`${URL_FACTURACION}/facturas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    mostrarMensaje('Factura actualizada correctamente');
  } else {
    await requestJSON(`${URL_FACTURACION}/facturas`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    mostrarMensaje('Factura generada correctamente');
  }

  limpiarFormularioFactura();
  await cargarFacturas();
}

function prepararEdicionCliente(cliente) {
  elementos.clienteId.value = cliente.id;
  elementos.clienteNombre.value = cliente.nombre;
  elementos.clienteApellido.value = cliente.apellido;
  elementos.clienteDocumento.value = cliente.documento;
  elementos.clienteTelefono.value = cliente.telefono;
  elementos.clienteEmail.value = cliente.email;
  elementos.clienteFechaNacimiento.value = cliente.fechaNacimiento;
}

function prepararEdicionCita(cita) {
  elementos.citaId.value = cita.id;
  elementos.citaClienteId.value = cita.clienteId;
  elementos.citaFecha.value = cita.fecha;
  elementos.citaHora.value = cita.hora;
  elementos.citaEspecialidad.value = cita.especialidad;
  elementos.citaMedico.value = cita.medico;
  elementos.citaMotivo.value = cita.motivo;
}

function prepararEdicionFactura(factura) {
  elementos.facturaId.value = factura.id;
  elementos.facturaCitaId.value = factura.citaId;
  elementos.facturaFechaEmision.value = factura.fechaEmision;
  elementos.facturaConcepto.value = factura.concepto;
  elementos.facturaMonto.value = factura.monto;
  elementos.facturaEstado.value = factura.estado;
}

async function manejarAccionesTabla(evento) {
  const boton = evento.target.closest('button[data-action]');
  if (!boton) return;

  const id = boton.dataset.id;
  const accion = boton.dataset.action;

  try {
    if (accion === 'editar-cliente') {
      prepararEdicionCliente(estado.clientes.find((item) => item.id === Number(id)));
    }

    if (accion === 'eliminar-cliente') {
      if (confirm('¿Deseas eliminar este cliente?')) {
        await requestJSON(`${URL_CLIENTES}/clientes/${id}`, { method: 'DELETE' });
        mostrarMensaje('Cliente eliminado correctamente');
        await cargarClientes();
        await cargarCitas();
        await cargarFacturas();
      }
    }

    if (accion === 'editar-cita') {
      prepararEdicionCita(estado.citas.find((item) => item.id === Number(id)));
    }

    if (accion === 'cancelar-cita') {
      if (confirm('¿Deseas cancelar esta cita?')) {
        await requestJSON(`${URL_CITAS}/citas/${id}`, { method: 'DELETE' });
        mostrarMensaje('Cita cancelada correctamente', 'warning');
        await cargarCitas();
      }
    }

    if (accion === 'editar-factura') {
      prepararEdicionFactura(estado.facturas.find((item) => item.id === Number(id)));
    }

    if (accion === 'eliminar-factura') {
      if (confirm('¿Deseas eliminar esta factura?')) {
        await requestJSON(`${URL_FACTURACION}/facturas/${id}`, { method: 'DELETE' });
        mostrarMensaje('Factura eliminada correctamente');
        await cargarFacturas();
      }
    }
  } catch (error) {
    mostrarMensaje(error.message, 'danger');
  }
}

document.getElementById('limpiarCliente').addEventListener('click', limpiarFormularioCliente);
document.getElementById('limpiarCita').addEventListener('click', limpiarFormularioCita);
document.getElementById('limpiarFactura').addEventListener('click', limpiarFormularioFactura);
document.getElementById('recargarClientes').addEventListener('click', cargarClientes);
document.getElementById('recargarCitas').addEventListener('click', cargarCitas);
document.getElementById('recargarFacturas').addEventListener('click', cargarFacturas);

elementos.clienteForm.addEventListener('submit', guardarCliente);
elementos.citaForm.addEventListener('submit', guardarCita);
elementos.facturaForm.addEventListener('submit', guardarFactura);
elementos.clientesTable.addEventListener('click', manejarAccionesTabla);
elementos.citasTable.addEventListener('click', manejarAccionesTabla);
elementos.facturasTable.addEventListener('click', manejarAccionesTabla);

Promise.all([cargarClientes(), cargarCitas(), cargarFacturas()]).catch((error) => {
  mostrarMensaje(error.message, 'danger');
});