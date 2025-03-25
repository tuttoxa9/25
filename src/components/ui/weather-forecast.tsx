import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { useEffect, useState } from 'react';
import { Cloud, Loader2, MapPin, CalendarDays, DropletIcon, Thermometer, Wind } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

type DayForecast = {
  date: string;
  day: {
    maxtemp_c: number;
    mintemp_c: number;
    avgtemp_c: number;
    condition: {
      text: string;
      icon: string;
    };
    daily_chance_of_rain: number;
  };
};

type WeatherData = {
  location: {
    name: string;
  };
  current: {
    temp_c: number;
    condition: {
      text: string;
      icon: string;
    };
    humidity: number;
    wind_kph: number;
    feelslike_c: number;
  };
  forecast: {
    forecastday: DayForecast[];
  };
};

export function WeatherForecast() {
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
          `https://api.weatherapi.com/v1/forecast.json?key=f6f6c5a0c1f1413ab48200836252403&q=Minsk,Belarus&days=3&aqi=no`
        );

        if (!response.ok) {
          throw new Error('Weather data fetch failed');
        }

        const data = await response.json();
        setWeather(data);
        setError(false);
      } catch (err) {
        console.error('Error fetching weather:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  // Форматирование даты
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'EEEE, d MMMM', { locale: ru });
  };

  // Стили для карточки погоды
  const containerStyles = isDark
    ? 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-blue-300'
    : 'bg-white border-blue-200 hover:bg-blue-50 text-blue-700';

  const iconStyles = isDark
    ? 'text-blue-400'
    : 'text-blue-600';

  const iconBgStyles = isDark
    ? 'bg-slate-800'
    : 'bg-white';

  const weatherTrigger = (
    <Card className={`flex items-center justify-center h-10 px-3 transition-all duration-200 shadow-sm ${containerStyles}`}>
      <div className="flex items-center space-x-1">
        <div className={`flex items-center justify-center rounded-full p-0.5 ${iconBgStyles} w-5 h-5`}>
          <MapPin className="w-3 h-3" />
        </div>

        <span className="text-sm font-medium">Минск</span>

        {!loading && weather && weather.current.condition.icon && (
          <div className={`flex justify-center items-center overflow-hidden rounded-full ${iconBgStyles} w-5 h-5`}>
            <img
              src={`https:${weather.current.condition.icon}`}
              alt={weather.current.condition.text}
              className="w-4 h-4 object-contain"
              title={weather.current.condition.text}
            />
          </div>
        )}

        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : weather ? (
          <div className="flex items-center">
            <Thermometer className={`h-3 w-3 mr-0.5 ${iconStyles}`} />
            <span className="text-sm font-bold">{Math.round(weather.current.temp_c)}°C</span>
          </div>
        ) : (
          <Cloud className="h-4 w-4" />
        )}
      </div>
    </Card>
  );

  if (error) {
    return weatherTrigger;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        {weatherTrigger}
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "w-80 p-0 shadow-lg",
          isDark
            ? "bg-slate-900 border-slate-700 text-slate-100"
            : "bg-white"
        )}
        align="start"
      >
        <div className="flex flex-col">
          {loading ? (
            <div className={cn(
              "flex items-center justify-center p-6",
              isDark ? "text-slate-300" : ""
            )}>
              <Loader2 className={cn(
                "h-6 w-6 animate-spin",
                isDark ? "text-blue-400" : "text-blue-500"
              )} />
              <span className="ml-2">Загрузка прогноза...</span>
            </div>
          ) : weather ? (
            <>
              <div className={cn(
                "p-4 border-b",
                isDark
                  ? "border-slate-700 bg-slate-900"
                  : "border-slate-200 bg-white"
              )}>
                <div className="flex items-center">
                  <MapPin className={cn(
                    "h-5 w-5 mr-2",
                    isDark ? "text-blue-400" : "text-blue-600"
                  )} />
                  <h3 className="font-medium text-lg">Погода в {weather.location.name}</h3>
                </div>
                <div className="mt-2 flex items-center">
                  <div className="flex items-center">
                    <div className={cn(
                      "flex justify-center items-center overflow-hidden rounded-full p-1 w-10 h-10",
                      iconBgStyles
                    )}>
                      <img
                        src={`https:${weather.current.condition.icon}`}
                        alt={weather.current.condition.text}
                        className="h-8 w-8 object-contain"
                      />
                    </div>
                    <span className="text-2xl font-bold ml-2">{Math.round(weather.current.temp_c)}°C</span>
                  </div>
                  <div className="ml-auto text-right">
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-slate-400" : "text-muted-foreground"
                    )}>Ощущается как</p>
                    <p className="text-xl font-medium">{Math.round(weather.current.feelslike_c)}°C</p>
                  </div>
                </div>
                <div className="mt-2 text-sm">
                  <p>{weather.current.condition.text}</p>
                  <div className="flex mt-1 gap-4">
                    <span className="flex items-center">
                      <DropletIcon className={cn(
                        "h-3 w-3 mr-1",
                        isDark ? "text-blue-400" : "text-blue-600"
                      )} />
                      {weather.current.humidity}%
                    </span>
                    <span className="flex items-center">
                      <Wind className={cn(
                        "h-3 w-3 mr-1",
                        isDark ? "text-blue-400" : "text-blue-600"
                      )} />
                      {Math.round(weather.current.wind_kph)} км/ч
                    </span>
                  </div>
                </div>
              </div>

              <div className={cn(
                "p-2",
                isDark ? "bg-slate-900" : "bg-white"
              )}>
                <h4 className={cn(
                  "font-medium px-2 py-1 flex items-center",
                  isDark ? "text-slate-200" : ""
                )}>
                  <CalendarDays className={cn(
                    "mr-2 h-4 w-4",
                    isDark ? "text-blue-400" : "text-blue-600"
                  )} />
                  Прогноз на 3 дня
                </h4>

                {weather.forecast.forecastday.map((day) => (
                  <div
                    key={day.date}
                    className={cn(
                      "flex items-center justify-between p-2 my-1 rounded-md",
                      isDark
                        ? "hover:bg-slate-800/50 bg-slate-900"
                        : "hover:bg-blue-50 bg-white"
                    )}
                  >
                    <div className="flex-1">
                      <p className="capitalize font-medium">{formatDate(day.date)}</p>
                      <p className={cn(
                        "text-sm",
                        isDark ? "text-slate-400" : "text-muted-foreground"
                      )}>{day.day.condition.text}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "flex justify-center items-center overflow-hidden rounded-full w-8 h-8 p-1",
                        iconBgStyles
                      )}>
                        <img
                          src={`https:${day.day.condition.icon}`}
                          alt={day.day.condition.text}
                          className="h-6 w-6 object-contain"
                        />
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{Math.round(day.day.maxtemp_c)}° / {Math.round(day.day.mintemp_c)}°</p>
                        <p className={cn(
                          "text-xs",
                          isDark ? "text-slate-400" : "text-muted-foreground"
                        )}>
                          {day.day.daily_chance_of_rain > 0 ? `Осадки: ${day.day.daily_chance_of_rain}%` : 'Без осадков'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className={cn(
              "p-4 text-center",
              isDark ? "text-slate-300 bg-slate-900" : "bg-white"
            )}>
              <Cloud className={cn(
                "mx-auto h-8 w-8 mb-2",
                isDark ? "text-slate-500" : "text-muted-foreground"
              )} />
              <p>Не удалось загрузить прогноз погоды</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
