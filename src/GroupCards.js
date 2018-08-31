const BSClientLeaf = require('@zwerm/composite-bs-client/leafs/BSClientLeaf');

/**
 *
 */
class GroupCards extends BSClientLeaf {

    /**
     * Processes a received `render-letter` BotSocket request message.
     * This groups cards into a card group for easier rendering.
     *
     * @param {BotSocket.Protocol.Messages.RenderLetterData} renderLetterData
     */
    processRenderLetterRequest(renderLetterData) {
        renderLetterData.letter = renderLetterData.letter.reduce((letter, /**StaMP.Protocol.Messages.StaMPMessage */message) => {
            // don't group regular messages
            if ('card' !== message.type) {
                letter.push(message);

                return letter;
            }

            // group already started
            const group = letter[letter.length - 1];
            if (group && 'card_group' === group.type && group.from === group.from) {
                (/** @type {{cards: Array<StaMP.Protocol.Messages.StaMPMessage>}} */group).cards.push(message);

                return letter;
            }

            // add a new card carousel
            letter.push({
                $StaMP: 'StaMP',
                from: message.from,
                type: 'card_group',
                cards: [message]
            });

            return letter;
        }, []);
    }
}

module.exports = GroupCards;
