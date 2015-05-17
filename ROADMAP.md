# Roadmap / feature list

## 0.x

### 0.1 : the basic couchapp

* [x] 2 fields : artist and title
* [x] playlist behavior : click to play, next/previous
* [ ] fulltext search (original cloudbox used lucene)

### web drag & drop importation tool

* [ ] nicer URLs
* [ ] add more ID3 tags to our documents
* [ ] Import & display song cover
* [ ] Select multiple files (or folders)
* [ ] Index more search fields
* [ ] Resize cover image (if easy with Flex)
* [ ] Check if songs (from fulltext-search and views) are sorted correctly
* [ ] Conflicts protections (double importations, id already taken, etc)

### Targeting 1.0

* [ ] Artists and albums listings - filter by name and style
* [ ] Import from iTunes lib, m3u lists ...
* ~~Install the couchapp from the importation tool~~
* [x] Complete and custom JS-controlled player
* [x] Field-specific search (search artist, title, album...)
* [x] Test on big library

## 2.0

* [x] Playlists, here you come!
* [ ] Save playlist (owner, name of list, Private(share with user names) / Public)
  * Hint: extract current playlist with $("#player").data("myPlaylist").playlist
* [ ] Load playlist (personal)
* [ ] shared playlist editing
* [ ] Heart (public like)
* [ ] Hide (personal hidden)
* [ ] Pin (personal pin)
* [ ] 5 Star Rating (personal rating)
* [ ] Comments (public)
* [ ] Permalink to playback time
* [ ] Keyboard Media Keys (play/pause/ff/rewind)
