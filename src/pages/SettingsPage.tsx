import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UsersRound, Building2, Droplets, KeyRound, Database, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ApiSettingsPage } from './settings/ApiSettingsPage';
import { AuthSettingsPage } from './settings/AuthSettingsPage';
import { EmployeesPage } from './settings/EmployeesPage';
import { OrganizationsPage } from './settings/OrganizationsPage';
import { ServicesPage } from './settings/ServicesPage';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

export function SettingsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('general');
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Определяем активную вкладку на основе URL при монтировании
  useEffect(() => {
    setMounted(true);
    const path = location.pathname;
    if (path.includes('/settings/auth')) setActiveTab('general');
    else if (path.includes('/settings/employees')) setActiveTab('staff');
    else if (path.includes('/settings/services')) setActiveTab('staff');
    else if (path.includes('/settings/organizations')) setActiveTab('staff');
    else if (path.includes('/settings/api')) setActiveTab('integrations');
    else setActiveTab('general');
  }, [location.pathname]);

  // Обработчик изменения вкладки
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className={cn(
      "space-y-6",
      isDark ? "bg-slate-950" : ""
    )}>
      <div>
        <h2 className={cn(
          "text-3xl font-bold tracking-tight mb-2",
          isDark ? "text-slate-100" : ""
        )}>Настройки</h2>
        <p className={cn(
          "text-muted-foreground",
          isDark ? "text-slate-400" : ""
        )}>
          Управление системными настройками автомойки
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-6"
      >
        <div className="max-w-md">
          <TabsList className={cn(
            "grid grid-cols-3 w-full p-1 rounded-lg",
            isDark ? "bg-slate-900" : "bg-muted/50"
          )}>
            <TabsTrigger
              value="general"
              className={cn(
                "flex items-center gap-2",
                isDark
                  ? "data-[state=active]:bg-slate-800 data-[state=active]:text-slate-100"
                  : "data-[state=active]:bg-background"
              )}
            >
              <KeyRound className="h-4 w-4" />
              <span>Общие</span>
            </TabsTrigger>
            <TabsTrigger
              value="staff"
              className={cn(
                "flex items-center gap-2",
                isDark
                  ? "data-[state=active]:bg-slate-800 data-[state=active]:text-slate-100"
                  : "data-[state=active]:bg-background"
              )}
            >
              <UsersRound className="h-4 w-4" />
              <span>Данные</span>
            </TabsTrigger>
            <TabsTrigger
              value="integrations"
              className={cn(
                "flex items-center gap-2",
                isDark
                  ? "data-[state=active]:bg-slate-800 data-[state=active]:text-slate-100"
                  : "data-[state=active]:bg-background"
              )}
            >
              <Globe className="h-4 w-4" />
              <span>API</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Содержимое вкладок */}
        <AnimatePresence mode="wait">
          {mounted && (
            <>
              {/* Общие настройки */}
              <TabsContent value="general" className="space-y-5 mt-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="max-w-4xl mx-auto lg:mx-0"
                >
                  <Card className={cn(
                    "overflow-hidden border",
                    isDark ? "bg-slate-900 border-slate-800" : ""
                  )}>
                    <CardHeader className={cn(
                      "bg-gradient-to-r from-purple-500 to-violet-500 text-white",
                      isDark ? "bg-gradient-to-r from-purple-900 to-violet-900" : ""
                    )}>
                      <div className="flex items-center">
                        <div className={cn(
                          "bg-white p-2 rounded-full shadow-md mr-3",
                          isDark ? "bg-slate-800" : ""
                        )}>
                          <KeyRound className={cn(
                            "h-5 w-5 text-purple-600",
                            isDark ? "text-purple-400" : ""
                          )} />
                        </div>
                        <div>
                          <CardTitle className="text-xl">Настройки аккаунта</CardTitle>
                          <CardDescription className={cn(
                            "text-purple-100 mt-1",
                            isDark ? "text-purple-200" : ""
                          )}>
                            Управление аутентификацией и данными пользователя
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className={cn(
                      "p-0",
                      isDark ? "bg-slate-900" : ""
                    )}>
                      <AuthSettingsPage />
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Данные */}
              <TabsContent value="staff" className="space-y-5 mt-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="max-w-4xl mx-auto lg:mx-0"
                >
                  <Card className={cn(
                    "overflow-hidden shadow",
                    isDark ? "bg-slate-900 border-slate-800" : ""
                  )}>
                    <CardHeader className={cn(
                      "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
                      isDark ? "bg-gradient-to-r from-blue-900 to-blue-800" : ""
                    )}>
                      <div className="flex items-center">
                        <div className={cn(
                          "bg-white p-2 rounded-full shadow-md mr-3",
                          isDark ? "bg-slate-800" : ""
                        )}>
                          <UsersRound className={cn(
                            "h-5 w-5 text-blue-600",
                            isDark ? "text-blue-400" : ""
                          )} />
                        </div>
                        <CardTitle className="text-xl">Данные</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className={cn(
                      "p-5",
                      isDark ? "bg-slate-900" : ""
                    )}>
                      <Tabs defaultValue="employees" className="w-full">
                        <TabsList className={cn(
                          "grid grid-cols-3 w-full",
                          isDark ? "bg-slate-800" : ""
                        )}>
                          <TabsTrigger value="employees">Сотрудники</TabsTrigger>
                          <TabsTrigger value="services">Услуги</TabsTrigger>
                          <TabsTrigger value="organizations">Организации</TabsTrigger>
                        </TabsList>
                        <TabsContent value="employees" className="mt-4">
                          <EmployeesPage />
                        </TabsContent>
                        <TabsContent value="services" className="mt-4">
                          <ServicesPage />
                        </TabsContent>
                        <TabsContent value="organizations" className="mt-4">
                          <OrganizationsPage />
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Интеграции - API */}
              <TabsContent value="integrations" className="space-y-5 mt-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="max-w-4xl mx-auto lg:mx-0"
                >
                  <Card className={cn(
                    "overflow-hidden border",
                    isDark ? "bg-slate-900 border-slate-800" : ""
                  )}>
                    <CardHeader className={cn(
                      "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
                      isDark ? "bg-gradient-to-r from-amber-900 to-orange-900" : ""
                    )}>
                      <div className="flex items-center">
                        <div className={cn(
                          "bg-white p-2 rounded-full shadow-md mr-3",
                          isDark ? "bg-slate-800" : ""
                        )}>
                          <Database className={cn(
                            "h-5 w-5 text-amber-600",
                            isDark ? "text-amber-400" : ""
                          )} />
                        </div>
                        <div>
                          <CardTitle className="text-xl">Настройки API</CardTitle>
                          <CardDescription className={cn(
                            "text-amber-100 mt-1",
                            isDark ? "text-amber-200" : ""
                          )}>
                            Управление внешними интеграциями и API ключами
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className={cn(
                      "p-0",
                      isDark ? "bg-slate-900" : ""
                    )}>
                      <ApiSettingsPage />
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </>
          )}
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
