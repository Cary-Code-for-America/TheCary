var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var moment  = require('moment');
var app     = express();


app.get('/scrape', function(req, res)
{

	var url = 'http://www.townofcary.org/Departments/Parks__Recreation___Cultural_Resources/Facilities/Cultural_Arts_Centers/thecary/eventsandtickets/calendar.htm?';

	request(url, function(error, response, html)
  {
    // First we'll check to make sure no errors occurred when making the request
    if(!error)
    {
      // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality
      var $ = cheerio.load(html);

      //create base object for show times
      var listing = {scraped:[]};
      var cur_mom = moment();

      //The table doesn't have any usefull attributes to help select it.
      //Luckily, the CMS seems to have *some* structure that we can use to our advantage
      //The screentimes seem to always be the only table within the main-content div.
      $("#main-content > div > table tbody").filter(function()
      {
        var data = $(this);
        //we are currently in the tbody tag and can iterate through each TR tag
        data.find("tr").each(function()
        {
          //assume this TR is one show element
          var row_data = [];//the current row's data
          //let's loop through each TD tag int he current TR.
          var row = $(this).find("td");
          row.each(function()
          {
            var cell = $(this).text();//the current cell/TD's text
            //just in case the cell is falsey?
            if (cell)
            {
              //Some cells have multiple bits of info delimited by new lines
              cell = cell.split("\r\n");

              //loop through array and add cell if not blank
              for (var i = 0; i < cell.length; i++)
              {
                if (cell[i].trim() != "")
                {
                  row_data.push( cell[i].trim() );
                }
              }
            }
          });
          //push the row's data to the main object
          listing.scraped.push(row_data);
        });
      });
      //get today's date
      listing.scrape_date = cur_mom.format();
      //create today's file name
      target_filename = "thecaryscrape_" + cur_mom.format("MMDDYYYY") + ".json";
      //convert the object to string for file storage
      listing_string = JSON.stringify(listing, null, 4);
      //store file
      fs.writeFile(target_filename, listing_string, function(err){
        console.log('File successfully written! - Check your project directory for the html file');
      })

      //done, return response to user
      res.send(listing_string);
		}

	})
})

//port to listen on
app.listen('8082')

exports = module.exports = app;
