package uk.co.workingedge.gemini.x;

import android.util.Log;

public class GeminiXPlugin {

    public String echo(String value) {
        Log.i("Echo", value);
        return value;
    }
}
