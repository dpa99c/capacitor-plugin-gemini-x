package uk.co.workingedge.gemini.x

import android.graphics.Bitmap
import android.util.Base64

import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

import org.json.JSONArray
import org.json.JSONObject

import uk.co.workingedge.gemini.x.lib.BlobHistoryPart
import uk.co.workingedge.gemini.x.lib.GeminiX
import uk.co.workingedge.gemini.x.lib.HistoryItem
import uk.co.workingedge.gemini.x.lib.HistoryPart
import uk.co.workingedge.gemini.x.lib.ImageHistoryPart
import uk.co.workingedge.gemini.x.lib.TextHistoryPart

@CapacitorPlugin(name = "GeminiX")
class GeminiXPlugin : Plugin() {
    /*************************************************************************
     * Plugin Methods
     ************************************************************************/

    @PluginMethod
    fun initModel(call: PluginCall) {
        val params = call.getObject("params")

        // Required params
        val modelName = params.getString("modelName")!!
        val apiKey = params.getString("apiKey")!!

        // Optional params
        var temperature: Float? = null
        if (params.has("temperature")) {
            temperature = params.getLong("temperature").toFloat()
        }

        var topK: Int? = null
        if (params.has("topK")) {
            topK = params.getInt("topK")
        }

        var topP: Float?  = null
        if (params.has("topP")) {
            topP = params.getLong("topP").toFloat()
        }

        var maxOutputTokens: Int?  = null
        if (params.has("maxOutputTokens")) {
            maxOutputTokens = params.getInt("maxOutputTokens")
        }

        var stopSequences: List<String>? = null
        if (params.has("stopSequences")) {
            val stopSequenesJSONArray = params.getJSONArray("stopSequences")
            val stopSequencesArray = arrayListOf<String>()
            for (i in 0 until stopSequenesJSONArray.length()) {
                stopSequencesArray.add(stopSequenesJSONArray.getString(i))
            }
            stopSequences = stopSequencesArray.toList()
        }

        val config = mutableMapOf<String, Any>()
        if (temperature != null) {
            config["temperature"] = temperature
        }
        if (topK != null) {
            config["topK"] = topK
        }
        if (topP != null) {
            config["topP"] = topP
        }
        if (maxOutputTokens != null) {
            config["maxOutputTokens"] = maxOutputTokens
        }
        if (stopSequences != null) {
            config["stopSequences"] = stopSequences
        }

        var safetySettings: Map<String, String>? = null
        if (params.has("safetySettings")) {
            val safetySettingsJSONObject = params.getJSONObject("safetySettings")
            val safetySettingsMap = mutableMapOf<String, String>()
            for (key in safetySettingsJSONObject.keys()) {
                safetySettingsMap[key] = safetySettingsJSONObject.getString(key)
            }
            safetySettings = safetySettingsMap.toMap()
        }

        GeminiX.init(modelName, apiKey, config, safetySettings)

        call.resolve()
    }

    @PluginMethod
    fun sendMessage(call: PluginCall) {
        var streamResponse = false
        var imageUris = JSONArray()

        val inputText = call.getString("inputText")!!
        if(call.hasOption("options")){
            val opts = call.getObject("options")
            if(opts.has("streamResponse")){
                streamResponse = opts.getBoolean("streamResponse")
            }
            if(opts.has("imageUris")){
                imageUris = opts.getJSONArray("imageUris")
            }
        }

        val images:List<Bitmap> = GeminiX.getBitmapsForUris(imageUris, this.context)


        GeminiX.sendMessage(
            { response, isFinal ->
                val result = JSObject()
                result.put("response", response)
                result.put("isFinal", isFinal)

                call.setKeepAlive(streamResponse && !isFinal)
                call.resolve(result)
            },
            { error ->
                call.setKeepAlive(streamResponse)
                call.reject(error)
            }, inputText, images, streamResponse)
    }

    @PluginMethod
    fun countTokens(call: PluginCall) {
        var imageUris = JSONArray()

        val inputText = call.getString("inputText")!!
        if(call.hasOption("options")){
            val opts = call.getObject("options")
            if(opts.has("imageUris")){
                imageUris = opts.getJSONArray("imageUris")
            }
        }

        val images:List<Bitmap> = GeminiX.getBitmapsForUris(imageUris, this.context)

        GeminiX.countTokens(
            { response ->
                val result = JSObject()
                result.put("count", response)
                call.resolve(result)
            },
            { error ->
                call.reject(error)
            }, inputText, images)
    }

