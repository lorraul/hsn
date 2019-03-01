const express = require('express');
const app = express();
const test = require('./test');

const svk2 = require('./comps/sml');

const PORT = process.env.PORT || 3000;

app.get('/tsv/:comp', async(req, res, next) => {
    try {
        var controller = require('./comps/' + req.params.comp);
        var TSVResponse = await controller['getTSV']();
        res.send(TSVResponse);
    } catch (e) {
        console.log(e);
    }
});

app.get('/test', async(req, res, next) => {
    test.main();
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

//test.main();
