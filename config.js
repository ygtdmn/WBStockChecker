export default {
    webhookUrl: "https://api.telegram.org/botId/sendMessage?chat_id=chatId&text={message}",
    dateFormat: "HH:mm:ss - DD/MM/YYYY",
    assets: [
        {
            symbol: "IBM",
            api: "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey=demo",
            getCurrent: (json) => {
                return json["Global Quote"]["05. price"];
            },
            getLast: (json) => {
                return json["Global Quote"]["08. previous close"];
            },
            alerts: [
                {
                    message: "IBM lost value compared to yesterday!",
                    eval: "{current} < {last}",
                    delay: "60",
                },
                {
                    message: "IBM gained more than 8% value!",
                    eval: "(({current} - {last}) / {last}) * 100 > 8",
                    delay: "86400",
                },
            ],
        },
        {
            symbol: "DOT",
            api: "https://api.pancakeswap.info/api/tokens",
            getCurrent: (json) => {
                return json.data["0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402"].price;
            },
            alerts: [
                {
                    message: "DOT is below 40!",
                    eval: "{current} < 40",
                    delay: "60",
                },
                {
                    message: "DOT is above 420.69!'",
                    eval: "{current} > 420.69",
                    delay: "10",
                },
            ],
        },
    ],
};
