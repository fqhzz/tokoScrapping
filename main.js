const cheerio = require("cheerio");
const puppeteer = require('puppeteer');
const randomUseragent = require('random-useragent');
const fs = require('node:fs');
const TelegramBot = require('node-telegram-bot-api');

const textFile = './list_kartu.txt'

const token = 'token';
const account = 'account';
const bot = new TelegramBot(token, {polling: false});

const urlToTelegram = "https://www.shop.com/";

(async () => {
    const url = "https://www.shop.com/";
    const randomAgent = randomUseragent.getRandom();
    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-http2'
        ],
        headless: true,
        protocolTimeout: 60000,
    });

    const [page] = await browser.pages();
    await page.setJavaScriptEnabled(true);
    await page.setUserAgent(randomAgent);
    await page.goto(url, {timeout: 60000, protocolTimeout: 60000});

    // await autoScroll(page);

    const body = await page.evaluate(() => {
        return document.querySelector('body').innerHTML;
    });

    const $ = cheerio.load(body);
    const listItems = $('[data-testid="master-product-card"]');

    var result = [];
    listItems.each(function (idx, el) {
        var nama = $('[data-testid="linkProductName"]', el).text();
        var status = $('[aria-label="gimmick"]', el).text();

        if (status == "Produk Terbaru") {
            result.push({ "nama": nama });
        }
    });

    console.log(url);
    console.log(result);

    const names = result.map(card => card.nama).join('\n');

    fs.readFile(textFile, 'utf8', (err, fileData) => {
        if (err) {
            console.log('File does not exist or error reading file:', err);
            
            fs.writeFile(textFile, names, (writeErr) => {
                if (writeErr) {
                    console.error('Error writing to file', writeErr);
                } else {
                    console.log(`Cars list written to ${textFile}.`);
                }
            });
        } else if (names != '') {
            if (fileData === names) {
                console.log('The content of the file matches the variable.');
            } else {
                console.log('The content of the file does not match the variable.');

                fs.writeFile(textFile, names, (writeErr) => {
                    if (writeErr) {
                        console.error('Error writing to file', writeErr);
                    } else {
                        console.log(`Names have been updated in ${textFile}.`);
                    }
                });

                bot.sendMessage(account, urlToTelegram)
                .then(() => {
                    console.log('Message sent successfully!');
                })
                .catch((err) => {
                    fs.writeFile(textFile, '', () => {
                });
                    console.error('Error sending message:', err);
                });
            }
        }
    });

    await page.close();
    await browser.close();
})();

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight - window.innerHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}