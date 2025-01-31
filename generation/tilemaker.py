import pyvips
import glob

# paths = glob.glob("../data/isbn_pngs/*")
paths = glob.glob("../data/isbn_pngs/combined3*")

for path in paths:
    print(path)
    name = path.split("/")[-1]
    image = pyvips.Image.new_from_file(path)
    tilesize = 4096
    q=100
    image.dzsave(
        f"../visualization/public/zoomify/{name}", 
        layout="zoomify",
        # compression=compression,
        tile_size=tilesize,
        suffix=f".png[Q={q}]",
        # properties=False,
        # container="zip",
        # strip=True,
        # background=0
        # depth="one"
    )