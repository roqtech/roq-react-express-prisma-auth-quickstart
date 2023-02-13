import { useCallback } from "react";

export const useFiles = (userId) => {
  const fetchList = useCallback(() => {
    
  }, [userId]);

  const saveFile = useCallback(() => {}, [userId]);

  return {
    fetchList,
    saveFile,
  };
};
