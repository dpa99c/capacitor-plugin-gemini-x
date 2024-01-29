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
import uk.co.workingedge.gemini.x.lib.Image
import uk.co.workingedge.gemini.x.lib.ImageHistoryPart
import uk.co.workingedge.gemini.x.lib.TextHistoryPart

@CapacitorPlugin(name = "GeminiX")
class GeminiXPlugin : Plugin() {
    private val GeminiXResponseChunkEvent = "GeminiXResponseChunk"
    /*************************************************************************
     * Plugin Methods
     ************************************************************************/

    @PluginMethod
    fun initModel(call: PluginCall) {
        try {
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
        } catch (e: Exception) {
            call.reject(e.message)
        }
    }

    @PluginMethod
    fun sendMessage(call: PluginCall) {
        try {
            var streamResponse = false
            var images = JSONArray()

            val inputText = call.getString("inputText")!!
            if(call.hasOption("options")){
                val opts = call.getObject("options")
                if(opts.has("streamResponse")){
                    streamResponse = opts.getBoolean("streamResponse")
                }
                if(opts.has("images")){
                    images = opts.getJSONArray("images")
                }
            }

            val modelImages:List<Image> = GeminiX.getModelImages(images, this.context)

            GeminiX.sendMessage(
                { response, isComplete ->
                    val result = JSObject()
                    result.put("response", response)
                    if(isComplete){
                        call.resolve(result)
                    }else{
                        result.put("isChat", false)
                        bridge.triggerWindowJSEvent(GeminiXResponseChunkEvent, result.toString())
                    }
                },
                { error ->
                    call.reject(error)
                }, inputText, modelImages, streamResponse)
        } catch (e: Exception) {
            call.reject(e.message)
        }
    }

    @PluginMethod
    fun countTokens(call: PluginCall) {
        try {
            var images = JSONArray()

            val inputText = call.getString("inputText")!!
            if(call.hasOption("options")){
                val opts = call.getObject("options")
                if(opts.has("images")){
                    images = opts.getJSONArray("images")
                }
            }

            val modelImages:List<Image> = GeminiX.getModelImages(images, this.context)

            GeminiX.countTokens(
                { response ->
                    val result = JSObject()
                    result.put("count", response)
                    result.put("isChat", false)
                    call.resolve(result)
                },
                { error ->
                    call.reject(error)
                }, inputText, modelImages)
        } catch (e: Exception) {
            call.reject(e.message)
        }
    }

    @PluginMethod
    fun initChat(call: PluginCall) {
        try {
            val history: MutableList<HistoryItem> = mutableListOf()
            if(call.hasOption("chatHistory")){
                val jsonHistory = call.getArray("chatHistory")
                for (i in 0 until jsonHistory.length()) {
                    val item = jsonHistory.getJSONObject(i)
                    val isUser = item.getBoolean("isUser")

                    val historyParts: MutableList<HistoryPart> = mutableListOf()

                    if(item.has("text")){
                        val text = item.getString("text");
                        val historyPart:HistoryPart = TextHistoryPart(text)
                        historyParts.add(historyPart)
                    }

                    if(item.has("images")){
                        val images = item.getJSONArray("images")
                        for (j in 0 until images.length()) {
                            val image = images.getJSONObject(j)
                            val uri = image.getString("uri")
                            val bitmap = GeminiX.getBitmapFromUri(uri, this.context)
                            var historyPart:HistoryPart?
                            if(image.has("mimeType")){
                                val mimeType = image.getString("mimeType")
                                val blob = GeminiX.bitmapToByteArray(bitmap)
                                historyPart = BlobHistoryPart(blob, mimeType)
                            }else{
                                historyPart = ImageHistoryPart(bitmap)
                            }
                            historyParts.add(historyPart)
                        }
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
        } catch (e: Exception) {
            call.reject(e.message)
        }
    }

    @PluginMethod
    fun sendChatMessage(call: PluginCall) {
        try {
            var streamResponse = false
            var images = JSONArray()

            val inputText = call.getString("inputText")!!
            if(call.hasOption("options")){
                val opts = call.getObject("options")
                if(opts.has("streamResponse")){
                    streamResponse = opts.getBoolean("streamResponse")
                }
                if(opts.has("images")){
                    images = opts.getJSONArray("images")
                }
            }

            val modelImages:List<Image> = GeminiX.getModelImages(images, this.context)


            GeminiX.sendChatMessage(
                { response, isComplete ->
                    val result = JSObject()
                    result.put("response", response)
                    if(isComplete){
                        call.resolve(result)
                    }else{
                        result.put("isChat", true)
                        bridge.triggerWindowJSEvent(GeminiXResponseChunkEvent, result.toString())
                    }
                },
                { error ->
                    call.reject(error)
                }, inputText, modelImages, streamResponse)
        } catch (e: Exception) {
            call.reject(e.message)
        }
    }

    @PluginMethod
    fun countChatTokens(call: PluginCall) {
        try {
            var inputText:String? = null
            var images = JSONArray()

            if(call.hasOption("options")){
                val opts = call.getObject("options")
                if(opts.has("images")){
                    images = opts.getJSONArray("images")
                }
                if(opts.has("inputText")){
                    inputText = opts.getString("inputText")
                }
            }

            val modelImages:List<Image> = GeminiX.getModelImages(images, this.context)

            GeminiX.countChatTokens(
                { response ->
                    val result = JSObject()
                    result.put("count", response)
                    result.put("isChat", true)
                    call.resolve(result)
                },
                { error ->
                    call.reject(error)
                }, inputText, modelImages)
        } catch (e: Exception) {
            call.reject(e.message)
        }
    }

    @PluginMethod
    fun getChatHistory(call: PluginCall) {
        try {
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
        } catch (e: Exception) {
            call.reject(e.message)
        }
    }
}