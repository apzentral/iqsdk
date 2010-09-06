Class('iQue.ZipDownload', {
  isa: iQue.FileDownload

, has: {
    fileName: { is: 'ro', required: false, init: 'archive.zip' }
  }

, augment: {
    onDownloadSuccess: function () {
      Ti.ZipFile.extract(this.path + '/' + this.fileName, this.path);
    }
  }
});
