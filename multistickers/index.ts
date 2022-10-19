import definePlugin from "../../utils/types";

export default definePlugin({
    name: "multistickers",
    description: "lets you send up to 3 stickers and shift click stickers",
    authors: [
        {
            id: 579731384868798464n,
            name: "void",
        },
    ],
    patches: [{
        find: "ADD_STICKER_PREVIEW:function(",
        replacement: {
            match: /\((\w+)\.draftType===(\w+).(\w+)\.FirstThreadMessage\?(\S):(\w)\)\[(\w)\]=\[(\w)\]/,
            replace: "const _store=($1.draftType===$2.$3.FirstThreadMessage?$4:$5);_store[$6]=_store[$6]?.filter(x=>x.id!==$7.id);if(_store[$6]?.length===3)_store[$6].shift();_store[$6]=[..._store[$6]??[],$7]",
        }
    },
    {
        find: "CLEAR_STICKER_PREVIEW:function(",
        replacement: {
            match: /\((\w+)\)\{var (\w)=\w\.channelId,(\w)=\w\.draftType===(\w+)\.(\w+)\.FirstThreadMessage\?(\S):(\w+);/,
            replace: "($1){var $2=$1.channelId,$3=$1.draftType===$4.$5.FirstThreadMessage?$6:$7;if($1.stickerId){$3[$2]=$3[$2]?.filter(x=>x.id!==$1.stickerId);return;}",
        }
    },
    {
        find: "().stickerPreviewContainer",
        replacement: {
            match: /(?<=\(\)\.closeButton,onClick:function\(\)\{return\(0,)(\w+)\.(\w+)\)\((\w+),(\w+)\.drafts\.type\)\}/,
            replace: "$1.$2)($3,$4.drafts.type, e.id)}",
        }
    },
    {
        find: `"CLEAR_STICKER_PREVIEW",channelId:`,
        replacement: {
            match: /(?<=GUILD_STICKERS_CREATE_SUCCESS)(.+?)function (\w+)\((\w+),(\w+)\)\{(\w+)\.(\w+)\.dispatch.+?\}/,
            replace: `$1function $2($3,$4,_s){$5.$6.dispatch({type:"CLEAR_STICKER_PREVIEW",channelId:$3,draftType:$4,stickerId:_s}`,
        }
    },
    {
        find: "().stickerInspected",
        replacement: {
            match: /(?<=\(\)\.stickerInspected)(.+?onClick:function)\((\w+)\)\{/,
            replace: "$1($2){if($2.shiftKey)Vencord.Plugins.plugins.multistickers.shiftEvent.set();"
        }
    },
    {
        find: ".stickers,previewSticker:",
        replacement: {
            match: /(getUploadCount.+?0)/,
            replace: `$1||Vencord.Plugins.plugins.multistickers.shiftEvent.get("attach")`,
        }
    },
    {
        find: `name:"expression-picker-last-active-view"`,
        replacement: {
            match: /(?<=name:"expression-picker-last-active-view")(.+?function.+?function.+?function\(\w+\)\{)/,
            replace: `$1if(Vencord.Plugins.plugins.multistickers.shiftEvent.get("close"))return;`
        }
    }],

    shiftEvent: {
        shouldNotClose: false,
        shouldAttach: false,
        set: function () {
            this.shouldNotClose = true;
            this.shouldAttach = true;
        },
        get(type) {
            if (type === "attach") {
                const ret = this.shouldAttach;
                this.shouldAttach = false;
                return ret;
            }
            const ret = this.shouldNotClose;
            this.shouldNotClose = false;
            return ret;
        }
    }
});
