const http = require('node:http');
const path = require('node:path');
const { URL } = require('node:url');

/*
 * API fake local para la Iteración 09.
 *
 * La web local guarda sus datos en web-local/data.js. Ese fichero está pensado
 * para navegador, por eso preparamos un objeto window mínimo antes de cargarlo
 * desde Node. No tocamos web-local/data.js para no romper la aplicación UI.
 */
globalThis.window = globalThis;
require(path.join(__dirname, '..', 'web-local', 'data.js'));

const siteData = globalThis.SITE_DATA;

if (!siteData || !Array.isArray(siteData.courses)) {
  throw new Error('No se ha podido cargar SITE_DATA.courses desde web-local/data.js');
}

let cursos = siteData.courses.map((curso, index) => ({
  id: curso.id ?? `curso-${String(index + 1).padStart(3, '0')}`,
  titulo: curso.title ?? curso.titulo ?? 'Curso sin título',
  tecnologia: curso.tagsByType?.Tecnologia?.[0] ?? 'General',
  nivel: curso.tagsByType?.Nivel?.[0] ?? 'General',
  cliente: curso.client ?? 'Sin cliente',
  duracionHoras: Number.parseInt(curso.hours_per_edition ?? '0', 10) || 0,
  tags: curso.tags ?? [],
}));

const solicitudes = new Map();
let siguienteSolicitud = 1;

const PORT = Number(process.env.API_PORT ?? 3001);
const TOKEN_DEMO = process.env.API_TOKEN ?? 'token-local';
const API_KEY_DEMO = process.env.COURSES_API_KEY ?? 'key-local';
const BASIC_USER = process.env.BASIC_USER ?? 'demo';
const BASIC_PASS = process.env.BASIC_PASS ?? 'demo123';
const E2E_USER = process.env.E2E_USER ?? 'alumno@desaprendiendo.net';
const E2E_PASS = process.env.E2E_PASS ?? 'Password123';

function sendJson(res, status, data, extraHeaders = {}) {
  const body = JSON.stringify(data, null, 2);

  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS',
    'access-control-allow-headers': 'content-type,authorization,x-api-key,x-lab',
    ...extraHeaders,
  });

  res.end(body);
}

function sendNoContent(res, status = 204, extraHeaders = {}) {
  res.writeHead(status, {
    'cache-control': 'no-store',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS',
    'access-control-allow-headers': 'content-type,authorization,x-api-key,x-lab',
    ...extraHeaders,
  });
  res.end();
}

function sendError(res, status, message) {
  sendJson(res, status, { error: message });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';

    req.on('data', chunk => {
      raw += chunk;
    });

    req.on('end', () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(new Error(`Body JSON no válido: ${error.message}`));
      }
    });

    req.on('error', reject);
  });
}

function filtrarCursos(url) {
  const tecnologia = url.searchParams.get('tecnologia');
  const nivel = url.searchParams.get('nivel');
  const cliente = url.searchParams.get('cliente');
  const q = url.searchParams.get('q');

  let resultado = [...cursos];

  if (tecnologia) {
    resultado = resultado.filter(curso =>
      curso.tecnologia.toLowerCase().includes(tecnologia.toLowerCase())
      || curso.tags.some(tag => tag.toLowerCase().includes(tecnologia.toLowerCase()))
    );
  }

  if (nivel) {
    resultado = resultado.filter(curso =>
      curso.nivel.toLowerCase().includes(nivel.toLowerCase())
    );
  }

  if (cliente) {
    resultado = resultado.filter(curso =>
      curso.cliente.toLowerCase().includes(cliente.toLowerCase())
    );
  }

  if (q) {
    resultado = resultado.filter(curso =>
      JSON.stringify(curso).toLowerCase().includes(q.toLowerCase())
    );
  }

  return resultado;
}

function parseODataFilter(filter) {
  if (!filter) {
    return cursos;
  }

  const match = filter.match(/^(tecnologia|nivel|cliente)\s+eq\s+'([^']+)'$/i);

  if (!match) {
    return cursos;
  }

  const [, campo, valor] = match;
  return cursos.filter(curso =>
    String(curso[campo.toLowerCase()] ?? '').toLowerCase() === valor.toLowerCase()
  );
}

function selectFields(items, select) {
  if (!select) {
    return items;
  }

  const fields = select.split(',').map(field => field.trim()).filter(Boolean);

  return items.map(item => Object.fromEntries(
    fields.map(field => [field, item[field]]).filter(([, value]) => value !== undefined)
  ));
}

function isBasicAuthValid(req) {
  const authorization = req.headers.authorization ?? '';
  const expected = Buffer.from(`${BASIC_USER}:${BASIC_PASS}`).toString('base64');
  return authorization === `Basic ${expected}`;
}

