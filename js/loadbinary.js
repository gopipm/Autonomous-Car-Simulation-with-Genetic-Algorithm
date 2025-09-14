/**
 * Load binary file data
 * Compatible with p5.js v2.0.5
 * @param {string} file - Path to the file to load
 * @param {function} callback - Callback function to execute when file is loaded
 * @returns {Object} Data object with bytes property
 */
p5.prototype.loadBytes = function(file, callback) {
  var self = this;
  var data = {};
  var oReq = new XMLHttpRequest();
  oReq.open("GET", file, true);
  oReq.responseType = "arraybuffer";
  oReq.onload = function(oEvent) {
    var arrayBuffer = oReq.response;
    if (arrayBuffer) {
      data.bytes = new Uint8Array(arrayBuffer);
      if (callback) {
        callback(data);
      }
    }
  }
  oReq.send(null);
  return data;
}