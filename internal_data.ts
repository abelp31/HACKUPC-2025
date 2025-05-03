export const searchCountryByName = (name: string) => {
    // find country by name, from array countries, case insensitive and partial match. Get the most similar country name
    return sergiCountriesParsed.find((country) => {
        return country.name.toLowerCase().includes(name.toLowerCase());
    }) || null;
}

export const searchCountryByISO = (iso: string) => {
    // find country by ISO code, from array countries, case insensitive and partial match. Get the most similar country name
    return sergiCountriesParsed.find((country) => {
        return country.isoCode.toLowerCase() === iso.toLowerCase();
    }) || null;
};


export const searchContinentByName = (name: string) => {
    // find continent by name. Case insensitive and partial match. Get the most similar continent name
    return sergiContinentsData.find((continent) => {
        return continent.name.toLowerCase().includes(name.toLowerCase());
    }) || null;
}

interface CountryCoordinateData {
    entityId: number;
    parentId: number;
    name: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    isoCode: string;
}

interface ContinentData {
    entityId: string; // Kept as string to match source JSON
    parentId: string;
    name: string;
    type: string;
    iata: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
}

const sergiContinentsData: ContinentData[] = [
    {
        entityId: "205351567",
        parentId: "",
        name: "North America",
        type: "PLACE_TYPE_CONTINENT",
        iata: "",
        coordinates: { latitude: 56.4203028702821, longitude: -92.41051848992336 }
    },
    {
        entityId: "205351568",
        parentId: "",
        name: "South America",
        type: "PLACE_TYPE_CONTINENT",
        iata: "",
        coordinates: { latitude: -15.126347372188903, longitude: -60.784267219684395 }
    },
    {
        entityId: "27563220",
        parentId: "",
        name: "Africa",
        type: "PLACE_TYPE_CONTINENT",
        iata: "",
        coordinates: { latitude: 6.3748017182, longitude: 18.2433296135 }
    },
    {
        entityId: "27563221",
        parentId: "",
        name: "Europe",
        type: "PLACE_TYPE_CONTINENT",
        iata: "",
        coordinates: { latitude: 55.280210962380146, longitude: 29.382113552883705 }
    },
    {
        entityId: "27563222",
        parentId: "",
        name: "Asia",
        type: "PLACE_TYPE_CONTINENT",
        iata: "",
        coordinates: { latitude: 45.0390122417, longitude: 96.0944165084 }
    },
    {
        entityId: "27563223",
        parentId: "",
        name: "Oceania",
        type: "PLACE_TYPE_CONTINENT",
        iata: "",
        coordinates: { latitude: -21.274035826123804, longitude: 133.47223041864578 }
    }
];

