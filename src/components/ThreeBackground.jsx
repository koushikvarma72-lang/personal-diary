import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// Subtle floating-particle backdrop.
export default function ThreeBackground() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    let renderer = null
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    } catch (e) {
      // WebGL unavailable (blocked, headless, old GPU, etc.) — skip the
      // background entirely instead of crashing the whole app.
      return
    }
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    )
    camera.position.z = 20

    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)

    const count = 180
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i++) positions[i] = (Math.random() - 0.5) * 50
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const mat = new THREE.PointsMaterial({
      color: 0xe3b02b,
      size: 0.12,
      transparent: true,
      opacity: 0.3,
    })
    const points = new THREE.Points(geo, mat)
    scene.add(points)

    let raf
    const animate = () => {
      points.rotation.y += 0.0006
      points.rotation.x += 0.0002
      renderer.render(scene, camera)
      raf = requestAnimationFrame(animate)
    }
    animate()

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      geo.dispose()
      mat.dispose()
      renderer.dispose()
      el.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed inset-0 -z-10"
      aria-hidden="true"
    />
  )
}
