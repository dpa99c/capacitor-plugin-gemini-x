<script setup lang="ts">
import {onMounted, Ref, ref} from "vue";
import {IonButton, IonContent, IonHeader, IonPage, IonSelect, IonSelectOption, IonTitle, IonToolbar, IonInput, loadingController, IonToggle} from '@ionic/vue';
import {Capacitor} from "@capacitor/core";
import { FilePicker } from '@capawesome/capacitor-file-picker';

import {GeminiX, ModelParams, SafetySettingHarmCategory, SafetySettingLevel, SafetySettings, PluginSendMessageOptions, PluginCountTokensOptions, PluginChatHistoryItem, PluginCountChatTokensOptions, GeminiXResponseChunk, GeminiXResponseChunkEvent, GeminiXImage} from "capacitor-plugin-gemini-x";

import config from "@/config";

const MAX_MODEL_RESPONSE_TIME_MS = 10000;

const modelName = ref('gemini-pro');
const userInput = ref('');
const streamResponse = ref(false);
const images:any = ref([]);
const chatHistory:Ref<PluginChatHistoryItem[]> = ref([]);

let loader:any = null;
let loadTimerId:any = null;
let streamingGuid:any = null;


const init = () => {
  // Listen for GeminiX response chunks
  window.addEventListener(GeminiXResponseChunkEvent, onGeminiXResponseChunk);
}

const onGeminiXResponseChunk = (event:any) => {
  const data:GeminiXResponseChunk = event.detail;
  const convoEl = getConversationOutputElement(streamingGuid);
  if(convoEl){
    convoEl.innerHTML += parseModelMessage(data.response);
  }
}


const onPressInitModel = async () => {
  try {
    const safetySettings: SafetySettings = {
      [SafetySettingHarmCategory.DANGEROUS_CONTENT]: SafetySettingLevel.ONLY_HIGH
    }

    const modelParams: ModelParams = {
      modelName: modelName.value,
      apiKey: config.GEMINI_API_KEY,
      safetySettings: safetySettings,
      ...config.generativeConfig
    }

    await GeminiX.initModel({params: modelParams});
    log(`Model ${modelName.value} initialized`);
  } catch (e) {
    logError(e, 'initModel');
  }
}

const onPressSendMessage = async () => {
  if(!userInput.value){
    logError('Please enter a message', 'sendMessage');
    return;
  }

  log(`You: ${userInput.value}`);

  const options:PluginSendMessageOptions = {};

  if(streamResponse.value){
    options.streamResponse = true;
    streamingGuid = prependToConversation(`${modelName.value} response: `, 'stream');
  }

  if(images.value.length > 0){
    options.images = images.value.map((image:any) => image.image);
  }

  await showLoader();

  try {
    const result = await GeminiX.sendMessage({inputText: userInput.value, options});

    if(streamingGuid){
      const convoEl = getConversationOutputElement(streamingGuid);
      if(convoEl) convoEl.classList.remove('stream');
    }else{
      log(`${modelName.value} response: ${result.response}`);
    }

    await hideLoader();
    userInput.value = '';
    images.value = [];
    streamingGuid = null;
  } catch (e) {
    if(streamingGuid){
      const convoEl = getConversationOutputElement(streamingGuid);
      if(convoEl){
        convoEl.remove();
      }
      streamingGuid = null;
    }
    await hideLoader();
    logError(e, 'sendMessage');
  }
}

const onPressCountTokens = async () => {
  if(!userInput.value){
    logError('Please enter a message', 'countTokens');
    return;
  }

  const options:PluginCountTokensOptions = {};

  if(images.value.length > 0){
    options.images = images.value.map((image:any) => image.image);
  }

  await showLoader();

  try {
    const result = await GeminiX.countTokens({inputText: userInput.value, options});
    log(`${modelName.value} token count: ${result.count}`);

    await hideLoader();
  } catch (e) {
    await hideLoader();
    logError(e, 'countTokens');
  }
}


const onPressClearConversation = () => {
  const conversationOutput = getConversationOutputContainer();
  if(conversationOutput){
    conversationOutput.innerHTML = '';
  }
}

const onPressClear = () => {
  userInput.value = '';
  images.value = [];
  chatHistory.value = [];
}

const showLoader = async () => {
  if(loader) await hideLoader();
  loader = await loadingController.create({
    message: 'Waiting for model...',
    duration: MAX_MODEL_RESPONSE_TIME_MS,
  });
  await loader.present();
  loadTimerId = setTimeout(onModelResponseTimeout, MAX_MODEL_RESPONSE_TIME_MS);
}

