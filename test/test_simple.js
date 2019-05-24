//
//
//
var assert = require('assert');
var http = require('http');
var child;
beforeEach((done) => {
    try {
        child = require('child_process').fork('simple.js', [], { stdio: ['pipe', 'pipe', process.stderr, 'ipc'] });
        child.stdout.on('data', (data) => {
            if(data.toString() == 'Server running at http://127.0.0.1:3000/\n'){
                done();
            }
        });
    }catch(e){
        console.log(e);
        done();
    };
});
afterEach(() => {
    child.kill();
});
function item_sort(items) {
    items.sort(function(a,b){
        if(a.id < b.id) return -1;
        if(a.id < b.id) return 1;
        return 0;
    });
};
function item_omit(items) {
    var len = items.length;
    var results = [];
    for(var i = 0 ; i < len  ; i++ ){
        if('data' in items[i] && items[i].data != ""){
           results.push(items[i]);
        }
    }
    return results;
};
describe('sample: access /others should return error', () => {
    it('GET should return 400', (done) => {
        http.get('http://127.0.0.1:3000/others', (res) => {
            assert.equal(400, res.statusCode);
            done();
        });
    });
});
describe('sample: access /', () => {
    it('GET: should return 200', (done) => {
        http.get('http://127.0.0.1:3000', (res) => {
            assert.equal(200, res.statusCode);
            done();
        });
    });
    it('GET should return array of data', (done) => {
        var expected = [
            {'id': 0, 'data': '0th item'},
            {'id': 3, 'data': '3rd item'},
            {'id': 2, 'data': '2nd item'},
            {'id': 1, 'data': '1st item'},
        ];
        http.get('http://127.0.0.1:3000', (res) => {
            var data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () =>{
                assert.deepEqual(item_sort(JSON.parse(data)), item_sort(expected));
                done();
            });
        });
    });
    it('POST should success and return updated data with id', (done) => {
        var expected = {'id': 4, 'data': 'testdata'};
        var postData = JSON.stringify({"data":"testdata"});
        var options = {
            hostname: '127.0.0.1',
            port: 3000,
            path: '/',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf8',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        var req = http.request(options, (res) => {
            res.setEncoding('utf8');
            var data = '';
            res.on('data', (chunk) =>{
                data += chunk;
            });
            res.on('end', () => {
                assert.deepEqual(JSON.parse(data), expected);
                done();
            });
        });
        req.write(postData);
        req.end();
    });
});
describe('assignments: ', () => {
    it('GET with id should return a data', (done) => {
        var expected = {'id': 0, 'data': '0th item'};
        http.get('http://127.0.0.1:3000/id/0', (res) => {
            var data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () =>{
                assert.deepEqual(JSON.parse(data), expected);
                assert.equal(200, res.statusCode);
                done();
            });
        });
    });
    it('GET with id should return the POST\'ed data', (done) => {
        var expected = {'id': 4, 'data': 'testdata'};
        var postData = JSON.stringify({"data":"testdata"});
        var options = {
            hostname: '127.0.0.1',
            port: 3000,
            path: '/',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf8',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        var req = http.request(options, (res) => {
            res.setEncoding('utf8');
            var data = '';
            res.on('data', (chunk) =>{
                data += chunk;
            });
            res.on('end', () => {
                assert.deepEqual(JSON.parse(data), expected);
            });
        });
        req.write(postData);
        req.end();

        http.get('http://127.0.0.1:3000/id/4', (res) => {
            var data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () =>{
                assert.deepEqual(JSON.parse(data), expected);
                assert.equal(200, res.statusCode);
                done();
            });
        });
    });
    it('GET with bogus id should not return a data', (done) => {
        http.get('http://127.0.0.1:3000/id/100', (res) => {
            var data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () =>{
                assert.equal(404, res.statusCode);
            });
        });
        http.get('http://127.0.0.1:3000/id/-1', (res) => {
            var data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () =>{
                assert.equal(400, res.statusCode);
                done();
            });
        });
    });
    it('PUT with bogus id should not success', (done) => {
        var putData = JSON.stringify({"data":"testdata"});
        var options = {
            hostname: '127.0.0.1',
            port: 3000,
            path: '/id/100',
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json; charset=utf8',
                'Content-Length': Buffer.byteLength(putData)
            }
        };
        var req = http.request(options, (res) => {
            res.setEncoding('utf8');
            var data = '';
            res.on('data', (chunk) =>{
                data += chunk;
            });
            res.on('end', () => {
                assert.equal(404, res.statusCode);
                done();
            });
        });
        req.write(putData);
        req.end();
    });
    it('PUT with id should success', (done) => {
        var putData = JSON.stringify({"data":"testdata"});
        var options = {
            hostname: '127.0.0.1',
            port: 3000,
            path: '/id/3',
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json; charset=utf8',
                'Content-Length': Buffer.byteLength(putData)
            }
        };
        var req = http.request(options, (res) => {
            res.setEncoding('utf8');
            var data = '';
            res.on('data', (chunk) =>{
                data += chunk;
            });
            res.on('end', () => {
                assert.equal(200, res.statusCode);
            });
        });
        req.write(putData);
        req.end();

        var expected = [
            {'id': 0, 'data': '0th item'},
            {'id': 3, 'data': 'testdata'},
            {'id': 2, 'data': '2nd item'},
            {'id': 1, 'data': '1st item'},
        ];
        http.get('http://127.0.0.1:3000', (res) => {
            var data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () =>{
                assert.equal(JSON.parse(data).length, expected.length);
                assert.deepEqual(item_sort(JSON.parse(data)), item_sort(expected));
                done();
            });
        });
    });
    it('DELETE with /id/:3 should not success', (done) => {
        var dummyData = "";
        var options = {
            hostname: '127.0.0.1',
            port: 3000,
            path: '/id/:3',
            method: 'DELETE'
        };
        var req = http.request(options, (res) => {
            res.setEncoding('utf8');
            var data = '';
            res.on('data', (chunk) =>{
                data += chunk;
            });
            res.on('end', () => {
                assert.notEqual(200, res.statusCode);
                done();
            });
        });
        req.write(dummyData);
        req.end();
    });
    it('DELETE with bogus id should not success', (done) => {
        var dummyData = "";
        var options = {
            hostname: '127.0.0.1',
            port: 3000,
            path: '/id/100',
            method: 'DELETE'
        };
        var req = http.request(options, (res) => {
            res.setEncoding('utf8');
            var data = '';
            res.on('data', (chunk) =>{
                data += chunk;
            });
            res.on('end', () => {
                assert.equal(404, res.statusCode);
                done();
            });
        });
        req.write(dummyData);
        req.end();
    });
    it('DELETE with /id/3 should success', (done) => {
        var dummyData = "";
        var options = {
            hostname: '127.0.0.1',
            port: 3000,
            path: '/id/3',
            method: 'DELETE'
        };
        var req = http.request(options, (res) => {
            res.setEncoding('utf8');
            var data = '';
            res.on('data', (chunk) =>{
                data += chunk;
            });
            res.on('end', () => {
                assert.equal(200, res.statusCode);
            });
        });
        req.write(dummyData);
        req.end();

        var expected = [
            {'id': 0, 'data': '0th item'},
            {'id': 2, 'data': '2nd item'},
            {'id': 1, 'data': '1st item'},
        ];
        http.get('http://127.0.0.1:3000', (res) => {
            var data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () =>{
                var result = item_omit(JSON.parse(data));
                assert.equal(result.length, expected.length);
                assert.deepEqual(item_sort(result), item_sort(expected));
                done();
            });
        });
    });
});
