import { useEffect, useState } from 'react';
import { FirebaseConnectionStatus } from '@/components/ui/firebase-connection-status';
import { Database, ShieldAlert, Clock, Server, Globe2, ChevronRight, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function FirebaseSettingsPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <div className="p-4 space-y-4">
      <AnimatePresence>
        {mounted && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {/* Статус соединения */}
            <motion.div
              className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm mb-4"
              whileHover={{ boxShadow: "0 2px 10px rgba(79, 70, 229, 0.15)" }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-sm font-semibold flex items-center text-indigo-700 mb-2">
                <Clock className="h-4 w-4 mr-1.5" />
                Статус соединения
              </h3>
              <FirebaseConnectionStatus />
            </motion.div>

            {/* Карточки с информацией */}
            <div className="space-y-3">
              {/* Секция безопасности */}
              <motion.div
                className="border rounded-lg overflow-hidden transition-all duration-200 shadow-sm"
                whileHover={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)" }}
              >
                <div
                  className={`p-3 flex justify-between items-center cursor-pointer ${activeSection === 'security' ? 'bg-indigo-50' : 'bg-white'}`}
                  onClick={() => toggleSection('security')}
                >
                  <div className="flex items-center">
                    <div className="bg-indigo-100 p-1.5 rounded-md mr-2">
                      <ShieldAlert className="h-4 w-4 text-indigo-600" />
                    </div>
                    <h3 className="text-sm font-medium">Безопасность и шифрование</h3>
                  </div>
                  <motion.div
                    animate={{ rotate: activeSection === 'security' ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </motion.div>
                </div>
                <AnimatePresence>
                  {activeSection === 'security' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 pt-0 bg-indigo-50">
                        <div className="bg-white rounded-md p-3 mt-2 shadow-sm">
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Все соединения с Firebase Firestore защищены с использованием TLS-шифрования.
                            Данные хранятся в зашифрованном виде и доступны только авторизованным пользователям.
                          </p>
                          <div className="flex items-center gap-1.5 mt-2 text-xs text-indigo-600 font-medium">
                            <Zap className="h-3 w-3" />
                            <span>256-битное шифрование данных</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Секция информации о подключении */}
              <motion.div
                className="border rounded-lg overflow-hidden transition-all duration-200 shadow-sm"
                whileHover={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)" }}
              >
                <div
                  className={`p-3 flex justify-between items-center cursor-pointer ${activeSection === 'info' ? 'bg-indigo-50' : 'bg-white'}`}
                  onClick={() => toggleSection('info')}
                >
                  <div className="flex items-center">
                    <div className="bg-indigo-100 p-1.5 rounded-md mr-2">
                      <Server className="h-4 w-4 text-indigo-600" />
                    </div>
                    <h3 className="text-sm font-medium">Информация о подключении</h3>
                  </div>
                  <motion.div
                    animate={{ rotate: activeSection === 'info' ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </motion.div>
                </div>
                <AnimatePresence>
                  {activeSection === 'info' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 pt-0 bg-indigo-50">
                        <div className="bg-white rounded-md p-3 mt-2 shadow-sm">
                          <div className="grid grid-cols-2 gap-2.5 text-xs">
                            <div className="flex items-center gap-1.5">
                              <div className="bg-blue-100 p-1 rounded-md">
                                <Database className="h-3 w-3 text-blue-600" />
                              </div>
                              <div className="font-medium">База данных</div>
                            </div>
                            <div className="text-slate-700">Firestore</div>

                            <div className="flex items-center gap-1.5">
                              <div className="bg-green-100 p-1 rounded-md">
                                <Globe2 className="h-3 w-3 text-green-600" />
                              </div>
                              <div className="font-medium">Регион</div>
                            </div>
                            <div className="text-slate-700">europe-west3</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            <motion.div
              className="text-center text-xs text-slate-400 mt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Firebase Firestore
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
