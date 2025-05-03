const API_KEY = "sh967490139224896692439644109194";


export const getNearestAirportIata = async (lat: number, lng: number): Promise<string> => {
    const response = await fetch(`https://partners.api.skyscanner.net/apiservices/v3/geo/hierarchy/flights/nearest`, {
        method: 'POST',
        headers: {
            "x-api-key": API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            locale: "en-GB",
            locator: {
                coordinates: {
                    latitude: lat,
                    longitude: lng
                }
            }
        }),
    });
    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}: ${await response.text()}`);
    }

    const data = await response.json();
    const nearestAirports = Object.entries(data.places).filter(([key, value]) => {
        const place = value as any;
        return place.type === "PLACE_TYPE_AIRPORT" && place.iata !== "";
    }).map(([key, value]) => {
        const place = value as any;
        return {
            entityId: place.entityId,
            name: place.name,
            iata: place.iata,
            coordinates: {
                latitude: place.coordinates.latitude,
                longitude: place.coordinates.longitude
            }
        };
    });

    if (nearestAirports.length === 0) {
        console.error(`No airports found near coordinates: ${lat}, ${lng}, returning bcn`);
        return "95565085"
    }

    const mostNear = nearestAirports[0];
    console.log(`Using nearest airport: ${mostNear.name} (${mostNear.iata}) at (lat,lng)=(${mostNear.coordinates.latitude},${mostNear.coordinates.longitude})`);
    return mostNear.iata;
}


interface IndicativeSearchParam {
    originIsoCode: string;
    destinationIsoCode: string;
}


// export const filterWithConstraints = async (players: Player[], destinationsIsoCountry: string[], month: number) => {
//     let finalDestinations = destinationsIsoCountry.slice();

//     // TODO: fer servir promise.all()
//     for (const player of players) {
//         for (const destinationIsoCode of destinationsIsoCountry) {
//             const destinationData = searchCountryByISO(destinationIsoCode);
//             if (!destinationData) {
//                 console.error(`Destination ${destinationIsoCode} not found`);
//                 continue;
//             }

//             // 
//             const legs: IndicativeSearchParam[] = [
//                 {
//                     originIsoCode: player.originCountry,
//                     destinationIsoCode: destinationData.isoCode
//                 },
//                 {
//                     originIsoCode: destinationData.isoCode,
//                     destinationIsoCode: player.originCountry
//                 }
//             ];

//             const data = await getIndicativeSearch(legs, month);

//             // if any if data.content.results.quotes has a minPrice.amount > player.maxBudget, then remove the destination from the finalDestinations array
//             if (data) {
//                 // TODO: cal comprovar el leg d'anada i de tornada, sumar-ho i que sigui <= player.maxBudget
//                 const filteredResults = Object.entries(data.content.results.quotes).filter(([key, value]) => {
//                     const minPrice = parseFloat((value as any).minPrice.amount);
//                     return minPrice <= player.maxBudget;
//                 });
//                 if (filteredResults.length === 0) {
//                     finalDestinations = finalDestinations.filter(destination => destination !== destinationIsoCode);
//                 }
//             }

//         }
//     }

//     return finalDestinations;
// };

// export const getIndicativeSearch = async (legs: IndicativeSearchParam[], month: number) => {
//     const finalLegs = legs.map(leg => {
//         const { originIsoCode, destinationIsoCode } = leg;
//         return {
//             originData: searchCountryByISO(originIsoCode),
//             destinationData: searchCountryByISO(destinationIsoCode)
//         };
//     });

//     const params = finalLegs.filter(leg => leg.originData && leg.destinationData).map(leg => {
//         const [originInternalCode, destinationInternalCode] = [leg.originData!.entityId, leg.destinationData!.entityId];
//         return {
//             originPlace: {
//                 queryPlace: {
//                     entityId: originInternalCode.toString()
//                 }
//             },
//             destinationPlace: {
//                 queryPlace: {
//                     entityId: destinationInternalCode.toString()
//                 }
//             },
//             "date_range": {
//                 startDate: {
//                     year: new Date().getFullYear(),
//                     month: month
//                 },
//                 endDate: {
//                     year: new Date().getFullYear(),
//                     month: month + 1
//                 }
//             }
//         }
//     });

//     const response = await fetch('https://partners.api.skyscanner.net/apiservices/v3/flights/indicative/search', {
//         method: 'POST',
//         headers: {
//             "x-api-key": API_KEY,
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             "query": {
//                 "currency": "EUR",
//                 "locale": "es-ES",
//                 "market": "ES",
//                 "dateTimeGroupingType": "DATE_TIME_GROUPING_TYPE_BY_MONTH",
//                 "queryLegs": params
//             }
//         })
//     });
//     if (!response.ok) {
//         throw new Error(`Error: ${response.status} ${response.statusText}: ${await response.text()}`);
//     }
//     const data = await response.json();
//     return data;
// };
