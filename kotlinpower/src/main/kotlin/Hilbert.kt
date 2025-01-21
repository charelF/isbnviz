import kotlin.math.pow
import kotlin.math.roundToLong

infix fun Long.pow(x: Int): Long {
    return this.toDouble().pow(x).roundToLong()
}

class Hilbert(
    val dimensions: Int
) {
    val N = 2L.pow(2*dimensions)

    fun numToPos(num: Long): Pair<Long, Long> {
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

        return Pair(x, y)
    }
}

