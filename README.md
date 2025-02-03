> [!NOTE]
> The [`submission`](https://github.com/charelF/isbnviz/tree/submissions) branch  is locked to the last commit it did before the deadline.

# ISBN visualization

My submission for the ISBN visualization contest hosted by Anna's Archive. Hosted demo with more explanations available at [**isbnviz.pages.dev**](https://isbnviz.pages.dev)

## Overview

### `/data`

contains various large files which are .gitignored, such as the fullsize PNGs.

### `/generation`

Contains the Python code managed with `uv` (`uv init --python 3.10`) used to explore the problem domain and do some prototyping. Notable files are `data_exporter.py` (`uv run data_exporter.py`) which exports the ISBN data into binary files, and `tilemaker.py` which transforms the 65536x32767 PNGs into a zoomify file directory using pyvips.

### `/kotlinpower`

Contains a Kotlin project that I created because I am unable/unwilling to write fast python code.
- `Hilbert.kt` can quickly encode/decode a coordinate (`x=123, y=456`) into a hilbert index (`i=192837`) and vice versa.
- `Imagen.kt` loads the exported (with Python) binary files, and writes them into a large PNG using the [PNGJ](https://github.com/leonbloy/pngj) Java library.
- `Polygon.kt` some relatively fast code to transform a large continuous Hilbert index range (e.g. `978001000000...978001999999`) into a Polygon (a list of coordinates like `[0.0, 64.0], [6.0, 64.0], [6.0, 68.0], [4.0, 68.0]` ) represented by its Edge coordinates in the 2D Hilbert space.
- `ISBNCountries.kt` contains the list of ISBN country/language groups transforms each group into a list of Polygons, then saves that as GeoJSON format.
- `Publishers.kt` an effort to also process the large `isbngrp` dataset, and store them as vectors, but I ran out of time.

### `/visualization`

The frontend visualization code that powers the project website, hosted on cloudflare pages. Using vite and then just some raw javascript and HTML + CSS. The overall structure is inspired by the various examples at Openlayers, and could be cleaned up a bit more.

- `index.html` the HTML of the page, contains also the CSS for simplicity.
- `main.js` the main js file
- `util.js` some additional functions I refactored out.
- `public/countries.json` the geoJSON generated with Kotlin that contains the country/language polygons
- `public/zoomify` the various zoomify directories that each contain a large PNG split into various smaller tiles.

## Links and various notes

### Links

Anna's Archive and related pages
- where it started: https://annas-archive.org/blog/all-isbns.html
- Gitlab issue: https://software.annas-archive.li/AnnaArchivist/annas-archive/-/issues/244
- Metadata torrents: https://annas-archive.org/torrents/other_metadata
- Metadata overview: https://annas-archive.org/datasets/other_metadata
- isndb search https://annas-archive.org/search?index=meta&q=%22isbn13:9780835232517%22 and links: https://annas-archive.org/isbndb/9780835232517
- other gitlab links https://software.annas-archive.li/AnnaArchivist/annas-archive/-/tree/main/isbn_images and 
https://software.annas-archive.li/AnnaArchivist/annas-archive/-/blob/369f1ae1074d8545eaeaf217ad690e505ef1aad1/allthethings/cli/views.py?page=2#L1244-1319
- isbn countries: https://github.com/xlcnd/isbnlib/blob/dev/isbnlib/_data/data4info.py

Openlayers examples
- vector highlights on hover https://openlayers.org/en/latest/examples/vector-layer.html
- tooltips on hover: https://openlayers.org/en/latest/examples/tooltip-on-hover.html

Similar interesting projects
- https://www.rijksmuseum.nl/en/stories/operation-night-watch/story/ultra-high-resolution-photo

### Notes
- Cloudflare Pages file limits https://developers.cloudflare.com/pages/platform/limits/ (max: 20_000 files, max file size: 25 MiB)
- find biggest file on macos `find . -type f -exec du -h {} + | sort -rh | head -n 10`
- find amount of files: `find . -type f | wc -l`
- for some reason, openlayers zoomify has unsharp tiles for size 1024 and 2048, but they are sharp for 4096, hence the choice of 4096x4096 tiles. At 256x256, there would be too many files to host them on cloudflare pages.

### Future work
- [x] fake the lower half / or remove it.
- [ ] use lower quality pictures on mobile (lots of work, since we need to use jpeg (then get pixel issues) or use more tiles (then reaching CF static file limit) ... idk
- [ ] use a palette to save on bits for the colorful combined.png http://www.libpng.org/pub/png/book/chapter08.html -> could save storage and make it faster on slow network
- [ ] continue the work in `Publishers.kt`. Its hard though, since there are 2 million publishers, with some (most?) containing more than one ISBN range, and there are overlapping ranges and ranges which consist of just one ISBN (my code will handle that I think). This means the generated geoJSON will be stupidly large (I think 2-3 GB at least) and impossible to host, hence one needs to use vector tiling. Here interesting libraries are [tippecannoe](https://github.com/felt/tippecanoe) and formats would be pmtiles or mbtiles. Both are not trivial to host (or at least not as trivial as the zoomify tiles). Also interesting is [ol-mbtiles](https://github.com/mmomtchev/ol-mbtiles) which unfortunately had some issues with vite at the time.



## Running it locally

### Getting started

1. in `generation`, run `uv run data_exporter.py` to put the binary .bin s into the `data/isbns_codes_binary` folder
2. open in kotlin via `Imagen.kt`, generate the pngs with `Imagen::main`, it will put them in `data/isbn_pngs`
3. now go back to python to generate the tiles using `uv run tilemaker.py` to put them in the public folder as zoomify directories


### Running

- `cd /visualization`
- `npm run dev`


