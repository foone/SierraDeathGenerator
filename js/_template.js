// noinspection JSUnusedLocalSymbols
let mainTemplate = {
    oninit: function(vnode) {
        console.log("initialized");

        if (!app.existingGenerator(vnode.attrs.generator)){
            m.route.set('/'+state.defaultGenerator)
        } else {
            app.fetchGeneratorAssets(vnode.attrs.generator);
        }
    },
    oncreate: function(vnode) {
        console.log("DOM created")
    },
    onupdate: function(vnode) {
        console.log("DOM updated");

        if (app.assetsLoaded(vnode.attrs.generator)) {
            app.initCanvas(vnode.attrs.generator)
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

        if (!app.existingGenerator(vnode.attrs.generator)){
            m.route.set('/'+state.defaultGenerator);
            return false
        }
        app.fetchGeneratorAssets(vnode.attrs.generator);
        return true
    },

    selectOption: function(obj,value) {
        obj.selected = value;
    },

    view : function(vnode) {
        let ui = vnode.state
        let topMargin = 0;

        if (!app.existingGenerator(vnode.attrs.generator)) {
            return false
        }

        if (app.assetsLoaded(vnode.attrs.generator)) {
            topMargin = (640-state.generators[vnode.attrs.generator].template.height*2) / 2;
        }
        return m("main", [
            m("div", {class: "mw9 center ph1-ns"}, [
                m("div", {class: "cf ph1-ns"}, [
                    m("div", {class: "fl w-100 w-100-ns pa1"}, [

                        m("h1", {class: "f3 fw6 ttu"}, [state.generators[vnode.attrs.generator].title+" Generator"]),
                        m("h2", {class: "f4"}, ["Generators:"]),

                        m("div", {id:"generators",class:"fl w-100"}, [
                            function(){
                                let generators = [];
                                Object.keys(state.generators).forEach(function(key) {
                                    let activeClass = 'b--transparent o-90';
                                    if (m.route.get()==='/'+key) {
                                        activeClass = 'b--green o-100';
                                    }
                                    generators.push([
                                        m("div",{class:"fl w-10 bw2 b--solid "+activeClass, style:"overflow:hidden;"},[
                                            // m("a", { class: "f6 link dim ph3 pv2 mb2 dib white bg-dark-gray", href: '/' + key,  oncreate: m.route.link, }, [state.generators[key].title]), " "
                                            m("a", { class: "gameSelector", href: '/' + key,  oncreate: m.route.link, }, [
                                                m("img",{style:"float: left;", class:"grow", src:state.gamesFolder+'/'+key+'/'+key+'-logo.png'})
                                            ]),
                                        ])
                                    ]);
                                });
                                return generators;
                            }()
                        ]),

                        m("div",{class:"fl w-60 pa1 crt", id:"monitor"},[
                            (app.assetsLoaded(vnode.attrs.generator))?m("canvas", {id: "death", style: "margin-top:"+topMargin+"px;"}, ["No canvas!"]):'',
                            m("div", {class:"copyrights"},[
                                m("a", {href: "https://github.com/foone/SierraDeathGenerator"}, ["Code"]), " by ", m("a", {href: "https://twitter.com/Foone"}, ["@Foone"]), ', ', m("a", {href: "https://twitter.com/karavas"}, ["@karavas"]),
                                m("span", {id: "extra-contrib"}, [" content by ", m("a", {href: state.generators[vnode.attrs.generator].sourceurl}, [state.generators[vnode.attrs.generator].source])])
                            ]),
                        ]),

                        m("div",{class:"fl w-40 pa1", id:"customization"},[

                        m("p", [

                            m("textarea", { cols: "40",  rows: "6",  class: "border-box hover-black measure b--black-20 pa2 mb2",
                                // onchange: m.withAttr('value',function(value){ state.generators[vnode.attrs.generator].currentText = value; }),
                                oninput: m.withAttr('value',function(value){ state.generators[vnode.attrs.generator].currentText = value; }),
                                value : function(){
                                    let currentText = ((state.generators[vnode.attrs.generator].currentText) || (state.generators[vnode.attrs.generator].defaulttext))
                                    if ((state.generators[vnode.attrs.generator].currentText) === '') {
                                        currentText= '';
                                    }
                                    return currentText;
                                }()
                            },[]),

                            m("a", {href: "#", id: "save"}, [
                                m("img", {src: state.floppyURL, width: "96", height: "96"})
                            ]),

                            (app.assetsLoaded(vnode.attrs.generator))?m("p",[
                                    function(){
                                        if (!state.generators[vnode.attrs.generator].settings.hasOwnProperty('overlays')) {
                                            return
                                        }
                                        let overlays = [];

                                        Object.keys(state.generators[vnode.attrs.generator].settings.overlays).forEach(function (key) {
                                            let currentSelection = ((state.generators[vnode.attrs.generator].settings.overlays[key].selected) || (state.generators[vnode.attrs.generator].settings.overlays[key].default));
                                            overlays.push(
                                                m("p",[state.generators[vnode.attrs.generator].settings.overlays[key].selected]),
                                                m("label",[key]),
                                                m('select',{value:currentSelection, onchange: m.withAttr('value',function(value) { ui.selectOption(state.generators[vnode.attrs.generator].settings.overlays[key],value) }) },[
                                                    function() {
                                                        if (!state.generators[vnode.attrs.generator].settings.overlays[key].hasOwnProperty('options')) {
                                                            return
                                                        }
                                                        let options = [];
                                                        Object.keys(state.generators[vnode.attrs.generator].settings.overlays[key].options).forEach(function (opt) {
                                                            options.push(m("option",{value:opt},[opt]));
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