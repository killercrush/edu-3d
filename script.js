$(function () {

	// параметры
	var parametrs = new function() {
		this.figureY = 30;
		this.figureX = 0;
		this.figureZ = 0;
		this.figureScale = 1;
		this.figureRotateX = 0;
		this.figureRotateY = 0;
		this.figureRotateZ = 0;
		this.lightY = 50;
		this.lightX = 30;
		this.lightZ = 40;	

		this.wireframe = false;
		this.flatShading = false;
		this.colorDiffuse = 0x26A69A;
		this.colorAmbient = 0x444444;
		this.colorSpecular = 0xFFFFFF;
		this.material = 'Lambert';
		this.tubularSegments = 64;
		this.radialSegments = 8;

	}

	var scene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera(45 
		, window.innerWidth / window.innerHeight , 0.1, 1000);
	var renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setClearColor(0x000000, 1);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	//renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	var axes = new THREE.AxisHelper( 200 );
	scene.add(axes);


	// плоскость
	var loader = new THREE.TextureLoader();
	loader.load('textures/dev_256.jpg', function ( texture ) {
		var maxAnisotropy = renderer.getMaxAnisotropy();
		texture.anisotropy = maxAnisotropy;
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping; 
		texture.repeat.set( 10, 10 );
		var planeMaterial = new THREE.MeshBasicMaterial( { map: texture, side: THREE.DoubleSide } );
		var planeMaterial =new THREE.MeshPhongMaterial( { map: texture,  color:0xffffff } )

		var planeGeometry = new THREE.PlaneBufferGeometry(200,200,1,1);
		var plane = new THREE.Mesh(planeGeometry, planeMaterial);
		plane.receiveShadow = true;
		plane.rotation.x= -0.5 * Math.PI;
		plane.position.x = 0;
		plane.position.y = 0;
		plane.position.z = 0;
		scene.add(plane);
	});

	var geometry = new THREE.TorusKnotGeometry( 16, 3, this.tubularSegments, this.radialSegments );

	var knot = new THREE.Mesh( geometry );
	knot.castShadow = true;
	knot.castShadow = true;
	scene.add( knot );

	//камера
	camera.position.x = 40;
	camera.position.y = 100;
	camera.position.z = 100;
	camera.lookAt(knot.position);

	cameraControls = new THREE.OrbitControls( camera, renderer.domElement );

	// обработка параметров
	var updateFigure = function() {
		var material;
		if (parametrs.material == 'Lambert') {
			material = new THREE.MeshLambertMaterial( {
				color: 0x000000,
				side: THREE.DoubleSide,
				wireframe: parametrs.wireframe
			} );
		}
		else if (parametrs.material == 'Phong') {
			material = new THREE.MeshPhongMaterial( {
				color: 0x000000,
				side: THREE.DoubleSide,
				shading: parametrs.flatShading ? THREE.FlatShading : THREE.SmoothShading,
				wireframe: parametrs.wireframe,
			} );
		}
		knot.material = material;
		knot.material.color.setHex( parametrs.colorDiffuse );
		lightBulb.material.color.setHex( parametrs.colorDiffuse );
		//if (knot.material.ambient)
		ambientLight.color.setHex( parametrs.colorAmbient );
		renderer.setClearColor(parametrs.colorAmbient, 1);
		//pointLight.color.setHex( parametrs.colorSpecular );
		if (knot.material.specular)
			knot.material.specular.setHex( parametrs.colorSpecular );

		var geometry = new THREE.TorusKnotGeometry( 20, 3, parametrs.tubularSegments, parametrs.radialSegments );

		knot.geometry.dispose();
		knot.geometry = geometry;
		knot.scale.set(parametrs.figureScale, parametrs.figureScale, parametrs.figureScale);
		knot.rotation.set(parametrs.figureRotateX, parametrs.figureRotateY, parametrs.figureRotateZ)
	}

	// интерфейс
	var gui = new dat.GUI();
	gui.add(parametrs, 'tubularSegments', 64, 256).name('Сегменты длины').onChange(updateFigure);
	gui.add(parametrs, 'radialSegments', 8, 64).step(1).name('Сегменты диам.').onChange(updateFigure);

	gui.add(parametrs, 'figureY', -100, 100).name('Y фигуры');
	gui.add(parametrs, 'figureX', -100, 100).name('X фигуры');
	gui.add(parametrs, 'figureZ', -100, 100).name('Z фигуры');
	gui.add(parametrs, 'figureScale', 0.1, 2).name('Масштаб').onChange(updateFigure);
	gui.add(parametrs, 'figureRotateX', 0, Math.PI * 2).name('Вращение по X').onChange(updateFigure);
	gui.add(parametrs, 'figureRotateY', 0, Math.PI * 2).name('Вращение по Y').onChange(updateFigure);
	gui.add(parametrs, 'figureRotateZ', 0, Math.PI * 2).name('Вращение по Z').onChange(updateFigure);

	gui.add(parametrs, 'lightY', -100, 100).name('Y света');
	gui.add(parametrs, 'lightX', -100, 100).name('X света');
	gui.add(parametrs, 'lightZ', -100, 100).name('Z света');

	gui.add(parametrs, 'wireframe').name('Каркас');
	gui.add(parametrs, 'flatShading').name('Плоск. затен.').onChange(updateFigure);
	gui.addColor(parametrs,'colorDiffuse').name('Цв. рассеян./фон.').onChange(updateFigure);
	gui.addColor(parametrs,'colorAmbient').name('Цвет сцены').onChange(updateFigure);
	gui.addColor(parametrs,'colorSpecular').name('Цвет блика').onChange(updateFigure);
	var figureMaterial = gui.add( 
		parametrs, 
		'material', 
		['Lambert', 'Phong'] 
	).name('Тип материала').listen();
	figureMaterial.onChange(function() { updateFigure(); });

	// освещение
	var ambientLight = new THREE.AmbientLight(0xEEEEEE); 
	ambientLight.position.set( 0, 100, 0 );
	scene.add(ambientLight);

	var pointLight = new THREE.PointLight(0xffffff, Math.PI * 4, 0, 2);
	// pointLight.shadowCameraVisible = true;
	// pointLight.shadowDarkness = 0.95;
	pointLight.shadow.mapSize.width = 1024; // default is 512
	pointLight.shadow.mapSize.height = 1024; // default is 512
	pointLight.intensity = 1;
	pointLight.castShadow = true;
	//var helper = new THREE.CameraHelper( pointLight.shadow.camera );
	//scene.add( helper );

	var lightbulbGeometry = new THREE.SphereGeometry( 4, 32, 32 );
	var lightbulbMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, transparent: true,  opacity: 0.8 } );
	var lightBulb = new THREE.Mesh( lightbulbGeometry, lightbulbMaterial );
	scene.add(lightBulb);
	scene.add(pointLight);

	$("#WebGL-output").append(renderer.domElement);
	renderer.render(scene, camera);
	updateFigure();
	animate();

	function animate() {

		requestAnimationFrame( animate );

		cameraControls.update(); // required if parametrs.enableDamping = true, or if parametrs.autoRotate = true

		//stats.update();
		updateParams();
		render();

	}

	function updateParams() {

	}
	function render() {
		knot.position.x = parametrs.figureX;
		knot.position.y = parametrs.figureY;
		knot.position.z = parametrs.figureZ;
		knot.material.wireframe = parametrs.wireframe;

		pointLight.position.set(parametrs.lightX, parametrs.lightY, parametrs.lightZ);
		lightBulb.position.set(parametrs.lightX, parametrs.lightY, parametrs.lightZ);

		renderer.render( scene, camera );

	}	
});