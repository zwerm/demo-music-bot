// Include bootstrap and styling
import 'bootstrap';
import './main.scss';

// Load used feature dependencies
const { EventEmitter } = require('events');
const ZwermChatClient = require('@zwerm/composite-bs-client/CompositeBSClient');
const CookieUserIdLeaf = require('@zwerm/composite-bs-client/leafs/userid/CookieUserIdLeaf');
const ToggleDisabledOnConnectLeaf = require('@zwerm/composite-bs-client/leafs/ToggleDisabledOnConnectLeaf');
const SendInputQueryOnFormSubmitLeaf = require('@zwerm/composite-bs-client/leafs/SendInputQueryOnFormSubmitLeaf');
const ScrollToBottomOnLetterLeaf = require('@zwerm/composite-bs-client/leafs/ScrollToBottomOnLetterLeaf');
const EmitStatusMessageEventsLeaf = require('@zwerm/composite-bs-client/leafs/EmitStatusMessageEventsLeaf');
const AutoReconnectLeaf = require('@zwerm/composite-bs-client/leafs/AutoReconnectLeaf');
const SendEventOnHandshakeLeaf = require('@zwerm/composite-bs-client/leafs/SendEventOnHandshakeLeaf');
const Renderer = require('./Renderer');

// Set up some basic services
const Composer = document.getElementById('composer');
const MessageArea = document.getElementById('messages');
const Emitter = new EventEmitter();

// Build the client
ZwermChatClient
    .newForZwermChat(
        'wss://chat.zwerm.io',
        'acme',
        'music-bot',
        'testing'
    )
    .registerLeaf(new CookieUserIdLeaf())
    .registerLeaf(new ToggleDisabledOnConnectLeaf(Composer.querySelector('input')))
    .registerLeaf(new SendInputQueryOnFormSubmitLeaf(Composer, Composer.querySelector('input')))
    .registerLeaf(new ScrollToBottomOnLetterLeaf(MessageArea))
    .registerLeaf(new EmitStatusMessageEventsLeaf(Emitter))
    .registerLeaf(new AutoReconnectLeaf(Emitter))
    .registerLeaf(new SendEventOnHandshakeLeaf('zwerm.welcome'))
    .registerLeaf(new Renderer(MessageArea, DateTime))
    .connect();
