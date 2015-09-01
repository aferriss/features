var w = window.innerWidth;
var h = window.innerHeight;
var img_u8;
var corners = [];
var threshold;

var canvas = document.createElement("canvas");
canvas.width = w;
canvas.height = h;

var canvas2 = document.createElement("canvas");
canvas2.width = w;
canvas2.height = h;

var video = document.createElement('video');
video.width = w;
video.height = h;


var ctx = canvas.getContext("2d");
var ctx2 = canvas2.getContext("2d");


ctx2.fillStyle = "black";
ctx2.fill();
ctx2.fillRect(0,0,w,h);

ctx2.fillStyle = "rgb(0,255,0)";

ctx.fillRect(200,h/2 - 100,100,100);
ctx.beginPath();
ctx.arc(w/2, h/2, 100, 0, 2 * Math.PI, false);
ctx.fillStyle = 'black';
ctx.fill();

ctx.fillStyle = "rgb(0,255,0)";
//ctx.strokeStyle = "rgb(0,255,0)";

img_u8 = new jsfeat.matrix_t(w, h, jsfeat.U8_t | jsfeat.C1_t);

var i = w*h;
while(--i >= 0){
	corners[i] = new jsfeat.keypoint_t(0,0,0,0);
}

threshold = 10

jsfeat.fast_corners.set_threshold(threshold);

//document.body.appendChild(canvas);
document.body.appendChild(canvas2);
//loadImage("img.jpg", ctx);
initWebcam();
draw();

function loadImage(imgPath, context){
	var imageObj = new Image();
	imageObj.onload = function(){
		context.drawImage(this, 0,0, w, h);
	};
	imageObj.src = imgPath;
}

function draw(){
	if(video.readyState === video.HAVE_ENOUGH_DATA){
		ctx.drawImage(video, 0, 0, w, h);
		var imageData = ctx.getImageData(0,0,w,h);
		jsfeat.imgproc.grayscale(imageData.data, canvas.width, canvas.height, img_u8);

		var count = jsfeat.fast_corners.detect(img_u8, corners, 0);

		var data_u32 = new Uint32Array(imageData.data.buffer);
		render_corners(corners, count, data_u32, canvas.width);

		ctx2.putImageData(imageData, 0, 0);

		/*
		for(var i = 0; i<count; i++){
			var pixel = ctx.getImageData(corners[i].x, corners[i].y, 1,1);
			var pixelData = pixel.data;
			ctx2.fillStyle = "rgb("+pixelData[0]+","+pixelData[1]+","+pixelData[2]+")";
			ctx2.fillRect(corners[i].x, corners[i].y, 1, 1);
		}
		*/
	}
	window.requestAnimationFrame(draw);
}


function render_corners(corners, count, img, step) {
	
    var pix = (0xff << 24) | (0x00 << 16) | (0xff << 8) | 0x00;
    for(var i=0; i < count; ++i)
    {
        var x = corners[i].x;
        var y = corners[i].y;
        var off = (x + y * step);
        var c = (255 << 24 ) | (off << 16) | (off << 8) | off;

        img[off] = c;
        img[off-1] = c;
        img[off+1] = c;
        img[off-step] = c;
        img[off+step] = c;
    }

/*
    for(var i=0; i < img.length; i+=4)
    {
    	if(i < corners.length){
        var x = corners[i].x ;
        var y = corners[i].y ;
        var off = Math.floor((x + y * (step))*4);

        img[off] = img[off]+1 ;
        img[off+1] = img[off+1]+1 ;
        img[off+2] = img[off+2]+1 ;

        img[off - step] = img[off - step]+1  ;
        img[off+1 - step] = img[off+1 - step]+1 ;
        img[off+2 - step] = img[off+2 - step]+1 ;

        img[off + step] = img[off + step]+1  ;
        img[off+1 + step] = img[off + 1 + step]+1 ;
        img[off+2 + step] = img[off + 2 + step]+1 ;
    	}

    }
*/


}

function initWebcam(){
  window.addEventListener('DOMContentLoaded', function(){
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;
 
    if (navigator.getUserMedia) {       
        navigator.getUserMedia({video: true, audio: false}, handleVideo, videoError);
    }
 
    function handleVideo(stream) {
      var url = window.URL || window.webkitURL;
       video.src = url ? url.createObjectURL(stream) : stream;
        video.play();
        videoLoaded = true;
    }
 
    function videoError(e) {
      alert('Error' + error.code);
    }
  });
}

