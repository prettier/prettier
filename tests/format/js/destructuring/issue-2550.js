// Simple multi-line destructuring
const {
  prop1,
  prop2,
  prop3,
  prop4,
  prop5,
} = someObject;

// Single property
const {
  singleProp,
} = obj;

// Empty destructuring
const {} = emptyObj;

// With rest operator
const {
  first,
  second,
  ...rest
} = obj;

// With defaults
const {
  a = 1,
  b = 2,
  c = 3,
} = obj;

// With renaming
const {
  oldName: newName,
  another: renamed,
} = obj;

// Mixed nested and flat
const {
  flat1,
  nested: {
    inner1,
    inner2,
  },
  flat2,
} = obj;

// React - hooks
function useUserData() {
  const {
    data,
    error,
    isLoading,
    isError,
    refetch,
  } = useQuery('user');
  
  return { data, error };
}

// React - context
function MyComponent() {
  const {
    theme,
    language,
    user,
    permissions,
    settings,
  } = useContext(AppContext);
  
  return null;
}

// Vue - toRefs
const vueComponent = {
  setup(props) {
    const {
      modelValue,
      placeholder,
      disabled,
      readonly,
      maxLength,
    } = toRefs(props);
    
    return { modelValue };
  }
};

// Vue - composable
function useCounter() {
  const {
    count,
    increment,
    decrement,
    reset,
  } = useCounterStore();
  
  return { count, increment };
}

// Angular - RxJS subscribe
this.store.select(selectUser).subscribe(({
  id,
  name,
  email,
  role,
  permissions,
}) => {
  console.log(name);
});

// Svelte - props
const {
  title,
  description,
  imageUrl,
  author,
  publishedDate,
} = props;

// Ember - component
class UserComponent {
  get userData() {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      address,
    } = this.args.user;
    
    return { firstName, lastName };
  }
}

// Next.js - getServerSideProps
async function getServerSideProps({
  params,
  query,
  req,
  res,
  resolvedUrl,
}) {
  return { props: {} };
}

// Next.js - API route
function handler({
  method,
  body,
  query,
  headers,
  cookies,
}) {
  return { success: true };
}

// Express - middleware
app.use(({
  method,
  url,
  headers,
  body,
  query,
}, res, next) => {
  next();
});

// Express - route handler
app.get('/user/:id', ({
  params,
  query,
  body,
  headers,
  cookies,
}, res) => {
  res.json({ success: true });
});

// Redux - action payload
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, {
      payload: {
        id,
        name,
        email,
        role,
      }
    }) => {
      state.user = { id, name, email, role };
    }
  }
});

// Redux - selector
const selectUserData = createSelector(
  selectUser,
  ({
    profile,
    settings,
    preferences,
    notifications,
  }) => ({
    profile,
    settings,
  })
);

// GraphQL - Apollo query
function UserProfile() {
  const {
    data,
    loading,
    error,
    refetch,
    networkStatus,
  } = useQuery(GET_USER);
  
  return loading ? <Spinner /> : <div>{data.user.name}</div>;
}

// GraphQL - resolver
const resolvers = {
  Query: {
    user: (parent, {
      id,
      includeProfile,
      includeSettings,
    }, {
      dataSources,
      user,
    }) => {
      return dataSources.userAPI.getUser(id);
    }
  }
};

// Nested destructuring - complex
const {
  user: {
    profile: {
      firstName,
      lastName,
      email,
    },
    settings: {
      theme,
      language,
      notifications: {
        email: emailNotifications,
        push: pushNotifications,
      },
    },
  },
  metadata: {
    createdAt,
    updatedAt,
  },
} = data;

// Testing Library - queries
test('renders user profile', () => {
  const {
    getByText,
    getByRole,
    getByTestId,
    queryByText,
  } = render(<UserProfile />);
  
  expect(getByText('John Doe')).toBeInTheDocument();
});

// Jest - test utilities
describe('UserService', () => {
  it('should fetch user', async () => {
    const {
      getUser,
      updateUser,
      deleteUser,
      listUsers,
    } = userService;
    
    const user = await getUser('123');
    expect(user).toBeDefined();
  });
});

// Import destructuring
const {
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback,
} = React;

// Arrow function with destructuring
const processUser = ({
  id,
  name,
  email,
  role,
  permissions,
}) => {
  return { id, name };
};

// Complex nested in function
async function processUserData({
  user: {
    profile: {
      firstName,
      lastName,
    },
    settings: {
      theme,
      language,
    },
  },
  metadata: {
    createdAt,
    updatedAt,
  },
}) {
  return { firstName, lastName, theme };
}

// Assignment expression
({
  x,
  y,
  z,
} = coordinates);

// For-of loop
for (const {
  id,
  name,
  value,
} of items) {
  console.log(id);
}
