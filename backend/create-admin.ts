import { createAdmin } from './admin-auth.js'
import { pool } from './db/client.js'
const [name, email, password] = process.argv.slice(2)
if (!name || !email || !password) throw new Error('Use: pnpm admin:create "Nome" email senha')
createAdmin(name, email, password).then(() => pool.end())
