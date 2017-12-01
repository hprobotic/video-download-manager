var url = require('url');
var request = require('request');
var fs = require('fs');
var path = require('path');
var progress = require('request-progress');
var ProgressBar = require('progress');
var VIDEO_URLS = [];
var TOTAL_COMPLETED = 0;
var TOTAL_VIDEOS;

var boot = function(jsonEnpoint) {
  var options = {
    url: jsonEnpoint
  };
  request(options, function(error, response, body) {
    if (error) {
      console.log(error);
    } else {
      processDownInfo(body);
    }
  });
};

var processDownInfo = function(body) {
  var videos, directory;

  try {
    body = JSON.parse(body);
  } catch (Exception) {
    body = body;
  }

  directory = __dirname + '/videos/functional-javascript-v2';
  directory.split('/').forEach((dir, index, splits) => {
    const parent = splits.slice(0, index).join('/');
    const dirPath = path.resolve(parent, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
  });

  if (body) {
    videos = body.map(function(obj, index) {
      var seq = index + 1,
        url = obj.url,
        destination = directory + '/' + seq + ' - ' + obj.title + '.webm',
        title = obj.title,
        direct = obj.direct;
      return {
        url: url,
        destination: destination,
        title: title,
        direct: direct
      };
    });
  }
  VIDEO_URLS = videos;
  console.log(VIDEO_URLS[0]);
  startDownloading(VIDEO_URLS[0]);
};

var startDownloading = function(video) {
  if (fs.existsSync(video.destination)) {
    TOTAL_COMPLETED++;
    startDownloading(VIDEO_URLS[TOTAL_COMPLETED]);
    return false;
  }
  var video_download = {
    url: video.direct
  };
  request(video_download)
    .on('response', function handleResponse(res) {
      var total = Number(res.headers['content-length']) || null;
      var progressBar = new ProgressBar(
        'Downloading ' + video.title + '[:bar] :rate/bps :percent :etas',
        {
          complete: '=',
          incomplete: ' ',
          width: 20,
          total: total
        }
      );

      res.on('data', function(chunk) {
        progressBar.tick(chunk.length);
      });
    })
    .on('end', function() {
      TOTAL_COMPLETED++;
      startDownloading(VIDEO_URLS[TOTAL_COMPLETED]);
    })
    .pipe(fs.createWriteStream(video.destination));
};

module.exports.boot = boot;
