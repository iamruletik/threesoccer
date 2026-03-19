import * as THREE from 'three'
import gsap from 'gsap'
import { ColliderCreator } from './colliderCreator.js'

const BUTTON_IDLE = "IDLE", BUTTON_KICK_DIRECTION = "DIRECTION", BUTTON_KICK_POWER = "KICK", BUTTON_INACTIVE = "INACTIVE"
const ARROW_RIGHT = -1, ARROW_LEFT = 1
const POWER_DOWN = -1, POWER_UP = 1

const goalSign = document.querySelector(".goal")
const missSign = document.querySelector(".miss")
const goalSignTimeline = gsap.timeline()
const missSignTimeline = gsap.timeline()

goalSignTimeline.set(goalSign, {autoAlpha: 0 })

goalSignTimeline.fromTo(goalSign, {
  autoAlpha: 0,
  onComplete: () => {
    goalSign.load()
    goalSign.play()
  }
}, {
  autoAlpha: 1,
  duration: 0.3,
  ease: "power2.inOut"
})
goalSignTimeline.to(goalSign, {
  autoAlpha: 0,
  delay: 1.5
}, ">").pause()


missSignTimeline.set(missSign, { autoAlpha: 0 })

missSignTimeline.fromTo(missSign, {
  autoAlpha: 0,
  onComplete: () => {
    missSign.load()
    missSign.play()
  }
}, {
  autoAlpha: 1,
  duration: 0.3,
  ease: "power2.inOut"
})
missSignTimeline.to(missSign, {
  autoAlpha: 0,
  delay: 1.5
}, ">").pause()

export class Penalty {
  
    constructor(camera, controls, scene, world) {
    this.controls = controls
    this.camera = camera
    this.scene = scene
    this.world = world
    this.buttonState = BUTTON_IDLE
    this.penaltyButton = document.querySelector("#penalty")
    this.kickButton = document.querySelector("#kickButton")
    this.closeButton = document.querySelector("#closePenalty")
    this.instButton = document.querySelector("#instructionSecondButton")
    this.instMainButton = document.querySelector(".instructionButton")
    this.objectNames = [ 
                            "BottleCap01", "BottleCap02", "BottleCap03", "BottleCap04",  "BottleCap05", "BottleCap06", 
                            "BottleCap07", "BottleCap08", "BottleCap09", "BottleCap10",  "BottleCap11", "BottleCap12", 
                          ]
    this.bottleNames = [ 
                            "BottlePlaneStella", "BottlePlaneEssa", "BottlePlaneBrah", "BottlePlaneNtx", "BottlePlaneKoz", "BottlePlaneZn",
                            "BottlePlaneGg", "BottlePlaneRf", "BottlePlaneBs", "BottlePlaneLowe", "BottlePlaneHg", "BottlePlaneAmster",
                        ]               
    this.defaultPos = []
    this.bottleGroups = []
    this.kick = {
        power: 0,
        direction: 0
    }
    this.powerTimeline = gsap.timeline()
    this.directionTimeline = gsap.timeline()
    this.moveGateKeeper = gsap.timeline()
    this.timeClicked = 0
    this.isGoal = false
    this.isExiting = false
    this.isActive = false
    this.goalCount = 0
    this.goalCounter = document.querySelector(".goalCounterNumber")
    this.goalCounterContainer = document.querySelector("#goalCounter")
    this.allNames = [ 
                            "BottleCap01", "BottleCap02", "BottleCap03", "BottleCap04",  "BottleCap05", "BottleCap06", 
                            "BottleCap07", "BottleCap08", "BottleCap09", "BottleCap10",  "BottleCap11", "BottleCap12", 
                            "BottlePlaneNtx", "BottlePlaneZn", "BottlePlaneKoz", "BottlePlaneStella", "BottlePlaneBrah", "BottlePlaneRf",
                            "BottlePlaneGg", "BottlePlaneBs", "BottlePlaneEssa", "BottlePlaneHg", "BottlePlaneLowe", "BottlePlaneAmster",
                          ]
    this.colliderCreator = new ColliderCreator(this.scene, this.world)
    this.collidersList = []
    this.gateKeeperPosition = null
    this.bottleGroupsExist = false
  }

