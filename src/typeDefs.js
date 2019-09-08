import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type User {
    _id: ID!
    email: String!
    password: String
    name: String
    balance: Float
    orders: [Order!]
    count: Int
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
    # orders: [Order!]!
    # order(id: ID!): Order!
    # orderItems(orderId: ID!): [OrderItem!]!
    # users: [User!]
    # user(id: ID!): User
    me: User
  }

  type Mutation {
    # createUser(userInput: UserInput): User
    # createOrder(OrderInput: OrderInput): Order!
    # createOrderItem(orderItemInput: OrderItemInput): OrderInput!
    # deleteOrderItem(OrderItemId: ID!): Order!
    # joinOrder(orderId: ID!): Order!
    # leaveOrder(orderId: ID!): Order!
    # finalizeOrder(orderId: ID!): Order!
    # finalizeOrderWithParticipant(orderId: ID!, userId: ID!): Order!
    login(email: String!, password: String!): User!
    register(email: String!, password: String!): Boolean
    invalidateTokens: Boolean!
  }
`;