import { createContext, useContext, useReducer } from "react";


const FormContext = createContext();

const initialState = {
  accessToken: localStorage.getItem("access_token") || null,
  refreshToken: localStorage.getItem("refresh_token") || null,
  isAuthenticated: !!localStorage.getItem("access_token"),
  forms: [],
  submissions: [],
  user: {},
};



function reducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      localStorage.setItem("access_token", action.payload.access);
      localStorage.setItem("refresh_token", action.payload.refresh);
      return {
        ...state,
        accessToken: action.payload.access,
        refreshToken: action.payload.refresh,
        isAuthenticated: true,
      };

    case "LOGOUT":
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      return {
        ...state,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        user: null,
      };

    case "SET_FORMS":
      return {
        ...state,
        forms: action.payload,
      };
    
    case "SET_SUBMISSIONS":
      return {
        ...state,
        submissions: action.payload,
      };
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
      };
    
    

    default:
      return state;
  }
}

export function FormProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <FormContext.Provider value={{ state, dispatch }}>
      {children}
    </FormContext.Provider>
  );
}

export function useFormStore() {
  return useContext(FormContext);
}
