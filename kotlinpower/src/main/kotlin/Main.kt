import kotlin.random.Random
import kotlin.system.measureTimeMillis


fun test() {
    val hilbert = Hilbert(3)
    val m = 2L.pow(hilbert.dimensions).toInt()
    val container = MutableList(m) { MutableList(m) {0} }

    repeat(hilbert.N.toInt()) { i ->
        val idx = hilbert.numToPos(i.toLong())
        val i2 = hilbert.posToNum(idx)
        println("$i -> $idx -> $i2")
        container[idx.first.toInt()][idx.second.toInt()] = i
    }
    container.forEach { line ->
        line.forEach { num ->
            print(num.toString().padStart(4, ' '))
        }
        println()
    }

    val h2 = Hilbert(14)
    List(100) { Random.nextLong(0, h2.N) }
        .map { num ->
//            println("$num -> ${h2.numToPos(num)} -> ${h2.posToNum(h2.numToPos(num))}")
            if (num != h2.posToNum(h2.numToPos(num))) {
                throw Exception("problem")
            }
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

fun polytest() {
    val hilbert = Hilbert(7)

//    val m = 2L.pow(hilbert.dimensions).toInt()
//    val container = MutableList(m) { MutableList(m) {0} }
//
//    repeat(hilbert.N.toInt()) { i ->
//        val idx = hilbert.numToPos(i.toLong())
//        container[idx.first.toInt()][idx.second.toInt()] = i
//    }
//    container.forEach { line ->
//        line.forEach { num ->
//            print(num.toString().padStart(4, ' '))
//        }
//        println()
//    }

    val poly = Polygon()

    val seq = (1233L..5621L)
        .map(hilbert::numToPos).toSet().also(::println)
        .let(poly::findCorners)

    println(seq)

    val sorted = poly.sortCorners(seq)

    println(sorted)

}


fun main() {
//    ISBNCountries().main()
//    test()
//    println(Hilbert(3).numToPos(-1))
//    ISBNCountries().createGeoJSON()
//    Imagen().main()
//    val h = Hilbert(16)
//    println(h.posToNum(39000 to 400))
}

