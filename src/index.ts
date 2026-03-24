import 'dotenv/config'
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'
import Fastify from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { jsonSchemaTransform } from 'fastify-type-provider-zod'

const app = Fastify({
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

await app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
}) 

app.withTypeProvider<ZodTypeProvider>().route({
  method: 'GET',
  url: "/",
  schema: {
    response: {
      200: z.object({
        message: z.string(),
      }),
    },
  },
  handler: async () => {
    return { message: "Hello, World!" };
  },
});


try {
  await app.listen({ port: Number(process.env.PORT) })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}