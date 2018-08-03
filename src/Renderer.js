const AbstractRendererLeaf = require('@zwerm/composite-bs-client/leafs/renderer/AbstractRendererLeaf');
const $ = require('jquery');
const { DateTime } = require('luxon');
const linkifyString = require('linkifyjs/string');

/**
 * A simple message renderer.
 */
class Renderer extends AbstractRendererLeaf {
    /**
     *
     * @param {HTMLElement} messageArea
     * @param {?AbstractArchiverLeaf} [archiver=null] optional archiver to restore messages from upon handshaking with the server
     */
    constructor(messageArea, archiver = null) {
        super(archiver);

        /**
         *
         * @type {HTMLElement}
         * @private
         */
        this._messageArea = messageArea;
    }

    /**
     *
     * @return {HTMLElement}
     */
    get messageArea() {
        return this._messageArea;
    }

    /**
     * @inheritDoc
     *
     * @param {BotSocket.Protocol.Messages.RenderLetterData} renderLetterData
     * @protected
     * @override
     */
    processRenderLetterRequest(renderLetterData) {
        renderLetterData.letter.forEach(message => this.renderMessage(message, (message.from || 'server').startsWith('user')));
        this._scrollToPosition(this.messageArea.querySelector('.conversation').scrollHeight);
    }

    /**
     * @inheritDoc
     */
    postHandshake() {
        super.postHandshake();
        this._scrollToPosition(this.messageArea.querySelector('.conversation').scrollHeight, 'instant');
    }

// region message rendering
    /**
     *
     * @param {StaMP.Protocol.Messages.StaMPMessage} message
     * @param {boolean} fromUser
     */
    renderMessage(message, fromUser) {
        switch (message.type) {
            case 'typing':
                this.renderTypingMessage((/** @type {StaMP.Protocol.TypingMessage}*/ message).state, fromUser);
                break;
            case 'quick_reply':
            case 'text':
                this.renderTextMessage((/** @type {StaMP.Protocol.TextMessage}*/ message).text, fromUser);
                break;
            case 'card_group':
                this.renderCardGroup((/** @type {{cards: Array<StaMP.Protocol.CardMessage>}}*/ message).cards, fromUser);
                break;
            case 'card':
                this.renderCardGroup((/** @type {Array<StaMP.Protocol.CardMessage>}*/ [message]), fromUser);
                break;
            case 'image':
                this.renderImageMessage((/** @type {StaMP.Protocol.ImageMessage}*/ message).url, fromUser);
                break;
        }
    };

    // region render message types
    /**
     *
     * @param {StaMP.Protocol.Messages.TypingState} state
     * @param {boolean} fromUser
     */
    renderTypingMessage(state, fromUser) {
        const typingClass = 'typing';

        /** @type {jQuery|JQuery} */
        const $messageArea = $(this.messageArea);

        if (!fromUser && state === 'on' && !$messageArea.hasClass(typingClass)) {
            $messageArea.addClass(typingClass);
        }

        if (state === 'off') {
            $messageArea.one('animationiteration webkitAnimationIteration', function () {
                $(this).removeClass(typingClass);
            });
        }
    };

    /**
     *
     * @param {string} text
     * @param {boolean} fromUser
     */
    renderTextMessage(text, fromUser) {
        /** @type {jQuery|JQuery} */
        const $messageArea = $(this.messageArea).find('.conversation').first();
        const timestamp = DateTime.local().toISO();

        $messageArea.append($('<div>')
            .addClass('message')
            .addClass(fromUser ? 'user' : 'bot')
            .append($('<div>')
                .addClass('speech-bubble')
                .attr('title', timestamp)
                .html(linkifyString(text, { defaultProtocol: 'https' }))
            )
            .hide()
            .fadeIn(100)
        );
    };

    /**
     *
     * @param {Array<StaMP.Protocol.CardMessage>} cards
     * @param {boolean} fromUser
     */
    renderCardGroup(cards, fromUser) {
        /** @type {jQuery|JQuery} */
        const $messageArea = $(this.messageArea).find('.conversation').first();

        /** @type {jQuery|JQuery} */
        const $group = $('<div>').addClass('message cards');

        // Add cards to group
        cards.forEach(card => {
                $group.append($('<div>')
                    .addClass('card-wrap')
                    .append($('<div>')
                        .addClass('card')
                        .addClass(!fromUser ? 'bg-info text-white' : '')
                        .append($(`<img src="${card.imageUrl ? card.imageUrl : 'https://placehold.it/500x500.jpg'}">`)
                            .attr('alt', card.title)
                            .addClass('card-img-top')
                        )
                        .append($('<div>')
                            .addClass('card-body')
                            .append(card.title ? $('<h5>').addClass('card-title').text(card.title) : null)
                            .append(card.subtitle ? $('<h6>').addClass('card-subtitle mb-2 text-mute').text(card.subtitle) : null)
                            .append(card.buttons.map(button => {
                                return $('<a>')
                                    .addClass('btn btn-sm btn-outline-light')
                                    .attr('href', '#')
                                    .text(button.text)
                                    .on('click', () => {
                                        this.bsClient.sendQuery(button.value, button.text);
                                    })
                            }))
                        )
                    )
                );
            }
        );

        // prepend the group
        $messageArea
            .append($group
                .hide()
                .fadeIn(100)
            );
    }


    /**
     *
     * @param {string} url
     * @param {boolean} fromUser
     */
    renderImageMessage(url, fromUser) {
        this.renderTextMessage(url, fromUser);
    }

    // endregion

    /**
     * Scrolls this `Leaf`s `scrollElement` to the given `position`.
     *
     * @param {number} position the position in pixels to scroll the elements top to.
     * @param {'auto'|'instant'|'smooth'} behaviour the scroll behaviour.
     *
     * @protected
     */
    _scrollToPosition(position, behaviour = 'smooth') {
        this.messageArea.querySelector('.conversation').scrollTo({
            top: position,
            behavior: behaviour
        });
    }
}

module.exports = Renderer;
