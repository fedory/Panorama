/**
 * 全景看房js
 * Created by 890 on 2016-10-12.
 */
var o = new Orienter();
o.orient = orienter;
var camera, scene, renderer;
var texture_placeholder, isUserInteracting = false,
    onMouseDownMouseX = 0,
    onMouseDownMouseY = 0,
    lon = 90,
    onMouseDownLon = 0,
    lat = 0,
    onMouseDownLat = 0,
    phi = 0,
    theta = 0,
    target = new THREE.Vector3(),
    onPointerDownPointerX,
    onPointerDownPointerY,
    onPointerDownLon,
    onPointerDownLat;
var mesh_arr = {},
    offsetPostion;
var index = 0,
    currentLoadIndex = 0;
var currentShowMesh = -1,
    isRotate = false;
var rotateAngel = IsPC() ? 180 : 90;
$(".bts").on("click", "img",
    function() {
        if (currentLoadIndex != 0) {
            return
        }
        index = $(this).index();
        changeVilla()
    });
$(".rotate").click(function() {
    if ($(this).attr("dt-value") == "1") {
        $(this).html("手动旋转");
        $(this).attr("dt-value", 0);
        o.init()
    } else {
        $(this).html("自动感应");
        $(this).attr("dt-value", 1);
        o.destroy()
    }
});
function init() {
    var d = "";
    for (var c = 0; c < name_arr.length; c++) {
        d += '<img src="' + load_url + "/" + villaId + "/" + name_arr[c] + '/thumb.jpg">'
    }
    $(".bts").html(d);
    $(".loading").css({
        "line-height": window.innerHeight + "px"
    }).show();
    if (!IsPC()) {
        $(".rotate").show()
    }
    if (!gt_ios()) {
        $(".bts").show()
    }
    if ($(".rotate").attr("dt-value") == "0") {
        o.init()
    }
    var a;
    a = document.getElementById("container");
    camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 1100);
    scene = new THREE.Scene();
    texture_placeholder = document.createElement("canvas");
    var b = texture_placeholder.getContext("2d");
    b.fillStyle = "rgb( 200, 200, 200 )";
    b.fillRect(0, 0, texture_placeholder.width, texture_placeholder.height);
    if (webglAvailable()) {
        renderer = new THREE.WebGLRenderer(true)
    } else {
        renderer = new THREE.CanvasRenderer()
    }
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    a.appendChild(renderer.domElement);
    a.addEventListener("mousedown", onDocumentMouseDown, false);
    a.addEventListener("mousemove", onDocumentMouseMove, false);
    a.addEventListener("mouseup", onDocumentMouseUp, false);
    a.addEventListener("wheel", onDocumentMouseWheel, false);
    a.addEventListener("touchstart", onDocumentTouchStart, false);
    a.addEventListener("touchmove", onDocumentTouchMove, false);
    window.addEventListener("resize", onWindowResize, false);
    changeVilla()
}
function changeVilla() {
    if (!mesh_arr[index]) {
        $(".loading").show();
        var b = IsPC() ? "pano": "mobile";
        currentLoadIndex = 0;
        var a = [loadTexture(load_url + "/" + villaId + "/" + name_arr[index] + "/" + b + "_f.jpg"), loadTexture(load_url + "/" + villaId + "/" + name_arr[index] + "/" + b + "_b.jpg"), loadTexture(load_url + "/" + villaId + "/" + name_arr[index] + "/" + b + "_u.jpg"), loadTexture(load_url + "/" + villaId + "/" + name_arr[index] + "/" + b + "_d.jpg"), loadTexture(load_url + "/" + villaId + "/" + name_arr[index] + "/" + b + "_l.jpg"), loadTexture(load_url + "/" + villaId + "/" + name_arr[index] + "/" + b + "_r.jpg")];
        var c = new THREE.Mesh(new THREE.BoxGeometry(300, 300, 300, 7, 7, 7), new THREE.MultiMaterial(a));
        c.scale.x = -1;
        mesh_arr[index] = c
    }
    THREE.Cache.clear();
    if (mesh_arr[currentShowMesh] && currentShowMesh != index) {
        scene.remove(mesh_arr[currentShowMesh])
    } else {
        if (currentShowMesh == index) {
            return
        }
    }
    scene.add(mesh_arr[index]);
    currentShowMesh = index;
    camera.fov = 100;
    camera.updateProjectionMatrix()
}
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight)
}
function loadTexture(d) {
    var b = new THREE.Texture(texture_placeholder);
    var a = new THREE.MeshBasicMaterial({
        map: b,
        overdraw: 0.5
    });
    var c = new Image();
    c.onload = function() {
        b.image = this;
        b.needsUpdate = true;
        currentLoadIndex++;
        if (currentLoadIndex == 6) {
            $(".loading").hide();
            currentLoadIndex = 0
        }
    };
    c.src = d;
    return a
}
function onDocumentMouseDown(a) {
    a.preventDefault();
    isUserInteracting = true;
    onPointerDownPointerX = a.clientX;
    onPointerDownPointerY = a.clientY;
    onPointerDownLon = lon;
    onPointerDownLat = lat
}
function onDocumentMouseMove(a) {
    if (isUserInteracting === true) {
        lon = (onPointerDownPointerX - a.clientX) * 0.2 + onPointerDownLon;
        lat = (a.clientY - onPointerDownPointerY) * 0.2 + onPointerDownLat
    }
}
function onDocumentMouseUp(a) {
    isUserInteracting = false
}
function onDocumentMouseWheel(a) {
    camera.fov += a.deltaY * 0.05;
    if (camera.fov > 110) {
        camera.fov = 110
    } else {
        if (camera.fov < 30) {
            camera.fov = 30
        }
    }
    camera.updateProjectionMatrix()
}
function onDocumentTouchStart(a) {
    a.preventDefault();
    if (a.touches.length == 1) {
        onPointerDownPointerX = a.touches[0].pageX;
        onPointerDownPointerY = a.touches[0].pageY;
        onPointerDownLon = lon;
        onPointerDownLat = lat
    } else {
        if (a.touches.length == 2) {
            offsetPostion = getDistance({
                    x: a.touches[0].pageX,
                    y: a.touches[0].pageY
                },
                {
                    x: a.touches[1].pageX,
                    y: a.touches[1].pageY
                })
        }
    }
}
function onDocumentTouchMove(c) {
    c.preventDefault();
    if (c.touches.length == 1) {
        var b = $(".rotate").attr("dt-value");
        if (b == "0" && !IsPC()) {
            return
        }
        lon = (onPointerDownPointerX - c.touches[0].pageX) * 0.2 + onPointerDownLon;
        lat = (c.touches[0].pageY - onPointerDownPointerY) * 0.2 + onPointerDownLat
    } else {
        if (c.touches.length == 2) {
            var a = getDistance({
                    x: c.touches[0].pageX,
                    y: c.touches[0].pageY
                },
                {
                    x: c.touches[1].pageX,
                    y: c.touches[1].pageY
                });
            camera.fov += (offsetPostion - a) * 0.01;
            if (camera.fov > 110) {
                camera.fov = 110
            } else {
                if (camera.fov < 30) {
                    camera.fov = 30
                }
            }
            camera.updateProjectionMatrix()
        }
    }
}
function orienter(a) {
    lon = 360 - Math.abs(a.lon);
    lat = a.lat
}
function animate() {
    requestAnimationFrame(animate);
    update()
}
function update() {
    if (isUserInteracting === false && $(".rotate").attr("dt-value") == "1" || IsPC()) {
        lon += 0.05
    }
    lat = Math.max( - 85, Math.min(85, lat));
    phi = THREE.Math.degToRad(rotateAngel - lat);
    theta = THREE.Math.degToRad(lon);
    target.x = 500 * Math.sin(phi) * Math.cos(theta);
    target.y = 500 * Math.cos(phi);
    target.z = 500 * Math.sin(phi) * Math.sin(theta);
    camera.lookAt(target);
    renderer.render(scene, camera)
}
function getDistance(d, c) {
    var a = c.x - d.x;
    var b = c.y - d.y;
    return Math.pow((a * a + b * b), 0.5)
}
function IsPC() {
    var a = navigator.userAgent;
    var d = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
    var b = true;
    for (var c = 0; c < d.length; c++) {
        if (a.indexOf(d[c]) > 0) {
            b = false;
            break
        }
    }
    return b
}
function browser() {
    var b = window.navigator.userAgent.toLowerCase();
    if (b.indexOf("msie") >= 0) {
        var a = b.match(/msie ([\d.]+)/)[1];
        return {
            type: "IE",
            version: a
        }
    } else {
        if (b.indexOf("firefox") >= 0) {
            var a = b.match(/firefox\/([\d.]+)/)[1];
            return {
                type: "Firefox",
                version: a
            }
        } else {
            if (b.indexOf("chrome") >= 0) {
                var a = b.match(/chrome\/([\d.]+)/)[1];
                return {
                    type: "Chrome",
                    version: a
                }
            } else {
                if (b.indexOf("opera") >= 0) {
                    var a = b.match(/opera.([\d.]+)/)[1];
                    return {
                        type: "Opera",
                        version: a
                    }
                } else {
                    if (b.indexOf("Safari") >= 0) {
                        var a = b.match(/version\/([\d.]+)/)[1];
                        return {
                            type: "Safari",
                            version: a
                        }
                    }
                }
            }
        }
    }
    return {
        type: "",
        version: ""
    }
}
function gt_ios() {
    console.log(navigator.userAgent);
    if ((navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i))) {
        return Boolean(navigator.userAgent.match(/OS [4-9]_\d[_\d]* like Mac OS X/i))
    } else {
        return false
    }
}
function webglAvailable() {
    try {
        var a = document.createElement("canvas");
        return !! (window.WebGLRenderingContext && (a.getContext("webgl") || a.getContext("experimental-webgl")))
    } catch(b) {
        return false
    }
}
function isIos() {
    var a = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(a)) {
        return true
    } else {
        if (/android/.test(a)) {
            return false
        }
    }
    return false
};