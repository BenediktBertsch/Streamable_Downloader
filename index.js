//Libraries
const Axios = require('axios')
const fs = require('fs')
const download = require('download')
const cron = require('cron').CronJob
const config = require('./config.json')

//Configuration
const downloadpath = config.downloadpath
const username = config.username
const password = config.password
const cronjob = config.cronjob

checkInput(username, password)

function checkInput(username, password){
    if (username !== undefined && password !== undefined) {
        start(username, password)
    }else{
        console.log('Needs username and password')
    }
}

function start(username, password){
    if (cronjob !== undefined) {
        var job = new cron(cronjob, function () {
            getVideos(username, password)
        }, null, true);
        job.start()
    } else {
        getVideos(username, password)
    }
}

async function getVideos(username, password) {
    console.log('Getting needed cookies...')
    cookie = await getCookies(username, password)
    if (cookie !== 'error') {
        console.log('Getting needed video informations...')
        Axios.get('https://ajax.streamable.com/videos', {
            headers: {
                cookie
            }
        }).then(anz => {
            if (anz.data.total === 0)
                console.log('No videos found...')
            for (let index = 0; index < Math.ceil(anz.data.total / 100); index++) {
                Axios.get('https://ajax.streamable.com/videos?sort=date_added&sortd=DESC&count=100&page=' + (index + 1), {
                    headers: {
                        cookie
                    }
                }).then(response => {
                    response.data.videos.forEach(video => {
                        Axios.get('https://api.streamable.com/videos/' + video.url.split('/')[3]).then(resp => {
                            downloadvideos(resp.data, video.url.split('/')[3])
                        }).catch(err => console.log(err))
                    })
                }).catch(error => console.log(error))
            }
        }).catch(e => console.log(e))
    }
}

async function getCookies(username, password) {
    return Axios.post('https://ajax.streamable.com/check', { username, password }
    ).then(cookies => {
        if (cookies.data.error === undefined) {
            var cookie = ''
            for (let index = 0; index < cookies.headers['set-cookie'].length; index++) {
                if (cookies.headers['set-cookie'][index].includes('user_name="' + username + '"')) {
                    cookie += cookies.headers['set-cookie'][index] + '; '
                } else if (!cookies.headers['set-cookie'][index].includes('user_code=;') && cookies.headers['set-cookie'][index].includes('user_code=')) {
                    cookie += cookies.headers['set-cookie'][index] + '; '
                }
            }
            return cookie
        } else {
            if (cookies.data.error === 'AuthError') {
                console.log('Incorrect username or password.')
                return 'error'
            }
        }
    }).catch((e) => console.log(e))
}

function downloadvideos(videodata, shortcode) {
    download('https:' + videodata.files.mp4.url).then(e => {
        fs.writeFileSync(downloadpath + videodata.title + '_' + shortcode + '.mp4', e)
        console.log('Finished downloading: ' + videodata.title)
    }).catch(e => console.log(e));
}