let state = {

    defaultGenerator: 'baddudes',
    gamesFolder: 'games',
    floppyURL: 'images/floppy.png',
    filter : '',

    generatorAssets: [
        {
            'key': 'font',
            'suffix': '-font.png',
            'type': 'image'
        },
        {
            'key': 'template',
            'suffix': '-blank.png',
            'type': 'image'
        },
        {
            'key': 'settings',
            'suffix': '.json',
            'type': 'json'
        }
    ],

    generators: {
        'baddudes': {
            'title': 'Bad Dudes',
            'source': 'Data East',
            'sourceurl': 'https://en.wikipedia.org/wiki/Data_East',
            'defaulttext': " The president has been\n\nkidnapped by Ninjas.\n\n\n Are you a bad enough dude\n\nto rescue the president?"
        },
        'bm': {
            'title': 'Bio Menace',
            'source': 'Apogee Software',
            'sourceurl': 'https://en.wikipedia.org/wiki/3D_Realms',
            'defaulttext': "  Somewhere in each level, there\nis someone like me who holds a key\nto each exit.  You must find them!"
        },
        'sotn': {
            'title': 'Castlevania: Symphony of the Night',
            'source': 'Konami',
            'sourceurl': 'https://en.wikipedia.org/wiki/Konami',
            'defaulttext': 'Richter\n  Die monster.\n  You don\'t belong\n  in this world!'
        },
        'keen4': {
            'title': 'Commander Keen 4',
            'source': 'id Software',
            'sourceurl': 'https://en.wikipedia.org/wiki/Id_Software',
            'defaulttext': 'Keen enters the\n     Shadowlands'
        },
        'dos': {
            'title': 'MS-DOS',
            'source': 'Microsoft',
            'sourceurl': 'https://en.wikipedia.org/wiki/Microsoft',
            'defaulttext': "Starting MS-DOS...\n\n\nHIMEM is testing extended memory...done.\nC:\>"
        },
        'dn1': {
            'title': 'Duke Nukem 1',
            'source': 'Apogee Software',
            'sourceurl': 'https://en.wikipedia.org/wiki/3D_Realms',
            'defaulttext': "You're wrong, Proton\nbreath.  I'll be done\nwith you and still have\ntime to watch Oprah!"
        },
        'kq4': {
            'title': 'King\'s Quest 4',
            'source': 'Sierra Online',
            'sourceurl': 'https://en.wikipedia.org/wiki/Sierra_Entertainment',
            'defaulttext': '    "Thank you for playing\n           King\'s Quest IV,\n      `The Perils of Rosella.\'\n\nNext time... be more careful!"'
        },
        'mh1': {
            'title': 'Manhunter: New York',
            'source': 'Sierra Online',
            'sourceurl': 'https://en.wikipedia.org/wiki/Sierra_Entertainment',
            'defaulttext': "Now, let's back up to a few\nminutes before you made\nyour fatal mistake..."
        },

        'mgs': {
            'title': 'Metal Gear Solid',
            'source': 'Konami',
            'sourceurl': 'https://en.wikipedia.org/wiki/Konami',
            'defaulttext': "I can't believe I'm being hit on\nby the famous Solid Snake..."
        },
        'mk2': {
            'title': 'Mortal Kombat II',
            'source': 'Midway',
            'sourceurl': 'https://en.wikipedia.org/wiki/Mortal_Kombat_II',
            'defaulttext': 'Can you take the cold?',
            'contributor': '@pixel_data'
        },
        'oregon': {
            'title': 'Oregon Trail',
            'source': 'MECC',
            'sourceurl': 'https://en.wikipedia.org/wiki/MECC',
            'defaulttext': "     Here lies\n       andy\n\npeperony and\nchease"
        },
        'pokemon': {
            'title': 'Pokemon',
            'source': 'Game Freak',
            'sourceurl': 'https://en.wikipedia.org/wiki/Game_Freak',
            'defaulttext': '         CHARMANDER\nGary: WHAT?\nUnbelievable!'
        },
        'pq2': {
            'title': 'Police Quest 2',
            'source': 'Sierra Online',
            'sourceurl': 'https://en.wikipedia.org/wiki/Sierra_Entertainment',
            'defaulttext': 'Thank you for playing Police\nQuest 2. Next time, be a little more\ncareful.'
        },
        'pq3': {
            'title': 'Police Quest 3',
            'source': 'Sierra Online',
            'sourceurl': 'https://en.wikipedia.org/wiki/Sierra_Entertainment',
            'defaulttext': "Those curbs just sneak right\n    up on you, don't they?"
        },
        'sc2k': {
            'title': 'SimCity 2000 Advisor',
            'source': 'Maxis Software',
            'sourceurl': 'https://en.wikipedia.org/wiki/Maxis',
            'defaulttext': "YOU CAN'T CUT BACK ON\nFUNDING! YOU WILL\nREGRET THIS!"
        },
        'sq3': {
            'title': 'Space Quest 3',
            'source': 'Sierra Online',
            'sourceurl': 'https://en.wikipedia.org/wiki/Sierra_Entertainment',
            'defaulttext': "Thanks for playing Space Quest\n]I[. As usual, you've been a real\n                    hoot."
        },
        'sq4': {
            'title': 'Space Quest 4',
            'source': 'Sierra Online',
            'sourceurl': 'https://en.wikipedia.org/wiki/Sierra_Entertainment',
            'defaulttext': 'Just as you fade\nfrom the living \norganism club you\nthink, in\namazement, "So that\'s\nwhat my spleen looks\nlike!"'
        },
        'sf2': {
            'title': 'Street Fighter 2',
            'source': 'Capcom',
            'sourceurl': 'https://en.wikipedia.org/wiki/Super_Street_Fighter_II',
            'defaulttext': "Damme dude!",
            'contributor': '@pixel_data'
        },
        'smb': {
            'title': 'Super Mario Bros',
            'source': 'Nintendo',
            'sourceurl': 'https://en.wikipedia.org/wiki/Nintendo',
            'defaulttext': '   THANK YOU MARIO!\n\nBUT OUR PRINCESS IS IN\nANOTHER CASTLE!',
            'contributor': '@pixel_data'
        },
        'm64': {
            'title': 'Super Mario 64',
            'source': 'Nintendo',
            'sourceurl': 'https://en.wikipedia.org/wiki/Nintendo',
            'defaulttext': "Dear Mario:\nPlease come to the\ncastle. I've baked\na cake for you.\nYours truly--\nPrincess Toadstool"
        },
        'wally': {
            'title': 'Wally Bear and the NO! Gang',
            'source': 'American Game Cartridges',
            'sourceurl': 'https://en.wikipedia.org/wiki/American_Game_Cartridges',
            'defaulttext': 'Taking drugs is stupid,\nToby.'
        },
        'zerowing': {
            'title': 'Zero Wing',
            'source': 'Toaplan',
            'sourceurl': 'https://en.wikipedia.org/wiki/Toaplan',
            'defaulttext': "Cats: All your base are belong\n      to us."
        }
    }
};