declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;
declare const g_replayFrom;
declare const g_archive_mode;

const ZOOM_LEVELS = [0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1]

const BOARD_WIDTH = 2000;
const ANIMATION_MS = 800;
const TOOLTIP_DELAY = document.body.classList.contains('touch-device') ? 1500 : undefined;
const LOCAL_STORAGE_ZOOM_KEY = 'gamename-zoom';

class Gamename implements Game {

    instantaneousMode: boolean;
    notifqueue: {};

    public gamedatas: GameData;

    constructor() {

    }

    /*
        setup:

        This method must set up the game user interface according to current game situation specified
        in parameters.

        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)

        "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
    */

    public setup(gamedatas: GameData) {
        log( "Starting game setup" );
        log('gamedatas', gamedatas);

        this.setupNotifications();
        log( "Ending game setup" );
    }

    ///////////////////////////////////////////////////
    //// Game & client states

    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    public onEnteringState(stateName: string, args: any) {
        log('Entering state: ' + stateName, args.args);

        switch (stateName) {

        }
    }



    public onLeavingState(stateName: string) {
        log( 'Leaving state: '+stateName );

        switch (stateName) {

        }
    }

    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    public onUpdateActionButtons(stateName: string, args: any) {

        if ((this as any).isCurrentPlayerActive()) {
            switch (stateName) {
            }

            if ([].includes(stateName) && args.canCancelMoves) {
                (this as any).addActionButton('undoLastMoves', _("Undo last moves"), () => this.undoLastMoves(), null, null, 'gray');
            }
        }
    }

    private undoLastMoves() {
        this.takeAction('undoLastMoves');
    }

    ///////////////////////////////////////////////////
    //// Utility methods
    ///////////////////////////////////////////////////

    public isReadOnly() {
        return (this as any).isSpectator || typeof g_replayFrom != 'undefined' || g_archive_mode;
    }

    public getPlayerId(): number {
        return Number((this as any).player_id);
    }

    public getPlayer(playerId: number): Player {
        return Object.values(this.gamedatas.players).find(player => Number(player.id) == playerId);
    }

    public takeAction(action: string, data?: any, onComplete: () => void = () => {}) {
        data = data || {};
        data.lock = true;
        (this as any).ajaxcall(`/gamename/gamename/${action}.html`, data, this, onComplete);
    }
    public takeNoLockAction(action: string, data?: any, onComplete: () => void = () => {}) {
        data = data || {};
        (this as any).ajaxcall(`/gamename/gamename/${action}.html`, data, this, onComplete);
    }

    public setTooltip(id: string, html: string) {
        (this as any).addTooltipHtml(id, html, TOOLTIP_DELAY);
    }
    public setTooltipToClass(className: string, html: string) {
        (this as any).addTooltipHtmlToClass(className, html, TOOLTIP_DELAY);
    }

    private setScore(playerId: number, score: number) {
        (this as any).scoreCtrl[playerId]?.toValue(score);
    }

    private isAskForConfirmation() {
        return true; // For now always ask for confirmation, might make this a preference later on.
    }

    private wrapInConfirm(runnable: () => void) {
        if (this.isAskForConfirmation()) {
            (this as any).confirmationDialog(_("This action can not be undone. Are you sure?"), () => {
                runnable();
            });
        } else {
            runnable();
        }
    }

    ///////////////////////////////////////////////////
    //// Reaction to cometD notifications

    /*
        setupNotifications:

        In this method, you associate each of your game notifications with your local method to handle it.

        Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                your pylos.game.php file.

    */
    setupNotifications() {
        log( 'notifications subscriptions setup' );

        const notifs = [
            // ['untilFinishedReturnPromise', undefined],
            // ['shortTime', 1],
            // ['fixedTime', 1000]
        ];

        notifs.forEach((notif) => {
            dojo.subscribe(notif[0], this, notifDetails => {
                log(`notif_${notif[0]}`, notifDetails.args);

                const promise = this[`notif_${notif[0]}`](notifDetails.args);

                // tell the UI notification ends
                promise?.then(() => (this as any).notifqueue.onSynchronousNotificationEnd());
            });
            // make all notif as synchronous
            (this as any).notifqueue.setSynchronous(notif[0], notif[1]);
        });
    }

    public format_string_recursive(log: string, args: any) {
        try {
            if (log && args && !args.processed) {
                Object.keys(args).forEach(argKey => {
                })
            }
        } catch (e) {
            console.error(log, args, "Exception thrown", e.stack);
        }
        return (this as any).inherited(arguments);
    }

}