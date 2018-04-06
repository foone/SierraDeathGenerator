const utils = {

    existingGenerator: function (reqGenerator) {
        return config.generators.hasOwnProperty(reqGenerator);
    },

    fetchGeneratorAssets: function (reqGenerator) { // Fetches images for generator

        // Fetch according to config
        for (let i = 0; i < config.generatorAssets.length; i++) {

            // Get asset if we don't have it already
            if (!config.generators[reqGenerator].hasOwnProperty(config.generatorAssets[i].key)) {

                // noinspection ES6ModulesDependencies
                m.request({

                    method: "GET",
                    url: config.gamesFolder + '/' + reqGenerator + '/' + reqGenerator + config.generatorAssets[i].suffix,

                    config: function (xhr) { // Can be customized according asset type

                        if (config.generatorAssets[i].type === 'image') {
                            xhr.responseType = 'arraybuffer';
                        }

                    },

                    extract: function (xhr) { // Can be customized according asset type

                        if (config.generatorAssets[i].type === 'image') {
                            return utils.createImageObject(xhr.response);
                        } else {
                            return JSON.parse(xhr.responseText);
                        }

                    }

                }).then(function (fetchedData) {
                    config.generators[reqGenerator][config.generatorAssets[i].key] = fetchedData
                })

            }

        }

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

        // Check if every asset exists
        for (let i = 0; i < config.generatorAssets.length; i++) {
            if (!config.generators[reqGenerator].hasOwnProperty(config.generatorAssets[i].key)) {
                return false;
            }
        }

        return true;
            
    },

    initCanvas: function (vnode) {

        const canvas = document.getElementById('death');
        // noinspection JSUnresolvedVariable
        const template = config.generators[vnode.attrs.generator].template;
        // noinspection JSUnusedLocalSymbols
        const font = config.generators[vnode.attrs.generator].font;

        canvas.width = template.width * 2;
        canvas.height = template.height * 2;


        if (canvas.getContext) {
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            ctx.scale(2, 2);
            ctx.drawImage(template, 0, 0);
        } else {
            // canvas-unsupported code here
        }
    }

};

// noinspection JSUnusedLocalSymbols
let mainTemplate = {
    oninit: function(vnode) {
        console.log("initialized");

        if (!utils.existingGenerator(vnode.attrs.generator)){
            m.route.set('/'+config.default)
        }

        utils.fetchGeneratorAssets(vnode.attrs.generator)

    },
    oncreate: function(vnode) {
        console.log("DOM created")
    },
    onupdate: function(vnode) {
        console.log("DOM updated");

        if (utils.assetsLoaded(vnode.attrs.generator)) {
            utils.initCanvas(vnode)
        }

    },
    onbeforeremove: function(vnode) {
        console.log("exit animation can start");

        return new Promise(function(resolve) {
            // call after animation completes
            resolve()
        })

    },
    onremove: function(vnode) {
        console.log("removing DOM element")
    },
    onbeforeupdate: function(vnode, old) {
        console.log('Before vnode update');

        if (!utils.existingGenerator(vnode.attrs.generator)){
            m.route.set('/'+config.default);
            return false
        }

        utils.fetchGeneratorAssets(vnode.attrs.generator);

        return true

    },
    view : function(vnode) {

        return m("main", [
            m("p",[vnode.attrs.generator]),
            m("div", {class: "mw9 center ph1-ns"}, [
                m("div", {class: "cf ph1-ns"}, [
                    m("div", {class: "fl w-100 w-100-ns pa1"}, [

                        m("h1", {class: "f3 fw6 ttu"}, ["Sierra Death Generator"]),
                        m("h2", {class: "f4"}, [config.generators[vnode.attrs.generator].title]),

                        m("div", {class: "tracked"}, [
                            function(){
                                let generators = [];
                                Object.keys(config.generators).forEach(function(key) {
                                    generators.push([m("a", { class: "f6 link dim ph3 pv2 mb2 dib white bg-dark-gray", href: '/' + key,  oncreate: m.route.link, }, [config.generators[key].title]), " "]);
                                });
                                return generators;
                            }()
                        ]),

                        m("div", [
                            m("a", {href: "https://github.com/foone/SierraDeathGenerator"}, ["Code"]), " by ", m("a", {href: "https://twitter.com/Foone"}, ["@Foone"]),
                            m("span", {id: "extra-contrib"}, [", content by ", m("a", {href: "#"}, ["somebody"])])
                        ]),

                        function(){
                            if (utils.assetsLoaded(vnode.attrs.generator)) {
                                return m("canvas", {id: "death"}, ["No canvas!"])
                            }
                        }(),

                        m("p", [
                            m("textarea", {
                                cols: "40",
                                rows: "6",
                                class: "border-box hover-black measure b--black-20 pa2 mb2"
                            }),

                            m("a", {href: "#", id: "save"}, [
                                m("img", {src: config.floppyURL, width: "96", height: "96"})
                            ])
                        ])

                    ])
                ])
            ])
        ])
    }
};

let root = document.body;

m.route(root, "/", {
    "/" : mainTemplate,
    "/:generator" : mainTemplate,
});