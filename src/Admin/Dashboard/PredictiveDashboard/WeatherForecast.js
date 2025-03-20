import React from "react";
import {
  FaSun,
  FaCloudSun,
  FaCloud,
  FaCloudRain,
  FaCloudShowersHeavy,
  FaBolt,
  FaSnowflake,
  FaSmog,
  FaTemperatureHigh,
  FaWind,
  FaTint,
  FaMapMarkerAlt,
  FaCalendarAlt,
} from "react-icons/fa";

const WeatherForecast = ({ data, city }) => {
  if (!data || !data.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-blue-600">No weather data available</p>
      </div>
    );
  }

  // Function to get weather icon based on description
  const getWeatherIcon = (description) => {
    const desc = description.toLowerCase();
    if (desc.includes("clear") || desc.includes("sunny")) {
      return <FaSun className="text-yellow-500" />;
    } else if (desc.includes("few clouds") || desc.includes("partly cloudy")) {
      return <FaCloudSun className="text-blue-300" />;
    } else if (desc.includes("clouds") || desc.includes("cloudy")) {
      return <FaCloud className="text-gray-400" />;
    } else if (desc.includes("drizzle") || desc.includes("light rain")) {
      return <FaCloudRain className="text-blue-400" />;
    } else if (desc.includes("rain") || desc.includes("shower")) {
      return <FaCloudShowersHeavy className="text-blue-500" />;
    } else if (desc.includes("thunder") || desc.includes("storm")) {
      return <FaBolt className="text-yellow-400" />;
    } else if (desc.includes("snow")) {
      return <FaSnowflake className="text-blue-200" />;
    } else {
      return <FaSmog className="text-gray-500" />;
    }
  };

  // Get weather background color based on description
  const getWeatherBackground = (description) => {
    const desc = description.toLowerCase();
    if (desc.includes("clear") || desc.includes("sunny")) {
      return "bg-gradient-to-r from-yellow-50 to-blue-50";
    } else if (desc.includes("clouds") || desc.includes("cloudy")) {
      return "bg-gradient-to-r from-gray-50 to-blue-50";
    } else if (
      desc.includes("rain") ||
      desc.includes("shower") ||
      desc.includes("drizzle")
    ) {
      return "bg-gradient-to-r from-blue-50 to-gray-50";
    } else if (desc.includes("thunder") || desc.includes("storm")) {
      return "bg-gradient-to-r from-gray-50 to-yellow-50";
    } else if (desc.includes("snow")) {
      return "bg-gradient-to-r from-blue-50 to-gray-50";
    } else {
      return "bg-gradient-to-r from-blue-50 to-white";
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-blue-700 font-semibold text-lg flex items-center">
          <FaMapMarkerAlt className="mr-2 text-blue-500" />
          <span>{city}</span>
        </h3>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center">
          <FaCalendarAlt className="mr-1" />
          {data.length} Day Forecast
        </span>
      </div>

      <div className="space-y-3">
        {data.map((day, index) => (
          <div
            key={index}
            className={`p-4 border border-blue-100 rounded-lg ${getWeatherBackground(
              day.description
            )} flex items-center transition-all duration-300 hover:shadow-md`}
          >
            <div className="text-3xl mr-4">
              {getWeatherIcon(day.description)}
            </div>

            <div className="flex-1">
              <div className="font-medium text-blue-800 flex items-center">
                <span>{formatDate(day.date)}</span>
                {index === 0 && (
                  <span className="ml-2 text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
                    Today
                  </span>
                )}
              </div>
              <div className="text-blue-600 capitalize">{day.description}</div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex flex-col items-center">
                <div className="flex items-center text-red-500 mb-1">
                  <FaTemperatureHigh />
                </div>
                <div className="font-medium">{Math.round(day.temp)}°C</div>
                <div className="text-xs text-gray-500">Temp</div>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center text-blue-400 mb-1">
                  <FaTint />
                </div>
                <div className="font-medium">{day.humidity}%</div>
                <div className="text-xs text-gray-500">Humidity</div>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center text-gray-500 mb-1">
                  <FaWind />
                </div>
                <div className="font-medium">{day.wind_speed}</div>
                <div className="text-xs text-gray-500">m/s</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-blue-500 italic bg-blue-50 p-2 rounded-lg">
        Weather impacts customer behavior and can significantly affect sales
        patterns. Use this data when planning inventory and staffing.
      </div>
    </div>
  );
};

export default WeatherForecast;
