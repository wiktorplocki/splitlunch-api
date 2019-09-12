import * as Auth from './auth';
import * as Order from './order';

const resolvers = {
  Query: { ...Auth.Query, ...Order.Query },
  Mutation: { ...Auth.Mutation, ...Order.Mutation }
};

export default resolvers;
