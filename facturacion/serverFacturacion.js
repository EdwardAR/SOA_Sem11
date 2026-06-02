const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = 3002;
const DATA_FILE = path.join(__dirname, 'facturacion.json');
const CITAS_SERVICE = 'http://localhost:3001';

app.use(cors());
app.use(express.json());

async function leerFacturas() {
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

async function guardarFacturas(facturas) {
  await fs.writeFile(DATA_FILE, JSON.stringify(facturas, null, 2));
}

function siguienteId(items) {
  return items.length ? Math.max(...items.map((item) => Number(item.id) || 0)) + 1 : 1;
}

async function obtenerCita(citaId) {
  const respuesta = await fetch(`${CITAS_SERVICE}/citas/${citaId}`);
  if (!respuesta.ok) {
    return null;
  }

  return respuesta.json();
}

app.get('/facturas', async (_req, res) => {
  try {
    const facturas = await leerFacturas();
    res.json(facturas);
  } catch (error) {
    res.status(500).json({ mensaje: 'No fue posible consultar las facturas.', error: error.message });
  }
});

app.get('/facturas/:id', async (req, res) => {
  try {
    const facturas = await leerFacturas();
    const factura = facturas.find((item) => item.id === Number(req.params.id));

    if (!factura) {
      return res.status(404).json({ mensaje: 'Factura no encontrada.' });
    }

    res.json(factura);
  } catch (error) {
    res.status(500).json({ mensaje: 'No fue posible consultar la factura.', error: error.message });
  }
});

app.post('/facturas', async (req, res) => {
  try {
    const { citaId, fechaEmision, concepto, monto, estado } = req.body;

    if (!citaId || !fechaEmision || !concepto || monto === undefined || monto === null) {
      return res.status(400).json({ mensaje: 'Los campos citaId, fechaEmision, concepto y monto son obligatorios.' });
    }

    const cita = await obtenerCita(citaId);
    if (!cita) {
      return res.status(400).json({ mensaje: 'La cita asociada no existe.' });
    }

    const facturas = await leerFacturas();
    const nuevaFactura = {
      id: siguienteId(facturas),
      citaId: Number(citaId),
      clienteId: Number(cita.clienteId),
      fechaEmision,
      concepto,
      monto: Number(monto),
      estado: estado || 'Pendiente'
    };

    facturas.push(nuevaFactura);
    await guardarFacturas(facturas);

    res.status(201).json(nuevaFactura);
  } catch (error) {
    res.status(500).json({ mensaje: 'No fue posible generar la factura.', error: error.message });
  }
});

app.put('/facturas/:id', async (req, res) => {
  try {
    const facturas = await leerFacturas();
    const indice = facturas.findIndex((item) => item.id === Number(req.params.id));

    if (indice === -1) {
      return res.status(404).json({ mensaje: 'Factura no encontrada.' });
    }

    let citaId = facturas[indice].citaId;
    let clienteId = facturas[indice].clienteId;

    if (req.body.citaId) {
      const cita = await obtenerCita(req.body.citaId);
      if (!cita) {
        return res.status(400).json({ mensaje: 'La cita asociada no existe.' });
      }

      citaId = Number(req.body.citaId);
      clienteId = Number(cita.clienteId);
    }

    const facturaActualizada = {
      ...facturas[indice],
      ...req.body,
      citaId,
      clienteId,
      id: facturas[indice].id,
      monto: req.body.monto !== undefined ? Number(req.body.monto) : facturas[indice].monto
    };

    facturas[indice] = facturaActualizada;
    await guardarFacturas(facturas);

    res.json(facturaActualizada);
  } catch (error) {
    res.status(500).json({ mensaje: 'No fue posible actualizar la factura.', error: error.message });
  }
});

app.delete('/facturas/:id', async (req, res) => {
  try {
    const facturas = await leerFacturas();
    const indice = facturas.findIndex((item) => item.id === Number(req.params.id));

    if (indice === -1) {
      return res.status(404).json({ mensaje: 'Factura no encontrada.' });
    }

    const eliminada = facturas.splice(indice, 1)[0];
    await guardarFacturas(facturas);

    res.json({ mensaje: 'Factura eliminada correctamente.', factura: eliminada });
  } catch (error) {
    res.status(500).json({ mensaje: 'No fue posible eliminar la factura.', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servicio de Facturacion ejecutandose en http://localhost:${PORT}`);
});