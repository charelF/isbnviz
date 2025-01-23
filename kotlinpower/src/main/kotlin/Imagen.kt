import java.io.FileInputStream
import java.nio.ByteOrder
import java.io.*
import java.nio.ByteBuffer
import java.awt.Color
import java.awt.image.BufferedImage
import javax.imageio.ImageIO
import java.io.File
import javax.imageio.IIOImage

// had to use an external library because my image is too big lol. but it works very well
import java.nio.file.*;
import ar.com.hjg.pngj.ImageInfo
import ar.com.hjg.pngj.ImageLineInt
import ar.com.hjg.pngj.PngWriter
import kotlin.time.measureTime


class Imagen {
    val hilbert = Hilbert(16)
    val size = hilbert.m
    // cant make this shit up: my image is exactly Int.MAX_VALUE big and thats exactly where java draws the line.. sucks
    val width = size
    val height = size / 2

    fun loadList(path: String): List<Int> {
        val file = File(path)
        val buffer = ByteBuffer.allocate(file.length().toInt())
            .order(ByteOrder.LITTLE_ENDIAN)  // Python/numpy typically uses little-endian

        FileInputStream(file).use { fis ->
            fis.channel.read(buffer)
        }

        buffer.flip()
        val list = List(buffer.limit() / 4) { buffer.getInt() }
        // the binary data is uint32s, but i think there are no big ones in there so we should be safe to read them
        // as ints. confirm it here.
        if (list.min() < 0) {
            throw Exception("ohoh encountered uint")
        }
        println(list.size)
        return list
    }

    fun processList(list: List<Int>, image: Array<BooleanArray>) {
        var streak = true
        var position = 0
        println("processlist start")
        for (value in list) {
            if (streak) {
                for (i in position until position + value) {
                    val (y, x) = hilbert.numToPos(i.toLong())
                    if (y >= height || x >= width) break
                    image[y][x] = true
                }
                position += value
            } else {
                position += value
            }
            streak = !streak
        }
        println("processlist end")
    }

    fun run(filepath: String) {
        val list = loadList(filepath)
        var image: Array<BooleanArray> = Array(height) { BooleanArray(width) { false } }
        processList(list, image)
        val outputFile = File("$filepath.png".replace("isbns_codes_binary", "isbn_pngs"))
        booleanArrayToPngJPNG(image, outputFile)
    }

    fun booleanArrayToPngJPNG(bitArray: Array<BooleanArray>, outputFile: File) {
        // Create a PNG writer
        val imgInfo = ImageInfo(width, height, 1, false, true, false)
        val pngWriter = PngWriter(outputFile, imgInfo)
        // Write each row of the Boolean array to the PNG
        for (row in bitArray) {
            val imageLine = ImageLineInt(imgInfo)
            for (col in row.indices) {
                imageLine.scanline[col] = if (row[col]) 0 else 1 // Black for true, white for false
            }
            pngWriter.writeRow(imageLine)
        }
        pngWriter.end()
    }

    fun main() {
        val dir = Paths.get("../data/isbns_codes_binary")
        val globPattern = "*.bin"
        try {
            Files.newDirectoryStream(dir, globPattern).use { stream ->
                measureTime {
                    for (entry in stream) {
                        val path = "../data/isbns_codes_binary/${entry.fileName}"
                        println(path)
                        run(path)
                    }
                }.also { println("finished in $it") }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun booleanArrayToPng(bitArray: Array<BooleanArray>, outputFile: File, trueColor: Color = Color.BLACK, falseColor: Color = Color.WHITE) {
        val width = bitArray[0].size
        val height = bitArray.size
        val bufferedImage = BufferedImage(width, height, BufferedImage.TYPE_INT_RGB)
        for (y in 0 until height) {
            for (x in 0 until width) {
                val color = if (bitArray[y][x]) trueColor else falseColor
                bufferedImage.setRGB(x, y, color.rgb)
            }
        }
        ImageIO.write(bufferedImage, "png", outputFile)
    }
}




