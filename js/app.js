const app = function(){

    console.log('Initialized app');

    return {

        existingGenerator: function (reqGenerator) {
            return state.generators.hasOwnProperty(reqGenerator);
        },

        fetchGeneratorAssets: function (reqGenerator) { // Fetches images for requested generator
            // Fetch according to config
            state.generatorAssets.filter(function (asset) {
                return !state.generators[reqGenerator].hasOwnProperty(asset.key); // if we have asset already, skip.
            }).map(function (asset) {
                // Fetch according to type, store inside generator object
                m.request({
                    method: "GET",
                    url: state.gamesFolder + '/' + reqGenerator + '/' + reqGenerator + asset.suffix,
                    config: function (xhr) { // customized according asset type
                        if (asset.type === 'image') {
                            xhr.responseType = 'arraybuffer';
                        }
                    },
                    extract: function (xhr) { // customized according asset type
                        if (asset.type === 'image') {
                            return app.createImageObject(xhr.response);
                        } else {
                            return JSON.parse(xhr.responseText);
                        }
                    }
                }).then(function (fetchedData) { // Initial key doesn't exist, it'll be created
                    state.generators[reqGenerator][asset.key] = fetchedData;
                })
            });
        },

        createBase64src: function (imageData) { // Create base64 image data out of xhr
            const uInt8Array = new Uint8Array(imageData);
            let i = uInt8Array.length;
            const binaryString = new Array(i);

            while (i--) {
                binaryString[i] = String.fromCharCode(uInt8Array[i]);
            }

            return "data:image/png;base64," + window.btoa(binaryString.join(''))
        },

        createImageObject: function (imageData) { // Create image element off base64 image data
            let imgElement = new Image();
            imgElement.src = app.createBase64src(imageData);
            return imgElement
        },

        assetsLoaded: function (reqGenerator) { // Checks to see if all assets for a generator are loaded

            if (!app.existingGenerator(reqGenerator)) { // Being overly careful
                return false
            }
            // Check if every asset exists
            for (let i = 0; i < state.generatorAssets.length; i++) {
                if (!state.generators[reqGenerator].hasOwnProperty(state.generatorAssets[i].key)) {
                    return false;
                }
            }
            return true;
        },

        postToImgur: function () {

            // var form = new FormData();
            // form.append("image", "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
            //
            // var settings = {
            //     "async": true,
            //     "crossDomain": true,
            //     "url": "https://api.imgur.com/3/image",
            //     "method": "POST",
            //     "headers": {
            //         "Authorization": "Client-ID {{clientId}}"
            //     },
            //     "processData": false,
            //     "contentType": false,
            //     "mimeType": "multipart/form-data",
            //     "data": form
            // }
            //
            // $.ajax(settings).done(function (response) {
            //     console.log(response);
            // });

        },

        initCanvas: function (reqGenerator) {

            const canvas = document.getElementById('death');
            // noinspection JSUnresolvedVariable
            const template = state.generators[reqGenerator].template;
            // noinspection JSUnusedLocalSymbols
            const font = state.generators[reqGenerator].font;
            // noinspection JSUnusedLocalSymbols
            const generatorSettings = state.generators[reqGenerator].settings;

            const ctx = canvas.getContext('2d');

            function getWidth(lines){

                var maxw=0;
                for (let line of lines){
                    var w=0;
                    for(var i=0;i<line.length;i++){
                        var info=generatorSettings[line.charCodeAt(i)]
                        if(info==null){
                            info=generatorSettings[generatorSettings["null-character"]]
                        }
                        w+=info.w
                    }
                    maxw=Math.max(maxw,w)
                }
                return maxw

            }
            function getHeight(lines){

                if(lines.length == 9){
                    return 0;
                }
                if(generatorSettings['first-height'] == null){
                    return generatorSettings.height * lines.length
                }

                return Math.max(0,generatorSettings.height * (lines.length-1)) + generatorSettings['first-height']
            }

            // TODO: Scaling
            canvas.width = template.width * 2;
            canvas.height = template.height * 2;
            ctx.imageSmoothingEnabled = false;
            ctx.scale(2, 2);

            ctx.drawImage(template, 0, 0);

            // TODO: would be nice to remove black for monitor effect
            // function draw(img) {
            //     var buffer = canvas;
            //     var bufferctx = ctx;
            //     bufferctx.drawImage(img, 0, 0);
            //     var imageData = bufferctx.getImageData(0,0,buffer.width,  buffer.height);
            //     var data = imageData.data;
            //     var removeBlack = function() {
            //         for (var i = 0; i < data.length; i += 4) {
            //             if(data[i]+ data[i + 1] + data[i + 2] < 10){
            //                 data[i + 3] = 0; // alpha
            //             }
            //         }
            //         ctx.putImageData(imageData, 0, 0);
            //     };
            //     removeBlack();
            // }

                // Draw Template
                ctx.drawImage(template, 0, 0);

                // Draw overlays
                if (state.generators[reqGenerator].settings.hasOwnProperty('overlays')) {
                    let overlaysObj = state.generators[reqGenerator].settings.overlays;
                    let overlays = Object.keys(overlaysObj);
                    let options = Array();
                    let selectedOption = {};

                    // Draw selected overlay or default if none selected
                    overlays.filter(function(overlayKey) { // Handle only overlays with options
                        return (overlaysObj[overlayKey].hasOwnProperty('options'));
                    }).map(function(overlay){
                        overlay = overlaysObj[overlay];
                        if (overlay.hasOwnProperty('selected')) {
                            selectedOption = overlay.options[overlay.selected];
                        } else {
                            selectedOption = overlay.options[overlay.default];
                        }
                        // let selectedOption = overlay.options[overlay.selected];
                        ctx.drawImage(font, selectedOption.x, selectedOption.y, selectedOption.w, selectedOption.h, overlay.x, overlay.y, selectedOption.w, selectedOption.h)
                    });
                }

            // Draw text
            var originx = generatorSettings.origin.x;
            var bx = generatorSettings.box.x, by=generatorSettings.box.y;
            var text = (state.generators[reqGenerator].currentText!==undefined)?state.generators[reqGenerator].currentText.split('\n'):state.generators[reqGenerator].defaulttext.split('\n');
            var firstLine = true;
            var y = generatorSettings.origin.y

            var justify = (generatorSettings.justify)||'left';

            switch (justify) {
                case 'center-box':
                    originx -= Math.floor(getWidth(text)/2);
                case 'v-center':
                    y -= Math.floor(getHeight(text)/2);
            }

            for (let line of text){

                if(generatorSettings['case-fold'] == 'upper'){
                    line = line.toUpperCase();
                }else if(generatorSettings['case-fold'] == 'lower'){
                    line = line.toLowerCase();
                }
                var x=originx;
                for(var i=0;i<line.length;i++){
                    var info=generatorSettings[line.charCodeAt(i)];
                    if(info==null){
                        info=generatorSettings["null-character"];
                    }
                    bx=info.w;
                    by=info.h;
                    ctx.drawImage(state.generators[reqGenerator].font,info.x,0,bx,by,x,y,bx,by);
                    x+=info.w;
                }
                if(firstLine){
                    if(generatorSettings['first-height'] != null){
                        // remove out generatorSettings.height because it's going to be re-added later.
                        y+=generatorSettings['first-height']-generatorSettings.height;
                    }
                    firstLine = false;
                }
                y+=generatorSettings.height;
            }

        }
    };

}();