const onModelResponseTimeout = async () => {
  await hideLoader();
  logError('Timed out awaiting response', modelName.value);
}

const hideLoader = async () => {
  if(loader){
    await loader.dismiss();
    loader = null;
  }
  if(loadTimerId){
    clearTimeout(loadTimerId);
    loadTimerId = null;
  }
}

const log = (message: string) => {
  return prependToConversation(message);
}
const logError = (error: any, description: string) => {
  return prependToConversation(`${description}: ${error}`, 'error');
}

function prependToConversation(message:string, className?:string){
  message = parseModelMessage(message);
  const guid = generateUID();
  const conversationOutput = getConversationOutputContainer();
  const convoEl = '<span id="'+guid+'" class="'+(className || '')+'">&gt;&nbsp;<span class="message">' +message + '</span></span>' + "<br/><br/>";
  conversationOutput.innerHTML = convoEl + conversationOutput.innerHTML;
  return guid;
}

const parseModelMessage = (message:string) => {
  return message.replace(/\n/g, "<br/>");
}

const getConversationOutputContainer = () => {
  return document.getElementById('conversation-output') as HTMLElement;
}
const getConversationOutputElement = (guid:string) => {
  return document.getElementById(guid);
}

const generateUID = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

const onPressChooseImage = async () => {
  try {
    const result = await FilePicker.pickImages({
      multiple: true,
    });
    for(let i=0; i<result.files.length; i++) {
      const file = result.files[i];
      const name = file.name;
      const uri = file.path || fileToUri(file.blob as File);
      addImage(name, {uri, mimeType: file.mimeType});
    }
  } catch (e) {
    logError(e, 'pickImages');
  }
}

const fileToUri = (file: File): string => {
  return URL.createObjectURL(file);
}

const addImage = (name:string, image: GeminiXImage) => {
  images.value.push({name, image});
  log(`Added image: ${name}`);
}

const onPressRemoveImage = (index:number) => {
  images.value.splice(index, 1);
}

const addHistory = (isUser:boolean) => {
  if(!userInput.value){
    logError('Please enter a message', 'addHistory');
    return;
  }

  const item:PluginChatHistoryItem = {
    isUser
  }

  item.text = userInput.value;

  if(images.value.length > 0){
    item.images = images.value.map((image:any) => image.image);
  }

  chatHistory.value.push(item);

  let message = `Added to ${isUser ? 'user' : 'model'} chat history with text "${item.text}"`;
  if(images.value.length > 0) message += ` and ${images.value.length} image(s)`;
  log(message);

  userInput.value = '';
  images.value = [];
}

const initChat = async () => {
  try{
    await GeminiX.initChat({chatHistory: chatHistory.value});
    log(`${modelName.value}: Chat initialized with ${chatHistory.value.length} items`);
  }catch (e) {
    logError(e, 'initChat');
  }
}

const onPressSendChatMessage = async () => {
  if(!userInput.value){
    logError('Please enter a message', 'sendChatMessage');
    return;
  }

  log(`You: ${userInput.value}`);

  const options:PluginSendMessageOptions = {};

  let streamingGuid:any = null;
  if(streamResponse.value){
    options.streamResponse = true;
    streamingGuid = prependToConversation(`${modelName.value} chat response: `, 'stream');
  }

  if(images.value.length > 0){
    options.images = images.value.map((image:any) => image.image);
  }

  await showLoader();

  try {
    const result = await GeminiX.sendChatMessage({inputText: userInput.value, options});

    if(streamingGuid){
      const convoEl = getConversationOutputElement(streamingGuid);
      if(convoEl) convoEl.classList.remove('stream');
    }else{
      log(`${modelName.value} chat response: ${result.response}`);
    }

    await hideLoader();
    userInput.value = '';
    images.value = [];
    streamingGuid = null;
  } catch (e) {
    if(streamingGuid){
      const convoEl = getConversationOutputElement(streamingGuid);
      if(convoEl){
        convoEl.remove();
      }
      streamingGuid = null;
    }
    await hideLoader();
    logError(e, 'sendChatMessage');
  }
}

const onPressCountChatTokens = async () => {
  const options:PluginCountChatTokensOptions = {};

  if(userInput.value){
    options.inputText = userInput.value;
  }

  if(images.value.length > 0){
    options.images = images.value.map((image:any) => image.image);
  }

  await showLoader();

  try {
    const result = await GeminiX.countChatTokens({options});
    log(`${modelName.value} chat token count: ${result.count}`);

    await hideLoader();
  } catch (e) {
    await hideLoader();
    logError(e, 'countChatTokens');
  }
}

