import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Info, Server, Shield, Globe, Database, Zap, Cloud, ExternalLink } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  isDark: boolean;
}

const Feature: React.FC<FeatureProps> = ({ icon, title, description, color, isDark }) => (
  <div className={cn(
    "flex items-start space-x-3 p-3 rounded-lg transition-all",
    isDark
      ? `bg-${color}-900/20 border border-${color}-900/30 hover:bg-${color}-900/30`
      : `bg-white border border-${color}-100 hover:shadow-md hover:border-${color}-200`
  )}>
    <div className={cn(
      "flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg mt-0.5",
      isDark ? `bg-${color}-900/70 text-${color}-400` : `bg-${color}-100 text-${color}-700`
    )}>
      {icon}
    </div>
    <div>
      <h4 className={cn(
        "text-sm font-medium mb-1",
        isDark ? `text-${color}-300` : `text-${color}-700`
      )}>
        {title}
      </h4>
      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} opacity-90 leading-relaxed`}>
        {description}
      </p>
    </div>
  </div>
);

interface ApiInfoCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  moreUrl?: string;
  type: 'weather' | 'firebase';
}

export function ApiInfoCard({ title, description, icon, color, moreUrl, type }: ApiInfoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Получаем классы для карточки в зависимости от цвета и темы
  const getCardClasses = () => {
    return cn(
      "rounded-xl border overflow-hidden shadow-sm transition-all duration-300",
      isDark
        ? `border-${color}-800/50 bg-gradient-to-b from-${color}-950/30 to-slate-900/70 hover:shadow-${color}-900/10`
        : `border-${color}-200 bg-gradient-to-b from-${color}-50/80 to-white hover:shadow-${color}-100/30`
    );
  };

  return (
    <div className={getCardClasses()}>
      {/* Заголовок */}
      <div
        className="p-5 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className={cn(
              "flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg",
              isDark ? `bg-${color}-900/70 text-${color}-400` : `bg-${color}-100 text-${color}-700`
            )}>
              {icon}
            </div>

            <div>
              <h3 className={cn(
                "text-base font-semibold",
                isDark ? `text-${color}-300` : `text-${color}-700`
              )}>
                {title}
              </h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-0.5 pr-8`}>
                {description}
              </p>
            </div>
          </div>

          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className={`flex-shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
          >
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </div>
      </div>

      {/* Контент */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className={cn(
              "px-5 pb-5 pt-0",
              isDark ? `border-t border-${color}-900/30` : `border-t border-${color}-100`
            )}>
              <div className="grid gap-3">
                {type === 'weather' && (
                  <>
                    <Feature
                      icon={<Globe className="h-4 w-4" />}
                      title="Глобальное покрытие"
                      description="Получение погодных данных из любой точки мира с использованием геокоординат или названий населенных пунктов."
                      color={color}
                      isDark={isDark}
                    />
                    <Feature
                      icon={<Cloud className="h-4 w-4" />}
                      title="Прогнозы и история"
                      description="Получение текущих данных, прогнозов на 14 дней и исторических данных о погоде для любого местоположения."
                      color={color}
                      isDark={isDark}
                    />
                    <Feature
                      icon={<Zap className="h-4 w-4" />}
                      title="Производительность"
                      description="Высокоскоростное API с низкой задержкой, оптимизированное для быстрой загрузки данных даже на медленных соединениях."
                      color={color}
                      isDark={isDark}
                    />
                  </>
                )}

                {type === 'firebase' && (
                  <>
                    <Feature
                      icon={<Database className="h-4 w-4" />}
                      title="Облачная база данных"
                      description="NoSQL база данных, обеспечивающая синхронизацию данных между клиентами в реальном времени."
                      color={color}
                      isDark={isDark}
                    />
                    <Feature
                      icon={<Shield className="h-4 w-4" />}
                      title="Безопасность"
                      description="Защита данных с помощью шифрования и гибких правил доступа на уровне базы данных и документов."
                      color={color}
                      isDark={isDark}
                    />
                    <Feature
                      icon={<Server className="h-4 w-4" />}
                      title="Масштабируемость"
                      description="Автоматическое масштабирование и высокая доступность без необходимости управления серверами."
                      color={color}
                      isDark={isDark}
                    />
                  </>
                )}

                {moreUrl && (
                  <div className="flex justify-end mt-2">
                    <a
                      href={moreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "inline-flex items-center text-xs font-medium",
                        isDark ? `text-${color}-400 hover:text-${color}-300` : `text-${color}-600 hover:text-${color}-700`
                      )}
                    >
                      <span>Подробнее на официальном сайте</span>
                      <ExternalLink className="h-3 w-3 ml-1.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