const sergiCountriesParsed: CountryCoordinateData[] = [
    { entityId: 29475085, parentId: 205351567, name: "Puerto Rico", coordinates: { latitude: 18.2181427864, longitude: -66.4557198169 }, isoCode: "PR" },
    { entityId: 29475086, parentId: 205351567, name: "Bermuda", coordinates: { latitude: 32.3117650658, longitude: -64.7723991192 }, isoCode: "BM" },
    { entityId: 29475087, parentId: 205351567, name: "Anguilla", coordinates: { latitude: 18.2271339749, longitude: -63.0737127879 }, isoCode: "AI" },
    { entityId: 29475089, parentId: 205351567, name: "Cayman Islands", coordinates: { latitude: 19.4442825652, longitude: -80.8430320863 }, isoCode: "KY" },
    { entityId: 29475092, parentId: 205351567, name: "Turks and Caicos Islands", coordinates: { latitude: 21.7094295724, longitude: -71.7792410804 }, isoCode: "TC" },
    { entityId: 29475094, parentId: 27563221, name: "Gibraltar", coordinates: { latitude: 36.1354865793, longitude: -5.3509095852 }, isoCode: "GI" },
    { entityId: 29475095, parentId: 205351567, name: "Montserrat", coordinates: { latitude: 16.7407559257, longitude: -62.1896040151 }, isoCode: "MS" },
    { entityId: 29475098, parentId: 27563223, name: "American Samoa", coordinates: { latitude: -14.2416708477, longitude: -170.3192456528 }, isoCode: "AS" },
    { entityId: 29475101, parentId: 27563223, name: "Cook Islands", coordinates: { latitude: -14.7405912985, longitude: -159.5902593645 }, isoCode: "CK" },
    { entityId: 29475102, parentId: 27563221, name: "Croatia", coordinates: { latitude: 44.9569774011, longitude: 16.3134922106 }, isoCode: "HR" },
    { entityId: 29475137, parentId: 27563222, name: "Cocos (Keeling) Islands", coordinates: { latitude: -12.1410702313, longitude: 96.8677588401 }, isoCode: "CC" },
    { entityId: 29475139, parentId: 27563222, name: "Christmas Island", coordinates: { latitude: -10.4857011548, longitude: 105.6299551833 }, isoCode: "CX" },
    { entityId: 29475143, parentId: 27563221, name: "Faroe Islands", coordinates: { latitude: 62.0648238039, longitude: -6.8725264145 }, isoCode: "FO" },
    { entityId: 29475144, parentId: 205351568, name: "French Guiana", coordinates: { latitude: 3.9358173519, longitude: -53.2263580832 }, isoCode: "GF" },
    { entityId: 29475145, parentId: 27563221, name: "Guernsey", coordinates: { latitude: 49.4971457639, longitude: -2.4764799107 }, isoCode: "GG" },
    { entityId: 29475146, parentId: 205351567, name: "Greenland", coordinates: { latitude: 74.6710435374, longitude: -41.3139154398 }, isoCode: "GL" },
    { entityId: 29475147, parentId: 205351567, name: "Guadeloupe", coordinates: { latitude: 16.2129140112, longitude: -61.5308281404 }, isoCode: "GP" },
    { entityId: 29475148, parentId: 27563223, name: "Guam", coordinates: { latitude: 13.4491097106, longitude: 144.7746765833 }, isoCode: "GU" },
    { entityId: 29475151, parentId: 27563221, name: "Isle of Man", coordinates: { latitude: 54.224890409332765, longitude: -4.5404334302642395 }, isoCode: "IM" },
    { entityId: 29475153, parentId: 27563221, name: "Jersey", coordinates: { latitude: 49.2116285112, longitude: -2.1362673839 }, isoCode: "JE" },
    { entityId: 29475156, parentId: 27563223, name: "Marshall Islands", coordinates: { latitude: 8.5805229927, longitude: 168.8623975888 }, isoCode: "MH" },
    { entityId: 29475157, parentId: 27563223, name: "Northern Mariana Islands", coordinates: { latitude: 16.0191011597, longitude: 145.6080944412 }, isoCode: "MP" },
    { entityId: 29475159, parentId: 27563223, name: "New Caledonia", coordinates: { latitude: -21.292760972, longitude: 165.720713197 }, isoCode: "NC" },
    { entityId: 29475160, parentId: 27563223, name: "Norfolk Island", coordinates: { latitude: -29.0547523718, longitude: 167.9530783262 }, isoCode: "NF" },
    { entityId: 29475161, parentId: 27563223, name: "French Polynesia", coordinates: { latitude: -16.4478585552, longitude: -144.4737107781 }, isoCode: "PF" },
    { entityId: 29475164, parentId: 27563223, name: "Palau", coordinates: { latitude: 7.3476757669, longitude: 134.4497758934 }, isoCode: "PW" },
    { entityId: 29475176, parentId: 27563220, name: "Rwanda", coordinates: { latitude: -2.0004886671, longitude: 29.9234708086 }, isoCode: "RW" },
    { entityId: 29475180, parentId: 27563220, name: "Somalia", coordinates: { latitude: 6.0757933452, longitude: 45.8766712407 }, isoCode: "SO" },
    { entityId: 29475186, parentId: 27563222, name: "Iraq", coordinates: { latitude: 32.999688191, longitude: 43.7551667592 }, isoCode: "IQ" },
    { entityId: 29475192, parentId: 27563222, name: "Saudi Arabia", coordinates: { latitude: 24.0881841373, longitude: 44.5146238455 }, isoCode: "SA" },
    { entityId: 29475194, parentId: 27563222, name: "Iran", coordinates: { latitude: 32.5459170617, longitude: 54.3025988814 }, isoCode: "IR" },
    { entityId: 29475197, parentId: 27563221, name: "Cyprus", coordinates: { latitude: 35.050566659413356, longitude: 33.2375900131998 }, isoCode: "CY" },
    { entityId: 29475199, parentId: 27563220, name: "Tanzania", coordinates: { latitude: -6.2707989024, longitude: 34.8436465394 }, isoCode: "TZ" },
    { entityId: 29475200, parentId: 27563222, name: "Syria", coordinates: { latitude: 35.0287112877, longitude: 38.5277379418 }, isoCode: "SY" },
    { entityId: 29475202, parentId: 27563222, name: "Armenia", coordinates: { latitude: 40.2935095468, longitude: 44.9384190488 }, isoCode: "AM" },
    { entityId: 29475203, parentId: 27563220, name: "Kenya", coordinates: { latitude: 0.5220691685957013, longitude: 37.86519225909078 }, isoCode: "KE" },
    { entityId: 29475206, parentId: 27563220, name: "Djibouti", coordinates: { latitude: 11.7331390275, longitude: 42.6007302724 }, isoCode: "DJ" },
    { entityId: 29475207, parentId: 27563220, name: "Uganda", coordinates: { latitude: 1.2810856906, longitude: 32.3916041964 }, isoCode: "UG" },
    { entityId: 29475208, parentId: 27563220, name: "Central African Republic", coordinates: { latitude: 6.5742309584, longitude: 20.486595685 }, isoCode: "CF" },
    { entityId: 29475209, parentId: 27563220, name: "Seychelles", coordinates: { latitude: -6.8676500456, longitude: 51.6142466668 }, isoCode: "SC" },
    { entityId: 29475210, parentId: 27563222, name: "Jordan", coordinates: { latitude: 31.2489689456, longitude: 36.7886097355 }, isoCode: "JO" },
    { entityId: 29475211, parentId: 27563222, name: "Lebanon", coordinates: { latitude: 33.923133618, longitude: 35.8863374687 }, isoCode: "LB" },
    { entityId: 29475212, parentId: 27563222, name: "Kuwait", coordinates: { latitude: 29.3560823022, longitude: 47.6398325625 }, isoCode: "KW" },
    { entityId: 29475213, parentId: 27563222, name: "Oman", coordinates: { latitude: 20.5951251215, longitude: 56.1085803848 }, isoCode: "OM" },
    { entityId: 29475214, parentId: 27563222, name: "Qatar", coordinates: { latitude: 25.3325436302, longitude: 51.1919425043 }, isoCode: "QA" },
    { entityId: 29475215, parentId: 27563222, name: "Bahrain", coordinates: { latitude: 26.055058644463585, longitude: 50.56568851411028 }, isoCode: "BH" },
    { entityId: 29475216, parentId: 27563222, name: "United Arab Emirates", coordinates: { latitude: 23.8829348282, longitude: 54.1299836841 }, isoCode: "AE" },
    { entityId: 29475217, parentId: 27563222, name: "Israel", coordinates: { latitude: 31.4845941707, longitude: 35.0220813024 }, isoCode: "IL" },
    { entityId: 29475224, parentId: 27563220, name: "Ethiopia", coordinates: { latitude: 8.6326648896, longitude: 39.6378558049 }, isoCode: "ET" },
    { entityId: 29475225, parentId: 27563220, name: "Eritrea", coordinates: { latitude: 15.3870318595, longitude: 38.9025640222 }, isoCode: "ER" },
    { entityId: 29475226, parentId: 27563220, name: "Egypt", coordinates: { latitude: 26.580500459, longitude: 29.7978279323 }, isoCode: "EG" },
    { entityId: 29475228, parentId: 27563220, name: "Sudan", coordinates: { latitude: 16.0536011428, longitude: 30.0142711247 }, isoCode: "SD" },
    { entityId: 29475229, parentId: 27563221, name: "Greece", coordinates: { latitude: 38.9287708046, longitude: 23.0651983495 }, isoCode: "GR" },
    { entityId: 29475231, parentId: 27563220, name: "Burundi", coordinates: { latitude: -3.3668578183, longitude: 29.8897224811 }, isoCode: "BI" },
    { entityId: 29475233, parentId: 27563221, name: "Estonia", coordinates: { latitude: 58.6800566979, longitude: 25.4093888843 }, isoCode: "EE" },
    { entityId: 29475236, parentId: 27563221, name: "Latvia", coordinates: { latitude: 56.8552599784, longitude: 24.9199790662 }, isoCode: "LV" },
    { entityId: 29475238, parentId: 27563222, name: "Azerbaijan", coordinates: { latitude: 40.2775529949, longitude: 47.5634719122 }, isoCode: "AZ" },
    { entityId: 29475240, parentId: 27563221, name: "Lithuania", coordinates: { latitude: 55.3351733711, longitude: 23.8986884198 }, isoCode: "LT" },
    { entityId: 29475251, parentId: 27563221, name: "Belarus", coordinates: { latitude: 53.546160362, longitude: 28.0604595892 }, isoCode: "BY" },
    { entityId: 29475253, parentId: 27563221, name: "Finland", coordinates: { latitude: 64.3678289207, longitude: 26.1132870139 }, isoCode: "FI" },
    { entityId: 29475255, parentId: 27563221, name: "Ukraine", coordinates: { latitude: 49.1493532179, longitude: 31.2936894063 }, isoCode: "UA" },
    { entityId: 29475257, parentId: 27563221, name: "Hungary", coordinates: { latitude: 47.1676635925, longitude: 19.4111128707 }, isoCode: "HU" },
    { entityId: 29475258, parentId: 27563221, name: "Bulgaria", coordinates: { latitude: 42.7620578045, longitude: 25.2366815333 }, isoCode: "BG" },
    { entityId: 29475259, parentId: 27563221, name: "Albania", coordinates: { latitude: 41.131855457, longitude: 20.0447636388 }, isoCode: "AL" },
    { entityId: 29475260, parentId: 27563221, name: "Poland", coordinates: { latitude: 52.1313582688, longitude: 19.3970229231 }, isoCode: "PL" },
    { entityId: 29475261, parentId: 27563221, name: "Romania", coordinates: { latitude: 45.8449438849, longitude: 24.9818447231 }, isoCode: "RO" },
    { entityId: 29475262, parentId: 27563220, name: "Zimbabwe", coordinates: { latitude: -19.0002745425, longitude: 29.8687100746 }, isoCode: "ZW" },
    { entityId: 29475263, parentId: 27563220, name: "Zambia", coordinates: { latitude: -13.4573738465, longitude: 27.7942359522 }, isoCode: "ZM" },
    { entityId: 29475264, parentId: 27563220, name: "Comoros", coordinates: { latitude: -11.9297599835, longitude: 43.7297744131 }, isoCode: "KM" },
    { entityId: 29475265, parentId: 27563220, name: "Malawi", coordinates: { latitude: -13.2153055705, longitude: 34.3003769731 }, isoCode: "MW" },
    { entityId: 29475268, parentId: 27563220, name: "Lesotho", coordinates: { latitude: -29.5804211675, longitude: 28.2536074473 }, isoCode: "LS" },
    { entityId: 29475270, parentId: 27563220, name: "Mauritius", coordinates: { latitude: -19.682187182, longitude: 58.1295313018 }, isoCode: "MU" },
    { entityId: 29475271, parentId: 27563220, name: "Eswatini", coordinates: { latitude: -26.564744827, longitude: 31.5015635087 }, isoCode: "SZ" },
    { entityId: 29475272, parentId: 27563220, name: "South Africa", coordinates: { latitude: -29.0162249439, longitude: 25.0844988803 }, isoCode: "ZA" },
    { entityId: 29475273, parentId: 27563220, name: "Mozambique", coordinates: { latitude: -17.2633816356, longitude: 35.5699387782 }, isoCode: "MZ" },
    { entityId: 29475274, parentId: 27563220, name: "Madagascar", coordinates: { latitude: -19.3254058856, longitude: 46.7099988042 }, isoCode: "MG" },
    { entityId: 29475275, parentId: 27563222, name: "Afghanistan", coordinates: { latitude: 33.8284980294, longitude: 66.0297374799 }, isoCode: "AF" },
    { entityId: 29475277, parentId: 27563222, name: "Pakistan", coordinates: { latitude: 29.93113050899727, longitude: 69.35904422167194 }, isoCode: "PK" },
    { entityId: 29475278, parentId: 27563222, name: "Bangladesh", coordinates: { latitude: 23.7890148299, longitude: 90.2884906455 }, isoCode: "BD" },
    { entityId: 29475280, parentId: 27563222, name: "Tajikistan", coordinates: { latitude: 38.5281106391, longitude: 71.0372202288 }, isoCode: "TJ" },
    { entityId: 29475281, parentId: 27563222, name: "Sri Lanka", coordinates: { latitude: 7.6628410527, longitude: 80.6850542591 }, isoCode: "LK" },
    { entityId: 29475283, parentId: 27563222, name: "Bhutan", coordinates: { latitude: 27.4192409564, longitude: 90.4271041804 }, isoCode: "BT" },
    { entityId: 29475284, parentId: 27563222, name: "India", coordinates: { latitude: 22.8576456589, longitude: 79.6206722808 }, isoCode: "IN" },
    { entityId: 29475313, parentId: 27563222, name: "Maldives", coordinates: { latitude: 4.4154595301, longitude: 73.172340374 }, isoCode: "MV" },
    { entityId: 29475315, parentId: 27563222, name: "Myanmar", coordinates: { latitude: 20.964082493196447, longitude: 96.5186483431809 }, isoCode: "MM" },
    { entityId: 29475316, parentId: 27563222, name: "Uzbekistan", coordinates: { latitude: 41.7519517021, longitude: 63.1632074967 }, isoCode: "UZ" },
    { entityId: 29475317, parentId: 27563222, name: "Kazakhstan", coordinates: { latitude: 48.1541864385, longitude: 67.2345542895 }, isoCode: "KZ" },
    { entityId: 29475318, parentId: 27563222, name: "Kyrgyzstan", coordinates: { latitude: 41.4620104304, longitude: 74.5505148112 }, isoCode: "KG" },
    { entityId: 29475319, parentId: 27563222, name: "Vietnam", coordinates: { latitude: 16.612651416, longitude: 106.3323283034 }, isoCode: "VN" },
    { entityId: 29475320, parentId: 27563222, name: "Thailand", coordinates: { latitude: 15.0184668069, longitude: 100.9954597773 }, isoCode: "TH" },
    { entityId: 29475321, parentId: 27563222, name: "Indonesia", coordinates: { latitude: -2.263685612, longitude: 117.3901379167 }, isoCode: "ID" },
    { entityId: 29475322, parentId: 27563222, name: "Laos", coordinates: { latitude: 18.4951495884, longitude: 103.7673193533 }, isoCode: "LA" },
    { entityId: 29475324, parentId: 27563222, name: "Philippines", coordinates: { latitude: 11.6380745384, longitude: 122.8292538755 }, isoCode: "PH" },
    { entityId: 29475325, parentId: 27563222, name: "Malaysia", coordinates: { latitude: 3.8149095478, longitude: 109.7527907455 }, isoCode: "MY" },
    { entityId: 29475326, parentId: 27563222, name: "China", coordinates: { latitude: 36.53140750323734, longitude: 103.91375723914877 }, isoCode: "CN" },
    { entityId: 29475328, parentId: 27563222, name: "Cambodia", coordinates: { latitude: 12.6960225182, longitude: 104.9067793317 }, isoCode: "KH" },
    { entityId: 29475330, parentId: 27563222, name: "Japan", coordinates: { latitude: 37.31327272144959, longitude: 137.6721328885855 }, isoCode: "JP" },
    { entityId: 29475332, parentId: 27563222, name: "Singapore", coordinates: { latitude: 1.336807652, longitude: 103.8248208618 }, isoCode: "SG" },
    { entityId: 29475333, parentId: 27563222, name: "Timor-Leste", coordinates: { latitude: -8.8140340166, longitude: 125.863220227 }, isoCode: "TL" },
    { entityId: 29475334, parentId: 27563221, name: "Russia", coordinates: { latitude: 62.03628096751886, longitude: 96.62490346971676 }, isoCode: "RU" },
    { entityId: 29475335, parentId: 27563222, name: "Mongolia", coordinates: { latitude: 46.836418441, longitude: 103.0670870878 }, isoCode: "MN" },
    { entityId: 29475336, parentId: 27563223, name: "Australia", coordinates: { latitude: -25.7123066759, longitude: 134.4995834211 }, isoCode: "AU" },
    { entityId: 29475337, parentId: 27563223, name: "Papua New Guinea", coordinates: { latitude: -6.4967565804, longitude: 145.456577482 }, isoCode: "PG" },
    { entityId: 29475338, parentId: 27563223, name: "Solomon Islands", coordinates: { latitude: -8.7678963274, longitude: 159.4421733821 }, isoCode: "SB" },
    { entityId: 29475339, parentId: 27563223, name: "Tuvalu", coordinates: { latitude: -8.225245937, longitude: 178.7238575116 }, isoCode: "TV" },
    { entityId: 29475340, parentId: 27563223, name: "Nauru", coordinates: { latitude: -0.5283451051, longitude: 166.9347239971 }, isoCode: "NR" },
    { entityId: 29475341, parentId: 27563223, name: "Vanuatu", coordinates: { latitude: -16.2026981915, longitude: 167.7289688756 }, isoCode: "VU" },
    { entityId: 29475342, parentId: 27563223, name: "New Zealand", coordinates: { latitude: -41.760114156103015, longitude: 170.3537545294575 }, isoCode: "NZ" },
    { entityId: 29475343, parentId: 27563223, name: "Fiji", coordinates: { latitude: -17.4083824049, longitude: 163.5729098687 }, isoCode: "FJ" },
    { entityId: 29475344, parentId: 27563220, name: "Libya", coordinates: { latitude: 27.0455434454, longitude: 18.0321999406 }, isoCode: "LY" },
    { entityId: 29475346, parentId: 27563220, name: "Senegal", coordinates: { latitude: 14.359973474, longitude: -14.4807324063 }, isoCode: "SN" },
    { entityId: 29475349, parentId: 27563221, name: "Portugal", coordinates: { latitude: 39.5589102406, longitude: -8.6203657658 }, isoCode: "PT" },
    { entityId: 29475350, parentId: 27563220, name: "Liberia", coordinates: { latitude: 6.4400866405, longitude: -9.3104553855 }, isoCode: "LR" },
    { entityId: 29475352, parentId: 27563220, name: "Ghana", coordinates: { latitude: 7.9592011082, longitude: -1.2078909539 }, isoCode: "GH" },
    { entityId: 29475353, parentId: 27563220, name: "Equatorial Guinea", coordinates: { latitude: 1.7161426548, longitude: 10.3040735079 }, isoCode: "GQ" },
    { entityId: 29475354, parentId: 27563220, name: "Nigeria", coordinates: { latitude: 9.5829163129, longitude: 8.0924280053 }, isoCode: "NG" },
    { entityId: 29475355, parentId: 27563220, name: "Burkina Faso", coordinates: { latitude: 12.2855048768, longitude: -1.7442941044 }, isoCode: "BF" },
    { entityId: 29475358, parentId: 27563220, name: "Mauritania", coordinates: { latitude: 20.2649709909, longitude: -10.3455219235 }, isoCode: "MR" },
    { entityId: 29475359, parentId: 27563220, name: "Benin", coordinates: { latitude: 9.6533385659, longitude: 2.3396796389 }, isoCode: "BJ" },
    { entityId: 29475360, parentId: 27563220, name: "Gabon", coordinates: { latitude: -0.6209509663, longitude: 11.7695387581 }, isoCode: "GA" },
    { entityId: 29475361, parentId: 27563220, name: "Sierra Leone", coordinates: { latitude: 8.5485663212, longitude: -11.8113658152 }, isoCode: "SL" },
    { entityId: 29475363, parentId: 27563220, name: "Gambia", coordinates: { latitude: 13.4438427057, longitude: -15.4392986776 }, isoCode: "GM" },
    { entityId: 29475364, parentId: 27563220, name: "Guinea", coordinates: { latitude: 10.4334758402, longitude: -10.95235831 }, isoCode: "GN" },
    { entityId: 29475365, parentId: 27563220, name: "Chad", coordinates: { latitude: 15.3648855413, longitude: 18.6666177703 }, isoCode: "TD" },
    { entityId: 29475366, parentId: 27563220, name: "Niger", coordinates: { latitude: 17.4244748372, longitude: 9.4014727294 }, isoCode: "NE" },
    { entityId: 29475367, parentId: 27563220, name: "Mali", coordinates: { latitude: 17.3578890728, longitude: -3.526575855 }, isoCode: "ML" },
    { entityId: 29475370, parentId: 27563220, name: "Morocco", coordinates: { latitude: 31.8537355306, longitude: -6.28022404 }, isoCode: "MA" },
    { entityId: 29475371, parentId: 27563221, name: "Malta", coordinates: { latitude: 35.9267363037, longitude: 14.3984298727 }, isoCode: "MT" },
    { entityId: 29475372, parentId: 27563220, name: "Algeria", coordinates: { latitude: 28.1662365217, longitude: 2.6782674575 }, isoCode: "DZ" },
    { entityId: 29475373, parentId: 27563221, name: "Denmark", coordinates: { latitude: 55.9318101323, longitude: 10.0947171398 }, isoCode: "DK" },
    { entityId: 29475374, parentId: 27563221, name: "Iceland", coordinates: { latitude: 65.0214175216, longitude: -18.7127229735 }, isoCode: "IS" },
    { entityId: 29475375, parentId: 27563221, name: "United Kingdom", coordinates: { latitude: 54.2532367516, longitude: -2.9767221462 }, isoCode: "GB" },
    { entityId: 29475376, parentId: 27563221, name: "Switzerland", coordinates: { latitude: 46.81021982238213, longitude: 8.241289229298554 }, isoCode: "CH" },
    { entityId: 29475377, parentId: 27563221, name: "Sweden", coordinates: { latitude: 62.6911503511, longitude: 16.7801817 }, isoCode: "SE" },
    { entityId: 29475378, parentId: 27563221, name: "Netherlands", coordinates: { latitude: 52.267659889, longitude: 5.5654672212 }, isoCode: "NL" },
    { entityId: 29475380, parentId: 27563221, name: "Belgium", coordinates: { latitude: 50.6417020662, longitude: 4.6597255545 }, isoCode: "BE" },
    { entityId: 29475381, parentId: 27563221, name: "Germany", coordinates: { latitude: 51.1542564766, longitude: 10.3963477533 }, isoCode: "DE" },
    { entityId: 29475382, parentId: 27563221, name: "Luxembourg", coordinates: { latitude: 49.7749074655, longitude: 6.0938287282 }, isoCode: "LU" },
    { entityId: 29475383, parentId: 27563221, name: "Ireland", coordinates: { latitude: 53.1823172275, longitude: -8.2364947844 }, isoCode: "IE" },
    { entityId: 29475385, parentId: 27563221, name: "France", coordinates: { latitude: 46.5525478148, longitude: 2.5256872161 }, isoCode: "FR" },
    { entityId: 29475388, parentId: 27563221, name: "Slovakia", coordinates: { latitude: 48.7094546865, longitude: 19.4835994005 }, isoCode: "SK" },
    { entityId: 29475390, parentId: 27563221, name: "Norway", coordinates: { latitude: 68.58552678092275, longitude: 15.32775776500167 }, isoCode: "NO" },
    { entityId: 29475394, parentId: 27563221, name: "Slovenia", coordinates: { latitude: 46.123233192, longitude: 14.8155350871 }, isoCode: "SI" },
    { entityId: 29475395, parentId: 27563221, name: "Montenegro", coordinates: { latitude: 42.7683085783, longitude: 19.2307196961 }, isoCode: "ME" },
    { entityId: 29475396, parentId: 27563221, name: "Bosnia and Herzegovina", coordinates: { latitude: 44.1755070302, longitude: 17.7887811875 }, isoCode: "BA" },
    { entityId: 29475397, parentId: 27563220, name: "Angola", coordinates: { latitude: -12.2947322593, longitude: 17.540121333 }, isoCode: "AO" },
    { entityId: 29475398, parentId: 27563220, name: "Namibia", coordinates: { latitude: -22.1435127195, longitude: 17.214597834 }, isoCode: "NA" },
    { entityId: 29475399, parentId: 205351567, name: "Barbados", coordinates: { latitude: 13.1766941458, longitude: -59.553546683 }, isoCode: "BB" },
    { entityId: 29475401, parentId: 205351568, name: "Guyana", coordinates: { latitude: 4.8014571859, longitude: -58.9776712576 }, isoCode: "GY" },
    { entityId: 29475403, parentId: 205351568, name: "Paraguay", coordinates: { latitude: -23.242980185, longitude: -58.3927740041 }, isoCode: "PY" },
    { entityId: 29475404, parentId: 205351568, name: "Uruguay", coordinates: { latitude: -32.8041189859, longitude: -56.0186936023 }, isoCode: "UY" },
    { entityId: 29475405, parentId: 205351568, name: "Brazil", coordinates: { latitude: -10.7556598919, longitude: -53.056356166 }, isoCode: "BR" },
    { entityId: 29475406, parentId: 205351567, name: "Jamaica", coordinates: { latitude: 18.1481640787, longitude: -77.3067275474 }, isoCode: "JM" },
    { entityId: 29475407, parentId: 205351567, name: "Dominican Republic", coordinates: { latitude: 18.8920345367, longitude: -70.4650877038 }, isoCode: "DO" },
    { entityId: 29475408, parentId: 205351567, name: "Cuba", coordinates: { latitude: 21.6688428389, longitude: -79.1387789732 }, isoCode: "CU" },
    { entityId: 29475409, parentId: 205351567, name: "Bahamas", coordinates: { latitude: 24.4460487795, longitude: -76.6334611984 }, isoCode: "BS" },
    { entityId: 29475410, parentId: 205351568, name: "Trinidad and Tobago", coordinates: { latitude: 10.4745893961, longitude: -61.2713639066 }, isoCode: "TT" },
    { entityId: 29475411, parentId: 205351567, name: "Saint Kitts and Nevis", coordinates: { latitude: 17.2703554232, longitude: -62.7009077124 }, isoCode: "KN" },
    { entityId: 29475412, parentId: 205351567, name: "Dominica", coordinates: { latitude: 15.43321608, longitude: -61.3520989118 }, isoCode: "DM" },
    { entityId: 29475414, parentId: 205351567, name: "Saint Lucia", coordinates: { latitude: 13.8996180717, longitude: -60.9662134051 }, isoCode: "LC" },
    { entityId: 29475415, parentId: 205351567, name: "Saint Vincent and the Grenadines", coordinates: { latitude: 13.0659072284, longitude: -61.2316902538 }, isoCode: "VC" },
    { entityId: 29475416, parentId: 205351567, name: "Grenada", coordinates: { latitude: 12.1933194628, longitude: -61.6314994711 }, isoCode: "GD" },
    { entityId: 29475417, parentId: 205351567, name: "Belize", coordinates: { latitude: 17.2125201896, longitude: -88.6347846526 }, isoCode: "BZ" },
    { entityId: 29475418, parentId: 205351567, name: "El Salvador", coordinates: { latitude: 13.7216873817, longitude: -88.8600804866 }, isoCode: "SV" },
    { entityId: 29475419, parentId: 205351567, name: "Guatemala", coordinates: { latitude: 15.6969616463, longitude: -90.3482660475 }, isoCode: "GT" },
    { entityId: 29475420, parentId: 205351567, name: "Honduras", coordinates: { latitude: 14.8291112836, longitude: -86.5973359479 }, isoCode: "HN" },
    { entityId: 29475421, parentId: 205351567, name: "Nicaragua", coordinates: { latitude: 12.839074748, longitude: -85.0288884563 }, isoCode: "NI" },
    { entityId: 29475422, parentId: 205351567, name: "Costa Rica", coordinates: { latitude: 9.9480970463, longitude: -84.2102670174 }, isoCode: "CR" },
    { entityId: 29475424, parentId: 205351568, name: "Ecuador", coordinates: { latitude: -1.4229667319577446, longitude: -78.85267181986866 }, isoCode: "EC" },
    { entityId: 29475425, parentId: 205351568, name: "Colombia", coordinates: { latitude: 3.9264151199, longitude: -73.1040637653 }, isoCode: "CO" },
    { entityId: 29475426, parentId: 205351567, name: "Panama", coordinates: { latitude: 8.5149895823, longitude: -80.1333449745 }, isoCode: "PA" },
    { entityId: 29475427, parentId: 205351567, name: "Haiti", coordinates: { latitude: 18.9239644978, longitude: -72.7064167365 }, isoCode: "HT" },
    { entityId: 29475428, parentId: 205351568, name: "Argentina", coordinates: { latitude: -35.4222963867, longitude: -65.1637031057 }, isoCode: "AR" },
    { entityId: 29475430, parentId: 205351568, name: "Bolivia", coordinates: { latitude: -16.713330765, longitude: -64.6567665099 }, isoCode: "BO" },
    { entityId: 29475431, parentId: 205351568, name: "Peru", coordinates: { latitude: -9.1814199957, longitude: -74.3657526588 }, isoCode: "PE" },
    { entityId: 29475434, parentId: 27563223, name: "Tonga", coordinates: { latitude: -19.7556677561, longitude: -174.6179493029 }, isoCode: "TO" },
    { entityId: 29475435, parentId: 27563223, name: "Samoa", coordinates: { latitude: -13.7497615615, longitude: -172.1636800586 }, isoCode: "WS" },
    { entityId: 29475436, parentId: 205351567, name: "Canada", coordinates: { latitude: 61.5850876128, longitude: -97.9409071974 }, isoCode: "CA" },
    { entityId: 29475437, parentId: 205351567, name: "United States", coordinates: { latitude: 45.7566336986, longitude: -112.6892486287 }, isoCode: "US" },
    { entityId: 29475438, parentId: 27563221, name: "Serbia", coordinates: { latitude: 44.2230290897, longitude: 20.7788078513 }, isoCode: "RS" },
    { entityId: 99540794, parentId: 27563220, name: "South Sudan", coordinates: { latitude: 7.2727159877, longitude: 30.349827825 }, isoCode: "SS" },
    { entityId: 29475099, parentId: 205351568, name: "Aruba", coordinates: { latitude: 12.5106383056, longitude: -69.9706234112 }, isoCode: "AW" },
    { entityId: 29475173, parentId: 27563220, name: "Mayotte", coordinates: { latitude: -12.8220058059, longitude: 45.1493838424 }, isoCode: "YT" },
    { entityId: 29475183, parentId: 27563222, name: "Yemen", coordinates: { latitude: 15.889414244, longitude: 47.5699422687 }, isoCode: "YE" },
    { entityId: 29475247, parentId: 27563222, name: "Georgia", coordinates: { latitude: 42.1796730887, longitude: 43.5048164462 }, isoCode: "GE" },
    { entityId: 29475269, parentId: 27563220, name: "Botswana", coordinates: { latitude: -22.1889914723, longitude: 23.8144328971 }, isoCode: "BW" },
    { entityId: 29475279, parentId: 27563222, name: "Turkmenistan", coordinates: { latitude: 39.1953500057, longitude: 59.1555452944 }, isoCode: "TM" },
    { entityId: 29475314, parentId: 27563222, name: "Nepal", coordinates: { latitude: 28.2590473847, longitude: 83.9461423565 }, isoCode: "NP" },
    { entityId: 29475323, parentId: 27563222, name: "Taiwan", coordinates: { latitude: 23.751844559979432, longitude: 120.93053452505791 }, isoCode: "TW" },
    { entityId: 29475329, parentId: 27563222, name: "South Korea", coordinates: { latitude: 36.2350703558, longitude: 127.6941861859 }, isoCode: "KR" },
    { entityId: 29475345, parentId: 27563220, name: "Cameroon", coordinates: { latitude: 5.6945499442, longitude: 12.7375360764 }, isoCode: "CM" },
    { entityId: 29475356, parentId: 27563220, name: "Togo", coordinates: { latitude: 8.5282725705, longitude: 0.9772129447 }, isoCode: "TG" },
    { entityId: 29475368, parentId: 27563220, name: "Tunisia", coordinates: { latitude: 34.1351050942, longitude: 9.6006827777 }, isoCode: "TN" },
    { entityId: 29475369, parentId: 27563221, name: "Spain", coordinates: { latitude: 40.20529473045569, longitude: -3.6590579043568927 }, isoCode: "ES" },
    { entityId: 29475379, parentId: 27563221, name: "Austria", coordinates: { latitude: 47.5881089798, longitude: 14.1441273301 }, isoCode: "AT" },
    { entityId: 29475393, parentId: 27563221, name: "Italy", coordinates: { latitude: 42.7294626566, longitude: 12.097084159 }, isoCode: "IT" },
    { entityId: 29475402, parentId: 205351568, name: "Suriname", coordinates: { latitude: 4.1416331085, longitude: -55.9154831766 }, isoCode: "SR" },
    { entityId: 29475413, parentId: 205351567, name: "Antigua and Barbuda", coordinates: { latitude: 17.2841133189, longitude: -61.7978152467 }, isoCode: "AG" },
    { entityId: 29475423, parentId: 205351568, name: "Venezuela", coordinates: { latitude: 7.1634700751, longitude: -66.1513726263 }, isoCode: "VE" },
    { entityId: 29475429, parentId: 205351568, name: "Chile", coordinates: { latitude: -38.9644463399, longitude: -71.5223761244 }, isoCode: "CL" },
    { entityId: 29475432, parentId: 205351567, name: "Mexico", coordinates: { latitude: 23.9508943892, longitude: -102.567947989 }, isoCode: "MX" },
    { entityId: 29475433, parentId: 27563223, name: "Kiribati", coordinates: { latitude: 0.6673164154, longitude: 26.3276180371 }, isoCode: "KI" }, // Note: Longitude seems unusually high for Kiribati, might be an error in the source data or represent a specific island far east. Standard longitude is around 174 E or -157 W.
    { entityId: 29475158, parentId: 205351567, name: "Martinique", coordinates: { latitude: 14.6427244669, longitude: -61.0065203386 }, isoCode: "MQ" },
    { entityId: 29475249, parentId: 27563221, name: "Moldova", coordinates: { latitude: 47.2016735578, longitude: 28.4720566816 }, isoCode: "MD" },
    { entityId: 29475362, parentId: 27563220, name: "Sao Tome and Principe", coordinates: { latitude: 0.4756995511, longitude: 6.7415498769 }, isoCode: "ST" },
];