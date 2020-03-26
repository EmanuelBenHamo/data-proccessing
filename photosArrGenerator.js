const fs = require('fs');
const axios = require('axios');

const BASE_URL = 'https://api.unsplash.com';
const ACCESS_KEY = 'nbR00CogATeI3qs7vHcOpuJAahhzzRWxYTTB0Pd4bZM';

const IMGS_PER_PAGE = 30;

const USER_NAME = "fiversprint";

const MEN_CSV_FILE = './data/menImgUrl.csv';
const MEN_JSON_FILE = './data/menImgUrl.json';

const WOMEN_CSV_FILE = './data/womenImgUrl.csv';
const WOMEN_JSON_FILE = './data/womenImgUrl.json';

async function getAllCollections() {
    let collections = [];

    for (var i = 1; i <= 2; i++) {
        let result = await axios.get(`${BASE_URL}/users/${USER_NAME}/collections/?client_id=${ACCESS_KEY}&&per_page=30&&page=${i}`);
        collections.push(...result.data);
    }

    console.log(`total collections count is ${collections.length}`);

    return collections;
}

function filterCollectionsIdsByGender(collections, gender) {
    const genderCollectionArr = filterCollectionsByGender(collections, gender)
        .map(womenCollection => womenCollection.id);
    console.log(`total ${gender} collections is ${genderCollectionArr.length}`);

    return genderCollectionArr;
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

async function getResArr(collectionIdsArr) {
    let prmsArr = [];
    collectionIdsArr.forEach(photoCollectionId => {
        let photosUrlsPrms = getCollectionPhotoUrls(photoCollectionId);
        prmsArr.push(photosUrlsPrms);
    });

    let resArr = await Promise.all(prmsArr);

    return resArr;
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
    return imgDataArr.map(imgData => {
        return { url: imgData.urls.regular }
    });
}

function saveToCsvFile(file, arr) {
    let resArr = arr.map(urlArr => JSON.stringify(urlArr));
    fs.writeFileSync(file, '');
    resArr.forEach(value => {
        fs.appendFileSync(file, `"${value.replace(/"/g, "'")}"\n`);
    });
}

function saveToJsonFile(file, arr) {
    let jsonResArr = [];
    arr.forEach(currArr => jsonResArr.push({ urls: currArr }));
    fs.writeFileSync(file, JSON.stringify(jsonResArr));
}

async function run() {
    console.log('--- photos generator started ---');

    // get all of user photos collections
    const collections = await getAllCollections();

    // filter collections by gender
    // women
    const womenCollectionsIds = filterCollectionsIdsByGender(collections, "women");
    let womenResArr = await getResArr(womenCollectionsIds);
    saveToJsonFile(WOMEN_JSON_FILE, womenResArr);
    saveToCsvFile(WOMEN_CSV_FILE, womenResArr);
    console.log('-- done writing to women file --');

    // men
    const menCollectionsIds = filterCollectionsIdsByGender(collections, "men");
    let menResArr = await getResArr(menCollectionsIds);
    saveToJsonFile(MEN_JSON_FILE, menResArr);
    saveToCsvFile(MEN_CSV_FILE, menResArr);
    console.log('-- done writing to men file --');

    console.log('--- photos generator finished ---');
}

run();