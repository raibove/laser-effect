export class TwitchExtensionManager {
    static STATE_LIST = {
        INIT: 'INIT',
        AUTHENTICATED: 'AUTHENTICATED'
    }

    static instance = null;

    static getInstance() {
        if (!TwitchExtensionManager.instance) {
            TwitchExtensionManager.instance = new TwitchExtensionManager();
        }
        return TwitchExtensionManager.instance;
    }

    constructor() {
        if (TwitchExtensionManager.instance) {
            throw new Error('Use TwitchExtensionManager.getInstance()');
        }

        this.setState(TwitchExtensionManager.STATE_LIST.INIT);
        this.authData = null;
    }

    onAuthorized(callback) {
        if (window.top !== window.self && window.Twitch) {
            window.Twitch.ext.onAuthorized((auth) => {
                this.handleOnAuthorized(auth, callback);
            });
        } else {
            console.error('Run the Overlay Extension on a live twitch channel');
        }
    }

    handleOnAuthorized(auth, callback) {
        this.authData = auth;
        
        if (this.state === TwitchExtensionManager.STATE_LIST.INIT) {
            this.setState(TwitchExtensionManager.STATE_LIST.AUTHENTICATED);
            if (callback) callback();
        } else if (callback) {
            callback();
        }
    }

    getAuthData() {
        return this.authData;
    }

    getState() {
        return this.state;
    }

    setState(newState) {
        this.state = newState;
    }
}