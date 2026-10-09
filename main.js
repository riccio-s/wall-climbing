import * as THREE from './libraries/three.module.js';
import { OrbitControls } from './addons/OrbitControls.js';
import { DragControls } from './addons/DragControls.js';
import { CSS2DRenderer, CSS2DObject } from './addons/CSS2DRenderer.js';
import { GLTFLoader } from './addons/GLTFLoader.js';

import * as CANNON from './libraries/cannon-es.js';
import * as TWEEN from './libraries/tween.js/dist/tween.esm.js';

const canvas = document.querySelector('#c');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

camera.position.z = -5;
camera.position.y = 2;
camera.lookAt(0,10,1);

const renderer = new THREE.WebGLRenderer({antialias: true, canvas});
renderer.shadowMap.enabled = true;

document.body.appendChild( renderer.domElement );

function resizeRendererToDisplaySize(renderer) {
	const canvas = renderer.domElement;
	const width = canvas.clientWidth;
	const height = canvas.clientHeight;
	const needResize = canvas.width !== width || canvas.height !== height;
	if (needResize) {
		renderer.setSize(width, height, false);
		labelRenderer.setSize( window.innerWidth, window.innerHeight );
	}
	return needResize;
}

const textureloader = new THREE.TextureLoader();

const rocktexture = textureloader.load( './assets/rock.png' );
rocktexture.colorSpace = THREE.SRGBColorSpace;
rocktexture.wrapS = THREE.RepeatWrapping;
rocktexture.wrapT = THREE.RepeatWrapping;
rocktexture.repeat.set(1, 2);

const rockmaterial = new THREE.MeshPhongMaterial({
	color: 0xffffff,
	map: rocktexture
});

function animate( time ) {
	world.step(1/60);
	
	updatedynamics ();
	
	tweenlist.forEach(tween => {
		tween.update();
	})
	
	if (resizeRendererToDisplaySize(renderer)) {
		const canvas = renderer.domElement;
		camera.aspect = canvas.clientWidth / canvas.clientHeight;
		camera.updateProjectionMatrix();
	}
	
    renderer.render( scene, camera );
	labelRenderer.render( scene, camera );
    requestAnimationFrame(animate);
}

// PHYSICS WORLD
		
const world = new CANNON.World({
	gravity: new CANNON.Vec3(0, -9.81, 0)
});
//

const wallgeometry = new THREE.BoxGeometry( 4, 8, 0.2);
const wallmaterial = new THREE.MeshStandardMaterial({color: 0xeeeeee});//rockmaterial//
let wall = new THREE.Mesh(wallgeometry, wallmaterial);
wall.castShadow = true;
wall.receiveShadow = true;
wall.position.z = 1.12;
wall.position.y = 4;
scene.add(wall);



let labelRenderer = new CSS2DRenderer();
labelRenderer.setSize( window.innerWidth, window.innerHeight );
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
document.body.appendChild( labelRenderer.domElement );




const orbitcontrols = new OrbitControls( camera, labelRenderer.domElement );
orbitcontrols.minDistance = 0.2;
orbitcontrols.maxDistance = 100;




const wallBody = new CANNON.Body({
			shape: new CANNON.Box(new CANNON.Vec3(2, 4, 0.1)),
			position: new CANNON.Vec3(0, 4, 1.12),
			type: CANNON.Body.STATIC,
});
world.addBody(wallBody);


const floorgeometry = new THREE.PlaneGeometry( 10000, 10000);
const floormaterial = new THREE.MeshStandardMaterial({color: 0x666666});
let floor = new THREE.Mesh(floorgeometry, floormaterial);
floor.receiveShadow = true;
scene.add(floor);

const floorBody = new CANNON.Body({
			shape: new CANNON.Plane(),
			type: CANNON.Body.STATIC,
			collisionFilterGroup: 2,
			//collisionFilterMask: 2
});
world.addBody(floorBody);
floorBody.quaternion.setFromEuler(-Math.PI/2,0,0);

floor.quaternion.copy(floorBody.quaternion);

const loader = new GLTFLoader();
const gltf = await loader.loadAsync( './assets/climber1.glb' );
let model = gltf.scene;
scene.add( model );
model.position.set(0, 0, 0);
//console.log('hello', model);

let ossa = {};
let glb_meshes = []
model.traverse(function (child) {
	//console.log(child.name, child.parent.name);
	console.log(child.name)
	if (child.isBone) {
		ossa[child.name] = child;
	}
	
	if (child.isMesh) {
		child.frustumCulled = false;
		child.receiveShadow = true;
		child.castShadow = true;
		glb_meshes.push(glb_meshes)
	}
});

//ossa['head'].position.x = 0.1;

console.log(ossa);


//CHARACTER

function makeInstance(geometry, material, x, y, z, bodygeometry, mass) {
	
	const thing = new THREE.Mesh(geometry, material);
	thing.receiveShadow = true;
	thing.castShadow = true;
 
	thing.position.x = x;
	thing.position.y = y;
	thing.position.z = z;
	
	//scene.add(thing);
	
	const body = new CANNON.Body({
		mass: mass,
		shape: bodygeometry,
		position: new CANNON.Vec3(x, y, z),
		collisionFilterGroup: 2,
		//collisionFilterMask: 2
	});
	
	world.addBody(body);
	
	meshes.push(thing);
	bodies.push(body);
	
	return [thing, body] 
}

