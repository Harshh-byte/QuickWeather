document.addEventListener('DOMContentLoaded', function () {
    const API_KEY = "82d3532c228d408fa9a91650250906"; // Your WeatherAPI.com API key

    const searchIcon = document.getElementById('search-icon');
    const searchInput = document.getElementById('search-input');
    const themeIcon = document.getElementById('theme-icon');
    const body = document.body;
    const weatherHeader = document.querySelector('.weather-header');
    const locationSpan = document.querySelector('.weather-header .location');

    // Get the initial default location from the text content and clean it up
    const initialDefaultLocation = locationSpan.textContent.replace('Location: ', '').trim();

    // Select all the specific elements within each weather card
    const todayCondition = document.querySelector('.weather-card.today .condition');
    const todayTemp = document.querySelector('.weather-card.today .temp');
    const todayHumidity = document.querySelector('.weather-card.today .humidity');
    const todayWind = document.querySelector('.weather-card.today .wind');

    const yesterdayCondition = document.querySelector('.weather-card.yesterday .condition');
    const yesterdayTemp = document.querySelector('.weather-card.yesterday .temp');
    const yesterdayHumidity = document.querySelector('.weather-card.yesterday .humidity');
    const yesterdayWind = document.querySelector('.weather-card.yesterday .wind');

    const tomorrowCondition = document.querySelector('.weather-card.tomorrow .condition');
    const tomorrowMinMax = document.querySelector('.weather-card.tomorrow .min-max');
    const tomorrowHumidity = document.querySelector('.weather-card.tomorrow .humidity');
    const tomorrowWind = document.querySelector('.weather-card.tomorrow .wind');

    // Capitalize each word in a string
    function capitalizeEachWord(str) {
        if (!str || str.trim() === '') {
            return '';
        }
        return str
            .toLowerCase()
            .split(' ')
            .map(word => {
                if (word.length === 0) {
                    return '';
                }
                return word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join(' ');
    }

    // --- Emoji Mapping ---
    const weatherEmojiMap = {
        'Sunny': '☀️',
        'Clear': '☀️',
        'Partly cloudy': '⛅',
        'Cloudy': '☁️',
        'Overcast': '☁️',
        'Mist': '🌫️',
        'Fog': '🌫️',
        'Patchy rain possible': '🌦️',
        'Light rain': '🌧️',
        'Moderate rain': '🌧️',
        'Heavy rain': '🌧️',
        'Light showers': '🚿',
        'Moderate or heavy rain shower': '🌧️',
        'Thunder': '⛈️',
        'Thundery outbreaks possible': '⛈️',
        'Snow': '❄️',
        'Light snow': '🌨️',
        'Moderate snow': '🌨️',
        'Heavy snow': '🌨️',
        'Sleet': '🌨️',
        'Drizzle': '💧',
        'Freezing drizzle': '💧',
        'Ice pellets': '🧊',
        'Blizzard': '🌨️',
        'Freezing fog': '🌫️🧊',
        'Partly Cloudy': '⛅',
    };

    // Function to get emoji based on condition text
    function getWeatherEmoji(conditionText) {
        const lowerCaseCondition = conditionText.toLowerCase();
        for (const keyword in weatherEmojiMap) {
            if (lowerCaseCondition.includes(keyword.toLowerCase())) {
                return weatherEmojiMap[keyword];
            }
        }
        return '❓'; // Default emoji if no match is found
    }

    // Helper to format date as YYYY-MM-DD for historical API
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // --- API Fetching Functions ---

    // Fetch current weather data
    async function fetchCurrentWeather(city) {
        const url = `http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}`;
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

    // Fetch historical weather data
    async function fetchHistoricalWeather(city, date) {
        const url = `http://api.weatherapi.com/v1/history.json?key=${API_KEY}&q=${city}&dt=${date}`;
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

    // Fetch forecast weather data (for tomorrow)
    async function fetchForecastWeather(city, days) {
        const url = `http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=${days}`;
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

    // --- UI Update Functions ---

    function updateTodayCard(data) {
        if (data && data.current) {
            const condition = data.current.condition.text;
            todayCondition.textContent = `${getWeatherEmoji(condition)} ${condition}`;
            todayTemp.textContent = `${data.current.temp_c}°C`;
            todayHumidity.textContent = `Humidity: ${data.current.humidity}%`;
            todayWind.textContent = `Wind: ${data.current.wind_kph} km/h`;
        } else {
            todayCondition.textContent = 'N/A';
            todayTemp.textContent = '--°C';
            todayHumidity.textContent = 'Humidity: --%';
            todayWind.textContent = 'Wind: -- km/h';
        }
    }

    function updateYesterdayCard(data) {
        if (data && data.forecast && data.forecast.forecastday[0]) {
            const yesterdayData = data.forecast.forecastday[0].day;
            const condition = yesterdayData.condition.text;
            yesterdayCondition.textContent = `${getWeatherEmoji(condition)} ${condition}`;
            yesterdayTemp.textContent = `${yesterdayData.avgtemp_c}°C`; // Historical API gives average
            yesterdayHumidity.textContent = `Humidity: ${yesterdayData.avghumidity}%`;
            yesterdayWind.textContent = `Wind: ${yesterdayData.maxwind_kph} km/h`;
        } else {
            yesterdayCondition.textContent = 'N/A';
            yesterdayTemp.textContent = '--°C';
            yesterdayHumidity.textContent = 'Humidity: --%';
            yesterdayWind.textContent = 'Wind: -- km/h';
        }
    }

    function updateTomorrowCard(data) {
    if (data && data.forecast && data.forecast.forecastday[1]) { // forecastday[1] for tomorrow
        const tomorrowData = data.forecast.forecastday[1].day;
        const condition = tomorrowData.condition.text;
        tomorrowCondition.textContent = `${getWeatherEmoji(condition)} ${condition}`;
        tomorrowMinMax.textContent = `Min: ${tomorrowData.mintemp_c}°C | Max: ${tomorrowData.maxtemp_c}°C`;
        tomorrowHumidity.textContent = `Humidity: ${tomorrowData.avghumidity}%`;
        tomorrowWind.textContent = `Wind: ${tomorrowData.maxwind_kph} km/h`;
    } else {
        tomorrowCondition.textContent = 'N/A';
        tomorrowMinMax.textContent = 'Min: --°C | Max: --°C';
        tomorrowHumidity.textContent = 'Humidity: --%';
        tomorrowWind.textContent = 'Wind: -- km/h';
    }
}

    // Main function to fetch and update all weather cards
    async function updateAllWeatherCards(city) {
        locationSpan.textContent = `${city}`; // Optimistically update location text

        // Clear previous data while fetching
        updateTodayCard(null);
        updateYesterdayCard(null);
        updateTomorrowCard(null);
        todayCondition.textContent = 'Loading...';
        yesterdayCondition.textContent = 'Loading...';
        tomorrowCondition.textContent = 'Loading...';


        // Fetch Current Weather (for Today)
        const currentData = await fetchCurrentWeather(city);
        updateTodayCard(currentData);

        // Fetch Historical Weather (for Yesterday)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1); // Get yesterday's date
        const yesterdayDate = formatDate(yesterday);
        const historicalData = await fetchHistoricalWeather(city, yesterdayDate);
        updateYesterdayCard(historicalData);

        // Fetch Forecast Weather (for Tomorrow - days=2 gets today and tomorrow)
        const forecastData = await fetchForecastWeather(city, 2);
        updateTomorrowCard(forecastData);

        if (!currentData && !historicalData && !forecastData) {
            alert(`Could not fetch weather data for ${city}. Please check the city name and try again.`);
            locationSpan.textContent = `Failed to load`; // Indicate failure
        }
    }

    // --- Event Listeners ---

    // Toggle search input visibility
    searchIcon.addEventListener('click', () => {
        weatherHeader.classList.toggle('search-active');
        if (weatherHeader.classList.contains('search-active')) {
            searchInput.style.display = 'inline-block'; // Use inline-block for better alignment
            searchInput.focus();
            searchInput.value = ''; // Clear previous search
        } else {
            searchInput.style.display = 'none';
        }
    });

    // Theme toggle
    themeIcon.addEventListener('click', () => {
        body.classList.toggle('dark-theme');
        if (body.classList.contains('dark-theme')) {
            themeIcon.classList.remove('ri-moon-line');
            themeIcon.classList.add('ri-sun-line');
        } else {
            themeIcon.classList.remove('ri-sun-line');
            themeIcon.classList.add('ri-moon-line');
        }
    });

    // Listen for 'Enter' key in search input to trigger weather fetch
    searchInput.addEventListener('keypress', async (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const rawSearchTerm = searchInput.value.trim();
            const formattedSearchTerm = capitalizeEachWord(rawSearchTerm);

            if (formattedSearchTerm !== '') {
                await updateAllWeatherCards(formattedSearchTerm);
                // After search, hide input and clear its value
                weatherHeader.classList.remove('search-active');
                searchInput.style.display = 'none';
                searchInput.value = '';
            } else {
                // If search input is empty, revert to default location and fetch its weather
                alert("Search input is empty. Reverting to default location.");
                await updateAllWeatherCards(initialDefaultLocation);
                weatherHeader.classList.remove('search-active');
                searchInput.style.display = 'none';
                searchInput.value = '';
            }
        }
    });

    // Initialize weather for the default location when the page loads
    updateAllWeatherCards(initialDefaultLocation);
});