const AbstractRendererLeaf = require('@zwerm/composite-bs-client/leafs/renderer/AbstractRendererLeaf');
const $ = require('jquery');
const { DateTime } = require('luxon');

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

        $messageArea.prepend(
            $('<div>')
                .addClass('speech-bubble')
                .addClass(fromUser ? 'user' : 'bot')
                .attr('title', timestamp)
                .text(text)
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
        const $group = $('<div>').addClass('card-deck');

        // Add cards to group
        cards.forEach(card => {
            $group.append(
                $('<div>')
                    .addClass('card')
                    .addClass(!fromUser ? 'bg-info text-white' : '')
                    .css('max-width', '18rem')
                    .append(card.imageUrl ? $(`<img src="${card.imageUrl}">`).attr('alt', card.title).addClass('card-img-top') : null)
                    .append(
                        $('<div>')
                            .addClass('card-body')
                            .append(card.title ? $('<h5>').addClass('card-title').text(card.title) : null)
                            .append(card.subtitle ? $('<h6>').addClass('card-subtitle mb-2 text-mute').text(card.subtitle) : null)
                    )
            );
        });

        // prepend the group
        $messageArea
            .prepend($group)
            .hide()
            .fadeIn(100);
    }


    /**
     *
     * @param {string} url
     * @param {boolean} fromUser
     */
    renderImageMessage(url, fromUser) {
        const timestamp = DateTime.local().toISO();
    }

    // endregion
}

module.exports = Renderer;
