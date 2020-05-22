"use strict";

const slider = $('.slider');
slider.slick();

// slider.on(`init`, function (event,slick){
//     console.log(slick)
// });

// const formatter = new Intl.DateTimeFormat(`ua`, {
//     year: numeric,
// });

const formatter = new Intl.NumberFormat("en", {
    style: "currency",
    currency: "UAH",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
});

const searchForm = document.getElementById(`search-form`);
const videoSlider = document.getElementById(`video-slider`);
const currentResult = document.getElementById(`currentResult`);
const allResults = document.getElementById(`allResults`);
let currentDate = new Date();

if(!localStorage.userInfo) {
    localStorage.userInfo = JSON.stringify({});
}
const userInfo = JSON.parse(localStorage.userInfo);

searchForm.addEventListener('submit', createSlider);
videoSlider.addEventListener('click', videoManipulations);

async function createSlider(event){
        event.preventDefault();
        const data = new FormData(this);
        let response = await fetch(`https://itunes.apple.com/search?term=${data.get('query')}&entity=${data.get(`typeSelect`)}&limit=${data.get(`searchLimit`)}`);
        let json = await response.json();
        console.log(json);
        const resultsArray = json.results;
        console.log(resultsArray);
        slider.slick('unslick');
        slider.html(''); //maybe?
        slider.slick({
            slidesToShow: 1,
            prevArrow: `<button class="btn-arrow btn-prev fas fa-chevron-left"></button>`,
            nextArrow: `<button class="btn-arrow btn-next fas fa-chevron-right"></button>`,
            draggable: false,
        });
        resultsArray.forEach(element => {
            let template = createVideoTag(element);
            slider.slick('slickAdd', template);
        });
        videoSlider.querySelector(`.slider-counter`).classList.remove(`hidden`);
        await getCurrency();
}

async function getCurrency() {
    let findUSD = videoSlider.querySelectorAll(`.video-description`);
    let firstVisit = new Date(userInfo.date);
    let currency = 0;
    if(currentDate.getDate() != firstVisit.getDate() && currentDate.getMonth() != firstVisit.getMonth() && currentDate.getFullYear() != firstVisit.getFullYear()) {
        localStPutDate(userInfo,`userInfo`);
        try {
            let response = await fetch(`https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5`);
            let currencyList = await response.json();

            currencyList.forEach(element => {
                if (element.ccy == `USD`) {
                    currency = Number(element.sale);
                }
            });
            findUSD.forEach(e => {
                e.dataset.newprice = `${formatter.format(e.dataset.price * currency)}`;
            });

            localStInput(`userInfo`, `exchangeRate`, currency);
        } catch {
            findUSD.forEach(e => {
                e.dataset.newprice = `Cannot get exchange rates`;
            })
        }
    } else {
        currency = userInfo.exchangeRate;

        findUSD.forEach(e => {
            e.dataset.newprice = `${formatter.format(e.dataset.price * currency)}`;
        });
    }
}

function localStPutDate(object, ls_name) {
    object.date = Date.now();
    localStorage[ls_name] = JSON.stringify(object);
}

function localStInput(ls_name, key, value) {
    const object = JSON.parse(localStorage[ls_name]);
    object[key] = value;
    localStorage[ls_name] = JSON.stringify(object);
}

// function inputExchangedRate (value){
//     let findUSD = videoSlider.querySelectorAll(`.video-description`);
//     findUSD.forEach(e => {
//         e.dataset.newprice = value;
//     });
// }

function videoManipulations(e) {
        const arrows = videoSlider.querySelectorAll(`.btn-arrow`);
        if (e.target.classList.contains('video-button')) {
            const video = e.target.previousElementSibling;
            e.target.classList.add('hide');
            video.play();
            video.controls = true;

            arrows.forEach(e => {
                e.classList.add(`color-dark`);
            })
        }

        if (e.target.tagName == `VIDEO`) {
            e.target.controls = false;
            e.target.pause();
            e.target.nextElementSibling.classList.remove(`hide`);

            arrows.forEach(e => {
                e.classList.remove(`color-dark`);
            });

            e.target.addEventListener(`ended`, function () {
                e.target.load();
                e.target.nextElementSibling.classList.remove(`hide`);
                e.target.controls = false;
            })
        }

        if (e.target.classList.contains('btn-arrow')) {
            arrows.forEach(e => {
                e.classList.remove(`color-dark`);
            });
        }
}

slider.on('beforeChange', function(event, slick, currentSlide, nextSlide){
    const videos = document.querySelectorAll('.slider video');
    videos.forEach((e) => {
        e.pause();
        e.controls = false;
    });
    const button = videoSlider.querySelector(`.slick-active .video-button`);
    setTimeout(() => button.classList.remove(`hide`), 1000);
    currentResult.textContent = nextSlide + 1;
});

  slider.on('destroy', function(e,slick){});

  slider.on('reInit', function(event, slick, currentSlide, nextSlide){
      currentResult.textContent = slick.currentSlide + 1;
      allResults.textContent = slick.slideCount;
  });

function createVideoTag(obj) {
    let releaseDate = new Date(obj.releaseDate);

    let html = `<div class="video-slider-item">
                    <div class="video-wrapper position-relative">
                        <video src="${obj.previewUrl}"></video>
                        <button class="video-button">
                        <i class="fas fa-play"></i>
                        </button>
                    </div>
                    <div class="video-description" data-price="${obj.trackPrice}" data-newprice>
                        <h3>${obj.artistName} – ${obj.trackName}</h3>
                        <p class="mb-0">${releaseDate.getFullYear()}</p>
                    </div>
                </div>`;
    return html;
}


// let offset = 0;
// for (let index = offset, index2 = 0; index2 < 60; index++) {
//     const element = array[index];
//     append();
//     offset += 60;
// }

