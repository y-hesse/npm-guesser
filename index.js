const fs = require("fs");
const axios = require("axios");

const CHUNK_SIZE = 10;
const WAIT_TIME = 1000;

let data;

let data2 = [];
let data3 = {};

async function init() {
    // optionally get the data remotly from github
    data = (await axios.get("https://raw.githubusercontent.com/nice-registry/all-the-package-names/master/names.json")).data;
    //data = JSON.parse(fs.readFileSync("names.json", "utf-8"));
    for (let i = 0; i < data.length; i++) {
        let x = data[i];
        if (!x.includes("@") && !x.includes("/")) {
            data2.push(x);
        }
    }
    chunked();
}

try {
    init();
} catch (error) {
    
}

function parseData(x) {
    let keys = Object.keys(x);
    for (let i = 0; i < keys.length; i++) {
        if (!x[keys[i]] || !x[keys[i]].downloads) continue;
        let dl = x[keys[i]].downloads;
        if (dl < 100) continue;
        data3[keys[i]] = dl;
    }
}

async function chunked() {
    for (let i = 0; i < Math.ceil(data2.length / (128*CHUNK_SIZE)); i++) {
        for (let f = 0; f < CHUNK_SIZE-1; f++) {
            try {
                getChunk((i*10 + f) * 128);
            } catch (error) {
                console.log("download error");
                console.log("to avoid raid limits, decrease the CHUNK_SIZE or increase the WAIT_TIME");
            }
        }
        try {
            await getChunk((i * 10 + CHUNK_SIZE-1) * 128);
        } catch (error) {
            console.log("download error");
            console.log("to avoid raid limits, decrease the CHUNK_SIZE or increase the WAIT_TIME");
        }
        if (i % 10 == 0) {
            console.log(i + "/" + Math.ceil(data2.length / (128*CHUNK_SIZE)));
            fs.writeFileSync("output.json", JSON.stringify(data3));
            await new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve();
                }, WAIT_TIME);
            })
        }
    }
}

async function getChunk(i) {
    let chunk = [];
    for (let z = 0; z < 128; z++) {
        if (!data2[i + z]) continue;
        chunk.push(data2[i + z]);
    }
    await getData(...chunk);
}

async function getData(...name) {
    return new Promise((resolve, reject) => {
        axios.get('https://api.npmjs.org/downloads/point/last-week/' + name.join(","))
            .then(function (response) {
                parseData(response.data);
                resolve("e");
            })
            .catch((e) => {
                reject(e);
            }); 
    });
}