import { GraphQLClient } from "graphql-request";
const graphqlClient = new GraphQLClient("http://localhost:3001/graphql");

export const graphqlFetcher = async (query: string) => {
  return graphqlClient.request(query);
};
