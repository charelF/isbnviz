class RegionFinder {
    // this is like advent of code 2024 day 12 lol
    // using the idea from https://www.reddit.com/r/adventofcode/comments/1hcdnk0/comment/m1nkmol/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button
    // since i dont even understand my own solution anymore

    fun findCorners(points: Set<Pair<Long, Long>>): Set<Pair<Long, Long>>  {
        // taking a set of coordinates as input
        // for each point x
        val corners = mutableSetOf<Pair<Long, Long>>()
        for (point in points) {
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

            if (!neIn && nIn == eIn) corners.add(e)
            if (!nwIn && nIn == wIn) corners.add(point)
            if (!swIn && sIn == wIn) corners.add(s)
            if (!seIn && sIn == eIn) corners.add(se)
        }
        return corners
    }
}