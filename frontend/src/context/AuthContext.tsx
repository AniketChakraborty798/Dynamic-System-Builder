import { createContext } from 'react';

const AuthContext = createContext<any>({
  user: null,
  setUser: () => {}
});

export default AuthContext;
