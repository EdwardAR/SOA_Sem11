const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = 3001;
const DATA_FILE = path.join(__dirname, 'citas.json');
const CLIENTES_SERVICE = 'http://localhost:3000';

app.use(cors());
app.use(express.json());

async function leerCitas() {
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

async function guardarCitas(citas) {
  await fs.writeFile(DATA_FILE, JSON.stringify(citas, null, 2));
}

function siguienteId(items) {
  return items.length ? Math.max(...items.map((item) => Number(item.id) || 0)) + 1 : 1;
}

async function clienteExiste(clienteId) {
  const respuesta = await fetch(`${CLIENTES_SERVICE}/clientes/${clienteId}`);
  return respuesta.ok;
}

app.get('/citas', async (_req, res) => {
  try {
    const citas = await leerCitas();
    res.json(citas);
  } catch (error) {
    res.status(500).json({ mensaje: 'No fue posible consultar las citas.', error: error.message });
  }
});

app.get('/citas/:id', async (req, res) => {
  try {
    const citas = await leerCitas();
    const cita = citas.find((item) => item.id === Number(req.params.id));

    if (!cita) {
      return res.status(404).json({ mensaje: 'Cita no encontrada.' });
    }

    res.json(cita);
  } catch (error) {
    res.status(500).json({ mensaje: 'No fue posible consultar la cita.', error: error.message });
  }
});

app.post('/citas', async (req, res) => {
  try {
    const { clienteId, fecha, hora, especialidad, medico, motivo } = req.body;

    if (!clienteId || !fecha || !hora || !especialidad || !medico || !motivo) {
      return res.status(400).json({ mensaje: 'Todos los campos de la cita son obligatorios.' });
    }

    const existeCliente = await clienteExiste(clienteId);
    if (!existeCliente) {
      return res.status(400).json({ mensaje: 'El cliente asociado no existe.' });
    }

    const citas = await leerCitas();
    const nuevaCita = {
      id: siguienteId(citas),
      clienteId: Number(clienteId),
      fecha,
      hora,
      especialidad,
      medico,
      motivo,
      estado: 'Programada'
    };

    citas.push(nuevaCita);
    await guardarCitas(citas);

    res.status(201).json(nuevaCita);
  } catch (error) {
    res.status(500).json({ mensaje: 'No fue posible crear la cita.', error: error.message });
  }
});

app.put('/citas/:id', async (req, res) => {
  try {
    const citas = await leerCitas();
    const indice = citas.findIndex((item) => item.id === Number(req.params.id));

    if (indice === -1) {
      return res.status(404).json({ mensaje: 'Cita no encontrada.' });
    }

    const clienteId = req.body.clienteId ? Number(req.body.clienteId) : citas[indice].clienteId;
    if (req.body.clienteId) {
      const existeCliente = await clienteExiste(clienteId);
      if (!existeCliente) {
        return res.status(400).json({ mensaje: 'El cliente asociado no existe.' });
      }
    }

    const citaActualizada = {
      ...citas[indice],
      ...req.body,
      clienteId,
      id: citas[indice].id,
      estado: req.body.estado || citas[indice].estado
    };

    citas[indice] = citaActualizada;
    await guardarCitas(citas);

    res.json(citaActualizada);
  } catch (error) {
    res.status(500).json({ mensaje: 'No fue posible actualizar la cita.', error: error.message });
  }
});

app.delete('/citas/:id', async (req, res) => {
  try {
    const citas = await leerCitas();
    const indice = citas.findIndex((item) => item.id === Number(req.params.id));

    if (indice === -1) {
      return res.status(404).json({ mensaje: 'Cita no encontrada.' });
    }

    citas[indice] = {
      ...citas[indice],
      estado: 'Cancelada'
    };

    await guardarCitas(citas);
    res.json({ mensaje: 'Cita cancelada correctamente.', cita: citas[indice] });
  } catch (error) {
    res.status(500).json({ mensaje: 'No fue posible cancelar la cita.', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servicio de Citas ejecutandose en http://localhost:${PORT}`);
});