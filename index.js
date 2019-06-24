const express = require('express');
const app = express();
const test = require('./test');
const common = require('./common');

const PORT = process.env.PORT || 3000;

app.get('/', async(req, res, next) => {
    res.send(common.createIndexList('comps', '.js'));
});

app.get('/tsv/:comp', async(req, res, next) => {
    try {
        var controller = require('./comps/' + req.params.comp);
        var TSVResponse = await controller['getTSV']();
        res.send(TSVResponse);
        console.log('scraping done');
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