function isBearerValid(req) {
  const authorization = req.headers.authorization ?? '';
  return authorization === `Bearer ${TOKEN_DEMO}`;
}

function isApiKeyValid(req) {
  return req.headers['x-api-key'] === API_KEY_DEMO;
}

function isAuthenticated(req) {
  return isBearerValid(req) || isBasicAuthValid(req) || isApiKeyValid(req);
}

function routeOptions(res) {
  sendNoContent(res, 204, {
    allow: 'GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS',
  });
}

async function handleCursos(req, res, url) {
  if (req.method === 'OPTIONS') {
    routeOptions(res);
    return;
  }

  if (req.method === 'HEAD') {
    sendNoContent(res, 200, {
      'content-type': 'application/json; charset=utf-8',
      'x-total-count': String(filtrarCursos(url).length),
    });
    return;
  }

  if (req.method === 'GET') {
    const data = filtrarCursos(url);
    sendJson(res, 200, {
      total: data.length,
      data,
    });
    return;
  }

  if (req.method === 'POST') {
    const body = await readBody(req);
    const nuevo = {
      id: body.id ?? `curso-${Date.now()}`,
      titulo: body.titulo ?? body.title ?? 'Nuevo curso',
      tecnologia: body.tecnologia ?? 'General',
      nivel: body.nivel ?? 'General',
      cliente: body.cliente ?? 'Laboratorio',
      duracionHoras: Number(body.duracionHoras ?? 0),
      tags: body.tags ?? [],
    };

    cursos.push(nuevo);
    sendJson(res, 201, nuevo, { location: `/api/cursos/${nuevo.id}` });
    return;
  }

  sendError(res, 405, `Método no permitido en /api/cursos: ${req.method}`);
}

async function handleCursoPorId(req, res, id) {
  if (req.method === 'OPTIONS') {
    routeOptions(res);
    return;
  }

  const index = cursos.findIndex(curso => curso.id === id);

  if (req.method === 'GET') {
    if (index === -1) {
      sendError(res, 404, `Curso no encontrado: ${id}`);
      return;
    }

    sendJson(res, 200, cursos[index]);
    return;
  }

  if (req.method === 'HEAD') {
    sendNoContent(res, index === -1 ? 404 : 200, {
      'content-type': 'application/json; charset=utf-8',
    });
    return;
  }

  if (req.method === 'PUT') {
    const body = await readBody(req);
    const reemplazo = {
      id,
      titulo: body.titulo ?? body.title ?? 'Curso reemplazado',
      tecnologia: body.tecnologia ?? 'General',
      nivel: body.nivel ?? 'General',
      cliente: body.cliente ?? 'Laboratorio',
      duracionHoras: Number(body.duracionHoras ?? 0),
      tags: body.tags ?? [],
    };

    if (index === -1) {
      cursos.push(reemplazo);
      sendJson(res, 201, reemplazo, { location: `/api/cursos/${id}` });
      return;
    }

    cursos[index] = reemplazo;
    sendJson(res, 200, reemplazo);
    return;
  }

  if (req.method === 'PATCH') {
    if (index === -1) {
      sendError(res, 404, `Curso no encontrado: ${id}`);
      return;
    }

    const body = await readBody(req);
    cursos[index] = {
      ...cursos[index],
      ...body,
      id,
    };

    sendJson(res, 200, cursos[index]);
    return;
  }

  if (req.method === 'DELETE') {
    if (index !== -1) {
      cursos.splice(index, 1);
    }

    sendNoContent(res, 204);
    return;
  }

  sendError(res, 405, `Método no permitido en /api/cursos/${id}: ${req.method}`);
}

async function handleSolicitudes(req, res, url) {
  if (req.method === 'OPTIONS') {
    routeOptions(res);
    return;
  }

  if (req.method === 'GET') {
    const email = url.searchParams.get('email');
    let data = [...solicitudes.values()];

    if (email) {
      data = data.filter(solicitud => solicitud.email === email);
    }

    sendJson(res, 200, { total: data.length, data });
    return;
  }

  if (req.method === 'POST') {
    const body = await readBody(req);
    const solicitud = {
      id: `sol-${String(siguienteSolicitud++).padStart(3, '0')}`,
      nombre: body.nombre ?? body.name ?? 'Alumno',
      email: body.email ?? 'alumno@example.com',
      curso: body.curso ?? body.course ?? 'Playwright',
      creadaEn: new Date().toISOString(),
    };

    solicitudes.set(solicitud.id, solicitud);
    sendJson(res, 201, solicitud, { location: `/api/solicitudes/${solicitud.id}` });
    return;
  }

  sendError(res, 405, `Método no permitido en /api/solicitudes: ${req.method}`);
}