  init() {

    this.buttonState = BUTTON_KICK_DIRECTION
    //console.log("INIT " + this.isGoal)
    this.goalCounter.innerHTML = this.goalCount

    this.timeClicked++

    this.moveCamera()

    this.isActive = true

    let cameraRest = (event) => {
        this.world.getRigidBody(0).sleep()
        this.closeButton.style.visibility = "visible"
        this.instButton.style.visibility = "visible"
        
        this.goalCounterContainer.style.visibility = "visible"
        this.kickButton.style.visibility = "visible"
        this.controls.removeEventListener("rest", cameraRest)
    }

    this.controls.addEventListener("rest", cameraRest)

    this.penaltyButton.style.visibility = "hidden"
    this.directionTimeline.restart()
    this.powerTimeline.time(0).kill()
    this.moveGateKeeper.restart()

    if (this.timeClicked <= 1) {
        this.collidersList = this.colliderCreator.create(this.allNames)
        this.setupButton()
        this.saveBottlePositions()
    }
    
    if (this.bottleGroupsExist) {
      this.bottleGroups[7].position.set(0,0,-0.5) //red finch
      this.bottleGroups[1].position.set(2,0,-5) 
      this.bottleGroups[0].position.set(0,100,0) 
      this.bottleGroups[2].position.set(0,100,0) 
      this.bottleGroups[3].position.set(0,100,0) 
      this.bottleGroups[4].position.set(0,100,0)  
      this.bottleGroups[5].position.set(0,100,0) 
      this.bottleGroups[6].position.set(0,100,0) 
      this.bottleGroups[8].position.set(0,100,0) 
    }



  }

  moveCamera() {
    let distance = this.camera.position.distanceTo(new THREE.Vector3(0,0,0)) - 10
    //console.log(distance)
    this.controls.restThreshold = 1
    this.controls.enabled = false
    this.controls.lookInDirectionOf(0, -10, -14, true)
    this.controls.moveTo(0, 2, -2, true)
    this.controls.dolly(distance, true)
    this.world.getRigidBody(0).resetForces()
    this.world.getRigidBody(0).applyImpulse({ x: 0.9, y: 0.0, z: -1}, true)
  }

  goal() {
            this.isGoal = true
            this.goalCount++
            this.goalCounter.innerHTML = this.goalCount
            //console.log("GOAL " + this.goalCount)

            setTimeout(() => {
              this.stop()
              this.init()
              goalSignTimeline.restart()
            }, 1000)

  }

  setupButton() {

    
    this.kick.power = 0
    this.powerTimeline.pause()

    this.powerTimeline.to(this.kick, {
        power: 10,
        yoyo: true,
        repeat: -1,
        duration: 1,
        ease: "none",
        onUpdate: () => {
        }
    })
    this.powerTimeline.fromTo("#powerGradient", {
        "--clip": '5%',
    }, {
        "--clip": '55%',
        yoyo: true,
        repeat: -1,
        duration: 1,
        ease: "none"
    }, "<")

    this.directionTimeline.fromTo(this.kick, {
        direction: -7,
    }, {
        direction: 7,
        yoyo: true,
        repeat: -1,
        duration: 1,
        ease: "none",
        onUpdate: () => {
          //console.log(this.kick.direction)
        }
    })
     this.directionTimeline.to("#arrow-container", {
      rotation: 90,
      transformOrigin: "center center",
      yoyo: true,
      repeat: -1,
      duration: 1,
      ease: "none",
     }, "<")


     let resetTimer = (event) => {
        console.log("reset Timer fired")
        console.log(this.isGoal)
        console.log(this.isExiting)
        if (!this.isGoal && !this.isExiting) {
          this.stop()
          this.init()
          missSignTimeline.restart()
          //console.log("TIME RESET " + this.isGoal)
        } else if (this.isGoal) {
          this.isGoal = false
        } else if (this.isExiting) {
          this.isExiting = false
        }
     }
    

    this.kickButton.addEventListener("click", (event) => {
        console.log(this.buttonState)

         this.powerTimeline.pause()

        switch (this.buttonState) {

          case BUTTON_KICK_DIRECTION:
                this.directionTimeline.pause()
                this.powerTimeline.restart()
                this.buttonState = BUTTON_KICK_POWER
                break;

          case BUTTON_KICK_POWER:
                setTimeout(resetTimer, 4000)
                this.buttonState = BUTTON_INACTIVE
                this.powerTimeline.pause()
                this.kickButton.style.visibility = "hidden"
                this.controls.dolly(4, true)
                this.world.getRigidBody(0).resetForces()
                this.world.getRigidBody(0).setLinvel({ x: 0.0, y: 0.0, z: 0.0 }, true)
                this.world.getRigidBody(0).setAngvel({ x: 3.0, y: 3.0, z: -3.0 }, true)
                this.world.getRigidBody(0).applyImpulse({ x: this.kick.direction, y: this.kick.power, z: -this.kick.power }, true)
                break;
        }
        
    }, true)
  }

