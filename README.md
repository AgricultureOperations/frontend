# 🌱 AgriOps Web
🌐 **Live Demo:** https://agricultureops.netlify.app

<p>
Frontend client application for the AgriOps platform, built with <strong>React</strong>, <strong>Vite</strong>, and <strong>TypeScript</strong>.

AgriOps Web integrates with the AgriOps Backend API to provide authentication, protected routes, and agricultural operations management features.

This project follows a scalable, domain-driven architecture with clean separation between UI, business logic, and API layers, now including <strong>Redux Toolkit</strong> for global state management.
</p>

---

## 🚀 Features

- User authentication (Login & Register)
- Table built with TanStack Table
- Protected routes with token-based access control
- **Redux Toolkit** state management for auth and registration
- Typed Redux hooks (`useAppDispatch`, `useAppSelector`) for type-safe state access
- API abstraction layer for backend communication
- Custom React hooks for business logic encapsulation
- Domain-based folder structure (feature-first architecture)
- Modular CSS styling
- Fast development with Vite
- Environment-based configuration
- Reusable shared components (Spinner, Error handling, etc.)

---

## 🛠 Tech Stack

- React 18
- TypeScript (strict mode)
- Vite
- Axios
- Redux Toolkit
- React Router
- ESLint
- Yup
- TanStack Table

---

## 📁 Project Structure

```bash
src/
 ├── api/                     # Axios configuration & API base setup
 │
 ├── features/
 │    ├── auth/
 │    │    ├── apis/       # API calls (login, register)
 │    │    ├── hooks/         # useLogin, useRegister
 │    │    ├── interfaces/    # Response & request types
 │    │    ├── pages/         # LoginPage, RegisterPage
 │    │    ├── states/         # Redux slice(s) for auth   
 │    │    └── validations/   # Form validation schemas
 │    │
 │    ├── dashboard/          # Dashboard domain logic
 │    │    ├── components/    
 │    │    ├── interfaces/    
 │    │    ├── pages/         # DashboardPage
 │    │    └── validations/   # Form validation schemas
 │    │
 │    ├── orders/             # Orders-related domain logic   
 │    │    ├── components/    # OrdersTable
 │    │    ├── data/          # dataMock
 │    │    ├── hooks/         # useOrdersTable
 │    │    ├── interfaces/    # interfaces
 │    │    └── pages/         # OrdersPage
 │    │
 │    └── users/              # User-related domain logic
 │         ├── actions/       # API calls (fetch-users)
 │         ├── components/    # UserList
 │         ├── hooks/         # useApp, useUsers
 │         ├── interfaces/    # Interface & Response
 │         ├── pages/         # UsersPage
 │         └── validations/   # Form validation schemas
 ├── routes/
 │    └── ProtectedRoute.tsx  # Route guard component
 │
 ├── shared/components/       # Reusable UI components
 │    ├── Spinner.tsx
 │    ├── SharedError.tsx
 │    └── CustomHeader.tsx
 │
 ├── store/                   # Root store configuration
 │    ├── store.ts            # Redux store combining all slices
 │    └── hooks.ts            # useAppDispatch & useAppSelector
 │
 ├── App.tsx
 ├── main.tsx
 └── index.css
```

---

## 🔗 Backend Integration

AgriOps Web connects to:

👉 agriops-api (REST API): https://github.com/edwardcruzcruz/agriops-api

The backend handles:

- Authentication & JWT token issuance

- User management

- Business logic & database operations

- Secure endpoints

- Currently using mock data for Orders module

---

## 🌐 Environment Configuration

Create a .env file in the root directory:

```bash
# Local development
VITE_BITACORA_BASE_URL=http://localhost:3000/api/v1

# For production (deployed backend)
# Replace <YOUR_RENDER_URL> with your actual Render deployment URL
VITE_BITACORA_BASE_URL=https://<YOUR_RENDER_URL>/api/v1
```

An .env.example file is included for reference.

---

## ⚙️ Installation

### 1. Clone the repo:

```bash
git clone https://github.com/your-username/agriops-web.git
```

### 2. Install dependencies:

```bash
npm install
```

### 3. Create .env file with:

```bash
VITE_API_BASE_URL=http://localhost:3000/api
```

### 4. Run the development server:

```bash
npm run dev
```

---

## 🔐 Authentication Flow

1. User submits login/register form

2. Input validated using Yup schemas

3. Component dispatches Redux async thunk (loginThunk / registerThunk)

4. Thunk calls API (postLogin / postRegister) and returns a response

5. Slice updates global Redux state:

- token, loading, error, success

6. Component reads state using typed selector:

```bash
const { token, loading, error } = useAppSelector(state => state.auth);
```

7. Navigation is handled in the component/hook:

```bash
useEffect(() => {
  if (token) navigate("/dashboard");
}, [token]);
```

8. Protected routes (ProtectedRoute.tsx) check token presence in Redux state or localStorage

---

## 🧠 Redux Design Decisions

- ✅ Feature-based slices (authSlice, registerSlice)

- ✅ Typed hooks for dispatch and selector

- ✅ Async thunks encapsulate API calls

- ✅ No navigation in slice — handled by components/hooks

- ✅ Global state managed centrally via store/store.ts

- ✅ Slices modular per feature for scalability

---

## 🧠 Design Decisions

- ✅ Domain-driven folder structure (feature-based)

- ✅ Clear separation between API layer and UI components

- ✅ Business logic encapsulated in custom hooks

- ✅ Type-safe interfaces for API responses

- ✅ Reusable shared components

- ✅ Protected routing abstraction

- ✅ Centralized error handling per domain 

- ✅ Use of TanStack Table for flexible data handling

- ✅ Deployment on Netlify  

- ✅ CI/CD pipeline with GitHub Actions

---

## 🔮 Future Improvements

- Role-based authorization (Admin / Operator)

- Token refresh mechanism

- Global API error interceptor

- Replace mock data with real backend API(order-service)

- Additional feature slices for other domains (users)

- Unit & integration testing (Vitest + Testing Library)

---

## 📌 Author

**Edward Cruz**  
Full Stack Developer | React | TypeScript | REST APIs