import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'lil-gui'
import Ball from './src/Ball'
import Paddle from './src/Paddle'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry'
import AIController from './src/AIController'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import srcFont from 'three/examples/fonts/helvetiker_bold.typeface.json?url'
import lights from './src/lights.js'
import Firework from './src/Firework'

/**
 * Debug
 */
// const gui = new dat.GUI()

const params = {
	planeColor: 0xb994ff, //0x9b71ea, //0x6966ff,
	fogColor: 0xb499ff, //0x9e7aff,
	fogNear: 25,
	fogFar: 150,
	paddleColor: 0x3633ff, //0x3633ff,
	ballColor: 0xce47ff, //0xe63d05,
}

// gui
// 	.addColor(params, 'paddleColor')
// 	.name('Paddle color')
// 	.onChange((val) => {
// 		pcPaddle.material.color.set(val)
// 	})

// gui
// 	.addColor(params, 'ballColor')
// 	.name('Ball color')
// 	.onChange((val) => {
// 		ball.material.color.set(val)
// 	})

// gui
// 	.add(params, 'fogNear', 0, 100, 1)
// 	.name('Near')
// 	.onChange((val) => {
// 		scene.fog.near = val
// 	})

// gui
// 	.addColor(params, 'planeColor')
// 	.name('Plane color')
// 	.onChange((val) => {
// 		planeMaterial.color.set(val)
// 	})

// gui
// 	.addColor(params, 'fogColor')
// 	.name('Fog color')
// 	.onChange((val) => {
// 		scene.background.set(val)
// 		scene.fog.color.set(val)
// 	})

// cursor
const cursor = new THREE.Vector2(0, 0)
const raycaster = new THREE.Raycaster()

/**
 * Score
 */
const score = {
	pc: 0,
	player: 0,
}

/**
 * Font loader
 */

let pcScoreMesh, playerScoreMesh, loadedFont

const TEXT_PARAMS = {
	size: 3,
	height: 0.5,
	curveSegments: 12,
	bevelEnabled: true,
	bevelThickness: 0.1,
	bevelSize: 0.05,
	bevelOffset: 0,
	bevelSegments: 5,
}
const scoreMaterial = new THREE.MeshStandardMaterial({
	color: params.ballColor,
})

const fontLoader = new FontLoader()
fontLoader.load(srcFont, function (font) {
	loadedFont = font
	const geometry = new TextGeometry('0', {
		font: font,
		...TEXT_PARAMS,
	})

	geometry.center()

	pcScoreMesh = new THREE.Mesh(geometry, scoreMaterial)

	playerScoreMesh = pcScoreMesh.clone()
	pcScoreMesh.scale.setScalar(1.5)
	pcScoreMesh.position.set(0, 2, -boundaries.y - 4)
	playerScoreMesh.position.set(0, 2, boundaries.y + 4)

	pcScoreMesh.castShadow = true
	playerScoreMesh.castShadow = true

	scene.add(pcScoreMesh, playerScoreMesh)
})

function getScoreGeometry(score) {
	const geometry = new TextGeometry(`${score}`, {
		font: loadedFont,
		...TEXT_PARAMS,
	})

	geometry.center()

	return geometry
}

/**
 * Scene
 */
const scene = new THREE.Scene()
scene.background = new THREE.Color(params.fogColor)
scene.fog = new THREE.Fog(params.fogColor, params.fogNear, params.fogFar)

scene.add(...lights)

/**
 * Cube
 */
const material = new THREE.MeshNormalMaterial()
const geometry = new THREE.BoxGeometry(1, 1, 1)

const mesh = new THREE.Mesh(geometry, material)
// scene.add(mesh)

const boundaries = new THREE.Vector2(18, 23)
const planeGeometry = new THREE.PlaneGeometry(
	boundaries.x * 20,
	boundaries.y * 20,
	boundaries.x * 20,
	boundaries.y * 20
)
planeGeometry.rotateX(-Math.PI * 0.5)
const planeMaterial = new THREE.MeshStandardMaterial({
	color: params.planeColor,
	// wireframe: true,
	// transparent: true,
	// opacity: 0.2,
})

const plane = new THREE.Mesh(planeGeometry, planeMaterial)
plane.position.y = -1.5
plane.receiveShadow = true
scene.add(plane)

