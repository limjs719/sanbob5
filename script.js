
const API_KEY = '2453a20bf9d74ed194725036250708';
const BASE_URL = 'https://api.weatherapi.com/v1/current.json';
const SEARCH_URL = 'https://api.weatherapi.com/v1/search.json';

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const suggestions = document.getElementById('suggestions');
const weatherInfo = document.getElementById('weatherInfo');
const errorMessage = document.getElementById('errorMessage');
const loading = document.getElementById('loading');
const cityButtons = document.querySelectorAll('.city-btn');

// DOM elements for weather data
const temp = document.getElementById('temp');
const weatherIcon = document.getElementById('weatherIcon');
const cityName = document.getElementById('cityName');
const country = document.getElementById('country');
const condition = document.getElementById('condition');
const feelsLike = document.getElementById('feelsLike');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');
const visibility = document.getElementById('visibility');
const uv = document.getElementById('uv');
const pressure = document.getElementById('pressure');

let searchTimeout;

// Event listeners
searchBtn.addEventListener('click', searchWeather);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchWeather();
    }
});

// Autocomplete functionality
cityInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    
    clearTimeout(searchTimeout);
    
    if (query.length < 2) {
        hideSuggestions();
        return;
    }
    
    searchTimeout = setTimeout(() => {
        searchCities(query);
    }, 300);
});

// Hide suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.input-container')) {
        hideSuggestions();
    }
});

// Popular city buttons
cityButtons.forEach(button => {
    button.addEventListener('click', () => {
        const city = button.getAttribute('data-city');
        cityInput.value = city;
        searchWeather();
    });
});

// Hide all sections
function hideAllSections() {
    weatherInfo.style.display = 'none';
    errorMessage.style.display = 'none';
    loading.style.display = 'none';
}

// Show loading
function showLoading() {
    hideAllSections();
    loading.style.display = 'block';
}

// Show error
function showError() {
    hideAllSections();
    errorMessage.style.display = 'block';
}

// Show weather info
function showWeatherInfo() {
    hideAllSections();
    weatherInfo.style.display = 'block';
}

// Hide suggestions
function hideSuggestions() {
    suggestions.style.display = 'none';
}

// Show suggestions
function showSuggestions() {
    suggestions.style.display = 'block';
}

// Search cities for autocomplete
async function searchCities(query) {
    try {
        const response = await fetch(`${SEARCH_URL}?key=${API_KEY}&q=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
            hideSuggestions();
            return;
        }
        
        const cities = await response.json();
        displaySuggestions(cities);
        
    } catch (error) {
        console.error('Error searching cities:', error);
        hideSuggestions();
    }
}

// Display autocomplete suggestions
function displaySuggestions(cities) {
    if (cities.length === 0) {
        hideSuggestions();
        return;
    }
    
    suggestions.innerHTML = '';
    
    cities.slice(0, 5).forEach(city => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        
        suggestionItem.innerHTML = `
            <div class="suggestion-main">${city.name}</div>
            <div class="suggestion-sub">${city.region}, ${city.country}</div>
        `;
        
        suggestionItem.addEventListener('click', () => {
            cityInput.value = city.name;
            hideSuggestions();
            searchWeather();
        });
        
        suggestions.appendChild(suggestionItem);
    });
    
    showSuggestions();
}

// Format wind direction
function getWindDirection(degree) {
    const directions = ['북', '북동', '동', '남동', '남', '남서', '서', '북서'];
    const index = Math.round(degree / 45) % 8;
    return directions[index];
}

// Search weather function
async function searchWeather() {
    const city = cityInput.value.trim();
    
    if (!city) {
        alert('도시명을 입력해주세요.');
        return;
    }
    
    hideSuggestions();
    showLoading();
    
    try {
        const response = await fetch(`${BASE_URL}?key=${API_KEY}&q=${encodeURIComponent(city)}&aqi=no&lang=ko`);
        
        if (!response.ok) {
            throw new Error('도시를 찾을 수 없습니다.');
        }
        
        const data = await response.json();
        displayWeatherData(data);
        
    } catch (error) {
        console.error('Error fetching weather data:', error);
        showError();
    }
}

// Display weather data
function displayWeatherData(data) {
    const { location, current } = data;
    
    // Update main weather info
    temp.textContent = Math.round(current.temp_c);
    weatherIcon.src = `https:${current.condition.icon}`;
    weatherIcon.alt = current.condition.text;
    cityName.textContent = location.name;
    country.textContent = `${location.region}, ${location.country}`;
    condition.textContent = current.condition.text;
    
    // Update weather details
    feelsLike.textContent = `${Math.round(current.feelslike_c)}°C`;
    humidity.textContent = `${current.humidity}%`;
    wind.textContent = `${current.wind_kph} km/h ${getWindDirection(current.wind_degree)}`;
    visibility.textContent = `${current.vis_km} km`;
    uv.textContent = current.uv;
    pressure.textContent = `${current.pressure_mb} mb`;
    
    showWeatherInfo();
}

// Load Seoul weather on page load
window.addEventListener('load', () => {
    cityInput.value = 'Seoul';
    searchWeather();
});
