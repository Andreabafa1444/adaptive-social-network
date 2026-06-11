import { createContext, useContext } from "react";
export const ConnectionContext = createContext("fast");
export function useConnectionContext() {
  return useContext(ConnectionContext);
}
