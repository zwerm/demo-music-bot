// Include bootstrap and styling
import 'bootstrap';
import './main.scss';

// Load used feature dependencies
const { EventEmitter } = require('events');
const ZwermChatClient = require('@zwerm/composite-bs-client/CompositeBSClient');
const SessionStorageUserIdLeaf = require('@zwerm/composite-bs-client/leafs/userid/SessionStorageUserIdLeaf');
const ToggleDisabledOnConnectLeaf = require('@zwerm/composite-bs-client/leafs/ToggleDisabledOnConnectLeaf');
const SendInputQueryOnFormSubmitLeaf = require('@zwerm/composite-bs-client/leafs/SendInputQueryOnFormSubmitLeaf');
const ScrollToBottomOnLetterLeaf = require('@zwerm/composite-bs-client/leafs/ScrollToBottomOnLetterLeaf');
const EmitStatusMessageEventsLeaf = require('@zwerm/composite-bs-client/leafs/EmitStatusMessageEventsLeaf');
const AutoReconnectLeaf = require('@zwerm/composite-bs-client/leafs/AutoReconnectLeaf');
const SendEventOnFirstStart = require('./SendEventOnFirstStart');
const SessionStorageArchiverLeaf = require('@zwerm/composite-bs-client/leafs/archiver/SessionStorageArchiverLeaf');
const GroupCards = require('./GroupCards');
const Renderer = require('./Renderer');

// Set up some basic services
const Composer = document.getElementById('composer');
const MessageArea = document.getElementById('messages');
const Emitter = new EventEmitter();
const ConversationStorage = new SessionStorageArchiverLeaf(['render-letter']);

// Build the client
ZwermChatClient
    .newForZwermChat(
        'wss://chat.zwerm.io',
        'acme',
        'music-bot',
        'testing'
    )
    .registerLeaf(new SessionStorageUserIdLeaf())
    .registerLeaf(new ToggleDisabledOnConnectLeaf(Composer.querySelector('input')))
    .registerLeaf(new SendInputQueryOnFormSubmitLeaf(Composer, Composer.querySelector('input')))
    .registerLeaf(new EmitStatusMessageEventsLeaf(Emitter))
    .registerLeaf(new AutoReconnectLeaf(Emitter))
    .registerLeaf(new GroupCards())
    .registerLeaf(new SendEventOnFirstStart(ConversationStorage, 'zwerm.welcome'))
    .registerLeaf(ConversationStorage)
    .registerLeaf(new Renderer(MessageArea, ConversationStorage))
    .connect();
