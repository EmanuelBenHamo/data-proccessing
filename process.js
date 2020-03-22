const fs = require('fs');
const axios = require('axios');
const createCsvWriter = require('csv-writer').createArrayCsvWriter;

const BASE_URL = 'https://api.unsplash.com';
const ACCESS_KEY = 'nbR00CogATeI3qs7vHcOpuJAahhzzRWxYTTB0Pd4bZM';

const IMGS_PER_PAGE = 30;

const USER_NAME = "fiversprint";

const MEN_CSV_FILE = './data/menImgUrl.csv';
const WOMEN_CSV_FILE = './data/womenImgUrl.csv';

const menCsvWriter = createCsvWriter({
    path: MEN_CSV_FILE,
    header: [
        { id: 'imgUrl', title: 'img_urls_list' }
    ]
});
const womenCsvWriter = createCsvWriter({
    path: WOMEN_CSV_FILE,
    header: [
        { id: 'imgUrl' }
    ]
});

async function getAllCollections() {
    let collections = [];

    for (var i = 1; i <= 2; i++) {
        let result = await axios.get(`${BASE_URL}/users/${USER_NAME}/collections/?client_id=${ACCESS_KEY}&&page=${i}`);
        collections.push(...result.data);
    }

    console.log(`total collections count is ${collections.length}`);

    return collections;
}

function filterCollectionsByGender(collections, gender) {
    let filterChararcter;

    if (gender === 'women') {
        filterChararcter = 'w';
    } else if (gender === 'men') {
        filterChararcter = 'm';
    }

    return collections.filter(collection => collection.title[collection.title.length - 1] === filterChararcter);
}

async function getCollectionPhotoUrls(collectionId) {
    let personRawDataPhotos = await getCollectionPhotosRawData(collectionId);
    let personPhotosUrl = getPhotosUrl(personRawDataPhotos);

    return personPhotosUrl;
}

async function getCollectionPhotosRawData(collectionId) {
    let url = `${BASE_URL}/collections/${collectionId}/photos/?client_id=${ACCESS_KEY}&&per_page=${IMGS_PER_PAGE}`;

    const res = await axios.get(url);
    const rawDataArr = res.data;

    return rawDataArr;
}

function getPhotosUrl(imgDataArr) {
    return imgDataArr.map(imgData => imgData.urls.regular);
}

async function run() {
    // get all of user photos collections
    const collections = await getAllCollections();

    const womenCollectionsIds = filterCollectionsByGender(collections, "women")
        .map(womenCollection => womenCollection.id);
    console.log(`total women collections is ${womenCollectionsIds.length}`);

    const menCollectionsIds = filterCollectionsByGender(collections, "men")
        .map(menCollection => menCollection.id);
    console.log(`total men collections is ${menCollectionsIds.length}`);

    let prmsArr = [];
    womenCollectionsIds.forEach(photoCollectionId => {
        let photosUrlsPrms = getCollectionPhotoUrls(photoCollectionId);
        prmsArr.push(photosUrlsPrms);
    });

    let resArr = await Promise.all(prmsArr);
    resArr = resArr.map(urlArr => JSON.stringify(urlArr));

    console.log('done writing to women file', resArr);

    fs.writeFileSync(WOMEN_CSV_FILE, '');
    resArr.forEach(value => {
        fs.appendFileSync(WOMEN_CSV_FILE, `"${value.replace(/"/g, "'")}"\n`);
    });
}

run();