let meshes = [];
let bodies = [];

function world_coordinates (bone){
	let global = {x:ossa[bone].position.x, y:ossa[bone].position.y, z:ossa[bone].position.z};
	return global
}
/*
const bone_names = Object.keys(ossa);

let bones_global = {}
bone_names.forEach(bone_name => {
	bones_global[bone_name] = world_coordinates (ossa[bone_name])
})
*/

function updatedynamics () {
	var i=0;
	
	ossa['pony'].position.copy(ponybody.position)
	ossa['head'].position.copy(headbody.position)
	ossa['torso'].position.copy(torsobody.position)
	ossa['hips'].position.copy(hipsbody.position)
	ossa['thighR'].position.copy(new THREE.Vector3(thigh1body.position.x,thigh1body.position.y,thigh1body.position.z - 0.1))
	ossa['thighL'].position.copy(new THREE.Vector3(thigh2body.position.x,thigh2body.position.y,thigh2body.position.z - 0.1))
	ossa['calfR'].position.copy(new THREE.Vector3(calf1body.position.x,calf1body.position.y,calf1body.position.z - 0.1))
	ossa['calfL'].position.copy(new THREE.Vector3(calf2body.position.x,calf2body.position.y,calf2body.position.z - 0.1))
	ossa['footR'].position.copy(new THREE.Vector3(foot1body.position.x,foot1body.position.y + 0.05,foot1body.position.z - 0.1))
	ossa['footL'].position.copy(new THREE.Vector3(foot2body.position.x,foot2body.position.y + 0.05,foot2body.position.z - 0.1))
	ossa['upperarmR'].position.copy(upperarm1body.position)
	ossa['upperarmL'].position.copy(upperarm2body.position)
	ossa['lowerarmR'].position.copy(lowerarm1body.position)
	ossa['lowerarmL'].position.copy(lowerarm2body.position)
	ossa['handR'].position.copy(hand1body.position)
	ossa['handL'].position.copy(hand2body.position)
	ossa['backpack'].position.copy(backpackbody.position)
	
	
	ossa['pony'].quaternion.copy(ponybody.quaternion)
	ossa['head'].quaternion.copy(headbody.quaternion)
	ossa['torso'].quaternion.copy(torsobody.quaternion)
	ossa['hips'].quaternion.copy(hipsbody.quaternion)
	ossa['thighR'].quaternion.copy(thigh1body.quaternion)
	ossa['thighL'].quaternion.copy(thigh2body.quaternion)
	ossa['calfR'].quaternion.copy(calf1body.quaternion)
	ossa['calfL'].quaternion.copy(calf2body.quaternion)
	ossa['footR'].quaternion.copy(calf1body.quaternion)
	ossa['footL'].quaternion.copy(calf2body.quaternion)
	ossa['upperarmR'].quaternion.copy(upperarm1body.quaternion)
	ossa['upperarmL'].quaternion.copy(upperarm2body.quaternion)
	ossa['lowerarmR'].quaternion.copy(lowerarm1body.quaternion)
	ossa['lowerarmL'].quaternion.copy(lowerarm2body.quaternion)
	ossa['handR'].quaternion.copy(lowerarm1body.quaternion)
	ossa['handL'].quaternion.copy(lowerarm2body.quaternion)
	ossa['backpack'].quaternion.copy(backpackbody.quaternion)
	
	
	meshes.forEach( mesh => {
		let body = bodies[i];
		mesh.position.copy(body.position);
		mesh.quaternion.copy(body.quaternion);
		i+=1;
	});
	
}
		
const headgeometry = new THREE.SphereGeometry(0.1);
const headbodygeometry = new CANNON.Sphere(0.1);
const headmass = 5;
let [head, headbody] = makeInstance(headgeometry, new THREE.MeshStandardMaterial({color: 0xffffff}),  0, 1.65, 0, headbodygeometry, headmass);

const nasogeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.05 );
const naso = new THREE.Mesh(nasogeometry, new THREE.MeshStandardMaterial({color: 0xff0000}));
naso.position.y = 0;
naso.position.z = 0.1;
naso.rotation.x = Math.PI/2
		
head.add(naso);
		
const ponygeometry = new THREE.SphereGeometry(0.1);
const ponybodygeometry = new CANNON.Sphere(0.1);
const ponymass = 1;
let [pony, ponybody] = makeInstance(ponygeometry, new THREE.MeshStandardMaterial({color: 0xffffff}),  0, 1.75, -0.1, ponybodygeometry, ponymass);

const constraint0 = new CANNON.ConeTwistConstraint(ponybody, headbody,  {
			pivotA: new CANNON.Vec3(0,-0.08,0.08),//(0,-0.08,0.08)
            pivotB: new CANNON.Vec3(0,0.1,-0.1),//(0,0.1,-0.1)
            axisA: new CANNON.Vec3(0, 0, 1),//(0, 1, 1)
            axisB: new CANNON.Vec3(0, 0, 1),//(0, 1, 1)
            angle: Math.PI/2,
			twistAngle: 0
});
world.addConstraint(constraint0);

