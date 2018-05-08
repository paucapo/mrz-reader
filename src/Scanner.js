import Templates from './Templates';

class Scanner {

    constructor() {
        this.avg_modifier = 0.9;
        this.canvas = null;
        this.templates = {};
        this.binary = [];
        this.rows = [];
        this.logs = [];
        this.times = [];
    }

    parseImage(image) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = image.naturalWidth;
        this.canvas.height = image.naturalHeight;

        let ctx = this.canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, this.canvas.width, this.canvas.height);

        return this.parse();
    };

    parseCanvas(canvas) {
        this.canvas = canvas;
        return this.parse();
    };

    parse() {
        this.addTime('start');

        this.rows = [];
        this.logs = [];
        this.times = [];
        this.templates = Templates;


        this.addTime('initialSetup');

        this.binary = this.getBinary(this.canvas);
        this.addTime('getBinary');

        this.findRows();
        this.addTime('findRows');

        this.findColumns();
        this.addTime('findColumns');

        let mrz_string = this.getMRZ();
        this.addTime('getMRZ');

        this.addLog('rows: ' + this.rows.length);
        for (let r = 0; r < this.rows.length; r++) {
            this.addLog('   row[' + r + '].columns: ' + this.rows[r].columns.length);
        }
        this.addLog('');

        this.addLog('times:');
        let start = this.times[0].time;
        let last = start;
        for (let t = 0; t < this.times.length; t++) {
            let current = this.times[t].time;
            let str = '   ' + this.times[t].label + ': ' + (current - start) + 'ms';
            if (t > 0) {
                str += ' (+' + (current - last) + 'ms)';
            }
            last = current;
            this.addLog(str);
        }

        return mrz_string;
    };

    getMRZ() {
        let str = '';
        for (let r = 0; r < this.rows.length; r++) {
            let row = this.rows[r];
            for (let c = 0; c < row.columns.length; c++) {
                let char = this.getCharacter(r, c);
                if (char === false || typeof char.character === 'undefined') {
                    // unset this character, is not valid
                    row.columns.splice(c, 1);
                    c--;
                    continue;
                }
                str += char.character;
            }
            if (row.columns.length <= 0) {
                // all the characters in this row aren't valid, unset row
                this.rows.splice(r, 1);
                r--;
                continue;
            }
            str += "\n";
        }
        return str;
    };

    getTime() {
        let d = new Date();
        return d.getTime() + Math.round(d.getMilliseconds() / 1000);
    };

    addTime(label) {
        this.times.push({label: label, time: this.getTime()});
    };

    addLog(str) {
        this.logs.push(str);
    };

    findRows() {
        if (!this.binary) return;

        let height = this.binary.length;
        if (height <= 0) return;

        let width = this.binary[0].length;

        // calc average luminosity on y axi
        let luminosity = [];
        for (let y = 0; y < height; y++) {
            let total = 0;
            for (let x = 0; x < width; x++) {
                total += this.binary[y][x];
            }
            luminosity[y] = (total / width);
        }

        // find the points where the luminosity change and save the start/end for each line
        let last = 1;
        for (let i = 0; i < luminosity.length; i++) {
            if (luminosity[i] !== 1) {
                if (last !== 0) {
                    this.rows.push({start: i, end: i, columns: []});
                }
                last = 0;
            } else {
                if (last !== 1) {
                    this.rows[this.rows.length - 1].end = i;
                }
                last = 1;
            }
        }

    };

    findColumns() {
        for (let r = 0; r < this.rows.length; r++) {
            this.findColumnsRow(r);
        }
    };

    findColumnsRow(r) {
        let row = this.rows[r];
        let sub = this.binary.slice(row.start, row.end);
        let sub_height = sub.length;
        if (sub_height <= 0) return;
        let sub_width = sub[0].length;

        // calc average luminosity on x axi
        let luminosity = [];
        for (let x = 0; x < sub_width; x++) {
            let total = 0;
            for (let y = 0; y < sub_height; y++) {
                total += sub[y][x];
            }
            luminosity[x] = total / sub_height;
        }

        // find the points where the luminosity change and save the start/end for each column
        let last = 1;
        for (let i = 0; i < luminosity.length; i++) {
            if (luminosity[i] !== 1) {
                if (last !== 0) {
                    this.rows[r].columns.push({start: i, end: i});
                }
                last = 0;
            } else {
                if (last !== 1) {
                    this.rows[r].columns[this.rows[r].columns.length - 1].end = i;
                }
                last = 1;
            }
        }
    };

    getCharacter(r, c, debug) {
        debug = debug || false;

        let row = this.rows[r];
        if (typeof row === 'undefined') {
            return false;
        }
        let column = row.columns[c];
        if (typeof column === 'undefined') {
            return false;
        }

        // first time reading this characters, lets do the hard work
        if (typeof column.character === 'undefined' || debug === true) {
            let start = this.getTime();

            // build sizes and coordinates
            let char = {
                x: column.start,
                y: row.start,
                w: column.end - column.start,
                h: row.end - row.start
            };
            if (char.w <= 0 || char.h <= 0) {
                return false;
            }

            // create a canvas for this character
            let char_canvas = document.createElement('canvas');
            char_canvas.width = char.w;
            char_canvas.height = char.h;

            // build the canvas from the original canvas and the calculated coordinates
            let ctx = char_canvas.getContext('2d');
            ctx.drawImage(this.canvas, char.x, char.y, char.w, char.h, 0, 0, char.w, char.h);

            // build character binary from canvas
            let char_binary = this.getBinary(char_canvas);

            // crop the canvas, avoid white margins
            char_binary = this.autoCrop(char_binary);

            // wrong character!
            if (char_binary === false) {
                return false;
            }

            // find the best template for this binary map
            let template = this.findTemplate(char_binary, debug);

            // build final structure
            column.coords = char;
            column.canvas = char_canvas;
            column.binary = char_binary;
            column.character = template.candidate;
            column.affinity = template.affinity;
            column.template_binary = template.binary;
            column.time = this.getTime() - start;
        }

        return column;
    };

    getBinary(canvas) {
        let luminosity_avg = 0;
        let luminosity = [];

        let ctx = canvas.getContext('2d');

        if (canvas.width <= 0 || canvas.height <= 0) {
            return false;
        }

        let pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // get luminosity_avg from the image
        for (let y = 0; y < pixels.height; y++) {
            luminosity[y] = [];
            for (let x = 0; x < pixels.width; x++) {
                luminosity[y][x] = [];

                // get start position
                let position = this.getPosition(pixels, x, y);

                // get the values of the pixel
                let r = pixels.data[position];
                let g = pixels.data[position + 1];
                let b = pixels.data[position + 2];

                // luminosity is a value between 0 and 255
                luminosity[y][x] = (0.2126 * r) + (0.7152 * g) + (0.0722 * b);
                luminosity_avg += luminosity[y][x];

            }
        }

        // avg luminosity
        luminosity_avg = luminosity_avg / (pixels.width * pixels.height);
        // apply the modifier
        luminosity_avg = luminosity_avg * this.avg_modifier;

        // transform image to binary
        for (let y = 0; y < pixels.height; y++) {
            for (let x = 0; x < pixels.width; x++) {
                if (luminosity[y][x] <= luminosity_avg) {
                    // less luminosity than avg, then is black
                    luminosity[y][x] = 0;
                } else {
                    // more luminosity than avg, then is white
                    luminosity[y][x] = 1;
                }
            }
        }

        return luminosity;
    };

    autoCrop(binary) {
        let black_pixels = {x: {}, y: {}};
        for (let y = 0; y < binary.length; y++) {
            for (let x = 0; x < binary[y].length; x++) {
                // save black pixels
                if (binary[y][x] === 0) {
                    black_pixels.x[x] = true;
                    black_pixels.y[y] = true;
                }
            }
        }
        black_pixels.x = Object.keys(black_pixels.x);
        black_pixels.y = Object.keys(black_pixels.y);

        let new_x = parseInt(black_pixels.x[0]) || 0;
        let new_y = parseInt(black_pixels.y[0]) || 0;
        let new_width = parseInt(black_pixels.x[black_pixels.x.length - 1]) - new_x || 0;
        let new_height = parseInt(black_pixels.y[black_pixels.y.length - 1]) - new_y || 0;

        if (new_width === 0 || new_height === 0) {
            return false;
        }

        let new_binary = [];

        for (let y = 0; y < new_height; y++) {
            new_binary[y] = [];
            for (let x = 0; x < new_width; x++) {
                new_binary[y][x] = binary[y + new_y][x + new_x];
            }
        }

        return new_binary;
    };

    findTemplate(binary, debug) {
        let candidate = '';
        let best_template = {
            affinity: -(binary[0].length * binary.length),
            binary: false
        };
        for (let key in this.templates) {
            let template = this.affinityTemplate(binary, key);
            if (debug === true) {
                console.log(key + ': ' + template.affinity)
            }
            if (template.affinity > best_template.affinity) {
                best_template = template;
                candidate = key;
            }

        }

        if (debug === true) {
            console.log('BEST ' + candidate + ': ' + best_template.affinity)
        }

        return {candidate: candidate, affinity: best_template.affinity, binary: best_template.binary};
    };

    affinityTemplate(character, template_key) {
        let affinity = 0;
        let template = this.templates[template_key];
        let template_width = template[0].length;
        let template_height = template.length;

        let character_width = character[0].length;
        let character_height = character.length;

        let template_ratio = [];

        for (let y = 0; y < character_height; y++) {
            template_ratio[y] = [];
            for (let x = 0; x < character_width; x++) {

                // get template coordinates based on ratio
                let template_x = Math.floor(x * template_width / character_width);
                let template_y = Math.floor(y * template_height / character_height);

                // get character coordinates based on ratio
                let character_x = x;
                let character_y = y;

                // get pixels
                let character_pixel = character[character_y][character_x];
                let template_pixel = template[template_y][template_x];

                template_ratio[y][x] = template_pixel;

                // right now only checking red, is a binary map and it should be ok
                // if (char_pixels.data[char_position] === template_pixel) {
                if (character_pixel === template_pixel) {
                    affinity++;
                } else {
                    affinity--;
                }
            }
        }

        return {affinity: affinity, binary: template_ratio};
    };

    debugBinary(binary) {
        let str = '';
        for (let y = 0; y < binary.length; y++) {
            for (let x = 0; x < binary[y].length; x++) {
                if (binary[y][x] === 0) {
                    str += '&#9608;';
                } else {
                    str += '&#9617;';
                }
            }
            str += "\n";
        }

        return str;
    };

    getPosition(pixels, x, y) {
        return y * (pixels.width * 4) + x * 4;
    };
}

export default Scanner;