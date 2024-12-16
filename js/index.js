import { fetchData } from './modules/ajaxCall.js';

$(document).ready(function () {
    const root = $("#root");

    fetchData("games")
    .then(data => {
        console.log(data)
    })
    .catch(error => {
        console.error(error);
    });
});
