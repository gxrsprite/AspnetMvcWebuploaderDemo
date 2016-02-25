//未完成
app.directive('webuploader', ['$log', '$compile', '$timeout', function ($log, $compile, $timeout) {
    'use strict';

    return {
        restrict: 'E',
        replace: false,
        scope: {
            options: '=options',
            saveFileList: '&saveFileList'
        },
        link: function (scope, element, attr) {
            var applicationPath = ".";
            var $scope = scope;
            var item = element;
            function S4() {
                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            }


            //不支持时的处理
            if (!WebUploader.Uploader.support()) {
                var error = "上传控件不支持您的浏览器！请尝试<a target='_blank' href='http://get.adobe.com/cn/flashplayer/'>升级flash版本</a>或者<a target='_blank' href='https://www.google.com/intl/en/chrome/'>使用Chrome浏览器</a>。";
                var $a = $("<a target='_blank' href='https://www.google.com/intl/en/chrome/'>使用Chrome引擎的浏览器</a>");
                var $a2 = $("<a target='_blank' href='http://get.adobe.com/cn/flashplayer'>升级flash版本</a>");
                if (window.console) {
                    window.console.log(error);
                }

                $(item).html(error);
                return;
            }

            var defaults = {
                hiddenInputId: "uploadifyHiddenInputId", // input hidden id
                hiddenInput: null,
                onAllComplete: function (filelist) { },
                onComplete: function (event) { },
                onQueued: function (file) { },
                innerOptions: {},
                fileNumLimit: undefined,
                fileSizeLimit: undefined,
                fileSingleSizeLimit: undefined,
                PostbackHold: false,
                ShowDownload: false,
                SaveInMemory: false,
                extentions: null
            };

            var opts = $.extend({}, defaults, options);
            var target = $(item);
            var pickerid = S4();

            var uploaderStrdiv = '<div class="webuploader">' +
                '<div id="thelist" class="uploader-list"></div>' +
                '<div class="btns">' +
                '<div id="' + pickerid + '">选择文件</div>' +
                //'<a id="ctlBtn" class="btn btn-default">开始上传</a>' +
                '</div>' +
            '</div>';
            target.append(uploaderStrdiv);

            var $list = target.find('#thelist'),
                 $btn = target.find('#ctlBtn'),
                 state = 'pending',
                 uploader;
            var $picker = target.find('#' + pickerid);
            this.$list = $list;

            var jsonData = {
                fileList: []
            };

            var server = applicationPath + '/ajax/WebUploader/Process';
            //if (opts.SaveInMemory) {
            //    server = applicationPath + '/ajax/WebUploader/SaveInMemory';
            //}
            var preoptions = {

                swf: applicationPath + '/Scripts/webuploader/Uploader.swf',

                server: server,

                // input or flash.
                pick: $picker[0],

                resize: false,
                fileNumLimit: opts.fileNumLimit,
                fileSizeLimit: opts.fileSizeLimit,
                fileSingleSizeLimit: opts.fileSingleSizeLimit
            };

            if (opts.extentions) {//allow extention
                preoptions.accept = { extensions: opts.extentions };
            }
            if (opts.accept) {
                preoptions.accept = opts.accept;
            }

            var webuploaderoptions = $.extend(preoptions, opts.innerOptions);

            var uploader = WebUploader.create(webuploaderoptions);

            $.extend(scope.saveFileList, {fileList:[]});
            //backto hiddenfiled
            //TODO hdFileData.val都需要改为同步
            if (scope.saveFileList && opts.PostbackHold) {
                jsonData = scope.saveFileList;
                $.each(jsonData.fileList, function (index, fileData) {
                    var newid = S4();
                    fileData.queueId = newid;
                    $list.append('<div id="' + newid + '" class="item">' +
                    '<div class="info">' + fileData.name + '</div>' +
                    '<div class="state">已上传</div>' +
                  (opts.ShowDownload ? '<div class="download"></div>' : '') +
                    '<div class="del"></div>' +
                '</div>');
                });
                //scope.saveFileList = jsonData;
            }

            var currentFileNum = 0;
            uploader.on('fileQueued', function (file) {
                $list.append('<div id="' + file.id + '" class="item">' +
                    '<div class="info">' + file.name + '</div>' +
                    '<div class="state">等待上传...</div>' +
                    '<div class="download" style="display:none;"></div>' +
                    '<div class="del"></div>' +
                '</div>');

                if (opts.fileNumLimit) {
                    currentFileNum++;
                    if (currentFileNum >= opts.fileNumLimit) {
                        $picker.addClass("none");
                    }
                }

                opts.onQueued(file);
            });
            uploader.on('uploadProgress', function (file, percentage) {
                var $li = target.find('#' + file.id),
                    $percent = $li.find('.progress .bar');

                // avoid repeat create
                if (!$percent.length) {
                    $percent = $('<span class="progress">' +
                        '<span  class="percentage"><span class="text"></span>' +
                      '<span class="bar" role="progressbar" style="width: 0%">' +
                      '</span></span>' +
                    '</span>').appendTo($li).find('.bar');
                }

                $li.find('div.state').text('上传中');
                $li.find("span.text").text(Math.round(percentage * 100) + '%');
                $percent.css('width', percentage * 100 + '%');
            });
            uploader.on('uploadSuccess', function (file, response) {
                target.find('#' + file.id).find('div.state').text('已上传');
                if (opts.ShowDownload) {
                    target.find('#' + file.id).find('div.download').show();
                }

                var fileEvent = {
                    queueId: file.id,
                    name: file.name,
                    size: file.size,
                    extension: '.' + file.ext,
                    mimetype: file.type,
                    filePath: response.filePath,
                    cacheId: response.cacheId
                };
                jsonData.fileList.push(fileEvent)
                opts.onComplete(fileEvent);

                target.find('#' + file.id).find('.progress').fadeOut();
                scope.saveFileList = jsonData;
            });

            uploader.on('uploadError', function (file) {
                target.find('#' + file.id).find('div.state').text('上传出错');
            });

            uploader.on('uploadFinished', function () {
                opts.onAllComplete(jsonData.fileList);
            });

            uploader.on('fileQueued', function (file) {
                uploader.upload();
            });

            uploader.on('filesQueued', function (file) {
                uploader.upload();
            });

            uploader.on('all', function (type) {
                if (type === 'startUpload') {
                    state = 'uploading';
                } else if (type === 'stopUpload') {
                    state = 'paused';
                } else if (type === 'uploadFinished') {
                    state = 'done';
                }

                if (state === 'uploading') {
                    $btn.text('暂停上传');
                } else {
                    $btn.text('开始上传');
                }
            });

            $btn.on('click', function () {
                if (state === 'uploading') {
                    uploader.stop();
                } else {
                    uploader.upload();
                }
            });
            //delete
            $list.on("click", ".del", function () {
                var $ele = $(this);
                var id = $ele.parent().attr("id");
                var deletefile = {};

                $.each(jsonData.fileList, function (index, item) {
                    if (item && item.queueId === id) {
                        var getfile = uploader.getFile(id);
                        if (getfile) {
                            uploader.removeFile(getfile);
                        }
                        deletefile = jsonData.fileList.splice(index, 1)[0];
                        if (jsonData.fileList.length == 0) {
                            scope.saveFileList.fileList = [];
                        }
                        else {
                            scope.saveFileList = jsonData;
                        }

                        if (opts.SaveInMemory) {
                            $.post(applicationPath + '/ajax/WebUploader/DeleteInMemory', { 'cacheId': deletefile.cacheId }, function (returndata) {
                                $ele.parent().remove();
                            });
                        }
                        else {
                            $.post(applicationPath + '/ajax/WebUploader/Delete', { 'filePathName': deletefile.filePath }, function (returndata) {
                                $ele.parent().remove();
                            });
                        }
                        return;
                    }
                });

                if (opts.fileNumLimit) {
                    currentFileNum--;
                    if (currentFileNum < opts.fileNumLimit) {
                        $picker.removeClass("none");
                    }
                }
            });

            //download
            //$list.on("click", ".download", function () {
            //    var $ele = $(this);
            //    var id = $ele.parent().attr("id");
            //    var downloadfile = {};
            //    $.each(jsonData.fileList, function (index, item) {
            //        if (item && item.queueId === id) {
            //            downloadfile = item;
            //            $("#" + opts.hiddenInputId).val(JSON.stringify(jsonData));
            //            $.post(applicationPath + '/ajax/WebUploader/GetPathId', { 'filePathName': downloadfile.filePath, 'fileName': downloadfile.name }, function (pathid) {
            //                window.location.href = applicationPath + '/ajax/WebUploader/Download?pathid=' + pathid;
            //            });
            //            return;
            //        }
            //    });
            //});


        }//end link
    };
}]);