import { Component, Inject , OnInit} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { loadModules } from 'esri-loader';

@Component({
  selector: 'dialog-location',
  templateUrl: './dialog-location.html',
  styleUrls: ['./dialog-location.css']
})
export class LocationMapDialog  {
  map: any;
  constructor(
    public dialogRef: MatDialogRef<LocationMapDialog>,
    @Inject(MAT_DIALOG_DATA) data
    ) {
      loadModules([
      'esri/Map',
      'esri/Basemap',
      'esri/views/MapView',
      'esri/widgets/Sketch/SketchViewModel',
      'esri/Graphic',
      'esri/layers/TileLayer',
      'esri/layers/GraphicsLayer',
      'esri/layers/FeatureLayer',
      'esri/widgets/Track'
      ])
      .then(([Map, Basemap, MapView, SketchViewModel, Graphic, TileLayer, GraphicsLayer, FeatureLayer, Track]) => {
      let editGraphic;
      let deleted = false;
      // GraphicsLayer to hold graphics created via sketch view model
      const tempGraphicsLayer = new GraphicsLayer();
      if(data.graphics.length > 0){
        tempGraphicsLayer.addMany(data.graphics);
      }
      var baseLayer = new TileLayer({
          url: data.baselayer,
          id: "streets",
          visibility: true
      });

      this.map = new Map({
        basemap: new Basemap({
          baseLayers: [baseLayer]
        })
      });
      // this.map = new Map({
      //         basemap: 'streets'
      //       });
      this.map.add(tempGraphicsLayer);
      const view = new MapView({
        container: "map",
        map: this.map,
        zoom: 10,
        center: [-76.6, 39.2]
      });

      //geolocation
      let track = new Track({ view: view });
      view.ui.add(track, "bottom-left");
      view.when(function() {
        /*view.goTo({
           target: data,
           zoom: 10
         });*/
        //track geolocation
        //track.start();
        // create a new sketch view model
        const sketchViewModel = new SketchViewModel({
          view: view,
          layer: tempGraphicsLayer,
          pointSymbol: {
            type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
            style: "square",
            color: "#8A2BE2",
            size: "16px",
            outline: { // autocasts as new SimpleLineSymbol()
              color: [255, 255, 255],
              width: 3
            }
          },
          polylineSymbol: {
            type: "simple-line", // autocasts as new SimpleLineSymbol()
            color: "#8A2BE2",
            width: "4",
            style: "dash"
          },
          polygonSymbol: {
            type: "simple-fill", // autocasts as new SimpleFillSymbol()
            color: "rgba(138,43,226, 0.8)",
            style: "solid",
            outline: {
              color: "white",
              width: 1
            }
          }
        });

        setUpClickHandler();

        // Listen to create-complete event to add a newly created graphic to view
        sketchViewModel.on("create-complete", addGraphic);

        // Listen the sketchViewModel's update-complete and update-cancel events
        sketchViewModel.on("update-complete", updateGraphic);
        sketchViewModel.on("update-cancel", updateGraphic);

        //*************************************************************
        // called when sketchViewModel's create-complete event is fired.
        //*************************************************************
        function addGraphic(event) {
          // Create a new graphic and set its geometry to
          // `create-complete` event geometry.
          const graphic = new Graphic({
            geometry: event.geometry,
            symbol: sketchViewModel.graphic.symbol
          });
          tempGraphicsLayer.add(graphic);
        }

        //***************************************************************
        // called when sketchViewModel's update-complete or update-cancel
        // events are fired.
        //*************************************************************
        function updateGraphic(event) {
          // event.graphic is the graphic that user clicked on and its geometry
          // has not been changed. Update its geometry and add it to the layer
          if(!deleted){
            event.graphic.geometry = event.geometry;
            tempGraphicsLayer.add(event.graphic);
            // set the editGraphic to null update is complete or cancelled.
          }
          editGraphic = null;
        }

        // ************************************************************************************
        // set up logic to handle geometry update and reflect the update on "tempGraphicsLayer"
        // ************************************************************************************
        function setUpClickHandler() {
          view.on("click", function(event) {
            view.hitTest(event).then(function(response) {
              deleted= false;
              setActiveButton(null);
              let results = response.results;
              // Found a valid graphic
              if (results.length && results[results.length - 1]
                .graphic) {
                // Check if we're already editing a graphic
                if (!editGraphic) {
                  // Save a reference to the graphic we intend to update
                  editGraphic = results[results.length - 1].graphic;
                  // Remove the graphic from the GraphicsLayer
                  // Sketch will handle displaying the graphic while being updated
                  tempGraphicsLayer.remove(editGraphic);
                  sketchViewModel.update(editGraphic);
                }
              }
            });
          });
        }

        //*************************************
        // activate the sketch to create a point
        //*************************************
        let drawPointButton = document.getElementById("pointButton");
        drawPointButton.onclick = function() {
          // set the sketch to create a point geometry
          sketchViewModel.create("point");
          setActiveButton(this);
        };

        //***************************************
        // activate the sketch to create a polygon
        //***************************************
        let drawPolygonButton = document.getElementById("polygonButton");
        drawPolygonButton.onclick = function() {
          // set the sketch to create a polygon geometry
          sketchViewModel.create("polygon");
          setActiveButton(this);
        };

        //**************
        // reset button
        //**************
        document.getElementById("resetBtn").onclick = function() {
          setActiveButton(this);
          if(editGraphic){
            deleted = true;
            tempGraphicsLayer.remove(editGraphic);
            sketchViewModel.reset();
          }
        };

        function setActiveButton(selectedButton) {
          // focus the view to activate keyboard shortcuts for sketching
          view.focus();
          let elements = document.getElementsByClassName("active");
          for (let i = 0; i < elements.length; i++) {
            elements[i].classList.remove("active");
          }
          if (selectedButton) {
            selectedButton.classList.add("active");
          }
        }
      })
      })
    }

  save(): void {
    this.dialogRef.close(this.map.layers.items[0].graphics.items);
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

}
