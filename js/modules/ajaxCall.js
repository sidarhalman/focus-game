export function fetchData(dataName) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `../data/${dataName}.json`,
            method: 'GET',
            dataType: 'json',
            success: function(response) {
                resolve(response);
            },
            error: function(err) {
                reject(err); 
            }
        });
    });
}
