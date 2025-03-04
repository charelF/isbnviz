import kotlinx.coroutines.runBlocking
import kotlinx.serialization.*
import kotlinx.serialization.json.Json
import java.io.File
import kotlin.random.Random
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.runBlocking
import kotlin.time.measureTime


@Serializable
data class GeoJSON(
    val type: String,
    val features: List<Feature>
)

@Serializable
data class Feature(
    val type: String,
    val geometry: Geometry,
    val properties: Map<String, String>,
)

@Serializable
data class Geometry(
    val type: String,
    val coordinates: List<List<List<List<Int>>>>  // bro why so many layers
)

class ISBNCountries {
    val hilbert = Hilbert(16)
    val polygon = Polygon()

    fun ISBNGroupToRange(group: String): LongRange {
        // group is something like 978-604
        val (prefix, suffix) = group.split('-')
        val prefixLead = if (prefix == "978") 0 else 1
        val idxString = "$prefixLead${suffix.padEnd(9, '_')}"
        val start = idxString.replace('_', '0').toLong()
        val end = idxString.replace('_', '9').toLong()
        return start .. end
    }

    fun createFeature(coordinates: List<List<Pair<Int, Int>>>, properties: Map<String, String>): Feature {
        val formattedCoordinates = coordinates.map { lst -> lst.map { listOf(it.second, -it.first + hilbert.m/2) } }  // some ugly transform happening
//        val formattedCoordinates = coordinates.map { listOf(it.second, -it.first) }
        return Feature(
            type = "Feature",
            geometry = Geometry(
                type = "MultiPolygon",
                coordinates = listOf(formattedCoordinates)
            ),
            properties = properties
        )
    }


    fun createColors(): Map<String, String> {
        val r = Random.nextInt(50, 200) // Avoid very dark colors
        val g = Random.nextInt(50, 200)
        val b = Random.nextInt(50, 200)
        val alpha = (0..255 step 255 / 7).toList()
        return (0 until 8).associate { i ->
            "C$i" to "#%02X%02X%02X%02X".format(r, g, b, alpha[i])
        }
    }

    fun createGeoJSON() = runBlocking {
        measureTime {
            val countryRanges = countries.groupBy { it.second }  // Group by the name
                .mapValues { entry ->
                    entry.value.map { ISBNGroupToRange(it.first) }
                }
            val features = countryRanges.map { (name, ranges) ->
                async(Dispatchers.Default) {
                    println("$name ")
                    val colors = createColors()
                    val coords = ranges.map { range ->
                        rangeToVectorLive(range).map { it.second }
                    }
                    createFeature(coords, mapOf("NAME" to name) + colors)
                }
            }.awaitAll()
            val geo = GeoJSON(type = "FeatureCollection", features = features)
            val json = Json.encodeToString(geo)
            File("../visualization/public/countries.json").writeText(json)
        }.also { println("finished in $it") }
    }



//    fun rangeToVector(range: LongRange): List<Corner> {
//        return range
//            .map(hilbert::numToPos).toSet()
//            .let(polygon::findCorners)
//            .let(polygon::sortCorners)
//    }

    fun rangeToVectorLive(range: LongRange): List<Corner> {
        val corners = polygon.findCornersLive(hilbert, range)
        return polygon.sortCorners(corners)
    }

    val countriesDebug = setOf(
        "978-000" to "first",
        "978-001" to "first",
        "978-003" to "first",
        "978-999" to "last",
        "979-000" to "first979",
        "979-999" to "last979"
    )

