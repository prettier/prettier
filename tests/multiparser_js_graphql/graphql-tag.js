import gql from "graphql-tag";

const query = gql`
      {
    user(   id :   5  )  {
      firstName

      lastName
    }
  }
`;
