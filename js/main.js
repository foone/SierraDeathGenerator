// noinspection JSUnusedLocalSymbols
let mainTemplate = {
    oninit: function(vnode) {
        console.log("initialized");

        if (!utils.existingGenerator(vnode.attrs.generator)){
            m.route.set('/'+config.default)
        } else {
            utils.fetchGeneratorAssets(vnode.attrs.generator);
        }
    },
    oncreate: function(vnode) {
        console.log("DOM created")
    },
    onupdate: function(vnode) {
        console.log("DOM updated");

        if (utils.assetsLoaded(vnode.attrs.generator)) {
            utils.initCanvas(vnode.attrs.generator)
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
        let ui = vnode.state
        let topMargin = 0;

        if (!utils.existingGenerator(vnode.attrs.generator)) {
            return false
        }

        if (utils.assetsLoaded(vnode.attrs.generator)) {
            topMargin = (640-config.generators[vnode.attrs.generator].template.height*2) / 2;
        }
        return m("main", [
            m("div", {class: "mw9 center ph1-ns"}, [
                m("div", {class: "cf ph1-ns"}, [
                    m("div", {class: "fl w-100 w-100-ns pa1"}, [

                        m("h1", {class: "f3 fw6 ttu"}, [config.generators[vnode.attrs.generator].title+" Generator"]),
                        m("h2", {class: "f4"}, ["Generators:"]),

                        m("div", {}, [
                            function(){
                                let generators = [];
                                Object.keys(config.generators).forEach(function(key) {
                                    generators.push([m("a", { class: "f6 link dim ph3 pv2 mb2 dib white bg-dark-gray", href: '/' + key,  oncreate: m.route.link, }, [config.generators[key].title]), " "]);
                                });
                                return generators;
                            }()
                        ]),

                        m("div",{class:"crt", id:"monitor"},[
                            (utils.assetsLoaded(vnode.attrs.generator))?m("canvas", {id: "death", style: "margin-top:"+topMargin+"px;"}, ["No canvas!"]):'',
                            m("div", {class:"copyrights"},[
                                m("a", {href: "https://github.com/foone/SierraDeathGenerator"}, ["Code"]), " by ", m("a", {href: "https://twitter.com/Foone"}, ["@Foone"]), ', ', m("a", {href: "https://twitter.com/karavas"}, ["@karavas"]),
                                m("span", {id: "extra-contrib"}, [" content by ", m("a", {href: config.generators[vnode.attrs.generator].sourceurl}, [config.generators[vnode.attrs.generator].source])])
                            ]),
                        ]),

                        m("div",{id:"customization"},[

                        m("p", [
                            m("textarea", {
                                cols: "40",
                                rows: "6",
                                class: "border-box hover-black measure b--black-20 pa2 mb2"
                            },[config.generators[vnode.attrs.generator].defaulttext]),

                            m("a", {href: "#", id: "save"}, [
                                m("img", {src: config.floppyURL, width: "96", height: "96"})
                            ]),

                            (utils.assetsLoaded(vnode.attrs.generator))?m("p",[
                                    function(){
                                        if (!config.generators[vnode.attrs.generator].settings.hasOwnProperty('overlays')) {
                                            return
                                        }
                                        let overlays = [];
                                        Object.keys(config.generators[vnode.attrs.generator].settings.overlays).forEach(function (key) {
                                            overlays.push(
                                                m("label",[key]),
                                                m('select',{},[
                                                    function() {
                                                        if (!config.generators[vnode.attrs.generator].settings.overlays[key].hasOwnProperty('options')) {
                                                            return
                                                        }
                                                        let options = [];
                                                        Object.keys(config.generators[vnode.attrs.generator].settings.overlays[key].options).forEach(function (opt) {
                                                            options.push(m("option",[opt]));
                                                        });
                                                        return options;
                                                    }()
                                                ])
                                            );
                                        });
                                        return overlays;
                                    }()
                            ]):''

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