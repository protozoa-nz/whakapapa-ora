const fs = require('fs')
const path = require('path')

const [_, __, version ] = process.argv

fs.readFile(path.join(__dirname, 'index.template'), 'utf8', (err, content) => {
  content = content.replace(/VERSION/g, version)

  fs.writeFile(path.join(__dirname, 'index.html'), content, console.log)
})
