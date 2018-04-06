const utils = {

    existingGenerator: function (reqGenerator) {
        return config.generators.hasOwnProperty(reqGenerator);
    },

    fetchGeneratorAssets: function (reqGenerator) { // Fetches images for generator
        // Fetch according to config
        config.generatorAssets.filter(function(asset){
            return !config.generators[reqGenerator].hasOwnProperty(asset.key); // if we have asset already, skip.
        }).map(function(asset){
            // Fetch according to type, store inside generator object
            m.request({
                method: "GET",
                url: config.gamesFolder + '/' + reqGenerator + '/' + reqGenerator + asset.suffix,
                config: function (xhr) { // Can be customized according asset type
                    if (asset.type === 'image') {
                        xhr.responseType = 'arraybuffer';
                    }
                },
                extract: function (xhr) { // Can be customized according asset type
                    if (asset.type === 'image') {
                        return utils.createImageObject(xhr.response);
                    } else {
                        return JSON.parse(xhr.responseText);
                    }
                }
            }).then(function (fetchedData) {
                config.generators[reqGenerator][asset.key] = fetchedData;
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
        imgElement.src = utils.createBase64src(imageData);
        return imgElement
    },

    assetsLoaded: function (reqGenerator) { // Checks to see if all assets for a generator are loaded
        if (!utils.existingGenerator(reqGenerator)){
            return false
        }
        // Check if every asset exists
        for (let i = 0; i < config.generatorAssets.length; i++) {
            if (!config.generators[reqGenerator].hasOwnProperty(config.generatorAssets[i].key)) {
                return false;
            }
        }
        return true;
    },

    initCanvas: function (reqGenerator) {
        const canvas = document.getElementById('death');
        // noinspection JSUnresolvedVariable
        const template = config.generators[reqGenerator].template;
        // noinspection JSUnusedLocalSymbols
        const font = config.generators[reqGenerator].font;

        canvas.width = template.width * 2;
        canvas.height = template.height * 2;

        if (canvas.getContext) {

            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            ctx.scale(2, 2);
            ctx.drawImage(template, 0, 0);

        //  Create options
            Object.keys(config.generators[reqGenerator].settings.overlays).forEach(function (key) {
                if (!config.generators[reqGenerator].settings.overlays[key].hasOwnProperty('options')) {
                    return
                }
                if (!config.generators[reqGenerator].settings.overlays[key].hasOwnProperty('selected')) {
                    config.generators[reqGenerator].settings.overlays[key]['selected'] = Object.keys(config.generators[reqGenerator].settings.overlays[key].options)[0];
                }

                let selectedOption = config.generators[reqGenerator].settings.overlays[key].options[config.generators[reqGenerator].settings.overlays[key].selected];
                console.log(selectedOption);
                console.log(key);
                ctx.drawImage(font,selectedOption.x,selectedOption.y,selectedOption.w,selectedOption.h,config.generators[reqGenerator].settings.overlays[key].x,config.generators[reqGenerator].settings.overlays[key].y,selectedOption.w,selectedOption.h)
            })

        } else {
            // canvas-unsupported code here
        }
    }

};