const torsogeometry = new THREE.CylinderGeometry(0.13, 0.13, 0.3);
const torsobodygeometry = new CANNON.Cylinder(0.13, 0.13, 0.3);
const torsomass = 5;
let [torso, torsobody] = makeInstance(torsogeometry, new THREE.MeshStandardMaterial({color: 0xffffff}),  0, 1.35, 0, torsobodygeometry, torsomass);
		

const constraint1 = new CANNON.ConeTwistConstraint(headbody, torsobody,  {
			pivotA: new CANNON.Vec3(0,-0.15,0),
            pivotB: new CANNON.Vec3(0,0.15,0),
            axisA: CANNON.Vec3.UNIT_Y,
            axisB: CANNON.Vec3.UNIT_Y,
            angle: 0,
			twistAngle: 0
});
world.addConstraint(constraint1);

		
const hipsgeometry = new THREE.SphereGeometry(0.12)
const hipsbodygeometry = new CANNON.Sphere(0.12);
const hipsmass = 20;
let [hips, hipsbody] = makeInstance(hipsgeometry, new THREE.MeshStandardMaterial({color: 0xffffff}),  0, 1.075, 0, hipsbodygeometry, hipsmass);
		

const constraint2 = new CANNON.ConeTwistConstraint(hipsbody, torsobody,  {
			pivotA: new CANNON.Vec3(0,0.12,0),
            pivotB: new CANNON.Vec3(0,-0.15,0),
            axisA: CANNON.Vec3.UNIT_Y,
            axisB: CANNON.Vec3.UNIT_Y,
            angle: 0,//Math.PI/2,
			twistAngle: 0
});
world.addConstraint(constraint2);
		
const thighgeometry = new THREE.CylinderGeometry(0.08, 0.05, 0.4 );
const thighbodygeometry = new CANNON.Cylinder(0.08, 0.05, 0.4);
const thighmass = 5;

let [thigh1, thigh1body] = makeInstance(thighgeometry, new THREE.MeshStandardMaterial({color: 0xffffff}),  -0.1, 0.75, 0, thighbodygeometry, thighmass);
let [thigh2, thigh2body] = makeInstance(thighgeometry, new THREE.MeshStandardMaterial({color: 0xffffff}),  0.1, 0.75, 0, thighbodygeometry, thighmass);

const constraint3 = new CANNON.ConeTwistConstraint(thigh1body, hipsbody,  {
			pivotA: new CANNON.Vec3(0,0.2,0),
            pivotB: new CANNON.Vec3(-0.08,-0.12,0),
            axisA: CANNON.Vec3.UNIT_Y,
            axisB: CANNON.Vec3.UNIT_Y,
            angle: Math.PI/2,
			twistAngle: 0
});
world.addConstraint(constraint3);
		
		
const constraint4 = new CANNON.ConeTwistConstraint(thigh2body, hipsbody,  {
			pivotA: new CANNON.Vec3(0,0.2,0),
            pivotB: new CANNON.Vec3(0.08,-0.12,0),
            axisA: CANNON.Vec3.UNIT_Y,
            axisB: CANNON.Vec3.UNIT_Y,
            angle: Math.PI/2,
			twistAngle: 0
});
world.addConstraint(constraint4);
		
const calfgeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.4 );
const calfbodygeometry = new CANNON.Cylinder(0.05, 0.05, 0.4);
const calfmass = 5;

let [calf1, calf1body] = makeInstance(calfgeometry, new THREE.MeshStandardMaterial({color: 0xffffff}),  -0.1, 0.3, 0, calfbodygeometry, calfmass);
let [calf2, calf2body] = makeInstance(calfgeometry, new THREE.MeshStandardMaterial({color: 0xffffff}),  0.1, 0.3, 0, calfbodygeometry, calfmass);
		
const constraint5 = new CANNON.ConeTwistConstraint(calf1body, thigh1body,  {
			pivotA: new CANNON.Vec3(0,0.2,0),
            pivotB: new CANNON.Vec3(0,-0.2,0),
            axisA: CANNON.Vec3.UNIT_Y,
            axisB: CANNON.Vec3.UNIT_Z, //Z
            angle: Math.PI/2,//2
			twistAngle: 0
});
world.addConstraint(constraint5);
		
const constraint6 = new CANNON.ConeTwistConstraint(calf2body, thigh2body,  {
			pivotA: new CANNON.Vec3(0,0.2,0),
            pivotB: new CANNON.Vec3(0,-0.2,0),
            axisA: CANNON.Vec3.UNIT_Y,
            axisB: CANNON.Vec3.UNIT_Z, //Z
            angle: Math.PI/2,//2
			twistAngle: 0
});
world.addConstraint(constraint6);

const footgeometry = new THREE.BoxGeometry( 0.1, 0.05, 0.1);
const footbodygeometry = new CANNON.Box(new CANNON.Vec3(0.05, 0.025, 0.05));
const footmass = 5;

let [foot1, foot1body] = makeInstance(footgeometry, new THREE.MeshStandardMaterial({color: 0xffffff}),  -0.1, 0.03, 0.03, footbodygeometry, footmass);
let [foot2, foot2body] = makeInstance(footgeometry, new THREE.MeshStandardMaterial({color: 0xffffff}),  0.1, 0.03, 0.03, footbodygeometry, footmass);

