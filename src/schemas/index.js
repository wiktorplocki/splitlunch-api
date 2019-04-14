const { buildSchema } = require('graphql');

module.exports = buildSchema(`
  type User {
    _id: ID!
    email: String!
    password: String
    name: String
    balance: Float
    orders: [Order!]
  }

  type Order {
    _id: ID!
    name: String!
    description: String
    sumTotal: Float!
    date: String!
    participants: [User!]
    details: [OrderItem!]
    finalized: Boolean!
    creator: User!
    createdAt: String!
    updatedAt: String!
  }

  type OrderItem {
    _id: ID!
    item: String!
    price: Float!
    order: Order!
    participant: User!
    createdAt: String!
    updatedAt: String!
  }

  type AuthData {
    userId: ID!
    token: String!
    tokenExpiry: Int!
  }

  input UserInput {
    email: String!
    password: String!
    name: String
  }

  input OrderItemInput {
    orderId: ID!
    participant: ID!
    item: String!
    price: Float!
  }

  input OrderInput {
    name: String!
    description: String
    date: String!
  }

  type RootQuery {
    orders: [Order!]!
    order(id: ID!): Order!
    orderItems(orderId: ID!): [OrderItem!]!
    users: [User!]!
    user(id: ID!): User!
    login(email: String!, password: String!): AuthData!
  }

  type RootMutation {
    createUser(userInput: UserInput): User
    createOrder(orderInput: OrderInput): Order!
    createOrderItem(orderItemInput: OrderItemInput): OrderItem!
    deleteOrderItem(orderItemId: ID!): Order!
    joinOrder(orderId: ID!): Order!
    leaveOrder(orderId: ID!): Order!
    finalizeOrder(orderId: ID!): Order!
  }

  schema {
    query: RootQuery
    mutation: RootMutation
  }
`);
