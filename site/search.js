// Library lookups


var SEARCH_URL = "/bookmap"; //local proxy to UTS libray catalogue search

var PAGE = 200;
var MAX = 4000;

var BOOK_TYPE = '4294967266';


var DD_RE = /^(\d+\.\d+)/;




function do_search() {
    query = $("#query").val();
    
    results = [];
    $("#searchresults").empty();
    reset_flock();
    $("#progress").empty();
    $("#progress").text("Searching...");    
    get_results(query, 0, function(results, count, total) {
        $("#progress").empty();
        $("#progress").text(count + "/" + total);
        for( i = 0; i < results.length; i++ ) {
            add_to_flock(results[i].dd);
        }
    }
    );

}


function search_url(query, offset) {
    var params = {
        q: query,
        limit: PAGE,
        offset: offset,
        N: BOOK_TYPE
    }
    var args = Object.keys(params).map(function(a) { return a + "=" + params[a] }).join("&");
    return SEARCH_URL + '?' + args;
}




function get_results(query, offset, searchHandler) {
    var url = search_url(query, offset);
    console.log("About to query search URL: " + url);
    d3.json(url, function(error, json) {
        if( error ) {
            console.log("Error = " + error);
            return { error: error };
        }
        var docset = json.data.documentSet;
        var results = parse_docs(docset.docs);
        var count = offset + docset.docs.length;
        console.log("Got page " + offset);
        searchHandler(results, count, docset.totalHits);
        if( count > MAX ) {
            console.log("maxed out at " + MAX);
        } else if( count < docset.totalHits ) {
            get_results(query, offset + PAGE, searchHandler);
        } else {
            console.log("Done");
        }
    });
}




function parse_docs(docs) {
    var results = [];
    for( var i = 0; i < docs.length; i++ ) {
        doc = docs[i];
        if( is_book(doc) ) {
            var r = doc.record;
            var dd, title, authors;
            dd_s = get_p(r, "p_CallNumber");
            dd = parse_dd(dd_s);
            if( dd ) {
                title = get_p(r, "p_Title");
                authors = get_p(r, "p_TitleResponsibility");
                results.push({
                    dd: dd,
                    title: title,
                    authors: authors
                });
            }
        }
    }
    return results;
}



function is_book(doc) {
    //console.log(doc);
    for( var i = 0; i < doc.dimensions.length; i++ ) {
        var d = doc.dimensions[i];
        if ( d.name == "Type" ) {
            if( d.values[0].name == "Book" ) {
                return true;
            }
        }
    }
    return false;
}


function get_p(rec, property) {
    if( property in rec ) {
        return rec[property][0];
    } else {
        return undefined;
    }
}

function parse_dd(dds) {
    var rs = DD_RE.exec(dds);
    if( rs ) {
        fl = parseFloat(rs[0]);
        return fl;
    }
    return false;
}