const constraint13 = new CANNON.ConeTwistConstraint(foot1body, calf1body,  {
			pivotA: new CANNON.Vec3(0,0.025,-0.02),
            pivotB: new CANNON.Vec3(0,-0.2,0),
            axisA: CANNON.Vec3.UNIT_Y,
            axisB: CANNON.Vec3.UNIT_Y,
            angle: Math.PI/4,
			twistAngle: Math.PI/8
});
world.addConstraint(constraint13);
		
const constraint14 = new CANNON.ConeTwistConstraint(foot2body, calf2body,  {
			pivotA: new CANNON.Vec3(0,0.025,-0.02),
            pivotB: new CANNON.Vec3(0,-0.2,0),
            axisA: CANNON.Vec3.UNIT_Y,
            axisB: CANNON.Vec3.UNIT_Y,
            angle: Math.PI/4,
			twistAngle: Math.PI/8
});
world.addConstraint(constraint14);

const upperarmgeometry = new THREE.BoxGeometry(0.25, 0.08, 0.08);
const upperarmbodygeometry = new CANNON.Box(new CANNON.Vec3(0.12, 0.04, 0.04));
const upperarmmass = 5;

let [upperarm1, upperarm1body] = makeInstance(upperarmgeometry, new THREE.MeshStandardMaterial({color: 0xffffff}),  -0.3, 1.45, 0, upperarmbodygeometry, upperarmmass);
let [upperarm2, upperarm2body] = makeInstance(upperarmgeometry, new THREE.MeshStandardMaterial({color: 0xffffff}),  0.3, 1.45, 0, upperarmbodygeometry, upperarmmass);

const constraint7 = new CANNON.ConeTwistConstraint( torsobody, upperarm1body, {
			pivotA: new CANNON.Vec3(-0.13,0.15,0),//(-0.15,0.15,0)
            pivotB: new CANNON.Vec3(0.125,0,0),
            axisA: CANNON.Vec3.UNIT_X,
            axisB: CANNON.Vec3.UNIT_X,
            angle: Math.PI/2,
			twistAngle: Math.PI/8
});
world.addConstraint(constraint7);
		
const constraint8 = new CANNON.ConeTwistConstraint( torsobody, upperarm2body, {
			pivotA: new CANNON.Vec3(0.13,0.15,0),//(0.15,0.15,0)
            pivotB: new CANNON.Vec3(-0.125,0,0),
            axisA: CANNON.Vec3.UNIT_X,
            axisB: CANNON.Vec3.UNIT_X,
            angle: Math.PI/2,
			twistAngle:Math.PI/8
});

world.addConstraint(constraint8);

const lowerarmgeometry = new THREE.BoxGeometry(0.25, 0.08, 0.08);
const lowerarmbodygeometry = new CANNON.Box(new CANNON.Vec3(0.12, 0.04, 0.04));
const lowerarmmass = 15;

let [lowerarm1, lowerarm1body] = makeInstance(lowerarmgeometry, new THREE.MeshStandardMaterial({color: 0x00ffff}),  -0.6, 1.45, 0, lowerarmbodygeometry, lowerarmmass);
let [lowerarm2, lowerarm2body] = makeInstance(lowerarmgeometry, new THREE.MeshStandardMaterial({color: 0xffff00}),  0.6, 1.45, 0, lowerarmbodygeometry, lowerarmmass);
		
const constraint9 = new CANNON.ConeTwistConstraint(lowerarm1body, upperarm1body,  {
			pivotA: new CANNON.Vec3(0.125,0,0),
            pivotB: new CANNON.Vec3(-0.125,0,0),
            axisA: CANNON.Vec3.UNIT_X,
            axisB: CANNON.Vec3.UNIT_X,//X
            angle: Math.PI/4,
			twistAngle: 0
});
world.addConstraint(constraint9);
		
const constraint10 = new CANNON.ConeTwistConstraint(lowerarm2body, upperarm2body,  {
			pivotA: new CANNON.Vec3(-0.125,0,0),
            pivotB: new CANNON.Vec3(0.125,0,0),
            axisA: CANNON.Vec3.UNIT_X,
            axisB: CANNON.Vec3.UNIT_X,//X
            angle: Math.PI/4,
			twistAngle: 0
});
world.addConstraint(constraint10);


const handgeometry = new THREE.BoxGeometry(0.1, 0.1, 0.05);
const handbodygeometry = new CANNON.Box(new CANNON.Vec3(0.05, 0.05, 0.025));
const handmass = 5;

let [hand1, hand1body] = makeInstance(handgeometry, new THREE.MeshStandardMaterial({color: 0xffffff}),  -0.8, 1.45, 0, handbodygeometry, handmass);
let [hand2, hand2body] = makeInstance(handgeometry, new THREE.MeshStandardMaterial({color: 0xffffff}), 0.8, 1.45, 0, handbodygeometry, handmass);

const constraint11 = new CANNON.ConeTwistConstraint(hand1body, lowerarm1body,  {
			pivotA: new CANNON.Vec3(0.06,0,0),
            pivotB: new CANNON.Vec3(-0.14,0,0),
            axisA: CANNON.Vec3.UNIT_X,
            axisB: CANNON.Vec3.UNIT_X,
            angle: Math.PI/4,
			twistAngle: Math.PI/4
		});
