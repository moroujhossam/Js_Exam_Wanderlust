import { fetchData , getExchangeRates } from "./api.js";
const selectCountry= document.getElementById("global-country");
const countryName= document.getElementById("selected-country-name");
const selectedDest = document.getElementById("selected-destination");
const clearBtn = document.getElementById("clear-selection-btn");
const selectFlag = document.getElementById("selected-country-flag");
const navItems = document.querySelectorAll(".nav-item");
const views = document.querySelectorAll(".view");
const pageTitle = document.getElementById("page-title");
const selectYear = document.getElementById("global-year");
let countryCode = "";
let exchangeRates = {};
const holidaysContent = document.getElementById("holidays-content");
const longWeekendsContent = document.getElementById("lw-content");

const currencyAmount = document.getElementById("currency-amount");

const currencyFrom = document.getElementById("currency-from");

const currencyTo = document.getElementById("currency-to");

const convertBtn = document.getElementById("convert-btn");

const swapBtn = document.getElementById("swap-currencies-btn");

const currencyResult = document.getElementById("currency-result");

const popularCurrencies = document.getElementById("popular-currencies");

async function getCountries() {
    const countries = await fetchData('https://date.nager.at/api/v3/AvailableCountries');
    return countries;
    
}

function displayCountries(countries){
  
    let container="";
   countries.forEach(element => {
   container+=`<option value="${element.countryCode}"> ${element.name}</option>`;
    
   });
   selectCountry.innerHTML += container;
}
async function awaitCountries() {
    const countries = await getCountries();
    displayCountries(countries);
}
awaitCountries();
selectCountry.addEventListener("change",function(e){
     countryCode = e.target.value;  
    updateSelectedCountry(countryCode);
    getHolidays();
        getLongWeekends();
} );
function updateSelectedCountry(code){
    let cName= selectCountry.options[selectCountry.selectedIndex].text;
    countryName.innerHTML=cName;
    if(selectedDest.style.display== "none"){
        selectedDest.style.display= "block";
    }
    selectFlag.src = `https://flagcdn.com/w40/${code.toLowerCase()}.png`
    selectFlag.alt= cName;
}
function clearGlobalSelection(){
selectCountry.options[0].selected = true;
selectedDest.style.display= "none";
}
clearBtn.addEventListener("click", function(){
    clearGlobalSelection();
})
function switchView(viewName){
    views.forEach(view=> {
        view.classList.remove("active");
    });
    navItems.forEach(item=>{
        item.classList.remove("active");
    })
    document.getElementById(`${viewName}-view`).classList.add("active");
    document.querySelector(`[data-view="${viewName}"]`).classList.add("active");
    pageTitle.textContent= viewName;
}
navItems.forEach(item=>{
    item.addEventListener("click",function(e){
        e.preventDefault();
        const viewName = item.dataset.view;
        switchView(viewName);
    })
})
async function getHolidays() {
    const year = selectYear.value;
    if(!countryCode) return  holidaysContent.innerHTML = "<p>No holidays found for this country and year.</p>";
    const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`;
    const holidays = await fetchData(url);
    displayHolidays(holidays);
}
selectYear.addEventListener("change", function() {
    getHolidays();
    getLongWeekends();
});
async function init() {
    await awaitCountries();
    getHolidays();
    getLongWeekends()
}
init();
function displayHolidays(holidays) {
    let container = "";

    holidays.forEach(holiday => {
        const date = new Date(holiday.date);

        const day = date.getDate();
        const month = date.toLocaleString("en-US", { month: "short" });
        const weekday = date.toLocaleString("en-US", { weekday: "long" });

        container += `
            <div class="holiday-card">
                <div class="holiday-card-header">
                    <div class="holiday-date-box">
                        <span class="day">${day}</span>
                        <span class="month">${month}</span>
                    </div>
                    <button class="holiday-action-btn">
                        <i class="fa-regular fa-heart"></i>
                    </button>
                </div>

                <h3>${holiday.localName}</h3>
                <p class="holiday-name">${holiday.name}</p>

                <div class="holiday-card-footer">
                    <span class="holiday-day-badge">
                        <i class="fa-regular fa-calendar"></i> ${weekday}
                    </span>
                    <span class="holiday-type-badge">Public</span>
                </div>
            </div>
        `;
    });

    holidaysContent.innerHTML = container;
}
async function getLongWeekends() {
    
    const year = selectYear.value;

    if (!countryCode){
          longWeekendsContent.innerHTML =
          "<p>Failed to load long weekends.</p>";
      return;  } 



    const url = `https://date.nager.at/api/v3/LongWeekend/${year}/${countryCode}`;

  
        const longWeekends = await fetchData(url);
        displayLongWeekends(longWeekends);
  
}
function displayLongWeekends(longWeekends) {
    
    let container = "";

    longWeekends.forEach((weekend, index) => {
        const startDate = new Date(`${weekend.startDate}T00:00:00`);
        const endDate = new Date(`${weekend.endDate}T00:00:00`);

        const start = startDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric"
        });

        const end = endDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });

        // Generate days visual
        let daysHTML = "";
        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const dayName = currentDate.toLocaleString("en-US", {
                weekday: "short"
            });

            const dayNumber = currentDate.getDate();

            const isWeekend =
                currentDate.getDay() === 0 ||
                currentDate.getDay() === 6;

            daysHTML += `
                <div class="lw-day ${isWeekend ? "weekend" : ""}">
                    <span class="name">${dayName}</span>
                    <span class="num">${dayNumber}</span>
                </div>
            `;

            currentDate.setDate(currentDate.getDate() + 1);
        }

        container += `
            <div class="lw-card">
                <div class="lw-card-header">
                    <span class="lw-badge">
                        <i class="fa-solid fa-calendar-days"></i>
                        ${weekend.dayCount} Days
                    </span>

                    <button class="holiday-action-btn">
                        <i class="fa-regular fa-heart"></i>
                    </button>
                </div>

                <h3>Long Weekend #${index + 1}</h3>

                <div class="lw-dates">
                    <i class="fa-regular fa-calendar"></i>
                    ${start} - ${end}
                </div>

                <div class="lw-info-box ${weekend.needBridgeDay ? "warning" : "success"}">
                    <i class="fa-solid ${weekend.needBridgeDay ? "fa-info-circle" : "fa-check-circle"}"></i>

                    ${weekend.needBridgeDay
                        ? "Requires taking a bridge day off"
                        : "No extra days off needed!"}
                </div>

                <div class="lw-days-visual">
                    ${daysHTML}
                </div>
            </div>
        `;
    });

    longWeekendsContent.innerHTML = container;
}
const currencyNames = {
    USD: "US Dollar",
    EGP: "Egyptian Pound",
    EUR: "Euro",
    GBP: "British Pound",
    AED: "UAE Dirham",
    SAR: "Saudi Riyal",
    JPY: "Japanese Yen",
    CAD: "Canadian Dollar",
    INR: "Indian Rupee"
};
async function loadExchangeRates() {
    try {
        const data = await getExchangeRates();

        exchangeRates = data.rates;

        populateCurrencySelects();


    } catch (error) {
        console.error("Failed to load exchange rates:", error);
    }
}

