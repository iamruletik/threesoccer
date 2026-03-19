import * as THREE from 'three'
import RAPIER from '@dimforge/rapier3d'
import CameraControls from 'camera-controls'
import { Pane } from 'tweakpane'
import * as EssentialsPlugin from '@tweakpane/plugin-essentials'
import * as TweakpaneRotationInputPlugin from "@0b5vr/tweakpane-plugin-rotation"
import { RapierDebugger } from './physicsDebugger.js'
import { SoccerScene } from './soccerScene.js'
import { SoccerBall } from './soccerBall.js'
import { SceneLights } from './sceneLights.js'
import { BottleFinder } from './bottleFinder.js'
import { Penalty } from './penaltyModule.js'
import { Loop } from './loop.js'
import gsap from 'gsap'



//Variables
let backgroundColor = 0x050505

//TweakPane Gui
const pane = new Pane()
pane.hidden = true
pane.registerPlugin(EssentialsPlugin)
pane.registerPlugin(TweakpaneRotationInputPlugin)

//Debug Folder
const debug = pane.addFolder({ title: 'Scene Debug', expanded: false})
let fpsGraph = debug.addBlade({
                                            view: 'fpsgraph',
                                            label: 'FPS',
                                            rows: 2,
                                        })

//Seting the Physics World
let world = new RAPIER.World({ x: 0.0, y: -9.81, z: 0.0 })
//world.timestep = 1/60 //Sync to 60 Hz

//Canvas Element
const canvas = document.querySelector('canvas.webgl')

//Renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas, powerPreference: "high-performance", encoding: THREE.sRGBEncoding })
renderer.setSize(window.innerWidth, window.innerHeight)
//renderer.setPixelRatio(window.devicePixelRatio)
renderer.setPixelRatio(1)
renderer.setClearColor(backgroundColor)
//renderer.shadowMap.enabled = true
//renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping

//Scene
const scene = new THREE.Scene()
//scene.fog = new THREE.Fog(backgroundColor, 1, 50)
scene.background = new THREE.Color(backgroundColor)

//Camera
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight) // FOV vertical angle, aspect ratio with/height
camera.position.set(0,35,0)
scene.add(camera)

//CameraControls
CameraControls.install({ THREE: THREE })
const cameraControls = new CameraControls( camera, canvas )
cameraControls.maxDistance = 35
cameraControls.minDistance = 6
cameraControls.maxZoom = 1
cameraControls.minAzimuthAngle = -Math.PI / 2
cameraControls.maxAzimuthAngle = Math.PI / 2
cameraControls.minPolarAngle = -Math.PI / 2
cameraControls.maxPolarAngle = Math.PI / 3
cameraControls.smoothTime = 0.5

//Penalty Module
let penalty = new Penalty(camera, cameraControls, scene, world)
let penaltyButton = document.querySelector("#penalty")
let closeButton = document.querySelector("#closePenalty")
let kickButton = document.querySelector("#kickButton")

//Debug Render for Physics
const debugButton = debug.addButton({ title: "Show Colliders" })
let debugDataShown = false

//Loop Module
let loop = new Loop(camera, scene, renderer, world, fpsGraph, penalty)
loop.start()


loop.updatables.push(cameraControls)

penaltyButton.addEventListener("click", (event) => {
    document.querySelector(".instructionButton").style.visibility = "hidden"
    showSecondGuideWindow()
    penalty.isExiting = false
    penalty.goalCount = 0
    penalty.init()
    loop.updatables.pop()
    loop.updatables.push(penalty)   
    let physicsDebugger = new RapierDebugger(scene, world)
debugButton.on('click', () => {
    if (debugDataShown == false) {
        physicsDebugger.addDebugMesh()
        debugDataShown = true
    } else if (debugDataShown) {
        physicsDebugger.removeDebugMesh()
        debugDataShown = false
    }
})
loop.updatables.push(physicsDebugger) 
}, true)


closeButton.addEventListener("click", (event) => {
    document.querySelector(".instructionButton").style.visibility = "visible"
    penalty.isExiting = true
    penalty.stop()
    cameraControls.dolly(-18, true)
    penalty.isGoal = false
    loop.updatables.pop()
    loop.updatables.push(bottleFinder)
}, true)








//Adding Lights to the Scene
let sceneLights = new SceneLights(scene, debug)
sceneLights.loadLights()


//Soccer Scene Loading
let soccerScene = new SoccerScene(scene, world, camera, cameraControls)
soccerScene.load()
loop.updatables.push(soccerScene)

