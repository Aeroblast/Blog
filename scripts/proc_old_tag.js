const atxtRegexList_old = [
  [
    /\[spoiler\]/g,
    "#spoiler",
  ],
  [/\[\/spoiler\]/g, "#/spoiler"],
  [/\[quote\]/g, "#quote"],
  [/\[\/quote\]/g, "#/quote"],
  [/\[title\](.*?)\[\/title\]/g, "#title:$1"],
  [/\[h([1-6])\](.*?)\[\/h[1-6]\]/g, "#h$1:$2"],
  [
    /\[align=(.*?)\](.*?)\[\/align\]/ig,
    "#$1:$2",
  ],
];

const fs = require('fs').promises;
const path = require('path');


const folderPath = '../docs/Text';
const targetExtension = '.atxt';


async function processFiles() {
  try {

    const files = await fs.readdir(folderPath);

    const filteredFiles = files.filter(file => path.extname(file).toLowerCase() === targetExtension);


    for (const file of filteredFiles) {
      const filePath = path.join(folderPath, file);
      console.log('处理文件: ', filePath);


      const data = await fs.readFile(filePath, 'utf8');

      let result = data;
      for (const pair of atxtRegexList_old) {
        result = result.replaceAll(pair[0], pair[1]);
      }


      await fs.writeFile(filePath, result, 'utf8');
    }
  } catch (err) {
    console.error('发生错误: ', err);
  }
}

processFiles();