    @PluginMethod
    fun initChat(call: PluginCall) {
        val history: MutableList<HistoryItem> = mutableListOf()
        if(call.hasOption("history")){
            val jsonHistory = call.getArray("history")
            for (i in 0 until jsonHistory.length()) {
                val item = jsonHistory.getJSONObject(i)
                val isUser = item.getBoolean("isUser")

                val parts = item.getJSONArray("parts")
                val historyParts: MutableList<HistoryPart> = mutableListOf()

                for (j in 0 until parts.length()) {
                    val part = parts.getJSONObject(j)

                    val historyPart:HistoryPart = when (val type = part.getString("type")) {
                        "text" -> {
                            val text = part.getString("content")
                            TextHistoryPart(text)
                        }

                        "image" -> {
                            val uri = part.getString("content")
                            val bitmap = GeminiX.getBitmapFromUri(uri, this.context)
                            ImageHistoryPart(bitmap)
                        }

                        else -> {
                            throw Exception("Unsupported part type: $type")
                        }
                    }
                    historyParts.add(historyPart)
                }
                val historyItem = HistoryItem(historyParts, isUser)
                history.add(historyItem)
            }
        }

        GeminiX.initChat(
            {
                call.resolve()
            },
            { error ->
                call.reject(error)
            }, history)
    }

    @PluginMethod
    fun sendChatMessage(call: PluginCall) {
        var streamResponse = false
        var imageUris = JSONArray()

        val inputText = call.getString("inputText")!!
        if(call.hasOption("options")){
            val opts = call.getObject("options")
            if(opts.has("streamResponse")){
                streamResponse = opts.getBoolean("streamResponse")
            }
            if(opts.has("imageUris")){
                imageUris = opts.getJSONArray("imageUris")
            }
        }

        val images:List<Bitmap> = GeminiX.getBitmapsForUris(imageUris, this.context)


        GeminiX.sendChatMessage(
            { response, isFinal ->
                val result = JSObject()
                result.put("response", response)
                result.put("isFinal", isFinal)

                call.setKeepAlive(streamResponse && !isFinal)
                call.resolve(result)
            },
            { error ->
                call.setKeepAlive(streamResponse)
                call.reject(error)
            }, inputText, images, streamResponse)
    }

    @PluginMethod
    fun countChatTokens(call: PluginCall) {
        var inputText:String? = null
        var imageUris = JSONArray()

        if(call.hasOption("options")){
            val opts = call.getObject("options")
            if(opts.has("imageUris")){
                imageUris = opts.getJSONArray("imageUris")
            }
            if(opts.has("inputText")){
                inputText = opts.getString("inputText")
            }
        }

        val images:List<Bitmap> = GeminiX.getBitmapsForUris(imageUris, this.context)

        GeminiX.countChatTokens(
            { response ->
                val result = JSObject()
                result.put("count", response)
                call.resolve(result)
            },
            { error ->
                call.reject(error)
            }, inputText, images)
    }

    @PluginMethod
    fun getChatHistory(call: PluginCall) {
        GeminiX.getChatHistory(
            { history ->
                val result = JSONArray()
                for (item in history) {
                    val itemJSON = JSONObject()
                    itemJSON.put("isUser", item.isUser)
                    val partsJSON = JSONArray()
                    for (part in item.parts) {
                        val partJSON = JSONObject()
                        when (part) {
                            is TextHistoryPart -> {
                                partJSON.put("type", "text")
                                partJSON.put("content", part.content)
                            }
                            is ImageHistoryPart -> {
                                partJSON.put("type", "image/bitmap")
                                partJSON.put("content", GeminiX.bitmapToBase64(part.content))
                            }
                            is BlobHistoryPart -> {
                                partJSON.put("type", part.mimeType)
                                val contentString = Base64.encodeToString(part.content, Base64.DEFAULT)
                                partJSON.put("content", contentString)
                            }
                        }
                        partsJSON.put(partJSON)
                    }
                    itemJSON.put("parts", partsJSON)
                    result.put(itemJSON)
                }
                call.resolve(JSObject().put("history", result))
            },
            { error ->
                call.reject(error)
            }
        )
    }
}