const onPressGetChatHistory = async () => {
  try {
    const chatHistory = await GeminiX.getChatHistory();
    if(chatHistory.length > 0){
      log(`${modelName.value} chat history ^^^`);
      for(let i=0; i<chatHistory.length; i++){
        const item = chatHistory[i];
        let message = `${item.isUser ? 'You' : modelName.value}: `;
        const parts = item.parts;
        let imageCount = 0;
        if(parts && parts.length > 0) {
          for (let j = 0; j < parts.length; j++) {
            const part = parts[j];
            if (part.type === 'text') {
              message += part.content;
            } else {
              imageCount++;
            }
          }
        }
        if(imageCount > 0){
          message += ` (${imageCount} image${imageCount > 1 ? 's' : ''})`;
        }
        log(message);
      }
      log(`Total history items: ${chatHistory.length}`)
    }else{
      log(`${modelName.value} chat history is empty`);
    }
  } catch (e) {
    logError(e, 'getChatHistory');
  }
}

onMounted(() => {
  init();
});

</script>

<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Capacitor GeminiX Example</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="section">
        <h2>Conversation</h2>
        <ion-button @click="onPressClearConversation()" size="small">Clear</ion-button>
        <hr/>
        <div id="conversation-output"></div>
      </div>

      <div class="section">
        <h2>Model</h2>

        <ion-select id="modelName" v-model="modelName" fill="solid" :style="{marginBottom: '1em'}">
          <ion-select-option value="gemini-pro" selected="selected">Pro</ion-select-option>
          <ion-select-option value="gemini-pro-vision">Pro Vision</ion-select-option>
        </ion-select>

        <ion-button @click="onPressInitModel()" size="small">Init Model</ion-button>
      </div>

      <div class="section">
        <h2>Input</h2>
        <ion-input id="input" v-model="userInput" placeholder="Enter text to send to model" fill="outline" :style="{marginBottom: '1em'}"></ion-input>
        <div id="images" v-if="images.length > 0" :style="{marginBottom: '1em'}">
          <h3>Images</h3>
          <div id="image-container">
            <span class="image" v-for="(image, index) in images" :key="index" :style="{marginBottom: '1em'}"
                  data-uri="image.uri" @click="onPressRemoveImage(index)"
            >
              {{ image.name }}
            </span>
          </div>
        </div>

        <ion-button @click="onPressClear()" size="small">Clear</ion-button>
        <ion-button @click="onPressChooseImage()" size="small">Add image(s)</ion-button>
        <ion-button @click="onPressSendMessage()" size="small">Send message</ion-button>
        <ion-button @click="onPressCountTokens()" size="small">Count tokens</ion-button>
        <hr/>
        <ion-button @click="addHistory(true)" size="small">Add to user chat history</ion-button>
        <ion-button @click="addHistory(false)" size="small">Add to model chat history</ion-button>
        <ion-button @click="initChat()" size="small">Init chat</ion-button>
        <ion-button @click="onPressSendChatMessage()" size="small">Send chat message</ion-button>
        <ion-button @click="onPressCountChatTokens()" size="small">Count chat tokens</ion-button>
        <ion-button @click="onPressGetChatHistory()" size="small">Get chat history</ion-button>

        <div :style="{margin: '1em 0', padding: '0.5em', border: '1px solid var(--ion-color-primary)'}">
          <ion-toggle v-model="streamResponse" justify="space-between" :style="{width: '100%'}">Stream response</ion-toggle>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>


<style scoped>
h2 {
  font-size: 1.2em;
}

h3{
  font-size: 1em;
  font-weight: bold;
}

.section {
  border-bottom: 1px solid #ccc;
  padding: 0 8px 8px 8px;
  margin-bottom: 8px;
}

#images{
  border: 1px solid var(--ion-color-primary);
  padding: 0.5em;
}

#images h3{
  margin: 0;
}

#image-container .image{
  display: inline-block;
  margin: 8px 4px;
  padding: 4px;
  background: aquamarine;
}

#image-container .image:first-child{
  margin-left: 0;
}

#conversation-output{
  white-space: normal;
  word-wrap: break-word;
  background: #eeeeee;
  padding: 1em;
}


</style>

<style>
#conversation-output span{
  line-height: 20px;
  padding: 4px;
}

#conversation-output .error{
  color: red;
}

#conversation-output .stream{
  color: #ccc;
}

</style>
