import config from "./config.js";
import axios from "axios";
import { evaluate } from "mathjs";
import moment from "moment";

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, "g"), replace);
}

function roundTo15(num) {
    if (num == undefined) return "Unknown";

    let res = "";
    for (var i = 0; i < num.toString().length; i++) {
        var character = num.toString().charAt(i);
        res += character;
        if (i >= 14) break;
    }
    return res;
}

function sendMessage(message) {
    axios.get(replaceAll(config.webhookUrl, "{message}", encodeURIComponent(message)));
}

async function start() {
    for (const asset of config.assets) {
        processAsset(asset);
    }
}

async function processAsset(asset) {
    let lastNotificationDateMap = {};

    while (true) {
        await delay(1000);
        try {
            let json = (await axios.get(asset.api)).data;
            let currentValue = asset.getCurrent(json);
            let lastValue;
            if (asset.getLast != undefined) {
                lastValue = asset.getLast(json);
            }

            let currentTime = Math.round(Date.now() / 1000);

            for (const alert of asset.alerts) {
                let formattedEval = replaceAll(replaceAll(alert.eval, "{current}", currentValue), "{last}", lastValue);
                let result = evaluate(formattedEval);
                if (result) {
                    let shouldSendNotif = lastNotificationDateMap[alert] == undefined || parseInt(lastNotificationDateMap[alert]) + parseInt(alert.cooldown) < currentTime;
                    if (shouldSendNotif) {
                        sendMessage(alert.message);
                        lastNotificationDateMap[alert] = currentTime;
                    }
                }
            }

            console.log(`[${moment().format(config.dateFormat)}] ${asset.symbol} processed. Current: ${roundTo15(currentValue)} - Last: ${roundTo15(lastValue)}`);
        } catch (e) {
            console.error(`[${moment().format(config.dateFormat)}] ${asset?.symbol} couldn't processed! Error: ${e}`);
        }
    }
}

start();
