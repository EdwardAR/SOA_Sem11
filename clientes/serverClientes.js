const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'clientes.json');

app.use(cors());
app.use(express.json());

async function leerClientes() {
  try {
    const contenido = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(contenido || '[]');
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function guardarClientes(clientes) {
  await fs.writeFile(DATA_FILE, JSON.stringify(clientes, null, 2));
}

function siguienteId(items) {
  return items.length ? Math.max(...items.map((item) => Number(item.id) || 0)) + 1 : 1;
}

app.get('/clientes', async (_req, res) => {
  try {
    const clientes = await leerClientes();
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ mensaje: 'No fue posible consultar los clientes.', error: error.message });
  }
});

app.get('/clientes/:id', async (req, res) => {
  try {
    const clientes = await leerClientes();
    const cliente = clientes.find((item) => item.id === Number(req.params.id));

    if (!cliente) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado.' });
    }

    res.json(cliente);
  } catch (error) {
    res.status(500).json({ mensaje: 'No fue posible consultar el cliente.', error: error.message });
  }
});

app.post('/clientes', async (req, res) => {
  try {
    const { nombre, apellido, documento, telefono, email, fechaNacimiento } = req.body;

    if (!nombre || !apellido || !documento || !telefono || !email || !fechaNacimiento) {
      return res.status(400).json({ mensaje: 'Todos los campos del cliente son obligatorios.' });
    }

    const clientes = await leerClientes();
    const nuevoCliente = {
      id: siguienteId(clientes),
      nombre,
      apellido,
      documento,
      telefono,
      email,
      fechaNacimiento
    };

    clientes.push(nuevoCliente);
    await guardarClientes(clientes);

    res.status(201).json(nuevoCliente);
  } catch (error) {
    res.status(500).json({ mensaje: 'No fue posible registrar el cliente.', error: error.message });
  }
});

app.put('/clientes/:id', async (req, res) => {
  try {
    const clientes = await leerClientes();
    const indice = clientes.findIndex((item) => item.id === Number(req.params.id));

    if (indice === -1) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado.' });
    }

    const clienteActualizado = {
      ...clientes[indice],
      ...req.body,
      id: clientes[indice].id
    };

    clientes[indice] = clienteActualizado;
    await guardarClientes(clientes);

    res.json(clienteActualizado);
  } catch (error) {
    res.status(500).json({ mensaje: 'No fue posible actualizar el cliente.', error: error.message });
  }
});

app.delete('/clientes/:id', async (req, res) => {
  try {
    const clientes = await leerClientes();
    const indice = clientes.findIndex((item) => item.id === Number(req.params.id));

    if (indice === -1) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado.' });
    }

    const eliminado = clientes.splice(indice, 1)[0];
    await guardarClientes(clientes);

    res.json({ mensaje: 'Cliente eliminado correctamente.', cliente: eliminado });
  } catch (error) {
    res.status(500).json({ mensaje: 'No fue posible eliminar el cliente.', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servicio de Clientes ejecutandose en http://localhost:${PORT}`);
});