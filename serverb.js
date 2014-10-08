var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var moment  = require('moment');
var app     = express();

app.get('/scrape', function(req, res)
{

  var url = 'http://www.townofcary.org/Departments/townmanagersoffice/pio/Annual_Events_Calendar.htm';

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

      //get today's date
      listing.scrape_date = cur_mom.format();
      //create today's file name
      target_filename = "thecaryscrape_" + cur_mom.format("MMDDYYYY") + ".json";

      $(".advplace-calendar table.ip-calendar-maintable.ip-calendar-tablemonth").filter(function()
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
                  var actual_cell = cell[i].trim();
                  var cell_date = moment(actual_cell);

                  //check for valid date
                  if ( cell_date.isValid() === true )
                  {
                    //Moment gives a default year, if less than current year
                    // assume the correct year is the current year
                    if ( cell_date.year() < cur_mom.year() )
                    {
                      cell_date.year( cur_mom.year() )
                    }
                    row_data.push( cell_date.format() );
                  }

                  row_data.push( actual_cell );
                }
              }
            }
          });
          //push the row's data to the main object
          listing.scraped.push(row_data);
        });
      });
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
