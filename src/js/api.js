//country url : "https://date.nager.at/api/v3/AvailableCountries
export async function fetchData(url) {
    try{
        const response = await fetch(url);
       const data = await response.json();
        return data;
    }catch{
        console.log("error in api"  )
    }
}
export async function getExchangeRates() {
    const url = "https://open.er-api.com/v6/latest/USD";

    return await fetchData(url);
}