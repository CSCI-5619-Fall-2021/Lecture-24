/* CSCI 5619 Fall 2021
 * Lecture 24: Intro to Babylon/WebXR
 * Author: Evan Suma Rosenberg <suma@umn.edu>
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 */ 

import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3, Color3, Color4 } from "@babylonjs/core/Maths/math";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Logger } from "@babylonjs/core/Misc/logger";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder"

import { WebXRCamera } from "@babylonjs/core/XR/webXRCamera";
import { PointerEventTypes, PointerInfo } from "@babylonjs/core/Events/pointerEvents";
import { WebXRManagedOutputCanvasOptions } from "@babylonjs/core/XR";
import { HighlightLayer, Mesh } from "@babylonjs/core";

// Side effects
import "@babylonjs/core/Helpers/sceneHelpers";
import "@babylonjs/core/Materials/standardMaterial"
import "@babylonjs/inspector";

class Game 
{ 
    private canvas: HTMLCanvasElement;
    private engine: Engine;
    private scene: Scene;

    private xrCamera: WebXRCamera | null; 
    private highlightLayer: HighlightLayer | null;

    constructor()
    {
        // Get the canvas element 
        this.canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

        // Generate the BABYLON 3D engine
        this.engine = new Engine(this.canvas, true); 

        // Creates a basic Babylon Scene object
        this.scene = new Scene(this.engine);   

        // Initialize the XR camera to null
        this.xrCamera = null;

        // Initialize the highlight layer to null
        this.highlightLayer = null;
    }

    start() : void 
    {
        // Create the scene and then execute this function afterwards
        this.createScene().then(() => {

            // Register a render loop to repeatedly render the scene
            this.engine.runRenderLoop(() => { 
                this.update();
                this.scene.render();
            });

            // Watch for browser/canvas resize events
            window.addEventListener("resize", () => { 
                this.engine.resize();
            });
        });
    }

    private async createScene() 
    {
        // This creates and positions a first-person camera (non-mesh)
        var camera = new UniversalCamera("camera1", new Vector3(0, 5, -10), this.scene);

        // This targets the camera to scene origin
        camera.setTarget(Vector3.Zero());

        // This attaches the camera to the canvas
        camera.attachControl(this.canvas, true);

        // Creates the XR experience helper
        const xrHelper = await this.scene.createDefaultXRExperienceAsync({});

        // Assigns the web XR camera to a member variable
        this.xrCamera = xrHelper.baseExperience.camera;

        // Enable highlight layer
        var canvasOptions = WebXRManagedOutputCanvasOptions.GetDefaults();
        canvasOptions.canvasOptions!.stencil = true;

        // Create a highlight layer
        this.highlightLayer = new HighlightLayer("highlightLayer", this.scene);

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        var light = new HemisphericLight("light", new Vector3(0, 1, 0), this.scene);

        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.7;

        // Our built-in 'sphere' shape.
        var sphere = MeshBuilder.CreateSphere("sphere", {diameter: 2, segments: 32}, this.scene);

        // Move the sphere upward 1/2 its height
        sphere.position.y = 1;

        // Our built-in 'ground' shape.
        var ground = MeshBuilder.CreateGround("ground", {width: 100, height: 100}, this.scene);

        // Add the ground as a mesh for teleportation
        xrHelper.teleportation.addFloorMesh(ground);

        // Register event handler for selection events (pulling the trigger, clicking the mouse button)
        this.scene.onPointerObservable.add((pointerInfo) => {
            this.processPointer(pointerInfo);
        });

        // Show the debug scene explorer and object inspector
        // You should comment this out when you build your final program 
        //this.scene.debugLayer.show(); 
    }

    // The main update loop will be executed once per frame before the scene is rendered
    private update() : void
    {
 
    }

    // Event handler for processing pointer events
    private processPointer(pointerInfo: PointerInfo)
    {
        switch (pointerInfo.type) {
            case PointerEventTypes.POINTERDOWN:
                if (pointerInfo.pickInfo?.hit) {

                    // Write the current info to the log
                    Logger.Log(pointerInfo.pickInfo.pickedMesh?.name + " " + pointerInfo.pickInfo.pickedPoint);
                    
                    // Toggle the mesh in the highlight layer
                    if(this.highlightLayer?.hasMesh(pointerInfo.pickInfo.pickedMesh! as Mesh))
                    {
                        this.highlightLayer?.removeMesh(pointerInfo.pickInfo.pickedMesh! as Mesh);
                    }
                    else
                    { 
                        this.highlightLayer?.removeAllMeshes();
                        this.highlightLayer?.addMesh(pointerInfo.pickInfo.pickedMesh! as Mesh, Color3.Green());
                    }
                }
                break;
        }
    }

}
/******* End of the Game class ******/   

// start the game
var game = new Game();
game.start();