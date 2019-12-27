const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    _id: ID!
    email: String!
    password: String
    name: String
    balance: Float
    orders: [Order!]
    tokenVersion: Int
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

  type LoginResponse {
    accessToken: String
    user: User
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

  type Query {
    orders: [Order!]!
    order(id: ID!): Order!
    lastNumOrders(count: Int!): [Order]!
    # orderItems(orderId: ID!): [OrderItem!]!
    users: [User!]
    user(id: ID!): User
    me: User
    hello: String
    bye: String
  }

  type Mutation {
    createOrder(OrderInput: OrderInput): Order!
    createOrderWithoutDetails(OrderInput: OrderInput): Order!
    createOrderItem(orderItemInput: OrderItemInput): OrderItem!
    deleteOrderItem(OrderItemId: ID!): Order!
    joinOrder(orderId: ID!): Order!
    leaveOrder(orderId: ID!): Order!
    finalizeOrder(orderId: ID!): Order!
    # finalizeOrderWithParticipant(orderId: ID!, userId: ID!): Order!
    login(email: String!, password: String!): LoginResponse
    logout: Boolean!
    register(email: String!, password: String!): Boolean
    invalidateRefreshTokens(userId: ID!): Boolean
  }
`;

module.exports = typeDefs;
