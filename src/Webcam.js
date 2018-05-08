class Webcam {

    constructor(container, options) {
        this.options = Webcam.extend({}, {
            debug: false,
            waitingText: 'waiting...',
            devicesText: '',
            coverColor: 'rgba(0, 0, 0, 0.5)',
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
        this.container.className = 'webcam-container';
        this.container.innerHTML = '';

        this.devices = document.createElement('div');
        this.devices.innerHTML = this.options.devicesText;
        this.devices.className = 'webcam-devices';
        this.devices.style.display = 'none';
        this.container.appendChild(this.devices);

        this.devicesSelect = document.createElement('select');
        this.devicesSelect.onchange = this.change_device.bind(this);
        this.devices.appendChild(this.devicesSelect);

        this.waiting = document.createElement('div');
        this.waiting.innerHTML = this.options.waitingText;
        this.waiting.className = 'webcam-waiting';
        this.waiting.style.display = 'none';
        this.container.appendChild(this.waiting);

        this.webcam = document.createElement('div');
        this.webcam.style.display = 'none';
        this.webcam.style.position = 'relative';
        this.webcam.style.fontSize = '0';
        this.container.appendChild(this.webcam);


        this.video = document.createElement('video');
        this.video.className = 'webcam-video';
        this.webcam.appendChild(this.video);

        this.coverTop = document.createElement('div');
        this.coverTop.style.position = 'absolute';
        this.coverTop.style.top = '0';
        this.coverTop.style.left = '0';
        this.coverTop.style.right = '0';
        this.coverTop.style.bottom = '50%';
        this.coverTop.style.background = this.options.coverColor;
        this.coverTop.className = 'webcam-cover-top';
        this.webcam.appendChild(this.coverTop);

        this.coverBottom = document.createElement('div');
        this.coverBottom.style.position = 'absolute';
        this.coverBottom.style.top = '83.33%';
        this.coverBottom.style.left = '0';
        this.coverBottom.style.right = '0';
        this.coverBottom.style.bottom = '0';
        this.coverBottom.style.background = this.options.coverColor;
        this.coverBottom.className = 'webcam-cover-top';
        this.webcam.appendChild(this.coverBottom);

        this.streams = [];

        this.isOn = false;

        this.devices_list = false;
        this.device = false;

        if (navigator.mediaDevices.enumerateDevices !== undefined) {
            // remove all current childs
            while (this.devicesSelect.firstChild) {
                this.devicesSelect.removeChild(this.devicesSelect.firstChild);
            }
            this.devices_list = [];
            this.device = 0;
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
                            index++;
                            this.devicesSelect.appendChild(option);
                        }
                    });
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
        if (this.devices_list.length > 0) {
            this.devices.style.display = 'block';
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
        this.devices.style.display = 'none';
        this.log('stopped');
    };

    change_device() {
        this.device = parseInt(this.devicesSelect.value);
        this.stop_stream();
        this.request();
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
        this.options.onStart(this);
    };

    snapshot() {
        let snapshot = document.createElement('canvas');
        let context = snapshot.getContext('2d');
        let w = this.video.videoWidth;
        let h = this.video.videoHeight;
        snapshot.width = w;
        snapshot.height = h / 3;
        context.drawImage(this.video, 0, -(h / 2));

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