import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'lil-gui'
import Ball from './src/Ball'
import Paddle from './src/Paddle'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry'

/**
 * Debug
 */
// const gui = new dat.GUI()

// cursor
const cursor = new THREE.Vector2(0, 0)
const raycaster = new THREE.Raycaster()

/**
 * Scene
 */
const scene = new THREE.Scene()

/**
 * Cube
 */
const material = new THREE.MeshNormalMaterial()
const geometry = new THREE.BoxGeometry(1, 1, 1)

const mesh = new THREE.Mesh(geometry, material)
// scene.add(mesh)

const boundaries = new THREE.Vector2(15, 20)
const planeGeometry = new THREE.PlaneGeometry(
	boundaries.x * 20,
	boundaries.y * 20,
	boundaries.x * 20,
	boundaries.y * 20
)
planeGeometry.rotateX(-Math.PI * 0.5)
const planeMaterial = new THREE.MeshNormalMaterial({
	wireframe: true,
	transparent: true,
	opacity: 0.2,
})

const plane = new THREE.Mesh(planeGeometry, planeMaterial)
scene.add(plane)

const boundGeometry = new RoundedBoxGeometry(1, 2, boundaries.y * 2, 5, 0.5)
const boundMaterial = new THREE.MeshNormalMaterial()
const leftBound = new THREE.Mesh(boundGeometry, boundMaterial)
leftBound.position.x = -boundaries.x - 0.5
const rightBound = leftBound.clone()
rightBound.position.x *= -1

scene.add(leftBound, rightBound)

const playerPaddle = new Paddle(scene, boundaries, new THREE.Vector3(0, 0, 15))
const pcPaddle = new Paddle(scene, boundaries, new THREE.Vector3(0, 0, -15))
const ball = new Ball(scene, boundaries, [playerPaddle, pcPaddle])

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
camera.position.set(0, 25, 30)
camera.lookAt(new THREE.Vector3(0, 2.5, 0))

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
	logarithmicDepthBuffer: true,
})
document.body.appendChild(renderer.domElement)
handleResize()

/**
 * OrbitControls
 */
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

/**
 * Three js Clock
 */
const clock = new THREE.Clock()

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

	if (intersection) {
		// console.log(intersection)

		const nextX = intersection.point.x
		const prevX = playerPaddle.mesh.position.x
		playerPaddle.setX(THREE.MathUtils.lerp(prevX, nextX, 0.1))
	}

	ball.update(deltaTime)
	pcPaddle.setX(ball.mesh.position.x)

	controls.update()

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
