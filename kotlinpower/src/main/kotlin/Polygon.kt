import kotlin.math.abs

enum class CornerType {
    nei, sei, nwi, swi, neo, seo, nwo, swo,
}

enum class Dir {
    n, e, s, w
}

typealias Corner = Pair<CornerType, Pair<Int, Int>>


class Polygon {
    // this is like advent of code 2024 day 12 lol
    // using the idea from https://www.reddit.com/r/adventofcode/comments/1hcdnk0/comment/m1nkmol/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button
    // since i dont even understand my own solution anymore

    fun findCornersLive(hilbert: Hilbert, range: LongRange): Set<Corner> {
        // findCorners below became a memory bottleneck for me when dealing with the biggest ISBN spaces
        // this one is slower, but much more memory efficient
        val corners: MutableSet<Corner> = mutableSetOf()
        for (i in range) {
            if (i % ((range.last-range.first)/100) == 0L) println(i)

            val point = hilbert.numToPos(i)

            val n = point.first - 1 to point.second
            val s = point.first + 1 to point.second
            val e = point.first to point.second + 1
            val w = point.first to point.second - 1

            val ne = point.first - 1 to point.second + 1
            val se = point.first + 1 to point.second + 1
            val nw = point.first - 1 to point.second - 1
            val sw = point.first + 1 to point.second - 1

            // transform back from pos to index to search if it is in the range
            val nIn = hilbert.posToNum(n) in range
            val sIn = hilbert.posToNum(s) in range
            val eIn = hilbert.posToNum(e) in range
            val wIn = hilbert.posToNum(w) in range

            val neIn = hilbert.posToNum(ne) in range
            val seIn = hilbert.posToNum(se) in range
            val nwIn = hilbert.posToNum(nw) in range
            val swIn = hilbert.posToNum(sw) in range

            if (!neIn && nIn == eIn) corners.add((if (nIn) CornerType.nei else CornerType.neo) to e)
            if (!nwIn && nIn == wIn) corners.add((if (nIn) CornerType.nwi else CornerType.nwo) to point)
            if (!swIn && sIn == wIn) corners.add((if (sIn) CornerType.swi else CornerType.swo) to s)
            if (!seIn && sIn == eIn) corners.add((if (sIn) CornerType.sei else CornerType.seo) to se)

        }
        return corners
    }

    fun findCorners(points: Set<Pair<Int, Int>>): Set<Corner> {
        val corners: MutableSet<Corner> = mutableSetOf()
        var i = 0L
        for (point in points) {
            i ++ ; if (i % (points.size/100) == 0L) println(i)
            val n = point.first - 1 to point.second
            val s = point.first + 1 to point.second
            val e = point.first to point.second + 1
            val w = point.first to point.second - 1

            val ne = point.first - 1 to point.second + 1
            val se = point.first + 1 to point.second + 1
            val nw = point.first - 1 to point.second - 1
            val sw = point.first + 1 to point.second - 1

            val nIn = n in points
            val sIn = s in points
            val eIn = e in points
            val wIn = w in points

            val neIn = ne in points
            val seIn = se in points
            val nwIn = nw in points
            val swIn = sw in points

            // north east inner or outer corner
            // when north east is free, and north and east are either both in
            // or both out. in any case, they must be the same, otherwise its just a line
            // if its a corner, the corner is inbetween the grid, so we add the point whose
            // top right corner sits on top of the corner, which for ne is e
            // for north west corner, the point would be the point itself etc...

            if (!neIn && nIn == eIn) corners.add((if (nIn) CornerType.nei else CornerType.neo) to e)
            if (!nwIn && nIn == wIn) corners.add((if (nIn) CornerType.nwi else CornerType.nwo) to point)
            if (!swIn && sIn == wIn) corners.add((if (sIn) CornerType.swi else CornerType.swo) to s)
            if (!seIn && sIn == eIn) corners.add((if (sIn) CornerType.sei else CornerType.seo) to se)
        }
        return corners
    }


    fun sortCorners(corners: Set<Corner>): List<Corner> {
        // one possibility could be do to a maximally concave hull, but those algorithms are not so fun
        // i think given the domain, I have a simpler idea

        fun Corner.findClosestInDirection(direction: Dir): Corner {
            return when (direction) {
                Dir.n -> corners
                    .filter { it.second.second == this.second.second && it.second.first < this.second.first }
                    .minBy { abs(this.second.first - it.second.first) }

                Dir.s -> corners
                    .filter { it.second.second == this.second.second && it.second.first > this.second.first }
                    .minBy { abs(this.second.first - it.second.first) }

                Dir.e -> corners
                    .filter { it.second.first == this.second.first && it.second.second > this.second.second }
                    .minBy { abs(this.second.second - it.second.second) }

                Dir.w -> corners
                    .filter { it.second.first == this.second.first && it.second.second < this.second.second }
                    .minBy { abs(this.second.second - it.second.second) }
            }
        }

        // start of with an outer corner, i think top left is good
        val remaining = corners.drop(1).toMutableSet()
        val sorted = mutableListOf(corners.first())

        // now we ... walk the shape
        // for each corner, only some distances are allowed to be probed
        // e.g. nwo (north west outer) => we can go probe south and east (since if we e.g. go north, this wouldnt be an outer corner)
        // e.g. nwi (north west inner) => we can go probe north and west
        // e.g. nei -> we can go north and east
        // either we can check both directions, and for one of them the closest is already in the list
        // or we take the last two elements from the list then we know which direction we can exclude to look to, but this makes the first case more manual
        // in the end, the second approach makes then when() also very complicated, so the first one is easier altough slightly slower probably
        // but corners sets wont be big so it should be fine

        while (remaining.isNotEmpty()) {
            val corner = sorted.last()

            // search its closest allowed neighbours
            val directions: Pair<Dir, Dir> = when (corner.first) {
                CornerType.nei -> Dir.n to Dir.e
                CornerType.sei -> Dir.s to Dir.e
                CornerType.nwi -> Dir.n to Dir.w
                CornerType.swi -> Dir.s to Dir.w
                CornerType.neo -> Dir.s to Dir.w
                CornerType.seo -> Dir.n to Dir.w
                CornerType.nwo -> Dir.s to Dir.e
                CornerType.swo -> Dir.n to Dir.e
            }

            val neighbour1 = corner.findClosestInDirection(directions.first)
            val neighbour2 = corner.findClosestInDirection(directions.second)
//            println("corner $corner --> $neighbour1 or $neighbour2      sorted: $sorted | remaining: $remaining")

            if (neighbour1 in sorted && neighbour2 !in sorted) {
                sorted.add(neighbour2)
                remaining.remove(neighbour2)
            } else if (neighbour1 !in sorted && neighbour2 in sorted) {
                sorted.add(neighbour1)
                remaining.remove(neighbour1)
            } else if (neighbour1 !in sorted && neighbour2 !in sorted) {
                sorted.add(neighbour1) // this just happens on the first iteration
                remaining.remove(neighbour1)
            } else {
                // if both are in sorted it means we are done; but if we are done the while should have terminated earlier
                throw Exception("An error happened in sortCorners")
            }
        }
        return sorted
    }

    fun generateVectorEdges(points: Set<Pair<Int, Int>>): List<Pair<Int, Int>> {
        val corners = findCorners(points)
        val sortedCorners = sortCorners(corners)
        return sortedCorners.map { (ct, pair) -> pair }
    }
}