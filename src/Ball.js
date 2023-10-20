import {
	Mesh,
	MeshBasicMaterial,
	MeshNormalMaterial,
	Raycaster,
	SphereGeometry,
	Vector3,
} from 'three'

export default class Ball {
	speed = 15
	velocity = new Vector3(1, 0, 0.5)

	constructor(scene, boundaries, paddles) {
		this.scene = scene
		this.paddles = paddles
		this.boundaries = boundaries
		this.radius = 0.5
		this.geometry = new SphereGeometry(this.radius)
		this.material = new MeshNormalMaterial()
		this.mesh = new Mesh(this.geometry, this.material)

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

	update(dt) {
		const dir = this.velocity.clone().normalize()
		this.raycaster.set(this.mesh.position, dir)

		const s = this.velocity.clone().multiplyScalar(dt)
		const tPos = this.mesh.position.clone().add(s)

		const dx = this.boundaries.x - this.radius - Math.abs(this.mesh.position.x)
		const dz = this.boundaries.y - this.radius - Math.abs(this.mesh.position.z)

		if (dx <= 0) {
			console.log('collisione')
			tPos.x =
				(this.boundaries.x - this.radius + dx) * Math.sign(this.mesh.position.x)

			this.velocity.x *= -1
		}

		if (dz < 0) {
			console.log('collisione')

			tPos.set(0, 0, 0)
			this.speed = 15
			this.velocity.z *= -1
			this.velocity.normalize().multiplyScalar(this.speed)
		}

		// collisione con uno dei due padlle
		const paddle = this.paddles.find((paddle) => {
			return Math.sign(paddle.mesh.position.z) === Math.sign(this.velocity.z)
		})

		// console.log(paddle)

		const [intersection] = this.raycaster.intersectObjects(paddle.mesh.children)

		if (intersection) {
			// console.log(intersection)
			this.pointCollision.position.copy(intersection.point)

			if (intersection.distance < s.length()) {
				console.log('collisione con paddle')

				tPos.copy(intersection.point)
				const d = s.length() - intersection.distance

				const n = intersection.normal
				n.projectOnPlane(new Vector3(0, 1, 0)).normalize()
				this.velocity.reflect(intersection.normal)

				const dS = this.velocity.clone().normalize().multiplyScalar(d)
				tPos.add(dS)

				this.speed *= 1.05
				this.velocity.normalize().multiplyScalar(this.speed)
			}
		} else {
			this.pointCollision.position.set(0, 0, 0)
		}

		this.mesh.position.copy(tPos)
	}
}
