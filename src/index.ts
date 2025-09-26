import { Hono } from 'hono'
import { createClient } from '@supabase/supabase-js'
import type { Product } from './types'

// Define el tipo para las variables de entorno que Hono espera recibir de Vercel.
// Esto proporciona autocompletado y seguridad de tipos.
type Bindings = {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Endpoint para obtener todos los productos
app.get('/api/products', async (c) => {
  try {
    // Crea el cliente de Supabase DENTRO del handler.
    // Hono inyecta de forma segura las variables de entorno de Vercel en `c.env`.
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

    // Realiza la consulta a la tabla 'products'
    // Asegúrate de que el nombre de tu tabla sea exactamente 'products'.
    const { data, error } = await supabase
      .from('products')
      .select('*')

    if (error) {
      // Si hay un error de Supabase, lo registramos y devolvemos un error 500.
      console.error('Supabase error:', error.message)
      return c.json({ error: 'Failed to fetch products', details: error.message }, 500)
    }

    return c.json(data)
  } catch (e: any) {
    // Captura cualquier otro error inesperado durante la ejecución.
    console.error('Catch block error:', e.message)
    return c.json({ error: 'An internal error occurred', details: e.message }, 500)
  }
})

// Endpoint de depuración para verificar las variables de entorno
app.get('/api/debug', async (c) => {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    return c.json({
      message: "Environment variable status",
      hasSupabaseUrl: !!supabaseUrl,
      urlLength: supabaseUrl ? supabaseUrl.length : 0,
      hasSupabaseKey: !!supabaseKey,
      keyLength: supabaseKey ? supabaseKey.length : 0,
    });
  } catch (e: any) {
    return c.json({ error: 'Error in debug route', details: e.message }, 500)
  }
})

// Endpoint para obtener un producto por su ID
app.get('/api/products/:id', async (c) => {
  try {
    const { id } = c.req.param()
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single() // .single() para obtener un solo objeto en lugar de un array

    if (error) {
      // Si el código de error es 'PGRST116', significa que no se encontró ninguna fila.
      if (error.code === 'PGRST116') {
        return c.json({ error: `Product with id ${id} not found` }, 404)
      }
      console.error('Supabase error:', error.message)
      return c.json({ error: 'Failed to fetch product', details: error.message }, 500)
    }

    if (!data) {
        return c.json({ error: `Product with id ${id} not found` }, 404)
    }

    return c.json(data)

  } catch (e: any) {
    console.error('Catch block error:', e.message)
    return c.json({ error: 'An internal error occurred', details: e.message }, 500)
  }
})

export default app



