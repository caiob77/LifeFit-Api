import 'dotenv/config'
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'
import fastify from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import fastifySwagger from '@fastify/swagger'
import { jsonSchemaTransform } from 'fastify-type-provider-zod'
import auth from './lib/auth.js'
import fastifyCors from '@fastify/cors'
import fastifyApiReference from '@scalar/fastify-api-reference'
import { workoutPlanRoutes } from './routes/workoutPlan.js'
import { meRoutes } from './routes/me.js'
import { homeRoutes } from './routes/home.js'
import { statsRoutes } from './routes/stats.js'

const app = fastify({
  logger: true
})

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

await app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'LifeFit API',
      description: 'API for the LifeFit app',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:8081',
      },
    ],
  },
  transform: jsonSchemaTransform
})

await app.register(fastifyCors, {
  origin: "http://localhost:3000",
  credentials: true,
})

await app.register(fastifyApiReference, {
  routePrefix: '/docs',
  configuration: {
    sources: [
      {
        title: 'LifeFit API',
        slug: 'lifefit-api',
        url: '/swagger.json',
      },
      {
        title: 'Auth API',
        slug: 'auth-api',
        url: '/api/auth/open-api/generate-schema',
      },
    ]
  },
}) 

app.withTypeProvider<ZodTypeProvider>().route({
  method: 'GET',
  url: "/swagger.json",
  schema: {
    hide: true,
  },
  handler: async () => {
    return app.swagger();
  },
}); 


await app.register(workoutPlanRoutes, { prefix: "/workout-plans" });
await app.register(homeRoutes, { prefix: "/home" });
await app.register(meRoutes, { prefix: "/me" });
await app.register(statsRoutes, { prefix: "/stats" });



app.route({
  method: ["GET", "POST"],
  url: "/api/auth/*",
  async handler(request, reply) {
    try {
      // Construct request URL
      const url = new URL(request.url, `http://${request.headers.host}`);
      
      // Convert Fastify headers to standard Headers object
      const headers = new Headers();
      Object.entries(request.headers).forEach(([key, value]) => {
        if (value) headers.append(key, value.toString());
      });
      // Create Fetch API-compatible request
      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        ...(request.body ? { body: JSON.stringify(request.body) } : {}),
      });
      // Process authentication request
      const response = await auth.handler(req);
      // Forward response to client
      reply.status(response.status);
      response.headers.forEach((value, key) => reply.header(key, value));
      reply.send(response.body ? await response.text() : null);
    } catch (error) {
      app.log.error(error as Error);
      reply.status(500).send({ 
        error: "Internal authentication error",
        code: "AUTH_FAILURE"
      });
    }
  }
});

try {
  await app.listen({ port: Number(process.env.PORT) })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}