world.addConstraint(constraint11);
		
const constraint12 = new CANNON.ConeTwistConstraint(hand2body, lowerarm2body,  {
			pivotA: new CANNON.Vec3(-0.06,0,0),
            pivotB: new CANNON.Vec3(0.14,0,0),
            axisA: CANNON.Vec3.UNIT_X,
            axisB: CANNON.Vec3.UNIT_X,
            angle: Math.PI/4,
			twistAngle: Math.PI/4
		});
world.addConstraint(constraint12);

//console.log(ossa['handR'].position)
console.log(ossa['handR'].position, ossa['handL'].position, hand1body.position)


const backpackgeometry = new THREE.CylinderGeometry(0.13, 0.13, 0.35);
const backpackbodygeometry = new CANNON.Cylinder(0.13, 0.13, 0.35);
const backpackmass = 10;

let [backpack, backpackbody] = makeInstance(backpackgeometry, new THREE.MeshStandardMaterial({color: 0xffffff}),  0, 1.25,  -0.13, backpackbodygeometry, backpackmass);

const constraint15 = new CANNON.ConeTwistConstraint(backpackbody, torsobody,  {
			pivotA: new CANNON.Vec3(0,0.15,0.13),
            pivotB: new CANNON.Vec3(0,0.05,-0.13),
            axisA: CANNON.Vec3.UNIT_Y,
            axisB: CANNON.Vec3.UNIT_Y,
            angle: Math.PI/4,
			twistAngle: Math.PI/4
});
world.addConstraint(constraint15);

// DRAG CONTROLS


let draggedbody;
let dragcontrols = new DragControls( meshes, camera, labelRenderer.domElement );
dragcontrols.recursive = false;
dragcontrols.addEventListener( 'drag', function ( event ) {
				
	orbitcontrols.enabled = false;
	const draggedmesh = event.object;
	draggedmesh.material.emissive.setHex(0xaaaaaa);
	
	let i = meshes.indexOf(draggedmesh);
				
	draggedbody = bodies[i];
				
	draggedbody.position.copy(draggedmesh.position);
	draggedbody.quaternion.copy(draggedmesh.quaternion);
	
} );
		
dragcontrols.addEventListener( 'dragend', function ( event ) {
	orbitcontrols.enabled = true;
	const draggedMesh = event.object;
	draggedMesh.material.emissive.setHex(0x000000);
				
} );


const handles_n = 101;
const taken = [];
const coords = [[0,0],[1,0],[-1,0],[2,0],[-2,0],
				[0,8],[1,8],[-1,8],[2,8],[-2,8]];
const st_n = coords.length
				
// crea #handles_n sostegni oltre a quelli stabiliti all'inizio

for ( let i = 0; i < handles_n; i ++ ) {
		const x_40 = Math.floor(Math.random()*40)
		const y_80 = Math.floor(Math.random()*79+1)
		
		const spot = y_80*40 + x_40
		
		if (taken.includes(spot) == false) {
			taken.push(spot)
			
			const x = x_40/10 - 2;
			const y = y_80/10
			
			coords.push([x,y])
		}	
		else {
			i-=1;
		}
}
//console.log(coords);

let graph = {};
coords.sort(function(a, b) { return a[0] - b[0]; });
coords.sort(function(a, b) { return a[1] - b[1]; });


const handlegeometry = new THREE.SphereGeometry( 0.05 );

for ( let i = 0; i < handles_n + st_n; i ++ ) {
						
	const rgb_clr ='rgb(255,0,255)'
	const handlematerial = new THREE.MeshStandardMaterial( { color: rgb_clr } );
	const handle = new THREE.Mesh( handlegeometry, handlematerial );
	handle.castShadow = true;
	handle.receiveShadow = true;
	
	handle.position.x = coords[i][0];
	handle.position.y = coords[i][1];
	handle.position.z = 1;
	scene.add( handle );
		
	const handleBody = new CANNON.Body({
		shape: new CANNON.Sphere(new CANNON.Vec3(0.05)),
		position: new CANNON.Vec3(coords[i][0], coords[i][1], 1),
		type: CANNON.Body.STATIC,
		collisionFilterGroup: 1,
		collisionFilterMask: 1
	});
	world.addBody(handleBody);
	
	const handleDiv = document.createElement( 'div' );
	handleDiv.className = 'label';
	handleDiv.textContent = `${i}`;
	handleDiv.style.backgroundColor = 'transparent';

	const handleLabel = new CSS2DObject( handleDiv );
	handleLabel.position.set(0,0,0);
	//handle.add( handleLabel );
	handleLabel.layers.set( 0 );
	
	graph[i] = [handle, handleBody, [],[]]; //one list is for the destination nodes
											//the other is for the arrows
	
	for (let j = i+1; j < handles_n + st_n; j ++) {
		
		if ((coords[j][0] - coords [i][0])**2 + (coords[j][1] - coords [i][1])**2 < (1)**2) {
			
			graph[i][2].push(j);
			
			const dir = new THREE.Vector3( coords[j][0]-coords[i][0], coords[j][1]-coords[i][1], 0)
			const length = dir.length();
			//normalize the direction vector (convert to vector of length 1)
			dir.normalize();
			const origin = new THREE.Vector3( coords[i][0], coords[i][1], 1);
			const hex = 0x00aaff;
			const arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
			
			
			graph[i][3].push(arrowHelper);
			//scene.add( arrowHelper );
		}
	}
}

