import { useState, useMemo, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import HeaderNode from './header/header';
import FooterNode from './footer/footer';
import { authorizeContext } from './context/authorizeContext';
 
 
export default function Layout() {
  function loadToken() {
    let stored = localStorage.getItem('authorization-data');
    if (!stored) return null;

    try {
      let token = JSON.parse(stored);
      if (!token.accessToken || !token.expire) return null;

      let now = Date.now();
      let expires = new Date(token.expire).getTime();
      if (expires <= now) {
        localStorage.removeItem('authorization-data');
        return null;
      } 
      return token;
    } catch {
      return null;
    }
  }
  let [token, setToken] = useState(() => loadToken());
  let [limitsInfo, setLimitsInfo] = useState({    
      usedCompanyCount: '',
      companyLimit : '',
  });
  let handleChangeData = (count, limit) => {
    
    setLimitsInfo((prev) => {
      return {
        ...prev, 
        usedCompanyCount: count,
        companyLimit: limit
      }
    })
  }
  let loginFunction = useCallback((newToken) => {
    localStorage.setItem('authorization-data', JSON.stringify(newToken));
    setToken(newToken);
  }, []);

  let logoutFunction = useCallback(() => {
    localStorage.removeItem('authorization-data');
    setToken(null);
  }, []);
  let isAuthorized = useMemo(() => token !== null, [token]);
 
  return (
    <>
      <authorizeContext.Provider value={{token, isAuthorized, loginFunction, logoutFunction, limitsInfo, handleChangeData}} >   
        <HeaderNode /> 
          <Outlet/> 
        <FooterNode/>
      </authorizeContext.Provider>
    </>
  );
}
