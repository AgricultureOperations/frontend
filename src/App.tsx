import './App.css'
// import { UserList } from './features/users/components/UserList';
// import CustomHeader from './shared/components/CustomHeader';
// import { SearchBar } from './shared/components/SearchBar';
// import { useApp } from './features/users/hooks/useApp';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage, RegisterPage } from './features/auth';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { UsersPage } from './features/users';
import { DashboardPage } from './features/dashboard';
import { OrdersPage } from './features/orders';

function App() {
  // const title: string = 'Buscardor de correos'
  // const placeholder: string = 'Buscar correo'
  // const {filteredUsers,loading,error,handleSearch} = useApp();
  // if (loading) return <p>Loading...</p>
  // if (error) return <p>{error}</p>

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path='/login' element={<LoginPage/>} />
        <Route path='/register' element={<RegisterPage/>} />
        <Route path='/dashboard' element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path='/users' element={
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        } />
        <Route path='/orders' element={
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
    // <>
    //   {/* Header */}
    //   <CustomHeader title={title}/>

    //   {/* search bar */}
    //   <SearchBar placeholder={placeholder} onQuery={handleSearch} />
        
    //   <UserList users={filteredUsers} />
    // </>
    );
}

export default App
