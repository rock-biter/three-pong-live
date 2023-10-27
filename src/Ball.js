import {
	EventDispatcher,
	Mesh,
	MeshBasicMaterial,
	MeshNormalMaterial,
	MeshStandardMaterial,
	Raycaster,
	SphereGeometry,
	Vector3,
} from 'three'

export default class Ball extends EventDispatcher {
	speed = 15
	velocity = new Vector3(1, 0, 0.5)

	constructor(scene, boundaries, paddles) {
		super()

		this.scene = scene
		this.paddles = paddles
		this.boundaries = boundaries
		this.radius = 0.5
		this.geometry = new SphereGeometry(this.radius)
		this.material = new MeshStandardMaterial({ color: 0xffaa00 })
		this.mesh = new Mesh(this.geometry, this.material)
		this.mesh.castShadow = true
		this.mesh.receiveShadow = true

		this.velocity.multiplyScalar(this.speed)

		this.scene.add(this.mesh)

		this.raycaster = new Raycaster()
		this.raycaster.near = 0
		this.raycaster.far = this.boundaries.y * 2.5

		this.pointCollision = new Mesh(
			new SphereGeometry(0.1),
			new MeshBasicMaterial({ color: 'red' })
		)

		// this.scene.add(this.pointCollision)
	}

	resetVelocity() {
		this.speed = 15
		this.velocity.z *= -1
		this.velocity.normalize().multiplyScalar(this.speed)
	}

	update(dt) {
		const dir = this.velocity.clone().normalize()
		this.raycaster.set(this.mesh.position, dir)

		const s = this.velocity.clone().multiplyScalar(dt)
		const tPos = this.mesh.position.clone().add(s)

		const dx = this.boundaries.x - this.radius - Math.abs(this.mesh.position.x)
		const dz = this.boundaries.y - this.radius - Math.abs(this.mesh.position.z)

		if (dx <= 0) {
			// console.log('collisione')
			tPos.x =
				(this.boundaries.x - this.radius + dx) * Math.sign(this.mesh.position.x)

			this.velocity.x *= -1
			this.dispatchEvent({ type: 'collide' })
		}

		if (dz < 0) {
			// console.log('collisione')
			const z = this.mesh.position.z
			const message = z > 0 ? 'pc' : 'player'
			this.dispatchEvent({ type: 'ongoal', message: message })

			tPos.set(0, 0, 0)

			this.resetVelocity()
		}

		// collisione con uno dei due padlle
		const paddle = this.paddles.find((paddle) => {
			return Math.sign(paddle.mesh.position.z) === Math.sign(this.velocity.z)
		})

		// console.log(paddle)

		const [intersection] = this.raycaster.intersectObjects(paddle.mesh.children)

		if (intersection) {
			// console.log(intersection)
			// this.pointCollision.position.copy(intersection.point)

			if (intersection.distance < s.length()) {
				// console.log('collisione con paddle')

				tPos.copy(intersection.point)
				const d = s.length() - intersection.distance

				const normal = intersection.normal
				normal.y = 0
				normal.normalize()
				// console.log(normal.y)
				this.velocity.reflect(normal)

				const dS = this.velocity.clone().normalize().multiplyScalar(d)
				tPos.add(dS)

				this.speed *= 1.05
				this.velocity.normalize().multiplyScalar(this.speed)
				this.dispatchEvent({ type: 'collide' })
			}
		}
		// else {
		// 	this.pointCollision.position.set(0, 0, 0)
		// }

		this.mesh.position.copy(tPos)
	}
}
