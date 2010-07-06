// http://localhost:5984/bewls/_fti/couchapp/songs?q=artist:beck&include_docs=true&debug=true
function(doc)
{
	if(doc.type == 'song')
	{
		var indexed = new Document();
		indexed.add(doc.artist);
		indexed.add(doc.title);
		indexed.add(doc.artist, {"field":"artist"});
		indexed.add(doc.title, {"field":"title"});
		return indexed;
	}
}