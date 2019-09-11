import * as Auth from './auth';

const resolvers = {
  Query: { ...Auth.Query },
  Mutation: { ...Auth.Mutation }
};

export default resolvers;
