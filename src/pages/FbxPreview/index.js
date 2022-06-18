import React, { Component } from "react";
import ReactThreeFbxViewer from "react-three-fbx-viewer";

let fbxUrl = require("./leather_jacket.fbx");

export default class index extends Component {
  onLoad(e) {
    console.log(e);
  }

  onError(e) {
    console.log(e);
  }
  render() {
    let cameraPosition = {
      x: 150,
      y: 300,
      z: 350,
    };
    return (
      <div>
        <ReactThreeFbxViewer
          cameraPosition={cameraPosition}
          url={fbxUrl}
          onLoading={this.onLoad}
          onError={this.onError}
          backgroundColor="#060607"
        />
      </div>
    );
  }
}
