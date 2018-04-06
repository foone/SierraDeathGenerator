floppyImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgAQMAAADYVuV7AAAABlBMVEX///8AAABVwtN+AAAAAWJLR0QAiAUdSAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAAd0SU1FB+IBBRQ0G7eG+BwAAACiSURBVDjLzdIxCsMwDAVQgQePOkIuIvDRmqP5Br2CS4eM8ZhBxHUUt8gE09KQtNoefGRbFgAkKQapFbNGqtBreAHbAGBTEEyCMSoM0wvdcGeF26wQksZFw2l0ZwDsB1hGsAfrYP8G7Ysa+ey3DarY7mcfN7ey606vcvoaPymMLRC1gDlIVMIVjM9JKuEKEJGJHG+xRHIL2AIjXo1/nqNxfj0AmAoaBZSWo6oAAAAASUVORK5CYII=";

let utils = {

    existingGenerator : function(reqGenerator) {
        return data.generators.hasOwnProperty(reqGenerator);
    },

    fetchGeneratorData : function(reqGenerator) { // Fetches data for generator

        // Get template image (if we don't have it already)
        if (!data.generators[reqGenerator].hasOwnProperty('template')) {
            m.request({
                method: "GET",
                responseType: 'arraybuffer',
                url: 'games/' + reqGenerator + '/' + reqGenerator + '-blank.png',
                config: function(xhr) {
                    xhr.responseType = 'arraybuffer';
                },
                extract: function (xhr) {
                    return utils.createImageObject(xhr.response)
                }
            }).then(function (templateData) {
                data.generators[reqGenerator].template = templateData
            })
        }

        // Get font (if we don't have it already)
        if (!data.generators[reqGenerator].hasOwnProperty('font')) {
            m.request({
                method: "GET",
                url: 'games/' + reqGenerator + '/' + reqGenerator + '-font.png',
                config: function(xhr) {
                    xhr.responseType = 'arraybuffer';
                },
                extract: function (xhr) {
                    return utils.createImageObject(xhr.response)
                }
            }).then(function (fontData) {
                data.generators[reqGenerator].font = fontData
            })
        }

    },

    createBase64src : function(imageData){
        var uInt8Array = new Uint8Array(imageData);
        var i = uInt8Array.length;
        var binaryString = new Array(i);

        while (i--) {
            binaryString[i] = String.fromCharCode(uInt8Array[i]);
        }

        return "data:image/png;base64,"+window.btoa(binaryString.join(''))
    },

    createImageObject : function(imageData) {
        let imgElement = new Image()
        imgElement.src = utils.createBase64src(imageData)
        return imgElement
    },

    resourcesLoaded : function(vnode) {
        return ((data.generators[ vnode.attrs.generator ].template) && (data.generators[ vnode.attrs.generator ].font))
    },

    initCanvas : function(vnode) {

        var canvas = document.getElementById('death');
        var template = data.generators[vnode.attrs.generator].template
        var font = data.generators[vnode.attrs.generator].font

        canvas.width = template.width
        canvas.height = template.height

        if (canvas.getContext) {
            var ctx = canvas.getContext('2d');
            ctx.drawImage(template, 0, 0);
        } else {
            // canvas-unsupported code here
        }
    }

};

let mainTemplate = {
    oninit: function(vnode) {
        console.log("initialized")
        if (!utils.existingGenerator(vnode.attrs.generator)){
            m.route.set('/'+data.default)
        }
        utils.fetchGeneratorData(vnode.attrs.generator)
    },
    oncreate: function(vnode) {
        console.log("DOM created")
    },
    onupdate: function(vnode) {
        console.log("DOM updated")
        if (utils.resourcesLoaded(vnode)) {
            utils.initCanvas(vnode)
        }
    },
    onbeforeremove: function(vnode) {
        console.log("exit animation can start")
        return new Promise(function(resolve) {
            // call after animation completes
            resolve()
        })
    },
    onremove: function(vnode) {
        console.log("removing DOM element")
    },
    onbeforeupdate: function(vnode, old) {
        console.log('Before vnode update')
        if (!utils.existingGenerator(vnode.attrs.generator)){
            m.route.set('/'+data.default)
            return false
        }
        utils.fetchGeneratorData(vnode.attrs.generator)
        return true
    },
    view : function(vnode) {


        return m("main", [
            m("p",[vnode.attrs.generator]),
            m("div", {class: "mw9 center ph1-ns"}, [
                m("div", {class: "cf ph1-ns"}, [
                    m("div", {class: "fl w-100 w-100-ns pa1"}, [

                        m("h1", {class: "f3 fw6 ttu"}, ["Sierra Death Generator"]),
                        m("h2", {class: "f4"}, [data.generators[vnode.attrs.generator].title]),

                        m("div", {class: "tracked"}, [
                            function(){
                                generators = []
                                for(key in data.generators) {
                                    if(data.generators.hasOwnProperty(key)) {
                                        generator = data.generators[key]
                                        generators.push([m("a", {
                                            class: "f6 link dim ph3 pv2 mb2 dib white bg-dark-gray",
                                            href: '/' + key,
                                            oncreate: m.route.link,
                                        }, [generator.title]), " "]);
                                    }
                                }
                                return generators;
                            }()
                        ]),

                        m("div", [
                            m("a", {href: "https://github.com/foone/SierraDeathGenerator"}, ["Code"]), " by ", m("a", {href: "https://twitter.com/Foone"}, ["@Foone"]),
                            m("span", {id: "extra-contrib"}, [", content by ", m("a", {href: "#"}, ["somebody"])])
                        ]),

                        function(){
                            if (utils.resourcesLoaded(vnode)) {
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
                                m("img", {src: floppyImage, width: "96", height: "96"})
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
})