import 'dotenv/config'
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'
import Fastify from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

const app = Fastify({
  logger: true
})

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

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