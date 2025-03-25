import { useEffect, useState } from 'react';
import { Cloud, Loader2, MapPin, Thermometer } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { Card } from '@/components/ui/card';

type WeatherData = {
  temp_c: number;
  condition: {
    text: string;
    icon: string;
  };
};

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=f6f6c5a0c1f1413ab48200836252403&q=Minsk,Belarus&aqi=no`
        );

        if (!response.ok) {
          throw new Error('Weather data fetch failed');
        }

        const data = await response.json();
        setWeather({
          temp_c: data.current.temp_c,
          condition: {
            text: data.current.condition.text,
            icon: data.current.condition.icon
          }
        });
        setError(false);
      } catch (err) {
        console.error('Error fetching weather:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    // Обновляем погоду каждые 30 минут
    const intervalId = setInterval(fetchWeather, 30 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Стили в зависимости от темы
  const containerStyles = isDark
    ? 'bg-slate-900 border-slate-700 hover:bg-slate-800'
    : 'bg-white border-blue-200 hover:bg-blue-50';

  const textStyles = isDark
    ? 'text-blue-300'
    : 'text-blue-600';

  const iconBgStyles = isDark
    ? 'bg-slate-800 text-blue-400'
    : 'bg-blue-50 text-blue-600';

  if (loading) {
    return (
      <Card className={`flex items-center justify-center h-10 px-3 transition-all duration-200 shadow-md ${containerStyles}`}>
        <Loader2 className={`h-4 w-4 animate-spin ${textStyles}`} />
      </Card>
    );
  }

  if (error || !weather) {
    return (
      <Card className={`flex items-center justify-center h-10 px-3 transition-all duration-200 shadow-md ${containerStyles}`}>
        <Cloud className={`h-4 w-4 mr-1.5 ${textStyles}`} />
        <span className={`text-sm font-medium ${textStyles}`}>Минск</span>
      </Card>
    );
  }

  return (
    <Card className={`flex items-center justify-center h-10 px-3 transition-all duration-200 shadow-md ${containerStyles}`}>
      <div className="flex items-center space-x-2">
        <div className={`flex items-center justify-center rounded-full p-0.5 ${iconBgStyles} w-5 h-5`}>
          <MapPin className="w-3 h-3" />
        </div>

        <span className={`text-sm font-medium ${textStyles}`}>Минск</span>

        {weather.condition.icon && (
          <div className={`flex justify-center items-center overflow-hidden rounded-full ${isDark ? 'bg-slate-800' : 'bg-white'} w-5 h-5`}>
            <img
              src={`https:${weather.condition.icon}`}
              alt={weather.condition.text}
              className="w-4 h-4 object-contain"
              title={weather.condition.text}
            />
          </div>
        )}

        <div className="flex items-center">
          <Thermometer className={`h-3 w-3 mr-1 ${textStyles}`} />
          <span className={`text-sm font-bold ${textStyles}`}>{Math.round(weather.temp_c)}°C</span>
        </div>
      </div>
    </Card>
  );
}
