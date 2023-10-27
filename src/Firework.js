import {
	BufferAttribute,
	BufferGeometry,
	Points,
	PointsMaterial,
	ShaderMaterial,
	Vector3,
} from 'three'
import fragment from './glsl/fragment.glsl'
import vertex from './glsl/vertex.glsl'
import gsap from 'gsap'

export default class Firework {
	expireIn = 1.5

	constructor(num, radius, time) {
		this.num = num
		this.radius = radius

		this.geometry = new BufferGeometry()

		const positionArray = new Float32Array(num * 3)
		const position = new BufferAttribute(positionArray, 3)

		const colorArray = new Float32Array(num * 3)
		const color = new BufferAttribute(colorArray, 3)

		for (let i = 0; i < num; i++) {
			const x = (Math.random() * 2 - 1) * this.radius
			const y = (Math.random() * 2 - 1) * this.radius
			const z = (Math.random() * 2 - 1) * this.radius

			const col = new Vector3().random()

			position.set([x, y, z], i * 3)
			color.set([...col], i * 3)
		}

		this.geometry.setAttribute('position', position)
		this.geometry.setAttribute('color', color)
		// console.log(position)

		this.material = new ShaderMaterial({
			uniforms: {
				uSize: { value: 3 },
				uProgress: { value: 0 },
				uTime: { value: 0 },
				uExpireIn: { value: this.expireIn },
				uColor: { value: new Vector3().random() },
			},
			fragmentShader: fragment,
			vertexShader: vertex,
			transparent: true,
		})
		// this.material = new PointsMaterial({ size: 0.2, sizeAttenuation: true })
		this.mesh = new Points(this.geometry, this.material)
		this.mesh.position.random().multiplyScalar(5 + Math.random() * 3)

		this.born(time)
	}

	die() {
		this.mesh.parent.remove(this.mesh)
		this.geometry.dispose()
		this.isDie = true
	}

	update(dt) {
		this.material.uniforms.uTime.value += dt
	}

	born() {
		this.material.uniforms.uTime.value = 0

		gsap.fromTo(
			this.material.uniforms.uProgress,
			{
				value: 0,
			},
			{
				value: 2,
				duration: 3,
				ease: 'power4.out',
			}
		)

		setTimeout(() => {
			this.die()
		}, this.expireIn * 1000 + 10)
	}
}
