import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { NeomorphicBox } from './neomorphic-box';

interface ApiFeatureProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  color: string;
}

const ApiFeature: React.FC<ApiFeatureProps> = ({ icon, title, description, color }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="flex gap-3 items-start">
      <div className={cn(
        'flex-shrink-0 h-9 w-9 rounded-lg flex items-center justify-center',
        isDark
          ? `bg-${color}-900/30 text-${color}-400`
          : `bg-${color}-100 text-${color}-600`
      )}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium truncate">{title}</h4>
        {description && (
          <p className={cn(
            'text-xs mt-0.5 line-clamp-2',
            isDark ? 'text-slate-400' : 'text-slate-600'
          )}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

interface NeomorphicApiInfoProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  features: {
    icon: React.ReactNode;
    title: string;
    description?: string;
  }[];
  specifications?: {
    name: string;
    value: string;
  }[];
  color?: 'blue' | 'green' | 'purple' | 'orange';
  className?: string;
  externalUrl?: string;
}

export function NeomorphicApiInfo({
  title,
  description,
  icon,
  features,
  specifications,
  color = 'blue',
  className,
  externalUrl,
}: NeomorphicApiInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <NeomorphicBox
      className={cn('overflow-hidden', className)}
      color={color}
    >
      <div className="p-5">
        {/* Заголовок */}
        <div
          className="flex items-start justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={cn(
              'flex-shrink-0 h-11 w-11 rounded-lg flex items-center justify-center',
              isDark
                ? `bg-${color}-900/30 text-${color}-400`
                : `bg-${color}-100 text-${color}-600`
            )}>
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium truncate">{title}</h3>
              {description && (
                <p className={cn(
                  'text-sm mt-0.5 truncate',
                  isDark ? 'text-slate-400' : 'text-slate-600'
                )}>
                  {description}
                </p>
              )}
            </div>
          </div>

          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              'flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-full ml-2',
              isDark
                ? 'bg-slate-800 text-slate-500'
                : 'bg-slate-100 text-slate-500'
            )}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </div>

        {/* Расширенная информация */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-5 mt-5 border-t border-slate-200 dark:border-slate-700/50">
                {features && features.length > 0 && (
                  <div className="grid gap-4 mb-5">
                    {features.map((feature, index) => (
                      <ApiFeature
                        key={index}
                        icon={feature.icon}
                        title={feature.title}
                        description={feature.description}
                        color={color}
                      />
                    ))}
                  </div>
                )}

                {specifications && specifications.length > 0 && (
                  <div className={cn(
                    'rounded-xl p-4 mt-4',
                    isDark
                      ? 'bg-slate-800/50'
                      : 'bg-slate-100'
                  )}>
                    <h4 className="text-sm font-medium mb-3">Техническая информация</h4>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                      {specifications.map((spec, index) => (
                        <React.Fragment key={index}>
                          <div className={cn(
                            'text-xs font-medium truncate',
                            isDark ? 'text-slate-400' : 'text-slate-600'
                          )}>
                            {spec.name}:
                          </div>
                          <div className="text-xs truncate">
                            {spec.value}
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}

                {externalUrl && (
                  <div className="flex justify-end mt-4">
                    <a
                      href={externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'inline-flex items-center text-xs font-medium',
                        isDark
                          ? `text-${color}-400 hover:text-${color}-300`
                          : `text-${color}-600 hover:text-${color}-500`
                      )}
                    >
                      <span>Подробнее на официальном сайте</span>
                      <ExternalLink className="h-3 w-3 ml-1.5" />
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </NeomorphicBox>
  );
}