//Soccer Ball Object
let soccerBall = new SoccerBall(scene, world)
soccerBall.load()
loop.updatables.push(soccerBall)


//Raycaster
let bottleFinder = new BottleFinder(camera, scene, cameraControls)
bottleFinder.init()
loop.updatables.push(bottleFinder)



let startButton = document.querySelector(".start-screen")
let startScreenTimeline = gsap.timeline()

    startScreenTimeline.to(startButton, {
        autoAlpha: 0,
        duration: 1,
        delay: 1,
        onComplete: () => {
            startButton.load()
        }
    }).pause()







//reset to start screen

function inactivityTimeout() {
  let timer
  const IDLE_TIMEOUT = 60000

  const resetTimer = () => {

    clearTimeout(timer)
    timer = setTimeout(() => {

        console.log("restart")

        if (penalty.isActive) {
            penalty.isExiting = true
            penalty.stop()
            cameraControls.dolly(-18, true)
            penalty.isGoal = false
            loop.updatables.pop()
            loop.updatables.push(bottleFinder)
        } else if (!penalty.isActive) {
            cameraControls.dolly(-18, true)
        }

        startScreenTimeline.reverse()

    }, IDLE_TIMEOUT)
  };

  window.onload = resetTimer
  document.onmousemove = resetTimer
  document.onmousedown = resetTimer
  document.onkeydown = resetTimer
  document.onscroll = resetTimer
  document.ontouchstart = resetTimer
}

inactivityTimeout()


let closeInstructionsButton = document.querySelector(".closeInstButton")
let instructionContainer = document.querySelector(".instruction")
let openInstructionsButton = document.querySelector(".instructionButton")
let nextInstructionsButton = document.querySelector(".nextInstButton")
let secondInstructionsButton = document.querySelector("#instructionSecondButton")

let isSecondButtonClicked = false


closeInstructionsButton.addEventListener("click", (e) => {

    gsap.to(instructionContainer, {
        autoAlpha: 0
    })

    if (isSecondButtonClicked == false) {

            gsap.to(openInstructionsButton, {
                autoAlpha: 1
            })
    }

    isSecondButtonClicked = false

}, true)



openInstructionsButton.addEventListener("click", (e) => {

    gsap.to(instructionContainer, {
        autoAlpha: 1
    })

    gsap.to(openInstructionsButton, {
        autoAlpha: 0
    })

    gsap.to("#inst1", {
        autoAlpha: 1
    })


    gsap.to("#inst2", {
        autoAlpha: 0
    })

    gsap.to(nextInstructionsButton, {
        autoAlpha: 1
    })


}, true)


secondInstructionsButton.addEventListener("click", (e) => {

    isSecondButtonClicked = true

    gsap.to(instructionContainer, {
        autoAlpha: 1
    })

    gsap.to("#inst1", {
        autoAlpha: 1
    })


    gsap.to("#inst2", {
        autoAlpha: 0
    })

    gsap.to(nextInstructionsButton, {
        autoAlpha: 1
    })


}, true)


nextInstructionsButton.addEventListener("click", (e) => {

    gsap.to("#inst1", {
        autoAlpha: 0
    })

    gsap.to("#inst2", {
        autoAlpha: 1
    })

    gsap.to(nextInstructionsButton, {
        autoAlpha: 0
    })

}, true)



startButton.addEventListener("click", (event) => {

    startButton.play()
    startScreenTimeline.restart()

    gsap.to(instructionContainer, {
        autoAlpha: 1
    })

    gsap.to(openInstructionsButton, {
        autoAlpha: 0
    })

    gsap.to(openInstructionsButton, {
        autoAlpha: 0
    })

    gsap.to("#inst1", {
        autoAlpha: 1
    })


    gsap.to("#inst2", {
        autoAlpha: 0
    })

    gsap.to(nextInstructionsButton, {
        autoAlpha: 0
    })

})


function showSecondGuideWindow() {


    isSecondButtonClicked = true

    gsap.to(instructionContainer, {
        autoAlpha: 1
    })

    gsap.to(openInstructionsButton, {
        autoAlpha: 0
    })

    gsap.to(openInstructionsButton, {
        autoAlpha: 0
    })

    gsap.to("#inst1", {
        autoAlpha: 0
    })


    gsap.to("#inst2", {
        autoAlpha: 1
    })

    gsap.to(nextInstructionsButton, {
        autoAlpha: 0
    })
}