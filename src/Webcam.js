class Webcam {

    constructor(container, options) {
        this.options = Webcam.extend({}, {
            debug: false,
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
            onReady: () => {
            },
            onStart: () => {
            },
            onStop: () => {
            }
        }, options);


        this.container = container;
        if (this.container === null) {
            this.log('container missing');
            return;
        }

        if (this.options.sizes.length <= 0) {
            this.log('missing sizes');
            return;
        }

        this.container.className = 'mrz-reader-container';
        this.container.innerHTML = '';

        this.selectors = document.createElement('div');
        this.selectors.className = 'mrz-reader-selectors';
        this.selectors.style.display = 'none';
        this.container.appendChild(this.selectors);

        this.devices = document.createElement('select');
        this.devices.onchange = this.change_device.bind(this);
        this.devices.style.display = 'none';
        this.selectors.appendChild(this.devices);

        this.size = 0;
        this.sizes = document.createElement('select');
        this.sizes.onchange = this.change_size.bind(this);
        this.options.sizes.forEach((size, index) => {
            let option = document.createElement('option');
            option.value = index.toString();
            option.innerText = size.label;
            this.sizes.appendChild(option);
        });
        this.selectors.appendChild(this.sizes);

        this.waiting = document.createElement('div');
        this.waiting.innerHTML = this.options.waitingText;
        this.waiting.className = 'mrz-reader-waiting';
        this.waiting.style.display = 'none';
        this.container.appendChild(this.waiting);

        this.webcam = document.createElement('div');
        this.webcam.className = 'mrz-reader-webcam';
        this.webcam.style.display = 'none';
        this.webcam.style.position = 'relative';
        this.webcam.style.fontSize = '0';
        this.container.appendChild(this.webcam);


        this.video = document.createElement('video');
        this.video.className = 'mrz-reader-video';
        this.webcam.appendChild(this.video);

        this.coverTop = document.createElement('div');
        this.coverTop.style.position = 'absolute';
        this.coverTop.style.top = '0';
        this.coverTop.style.left = '0';
        this.coverTop.style.right = '0';
        this.coverTop.style.bottom = (100 - this.get_size().start) + '%';
        this.coverTop.style.background = this.options.coverColor;
        this.coverTop.className = 'mrz-reader-cover-top';
        this.webcam.appendChild(this.coverTop);

        this.coverBottom = document.createElement('div');
        this.coverBottom.style.position = 'absolute';
        this.coverBottom.style.top = this.get_size().end + '%';
        this.coverBottom.style.left = '0';
        this.coverBottom.style.right = '0';
        this.coverBottom.style.bottom = '0';
        this.coverBottom.style.background = this.options.coverColor;
        this.coverBottom.className = 'mrz-reader-cover-top';
        this.webcam.appendChild(this.coverBottom);

        this.streams = [];

        this.isOn = false;

        this.devices_list = false;
        this.device = false;

        if (navigator.mediaDevices.enumerateDevices !== undefined) {
            // remove all current childs
            while (this.devices.firstChild) {
                this.devices.removeChild(this.devices.firstChild);
            }
            this.devices_list = [];
            this.device = parseInt(window.localStorage.getItem('device') || 0);
            navigator.mediaDevices
                .enumerateDevices()
                .then((list) => {
                    let index = 0;
                    list.forEach((device) => {
                        if (device.kind === 'videoinput') {
                            this.devices_list[index] = device;
                            let option = document.createElement('option');
                            option.innerText = device.label;
                            option.value = index.toString();
                            option.selected = index === this.device;
                            index++;
                            this.devices.appendChild(option);
                        }
                    });
                    this.device = this.devices_list[this.device] ? this.device : 0;
                    this.options.onReady();
                });
        } else {
            this.devices_list = [];
            this.options.onReady();
        }

    }

    start() {
        if (this.devices_list === false) {
            console.log('Use the onInit event!');
            return;
        }
        this.webcam.style.display = 'none';
        if (this.devices_list.length > 1) {
            this.devices.style.display = 'inline';
        }
        this.isOn = true;
        this.waiting.style.display = 'block';
        this.request();
    };

    stop() {
        this.isOn = false;
        this.stop_stream();
        this.options.onStop();
        this.webcam.style.display = 'none';
        this.waiting.style.display = 'none';
        this.selectors.style.display = 'none';
        this.log('stopped');
    };

    change_device() {
        this.device = parseInt(this.devices.value);
        window.localStorage.setItem('device', this.device);
        this.stop_stream();
        this.request();
    };

    change_size() {
        this.size = parseInt(this.sizes.value);
        this.log('change size [' + this.get_size().label + ']');
        this.coverTop.style.bottom = (100 - this.get_size().start) + '%';
        this.coverBottom.style.top = this.get_size().end + '%';
    };

    get_size() {
        return this.options.sizes[this.size];
    };

    request() {
        if (navigator.mediaDevices !== undefined && navigator.mediaDevices.getUserMedia !== undefined) {
            let constraints = false;

            if (this.device !== false && this.devices_list[this.device]) {
                constraints = {
                    audio: false,
                    video: this.devices_list[this.device]
                };
                this.log('camera request [' + this.devices_list[this.device].label + ']');
            }
            if (!constraints || !constraints.video) {
                constraints = {
                    audio: false,
                    video: {
                        width: {ideal: 1280},
                        height: {ideal: 1024},
                        facingMode: "environment"
                    }
                };
                this.log('camera request [fallback]');
            }

            // new browsers with promise
            navigator.mediaDevices
                .getUserMedia(constraints)
                .then(this.accepted.bind(this))
                .catch(this.declined.bind(this));

        } else {
            // old browsers with prefixes
            this.log('camera request [old browser]');
            navigator.getUserMedia =
                navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia ||
                navigator.msGetUserMedia ||
                navigator.oGetUserMedia;
            if (navigator.getUserMedia) {
                navigator.getUserMedia({video: true}, this.accepted, this.declined);
            }

        }
    };

    stop_stream() {
        if (this.streams.length <= 0) {
            return;
        }
        this.streams.forEach((stream) => {
            if (stream.getVideoTracks !== undefined) {
                stream.getVideoTracks().forEach((track) => {
                    track.stop();
                });
            } else {
                stream.stop();
            }
        });
        this.streams = [];
    };

    accepted(stream) {
        this.streams.push(stream);
        if (this.container == null || this.isOn === false) {
            this.stop_stream();
            return;
        }

        this.log('camera accepted');

        // Older browsers may not have srcObject
        if ("srcObject" in this.video) {
            this.video.srcObject = stream;
        } else {
            // Avoid using this in new browsers, as it is going away.
            this.video.src = window.URL.createObjectURL(stream);
        }
        this.video.onloadedmetadata = this.loaded.bind(this);


    };

    declined(e) {
        this.log('camera declined');
        this.log(e);
        this.waiting.innerHTML = 'not accepted';
    };

    loaded() {
        if (this.container == null || this.isOn === false) {
            this.stop_stream();
            return;
        }
        this.video.play();
        this.log('camera loaded');
        this.webcam.style.display = 'inline-block';
        this.waiting.style.display = 'none';
        this.selectors.style.display = 'block';
        this.options.onStart(this);
    };

    snapshot() {
        let snapshot = document.createElement('canvas');
        let context = snapshot.getContext('2d');
        let w = this.video.videoWidth;
        let h = this.video.videoHeight;
        const size = this.get_size();
        const size_height = (size.end - size.start) / 100;
        snapshot.width = w;
        snapshot.height = h * size_height;
        context.drawImage(this.video, 0, -(h * (size.start / 100)));

        return snapshot;
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

    log(str) {
        if (this.options.debug === true) {
            console.log('[MRZWebcam]', str);
        }
    };

}

export default Webcam;