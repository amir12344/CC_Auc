import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/*
 * Define an EarlyAccessRegistration model for storing early access form submissions
 * This model replaces the Todo example and is configured for public access
 * to allow unauthenticated users to submit the form
 */
const schema = a.schema({
  EarlyAccessRegistration: a
    .model({
      firstName: a.string().required(),
      lastName: a.string().required(),
      companyName: a.string().required(),
      email: a.string().required(),
      phoneNumber: a.string().required(),
      termsAccepted: a.boolean().required(),
      registrationDate: a.datetime().required(),
    })
    .authorization((allow) => [
      // Allow public access for creating and reading records
      allow.publicApiKey().to(['create', 'read']),
      // Restrict other operations to admin users only
      // This ensures only authorized users can update, or delete records
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
