import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { AppProvider } from '@/context/AppContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Toaster } from '@/components/ui/toaster';
import { DashboardPage } from '@/pages/DashboardPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ApiSettingsPage } from '@/pages/settings/ApiSettingsPage';
import { EmployeesPage } from '@/pages/settings/EmployeesPage';
import { OrganizationsPage } from '@/pages/settings/OrganizationsPage';
import { ServicesPage } from '@/pages/settings/ServicesPage';
import { LoginPage } from '@/pages/LoginPage';
import { AuthSettingsPage } from '@/pages/settings/AuthSettingsPage';

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <Router>
          <Routes>
            {/* Публичные маршруты */}
            <Route path="/login" element={<LoginPage />} />

            {/* Защищенные маршруты */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ReportsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Layout>
                    <SettingsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/api"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ApiSettingsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/employees"
              element={
                <ProtectedRoute>
                  <Layout>
                    <EmployeesPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            {/* Перенаправляем старый путь /settings/firebase на новый /settings/api */}
            <Route
              path="/settings/firebase"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ApiSettingsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/organizations"
              element={
                <ProtectedRoute>
                  <Layout>
                    <OrganizationsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/services"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ServicesPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/auth"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AuthSettingsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
        <Toaster />
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
