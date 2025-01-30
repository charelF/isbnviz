import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.io.File
import kotlin.collections.groupBy
import kotlin.time.measureTime

data class Registrant(
    val registrantName: String,
    val agencyName: String,
    val countryName: String,
    val isbns: List<String>
)

class Publishers {
    val csvFilePath = "../data/isbngrp.csv" // Replace with the actual path to your CSV file
    val outputFilePath = "../data/isbngrp.geojson" // Replace with the desired output path
    val tools = ISBNCountries()

    fun main() = measureTime {
        val registrants = mutableListOf<Registrant>()

        // Read the CSV file line by line
        var i = 0
        File(csvFilePath).forEachLine { line ->
            if (i++ > 50000) return@forEachLine // Exit after processing 100 lines

//            if (i++ < 200) return@forEachLine // Exit after processing 100 lines

            if (line.isNotBlank()) {
                val columns = parseCsvLine(line)
                if (columns.size == 4) { // Ensure there are exactly 4 columns
                    val isbnRanges = columns[3]
                        .split("; ") // Split the ISBNs by "; "
                        .map { it.substringBefore(" (prefix)") } // Remove " (prefix)"
                        .filter { !it.contains("isbn13") }

                    val registrant = Registrant(
                        registrantName = columns[0],
                        agencyName = columns[1],
                        countryName = columns[2],
                        isbns = isbnRanges
                    )
                    registrants.add(registrant)
                }
            }
        }

        println(registrants.first())


        val features = registrants.mapNotNull { registrant ->
            println(registrant.registrantName)
            println(registrant.isbns)
            val properties = mapOf(
                "registrant_name" to registrant.registrantName,
                "agency_name" to registrant.agencyName,
                "country_name" to registrant.countryName,
            )
            val polygons = registrant.isbns.map { isbngrp ->
                ISBNGroup2Polygon(isbngrp)
            }.filter { it.isNotEmpty() }
            if (polygons.isEmpty()) {
                null
            } else {
                val feature = tools.createFeature(polygons, properties)
                feature
            }
        }
        val geo = GeoJSON(type = "FeatureCollection", features = features)
        val json = Json.encodeToString(geo)
        File(outputFilePath).writeText(json)
    }.also { println("took $it") }

    fun ISBNGroupToRange2(group: String): LongRange? {
        // group is something like 978-604
        val (prefix, rest) = group.split("-", limit = 2) // Split on the first dash only
        val suffix = rest.replace("-", "")
        if (suffix.length <= 4) {
            // i think those are weird... out!
            return null
        }
        val prefixLead = if (prefix == "978") 0 else 1
        val idxString = "$prefixLead${suffix.padEnd(9, '_')}"
        val start = idxString.replace('_', '0').toLong()
        val end = idxString.replace('_', '9').toLong()
        return start .. end
    }

    fun ISBNGroup2Polygon(group: String): List<Pair<Int, Int>> {
        val range = ISBNGroupToRange2(group)
        if (range == null) return listOf()
        val corners = tools.polygon.findCornersLive(tools.hilbert, range)
        val sorted = tools.polygon.sortCorners(corners)
        val polygon = sorted.map { it.second }
        return polygon
    }

    /**
     * Parses a CSV line, handling quoted fields correctly.
     */
    fun parseCsvLine(line: String): List<String> {
        val result = mutableListOf<String>()
        var inQuotes = false
        val currentField = StringBuilder()
        var i = 0

        while (i < line.length) {
            when {
                line[i] == '"' -> {
                    inQuotes = !inQuotes
                    i++
                }

                line[i] == ',' && !inQuotes -> {
                    result.add(currentField.toString().trim())
                    currentField.clear()
                    i++
                }

                else -> {
                    currentField.append(line[i])
                    i++
                }
            }
        }
        result.add(currentField.toString().trim()) // Add the last field
        return result
    }
}