    val countries = setOf(
        "978-0" to "English language",
        "978-1" to "English language",
        "978-2" to "French language",
        "978-3" to "German language",
        "978-4" to "Japan",
        "978-5" to "former U.S.S.R",
        "978-600" to "Iran",
        "978-601" to "Kazakhstan",
        "978-602" to "Indonesia",
        "978-603" to "Saudi Arabia",
        "978-604" to "Vietnam",
        "978-605" to "Turkey",
        "978-606" to "Romania",
        "978-607" to "Mexico",
        "978-608" to "North Macedonia",
        "978-609" to "Lithuania",
        "978-611" to "Thailand",
        "978-612" to "Peru",
        "978-613" to "Mauritius",
        "978-614" to "Lebanon",
        "978-615" to "Hungary",
        "978-616" to "Thailand",
        "978-617" to "Ukraine",
        "978-618" to "Greece",
        "978-619" to "Bulgaria",
        "978-620" to "Mauritius",
        "978-621" to "Philippines",
        "978-622" to "Iran",
        "978-623" to "Indonesia",
        "978-624" to "Sri Lanka",
        "978-625" to "Turkey",
        "978-626" to "Taiwan",
        "978-627" to "Pakistan",
        "978-628" to "Colombia",
        "978-629" to "Malaysia",
        "978-630" to "Romania",
        "978-631" to "Argentina",
        "978-65" to "Brazil",
        "978-7" to "China, People's Republic",
        "978-80" to "former Czechoslovakia",
        "978-81" to "India",
        "978-82" to "Norway",
        "978-83" to "Poland",
        "978-84" to "Spain",
        "978-85" to "Brazil",
        "978-86" to "former Yugoslavia",
        "978-87" to "Denmark",
        "978-88" to "Italy",
        "978-89" to "Korea, Republic",
        "978-90" to "Netherlands",
        "978-91" to "Sweden",
        "978-92" to "International NGO Publishers and EU Organizations",
        "978-93" to "India",
        "978-94" to "Netherlands",
        "978-950" to "Argentina",
        "978-951" to "Finland",
        "978-952" to "Finland",
        "978-953" to "Croatia",
        "978-954" to "Bulgaria",
        "978-955" to "Sri Lanka",
        "978-956" to "Chile",
        "978-957" to "Taiwan",
        "978-958" to "Colombia",
        "978-959" to "Cuba",
        "978-960" to "Greece",
        "978-961" to "Slovenia",
        "978-962" to "Hong Kong, China",
        "978-963" to "Hungary",
        "978-964" to "Iran",
        "978-965" to "Israel",
        "978-966" to "Ukraine",
        "978-967" to "Malaysia",
        "978-968" to "Mexico",
        "978-969" to "Pakistan",
        "978-970" to "Mexico",
        "978-971" to "Philippines",
        "978-972" to "Portugal",
        "978-973" to "Romania",
        "978-974" to "Thailand",
        "978-975" to "Turkey",
        "978-976" to "Caribbean Community",
        "978-977" to "Egypt",
        "978-978" to "Nigeria",
        "978-979" to "Indonesia",
        "978-980" to "Venezuela",
        "978-981" to "Singapore",
        "978-982" to "South Pacific",
        "978-983" to "Malaysia",
        "978-984" to "Bangladesh",
        "978-985" to "Belarus",
        "978-986" to "Taiwan",
        "978-987" to "Argentina",
        "978-988" to "Hong Kong, China",
        "978-989" to "Portugal",
        "978-9910" to "Uzbekistan",
        "978-9911" to "Montenegro",
        "978-9912" to "Tanzania",
        "978-9913" to "Uganda",
        "978-9914" to "Kenya",
        "978-9915" to "Uruguay",
        "978-9916" to "Es tonia",
        "978-9917" to "Bolivia",
        "978-9918" to "Malta",
        "978-9919" to "Mongolia",
        "978-9920" to "Morocco",
        "978-9921" to "Kuwait",
        "978-9922" to "Iraq",
        "978-9923" to "Jordan",
        "978-9924" to "Cambodia",
        "978-9925" to "Cyprus",
        "978-9926" to "Bosnia and Herzegovina",
        "978-9927" to "Qatar",
        "978-9928" to "Albania",
        "978-9929" to "Guatemala",
        "978-9930" to "Costa Rica",
        "978-9931" to "Algeria",
        "978-9932" to "Lao People's Democratic Republic",
        "978-9933" to "Syria",
        "978-9934" to "Latvia",
        "978-9935" to "Iceland",
        "978-9936" to "Afghanistan",
        "978-9937" to "Nepal",
        "978-9938" to "Tunisia",
        "978-9939" to "Armenia",
        "978-9940" to "Montenegro",
        "978-9941" to "Georgia",
        "978-9942" to "Ecuador",
        "978-9943" to "Uzbekistan",
        "978-9944" to "Turkey",
        "978-9945" to "Dominican Republic",
        "978-9946" to "Korea, P.D.R.",
        "978-9947" to "Algeria",
        "978-9948" to "United Arab Emirates",
        "978-9949" to "Estonia",
        "978-9950" to "Palestine",
        "978-9951" to "Kosova",
        "978-9952" to "Azerbaijan",
        "978-9953" to "Lebanon",
        "978-9954" to "Morocco",
        "978-9955" to "Lithuania",
        "978-9956" to "Cameroon",
        "978-9957" to "Jordan",
        "978-9958" to "Bosnia and Herzegovina",
        "978-9959" to "Libya",
        "978-9960" to "Saudi Arabia",
        "978-9961" to "Algeria",
        "978-9962" to "Panama",
        "978-9963" to "Cyprus",
        "978-9964" to "Ghana",
        "978-9965" to "Kazakhstan",
        "978-9966" to "Kenya",
        "978-9967" to "Kyrgyz Republic",
        "978-9968" to "Costa Rica",
        "978-9969" to "Algeria",
        "978-9970" to "Uganda",
        "978-9971" to "Singapore",
        "978-9972" to "Peru",
        "978-9973" to "Tunisia",
        "978-9974" to "Uruguay",
        "978-9975" to "Moldova",
        "978-9976" to "Tanzania",
        "978-9977" to "Costa Rica",
        "978-9978" to "Ecuador",
        "978-9979" to "Iceland",
        "978-9980" to "Papua New Guinea",
        "978-9981" to "Morocco",
        "978-9982" to "Zambia",
        "978-9983" to "Gambia",
        "978-9984" to "Latvia",
        "978-9985" to "Es tonia",
        "978-9986" to "Lithuania",
        "978-9987" to "Tanzania",
        "978-9988" to "Ghana",
        "978-9989" to "North Macedonia",
        "978-99901" to "Bahrain",
        "978-99902" to "Reserved Agency",
        "978-99903" to "Mauritius",
        "978-99904" to "Curaçao",
        "978-99905" to "Bolivia",
        "978-99906" to "Kuwait",
        "978-99908" to "Malawi",
        "978-99909" to "Malta",
        "978-99910" to "Sierra Leone",
        "978-99911" to "Lesotho",
        "978-99912" to "Botswana",
        "978-99913" to "Andorra",
        "978-99914" to "International NGO Publishers",
        "978-99915" to "Maldives",
        "978-99916" to "Namibia",
        "978-99917" to "Brunei Darussalam",
        "978-99918" to "Faroe Islands",
        "978-99919" to "Benin",
        "978-99920" to "Andorra",
        "978-99921" to "Qatar",
        "978-99922" to "Guatemala",
        "978-99923" to "El Salvador",
        "978-99924" to "Nicaragua",
        "978-99925" to "Paraguay",
        "978-99926" to "Honduras",
        "978-99927" to "Albania",
        "978-99928" to "Georgia",
        "978-99929" to "Mongolia",
        "978-99930" to "Armenia",
        "978-99931" to "Seychelles",
        "978-99932" to "Malta",
        "978-99933" to "Nepal",
        "978-99934" to "Dominican Republic",
        "978-99935" to "Haiti",
        "978-99936" to "Bhutan",
        "978-99937" to "Macau",
        "978-99938" to "Srpska, Republic of",
        "978-99939" to "Guatemala",
        "978-99940" to "Georgia",
        "978-99941" to "Armenia",
        "978-99942" to "Sudan",
        "978-99943" to "Albania",
        "978-99944" to "Ethiopia",
        "978-99945" to "Namibia",
        "978-99946" to "Nepal",
        "978-99947" to "Tajikistan",
        "978-99948" to "Eritrea",
        "978-99949" to "Mauritius",
        "978-99950" to "Cambodia",
        "978-99951" to "Reserved Agency",
        "978-99952" to "Mali",
        "978-99953" to "Paraguay",
        "978-99954" to "Bolivia",
        "978-99955" to "Srpska, Republic of",
        "978-99956" to "Albania",
        "978-99957" to "Malta",
        "978-99958" to "Bahrain",
        "978-99959" to "Luxembourg",
        "978-99960" to "Malawi",
        "978-99961" to "El Salvador",
        "978-99962" to "Mongolia",
        "978-99963" to "Cambodia",
        "978-99964" to "Nicaragua",
        "978-99965" to "Macau",
        "978-99966" to "Kuwait",
        "978-99967" to "Paraguay",
        "978-99968" to "Botswana",
        "978-99969" to "Oman",
        "978-99970" to "Haiti",
        "978-99971" to "Myanmar",
        "978-99972" to "Faroe Islands",
        "978-99973" to "Mongolia",
        "978-99974" to "Bolivia",
        "978-99975" to "Tajikistan",
        "978-99976" to "Srpska, Republic of",
        "978-99977" to "Rwanda",
        "978-99978" to "Mongolia",
        "978-99979" to "Honduras",
        "978-99980" to "Bhutan",
        "978-99981" to "Macau",
        "978-99982" to "Benin",
        "978-99983" to "El Salvador",
        "978-99984" to "Brunei Darussalam",
        "978-99985" to "Tajikistan",
        "978-99986" to "Myanmar",
        "978-99987" to "Luxembourg",
        "978-99988" to "Sudan",
        "978-99989" to "Paraguay",
        "978-99990" to "Ethiopia",
        "978-99992" to "Oman",
        "978-99993" to "Mauritius",
        "979-10" to "France",
        "979-11" to "Korea, Republic",
        "979-12" to "Italy",
        "979-8" to "United States",
    )
}