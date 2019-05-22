require('dotenv').config();
const {processImageUrlAzure, processImageUrlLocal} = require('./face-api');
const {average, median} = require('./data');
const {loadInputStream} = require('./util');
const parse = require('csv-parse');
const fs = require('fs');

const counter = {
    line: 0,
    invalid: 0,
    notAdults: 0,
    ages: []
};

const parser = parse({
    delimiter: ',',
    columns: true
});

async function processUser(user) {
    if (!user) {
        return;
    }

    if (user.profile_pic_url_hd) {
        const ages = await processImageUrlAzure(user.profile_pic_url_hd);

        if (ages.length < 1) {
            counter.invalid++;
        }

        ages.forEach((age) => {
            counter.ages.push(age);

            if (age < 18) {
                counter.notAdults++;
            }

            fs.appendFileSync(__dirname + '/../ages.txt', age + '\n');
        });
    } else {
        counter.invalid++;
    }

    if (counter.line % 100 === 0) {
        console.info((counter.line + 1) + ' of users processed so far...');
        console.info(counter.invalid + ' of users have invalid profile pic...');
        console.info(counter.notAdults + ' of users are under 18 years old...');
    }
}

/**
 const rl = loadInputStream('/','/home/marek/Projekty/iqos-age/data/urls.txt');
 rl.on('line', async (line) => {
    const fakeUser = {profile_pic_url_hd: line};
    await processUser(fakeUser);
});
 **/

parser.on('readable', async () => {
    while (true) {
        const user = parser.read();

        if (!user) {
            break;
        }

        await processUser(user);

        counter.line++;
    }
});

parser.on('end', () => {
    console.log('Processed lines: ' + counter.line);
    console.log('Invalid faces: ' + counter.invalid);
    console.log('Average age: ' + average(counter.ages));
    console.log('Median age: ' + median(counter.ages));
    console.log('Users under 18: ' + counter.notAdults);
});

fs.createReadStream(process.env.INPUT_FILE).pipe(parser);