function populateCurrencySelects() {
    let options = "";

    for (const code in currencyNames) {
        options += `
            <option value="${code}">
                ${code} - ${currencyNames[code]}
            </option>
        `;
    }

    currencyFrom.innerHTML = options;
    currencyTo.innerHTML = options;

    currencyFrom.value = "USD";
    currencyTo.value = "EGP";
}
loadExchangeRates();
function convertCurrency() {
    const amount = +(currencyAmount.value);

    const from = currencyFrom.value;
    const to = currencyTo.value;

    if (!amount || amount <= 0) {
        currencyResult.innerHTML = "<p>Please enter a valid amount.</p>";
        return;
    }

    if (!exchangeRates[from] || !exchangeRates[to]) {
        currencyResult.innerHTML = "<p>Exchange rates are not available.</p>";
        return;
    }

    const fromRate = exchangeRates[from];
    const toRate = exchangeRates[to];

    const result = (amount / fromRate) * toRate;
    const exchangeRate = toRate / fromRate;

    currencyResult.innerHTML = `
        <div class="conversion-display">
            <div class="conversion-from">
                <span class="amount">${amount.toFixed(2)}</span>
                <span class="currency-code">${from}</span>
            </div>

            <div class="conversion-equals">
                <i class="fa-solid fa-equals"></i>
            </div>

            <div class="conversion-to">
                <span class="amount">${result.toFixed(2)}</span>
                <span class="currency-code">${to}</span>
            </div>
        </div>

        <div class="exchange-rate-info">
            <p>1 ${from} = ${exchangeRate.toFixed(4)} ${to}</p>
        </div>
    `;
}
convertBtn.addEventListener("click", convertCurrency);
swapBtn.addEventListener("click", function() {
    const temp = currencyFrom.value;

    currencyFrom.value = currencyTo.value;
    currencyTo.value = temp;

    convertCurrency();
});
currencyAmount.addEventListener("input", convertCurrency);

currencyFrom.addEventListener("change", convertCurrency);

currencyTo.addEventListener("change", convertCurrency);