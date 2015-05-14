; (function () {
    var app = applicationPath;
    var scriptsPath = app + "/Scripts";
    require.config({
        paths: {
            "jquery": scriptsPath + "/JQuery/jquery-1.11.1.min",
            "domready": scriptsPath + "/lib/require/domReady",
            "css": scriptsPath + "/lib/require/css",
            "text": scriptsPath + "/lib/require/text",

            "webuploader": scriptsPath + "/webuploader/webuploader.min",
            "powerWebUpload": scriptsPath + "/powerWebUpload"
        },
        shim: {

        },
        waitSeconds: 20
    });
}());
