import React, { useState, useEffect, Suspense,useRef } from "react";
import { Spin } from "antd";
import styled from "styled-components";
import { Link, useHistory } from "react-router-dom";
// import ReactThreeFbxViewer from "react-three-fbx-viewer";
import { gapi } from "gapi-script";
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {
  Card,
  CardBody,
  Col,
  Button,
  DropdownMenu,
  DropdownToggle,
  Row,
  UncontrolledDropdown,
  Container,
  CardTitle,
  Form,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  Input,
  Label,
  Progress,
  Alert,
  UncontrolledAlert,
} from "reactstrap";
import { useLoader } from '@react-three/fiber'
import { style } from "./styles";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import {
  Environment,
  OrbitControls,
  useFBX,
  Stage,
  Html,
  useProgress,
  Shadow,
  Center,
  useGLTF
} from "@react-three/drei";
import { Bounds } from "leaflet";
import moment from "moment";
import ReactApexChart from "react-apexcharts";
import axios from "axios";
import { DirectionalLight, HemisphereLight } from 'three';

const NewDocumentWrapper = styled.div`
  ${style}
`;

// Client ID and API key from the Developer Console
// const CLIENT_ID = '1087902307093-l68ij0lcqo2b273jc046n84aiulbhsvl.apps.googleusercontent.com';
// const API_KEY = 'AIzaSyCV_Yde-S0eG46MOYghKwXc6MHr5e5ISgk';

const CLIENT_ID =
  "928121316668-4cc7a847139ms3aufh976get189jbrqa.apps.googleusercontent.com";
const API_KEY = "AIzaSyCxeTVxW3GTkhYf1xkFrgL823qN2jlna4E";

// Array of API discovery doc URLs for APIs
const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPESF = "https://www.googleapis.com/auth/drive";

const SCOPES = "https://www.googleapis.com/auth/drive";

// let fbxUrl = require("./leather_jacket.fbx");

