const BSClientLeaf = require('@zwerm/composite-bs-client/leafs/BSClientLeaf');
const $ = require('jquery');
const { DateTime } = require('luxon');

/**
 * A simple message renderer.
 */
class Renderer extends BSClientLeaf {
    /**
     *
     * @param {HTMLElement} messageArea
     */
    constructor(messageArea) {
        super();

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
                this.renderCardMessage((/** @type {StaMP.Protocol.CardMessage}*/ message), fromUser);
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
            $('<div class="speech-bubble">')
                .addClass('speech-bubble')
                .addClass(fromUser ? 'user' : 'bot')
                .text(text)
                .hide()
                .fadeIn(100)
        );
    };

    /**
     *
     * @param {StaMP.Protocol.CardMessage} card
     * @param {boolean} fromUser
     */
    renderCardMessage(card, fromUser) {
        /** @type {jQuery|JQuery} */
        const $chatArea = $(this._messageArea);

        if (!$chatArea.children(':last').hasClass('card-message')) {
            const id = `${Date.now()}`;

            $chatArea
                .append(
                    $('<div>')
                        .attr('id', id)
                        .addClass(`${senderClassification}-message`)
                        .addClass(`chat-message`)
                        .addClass(`card-message`)
                        .addClass('carousel')
                        .addClass('slide')
                        .append($('<div>').addClass('carousel-inner'))
                        .append(this.createCarouselControl(id, 'left', 'prev'))
                        .append(this.createCarouselControl(id, 'right', 'next'))
                        .hide()
                        .fadeIn(250)
                );

            $(`#${id}`).carousel({ interval: false });
        }

        /** @type {jQuery|JQuery} */
        const $carouselInner = $chatArea.children(':last').children('.carousel-inner');

        $carouselInner.append(this.createCard({
            title: card.title,
            subtitle: card.subtitle,
            imageUrl: card.imageUrl,
            buttons: card.buttons,
            clickUrl: card.clickUrl
        }, $carouselInner.children().length === 0));

        $chatArea
            .children(':last')
            .children('.carousel-control-prev, .carousel-control-next')
            .toggleClass('invisible', $carouselInner.children().length === 1);
    }

    /**
     *
     * @param {string} url
     * @param {boolean} fromUser
     */
    renderImageMessage(url, fromUser) {
        const timestamp = DateTime.local().toISO();

        $(this._messageArea)
            .append(
                $('<div>')
                    .addClass(`${senderClassification}-message`)
                    .addClass(`chat-message`)
                    .addClass('image-message')
                    .attr('title', `${senderClassification === 'user' ? 'sent' : 'received'} at ${timestamp}`)
                    .data({ from: senderClassification, timestamp })
                    .append(
                        $(`<img src="${url}">`)
                            .attr('src', url)
                    )
                    .hide()
                    .fadeIn(250)
            );
    }

    // endregion
    // region card messages
    /**
     *
     * @param {{title: string, subtitle: string, imageUrl: string, buttons: [], clickUrl: string}} card
     * @param {boolean} [active=false]
     *
     * @return {jQuery|JQuery}
     */
    createCard(card, active = false) {
        const $title = card.title
            ? $('<h4>')
                .addClass('title')
                .text(card.title)
            : null;

        const $subtitle = card.subtitle
            ? $('<h6>')
                .addClass('subtitle')
                .text(card.subtitle)
            : null;

        const $img = card.imageUrl
            ? $('<div>')
                .addClass('image')
                .css('height', '200px')
                .css('background-image', `url(${card.imageUrl})`)
                .css('background-size', 'cover')
                .css('background-repeat', 'no-repeat')
                .css('background-position', `50% 50%`)
            : null;

        const $buttons = card.buttons
            ? card.buttons.map(/** LexRuntime.Button */button =>
                $('<button>')
                    .addClass('w-100')
                    .addClass('btn')
                    .addClass('btn-secondary')
                    .addClass('card-button')
                    .text(button.text)
                    .data({ value: button.value })
            ) : null;

        const $buttonGroup = card.buttons
            ? $('<div>')
                .addClass('btn-group')
                .addClass('w-100')
                .append($buttons)
                .on('click', '.card-button', clicked => this.bsClient.sendQuery($(clicked.target).data('value'), $(clicked.target).text()))
            : null;

        return $('<div>')
            .addClass('carousel-item')
            .addClass('chat-card')
            .addClass(active ? 'active' : '')
            .append(
                $('<a>')
                    .addClass('card-link')
                    .attr('target', '_blank')
                    .attr('href', card.clickUrl || null)
                    .append($img)
                    .append($title)
                    .append($subtitle)
            )
            .append($buttonGroup);
    };

    /**
     *
     * @param {string} target
     * @param {'left'|'right'|string} direction
     * @param {'prev'|'next'} slide
     *
     * @returns {jQuery|JQuery}
     */
    createCarouselControl(target, direction, slide) {
        return $('<div>')
            .addClass(direction)
            .addClass(`carousel-control-${slide}`)
            .attr('role', 'button')
            .data({ slide })
            .append(
                $('<span>')
                    .addClass(`carousel-control-${slide}-icon`)
            )
            .append(
                $('<span>')
                    .addClass('sr-only')
                    .text(slide)
            )
            .on('click', () => $(`#${target}`).carousel(slide));
    };

    // endregion
}

module.exports = Renderer;
