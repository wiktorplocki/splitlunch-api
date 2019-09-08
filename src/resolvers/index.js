import { authQuery, authMutation } from './auth';

const resolvers = {
  Query: { ...authQuery },
  Mutation: { ...authMutation }
};

export default resolvers;
