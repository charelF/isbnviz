import numpy as np
import bencodepy
import struct
import zstandard

print("start")

input_filename = '../data/aa_isbn13_codes_20241204T185335Z.benc.zst'

isbn_data = bencodepy.bread(zstandard.ZstdDecompressor().stream_reader(open(input_filename, 'rb')))

for key, data in isbn_data.items():
    s = key.decode()
    nums = struct.unpack(f'{len(data) // 4}I', data)
    int32_array = np.array(nums, dtype=np.uint32)
    with open(f"../data/isbns_codes_binary/{s}.bin", "wb", ) as f:
        int32_array.tofile(f)
print("done")