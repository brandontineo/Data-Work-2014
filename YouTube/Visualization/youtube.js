/* this api call returns the top (by viewCount) 25 videos for the location's comedy category */
counter = 0;

genre_data = {}
comedy_data = {};
sport_data = {};
music_data = {};
gaming_data = {};
movies_data = {};
location_data1 = {};
location_data2 = {};
location_data3 = {};
location_data4 = {};
location_data5 = {};

var youtube_data = [];

var genre_data = {};

var genre_location = 0;


function MakeCall (genre){ 
    genre_data[genre] = {};
    d3.json("../CityInfo/cities.json",function(data){
        //Adapted from http://learn.jquery.com/code-organization/deferreds/examples/
        $.createCache = function( requestFunction ) {
            return function( key, callback ) {
                cache = {};
                if ( !cache[ key ] ) {
                    cache[ key ] = $.Deferred(function( defer ) {
                        requestFunction( defer, key );
                    }).promise();
                }
                return cache[ key ].done( callback );
            };
        }
        for (city in data) { 
            var loc = data[city].latitude.toFixed(4) + "," + data[city].longitude.toFixed(4); 
            var url = "https://gdata.youtube.com/feeds/api/videos?location=" + loc + "&location-radius=100km&prettyprint=true&category=" + genre + "&orderby=viewCount";
            function getCallback(d){
                city_info = {};
                var entry = d.getElementsByTagName('entry');
                var total_entries_num = d.getElementsByTagNameNS("*","totalResults")[0].textContent;
                city_info["Total Entries"] = total_entries_num;
                for (i in entry)
                {
                    if (i != "length" && i != "item" && i != "namedItem")
                    {
                        var NoData = NaN;
                        var title = $(entry[i]).find("title")[0].textContent;
                        var author = $($(entry[i]).find("author")[0]).find("name")[0].textContent;
                        var author_url = $($(entry[i]).find("author")[0]).find("uri")[0].textContent;

                        if ((entry[i].getElementsByTagNameNS("*","recorded")[0]) != undefined){
                        var date = entry[i].getElementsByTagNameNS("*","recorded")[0].textContent
                        }
                        else
                        {
                        var date = NoData;
                        }
                        if (entry[i].getElementsByTagNameNS("*","rating")[0] != undefined){
                        var avg_rating = entry[i].getElementsByTagNameNS("*","rating")[0].getAttribute("average");
                        var max = entry[i].getElementsByTagNameNS("*","rating")[0].getAttribute("max");
                        var min = entry[i].getElementsByTagNameNS("*","rating")[0].getAttribute("min");
                        var num_raters = entry[i].getElementsByTagNameNS("*","rating")[0].getAttribute("numRaters");
                        }
                        else
                        {
                        var avg_rating = NoData;
                        var max = NoData;
                        var min = NoData;
                        var num_raters = NoData;
                        }

                        if (entry[i].getElementsByTagNameNS("*","statistics")[0] != undefined){
                        var fave_count = entry[i].getElementsByTagNameNS("*","statistics")[0].getAttribute("favoriteCount");
                        var view_count = entry[i].getElementsByTagNameNS("*","statistics")[0].getAttribute("viewCount");
                        }
                        else
                        {
                        var fave_count = NoData;
                        var view_count = NoData;

                        }
                    city_info[i] = {title : title, author : author, author_url : author_url, date : date, avg_rating : avg_rating,
                        max : max, min : min, num_raters : num_raters, fave_count : fave_count, view_count : view_count}; 
                    }

                }
                genre_data[genre][city] = city_info;
            }
            $.cachedComedy = $.createCache(function(defer,c){
                $.ajax({
                    url: url,
                    dataType: "xml",
                    async : false,
                    success: defer.resolve,
                    error : defer.reject
                });
            });
            $.cachedComedy(city,getCallback);
        }
                           
        console.log(genre_data);
        if (genre_location == genres.length - 1){
            download_JSON(genre_data);
        }
        console.log(genre_location);
        genre_location = genre_location + 1;
    });
}


var genres = ["Comedy", "Music", "Entertainment", "News", "Sports"];

for (i in genres){
    genre = genres[i];
    MakeCall(genre);
}

function download_JSON(data){
    console.log(data);
    data_string = JSON.stringify(data)
    blob = new Blob([data_string],{type : "text/plain;charset=utf-8"});
    saveAs(blob,"genre_data.json");
}


