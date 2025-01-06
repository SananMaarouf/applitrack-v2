import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { showRoutes } from 'hono/dev';
import PocketBase from 'pocketbase';
import { LoginRequest, SignupRequest, PostData } from './types'; // Import the LoginRequest type

const app = new Hono();

// Use CORS middleware with restricted origins
app.use('*', cors({
  origin: ['http://localhost:3000', 'https://www.applitrack.no', 'https://applitrack.pockethost.io/'], // Allowed origins
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
  allowHeaders: ['Content-Type', 'Authorization'], // Allowed headers
}));

app.post('/signup', async (c) => {
  const pb = new PocketBase('https://applitrack.pockethost.io');
  const body: SignupRequest = await c.req.json();

  // Validate the request body
  if (!body.email || !body.password || !body.passwordConfirm) {
    console.error('Validation error: Missing required fields');
    return c.json({ error: 'Validation error: Missing required fields' }, 400);
  }

  try {
    const user = await pb.collection('users').create(body);
    return c.json({ message: 'Signup successful', user }, 201);
  } catch (error) {
    console.error('PocketBase error:', error);
    return c.json({ error: 'Signup failed' }, 400);
  }
});

app.post('/login', async (c) => {
  const pb = new PocketBase('https://applitrack.pockethost.io');
  const { email, password }: LoginRequest = await c.req.json();

  // Validate the request body
  if (!email || !password) {
    console.error('Validation error: Missing required fields');
    return c.json({ error: 'Validation error: Missing required fields' }, 400);
  }

  try {
    const authData = await pb.collection('users').authWithPassword(email, password);
    return c.json({ authData }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Login failed' }, 400);
  }
});

app.get('/posts', async (c) => {
  const pb = new PocketBase('https://applitrack.pockethost.io');

  // Extract the JWT token from the Authorization header
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  // Authenticate using the token
  try {
    pb.authStore.save(token, null); // Save the token to the auth store    
    const posts = await pb.collection('posts').getFullList();
    return c.json({ posts }, 200);
  } catch (error) {
    console.error('PocketBase error:', error);
    return c.json({ error: 'Failed to fetch posts' }, 400);
  }
});

app.post('/createPost', async (c) => {
  const pb = new PocketBase('https://applitrack.pockethost.io');

  // Extract the JWT token from the Authorization header
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  // Authenticate using the token
  try {
    pb.authStore.save(token, null); // Save the token to the auth store
    const postData: PostData = await c.req.json();
    console.log('Post data:', postData);

    const post = await pb.collection('posts').create(postData);
    return c.json({ message: 'Post created successfully', post }, 201);
  } catch (error) {
    console.error('PocketBase error:', error);
    return c.json({ error: 'Failed to create post' }, 400);
  }
});

showRoutes(app);

export default app;