import fs from 'fs';
import path from 'path';
import superagent from 'superagent'
import mkdirp from 'mkdirp'
import {urlToFilename} from './utils.js'    

export function spider(url, cb){
  const filename = urlToFilename(url);
  fs.access(filename, err => {
    if(!err || err.code !== "ENOENT"){
      return cb(null, filename, false)
    }
    downloadFile(url, filename, err =>{
      if(err){
        return cb(err)
      }
      cb(null, filename, true)
    })
  })
}

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
