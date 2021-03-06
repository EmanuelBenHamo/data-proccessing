const fs = require("fs");

const menPhotos = require("./data/menImgUrl.json");
const womenPhotos = require("./data/womenImgUrl.json");
const influencers = require("./data/influencers.json");

const FILE_TO_SAVE = "./data/influencersWithPhotos.json";

function getInfluencersWithPhotos(influencers) {
    let influencersWithPhotos = [];
    const womenInfluencers = influencers.filter(
        influencer => influencer.gender === "Female"
    );
    const menInfluencers = influencers.filter(
        influencer => influencer.gender === "Male"
    );

    const womenInfluencersWithPhotos = getInfluencersWithPhotosByGender(
        womenInfluencers,
        womenPhotos
    );
    const menInfluencersWithPhotos = getInfluencersWithPhotosByGender(
        menInfluencers,
        menPhotos
    );

    influencersWithPhotos.push(...womenInfluencersWithPhotos);
    console.log(
        `-- created ${womenInfluencersWithPhotos.length} women influencers with photos`
    );
    influencersWithPhotos.push(...menInfluencersWithPhotos);
    console.log(
        `-- created ${menInfluencersWithPhotos.length} men influencers with photos`
    );

    return influencersWithPhotos;
}

function getInfluencersWithPhotosByGender(influencers, photos) {
    let influencersWithPhotos = [];
    let numOfPhotos = photos.length;
    let numOfInfluencers = influencers.length;
    let maxNumOfPersons = Math.min(numOfPhotos, numOfInfluencers);

    for (let i = 0; i < maxNumOfPersons; i++) {
        influencers[i].photos = photos[i].urls;
        let randomIndex = Math.floor(Math.random() * photos[i].urls.length);
        influencers[i].profilePhoto = photos[i].urls[randomIndex];
        influencersWithPhotos.push(influencers[i]);
    }

    return influencersWithPhotos;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function convertBirthDateTimestampFromStringToNumber(influencers) {
    influencers = influencers.map(influencer => {
        influencer.dateOfBirth = +influencer.dateOfBirth;
        return influencer;
    });

    return influencers;

}

function run() {
    console.log("--- influencers generator started ---");

    let influencersWithPhotos = getInfluencersWithPhotos(influencers);
    influencersWithPhotos = convertBirthDateTimestampFromStringToNumber(influencersWithPhotos);
    shuffle(influencersWithPhotos);
    fs.writeFileSync(FILE_TO_SAVE, JSON.stringify(influencersWithPhotos));

    console.log("--- influencers generator finished ---");
}

run();
