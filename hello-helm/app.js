/**
* Copyright 2014 IBM
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
**/

require('appmetrics-prometheus').attach()

const express = require('express')
const app = express()
const promBundle = require("express-prom-bundle");
//const metricsMiddleware = promBundle({includeStatusCode: false, includePath: true});

app.get("/status", (req, res) => res.send("OK")); // healthz

app.get('/', function (req, res) {
  res.send('Hello there!');
});

// here we do app-based redirection from /example-proxy to root
app.get('/example-proxy', function(req, res) {
    res.redirect('/');
});

app.listen(80)
console.log(' Application Running on port 80!');