  saveBottlePositions() {

    let i = 0

    for (const objectName of this.objectNames) { 
        
        let capMesh = this.scene.getObjectByName(objectName)
        let bottlePlane = this.scene.getObjectByName(this.bottleNames[i])
        let newGroup = new THREE.Group()
        newGroup.add(capMesh)
        newGroup.add(bottlePlane)
        this.scene.add(newGroup)

        this.defaultPos.push(newGroup.position)
        this.bottleGroups.push(newGroup)

        i++
    }

    this.bottleGroups[7].position.set(0,0,-0.5) //red finch
    
    this.bottleGroups[1].position.set(2,0,-5)  //essa
    let vectorA = this.collidersList[0].translation()
    let vectorB = this.collidersList[2].translation()

    let colliderNewVecA = {
      x: this.bottleGroups[1].children[0].position.x + this.bottleGroups[1].position.x,
      y: vectorA.y,
      z: this.bottleGroups[1].children[0].position.z + this.bottleGroups[1].position.z,
    }

    let colliderNewVecB = {
      x: this.bottleGroups[1].children[1].position.x + this.bottleGroups[1].position.x,
      y: vectorB.y,
      z: this.bottleGroups[1].children[1].position.z + this.bottleGroups[1].position.z,
    }

    this.collidersList[0].setTranslation({x: colliderNewVecA.x , y: colliderNewVecA.y , z:colliderNewVecA.z})
    this.collidersList[2].setTranslation({x: colliderNewVecB.x , y: colliderNewVecB.y , z:colliderNewVecB.z})
    console.log(this.bottleGroups[1])

    this.bottleGroups[0].position.set(0,100,0) 
    this.bottleGroups[2].position.set(0,100,0) 
    this.bottleGroups[3].position.set(0,100,0) 
    this.bottleGroups[4].position.set(0,100,0)  
    this.bottleGroups[5].position.set(0,100,0) 
    this.bottleGroups[6].position.set(0,100,0) 
    this.bottleGroups[8].position.set(0,100,0)  

    this.bottleGroupsExist = true

   this.moveGateKeeper.fromTo(this.bottleGroups[11].position, {
        x: -3
    }, {
        x: 3,
        yoyo: true,
        repeat: -1,
        ease: "none",
        duration: 1.6
    }).restart()




  }


  update() {
    let vectorA = this.collidersList[1].translation()
    let vectorB = this.collidersList[3].translation()
    this.collidersList[1].setTranslation({x: this.bottleGroups[11].position.x, y: vectorA.y, z:vectorA.z})
    this.collidersList[3].setTranslation({x: this.bottleGroups[11].position.x, y: vectorB.y, z:vectorB.z})
  }

  stop() {

    this.isActive = false

    this.moveGateKeeper.pause()
    //Set Button State
    this.buttonState = BUTTON_IDLE

    this.goalCounter.innerHTML = this.goalCount

    if (this.isExiting) {
      this.bottleGroups[11].position.set(0,0,0)
      this.bottleGroups[7].position.set(0,0, 0) //red finch
      this.bottleGroups[1].position.set(0,0,0) 
      this.bottleGroups[0].position.set(0,0,0) 
      this.bottleGroups[2].position.set(0,0,0) 
      this.bottleGroups[3].position.set(0,0,0) 
      this.bottleGroups[4].position.set(0,0,0)  
      this.bottleGroups[5].position.set(0,0,0) 
      this.bottleGroups[6].position.set(0,0,0) 
      this.bottleGroups[8].position.set(0,0,0) 
    }


    this.closeButton.style.visibility = "hidden"
    this.instButton.style.visibility = "hidden"

    
    this.kickButton.style.visibility = "hidden"
    this.goalCounterContainer.style.visibility = "hidden"
    this.penaltyButton.style.visibility = "visible"

    this.world.getRigidBody(0).resetForces()
    this.world.getRigidBody(0).setTranslation({ x: 0.0, y: -1.2, z: 0.0 }, true)
    this.world.getRigidBody(0).sleep()

    let distance = this.camera.position.distanceTo(new THREE.Vector3(0,0,0)) - 8
    //console.log(distance)

    this.controls.lookInDirectionOf(0, -100, -10, true)                
    this.controls.moveTo(0, 0, 0, true)
    this.controls.dolly(distance, true)

    this.controls.enabled = true 
    this.isCameraAnimating = false
  }



  }
