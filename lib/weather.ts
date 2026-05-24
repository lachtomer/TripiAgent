export interface ForecastItem {
  day: string;
  high: number;
  low: number;
  condition: string;
}

export interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  forecast: ForecastItem[];
}

export async function getOpenWeatherDetails(
  lat: number,
  lon: number,
  apiKey: string
): Promise<WeatherData> {
  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

  const [currentRes, forecastRes] = await Promise.all([
    fetch(currentUrl),
    fetch(forecastUrl),
  ]);

  if (!currentRes.ok) {
    throw new Error(`Failed to fetch current weather: ${currentRes.statusText}`);
  }
  if (!forecastRes.ok) {
    throw new Error(`Failed to fetch weather forecast: ${forecastRes.statusText}`);
  }

  const currentData = await currentRes.json();
  const forecastData = await forecastRes.json();

  const temp = Math.round(currentData.main.temp);
  const condition = currentData.weather[0]?.main || "Clear";
  const icon = currentData.weather[0]?.icon || "01d";

  // Group forecast items by date (YYYY-MM-DD)
  const dailyForecasts: Record<string, { temps: number[]; conditions: string[] }> = {};
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (const item of forecastData.list) {
    if (!item.dt_txt) continue;
    const dateStr = item.dt_txt.split(" ")[0]; // e.g., "2026-05-23"
    if (!dailyForecasts[dateStr]) {
      dailyForecasts[dateStr] = { temps: [], conditions: [] };
    }
    dailyForecasts[dateStr].temps.push(item.main.temp);
    if (item.weather && item.weather[0]) {
      dailyForecasts[dateStr].conditions.push(item.weather[0].main);
    }
  }

  const forecastList: ForecastItem[] = Object.entries(dailyForecasts)
    .map(([dateStr, details]) => {
      const date = new Date(dateStr);
      const dayName = daysOfWeek[date.getDay()];
      const high = Math.max(...details.temps);
      const low = Math.min(...details.temps);
      // Select the representative condition for the day
      const cond = details.conditions[Math.floor(details.conditions.length / 2)] || "Clear";
      return {
        day: dayName,
        high: Math.round(high),
        low: Math.round(low),
        condition: cond,
      };
    })
    .slice(1, 6); // Extract the next 5 days, omitting today's partial forecast

  return {
    temp,
    condition,
    icon,
    forecast: forecastList,
  };
}