//tutta la procedura si può velocizzare avendo anche un grafo con i versi invertiti delle frecce
//e facendo una specie di dfs

function removenode (graph, node) {
	graph[node][0].material.color.setHex(0x000000);
	graph[node][3].forEach((arrow) => {
		arrow.setColor(0x000000);
	});
		
	delete graph[node];
	for (const [other_node, list] of Object.entries(graph)) {
		list[2].forEach((n) => {
			if (n == node) {
				const ind = list[2].findIndex((element) => element == node);
				list[3][ind].setColor(new THREE.Color().setHex(0x000000)); //colore della freccia da other a node cambia
				list[2].splice(ind,1);
				list[3].splice(ind,1);
			};
		});
	}	
}

console.log(graph)

var looseends = true;
while (looseends)	 {
	looseends = false;
	for (const [node, list] of Object.entries(graph)) {
		//console.log(node, list[2], list[2].length == 0)
		if (list[2].length == 0 && node < handles_n + st_n/2) {
			//console.log(node)
			removenode(graph, node);
			looseends = true;
		}
	}
}

console.log(graph)


const keys = Object.keys(graph);

const node_0 = keys[0];
const node_1 = keys[1];

const x_0 = graph[node_0][0].position.x
const x_1 = graph[node_1][0].position.x
const y_0 = graph[node_0][0].position.y
const y_1 = graph[node_1][0].position.y

foot1body.mass = 0;
foot1body.updateMassProperties ();
foot1body.sleep()

foot2body.mass = 0;
foot2body.updateMassProperties ();
foot2body.sleep()

let occupied_nodes;

if (x_0 < x_1) {
	foot1body.position = new CANNON.Vec3(graph[node_0][0].position.x, graph[node_0][0].position.y + 0.05, graph[node_0][0].position.z)
	foot2body.position = new CANNON.Vec3(graph[node_1][0].position.x, graph[node_1][0].position.y + 0.05, graph[node_1][0].position.z)
	occupied_nodes = {
	'F1': [node_0, x_0, y_0],
	'F2': [node_1, x_1, y_1]
	}
}
else {
	foot2body.position = new CANNON.Vec3(graph[node_0][0].position.x, graph[node_0][0].position.y + 0.05, graph[node_0][0].position.z)
	foot1body.position = new CANNON.Vec3(graph[node_1][0].position.x, graph[node_1][0].position.y + 0.05, graph[node_1][0].position.z);
	occupied_nodes = {
	'F2': [node_0, x_0, y_0],
	'F1': [node_1, x_1, y_1]
	}
}