const boundGeometry = new RoundedBoxGeometry(1, 2, boundaries.y * 2, 5, 0.5)
const boundMaterial = new THREE.MeshStandardMaterial({ color: 0xdddddd })
const leftBound = new THREE.Mesh(boundGeometry, boundMaterial)
leftBound.position.x = -boundaries.x - 0.5
const rightBound = leftBound.clone()
rightBound.position.x *= -1

leftBound.castShadow = true
rightBound.receiveShadow = true
rightBound.castShadow = true

scene.add(leftBound, rightBound)

const playerPaddle = new Paddle(scene, boundaries, new THREE.Vector3(0, 0, 15))
const pcPaddle = new Paddle(scene, boundaries, new THREE.Vector3(0, 0, -15))
const ball = new Ball(scene, boundaries, [playerPaddle, pcPaddle])
ball.material.color.set(params.ballColor)
pcPaddle.material.color.set(params.paddleColor)

let fireworks = []

ball.addEventListener('collide', () => {
	// console.log('collide event')
	const firework = new Firework(10 + Math.floor(Math.random() * 10), 5)
	// console.log(firework)
	scene.add(firework.mesh)
	// console.log(ball.mesh.position)
	firework.mesh.position.copy(ball.mesh.position)

	fireworks.push(firework)
})

ball.addEventListener('ongoal', (e) => {
	// console.log('goal', e.message)
	score[e.message] += 1

	const geometry = getScoreGeometry(score[e.message])

	const mesh = e.message === 'pc' ? pcScoreMesh : playerScoreMesh

	mesh.geometry = geometry

	// console.log(playerScoreMesh.geometry)
	mesh.geometry.getAttribute('position').needsUpdate = true

	// console.log(score)
})

/**
 * render sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
}
/**
 * Camera
 */
const fov = 60
const camera = new THREE.PerspectiveCamera(fov, sizes.width / sizes.height, 0.1)
camera.position.set(0, 20, 45)
camera.lookAt(new THREE.Vector3(0, 0, 0))

/**
 * Show the axes of coordinates system
 */
const axesHelper = new THREE.AxesHelper(3)
// scene.add(axesHelper)

/**
 * renderer
 */
const renderer = new THREE.WebGLRenderer({
	antialias: window.devicePixelRatio < 2,
	// logarithmicDepthBuffer: true,
})
document.body.appendChild(renderer.domElement)
handleResize()

renderer.shadowMap.enabled = true
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.2
renderer.shadowMap.type = THREE.VSMShadowMap

/**
 * OrbitControls
 */
// const controls = new OrbitControls(camera, renderer.domElement)
// controls.enableDamping = true

/**
 * Three js Clock
 */
const clock = new THREE.Clock()

const controller = new AIController(pcPaddle, ball)

/**
 * frame loop
 */
function tic() {
	/**
	 * tempo trascorso dal frame precedente
	 */
	const deltaTime = clock.getDelta()
	/**
	 * tempo totale trascorso dall'inizio
	 */
	// const time = clock.getElapsedTime()
	raycaster.setFromCamera(cursor, camera)
	const [intersection] = raycaster.intersectObject(plane)

	const dt = deltaTime / 10

	for (let i = 0; i < 10; i++) {
		if (intersection) {
			// console.log(intersection)

			const nextX = intersection.point.x
			const prevX = playerPaddle.mesh.position.x
			playerPaddle.setX(THREE.MathUtils.lerp(prevX, nextX, 0.02))
		}

		ball.update(dt)
		controller.update(dt)
	}

	fireworks.forEach((f) => f.update(deltaTime))

	fireworks = fireworks.filter((f) => !f.isDie)

	// controls.update()

	renderer.render(scene, camera)

	requestAnimationFrame(tic)
}

requestAnimationFrame(tic)

window.addEventListener('resize', handleResize)

function handleResize() {
	sizes.width = window.innerWidth
	sizes.height = window.innerHeight

	camera.aspect = sizes.width / sizes.height
	camera.updateProjectionMatrix()

	renderer.setSize(sizes.width, sizes.height)

	const pixelRatio = Math.min(window.devicePixelRatio, 2)
	renderer.setPixelRatio(pixelRatio)
}

window.addEventListener('mousemove', function (e) {
	cursor.x = 2 * (e.clientX / window.innerWidth) - 1
	cursor.y = -2 * (e.clientY / window.innerHeight) + 1

	// console.log(cursor.x, cursor.y)
})
