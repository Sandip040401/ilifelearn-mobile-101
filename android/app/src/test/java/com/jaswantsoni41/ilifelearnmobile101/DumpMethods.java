package com.jaswantsoni41.ilifelearnmobile101;

import org.junit.Test;
import com.google.ar.sceneform.rendering.RenderableInstance;
import java.lang.reflect.Method;

public class DumpMethods {
    @Test
    public void dump() {
        System.out.println("DUMPING METHODS:");
        for (Method m : RenderableInstance.class.getMethods()) {
            System.out.println("METHOD: " + m.getName() + " returns " + m.getReturnType().getName());
        }
    }
}