function BFS (graph, source, effector, occupied_nodes) {
	
	
	let Q = [source];
	
	let reachable = new Set(new String("source"));
	let positions = [];
	let cond;
	var i = 0;
	
	while (Q.length > 0 && i<100)  {
	
		//console.log(Q, Q.length);
		
		let node = Q.shift();
		
		let x = graph[node][0].position.x;
		let y = graph[node][0].position.y;
		
		if (effector == 'H1first') {
			//cond = (Math.abs(y - foot1body.position.y) < 2) && (Math.abs(x - foot2body.position.x) < 2) && (Math.abs(y - foot2body.position.y) < 2) && y > foot1body.position.y;
			cond = (Math.abs(y - occupied_nodes['F1'][2]) < 2) && (Math.abs(x - occupied_nodes['F2'][1]) < 2) && (Math.abs(y - occupied_nodes['F2'][2]) < 2) && y > occupied_nodes['F1'][2];
		}
		else if (effector == 'H1') {
			//cond = (Math.abs(x - hand2body.position.x) < 1.60) && (Math.abs(y - foot1body.position.y) < 2) && (Math.abs(x - foot2body.position.x) < 2) && (Math.abs(y - foot2body.position.y) < 2) && x < hand2body.position.x && y > foot1body.position.y;
			cond = (Math.abs(x - occupied_nodes['H2'][1]) < 1.60) && (Math.abs(y - occupied_nodes['F1'][2]) < 2.30) && (Math.abs(x - occupied_nodes['F2'][1]) < 2) && (Math.abs(y - occupied_nodes['F2'][2]) < 2.30)&& y > occupied_nodes['F1'][2]; //&& x < occupied_nodes['H2'][1] 
		}
		else if (effector == 'H2') {
			//cond = (Math.abs(x - hand1body.position.x) < 1.60) && (Math.abs(y - foot2body.position.y) < 2)&& (Math.abs(x - foot1body.position.x) < 2) && (Math.abs(y - foot1body.position.y) < 2) && x > hand1body.position.x && y > foot2body.position.y;
			cond = (Math.abs(x - occupied_nodes['H1'][1]) < 1.60) && (Math.abs(y - occupied_nodes['F2'][2]) < 2.30)&& (Math.abs(x - occupied_nodes['F1'][1]) < 2) && (Math.abs(y - occupied_nodes['F1'][2]) < 2.30)&& y > occupied_nodes['F2'][2]; //&& x > occupied_nodes['H1'][1] 
		}
		else if (effector == 'F1') {
			//cond = (Math.abs(x - foot1body.position.x) < 1.60) && (Math.abs(y - hand1body.position.y) < 2)&& (Math.abs(x - hand2body.position.x) < 2) && (Math.abs(y - hand2body.position.y) < 2) && x < foot2body.position.x && y < hand1body.position.y;
			cond = (Math.abs(x - occupied_nodes['F2'][1]) < 2)&& (Math.abs(y - occupied_nodes['F2'][2]) < 1) && (Math.abs(y - occupied_nodes['H1'][2]) < 2.30)&& (Math.abs(x - occupied_nodes['H2'][1]) < 2) && (Math.abs(y - occupied_nodes['H2'][2]) < 2.30)&& y < occupied_nodes['H1'][2] - 0.1; //&& x < occupied_nodes['F2'][1] 
		}
		else if (effector == 'F2') {
			//cond = (Math.abs(x - foot2body.position.x) < 1.60) && (Math.abs(y - hand2body.position.y) < 2)&& (Math.abs(x - hand1body.position.x) < 2) && (Math.abs(y - hand1body.position.y) < 2) && x > foot1body.position.x && y < hand2body.position.y;
			cond = (Math.abs(x - occupied_nodes['F1'][1]) < 2)&& (Math.abs(y - occupied_nodes['F1'][2]) < 1) && (Math.abs(y - occupied_nodes['H2'][2]) < 2.30)&& (Math.abs(x - occupied_nodes['H1'][1]) < 2) && (Math.abs(y - occupied_nodes['H1'][2]) < 2.30)&& y < occupied_nodes['H2'][2] - 0.1; //&& x > occupied_nodes['F1'][1] 
		}
		
		
		if (cond 
			&& (occupied_nodes['H1']==undefined || !(occupied_nodes['H1'][0]==node))
			&& (occupied_nodes['H2']==undefined || !(occupied_nodes['H2'][0]==node))
			&& !(occupied_nodes['F1'][0]==node)
			&& !(occupied_nodes['F2'][0]==node)
			) 
		
		{
			positions.push([x,y,node])
		}
		
		graph[node][2].forEach((child) => {
			
			//console.log(reachable, node)
			
			if (! (reachable.has(child))) {
				
				Q.push(child)
				reachable.add(child);
			}
		});	
		
		i+=1;
	};	
	
	if (effector == 'H1first' || effector == 'H1') {
		positions.sort(function(a, b) { return (2*(b[1]-a[1]) + a[0]-b[0]); });
		
	}
	if (effector == 'H2') {
		positions.sort(function(a, b) { return (2*(b[1]-a[1]) + b[0]-a[0]); });
		
	}
	if (effector == 'F1') {
		positions.sort(function(a, b) { return  (2*(a[1]-b[1]) + a[0]-b[0]); });
	}
	if (effector == 'F2') {
		positions.sort(function(a, b) { return (2*(a[1]-b[1]) + b[0]-a[0]) ; });
	}
	
	let pos;
	
	if (positions.length > 0){
		console.log(positions, effector)
		pos = positions[0][2]
	}
	
	//console.log(pos, positions.length > 0, occupied_nodes)
	
	return [pos, positions.length > 0, occupied_nodes]
}

function climb (start_h1, start_h2, start_f1, start_f2, occupied_nodes) {
	
	let used_nodes = [[start_f1],[start_f2],[start_h1],[start_h2]];

	const effectors = ['F1','F2','H1','H2'];
	
	let tweenlist = [];
	
	let j=0;
	let i=0;
	let node = used_nodes[i].at(-1);
	let found;
	
	while (node < handles_n + st_n/2 && j<1000){
		
		let tween;
			
		if (effectors[i] == 'H1') {
				tween = new TWEEN.Tween ({
					x: occupied_nodes['H1'][1],
					y: occupied_nodes['H1'][2] + 0.05
				});
		}
		else if (effectors[i] == 'H2') {
				tween = new TWEEN.Tween ({
					x: occupied_nodes['H2'][1],
					y: occupied_nodes['H2'][2] + 0.05
				})
		}
		else if (effectors[i] == 'F1') {
				tween = new TWEEN.Tween ({
					x: occupied_nodes['F1'][1],
					y: occupied_nodes['F1'][2] + 0.05
				})
		}
		else if (effectors[i] == 'F2') {
				tween = new TWEEN.Tween ({
					x: occupied_nodes['F2'][1],
					y: occupied_nodes['F2'][2] + 0.05
				})
		}
		
		[node, found, occupied_nodes] = BFS (graph, node, effectors[i], occupied_nodes);
		
		console.log(node, found);
		
		if (found) {
			
			graph[node][0].material.color.setHex(0xffff00);
			
			if (effectors[i] == 'H1') {
				tween.onUpdate(function (object, elapsed){
					hand1body.position = new CANNON.Vec3(object.x, object.y, 1);
				});
			}
			
			else if (effectors[i] == 'H2') {
				tween.onUpdate(function (object, elapsed){
					hand2body.position = new CANNON.Vec3(object.x, object.y, 1);
				});
			}
			
			else if (effectors[i] == 'F1') {
				tween.onUpdate(function (object, elapsed){
					foot1body.position = new CANNON.Vec3(object.x, object.y, 1);
				});
			}
			
			else if (effectors[i] == 'F2') {
				tween.onUpdate(function (object, elapsed){
					foot2body.position = new CANNON.Vec3(object.x, object.y, 1);
				});
			}
			
			used_nodes[i].push(node);
			occupied_nodes[effectors[i]] = [node, graph[node][0].position.x, graph[node][0].position.y]
			
			tween.to({x:graph[node][0].position.x, y:graph[node][0].position.y + 0.05}, 500).easing(TWEEN.Easing.Quadratic.In)
				 
			if (tweenlist.length > 0) {
				tweenlist.at(-1).chain(tween);
			}
			
			tweenlist.push(tween);
			
		}
		
		i = (i+1) % 4;
		node = used_nodes[i].at(-1);
		console.log(node)
	
		j+=1
	}
	
	return [used_nodes, tweenlist]
}


