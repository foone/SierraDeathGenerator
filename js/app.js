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

        downloadCanvas : function(canvas, filename) {
        // Source from:  http://stackoverflow.com/questions/18480474/how-to-save-an-image-from-canvas

            /// create an "off-screen" anchor tag
            let lnk = document.createElement('a'), e;

            /// the key here is to set the download attribute of the a tag
            lnk.download = filename;

            /// convert canvas content to data-uri for link. When download
            /// attribute is set the content pointed to by link will be
            /// pushed as "download" in HTML5 capable browsers
            lnk.href = canvas.toDataURL("image/png;base64");

            /// create a "fake" click-event to trigger the download
            if (document.createEvent) {
                e = document.createEvent("MouseEvents");
                e.initMouseEvent("click", true, true, window,
                    0, 0, 0, 0, 0, false, false, false,
                    false, 0, null);

                lnk.dispatchEvent(e);
            } else if (lnk.fireEvent) {
                lnk.fireEvent("onclick");
            }
        },

        saveCanvas: function() {
            let currentGenerator = m.route.param('generator');
            let generatorState = state.generators[currentGenerator];
            let currentText = (generatorState.currentText!==undefined)?generatorState.currentText:generatorState.defaulttext;
            app.downloadCanvas(document.getElementById('death'), currentGenerator+'-'+currentText.replace(/[^a-z0-9]/gi, '_').toLowerCase());
            return false;
        },

        filterGenerators: function(generatorKey) {
            let generator = state.generators[generatorKey];
            return (generator.title.toLowerCase().indexOf(state.filter.toLowerCase())!==-1);
        },

        getCanvasScaleRatio: function(reqGenerator, scaleBase){
            const template = state.generators[reqGenerator].template;
            const canvasWrapper = document.getElementById('monitor');
            const canvasWrapperWidth = canvasWrapper.clientWidth;

            if ((template.width*scaleBase)>canvasWrapperWidth) {
                return ((canvasWrapperWidth/(template.width*scaleBase))*scaleBase*0.8); // 80% less than full
            } else {
                return scaleBase;
            }
        },

        initCanvas: function (reqGenerator) {

            const canvas = document.getElementById('death');
            const scaleBase = 2;
            const scaleRatio = app.getCanvasScaleRatio(reqGenerator,scaleBase);

            // noinspection JSUnresolvedletiable
            const template = state.generators[reqGenerator].template;
            // noinspection JSUnusedLocalSymbols
            const font = state.generators[reqGenerator].font;
            // noinspection JSUnusedLocalSymbols
            const generatorSettings = state.generators[reqGenerator].settings;

            const ctx = canvas.getContext('2d');

            function getWidth(lines){

                let maxw=0;
                for (let line of lines){
                    let w=0;
                    for(let i=0;i<line.length;i++){
                        let info=generatorSettings[line.charCodeAt(i)];
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

                if(lines.length === 9){
                    return 0;
                }
                if(generatorSettings['first-height'] == null){
                    return generatorSettings.height * lines.length
                }

                return Math.max(0,generatorSettings.height * (lines.length-1)) + generatorSettings['first-height']
            }

            // TODO: Scaling
            canvas.width = template.width*scaleRatio;
            canvas.height = template.height*scaleRatio;

            ctx.imageSmoothingEnabled = false;
            ctx.scale(scaleRatio, scaleRatio);

            ctx.drawImage(template, 0, 0);

                // Draw Template
                ctx.drawImage(template, 0, 0);

                // Draw overlays
                if (state.generators[reqGenerator].settings.hasOwnProperty('overlays')) {
                    let overlaysObj = state.generators[reqGenerator].settings.overlays;
                    let overlays = Object.keys(overlaysObj);
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
                        ctx.drawImage(font, selectedOption.x, selectedOption.y, selectedOption.w, selectedOption.h, overlay.x, overlay.y, selectedOption.w, selectedOption.h)
                    });
                }

            // Draw text
            let originx = generatorSettings.origin.x;
            let bx = generatorSettings.box.x, by=generatorSettings.box.y;
            let text = (state.generators[reqGenerator].currentText!==undefined)?state.generators[reqGenerator].currentText.split('\n'):state.generators[reqGenerator].defaulttext.split('\n');
            let firstLine = true;
            let y = generatorSettings.origin.y;

            let justify = (generatorSettings.justify)||'left';

            switch (justify) {
                case 'center-box':
                    originx -= Math.floor(getWidth(text)/2);
                    break;
                case 'v-center':
                    y -= Math.floor(getHeight(text)/2);
                    break;
            }

            for (let line of text){

                if(generatorSettings['case-fold'] === 'upper'){
                    line = line.toUpperCase();
                }else if(generatorSettings['case-fold'] === 'lower'){
                    line = line.toLowerCase();
                }
                let x=originx;
                for(let i=0;i<line.length;i++){
                    let info=generatorSettings[line.charCodeAt(i)];
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