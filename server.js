var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var moment  = require('moment');
var app     = express();


app.get('/scrape', function(req, res){
    // The URL we will scrape from - in our example Anchorman 2.

	url = 'http://www.townofcary.org/Departments/Parks__Recreation___Cultural_Resources/Facilities/Cultural_Arts_Centers/thecary/eventsandtickets/calendar.htm?';

	request(url, function(error, response, html){
    // First we'll check to make sure no errors occurred when making the request
    if(!error)
    {
      // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality
      var $ = cheerio.load(html);
      var listing = {scraped:[]};
      var cur_mom = moment();

      $("#main-content > div > table tbody").filter(function()
      {
        var data = $(this);
        console.log( "Found " + data.find("tr").length);
        data.find("tr").each(function()
        {
          var row = $(this).find("td");
          var row_data = [];
          row.each(function()
          {
            var cell = $(this).text();
            if (cell)
              {
                cell = cell.trim();
                cell = cell.split("\r\n");
                //cell = cell.replace(/\s{2}/g, " ");
                if ( typeof cell === "object"  )
                {
                  for (var i = 0; i < cell.length; i++) {
                    if (cell[i].trim() != "")
                    {
                      row_data.push( cell[i].trim() );
                    }
                  }
                }
                else
                {
                  if (cell != "")
                  {
                    row_data.push(cell);

                  }
                }
              }
          });
          listing.scraped.push(row_data);
        });
      });
      listing.scrape_date = cur_mom.format();
      target_filename = "thecaryscrape_" + cur_mom.format("MMDDYYYY") + ".json";
      listing_string = JSON.stringify(listing, null, 4);
      fs.writeFile(target_filename, listing_string, function(err){
        console.log('File successfully written! - Check your project directory for the html file');
      })

      // Finally, we'll just send out a message to the browser reminding you that this app does not have a UI.
      res.send(listing_string);
		}

	})
})


app.listen('8082')

console.log('Magic happens on port 8082');

exports = module.exports = app;
