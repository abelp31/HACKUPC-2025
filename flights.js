const apiKey = 'sh967490139224896692439644109194';

async function obtenerPrecioVueloSkyscanner(origen, destino, fechaIda, fechaVuelta) {
    const baseUrl = 'https://partners.api.skyscanner.net/apiservices/v3/flights/live/search';

    try {
        const crearSesionResponse = await fetch(`${baseUrl}/create`, {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: {
                    market: 'ES',
                    locale: 'es-ES',
                    currency: 'EUR',
                    query_legs: [
                        {
                            origin_place_id: { iata: origen },
                            destination_place_id: { iata: destino },
                            date: { year: parseInt(fechaIda.substring(0, 4)), month: parseInt(fechaIda.substring(5, 7)), day: parseInt(fechaIda.substring(8, 10)) },
                        },
                        {
                            origin_place_id: { iata: destino },
                            destination_place_id: { iata: origen },
                            date: { year: parseInt(fechaVuelta.substring(0, 4)), month: parseInt(fechaVuelta.substring(5, 7)), day: parseInt(fechaVuelta.substring(8, 10)) },
                        },
                    ],
                    cabinClass: 'CABIN_CLASS_ECONOMY',
                    adults: 1,
                },
            }),
        });

        if (!crearSesionResponse.ok) {
            console.error(`Error al crear la sesión: ${crearSesionResponse.status} - ${crearSesionResponse.statusText}`);
            const errorBody = await crearSesionResponse.text();
            console.error('Cuerpo del error:', errorBody);
            throw new Error(`Error al crear la sesión: ${crearSesionResponse.status}`);
        }

        const crearSesionDatos = await crearSesionResponse.json();
        const sessionToken = crearSesionDatos.sessionToken;


        let resultadosCompletos = false;
        let resultados = null;
        let intentos = 0;
        const maxIntentos = 10;
        const intervaloPolling = 2000;

        while (!resultadosCompletos && intentos < maxIntentos) {
            intentos++;
            console.log(`Intentando obtener resultados (intento ${intentos})...`);
            var obtenerResultadosResponse = await fetch(`${baseUrl}/poll/${sessionToken}`, {
                method: 'POST',
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
            });

            if (!obtenerResultadosResponse.ok) {
                console.error(`Error al obtener los resultados (intento ${intentos}): ${obtenerResultadosResponse.status} - ${obtenerResultadosResponse.statusText}`);
                const errorBody = await obtenerResultadosResponse.text();
                console.error('Cuerpo del error:', errorBody);
                throw new Error(`Error al obtener los resultados (intento ${intentos}): ${obtenerResultadosResponse.status}`);
            }

            const respuestaPolling = await obtenerResultadosResponse.json();

            if (respuestaPolling.status === 'RESULT_STATUS_COMPLETE' || (respuestaPolling.results && Object.keys(respuestaPolling.results).length > 0)) {
                resultadosCompletos = true;
                resultados = respuestaPolling;
                console.log('Resultados completos obtenidos.');
                break;
            }

            await new Promise(resolve => setTimeout(resolve, intervaloPolling));
        }

        if (!resultadosCompletos) {
            console.log('No se obtuvieron resultados completos después de varios intentos.');
        }

        return resultados;

    } catch (error) {
        console.error('Hubo un error:', error);
        throw error;
    }
}

