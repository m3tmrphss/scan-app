  
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'; 
import MainNode from './components/main/main';
import Authorize from './components/main/authorize';
import SearchPage from './components/main/searchPage';
import Layout from './components/Layout'; 
import { useContext } from 'react';
import { authorizeContext } from './components/context/authorizeContext';
import SearchOutput from './components/main/searchOutput';
function ProtectedRoute({children}) {
  let {isAuthorized} = useContext(authorizeContext)
  if (!isAuthorized) {
    return <Navigate to="/authorize" replace />
  }
  return children
}
function AuthorizeRoute({children}) {

  let {isAuthorized} = useContext(authorizeContext)
  if (isAuthorized) {
    return <Navigate to='/' replace />
  }
  return children
}
function App() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Routes>
        <Route path="/" element={<Layout />}> 
          <Route index element={<MainNode />}/>
          <Route path='/authorize' element={
            <AuthorizeRoute>
              <Authorize />
            </AuthorizeRoute>
          }/>
          <Route path='/result' element={
            <ProtectedRoute>
              <SearchOutput /> 
            </ProtectedRoute> 
            } />
          <Route path='/search' element={
            <ProtectedRoute>
              <SearchPage />
            </ProtectedRoute> 
            } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
