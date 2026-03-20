import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { ColliderCreator } from './colliderCreator.js'
import RAPIER from '@dimforge/rapier3d'
import gsap from 'gsap'

export class SoccerScene {

  constructor(scene, world, camera, cameraControls) {
    this.pathToGLTFScene = '/SoccerFieldNew/SoccerField.gltf'
    this.soccerField = null
    this.soccerFieldObjectName = "SoccerField"
    this.gltfLoader = new GLTFLoader()
    this.scene = scene
    this.world = world
    this.objectNames = [ 
                            "BottleCap01", "BottleCap02", "BottleCap03", "BottleCap04",  "BottleCap05", "BottleCap06", 
                            "BottleCap07", "BottleCap08", "BottleCap09", "BottleCap10",  "BottleCap11", "BottleCap12", 
                            "BottlePlaneNtx", "BottlePlaneZn", "BottlePlaneKoz", "BottlePlaneStella", "BottlePlaneBrah", "BottlePlaneRf",
                            "BottlePlaneGg", "BottlePlaneBs", "BottlePlaneEssa", "BottlePlaneHg", "BottlePlaneLowe", "BottlePlaneAmster",
                          ]
    this.bottleNames = [ 
                          "BottlePlaneNtx", "BottlePlaneZn", "BottlePlaneKoz", "BottlePlaneStella", "BottlePlaneBrah", "BottlePlaneRf",
                          "BottlePlaneGg", "BottlePlaneBs", "BottlePlaneEssa", "BottlePlaneHg", "BottlePlaneLowe", "BottlePlaneAmster",
                        ]
    this.bottles = []
    this.camera = camera
    this.cameraControls = cameraControls

    }

  load() {

    //let colliderCreator = new ColliderCreator(this.scene, this.world)


   //Load Soccer Field
    this.gltfLoader.load(this.pathToGLTFScene, (gltf) => {

        //Iterate through all objects from GLTF file and add them to the provided scene
        const children = [...gltf.scene.children]
        for (const child of children) { this.scene.add(child) }

        //Set Shadow for Soccer Field Outer
        let soccerFieldOuter = this.scene.getObjectByName("SoccerFieldOuter")
        soccerFieldOuter.receiveShadow = true

        //Find Soccer Field Object and set it to recieve shadows
        this.soccerField = this.scene.getObjectByName(this.soccerFieldObjectName)
        this.soccerField.receiveShadow = true
        this.soccerField.castShadow = false

        //Find Soccer Inner Stripe
        let soccerFieldStripe = this.scene.getObjectByName("SoccerFieldStripe")
        soccerFieldStripe.material.map.offset.x = 0
        soccerFieldStripe.material.emissiveMap.offset.x = 0
        soccerFieldStripe.material.emissiveIntensity = 10

        //Animate Ads Strip
        gsap.to(soccerFieldStripe.material.map.offset, {
          x: -1,
          repeat: -1,
          ease: "none",
          duration: 20
        })

        //Animate Ads Strip
        gsap.to(soccerFieldStripe.material.emissiveMap.offset, {
          x: -1,
          repeat: -1,
          ease: "none",
          duration: 20
        }) 

        ///Find Soccer Inner Stripe
        let fieldEmission = this.scene.getObjectByName("SoccerField")
        //fieldEmission.material.toneMapped = false
        //fieldEmission.material.emissive = new THREE.Color(0xFF0600)
        fieldEmission.material.emissiveIntensity = 15
        //Animate Ads Strip
        gsap.to(fieldEmission.material, {
          emissiveIntensity: 0,
          repeat: -1,
          yoyo: true,
          duration: 3
        }) 


        //Create Convex Hull Colliders for Specific Objects in the Scene
        //colliderCreator.create(this.objectNames)

        //Save Bottles in the Array
        for (const objectName of this.bottleNames) { 
          let temp = this.scene.getObjectByName(objectName)
          temp.material.alphaTest = 0.1 
          this.bottles.push(temp)
        }


    })


        //Load the Colliders
    this.gltfLoader.load("/SoccerFieldNew/SoccerFieldColliders.gltf", (gltf) => {
      
        //Iterate through all objects from GLTF file and add them to the provided scene
        const children = [...gltf.scene.children]
        for (const child of children) { 

          if (child.name != "SensorGate") {
              let newCollider = RAPIER.ColliderDesc.convexHull(child.geometry.attributes.position.array)
              newCollider.setTranslation(child.position.x, child.position.y, child.position.z)
              this.world.createCollider(newCollider)
          } else {
              let newCollider = RAPIER.ColliderDesc.convexHull(child.geometry.attributes.position.array)
              newCollider.setSensor(true)
              newCollider.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS)
              newCollider.setTranslation(child.position.x, child.position.y, child.position.z)
              this.world.createCollider(newCollider)
          }

        }

        return true;
    })


    
    
  }

  update() {
    if (this.bottles) {
      
      for (const bottle of this.bottles) {
        //bottle.rotation.y = this.camera.position.x / 4
        bottle.lookAt(this.camera.position.x, bottle.position.y, this.camera.position.z)
        bottle.material.opacity =  Math.min(Math.max(this.cameraControls.polarAngle, 0), 1)
      }

    }

  }

}