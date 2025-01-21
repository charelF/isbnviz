import kotlin.system.measureTimeMillis


fun test() {
    val hilbert = Hilbert(3)
    val m = 2L.pow(hilbert.dimensions).toInt()
    val container = MutableList(m) { MutableList(m) {0} }

    repeat(hilbert.N.toInt()) { i ->
        val idx = hilbert.numToPos(i.toLong())
//        println("$i -> $idx")
        container[idx.first.toInt()][idx.second.toInt()] = i
    }
    container.forEach { line ->
        line.forEach { num ->
            print(num.toString().padStart(3, ' '))
        }
        println()
    }
}

fun main() {
    val hilbert = Hilbert(dimensions=12)

    val n = 500_000_000L
    measureTimeMillis {
        for (i in 0L..n) {
            hilbert.numToPos(i)
        }
    }.also { println("finished in $it ms") }

}
