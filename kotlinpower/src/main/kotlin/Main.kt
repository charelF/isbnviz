import javax.swing.plaf.synth.Region
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

fun benchmark() {
    val hilbert = Hilbert(dimensions=12)

    val n = 500_000_000L
    measureTimeMillis {
        for (i in 0L..n) {
            hilbert.numToPos(i)
        }
    }.also { println("finished in $it ms") }

}

fun main() {
    val hilbert = Hilbert(3)

    val m = 2L.pow(hilbert.dimensions).toInt()
    val container = MutableList(m) { MutableList(m) {0} }

    repeat(hilbert.N.toInt()) { i ->
        val idx = hilbert.numToPos(i.toLong())
        container[idx.first.toInt()][idx.second.toInt()] = i
    }
    container.forEach { line ->
        line.forEach { num ->
            print(num.toString().padStart(3, ' '))
        }
        println()
    }

    val finder = RegionFinder()

    val seq = (6L..13L)
        .map(hilbert::numToPos).toSet()
        .let(finder::findCorners)

    println(seq)



}
