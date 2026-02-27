import java.io.File
import java.net.URLClassLoader

fun main() {
    val dir = File("""C:\Users\MSI\.gradle\caches\transforms-3""")
    val jars =
            dir.walkBottomUp()
                    .filter {
                        it.name == "classes.jar" && it.absolutePath.contains("sceneform-1.23.0")
                    }
                    .toList()
    if (jars.isEmpty()) {
        println("Jar not found")
        return
    }
    val jarFile = jars.first()
    println("Found jar: ${jarFile.absolutePath}")
    val cl = URLClassLoader(arrayOf(jarFile.toURI().toURL()))
    val clazz = cl.loadClass("com.google.ar.sceneform.animation.ModelAnimator")
    clazz.methods.forEach { println("METHOD: " + it.name) }
}
