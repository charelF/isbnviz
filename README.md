# isbnviz
ISBN visualization


### Links:

Anna's Archive pages
- where it started: https://annas-archive.org/blog/all-isbns.html
- Gitlab issue: https://software.annas-archive.li/AnnaArchivist/annas-archive/-/issues/244
- Metadata torrents: https://annas-archive.org/torrents/other_metadata
- Metadata overview: https://annas-archive.org/datasets/other_metadata
- isndb search https://annas-archive.org/search?index=meta&q=%22isbn13:9780835232517%22 and links: https://annas-archive.org/isbndb/9780835232517
- other gitlab links https://software.annas-archive.li/AnnaArchivist/annas-archive/-/tree/main/isbn_images and 
https://software.annas-archive.li/AnnaArchivist/annas-archive/-/blob/369f1ae1074d8545eaeaf217ad690e505ef1aad1/allthethings/cli/views.py?page=2#L1244-1319

Openlayers examples
- vector highlights on hover https://openlayers.org/en/latest/examples/vector-layer.html
- tooltips on hover: https://openlayers.org/en/latest/examples/tooltip-on-hover.html

Other interesting links
- https://www.rijksmuseum.nl/en/stories/operation-night-watch/story/ultra-high-resolution-photo
- isbn countries: https://github.com/xlcnd/isbnlib/blob/dev/isbnlib/_data/data4info.py



CF pages file limits:
https://developers.cloudflare.com/pages/platform/limits/
- max: 20_000 files
- max file size: 25 MiB

- find biggest one macos `charelfelten@Charels-MacBook-Pro-2 gbooks_q100_N4294967296_t2048 % find . -type f -exec du -h {} + | sort -rh | head -n 10`

- find amount: `find . -type f | wc -l`


for some reason, openlayers zoomify has unsharp tiles for size 1024 and 2048, but they are sharp for 4096


possible improvements:
- fake the lower half / or remove it.
