import { searchCountryByISO } from "./internal_data";
import { Player } from "./types";

const API_KEY = "sh967490139224896692439644109194";

interface IndicativeSearchParam {
    originIsoCode: string;
    destinationIsoCode: string;
}


export const filterWithConstraints = async (players: Player[], destinationsIsoCountry: string[], month: number) => {


    let finalDestinations = destinationsIsoCountry.slice();
    // I have a list of players which each one has a player.maxBudget and player.originCountry (iso-code). I need to filter the destinationsIsoCountry array by the players maxBudget and originCountry.
    // The origin iso code should be the same as the player originCountry, and the destination iso code should be in the destinationsIsoCountry array.
    // The resulting data should be an array of country isoCodes
    // Code:
    // 1. Get the indicative search data from the API

    for (const player of players) {
        for (const destinationIsoCode of destinationsIsoCountry) {
            const destinationData = searchCountryByISO(destinationIsoCode);
            if (!destinationData) {
                console.error(`Destination ${destinationIsoCode} not found`);
                continue;
            }
            const leg: IndicativeSearchParam = {
                originIsoCode: player.originCountry,
                destinationIsoCode: destinationData.isoCode
            };

            const data = await getIndicativeSearch([leg], month);

            // if any if data.content.results.quotes has a minPrice.amount > player.maxBudget, then remove the destination from the finalDestinations array
            if (data) {
                const filteredResults = Object.entries(data.content.results.quotes).filter(([key, value]) => {
                    const minPrice = parseFloat((value as any).minPrice.amount);
                    return minPrice <= player.maxBudget;
                });
                if (filteredResults.length === 0) {
                    finalDestinations = finalDestinations.filter(destination => destination !== destinationIsoCode);
                }
            }

        }
    }

    return finalDestinations;
};

export const getIndicativeSearch = async (legs: IndicativeSearchParam[], month: number) => {
    const finalLegs = legs.map(leg => {
        const { originIsoCode, destinationIsoCode } = leg;
        return {
            originData: searchCountryByISO(originIsoCode),
            destinationData: searchCountryByISO(destinationIsoCode)
        };
    });

    const params = finalLegs.filter(leg => leg.originData && leg.destinationData).map(leg => {
        const [originInternalCode, destinationInternalCode] = [leg.originData!.entityId, leg.destinationData!.entityId];
        return {
            originPlace: {
                queryPlace: {
                    entityId: originInternalCode.toString()
                }
            },
            destinationPlace: {
                queryPlace: {
                    entityId: destinationInternalCode.toString()
                }
            },
            "date_range": {
                startDate: {
                    year: new Date().getFullYear(),
                    month: month
                },
                endDate: {
                    year: new Date().getFullYear(),
                    month: month + 1
                }
            }
        }
    });

    const response = await fetch('https://partners.api.skyscanner.net/apiservices/v3/flights/indicative/search', {
        method: 'POST',
        headers: {
            "x-api-key": "sh967490139224896692439644109194",
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "query": {
                "currency": "EUR",
                "locale": "es-ES",
                "market": "ES",
                "dateTimeGroupingType": "DATE_TIME_GROUPING_TYPE_BY_MONTH",
                "queryLegs": params
            }
        })
    });
    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}: ${await response.text()}`);
    }
    const data = await response.json();
    return data;
};
