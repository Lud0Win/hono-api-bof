import { Hono } from 'hono';
import { supabase } from './supabaseClient';
import type { Product } from './types';

const app = new Hono();

// GET all products
app.get('/api/products', async (c) => {
  const { data, error } = await supabase.from('products').select('*');

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json(data);
});

// GET a single product by ID
app.get('/api/products/:id', async (c) => {
  const id = c.req.param('id');
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return c.json({ error: 'Product not found' }, 404);
  }

  return c.json(data);
});

// POST a new product
app.post('/api/products', async (c) => {
  const product = await c.req.json<Product>();

  // Basic validation
  if (!product.name || !product.price) {
      return c.json({ error: 'Name and price are required' }, 400);
  }

  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json(data, 201);
});

// PUT (update) a product by ID
app.put('/api/products/:id', async (c) => {
    const id = c.req.param('id');
    const product = await c.req.json<Partial<Product>>();

    const { data, error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return c.json({ error: 'Product not found or could not be updated' }, 404);
    }

    return c.json(data);
});


// DELETE a product by ID
app.delete('/api/products/:id', async (c) => {
    const id = c.req.param('id');

    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

    if (error) {
        return c.json({ error: 'Product not found or could not be deleted' }, 404);
    }

    return c.json({ message: 'Product deleted successfully' });
});


export default app;
