const { buildSchema } = require ('graphql');

const schema = buildSchema (`
  type Error {
    message: String
  }

  type User {
    id: ID
    name: String
    email: String
    created_at: String
    role: String
  }

  type UserWithErrors {
    user: User
    errors: [Error]
  }

  input UserInput {
    id: ID
    email: String
    name: String
  }

  input CreateUserInput {
    userData: UserInput!
  }

  type CreateUserPayload {
    user: User
    errors: [Error]
  }

  input UpdateUserInput {
    userData: UserInput!
  }

  type UpdateUserPayload {
    user: User
    errors: [Error]
  }

  input DeleteUserInput {
    id: ID!
  }

  type DeleteUserPayload {
    user: User
    errors: [Error]
  }

  type RootMutation {
    createUser(input: CreateUserInput!): CreateUserPayload
    updateUser(input: UpdateUserInput!): UpdateUserPayload
    deleteUser(input: DeleteUserInput!): DeleteUserPayload
  }

  type RootQuery {
    userById(id: String!): UserWithErrors
    userByEmail(email: String!): UserWithErrors
  }

  schema {
    query: RootQuery
    mutation: RootMutation
  }
`);

module.exports = schema;
