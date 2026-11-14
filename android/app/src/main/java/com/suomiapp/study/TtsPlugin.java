package com.suomiapp.study;

import android.speech.tts.TextToSpeech;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/** Finnish speech for the listen exercise: the WebView has no speechSynthesis. */
@CapacitorPlugin(name = "Tts")
public class TtsPlugin extends Plugin {
    private TextToSpeech tts;
    // null until the engine reports back; then whether it can speak Finnish
    private Boolean finnish;
    private final List<PluginCall> waiting = new ArrayList<>();

    @Override
    public void load() {
        tts = new TextToSpeech(getContext(), status -> {
            boolean ok = false;
            if (status == TextToSpeech.SUCCESS) {
                Locale fi = new Locale("fi", "FI");
                if (tts.isLanguageAvailable(fi) >= TextToSpeech.LANG_AVAILABLE) {
                    ok = tts.setLanguage(fi) >= TextToSpeech.LANG_AVAILABLE;
                    tts.setSpeechRate(0.9f);
                }
            }
            synchronized (waiting) {
                finnish = ok;
                for (PluginCall call : waiting) answer(call);
                waiting.clear();
            }
        });
    }

    private void answer(PluginCall call) {
        JSObject result = new JSObject();
        result.put("value", finnish);
        call.resolve(result);
    }

    @PluginMethod
    public void available(PluginCall call) {
        synchronized (waiting) {
            // the engine starts asynchronously, so an early call waits for it
            if (finnish == null) waiting.add(call);
            else answer(call);
        }
    }

    @PluginMethod
    public void speak(PluginCall call) {
        tts.speak(call.getString("text", ""), TextToSpeech.QUEUE_FLUSH, null, "suomi");
        call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        tts.stop();
        call.resolve();
    }

    @Override
    protected void handleOnDestroy() {
        tts.shutdown();
    }
}
