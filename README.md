# Cloudbox

__Cloudbox is a cloudy jukebox (hence the name)__

Actually, it's a couchapp using HTML5's audio tag. In the back-end the basic principle is "a song = a couchDB document". An AIR application is provided to help you to fill your couch with your existing MP3 collection.

Music on a couch... relaxing ;)

![](https://github.com/johnko/kanso-music/raw/master/screenshot.png)

## Requirements

* CouchDB >=0.11
* Couchapp >=0.6


MP3 is not supported by all HTML5 browsers. So far it works well on Safari 5, Firefox 3.6 and 4 can't read MP3s, Chrome 5 can "sometimes".

## Removed Requirements
* couchdb-lucene (mapped as http://myhost/mydb/_fti)
* ImportationTool requires Adobe AIR runtime (+ Adobe's AIR SDK >=1.5 if you want to compile the importation tool)
