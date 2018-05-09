# mrz-reader

> A simple scanner for travel documents throw the webcam.

Thank's to [Josep Portella](https://josep-portella.com/) for his help and all the [base documentation](https://josep-portella.com/en/writings/how-does-magia-dni-work/) for this project.

---

# This README is not finished, the better way to see this library working is look at the *demo* directory.

---

## Installation

* Clone the repository

```console
$ git clone https://github.com/paucapo/mrz-reader.git
```

* Add the library to the page

```html
<script type="text/javascript" src="./mrz-reader/dist/mrz-reader.min.js"></script>
```

* Create a container

```html
<div id="webcam-here"></div>
```

* Initialize the library

```javascript
var reader = new MRZ.Reader({
    target: 'webcam-here', // container ID
    success: function (response) {
        console.log('success');
        document.getElementById('dump').innerText = JSON.stringify(response, null, 2);
        document.querySelector('.overlay').style.display = 'none';
    }
});
```