const fs = require('fs');
const axios = require('axios');

const BASE_URL = 'https://api.unsplash.com';
const ACCESS_KEY = 'nbR00CogATeI3qs7vHcOpuJAahhzzRWxYTTB0Pd4bZM';

const IMGS_PER_PAGE = 30;

const USER_NAME = "fiversprint";

const MEN_CSV_FILE = './data/menImgUrl.csv';
const WOMEN_CSV_FILE = './data/womenImgUrl.csv';

async function getAllCollections() {
    let collections = [];

    for (var i = 1; i <= 3; i++) {
        let result = await axios.get(`${BASE_URL}/users/${USER_NAME}/collections/?client_id=${ACCESS_KEY}&&page=${i}`);
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
    resArr = resArr.map(urlArr => JSON.stringify(urlArr));

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
    return imgDataArr.map(imgData => imgData.urls.regular);
}

function saveToFile(file, arr) {
    fs.writeFileSync(file, '');
    arr.forEach(value => {
        fs.appendFileSync(file, `"${value.replace(/"/g, "'")}"\n`);
    });
}

async function run() {
    // get all of user photos collections
    const collections = await getAllCollections();

    // filter collections by gender
    // women
    const womenCollectionsIds = filterCollectionsIdsByGender(collections, "women");
    let resArr = await getResArr(womenCollectionsIds);
    saveToFile(WOMEN_CSV_FILE, resArr);
    console.log('done writing to women file', resArr);

    // men
    const menCollectionsIds = filterCollectionsIdsByGender(collections, "men");
    let resArr = await getResArr(menCollectionsIds);
    saveToFile(MEN_CSV_FILE, resArr);
    console.log('done writing to men file', resArr);
}

run();