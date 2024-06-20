import {spider} from './spider.js'
spider(process.argv[2], (err, filename, download) => {
  if(err){
    console.log(err)
  } else if(download){
    console.log(`Complete the download of "${filename}"`)
  } else{
    console.log(`"${filename}" was already downloaded.`)
  }
})
