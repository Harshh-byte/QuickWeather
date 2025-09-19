document.addEventListener("DOMContentLoaded", function () {
  // ===========================
  // API CONFIGURATION
  // ===========================
  const API_KEY = "5aa3be39dbbe4da4be2103130251006"; // WeatherAPI.com API key
  const BASE_URL = "https://api.weatherapi.com/v1"; // Base API URL

  // ===========================
  // DOM ELEMENT REFERENCES
  // ===========================
  const searchIcon = document.getElementById("search-icon");
  const searchInput = document.getElementById("search-input");
  const themeIcon = document.getElementById("theme-icon");
  const body = document.body;
  const locationSpan = document.querySelector(".weather-header .location");

  // Store default location from HTML (used when search is empty)
  const initialDefaultLocation = locationSpan.textContent
    .replace("Location: ", "")
    .trim();

  // Card elements for Today
  const todayCondition = document.querySelector(".weather-card.today .condition");
  const todayTemp = document.querySelector(".weather-card.today .temp");
  const todayHumidity = document.querySelector(".weather-card.today .humidity");
  const todayWind = document.querySelector(".weather-card.today .wind");

  // Card elements for Yesterday
  const yesterdayCondition = document.querySelector(".weather-card.yesterday .condition");
  const yesterdayTemp = document.querySelector(".weather-card.yesterday .temp");
  const yesterdayHumidity = document.querySelector(".weather-card.yesterday .humidity");
  const yesterdayWind = document.querySelector(".weather-card.yesterday .wind");

  // Card elements for Tomorrow
  const tomorrowCondition = document.querySelector(".weather-card.tomorrow .condition");
  const tomorrowMinMax = document.querySelector(".weather-card.tomorrow .min-max");
  const tomorrowHumidity = document.querySelector(".weather-card.tomorrow .humidity");
  const tomorrowWind = document.querySelector(".weather-card.tomorrow .wind");

  // ===========================
  // HELPER FUNCTIONS
  // ===========================

  // Capitalize first letter of each word in a string (for clean city names)
  function capitalizeEachWord(str) {
    if (!str || str.trim() === "") return "";
    return str
      .toLowerCase()
      .split(" ")
      .map((word) =>
        word.length === 0 ? "" : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(" ");
  }

  // Weather condition → emoji mapping
  const weatherEmojiMap = {
    Sunny: "☀️",
    Clear: "☀️",
    "Partly cloudy": "⛅",
    Cloudy: "☁️",
    Overcast: "☁️",
    Mist: "🌫️",
    Fog: "🌫️",
    "Patchy rain possible": "🌦️",
    "Light rain": "🌧️",
    "Moderate rain": "🌧️",
    "Heavy rain": "🌧️",
    "Light showers": "🚿",
    "Moderate or heavy rain shower": "🌧️",
    Thunder: "⛈️",
    "Thundery outbreaks possible": "⛈️",
    Snow: "❄️",
    "Light snow": "🌨️",
    "Moderate snow": "🌨️",
    "Heavy snow": "🌨️",
    Sleet: "🌨️",
    Drizzle: "💧",
    "Freezing drizzle": "💧",
    "Ice pellets": "🧊",
    Blizzard: "🌨️",
    "Freezing fog": "🌫️🧊",
    "Partly Cloudy": "⛅",
    Hail: "🌩️",
    "Patchy snow possible": "🌨️",
    "Patchy sleet possible": "🌨️",
    "Patchy freezing drizzle possible": "💧🧊",
    "Patchy ice pellets possible": "🧊",
    Tornado: "🌪️",
    Hurricane: "🌀",
    Sandstorm: "🌪️",
    Dust: "🌫️",
    Smoke: "💨",
    Hot: "🔥",
    Cold: "🥶",
    Windy: "💨",
    Rain: "🌧️",
    Showers: "🌦️",
  };

  // Return appropriate emoji based on condition text
  function getWeatherEmoji(conditionText) {
    const lowerCaseCondition = conditionText.toLowerCase();
    for (const keyword in weatherEmojiMap) {
      if (lowerCaseCondition.includes(keyword.toLowerCase())) {
        return weatherEmojiMap[keyword];
      }
    }
    return "❓"; // Fallback if condition is unknown
  }

  // Format JS date → YYYY-MM-DD (required by WeatherAPI history endpoint)
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // ===========================
  // API CALL FUNCTIONS
  // ===========================

  async function fetchCurrentWeather(city) {
    const url = `${BASE_URL}/current.json?key=${API_KEY}&q=${city}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching current weather data:", error.message);
      return null;
    }
  }

  async function fetchHistoricalWeather(city, date) {
    const url = `${BASE_URL}/history.json?key=${API_KEY}&q=${city}&dt=${date}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching historical weather data for ${date}:`, error.message);
      return null;
    }
  }

  async function fetchForecastWeather(city, days) {
    const url = `${BASE_URL}/forecast.json?key=${API_KEY}&q=${city}&days=${days}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching forecast weather data for ${days} days:`, error.message);
      return null;
    }
  }

  // ===========================
  // UI UPDATE FUNCTIONS
  // ===========================

  function updateTodayCard(data) {
    if (data && data.current) {
      const condition = data.current.condition.text;
      todayCondition.textContent = `${getWeatherEmoji(condition)} ${condition}`;
      todayTemp.textContent = `${Math.round(data.current.temp_c)}°C`; // Rounded temperature
      todayHumidity.textContent = `Humidity: ${data.current.humidity}%`;
      todayWind.textContent = `Wind: ${data.current.wind_kph} km/h`;
    } else {
      todayCondition.textContent = "N/A";
      todayTemp.textContent = "--°C";
      todayHumidity.textContent = "Humidity: --%";
      todayWind.textContent = "Wind: -- km/h";
    }
  }

  function updateYesterdayCard(data) {
    if (data && data.forecast && data.forecast.forecastday[0]) {
      const yesterdayData = data.forecast.forecastday[0].day;
      const condition = yesterdayData.condition.text;
      yesterdayCondition.textContent = `${getWeatherEmoji(condition)} ${condition}`;
      yesterdayTemp.textContent = `${Math.round(yesterdayData.avgtemp_c)}°C`; // Rounded average temperature
      yesterdayHumidity.textContent = `Humidity: ${yesterdayData.avghumidity}%`;
      yesterdayWind.textContent = `Wind: ${yesterdayData.maxwind_kph} km/h`;
    } else {
      yesterdayCondition.textContent = "N/A";
      yesterdayTemp.textContent = "--°C";
      yesterdayHumidity.textContent = "Humidity: --%";
      yesterdayWind.textContent = "Wind: -- km/h";
    }
  }

  function updateTomorrowCard(data) {
    if (data && data.forecast && data.forecast.forecastday[1]) {
      const tomorrowData = data.forecast.forecastday[1].day;
      const condition = tomorrowData.condition.text;
      tomorrowCondition.textContent = `${getWeatherEmoji(condition)} ${condition}`;
      tomorrowMinMax.textContent = `Min: ${Math.round(tomorrowData.mintemp_c)}°C | Max: ${Math.round(tomorrowData.maxtemp_c)}°C`;
      tomorrowHumidity.textContent = `Humidity: ${tomorrowData.avghumidity}%`;
      tomorrowWind.textContent = `Wind: ${tomorrowData.maxwind_kph} km/h`;
    } else {
      tomorrowCondition.textContent = "N/A";
      tomorrowMinMax.textContent = "Min: --°C | Max: --°C";
      tomorrowHumidity.textContent = "Humidity: --%";
      tomorrowWind.textContent = "Wind: -- km/h";
    }
  }

  // Fetch all weather data (today, yesterday, tomorrow) and update UI
  async function updateAllWeatherCards(city) {
    locationSpan.textContent = `${city}`;
    updateTodayCard(null);
    updateYesterdayCard(null);
    updateTomorrowCard(null);
    todayCondition.textContent = "Loading...";
    yesterdayCondition.textContent = "Loading...";
    tomorrowCondition.textContent = "Loading...";

    const currentData = await fetchCurrentWeather(city);
    updateTodayCard(currentData);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDate = formatDate(yesterday);
    const historicalData = await fetchHistoricalWeather(city, yesterdayDate);
    updateYesterdayCard(historicalData);

    const forecastData = await fetchForecastWeather(city, 2);
    updateTomorrowCard(forecastData);

    if (!currentData && !historicalData && !forecastData) {
      alert(`Could not fetch weather data for ${city}. Please check the city name and try again.`);
      locationSpan.textContent = `Failed to load`;
    }
  }

  // ===========================
  // EVENT LISTENERS
  // ===========================

  // Show search input when search icon is clicked
  searchIcon.addEventListener("click", () => {
    body.classList.add("search-active");
    searchInput.style.display = "block";
    searchInput.focus();
  });

  // Hide search input when it loses focus
  searchInput.addEventListener("blur", function () {
    body.classList.remove("search-active");
    searchInput.style.display = "none";
  });

  // Toggle light/dark theme
  themeIcon.addEventListener("click", function () {
    body.classList.toggle("dark-theme");
  });

  // Trigger search when user presses Enter
  searchInput.addEventListener("keypress", async (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const rawSearchTerm = searchInput.value.trim();
      const formattedSearchTerm = capitalizeEachWord(rawSearchTerm);

      if (formattedSearchTerm !== "") {
        await updateAllWeatherCards(formattedSearchTerm);
      } else {
        alert("Search input is empty. Reverting to default location.");
        await updateAllWeatherCards(initialDefaultLocation);
      }

      // Reset search bar after search
      body.classList.remove("search-active");
      searchInput.style.display = "none";
      searchInput.value = "";
    }
  });

  // Initialize with default location
  updateAllWeatherCards(initialDefaultLocation);
});
