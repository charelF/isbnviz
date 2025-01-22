import kotlin.math.pow
import kotlin.math.roundToLong

fun Long.pow(x: Int): Long {
    return this.toDouble().pow(x).roundToLong()
}

class Hilbert(
    val dimensions: Int
) {
    val N = 2L.pow(2*dimensions)

    fun numToPos(num: Long): Pair<Int, Int> {
        if (num >= N) throw Exception("num $num too big for hilbert space of dimension $dimensions (max = $N)")
        // the array starts at the top right (rowIdx=0, colIdx=0)
        var h = num
        var last2bits = h and 3
        var x = if (last2bits == 0L || last2bits == 1L) 0L else 1L
        var y = if (last2bits == 0L || last2bits == 3L) 0L else 1L
        h = h ushr 2 // bit shift right and fill with zeros

        var n = 4L
        var n2: Long
        var t: Long
        repeat(dimensions-1) {  // -1 since we already solved one above
            n2 = n shr 1  // division by 2 but idk why
            last2bits = h and 3
            when (last2bits) {
                0L -> {
                    t = x
                    x = y
                    y = t
                }
                1L -> {
                    y += n2
                }
                2L -> {
                    x += n2
                    y += n2
                }
                3L -> {
                    t = y
                    y = (n2 - 1) - x
                    x = (n2 - 1) - t
                    x += n2
                }
            }
            h = h ushr 2
            n *= 2
        }

        if (x > Int.MAX_VALUE || y > Int.MAX_VALUE) {
            throw Exception("Tried to cast long to int that cant be cast; this is weird for reasonably low dimensions x=$x y=$y dim=$dimensions maxXY=${2L.pow(2*dimensions)}")
        }
        return Pair(x.toInt(), y.toInt())
    }


    fun posToNum(pos: Pair<Int, Int>): Long {
        // insane ... Claude 3.5 Sonnet wrote this on the second try (first had a mistake)
        // I just gave it numToPos as input and asked it to inverse it
        var x = pos.first.toLong()
        var y = pos.second.toLong()
        var h = 0L

        // Start with the largest square and work backwards
        var n = 2L.pow(dimensions)
        var n2: Long
        var t: Long

        for (i in (dimensions-1) downTo 0) {
            n2 = n shr 1

            // Add appropriate bits based on quadrant
            val bits = when {
                x < n2 && y < n2 -> {
                    // Bottom left quadrant
                    t = x
                    x = y
                    y = t
                    0L
                }
                x < n2 && y >= n2 -> {
                    // Top left quadrant
                    y -= n2
                    1L
                }
                x >= n2 && y >= n2 -> {
                    // Top right quadrant
                    x -= n2
                    y -= n2
                    2L
                }
                else -> {  // x >= n2 && y < n2
                    // Bottom right quadrant
                    t = y
                    y = (n2 - 1) - x + n2
                    x = (n2 - 1) - t
                    3L
                }
            }
            h = h shl 2
            h = h or bits
            n = n2
        }

        return h
    }
}