let node_2, found2
[node_2, found2, occupied_nodes] = BFS (graph, node_0, 'H1first', occupied_nodes);
console.log('H1first', node_2, found2);
if (found2) {
	
	hand1body.mass = 0;
	hand1body.updateMassProperties ();
	hand1body.sleep();
	hand1body.position = new CANNON.Vec3(graph[node_2][0].position.x, graph[node_2][0].position.y + 0.05, graph[node_2][0].position.z)
	hand1body.quaternion.setFromEuler(Math.PI/2,0,0);
	occupied_nodes['H1'] = [node_2, graph[node_2][0].position.x, graph[node_2][0].position.y]
	console.log(occupied_nodes)
}

else {
	[node_2, found2, occupied_nodes] = BFS (graph, node_1, 'H1first', occupied_nodes);
	console.log('H1first', node_2, found2);
	
	if (found2) {
	
	hand1body.mass = 0;
	hand1body.updateMassProperties ();
	hand1body.sleep();
	hand1body.position = new CANNON.Vec3(graph[node_2][0].position.x, graph[node_2][0].position.y + 0.05, graph[node_2][0].position.z)
	hand1body.quaternion.setFromEuler(Math.PI/2,0,0);
	occupied_nodes['H1'] = [node_2, graph[node_2][0].position.x, graph[node_2][0].position.y]
	console.log(occupied_nodes)
	}
}

let node_3, found3
[node_3, found3, occupied_nodes] = BFS (graph, node_1, 'H2', occupied_nodes);
console.log('H2', node_3, found3);

if (found3) {
	
	hand2body.mass = 0;
	hand2body.updateMassProperties ();
	hand2body.sleep();
	hand2body.position = new CANNON.Vec3(graph[node_3][0].position.x, graph[node_3][0].position.y + 0.05, graph[node_3][0].position.z)
	hand2body.quaternion.setFromEuler(Math.PI/2,0,0);
	occupied_nodes['H2'] = [node_3, graph[node_3][0].position.x, graph[node_3][0].position.y]
	console.log(occupied_nodes)
}

else {
	[node_3, found3, occupied_nodes] = BFS (graph, node_0, 'H2', occupied_nodes);
	console.log('H2', node_3, found3);
	
	if (found3) {
	
	hand2body.mass = 0;
	hand2body.updateMassProperties ();
	hand2body.sleep();
	hand2body.position = new CANNON.Vec3(graph[node_3][0].position.x, graph[node_3][0].position.y + 0.05, graph[node_3][0].position.z)
	hand2body.quaternion.setFromEuler(Math.PI/2,0,0);
	occupied_nodes['H2'] = [node_3, graph[node_3][0].position.x, graph[node_3][0].position.y]
	console.log(occupied_nodes)
	}
	
	else {
		hand2body.mass = 0;
		hand2body.updateMassProperties ();
		hand2body.sleep();
		occupied_nodes['H2'] = [node_2, graph[node_2][0].position.x - 1, graph[node_2][0].position.y]
	}
}

let [used_nodes, tweenlist] = climb (node_2, node_3, node_0, node_1, occupied_nodes);
console.log(used_nodes, tweenlist);
tweenlist[0].start();


//LIGHTS

const ambientlight = new THREE.AmbientLight( 0x880088 );
scene.add( ambientlight );


const light1 = new THREE.DirectionalLight(0xffffff, 3);
light1.position.set(5, 10, -5);
light1.target.position.set(-3, 0, 3);
light1.shadow.camera.far = 30;
light1.shadow.camera.top = 10;
light1.shadow.bias = -0.0005;
light1.shadow.mapSize.width = 2048
light1.shadow.mapSize.height = 2048
scene.add(light1)
scene.add(light1.target);
light1.castShadow = true;

const light2 = new THREE.PointLight(0xffaa00, 200);
light2.position.set(0, 15, -3);
//light2.target.position.set(-3, 0, 3);
//light2.shadow.camera.near = 1;
//light2.shadow.camera.far = 30;
//light2.shadow.camera.bottom = 1;
//light2.shadow.bias = -0.0005;
light2.shadow.mapSize.width = 2048
light2.shadow.mapSize.height = 2048
scene.add(light2)
//scene.add(light2.target);
light2.castShadow = true;

const cameraHelper2 = new THREE.CameraHelper(light2.shadow.camera);
//scene.add(cameraHelper2);

requestAnimationFrame(animate);
