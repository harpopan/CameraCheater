var app = {
  inicio: function() {
    this.iniciaFastClick();
    this.iniciaBotones();
  },

  iniciaFastClick: function () {
    FastClick.attach(document.body);
  },

  iniciaBotones: function() {
    // Boton Camara
    var buttonAction = document.querySelector('#boton-camara');
    buttonAction.addEventListener('click', function(){
      app.cargarFoto(Camera.PictureSourceType.CAMERA);
    });

    // Boton Reset
    var filterButtons = document.querySelectorAll('.button-filter');
	  filterButtons[0].addEventListener('click', function(){
		  var canvas = document.querySelector('#foto');
		  canvas.className = "";
		  var context = canvas.getContext('2d');
		  context.putImageData(imageDataOrig, 0, 0);
    });

    // Boton B&N
    filterButtons[1].addEventListener('click', function(){
		  var canvas = document.querySelector('#foto');
		  if(!app.hasClass(canvas, 'grey')){
			 app.aplicaFiltro('gray');
			 canvas.className += ' grey';
		  }
    });

    // Boton Negativo
    filterButtons[2].addEventListener('click', function(){
		  var canvas = document.querySelector('#foto');
		  if(!app.hasClass(canvas, 'negative')){
			 app.aplicaFiltro('negative');
			 canvas.className += ' negative';
		  }
    });

    // Boton Sepia
    filterButtons[3].addEventListener('click', function(){
		  var canvas = document.querySelector('#foto');
		  if(!app.hasClass(canvas, 'sepia')){
			 app.aplicaFiltro('sepia');
			 canvas.className += ' sepia';
		  }
    });

    // Boton Experimental
    filterButtons[4].addEventListener('click', function(){
      var canvas = document.querySelector('#foto');
      if(!app.hasClass(canvas, 'magia')){       
       // Aqui va el procesamiento del filtro
       // app.aplicaFiltro('sepia');

       canvas.className += ' magia';
      }
    });    

    // Boton Galeria
    var buttonGallery = document.querySelector('#boton-galeria');
    buttonGallery.addEventListener('click', function(){
    app.cargarFoto(Camera.PictureSourceType.PHOTOLIBRARY);
    });
	
    // Boton Guardar
  	var buttonSave = document.querySelector('#boton-guardar');
      buttonSave.addEventListener('click', function(){
  		app.guardarFoto();
    });
      
  },

  cargarFoto: function(pictureSourceType){
    var opciones = {
      quality: 100,
      sourceType: pictureSourceType,
      destinationType: Camera.DestinationType.FILE_URI,
      targetWidth: 1024,
      targetHeight: 1024,
      correctOrientation: true,
	    cameraDirection: Camera.Direction.FRONT,
	    // saveToPhotoAlbum: true
    };
    navigator.camera.getPicture(app.fotoCargada, app.errorAlCargarFoto, opciones);
  },

  fotoCargada: function(imageURI) {
    var img = document.createElement('img');
    img.onload = function(){
      app.pintarFoto(img);
    }
    img.src = imageURI;
  },

  pintarFoto: function(img) {
    var canvas = document.querySelector('#foto');
	  canvas.className = "";
    var context = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0, img.width, img.height);
	  canvas.style.height = "auto";
	  imageDataOrig = context.getImageData(0, 0, canvas.width, canvas.height);
  },

  errorAlCargarFoto: function(message) {
    console.log('Fallo al tomar foto o toma cancelada: ' + message);
	  navigator.notification.alert('Fallo al tomar foto o foto cancelada.', null, 'Foto', 'Aceptar');
  },

  aplicaFiltro: function(filterName) {
    var canvas = document.querySelector('#foto');
    var context = canvas.getContext('2d');
    imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    effects[filterName](imageData.data);

    context.putImageData(imageData, 0, 0);
  },
  
  // Para controlar que no repetimos/sobreescribimos el filtro
  hasClass: function(element, cls) {
    return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
  },
  
  guardarFoto: function(){
	window.resolveLocalFileSystemURL(cordova.file.externalApplicationStorageDirectory, app.gotFS, app.fail);
  },

  // Paquete para el sistema de Guardado de archivos

  gotFS: function(fileSystem){
	var d = new Date();
	var n = d.getTime();
  var newFileName = n + ".jpg";
	// var folderApp = "files/"; // Almacenamiento interno\Android\data\com.adobe.phonegap.app\files
  // Recuerda crear la carpeta a mano
  var folderApp = "/CameraCheater/";

	fileSystem.getFile(folderApp + newFileName, {create:true, exclusive:false}, app.gotFileEntry, app.fail);
  },
  
  gotFileEntry: function(fileEntry){
	fileEntry.createWriter(app.gotFileWriter, app.fail);
  },
  
  gotFileWriter: function(writer){
	writer.onwriteend = function(evt){
		navigator.notification.alert('Foto guardada en galería', null, 'Guardar', 'Aceptar');
	};
	var canvas = document.getElementById('foto');
	var dataURL = canvas.toDataURL("image/png");
	var data = atob(dataURL.substring( "data:image/png;base64,".length )),
		asArray = new Uint8Array(data.length);

	for( var i = 0, len = data.length; i < len; ++i ) {
		asArray[i] = data.charCodeAt(i);    
	}

	var blob = new Blob( [ asArray.buffer ], {type: "image/png"} );
	writer.write(blob);
  },
  
  fail: function(e){
	console.log('Error: ' + e.code);
	navigator.notification.alert('Ha ocurrido un error al guardar', null, 'Guardar', 'Aceptar');
  },
  // Sistema de Guardado de archivos - FIN

  
};

var imageData;
var imageDataOrig;
if ('addEventListener' in document) {
  document.addEventListener("deviceready", function() {
    app.inicio();
  }, false);
};