function extraerInformacionVuelos(resultados, escalas) {

    if (!resultados || !resultados.content.results || !resultados.content.results.itineraries) {
        console.log("No se encontraron itinerarios en los resultados.");
        return [];
    }

    const itinerarios = Object.values(resultados.content.results.itineraries);
    const carriers = resultados.content.results.carriers;
    const segments = resultados.content.results.segments;

    const legs = resultados.content.results.legs;

    const places = resultados.content.results.places;

    const vuelosInfo = [];
    let num = 1;
    for (const itinerario of itinerarios) {
        if (itinerario.pricingOptions && itinerario.pricingOptions.length > 0) {
            const precio = parseFloat(itinerario.pricingOptions[0].price.amount / 1000);
            const opcionesDeVueloIds = itinerario.legIds;
            const detallesVuelosIda = [];
            const detallesVuelosVuelta = [];

            if (opcionesDeVueloIds && opcionesDeVueloIds.length === 2) {
                const legIda = opcionesDeVueloIds[0];
                const legVuelta = opcionesDeVueloIds[1];


                const segmentosIda = legs[legIda].segmentIds;
                const segmentosVuelta = legs[legVuelta].segmentIds;

                const escalasIda = legs[legIda].stopCount;  //numero de escalas ida
                const escalasVuelta = legs[legVuelta].stopCount; //numero de escalas vuelta

                var min_escala = 0;

                if (escalas == 0 && (escalasIda > 0 || escalasVuelta > 0)) continue;
                else if (escalas == 1 && (escalasIda > 1 || escalasVuelta > 1)) continue;
                else if (escalas == 1) min_escala = 1;

                if (segmentosIda) {
                    for (const segmentId of segmentosIda) {
                        const segmento = segments[segmentId];
                        const carrierId = segmento.marketingCarrierId;
                        const departureTime = segmento.departureAt;
                        const arrivalTime = segmento.arrivalAt;
                        const departureAirportId = segmento.originPlaceId;
                        const arrivalAirportId = segmento.destinationPlaceId;

                        detallesVuelosIda.push({
                            aerolinea: carriers[carrierId].name,
                            salida: departureTime,
                            llegada: arrivalTime,
                            aeropuertoSalida: places[departureAirportId].name,
                            aeropuertoLlegada: places[arrivalAirportId].name,
                        });
                    }
                }

                if (segmentosVuelta) {
                    if (resultados.content.results.legs && resultados.content.results.legs[opcionesDeVueloIds[0]]) {
                        const segmentosIda = resultados.content.results.legs[opcionesDeVueloIds[0]].segment_ids;
                        if (segmentosIda) {
                            for (const segmentId of segmentosIda) {
                                const segmento = segments[segmentId];
                                if (segmento && carriers[segmento.marketing_carrier_id] && places[segmento.origin_place_id] && places[segmento.destination_place_id]) {
                                    detallesVuelosIda.push({
                                        aerolinea: carriers[segmento.marketing_carrier_id].name,
                                        salida: segmento.departure_at,
                                        llegada: segmento.arrival_at,
                                        aeropuertoSalida: places[segmento.origin_place_id].name,
                                        aeropuertoLlegada: places[segmento.destination_place_id].name,
                                    });
                                }
                            }
                        }
                    }

                    if (resultados.content.results.legs && resultados.content.results.legs[opcionesDeVueloIds[1]]) {
                        const segmentosVuelta = resultados.content.results.legs[opcionesDeVueloIds[1]].segment_ids;
                        if (segmentosVuelta) {
                            for (const segmentId of segmentosVuelta) {
                                const segmento = segments[segmentId];
                                if (segmento && carriers[segmento.marketing_carrier_id] && places[segmento.origin_place_id] && places[segmento.destination_place_id]) {
                                    detallesVuelosVuelta.push({
                                        aerolinea: carriers[segmento.marketing_carrier_id].name,
                                        salida: segmento.departure_at,
                                        llegada: segmento.arrival_at,
                                        aeropuertoSalida: places[segmento.origin_place_id].name,
                                        aeropuertoLlegada: places[segmento.destination_place_id].name,
                                    });
                                }
                            }
                        }
                    }
                    vuelosInfo.push({
                        precio: precio,
                        escala: min_escala
                    });
                }
            }
        }
        num++;
    }
    // ordenar los vuelos por precio de menor a mayor
    vuelosInfo.sort((a, b) => a.precio - b.precio);


    var slicedvuelosInfo = vuelosInfo.slice(0, 1);
    return slicedvuelosInfo;
}


module.exports.obtenerVuelos = async function obtenerVuelos(origen, destino, fechaIda, fechaVuelta) {
    return obtenerPrecioVueloSkyscanner(origen, destino, fechaIda, fechaVuelta)
        .then(resultado => {
            if (resultado) {
                var infoVuelos = extraerInformacionVuelos(resultado, 0);
                if (infoVuelos.length == 0) {
                    infoVuelos = extraerInformacionVuelos(resultado, 1);
                    if (infoVuelos.length == 0)
                        return null;
                }
                return infoVuelos;
            } else {
                console.log('No se encontraron resultados.');
                return null;
            }
        })
        .catch(error => {
        });
}