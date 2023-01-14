const fs = require("fs");
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

let npmModules;
let npmModuleNames;

function readNpm() {
    npmModules = JSON.parse(fs.readFileSync('output.json', 'utf-8'));

    npmModuleNames = Object.keys(npmModules);
}

function getHigh() {
    while (true) {
        let t = npmModuleNames[Math.floor(Math.random() * npmModuleNames.length)];
        if (npmModules[t] >= 50000) {
            return t;
        }
    }
}


function getLow() {
    while(true) {
        let t = npmModuleNames[Math.floor(Math.random()*npmModuleNames.length)];
        if (npmModules[t] < 50000 && npmModules[t] > 1000) {
            return t;
        }
    }
}

async function main() {
    readNpm();

    while(true) {

        let data = [];
        data[0] = getLow();
        data[1] = getLow();
        data[2] = getHigh();

        data = data.sort(() => .5 - Math.random());
        await new Promise((resolve, reject) => {
            readline.question(`=======Most Downloads?====\n${data.join("\n")}\n`, input => {
                let i = parseInt(input) - 1;
                if (npmModules[data[i]] >= 50000) {
                    console.log("correct");
                } else {
                    console.log("wrong");
                }
                for (let i = 0; i < data.length; i++) {
                    console.log(data[i] + ": " + npmModules[data[i]]);
                }
                resolve();
            });
        });
    }
}

main();