// noinspection JSUnusedLocalSymbols

let copyrightComponent = {
    view : function(){
        let currentGenerator = m.route.param('generator');
        return m("div", {class:"copyrights"},[
            m("a", {href: "https://github.com/foone/SierraDeathGenerator"}, ["Code"]), " by ", m("a", {href: "https://twitter.com/Foone"}, ["@Foone"]), ', ',
            m("a", {href: "https://github.com/foone/SierraDeathGenerator/graphs/contributors"}, ["kind contributors"]),
            (state.generators[currentGenerator].contributor!==undefined)?([', ',m("a", {href: ""},[state.generators[currentGenerator].contributor])]):null,
            m("span", {id: "extra-contrib"}, [" content by ", m("a", {href: state.generators[currentGenerator].sourceurl}, [state.generators[currentGenerator].source])])
        ])
    }
};

let generatorsComponent = {
    view : function(){
        let generators = [];
        Object.keys(state.generators).filter(app.filterGenerators).forEach(function(key) {
            let activeClass = 'b--transparent o-90';
            if (m.route.get()==='/'+key) {
                activeClass = 'b--black o-100';
            }
            generators.push([
                m("div",{class:"fl w-10 w-20-m pa1 bw1 b--solid br3 "+activeClass, style:"overflow:hidden;"},[
                    m("a", { class: "gameSelector", href: '/' + key,  oncreate: m.route.link, }, [
                        m("img",{style:"float: left;", class:"grow br3", src:state.gamesFolder+'/'+key+'/'+key+'-logo.png'})
                    ]),
                ])
            ]);
        });
        if (generators.length === 0) {
            return m("div",{class:"pv5 tc"},["None found :("]);
        }
        return generators;
    }
};

let generatorTextComponent = {
    view : function() {
        let currentGenerator = m.route.param('generator');
        return m("div",{class:"fl w-100 m3 pv1 ph3"},[
            m("div",{class:"fl w-100"},[
                m("h1",{class:"f5 bg-near-black white mv0 pv2 ph3 br--top br3 w-100"},"Message"),
                m("div",{class:"pa0 bt w-100-m"},[
                    m("textarea", { rows: "6", name: "text", class: "f6 f6-ns mv0 w-100 pa3",
                        oninput: m.withAttr('value',function(value){ state.generators[currentGenerator].currentText = value; }),
                        value : function(){
                            let currentText = ((state.generators[currentGenerator].currentText) || (state.generators[currentGenerator].defaulttext));
                            if ((state.generators[currentGenerator].currentText) === '') {
                                currentText= '';
                            }
                            return currentText;
                        }()
                    },[])
                ]),
            ])
        ]);
    }
};

let generatorOptionsComponent = {

    view: function() {
        let currentGenerator = m.route.param('generator');
        let generatorSettings = state.generators[currentGenerator].settings;

        if ((!app.assetsLoaded(currentGenerator)) || (!generatorSettings.hasOwnProperty('overlays'))) { return null; }

        return m("div",{class:"fl w-100 pv2 ph3"},[
            m("h1",{class:"f5 bg-near-black white mv0 pv2 ph3 br--top br3 w-100"},["Options"]),
            m("p",{class:"bg-white mv0 pa3 fl w-100 ba b--black-20"},[
                m("table",{class:"collapse w100-ns"},[
                    function(){
                        let overlays = [];
                        Object.keys(generatorSettings.overlays).forEach(function (key) {
                            let currentSelection = ((generatorSettings.overlays[key].selected) || (generatorSettings.overlays[key].default));
                            overlays.push(
                                m("tr",[
                                    m("td",[generatorSettings.overlays[key].title+':']),
                                    m("td",[
                                        m('select',{ onchange: m.withAttr('value',function(value) { generatorSettings.overlays[key].selected = value; }) },[
                                            function() {
                                                let options = [];
                                                Object.keys(generatorSettings.overlays[key].options).forEach(function (opt) {
                                                    options.push(m("option"+((opt===currentSelection)?'[selected=true]':''),{value:opt},[opt]));
                                                });
                                                return options;
                                            }()
                                        ]),
                                    ])
                                ])
                            );
                        });
                        return overlays;
                    }()
                ])
            ])
        ])

    }

};

let mainTemplate = {
    oninit: function(vnode) {
        // In case no generator is selected , select default.
        if (!app.existingGenerator(vnode.attrs.generator)){
            m.route.set('/'+state.defaultGenerator)
        } else {
            app.fetchGeneratorAssets(vnode.attrs.generator);
        }
    },
    onupdate: function(vnode) {
        // Draw canvas if assets are loaded (also updates)
        if (app.assetsLoaded(vnode.attrs.generator)) {
            app.initCanvas(vnode.attrs.generator)
        }
    },
    onbeforeupdate: function(vnode) {
        if (!app.existingGenerator(vnode.attrs.generator)){
            m.route.set('/'+state.defaultGenerator);
            return false
        }
        app.fetchGeneratorAssets(vnode.attrs.generator);
        return true
    },

    view : function(vnode) {
        let currentGenerator = vnode.attrs.generator;
        let topMargin = 0;

        // Don't try to draw anything if no generator selected (can happen with no default)
        if (!app.existingGenerator(currentGenerator)) {
            return false
        }

        // Position Canvas appropriately using CSS
        if (app.assetsLoaded(currentGenerator)) {
            topMargin = ( 540 - (state.generators[currentGenerator].template.height*app.getCanvasScaleRatio(currentGenerator,2)) ) / 2; // TODO: 2 times scale is hardcorded here? Should it?
        }

        return m("main", {class:"pv3"}, [
            m("div", {class: "mw9 center ph1-ns"}, [
                m("div", {class: "cf ph1-ns"}, [
                    m("div", {class: "fl w-100-ns pa1"}, [

                        m("div",{class:"fl w-70 w-100-m mv1 pv1 ph3"},[
                            m("h1",{class:"f5 bg-near-black white mv0 pv2 ph3 br--top br3"},[state.generators[currentGenerator].title]),
                            m("div",{class:"crt br--bottom br3 mb2", id:"monitor"},[
                                (app.assetsLoaded(currentGenerator))?m("canvas", {id: "death", style: "margin-top:"+topMargin+"px;"}, ["No canvas!"]):'',
                                m(copyrightComponent)
                            ]),
                        ]),

                        m("div",{class:"fl w-30 w-100-m pv1"},[
                            m(generatorTextComponent),
                            m(generatorOptionsComponent),
                            m("div",{class:"fl w-100 pv4 tr"},[
                                m("img", {src: state.floppyURL, width: "96", height: "96", onclick: app.saveCanvas, id:"floppy"})
                            ])
                        ]),

                        m("div",{class:"fl w-100 pv1 ph3"},[
                            m("h1",{class:"f5 bg-near-black white mv0 pv2 ph3 br--top br3"},[
                                "Games"+((state.filter==='')?'':' (Filtered)'),
                                m("input",{class:"fr f6 br2 m0 v-mid ph2", style:"border:none;", placeholder:"Filter games...", oninput:m.withAttr('value',function(value){state.filter=value;}) },[])
                            ]),

                            m("div", {id:"generators",class:"fl w-100 pa2 bg-white ba b--black-20"}, [
                                m(generatorsComponent)
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