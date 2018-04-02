floppyImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgAQMAAADYVuV7AAAABlBMVEX///8AAABVwtN+AAAAAWJLR0QAiAUdSAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAAd0SU1FB+IBBRQ0G7eG+BwAAACiSURBVDjLzdIxCsMwDAVQgQePOkIuIvDRmqP5Br2CS4eM8ZhBxHUUt8gE09KQtNoefGRbFgAkKQapFbNGqtBreAHbAGBTEEyCMSoM0wvdcGeF26wQksZFw2l0ZwDsB1hGsAfrYP8G7Ysa+ey3DarY7mcfN7ey606vcvoaPymMLRC1gDlIVMIVjM9JKuEKEJGJHG+xRHIL2AIjXo1/nqNxfj0AmAoaBZSWo6oAAAAASUVORK5CYII=";

mainTemplate = m("main",[
        m("div",{class:"mw9 center ph1-ns"},[
            m("div",{class:"cf ph1-ns"},[
                m("div",{class:"fl w-100 w-100-ns pa1"},[

                    m("h1",{class:"f3 fw6 ttu"},["Sierra Death Generator"]),
                    m("h2",{class:"f4"},["Generator"]),

                    m("div",{class:"tracked"},[
                        generators.map(function(generator){
                            return [ m("a",{class:"f6 link dim ph3 pv2 mb2 dib white bg-dark-gray", href:'#'+generator.key},[generator.title]), " "]
                        })
                    ]),

                    m("div",[
                        m("a",{href:"https://github.com/foone/SierraDeathGenerator"},["Code"])," by ",m("a",{href:"https://twitter.com/Foone"},["@Foone"]),
                        m("span",{id:"extra-contrib"},[", content by ",m("a",{href:"#"},["somebody"])])
                    ]),

                    m("canvas",{id:"death"},["No canvas!"]),

                    m("p",[
                        m("textarea",{cols:"40",rows:"6",class:"border-box hover-black measure b--black-20 pa2 mb2"}),

                        m("a",{href:"#",id:"save"},[
                            m("img",{src:floppyImage, width:"96", height:"96"})
                        ])
                    ])

                ])
            ])
        ])
    ]);

let root = document.body;

m.render(root, mainTemplate);