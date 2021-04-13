importScripts("mediasource-worker-util.js");

onmessage = function(evt) {
  postMessage("Error: No message expected by Worker");
};

let util = new MediaSourceWorkerUtil();

util.mediaSource.addEventListener("sourceopen", () => {
  URL.revokeObjectURL(util.mediaSourceObjectUrl);
  sourceBuffer = util.mediaSource.addSourceBuffer(util.mediaMetadata.type);
  sourceBuffer.onerror = (err) => {
    postMessage("Error: " + err);
  };
  sourceBuffer.onupdateend = () => {
    // Reset the parser. Unnecessary for this buffering, except helps with test
    // coverage.
    sourceBuffer.abort();
    // Shorten the buffered media and test playback duration to avoid timeouts.
    sourceBuffer.remove(0.5, Infinity);
    sourceBuffer.onupdateend = () => {
      sourceBuffer.duration = 0.5;
      // Issue changeType to the same type that we've already buffered.
      // Unnecessary for this buffering, except helps with test coverage.
      sourceBuffer.changeType(util.mediaMetadata.type);
      util.mediaSource.endOfStream();
    };
  };
  util.mediaLoadPromise.then(mediaData => { sourceBuffer.appendBuffer(mediaData); },
                             err => { postMessage("Error: " + err) } );
}, { once : true });

postMessage(util.mediaSourceObjectUrl);
