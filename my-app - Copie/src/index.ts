import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Player = {
  id: number
  name: string
  age: number
  position: string
}

type PlayerInput = {
  name?: unknown
  age?: unknown
  position?: unknown
}

const app = new Hono()

app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
  }),
)

let players: Player[] = []
let nextId = 1

function validatePlayerInput(body: unknown): { ok: true; data: PlayerInput } | { ok: false; error: string; details: Record<string, string> } {
  const errors: Record<string, string> = {}

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { ok: false, error: 'Body must be a JSON object', details: { body: 'Expected an object' } }
  }

  const candidate = body as PlayerInput

  if (typeof candidate.name !== 'string' || candidate.name.trim() === '') {
    errors.name = 'name is required and must be a non-empty string'
  }

  if (typeof candidate.age !== 'number' || !Number.isInteger(candidate.age) || candidate.age <= 0 || candidate.age > 100) {
    errors.age = 'age must be an integer between 1 and 100'
  }

  if (typeof candidate.position !== 'string' || candidate.position.trim() === '') {
    errors.position = 'position is required and must be a non-empty string'
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, error: 'Validation failed', details: errors }
  }

  const normalizedName = typeof candidate.name === 'string' ? candidate.name.trim() : ''
  const normalizedPosition = typeof candidate.position === 'string' ? candidate.position.trim() : ''

  return {
    ok: true,
    data: {
      name: normalizedName,
      age: candidate.age,
      position: normalizedPosition,
    },
  }
}

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/players', (c) => {
  return c.json(players)
})

app.get('/players/:id', (c) => {
  const id = Number.parseInt(c.req.param('id'), 10)

  if (Number.isNaN(id)) {
    return c.json({ error: 'Invalid player id' }, 400)
  }

  const player = players.find((item) => item.id === id)

  if (!player) {
    return c.json({ error: 'Player not found' }, 404)
  }

  return c.json(player)
})

app.post('/players', async (c) => {
  let body: unknown

  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const validation = validatePlayerInput(body)

  if (!validation.ok) {
    return c.json(validation, 400)
  }

  const player: Player = {
    id: nextId++,
    name: validation.data.name as string,
    age: validation.data.age as number,
    position: validation.data.position as string,
  }

  players.push(player)

  return c.json(player, 201)
})

app.put('/players/:id', async (c) => {
  const id = Number.parseInt(c.req.param('id'), 10)

  if (Number.isNaN(id)) {
    return c.json({ error: 'Invalid player id' }, 400)
  }

  let body: unknown

  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const validation = validatePlayerInput(body)

  if (!validation.ok) {
    return c.json(validation, 400)
  }

  const index = players.findIndex((item) => item.id === id)

  if (index === -1) {
    return c.json({ error: 'Player not found' }, 404)
  }

  players[index] = {
    ...players[index],
    name: validation.data.name as string,
    age: validation.data.age as number,
    position: validation.data.position as string,
  }

  return c.json(players[index])
})

app.delete('/players/:id', (c) => {
  const id = Number.parseInt(c.req.param('id'), 10)

  if (Number.isNaN(id)) {
    return c.json({ error: 'Invalid player id' }, 400)
  }

  const index = players.findIndex((item) => item.id === id)

  if (index === -1) {
    return c.json({ error: 'Player not found' }, 404)
  }

  const [deletedPlayer] = players.splice(index, 1)

  return c.json(deletedPlayer)
})

export default app
