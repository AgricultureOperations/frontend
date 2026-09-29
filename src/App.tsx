import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage, RegisterPage } from './features/auth';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { UsersPage } from './features/users';
import { DashboardPage } from './features/dashboard';
import { OrdersPage } from './features/orders';
import { MaintainersPage } from './features/maintainers';
import { ProductsMaintainerPage } from './features/products';
import { AppLayout } from './shared/components/AppLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path='/login' element={<LoginPage/>} />
        <Route path='/register' element={<RegisterPage/>} />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path='/dashboard' element={<DashboardPage />} />
          <Route path='/users' element={<UsersPage />} />
          <Route path='/orders' element={<OrdersPage />} />
          <Route path='/products' element={<ProductsMaintainerPage />} />
          <Route path='/maintainers' element={<MaintainersPage />} />
          {/* Products used to live under Maintainers; keep old links working. */}
          <Route path='/maintainers/products' element={<Navigate to="/products" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
    );
}

export default App
