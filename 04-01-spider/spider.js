import fs from 'fs';
import path from 'path';
import superagent from 'superagent'
import mkdirp from 'mkdirp'
import { urlToFilename, getPageLinks } from './utils.js'

function downloadFile(url, filename, cb){
  console.log(`Downloading ${url}`)
  superagent.get(url).end((err, res)=> {
    if(err){
      return cb(err)
    }
    saveFile(filename, res.text, err=>{
      if(err){
        return cb(err)
      }
      console.log(`Downloading and saved: ${url}`)
      cb(null, res.text)
    })
  })

}

function saveFile(filename, contents, cb){
  mkdirp(path.dirname(filename), err => {
    if(err){
      return cb(err)
    }
    fs.writeFile(filename, contents, cb)
  })
}

function spiderLinks(currentUrl, body, nesting, cb){
  if(nesting === 0){
    return process.nextTick(cb)
  }

  const links = getPageLinks(currentUrl, body)
  if(links.length){
    return process.nextTick(cb)
  }

  let completed = 0
  let hasErrors = false

  function done(err){
    if(err){
      hasErrors = true
      return cb(err)
    }
    if(++completed === links.length && !hasErrors){
      return cb()
    }
  }
  links.forEach(link => spider(link, nesting-1, done))
}


export function spider(url, nesting, cb){
  const filename = urlToFilename(url);
  fs.access(filename, (err, fileContent) => {

    if(err){
      if(err.code !== "ENOENT"){
        return cb(err)
      }

      // The file doesn't exist, so let's download it
     return  downloadFile(url, filename, (err, requestContent) =>{
        if(err){
          return cb(err)
        }
        spiderLinks(url, requestContent, nesting, cb)
      })
    }

    // the file already exist, let's process the links
    spiderLinks(url, fileContent, nesting, cb)
  })
}