const FileList = ({ userData }) => {
  const [modal, setModal] = React.useState(false);

  // Toggle for Modal
  const toggle = () => setModal(!modal);

  const [imagemodal, setImageModal] = React.useState(false);

  // Toggle for Modal
  const imagetoggle = () => setImageModal(!imagemodal);

  const [previewmodal, setPreviewModel] = React.useState(false);
  const [editFile, setEditFile] = React.useState(false);
  const [updateFileId, setUpdateFileId] = React.useState("");

  // Toggle for Modal
  const previewtoggle = () => setPreviewModel(!previewmodal);

  const [listDocumentsVisible, setListDocumentsVisibility] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [folderid, setFolderId] = useState([]);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [breadcrumbtwo, setBreadcrumbTwo] = useState([]);

  const [usedquota, setUsedQuota] = useState([]);
  const [totalquota, setTotalQuota] = useState([]);
  const [usedper, setUsedPer] = useState([]);
  const [usedindrive, setUsedInDrive] = useState([]);

  const [listChildDocumentsVisible, setListChildDocumentsVisible] =
    useState(false);

  const [childdocuments, setChildDocuments] = useState([]);
  const [loader, setloader] = useState(false);
  const [alert, setAlert] = useState(false);
  const [displayError, setDisplayError] = useState(false);
  const [displaySuccess, setDisplaySuccess] = useState(false);
  const [preview, setPreview] = useState("");

  const [percentage, setPercentage] = useState(0);

  const [FolderName, setFolderName] = useState("");
  const [FBXName, setFBXName] = useState("");
  const [FBXId, setFBXId] = useState("");
  const [FBXItem, setFBXItem] = useState("");
  const [FBXVersion, setFBXVersion] = useState("");
  const [FBXDescription, setFBXDescription] = useState("");
  const { progress } = useProgress();
  const [FBXMaterial, setFBXMaterial] = useState("");
  const [FBXFile, setFBXFile] = useState("");
  const [FBXFileData, setFBXFileData] = useState("");
  const [ThumbnailFile, setThumbnailFile] = useState("");
  const [ThumbnailFileData, setThumbnailFileData] = useState("");

  const [responseData, setResponseData] = useState("");

  const [AccessToken, setAccessToken] = useState([]);
  const [googleAccessToken, setGoogleAccessToken] = useState("");

  const [isLoadingGoogleDriveApi, setIsLoadingGoogleDriveApi] = useState(false);
  const [isFetchingGoogleDriveFiles, setIsFetchingGoogleDriveFiles] =
    useState(false);
  const [signedInUser, setSignedInUser] = useState();
  const [token, setToken] = useState("");
  const history = useHistory();
  // const handleChange = (file) => { };

  /**
   * Print files.
   */

  useEffect(() => {
    // Update the document title using the browser API
    setDisplaySuccess(false);
    setDisplayError(false);
    handleClientLoad();
    // checkFolderExist();
    // refreshUploadedFiles('root');
  }, []);

  const styleComp = {
    // background: "#f4f4f4a3",
    //   border: 1px solid #d8d7d7;

    borderRadius: "10px",
    borderColor: "#d8d7d7",
    borderStyle: "solid",
    borderWidth: "2px",
  };

  const styleLeft = {
    background: "#f4f4f4",
    paddingTop: "34px",
    paddingLeft: "0px",
    borderRadius: "10px",
    borderColor: "#bebdbd",
    borderStyle: "dashed",
    borderWidth: "2px",
  };

  const styleImg = {
    borderRadius: "3px",
    marginRight: "20px",
  };

  const styleBread = {
    paddingTop: "10px",
    paddingBottom: "10px",
    paddingLeft: "12px",
    background: "#e1e7e782",
  };

  const styleHead = {
    textTransform: "Uppercase",
  };

  const styleLogout = {
    marginLeft: "10px",
  };

  useEffect(()=>{
    console.log("Accesstoken set in useEffect"+ AccessToken);
    if(AccessToken && AccessToken.length > 0){
      checkFolderExist();
    }
  },[AccessToken]);

  const checkFolderExist=()=>{
        gapi.client.drive.files
            .list({
              pageSize: 1000,
              fields:
                "nextPageToken, files(id, name, mimeType, modifiedTime,thumbnailLink,size,parents,sharingUser)",
              // q: "trashed=false and parents = 'root' ",
              'q': "trashed=false and mimeType = 'application/vnd.google-apps.folder' and name = 'CollaboratAR'",
              parents : 'root'
            })
            .then(function (response) {
              // setIsFetchingGoogleDriveFiles(false);
              // setListChildDocumentsVisible(false);
              // setListDocumentsVisibility(true);
              // const res = JSON.parse(response.body);
              // setDocuments(res.files);
              const res = JSON.parse(response.body);
              if(res.files.length > 0){
                console.log('Folder exist');
                console.log(res.files);
                openData(res.files[0].id,res.files[0].mimeType,res.files[0].name)
              }else{
                createFolder('CollaboratAR',"");
                console.log('Folder not exist');
              }
              
            });
  };

  const listFiles = (searchTerm = null) => {
    setIsFetchingGoogleDriveFiles(true);

    //  console.log('ayyhay');

    return gapi.client.drive.about
      .get({
        fields: "*",
      })
      .then(
        function (response) {
          // Handle the results here (response.result has the parsed body).
          //  console.log("Response", response);
          //   userData(response);

          var bytes = response.result.storageQuota.usage;

          if (bytes < 1024) {
            var usedmb = bytes + " Bytes";

            var forcalusedmb = bytes;

            var utype = "byte";
          } else if (bytes < 1048576) {
            var usedmb = (bytes / 1024).toFixed(3) + " KB";

            var forcalusedmb = (bytes / 1024).toFixed(3);

            var utype = "kb";
          } else if (bytes < 1073741824) {
            var usedmb = (bytes / 1048576).toFixed(3) + " MB";

            var forcalusedmb = (bytes / 1048576).toFixed(3);

            var utype = "mb";
          } else {
            var usedmb = (bytes / 1073741824).toFixed(3);
            +" GB";

            var forcalusedmb = (bytes / 1073741824).toFixed(3);

            var utype = "gb";
          }

          setUsedQuota(usedmb);

          if (totallimit < 1024) var limit = totallimit + " Bytes";
          else if (totallimit < 1048576)
            var limit = (totallimit / 1024).toFixed(3);
          else if (totallimit < 1073741824)
            var limit = (totallimit / 1048576).toFixed(3);
          else var limit = (totallimit / 1073741824).toFixed(3);

          setTotalQuota(limit);

          var totallimit = response.result.storageQuota.limit;

          if (totallimit < 1024) {
            var limit = totallimit + " Bytes";

            var forcallimit = totallimit;
          } else if (totallimit < 1048576) {
            var limit = (totallimit / 1024).toFixed(3) + " KB";

            var forcallimit = (totallimit / 1024).toFixed(3);

            //var utype = 'kb';
          } else if (totallimit < 1073741824) {
            var limit = (totallimit / 1048576).toFixed(3) + " MB";

            var forcallimit = (totallimit / 1048576).toFixed(3);

            //  var utype = 'mb';
          } else {
            var limit = (totallimit / 1073741824).toFixed(3);
            +" GB";

            var forcallimit = (totallimit / 1073741824).toFixed(3);

            // var utype = 'gb';
          }

          setTotalQuota(limit);

          if (utype == "mb") {
            var forcal = forcalusedmb / 1024;
          } else {
            var forcal = forcalusedmb * 100;
          }

          var finalper = forcal / forcallimit;

          setUsedPer(Math.floor(finalper));

          var useddrive = response.result.storageQuota.usageInDrive;
          if (useddrive < 1024) var fordrive = useddrive + " Bytes";
          else if (fordrive < 1048576)
            var fordrive = (useddrive / 1024).toFixed(3);
          else if (fordrive < 1073741824)
            var fordrive = (useddrive / 1048576).toFixed(3);
          else var fordrive = (useddrive / 1073741824).toFixed(3);

          setUsedInDrive(fordrive);

          gapi.client.drive.files
            .list({
              pageSize: 1000,
              fields:
                "nextPageToken, files(id, name, mimeType, modifiedTime,thumbnailLink,size,parents,sharingUser)",
              q: "trashed=false and parents = 'root' ",
              //'q': "mimeType = 'application/vnd.google-apps.folder' or mimeType = 'application/octet-stream' and '" + 'root' + "' in parents",
              //    parents : 'root'
            })
            .then(function (response) {
              setIsFetchingGoogleDriveFiles(false);

              setListChildDocumentsVisible(false);
              setListDocumentsVisibility(true);
              const res = JSON.parse(response.body);

              setDocuments(res.files);
              // console.log(documents);
            });
        },
        function (err) {
          console.error("Execute error", err);
        }
      );

    //   const query = (id == "root") ? "trashed=false and sharedWithMe" : "trashed=false and '" + id + "' in parents";
  };

  /**
   *  Sign in the user upon button click.
   */
  const handleAuthClick = (event) => {
    gapi.auth2.getAuthInstance().signIn();
  };

  /**
   *  Called when the signed in status changes, to update the UI
   *  appropriately. After a sign-in, the API is called.
   */
  const updateSigninStatus = async (isSignedIn) => {
    if (isSignedIn) {
      // // Set the signed in user

      //console.log(gapi.auth2.getAuthInstance());
       console.log('Accesstoken setted'+gapi.auth2.getAuthInstance().currentUser.le.xc.access_token);
      setAccessToken(
        gapi.auth2.getAuthInstance().currentUser.le.xc.access_token
      );
      setGoogleAccessToken(gapi.auth2.getAuthInstance().currentUser.le.xc.access_token);
      console.log('Accesstoken setted'+gapi.auth2.getAuthInstance().currentUser.le.xc.access_token);
      console.log('setGoogleAccessToken setted'+ googleAccessToken);
      setSignedInUser(gapi.auth2.getAuthInstance().currentUser.le.wt);

      const checkData = {
        email: gapi.auth2.getAuthInstance().currentUser.le.wt.cu,
      };
      // console.log(checkData);

      const result = await axios
        .post("https://admin.collaboratar.com/public/api/login", checkData)
        .then((response) => {
          // console.warn(response);
          if (response.data.status === "success") {
            // console.log(response.data.data[0].token);

            setToken(response.data.data[0].token);
          } else {
            console.warn("error");
          }

          return response && response.data && response.data.status;
        })
        .catch((error) => {
          // this.setState({ errorMessage: error.message });
          console.error("There was an error!", error);
        });

      // setIsLoadingGoogleDriveApi(false);
      // list files if user is authenticated
      // listFiles();
      // if(AccessToken && AccessToken.length > 0){
      //   console.log("AccessToken" + AccessToken);
      //   checkFolderExist();
      // }else{
      //   console.log("AccessToken" + AccessToken);
      //    console.log("AccessToken Not Found");
      // }
    } else {
      // prompt user to sign in
      // alert('trying to sign in')
      console.log('trying to sign in')
      // handleAuthClick();
    }
  };

  /**
   *  Sign out the user upon button click.
   */
  const handleSignOutClick = (event) => {
    setListDocumentsVisibility(false);
    gapi.auth2.getAuthInstance().signOut();
    gapi.auth2.getAuthInstance().disconnect();
    setToken("");
    sessionStorage.clear();
    localStorage.clear();

    history.push("/logout");
  };

  const handleBackClick = (event) => {
    setListChildDocumentsVisible(false);
    setListDocumentsVisibility(true);
    setFolderId([]);
    setBreadcrumb([]);
    setBreadcrumbTwo([]);

    // history.push("/logout");

    // <Link to="/logout" className="dropdown-item">
    //     <i className="bx bx-power-off font-size-16 align-middle me-1 text-danger" />
    //     <span>{this.props.t("Logout")}</span>
    // </Link>
  };

  /**
   *  Initializes the API client library and sets up sign-in state
   *  listeners.
   */
  const initClient = () => {
    setIsLoadingGoogleDriveApi(true);
    gapi.client
      .init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES,
      })
      .then(
        function () {
          // Listen for sign-in state changes.
          gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

          // Handle the initial sign-in state.
          updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        },
        function (error) {}
      );
  };

  const createFolder = (value, folderid) => {
    setModal(false);
    console.log(folderid);

    if (folderid == "") {
      folderid = "root";
    }

    console.log(folderid);
    if(!AccessToken || AccessToken.length==0){
      console.log('Accesss tookkkenn nnot found initClient')
      // initClient();
      setAccessToken(
        gapi.auth2.getAuthInstance().currentUser.le.xc.access_token
      );
    }
    console.log(AccessToken);
    //const access_token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6ImFkbWluIiwiYWRtaW4iOnRydWUsImp0aSI6ImQ2MTEwYzAxLWMwYjUtNDUzNy1iNDZhLTI0NTk5Mjc2YjY1NiIsImlhdCI6MTU5MjU2MDk2MCwiZXhwIjoxNTkyNTY0NjE5fQ.QgFSQtFaK_Ktauadttq1Is7f9w0SUtKcL8xCmkAvGLw';

    const request = gapi.client.request({
      path: "/drive/v2/files/",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + AccessToken,
        Scope: SCOPESF,
      },
      body: {
        title: value,
        mimeType: "application/vnd.google-apps.folder",
        parents: [
          {
            kind: "drive#file",
            id: folderid,
          },
        ],
      },
    });

    //console.log(request);

    request.execute(function (resp) {
      setFolderId([]);
      console.log(resp);
      checkFolderExist();
      // handleClientLoad();
      // document.getElementById("info").innerHTML = "Created folder: " + resp.title;
    });
  };

  const refreshUploadedFiles=(id)=>{
    setFolderId(id);
    const query =
        id == "root"
          ? "trashed=false and sharedWithMe"
          : "trashed=false and '" + id + "' in parents";

      var request = gapi.client.drive.files.list({
        pageSize: 10,
        fields:
          "nextPageToken, files(id, name, mimeType, modifiedTime,thumbnailLink,size,parents,sharingUser)",
        q: query,
      });

      request.execute(function (child) {
        // console.log('tow');
        if (!child.error) {
          // console.log(child.files);
          //  console.log('three');
          setChildDocuments(child.files);
          setListChildDocumentsVisible(true);
          setListDocumentsVisibility(false);
        } else {
          console.error(child.error);
          console.log("four");
        }
      });
  }

  const openData = (id, type, name) => {
    if (type === "application/vnd.google-apps.folder") {
      setBreadcrumb(name);
      setFolderId(id);
      setBreadcrumbTwo(breadcrumb);


      // console.log('one');

      // 'q': "mimeType = 'application/vnd.google-apps.folder' or mimeType = 'application/octet-stream' and '" + 'root' + "' in parents",
      //       const query = (id == "root") ? "trashed=false and sharedWithMe" : "mimeType = 'application/vnd.google-apps.folder' or mimeType = 'application/octet-stream' and '" + id + "' in parents";

      const query =
        id == "root"
          ? "trashed=false and sharedWithMe"
          : "trashed=false and '" + id + "' in parents";

      var request = gapi.client.drive.files.list({
        pageSize: 10,
        fields:
          "nextPageToken, files(id, name, mimeType, modifiedTime,thumbnailLink,size,parents,sharingUser)",
        q: query,
      });

      request.execute(function (child) {
        // console.log('tow');
        if (!child.error) {
          // console.log(child.files);
          //  console.log('three');
          setChildDocuments(child.files);
          setListChildDocumentsVisible(true);
          setListDocumentsVisibility(false);
        } else {
          console.error(child.error);
          console.log("four");
        }
      });
    } else {
      // setPreview(name);
      // previewtoggle();
      // setFBXFile(name);
      // setFBXFile(URL.createObjectURL(name));
      console.log(id);
      fetchFbxRecord(id);
    }
  };

  const fetchFbxRecord = (id) => {
    const result = axios
      .get(
        "https://admin.collaboratar.com/public/api/get-fbx-by-drive-file-id",
        {
          params: {
            token: token,
            email: signedInUser?.cu,
            drive_file_id: id,
          },
        }
      )
      .then((response) => {
        console.warn(response.data.status);
        if (response.data.status === "success") {
          setDisplayError(false);
          setEditFile(true);
          setUpdateFileId(id);
          const res_data = response.data.data;
          setFBXName(res_data.fbx_name);
          setFBXId(res_data.fbx_id);
          setFBXItem(res_data.line_item);
          setFBXVersion(res_data.version);
          setFBXDescription(res_data.description);
          setFBXMaterial(res_data.material_used);
          setThumbnailFileData(res_data.thumbnail_image);
          imagetoggle();
        } else {
          setResponseData("Record not found.");
          setDisplayError(true);
        }
      })
      .catch((error) => {
        console.error("There was an error!", error);
      });
  };

  const clearFormFields = () => {
    setFBXName("");
    setFBXId("");
    setFBXItem("");
    setFBXVersion("");
    setFBXDescription("");
    setFBXMaterial("");
    setEditFile(false);
  };

  const Scene = () => {
    // const fbx = useFBX(`${FBXFile}`);
    // return <primitive object={fbx} scale={0.55} dispose={null} />;

    const fileFormtChk=FBXFileData.name.split(".").pop().toLowerCase();
    if (fileFormtChk == "fbx"){
      const fbx = useFBX(`${FBXFile}`);
      console.log('fbx', fbx);
      return <primitive object={fbx} scale={0.55} dispose={null} />;
    }else if(fileFormtChk =='glb' || fileFormtChk =='gltf'){
      const fbx = useLoader(GLTFLoader, `${FBXFile}`)
      console.log('glb', fbx);
      return <primitive object={fbx.scene} />;
    }
    console.log(fileFormtChk);
    console.log(FBXFile);
  };

  const updateUploadedFile = (
    FBXName,
    FBXId,
    FBXItem,
    FBXVersion,
    // FBXFileData,
    FBXDescription,
    FBXMaterial,
    ThumbnailFileData
    // folderid
  ) => {
    if (
      FBXName == "" ||
      FBXId == "" ||
      FBXItem == "" ||
      FBXVersion == "" ||
      // FBXFileData == "" ||
      FBXDescription == "" ||
      FBXMaterial == "" ||
      updateFileId == ""
    ) {
      setResponseData("Please Fill all fields");
      setDisplayError(true);
    } else {
      setDisplayError(false);
      setloader(true);
      // const postData = {
      //   fbx_name: FBXName,
      //   email: signedInUser?.cu,
      //   token: token,
      //   id: FBXId,
      //   line_item: FBXItem,
      //   version: FBXVersion,
      //   description: FBXDescription,
      //   material_used: FBXMaterial,
      //   drive_id: updateFileId,
      // };

      let formdata = new FormData();
      formdata.append('fbx_name', FBXName);
      formdata.append('email', signedInUser?.cu);
      formdata.append('token', token);
      formdata.append('id', FBXId);
      formdata.append('line_item', FBXVersion);
      formdata.append('version', FBXVersion);
      formdata.append('description', FBXDescription);
       formdata.append('material_used', FBXMaterial);
      formdata.append('drive_id', updateFileId);
      formdata.append('thumbnail_file', ThumbnailFileData);

      // console.error(postData);
      const result = axios
        .post("https://admin.collaboratar.com/public/api/update-fbx", formdata,
                      { 
                        headers: {
                          "Content-Type": "multipart/form-data"
                        }
                      })
        .then((response) => {
          console.warn(response.data.status);
          if (response.data.status === "success") {
            setResponseData("Record Updated Successfully");
            setDisplaySuccess(true);
            clearFormFields();
          } else {
            setResponseData("Record Not Updated Successfully");
            setDisplayError(true);
          }
        })
        .catch((error) => {
          console.error("There was an error!", error);
        });
      setloader(false);
      setDisplaySuccess(false);
      setDisplayError(false);
      imagetoggle();
    }
  };

  const uploadFile = (
    FBXName,
    FBXId,
    FBXItem,
    FBXVersion,
    FBXFileData,
    FBXDescription,
    FBXMaterial,
    folderid,
    ThumbnailFileData
  ) => {
    if (
      FBXName == "" ||
      FBXId == "" ||
      FBXItem == "" ||
      FBXVersion == "" ||
      FBXFileData == "" ||
      ThumbnailFileData == "" ||
      FBXDescription == "" ||
      FBXMaterial == ""
    ) {
      setResponseData("Please Fill all fields");
      setDisplayError(true);
    } else {
      setDisplayError(false);
      if (folderid == "") {
        folderid = "root";
      }

      setImageModal(false);
      setloader(true);

      // console.log(FBXFileData);
      const fileFormt=FBXFileData.name.split(".").pop().toLowerCase();
      if (fileFormt !== "fbx" && fileFormt !=='glb' && fileFormt !=='gltf') {
        setAlert(true);
        setFolderId([]);
        handleClientLoad();
      } else {
        setAlert(false);

        // const file = new File([FBXFileData], FBXName + ".fbx", {
        const file = new File([FBXFileData], FBXName + "."+fileFormt, {
          type: "application/octet-stream;charset=utf-8",
        });
          console.log(file);

        const contentType = file.type || "application/octet-stream";
        const user = gapi.auth2.getAuthInstance().currentUser.get();
        const oauthToken = user.getAuthResponse().access_token;
        const initResumable = new XMLHttpRequest();
        initResumable.open(
          "POST",
          "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable",
          true
        );
        initResumable.setRequestHeader("Authorization", "Bearer " + oauthToken);
        initResumable.setRequestHeader("Content-Type", "application/json");
        initResumable.setRequestHeader("X-Upload-Content-Length", file.size);
        initResumable.setRequestHeader("X-Upload-Content-Type", contentType);
        initResumable.onreadystatechange = function () {
          if (
            initResumable.readyState === XMLHttpRequest.DONE &&
            initResumable.status === 200
          ) {
            // console.log("Here console response");
            // console.log(initResumable);
            // console.log(JSON.stringify(initResumable));
            // console.log(JSON.stringify(initResumable.response));
            // console.log("Here console response end");
            const locationUrl = initResumable.getResponseHeader("Location");
            const reader = new FileReader();
            reader.onload = (e) => {
              const uploadResumable = new XMLHttpRequest();
              uploadResumable.open("PUT", locationUrl, true);
              uploadResumable.setRequestHeader("Content-Type", contentType);
              uploadResumable.setRequestHeader(
                "X-Upload-Content-Type",
                contentType
              );
              uploadResumable.onreadystatechange = function () {
                if (
                  uploadResumable.readyState === XMLHttpRequest.DONE &&
                  uploadResumable.status === 200
                ) {
                  // setPercentage(100);
                  /// console.log('ta');
                  // console.log(uploadResumable);
                  // console.log(uploadResumable.response);
                  let resp = JSON.parse(uploadResumable.response);
                  // const postData = {
                  //   fbx_name: FBXName,
                  //   email: signedInUser?.cu,
                  //   token: token,
                  //   id: FBXId,
                  //   line_item: FBXItem,
                  //   version: FBXVersion,
                  //   description: FBXDescription,
                  //   material_used: FBXMaterial,
                  //   drive_id: resp.id,
                  //   thumbnail_file :ThumbnailFileData 
                  // };
                  // console.error(postData);
                  let formdata = new FormData();
                  formdata.append('fbx_name', FBXName);
                  formdata.append('email', signedInUser?.cu);
                  formdata.append('token', token);
                  formdata.append('id', FBXId);
                  formdata.append('line_item', FBXVersion);
                  formdata.append('version', FBXVersion);
                  formdata.append('description', FBXDescription);
                  formdata.append('material_used', FBXMaterial);
                  formdata.append('drive_id', resp.id);
                  formdata.append('thumbnail_file', ThumbnailFileData);
                  const result = axios
                    .post(
                      "https://admin.collaboratar.com/public/api/store-fbx",
                      formdata,
                      { 
                        headers: {
                          "Content-Type": "multipart/form-data"
                        }
                      }
                    )
                    .then((response) => {
                      console.warn(response.data.status);
                      if (response.data.status === "success") {
                        setResponseData("File Uploaded Successfully");
                        setDisplaySuccess(true);
                      } else {
                        setResponseData("File Not Uploaded Successfully");
                        setDisplayError(true);
                      }

                      return response && response.data && response.data.status;
                    })
                    .catch((error) => {
                      // this.setState({ errorMessage: error.message });
                      console.error("There was an error!", error);
                    });

                  setloader(false);
                  // setFolderId([]);
                  setFBXFile("");
                  setDisplaySuccess(false);
                  setDisplayError(false);
                  // listFiles();
                  refreshUploadedFiles(folderid);
                  // handleClientLoad();
                } else {
                  // console.log('ad');
                  setPercentage(50);
                }
              };
              uploadResumable.send(reader.result);
            };
            reader.readAsArrayBuffer(file);
          } else {
            //console.warn('as2');

            setPercentage(50);
          }
        };

        // You need to stringify the request body containing any file metadata
        //             console.log(folderid);

        initResumable.send(
          JSON.stringify({
            name: file.name,
            mimeType: contentType,
            "Content-Type": contentType,
            "Content-Length": file.size,
            description: FBXDescription,
            parents: [folderid],
          })
        );
      }
    }
  };

  const handleClientLoad = () => {
    gapi.load("client:auth2", initClient);
  };

  const showDocuments = () => {
    setListDocumentsVisibility(true);
  };

  const onClose = () => {
    setListDocumentsVisibility(false);
  };

  const setupModel = (data) => {
    const model = data.scene.children[0];
    return model;
  }

  const createLights = () => {
    const ambientLight = new HemisphereLight(
      'white',
      'darkslategrey',
      5,
    );
  
    const mainLight = new DirectionalLight('white', 4);
    mainLight.position.set(10, 10, 10);
  
    return { ambientLight, mainLight };
  }

  const handleGLTFFile = async () => {
    setFBXFile(URL.createObjectURL(event.target.files[0]));
    setFBXFileData(event.target.files[0]);
    
    var oldcanv = document.getElementById('canvas1');
    console.log('oldcanv', oldcanv);
    if (oldcanv) {
      oldcanv.remove()
    }

    const loader = new GLTFLoader();

    const parrotData = await Promise.all([
      loader.loadAsync(URL.createObjectURL(event.target.files[0]))
    ]);

    const parrot = setupModel(parrotData[0]);


    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    console.log('camera', camera);
    var renderer = new THREE.WebGLRenderer({ alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(500, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('id', 'canvas1');
    camera.position.z = 2;
    const { ambientLight, mainLight } = createLights();
    scene.add(ambientLight, mainLight);
    scene.add(parrot);
    // var animate = function () {
    //   requestAnimationFrame(animate);
      renderer.render(scene, camera);
    // };
    // animate();

  }

  const isCanvasBlank = (canvas) => {
    const context = canvas.getContext('webgl');
    console.log('context', canvas);
  
    // const pixelBuffer = new Uint32Array(
    //   context.getImageData(0, 0, canvas.width, canvas.height).data.buffer
    // );
  
    // return !pixelBuffer.some(color => color !== 0);
  }

  const saveImage = () => {
    const canvas = document.getElementById("canvas1");
    const canvas1 = document.getElementsByTagName("canvas")[0];
    var context = canvas1.getContext("experimental-webgl", {preserveDrawingBuffer: true});
    console.log('context', context);
    const image = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = image.replace(/^data:image\/[^;]/, 'data:application/octet-stream');
    a.download = "image.png";
    a.click();
  }

  return (
    <React.Fragment>
      <div>
        {/* <div
          style={{
            display: "block",
            maxWidth: "1700px",
            width: "100% !important",
          }}
        >
          <Modal
            isOpen={previewmodal}
            toggle={previewtoggle}
            size="xl"
            style={{ maxWidth: "1700px !important", width: "100%" }}
          >
            <ModalHeader toggle={previewtoggle}>Preview File</ModalHeader>
            <ModalBody>
              {FBXFile}

              {FBXFile !== "" ? (
                <Canvas style={{ height: 600 }}>
                  <Suspense fallback={null}>
                    <Scene />
                    <OrbitControls />
                    <Environment preset="sunset" background />
                  </Suspense>
                </Canvas>
              ) : (
                "ahh"
              )}

              
            </ModalBody>
           
          </Modal>
        </div> */}

        <Row className="mb-3 mt-2">
          <Col xl={3} sm={6} style={styleLeft}>
            <Card style={styleComp} className="ms-lg-2">
              <div className="mt-1">
                <h5 className="font-size-16 " style={styleHead}></h5>
              </div>

              <div className="mt-auto">
                <div className="px-3 mb-0">
                  <div className="mb-3">
                    <img
                      style={styleImg}
                      alt=""
                      src={`${signedInUser?.hK}`}
                      height="50px"
                      width="50px"
                    />

                    <button
                      style={styleLogout}
                      type="button"
                      onClick={handleSignOutClick}
                      className=" btn btn-link font-size-14 text-decoration-none text-secondary border "
                    >
                      Sign Out <i className="mdi mdi-logout-variant"></i>
                    </button>
                  </div>

                  <div>
                    <h5 className="text-success"> {`${signedInUser?.Ad}  `}</h5>
                    <p> {`${signedInUser?.cu}  `}</p>
                    <div className="text-center"></div>
                  </div>
                </div>
              </div>

              <CardBody>
                <h6>Storage ({usedper}% full)</h6>
                <hr />

                <div className="text-center">
                  <div className="apex-charts">
                    <Progress animated color="warning" value={usedper} />
                  </div>

                  <p className="text-muted mt-4">
                    {" "}
                    {usedquota} GB of {totalquota} GB used
                  </p>
                </div>

                <div className="mt-1">
                  <center>
                    <a
                      style={styleLogout}
                      target="_blank"
                      href="https://one.google.com/storage?i=m&utm_source=drive&utm_medium=web&utm_campaign=g1_widget_eighty#upgrade"
                      className=" btn btn-link font-size-14  text-decoration-none text-primary border "
                    >
                      Buy Storage{" "}
                      <i className="font-size-14  mdi mdi-cloud-outline"></i>
                    </a>
                  </center>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col xl={9} sm={6}>
            {alert === true ? (
              <Alert color="danger">
                This File Format is not Supported pls use .fbx file
              </Alert>
            ) : (
              <i className="bx font-size-24 text-warning"></i>
            )}

            {displaySuccess === true ? (
              <Alert color="success">{responseData}</Alert>
            ) : (
              <i className="bx font-size-24 text-warning"></i>
            )}

            {displayError === true ? (
              <Alert color="danger">{responseData}</Alert>
            ) : (
              <i className="bx font-size-24 text-warning"></i>
            )}

            {loader === true ? (
              <Progress animated color="info" value={percentage} />
            ) : (
              <i className="bx font-size-24 text-warning"></i>
            )}

            <Row className="mb-3 mt-2">
              <Col xl={9} sm={6}>
                <div className="mt-1">
                  <h5 className="font-size-17 mb-1">
                    Collaborat AR File Manager
                  </h5>
                </div>
              </Col>
              <Col xl={3} sm={6}>
                <UncontrolledDropdown>
                  <DropdownToggle
                    className="btn btn-light dropdown-toggle w-100"
                    color="#eff2f7"
                    type="button"
                  >
                    <i className="mdi mdi-plus me-1"></i> Create New
                  </DropdownToggle>
                  <DropdownMenu>
                    <Link className="dropdown-item" to="#" onClick={toggle}>
                      <i className="bx bx-folder me-1"></i> Folder
                    </Link>
                    <Link
                      className="dropdown-item"
                      to="#"
                      // onClick={imagetoggle}
                      onClick={() => {
                        imagetoggle();
                        setEditFile(false);
                        clearFormFields();
                      }}
                    >
                      <i className="bx bx-file me-1"></i> File
                    </Link>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </Col>

              <div style={{ display: "block", width: 700 }}>
                <Modal isOpen={modal} toggle={toggle}>
                  <ModalHeader toggle={toggle}>Create Folder</ModalHeader>
                  <ModalBody>
                    <Row>
                      <Col xl={1} sm={6}></Col>
                      <Col xl={8} sm={6}>
                        <div className="mb-3">
                          <Label htmlFor="formrow-firstname-Input">
                            Folder Name
                          </Label>
                          <Input
                            type="text"
                            name="name"
                            onChange={(e) => {
                              setFolderName(e.target.value);
                            }}
                            className="form-control"
                            id="formrow-firstname-Input"
                            placeholder="Enter Folder Name"
                          />
                          <br></br>
                          <div>
                            <button
                              onClick={() => {
                                createFolder(FolderName, folderid);
                              }}
                              style={{ backgroundColor: "#151821" }}
                              className="btn btn-primary w-md"
                            >
                              <i className="bx bx-folder me-1"></i> Create
                            </button>
                          </div>
                        </div>
                      </Col>
                      <Col xl={2} sm={6}></Col>
                    </Row>
                  </ModalBody>
                  {/*<ModalFooter>*/}
                  {/*    <Button color="primary" onClick={toggle}>Okay</Button>*/}
                  {/*</ModalFooter>*/}
                </Modal>
              </div>

              <div
                style={{
                  display: "block",
                  width: "100% !important",
                  maxWidth: "100% !important",
                }}
              >
                <Modal isOpen={imagemodal} toggle={imagetoggle}>
                  <ModalHeader toggle={imagetoggle}>Upload File</ModalHeader>
                  <ModalBody>
                    <Row>
                      <Col xl={6} sm={6}>
                        {displayError === true ? (
                          <Alert color="danger">{responseData}</Alert>
                        ) : (
                          <i className="bx font-size-24 text-warning"></i>
                        )}
                        <Row>
                          <Col xl={6} sm={6}>
                            <div className="mb-3">
                              <Label htmlFor="formrow-firstname-Input">
                                Style No
                              </Label>
                              <Input
                                type="text"
                                name="name"
                                value={FBXName}
                                onChange={(e) => {
                                  setFBXName(e.target.value);
                                }}
                                className="form-control"
                                id="formrow-firstname-Input"
                                placeholder="Enter Style No"
                              />
                            </div>
                          </Col>
                          <Col xl={6} sm={6}>
                            <div className="mb-3">
                              <Label htmlFor="formrow-firstname-Input">
                                Fabric
                              </Label>
                              <Input
                                type="text"
                                name="id"
                                value={FBXId}
                                onChange={(e) => {
                                  setFBXId(e.target.value);
                                }}
                                className="form-control"
                                id="formrow-firstname-Input"
                                placeholder="Enter Fabric"
                              />
                            </div>
                          </Col>
                        </Row>

                        <div className="mb-3">
                          <Label htmlFor="formrow-firstname-Input">
                            Content
                          </Label>
                          <Input
                            type="text"
                            name="item"
                            value={FBXItem}
                            onChange={(e) => {
                              setFBXItem(e.target.value);
                            }}
                            className="form-control"
                            id="formrow-firstname-Input"
                            placeholder="Enter Content"
                          />
                        </div>

                        <div className="mb-3">
                          <Label htmlFor="formrow-firstname-Input">
                            Count
                          </Label>
                          <Input
                            type="text"
                            name="version"
                            value={FBXVersion}
                            onChange={(e) => {
                              setFBXVersion(e.target.value);
                            }}
                            className="form-control"
                            id="formrow-firstname-Input"
                            placeholder="Enter Count"
                          />
                        </div>

                        <button
                              onClick={saveImage}>Save</button>

                        {!editFile ? (
                          <div className="mb-3">
                            <Label htmlFor="formrow-firstname-Input">
                              GLTF File{" "}
                            </Label>
                            <Input
                              type="file"
                              name="file"
                              onChange={(e) => {
                                handleGLTFFile()
                              }}
                              // onChange={(event)=>changeHandler(event, "SJ")}

                              className="form-control"
                              id="formrow-firstname-Input"
                            />
                          </div>
                        ) : (
                          ""
                        )}

                        {!editFile ? (
                        <div className="mb-3">
                          <Label htmlFor="formrow-firstname-Input">
                            Thumbnail
                          </Label>
                          <Input
                            type="file"
                            name="thumbnail_file"
                            onChange={(e) => {
                              setThumbnailFile(
                                URL.createObjectURL(event.target.files[0])
                              ),
                                setThumbnailFileData(event.target.files[0]);
                            }}
                            // onChange={(event)=>changeHandler(event, "SJ")}

                            className="form-control"
                            id="formrow-firstname-Input"
                          />
                        </div> ) : (
                          <Row>
                            <Col xl={8} sm={8}>
                              <div className="mb-3">
                                <Label htmlFor="formrow-firstname-Input">
                                  Thumbnail
                                </Label>
                                <Input
                                  type="file"
                                  name="thumbnail_file"
                                  onChange={(e) => {
                                    setThumbnailFile(
                                      URL.createObjectURL(event.target.files[0])
                                    ),
                                      setThumbnailFileData(event.target.files[0]);
                                  }}
                                  // onChange={(event)=>changeHandler(event, "SJ")}

                                  className="form-control"
                                  id="formrow-firstname-Input"
                                />
                              </div>
                            </Col>
                            <Col xl={4} sm={4}>
                                <img src={ThumbnailFileData}  className="mt-3" width="100" height="50" />
                            </Col>
                          </Row>
                        )}

                        <div className="mb-3">
                          <Label htmlFor="formrow-firstname-Input">
                            Colour
                          </Label>
                          <Input
                            type="text"
                            name="desc"
                            value={FBXDescription}
                            onChange={(e) => {
                              setFBXDescription(e.target.value);
                            }}
                            className="form-control"
                            id="formrow-firstname-Input"
                            placeholder="Enter Colour"
                          />
                        </div>

                        <div className="mb-3">
                          <Label htmlFor="formrow-firstname-Input">
                            GSM
                          </Label>
                          <Input
                            type="text"
                            name="material"
                            value={FBXMaterial}
                            onChange={(e) => {
                              setFBXMaterial(e.target.value);
                            }}
                            className="form-control"
                            id="formrow-firstname-Input"
                            placeholder="Enter GSM"
                          />
                        </div>

                        <div>
                          {editFile ? (
                            <button
                              onClick={() => {
                                updateUploadedFile(
                                  FBXName,
                                  FBXId,
                                  FBXItem,
                                  FBXVersion,
                                  // FBXFileData,
                                  FBXDescription,
                                  FBXMaterial,
                                  ThumbnailFileData
                                  // folderid
                                );
                              }}
                              style={{ backgroundColor: "#151821" }}
                              className="btn btn-primary w-md"
                            >
                              <i className="bx bx-folder me-1"></i> Update
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                uploadFile(
                                  FBXName,
                                  FBXId,
                                  FBXItem,
                                  FBXVersion,
                                  FBXFileData,
                                  FBXDescription,
                                  FBXMaterial,
                                  folderid,
                                  ThumbnailFileData
                                );
                              }}
                              style={{ backgroundColor: "#151821" }}
                              className="btn btn-primary w-md"
                            >
                              <i className="bx bx-folder me-1"></i> Create
                            </button>
                          )}
                        </div>
                      </Col>

                      <Col xl={6} sm={6}>
                        {/*{FBXFile}*/}

                        

                        {FBXFile ? (
                          <div>
                            <Canvas style={{ height: 600 }}>
                              <Suspense fallback={<Html>Loading...</Html>}>
                                <Center>
                                  <Scene />
                                </Center>
                              </Suspense>
                              <OrbitControls />
                              <ambientLight intensity={2.2} />
                              <ambientLightProbe intensity={0.2} />
                              <pointLight intensity={0.2} color={10} />
                            </Canvas>

                             {/* <Canvas pixelRatio={[1, 2]} camera={{ position: [-10, 15, 15], fov: 50 }}>
                              <ambientLight intensity={1} />
                              <Suspense fallback={null}>
                                <Scene />
                              </Suspense>
                              <OrbitControls />
                            </Canvas> */}

                          </div>
                        ) : (
                          <div>
                            <img
                              alt=""
                              src="https://endlessicons.com/wp-content/uploads/2012/11/image-holder-icon-614x460.png"
                            />
                          </div>
                        )}
                      </Col>
                    </Row>
                  </ModalBody>

                  {/*<ModalFooter>*/}
                  {/*    <Button color="primary" onClick={toggle}>Okay</Button>*/}
                  {/*</ModalFooter>*/}
                </Modal>
              </div>
            </Row>

            {listDocumentsVisible === true ? (
              <>
                <div>
                  <Row>
                    {documents.map((files, key) => {
                      if (
                        files.mimeType ===
                          "application/vnd.google-apps.folder" ||
                        files.mimeType === "application/octet-stream"
                      ) {
                        return (
                          <>
                            <Col xl={4} sm={6} key={key}>
                              <Card
                                className="shadow-none border"
                                onClick={() => {
                                  openData(
                                    files.id,
                                    files.mimeType,
                                    files.name
                                  );
                                }}
                              >
                                <CardBody className="p-3">
                                  <div className="">
                                    <div className="avatar-md mb-3">
                                      <div className="avatar-title bg-transparent rounded" style={{cursor:"pointer"}}>
                                        {files.mimeType !==
                                        "application/vnd.google-apps.folder" ? (
                                          <i
                                            style={{ fontSize: "55px" }}
                                            className="bx bxs-file  text-primary"
                                          ></i>
                                        ) : (
                                          <i
                                            style={{ fontSize: "55px" }}
                                            className="bx bxs-folder text-warning"
                                          ></i>
                                        )}
                                      </div>
                                    </div>
                                    <div className="d-flex">
                                      <div className="overflow-hidden me-auto">
                                        <h5 className="font-size-14    text-truncate mb-1">
                                          <Link to="#" className="text-body">
                                            {files.name}
                                          </Link>
                                        </h5>

                                        <p className="text-muted text-truncate mb-0">
                                          {moment(files.modifiedTime).format(
                                            "Do MMMM YYYY"
                                          )}{" "}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </CardBody>
                              </Card>
                            </Col>
                          </>
                        );
                      }
                    })}
                  </Row>
                </div>
              </>
            ) : (
              <>
                <div>
                  {breadcrumb != "" ? (
                    <h6 className="mb-3 " style={styleBread}>
                      {" "}
                      {/* <button
                        type="button"
                        onClick={handleBackClick}
                        className=" btn btn-link font-size-14 text-decoration-none text-secondary border "
                      >
                        <i className="mdi mdi-keyboard-backspace"></i> Back
                      </button> */}
                      {/* Home / {breadcrumb} / {breadcrumbtwo}{" "} */}
                      Home / {breadcrumb} 
                    </h6>
                  ) : (
                    <i className="bx font-size-24 text-warning"></i>
                  )}

                  <Row>
                    {childdocuments.map((childfiles, index) => {
                      if (
                        childfiles.mimeType ===
                          "application/vnd.google-apps.folder" ||
                        childfiles.mimeType === "application/octet-stream"
                      ) {
                        return (
                          <>
                            <Col xl={4} sm={6} key={index}>
                              <Card
                                className="shadow-none border"
                                onClick={() => {
                                  openData(
                                    childfiles.id,
                                    childfiles.mimeType,
                                    childfiles.name
                                  );
                                }}
                              >
                                <CardBody className="p-3">
                                  <div className="">
                                    <div className="avatar-md mb-3">
                                      <div className="avatar-title bg-transparent rounded" style={{cursor:"pointer"}}>
                                        {childfiles.mimeType !==
                                        "application/vnd.google-apps.folder" ? (
                                          <i
                                            style={{ fontSize: "55px" }}
                                            className="bx bxs-file  text-primary"
                                          ></i>
                                        ) : (
                                          <i
                                            style={{ fontSize: "55px" }}
                                            className="bx bxs-folder text-warning"
                                          ></i>
                                        )}
                                      </div>
                                    </div>
                                    <div className="d-flex">
                                      <div className="overflow-hidden me-auto">
                                        <h5 className="font-size-14    text-truncate mb-1">
                                          <Link to="#" className="text-body">
                                            {childfiles.name}
                                          </Link>
                                        </h5>

                                        <p className="text-muted text-truncate mb-0">
                                          {moment(
                                            childfiles.modifiedTime
                                          ).format("Do MMMM YYYY")}{" "}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </CardBody>
                              </Card>
                            </Col>
                          </>
                        );
                      }
                    })}
                  </Row>
                </div>
              </>
            )}
          </Col>
        </Row>
      </div>
    </React.Fragment>
  );
};

export default FileList;
