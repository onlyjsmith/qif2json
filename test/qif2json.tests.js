'use strict';
var qif2json = require('../lib/qif2json.js'),
    fs = require('fs');

describe('qif2json', function() {
    it('Can parse Bank example', function() {
        var data = qif2json.parse(['!Type:Bank',
'D03/03/10',
'T-379.00',
'PCITY OF SPRINGFIELD',
'^',
'D03/04/10',
'T-20.28',
'PYOUR LOCAL SUPERMARKET',
'^',
'D03/03/10',
'T-421.35',
'PSPRINGFIELD WATER UTILITY',
'^'].join('\r\n'));

        expect(data.type).toEqual('Bank');
        expect(data.transactions.length).toEqual(3);

        expect(data.transactions[0].date).toEqual('2010-03-03');
        expect(data.transactions[0].amount).toEqual(-379);
        expect(data.transactions[0].payee).toEqual('CITY OF SPRINGFIELD');

        expect(data.transactions[1].date).toEqual('2010-04-03');
        expect(data.transactions[1].amount).toEqual(-20.28);
        expect(data.transactions[1].payee).toEqual('YOUR LOCAL SUPERMARKET');

        expect(data.transactions[2].date).toEqual('2010-03-03');
        expect(data.transactions[2].amount).toEqual(-421.35);
        expect(data.transactions[2].payee).toEqual('SPRINGFIELD WATER UTILITY');
    });

    it('Can parse Bank example with single entry', function() {
        var data = qif2json.parse(['!Type:Bank',
'D03/03/10',
'T-379.00',
'PCITY OF SPRINGFIELD\r\n'].join('\r\n'));

        expect(data.type).toEqual('Bank');
        expect(data.transactions.length).toEqual(1);

        expect(data.transactions[0].date).toEqual('2010-03-03');
        expect(data.transactions[0].amount).toEqual(-379);
        expect(data.transactions[0].payee).toEqual('CITY OF SPRINGFIELD');
    });

    it('Can parse dash-separated dates', function() {
        var data = qif2json.parse(['!Type:Bank',
'D03-03-10',
'T-379.00',
'PCITY OF SPRINGFIELD\r\n'].join('\r\n'));

        expect(data.type).toEqual('Bank');
        expect(data.transactions.length).toEqual(1);

        expect(data.transactions[0].date).toEqual('2010-03-03');
        expect(data.transactions[0].amount).toEqual(-379);
        expect(data.transactions[0].payee).toEqual('CITY OF SPRINGFIELD');
    });

    it('errors on invalid type field', function() {
        var err, data;
        try {
            data = qif2json.parse('!FOO');
        } catch (e) {
            err = e;
        }

        expect(err).toBeDefined();
    });

    it('errors on unknown detail code', function() {
        var err, data;
        try {
            data = qif2json.parse(['!Type:Bank',
'123',
'^',
''].join('\r\n'));
        } catch (e) {
            err = e;
        }

        expect(err).toBeDefined();
    });

    it('can parse a UTF8 file', function(done) {
        qif2json.parseFile(__dirname + '/files/utf8.qif', function(err, data) {
            expect(err).not.toBeDefined();
            expect(data.transactions[0].payee).toEqual('SOME £$™€ CHARACTERS');

            done();
        });
    });

    it('can parse a windows-1252 file', function(done) {
        qif2json.parseFile(__dirname + '/files/windows-1252.qif', function(err, data) {
            expect(err).not.toBeDefined();
            expect(data.transactions[0].payee).toEqual('SOME £$™€ CHARACTERS');

            done();
        });
    });

    it('can parse stream', function(done) {
        var reader = fs.createReadStream(__dirname + '/files/utf8.qif');

        qif2json.parseStream(reader, function(err, qifData) {
            expect(err).not.toBeDefined();
            expect(qifData.transactions.length).toEqual(1);

            done();
        });
    });
});
