// var version1 = "1.1";
// var version2 = "1.1.1";

// alert(version_compare(version1, version2));
// v1>v2 (1)
// v2>v1 (-1)
// v1=v2 (0)
module.exports.compare = function(v1, v2) {
    var v1parts = v1.split('.');
    var v2parts = v2.split('.');

    for (var i = 0; i < v1parts.length; ++i) {
        if (v2parts.length == i) {
            return 1;//v1 + " is larger";
        }

        if (v1parts[i] == v2parts[i]) {
            continue;
        }
        else if (v1parts[i] > v2parts[i]) {
            return 1;//v1 + " is larger";
        }
        else {
            return -1;//v2 + " is larger";
        }
    }

    if (v1parts.length != v2parts.length) {
        return -1;//v2 + " is larger";
    }

    return 0;//"versions are equal";
}