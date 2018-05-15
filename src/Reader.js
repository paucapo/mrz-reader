import Webcam from './Webcam';
import Scanner from './Scanner';
import Document from './Document';

class Reader {

    constructor(options) {
        this.options = Reader.extend({}, {
            target: '',
            interval: 100, // miliseconds
            waitingText: 'waiting...',
            coverColor: 'rgba(0, 0, 0, 0.5)',
            sizes: [
                {
                    label: '3 lines',
                    start: 50,
                    end: 80,
                },
                {
                    label: '2 lines',
                    start: 60,
                    end: 80,
                },
            ],
            snapshot: function (snapshot) {
            },
            readerSuccess: function (response, logs) {
            },
            readerError: function (response, logs) {
            },
            camReady: function () {
            },
            camStarted: function () {
            },
            camStopped: function () {
            }
        }, options);

        let webcam_options = {
            debug: true,
            waitingText: this.options.waitingText,
            coverColor: this.options.coverColor,
            sizes: this.options.sizes,
            onReady: () => {
                this.options.camReady();
            },
            onStart: () => {
                this.options.camStarted();
                this.snapshot();
            },
            onStop: () => {
                this.options.camStopped();
            }
        };

        this.webcam = new Webcam(document.getElementById(this.options.target), webcam_options);
    }

    start() {
        this.webcam.start();
    };

    stop() {
        this.webcam.stop();
    };

    snapshot() {
        if (this.webcam.isOn === false) return;

        let snapshot = this.webcam.snapshot();
        let scanner = new Scanner();
        let mrz = scanner.parseCanvas(snapshot);
        let doc = (new Document(mrz)).parse();

        this.options.snapshot(snapshot);

        // recall function after 100ms
        if (doc === false || doc.valid.document_valid === false) {
            this.options.readerError(doc, scanner.logs);
            setTimeout(() => {
                this.snapshot();
            }, this.options.interval);
        } else {
            this.options.readerSuccess(doc, scanner.logs);
            this.stop();
        }
    };

    static extend(out) {
        out = out || {};

        for (let i = 1; i < arguments.length; i++) {
            if (!arguments[i])
                continue;

            for (let key in arguments[i]) {
                if (arguments[i].hasOwnProperty(key))
                    out[key] = arguments[i][key];
            }
        }

        return out;
    };

}

export default Reader;