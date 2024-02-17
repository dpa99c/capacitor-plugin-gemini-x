package io.ionic.starter;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

import uk.co.workingedge.gemini.x.GeminiXPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(GeminiXPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
