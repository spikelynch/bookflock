// Library lookups


//SEARCH_URL = "/bookmap" //local proxy to UTS libray catalogue search

SEARCH_URL = "http://localhost:8000"
PAGE = 25

var results = [];

var DD_RE = /^(\d+\.\d+)/;




function get_results(query, offset, searchHandler) {
    var url = SEARCH_URL + "?q=" + query + "&limit=" + PAGE + "&offset=" + offset;
    d3.json(url, function(error, json) {
        if( error ) {
            return { error: error };
        }
        var docset = json.data.documentSet;
        var results = parse_docs(docset.docs);
        var count = offset + PAGE;
        searchHandler(results, count, docset.totalHits);
        if( offset + PAGE < docset.totalHits ) {
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