async function handleSolicitudPorId(req, res, id) {
  if (req.method === 'GET') {
    const solicitud = solicitudes.get(id);

    if (!solicitud) {
      sendError(res, 404, `Solicitud no encontrada: ${id}`);
      return;
    }

    sendJson(res, 200, solicitud);
    return;
  }

  if (req.method === 'DELETE') {
    solicitudes.delete(id);
    sendNoContent(res, 204);
    return;
  }

  sendError(res, 405, `Método no permitido en /api/solicitudes/${id}: ${req.method}`);
}

function handleODataCursos(req, res, url) {
  if (req.method === 'OPTIONS') {
    routeOptions(res);
    return;
  }

  if (req.method !== 'GET') {
    sendError(res, 405, 'OData de laboratorio solo permite GET');
    return;
  }

  let data = parseODataFilter(url.searchParams.get('$filter'));
  data = selectFields(data, url.searchParams.get('$select'));

  const top = Number.parseInt(url.searchParams.get('$top') ?? '', 10);
  if (Number.isFinite(top) && top > 0) {
    data = data.slice(0, top);
  }

  sendJson(res, 200, {
    '@odata.count': data.length,
    value: data,
  });
}

async function handleGraphQL(req, res) {
  if (req.method === 'OPTIONS') {
    routeOptions(res);
    return;
  }

  if (req.method !== 'POST') {
    sendError(res, 405, 'GraphQL de laboratorio solo permite POST');
    return;
  }

  const body = await readBody(req);
  const variables = body.variables ?? {};
  const tecnologia = variables.tecnologia ?? 'Azure';
  const data = cursos.filter(curso =>
    curso.tecnologia.toLowerCase().includes(String(tecnologia).toLowerCase())
    || curso.tags.some(tag => tag.toLowerCase().includes(String(tecnologia).toLowerCase()))
  );

  sendJson(res, 200, {
    data: {
      cursos: data,
    },
  });
}

async function handleLogin(req, res) {
  if (req.method !== 'POST') {
    sendError(res, 405, 'El login de laboratorio usa POST');
    return;
  }

  const body = await readBody(req);

  if ((body.email ?? E2E_USER) !== E2E_USER || (body.password ?? E2E_PASS) !== E2E_PASS) {
    sendError(res, 401, 'Credenciales no válidas');
    return;
  }

  sendJson(res, 200, {
    token: TOKEN_DEMO,
    user: {
      email: E2E_USER,
      name: 'Alumno Playwright',
    },
  });
}

function handlePrivate(req, res) {
  if (!isAuthenticated(req)) {
    sendError(res, 401, 'Falta autenticación de laboratorio');
    return;
  }

  sendJson(res, 200, {
    ok: true,
    user: {
      email: E2E_USER,
      role: 'student',
    },
  });
}

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host ?? `127.0.0.1:${PORT}`}`);
  const pathname = url.pathname;

  try {
    if (pathname === '/health') {
      sendJson(res, 200, { ok: true, service: 'api-local-labguiado08' });
      return;
    }

    if (pathname === '/api/cursos') {
      await handleCursos(req, res, url);
      return;
    }

    const cursoMatch = pathname.match(/^\/api\/cursos\/([^/]+)$/);
    if (cursoMatch) {
      await handleCursoPorId(req, res, decodeURIComponent(cursoMatch[1]));
      return;
    }

    if (pathname === '/api/solicitudes') {
      await handleSolicitudes(req, res, url);
      return;
    }

    const solicitudMatch = pathname.match(/^\/api\/solicitudes\/([^/]+)$/);
    if (solicitudMatch) {
      await handleSolicitudPorId(req, res, decodeURIComponent(solicitudMatch[1]));
      return;
    }

    if (pathname === '/odata/cursos') {
      handleODataCursos(req, res, url);
      return;
    }

    if (pathname === '/graphql') {
      await handleGraphQL(req, res);
      return;
    }

    if (pathname === '/auth/login') {
      await handleLogin(req, res);
      return;
    }

    if (pathname === '/api/private' || pathname === '/api/private/me') {
      handlePrivate(req, res);
      return;
    }

    sendError(res, 404, `Ruta no encontrada: ${pathname}`);
  } catch (error) {
    sendError(res, 500, error.message);
  }
}

const server = http.createServer(handleRequest);

server.listen(PORT, '127.0.0.1', () => {
  console.log(`API local LabGuiado08 escuchando en http://127.0.0.1:${PORT}`);
});

process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT', () => server.close(() => process.exit(0)));
