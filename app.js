//Importing the Modules
var express = require('express')
const path = require('path');
const fetch = require("node-fetch");
var cors = require('cors') //Use this Package to know More:  https://www.npmjs.com/package/cors

//Creating the Express App.
var app = express()
// EXPRESS RELATED STUFF
app.use("/static", express.static("static"));// For serving static files
app.use(express.urlencoded()) //is a method inbuilt in express to recognize the incoming Request Object as strings or arrays. This method is called as a middleware in your application using the code: app. use(express.
app.use(cors())//To mangage the Cross Origin Request Error.


//Template Engine RELATED STUFF
// app.set("view engine", "pug");// Set the template engine as pug
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'))// Set the views directory
app.engine('html', require('ejs').renderFile);

//Serving the URLs
app.get("/", (req, res) => {
    res.render("index.html")
})

app.post("/submit", (req, res) => {
    let pincode = req.body.pincode;
    let pincode_url = `https://thezipcodes.com/api/v1/search?zipCode=${pincode}&countryCode=IN&apiKey=921e3fabe34f5ed4db65020ca116c08b`
    fetch(pincode_url, {
        method: "GET",
        headers: {
            'Content-type': 'application/json',
        }
    }).then(function (response) {
        return response.json();
    }).then(function (info) {
        let lat = info.location[0].latitude;
        let lon = info.location[0].longitude;
        let pin = pincode.toString();
        let centers_url = `https://cdn-api.co-vin.in/api/v2/appointment/centers/public/findByLatLong?lat=${lat}&long=${lon}`

        fetch(centers_url, {
            method: "GET",
            headers: {
                'Content-type': 'application/json',
            }
        }).then(function (response) {
            return response.json();
        }).then(function (info) {
            var x;
            var feature = []
            var i = 0;
            for (x of info.centers) {
                if (x.pincode == pin) {
                    feature.push({
                        name:x.name + " " + x.pincode,
                        center_number: i+1,
                        lat: parseFloat(x.lat),
                        lon: parseFloat(x.long)
                    })
                    i++;
                }
            }    
            params = {
                cen: feature,
                center_lat: lat,
                center_long: lon
            }
            res.render("results.html", params)
        })
    })
})

//Starting the Server
app.listen(80, function () {
    console.log('CORS-enabled web server listening on port 80')
})

