const SendEventOnHandshakeLeaf = require('@zwerm/composite-bs-client/leafs/SendEventOnHandshakeLeaf');

/**
 *
 * @extends {SendEventOnHandshakeLeaf}
 */
class SendEventOnFirstStart extends SendEventOnHandshakeLeaf {

    /**
     *
     *
     * @param {AbstractArchiverLeaf} [archiver] optional archiver to restore messages from upon handshaking with the server
     * @param {string} event
     * @param {Object} [payload={}]
     * @param {StaMP.Protocol.Messages.StandardisedEventMessageData|Object} [data={}}
     * @param {boolean} [resendOnReconnect=false] if `true`, then the event will be sent regardless of the if the client has already connected in the past
     */
    constructor(archiver, event, payload, data, resendOnReconnect) {
        super(event, payload, data, resendOnReconnect);

        /**
         *
         * @type {?AbstractArchiverLeaf}
         * @private
         */
        this._archiver = archiver;
    }

    /**
     *
     * @return {?AbstractArchiverLeaf}
     */
    get archiver() {
        return this._archiver;
    }

    /**
     * @inheritDoc
     */
    postHandshake() {
        if (this._archiver.getRequests().length === 0) {
            return super.postHandshake();
        }
    }
}

module.exports = SendEventOnFirstStart;
