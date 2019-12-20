var Airtable = require('airtable');
var base = new Airtable({apiKey: 'keyzg13nETgM4OCZa'}).base('app06CF5u1PIg9VLo');

module.exports = function(results){
        base('Results').create([
            {
              "fields": {
                "Action": results.action,
                "Process": results.process,
                "People": results.people,
                "Ideas": results.ideas
              }
            }
          ], function(err, records) {
            if (err) {
              console.error(err);
              return;
            }
            records.forEach(function(record) {
              console.log(record.get('PrimaryKey?'));
            });
          });
    }