/*
 * This code is from the sample program shown in
 * "Node.js in Action" by M. Cantelon et al.
 *
 *
 * 1) To start server:
 * w1$ node simple.js
 * Server running at http://127.0.0.1:3000/
 *
 *
 * 2) To test, on other window:
 * w2$ curl -i -X GET http://127.0.0.1:3000/
 * HTTP/1.1 200 OK
 * Connection: closed
 * Content-Length: 159
 * Content-Type: application/json; charset=utf8
 * Date: Tue, 18 Apr 2017 07:06:01 GMT
 *
 * [
 * 	{
 * 		"id": 0,
 * 		"data": "0th item"
 * 	},
 * 	{
 * 		"id": 1,
 * 		"data": "1st item"
 * 	},
 * 	{
 * 		"id": 2,
 * 		"data": "2nd item"
 * 	},
 * 	{
 * 		"id": 3,
 * 		"data": "3rd item"
 * 	}
 * ]
 * w2$
 *
 * 3) Don't forget stop server:
 * type Ctl-C on w1.
 *
*/

const http = require('http');
var url = require('url');

const hostname = '127.0.0.1';
const port = 3000;
var items = [
    {'id': 0, 'data': '0th item'},
    {'id': 1, 'data': '1st item'},
    {'id': 2, 'data': '2nd item'},
    {'id': 3, 'data': '3rd item'}
];

const server = http.createServer();

server.on('request', function(req, res) {
    var path = url.parse(req.url).pathname;
    req.setEncoding('utf8');
    res.setHeader('Connection', 'closed');
    switch(req.method) {
        case 'GET':
            if(path.match(/^\/$/)) {
            // $ curl -i -X GET http://127.0.0.1:3000
                var body = JSON.stringify(items, null, '\t');
                body += '\n';
                res.setHeader('Content-Length', Buffer.byteLength(body));
                res.setHeader('Content-Type', 'application/json; charset=utf8');
                res.statusCode = 200;
                res.statusMessage = 'OK';
                res.end(body);
            } else if(path.match(/^\/id\/[0-9]+$/)){
            // $ curl -i -X GET http://127.0.0.1:3000/id/:number
                let found = false;
                id = parseInt(path.match(/^\/id\/([0-9]+)$/)[1]);
                item = items.filter(x => x.id == id);
                if(item.length > 0){
                  found = true;
                }
                if(!found){
                    res.statusCode = 404;
                    res.statusMessage = ('Not Found');
                    res.end('Not Found');
                } else {
                    var body = JSON.stringify(item[0], null, '\t');
                    res.setHeader('Content-Length', Buffer.byteLength(body));
                    res.setHeader('Content-Type', 'application/json; charset=utf8');
                    res.statusCode = 200;
                    res.statusMessage = 'OK';
                    res.end(body);
                }
            }else {
                res.statusCode = 400;
                res.statusMessage = 'Bad Request';
                res.end('Bad Request');
            }
            break;
        case 'POST':
            if(path.match(/^\/$/)) {
            // $ curl -i -v --data '{"data":"testdata"}' -X POST http://127.0.0.1:3000
                var item;
                var data = '';
                req.on('data', function(chunk){
                    data += chunk;
                });
                req.on('end', function(){
                    try {
                        item = JSON.parse(data, function(key, value) {
                            if(key === '' ) return value;
                            if(key === 'data') return value;
                        });
                    } catch(e) {
                        res.statusCode = 400;
                        res.statusMessage = e.message;
                        res.end('Bad Request');
                    }
                    if('data' in item){
                        item.id = items.length;
                        items.push(item);
                        var body = JSON.stringify(item, null, '\t');
                        res.setHeader('Content-Length', Buffer.byteLength(body));
                        res.setHeader('Content-Type', 'application/json; charset=utf8');
                        res.statusCode = 200;
                        res.statusMessage = 'OK';
                        res.end(body);
                    }else{
                        res.statusCode = 400;
                        res.statusMessage = ('Bad Request');
                        res.end('Bad Request');
                    }
                });
            } else {
                res.statusCode = 400;
                res.statusMessage = ('Bad Request');
                res.end('Bad Request');
            }
            break;
        case 'PUT' :
            if(path.match(/^\/id\/\d+/)) {
                var id = parseInt(path.match(/^\/id\/(\d+)/)[1]);
                var input_item;
                var data = '';
                req.on('data', function (chunk) {
                    data += chunk;
                });
                req.on('end', function () {
                    try {
                        input_item = JSON.parse(data, function (key, value) {
                            if (key === '') return value;
                            if (key === 'data') return value;
                        });
                    } catch (e) {
                        res.statusCode = 400;
                        res.statusMessage = e.message;
                        res.end('Bad Request');
                    }

                    let found = false;
                    for(const item of items){
                        if (item.id === id){
                            item.data = input_item.data;
                            found = true;
                            var body = JSON.stringify(item, null, '\t');
                            res.setHeader('Content-Length', Buffer.byteLength(body));
                            res.setHeader('Content-Type', 'application/json; charset=utf8');
                            res.statusCode = 200;
                            res.statusMessage = 'OK';
                            res.end(body);
                            break;
                        }
                    }
                    if(!found){
                        res.statusCode = 404;
                        res.statusMessage = ('Not Found');
                        res.end('Not Found');
                    }
                });
            } else {
                res.statusCode = 400;
                res.statusMessage = ('Bad Request');
                res.end('Bad Request')
            }
            break;
        case 'DELETE':
            if(path.match(/^\/id\/\d+$/)) {
                const id = parseInt(path.match(/^\/id\/(\d+)$/)[1]);
                const item = items.filter(n => n.id === id);
                if (item.length === 0) {
                    res.statusCode = 404;
                    res.statusMessage = ('Not Found');
                    res.end('Not Found');
                } else {
                    items = items.filter(n => n.id !== id);
                    var body = JSON.stringify(item[0], null, '\t');
                    res.setHeader('Content-Length', Buffer.byteLength(body));
                    res.setHeader('Content-Type', 'application/json; charset=utf8');
                    res.statusCode = 200;
                    res.statusMessage = 'OK';
                    res.end(body);
                }
            } else {
                res.statusCode = 400;
                res.statusMessage = ('Bad Request');
                res.end('Bad Request')
            }
            break;
        default:
            res.statusCode = 400;
            res.statusMessage = ('Bad Request');
            res.end('Bad Request');
            break;
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
