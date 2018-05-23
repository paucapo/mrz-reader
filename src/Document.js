class Document {

    constructor(mrz) {
        mrz = mrz.trim();
        this.type = false;
        this.total_length = mrz.replace(/\n/g, '').length;
        this.rows = mrz.split("\n");

        this.errors = {
            0: 'O',
            2: 'Z',
        };

        this.characters = {
            '<': 0,
            'A': 10, 'B': 11, 'C': 12, 'D': 13, 'E': 14, 'F': 15, 'G': 16, 'H': 17, 'I': 18, 'J': 19, 'K': 20, 'L': 21, 'M': 22,
            'N': 23, 'O': 24, 'P': 25, 'Q': 26, 'R': 27, 'S': 28, 'T': 29, 'U': 30, 'V': 31, 'W': 32, 'X': 33, 'Y': 34, 'Z': 35
        };

        this.exceptions = {
            'D': 'GE', //Germany
            'EUE': '', //European Union
            'GBD': 'GB', //British Overseas Territories Citizen (BOTC) (note: the country code of the overseas territory is used to indicate issuing authority and nationality of BOTC), formerly British Dependent Territories Citizen (BDTC)
            'GBN': 'GB', //British National (Overseas)
            'GBO': 'GB', //British Overseas Citizen
            'GBP': 'GB', //British Protected Person
            'GBS': 'GB', //British Subject
            'UNA': '', //specialized agency of the United Nations
            'UNK': '', //Resident of Kosovo to whom a travel document has been issued by the United Nations Interim Administration Mission in Kosovo (UNMIK)
            'UNO': '', //United Nations organization
            'XBA': '', //African Development Bank
            'XIM': '', //African Export–Import Bank
            'XCC': '', //Caribbean Community or one of its emissaries
            'XCO': '', //Common Market for Eastern and Southern Africa
            'XEC': '', //Economic Community of West African States
            'XPO': '', //International Criminal Police Organization
            'XOM': '', //Sovereign Military Order of Malta
            'XXA': '', //Stateless person, as per the 1954 Convention Relating to the Status of Stateless Persons
            'XXB': '', //Refugee, as per the 1951 Convention Relating to the Status of Refugees
            'XXC': '', //Refugee, other than defined above
            'XXX': '' //Unspecified nationality
        };

        this.countries = {
            'AFG': 'AF', 'ALA': 'AX', 'ALB': 'AL', 'DZA': 'DZ', 'ASM': 'AS', 'AND': 'AD', 'AGO': 'AO', 'AIA': 'AI',
            'ATA': 'AQ', 'ATG': 'AG', 'ARG': 'AR', 'ARM': 'AM', 'ABW': 'AW', 'AUS': 'AU', 'AUT': 'AT', 'AZE': 'AZ',
            'BHS': 'BS', 'BHR': 'BH', 'BGD': 'BD', 'BRB': 'BB', 'BLR': 'BY', 'BEL': 'BE', 'BLZ': 'BZ', 'BEN': 'BJ',
            'BMU': 'BM', 'BTN': 'BT', 'BOL': 'BO', 'BES': 'BQ', 'BIH': 'BA', 'BWA': 'BW', 'BVT': 'BV', 'BRA': 'BR',
            'IOT': 'IO', 'BRN': 'BN', 'BGR': 'BG', 'BFA': 'BF', 'BDI': 'BI', 'KHM': 'KH', 'CMR': 'CM', 'CAN': 'CA',
            'CPV': 'CV', 'CYM': 'KY', 'CAF': 'CF', 'TCD': 'TD', 'CHL': 'CL', 'CHN': 'CN', 'CXR': 'CX', 'CCK': 'CC',
            'COL': 'CO', 'COM': 'KM', 'COG': 'CG', 'COD': 'CD', 'COK': 'CK', 'CRI': 'CR', 'CIV': 'CI', 'HRV': 'HR',
            'CUB': 'CU', 'CUW': 'CW', 'CYP': 'CY', 'CZE': 'CZ', 'DNK': 'DK', 'DJI': 'DJ', 'DMA': 'DM', 'DOM': 'DO',
            'ECU': 'EC', 'EGY': 'EG', 'SLV': 'SV', 'GNQ': 'GQ', 'ERI': 'ER', 'EST': 'EE', 'ETH': 'ET', 'FLK': 'FK',
            'FRO': 'FO', 'FJI': 'FJ', 'FIN': 'FI', 'FRA': 'FR', 'GUF': 'GF', 'PYF': 'PF', 'ATF': 'TF', 'GAB': 'GA',
            'GMB': 'GM', 'GEO': 'GE', 'DEU': 'DE', 'GHA': 'GH', 'GIB': 'GI', 'GRC': 'GR', 'GRL': 'GL', 'GRD': 'GD',
            'GLP': 'GP', 'GUM': 'GU', 'GTM': 'GT', 'GGY': 'GG', 'GIN': 'GN', 'GNB': 'GW', 'GUY': 'GY', 'HTI': 'HT',
            'HMD': 'HM', 'VAT': 'VA', 'HND': 'HN', 'HKG': 'HK', 'HUN': 'HU', 'ISL': 'IS', 'IND': 'IN', 'IDN': 'ID',
            'IRN': 'IR', 'IRQ': 'IQ', 'IRL': 'IE', 'IMN': 'IM', 'ISR': 'IL', 'ITA': 'IT', 'JAM': 'JM', 'JPN': 'JP',
            'JEY': 'JE', 'JOR': 'JO', 'KAZ': 'KZ', 'KEN': 'KE', 'KIR': 'KI', 'PRK': 'KP', 'KOR': 'KR', 'KWT': 'KW',
            'KGZ': 'KG', 'LAO': 'LA', 'LVA': 'LV', 'LBN': 'LB', 'LSO': 'LS', 'LBR': 'LR', 'LBY': 'LY', 'LIE': 'LI',
            'LTU': 'LT', 'LUX': 'LU', 'MAC': 'MO', 'MKD': 'MK', 'MDG': 'MG', 'MWI': 'MW', 'MYS': 'MY', 'MDV': 'MV',
            'MLI': 'ML', 'MLT': 'MT', 'MHL': 'MH', 'MTQ': 'MQ', 'MRT': 'MR', 'MUS': 'MU', 'MYT': 'YT', 'MEX': 'MX',
            'FSM': 'FM', 'MDA': 'MD', 'MCO': 'MC', 'MNG': 'MN', 'MNE': 'ME', 'MSR': 'MS', 'MAR': 'MA', 'MOZ': 'MZ',
            'MMR': 'MM', 'NAM': 'NA', 'NRU': 'NR', 'NPL': 'NP', 'NLD': 'NL', 'NCL': 'NC', 'NZL': 'NZ', 'NIC': 'NI',
            'NER': 'NE', 'NGA': 'NG', 'NIU': 'NU', 'NFK': 'NF', 'MNP': 'MP', 'NOR': 'NO', 'OMN': 'OM', 'PAK': 'PK',
            'PLW': 'PW', 'PSE': 'PS', 'PAN': 'PA', 'PNG': 'PG', 'PRY': 'PY', 'PER': 'PE', 'PHL': 'PH', 'PCN': 'PN',
            'POL': 'PL', 'PRT': 'PT', 'PRI': 'PR', 'QAT': 'QA', 'REU': 'RE', 'ROU': 'RO', 'RUS': 'RU', 'RWA': 'RW',
            'BLM': 'BL', 'SHN': 'SH', 'KNA': 'KN', 'LCA': 'LC', 'MAF': 'MF', 'SPM': 'PM', 'VCT': 'VC', 'WSM': 'WS',
            'SMR': 'SM', 'STP': 'ST', 'SAU': 'SA', 'SEN': 'SN', 'SRB': 'RS', 'SYC': 'SC', 'SLE': 'SL', 'SGP': 'SG',
            'SXM': 'SX', 'SVK': 'SK', 'SVN': 'SI', 'SLB': 'SB', 'SOM': 'SO', 'ZAF': 'ZA', 'SGS': 'GS', 'SSD': 'SS',
            'ESP': 'ES', 'LKA': 'LK', 'SDN': 'SD', 'SUR': 'SR', 'SJM': 'SJ', 'SWZ': 'SZ', 'SWE': 'SE', 'CHE': 'CH',
            'SYR': 'SY', 'TWN': 'TW', 'TJK': 'TJ', 'TZA': 'TZ', 'THA': 'TH', 'TLS': 'TL', 'TGO': 'TG', 'TKL': 'TK',
            'TON': 'TO', 'TTO': 'TT', 'TUN': 'TN', 'TUR': 'TR', 'TKM': 'TM', 'TCA': 'TC', 'TUV': 'TV', 'UGA': 'UG',
            'UKR': 'UA', 'ARE': 'AE', 'GBR': 'GB', 'USA': 'US', 'UMI': 'UM', 'URY': 'UY', 'UZB': 'UZ', 'VUT': 'VU',
            'VEN': 'VE', 'VNM': 'VN', 'VGB': 'VG', 'VIR': 'VI', 'WLF': 'WF', 'ESH': 'EH', 'YEM': 'YE', 'ZMB': 'ZM',
            'ZWE': 'ZW'
        };
    }


    parse() {
        let first = this.sub(0, 1);

        let doc = false;

        if (this.rows.length === 2 && this.total_length === 88 && first === 'P') {
            doc = this.TravelDocument3();
        } else if (this.rows.length === 2 && this.total_length === 88 && first === 'V') {
            doc = this.VisaA();
        } else if (this.rows.length === 2 && this.total_length === 72 && first === 'V') {
            doc = this.VisaB();
        } else if (this.rows.length === 3 && this.total_length === 90) {
            doc = this.TravelDocument1();
        } else if (this.rows.length === 2 && this.total_length === 72) {
            doc = this.TravelDocument2();
        }

        if (doc === false) {
            return false;
        }

        return this.SimpleDocument(doc);

    };

    TravelDocument3() { // Passport
        this.type = 'TD3';
        return {
            'document_type': this.sub(0, 1, 2),
            'document_country': this.sub(0, 3, 5),
            'document_number': this.sub(1, 1, 9),
            'document_expiry': this.sub(1, 22, 27),

            'names': this.sub(0, 6, 44),
            'personal_number': this.sub(1, 29, 42),
            'gender': this.sub(1, 21),
            'nationality': this.sub(1, 11, 13),
            'birth_date': this.sub(1, 14, 19),

            'composite': this.sub(1, 1, 10) + this.sub(1, 14, 20) + this.sub(1, 22, 43),
            'check_digits': {
                'document_number': this.sub(1, 10),
                'document_expiry': this.sub(1, 28),
                'birth_date': this.sub(1, 20),
                'personal_number': this.sub(1, 43),
                'composite': this.sub(1, 44)
            }
        };
    };

    VisaA() {
        this.type = 'VisaA';
        return {
            'document_type': this.sub(0, 1, 2),
            'document_country': this.sub(0, 3, 5),
            'document_number': this.sub(1, 1, 9),
            'document_expiry': this.sub(1, 22, 27),

            'names': this.sub(0, 6, 44),
            'personal_number': this.sub(1, 29, 44),
            'gender': this.sub(1, 21),
            'nationality': this.sub(1, 11, 13),
            'birth_date': this.sub(1, 14, 19),

            'check_digits': {
                'document_number': this.sub(1, 10),
                'document_expiry': this.sub(1, 28),
                'birth_date': this.sub(1, 20)
            }
        };
    };

    VisaB() {
        this.type = 'VisaB';
        return {
            'document_type': this.sub(0, 1, 2),
            'document_country': this.sub(0, 3, 5),
            'document_number': this.sub(1, 1, 9),
            'document_expiry': this.sub(1, 22, 27),

            'names': this.sub(0, 6, 36),
            'personal_number': this.sub(1, 29, 36),
            'gender': this.sub(1, 21),
            'nationality': this.sub(1, 11, 13),
            'birth_date': this.sub(1, 14, 19),

            'check_digits': {
                'document_number': this.sub(1, 10),
                'document_expiry': this.sub(1, 28),
                'birth_date': this.sub(1, 20),
            }
        };
    };

    TravelDocument1() { // DNI
        this.type = 'TD1';
        return {
            'document_type': this.sub(0, 1, 2),
            'document_country': this.sub(0, 3, 5),
            'document_number': this.sub(0, 6, 14),
            'document_expiry': this.sub(1, 9, 14),

            'names': this.sub(2, 1, 30),
            'personal_number': this.sub(0, 16, 30),
            'gender': this.sub(1, 8),
            'nationality': this.sub(1, 16, 18),
            'birth_date': this.sub(1, 1, 6),

            'composite': this.sub(0, 6, 30) + this.sub(1, 1, 7) + this.sub(1, 9, 15) + this.sub(1, 19, 29),
            'check_digits': {
                'document_number': this.sub(0, 15),
                'document_expiry': this.sub(1, 15),
                'birth_date': this.sub(1, 7),
                'composite': this.sub(1, 30)
            }
        };
    };

    TravelDocument2() {
        this.type = 'TD2';
        return {
            'document_type': this.sub(0, 1, 2),
            'document_country': this.sub(0, 3, 5),
            'document_number': this.sub(1, 1, 9),
            'document_expiry': this.sub(1, 22, 27),

            'names': this.sub(0, 6, 36),
            'personal_number': this.sub(1, 29, 35),
            'gender': this.sub(1, 21),
            'nationality': this.sub(1, 11, 13),
            'birth_date': this.sub(1, 14, 19),

            'composite': this.sub(1, 1, 10) + this.sub(1, 14, 20) + this.sub(1, 22, 35),
            'check_digits': {
                'document_number': this.sub(1, 10),
                'document_expiry': this.sub(1, 28),
                'birth_date': this.sub(1, 20),
                'composite': this.sub(1, 36)
            }
        };
    };

    SimpleDocument(doc) {
        let names = this.get_names(doc.names);
        let new_doc = {
            'document_type': this.clean(doc.document_type),
            'document_country': this.get_country(doc.document_country),
            'document_number': this.clean(doc.document_number),
            'document_expiry': this.get_date(doc.document_expiry),

            'first_name': names.first_name,
            'last_name': names.last_name[0],
            'second_last_name': names.last_name[1] || '',
            'personal_number': this.clean(doc.personal_number),
            'gender': doc.gender,
            'nationality': this.get_country(doc.nationality),
            'birth_date': this.get_date(doc.birth_date),

            'valid': {}
        };

        if (new_doc.personal_number !== '') {
            new_doc.document_number = new_doc.personal_number;
        }

        let valid_doc = true;
        for (let key in doc['check_digits']) {
            if (!doc['check_digits'].hasOwnProperty(key) || !doc.hasOwnProperty(key)) {
                continue;
            }
            let digit = doc['check_digits'][key];
            let value = doc[key];
            let valid = parseInt(digit) === this.check(value);
            new_doc['valid'][key] = valid;
            valid_doc = valid_doc && valid;
        }
        new_doc['valid']['document_valid'] = valid_doc;

        return new_doc;
    };

    sub(row, start, finish) {
        if (typeof finish === 'undefined') {
            finish = start;
        }

        return this.rows[row].substr((start - 1), (finish - start) + 1);
    };

    clean(str) {
        return str.replace(/</g, ' ').trim();
    };

    alpha(str) {
        for (let number in this.errors) {
            let wrong = new RegExp(number, 'g');
            str = str.replace(wrong, this.errors[number]);
        }
        return str;
    };

    number(str) {
        for (let number in this.errors) {
            let wrong = new RegExp(this.errors[number], 'g');
            str = str.replace(wrong, number);
        }
        return str;
    };

    get_date(date) {
        let d = new Date();
        d.setFullYear(d.getFullYear() + 15);
        let centennial = ("" + d.getFullYear()).substring(2, 4);

        date = this.number(date);

        let year;
        if (date.substring(0, 2) > centennial) {
            year = '19' + date.substring(0, 2);
        } else {
            year = '20' + date.substring(0, 2);
        }
        return year + '-' + date.substring(2, 4) + '-' + date.substring(4, 6);
    };

    get_country(country) {
        country = this.alpha(this.clean(country));
        return this.countries[country] || this.exceptions[country] || country;
    };

    get_names(names) {
        names = this.alpha(this.clean(names));
        names = names.split('  ');
        return {
            first_name: names[1],
            last_name: names[0].split(' ')
        };
    };

    check(str) {

        let numbers = [];
        let weighting = [7, 3, 1];
        for (let i = 0; i < str.length; i++) {
            if (str[i].match(/[A-Za-z<]/)) {
                numbers.push(this.characters[str[i]]); // character to digit
            } else {
                numbers.push(parseInt(str[i]));
            }
        }

        let weight = 0;
        let total = 0;
        for (let j = 0; j < numbers.length; j++) {
            total += (numbers[j] * weighting[weight]);
            weight++;
            if (weight === 3) {
                weight = 0;
            }
        }
        return total % 10;
    };

}

export default Document;