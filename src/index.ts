import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS middleware configuration



app.use('*', cors({
  origin: ['http://localhost:5173', 'https://auto-chad.vercel.app'],
  allowHeaders: ['Origin', 'Content-Type', 'Authorization'],
  allowMethods: ['GET', 'OPTIONS', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// app.use('*', async (c, next) => {
  // CORS middleware configuration
//   const corsMiddleware = cors({
//     origin: (origin) => {
//       console.log('Request origin:', origin); // Log the origin of the request
//       if (['http://localhost:5173', 'https://auto-chad.vercel.app','https://auto-chad.vercel.app/register'].includes(origin)) {
//         return origin;
//       }
//       return ''; // Not allowed
//     },
//     allowHeaders: ['Origin', 'Content-Type', 'Authorization'],
//     allowMethods: ['GET', 'OPTIONS', 'POST', 'PUT', 'DELETE'],
//     credentials: true,
//   });

//   try {
//     await corsMiddleware(c, next);
//   } catch (err) {
//     console.error('CORS error:', err);
   
//   }
// });


// app.use('*', async (c, next) => {

//   // CORS middleware configuration
//   const corsMiddleware = cors({
//     origin: ['http://localhost:5173','https://auto-chad.vercel.app/'],
//     allowHeaders: ['Origin', 'Content-Type', 'Authorization'],
//     allowMethods: ['GET', 'OPTIONS', 'POST', 'PUT', 'DELETE'],
//     credentials: true,
//   })

//   // Apply CORS middleware to all routes to allow cross-origin requests
//   return await corsMiddleware(c, next)
// })


// app.use(
//   '*',
//   cors({
//     origin: ['http://localhost:5173','https://auto-chad.vercel.app/'],
//     allowHeaders: ['Origin', 'Content-Type', 'Authorization'],
//     allowMethods: ['GET', 'OPTIONS', 'POST', 'PUT', 'DELETE'],
//     credentials: true,
//   })
// );

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

// Get all the drivers list
app.get('/autoStand/all', async (c) => {
  const drivers = await c.env.DB.prepare('SELECT * from AutoStand').all();
  return c.json(drivers);
})

// Post the new drivers
app.post('/autoStand/new', async (c) => {
  try {
    const { FirstName, LastName, PhoneNumber, LicenseNumber, VehicleType, VehicleModel, VehicleNumber, AreaName } = await c.req.json();
    const { success } = await c.env.DB.prepare(
      'INSERT INTO AutoStand (FirstName, LastName, PhoneNumber, LicenseNumber, VehicleType, VehicleModel, VehicleNumber, AreaName) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(FirstName, LastName, PhoneNumber.toString(), LicenseNumber, VehicleType, VehicleModel, VehicleNumber, AreaName.toLowerCase()).run();

    if (success) {
      return c.json({ message: "Driver added successfully" });
    } else {
      return c.text("Driver not added", 500);
    }
  } catch (error:any) {
    return c.text(`Error: ${error.message}`, 500);
  }
});

// Get drivers by area name
app.get('/autoStand/:AreaName', async (c) => {
  const area = c.req.param('AreaName');
  const drivers = await c.env.DB.prepare('SELECT * from AutoStand where AreaName = ? ').bind(area).all();
  return c.json(drivers);
})

export default app
