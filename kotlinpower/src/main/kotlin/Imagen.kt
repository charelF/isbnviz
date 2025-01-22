import java.io.FileInputStream
import java.nio.ByteOrder
import java.io.*
import java.nio.ByteBuffer

class Imagen {
    fun main() {
        val path = "../data/isbns_codes_binary/gbooks.bin"
        val file = File(path)
        val buffer = ByteBuffer.allocate(file.length().toInt())
            .order(ByteOrder.LITTLE_ENDIAN)  // Python/numpy typically uses little-endian

        FileInputStream(file).use { fis ->
            fis.channel.read(buffer)
        }

        buffer.flip()
        val list = List(buffer.limit() / 4) { buffer.getInt() }
        println(list.size)
    }
}




