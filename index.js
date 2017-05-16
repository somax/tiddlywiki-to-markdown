const tiddlers = require('./input/tiddlers.json');
const fs = require('fs');
const makeDir = require('make-dir');

const outputPath = 'output/';
const outputFile = outputPath + 'output.md';
const outputWS = fs.createWriteStream(outputFile, {
    flags: 'a' // 'a' means appending (old data will be preserved)
})

function output(l) {
    // console.log(l);
    outputWS.write(l + '\n');
}


const convertor = {
    "image/png": (tiddler) => {
        // write to file
        var data = tiddler.text.replace(/^data:image\/\w+;base64,/, "");
        var buf = new Buffer(data, 'base64');
        fs.writeFileSync(outputPath + tiddler.title, buf);
    },
    "image/svg+xml": (tiddler) => {
        // write to file
        fs.writeFileSync(outputPath + tiddler.title, tiddler.text)
    },
    "text/vnd.tiddlywiki": (tiddler) => {
        let lines = tiddler.text.split('\n');

        for (let l of lines) {
            let _l = l
                .replace(/^by \[.+/, '')
                .replace(/^;by \[.+/, '')
                .replace(/^#\*/, '  *')
                .replace(/^#/, '* ')
                .replace(/^\*;/, '* ')
                .replace(/^\*/, '* ')
                .replace(/^\*   /, '* ')
                .replace(/^\*  /, '* ')
                .replace(/^:/, '  * ')
                .replace(/^!!!!/, '#### ')
                .replace(/^!!!/, '### ')
                .replace(/^!!/, '## ')
                .replace(/^!/, '## ')

                .replace(/''(.+?)''/g, '*$1*')
                .replace(/\[\[(.+?)\|(.+)\]\]/g, '[$1]($2)')
                .replace(/\[\[(.+?)\]\]/g, '[$1]($1)')

                .replace(/\[img\[(.+?)\]\]/g, '![]($1)')

            output(_l);
        }
    }
}




function convert(tiddler) {
    output(`# ${tiddler.title}
    `)

    let tags = tiddler.tags ? tiddler.tags
        .split(' ')
        .join(', ')
        .replace(/\[\[(.+)\]\]/, '$1') : '';

    output(`> tags: ${tags}\n`)

    if (Object.keys(convertor).indexOf(tiddler.type) !== -1) {
        convertor[tiddler.type](tiddler);
    } else {
        output(tiddler.text);

    }

    output('\n-------------\n')
}


makeDir(outputPath).then(() => {
    fs.writeFileSync(outputFile, '');

    for (let t of tiddlers) {
        convert(t);
    }
})
