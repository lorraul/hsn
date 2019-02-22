var express = require('express');
var app = express();

app.get('/:comp', async(req, res, next) => {
    try {
        var csv = await getCSV(req.params.comp)
        res.send(csv);
    } catch (e) {
        console.log(e);
    }
});

app.listen(3000);

async function getCSV(comp) {
    var controller = require('./' + comp);
    var CSVResponse = await controller['getCSV']();
    return CSVResponse;
}
